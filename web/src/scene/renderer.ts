import * as THREE from 'three';

/** Giới hạn mật độ điểm ảnh: màn điện thoại 3x mà vẽ đủ 3x thì GPU gánh gấp 4 lần so với 1.5x. */
export const MAX_PIXEL_RATIO = 1.5;

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  resize(): void;
}

/** `far` = tầm nhìn xa (m); núi xa / biển mây cần xa hơn 200 (`viewDistance` trong farMountains.ts). */
export function createStage(canvas: HTMLCanvasElement, fov = 55, far = 200): Stage {
  // Prototype viết cho three r128. Từ r152 three tự quản lý màu (ColorManagement) và đổi đơn vị ánh sáng.
  // Tắt quản lý màu + nhân cường độ đèn với π (xem environment.ts) để giữ đúng màu của prototype.
  THREE.ColorManagement.enabled = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, far);

  function resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera, resize };
}
