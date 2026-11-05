/**
 * Stadsprofiel: alles wat deze app tot "Uit in 038" maakt.
 *
 * De rest van de code (app, domeinlogica, verzamellaag) is de motor uit-core en leest
 * stad-specifieke waarden alleen hier. Zie src/domain/city-types.ts voor de velden.
 */
import type { CityConfig } from '../src/domain/city-types';

export const CITY: CityConfig = {
  id: 'zwolle',

  app: {
    name: 'Uit in 038',
    tagline: 'Ontdek. Kies. Ga.',
    description: 'Persoonlijke gezinsagenda voor Zwolle-Zuid, Zwolle en omgeving.',
    manifestDescription: 'Wat te doen in Zwolle en omgeving, voor kinderen en volwassenen.',
    url: 'https://tomasr91.github.io/uit-in-038/',
    repository: 'tomasr91/uit-in-038',
  },

  /** Diepgroen, zodat Uit in 038 zich op het beginscherm onderscheidt van Uit in 030. */
  theme: {
    brand: '#25594f',
    brandInk: '#1f4f46',
    brandSoft: '#e2efec',
    headBg: '#1d3b36',
    headMuted: '#c2d8d3',
    headLandmark: '#d3e6e1',
    dayInk: '#1d3b36',
  },

  cityName: 'Zwolle',
  /** Grote Markt. */
  center: { lat: 52.5125, lon: 6.0925 },
  cityRadiusKm: 5,

  /**
   * Thuiswijk Zwolle-Zuid: de CBS-wijken Schelle (50) en Ittersum (51), ten zuiden van de IJsselallee.
   * Vertrekpunt: winkelcentrum Zwolle-Zuid (Van der Capellenstraat/Oldeneelallee), benaderd.
   */
  home: {
    zoneId: 'zwolle-zuid',
    name: 'Zwolle-Zuid',
    label: 'Winkelcentrum Zwolle-Zuid',
    lat: 52.4935,
    lon: 6.1065,
    localities: [
      'zwolle-zuid',
      'zwolle zuid',
      'schelle',
      'schellerhoek',
      'schellerbroek',
      'schellerlanden',
      'oldeneel',
      'oldenelerlanden',
      'oldenelerbroek',
      'oud-ittersum',
      'oud ittersum',
      'ittersumerlanden',
      'ittersumerbroek',
      'gerenlanden',
      'gerenbroek',
      'zandhove',
    ],
    radiusKm: 2.5,
    /** Zonder plaatsnaam alleen ten zuiden van de IJsselallee (niet Assendorp of Spoolde). */
    maxLat: 52.4985,
  },

  city: {
    zoneId: 'zwolle',
    localities: [
      'zwolle', 'binnenstad', 'centrum', 'assendorp', 'diezerpoort', 'kamperpoort', 'veerallee', 'wipstrik',
      'spoolde', 'holtenbroek', 'aa-landen', 'stadshagen', 'westenholte', 'berkum', 'dieze', 'hanzeland',
      'weezenlanden', 'wezenlanden', 'marslanden', 'windesheim', 'wijthmen', 'herfte', 'haerst',
    ],
  },

  zoneLabels: { 'zwolle-zuid': 'Zwolle', zwolle: 'Zwolle', omgeving: 'Omgeving' },

  bikeMaxKm: 8,
  addressPlaceholder: 'Straat 1, Zwolle of 8014 AB',
  curatedNote: 'Ze worden elke week opnieuw gecontroleerd.',
  dedupeGenericWords: ['zwolle', 'odeon', 'spiegel', 'hedon', 'fraterhuis'],
  bot: { name: 'UitIn038Bot', project: 'uit-in-038' },
};
