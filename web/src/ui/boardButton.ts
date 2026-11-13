/**
 * Nút nổi "Xem bảng" trên bảng nhiệm vụ 日課榜 (R-NV-3, thiết kế 2026-11-13.25 `XemBang-*`): kiểu nút "Nói chuyện" —
 * viên thuốc ngọc lục, mũi nhọn xuống, nhãn kính sương "Nhiệm vụ hằng ngày 日課榜"; còn việc hôm nay → chấm son đếm.
 * DOM có sẵn trong index.html (#board).
 */
import * as THREE from 'three';
import { el } from './dom';

/** Nút nổi phía trên mái bảng (bảng cao ≈ 3,45 m — `honorBoard`). */
const ANCHOR_Y = 3.6;

export class BoardButton {
  private readonly root = el('board');
  private readonly btn = el('boardBtn');
  private readonly badge = el('boardBadge');
  private readonly v = new THREE.Vector3();
  private left: number | null | undefined;

  constructor(
    private readonly at: { x: number; z: number; y: number },
    onOpen: () => void,
  ) {
    this.btn.addEventListener('click', onOpen);
  }

  /** Hiện / ẩn; [left] = số việc còn lại hôm nay (`null` = không biết → không chấm, 0 → không chấm). */
  set(show: boolean, left: number | null): void {
    this.root.hidden = !show;
    if (!show || left === this.left) return;
    this.left = left;
    this.badge.hidden = !left;
    this.badge.textContent = left ? String(left) : '';
    this.btn.setAttribute('aria-label', left ? `Xem bảng, còn ${left} việc hôm nay` : 'Xem bảng'); // boardOpenLabel
  }

  /** Mỗi khung: đặt nút phía trên bảng theo camera; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    if (this.root.hidden) return;
    this.v.set(this.at.x, this.at.y + ANCHOR_Y, this.at.z).project(camera);
    this.root.style.visibility = this.v.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 110, Math.max(110, ((this.v.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - this.v.y) / 2) * h))}px`;
  }
}
