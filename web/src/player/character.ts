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
  /**
   * Màu cho hai bàn tay lúc nhìn từ mắt khi ngồi (R-DIEU-7): tay áo, viền cổ tay, da. Không bắt buộc — thiếu (model
   * .glb màu nướng trong ảnh) thì dùng `camera.firstPerson` của đặc tả.
   */
  readonly palette?: { sleeve: string; cuff: string; skin: string };
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
  /** đang cầm mõ (NPC Lão Canh — R-NPC-8): có = tay trái đưa mõ ra trước, tay phải giơ dùi cao `strike` (0 chạm mõ … 1 giơ
   *  cao). Không có = dáng thường. Không bắt buộc — nhân vật người chơi bỏ qua */
  strike?: number;
  /** đang gảy đàn (nhạc công `cam-nu` — R-NPC-9): có = ngồi, hai tay đưa ra trước đặt trên dây đàn; số 0…1 = tay phải
   *  nhấc lên (0 vừa gảy, 1 nhấc cao). Không có = dáng thường. Không bắt buộc — nhân vật người chơi bỏ qua */
  pluck?: number;
  /** đang diễn biểu cảm (R-BIEU-2): mã (`zones/bieuCam.ts`), giây đã diễn `t`, thời lượng `len` (`Infinity` = giữ). Không
   *  có = không diễn. Không bắt buộc — nhân vật không biết mã thì bỏ qua (đứng thường) */
  emote?: { id: string; t: number; len: number };
}
