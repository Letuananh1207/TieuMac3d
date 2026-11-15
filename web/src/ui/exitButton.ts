/**
 * Nút nổi ra cửa (cổng `via: "nut"` — cửa gian trong "Ra sân", R-NHA-1, R-HANH-4, V-71) — cùng kiểu nút "Ngồi" /
 * "Nói chuyện": viên thuốc ngọc lục, mũi nhọn chỉ xuống thảm trước cửa. Đứng trên thảm thì hiện, bấm thì sang cảnh.
 * DOM có sẵn trong index.html (#exit).
 */
import * as THREE from 'three';
import { el } from './dom';

/** treo nút cao hơn chân chỗ đứng (m) — trên nhãn tên nhân vật (2,5 m) để không đè */
const ABOVE = 3.2;

/** Chỗ treo nút (toạ độ cảnh, `y` = chân) + chữ trên nút. */
export interface ExitSpot {
  x: number;
  y: number;
  z: number;
  label: string;
}

export class ExitButton<T extends ExitSpot> {
  private readonly root = el('exit');
  private readonly label = el('exitLabel');
  private readonly v = new THREE.Vector3();
  private spot: T | null = null;

  constructor(onExit: (spot: T) => void) {
    el('exitBtn').addEventListener('click', () => {
      if (this.spot) onExit(this.spot);
    });
  }

  /** Cửa đang đứng trước (`null` = không / đang bận → ẩn). */
  set(spot: T | null): void {
    if (spot && spot.label !== this.spot?.label) this.label.textContent = spot.label;
    this.spot = spot;
    this.root.hidden = !spot;
  }

  get current(): T | null {
    return this.spot;
  }

  /** Mỗi khung: đặt nút phía trên chỗ treo theo camera; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    const s = this.spot;
    if (this.root.hidden || !s) return;
    this.v.set(s.x, s.y + ABOVE, s.z).project(camera);
    this.root.style.visibility = this.v.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 90, Math.max(90, ((this.v.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - this.v.y) / 2) * h))}px`;
  }
}
