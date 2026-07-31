/**
 * handTracker.js
 * Wraps MediaPipe HandLandmarker for real-time hand detection from a video stream.
 */

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracker {
  constructor() {
    this._landmarker = null;
    this._lastVideoTime = -1;
    this._lastResults = null;
  }

  /** Load the HandLandmarker model. Call once before starting the loop. */
  async init(onProgress) {
    onProgress?.('Downloading MediaPipe WASM…');
    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);

    onProgress?.('Loading hand detection model…');
    this._landmarker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });

    onProgress?.('Ready!');
  }

  /**
   * Run detection on the current video frame.
   * Safe to call in a requestAnimationFrame loop.
   * @returns {import('@mediapipe/tasks-vision').HandLandmarkerResult | null}
   */
  detect(video) {
    if (!this._landmarker) return null;
    if (video.readyState < 2) return null;

    // Only process when a new frame is available
    if (video.currentTime !== this._lastVideoTime) {
      this._lastVideoTime = video.currentTime;
      this._lastResults = this._landmarker.detectForVideo(video, performance.now());
    }
    return this._lastResults;
  }
}
