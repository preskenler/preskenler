/**
 * Municipal transport directory (demande F36).
 *
 * Fixed editorial metadata, mirroring the services/announcements pattern: each
 * line carries a stable `slug` used as the key into the localized
 * `Public.Transport.lines` messages.
 */

export const transportModes = ['tram', 'bus', 'shuttle'] as const;

export type TransportMode = (typeof transportModes)[number];

export type TransportLine = {
  slug: string;
  mode: TransportMode;
};

export const transportLines: TransportLine[] = [
  { slug: 'tram-a', mode: 'tram' },
  { slug: 'tram-b', mode: 'tram' },
  { slug: 'bus-1', mode: 'bus' },
  { slug: 'bus-2', mode: 'bus' },
  { slug: 'navette-centre', mode: 'shuttle' },
];
