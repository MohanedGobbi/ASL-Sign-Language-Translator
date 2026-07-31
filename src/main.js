/**
 * main.js
 * Orchestrates the SignSpeak ASL translator:
 *  - Camera + MediaPipe hand tracking
 *  - ASL letter classification
 *  - Hold-to-confirm (0.8 s) letter buffering
 *  - Sentence building with word history
 *  - Web Speech API text-to-speech
 */

import { HandTracker }           from './handTracker.js';
import { classifyASL, ASL_ALPHABET } from './aslClassifier.js';
import { Renderer }              from './renderer.js';

// ── DOM References ────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);

const video          = $('video');
const canvas         = $('canvas');
const startBtn       = $('start-btn');
const stopBtn        = $('stop-btn');
const startOverlay   = $('start-overlay');
const loadingOverlay = $('loading-overlay');
const loadingStatus  = $('loading-status');

const camStatus      = $('cam-status');
const trackerStatus  = $('tracker-status');
const handsCount     = $('hands-count');
const detectedSmall  = $('detected-letter-small');
const confidenceVal  = $('confidence-value');
const fpsDisplay     = $('fps-display');

const letterOverlay  = $('letter-overlay');
const currentLetter  = $('current-letter');
const confidencePct  = $('confidence-pct');
const ringCircle     = $('ring-circle');
const wordBar        = $('word-bar');
const currentWordEl  = $('current-word-display');

const sentenceDisplay = $('sentence-display');
const sentencePlaceholder = $('sentence-placeholder');
const speakBtn       = $('speak-btn');
const backspaceBtn   = $('backspace-btn');
const spaceBtn       = $('space-btn');
const clearBtn       = $('clear-btn');

const altsList       = $('alternatives-list');
const holdBar        = $('hold-bar');
const holdPreview    = $('hold-letter-preview');

const historyList    = $('history-list');
const speakAllBtn    = $('speak-all-btn');

const guideGrid      = $('guide-grid');

// ── Constants ─────────────────────────────────────────────────────────────────
const HOLD_DURATION_MS     = 800;   // hold steady for this long to confirm a letter
const MIN_CONFIDENCE       = 0.40;  // below this, don't show/count a detection
const RING_CIRCUMFERENCE   = 213.6; // 2π × r=34

// ── State ─────────────────────────────────────────────────────────────────────
const tracker  = new HandTracker();
const renderer = new Renderer(canvas);

let stream         = null;
let rafId          = null;
let running        = false;

let sentence       = '';         // accumulated text
let currentWord    = '';         // letters being built into a word
let wordHistory    = [];         // list of completed words

// Hold-to-confirm state
let holdLetter     = null;
let holdStartMs    = 0;

// FPS tracking
let lastFpsTime = performance.now();
let frameCount  = 0;

// ── UI Helpers ────────────────────────────────────────────────────────────────
function setBadge(el, text, cls) {
  el.textContent = text;
  el.className   = `status-badge ${cls}`;
}

function updateSentenceUI() {
  const hasText = sentence.trim().length > 0 || currentWord.length > 0;
  const full    = sentence + currentWord;

  if (full.length > 0) {
    sentenceDisplay.textContent = full;
    sentencePlaceholder.style.display = 'none';
  } else {
    sentencePlaceholder.style.display = '';
    sentenceDisplay.textContent = '';
  }

  const hasAny = full.length > 0;
  speakBtn.disabled     = !hasAny;
  backspaceBtn.disabled = !hasAny;
  clearBtn.disabled     = !hasAny;
  spaceBtn.disabled     = !running;
}

function updateWordBar() {
  currentWordEl.textContent = currentWord;
}

function addLetterToWord(letter) {
  currentWord += letter;
  updateWordBar();
  updateSentenceUI();

  // Pop animation on big overlay letter
  currentLetter.classList.remove('letter-confirm');
  void currentLetter.offsetWidth; // reflow
  currentLetter.classList.add('letter-confirm');
}

function commitWord() {
  if (currentWord.length === 0) return;
  sentence += (sentence.length > 0 ? ' ' : '') + currentWord;
  wordHistory.push(currentWord);
  currentWord = '';
  updateWordBar();
  updateSentenceUI();
  renderHistory();
}

function renderHistory() {
  const empty = $('history-empty');
  if (empty) empty.remove();

  // Only show last 12 words
  const words = wordHistory.slice(-12);
  historyList.innerHTML = words
    .map(w => `<span class="history-word" title="${w}">${w}</span>`)
    .join('');
  speakAllBtn.disabled = wordHistory.length === 0;
}

// ── Confidence Ring ───────────────────────────────────────────────────────────
function setConfidenceRing(conf) {
  const offset  = RING_CIRCUMFERENCE * (1 - conf);
  ringCircle.style.strokeDashoffset = offset;
  confidencePct.textContent = Math.round(conf * 100) + '%';

  // Colour shift: red→yellow→green based on confidence
  if (conf < 0.5)       ringCircle.style.stroke = '#f472b6'; // pink/low
  else if (conf < 0.7)  ringCircle.style.stroke = '#fbbf24'; // yellow/mid
  else                  ringCircle.style.stroke = '#818cf8'; // indigo/high
}

// ── ASL Reference Grid ────────────────────────────────────────────────────────
function buildGuideGrid() {
  guideGrid.innerHTML = ASL_ALPHABET.map(l =>
    `<div class="guide-letter-item" id="guide-${l}">${l}</div>`
  ).join('');
}

function highlightGuideLetter(letter) {
  // Clear previous
  document.querySelectorAll('.guide-letter-item.active').forEach(el =>
    el.classList.remove('active')
  );
  if (letter) {
    const el = $(`guide-${letter}`);
    if (el) el.classList.add('active');
  }
}

// ── Alternatives List ─────────────────────────────────────────────────────────
function renderAlternatives(alts, topScore) {
  if (!alts || alts.length === 0) {
    altsList.innerHTML = '<div class="alt-item empty">No clear match</div>';
    return;
  }
  altsList.innerHTML = alts.map((a, i) => `
    <div class="alt-item ${i === 0 ? 'rank-1' : ''}">
      <span class="alt-letter">${a.letter}</span>
      <span class="alt-label">${getLetterDescription(a.letter)}</span>
      <div class="alt-bar-wrap">
        <div class="alt-bar" style="width:${Math.round(a.score * 100)}%"></div>
      </div>
    </div>
  `).join('');
}

function getLetterDescription(l) {
  const desc = {
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
  return desc[l] || '';
}

// ── Hold-to-Confirm ───────────────────────────────────────────────────────────
function updateHold(detectedLetter, confidence, nowMs) {
  if (!detectedLetter || confidence < MIN_CONFIDENCE) {
    // Reset hold
    holdLetter   = null;
    holdStartMs  = 0;
    holdBar.style.width = '0%';
    holdPreview.textContent = '—';
    return;
  }

  if (detectedLetter !== holdLetter) {
    // New letter, restart timer
    holdLetter  = detectedLetter;
    holdStartMs = nowMs;
    holdBar.style.width = '0%';
    holdPreview.textContent = detectedLetter;
    return;
  }

  // Same letter – advance hold timer
  const elapsed  = nowMs - holdStartMs;
  const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
  holdBar.style.width = `${progress * 100}%`;

  if (progress >= 1) {
    // ✅ CONFIRMED – add letter
    addLetterToWord(detectedLetter);
    holdLetter  = null;
    holdStartMs = 0;
    holdBar.style.width = '0%';
  }
}

// ── FPS Counter ───────────────────────────────────────────────────────────────
function tickFPS() {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    fpsDisplay.textContent = `${frameCount} fps`;
    frameCount  = 0;
    lastFpsTime = now;
  }
}

// ── Main Detection Loop ───────────────────────────────────────────────────────
function loop() {
  if (!running) return;
  const now = performance.now();

  renderer.sync(video);
  renderer.clear();

  const results = tracker.detect(video);

  let bestResult = null;

  if (results && results.landmarks.length > 0) {
    handsCount.textContent = results.landmarks.length;

    results.landmarks.forEach((landmarks, i) => {
      const handedness = results.handednesses[i]?.[0]?.displayName ?? 'Right';
      const classification = classifyASL(landmarks, handedness);

      renderer.drawHand(
        landmarks,
        handedness,
        classification.confidence >= MIN_CONFIDENCE ? classification.letter : null,
        classification.confidence,
      );

      // Use the first (or highest confidence) hand for UI
      if (!bestResult || classification.confidence > bestResult.confidence) {
        bestResult = { ...classification, handedness };
      }
    });
  } else {
    handsCount.textContent = '0';
  }

  // ── Update UI with best detection ──
  if (bestResult && bestResult.confidence >= MIN_CONFIDENCE) {
    const { letter, confidence, alternatives } = bestResult;

    // Big letter overlay
    if (currentLetter.textContent !== letter) {
      currentLetter.classList.remove('letter-pop');
      void currentLetter.offsetWidth;
      currentLetter.classList.add('letter-pop');
    }
    currentLetter.textContent = letter;
    setConfidenceRing(confidence);

    detectedSmall.textContent = letter;
    confidenceVal.textContent = Math.round(confidence * 100) + '%';

    highlightGuideLetter(letter);
    renderAlternatives(alternatives, confidence);
    updateHold(letter, confidence, now);

    letterOverlay.classList.remove('hidden');
    wordBar.classList.remove('hidden');
  } else {
    // No confident detection
    letterOverlay.classList.add('hidden');
    if (currentWord.length === 0) wordBar.classList.add('hidden');

    detectedSmall.textContent = '—';
    confidenceVal.textContent = '—';
    setConfidenceRing(0);
    highlightGuideLetter(null);
    renderAlternatives([], 0);
    updateHold(null, 0, now);
  }

  tickFPS();
  rafId = requestAnimationFrame(loop);
}

// ── Camera Setup ──────────────────────────────────────────────────────────────
async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    audio: false,
  });
  video.srcObject = stream;
  await new Promise(res => video.addEventListener('loadedmetadata', res, { once: true }));
  video.play();
  video.classList.add('visible');
  setBadge(camStatus, 'Active', 'on');
}

// ── Start / Stop ──────────────────────────────────────────────────────────────
async function startApp() {
  startOverlay.classList.add('hidden');
  loadingOverlay.classList.remove('hidden');

  try {
    loadingStatus.textContent = 'Starting camera…';
    await startCamera();

    loadingStatus.textContent = 'Loading MediaPipe hand model…';
    await tracker.init(msg => { loadingStatus.textContent = msg; });

    setBadge(trackerStatus, 'Ready', 'ready');
    loadingOverlay.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    spaceBtn.disabled = false;

    running = true;
    loop();

  } catch (err) {
    console.error(err);
    loadingOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    alert(`Error: ${err.message}\n\nPlease allow camera access and reload the page.`);
  }
}

function stopApp() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  video.classList.remove('visible');
  setBadge(camStatus, 'Off', '');
  startOverlay.classList.remove('hidden');
  stopBtn.classList.add('hidden');
  letterOverlay.classList.add('hidden');
  wordBar.classList.add('hidden');
  spaceBtn.disabled = true;
}

// ── Text-to-Speech ────────────────────────────────────────────────────────────
function speak(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 0.95;
  utt.pitch = 1.0;
  window.speechSynthesis.speak(utt);
}

// ── Event Listeners ───────────────────────────────────────────────────────────
startBtn.addEventListener('click', startApp);
stopBtn.addEventListener('click', stopApp);

speakBtn.addEventListener('click', () => {
  const text = (sentence + ' ' + currentWord).trim();
  speak(text);
});

speakAllBtn.addEventListener('click', () => {
  speak(wordHistory.join(' '));
});

backspaceBtn.addEventListener('click', () => {
  if (currentWord.length > 0) {
    currentWord = currentWord.slice(0, -1);
    updateWordBar();
  } else if (sentence.length > 0) {
    // Remove last word from sentence
    const words = sentence.trimEnd().split(' ');
    words.pop();
    sentence    = words.join(' ');
    currentWord = '';
  }
  updateSentenceUI();
});

spaceBtn.addEventListener('click', () => {
  if (currentWord.length > 0) commitWord();
  else if (sentence.length > 0) sentence += ' ';
  updateSentenceUI();
});

clearBtn.addEventListener('click', () => {
  sentence    = '';
  currentWord = '';
  wordHistory = [];
  updateWordBar();
  updateSentenceUI();
  historyList.innerHTML = '<span class="history-empty">Words will appear here as you sign…</span>';
  speakAllBtn.disabled = true;
});

// History word click: speak that word
historyList.addEventListener('click', e => {
  const word = e.target.closest('.history-word');
  if (word) speak(word.textContent);
});

// ── Init ──────────────────────────────────────────────────────────────────────
buildGuideGrid();
updateSentenceUI();
