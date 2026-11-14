/**
 * Nút nổi "Vào tiệm" trước cửa Tạp hoá 雜貨 (R-TIEN-6) — kiểu nút "Xem bảng" (`boardButton.ts`, thiết kế 2026-11-13.25):
 * viên thuốc ngọc lục, mũi nhọn xuống, nhãn kính sương "Tạp hoá 雜貨". DOM có sẵn trong index.html (#shop).
 */
import * as THREE from 'three';
import { el } from './dom';

/** Nút nổi trên cửa tiệm (mái hiên tiệm ~3 m). */
const ANCHOR_Y = 2.8;

export class ShopButton {
  private readonly root = el('shop');
  private readonly v = new THREE.Vector3();

  constructor(
    private readonly at: { x: number; z: number; y: number },
    onOpen: () => void,
  ) {
    el('shopBtn').addEventListener('click', onOpen);
  }

  set(show: boolean): void {
    this.root.hidden = !show;
  }

  /** Mỗi khung: đặt nút phía trên cửa tiệm theo camera; điểm ra sau camera thì giấu. */
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
