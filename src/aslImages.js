/**
 * aslImages.js
 *
 * Simple stylised SVG illustrations of each ASL fingerspelling hand shape.
 * Used by the Practice page so the target letter is shown as a picture
 * alongside the text hint.
 *
 * Only the 24 static letters are drawn (J and Z are motion letters and are
 * not practised in this app).
 */

const PALM = '#FDC800';
const STROKE = '#1C293C';
const SW = 3;

function svg(content) {
  return `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">${content}</svg>`;
}

// A — closed fist, thumb resting on the side
const A = svg(`
  <rect x="38" y="35" width="44" height="82" rx="14" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 50 Q60 40 78 50" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M43 70 Q60 60 77 70" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M44 90 Q60 82 76 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q60 105 75 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <ellipse cx="30" cy="84" rx="9" ry="22" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// B — open palm facing forward, 4 fingers up, thumb tucked
const B = svg(`
  <rect x="35" y="30" width="50" height="88" rx="8" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="45" y1="38" x2="45" y2="100" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="57" y1="38" x2="57" y2="100" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="69" y1="38" x2="69" y2="100" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="81" y1="38" x2="81" y2="100" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <rect x="82" y="72" width="14" height="32" rx="4" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// C — curved C shape
const C = svg(`
  <path d="M92 48 C55 20 25 55 25 80 C25 110 55 130 92 112" fill="none" stroke="${PALM}" stroke-width="20" stroke-linecap="round"/>
  <path d="M92 48 C55 20 25 55 25 80 C25 110 55 130 92 112" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// D — index up, thumb and middle finger touch to make a circle
const D = svg(`
  <rect x="40" y="55" width="40" height="65" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="60" y1="55" x2="60" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <circle cx="60" cy="38" r="10" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M48 60 Q55 50 62 60" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M46 78 Q55 70 64 78" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M44 96 Q55 90 66 96" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <ellipse cx="88" cy="72" rx="9" ry="22" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// E — fingers curled/hooked, thumb tucked under
const E = svg(`
  <rect x="38" y="45" width="44" height="72" rx="12" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 55 Q60 48 78 55" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 75 Q60 68 78 75" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 95 Q60 88 78 95" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 115 Q60 108 78 115" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <ellipse cx="30" cy="88" rx="8" ry="18" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// F — index and thumb pinch, other 3 fingers up
const F = svg(`
  <rect x="35" y="55" width="50" height="65" rx="8" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="45" y1="55" x2="42" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="57" y1="55" x2="54" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="69" y1="55" x2="66" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <circle cx="72" cy="48" r="9" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="84" y1="55" x2="88" y2="35" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="80" y1="55" x2="82" y2="40" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// G — index and thumb pointing sideways (gun pointing right)
const G = svg(`
  <rect x="35" y="50" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="75" y1="60" x2="105" y2="60" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="75" y1="78" x2="98" y2="72" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 80 Q55 75 70 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 100 Q55 95 70 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 120 Q55 115 70 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// H — index and middle pointing sideways together
const H = svg(`
  <rect x="25" y="50" width="35" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="60" y1="60" x2="100" y2="60" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="60" y1="80" x2="100" y2="80" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M30 95 Q42 90 55 95" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M30 115 Q42 110 55 115" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// I — only pinky extended
const I = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="70" y1="55" x2="70" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 60 Q55 55 65 60" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 80 Q55 75 65 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 100 Q55 95 65 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// K — index + middle up in V, thumb up between them
const K = svg(`
  <rect x="40" y="70" width="40" height="55" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="50" y1="70" x2="40" y2="25" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="70" y1="70" x2="80" y2="25" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="60" y1="75" x2="60" y2="40" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 100 Q55 95 65 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 120 Q55 115 65 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// L — index up, thumb out to the side (L shape)
const L = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="60" y1="55" x2="60" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="80" y1="75" x2="105" y2="75" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 60 Q55 55 65 60" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 80 Q55 75 65 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 100 Q55 95 65 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// M — 3 fingers over tucked thumb
const M = svg(`
  <rect x="38" y="55" width="44" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 60 Q60 50 78 60" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 80 Q60 70 78 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 100 Q60 90 78 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <ellipse cx="60" cy="95" rx="10" ry="18" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// N — 2 fingers over tucked thumb
const N = svg(`
  <rect x="38" y="55" width="44" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 60 Q60 50 78 60" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 80 Q60 70 78 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 100 Q60 95 78 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 120 Q60 115 78 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <ellipse cx="60" cy="100" rx="10" ry="18" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// O — fingertips and thumb form an O
const O = svg(`
  <rect x="40" y="60" width="40" height="60" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <circle cx="60" cy="55" r="18" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M45 90 Q55 85 65 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q55 105 65 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// P — like K but pointing downward
const P = svg(`
  <rect x="40" y="55" width="40" height="55" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="50" y1="60" x2="40" y2="105" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="70" y1="60" x2="80" y2="105" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="60" y1="55" x2="60" y2="90" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// Q — like G but pointing downward
const Q = svg(`
  <rect x="35" y="50" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="75" y1="100" x2="105" y2="108" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="75" y1="82" x2="98" y2="88" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 80 Q55 75 70 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 100 Q55 95 70 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M40 120 Q55 115 70 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// R — crossed index and middle
const R = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="55" y1="55" x2="55" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="65" y1="55" x2="65" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="55" y1="35" x2="65" y2="30" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 90 Q55 85 65 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q55 105 65 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// S — fist with thumb across the front
const S = svg(`
  <rect x="38" y="35" width="44" height="82" rx="14" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 50 Q60 40 78 50" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M43 70 Q60 60 77 70" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M44 90 Q60 82 76 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q60 105 75 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <rect x="34" y="72" width="22" height="12" rx="4" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
`);

// T — thumb poking up between index and middle
const T = svg(`
  <rect x="38" y="45" width="44" height="72" rx="12" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M42 55 Q60 48 78 55" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 75 Q60 68 78 75" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 95 Q60 88 78 95" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M42 115 Q60 108 78 115" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="60" y1="45" x2="60" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// U — index + middle up, close together
const U = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="52" y1="55" x2="52" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="68" y1="55" x2="68" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 90 Q55 85 65 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q55 105 65 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// V — peace sign, index and middle spread
const V = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="48" y1="55" x2="40" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="72" y1="55" x2="80" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 90 Q55 85 65 90" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 110 Q55 105 65 110" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// W — 3 fingers spread
const W = svg(`
  <rect x="38" y="55" width="44" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="46" y1="55" x2="38" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="60" y1="55" x2="60" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="74" y1="55" x2="82" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M44 100 Q55 95 66 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M44 120 Q55 115 66 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// X — hooked index finger
const X = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <path d="M60 55 L55 35 L65 30" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M45 80 Q55 75 65 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 100 Q55 95 65 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 120 Q55 115 65 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

// Y — thumb and pinky out (shaka / hang loose)
const Y = svg(`
  <rect x="40" y="55" width="40" height="70" rx="10" fill="${PALM}" stroke="${STROKE}" stroke-width="${SW}"/>
  <line x1="70" y1="55" x2="70" y2="20" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <line x1="50" y1="75" x2="25" y2="70" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 80 Q55 75 65 80" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 100 Q55 95 65 100" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
  <path d="M45 120 Q55 115 65 120" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
`);

export const LETTER_IMAGES = {
  A, B, C, D, E, F, G, H, I, K, L, M,
  N, O, P, Q, R, S, T, U, V, W, X, Y,
};

export const ASL_IMAGE_LETTERS = Object.keys(LETTER_IMAGES);
