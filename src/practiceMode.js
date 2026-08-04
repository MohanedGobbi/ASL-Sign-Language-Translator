/**
 * practiceMode.js
 * Practice mode controller: shows a target ASL letter and teaches the user
 * to sign it. Holding the correct sign steadily confirms it, scores a point,
 * and advances to the next letter.
 *
 * Exposes the mode interface used by appShell.js:
 *   { activate(), onDetection(result, nowMs), onStart(), onStop() }
 */

import { ASL_ALPHABET, LETTER_DESCRIPTIONS } from './aslClassifier.js';
import { LETTER_IMAGES } from './aslImages.js';

const $ = id => document.getElementById(id);

const HOLD_DURATION_MS = 800;    // hold the correct sign this long to confirm
const MATCH_CONFIDENCE = 0.5;    // min classifier confidence to count a match
const SUCCESS_PAUSE_MS = 900;    // celebration pause before the next letter

// J and Z require motion; the static classifier maps them to I/D,
// so they can't be practiced reliably.
const POOL = ASL_ALPHABET.filter(l => l !== 'J' && l !== 'Z');

export function createPracticeMode() {
  // ── DOM References ──
  const targetDisplay = $('practice-target-display');
  const targetImage   = $('target-image');
  const targetLetter  = $('target-letter');
  const targetCheck   = $('target-check');
  const targetHint    = $('target-hint');

  const scoreEl     = $('practice-score');
  const streakEl    = $('practice-streak');
  const completedEl = $('practice-completed');
  const skipBtn     = $('skip-btn');
  const grid        = $('practice-grid');

  const holdBar     = $('hold-bar');
  const holdPreview = $('hold-letter-preview');

  // ── State ──
  let target = null;
  let score  = 0;
  let streak = 0;
  const completed = new Set();

  let holding        = false;
  let holdStartMs    = 0;
  let cooldownUntil  = 0;

  // ── UI Helpers ──
  function buildGrid() {
    grid.innerHTML = POOL
      .map(l => `<div class="guide-letter-item" id="practice-grid-${l}" data-letter="${l}" title="Practice ${l}">${l}</div>`)
      .join('');
  }

  function updateStats() {
    scoreEl.textContent     = score;
    streakEl.textContent    = streak;
    completedEl.textContent = `${completed.size} / ${POOL.length}`;
  }

  function resetHold() {
    holding     = false;
    holdStartMs = 0;
    holdBar.style.width = '0%';
    holdPreview.textContent = '—';
  }

  function setTarget(letter) {
    target = letter;
    targetLetter.textContent = target;
    targetHint.textContent   = LETTER_DESCRIPTIONS[target] || '';
    targetImage.innerHTML    = target
      ? `<img src="${LETTER_IMAGES[target]}" alt="ASL hand sign for ${target}" class="target-hand-img">`
      : '';

    targetCheck.classList.add('hidden');

    // Highlight the active target in the grid
    grid.querySelectorAll('.guide-letter-item.current').forEach(el =>
      el.classList.remove('current')
    );
    $(`practice-grid-${target}`)?.classList.add('current');

    resetHold();
  }

  function nextTarget() {
    let next;
    do {
      next = POOL[Math.floor(Math.random() * POOL.length)];
    } while (next === target && POOL.length > 1);

    setTarget(next);
  }

  function onCorrect() {
    score++;
    streak++;
    completed.add(target);
    updateStats();

    const gridItem = $(`practice-grid-${target}`);
    if (gridItem) gridItem.classList.add('completed');

    // Success feedback: show ✓ and flash the target card
    targetCheck.classList.remove('hidden');
    targetDisplay.classList.remove('practice-success');
    void targetDisplay.offsetWidth; // reflow to restart the animation
    targetDisplay.classList.add('practice-success');

    resetHold();
    cooldownUntil = performance.now() + SUCCESS_PAUSE_MS;
  }

  // ── Event Listeners ──
  skipBtn.addEventListener('click', () => {
    streak = 0;
    updateStats();
    nextTarget();
  });

  // Click a letter in the grid to practice it directly
  grid.addEventListener('click', e => {
    const item = e.target.closest('.guide-letter-item');
    if (!item || !POOL.includes(item.dataset.letter)) return;
    if (item.dataset.letter === target) return;
    streak = 0; // switching targets manually breaks the streak, same as Skip
    updateStats();
    setTarget(item.dataset.letter);
  });

  // ── Mode Interface ──
  function activate() {
    resetHold();
    if (!target) nextTarget();
  }

  function onDetection(result, nowMs) {
    // Celebration pause – ignore input briefly after a correct sign
    if (nowMs < cooldownUntil) return;

    if (result && result.letter === target && result.confidence >= MATCH_CONFIDENCE) {
      if (!holding) {
        holding     = true;
        holdStartMs = nowMs;
        holdPreview.textContent = target;
      }
      const progress = Math.min(1, (nowMs - holdStartMs) / HOLD_DURATION_MS);
      holdBar.style.width = `${progress * 100}%`;

      if (progress >= 1) onCorrect();
    } else {
      resetHold();
    }
  }

  function onStart() {}
  function onStop() { resetHold(); }

  // ── Init ──
  buildGrid();
  updateStats();
  nextTarget(); // show a target immediately, even before the camera starts

  return { activate, onDetection, onStart, onStop };
}
