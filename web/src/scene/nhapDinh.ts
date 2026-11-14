/**
 * Nhập định khi Ngồi ôn (R-DIEU-7, R-ON-8 — thiết kế 2026-11-14.10 "Ngồi ôn"): vòng sáng dưới đệm + cuộn sách trên tay
 * (`cuonSach.ts`, mở 0,3 → 1 s). Chỉ máy người học thấy
 * (của riêng — R-VUNG-1). Không HUD — vật 3D trong cảnh. Chữ Hán trên đầu (thiết kế 2026-11-13.19) đã bỏ.
 *   0 → 0,3 s  vòng sáng nở (sau đó "thở" co giãn 4 %, chu kỳ 2 s)
 *   1 s        bảng chọn cuộn sách mở (`NHAP_DINH_OPEN_AT`)
 *   đứng dậy   → vòng sáng tắt dần 0,2 s
 */
import * as THREE from 'three';
import { CuonSach } from './cuonSach';
import { markDynamic } from './merge';

/** Bảng chọn cuộn sách mở sau chừng này giây ngồi (R-ON-8). */
export const NHAP_DINH_OPEN_AT = 1;
const RING_IN = 0.3;
const FADE_OUT = 0.2;
/** Đường kính vòng sáng trên mặt đất (m) — ≈ 1,3 × vai nhân vật. */
const RING_D = 1.6;
// token: color.aura-light rgba(255,236,190,.75) · gold #d4a64a (design/tokens/design_tokens.json)
const AURA = 'rgba(255,236,190,.75)';
const GOLD = 'rgba(212,166,74,.85)';

function ringTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  if (g) {
    const r = s / 2;
    const core = g.createRadialGradient(r, r, 0, r, r, r * 0.92);
    core.addColorStop(0, AURA);
    core.addColorStop(0.6, 'rgba(255,236,190,.35)');
    core.addColorStop(1, 'rgba(255,236,190,0)');
    g.fillStyle = core;
    g.fillRect(0, 0, s, s);
    g.lineWidth = 3;
    g.strokeStyle = GOLD; // viền vàng mảnh
    g.beginPath();
    g.arc(r, r, r * 0.94, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255,255,255,.8)'; // vòng trong trắng
    g.beginPath();
    g.arc(r, r, r * 0.72, 0, Math.PI * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const ease = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export class NhapDinh {
  private readonly ring: THREE.Mesh;
  private readonly ringMat: THREE.MeshBasicMaterial;
  /** độ hiện chung khi tắt dần (1 → 0 trong `FADE_OUT`) */
  private fade = 0;
  private lastT = 0;
  private time = 0;
  private readonly cuon: CuonSach;

  constructor(scene: THREE.Scene) {
    this.ringMat = new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, depthWrite: false, opacity: 0 });
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(RING_D, RING_D), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    markDynamic(this.ring);
    scene.add(this.ring);
    this.cuon = new CuonSach(scene);
  }

  /** "Đứng dậy" trên bảng chọn: cuộn sách cuộn lại (0,25 s) rồi `done` (nhân vật đứng dậy). */
  rollUpThen(done: () => void): void {
    this.cuon.rollUpThen(done);
  }

  /**
   * Mỗi khung. `t` = số giây đã ngồi ôn, `null` = không ngồi ôn (đứng dậy / ngồi vào chỗ ngồi) → tắt dần;
   * `yaw` = hướng mặt nhân vật (cuộn sách đặt trước ngực).
   */
  update(dt: number, at: THREE.Vector3, yaw: number, t: number | null): void {
    this.time += dt;
    this.cuon.update(dt, at, yaw, t);
    if (t !== null) {
      this.fade = 1;
      this.lastT = t;
    } else {
      this.fade = Math.max(0, this.fade - dt / FADE_OUT);
    }
    const shown = this.fade > 0;
    this.ring.visible = shown;
    if (!shown) return;
    // vòng sáng: nở 0 → 0,3 s rồi thở
    const grow = ease(this.lastT / RING_IN);
    const breathe = 1 + 0.04 * Math.sin((this.time * Math.PI * 2) / 2);
    this.ring.scale.setScalar((0.6 + 0.4 * grow) * breathe);
    this.ring.position.set(at.x, at.y + 0.03, at.z);
    this.ringMat.opacity = grow * this.fade;
  }
}
