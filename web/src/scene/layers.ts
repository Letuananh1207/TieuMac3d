import type * as THREE from 'three';

/**
 * Lớp vẽ (`Object3D.layers`) cho góc nhìn từ mắt khi ngồi (R-DIEU-7):
 * - `LAYER_THAN`: thân nhân vật của mình + cuộn sách trước ngực — dáng "người ngoài nhìn". Camera ngôi 3 bật lớp này,
 *   ngôi 1 tắt (không thấy đầu / thân mình); dáng ngồi không đổi.
 * - `LAYER_MAT`: hai bàn tay + cuộn sách trước mắt + vật cầm — chỉ camera ngôi 1 bật.
 * Lớp 0 = cảnh chung. Tia dò (`Raycaster`) mặc định chỉ lớp 0 → không trúng thân / tay mình.
 */
export const LAYER_THAN = 1;
export const LAYER_MAT = 2;

/** Đặt cả cây con vào đúng một lớp. */
export function setLayer(root: THREE.Object3D, layer: number): void {
  root.traverse((o) => o.layers.set(layer));
}

/** Camera: `first` = ngôi 1 (cảnh + tay / cuộn), không thì ngôi 3 (cảnh + thân mình). */
export function viewLayers(camera: THREE.Camera, first: boolean): void {
  camera.layers.set(0);
  camera.layers.enable(first ? LAYER_MAT : LAYER_THAN);
}
