import * as THREE from 'three';
import type { Zone } from '../zones/zones';
import { el } from './dom';

/**
 * Nút học nổi trên vật học trong nhà ("Học chữ 快"): hiện khi đứng trong vùng học (R-VUNG-1), bấm thì mở bài;
 * ẩn khi bài đang mở, hiện lại sau khi đóng nếu vẫn đứng trong vùng (R-VUNG-3).
 */
export class LearnButton {
  private readonly btn = el<HTMLButtonElement>('learn');
  private readonly text = el('learnText');
  private readonly han = el('learnHan');
  private readonly v = new THREE.Vector3();
  private zone: Zone | null = null;
  private suspended = false;

  constructor(onOpen: (zone: Zone) => void) {
    this.btn.addEventListener('click', () => {
      if (this.zone) onOpen(this.zone);
    });
  }

  /** Đổi vùng đang đứng (null = ngoài mọi vùng). */
  setZone(z: Zone | null): void {
    this.zone = z;
    if (z) {
      this.text.textContent = z.action;
      this.han.textContent = z.lesson.han;
    }
    this.refresh();
  }

  /** Bài học đang mở → ẩn nút. */
  suspend(on: boolean): void {
    this.suspended = on;
    this.refresh();
  }

  /** Mỗi khung: đặt nút ngay trên `anchor` (toạ độ cảnh) theo camera; điểm ra sau camera thì giấu. */
  follow(anchor: THREE.Vector3 | undefined, camera: THREE.Camera): void {
    if (this.btn.hidden || !anchor) return;
    this.v.copy(anchor).project(camera);
    const behind = this.v.z > 1;
    this.btn.style.visibility = behind ? 'hidden' : 'visible';
    // trong nhà camera ở gần: điểm treo có thể ra ngoài màn → giữ nút trong màn, dưới chip tên khu (cao ~110 px)
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = Math.min(w - 110, Math.max(110, ((this.v.x + 1) / 2) * w));
    const y = Math.min(h - 90, Math.max(Math.min(130, h * 0.35), ((1 - this.v.y) / 2) * h));
    this.btn.style.left = `${x}px`;
    this.btn.style.top = `${y}px`;
  }

  private refresh(): void {
    this.btn.hidden = !this.zone || this.suspended;
  }
}
