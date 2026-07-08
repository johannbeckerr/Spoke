// Monochrome, dark-navy (#0B112D) bold and solid icon set.
// Precise geometric linework and solid glyphs for high impact.

// Propriedades padrão para ícones vazados (linhas grossas)
const OUTLINE_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5, // Linha grossa e marcante
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
};

// Propriedades padrão para ícones sólidos (montanha, usuário)
const SOLID_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  stroke: 'none',
};

// 1) Bicicleta de Estrada (Linhas grossas)
export function RoadIcon(props) {
  return (
    <svg {...OUTLINE_PROPS} {...props}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M5.5 17.5L10.5 9H14.5L18.5 17.5" />
      <path d="M10.5 9L13.5 13H18.5" />
      <path d="M13.5 13L11.5 17.5" />
      <path d="M10.5 9H8" />
      <path d="M14.5 9L15.5 6H17.5" />
    </svg>
  );
}

// 2) Montanha (Geométrica e Sólida)
export function MtbIcon(props) {
  return (
    <svg {...SOLID_PROPS} {...props}>
      <path d="M2 21L10 8L15 15L19 7L23 21H2Z" />
    </svg>
  );
}

// 3) Trilhos (Linhas grossas e retas)
export function GravelIcon(props) {
  return (
    <svg {...OUTLINE_PROPS} {...props}>
      <path d="M5 21L10 3M19 21L14 3" />
      <path d="M4 17H20" />
      <path d="M6 12H18" />
      <path d="M8 7H16" />
    </svg>
  );
}

// 4) Cidade (Linhas grossas)
export function CityIcon(props) {
  return (
    <svg {...OUTLINE_PROPS} {...props}>
      <path d="M2 21H22" />
      <rect x="3" y="11" width="5" height="10" />
      <rect x="8" y="5" width="6" height="16" />
      <rect x="14" y="14" width="4" height="7" />
      <rect x="18" y="9" width="4" height="12" />
    </svg>
  );
}

// Fallback
export function BikeIcon(props) {
  return <RoadIcon {...props} />;
}

// Chevron — used for the expand/collapse toggle
export function ChevronIcon(props) {
  return (
    <svg {...OUTLINE_PROPS} {...props}>
      <path d="M5 9L12 16L19 9" />
    </svg>
  );
}

// 5) Usuário (Busto Sólido)
export function UsersIcon(props) {
  return (
    <svg {...SOLID_PROPS} {...props}>
      <circle cx="12" cy="7" r="5" />
      <path d="M4 22C4 16.5 8 14 12 14C16 14 20 16.5 20 22" />
    </svg>
  );
}

// 6) Spoke wordmark glyph — replaces the "o" in "Spoke"
export function SpokeLogoIcon(props) {
  return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="82.81 71.19 346.71 369.75" width="1em" height="1em">
  <g stroke="currentColor" stroke-width="16.65" stroke-linecap="round">
    <line x1="239.33" y1="110.78" x2="204.96" y2="243.12"/>
    <line x1="373.74" y1="169.61" x2="242.5" y2="205.96"/>
    <line x1="389.94" y1="314.64" x2="293.12" y2="219.31"/>
    <line x1="271.62" y1="401.36" x2="305.88" y2="269.31"/>
    <line x1="138.47" y1="342.27" x2="270.17" y2="305.67"/>
    <line x1="122.4" y1="197.67" x2="219.92" y2="293.66"/>
  </g>
  <g fill="currentColor">
    <circle cx="256.5" cy="256.5" r="62.37"/>
    <circle cx="239.33" cy="110.78" r="33.59"/>
    <circle cx="373.74" cy="169.61" r="33.59"/>
    <circle cx="389.94" cy="314.64" r="33.59"/>
    <circle cx="271.62" cy="401.36" r="33.59"/>
    <circle cx="138.47" cy="342.27" r="33.59"/>
    <circle cx="122.4" cy="197.67" r="33.59"/>
  </g>
</svg>
  );
}