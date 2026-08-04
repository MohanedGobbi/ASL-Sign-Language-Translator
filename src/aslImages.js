/**
 * aslImages.js
 *
 * Paths to the user-provided ASL fingerspelling screenshots stored in
 * public/asl/. Each letter maps to the corresponding image file.
 *
 * J and Z are not included because they require motion in ASL and are
 * excluded from the practice pool.
 */

export const LETTER_IMAGES = {
  A: '/asl/A.jpg', B: '/asl/B.jpg', C: '/asl/C.jpg', D: '/asl/D.jpg',
  E: '/asl/E.jpg', F: '/asl/F.jpg', G: '/asl/G.jpg', H: '/asl/H.jpg',
  I: '/asl/I.jpg', K: '/asl/K.jpg', L: '/asl/L.jpg', M: '/asl/M.jpg',
  N: '/asl/N.jpg', O: '/asl/O.jpg', P: '/asl/P.jpg', Q: '/asl/Q.jpg',
  R: '/asl/R.jpg', S: '/asl/S.jpg', T: '/asl/T.jpg', U: '/asl/U.jpg',
  V: '/asl/V.jpg', W: '/asl/W.jpg', X: '/asl/X.jpg', Y: '/asl/Y.jpg',
};

export const ASL_IMAGE_LETTERS = Object.keys(LETTER_IMAGES);
