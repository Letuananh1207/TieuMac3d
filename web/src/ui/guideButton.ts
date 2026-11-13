/**
 * Nút nổi "Cách chơi" trên biển tên trò chơi ở Kỳ Văn Uyển (R-GIAO-2): dùng lại kiểu nút "Xem bảng" (thiết kế
 * 2026-11-13.25) — viên thuốc ngọc lục, mũi nhọn xuống, nhãn kính sương ghi tên trò. DOM có sẵn trong index.html (#guide).
 */
import * as THREE from 'three';
import type { GameSign } from '../zones/gameGuides';
import { el } from './dom';

/** Nút nổi phía trên đỉnh biển (biển cao ≈ 1,85 m — `gameSign`). */
const ANCHOR_Y = 2.1;

export class GuideButton {
  private readonly root = el('guide');
  private readonly name = el('guideName');
  private readonly han = el('guideHan');
  private readonly at = new THREE.Vector3();
  private readonly v = new THREE.Vector3();
  private sign: GameSign | null = null;

  constructor(onOpen: (sign: GameSign) => void) {
    el('guideBtn').addEventListener('click', () => {
      if (this.sign) onOpen(this.sign);
    });
  }

  /** Biển đang ở gần (`null` = ẩn nút); [y] = độ cao nền chỗ biển. */
  set(sign: GameSign | null, y = 0): void {
    this.root.hidden = !sign;
    if (sign) this.at.set(sign.x, y + ANCHOR_Y, sign.z);
    if (sign === this.sign) return;
    this.sign = sign;
    if (!sign) return;
    this.name.textContent = sign.name;
    this.han.textContent = sign.han;
    el('guideBtn').setAttribute('aria-label', `Cách chơi ${sign.name}`);
  }

  /** Mỗi khung: đặt nút phía trên biển theo camera; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    if (this.root.hidden) return;
    const p = this.v.copy(this.at).project(camera);
    this.root.style.visibility = p.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 110, Math.max(110, ((p.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - p.y) / 2) * h))}px`;
  }
}
