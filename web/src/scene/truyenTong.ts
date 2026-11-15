/**
 * Vòng trận truyền tống (R-HANH-2; đổi kiểu một vòng — người dùng 2026-11-13). Tông môn: Truyền Tống Đài 傳送台 — sân đá
 * tròn, giữa sân một vòng trận lớn có phù hiệu hoa văn (không chữ Hán — R-HUD-4). Cảnh vùng không còn vòng (V-65) — chỗ cũ
 * là sân đá trống `addStoneYard`. Đứng trong vòng → `setCharge` 0 → 1
 * trong 1,2 s: vòng sáng dần, cột sáng bốc lên, hạt xoáy nhanh dần. Cuộn bản đồ chọn vùng chờ thiết kế
 * (docs/phieu_thiet_ke/2026-11-13-hanh-trinh-hud.md).
 * Ngân sách: sân + viền / bệ (gộp) ≈ 2 · phù hiệu 1 · vòng 1 · chấm 1 · cột sáng 1 · hạt 1.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { dayNightTag, lambert } from './materials';
import { markDynamic } from './merge';
import type { StoneYardSpec, TeleportSpec } from './spec';
import { makeCanvasTex } from './textures';
import type { GroundY } from './terrainHeight';
import { addDais } from './truyenTongDai';

const DOTS = 12; // chấm vàng quanh vòng
const SPARKS = 48; // hạt sáng
const PILLAR_HEIGHT = 9; // cột sáng khi nạp đầy (m)
/** Độ sáng của vòng khi đứng ngoài (0 = màu tắt, 1 = sáng hẳn). */
const IDLE_GLOW = 0.35;

/** Mặt phẳng nằm ngang (PlaneGeometry / RingGeometry dựng đứng → xoay nằm, mặt trên nhìn +y). */
function flat<T extends THREE.BufferGeometry>(geo: T): T {
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/**
 * Phù hiệu khắc trong vòng: vòng tròn mảnh + hoa văn (vòng trong, 8 cánh sen nhọn, tâm tròn), nền trong suốt. Có `text`
 * (tên Việt ngắn, đặc tả `teleport.text`) → khắc chữ giữa thay tâm. Không chữ Hán (R-HUD-4, người dùng 2026-11-14).
 */
function emblemTex(color: string, text: string): THREE.CanvasTexture {
  return makeCanvasTex(512, 512, (g, w, h) => {
    const [cx, cy] = [w / 2, h / 2];
    g.clearRect(0, 0, w, h);
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = 10;
    g.beginPath();
    g.arc(cx, cy, 230, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 6;
    g.beginPath();
    g.arc(cx, cy, 170, 0, Math.PI * 2);
    g.stroke();
    if (text) {
      g.font = '700 64px Lora, Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, cx, cy + 4, 300);
      return;
    }
    // 8 cánh nhọn từ vòng trong vào tâm
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const [ux, uy, px, py] = [Math.sin(a), -Math.cos(a), Math.cos(a), Math.sin(a)];
      g.beginPath();
      g.moveTo(cx + ux * 160, cy + uy * 160);
      g.quadraticCurveTo(cx + ux * 95 + px * 40, cy + uy * 95 + py * 40, cx + ux * 50, cy + uy * 50);
      g.quadraticCurveTo(cx + ux * 95 - px * 40, cy + uy * 95 - py * 40, cx + ux * 160, cy + uy * 160);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, 36, 0, Math.PI * 2);
    g.fill();
  });
}

export interface TeleportRing {
  /** tâm vòng (x, y mặt vòng — mặt đất, hoặc mặt tầng trên cùng của đài —, z) */
  center: THREE.Vector3;
  /** mặt đất đi được của đài (tầng + dốc bậc); không có đài → rỗng */
  pads: Pad[];
  /** có nơi để đi không — không có thì vòng tắt, không có hạt */
  setActive(active: boolean): void;
  /** 0 = đứng ngoài · 1 = nạp đầy (sắp truyền tống) */
  setCharge(charge: number): void;
  update(dt: number): void;
}

/**
 * Đĩa đá phẳng + viền (sân Truyền Tống Đài không đài / bệ vòng / sân đá trống). Đứng yên → mergeStatic gộp. `overPath`: đẩy
 * độ sâu để sân vẽ đè lên lối lát cùng chỗ (lối lát đẩy -1 / -2 — `paths.ts`), mặt vẫn phẳng sát đất.
 */
function addStoneDisc(
  scene: THREE.Scene,
  cx: number,
  y0: number,
  cz: number,
  radius: number,
  colors: { floor: string; rim: string },
  floor = true,
  overPath = false,
): void {
  const push = (k: number): Parameters<typeof lambert>[1] => (overPath ? { polygonOffset: true, polygonOffsetFactor: -2 * k, polygonOffsetUnits: -4 * k } : undefined);
  if (floor) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 56), lambert(colors.floor, push(1)));
    disc.position.set(cx, y0 + 0.03, cz);
    scene.add(disc);
  }
  const rim = new THREE.Mesh(flat(new THREE.RingGeometry(radius - 0.5, radius, 56)), lambert(colors.rim, push(1.5)));
  rim.position.set(cx, y0 + 0.065, cz);
  scene.add(rim);
}

/**
 * Sân đá trống (V-65): chỗ vòng trận cũ ở cảnh vùng — chỉ đĩa đá + viền, không vòng / phù hiệu / cột sáng / hạt, không
 * vật cản (bãi hạc đáp — R-HANH-5). Vẽ đè lên lối lát đi qua sân (Trúc Lâm: lối cửa rừng rộng 9,4 m). Ngân sách: 2 draw
 * call (vật liệu đẩy độ sâu giữ riêng, không gộp vào khối mềm).
 */
export function addStoneYard(scene: THREE.Scene, yard: StoneYardSpec, groundY: GroundY = () => 0): void {
  const [cx, cz] = yard.center;
  addStoneDisc(scene, cx, groundY(cx, cz), cz, yard.radius, yard.colors, true, true);
}

/**
 * Dựng vòng trận theo đặc tả. Không đài: sân / bệ đá phẳng đi qua được, không vật cản. Có đài (`dais.tiers` > 0): đài
 * nhiều tầng (`truyenTongDai.ts`) — lan can + trụ vào `colliders`, mặt tầng + bậc trả về ở `pads`; vòng nằm trên mặt trên.
 */
export function addTeleport(scene: THREE.Scene, colliders: Colliders, tp: TeleportSpec, groundY: GroundY = () => 0): TeleportRing {
  const { colors, ringRadius: R } = tp;
  const [cx, cz] = tp.center;
  const ground = groundY(cx, cz);
  const dais = tp.dais.tiers > 0 ? addDais(scene, colliders, tp, ground) : null;
  const y0 = dais ? dais.topY : ground;
  const center = new THREE.Vector3(cx, y0, cz);

  // sân đá (tông môn) hoặc bệ đá nhỏ (vùng) — có đài thì mặt tầng trên cùng là sân, chỉ thêm viền: đứng yên → mergeStatic gộp
  const base = dais ? dais.topRadius : tp.radius > 0 ? tp.radius : R + 0.7;
  addStoneDisc(scene, cx, y0, cz, base, colors, !dais);
  const emblem = new THREE.Mesh(
    flat(new THREE.PlaneGeometry(R * 1.5, R * 1.5)),
    lambert('#ffffff', { map: emblemTex(colors.rim, tp.text), transparent: true, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  emblem.position.set(cx, y0 + 0.07, cz);
  scene.add(emblem);

  // vòng + chấm vàng: màu vòng đổi theo độ nạp
  const ringMat = dayNightTag(new THREE.MeshBasicMaterial({ color: colors.dim, polygonOffset: true, polygonOffsetFactor: -2 }), 'bo');
  const ring = new THREE.Mesh(flat(new THREE.RingGeometry(R * 0.88, R, 64)), ringMat);
  ring.position.set(cx, y0 + 0.075, cz);
  const dotMat = dayNightTag(new THREE.MeshBasicMaterial({ color: colors.spark, polygonOffset: true, polygonOffsetFactor: -3 }), 'bo');
  const dots = new THREE.InstancedMesh(flat(new THREE.CircleGeometry(0.16, 8)), dotMat, DOTS);
  const m = new THREE.Matrix4();
  for (let i = 0; i < DOTS; i++) {
    const a = (i / DOTS) * Math.PI * 2;
    dots.setMatrixAt(i, m.makeTranslation(cx + Math.cos(a) * R * 0.94, y0 + 0.08, cz + Math.sin(a) * R * 0.94));
  }
  dots.instanceMatrix.needsUpdate = true;
  dots.computeBoundingSphere();

  // cột sáng: trụ hở hai đầu, cộng sáng, mờ dần lên trên (alphaMap dọc), chỉ hiện khi nạp
  const fade = makeCanvasTex(4, 128, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#000000'); // đỉnh (v = 1 ở trên ảnh) trong suốt
    grad.addColorStop(0.6, '#555555');
    grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
  const pillarMat = new THREE.MeshBasicMaterial({
    color: colors.lit,
    alphaMap: fade,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.85, R * 0.92, 1, 40, 1, true).translate(0, 0.5, 0), pillarMat);
  pillar.position.set(cx, y0, cz);

  // hạt sáng xoáy lên
  const pos = new Float32Array(SPARKS * 3);
  const seed = Array.from({ length: SPARKS }, (_, i) => ({
    a: (i * 2.399) % (Math.PI * 2),
    r: R * (0.25 + ((i * 0.618) % 1) * 0.7),
    t: (i * 0.37) % 1,
    v: 0.25 + ((i * 0.27) % 1) * 0.3,
  }));
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({ color: colors.spark, size: 0.18, transparent: true, opacity: 0.9, depthWrite: false }),
  );
  sparks.frustumCulled = false; // vị trí đổi mỗi khung, hộp bao không cập nhật

  for (const o of [ring, dots, pillar, sparks]) markDynamic(o);
  scene.add(ring, dots, pillar, sparks);

  const dim = new THREE.Color(colors.dim);
  const lit = new THREE.Color(colors.lit);
  let active = true;
  let charge = 0;
  const paint = (): void => {
    const glow = active ? IDLE_GLOW + (1 - IDLE_GLOW) * charge : 0;
    ringMat.color.copy(dim).lerp(lit, glow);
    dais?.setGlow(active ? charge : 0);
    dots.visible = active;
    sparks.visible = active;
    pillar.visible = active && charge > 0.01;
    pillarMat.opacity = 0.32 * charge;
    pillar.scale.y = PILLAR_HEIGHT * (0.15 + 0.85 * charge);
  };
  paint();

  return {
    center,
    pads: dais?.pads ?? [],
    setActive(a) {
      active = a;
      paint();
    },
    setCharge(c) {
      charge = Math.min(1, Math.max(0, c));
      paint();
    },
    update(dt) {
      if (!active) return;
      // nạp càng đầy hạt càng nhanh, bay càng cao, xoáy càng sát tâm
      const speed = 1 + charge * 3;
      const rise = 2.4 + charge * 5;
      for (let i = 0; i < SPARKS; i++) {
        const s = seed[i];
        s.t = (s.t + dt * s.v * speed) % 1;
        const a = s.a + s.t * (1.5 + charge * 4);
        const r = s.r * (1 - charge * 0.3 * s.t);
        pos.set([cx + Math.cos(a) * r, y0 + 0.1 + s.t * rise, cz + Math.sin(a) * r], i * 3);
      }
      sparkGeo.attributes.position.needsUpdate = true;
    },
  };
}
