/**
 * Catalog 3D kiến trúc (web/catalog.html, `npm run build:design`): bày các mẫu của bộ asset chuẩn
 * (`scene/kien_truc/danh_muc.ts`) thành lưới — mỗi hàng một mẫu, cột S / M / L — dựng bằng đúng code của app, nhân vật
 * đứng cạnh để so tỉ lệ, nhãn mã · cỡ · cấp · draw call · tam giác (đỏ khi vượt ngân sách theo cấp), chọn giọng vùng để
 * mái đổi dốc. Không vào app. Kế hoạch: docs/tasks/2026-11-14-catalog-kien-truc.md.
 *
 * Tham số URL: `?giong=tong|thanh|giang-nam|duong` · `?dot=1|2` (một đợt) · `?ma=<mã>` (chỉ một mẫu) · `?chup` (ẩn bảng) ·
 * `?cam=x,y,z&tam=x,z` (đặt camera).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { addEnvironment } from './scene/environment';
import { CO, GIONG, MAU, nganSach, type Co, type Giong } from './scene/kien_truc/danh_muc';
import { dungMau, MAU_DA_DUNG } from './scene/kien_truc/mau_nha';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { mergeStatic } from './scene/merge';
import { createStage } from './scene/renderer';
import { el } from './ui/dom';

/** Khoảng cách giữa các mẫu trong lưới (m). */
const GAP = 14;

interface Sample {
  ma: string;
  co: Co;
  cap: number;
  group: THREE.Group;
  /** điểm treo nhãn (trên đỉnh mẫu) */
  anchor: THREE.Vector3;
  drawCalls: number;
  tris: number;
  over: boolean;
  label: HTMLDivElement;
}

/** Đếm draw call (số khối vẽ) + tam giác của một nhóm đã gộp. */
function measure(g: THREE.Object3D): { drawCalls: number; tris: number } {
  let drawCalls = 0;
  let tris = 0;
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || !o.visible) return;
    drawCalls++;
    const geo = o.geometry as THREE.BufferGeometry;
    const per = geo.index ? geo.index.count : geo.attributes.position.count;
    tris += (per / 3) * (o instanceof THREE.InstancedMesh ? o.count : 1);
  });
  return { drawCalls, tris: Math.round(tris) };
}

async function boot(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const { spec } = loadScene(HOME_SCENE);
  await Promise.allSettled([document.fonts.load('700 72px Lora'), document.fonts.load('700 13px "Be Vietnam Pro"')]);
  const giong = (GIONG as readonly string[]).includes(params.get('giong') ?? '') ? (params.get('giong') as Giong) : 'tong';
  const only = params.get('ma');
  const dot = Number(params.get('dot')) || 0;
  const canvas = el<HTMLCanvasElement>('stage');
  const { renderer, scene, camera } = createStage(canvas, 50, 900);
  addEnvironment(scene, spec);
  scene.fog = null; // lưới rộng: sương che hàng xa
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshLambertMaterial({ color: '#8f9478' }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const mauList = MAU.filter((m) => MAU_DA_DUNG.includes(m.ma) && (!only || m.ma === only) && (!dot || m.dot === dot));
  const colX = (i: number): number => i * (35 + GAP); // cột S / M / L: rộng nhất (điện L 29 m) + khe
  const labels = el('labels');
  const samples: Sample[] = [];
  let z = 0;
  for (const m of mauList) {
    const depth = Math.max(...CO.map((c) => m.co[c]?.d ?? 0)) + 8; // + nền, mái đua, bậc
    z -= depth / 2;
    CO.forEach((co, i) => {
      const c = m.co[co];
      if (!c) return;
      const g = dungMau(m.ma, co, giong, { ...spec.buildingStyle, heightScale: 1 });
      if (!g) return;
      g.position.set(colX(i), 0, z);
      scene.add(g);
      mergeStatic(g, new Set());
      const { drawCalls, tris } = measure(g);
      const budget = nganSach(c.cap);
      const box = new THREE.Box3().setFromObject(g);
      // nhân vật đứng trước mép phải mẫu, nhìn ra camera
      const ch = createDiscipleCharacter();
      ch.root.position.set(box.max.x + 1.5, 0, box.max.z - 1);
      scene.add(ch.root);
      const label = document.createElement('div');
      label.className = 'lbl';
      // khối cùng màu của mọi nhà trong cảnh gộp chung một lần vẽ (merge.ts) → ngân sách thật của một mẫu là tam giác;
      // số màu (= số lần vẽ riêng của mẫu) chỉ để biết mẫu có thêm màu lạ ngoài bảng màu chung không
      const over = tris > budget.tris;
      if (over) label.classList.add('bad');
      label.textContent = `${m.ma} · ${co} · C${c.cap}`;
      const small = document.createElement('small');
      small.textContent = `${c.gian} gian · ${c.w} × ${c.d} m · ${drawCalls} màu · ${(tris / 1000).toFixed(1)}k / ${budget.tris / 1000}k △`;
      label.append(small);
      labels.append(label);
      samples.push({
        ma: m.ma,
        co,
        cap: c.cap,
        group: g,
        anchor: new THREE.Vector3(colX(i), box.max.y + 1.2, z),
        drawCalls,
        tris,
        over,
        label,
      });
    });
    z -= depth / 2 + GAP;
  }

  /* ---------- bảng ---------- */
  const panel = el('panel');
  el('collapse').addEventListener('click', (e) => {
    const collapsed = panel.toggleAttribute('data-collapsed');
    (e.currentTarget as HTMLButtonElement).textContent = collapsed ? 'Mở' : 'Thu gọn';
  });
  for (const b of el('pickGiong').querySelectorAll<HTMLButtonElement>('button')) {
    b.setAttribute('aria-pressed', String(b.dataset.giong === giong));
    b.addEventListener('click', () => {
      const p = new URLSearchParams(location.search);
      p.set('giong', b.dataset.giong ?? 'tong');
      location.search = p.toString();
    });
  }
  for (const b of el('pickDot').querySelectorAll<HTMLButtonElement>('button')) {
    b.setAttribute('aria-pressed', String(Number(b.dataset.dot) === dot));
    b.addEventListener('click', () => {
      const p = new URLSearchParams(location.search);
      if (b.dataset.dot) p.set('dot', b.dataset.dot);
      else p.delete('dot');
      location.search = p.toString();
    });
  }
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  const flyTo = (s: Sample): void => {
    const b = new THREE.Box3().setFromObject(s.group);
    const size = b.getSize(new THREE.Vector3());
    const c = b.getCenter(new THREE.Vector3());
    const dist = Math.max(size.x, size.y, size.z) * 1.4 + 6;
    camera.position.set(c.x + dist * 0.55, Math.max(4, size.y * 0.6 + dist * 0.35), c.z + dist * 0.85);
    controls.target.set(c.x, size.y * 0.35, c.z);
  };
  const list = el('list');
  for (const m of mauList) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = `${m.ma} — ${m.ten}${m.dot > 1 ? ` · đợt ${m.dot}` : ''}`;
    tr.append(name);
    for (const co of CO) {
      const td = document.createElement('td');
      const s = samples.find((x) => x.ma === m.ma && x.co === co);
      if (s) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = `${co} ${s.drawCalls}/${(s.tris / 1000).toFixed(1)}k`;
        if (s.over) b.classList.add('bad');
        b.addEventListener('click', () => flyTo(s));
        td.append(b);
      }
      tr.append(td);
    }
    list.append(tr);
  }
  const over = samples.filter((s) => s.over).length;
  el('stats').textContent = `${samples.length} mẫu · ${over} vượt ngân sách tam giác · giọng ${giong}${dot ? ` · đợt ${dot}` : ''}`;

  /* ---------- camera ---------- */
  const span = new THREE.Box3();
  for (const s of samples) span.expandByObject(s.group);
  const mid = span.getCenter(new THREE.Vector3());
  camera.position.set(mid.x + 60, 70, span.max.z + 60);
  controls.target.copy(mid).setY(0);
  if (samples.length === 1 || only) flyTo(samples[0]);
  const nums = (key: string): number[] => (params.get(key) ?? '').split(',').map(Number);
  const [cx, cy, cz] = nums('cam');
  const [tx, tz] = nums('tam');
  if ([cx, cy, cz, tx, tz].every(Number.isFinite)) {
    camera.position.set(cx, cy, cz);
    controls.target.set(tx, 2, tz);
  }
  if (params.has('chup')) panel.hidden = true;

  /* ---------- vòng lặp: nhãn bám mẫu ---------- */
  const v = new THREE.Vector3();
  function tick(): void {
    controls.update();
    renderer.render(scene, camera);
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const s of samples) {
      v.copy(s.anchor).project(camera);
      // nhãn mẫu xa camera ẩn bớt cho đỡ chồng chéo
      const show = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 && camera.position.distanceTo(s.anchor) < 110;
      s.label.style.display = show ? '' : 'none';
      if (show) {
        s.label.style.left = `${((v.x + 1) / 2) * w}px`;
        s.label.style.top = `${((1 - v.y) / 2) * h}px`;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

void boot();
