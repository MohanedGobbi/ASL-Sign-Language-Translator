/**
 * translateMode.js
 * Translate mode controller: hold-to-confirm letter buffering,
 * sentence building with word history, and Web Speech API text-to-speech.
 *
 * Exposes the mode interface used by appShell.js:
 *   { activate(), onDetection(result, nowMs), onStart(), onStop() }
 */

const $ = id => document.getElementById(id);

const HOLD_DURATION_MS = 800;   // hold steady for this long to confirm a letter

export function createTranslateMode() {
  // ── DOM References ──
  const wordBar       = $('word-bar');
  const currentWordEl = $('current-word-display');
  const currentLetter = $('current-letter');

  const sentenceDisplay     = $('sentence-display');
  const sentencePlaceholder = $('sentence-placeholder');
  const speakBtn            = $('speak-btn');
  const backspaceBtn        = $('backspace-btn');
  const spaceBtn            = $('space-btn');
  const clearBtn            = $('clear-btn');

  const holdBar     = $('hold-bar');
  const holdPreview = $('hold-letter-preview');

  const historyList = $('history-list');
  const speakAllBtn = $('speak-all-btn');

  // ── State ──
  let sentence    = '';   // accumulated text
  let currentWord = '';   // letters being built into a word
  let wordHistory = [];   // list of completed words

  // Hold-to-confirm state
  let holdLetter  = null;
  let holdStartMs = 0;

  // ── UI Helpers ──
  function updateSentenceUI() {
    const full = sentence + currentWord;

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

  // ── Hold-to-Confirm ──
  function resetHold() {
    holdLetter  = null;
    holdStartMs = 0;
    holdBar.style.width = '0%';
    holdPreview.textContent = '—';
  }

  function updateHold(detectedLetter, nowMs) {
    if (!detectedLetter) {
      resetHold();
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
      resetHold();
    }
  }

  // ── Text-to-Speech ──
  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.95;
    utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  }

  // ── Event Listeners ──
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
    historyList.innerHTML = '<span class="history-empty" id="history-empty">Words will appear here as you sign…</span>';
    speakAllBtn.disabled = true;
  });

  // History word click: speak that word
  historyList.addEventListener('click', e => {
    const word = e.target.closest('.history-word');
    if (word) speak(word.textContent);
  });

  // ── Mode Interface ──
  function activate() {
    resetHold();
    if (currentWord.length > 0) wordBar.classList.remove('hidden');
  }

  function onDetection(result, nowMs) {
    if (result) {
      wordBar.classList.remove('hidden');
      updateHold(result.letter, nowMs);
    } else {
      if (currentWord.length === 0) wordBar.classList.add('hidden');
      updateHold(null, nowMs);
    }
  }

  function onStart() {
    spaceBtn.disabled = false;
  }

  function onStop() {
    spaceBtn.disabled = true;
    wordBar.classList.add('hidden');
    resetHold();
  }

  // ── Init ──
  updateSentenceUI();

  return { activate, onDetection, onStart, onStop };
}
