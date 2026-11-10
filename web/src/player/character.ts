import type * as THREE from 'three';

/**
 * Hình dạng nhân vật, tách khỏi cách di chuyển. Mốc 5 sẽ có bản nạp từ file .glb
 * cùng hợp đồng này, nên bộ điều khiển không cần biết nhân vật là khối hình hay model thật.
 */
export interface Character {
  /** gốc: đặt vị trí trong sân */
  readonly root: THREE.Object3D;
  /** phần xoay theo hướng đi */
  readonly facing: THREE.Object3D;
  /** Gọi mỗi khung hình. `speed` từ 0 (đứng) đến 1 (đi hết tốc độ). */
  animate(dt: number, speed: number): void;
}
