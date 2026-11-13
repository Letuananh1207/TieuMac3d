/**
 * Nút nổi "Ngồi" trên chỗ ngồi gần nhất (R-NGOI-1) — cùng kiểu nút "Nói chuyện" (`dialogBox.ts`): viên thuốc ngọc lục,
 * mũi nhọn chỉ xuống chỗ ngồi. Nhãn theo loại chỗ (`SEAT_LABEL`). DOM có sẵn trong index.html (#seat).
 */
import * as THREE from 'three';
import { SEAT_LABEL, type SeatSpot } from '../zones/seats';
import { el } from './dom';

export class SeatButton<T extends SeatSpot> {
  private readonly root = el('seat');
  private readonly label = el('seatLabel');
  private readonly v = new THREE.Vector3();
  private spot: T | null = null;

  constructor(onSit: (spot: T) => void) {
    el('seatBtn').addEventListener('click', () => {
      if (this.spot) onSit(this.spot);
    });
  }

  /** Chỗ ngồi đang nhắm (`null` = không có / đang bận → ẩn). */
  set(spot: T | null): void {
    if (spot && spot.kind !== this.spot?.kind) this.label.textContent = SEAT_LABEL[spot.kind];
    this.spot = spot;
    this.root.hidden = !spot;
  }

  get current(): T | null {
    return this.spot;
  }

  /** Mỗi khung: đặt nút phía trên chỗ ngồi theo camera; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    const s = this.spot;
    if (this.root.hidden || !s) return;
    this.v.set(s.x, (s.y ?? 0) + 1.3, s.z).project(camera);
    this.root.style.visibility = this.v.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 90, Math.max(90, ((this.v.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - this.v.y) / 2) * h))}px`;
  }

  /**
   * Cùng lúc với nút "Nói chuyện" (thiết kế 2026-11-13.28): hai khung chồng nhau → dời nút Ngồi xuống tới khi cách ≥ 8 px;
   * "Nói chuyện" giữ chỗ trên đầu NPC. Gọi sau `follow` của cả hai nút.
   */
  avoid(other: HTMLElement): void {
    if (this.root.hidden || other.hidden) return;
    const a = this.root.getBoundingClientRect();
    const b = other.getBoundingClientRect();
    const gap = 8;
    const overlap = a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;
    if (!overlap) return;
    const top = parseFloat(this.root.style.top) || 0;
    this.root.style.top = `${top + (b.bottom + gap - a.top)}px`;
  }
}
