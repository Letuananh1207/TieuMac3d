/**
 * Vòng sáng mờ dưới chỗ ngồi đang nhắm (R-NGOI-1): một vòng phẳng dời theo chỗ ngồi, 1 draw call, không gộp.
 */
import * as THREE from 'three';
import { markDynamic } from './merge';

export interface SeatGlow {
  /** đặt dưới chỗ ngồi (toạ độ cảnh); `null` = ẩn */
  set(at: { x: number; y?: number; z: number } | null): void;
  /** mỗi khung: thở nhẹ */
  update(dt: number): void;
}

export function addSeatGlow(scene: THREE.Scene, color: string): SeatGlow {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.6, 32), mat);
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  ring.renderOrder = 2;
  markDynamic(ring);
  scene.add(ring);
  let t = 0;
  return {
    set(at) {
      ring.visible = !!at;
      if (at) ring.position.set(at.x, (at.y ?? 0) + 0.03, at.z);
    },
    update(dt) {
      if (!ring.visible) return;
      t += dt;
      mat.opacity = 0.4 + 0.2 * Math.sin(t * 3);
    },
  };
}
