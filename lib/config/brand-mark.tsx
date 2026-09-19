/** The ShootPX mark (same artwork as app/icon.svg), for generated images. */
export function BrandMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="18" fill="#000000" />
      <circle cx="50" cy="50" r="41" fill="#c8ff00" />
      <circle cx="50" cy="50" r="32" fill="#000000" />
      <g fill="#c8ff00" stroke="#000000" strokeWidth="2.4" strokeLinejoin="round">
        <polygon points="50.00,23.00 75.68,41.66 59.17,54.60 57.21,42.70" />
        <polygon points="75.68,41.66 65.87,71.84 48.46,60.14 59.17,54.60" />
        <polygon points="65.87,71.84 34.13,71.84 39.88,51.67 48.46,60.14" />
        <polygon points="34.13,71.84 24.32,41.66 45.28,40.89 39.88,51.67" />
        <polygon points="24.32,41.66 50.00,23.00 57.21,42.70 45.28,40.89" />
      </g>
    </svg>
  );
}
