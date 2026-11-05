/** Hedon (synthetische pagina; alles hier is ⚠️ TESTDATA). */
import { describe, expect, it } from 'vitest';
import { hedonKind, hedonToRaw, parseHedonPage, slugify, type HedonEvent } from '../adapters/hedon';
import { normalize } from '../../collector/normalize';

const NOW = '2026-11-05T08:00:00.000Z';
const ev = (o: Partial<HedonEvent>): HedonEvent => ({ id: 1, title: '[TESTDATA] Band', eventDate: '2026-11-20T19:30:00Z', publish: true, venue: 'Hedon - Grote Zaal', ageLimit: 'Alle leeftijden', genres: [], segments: [], status: 0, ...o });
const page = (list: HedonEvent[]) =>
  `<html><body><script id="ng-state" type="application/json">${JSON.stringify({ a: { b: { id: 1, title: 'Hedon Zwolle' } }, b: { b: list } })}</script></body></html>`;

describe('Hedon', () => {
  it('leest het programma uit de ng-state', () => {
    const list = parseHedonPage(page([ev({ id: 7 }), ev({ id: 8 })]));
    expect(list.map((e) => e.id)).toEqual([7, 8]);
  });

  it('UTC-tijd wordt Amsterdamse tijd; URL met id en slug; alleen binnen het venster', () => {
    const raw = hedonToRaw([ev({ id: 5, title: 'BLØF - Extra Show', endDate: '2026-11-20T22:00:00Z' }), ev({ id: 6, eventDate: '2027-06-01T18:00:00Z' })], '2026-11-05', '2027-02-19', NOW);
    expect(raw).toHaveLength(1);
    expect(raw[0]).toMatchObject({ start: '2026-11-20T20:30', end: '2026-11-20T23:00', url: 'https://www.hedon-zwolle.nl/voorstelling/5/blof-extra-show', venueName: 'Hedon, Grote Zaal' });
    expect(slugify('BÖKKERS')).toBe('bokkers');
  });

  it('status: uitverkocht, afgelast en verplaatst', () => {
    const [a, b, c] = hedonToRaw([ev({ id: 1, status: 2 }), ev({ id: 2, status: 3 }), ev({ id: 3, status: 5 })], '2026-11-05', '2027-02-19', NOW);
    expect(normalize(a).status).toBe('uitverkocht');
    expect(normalize(b).status).toBe('geannuleerd');
    expect(c.extraUncertainties?.[0]).toMatch(/Verplaatst/);
  });

  it('"Alle leeftijden" is geen kinderactiviteit; een familievoorstelling wel', () => {
    const [concert, familie] = hedonToRaw([ev({ id: 1 }), ev({ id: 2, title: '[TESTDATA] Kindermiddag', subtitle: 'voor het hele gezin' })], '2026-11-05', '2027-02-19', NOW);
    expect(normalize(concert).audiences).toEqual(['volwassenen']);
    expect(normalize(familie).audiences).toContain('kinderen');
  });

  it('soortlabel: clubavond, comedy en het meest zeggende muziekgenre', () => {
    expect(hedonKind(ev({ segments: [{ title: 'Nights' }], genres: [{ name: 'House' }] }))).toBe('Uitgaan');
    expect(hedonKind(ev({ genres: [{ name: 'Cabaret' }] }))).toBe('Comedy');
    expect(hedonKind(ev({ genres: [{ name: 'Pop' }, { name: 'Nederlands' }, { name: 'Hiphop' }] }))).toBe('Concert · Hiphop');
    expect(hedonKind(ev({ genres: [{ name: 'Nederlands' }] }))).toBe('Concert · Nederlandstalig');
    expect(hedonKind(ev({ genres: [] }))).toBe('Concert');
  });

  it('elders: De Spiegel en een externe locatie', () => {
    const [s, x] = hedonToRaw([ev({ id: 1, venue: 'Zwolse Theaters - De Spiegel' }), ev({ id: 2, venue: 'Extern' })], '2026-11-05', '2027-02-19', NOW);
    expect(s.venueName).toBe('Theater De Spiegel');
    expect(x.locality).toBe('Zwolle');
  });
});
