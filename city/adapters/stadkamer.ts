/**
 * Stadkamer — bibliotheek en cultuurhuis van Zwolle (Centrum, Zwolle-Zuid, Aa-landen, Stadshagen).
 *
 * Werkwijze (vastgesteld 5-11-2026 met de workflow Bronnen diagnose):
 *  - De agenda op stadkamer.nl laadt uit de eigen JSON-API van de site: /api/v1/events?siteId=1&page=N,
 *    met filters departments (vestigingen; 90 = Zwolle), categories (doelgroep/leeftijd) en tags.
 *    robots.txt staat /api/ toe.
 *  - Per activiteit: titel, URL, datumtekst ("5 nov 2026 - 19.00 tot 21.00 uur", "20 okt t/m 9 nov 2026",
 *    "Meerdere data"), nextDate (eerstvolgende dag), locatie en canceled. Van de introtekst nemen we
 *    de eerste zin(nen) over als korte intro (uitzondering, zie city/claude/omschrijvingen.md); de hele
 *    tekst dient alleen voor de indeling.
 *  - Doelgroep en leeftijd staan niet in de lijst. Daarom halen we per doelgroepcategorie en -tag de
 *    lijst nog eens op (klein) en geven we de naam als hint mee ("Kinderen", "6+", "Voor de kleinsten").
 *  - Soort: de thematags (MAAKpunt, Lezen, Cultuur, Doen, Leren) halen we op dezelfde manier op; de eerste
 *    in KIND_TAGS wordt het soortlabel. MAAKpunt geeft ook de hint "Workshop".
 *  - Spreekuren (Taalpunt, DigiHulp, Informatiepunt …) zijn geen uitje en worden overgeslagen.
 */
import { fetchText } from '../../collector/lib/http.ts';
import { cleanText, parseDutchDateRange, parseTimes, shortIntro } from '../../collector/lib/parse.ts';
import type { RawEvent } from '../../collector/normalize.ts';
import type { AdapterContext, AdapterResult, SourceAdapter } from '../../collector/adapters/types.ts';

const BASE = 'https://stadkamer.nl';
const ID = 'stadkamer';
const NAME = 'Stadkamer';

export interface StadkamerItem {
  id: number;
  title: string;
  introText?: string;
  url: string;
  date: string;
  nextDate?: string;
  canceled?: boolean;
  location?: string;
}

interface StadkamerPage {
  data: StadkamerItem[];
  meta?: { pagination?: { totalPages?: number } };
}

/**
 * Doelgroepcategorieën en -tags van Stadkamer (ID → hint). Zie meta.filters van de API.
 * "0+" (65499) staat apart: Stadkamer gebruikt dat ook voor lezingen voor iedereen ("vanaf 0"). Het telt
 * alleen als kinderlabel als de titel niet op volwassenenaanbod wijst (zie ADULT_TITLE).
 */
export const ZERO_PLUS_CATEGORY = '65499';
export const ADULT_TITLE = /lezing|debat|college|symposium|café|cafe|filosof|documentaire|publieksavond|studiekring|actieonderzoek|meetup|senioren/i;

/** Hints voor één activiteit: "0+" valt weg bij een titel die op volwassenenaanbod wijst. */
export function stadkamerHints(title: string, hints: string[]): string[] {
  return ADULT_TITLE.test(title) ? hints.filter((h) => h !== '0+') : hints;
}

export const DEFAULT_HINT_CATEGORIES: Record<string, string> = {
  '63723': 'Kinderen',
  '841101': 'Kinderen (basisschool)',
  '1095741': 'Kinderen (0-4 jaar)',
  '67575': 'Jeugd',
  '65547': '6+',
  '66852': '8 - 12 jaar',
  '1403803': '8+',
  '125480': '15+',
  '62496': 'Volwassenen',
  '1120401': 'Volwassenen (18+)',
};
export const DEFAULT_HINT_TAGS: Record<string, string> = {
  '886983': 'Voor kinderen',
  '724086': 'Voor de kleinsten',
  '67578': '4 - 12 jaar',
  '887382': 'Voor jongeren',
};
/** Thematags (ID → soortlabel), in volgorde van voorkeur; extra hints per label in KIND_HINTS. */
export const DEFAULT_KIND_TAGS: [string, string][] = [
  ['63726', 'Maken'],
  ['64539', 'Lezen'],
  ['66762', 'Cultuur'],
  ['1333976', 'Doen'],
  ['62499', 'Leren'],
];
const KIND_HINTS: Record<string, string[]> = { Maken: ['Workshop'] };

/** Kiest het soortlabel uit de gevonden thema's (volgorde van DEFAULT_KIND_TAGS). */
export function stadkamerKind(labels: string[], order: string[] = DEFAULT_KIND_TAGS.map(([, l]) => l)): string | undefined {
  return [...labels].sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];
}

export const DEFAULT_EXCLUDE = ['spreekuur', 'taalcaf', 'taalpunt', 'digihulp', 'informatiepunt', 'oefenpunt', 'klik ?& ?tik', 'digicaf', 'belastingaangifte'];

/** Vestiging zoals de app hem kent (zie city/venues.ts). */
export function stadkamerVenue(location: string | undefined): { venueName: string; locality?: string } {
  const l = cleanText(location);
  const m = l.match(/stadkamer\s+(centrum|zwolle-zuid|zuid|aa-landen|stadshagen)/i);
  if (m) {
    const b = m[1].toLowerCase();
    if (b === 'centrum') return { venueName: 'Stadkamer Centrum', locality: 'Binnenstad' };
    if (b === 'zuid' || b === 'zwolle-zuid') return { venueName: 'Stadkamer Zuid', locality: 'Zwolle-Zuid' };
    if (b === 'aa-landen') return { venueName: 'Stadkamer Aa-landen', locality: 'Aa-landen' };
    return { venueName: 'Stadkamer Stadshagen', locality: 'Stadshagen' };
  }
  if (!l || /meerdere locaties/i.test(l)) return { venueName: 'Stadkamer (meerdere vestigingen)', locality: 'Zwolle' };
  return { venueName: l, locality: 'Zwolle' };
}

export function stadkamerToRaw(item: StadkamerItem, hints: string[], today: string, nowIso: string): RawEvent | undefined {
  const text = cleanText(item.date);
  const next = item.nextDate && /^\d{4}-\d{2}-\d{2}$/.test(item.nextDate) ? item.nextDate : undefined;
  const base = {
    sourceId: ID,
    sourceName: NAME,
    sourceEventId: `stadkamer-${item.id}`,
    url: item.url.startsWith('http') ? item.url : `${BASE}${item.url}`,
    title: cleanText(item.title),
    ...stadkamerVenue(item.location),
    hints,
    descriptionForClassification: item.introText,
    summary: shortIntro(item.introText),
    statusText: item.canceled ? 'geannuleerd' : undefined,
    indoor: 'binnen' as const,
    checkedAt: nowIso,
  };
  if (/meerdere data/i.test(text)) {
    if (!next) return undefined;
    // Terugkerend zonder lijst van data: de eerstvolgende keer, die elke nacht opschuift.
    return { ...base, start: next, allDay: false, rolling: true, recurrenceNote: 'Meerdere data', extraUncertainties: ['Meerdere data; kijk bij de bron wanneer'] };
  }
  if (/t\/m|tot en met/i.test(text)) {
    const r = parseDutchDateRange(text.replace(/\s*-\s*\d{1,2}[.:]\d{2}.*$/, ''), today);
    if (!r) return undefined;
    return { ...base, start: r.start, end: r.end, allDay: true, ongoing: true };
  }
  // Losse dag: de datum uit nextDate (betrouwbaar), de tijden uit de tekst.
  const day = next ?? parseDutchDateRange(text.split(/\s+-\s+/)[0], today)?.start;
  if (!day) return undefined;
  const t = parseTimes(text);
  return { ...base, start: t.start ? `${day}T${t.start}` : day, end: t.end ? `${day}T${t.end}` : undefined, allDay: !t.start };
}

async function fetchAll(params: Record<string, string>, maxPages: number): Promise<StadkamerItem[]> {
  const out: StadkamerItem[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const q = new URLSearchParams({ siteId: '1', page: String(page), ...params });
    const json = JSON.parse(await fetchText(`${BASE}/api/v1/events?${q}`)) as StadkamerPage;
    out.push(...(json.data ?? []));
    if (page >= (json.meta?.pagination?.totalPages ?? 1)) break;
  }
  return out;
}

export const stadkamer: SourceAdapter = {
  id: ID,
  name: NAME,
  homepage: `${BASE}/agenda`,
  method: 'json',
  description: 'Activiteiten van Stadkamer (bibliotheek en cultuur) in de Zwolse vestigingen, uit de agenda-API van stadkamer.nl; spreekuren worden overgeslagen.',
  async run(ctx: AdapterContext): Promise<AdapterResult> {
    const o = ctx.options;
    const departments = ((o.departments as string[] | undefined) ?? ['90']).join(',');
    const maxPages = (o.maxPages as number | undefined) ?? 20;
    const exclude = new RegExp(((o.excludeTitles as string[] | undefined) ?? DEFAULT_EXCLUDE).join('|'), 'i');
    const hintCats = (o.hintCategories as Record<string, string> | undefined) ?? DEFAULT_HINT_CATEGORIES;
    const hintTags = (o.hintTags as Record<string, string> | undefined) ?? DEFAULT_HINT_TAGS;

    const all = await fetchAll({ departments }, maxPages);
    const hints = new Map<number, Set<string>>();
    const add = (id: number, h: string) => hints.set(id, (hints.get(id) ?? new Set()).add(h));
    for (const [id, h] of Object.entries(hintCats)) for (const it of await fetchAll({ departments, categories: id }, 5)) add(it.id, h);
    for (const it of await fetchAll({ departments, categories: ZERO_PLUS_CATEGORY }, 5)) add(it.id, '0+');
    for (const [id, h] of Object.entries(hintTags)) for (const it of await fetchAll({ departments, tags: id }, 5)) add(it.id, h);
    const kindTags = (o.kindTags as [string, string][] | undefined) ?? DEFAULT_KIND_TAGS;
    const kinds = new Map<number, string[]>();
    for (const [id, label] of kindTags) {
      for (const it of await fetchAll({ departments, tags: id }, 5)) {
        kinds.set(it.id, [...(kinds.get(it.id) ?? []), label]);
        for (const h of KIND_HINTS[label] ?? []) add(it.id, h);
      }
    }

    const seen = new Set<number>();
    const events: RawEvent[] = [];
    let skipped = 0;
    for (const it of all) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      if (exclude.test(it.title)) {
        skipped++;
        continue;
      }
      const found = stadkamerToRaw(it, stadkamerHints(it.title, [...(hints.get(it.id) ?? [])]), ctx.today, ctx.nowIso);
      const kind = stadkamerKind(kinds.get(it.id) ?? [], kindTags.map(([, l]) => l));
      const raw = found && kind ? { ...found, kind } : found;
      if (raw && (raw.end ?? raw.start).slice(0, 10) >= ctx.today && raw.start.slice(0, 10) <= ctx.until) events.push(raw);
    }
    return { events, coverage: { from: ctx.today, to: ctx.until }, notes: `${events.length} activiteiten van ${seen.size} (${skipped} spreekuren overgeslagen)` };
  },
};
