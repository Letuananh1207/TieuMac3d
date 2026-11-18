/**
 * Nhân vật 3D trong thẻ nhân vật của Túi đồ (R-TUI-1, thiết kế 2026-11-18.13): renderer nhỏ riêng trên một `<canvas>` trong
 * khung ảnh, nền trong suốt (trời + đồi cỏ vẽ bằng CSS), kéo ngang để xoay. Chỉ vẽ khi túi mở (`start`); đóng (`stop`) → dừng
 * vòng vẽ + giải phóng renderer (`forceContextLoss`) để không giữ ngữ cảnh WebGL thứ hai. Model là **một bản nhân vật thứ hai**
 * (hàm dựng do lớp ghép truyền vào — ui không import player), nạp một lần ở lần mở đầu.
 */
import * as THREE from 'three';

/** Như `scene/renderer.ts` MAX_PIXEL_RATIO (CLAUDE.md quy tắc 4) — ui không import scene. */
const MAX_RATIO = 1.5;
/** Kéo 1 px → xoay chừng này (rad). */
const TURN_PER_PX = 0.012;
/** Góc nghiêng nhẹ sang phải lúc mở (rad) — thấy dáng ba phần tư như ảnh mẫu. */
const START_YAW = 0.35;

/** Phần của hợp đồng `Character` cần cho ảnh: gốc + dựng dáng mỗi khung. */
export interface PortraitModel {
  readonly root: THREE.Object3D;
  animate(dt: number, speed: number): void;
}

export class BagPortrait {
  /** chỗ đặt canvas (mỗi lần mở một canvas mới — canvas đã `forceContextLoss` không dùng lại được) */
  readonly host = document.createElement('div');
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  private readonly turn = new THREE.Group();
  private model: PortraitModel | null = null;
  private asking: Promise<void> | null = null;
  private frame = 0;
  private last = 0;
  private yaw = START_YAW;
  private drag: { id: number; x: number; yaw: number } | null = null;

  constructor(private readonly make: () => Promise<PortraitModel>) {
    this.host.className = 'bg-3d';
    this.host.setAttribute('aria-hidden', 'true');
    this.scene.add(new THREE.HemisphereLight(0xfff6e6, 0x9fb98a, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(2, 4, 5);
    this.scene.add(sun, this.turn);
    this.host.addEventListener('pointerdown', (e) => {
      this.drag = { id: e.pointerId, x: e.clientX, yaw: this.yaw };
      this.host.setPointerCapture(e.pointerId);
    });
    this.host.addEventListener('pointermove', (e) => {
      if (this.drag?.id === e.pointerId) this.yaw = this.drag.yaw + (e.clientX - this.drag.x) * TURN_PER_PX;
    });
    const end = (e: PointerEvent): void => {
      if (this.drag?.id === e.pointerId) this.drag = null;
    };
    this.host.addEventListener('pointerup', end);
    this.host.addEventListener('pointercancel', end);
  }

  /** Túi mở: dựng renderer, nạp model (lần đầu), chạy vòng vẽ. */
  start(): void {
    if (this.frame) return;
    if (!this.renderer) {
      const canvas = document.createElement('canvas');
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch (e) {
        console.warn('Thẻ nhân vật: không tạo được WebGL — bỏ ảnh 3D.', e);
        return;
      }
      this.canvas = canvas;
      this.host.append(canvas);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_RATIO));
    }
    this.yaw = START_YAW;
    this.asking ??= this.make().then(
      (m) => {
        this.model = m;
        m.root.position.set(0, 0, 0);
        m.root.rotation.set(0, 0, 0);
        m.animate(0, 0);
        this.turn.add(m.root);
        this.frameModel();
      },
      (e) => console.warn('Thẻ nhân vật: không dựng được nhân vật.', e),
    );
    this.last = performance.now();
    const tick = (now: number): void => {
      this.frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.draw(dt);
    };
    this.frame = requestAnimationFrame(tick);
  }

  /** Túi đóng: dừng vẽ, trả ngữ cảnh WebGL. Model giữ lại cho lần mở sau. */
  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.drag = null;
    if (!this.renderer) return;
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer = null;
    this.canvas?.remove();
    this.canvas = null;
  }

  private draw(dt: number): void {
    const r = this.renderer;
    if (!r) return;
    const w = this.host.clientWidth;
    const hgt = this.host.clientHeight;
    if (!w || !hgt) return;
    const size = r.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== hgt) {
      r.setSize(w, hgt, false);
      this.camera.aspect = w / hgt;
      this.camera.updateProjectionMatrix();
      this.frameModel();
    }
    this.turn.rotation.y = this.yaw;
    this.model?.animate(dt, 0);
    r.render(this.scene, this.camera);
  }

  /** Đặt camera nhìn trọn nhân vật (đứng giữa, chân gần đáy khung). */
  private frameModel(): void {
    const m = this.model;
    if (!m) return;
    const box = new THREE.Box3().setFromObject(m.root);
    const tall = Math.max(0.5, box.max.y - Math.min(0, box.min.y));
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    // vừa cả chiều cao lẫn chiều ngang khung (khung dọc hẹp → lùi thêm)
    const fit = Math.max(tall * 1.18, (tall * 0.75) / Math.max(0.4, this.camera.aspect));
    const dist = fit / 2 / Math.tan(fov / 2);
    const mid = tall * 0.47;
    this.camera.position.set(0, mid + tall * 0.06, dist);
    this.camera.lookAt(0, mid, 0);
  }
}
