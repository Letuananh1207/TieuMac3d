/**
 * Nút nổi của cổng bấm nút (R-HANH-4, R-NHA-1 — V-71 cửa gian trong "Ra sân", V-81 mọi cổng có nhãn: "Đi Trúc Lâm", "Về nhà"…)
 * — cùng kiểu nút "Ngồi" / "Nói chuyện": viên thuốc ngọc lục, mũi nhọn chỉ xuống cổng. Đứng trong vùng cổng thì hiện, bấm
 * (phím E) thì sang cảnh. DOM có sẵn trong index.html (#exit).
 */
import * as THREE from 'three';
import { el } from './dom';
import { hinhImg, type HinhId } from './hinh';

/** treo nút cao hơn chân chỗ đứng (m) — trên nhãn tên nhân vật (2,5 m) để không đè */
const ABOVE = 3.2;

/** Chỗ treo nút (toạ độ cảnh, `y` = chân) + chữ trên nút. */
export interface ExitSpot {
  x: number;
  y: number;
  z: number;
  label: string;
  /** treo cao hơn chân bấy nhiêu mét (thiếu = `ABOVE`); cổng có vòng chữ (V-81) treo thấp hơn — điện thoại dọc không vướng bản đồ nhỏ */
  above?: number;
}

/**
 * Hình minh hoạ hợp nghĩa chữ trên nút (V-81): "Về nhà" → mái nhà · vào / ra cửa ("Vào nhà", "Ra sân") → cánh cửa · đi nơi
 * khác ("Đi Trúc Lâm", "Về Khởi Nguyên Trấn") → cuộn bản đồ. Thuần.
 */
export function exitHinh(label: string): HinhId {
  if (label === 'Về nhà') return 've-nha';
  if (/^(Vào|Ra)\s/u.test(label)) return 'ra-san';
  return 'ban-do';
}

export class ExitButton<T extends ExitSpot> {
  private readonly root = el('exit');
  private readonly label = el('exitLabel');
  private readonly v = new THREE.Vector3();
  private spot: T | null = null;
  private img: HTMLImageElement = hinhImg('ra-san', 28);
  private hinh: HinhId = 'ra-san';

  constructor(onExit: (spot: T) => void) {
    const btn = el('exitBtn');
    btn.prepend(this.img); // hình minh hoạ 28 bên trái nhãn (2026-11-16.3)
    btn.addEventListener('click', () => {
      if (this.spot) onExit(this.spot);
    });
  }

  /** Cửa đang đứng trước (`null` = không / đang bận → ẩn). */
  set(spot: T | null): void {
    if (spot && spot.label !== this.spot?.label) {
      this.label.textContent = spot.label;
      const h = exitHinh(spot.label);
      if (h !== this.hinh) {
        const img = hinhImg(h, 28);
        this.img.replaceWith(img);
        this.img = img;
        this.hinh = h;
      }
    }
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
    this.v.set(s.x, s.y + (s.above ?? ABOVE), s.z).project(camera);
    this.root.style.visibility = this.v.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 90, Math.max(90, ((this.v.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - this.v.y) / 2) * h))}px`;
  }
}
