/**
 * appShell.js
 * Shared infrastructure for the SignSpeak app pages (Translate / Practice):
 *  - Camera + MediaPipe hand tracking
 *  - ASL letter classification + canvas rendering
 *  - Shared feedback UI (letter overlay, confidence ring, top matches, guide)
 *
 * Each app page calls initApp(mode) with its mode controller
 * (see translateMode.js / practiceMode.js). Per-frame detections are
 * routed to mode.onDetection(result, nowMs).
 */

import { HandTracker } from './handTracker.js';
import { classifyASL, ASL_ALPHABET, LETTER_DESCRIPTIONS } from './aslClassifier.js';
import { Renderer } from './renderer.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const MIN_CONFIDENCE       = 0.40;  // below this, don't show/count a detection
const RING_CIRCUMFERENCE   = 213.6; // 2π × r=34

/**
 * Boot the app page with the given mode controller.
 * @param {{ activate(): void, onDetection(result: object|null, nowMs: number): void,
 *           onStart(): void, onStop(): void }} mode
 */
export function initApp(mode) {
  // ── DOM References ──
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

  const altsList       = $('alternatives-list');
  const guideGrid      = $('guide-grid');

  // ── State ──
  const tracker  = new HandTracker();
  const renderer = new Renderer(canvas);

  let stream  = null;
  let rafId   = null;
  let running = false;

  // FPS tracking
  let lastFpsTime = performance.now();
  let frameCount  = 0;

  // ── UI Helpers ──
  function setBadge(el, text, cls) {
    el.textContent = text;
    el.className   = `status-badge ${cls}`;
  }

  // ── Confidence Ring ──
  function setConfidenceRing(conf) {
    const offset  = RING_CIRCUMFERENCE * (1 - conf);
    ringCircle.style.strokeDashoffset = offset;
    confidencePct.textContent = Math.round(conf * 100) + '%';

    // Colour shift: red→yellow→green based on confidence
    if (conf < 0.5)       ringCircle.style.stroke = '#f472b6'; // pink/low
    else if (conf < 0.7)  ringCircle.style.stroke = '#fbbf24'; // yellow/mid
    else                  ringCircle.style.stroke = '#818cf8'; // indigo/high
  }

  // ── ASL Reference Grid ──
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

  // ── Alternatives List ──
  function renderAlternatives(alts) {
    if (!alts || alts.length === 0) {
      altsList.innerHTML = '<div class="alt-item empty">No clear match</div>';
      return;
    }
    altsList.innerHTML = alts.map((a, i) => `
      <div class="alt-item ${i === 0 ? 'rank-1' : ''}">
        <span class="alt-letter">${a.letter}</span>
        <span class="alt-label">${LETTER_DESCRIPTIONS[a.letter] || ''}</span>
        <div class="alt-bar-wrap">
          <div class="alt-bar" style="width:${Math.round(a.score * 100)}%"></div>
        </div>
      </div>
    `).join('');
  }

  // ── FPS Counter ──
  function tickFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
      fpsDisplay.textContent = `${frameCount} fps`;
      frameCount  = 0;
      lastFpsTime = now;
    }
  }

  // ── Main Detection Loop ──
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

    const confident = bestResult && bestResult.confidence >= MIN_CONFIDENCE
      ? bestResult
      : null;

    // ── Update shared UI with best detection ──
    if (confident) {
      const { letter, confidence, alternatives } = confident;

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
      renderAlternatives(alternatives);

      letterOverlay.classList.remove('hidden');
    } else {
      // No confident detection
      letterOverlay.classList.add('hidden');

      detectedSmall.textContent = '—';
      confidenceVal.textContent = '—';
      setConfidenceRing(0);
      highlightGuideLetter(null);
      renderAlternatives([]);
    }

    // ── Route to the mode controller ──
    mode.onDetection(confident, now);

    tickFPS();
    rafId = requestAnimationFrame(loop);
  }

  // ── Camera Setup ──
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

  // ── Start / Stop ──
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

      mode.onStart();

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

    mode.onStop();
  }

  // ── Event Listeners ──
  startBtn.addEventListener('click', startApp);
  stopBtn.addEventListener('click', stopApp);

  // ── Init ──
  buildGuideGrid();
  mode.activate();
}
