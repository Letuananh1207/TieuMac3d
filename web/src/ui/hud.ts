import * as THREE from 'three';
import { el } from './dom';
import { frameStats, FrameWindow } from './frameStats';

/** Bảng gỡ lỗi: fps, ms / khung, 1 % chậm nhất, khựng, draw call, tam giác; cập nhật mỗi 0,5 s; chỉ hiện ở chế độ gỡ lỗi (`?debug`). */
export class FpsCounter {
  private readonly out = el('fps');
  /** ~2 giây khung gần nhất (ms) — đủ để "1 % chậm nhất" có nghĩa */
  private readonly window = new FrameWindow(2000);
  private t = 0;
  /** dòng thứ hai: GPU, độ phân giải vẽ — `setInfo` */
  private info = '';

  constructor(private enabled: boolean) {
    this.out.hidden = !enabled;
  }

  /** Bật / tắt bảng gỡ lỗi (`?debug` hoặc Flutter gửi `debug` — docs/bridge.md). */
  setEnabled(on: boolean): void {
    this.enabled = on;
    this.out.hidden = !on;
    this.window.clear();
    this.t = 0;
  }

  /** Dòng thông tin máy dưới số đo (vd. "Adreno 610 · 1,5× · 1080×2160"). */
  setInfo(text: string): void {
    this.info = text;
  }

  /**
   * @param rawDt thời gian thật của khung (giây, **không kẹp** — kẹp thì giấu mất khựng)
   * @param calls, triangles số draw call / tam giác của khung vừa vẽ (renderer.info)
   */
  tick(rawDt: number, calls = 0, triangles = 0): void {
    if (!this.enabled) return;
    this.window.push(rawDt * 1000);
    this.t += rawDt;
    if (this.t < 0.5) return;
    this.t = 0;
    const s = frameStats(this.window.values);
    const tri = triangles >= 1000 ? `${Math.round(triangles / 1000)}k` : `${triangles}`;
    // fps · ms trung bình (1 % chậm nhất) · số lần khựng trong ~2 s · draw call · tam giác
    const line = `${Math.round(s.fps)} fps · ${s.avgMs.toFixed(1)} ms (1%: ${Math.round(s.p99Ms)}) · khựng ${s.hitches} · ${calls} dc · ${tri} ▲`;
    this.out.textContent = this.info ? `${line}
${this.info}` : line;
  }
}

/** Nhãn tên nổi trên đầu nhân vật (HTML đặt theo toạ độ chiếu từ 3D). */
export class NameTag {
  private readonly tag = el('nameTag');
  private readonly v = new THREE.Vector3();

  /** Ẩn khi chữ nhập định hiện trên đầu (khỏi chồng — thiết kế 2026-11-13.19). */
  setVisible(on: boolean): void {
    this.tag.style.visibility = on ? '' : 'hidden';
  }

  update(world: THREE.Vector3, camera: THREE.Camera, height = 2.25): void {
    this.v.set(world.x, world.y + height, world.z).project(camera);
    this.tag.style.left = `${((this.v.x + 1) / 2) * window.innerWidth}px`;
    this.tag.style.top = `${((1 - this.v.y) / 2) * window.innerHeight}px`;
  }
}
