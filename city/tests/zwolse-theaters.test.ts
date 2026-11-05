/** Zwolse Theaters (synthetisch model in de vorm van de echte bron; alles hier is ⚠️ TESTDATA). */
import { describe, expect, it } from 'vitest';
import { decodeText, parseZtPage, ztKind, ztOccurrences, ztToRaw, type ZtItem } from '../adapters/zwolse-theaters';
import { normalize } from '../../collector/normalize';

const NOW = '2026-11-05T08:00:00.000Z';
const item = (o: Partial<ZtItem>): ZtItem => ({ id: 'x', title: '[TESTDATA] Voorstelling', subtitle: null, date: "za 07 nov '26", time: '20:00 uur', location: 'Theater de Spiegel', tags: [], label: { value: '' }, link: { name: 'Bestellen', url: '/programma/2026-2027/test' }, ...o });
const attr = (o: object) => JSON.stringify(o).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

describe('Zwolse Theaters', () => {
  it('leest apiUrl, zoekopdracht en eerste pagina uit /programma', () => {
    const model = { apiUrl: '/api/events/getresults', result: { query: { identifier: 'abc', language: 'nl', phrase: null, filterData: {}, page: 1, limit: 10 }, data: [item({})], pager: { totalPages: 35, totalItems: 345 } } };
    const m = parseZtPage(`<app-main><component is="production-overview" :model="${attr(model)}"></component></app-main>`);
    expect(m.apiUrl).toBe('/api/events/getresults');
    expect(m.result.query.identifier).toBe('abc');
    expect(m.result.data).toHaveLength(1);
  });
  it('meerdere tijden of data worden aparte voorstellingen', () => {
    expect(ztOccurrences("zo 08 nov '26", '11:00 + 15:00 uur', '2026-11-05')).toEqual(['2026-11-08T11:00', '2026-11-08T15:00']);
    expect(ztOccurrences("ma 09 nov '26 + di 10 nov '26", '19:00 uur', '2026-11-05')).toEqual(['2026-11-09T19:00', '2026-11-10T19:00']);
  });
  it('HTML-codes, gezelschap in de titel, leeftijd en status', () => {
    expect(decodeText('De R&#xE8;g&#xE2;hs')).toBe('De Règâhs');
    const [r] = ztToRaw(item({ title: 'Peuters in de Paap', subtitle: 'Houtje 3&#x2B; | Het Ministerie', tags: [{ name: 'jeugd en familie' }], link: { name: 'Laatste kaarten', url: '/programma/2026-2027/houtje-3plus' } }), '2026-11-05', '2027-02-19', NOW);
    expect(r.title).toBe('Peuters in de Paap · Houtje 3+');
    expect(r.url).toBe('https://www.zwolsetheaters.nl/programma/2026-2027/houtje-3plus');
    const a = normalize(r);
    expect(a.audiences).toContain('kinderen');
    expect(a.age.officialMinMonths).toBe(36);
    expect(normalize(ztToRaw(item({ link: { name: 'Wachtlijst' } }), '2026-11-05', '2027-02-19', NOW)[0]).status).toBe('uitverkocht');
  });
  it('soort uit de genretags; theater voor volwassenen blijft bij volwassenen', () => {
    expect(ztKind(['lachen', 'cabaret'])).toBe('Comedy');
    expect(ztKind(['bewonderen', 'dans'])).toBe('Dans');
    expect(ztKind(['avontuur', 'jeugd en familie', 'toneel'])).toBe('Kindervoorstelling');
    expect(normalize(ztToRaw(item({ tags: [{ name: 'toneel' }] }), '2026-11-05', '2027-02-19', NOW)[0]).audiences).toEqual(['volwassenen']);
  });
});
