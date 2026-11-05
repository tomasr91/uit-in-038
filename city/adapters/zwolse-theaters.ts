/**
 * Zwolse Theaters — Theater De Spiegel en Schouwburg Odeon (en voorstellingen die zij elders programmeren).
 *
 * Werkwijze (vastgesteld 5-11-2026 met de workflow Bronnen diagnose):
 *  - /programma bevat het programma-onderdeel met zijn model als JSON (attribuut :model van
 *    <component is="production-overview">): de API-URL (/api/events/getresults), de zoekopdracht
 *    (identifier, page, limit) en de eerste pagina resultaten.
 *  - Volgende pagina's haalt de site op met een POST van diezelfde zoekopdracht naar de API; dat doen wij
 *    ook (± 4 verzoeken met limit 100). robots.txt staat /api/ toe.
 *  - Per voorstelling: titel, ondertitel, datumtekst ("do 05 nov '26", "ma 09 nov '26 + di 10 nov '26"),
 *    tijden ("11:00 + 15:00 uur"), locatie, genretags (o.a. "jeugd en familie"), serie-label
 *    ("Kinderen gratis mee!") en de knop ("Bestellen", "Laatste kaarten", "Wachtlijst").
 *  - Omschrijvingen staan alleen op de productiepagina en worden niet overgenomen.
 */
import { fetchText } from '../../collector/lib/http.ts';
import { cleanText, parseDutchDate, parseTimes } from '../../collector/lib/parse.ts';
import type { RawEvent } from '../../collector/normalize.ts';
import type { AdapterContext, AdapterResult, SourceAdapter } from '../../collector/adapters/types.ts';

const BASE = 'https://www.zwolsetheaters.nl';
const ID = 'zwolse-theaters';
const NAME = 'Zwolse Theaters';

export interface ZtItem {
  id: string;
  title: string;
  subtitle?: string | null;
  date?: string;
  time?: string;
  location?: string | null;
  tags?: { name: string }[];
  label?: { value?: string } | null;
  link?: { name?: string; url?: string } | null;
}
export interface ZtResult {
  query: Record<string, unknown> & { page: number; limit: number };
  data: ZtItem[];
  pager?: { totalPages?: number; totalItems?: number };
}
export interface ZtModel {
  apiUrl: string;
  result: ZtResult;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Tekst uit het model: bevat nog HTML-codes zoals &#xE8; (è) en &#x2B; (+). */
export function decodeText(s: string | null | undefined): string {
  return cleanText(
    decodeEntities(s ?? '')
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&nbsp;/g, ' '),
  );
}

/** Het model van het programma-onderdeel op /programma. */
export function parseZtPage(html: string): ZtModel {
  const m = html.match(/<component is="production-overview" :model="([^"]*)"/);
  if (!m) throw new Error('Zwolse Theaters: programma-onderdeel niet gevonden op /programma');
  const model = JSON.parse(decodeEntities(m[1])) as ZtModel;
  if (!model.apiUrl || !model.result?.query) throw new Error('Zwolse Theaters: apiUrl of zoekopdracht ontbreekt');
  return model;
}

const KIND_BY_TAG: [RegExp, string][] = [
  [/jeugd en familie/i, 'Kindervoorstelling'],
  [/^cabaret$/i, 'Comedy'],
  [/^dans$/i, 'Dans'],
  [/^opera$/i, 'Concert · Opera'],
  [/^klassiek$/i, 'Concert · Klassiek'],
  [/^workshop$/i, 'Workshop'],
  [/^(toneel|musical|muziektheater|circus|show|theater overdag)$/i, 'Theater'],
  [/^muziek$/i, 'Concert'],
];

export function ztKind(tags: string[]): string | undefined {
  for (const [re, kind] of KIND_BY_TAG) if (tags.some((t) => re.test(t))) return kind;
  return undefined;
}

function venueOf(location: string | null | undefined): { venueName: string; locality: string } {
  const l = decodeText(location);
  if (/spiegel/i.test(l)) return { venueName: 'Theater De Spiegel', locality: 'Binnenstad' };
  if (/odeon/i.test(l)) return { venueName: 'Schouwburg Odeon', locality: 'Binnenstad' };
  if (/zwolle[- ]zuid/i.test(l)) return { venueName: l, locality: 'Zwolle-Zuid' };
  if (!l) return { venueName: 'Zwolse Theaters (locatie: zie bron)', locality: 'Zwolle' };
  return { venueName: l, locality: 'Zwolle' };
}

function statusOf(button: string | undefined): string | undefined {
  const b = (button ?? '').toLowerCase();
  if (/geannuleerd|afgelast|vervalt/.test(b)) return 'geannuleerd';
  if (/uitverkocht|wachtlijst/.test(b)) return 'uitverkocht';
  if (/laatste kaarten/.test(b)) return 'laatste tickets';
  return undefined;
}

/** Alle datum-tijdcombinaties van een voorstelling: "ma 09 nov '26 + di 10 nov '26", "11:00 + 15:00 uur". */
export function ztOccurrences(date: string | undefined, time: string | undefined, today: string): string[] {
  const days = (date ?? '').split('+').map((p) => parseDutchDate(p.replace(/'(\d{2})\b/, '20$1'), today)).filter((d): d is string => !!d);
  const times = parseTimes(time ?? '').all;
  if (!days.length) return [];
  if (!times.length) return days;
  if (days.length > 1 && days.length === times.length) return days.map((d, i) => `${d}T${times[i]}`);
  return days.flatMap((d) => times.map((t) => `${d}T${t}`));
}

export function ztToRaw(item: ZtItem, today: string, until: string, nowIso: string): RawEvent[] {
  const tags = (item.tags ?? []).map((t) => decodeText(t.name));
  const sub = decodeText((item.subtitle ?? '').split('|')[0]);
  const title = decodeText(item.title) + (sub ? ` · ${sub}` : '');
  const url = item.link?.url ? new URL(item.link.url, BASE).toString() : `${BASE}/programma`;
  const series = decodeText(item.label?.value);
  const family = tags.some((t) => /jeugd en familie/i.test(t));
  return ztOccurrences(item.date, item.time, today)
    .filter((start) => start.slice(0, 10) >= today && start.slice(0, 10) <= until)
    .map((start) => ({
      sourceId: ID,
      sourceName: NAME,
      sourceEventId: `zt-${item.id}-${start}`,
      url,
      title,
      start,
      allDay: start.length === 10,
      ...venueOf(item.location),
      bookingText: 'tickets',
      bookingUrl: url,
      hints: [...tags, ...(series ? [series] : []), ...(family ? ['Familie'] : [])],
      descriptionForClassification: [decodeText(item.subtitle), ...tags].filter(Boolean).join(' · '),
      statusText: statusOf(item.link?.name),
      kind: ztKind(tags),
      audiences: family ? undefined : (['volwassenen'] as RawEvent['audiences']),
      indoor: 'binnen' as const,
      checkedAt: nowIso,
    }));
}

export const zwolseTheaters: SourceAdapter = {
  id: ID,
  name: NAME,
  homepage: `${BASE}/programma`,
  method: 'json',
  description: 'Het programma van Theater De Spiegel en Schouwburg Odeon, uit de programma-API van zwolsetheaters.nl.',
  async run(ctx: AdapterContext): Promise<AdapterResult> {
    const limit = (ctx.options.limit as number | undefined) ?? 100;
    const maxPages = (ctx.options.maxPages as number | undefined) ?? 10;
    const model = parseZtPage(await fetchText(`${BASE}/programma`));
    const api = new URL(model.apiUrl, BASE).toString();
    const items = new Map<string, ZtItem>();
    let total = model.result.pager?.totalItems;
    let note = '';
    try {
      for (let page = 1; page <= maxPages; page++) {
        const res = JSON.parse(await fetchText(api, { method: 'POST', body: { ...model.result.query, page, limit } })) as ZtResult;
        for (const it of res.data ?? []) items.set(it.id, it);
        total = res.pager?.totalItems ?? total;
        if (!res.data?.length || page >= (res.pager?.totalPages ?? 1)) break;
      }
    } catch (e) {
      // Lukt de API niet, dan in elk geval de eerste pagina uit /programma.
      for (const it of model.result.data) items.set(it.id, it);
      note = `; API niet gelukt (${e instanceof Error ? e.message : String(e)}), alleen de eerste ${model.result.data.length}`;
    }
    const events = [...items.values()].flatMap((it) => ztToRaw(it, ctx.today, ctx.until, ctx.nowIso));
    return { events, coverage: note ? undefined : { from: ctx.today, to: ctx.until }, notes: `${events.length} voorstellingen van ${items.size} producties (${total ?? '?'} in het programma)${note}` };
  },
};
