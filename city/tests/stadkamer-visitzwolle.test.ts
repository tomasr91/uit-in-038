/** Stadkamer en VisitZwolle (synthetische gegevens in de vorm van de echte bron; alles hier is ⚠️ TESTDATA). */
import { describe, expect, it } from 'vitest';
import { stadkamerToRaw, stadkamerVenue, type StadkamerItem } from '../adapters/stadkamer';
import { dayPath, parseVzList, splitLocation, vzToRaw } from '../adapters/visitzwolle';
import { normalize } from '../../collector/normalize';

const NOW = '2026-11-05T08:00:00.000Z';
const sk = (o: Partial<StadkamerItem>): StadkamerItem => ({ id: 1, title: '[TESTDATA] Activiteit', url: 'https://stadkamer.nl/agenda/test', date: '', nextDate: '2026-11-05', canceled: false, location: 'Stadkamer Centrum', ...o });

describe('Stadkamer', () => {
  it('losse dag met tijden uit de tekst, datum uit nextDate', () => {
    const r = stadkamerToRaw(sk({ date: '5 nov 2026 - 19.00 tot 21.00 uur' }), [], '2026-11-05', NOW)!;
    expect(r).toMatchObject({ start: '2026-11-05T19:00', end: '2026-11-05T21:00', venueName: 'Stadkamer Centrum' });
  });
  it('periode wordt een doorlopende activiteit', () => {
    const r = stadkamerToRaw(sk({ date: '2 nov t/m 14 nov 2026' }), [], '2026-11-05', NOW)!;
    expect(r).toMatchObject({ start: '2026-11-02', end: '2026-11-14', allDay: true, ongoing: true });
  });
  it('"Meerdere data": de eerstvolgende keer, schuift elke nacht op', () => {
    const r = stadkamerToRaw(sk({ date: 'Meerdere data', nextDate: '2026-11-12' }), [], '2026-11-05', NOW)!;
    expect(r).toMatchObject({ start: '2026-11-12', rolling: true });
  });
  it('vestigingen, afgelast en doelgroephints', () => {
    expect(stadkamerVenue('Stadkamer Zwolle-Zuid')).toEqual({ venueName: 'Stadkamer Zuid', locality: 'Zwolle-Zuid' });
    expect(stadkamerVenue('Stadkamer centrum, eerste verdieping').venueName).toBe('Stadkamer Centrum');
    expect(stadkamerVenue('Meerdere locaties').locality).toBe('Zwolle');
    const a = normalize(stadkamerToRaw(sk({ date: '7 nov 2026 - 10.30 tot 11.00 uur', canceled: true, location: 'Stadkamer Zwolle-Zuid' }), ['Voor de kleinsten', '0+'], '2026-11-05', NOW)!);
    expect(a.status).toBe('geannuleerd');
    expect(a.zone).toBe('zwolle-zuid');
    expect(a.audiences).toContain('kinderen');
  });
});

const card = (id: string, title: string, dt: string, loc: string, times: string) => `
  <article class="agendabox"><a href="/agenda-item/${id}/${title.toLowerCase().replace(/\W+/g, '-')}/" class="box">
    <div class="banner"><time datetime="${dt}">5 nov</time></div>
    <div class="body"><h3 class="title t4 l"> ${title}</h3>
      <dl class="struct proplist"><dt>pin</dt><dd class="location">${loc}</dd><dt>tijd</dt><dd>${times}</dd></dl></div></a></article>`;
const page = (cards: string) => `<div class="dayhead"><h3 class="title">vandaag</h3></div><ul class="struct boxgrid"><li>${cards}</li></ul>`;

describe('VisitZwolle', () => {
  it('leest kaarten: id, titel, tijden en plek', () => {
    const list = parseVzList(page(card('182526', '[TESTDATA] Drakenjacht', '2026-11-05T08:00:00+01:00', 'Het Engelse Werk, Zwolle', '08:00 - 20:00')));
    expect(list).toEqual([{ id: '182526', path: '/agenda-item/182526/-testdata-drakenjacht/', title: '[TESTDATA] Drakenjacht', datetime: '2026-11-05T08:00:00+01:00', location: 'Het Engelse Werk, Zwolle', times: '08:00 - 20:00' }]);
  });
  it('wordt een activiteit op die dag; kinderlijst geeft de hint Kinderen', () => {
    const [c] = parseVzList(page(card('1', '[TESTDATA] Speurtocht', '2026-11-07T10:00:00+01:00', 'Park de Wezenlanden, Zwolle', '10:00 - 12:00')));
    const r = vzToRaw(c, '2026-11-07', true, NOW)!;
    expect(r).toMatchObject({ start: '2026-11-07T10:00', end: '2026-11-07T12:00', venueName: 'Park de Wezenlanden', locality: 'Zwolle', sourceEventId: 'vz-1-2026-11-07', seriesKey: 'vz-1' });
    expect(normalize(r).audiences).toContain('kinderen');
  });
  it('een kaart met een andere datum hoort niet bij deze dag', () => {
    const [c] = parseVzList(page(card('2', '[TESTDATA] X', '2026-11-08T10:00:00+01:00', 'Zwolle', '10:00')));
    expect(vzToRaw(c, '2026-11-07', false, NOW)).toBeUndefined();
  });
  it('hulpjes', () => {
    expect(dayPath('2026-11-05')).toBe('05-11-2026');
    expect(splitLocation('Theater de Spiegel - Mateboerzaal, Zwolle')).toEqual({ venueName: 'Theater de Spiegel - Mateboerzaal', locality: 'Zwolle' });
  });
});
