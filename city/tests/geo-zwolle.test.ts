/** Zone-indeling voor Zwolle met Zwolle-Zuid als thuiswijk. */
import { describe, expect, it } from 'vitest';
import { classifyZone } from '../../src/domain/geo';

describe('zones in Zwolle', () => {
  it('Zwolle-Zuid: wijken en buurten ten zuiden van de IJsselallee', () => {
    expect(classifyZone({ name: 'Stadkamer Zuid', locality: 'Zwolle-Zuid', geoPrecision: 'unknown' })).toBe('zwolle-zuid');
    expect(classifyZone({ name: 'Wijkboerderij De Schellerhoeve', locality: 'Schelle', geoPrecision: 'unknown' })).toBe('zwolle-zuid');
    expect(classifyZone({ name: 'Speeltuin', address: 'Jellissenkamp 2, 8014 EW Zwolle', locality: 'Gerenlanden', geoPrecision: 'unknown' })).toBe('zwolle-zuid');
  });
  it('de rest van Zwolle, ook een straat met "Ittersum" in de naam', () => {
    expect(classifyZone({ name: 'Hedon', address: 'Burgemeester Drijbersingel 7, 8021 DA Zwolle', geoPrecision: 'unknown' })).toBe('zwolle');
    expect(classifyZone({ name: 'Atelier', address: 'Van Ittersumstraat 62, 8012 TL Zwolle', geoPrecision: 'unknown' })).toBe('zwolle');
    expect(classifyZone({ name: 'Theater', locality: 'Stadshagen', geoPrecision: 'unknown' })).toBe('zwolle');
  });
  it('buiten de gemeente is omgeving', () => {
    expect(classifyZone({ name: 'Stadsgehoorzaal', locality: 'Kampen', geoPrecision: 'unknown' })).toBe('omgeving');
  });
  it('zonder plaatsnaam: Assendorp (noord van de IJsselallee) is geen Zwolle-Zuid', () => {
    expect(classifyZone({ name: 'X', lat: 52.5042, lon: 6.1033, geoPrecision: 'approx' })).toBe('zwolle');
  });
});
