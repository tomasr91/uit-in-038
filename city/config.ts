/**
 * Stadsprofiel — VUL DIT IN VOOR JOUW STAD.
 *
 * Alles wat de app tot de agenda van jouw stad maakt, staat in de map city/:
 *  - config.ts            dit bestand: naam, kleuren, thuiswijk, zones en teksten
 *  - venues.ts            bekende locaties met coördinaten (mag leeg beginnen)
 *  - Landmark.tsx         het herkenningspunt in de kop van de app (eigen tekening)
 *  - sources.config.json  welke bronnen de nachtelijke update ophaalt
 *  - adapters/            eigen code voor bronnen zonder feed (optioneel)
 *  - claude/              stadsdelen voor de Claude-skills (optioneel)
 *  - BRONNEN.md           uitleg per bron
 *
 * Dit bestand bevat alleen gegevens (geen React, geen Node), zodat app,
 * verzamellaag, tests en vite.config.ts het kunnen importeren.
 * Zie src/domain/city-types.ts voor de betekenis van elk veld.
 */
import type { CityConfig } from '../src/domain/city-types';

export const CITY: CityConfig = {
  // Korte ID, alleen kleine letters.
  id: 'voorbeeldstad',

  app: {
    name: 'Uit in Voorbeeldstad',
    tagline: 'Ontdek. Kies. Ga.',
    description: 'Persoonlijke gezinsagenda voor Voorbeeldstad en omgeving.',
    manifestDescription: 'Wat te doen in Voorbeeldstad en omgeving, voor kinderen en volwassenen.',
    // Na het publiceren: https://<gebruikersnaam>.github.io/<repository>/
    url: 'https://example.org/',
    // <gebruikersnaam>/<repository> van jouw stadsrepo
    repository: 'gebruikersnaam/uit-in-voorbeeldstad',
  },

  theme: {
    brand: '#24506e',
    brandInk: '#1f4864',
    brandSoft: '#e4edf4',
    headBg: '#1f3a4d',
    headMuted: '#c3d3df',
    headLandmark: '#cfe0ec',
    dayInk: '#1f3a4d',
  },

  cityName: 'Voorbeeldstad',
  // Middelpunt van de stad (bv. het centrale plein) en een ruwe straal van de gemeente in km.
  center: { lat: 52.37, lon: 5.22 },
  cityRadiusKm: 5,

  // Thuiswijk: krijgt voorrang bij kinderactiviteiten en is het standaard vertrekpunt voor afstanden.
  // Wil je geen aparte wijk, neem dan het centrum en een kleine straal.
  home: {
    zoneId: 'thuiswijk',
    name: 'de thuiswijk',
    label: 'Centrum van de thuiswijk',
    lat: 52.38,
    lon: 5.2,
    // Wijken en kernen (kleine letters) die bij de thuiswijk horen.
    localities: ['thuiswijk'],
    radiusKm: 2.5,
  },

  // De rest van de gemeente: wijken en kernen in kleine letters.
  city: {
    zoneId: 'voorbeeldstad',
    localities: ['voorbeeldstad', 'centrum', 'binnenstad'],
  },

  zoneLabels: { thuiswijk: 'Voorbeeldstad', voorbeeldstad: 'Voorbeeldstad', omgeving: 'Omgeving' },

  bikeMaxKm: 8,
  addressPlaceholder: 'Straat 1, Voorbeeldstad of 1234 AB',
  curatedNote: 'Ze worden elke week opnieuw gecontroleerd.',
  // Woorden die in titels van dezelfde zaal vaak terugkomen (helpt bij ontdubbelen), bv. de stadsnaam.
  dedupeGenericWords: ['voorbeeldstad'],
  // Naam van de verzamelbot in de User-Agent (zonder spaties).
  bot: { name: 'VoorbeeldstadAgendaBot', project: 'uit-in-voorbeeldstad' },
};
