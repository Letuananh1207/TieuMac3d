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
import { tableCamera } from './gamePlay';
import { NgoiMat, type SitPlace } from './ngoiMat';
import { LAYER_THAN } from './scene/layers';
import { createPlayerCharacter } from './player/playerCharacter';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { placeNpcs } from './player/npc';
import type { CharacterState } from './player/character';
import { RUN_SPEED, WALK_SPEED } from './player/controller';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { createMapScroll } from './scene/banDo';
import { CuonSach } from './scene/cuonSach';
import { JOURNEY_MAP, placeStates } from './zones/journeyMap';
import { TU_VUNG } from './zones/tuVung/tu';
import { cuonView } from './zones/cuonMuc';
import { scrollMenu } from './zones/studyMenu';
import { viewDistance } from './scene/farMountains';
import { mergeStatic } from './scene/merge';
import { portalRect } from './scene/portals';
import { createStage } from './scene/renderer';
import { isColorManaged, isSoft, withLookParam } from './scene/look';
import { addVignette } from './ui/vignette';
import { signText } from './scene/signAtlas';
import { buildWorld } from './scene/world';
import { houseLines, withHouseParam } from './nhaPreview';
import { hourSlider, NgayDem } from './ngayDem';
import { addTownPreview } from './townPreview';
import { addTieuNhiPreview } from './tieuNhiPreview';
import { DanTranh } from './danTranh';
import { playerModelUrl } from './player/playerCharacter';
import { addGardenPreview } from './vuonPreview';
import { addDecorPreview } from './decorPreview';
import { addTrucLamPreview } from './trucLamPreview';
import { addTrucLamHudPreview } from './trucLamHudPreview';
import { addDongTacPreview } from './dongTacPreview';
import { inRect } from './scene/rooms';
import { el } from './ui/dom';
import { placeZones, ZONE_CONTENT } from './zones/zones';
import { emotePreview } from './bieuCamPreview';
import { addCranePreview } from './hacPreview';
import { addMatPreview } from './matPreview';

// biến thể bố cục chỉ cho Canvas 3D (glob: chưa có file thì rỗng)
const VARIANTS: Record<string, unknown> = import.meta.glob('../../design/scene/bien_the/*.json', { eager: true, import: 'default' });

const fmt = (v: number): string => v.toFixed(1).replace('.', ',').replace('-', '−');

function li(text: string, cls?: string): HTMLLIElement {
  const e = document.createElement('li');
  e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

async function boot(): Promise<void> {
  // ?vung=rung-truc → xem cảnh vùng; không có → tông môn
  const query = new URLSearchParams(location.search);
  // ?bocuc=mo → biến thể bố cục design/scene/bien_the/mo.json ghép lên tông môn (bản thử để so — V-42); app không đọc
  const bocuc = query.get('bocuc');
  const patch = bocuc ? VARIANTS[`../../design/scene/bien_the/${bocuc}.json`] : undefined;
  const SCENE = loadScene(query.get('vung'), bocuc && patch !== undefined ? { name: bocuc, patch } : undefined);
  if (bocuc && patch === undefined) SCENE.problems.push(`?bocuc=${bocuc}: không có design/scene/bien_the/${bocuc}.json — đang xem bản chính`);
  const SCENE_FILE = SCENE.file;
  // ?look=cu — xem kiểu nhìn cũ để so (kế hoạch 2026-11-14-canh-dep)
  // &mau-nha=khoi-gop|<mã> · &khoi — nhà kín bằng model / bản khối (nhaPreview.ts, V-88)
  const spec = withHouseParam(withLookParam(SCENE.spec, query.get('look')), query);
  await Promise.allSettled([
    document.fonts.load('700 72px Lora', `Aa${signText(spec)}`),
    document.fonts.load('700 13px "Be Vietnam Pro"'),
    document.fonts.load('700 52px "Han Serif"', `${TU_VUNG.map((t) => t.han).join('')}${signText(spec)}` || '字'),
  ]);
  const canvas = el<HTMLCanvasElement>('stage');
  // nhìn từ trên: đủ cao để thấy cả sân / cả vùng địa hình
  const topHeight = Math.max(spec.walls.half * 3, spec.ground.size * 0.9, spec.terrain.enabled ? spec.terrain.size * 0.9 : 0);
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, Math.max(viewDistance(spec), topHeight + 60), {
    colorManaged: isColorManaged(spec.look),
  });
  const colliders = new Colliders();
  // nội thất như app: theo nội dung bài (main.ts)
  const interiors = Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior, han: c.lesson.han }]));
  const world = buildWorld(scene, colliders, spec, interiors);
  const houseInfo = await houseLines(world.ready, query); // model nhà nạp xong trước khung đầu (đo draw call có model)
  const vignette = isSoft(spec.look) ? addVignette(canvas, spec.look.vignette, spec.look.vignetteColor) : null; // như app (main.ts)
  // ngày đêm như app: ?gio=21 ép giờ, ?gio=17&toc=60 tua nhanh; thanh trượt giờ ở bảng (R-NGAY-1)
  const ngayDem = new NgayDem(world.dayNight, spec, query, vignette);
  // `?debug`: công cụ đo / gỡ lỗi đọc cảnh (như main.ts)
  if (query.has('debug')) Object.assign(window, { __hocXa: { scene, camera } });
  hourSlider(ngayDem, el<HTMLInputElement>('gio'), el('gioNhan'), query);
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

  // ?nhan-vat= như app: mặc định model AI .glb; =chibi, =tieu-mac, =khoi (đệ tử khối), =gau; nút ở bảng đổi
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
  // cổng đi bộ (R-HANH-4): khung vùng chạm (xanh) + mũi tên chỗ đứng khi tới từ cảnh đích
  const portalMat = new THREE.LineBasicMaterial({ color: 0x4fd1a5 });
  for (const p of spec.portals) {
    const r = portalRect(p);
    const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(r.maxX - r.minX, 2.2, r.maxZ - r.minZ)), portalMat);
    box.position.set((r.minX + r.maxX) / 2, 1.1, (r.minZ + r.maxZ) / 2);
    const a = (p.arrive.rotY * Math.PI) / 180;
    const at = new THREE.Vector3(p.arrive.at[0], 0.3, p.arrive.at[1]);
    zoneLayer.add(box, new THREE.ArrowHelper(new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), at, 1.6, 0x4fd1a5, 0.5, 0.35));
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
    orbit.viewAspect = camera.aspect; // khung phòng (gian trong — V-71) tính theo khung hình thật
    if (far) orbit.toggleView();
    const focus = character.root.position;
    character.facing.rotation.y = orbit.yaw + Math.PI; // như app: quay lưng về camera
    // ?dang=ngoi: camera Ngồi ôn như app — lùi ra sau vai thấy cuộn sách (R-DIEU-7)
    if (!far && new URLSearchParams(location.search).get('dang') === 'ngoi') orbit.sit(true, character.facing.rotation.y);
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
  // ?cam=x,y,z&tam=x,z[,y] — đặt camera nhìn vào một điểm (chụp chi tiết một nhà / vật; y thiếu = 1,5 — cận NPC ngồi: y thấp)
  const nums = (key: string): number[] => (params.get(key) ?? '').split(',').map(Number);
  const [cx, cy, cz] = nums('cam');
  const [tx, tz, ty] = nums('tam');
  if ([cx, cy, cz, tx, tz].every(Number.isFinite)) {
    camera.position.set(cx, cy, cz);
    controls.target.set(tx, Number.isFinite(ty) ? ty : 1.5, tz);
  }

  // ?dang=go-mo — bản thử Tiểu Líu Lo + Lão Canh (model thế nhan-vat.glb hoặc `&nhan-vat=<mã>` — playerModelUrl), đường vòng B, &gio=08:59:50, &theo (townPreview.ts)
  // Lão Canh đã có trong đặc tả → đi theo đồng hồ như app ở mọi trang (`&gio`, `&theo` dùng được không cần ?dang=go-mo)
  const town = await addTownPreview(scene, colliders, spec, (x, z) => world.surface.heightAt(x, z), params, npcSet.npcs);
  if (town?.lines.length) el('problems').append(...town.lines.map((t) => li(t)));
  // ?dang=vuon-rau — vườn rau điền sẵn + bảng mẫu 8 cây × 4 dáng (vuonPreview.ts, R-VUON-4)
  // ?dang=dan-tranh — nhạc công thế (nhan-vat.glb hoặc `&nhan-vat=<mã>`; artifact không có .glb → đệ tử khối đứng) ngồi gảy trên bục đàn + tiếng đàn, để duyệt chỗ (R-NPC-9, R-AM-2)
  const dan = params.get('dang') === 'dan-tranh' ? await DanTranh.create(scene, spec, (x, z) => world.surface.heightAt(x, z), { url: playerModelUrl(params.get('nhan-vat')), block: () => createDiscipleCharacter() }) : null;
  // ?dang=lam-vuon[&viec=…][&t=…] — nhân vật diễn 6 việc làm vườn + hạt / nước / sâu / cỏ / quả bay (vuonPreview.ts, R-VUON-13)
  const vuon = addGardenPreview(scene, spec, world.garden, params, (x, z) => world.surface.heightAt(x, z), character);
  if (vuon) el('problems').append(...vuon.lines.map((t) => li(t)));
  // 3 trò nhỏ Trúc Lâm (V-66 B4): đệm đàn, măng hôm nay, mưa, chén lệnh — `?dang=luu-thuong|hai-mang[&mua]` (trucLamPreview.ts)
  const truc = addTrucLamPreview(scene, colliders, spec, world, params);
  if (truc?.lines.length) el('problems').append(...truc.lines.map((t) => li(t)));
  // &hud=… — HUD 3 trò Trúc Lâm dựng bằng lớp HUD của app với dữ liệu mẫu (trucLamHudPreview.ts, thiết kế 2026-11-16.13)
  const trucHud = addTrucLamHudPreview(params, camera, (x, z) => world.surface.heightAt(x, z));
  if (trucHud) el('problems').append(li(trucHud));
  // ?dang=dong-tac&nv=thu-thu[&tinh=…] — phòng thử động tác xương chuẩn + thanh trượt (dongTacPreview.ts, R-NPC-10)
  const dong = await addDongTacPreview(scene, colliders, spec, (x, z) => world.surface.heightAt(x, z), params, (x, z) => {
    if (params.has('cam')) return; // ?cam=…&tam=… đã đặt góc nhìn
    controls.target.set(x, 1.2, z);
    camera.position.set(x + 2, 3.2, z + 9);
  });
  if (dong) el('problems').append(...dong.lines.map((t) => li(t)));
  // ?dang=hac[&mau=khoi-gop|hac|<mã>][&khoi][&gap=1][&vo=len|xuong][&goc=truoc|sau-tren|ben] — hạc truyền tống lượn tại chỗ, nhân vật ngồi lưng (hacPreview.ts)
  const hac = await addCranePreview(scene, spec, params, (x, z) => world.surface.heightAt(x, z), character, (pos, tam) => {
    camera.position.set(...pos);
    controls.target.set(...tam);
  });
  if (hac) el('problems').append(...hac.lines.map((t) => li(t)));
  // ?dang=mat[&nv=…][&mi=…][&bc=…&t=…][&goc=…][&xa] — duyệt mí mắt: chớp, biểu cảm, ngủ gật (matPreview.ts, R-MAT-1/2)
  (await addMatPreview(scene, spec, params, (x, z) => world.surface.heightAt(x, z), (pos, tam) => (camera.position.set(...pos), controls.target.set(...tam))))?.lines.forEach((t) => el('problems').append(li(t)));
  el('problems').append(...houseInfo.map((t) => li(t)));
  const follow = params.has('theo') && town?.walker ? town.walker.root.position.clone() : null;
  // ?dang=trang-tri&so=20&ma=ban-tra:0:0:45&vungcam — đồ trang trí tự do rải sẵn + bóng ma + vùng cấm (decorPreview.ts, R-NHA-7)
  const decorPv = addDecorPreview(scene, colliders, spec, SCENE.id, (x, z) => world.surface.heightAt(x, z), params);
  if (decorPv) el('problems').append(...decorPv.lines.map((t) => li(t)));

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
  else if (pose === 'ngoi' || pose === 'ngoi-mat' || pose === 'tieu-nhi' || pose === 'hac') poseState.sit = 1;
  if (hac) poseState.ride = hac.ride; // ngồi cưỡi hạc (R-HANH-5)
  else if (pose === 'chao') poseState.bow = 1;
  else if (pose === 'vuon') poseState.idle = 7.25;
  else if (pose === 'nhin') poseState.idle = 14.6;
  /** trạng thái mỗi khung: dáng chọn sẵn, hoặc đi bộ tại chỗ (?di / ô Đi tại chỗ — tốc độ 1 = đi bộ hết tốc) */
  const stateNow = (): CharacterState => (pose ? poseState : { ...poseState, mps: walkSpeed * WALK_SPEED });
  // ?dang=ngoi: cuộn sách Ngồi ôn mở hết như app (R-ON-8) — xem tay cầm cuộn
  const cuon = pose === 'ngoi' ? new CuonSach(scene) : null;
  // ?dang=ngoi-mat[&cho=on|tu-hoc|tra|lan-can|co|dau] — nhìn từ mắt khi ngồi như app (R-DIEU-7, ngoiMat.ts): Ngồi ôn tại chỗ
  // (cuộn mở), bồ đoàn khu tự học, đôn bàn trà trà lâu, ghế lan can tầng 2 trà lâu, bàn cờ, bàn Đấu chữ. Thân mình ẩn, hai tay + cuộn / chén / bàn.
  // ?dang=tieu-nhi&cho=<0…29>[&t=…][&ngoai] — ngồi chỗ trà lâu, tiểu nhị mang trà như app (tieuNhiPreview.ts, R-TRA-1)
  const tn = addTieuNhiPreview(params, world, npcSet.npcs, colliders);
  if (tn) {
    el('problems').append(...tn.lines.map((t) => li(t)));
    character.root.position.set(tn.seat.x, tn.seat.y, tn.seat.z);
    character.facing.rotation.y = tn.seat.rotY;
  }
  const mat = pose === 'ngoi-mat' || (tn && !params.has('ngoai')) ? ngoiMatPreview(params.get('cho') ?? 'on') : null;
  // ?dang=bieu-cam[&bc=<mã>][&t=<giây>] — dáng 8 biểu cảm (R-BIEU-2, bieuCamPreview.ts); tên biểu cảm hiện ở ô toạ độ
  const bieuCam = emotePreview(params);
  if (pose) character.animate(1, poseState.mps / RUN_SPEED, poseState);
  // ?pha=<n> — dựng sẵn một khung đi bộ (một bước dt = n/10 s; &dang=chay → chạy); &dung — giữ nguyên khung đó (chụp so dáng đi, L-18)
  const walkMps = poseState.mps || WALK_SPEED;
  if (Number.isFinite(phase) && phase > 0) character.animate(phase / 10, walkMps / RUN_SPEED, { ...poseState, mps: walkMps });
  const freeze = params.has('dung') && Number.isFinite(phase) && phase > 0;
  interface MatPreview {
    ngoi: NgoiMat;
    third: THREE.PerspectiveCamera;
    game: THREE.PerspectiveCamera | null;
    /** đặt camera bàn chơi (mỗi khung — FOV / tỉ lệ đổi theo màn) */
    placeGame(): void;
  }
  function ngoiMatPreview(cho: string): MatPreview {
    const ngoi = new NgoiMat(scene, character, spec.camera, spec.look);
    let place: SitPlace = { kind: 'on' };
    let game: THREE.PerspectiveCamera | null = null;
    let placeGame = (): void => {};
    const seatAt = (x: number, y: number, z: number, rotY: number): void => {
      character.root.position.set(x, y, z);
      character.facing.rotation.y = rotY;
    };
    if (tn) place = { kind: 'ngoi', hold: tn.seat.hold, rail: tn.seat.rail };
    else if (cho === 'tu-hoc' || cho === 'tra' || cho === 'lan-can') {
      const s = world.seats.find((q) => (cho === 'tu-hoc' ? q.study : q.hold === cho));
      if (s) seatAt(s.x, s.y, s.z, s.rotY);
      place = cho === 'tu-hoc' ? { kind: 'on' } : { kind: 'ngoi', hold: s?.hold, rail: s?.rail };
    } else if (cho === 'co' || cho === 'dau') {
      const t = world.gameTables.find((q) => q.spec.kind === (cho === 'co' ? 'co' : 'dau-chu'));
      if (t) {
        const s = t.seats[0];
        seatAt(s.x, s.y, s.z, s.rotY);
        place = { kind: 'ban-choi', game: cho === 'co' ? 'co' : 'dau-chu', center: t.center, rotY: s.rotY };
        if (cho === 'dau') t.showCard(TU_VUNG[0].han, 0);
        else t.setStones(Array.from({ length: 169 }, (_, i) => ([84, 85, 71, 98].includes(i) ? 1 : [70, 72, 86].includes(i) ? 2 : 0)));
        game = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.1, 10);
        const g = game;
        placeGame = () => tableCamera(g, t.center, s.rotY);
      }
    } else character.facing.rotation.y = 0;
    if (place.kind === 'on') {
      // ô mẫu trên cuộn Tĩnh toạ (R-ON-8, thiết kế 2026-11-16.12 `Cuon-*`): mượn HSK 1, đã học 5 bộ, còn 1 việc;
      // &muc=chua-muon — chưa mượn sách · &muc=chua-hoc — chưa mượn, chưa học từ nào (còn 2 việc) · &muc=xong — xong việc
      // hôm nay; &nhan=book|learned|daily|stand — ô đang nhấn + tay gần ô trỏ (giữ yên) · &moi — ô Nhiệm vụ vừa cập nhật
      const muc = params.get('muc');
      const learned = muc === 'chua-hoc' ? [] : TU_VUNG.slice(0, 5).map((t) => t.id);
      const book = muc === 'chua-hoc' || muc === 'chua-muon' ? null : { title: 'HSK 1', subtitle: 'Nhập môn' };
      const left = muc === 'xong' || params.has('moi') ? 0 : muc === 'chua-hoc' ? 2 : 1;
      const { x, z } = character.root.position; // dòng nơi như app (`main.ts` sitPlaceName): khu chứa chỗ ngồi
      const area = spec.site.areas.find((q) => x >= Math.min(q.from[0], q.to[0]) && x <= Math.max(q.from[0], q.to[0]) && z >= Math.min(q.from[1], q.to[1]) && z <= Math.max(q.from[1], q.to[1]));
      const placeName = area ? `${spec.site.name} · ${area.name}` : spec.site.name;
      ngoi.setMenu(cuonView(scrollMenu({ book, learned, tasksLeft: left }), placeName, book));
    }
    world.update(1, character.root.position); // trong nhà: mái mờ sẵn
    // camera ngôi 3 lúc trước khi ngồi: sau lưng như app
    const orbit = new OrbitCamera(spec.camera);
    orbit.yaw = character.facing.rotation.y + Math.PI;
    const third = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.1, 10);
    orbit.update(third, character.root.position, 0, true, (x, z) => world.surface.heightAt(x, z));
    controls.enabled = false;
    // &ngoai — cùng chỗ, cùng dáng ngồi nhưng nhìn từ ngoài (như người khác thấy / trước khi ngồi): so ảnh + draw call
    if (params.has('ngoai')) {
      if (place.kind === 'on') new CuonSach(scene, { layer: LAYER_THAN }).update(2, character.root.position, character.facing.rotation.y, 2);
    } else ngoi.sit(place);
    // ảnh chụp: vào hẳn mắt ngay (không đợi trượt 0,4 s — thời gian ảo của Chrome headless trôi không đều)
    for (let i = 0; i < 4; i++) {
      placeGame();
      ngoi.update(0.2, camera, third, game, 2);
    }
    const nhan = params.get('nhan');
    if (nhan === 'book' || nhan === 'learned' || nhan === 'daily' || nhan === 'stand') ngoi.previewPress(nhan);
    if (params.has('moi')) ngoi.previewFlash('daily');
    return { ngoi, third, game, placeGame };
  }
  let sat = 0;
  function tick(): void {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (mat) {
      // chụp headless: thời gian ảo có thể không trôi giữa các khung → mỗi khung ít nhất 1/30 s để chuyển ngôi xong
      const step = Math.max(dt, 1 / 30);
      sat += step;
      mat.placeGame();
      mat.ngoi.update(step, camera, mat.third, mat.game, sat + 2); // cuộn mở ngay (như đã ngồi > 1 s)
    } else controls.update();
    world.update(dt, character.root.position, camera.position);
    const p = character.root.position;
    ngayDem.update(dt, world.rooms.some((r) => inRect(r.floor, p.x, p.z)));
    if (bieuCam) {
      bieuCam.apply(dt, poseState);
      el('pick').textContent = `Biểu cảm: ${bieuCam.current.name}`;
    }
    vuon?.update(dt, poseState);
    if (!freeze) character.animate(dt, stateNow().mps / RUN_SPEED, stateNow());
    cuon?.update(dt, character.root.position, character.facing.rotation.y, 2);
    tn?.update(dt, mat?.ngoi ?? null);
    for (const npc of npcSet.npcs) npc.update(dt);
    town?.update(dt, camera, controls.target);
    dan?.update({ dt, player: controls.target, camera, covered: false });
    truc?.update(dt, camera.position);
    dong?.update(dt);
    hac?.update(dt);
    if (follow && town?.walker) {
      const d = town.walker.root.position.clone().sub(follow);
      camera.position.add(d);
      controls.target.add(d);
      follow.copy(town.walker.root.position);
    }
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
