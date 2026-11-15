/**
 * Chữ nổi vườn (thiết kế 2026-11-16.4 "Chữ nổi" — artboard `VuonMole-chu-noi-doc`; R-VUON-13): 15/800 trắng viền `slate` 2
 * (dấu "+n {cây}" 18), dòng 2 12/700 kem; bay lên 40 px trong 1 s, mờ 0,3 s cuối; nối nhau cách 0,25 s; giảm chuyển động →
 * đứng yên 1 s. Thu: 3 quả trong đĩa trắng 28 bay cung lên rồi vào ô Túi đồ (0,6 s, lệch 0,08 s). Không chặn chạm.
 */
import type { CropId } from '../zones/vuon';
import type { FloatText } from '../zones/vuonHud';
import { h } from './chatText';
import { cropPicture } from './cropArt';

const LIFE_MS = 1000;
const GAP_MS = 250;
const FLY_MS = 600;
const FLY_STAGGER_MS = 80;

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class GardenFloat {
  private readonly layer = h('div');
  private nextAt = 0;

  constructor() {
    this.layer.id = 'gardenFloat';
    this.layer.setAttribute('aria-live', 'polite');
    document.body.append(this.layer);
  }

  /** Chữ nổi tại điểm màn [at] (đỉnh luống / nhân vật); nhiều chữ liền nhau → nối nhau cách 0,25 s. */
  show(t: FloatText, at: { x: number; y: number }): void {
    const now = performance.now();
    const wait = Math.max(0, this.nextAt - now);
    this.nextAt = Math.max(now, this.nextAt) + GAP_MS;
    window.setTimeout(() => this.spawn(t, at), wait);
  }

  private spawn(t: FloatText, at: { x: number; y: number }): void {
    const big = /^\+\d/.test(t.text);
    const el = h('div', `gf${big ? ' big' : ''}${reducedMotion() ? ' still' : ''}`);
    el.append(h('b', '', t.text));
    if (t.sub) el.append(h('span', '', t.sub));
    el.style.left = `${Math.round(at.x)}px`;
    el.style.top = `${Math.round(at.y)}px`;
    this.layer.append(el);
    window.setTimeout(() => el.remove(), LIFE_MS + 50);
  }

  /** Thu hoạch: 3 quả bay cung lên từ [from] rồi vào [to] (ô Túi đồ); giảm chuyển động / không có ô đích → bỏ. */
  fly(crop: CropId, from: { x: number; y: number }, to: { x: number; y: number } | null): void {
    if (!to || reducedMotion() || typeof Element.prototype.animate !== 'function') return;
    for (let k = 0; k < 3; k++) {
      const disc = h('span', 'gf-fruit');
      disc.append(cropPicture(crop, 22));
      this.layer.append(disc);
      const x0 = from.x + (k - 1) * 14;
      const peak = { x: (x0 + to.x) / 2, y: Math.min(from.y, to.y) - 90 };
      const a = disc.animate(
        [
          { transform: `translate(${x0 - 14}px, ${from.y - 14}px) scale(.6)`, opacity: 0 },
          { transform: `translate(${peak.x - 14}px, ${peak.y - 14}px) scale(1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${to.x - 14}px, ${to.y - 14}px) scale(.7)`, opacity: 0.9 },
        ],
        { duration: FLY_MS, delay: k * FLY_STAGGER_MS, easing: 'ease-in-out', fill: 'backwards' },
      );
      a.onfinish = () => disc.remove();
      a.oncancel = () => disc.remove();
    }
  }
}
