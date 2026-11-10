import * as THREE from 'three';
import { el } from './dom';

/** Dòng hướng dẫn: mờ dần ở lần chạm / bấm phím đầu tiên. */
export function createHint(): () => void {
  const hint = el('hint');
  let gone = false;
  return () => {
    if (gone) return;
    gone = true;
    hint.classList.add('gone');
  };
}

/** Đếm fps, cập nhật mỗi 0.5 giây. */
export class FpsCounter {
  private readonly out = el('fps');
  private frames = 0;
  private t = 0;

  tick(dt: number): void {
    this.frames++;
    this.t += dt;
    if (this.t > 0.5) {
      this.out.textContent = `${Math.round(this.frames / this.t)} fps`;
      this.frames = 0;
      this.t = 0;
    }
  }
}

/** Nhãn tên nổi trên đầu nhân vật (HTML đặt theo toạ độ chiếu từ 3D). */
export class NameTag {
  private readonly tag = el('nameTag');
  private readonly v = new THREE.Vector3();

  update(world: THREE.Vector3, camera: THREE.Camera, height = 2.25): void {
    this.v.set(world.x, world.y + height, world.z).project(camera);
    this.tag.style.left = `${((this.v.x + 1) / 2) * window.innerWidth}px`;
    this.tag.style.top = `${((1 - this.v.y) / 2) * window.innerHeight}px`;
  }
}

/** Chip góc trên trái: tên nơi · tên khu đang đứng (R-HUD-1, chữ do `zones/AreaTracker` tính). */
export class PlaceChip {
  private readonly out = el('place');

  set(label: string): void {
    this.out.textContent = label;
  }
}

/** Nút đổi góc nhìn gần / cả sân. */
export function bindCameraButton(toggle: () => boolean): void {
  const btn = el<HTMLButtonElement>('btnCam');
  btn.addEventListener('click', () => {
    const near = toggle();
    btn.textContent = `Góc nhìn: ${near ? 'gần' : 'cả sân'}`;
  });
}
