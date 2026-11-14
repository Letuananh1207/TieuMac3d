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
import { createPlayerCharacter } from './player/playerCharacter';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { placeNpcs } from './player/npc';
import type { CharacterState } from './player/character';
import { RUN_SPEED, WALK_SPEED } from './player/controller';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { createMapScroll } from './scene/banDo';
import { CuonSach } from './scene/cuonSach';
import { JOURNEY_MAP, placeStates } from './zones/journeyMap';
import { RADICALS } from './zones/radicals';
import { viewDistance } from './scene/farMountains';
import { mergeStatic } from './scene/merge';
import { createStage } from './scene/renderer';
import { signText } from './scene/signAtlas';
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
  // ?vung=rung-truc → xem cảnh vùng; không có → tông môn
  const SCENE = loadScene(new URLSearchParams(location.search).get('vung'));
  const SCENE_FILE = SCENE.file;
  const { spec } = SCENE;
  await Promise.allSettled([
    document.fonts.load('700 72px Lora'),
    document.fonts.load('700 13px "Be Vietnam Pro"'),
    document.fonts.load('700 52px "Han Serif"', `起源此${RADICALS.map((r) => r.form).join('')}${signText(spec)}`),
  ]);
  const canvas = el<HTMLCanvasElement>('stage');
  // nhìn từ trên: đủ cao để thấy cả sân / cả vùng địa hình
  const topHeight = Math.max(spec.walls.half * 3, spec.ground.size * 0.9, spec.terrain.enabled ? spec.terrain.size * 0.9 : 0);
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, Math.max(viewDistance(spec), topHeight + 60));
  const colliders = new Colliders();
  // nội thất như app: theo nội dung bài (main.ts)
  const interiors = Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior, han: c.lesson.han }]));
  const world = buildWorld(scene, colliders, spec, interiors);
  for (const room of world.rooms) {
    if (!room.teacher) continue;
    const t = createDiscipleCharacter({ robe: '#3f5fa0', trim: '#2b5446' });
    t.root.position.set(room.teacher.x, room.teacher.y, room.teacher.z);
    t.facing.rotation.y = room.teacher.rotY;
    scene.add(t.root);
    mergeStatic(t.root, new Set()); // như main.ts: thầy đứng yên, gộp khối theo màu
  }
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);
  // vòng trận: ?nap=0..1 — xem hiệu ứng nạp (vòng sáng, cột sáng) để chụp (R-HANH-2)
  const nap = Number(new URLSearchParams(location.search).get('nap') ?? 0);
  world.teleport?.setCharge(Number.isFinite(nap) ? nap : 0);
  world.teleport?.update(0.6);
  // ?bando — mở sẵn cuộn bản đồ truyền tống để chụp (không khoá vùng: vùng có cảnh đi được, còn lại sắp mở — R-HANH-1/2)
  if (new URLSearchParams(location.search).has('bando')) {
    const scroll = createMapScroll(scene, camera, JOURNEY_MAP);
    const states = placeStates(JOURNEY_MAP.places, SCENE.id, HOME_SCENE, new Set(['rung-truc']));
    camera.updateMatrixWorld();
    scroll.open(world.teleport?.center ?? new THREE.Vector3(), states);
    const cham = new URLSearchParams(location.search).get('cham');
    for (let i = 0; i < 30; i++) scroll.update(0.05);
    if (cham) scroll.flash(cham);
    requestAnimationFrame(function keep() {
      scroll.update(0); // giữ cuộn trước camera khi camera bay
      requestAnimationFrame(keep);
    });
  }

  // ?nhan-vat= như app: mặc định đệ tử chibi; =tieu-mac, =glb (model AI), =khoi (đệ tử khối), =gau; nút ở bảng đổi
  const character = await createPlayerCharacter(new URLSearchParams(location.search).get('nhan-vat'));
  // ?nv=x,z[,y] — đặt nhân vật chỗ khác (vd. trong giảng đường để xem nội thất, mái mờ); y = chân ở độ cao nào (tầng 2)
  const nv = (new URLSearchParams(location.search).get('nv') ?? '').split(',').map(Number);
  const nvOk = (nv.length === 2 || nv.length === 3) && nv.every(Number.isFinite);
  const [sx, sz] = nvOk ? nv : spec.player.start;
  const startY = world.surface.heightAt(sx, sz, nvOk ? nv[2] : undefined);
  character.root.position.set(sx, Number.isFinite(startY) ? startY : 0, sz);
  scene.add(character.root);
  // NPC như app (R-NPC-1); lỗi nạp hiện cùng lỗi đặc tả ở bảng
  const npcSet = await placeNpcs(scene, colliders, spec.npcs, (x, z) => world.surface.heightAt(x, z));
  for (const npc of npcSet.npcs) npc.update(0);
  world.update(1, character.root.position); // mờ mái ngay nếu đặt trong nhà (ảnh chụp không đợi 0,3 s)

  /* ---------- bảng: nguồn + lỗi đặc tả ---------- */
  el('source').textContent = SCENE.fromFile
    ? `Đọc từ ${SCENE_FILE}`
    : `Chưa có ${SCENE_FILE} — đang xem cảnh mặc định trong code (web/src/scene/spec.ts)`;
  // bài học chỉ ở tông môn → cảnh vùng không báo thiếu vùng học
  const problems = [...SCENE.problems, ...(SCENE.id === HOME_SCENE ? placed.problems : []), ...npcSet.problems];
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
    character.facing.rotation.y = orbit.yaw + Math.PI; // như app: quay lưng về camera
    orbit.update(camera, focus, 0, true);
    controls.target.copy(orbit.lookTarget); // đúng điểm ngắm của app (nhân vật ở 1/3 dưới màn)
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
  // ?chup — ảnh sạch: ẩn bảng + lớp phủ (ảnh cảnh, ảnh đầu vào cho Hunyuan — skill /tai-nguyen)
  if (params.has('chup')) {
    panel.hidden = true;
    for (const id of ['showColliders', 'showZones', 'showGrid']) {
      const box = el<HTMLInputElement>(id);
      if (box.checked) box.click();
    }
  }
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
  // ?di=0..1 — nhân vật đi tại chỗ với tốc độ đó (xem dáng đi / động tác); không có = đứng yên
  let walkSpeed = Math.min(1, Math.max(0, Number(params.get('di') ?? 0) || 0));
  // ?pha=<radian> — đặt sẵn pha bước (1,57 = bước dài nhất) để chụp đúng một tư thế; dùng cùng ?di=1
  // ?bieu-cam=binh|chao|doc|nghi|vui|dinh-muc|ngu — nhân vật chibi đổi biểu cảm
  const setFace = (e: string): void => {
    if ('setExpression' in character) (character as { setExpression(e: string): void }).setExpression(e);
  };
  const expr = params.get('bieu-cam');
  if (expr) setFace(expr);
  // nút ở bảng: đổi nhân vật (nạp lại trang với ?nhan-vat=), biểu cảm (tức thì), đi tại chỗ
  for (const b of el('pickChar').querySelectorAll<HTMLButtonElement>('button')) {
    b.addEventListener('click', () => {
      const p = new URLSearchParams(location.search);
      p.set('nhan-vat', b.dataset.nv ?? 'chibi');
      location.search = p.toString();
    });
  }
  for (const b of el('pickFace').querySelectorAll<HTMLButtonElement>('button')) {
    b.addEventListener('click', () => setFace(b.dataset.bc ?? 'binh'));
  }
  const walkBox = el<HTMLInputElement>('walkToggle');
  walkBox.checked = walkSpeed > 0;
  walkBox.addEventListener('change', () => (walkSpeed = walkBox.checked ? 1 : 0));
  const phase = Number(params.get('pha'));
  // ?dang=chay|nhay|ngoi|chao|vuon|nhin — dựng sẵn một dáng để chụp (R-DIEU-5…8)
  const pose = params.get('dang');
  const poseState: CharacterState = { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0 };
  if (pose === 'chay') poseState.mps = RUN_SPEED;
  else if (pose === 'nhay') poseState.air = true;
  else if (pose === 'ngoi') poseState.sit = 1;
  else if (pose === 'chao') poseState.bow = 1;
  else if (pose === 'vuon') poseState.idle = 7.25;
  else if (pose === 'nhin') poseState.idle = 14.6;
  /** trạng thái mỗi khung: dáng chọn sẵn, hoặc đi bộ tại chỗ (?di / ô Đi tại chỗ — tốc độ 1 = đi bộ hết tốc) */
  const stateNow = (): CharacterState => (pose ? poseState : { ...poseState, mps: walkSpeed * WALK_SPEED });
  // ?dang=ngoi: cuộn sách Ngồi ôn mở hết như app (R-ON-8) — xem tay cầm cuộn
  const cuon = pose === 'ngoi' ? new CuonSach(scene) : null;
  if (pose) character.animate(1, poseState.mps / RUN_SPEED, poseState);
  if (Number.isFinite(phase) && phase > 0) character.animate(phase / 10, WALK_SPEED / RUN_SPEED, { ...poseState, mps: WALK_SPEED });
  function tick(): void {
    const dt = Math.min(clock.getDelta(), 0.05);
    controls.update();
    world.update(dt, character.root.position);
    character.animate(dt, stateNow().mps / RUN_SPEED, stateNow());
    cuon?.update(dt, character.root.position, character.facing.rotation.y, 2);
    for (const npc of npcSet.npcs) npc.update(dt);
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
