/**
 * Bồng Lai tiên đảo (hồ sơ `docs/tham_khao/bong-lai.md`): pháp bảo Bát Tiên trên bệ, lâu thuyền Từ Phúc, đầu cự ngao
 * đội đảo, hạc trắng đứng, hươu trắng — "chim thú đều trắng" (Sử Ký). Thành ảo 海市蜃樓 (`mirage`) mờ hiện rồi tan.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { MirageSpec } from './spec';
import type { PropCollide } from './vat_truc';

type Updater = (dt: number) => void;

const BRONZE = '#8c6a3a';
const GOLD = '#d4a64a';
const WHITE = '#f4f2ec';
const CREST = '#c8322a';

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}


/** Bệ đá tròn + pháp bảo đồng viền kim. Va chạm tròn. */
function phapBao(g: THREE.Group, style: Style, text: string): PropCollide {
  put(g, new THREE.CylinderGeometry(0.55, 0.65, 0.9, 8), lambert(style.stone), 0, 0.45, 0);
  put(g, new THREE.CylinderGeometry(0.62, 0.62, 0.08, 8), lambert(GOLD), 0, 0.92, 0);
  const b = lambert(BRONZE);
  const y = 1;
  switch (text) {
    case '葫':
      put(g, new THREE.SphereGeometry(0.28, 8, 6), b, 0, y + 0.28, 0);
      put(g, new THREE.SphereGeometry(0.18, 8, 6), b, 0, y + 0.68, 0);
      break;
    case '扇': {
      const fan = put(g, new THREE.CircleGeometry(0.5, 10, 0, Math.PI), lambert(BRONZE, { side: THREE.DoubleSide }), 0, y + 0.15, 0);
      fan.rotation.x = -0.2;
      break;
    }
    case '板':
      for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.12, 0.8, 0.04), b, s * 0.08, y + 0.4, 0);
      break;
    case '笛': {
      const flute = put(g, new THREE.CylinderGeometry(0.04, 0.04, 1, 6), b, 0, y + 0.35, 0);
      flute.rotation.z = 1.1;
      break;
    }
    case '荷':
      put(g, new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), b, 0, y + 0.3, 0);
      put(g, new THREE.ConeGeometry(0.3, 0.3, 8).rotateX(Math.PI), lambert(GOLD), 0, y + 0.7, 0);
      break;
    case '籃':
      put(g, new THREE.CylinderGeometry(0.32, 0.22, 0.32, 8), b, 0, y + 0.16, 0);
      put(g, new THREE.TorusGeometry(0.28, 0.03, 4, 10, Math.PI), b, 0, y + 0.32, 0);
      break;
    case '劍': {
      const blade = put(g, new THREE.BoxGeometry(0.08, 1.1, 0.02), lambert(GOLD), 0, y + 0.6, 0);
      blade.rotation.z = 0.1;
      put(g, new THREE.BoxGeometry(0.3, 0.05, 0.06), b, 0, y + 0.12, 0);
      break;
    }
    default:
      put(g, new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), b, -0.1, y + 0.35, 0);
      put(g, new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), b, 0.1, y + 0.35, 0);
  }
  return { circle: 0.7 };
}

/** Lâu thuyền Từ Phúc (樓船): thân gỗ dài 12 m, lầu 2 tầng giữa thuyền, cột buồm + buồm cói rách. Va chạm hộp. */
function lauThuyen(g: THREE.Group, style: Style): PropCollide {
  const wood = lambert('#5a4632');
  const hull = new THREE.CylinderGeometry(1.6, 1.6, 12, 8, 1).rotateX(Math.PI / 2).scale(1, 0.55, 1);
  put(g, hull, wood, 0, 0.3, 0);
  put(g, new THREE.BoxGeometry(2.6, 0.2, 10), lambert(style.floor), 0, 0.95, 0);
  put(g, new THREE.BoxGeometry(2.2, 1.4, 3.6), lambert('#6a4a34'), 0, 1.75, -1.5);
  put(g, new THREE.BoxGeometry(2.8, 0.15, 4.2), lambert(style.ridge), 0, 2.5, -1.5);
  put(g, new THREE.BoxGeometry(1.6, 1, 2.4), lambert('#6a4a34'), 0, 3.05, -1.5);
  put(g, new THREE.ConeGeometry(1.5, 0.6, 4).rotateY(Math.PI / 4).scale(1, 1, 1.5), lambert(style.ridge), 0, 3.85, -1.5);
  put(g, new THREE.CylinderGeometry(0.1, 0.12, 7, 6), wood, 0, 4.3, 2.4);
  const sail = put(g, new THREE.PlaneGeometry(3.4, 4.2, 4, 4), lambert('#b49a6a', { side: THREE.DoubleSide }), 0, 4.8, 2.5);
  sail.rotation.y = 0.25;
  return { box: [3.4, 12.4] };
}

/** Đầu cự ngao bằng đá nhô dưới mép đảo — rùa đội núi (Liệt Tử). Không va chạm (đặt ngoài bục). */
function cuNgao(g: THREE.Group, style: Style): PropCollide {
  const rock = lambert(style.stone);
  put(g, new THREE.SphereGeometry(2.2, 9, 7).scale(1, 0.8, 1.4), rock, 0, 0, 0);
  put(g, new THREE.SphereGeometry(1.2, 8, 6).scale(1, 0.85, 1.3), rock, 0, 0.7, 2.6);
  for (const s of [-1, 1]) put(g, new THREE.SphereGeometry(0.2, 6, 4), lambert('#24323a'), s * 0.55, 1.2, 3.4);
  put(g, new THREE.SphereGeometry(4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 0.5, 1.4), lambert('#6f7d6a'), 0, -1.2, -4);
  return {};
}

/** Hạc trắng đứng một chân, cổ cong, mào đỏ (không bệ). Va chạm tròn nhỏ. */
function hac(g: THREE.Group): PropCollide {
  const white = lambert(WHITE);
  const black = lambert('#24323a');
  put(g, new THREE.CylinderGeometry(0.03, 0.03, 1.1, 4), black, 0, 0.55, 0);
  put(g, new THREE.SphereGeometry(0.3, 8, 6).scale(0.8, 0.75, 1.5), white, 0, 1.25, -0.05);
  put(g, new THREE.ConeGeometry(0.22, 0.4, 5).rotateX(-Math.PI / 2 - 0.4), black, 0, 1.2, -0.5);
  const neck = put(g, new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5), white, 0, 1.7, 0.3);
  neck.rotation.x = 0.35;
  put(g, new THREE.SphereGeometry(0.08, 6, 4), white, 0, 2.1, 0.45);
  put(g, new THREE.SphereGeometry(0.045, 5, 3), lambert(CREST), 0, 2.17, 0.45);
  const beak = put(g, new THREE.ConeGeometry(0.025, 0.28, 4), lambert('#8a8a7a'), 0, 2.08, 0.62);
  beak.rotation.x = Math.PI / 2;
  return { circle: 0.35 };
}

/** Hươu trắng cúi gặm cỏ, ngẩng lên chậm. Va chạm hộp. */
function huou(g: THREE.Group, seed: number, updaters: Updater[]): PropCollide {
  const white = lambert(WHITE);
  const antler = lambert('#c8b27a');
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) put(g, new THREE.CylinderGeometry(0.05, 0.04, 0.9, 4), white, sx * 0.18, 0.45, sz * 0.45);
  put(g, new THREE.SphereGeometry(0.35, 8, 6).scale(0.75, 0.75, 1.5), white, 0, 1.05, 0);
  const head = new THREE.Group();
  head.position.set(0, 1.2, 0.5);
  put(head, new THREE.CylinderGeometry(0.08, 0.12, 0.6, 5).translate(0, 0.3, 0), white, 0, 0, 0);
  put(head, new THREE.BoxGeometry(0.16, 0.16, 0.34), white, 0, 0.62, 0.1);
  for (const s of [-1, 1]) {
    const a = put(head, new THREE.CylinderGeometry(0.02, 0.025, 0.4, 4), antler, s * 0.08, 0.86, 0);
    a.rotation.z = s * 0.4;
  }
  head.traverse((o) => markDynamic(o));
  g.add(head);
  let t = seed;
  updaters.push((dt) => {
    t += dt;
    head.rotation.x = 0.3 + 1.2 * Math.max(0, Math.sin(t * 0.7)) ** 2;
  });
  return { box: [0.6, 1.4] };
}

/** Dựng vật Bồng Lai `kind`; kiểu lạ → null. */
export function bongLaiProp(kind: string, g: THREE.Group, style: Style, text: string | undefined, seed: number, updaters: Updater[]): PropCollide | null {
  switch (kind) {
    case 'phap-bao':
      return phapBao(g, style, text ?? '葫');
    case 'lau-thuyen':
      return lauThuyen(g, style);
    case 'cu-ngao':
      return cuNgao(g, style);
    case 'hac':
      return hac(g);
    case 'huou':
      return huou(g, seed, updaters);
    default:
      return null;
  }
}

/**
 * Thành ảo (海市蜃樓): cụm điện / tháp / tường thành nhạt màu trời nổi trên biển mây; độ mờ dao động 0 → 0,45 → 0 theo
 * chu kỳ `period` giây — "trông như có, tới gần thì tan". Một vật liệu chung → vài draw call; không va chạm.
 */
export function addMirages(scene: THREE.Scene, list: MirageSpec[]): Updater {
  const ups: Updater[] = [];
  for (const mg of list) {
    const mat = new THREE.MeshBasicMaterial({ color: '#cfd9e3', transparent: true, opacity: 0, depthWrite: false, fog: false });
    const g = new THREE.Group();
    g.position.set(mg.x, mg.y, mg.z);
    g.rotation.y = ((mg.rotY ?? 0) * Math.PI) / 180;
    const w = mg.width;
    // tường thành dài + 3 lầu + 1 tháp, tỉ lệ theo bề ngang
    put(g, new THREE.BoxGeometry(w, w * 0.08, w * 0.04), mat, 0, w * 0.04, 0);
    for (const [x, s] of [[-0.3, 1], [0, 1.4], [0.3, 1]] as const) {
      put(g, new THREE.BoxGeometry(w * 0.12 * s, w * 0.08 * s, w * 0.08 * s), mat, x * w, w * (0.08 + 0.04 * s), 0);
      put(g, new THREE.ConeGeometry(w * 0.1 * s, w * 0.05 * s, 4).rotateY(Math.PI / 4), mat, x * w, w * (0.08 + 0.105 * s), 0);
    }
    for (let i = 0; i < 4; i++) {
      put(g, new THREE.CylinderGeometry(w * (0.04 - i * 0.007), w * (0.045 - i * 0.007), w * 0.06, 8), mat, w * 0.42, w * (0.11 + i * 0.06), -w * 0.03);
    }
    g.traverse((o) => markDynamic(o));
    scene.add(g);
    const period = mg.period ?? 40;
    let t = 0;
    ups.push((dt) => {
      t += dt;
      const k = Math.sin((t / period) * Math.PI * 2) * 0.5 + 0.5; // 0…1
      mat.opacity = 0.45 * Math.max(0, k * 1.4 - 0.4);
      g.position.y = mg.y + Math.sin(t * 0.3) * 0.8;
    });
  }
  return (dt) => {
    for (const u of ups) u(dt);
  };
}
