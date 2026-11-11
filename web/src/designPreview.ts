/**
 * Canvas 3D: trang xem thiết kế cảnh (web/design.html, `npm run build:design`). Dựng cảnh bằng đúng code của app
 * từ đặc tả `design/scene/scene.json`, thêm camera bay tự do và lớp phủ (va chạm, vùng, lưới, toạ độ).
 * Không vào app — xem decisions/0002-thiet-ke-3d.md.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import { Colliders } from './collision/colliders';
import { OrbitCamera } from './input/orbitCamera';
import { createBlockCharacter } from './player/blockCharacter';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { SCENE, SCENE_FILE } from './scene/loadSpec';
import { viewDistance } from './scene/farMountains';
import { createStage } from './scene/renderer';
import { buildWorld } from './scene/world';
import { el } from './ui/dom';
import { placeZones, ZONE_CONTENT } from './zones/zones';

const fmt = (v: number): string => v.toFixed(1).replace('.', ',').replace('-', '−');

function li(text: string, cls?: string): HTMLLIElement {
  const e = document.createElement('li');
  e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

async function boot(): Promise<void> {
  await Promise.allSettled([document.fonts.load('700 72px Lora'), document.fonts.load('700 13px "Be Vietnam Pro"')]);
  const { spec } = SCENE;
  const canvas = el<HTMLCanvasElement>('stage');
  // nhìn từ trên: đủ cao để thấy cả sân / cả vùng địa hình
  const topHeight = Math.max(spec.walls.half * 3, spec.ground.size * 0.9, spec.terrain.enabled ? spec.terrain.size * 0.9 : 0);
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, Math.max(viewDistance(spec), topHeight + 60));
  const colliders = new Colliders();
  const world = buildWorld(scene, colliders, spec);
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);

  // ?nhan-vat=gau → gấu khối cũ (so sánh); mặc định đệ tử như app
  const character =
    new URLSearchParams(location.search).get('nhan-vat') === 'gau' ? createBlockCharacter() : createDiscipleCharacter();
  const [sx, sz] = spec.player.start;
  const startY = world.heightfield?.heightAt(sx, sz);
  character.root.position.set(sx, Number.isFinite(startY) ? (startY as number) : 0, sz);
  scene.add(character.root);

  /* ---------- bảng: nguồn + lỗi đặc tả ---------- */
  el('source').textContent = SCENE.fromFile
    ? `Đọc từ ${SCENE_FILE}`
    : `Chưa có ${SCENE_FILE} — đang xem cảnh mặc định trong code (web/src/scene/spec.ts)`;
  const problems = [...SCENE.problems, ...placed.problems];
  const box = el('problems');
  if (problems.length === 0) {
    const ok = document.createElement('div');
    ok.className = 'ok';
    ok.textContent = 'Không có lỗi.';
    box.replaceChildren(ok);
  } else {
    const ul = document.createElement('ul');
    ul.append(...problems.map((p) => li(p, 'bad')));
    box.replaceChildren(ul);
  }
  el('zones').replaceChildren(
    ...placed.zones.map((z) => li(`${z.id}: tâm (${fmt(z.x)}; ${fmt(z.z)}), bán kính ${fmt(z.r)}`)),
  );
  const panel = el('panel');
  el('collapse').addEventListener('click', (e) => {
    const collapsed = panel.toggleAttribute('data-collapsed');
    (e.currentTarget as HTMLButtonElement).textContent = collapsed ? 'Mở' : 'Thu gọn';
  });

  /* ---------- lớp phủ ---------- */
  const colliderLayer = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0xff4d3d });
  for (const b of colliders.boxes) {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.maxX - b.minX, 1.2, b.maxZ - b.minZ));
    const m = new THREE.LineSegments(geo, lineMat);
    m.position.set((b.minX + b.maxX) / 2, 0.6, (b.minZ + b.maxZ) / 2);
    colliderLayer.add(m);
  }
  for (const c of colliders.circles) {
    const geo = new THREE.EdgesGeometry(new THREE.CylinderGeometry(c.r, c.r, 1.2, 32));
    const m = new THREE.LineSegments(geo, lineMat);
    m.position.set(c.x, 0.6, c.z);
    colliderLayer.add(m);
  }
  const zoneLayer = new THREE.Group();
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0xe0ae4c, side: THREE.DoubleSide });
  for (const z of placed.zones) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(z.r - 0.1, z.r, 48), zoneMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(z.x, 0.04, z.z);
    zoneLayer.add(ring);
  }
  const gridLayer = new THREE.Group();
  const grid = new THREE.GridHelper(spec.ground.size, spec.ground.size, 0xe0ae4c, 0x5a4a3a);
  grid.position.y = 0.02;
  gridLayer.add(grid, new THREE.AxesHelper(6));
  gridLayer.visible = false;
  scene.add(colliderLayer, zoneLayer, gridLayer);
  const bindToggle = (id: string, layer: THREE.Object3D): void => {
    const input = el<HTMLInputElement>(id);
    layer.visible = input.checked;
    input.addEventListener('change', () => (layer.visible = input.checked));
  };
  bindToggle('showColliders', colliderLayer);
  bindToggle('showZones', zoneLayer);
  bindToggle('showGrid', gridLayer);

  /* ---------- camera bay tự do + góc nhìn có sẵn ---------- */
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.02; // không chui xuống dưới mặt sân
  const playerView = (far: boolean): void => {
    scene.fog = fog;
    const orbit = new OrbitCamera(spec.camera);
    if (far) orbit.toggleView();
    const focus = character.root.position;
    orbit.update(camera, focus, 0, true);
    controls.target.set(focus.x, focus.y + 1.2, focus.z);
  };
  el('viewPlayer').addEventListener('click', () => playerView(false));
  el('viewYard').addEventListener('click', () => playerView(true));
  const fog = scene.fog;
  const topView = (): void => {
    scene.fog = null; // nhìn từ trên cao: sương che hết cảnh
    camera.position.set(0, topHeight, 0.01);
    controls.target.set(0, 0, 0);
  };
  el('viewTop').addEventListener('click', topView);
  // ?view=tren | ca-san (mặc định góc chơi) — để chụp ảnh cảnh tự động
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view === 'tren') topView();
  else playerView(view === 'ca-san');
  // ?cam=x,y,z&tam=x,z — đặt camera nhìn vào một điểm (chụp chi tiết một nhà / vật)
  const nums = (key: string): number[] => (params.get(key) ?? '').split(',').map(Number);
  const [cx, cy, cz] = nums('cam');
  const [tx, tz] = nums('tam');
  if ([cx, cy, cz, tx, tz].every(Number.isFinite)) {
    camera.position.set(cx, cy, cz);
    controls.target.set(tx, 1.5, tz);
  }

  /* ---------- chạm mặt sân → toạ độ ---------- */
  const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 8), new THREE.MeshBasicMaterial({ color: 0x7bc86c }));
  marker.visible = false;
  scene.add(marker);
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(world.ground)[0];
    if (!hit) return;
    marker.position.set(hit.point.x, 1, hit.point.z);
    marker.visible = true;
    el('pick').textContent = `x ${fmt(hit.point.x)} · z ${fmt(hit.point.z)}`;
  });

  /* ---------- vòng lặp ---------- */
  const stats = el('stats');
  const layers = [colliderLayer, zoneLayer, gridLayer, marker];
  /** Đo đúng số app sẽ vẽ: vẽ thử một lần với lớp phủ tắt, đọc số, rồi bật lại. */
  function measure(fps: string): void {
    const shown = layers.map((l) => l.visible);
    for (const l of layers) l.visible = false;
    renderer.render(scene, camera);
    const { calls, triangles } = renderer.info.render;
    layers.forEach((l, i) => (l.visible = shown[i]));
    renderer.render(scene, camera);
    stats.textContent =
      `${calls} draw call · ${triangles.toLocaleString('vi-VN')} tam giác (không tính lớp phủ) · ` +
      `${colliders.boxes.length + colliders.circles.length} vật cản · ${fps} fps`;
  }
  let acc = 0;
  let frames = 0;
  let first = true;
  const clock = new THREE.Clock();
  function tick(): void {
    const dt = Math.min(clock.getDelta(), 0.05);
    controls.update();
    world.update(dt);
    character.animate(dt, 0);
    renderer.render(scene, camera);
    acc += dt;
    frames++;
    if (first || acc > 0.5) {
      measure(first ? '—' : String(Math.round(frames / acc)));
      first = false;
      acc = 0;
      frames = 0;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

void boot();
