import type { Joystick } from './joystick';
import type { OrbitCamera } from './orbitCamera';

/** Ngón chạm vào nửa trái màn hình (tỉ lệ chiều rộng) thì thành joystick. */
const JOYSTICK_ZONE = 0.45;
/** Chạm ngắn: di chuyển < 8px và nhả trong 300ms */
const TAP_MOVE_PX = 8;
const TAP_MS = 300;

interface LookPointer {
  x: number;
  y: number;
  sx: number;
  sy: number;
  t: number;
}

export interface PointerHandlers {
  joystick: Joystick;
  orbit: OrbitCamera;
  /** chạm ngắn ở nửa phải (hoặc chuột) — chỉ để chạm vật học trong nhà, không còn đi tới đó (R-DIEU-2) */
  onTap(clientX: number, clientY: number): void;
  /** joystick bắt đầu: bỏ điểm đến đang có */
  onJoystickStart(): void;
  /** `true` = chỉ nhận chạm ngắn (bản đồ truyền tống đang mở — R-HANH-2): không joystick, không xoay / zoom camera */
  tapOnly?(): boolean;
}

/**
 * Phân luồng cảm ứng trên canvas:
 * - ngón ở nửa trái → joystick
 * - một ngón nửa phải → xoay camera; chạm ngắn → đi tới điểm đó
 * - hai ngón nửa phải → chụm để zoom
 * Dùng Pointer Events (gộp chuột + cảm ứng) thay vì Touch Events.
 */
export function attachPointerInput(canvas: HTMLCanvasElement, h: PointerHandlers): void {
  const { joystick, orbit } = h;
  const looks = new Map<number, LookPointer>();
  let pinchDist = 0;

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    if (h.tapOnly?.()) {
      looks.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
      return;
    }
    if (e.clientX < window.innerWidth * JOYSTICK_ZONE && joystick.id === null && e.pointerType !== 'mouse') {
      joystick.start(e.pointerId, e.clientX, e.clientY);
      h.onJoystickStart();
    } else {
      looks.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
      if (looks.size === 2) {
        const [a, b] = [...looks.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId === joystick.id) {
      joystick.move(e.clientX, e.clientY);
      return;
    }
    const p = looks.get(e.pointerId);
    if (!p) return;
    if (h.tapOnly?.()) return; // chỉ chờ nhả để tính chạm
    if (looks.size === 2) {
      p.x = e.clientX;
      p.y = e.clientY;
      const [a, b] = [...looks.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist && d) orbit.pinch(pinchDist / d);
      pinchDist = d;
      return;
    }
    orbit.rotate(e.clientX - p.x, e.clientY - p.y);
    p.x = e.clientX;
    p.y = e.clientY;
  });

  function endPointer(e: PointerEvent): void {
    if (e.pointerId === joystick.id) {
      joystick.end();
      return;
    }
    const p = looks.get(e.pointerId);
    if (!p) return;
    looks.delete(e.pointerId);
    pinchDist = 0;
    const tap = Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < TAP_MOVE_PX && performance.now() - p.t < TAP_MS;
    if (tap && e.type === 'pointerup') h.onTap(e.clientX, e.clientY);
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      if (!h.tapOnly?.()) orbit.wheel(e.deltaY);
    },
    { passive: false },
  );
}
