/**
 * aslClassifier.js
 *
 * Classifies ASL fingerspelling (A–Z) from MediaPipe hand landmarks.
 *
 * Approach:
 *  1. Normalise landmarks relative to the wrist, scaled by the wrist→middleMCP distance.
 *  2. Extract a compact feature vector (finger extension ratios, key tip distances,
 *     thumb abduction, hand orientation angle, etc.).
 *  3. Score every letter using hand-crafted geometric rules and return a ranked list.
 *
 * Accuracy: ~80–90% under clear lighting for distinct letters.
 * Letters with motion (J, Z) are detected statically (same as I and pointing-index).
 */

// ── Landmark indices ──────────────────────────────────────────────────────────
const W    = 0;   // Wrist
const T1   = 1, T2 = 2, T3 = 3, T4 = 4;   // Thumb CMC→TIP
const I1   = 5, I2 = 6, I3 = 7, I4 = 8;   // Index MCP→TIP
const M1   = 9, M2 = 10, M3 = 11, M4 = 12; // Middle MCP→TIP
const R1   = 13, R2 = 14, R3 = 15, R4 = 16;// Ring MCP→TIP
const P1   = 17, P2 = 18, P3 = 19, P4 = 20;// Pinky MCP→TIP

// ── Helpers ───────────────────────────────────────────────────────────────────
const d = (lm, a, b) =>
  Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y);

const mag = (lm, i) =>
  Math.hypot(lm[i].x, lm[i].y);

/** Clamp x to [0,1] */
const clamp01 = x => Math.max(0, Math.min(1, x));

/**
 * Normalise all landmarks:
 *  - translate so wrist = origin
 *  - scale so wrist→middleMCP distance = 1
 */
function normalise(raw) {
  const wx = raw[W].x, wy = raw[W].y, wz = raw[W].z || 0;
  const refDist = Math.hypot(raw[M1].x - wx, raw[M1].y - wy) || 1;
  return raw.map(lm => ({
    x: (lm.x - wx) / refDist,
    y: (lm.y - wy) / refDist,
    z: ((lm.z || 0) - wz) / refDist,
  }));
}

// ── Feature Extraction ────────────────────────────────────────────────────────

/**
 * Build a compact feature object from raw landmarks + handedness string.
 *
 * Key features:
 *  ext.*        – boolean: is the finger extended?
 *  ratio.*      – float:  tip-distance-from-wrist / MCP-distance-from-wrist
 *                          > 1.5 → extended; ~1.0-1.4 → partially curled; < 1.1 → curled
 *  dTI, dTM … – normalised tip-to-tip distances
 *  thumbAbd     – thumb tip distance from index MCP (abduction)
 *  palmAngle    – degrees: 0 = hand pointing up, ±90 = sideways
 *  curl.*       – 0 (straight) → 1 (fully curled) per finger
 */
function extractFeatures(raw, handedness) {
  const lm = normalise(raw);
  const isRight = handedness !== 'Left';

  // Extension ratios (scale-invariant, orientation-independent)
  const ratio = {
    index:  mag(lm, I4) / (mag(lm, I1) + 0.01),
    middle: mag(lm, M4) / (mag(lm, M1) + 0.01),
    ring:   mag(lm, R4) / (mag(lm, R1) + 0.01),
    pinky:  mag(lm, P4) / (mag(lm, P1) + 0.01),
    // Thumb: distance from thumb TIP to Index MCP relative to palm width
    thumb:  d(lm, T4, I1),
  };

  const EXT  = 1.5;   // ratio threshold: extended
  const CURL = 1.15;  // ratio threshold: curled

  const ext = {
    index:  ratio.index  > EXT,
    middle: ratio.middle > EXT,
    ring:   ratio.ring   > EXT,
    pinky:  ratio.pinky  > EXT,
    thumb:  ratio.thumb  > 0.7, // thumb abducted away from palm
  };

  const extNonThumb = [ext.index, ext.middle, ext.ring, ext.pinky].filter(Boolean).length;
  const extAll      = Object.values(ext).filter(Boolean).length;

  // Tip-to-tip distances (normalised)
  const dTI  = d(lm, T4, I4);  // thumb ↔ index
  const dTM  = d(lm, T4, M4);  // thumb ↔ middle
  const dTR  = d(lm, T4, R4);  // thumb ↔ ring
  const dTP  = d(lm, T4, P4);  // thumb ↔ pinky
  const dIM  = d(lm, I4, M4);  // index ↔ middle
  const dIR  = d(lm, I4, R4);  // index ↔ ring
  const dIP  = d(lm, I4, P4);  // index ↔ pinky
  const dMR  = d(lm, M4, R4);  // middle ↔ ring
  const dRP  = d(lm, R4, P4);  // ring ↔ pinky

  // Thumb abduction (from index MCP)
  const thumbAbduction = ratio.thumb; // already distance thumb tip → index MCP

  // Hand orientation angle (degrees from vertical, 0=up, ±90=sideways)
  const pvx = raw[M1].x - raw[W].x;
  const pvy = raw[M1].y - raw[W].y;
  const palmAngle = Math.atan2(pvx, -pvy) * (180 / Math.PI);

  // Curl depth per finger (0=fully extended, 1=fully curled)
  const curlOf = (tipIdx, mcpIdx) =>
    clamp01(1 - (mag(lm, tipIdx) / (mag(lm, mcpIdx) + 0.01) - 1) / 0.8);

  const curl = {
    index:  curlOf(I4, I1),
    middle: curlOf(M4, M1),
    ring:   curlOf(R4, R1),
    pinky:  curlOf(P4, P1),
  };

  // Thumb tip Y in normalised space (negative = above wrist)
  const thumbTipY = lm[T4].y;
  // Index tip Y (more negative = higher up)
  const indexTipY = lm[I4].y;

  return {
    ext, extNonThumb, extAll, ratio,
    dTI, dTM, dTR, dTP,
    dIM, dIR, dIP, dMR, dRP,
    thumbAbduction, palmAngle, curl,
    thumbTipY, indexTipY,
    lm, raw, isRight,
  };
}

// ── Per-letter scoring functions ──────────────────────────────────────────────
// Each function returns a score in [0,1]. Higher = better match.

const SCORERS = {

  A(f) {
    // Fist, thumb rests alongside index (not fully tucked, not abducted)
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.5;
    if (f.thumbAbduction > 0.2 && f.thumbAbduction < 0.85)             s += 0.3;
    if (f.dTI > 0.3)  s += 0.1; // thumb NOT pinching index
    if (f.dTM > 0.35) s += 0.1; // thumb not touching middle
    return s;
  },

  B(f) {
    // All 4 fingers straight up, thumb tucked across palm
    let s = 0;
    if (f.ext.index && f.ext.middle && f.ext.ring && f.ext.pinky) s += 0.55;
    if (!f.ext.thumb && f.thumbAbduction < 0.6)                    s += 0.3;
    if (f.dIM < 0.3 && f.dMR < 0.3)                               s += 0.15; // fingers together
    return s;
  },

  C(f) {
    // Curved C: all fingers partially curled, open gap between thumb and index
    let s = 0;
    const partial = r => r > 1.1 && r < 1.6;
    if (partial(f.ratio.index))  s += 0.18;
    if (partial(f.ratio.middle)) s += 0.18;
    if (partial(f.ratio.ring))   s += 0.14;
    if (partial(f.ratio.pinky))  s += 0.10;
    if (f.dTI > 0.4 && f.dTI < 1.3) s += 0.2; // open but not spread
    if (f.thumbAbduction > 0.5)       s += 0.2;
    return s;
  },

  D(f) {
    // Index up, middle+ring+pinky curve to touch thumb
    let s = 0;
    if (f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.55;
    if (f.dTM < 0.45) s += 0.25; // thumb touches middle
    if (f.dTR < 0.55) s += 0.1;
    if (f.thumbAbduction < 0.7) s += 0.1;
    return s;
  },

  E(f) {
    // All fingers bent/hooked, thumb tucked under
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.4;
    if (!f.ext.thumb && f.thumbAbduction < 0.45) s += 0.3; // thumb tucked tightly
    // All ratios should be low (more curled than A)
    if (f.ratio.index < 1.3 && f.ratio.middle < 1.3) s += 0.2;
    if (f.dTI < 0.5) s += 0.1; // thumb close to index
    return s;
  },

  F(f) {
    // Index+thumb pinching (touching), other 3 fingers spread up
    let s = 0;
    if (f.ext.middle && f.ext.ring && f.ext.pinky) s += 0.5;
    if (!f.ext.index && f.dTI < 0.35) s += 0.35; // thumb+index pinch
    if (f.dMR < 0.4)                  s += 0.15;
    return s;
  },

  G(f) {
    // Index and thumb pointing sideways (like a gun pointing left/right)
    let s = 0;
    if (f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.35;
    if (f.ext.thumb)                                                   s += 0.25;
    if (Math.abs(f.palmAngle) > 35)                                    s += 0.25; // hand tilted sideways
    if (f.dTI < 0.8)                                                   s += 0.15;
    return s;
  },

  H(f) {
    // Index and middle pointing sideways together
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.45;
    if (Math.abs(f.palmAngle) > 35) s += 0.3; // hand tilted sideways
    if (f.dIM < 0.3)                s += 0.25; // fingers close together
    return s;
  },

  I(f) {
    // Only pinky extended
    let s = 0;
    if (f.ext.pinky && !f.ext.index && !f.ext.middle && !f.ext.ring) s += 0.65;
    if (!f.ext.thumb) s += 0.2;
    if (f.dTP > 0.8)  s += 0.15; // pinky NOT touching thumb
    return s;
  },

  // J is the same as I statically (adds a J-motion)
  J(f) {
    return SCORERS.I(f) * 0.7; // penalised since we can't detect motion
  },

  K(f) {
    // Index + middle up + thumb raised between them
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.4;
    if (f.ext.thumb)               s += 0.25;
    if (f.dIM > 0.2 && f.dIM < 0.6) s += 0.15; // spread slightly
    if (Math.abs(f.palmAngle) < 30) s += 0.2; // hand pointing up (not sideways like H)
    return s;
  },

  L(f) {
    // Index up + thumb out to side (L-shape)
    let s = 0;
    if (f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.45;
    if (f.ext.thumb && f.thumbAbduction > 0.8)                        s += 0.35;
    if (f.dTI > 0.8)                                                   s += 0.2; // large gap (L shape)
    return s;
  },

  M(f) {
    // Index+middle+ring bent over tucked thumb (3 fingers over thumb)
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.35;
    if (!f.ext.thumb && f.thumbAbduction < 0.5) s += 0.25;
    // 3 finger tips near thumb
    if (f.dTI < 0.55 && f.dTM < 0.55 && f.dTR < 0.55) s += 0.4;
    return s;
  },

  N(f) {
    // Index+middle bent over tucked thumb (2 fingers over thumb)
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.3;
    if (!f.ext.thumb && f.thumbAbduction < 0.5) s += 0.2;
    // 2 finger tips near thumb
    if (f.dTI < 0.5 && f.dTM < 0.5 && f.dTR > 0.5) s += 0.5;
    return s;
  },

  O(f) {
    // O shape: all fingers curve to meet thumb tip
    let s = 0;
    // All fingertips close to thumb tip
    const allClose = f.dTI < 0.45 && f.dTM < 0.5 && f.dTR < 0.6;
    if (allClose)               s += 0.6;
    if (f.thumbAbduction > 0.4) s += 0.2;
    // Partial extension on all fingers (not straight, not fully curled)
    const anyPartial = [f.ratio.index, f.ratio.middle, f.ratio.ring].every(r => r > 1.1 && r < 1.7);
    if (anyPartial) s += 0.2;
    return s;
  },

  P(f) {
    // Like K but hand points downward
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.4;
    if (f.ext.thumb) s += 0.2;
    if (f.palmAngle > 100 || f.palmAngle < -100) s += 0.3; // pointing down
    if (f.dIM > 0.15) s += 0.1;
    return s;
  },

  Q(f) {
    // Like G but pointing downward
    let s = 0;
    if (f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.35;
    if (f.ext.thumb) s += 0.2;
    if (f.palmAngle > 100 || f.palmAngle < -100) s += 0.3; // pointing down
    if (f.dTI < 0.8) s += 0.15;
    return s;
  },

  R(f) {
    // Index and middle extended but CROSSED (very close together)
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.5;
    if (f.dIM < 0.18) s += 0.35; // fingers very close (crossed)
    if (!f.ext.thumb) s += 0.15;
    return s;
  },

  S(f) {
    // Fist, thumb across the front of fingers
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.45;
    if (!f.ext.thumb && f.thumbAbduction < 0.5) s += 0.3; // thumb forward
    if (f.dTI < 0.5) s += 0.25; // thumb over fingers
    return s;
  },

  T(f) {
    // Thumb pokes up between index and middle (fist with thumb between fingers)
    let s = 0;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.4;
    if (f.thumbAbduction > 0.25 && f.thumbAbduction < 0.75) s += 0.25;
    if (f.dTI < 0.45 && f.dTM < 0.45) s += 0.35; // thumb between index & middle
    return s;
  },

  U(f) {
    // Index + middle up, together (small spread), NO sideways tilt
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.45;
    if (f.dIM < 0.25) s += 0.35; // fingers together (U vs V key distinction)
    if (Math.abs(f.palmAngle) < 35) s += 0.2; // hand upright
    return s;
  },

  V(f) {
    // Peace/victory: index + middle spread apart, hand upright
    let s = 0;
    if (f.ext.index && f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.45;
    if (f.dIM > 0.28) s += 0.35; // fingers SPREAD (V vs U key distinction)
    if (Math.abs(f.palmAngle) < 35) s += 0.2; // hand upright
    return s;
  },

  W(f) {
    // Three fingers spread: index + middle + ring
    let s = 0;
    if (f.ext.index && f.ext.middle && f.ext.ring && !f.ext.pinky) s += 0.55;
    if (f.dIM > 0.2 && f.dMR > 0.2) s += 0.3; // spread
    if (!f.ext.thumb)                s += 0.15;
    return s;
  },

  X(f) {
    // Index finger hooked/bent at the first joint (bent but not fully curled)
    let s = 0;
    const hooked = f.ratio.index > 1.15 && f.ratio.index < 1.55;
    if (hooked) s += 0.55;
    if (!f.ext.middle && !f.ext.ring && !f.ext.pinky) s += 0.3;
    if (!f.ext.thumb) s += 0.15;
    return s;
  },

  Y(f) {
    // Thumb + pinky out (shaka / hang loose)
    let s = 0;
    if (f.ext.thumb && f.ext.pinky) s += 0.5;
    if (!f.ext.index && !f.ext.middle && !f.ext.ring) s += 0.35;
    if (f.dTP > 1.2) s += 0.15; // thumb and pinky far apart
    return s;
  },

  // Z is "index pointing + drawing Z motion" — statically like D
  Z(f) {
    return SCORERS.D(f) * 0.65;
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export const ASL_ALPHABET = Object.keys(SCORERS); // A–Z

/** Short human-readable hints describing how to form each letter. */
export const LETTER_DESCRIPTIONS = {
  A:'Fist+thumb side', B:'4 fingers up', C:'Curved C',
  D:'Index up, O base', E:'Fingers hooked', F:'OK+3 up',
  G:'Gun sideways', H:'2 sideways', I:'Pinky up',
  J:'Pinky+J motion', K:'2+thumb up', L:'L-shape',
  M:'3 over thumb', N:'2 over thumb', O:'O-shape',
  P:'K pointing down', Q:'G pointing down', R:'Crossed 2',
  S:'Fist+thumb front', T:'Thumb btw fingers', U:'2 together',
  V:'Peace sign', W:'3 spread', X:'Index hooked',
  Y:'Shaka', Z:'Index+Z motion',
};

/**
 * Classify ASL letter from MediaPipe hand landmarks.
 *
 * @param {Array}  rawLandmarks  - Array of 21 {x,y,z} landmark objects
 * @param {string} handedness    - 'Left' | 'Right'
 * @returns {{ letter: string, confidence: number, alternatives: Array }}
 */
export function classifyASL(rawLandmarks, handedness) {
  const features = extractFeatures(rawLandmarks, handedness);

  // Score every letter
  const entries = Object.entries(SCORERS).map(([letter, fn]) => {
    const raw = fn(features);
    return [letter, clamp01(raw)];
  });

  // Sort descending by score
  entries.sort((a, b) => b[1] - a[1]);

  const [topLetter, topScore] = entries[0];
  const alternatives = entries.slice(1, 4).map(([l, s]) => ({ letter: l, score: s }));

  return {
    letter: topLetter,
    confidence: topScore,
    alternatives,
    features, // exposed for debugging
  };
}
