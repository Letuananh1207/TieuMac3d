import * as THREE from 'three';

/** Giới hạn mật độ điểm ảnh: màn điện thoại 3x mà vẽ đủ 3x thì GPU gánh gấp 4 lần so với 1.5x. */
export const MAX_PIXEL_RATIO = 1.5;

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  resize(): void;
}

/** Tên GPU của máy (bảng gỡ lỗi — biết số đo thuộc máy nào); trình duyệt giấu thì trả chuỗi chung. */
export function gpuName(renderer: THREE.WebGLRenderer): string {
  return readGpu(renderer.getContext());
}

/**
 * Dò tên GPU **trước** khi tạo renderer (chọn mức đồ hoạ — khử răng cưa chỉ đặt được lúc tạo WebGL, R-HIEU-1):
 * mở một ngữ cảnh WebGL tạm trên canvas rời rồi bỏ.
 */
export function probeGpu(): string {
  const c = document.createElement('canvas');
  const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
  if (!gl) return 'GPU ?';
  const name = readGpu(gl);
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return name;
}

function readGpu(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  if (typeof name !== 'string') return 'GPU ?';
  // "ANGLE (Qualcomm, Adreno (TM) 610, OpenGL ES 3.2)" → "Qualcomm, Adreno (TM) 610" — đủ biết máy, không tràn bảng
  const inner = /^ANGLE \((.*)\)$/.exec(name)?.[1] ?? name;
  return inner.split(',').slice(0, 2).join(',').trim().slice(0, 48);
}

/** `far` = tầm nhìn xa (m); núi xa / biển mây cần xa hơn 200 (`viewDistance` trong farMountains.ts). */
/** `opts`: mức đồ hoạ (R-HIEU-1) — `antialias` (mặc định bật), `ratio` pixelRatio ban đầu (mặc định ≤ MAX_PIXEL_RATIO). */
export function createStage(
  canvas: HTMLCanvasElement,
  fov = 55,
  far = 200,
  opts: { antialias?: boolean; ratio?: number } = {},
): Stage {
  // Prototype viết cho three r128. Từ r152 three tự quản lý màu (ColorManagement) và đổi đơn vị ánh sáng.
  // Tắt quản lý màu + nhân cường độ đèn với π (xem environment.ts) để giữ đúng màu của prototype.
  THREE.ColorManagement.enabled = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.antialias ?? true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(opts.ratio ?? Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
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
