/**
 * Hedon — poppodium van Zwolle: concerten, clubavonden (Hedon Nights) en shows die Hedon elders organiseert.
 *
 * Werkwijze (vastgesteld 5-11-2026 met de workflow Bronnen diagnose, vanaf een GitHub-server):
 *  - De site is een Angular-app. De pagina bevat in <script id="ng-state"> dezelfde data die de app zelf
 *    gebruikt, waaronder het complete programma: per voorstelling id, titel, ondertitel, zaal, begintijd
 *    (eventDate, UTC), eindtijd, leeftijdsgrens, prijs, genres, segment (Nights, Hedon Zwaar) en status.
 *  - Eén verzoek per run; geen detailpagina's nodig.
 *  - Status: 0 gewoon, 1 laatste kaarten, 2 uitverkocht, 3 afgelast, 5 verplaatst (afgeleid uit de
 *    meldingen bij de voorstellingen).
 *  - Omschrijvingen worden niet overgenomen; ondertitel en genres dienen alleen voor de indeling.
 */
import { fetchText } from '../../collector/lib/http.ts';
import { isoToLocal } from '../../collector/lib/parse.ts';
import type { RawEvent } from '../../collector/normalize.ts';
import type { AdapterContext, AdapterResult, SourceAdapter } from '../../collector/adapters/types.ts';

const BASE = 'https://www.hedon-zwolle.nl';
const ID = 'hedon';
const NAME = 'Hedon';
const HEDON_ADDRESS = 'Burgemeester Drijbersingel 7, 8021 DA Zwolle';

export interface HedonEvent {
  id: number;
  title: string;
  subtitle?: string;
  status?: number;
  ageLimit?: string;
  venue?: string;
  eventDate: string;
  endDate?: string;
  publish?: boolean;
  publishFromDate?: string;
  externalTicketsUrl?: string;
  price?: number;
  genres?: { name: string }[];
  segments?: { title: string }[];
}

/** Het programma uit de ng-state van een Hedon-pagina (de lijst waarvan de items eventDate en yesplanId hebben). */
export function parseHedonPage(html: string): HedonEvent[] {
  const m = html.match(/<script id="ng-state"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Hedon: geen ng-state in de pagina gevonden');
  const state = JSON.parse(m[1]) as Record<string, { b?: unknown }>;
  const lists = Object.values(state)
    .map((v) => v?.b)
    .filter((b): b is HedonEvent[] => Array.isArray(b) && b.length > 0 && typeof b[0] === 'object' && b[0] !== null && 'eventDate' in b[0]);
  // Soms staat het programma in meer dan één lijst (bv. uitgelicht en alles): voeg samen op id.
  const byId = new Map<number, HedonEvent>();
  for (const list of lists) for (const e of list) if (typeof e.id === 'number') byId.set(e.id, e);
  return [...byId.values()];
}

export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const GENRE_TO_KIND: [RegExp, string][] = [
  [/^(cabaret|comedy|stand-?up)$/i, 'Comedy'],
  [/^(theater|musical)$/i, 'Theater'],
  [/^(techno|house|electro|dance|nights|drum.?n.?bass|hardstyle)$/i, 'Uitgaan'],
  [/^(pop|rock|pop \/ rock|classic rock|alternative|grunge|tribute)$/i, 'Concert · Pop & rock'],
  [/^indie$/i, 'Concert · Indie'],
  [/^singer\/?-?songwriter$/i, 'Concert · Singer-songwriter'],
  [/^(americana|folk|blues|country|roots)$/i, 'Concert · Roots & americana'],
  [/^(metal|punk|hardcore)$/i, 'Concert · Metal & punk'],
  [/^nederlands(talig)?$/i, 'Concert · Nederlandstalig'],
  [/^jazz$/i, 'Concert · Jazz'],
  [/^(funk|soul|r&b)$/i, 'Concert · Soul & funk'],
  [/^(hiphop|hip-hop|rap)$/i, 'Concert · Hiphop'],
];

/** Soortlabel: theater/comedy en clubavonden eerst, anders het meest zeggende muziekgenre. */
export function hedonKind(e: HedonEvent): string {
  const genres = (e.genres ?? []).map((g) => g.name.trim());
  if ((e.segments ?? []).some((s) => /nights/i.test(s.title))) return 'Uitgaan';
  for (const [re, kind] of GENRE_TO_KIND.slice(0, 3)) if (genres.some((g) => re.test(g))) return kind;
  // Specifieker genre gaat voor "Pop"/"Rock"/"Nederlands", die bijna overal bij staan.
  for (const [re, kind] of GENRE_TO_KIND.slice(4)) if (genres.some((g) => re.test(g)) && kind !== 'Concert · Nederlandstalig') return kind;
  for (const [re, kind] of GENRE_TO_KIND) if (genres.some((g) => re.test(g))) return kind;
  return 'Concert';
}

function venueOf(e: HedonEvent): Pick<RawEvent, 'venueName' | 'address' | 'locality'> {
  const v = (e.venue ?? '').trim();
  if (/^hedon\b/i.test(v) || !v) return { venueName: v.replace(/^hedon\s*-\s*/i, 'Hedon, ') || 'Hedon', address: HEDON_ADDRESS, locality: 'Zwolle' };
  if (/spiegel/i.test(v)) return { venueName: 'Theater De Spiegel', locality: 'Binnenstad' };
  if (/odeon/i.test(v)) return { venueName: 'Schouwburg Odeon', locality: 'Binnenstad' };
  if (/^extern$/i.test(v)) return { venueName: 'Locatie: zie bron', locality: 'Zwolle' };
  return { venueName: v, locality: 'Zwolle' };
}

const KIDS = /\b(kinder\w*|kids?|famil\w*|gezin\w*|jeugd\w*|peuter\w*|kleuter\w*)\b/i;

const STATUS_TEXT: Record<number, string> = { 1: 'laatste tickets', 2: 'uitverkocht', 3: 'geannuleerd' };

export function hedonToRaw(list: HedonEvent[], today: string, until: string, nowIso: string): RawEvent[] {
  const out: RawEvent[] = [];
  for (const e of list) {
    if (e.publish === false) continue;
    if (e.publishFromDate && e.publishFromDate > nowIso) continue;
    const start = isoToLocal(e.eventDate);
    const day = start.slice(0, 10);
    if (day < today || day > until) continue;
    const end = e.endDate ? isoToLocal(e.endDate) : undefined;
    const genres = (e.genres ?? []).map((g) => g.name);
    const age = (e.ageLimit ?? '').trim();
    // "Alle leeftijden" betekent bij Hedon: geen leeftijdsgrens, niet: voor kinderen. Alleen wat
    // uitdrukkelijk voor kinderen of gezinnen is, laten we door de normalisatie indelen.
    const family = KIDS.test([e.title, e.subtitle, ...genres].join(' '));
    out.push({
      sourceId: ID,
      sourceName: NAME,
      sourceEventId: `hedon-${e.id}`,
      url: `${BASE}/voorstelling/${e.id}/${slugify(e.title)}`,
      title: e.title.trim(),
      start,
      end: end && end > start ? end : undefined,
      ...venueOf(e),
      priceText: typeof e.price === 'number' ? (e.price === 0 ? 'Gratis' : `€ ${e.price.toFixed(2).replace('.', ',')}`) : undefined,
      bookingText: 'tickets',
      bookingUrl: e.externalTicketsUrl || undefined,
      hints: [/alle leeftijden/i.test(age) ? '' : age, ...genres, ...(e.segments ?? []).map((s) => s.title)].filter(Boolean),
      audiences: family ? undefined : ['volwassenen'],
      descriptionForClassification: [e.subtitle, ...genres].filter(Boolean).join(' · '),
      statusText: STATUS_TEXT[e.status ?? 0],
      extraUncertainties: e.status === 5 ? ['Verplaatst naar een andere datum of plek; kijk bij de bron'] : undefined,
      kind: hedonKind(e),
      indoor: 'binnen',
      checkedAt: nowIso,
    });
  }
  return out;
}

export const hedon: SourceAdapter = {
  id: ID,
  name: NAME,
  homepage: `${BASE}/`,
  method: 'json',
  description: 'Concerten, clubavonden en shows van poppodium Hedon (ook in Theater De Spiegel), uit de programmadata van hedon-zwolle.nl.',
  async run(ctx: AdapterContext): Promise<AdapterResult> {
    const page = (ctx.options.page as string | undefined) ?? `${BASE}/`;
    const list = parseHedonPage(await fetchText(page));
    const events = hedonToRaw(list, ctx.today, ctx.until, ctx.nowIso);
    return { events, coverage: { from: ctx.today, to: ctx.until }, notes: `${events.length} voorstellingen van ${list.length} in het programma` };
  },
};
