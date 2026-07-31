/**
 * renderer.js
 * Draws hand landmarks using the neobrutalism palette.
 * Right hand: secondary blue (#432DD7) | Left hand: success green (#16A34A)
 */

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],         // Thumb
  [0,5],[5,6],[6,7],[7,8],         // Index
  [0,9],[9,10],[10,11],[11,12],    // Middle
  [0,13],[13,14],[14,15],[15,16],  // Ring
  [0,17],[17,18],[18,19],[19,20],  // Pinky
  [5,9],[9,13],[13,17],[0,17],     // Palm
];

const FINGERTIPS = new Set([4, 8, 12, 16, 20]);

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  sync(video) {
    const w = video.videoWidth  || this.canvas.clientWidth;
    const h = video.videoHeight || this.canvas.clientHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width  = w;
      this.canvas.height = h;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawHand(landmarks, handedness, letter, confidence) {
    const ctx   = this.ctx;
    const W     = this.canvas.width;
    const H     = this.canvas.height;
    const right = handedness === 'Right';

    // Neobrutalism palette applied to the canvas overlay
    const bone   = right ? '#432DD7' : '#16A34A';  // secondary / success
    const tip    = right ? '#FDC800' : '#FDC800';  // always primary yellow for tips
    const stroke = '#1C293C';                       // always dark for borders

    const px = lm => lm.x * W;
    const py = lm => lm.y * H;

    // ── Bones ──
    ctx.lineWidth   = 2.5;
    ctx.strokeStyle = bone + 'cc';
    CONNECTIONS.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(px(landmarks[a]), py(landmarks[a]));
      ctx.lineTo(px(landmarks[b]), py(landmarks[b]));
      ctx.stroke();
    });

    // ── Joints ──
    landmarks.forEach((lm, i) => {
      const x   = px(lm);
      const y   = py(lm);
      const isTip = FINGERTIPS.has(i);
      const r   = isTip ? 7 : 4;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle   = isTip ? tip : bone;
      ctx.strokeStyle = stroke;
      ctx.lineWidth   = isTip ? 2 : 1.5;
      ctx.fill();
      ctx.stroke();
    });

    // ── Confidence arc (square cap = brutalist) around wrist ──
    if (confidence > 0) {
      const wx    = px(landmarks[0]);
      const wy    = py(landmarks[0]);
      const arcR  = 26;
      const end   = (confidence * Math.PI * 2) - Math.PI / 2;

      ctx.beginPath();
      ctx.arc(wx, wy, arcR, -Math.PI / 2, end);
      ctx.strokeStyle = confidence > 0.65 ? tip : bone;
      ctx.lineWidth   = 4;
      ctx.lineCap     = 'square';
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    // ── Letter label (bold, brutalist) ──
    if (letter && confidence > 0.38) {
      const wx = px(landmarks[0]);
      const wy = py(landmarks[0]);

      // Badge background
      const label = ` ${letter} `;
      ctx.font = 'bold 20px JetBrains Mono, monospace';
      const tw = ctx.measureText(label).width;

      const bx = wx + 32;
      const by = wy - 12;
      const bh = 28;

      // Shadow (neobrutalism offset)
      ctx.fillStyle = stroke;
      ctx.fillRect(bx + 3, by + 3, tw + 4, bh);

      // Card
      ctx.fillStyle   = confidence > 0.65 ? tip : '#FFFFFF';
      ctx.strokeStyle = stroke;
      ctx.lineWidth   = 2;
      ctx.fillRect(bx, by, tw + 4, bh);
      ctx.strokeRect(bx, by, tw + 4, bh);

      ctx.fillStyle = stroke;
      ctx.fillText(label, bx + 2, by + 20);
    }
  }
}
