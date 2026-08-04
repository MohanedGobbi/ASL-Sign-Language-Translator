/**
 * aslImages.js
 *
 * Background positions for the ASL fingerspelling sprite sheet used by the
 * Practice page. The sheet is a single public-domain photograph of the ASL
 * alphabet (User:Cwterp, Wikimedia Commons, "ABC pict just hands.png").
 *
 * The chart is arranged as a 5 × 6 grid. Each cell is exposed through CSS
 * background-position so the displayed hand is never cropped, shifted, or
 * cut off at the edges.
 *
 * Source: https://commons.wikimedia.org/wiki/File:ABC_pict_just_hands.png
 */

const COLS = 5;
const ROWS = 6;

const GRID = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y'],
  ['Z', null, null, null, null],
];

export const SPRITE_SHEET = '/asl/asl-alphabet-chart.png';

export const LETTER_BG_POSITION = {};

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const letter = GRID[r][c];
    if (!letter) continue;
    const xPct = (c * 100) / (COLS - 1);
    const yPct = (r * 100) / (ROWS - 1);
    LETTER_BG_POSITION[letter] = `${xPct}% ${yPct}%`;
  }
}

export const ASL_IMAGE_LETTERS = Object.keys(LETTER_BG_POSITION);
