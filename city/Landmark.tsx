/**
 * Herkenningspunt van de stad in de kop en het icoon (stadsprofiel).
 * VERVANG DIT door een eigen tekening van iets herkenbaars uit jouw stad (een toren, poort, brug).
 * Gebruik geen logo of stadswapen van de gemeente.
 *
 * Dit is een eenvoudige, algemene toren: spits, uurwerk, vensters en een deur.
 * De tekening neemt currentColor aan; vensters en deur zijn uitsparingen.
 */
export function Landmark({ height = 44, title, line = false }: { height?: number; title?: string; line?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 96"
      height={height}
      width={(height * 32) / 96}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fill={line ? 'none' : 'currentColor'}
        stroke={line ? 'currentColor' : undefined}
        strokeWidth={line ? 1.2 : undefined}
        vectorEffect={line ? 'non-scaling-stroke' : undefined}
        strokeLinejoin="round"
        fillRule="evenodd"
        d={[
          // Spits met makelaar
          'M15.4 0h1.2v4h-1.2z',
          'M16 4 23 22H9z',
          // Bovenste deel met uurwerk
          'M9 22h14v30H9z',
          'M12 34a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z',
          // Onderste deel met vensters en deur
          'M7 52h18v44H7z',
          'M10.5 59a1.5 1.5 0 0 1 3 0v12h-3z',
          'M18.5 59a1.5 1.5 0 0 1 3 0v12h-3z',
          'M13 96V84a3 3 0 0 1 6 0v12z',
        ].join(' ')}
      />
    </svg>
  );
}
