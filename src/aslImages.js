/**
 * aslImages.js
 *
 * Paths to the photographed ASL fingerspelling hand images stored in
 * public/asl/. These are used by the Practice page to show a real hand
 * picture for the target letter.
 *
 * Images are cropped from the public-domain Wikimedia Commons file
 * "ABC pict just hands.png" (User:Cwterp, public domain).
 * Source: https://commons.wikimedia.org/wiki/File:ABC_pict_just_hands.png
 */

export const LETTER_IMAGES = {
  A: '/asl/A.png', B: '/asl/B.png', C: '/asl/C.png', D: '/asl/D.png',
  E: '/asl/E.png', F: '/asl/F.png', G: '/asl/G.png', H: '/asl/H.png',
  I: '/asl/I.png', J: '/asl/J.png', K: '/asl/K.png', L: '/asl/L.png',
  M: '/asl/M.png', N: '/asl/N.png', O: '/asl/O.png', P: '/asl/P.png',
  Q: '/asl/Q.png', R: '/asl/R.png', S: '/asl/S.png', T: '/asl/T.png',
  U: '/asl/U.png', V: '/asl/V.png', W: '/asl/W.png', X: '/asl/X.png',
  Y: '/asl/Y.png', Z: '/asl/Z.png',
};

export const ASL_IMAGE_LETTERS = Object.keys(LETTER_IMAGES);
