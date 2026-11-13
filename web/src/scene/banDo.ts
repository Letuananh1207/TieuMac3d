/**
 * Cuộn bản đồ truyền tống — vật 3D (R-HANH-2, thiết kế 2026-11-13.9 "Bản đồ truyền tống"). Giấy = ảnh
 * `design/scene/ban-do/ban-do-goc.png` + lớp trạng thái code vẽ theo `ban-do.json`; hai trục `scroll-wood` đầu ngọc viền
 * vàng. Mở: bay lên từ vòng trận rồi trải ra trước camera (dọc: rộng 97 % màn, tâm ở 40 % chiều cao; ngang: cao 76 %).
 * Vẽ đè lên cảnh (không so độ sâu) + một tấm tối 28 % phía sau. Khi mở: +4 draw call (tối, giấy, trục, đầu trục).
 */
import * as THREE from 'three';
import { lambert } from './materials';
import { markDynamic } from './merge';

/** Dạng dữ liệu bản đồ (trùng `zones/journeyMap.ts` — scene/ không import zones/). */
export interface ScrollPlace {
  id: string;
  x: number;
  y: number;
  r: number;
}
export type ScrollPlaceState = 'mo' | 'oDay' | 'sapMo' | 'khoa';
export interface ScrollMap {
  width: number;
  height: number;
  places: ScrollPlace[];
  style: Record<string, unknown>;
}

// ảnh giấy: Vite chép vào bản build, trả đường dẫn (chạy offline — không mạng)
const imgFound = import.meta.glob('../../../design/scene/ban-do/ban-do-goc.png', { eager: true, query: '?url', import: 'default' });
const PAPER_URL = Object.values(imgFound)[0] as string | undefined;

const PAPER_W = 6; // bề rộng giấy trong cảnh (m), cỡ thật ≈ 6 × 3,4 m
const ROD_D = PAPER_W / 25; // trục dày ≈ 1/25 bề rộng (đặc tả)
const RISE_S = 0.45; // bay lên
const UNROLL_S = 0.5; // trải giấy
const DIM = 0.28; // cảnh tối 28 % (slate, như artboard)
const COLORS = { wood: '#3A2418', jade: '#2B5446', gold: '#D4A64A', press: '#1F4035' };

type Phase = 'dong' | 'bay' | 'trai' | 'mo' | 'cuon';

/** Đọc số trong `style` an toàn (dữ liệu thiết kế), thiếu → `d`. */
function num(o: unknown, path: string[], d: number): number {
  let v: unknown = o;
  for (const k of path) v = typeof v === 'object' && v !== null ? (v as Record<string, unknown>)[k] : undefined;
  return typeof v === 'number' ? v : d;
}
function str(o: unknown, path: string[], d: string): string {
  let v: unknown = o;
  for (const k of path) v = typeof v === 'object' && v !== null ? (v as Record<string, unknown>)[k] : undefined;
  return typeof v === 'string' ? v : d;
}

/** Huy hiệu tròn: đồng hồ (sắp mở) hoặc khoá. */
function badge(g: CanvasRenderingContext2D, x: number, y: number, r: number, kind: 'dong-ho' | 'khoa', bg: string, line: string): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = bg;
  g.fill();
  if (kind === 'dong-ho') {
    g.lineWidth = r * 0.16;
    g.strokeStyle = line;
    g.stroke();
    g.beginPath();
    g.arc(x, y, r * 0.62, 0, Math.PI * 2);
    g.lineWidth = r * 0.12;
    g.stroke();
    g.beginPath();
    g.moveTo(x, y - r * 0.4);
    g.lineTo(x, y);
    g.lineTo(x + r * 0.3, y + r * 0.2);
    g.stroke();
  } else {
    g.fillStyle = '#F4F7F6';
    g.fillRect(x - r * 0.42, y - r * 0.05, r * 0.84, r * 0.6);
    g.beginPath();
    g.arc(x, y - r * 0.05, r * 0.27, Math.PI, 0);
    g.lineWidth = r * 0.14;
    g.strokeStyle = '#F4F7F6';
    g.stroke();
  }
}

export interface MapScroll {
  readonly isOpen: boolean;
  /** bay lên từ `from` (tâm vòng trận) và mở ra; trạng thái từng nơi vẽ lên giấy */
  open(from: THREE.Vector3, states: Record<string, ScrollPlaceState>): void;
  close(): void;
  /** vòng son nhấp nháy quanh nơi khoá vừa chạm */
  flash(placeId: string): void;
  /** chạm ở (clientX, clientY) trúng giấy ở toạ độ px nào (đã mở xong); không trúng → `null` */
  pick(clientX: number, clientY: number): { px: number; py: number } | null;
  update(dt: number): void;
}

export function createMapScroll(scene: THREE.Scene, camera: THREE.PerspectiveCamera, map: ScrollMap): MapScroll {
  const ratio = map.height / map.width;
  const paperH = PAPER_W * ratio;

  // giấy: canvas = ảnh gốc + trạng thái; vẽ lại khi đổi trạng thái / nhấp nháy
  const canvas = document.createElement('canvas');
  canvas.width = map.width;
  canvas.height = map.height;
  const g = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  let img: HTMLImageElement | null = null;
  if (PAPER_URL) {
    const im = new Image();
    im.onload = () => {
      img = im;
      redraw();
    };
    im.src = PAPER_URL;
  }

  // vẽ đè lên cảnh: không so độ sâu, không sương, vào lượt trong suốt (sắp theo renderOrder → sau hạt sáng của vòng)
  const over = { depthTest: false, depthWrite: false, fog: false, transparent: true };
  const root = new THREE.Group();
  root.visible = false;
  root.renderOrder = 20;
  markDynamic(root);

  // tấm tối phía sau cuộn, phủ kín tầm nhìn
  const dimMat = new THREE.MeshBasicMaterial({ color: '#24323A', opacity: 0, ...over });
  const dim = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), dimMat);
  dim.renderOrder = 20;
  scene.add(dim);
  dim.visible = false;
  markDynamic(dim);

  const paperMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, ...over });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PAPER_W, paperH), paperMat);
  paper.renderOrder = 21;
  root.add(paper);

  const rodLen = paperH * 1.12;
  const rodGeo = new THREE.CylinderGeometry(ROD_D / 2, ROD_D / 2, rodLen, 12);
  const capGeo = new THREE.CylinderGeometry(ROD_D * 0.75, ROD_D * 0.75, ROD_D * 0.9, 12);
  const rimGeo = new THREE.TorusGeometry(ROD_D * 0.75, ROD_D * 0.12, 6, 16).rotateX(Math.PI / 2);
  const rodMat = lambert(COLORS.wood, over);
  const capMat = lambert(COLORS.jade, over);
  const rimMat = lambert(COLORS.gold, over);
  const rods: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const r = new THREE.Group();
    const rod = new THREE.Mesh(rodGeo, rodMat);
    r.add(rod);
    for (const end of [-1, 1]) {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = end * (rodLen / 2 + ROD_D * 0.4);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.y = cap.position.y;
      r.add(cap, rim);
    }
    r.userData.side = side;
    r.traverse((o) => (o.renderOrder = 22));
    rods.push(r);
    root.add(r);
  }
  scene.add(root);

  let states: Record<string, ScrollPlaceState> = {};
  let flashId: string | null = null;
  let flashT = 0;
  const flashDur = num(map.style, ['khoaVuaCham', 'nhapNhay', 'giay'], 0.6);
  const flashTimes = num(map.style, ['khoaVuaCham', 'nhapNhay', 'lan'], 2);

  function ring(x: number, y: number, r: number, w: number, color: string, alpha = 1, dash: number[] = []): void {
    g.save();
    g.globalAlpha = alpha;
    g.setLineDash(dash);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.lineWidth = w;
    g.strokeStyle = color;
    g.stroke();
    g.restore();
  }

  function redraw(): void {
    const s = map.style;
    g.clearRect(0, 0, map.width, map.height);
    if (img) g.drawImage(img, 0, 0, map.width, map.height);
    else {
      g.fillStyle = '#F2EADA'; // map-paper khi chưa nạp xong ảnh
      g.fillRect(0, 0, map.width, map.height);
    }
    for (const p of map.places) {
      const st = states[p.id] ?? 'khoa';
      if (st === 'mo' || st === 'oDay') {
        ring(p.x, p.y, num(s, ['mo', 'vong', 'r'], p.r), num(s, ['mo', 'vong', 'net'], 10), str(s, ['mo', 'vong', 'mau'], COLORS.jade));
        g.beginPath();
        g.arc(p.x + num(s, ['mo', 'cham', 'dx'], 0), p.y + num(s, ['mo', 'cham', 'dy'], -150), num(s, ['mo', 'cham', 'r'], 12), 0, Math.PI * 2);
        g.fillStyle = str(s, ['mo', 'cham', 'mau'], COLORS.gold);
        g.fill();
      }
      if (st === 'oDay') {
        const side = num(s, ['oDay', 'trien', 'canh'], 84);
        const x0 = p.x + num(s, ['oDay', 'trien', 'dx'], -160);
        const y0 = p.y + num(s, ['oDay', 'trien', 'dy'], -175);
        g.fillStyle = str(s, ['oDay', 'trien', 'mau'], '#A8322A');
        g.fillRect(x0, y0, side, side);
        g.fillStyle = str(s, ['oDay', 'trien', 'chuMau'], '#F4F7F6');
        g.font = `700 ${num(s, ['oDay', 'trien', 'coChu'], 58)}px "Han Serif", serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(str(s, ['oDay', 'trien', 'chu'], '此'), x0 + side / 2, y0 + side / 2 + 3);
      }
      if (st === 'sapMo') {
        const gach = (s.sapMo as { vongDut?: { gach?: number[] } } | undefined)?.vongDut?.gach ?? [26, 18];
        ring(p.x, p.y, num(s, ['sapMo', 'vongDut', 'r'], p.r), num(s, ['sapMo', 'vongDut', 'net'], 8), str(s, ['sapMo', 'vongDut', 'mau'], COLORS.jade), 1, gach);
        badge(g, p.x + num(s, ['sapMo', 'huyHieu', 'dx'], 100), p.y + num(s, ['sapMo', 'huyHieu', 'dy'], -100), num(s, ['sapMo', 'huyHieu', 'r'], 40), 'dong-ho', str(s, ['sapMo', 'huyHieu', 'nen'], '#F4F7F6'), str(s, ['sapMo', 'huyHieu', 'vien'], COLORS.jade));
      }
      if (st === 'khoa') {
        g.beginPath();
        g.arc(p.x, p.y, num(s, ['khoa', 'dia', 'r'], p.r), 0, Math.PI * 2);
        g.fillStyle = str(s, ['khoa', 'dia', 'mau'], 'rgba(242,234,218,.72)');
        g.fill();
        badge(g, p.x + num(s, ['khoa', 'huyHieu', 'dx'], 100), p.y + num(s, ['khoa', 'huyHieu', 'dy'], -100), num(s, ['khoa', 'huyHieu', 'r'], 40), 'khoa', str(s, ['khoa', 'huyHieu', 'nen'], '#24323A'), '#F4F7F6');
      }
      // vừa chạm nơi khoá / sắp mở: vòng son nhấp nháy (hiện ở nửa đầu mỗi lần nháy)
      if (p.id === flashId && flashT > 0 && Math.floor((flashT / flashDur) * flashTimes * 2) % 2 === 0) {
        ring(p.x, p.y, num(s, ['khoaVuaCham', 'vong', 'r'], 150), num(s, ['khoaVuaCham', 'vong', 'net'], 10), str(s, ['khoaVuaCham', 'vong', 'mau'], '#A8322A'));
        ring(p.x, p.y, num(s, ['khoaVuaCham', 'vongMo', 'r'], 172), num(s, ['khoaVuaCham', 'vongMo', 'net'], 6), str(s, ['khoaVuaCham', 'vong', 'mau'], '#A8322A'), num(s, ['khoaVuaCham', 'vongMo', 'alpha'], 0.45));
      }
    }
    tex.needsUpdate = true;
  }

  // vị trí đích trước camera (tính lại mỗi khung — camera còn trượt nhẹ theo nhân vật)
  const fwd = new THREE.Vector3();
  const up = new THREE.Vector3();
  const target = new THREE.Vector3();
  function placeTarget(): number {
    const vh = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2); // nửa chiều cao nhìn thấy ở khoảng cách 1
    const portrait = camera.aspect < 1;
    const totalW = PAPER_W + ROD_D * 2;
    const totalH = rodLen + ROD_D * 1.8;
    const d = portrait ? totalW / (0.97 * 2 * vh * camera.aspect) : totalH / (0.76 * 2 * vh);
    const ndcY = portrait ? 0.2 : 0.17; // tâm cuộn: dọc ở 40 %, ngang ở 41,5 % chiều cao (tính từ trên) — BanDo-doc / -ngang
    camera.getWorldDirection(fwd);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    target.copy(camera.position).addScaledVector(fwd, d).addScaledVector(up, ndcY * vh * d);
    // tấm tối: ngay trước camera, đủ phủ màn
    dim.position.copy(camera.position).addScaledVector(fwd, camera.near * 4);
    dim.quaternion.copy(camera.quaternion);
    dim.scale.set(camera.near * 4 * vh * 2 * camera.aspect * 1.2, camera.near * 4 * vh * 2 * 1.2, 1);
    return d;
  }

  let phase: Phase = 'dong';
  let t = 0;
  const from = new THREE.Vector3();
  const ease = (x: number): number => 1 - (1 - x) ** 3;

  /** trải giấy theo `k` 0..1: giấy co theo bề ngang, chỉ hiện phần giữa ảnh, hai trục ở hai mép */
  function unroll(k: number): void {
    const w = Math.max(0.02, k);
    paper.scale.x = w;
    tex.repeat.x = w;
    tex.offset.x = (1 - w) / 2;
    for (const r of rods) r.position.x = (r.userData.side as number) * ((PAPER_W * w) / 2 + ROD_D / 2);
  }

  function pose(): void {
    placeTarget();
    root.quaternion.copy(camera.quaternion);
    let rise = 1;
    let open = 1;
    if (phase === 'bay') {
      rise = ease(Math.min(1, t / RISE_S));
      open = 0;
    } else if (phase === 'trai') {
      open = ease(Math.min(1, t / UNROLL_S));
    } else if (phase === 'cuon') {
      const k = Math.min(1, t / (UNROLL_S * 0.8));
      open = 1 - ease(k);
      rise = 1 - ease(Math.max(0, (t - UNROLL_S * 0.5) / RISE_S));
    }
    root.position.lerpVectors(from, target, rise);
    root.scale.setScalar(0.35 + 0.65 * rise);
    unroll(open);
    dimMat.opacity = DIM * (phase === 'cuon' ? 1 - Math.min(1, t / (UNROLL_S + RISE_S)) : phase === 'bay' ? rise : 1);
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  return {
    get isOpen() {
      return phase !== 'dong';
    },
    open(start, st) {
      states = st;
      flashId = null;
      redraw();
      from.copy(start).add(new THREE.Vector3(0, 0.6, 0));
      phase = 'bay';
      t = 0;
      root.visible = true;
      dim.visible = true;
      pose();
    },
    close() {
      if (phase === 'dong' || phase === 'cuon') return;
      phase = 'cuon';
      t = 0;
    },
    flash(id) {
      flashId = id;
      flashT = flashDur;
      redraw();
    },
    pick(x, y) {
      if (phase !== 'mo') return null;
      ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(paper, false)[0];
      if (!hit?.uv) return null;
      return { px: hit.uv.x * map.width, py: (1 - hit.uv.y) * map.height };
    },
    update(dt) {
      if (phase === 'dong') return;
      t += dt;
      if (phase === 'bay' && t >= RISE_S) {
        phase = 'trai';
        t = 0;
      } else if (phase === 'trai' && t >= UNROLL_S) {
        phase = 'mo';
        t = 0;
      } else if (phase === 'cuon' && t >= UNROLL_S * 0.5 + RISE_S) {
        phase = 'dong';
        root.visible = false;
        dim.visible = false;
        return;
      }
      if (flashT > 0) {
        flashT = Math.max(0, flashT - dt);
        redraw();
      }
      pose();
    },
  };
}
