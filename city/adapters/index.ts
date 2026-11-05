/**
 * Eigen adapters van Zwolle (stadsprofiel). De sleutel is de bron-ID in city/sources.config.json.
 * Algemene adapters (handmatig, vaste-plekken, pathe en de types ical/jsonld/tribe) levert de motor.
 */
import type { SourceAdapter } from '../../collector/adapters/types.ts';
import { hedon } from './hedon.ts';

export const CITY_ADAPTERS: Record<string, SourceAdapter> = {
  hedon,
};
