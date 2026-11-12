import * as THREE from 'three';

/** Biểu cảm — theo tờ thiết kế Tiểu Mặc (6) + bình thường. */
export const EXPRESSIONS = ['binh', 'chao', 'doc', 'nghi', 'vui', 'dinh-muc', 'ngu'] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export interface FaceStyle {
  /** má hồng (Tiểu Mặc có, đệ tử không) */
  blush: boolean;
  ink: string;
  mouth: string;
  blushColor: string;
}

const W = 512;
const H = 256;

/**
 * Mặt vẽ bằng canvas (dán lên chỏm cầu phía trước đầu). Một canvas, vẽ lại khi đổi biểu cảm → đổi tức thì, không thêm
 * khối. Toạ độ: giữa ngang = 256; mắt ở ~45 % chiều cao.
 */
export class ChibiFace {
  readonly texture: THREE.CanvasTexture;
  private readonly g: CanvasRenderingContext2D;

  constructor(private readonly style: FaceStyle) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    this.g = c.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
  }

  draw(e: Expression): void {
    const g = this.g;
    const s = this.style;
    g.clearRect(0, 0, W, H);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const eyeY = 118;
    const eyeDX = 70;
    const cx = W / 2;
    const ink = s.ink;
    const dot = (x: number, y: number, r: number): void => {
      g.fillStyle = ink;
      g.beginPath();
      g.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffffff'; // ánh mắt
      g.beginPath();
      g.arc(x - r * 0.25, y - r * 0.35, r * 0.28, 0, Math.PI * 2);
      g.fill();
    };
    const arc = (x: number, y: number, w: number, up: boolean, lw = 7): void => {
      g.strokeStyle = ink;
      g.lineWidth = lw;
      g.beginPath();
      if (up) g.arc(x, y + w * 0.35, w, Math.PI * 1.15, Math.PI * 1.85); // ^ cười híp
      else g.arc(x, y - w * 0.35, w, Math.PI * 0.15, Math.PI * 0.85); // ‿ nhắm
      g.stroke();
    };
    const line = (x1: number, y1: number, x2: number, y2: number, lw = 6, color = ink): void => {
      g.strokeStyle = color;
      g.lineWidth = lw;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    };
    const brows = (lift = 0, tilt = 0): void => {
      for (const sx of [-1, 1]) line(cx + sx * (eyeDX + 18), eyeY - 34 - lift - tilt * sx, cx + sx * (eyeDX - 16), eyeY - 38 - lift + tilt * sx, 5);
    };
    const blush = (alpha = 0.55): void => {
      if (!s.blush) return;
      for (const sx of [-1, 1]) {
        const grad = g.createRadialGradient(cx + sx * 112, eyeY + 42, 2, cx + sx * 112, eyeY + 42, 34);
        grad.addColorStop(0, s.blushColor);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.globalAlpha = alpha;
        g.fillStyle = grad;
        g.fillRect(cx + sx * 112 - 36, eyeY + 6, 72, 72);
        g.globalAlpha = 1;
      }
    };
    const mouth = (kind: 'smile' | 'open' | 'o' | 'flat' | 'small' | 'wavy'): void => {
      const my = eyeY + 62;
      g.strokeStyle = ink;
      g.fillStyle = s.mouth;
      g.lineWidth = 5;
      g.beginPath();
      if (kind === 'smile') {
        g.arc(cx, my - 10, 16, Math.PI * 0.2, Math.PI * 0.8);
        g.stroke();
      } else if (kind === 'small') {
        g.arc(cx, my - 6, 9, Math.PI * 0.2, Math.PI * 0.8);
        g.stroke();
      } else if (kind === 'open') {
        g.moveTo(cx - 20, my - 6);
        g.quadraticCurveTo(cx, my + 26, cx + 20, my - 6);
        g.closePath();
        g.fill();
        g.stroke();
      } else if (kind === 'o') {
        g.ellipse(cx, my, 10, 13, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      } else if (kind === 'flat') {
        line(cx - 12, my, cx + 12, my - 2, 5);
      } else {
        g.moveTo(cx - 18, my);
        for (let i = 1; i <= 4; i++) g.lineTo(cx - 18 + i * 9, my + (i % 2 ? -5 : 4));
        g.stroke();
      }
    };

    switch (e) {
      case 'binh':
        brows();
        dot(cx - eyeDX, eyeY, 16);
        dot(cx + eyeDX, eyeY, 16);
        blush(0.4);
        mouth('small');
        break;
      case 'chao':
        brows(4);
        arc(cx - eyeDX, eyeY, 20, true);
        arc(cx + eyeDX, eyeY, 20, true);
        blush();
        mouth('smile');
        break;
      case 'doc':
        brows(6);
        dot(cx - eyeDX, eyeY, 17);
        dot(cx + eyeDX, eyeY, 17);
        blush(0.45);
        mouth('o');
        break;
      case 'nghi':
        brows(2, 6);
        dot(cx - eyeDX + 8, eyeY - 6, 15); // mắt liếc lên
        dot(cx + eyeDX + 8, eyeY - 6, 15);
        blush(0.35);
        mouth('flat');
        break;
      case 'vui':
        brows(8);
        arc(cx - eyeDX, eyeY, 22, true, 8);
        arc(cx + eyeDX, eyeY, 22, true, 8);
        blush(0.75);
        mouth('open');
        break;
      case 'dinh-muc': {
        // mắt ✕ một bên, vệt mực đen loang trên má
        line(cx - eyeDX - 14, eyeY - 14, cx - eyeDX + 14, eyeY + 14, 7);
        line(cx - eyeDX + 14, eyeY - 14, cx - eyeDX - 14, eyeY + 14, 7);
        dot(cx + eyeDX, eyeY, 16);
        g.fillStyle = '#1b1b1f';
        g.beginPath();
        g.ellipse(cx + 40, eyeY + 58, 34, 22, 0.3, 0, Math.PI * 2);
        g.ellipse(cx + 82, eyeY + 40, 14, 10, 0, 0, Math.PI * 2);
        g.ellipse(cx + 8, eyeY + 82, 9, 7, 0, 0, Math.PI * 2);
        g.fill();
        mouth('wavy');
        break;
      }
      case 'ngu':
        brows(-2);
        arc(cx - eyeDX, eyeY, 18, false);
        arc(cx + eyeDX, eyeY, 18, false);
        blush(0.5);
        mouth('small');
        g.fillStyle = '#5a7fb8';
        g.font = 'bold 34px sans-serif';
        g.fillText('z', cx + 150, eyeY - 50);
        g.font = 'bold 24px sans-serif';
        g.fillText('z', cx + 178, eyeY - 76);
        break;
    }
    this.texture.needsUpdate = true;
  }
}
