/**
 * Bekende locaties van deze stad (stadsprofiel), met benaderde coördinaten en wijk/plaats.
 * Zie collector/venues.ts voor de velden. Begin leeg en voeg locaties toe die vaak voorkomen;
 * laat coördinaten weg als je ze niet zeker weet (dan zoekt de update het adres op via PDOK).
 */
import type { KnownVenue } from '../collector/venues.ts';

export const CITY_VENUES: KnownVenue[] = [
  // { name: 'Stadstheater', aliases: /stadstheater/i, locality: 'Binnenstad', address: 'Straat 1, 1234 AB Voorbeeldstad', lat: 52.37, lon: 5.22, indoor: 'binnen' },
];
