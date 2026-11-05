/**
 * VisitZwolle — de stadsagenda van Zwolle (visitzwolle.com/agenda), alle soorten activiteiten.
 *
 * Werkwijze (vastgesteld 5-11-2026 met de workflow Bronnen diagnose):
 *  - De agendapagina laadt haar lijst per dag als HTML-stukje: /agenda/DD-MM-JJJJ/?ajx=1 (zo laadt de
 *    site zelf "meer"). Per kaart: link (/agenda-item/<id>/<slug>/), titel, begintijd (time datetime),
 *    tijden ("08:00 - 20:00") en plek ("Plek, Plaats"). Eén verzoek per dag.
 *  - Kinderactiviteiten: dezelfde lijst onder /agenda/kinderen/DD-MM-JJJJ/?ajx=1; die krijgen de hint "Kinderen".
 *  - Soort: de kaarten noemen geen categorie, maar de site heeft per categorie dezelfde lijst
 *    (/agenda/muziek/DD-MM-JJJJ/?ajx=1 enz.). Die halen we voor de eerste dagen (catDays) op; het label
 *    geldt voor het hele agenda-item (ook op latere dagen), want elk item heeft één vast nummer.
 *  - robots.txt staat /agenda/ en dagpagina's vanaf 2026 toe.
 *  - Omschrijvingen staan alleen op de detailpagina en worden niet overgenomen.
 *  - Dezelfde activiteit staat elke dag opnieuw in de lijst; de app voegt vaste reeksen samen.
 */
import * as cheerio from 'cheerio';
import { fetchText } from '../../collector/lib/http.ts';
import { cleanText, isoToLocal, parseTimes } from '../../collector/lib/parse.ts';
import { addDays } from '../../src/domain/dates.ts';
import type { RawEvent } from '../../collector/normalize.ts';
import type { AdapterContext, AdapterResult, SourceAdapter } from '../../collector/adapters/types.ts';

const BASE = 'https://www.visitzwolle.com';
const ID = 'visitzwolle';
const NAME = 'VisitZwolle';

export interface VzCard {
  id: string;
  path: string;
  title: string;
  datetime?: string;
  times?: string;
  location?: string;
}

/** Categorielijsten van VisitZwolle (pad → label), in volgorde van voorkeur voor het soortlabel. */
export const VZ_CATEGORIES: [string, string][] = [
  ['theater', 'Theater'],
  ['muziek', 'Muziek'],
  ['film', 'Film'],
  ['festival', 'Festival'],
  ['expositie', 'Expositie'],
  ['markt', 'Markt'],
  ['workshop', 'Workshop'],
  ['rondleiding', 'Rondleiding'],
  ['educatie', 'Educatie'],
  ['actief', 'Actief'],
  ['eten-drinken', 'Eten & drinken'],
  ['winkelen', 'Winkelen'],
  ['kunst-cultuur', 'Kunst & cultuur'],
];

/** Labels van een item: de eerste wordt het soortlabel, alle labels gaan als hint mee. */
export function withCategories(raw: RawEvent, labels: string[] | undefined): RawEvent {
  if (!labels?.length) return raw;
  const order = VZ_CATEGORIES.map(([, l]) => l);
  const sorted = [...new Set(labels)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return { ...raw, kind: sorted[0], hints: [...(raw.hints ?? []), ...sorted] };
}

export function dayPath(day: string): string {
  const [y, m, d] = day.split('-');
  return `${d}-${m}-${y}`;
}

export function parseVzList(html: string): VzCard[] {
  const $ = cheerio.load(html);
  const out: VzCard[] = [];
  $('article.agendabox').each((_, el) => {
    const a = $(el).find('a.box').first();
    const href = a.attr('href') ?? '';
    const m = href.match(/\/agenda-item\/(\d+)\/[^/]*\/?/);
    if (!m) return;
    const dds = a.find('dl.proplist dd');
    out.push({
      id: m[1],
      path: m[0].endsWith('/') ? m[0] : `${m[0]}/`,
      title: cleanText(a.find('h3.title').text()),
      datetime: a.find('time[datetime]').attr('datetime'),
      location: cleanText(a.find('dd.location').text()) || undefined,
      times: cleanText(dds.not('.location').first().text()) || undefined,
    });
  });
  return out;
}

/** "Het Engelse Werk, Zwolle" → plek en plaats. */
export function splitLocation(loc: string | undefined): { venueName?: string; locality?: string } {
  if (!loc) return {};
  const i = loc.lastIndexOf(',');
  if (i < 0) return { venueName: loc };
  return { venueName: cleanText(loc.slice(0, i)), locality: cleanText(loc.slice(i + 1)) };
}

/** Een kaart van de dagpagina; undefined als de kaart een andere dag noemt (dan hoort hij niet bij deze dag). */
export function vzToRaw(c: VzCard, day: string, kids: boolean, nowIso: string): RawEvent | undefined {
  const local = c.datetime ? isoToLocal(c.datetime) : day;
  if (local.slice(0, 10) !== day) return undefined;
  const date = day;
  const t = parseTimes(c.times ?? '');
  const start = t.start ? `${date}T${t.start}` : local.length > 10 ? `${date}T${local.slice(11, 16)}` : date;
  const end = t.end && t.start && t.end > t.start ? `${date}T${t.end}` : undefined;
  return {
    sourceId: ID,
    sourceName: NAME,
    sourceEventId: `vz-${c.id}-${date}`,
    seriesKey: `vz-${c.id}`,
    url: `${BASE}${c.path}`,
    title: c.title,
    start,
    end,
    allDay: !t.start && local.length <= 10,
    ...splitLocation(c.location),
    hints: kids ? ['Kinderen'] : [],
    checkedAt: nowIso,
  };
}

export const visitZwolle: SourceAdapter = {
  id: ID,
  name: NAME,
  homepage: `${BASE}/agenda/`,
  method: 'html',
  description: 'De stadsagenda van VisitZwolle: alle activiteiten per dag, kinderactiviteiten gemarkeerd.',
  async run(ctx: AdapterContext): Promise<AdapterResult> {
    const maxDays = (ctx.options.maxDays as number | undefined) ?? 120;
    const kidsPath = (ctx.options.kidsPath as string | undefined) ?? 'kinderen';
    const catDays = (ctx.options.catDays as number | undefined) ?? 14;
    const events: RawEvent[] = [];
    const cats = new Map<string, string[]>();
    let catFailed = 0;
    for (let day = ctx.today, i = 0; i < catDays && day <= ctx.until; day = addDays(day, 1), i++) {
      for (const [path, label] of VZ_CATEGORIES) {
        try {
          for (const c of parseVzList(await fetchText(`${BASE}/agenda/${path}/${dayPath(day)}/?ajx=1`))) {
            const l = cats.get(c.id) ?? [];
            if (!l.includes(label)) l.push(label);
            cats.set(c.id, l);
          }
        } catch {
          catFailed++;
        }
      }
    }
    const seen = new Set<string>();
    let days = 0;
    let kidsFailed = 0;
    for (let day = ctx.today; day <= ctx.until && days < maxDays; day = addDays(day, 1), days++) {
      const cards = parseVzList(await fetchText(`${BASE}/agenda/${dayPath(day)}/?ajx=1`));
      let kidIds = new Set<string>();
      try {
        kidIds = new Set(parseVzList(await fetchText(`${BASE}/agenda/${kidsPath}/${dayPath(day)}/?ajx=1`)).map((c) => c.id));
      } catch {
        kidsFailed++;
      }
      for (const c of cards) {
        const raw = c.title ? vzToRaw(c, day, kidIds.has(c.id), ctx.nowIso) : undefined;
        if (!raw || seen.has(raw.sourceEventId!)) continue;
        seen.add(raw.sourceEventId!);
        events.push(withCategories(raw, cats.get(c.id)));
      }
    }
    return {
      events,
      coverage: { from: ctx.today, to: addDays(ctx.today, days - 1) },
      notes: `${events.length} activiteit-dagen over ${days} dagen; ${events.filter((e) => e.kind).length} met soort${kidsFailed ? `; kinderlijst ${kidsFailed}× niet gelukt` : ''}${catFailed ? `; categorielijst ${catFailed}× niet gelukt` : ''}`,
    };
  },
};
