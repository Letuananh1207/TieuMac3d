/**
 * Nhập định khi tu luyện (R-HANH-3, thiết kế 2026-11-13.19 "Tu luyện"): vòng sáng dưới đệm + chữ của bộ sắp học trên
 * đầu. Chỉ máy người học thấy (của riêng — R-VUNG-1). Không HUD — vật 3D trong cảnh.
 *   0 → 0,3 s  vòng sáng nở (sau đó "thở" co giãn 4 %, chu kỳ 2 s)
 *   0,3 → 1 s  chữ hiện dần, mờ 0 → 0,7
 *   1 → 1,15 s chữ lớn lên 1,15 lần, sáng hẳn rồi tan → thẻ học mở (`OPEN_AT`)
 *   đứng dậy sớm → vòng sáng + chữ tắt dần 0,2 s
 */
import * as THREE from 'three';
import { markDynamic } from './merge';

/** Thẻ học mở sau khi chữ tan (giây ngồi). */
export const NHAP_DINH_OPEN_AT = 1.15;
const RING_IN = 0.3;
const CHAR_IN = 1;
const FADE_OUT = 0.2;
/** Đường kính vòng sáng trên mặt đất (m) — ≈ 1,3 × vai nhân vật. */
const RING_D = 1.6;
/** Tâm chữ: cao hơn chân ~2,65 m (đỉnh đầu khi ngồi ≈ 1,9 m + 0,5 m + nửa chữ). */
const CHAR_Y = 2.65;
const CHAR_SIZE = 0.5;
// token: color.aura-light rgba(255,236,190,.75) · gold #d4a64a · jade #2b5446 (design/tokens/design_tokens.json)
const AURA = 'rgba(255,236,190,.75)';
const GOLD = 'rgba(212,166,74,.85)';
const JADE = '#2b5446';

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

function drawChar(canvas: HTMLCanvasElement, text: string): void {
  const g = canvas.getContext('2d');
  if (!g) return;
  const s = canvas.width;
  g.clearRect(0, 0, s, s);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(s * 0.7)}px "Han Serif", serif`;
  // quầng trắng → vàng, rồi nét ngọc lục
  for (const [color, blur] of [['rgba(255,255,255,.95)', s * 0.06], ['rgba(212,166,74,.9)', s * 0.12]] as const) {
    g.shadowColor = color;
    g.shadowBlur = blur;
    g.fillStyle = JADE;
    g.fillText(text, s / 2, s / 2 + s * 0.03);
  }
  g.shadowBlur = 0;
  g.fillText(text, s / 2, s / 2 + s * 0.03);
}

const ease = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export class NhapDinh {
  private readonly ring: THREE.Mesh;
  private readonly ringMat: THREE.MeshBasicMaterial;
  private readonly charSprite: THREE.Sprite;
  private readonly charMat: THREE.SpriteMaterial;
  private readonly canvas = document.createElement('canvas');
  private readonly tex: THREE.CanvasTexture;
  private text = '';
  /** độ hiện chung khi tắt dần (1 → 0 trong `FADE_OUT`) */
  private fade = 0;
  private lastT = 0;
  private time = 0;

  constructor(scene: THREE.Scene) {
    this.ringMat = new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, depthWrite: false, opacity: 0 });
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(RING_D, RING_D), this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    this.canvas.width = this.canvas.height = 256;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.charMat = new THREE.SpriteMaterial({ map: this.tex, transparent: true, depthWrite: false, opacity: 0 });
    this.charSprite = new THREE.Sprite(this.charMat);
    this.charSprite.visible = false;
    for (const o of [this.ring, this.charSprite]) {
      markDynamic(o);
      scene.add(o);
    }
  }

  /** Chữ trên đầu đang hiện (để ẩn nhãn tên cho khỏi chồng). */
  get charShown(): boolean {
    return this.charSprite.visible && this.charMat.opacity > 0.02;
  }

  /**
   * Mỗi khung. `t` = số giây đã ngồi tu luyện (đang nhập định), `null` = không (đứng dậy / không phải vùng học / học đủ)
   * → tắt dần. `text` = chữ bộ sắp học.
   */
  update(dt: number, at: THREE.Vector3, t: number | null, text: string): void {
    this.time += dt;
    if (t !== null) {
      this.fade = 1;
      this.lastT = t;
      if (text !== this.text) {
        this.text = text;
        drawChar(this.canvas, text);
        this.tex.needsUpdate = true;
      }
    } else {
      this.fade = Math.max(0, this.fade - dt / FADE_OUT);
    }
    const shown = this.fade > 0;
    this.ring.visible = shown;
    this.charSprite.visible = shown;
    if (!shown) return;
    const k = this.lastT;
    // vòng sáng: nở 0 → 0,3 s rồi thở
    const grow = ease(k / RING_IN);
    const breathe = 1 + 0.04 * Math.sin((this.time * Math.PI * 2) / 2);
    this.ring.scale.setScalar((0.6 + 0.4 * grow) * breathe);
    this.ring.position.set(at.x, at.y + 0.03, at.z);
    this.ringMat.opacity = grow * this.fade;
    // chữ: 0,3 → 1 s hiện dần tới 0,7; 1 → 1,15 s lớn 1,15 lần, sáng hẳn rồi tan
    let op = 0;
    let size = 1;
    if (k >= CHAR_IN) {
      const b = Math.min(1, (k - CHAR_IN) / (NHAP_DINH_OPEN_AT - CHAR_IN));
      size = 1 + 0.15 * b;
      op = b < 0.4 ? 0.7 + 0.3 * (b / 0.4) : 1 - (b - 0.4) / 0.6;
    } else if (k > RING_IN) op = 0.7 * ease((k - RING_IN) / (CHAR_IN - RING_IN));
    this.charMat.opacity = op * this.fade;
    this.charSprite.scale.setScalar(CHAR_SIZE * size);
    this.charSprite.position.set(at.x, at.y + CHAR_Y, at.z);
  }
}
