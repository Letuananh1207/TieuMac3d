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
export type ScrollPlaceState = 'mo' | 'oDay' | 'sapMo';
export interface ScrollMap {
  width: number;
  height: number;
  places: ScrollPlace[];
  style: Record<string, unknown>;
}

// ảnh giấy: Vite chép vào bản build, trả đường dẫn (chạy offline — không mạng)
const imgFound = import.meta.glob('../../../design/scene/ban-do/ban-do-goc.png', { eager: true, query: '?url', import: 'default' });
const PAPER_URL = Object.values(imgFound)[0] as string | undefined;
// đầu nhân vật chính cho ghim "đang ở đây" (thiết kế 2026-11-14.2)
const pinFound = import.meta.glob('../../../design/scene/ban-do/ban-do-nhan-vat.png', { eager: true, query: '?url', import: 'default' });
const PIN_URL = Object.values(pinFound)[0] as string | undefined;

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

/** Huy hiệu tròn đồng hồ (nơi sắp mở — chưa có cảnh). */
function clockBadge(g: CanvasRenderingContext2D, x: number, y: number, r: number, bg: string, line: string): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = bg;
  g.fill();
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
}

export interface MapScroll {
  readonly isOpen: boolean;
  /** bay lên từ `from` (tâm vòng trận) và mở ra; trạng thái từng nơi vẽ lên giấy */
  open(from: THREE.Vector3, states: Record<string, ScrollPlaceState>): void;
  close(): void;
  /** viền huy hiệu đồng hồ của nơi sắp mở vừa chạm nhấp nháy son */
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
  let pinImg: HTMLImageElement | null = null;
  if (PIN_URL) {
    const im = new Image();
    im.onload = () => {
      pinImg = im;
      redraw();
    };
    im.src = PIN_URL;
  }
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
  const flashDur = num(map.style, ['vuaCham', 'nhapNhay', 'giay'], 0.6);
  const flashTimes = num(map.style, ['vuaCham', 'nhapNhay', 'lan'], 2);

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
    // thiết kế 2026-11-14.2: không vòng tròn quanh nơi nào; `mo` không vẽ gì
    for (const p of map.places) {
      const st = states[p.id] ?? 'sapMo';
      if (st === 'oDay') drawPin(p.x, p.y);
      if (st === 'sapMo') {
        const bx = p.x + num(s, ['sapMo', 'huyHieu', 'dx'], 100);
        const by = p.y + num(s, ['sapMo', 'huyHieu', 'dy'], -100);
        const br = num(s, ['sapMo', 'huyHieu', 'r'], 40);
        clockBadge(g, bx, by, br, str(s, ['sapMo', 'huyHieu', 'nen'], '#F4F7F6'), str(s, ['sapMo', 'huyHieu', 'vien'], COLORS.jade));
        // vừa chạm: viền huy hiệu son nhấp nháy (hiện ở nửa đầu mỗi lần nháy)
        if (p.id === flashId && flashT > 0 && Math.floor((flashT / flashDur) * flashTimes * 2) % 2 === 0) {
          ring(bx, by, br, num(s, ['sapMo', 'huyHieu', 'net'], 6) * 1.4, str(s, ['vuaCham', 'huyHieu', 'vien'], '#A8322A'));
        }
      }
    }
    tex.needsUpdate = true;
  }

  /** nơi đang ở: ghim tròn đầu nhân vật chính, đuôi chỉ xuống (số đo `oDay.ghim`) */
  function drawPin(x: number, y: number): void {
    const s = map.style;
    const k = (key: string, d: number): number => num(s, ['oDay', 'ghim', key], d);
    const c = (key: string, d: string): string => str(s, ['oDay', 'ghim', key], d);
    const cx = x + k('dx', -110);
    const cy = y + k('dy', -60);
    const r = k('r', 80);
    const net = k('net', 8);
    const tail = num(s, ['oDay', 'ghim', 'duoi', 'dai'], 30);
    const half = num(s, ['oDay', 'ghim', 'duoi', 'rong'], 48) / 2;
    g.save();
    g.fillStyle = str(s, ['oDay', 'ghim', 'bong', 'mau'], 'rgba(36,50,58,.22)');
    g.beginPath();
    g.ellipse(cx, cy + r + tail + 6, num(s, ['oDay', 'ghim', 'bong', 'rx'], 26), num(s, ['oDay', 'ghim', 'bong', 'ry'], 8), 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = c('vien', COLORS.jade);
    g.beginPath();
    g.moveTo(cx - half, cy + r - 12);
    g.lineTo(cx, cy + r + tail);
    g.lineTo(cx + half, cy + r - 12);
    g.closePath();
    g.fill();
    for (const [rr, col] of [
      [r + net + k('netNgoai', 4), c('vienNgoai', COLORS.gold)],
      [r + net, c('vien', COLORS.jade)],
      [r, c('nen', '#F4F7F6')],
    ] as const) {
      g.fillStyle = col;
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.fill();
    }
    if (pinImg) {
      g.clip();
      g.drawImage(pinImg, cx - r * 1.08, cy - r * 1.02, r * 2.16, r * 2.16);
    }
    g.restore();
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
