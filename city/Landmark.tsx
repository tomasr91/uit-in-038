/**
 * Herkenningspunt van de stad in de kop en het icoon (stadsprofiel).
 * Eigen, vereenvoudigde tekening van de Peperbus (Onze Lieve Vrouwetoren): de vierkante toren,
 * de achthoekige geleding met galerij, de bolle "peperbus"-bekroning met lantaarn en de makelaar.
 * De toren neemt currentColor aan; vensters en deur zijn uitsparingen.
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
          // Makelaar en knop
          'M15.5 0h1v5.5h-1z',
          'M14 8a2 2.4 0 1 0 4 0a2 2.4 0 1 0 -4 0z',
          // Lantaarn
          'M14.2 10.4h3.6v7.6h-3.6z',
          // De bolle bekroning (de peperbus)
          'M16 18c4.6 0 7 4 7 9.4c0 2.9-.9 5-2 6.6H11c-1.1-1.6-2-3.7-2-6.6C9 22 11.4 18 16 18z',
          // Galerij en achthoekige geleding met vensters
          'M8.5 34h15v2h-15z',
          'M10 36h12v18H10z',
          'M12.6 40a1 1 0 0 1 2 0v9h-2z',
          'M17.4 40a1 1 0 0 1 2 0v9h-2z',
          // Kroonlijst en vierkante toren met vensters en deur
          'M7.5 54h17v2h-17z',
          'M8 56h16v40H8z',
          'M11 62a1.5 1.5 0 0 1 3 0v12h-3z',
          'M18 62a1.5 1.5 0 0 1 3 0v12h-3z',
          'M13 96V85a3 3 0 0 1 6 0v11z',
        ].join(' ')}
      />
    </svg>
  );
}
