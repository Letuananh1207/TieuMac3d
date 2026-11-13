import * as THREE from 'three';
import { el } from './dom';

/** Đếm fps, cập nhật mỗi 0.5 giây; chỉ hiện ở chế độ gỡ lỗi (`?debug` trên địa chỉ trang). */
export class FpsCounter {
  private readonly out = el('fps');
  private frames = 0;
  private t = 0;

  constructor(private enabled: boolean) {
    this.out.hidden = !enabled;
  }

  /** Bật / tắt bảng gỡ lỗi (`?debug` hoặc Flutter gửi `debug` — docs/bridge.md). */
  setEnabled(on: boolean): void {
    this.enabled = on;
    this.out.hidden = !on;
    this.frames = 0;
    this.t = 0;
  }

  /** @param calls, triangles số draw call / tam giác của khung vừa vẽ (renderer.info) */
  tick(dt: number, calls = 0, triangles = 0): void {
    if (!this.enabled) return;
    this.frames++;
    this.t += dt;
    if (this.t > 0.5) {
      const tri = triangles >= 1000 ? `${Math.round(triangles / 1000)}k` : `${triangles}`;
      this.out.textContent = `${Math.round(this.frames / this.t)} fps · ${calls} dc · ${tri} ▲`;
      this.frames = 0;
      this.t = 0;
    }
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
