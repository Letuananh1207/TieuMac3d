/**
 * Bong bóng hình trên đầu nhân vật khi diễn biểu cảm (R-BIEU-1/3 — thiết kế 2026-11-15.35 `BieuCam-bong-bong`): tròn 52 kính
 * viền ngọc, đuôi vuông xoay 45°, hình 34 — chỉ hình, không chữ (R-HUD-4). Neo trên nhãn tên như bong bóng chat (R-CHAT-2:
 * xa camera > 25 m / sau camera → không vẽ). Đang có bong bóng tin của mình → đứng bên trái bong bóng tin, đáy ngang nhau,
 * cách 6 (không thay nhau). Nhịp hiện / giữ / mờ: `zones/bieuCam.ts` `emoteBubbleLook`.
 */
import * as THREE from 'three';
import { bubbleVisible } from '../chat/bubbleTimer';
import { emoteBubbleLook, type EmoteId } from '../zones/bieuCam';
import { h } from './chatText';
import { svgIcon } from './decorIcons';
import { EMOTE_ICONS } from './toolbarIcons';

/** Cách bong bóng tin của mình (thiết kế). */
const GAP = 6;

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class EmoteBubble {
  private readonly wrap = h('div', 'eb');
  private readonly disc = h('div', 'eb-disc');
  private readonly v = new THREE.Vector3();
  private readonly camPos = new THREE.Vector3();
  private id: EmoteId | null = null;
  private startedAt = 0;

  constructor() {
    this.wrap.setAttribute('aria-hidden', 'true');
    const tail = h('div', 'eb-tail');
    this.wrap.append(this.disc, tail);
    this.wrap.hidden = true;
    document.body.append(this.wrap);
  }

  /** Bắt đầu bong bóng hình [id] lúc [now] (giây); chọn biểu cảm khác → thay. */
  show(id: EmoteId, now: number): void {
    if (this.id !== id) {
      this.disc.replaceChildren(svgIcon(EMOTE_ICONS[id], 34, '0 0 48 48'));
      this.id = id;
    }
    this.startedAt = now;
  }

  /**
   * Mỗi khung, sau khi bong bóng chat đã đặt chỗ. [at] = điểm neo trên nhãn tên (toạ độ cảnh), [liftPx] = hở trên điểm
   * neo; [hidden] = bận / nhìn từ mắt.
   */
  update(at: THREE.Vector3, liftPx: number, camera: THREE.Camera, now: number, hidden: boolean): void {
    const look = this.id ? emoteBubbleLook(now - this.startedAt, reducedMotion()) : null;
    if (!look) this.id = null;
    camera.getWorldPosition(this.camPos);
    this.v.copy(at).project(camera);
    const show = !!look && !hidden && bubbleVisible(at.distanceTo(this.camPos), this.v.z < 1);
    this.wrap.hidden = !show;
    if (!show || !look) return;
    this.wrap.style.opacity = String(look.opacity);
    this.disc.style.transform = `scale(${look.scale})`;
    const mine = document.querySelector<HTMLElement>('#chatBubbles .cb-player');
    if (mine) {
      // bên trái bong bóng tin, đáy ngang nhau
      const r = mine.getBoundingClientRect();
      this.wrap.classList.add('beside');
      this.wrap.style.left = `${r.left - GAP}px`;
      this.wrap.style.top = `${r.bottom}px`;
      return;
    }
    this.wrap.classList.remove('beside');
    this.wrap.style.left = `${((this.v.x + 1) / 2) * window.innerWidth}px`;
    this.wrap.style.top = `${((1 - this.v.y) / 2) * window.innerHeight - liftPx}px`;
  }
}
