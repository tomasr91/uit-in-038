/**
 * Bekende locaties in Zwolle (stadsprofiel). Adressen van de eigen sites of gidsen; coördinaten
 * laten we weg waar we ze niet zeker weten: de nachtelijke update zoekt adressen dan op via PDOK.
 * Zie collector/venues.ts voor de velden.
 */
import type { KnownVenue } from '../collector/venues.ts';

export const CITY_VENUES: KnownVenue[] = [
  // — Zwolle-Zuid —
  { name: 'Stadkamer Zuid', aliases: /stadkamer (zwolle-)?zuid/i, locality: 'Zwolle-Zuid', address: 'Van der Capellenstraat 95, 8014 VW Zwolle', indoor: 'binnen' },
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
  { name: 'Museum de Fundatie', aliases: /fundatie/i, locality: 'Binnenstad', address: 'Blijmarkt 20, 8011 NE Zwolle', indoor: 'binnen' },
  { name: 'Academiehuis Grote Kerk', aliases: /academiehuis|grote kerk zwolle/i, locality: 'Binnenstad', address: 'Grote Markt 18, 8011 LW Zwolle', indoor: 'binnen' },
  { name: 'ANNO Stadsmuseum', aliases: /\banno\b.*(stadsmuseum|zwolle)|stadsmuseum anno/i, locality: 'Binnenstad', address: 'Melkmarkt 41, 8011 MB Zwolle', indoor: 'binnen' },
  { name: 'Sassenpoort', aliases: /sassenpoort/i, locality: 'Binnenstad', address: 'Sassenstraat 53, 8011 PB Zwolle', indoor: 'binnen' },
  { name: 'Onze Lieve Vrouwe Basiliek en Peperbus', aliases: /peperbus|lieve vrouwe ?basiliek/i, locality: 'Binnenstad', address: 'Ossenmarkt, 8011 MS Zwolle', indoor: 'binnen' },
  { name: 'Kunstplatform LINK', aliases: /kunstplatform link|kunstruimte link/i, locality: 'Binnenstad', address: 'Grote Kerkplein 15, 8011 PK Zwolle', indoor: 'binnen' },
  { name: 'Kunstruimte het Langhuis', aliases: /langhuis/i, locality: 'Binnenstad', address: 'Goudsteeg 8, 8011 PP Zwolle', indoor: 'binnen' },
  { name: 'Grote Kerkplein', aliases: /^grote kerkplein$|start bij de grote kerk/i, locality: 'Binnenstad', address: 'Grote Kerkplein, Zwolle', indoor: 'buiten' },
  { name: 'Rodetorenplein', aliases: /^rodetorenplein$/i, locality: 'Binnenstad', address: 'Rodetorenplein, Zwolle', indoor: 'buiten' },
  { name: 'Het Engelse Werk', aliases: /engelse werk/i, locality: 'Schelle', address: 'Het Engelse Werk 4, 8019 BM Zwolle', indoor: 'buiten' },
  { name: 'IJsselhallen', aliases: /ijsselhallen/i, locality: 'Zwolle', address: 'Rieteweg 4, Zwolle', indoor: 'binnen' },
];
