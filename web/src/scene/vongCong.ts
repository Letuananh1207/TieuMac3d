/**
 * Vòng cổng (V-39, người dùng 2026-11-15: "vòng sáng nhỏ trên đó có chữ như các game"): đánh dấu cổng đi bộ sang cảnh
 * (R-HANH-4) có `label` — đĩa sáng nhỏ nằm trên mặt đất ở tâm vùng chạm (vòng ngọc + quầng mờ), màn sáng mờ thấp bốc lên,
 * vài hạt vàng bay lên, và nhãn chữ Việt nổi phía trên luôn quay về camera (sprite: xa thì nhỏ dần như vật trong cảnh).
 * Màu lấy theo vòng trận của cảnh (`teleport.colors`: `lit` vòng, `spark` hạt) cho cùng một "ngôn ngữ" phép.
 * Cộng sáng, không bóng, không hậu kỳ (quy tắc 4). Ngân sách mỗi cổng: đĩa 1 · màn sáng 1 · hạt 1 · nhãn 1 draw call.
 */
import * as THREE from 'three';
import { markDynamic } from './merge';
import { portalRect } from './portals';
import type { PortalSpec, TeleportSpec } from './spec';
import { makeCanvasTex, SIGN_FONT } from './textures';
import type { GroundY } from './terrainHeight';

/** Bán kính vòng tối đa (m): nhỏ hơn hẳn vòng trận 4 m. Vùng chạm hẹp hơn thì vòng vừa trong vùng. */
const MAX_R = 1.2;
const SPARKS = 14;
/** Màn sáng: cao (m), độ mờ giữa hai nhịp thở. */
const VEIL_H = 1.6;
const VEIL_OPACITY = [0.1, 0.22] as const;
/** Nhãn: tâm cao hơn mặt vòng (m), cao chữ (m). */
const LABEL_Y = 2.5;
const LABEL_H = 0.75;
/** Vòng nhỏ không chữ (`ring`, V-96): màn sáng + hạt thấp còn bấy nhiêu phần — dấu chỗ đứng, không như cổng sang cảnh. */
const RING_VEIL = 0.45;
/** Nhịp thở (rad/s). */
const BREATH = 1.8;

/** Bán kính vòng của một cổng: nửa cạnh ngắn của vùng chạm, tối đa `MAX_R`. */
export function markerRadius(p: Pick<PortalSpec, 'area'>): number {
  const r = portalRect(p);
  return Math.min(MAX_R, (r.maxX - r.minX) / 2, (r.maxZ - r.minZ) / 2);
}

/** Đĩa vòng: quầng mờ giữa, vòng sáng sát mép, vòng mảnh trong + 8 chấm — nền trong suốt (cộng sáng). */
function discTex(): THREE.CanvasTexture {
  return makeCanvasTex(256, 256, (g, w, h) => {
    const [cx, cy, R] = [w / 2, h / 2, w / 2];
    g.clearRect(0, 0, w, h);
    const halo = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    halo.addColorStop(0, 'rgba(255,255,255,0.28)');
    halo.addColorStop(0.7, 'rgba(255,255,255,0.12)');
    halo.addColorStop(0.86, 'rgba(255,255,255,0.75)');
    halo.addColorStop(0.92, 'rgba(255,255,255,1)');
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.arc(cx + Math.cos(a) * R * 0.74, cy + Math.sin(a) * R * 0.74, 5, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** Nhãn chữ kiểu game: chữ kem đậm, viền tối dày, nền dải tối mờ — đọc rõ cả ngày lẫn đêm. Trả texture + tỉ lệ rộng / cao. */
function labelTex(text: string): { tex: THREE.CanvasTexture; aspect: number } {
  const H = 128;
  const font = `700 72px ${SIGN_FONT}`;
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = font;
  const W = Math.ceil(probe.measureText(text).width + 96);
  const tex = makeCanvasTex(W, H, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    // dải nền mờ bo tròn
    const r = h * 0.36;
    g.fillStyle = 'rgba(18,22,28,0.45)';
    g.beginPath();
    g.moveTo(r, h * 0.14);
    g.lineTo(w - r, h * 0.14);
    g.arc(w - r, h / 2, h * 0.36, -Math.PI / 2, Math.PI / 2);
    g.lineTo(r, h * 0.86);
    g.arc(r, h / 2, h * 0.36, Math.PI / 2, (3 * Math.PI) / 2);
    g.fill();
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = 12;
    g.strokeStyle = '#1d150d';
    g.strokeText(text, w / 2, h / 2 + 3);
    g.fillStyle = '#fff3d2';
    g.fillText(text, w / 2, h / 2 + 3);
  });
  return { tex, aspect: W / H };
}

/** Màn sáng: mờ dần lên trên (alphaMap dọc). */
function fadeTex(): THREE.CanvasTexture {
  return makeCanvasTex(4, 64, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
}

/**
 * Dựng vòng cổng cho mọi cổng có `label` trong `portals` (trừ `marker: false` — cửa nhà, V-68); cổng có `ring` (cửa nhà
 * chính — V-96) → vòng nhỏ bán kính `ring`, không chữ, màn sáng thấp. Trả hàm gọi mỗi khung (thở sáng, hạt bay). Không cổng nào có
 * nhãn → không dựng gì (cảnh cũ).
 */
export function addPortalMarkers(
  scene: THREE.Scene,
  portals: readonly PortalSpec[],
  colors: TeleportSpec['colors'],
  groundY: GroundY = () => 0,
): (dt: number) => void {
  const marked = portals.filter((p) => p.label && p.marker !== false && !p.ring);
  // vòng nhỏ không chữ (`ring` — cửa nhà chính, V-96): đĩa + màn sáng thấp + hạt, cùng vật liệu
  const ringed = portals.filter((p) => !!p.ring);
  if (!marked.length && !ringed.length) return () => {};
  const disc = discTex();
  const fade = fadeTex();
  const discMat = new THREE.MeshBasicMaterial({
    color: colors.lit,
    map: disc,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  });
  const veilMat = new THREE.MeshBasicMaterial({
    color: colors.lit,
    alphaMap: fade,
    transparent: true,
    opacity: VEIL_OPACITY[0],
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sparkMat = new THREE.PointsMaterial({ color: colors.spark, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false });
  const ticks: ((t: number) => void)[] = [];

  for (const p of [...marked, ...ringed]) {
    const r = portalRect(p);
    const [cx, cz] = [(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2];
    const R = p.ring ?? markerRadius(p);
    const small = !!p.ring;
    const y0 = groundY(cx, cz);
    const discMesh = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R).rotateX(-Math.PI / 2), discMat);
    discMesh.position.set(cx, y0 + 0.06, cz);
    const veilH = small ? VEIL_H * RING_VEIL : VEIL_H;
    const veil = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.95, veilH, 28, 1, true).translate(0, veilH / 2, 0), veilMat);
    veil.position.set(cx, y0, cz);

    const pos = new Float32Array(SPARKS * 3);
    const seed = Array.from({ length: SPARKS }, (_, i) => ({
      a: (i * 2.399) % (Math.PI * 2),
      r: R * (0.3 + ((i * 0.618) % 1) * 0.6),
      t: (i * 0.37) % 1,
      v: 0.22 + ((i * 0.27) % 1) * 0.2,
    }));
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.frustumCulled = false; // vị trí đổi mỗi khung

    let label: THREE.Sprite | null = null;
    if (!small) {
      const { tex, aspect } = labelTex(p.label!);
      label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
      label.scale.set(LABEL_H * aspect, LABEL_H, 1);
      label.position.set(cx, y0 + LABEL_Y, cz);
      label.renderOrder = 2; // vẽ sau vòng cộng sáng: chữ không bị quầng phủ
    }
    const parts = label ? [discMesh, veil, sparks, label] : [discMesh, veil, sparks];
    for (const o of parts) markDynamic(o);
    scene.add(...parts);
    const rise = small ? 2.2 * RING_VEIL : 2.2; // hạt bay thấp theo màn sáng

    ticks.push((t) => {
      const b = 0.5 + 0.5 * Math.sin(t * BREATH);
      if (label) label.position.y = y0 + LABEL_Y + 0.06 * Math.sin(t * BREATH * 0.5); // nhấp nhô rất khẽ
      for (let i = 0; i < SPARKS; i++) {
        const s = seed[i];
        const k = (s.t + t * s.v) % 1;
        const a = s.a + k * 1.2;
        pos.set([cx + Math.cos(a) * s.r, y0 + 0.1 + k * rise, cz + Math.sin(a) * s.r], i * 3);
      }
      sparkGeo.attributes.position.needsUpdate = true;
      discMesh.scale.setScalar(0.97 + 0.03 * b);
    });
  }

  let time = 0;
  return (dt) => {
    time += dt;
    const b = 0.5 + 0.5 * Math.sin(time * BREATH);
    discMat.opacity = 0.7 + 0.3 * b;
    veilMat.opacity = VEIL_OPACITY[0] + (VEIL_OPACITY[1] - VEIL_OPACITY[0]) * b;
    for (const tick of ticks) tick(time);
  };
}
