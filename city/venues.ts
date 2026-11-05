/**
 * Bekende locaties in Zwolle (stadsprofiel). Adressen van de eigen sites of gidsen; coördinaten
 * laten we weg waar we ze niet zeker weten: de nachtelijke update zoekt adressen dan op via PDOK.
 * Zie collector/venues.ts voor de velden.
 */
import type { KnownVenue } from '../collector/venues.ts';

export const CITY_VENUES: KnownVenue[] = [
  // — Zwolle-Zuid —
  { name: 'Stadkamer Zuid', aliases: /stadkamer zuid/i, locality: 'Zwolle-Zuid', address: 'Van der Capellenstraat 95, 8014 VW Zwolle', indoor: 'binnen' },
  { name: 'Wijkboerderij De Schellerhoeve', aliases: /schellerhoeve/i, locality: 'Schelle', indoor: 'beide' },
  { name: 'Winkelcentrum Zwolle-Zuid', aliases: /winkelcentrum zwolle[- ]zuid/i, locality: 'Zwolle-Zuid', address: 'Van der Capellenstraat, Zwolle', indoor: 'beide' },

  // — Binnenstad en de rest van Zwolle —
  { name: 'Schouwburg Odeon', aliases: /(schouwburg |theater )?odeon\b/i, locality: 'Binnenstad', address: 'Blijmarkt 25, 8011 ND Zwolle', indoor: 'binnen' },
  { name: 'Theater De Spiegel', aliases: /(theater )?de spiegel\b/i, locality: 'Binnenstad', address: 'Spinhuisplein 14, Zwolle', indoor: 'binnen' },
  { name: 'Filmtheater Fraterhuis', aliases: /fraterhuis/i, locality: 'Binnenstad', address: 'Blijmarkt 25, 8011 ND Zwolle', indoor: 'binnen' },
  { name: 'Hedon', aliases: /^hedon( zwolle)?$|poppodium hedon/i, locality: 'Zwolle', address: 'Burgemeester Drijbersingel 7, 8021 DA Zwolle', indoor: 'binnen' },
  { name: 'Pathé Zwolle', aliases: /path[eé] zwolle/i, locality: 'Zwolle', address: 'Pannekoekendijk 11, 8011 BJ Zwolle', indoor: 'binnen' },
  { name: 'Stadkamer Centrum', aliases: /stadkamer( centrum)?$/i, locality: 'Binnenstad', address: 'Zeven Alleetjes 1a, 8011 CV Zwolle', indoor: 'binnen' },
  { name: 'Stadkamer Aa-landen', aliases: /stadkamer aa-?landen/i, locality: 'Aa-landen', address: 'Dobbe 23, Zwolle', indoor: 'binnen' },
  { name: 'Stadkamer Stadshagen', aliases: /stadkamer stadshagen/i, locality: 'Stadshagen', address: 'Werkerlaan 1b, Zwolle', indoor: 'binnen' },
  { name: 'Museum de Fundatie', aliases: /fundatie/i, locality: 'Binnenstad', indoor: 'binnen' },
  { name: 'Academiehuis Grote Kerk', aliases: /academiehuis|grote kerk zwolle/i, locality: 'Binnenstad', indoor: 'binnen' },
  { name: 'IJsselhallen', aliases: /ijsselhallen/i, locality: 'Zwolle', address: 'Rieteweg 4, Zwolle', indoor: 'binnen' },
];
