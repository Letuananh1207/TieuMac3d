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
  /**
   * Gọi mỗi khung hình. `speed` từ 0 (đứng) đến 1 (chạy hết tốc độ `RUN_SPEED`). `state` (không bắt buộc — nhân vật cũ bỏ
   * qua): nhảy, ngồi thiền, chào, đứng lâu (R-DIEU-5…8) để nhân vật chọn dáng.
   */
  animate(dt: number, speed: number, state?: CharacterState): void;
}

/** Trạng thái hành động do `PlayerController` tính (vật lý), nhân vật chỉ dựng dáng theo đó. */
export interface CharacterState {
  /** tốc độ thật (m/s) — đi bộ ≤ `WALK_SPEED`, chạy tới `RUN_SPEED` */
  mps: number;
  /** đang bay (nhảy) */
  air: boolean;
  /** vận tốc dọc (m/s, dương = đang lên) */
  vy: number;
  /** 0 → 1: đang ngồi xuống / đã ngồi thiền (mượt) */
  sit: number;
  /** 0 → 1 → 0: đang chắp tay chào */
  bow: number;
  /** giây đứng yên liên tục (không ngồi, không chào) — động tác khi đứng lâu */
  idle: number;
}
