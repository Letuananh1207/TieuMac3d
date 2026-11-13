import * as THREE from 'three';
import './style.css';
import { FlutterBridge } from './bridge/flutterBridge';
import { Colliders } from './collision/colliders';
import { Joystick } from './input/joystick';
import { Keyboard } from './input/keyboard';
import { OrbitCamera } from './input/orbitCamera';
import { attachPointerInput } from './input/pointers';
import { GroundPicker } from './input/tapToMove';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { createPlayerCharacter } from './player/playerCharacter';
import { PlayerController, type MoveInput } from './player/controller';
import { placeNpcs } from './player/npc';
import { SCENE, SCENE_FILE } from './scene/loadSpec';
import { viewDistance } from './scene/farMountains';
import { createStage } from './scene/renderer';
import { mergeStatic } from './scene/merge';
import { inRect, type Room } from './scene/rooms';
import { buildWorld } from './scene/world';
import { el } from './ui/dom';
import { LearnButton } from './ui/learnButton';
import { AreaBanner } from './ui/areaBanner';
import { bindCameraButton, createHint, FpsCounter, NameTag, PlaceChip } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { LoadingScreen, nextPaint } from './ui/loadingScreen';
import { AreaEntryTracker, AreaTracker } from './zones/areaTracker';
import { ZoneTracker } from './zones/zoneTracker';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';

/** Nhãn tên cao hơn đỉnh búi tóc đệ tử (~2,2 m) một chút. */
const NAME_TAG_HEIGHT = 2.5;

async function boot(): Promise<void> {
  const { spec } = SCENE;
  // màn tải che tới khung hình đầu (R-MAN-2); tiến độ theo các bước dựng thật
  const loading = new LoadingScreen(spec.site);
  loading.progress(10);
  // Biển hiệu, bảng phấn vẽ chữ lên canvas, nên phải nạp font trước khi dựng cảnh.
  const hanText = [spec.site.han, ...spec.site.areas.map((a) => a.han ?? ''), ...ZONE_CONTENT.map((c) => c.lesson.han)].join('');
  await Promise.allSettled([
    document.fonts.load('700 72px Lora'),
    document.fonts.load('700 13px "Be Vietnam Pro"'),
    document.fonts.load('700 52px "Han Serif"', hanText || '字'),
  ]);
  loading.progress(30);
  await nextPaint();

  const canvas = el<HTMLCanvasElement>('stage');
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, viewDistance(spec));
  const clock = new THREE.Clock();
  const colliders = new Colliders();
  // nhà nào có nội thất: theo nội dung bài (lớp học / thư viện), chữ phấn trên bảng = chữ của bài
  const interiors = Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior, han: c.lesson.han }]));
  const world = buildWorld(scene, colliders, spec, interiors);
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);
  const problems = [...SCENE.problems, ...placed.problems];
  if (problems.length) console.warn(`Đặc tả cảnh (${SCENE_FILE}):\n- ${problems.join('\n- ')}`);
  loading.progress(80);

  // gấu khối (player/blockCharacter.ts) vẫn giữ làm bản dự phòng, cùng hợp đồng Character
  const character = await createPlayerCharacter(new URLSearchParams(location.search).get('nhan-vat'));
  character.root.position.set(spec.player.start[0], 0, spec.player.start[1]);
  scene.add(character.root);
  const player = new PlayerController(character, colliders, world.surface);
  player.snapToGround();
  const groundAt = (x: number, z: number): number => world.surface.heightAt(x, z);

  // thầy đứng trên bục giảng (đệ tử áo xà lam, đứng yên)
  for (const room of world.rooms) {
    if (!room.teacher) continue;
    const t = createDiscipleCharacter({ robe: '#3f5fa0', trim: '#2b5446' });
    t.root.position.set(room.teacher.x, room.teacher.y, room.teacher.z);
    t.facing.rotation.y = room.teacher.rotY;
    scene.add(t.root);
    // thầy không cử động → gộp ~25 khối thành vài khối theo màu (ngân sách ≤ 150 draw call)
    mergeStatic(t.root, new Set());
  }
  // NPC đứng tại chỗ, quay về người chơi khi lại gần (R-NPC-1)
  const npcSet = await placeNpcs(scene, colliders, spec.npcs, groundAt);
  if (npcSet.problems.length) console.warn(npcSet.problems.join('\n'));
  const roomAt = (x: number, z: number): Room | undefined => world.rooms.find((r) => inRect(r.floor, x, z));

  /* ---------- bài học: nút nổi trên vật + chạm vật (R-VUNG-1/2/3) ---------- */
  let paused = false; // đang mở bài học: nhân vật đứng yên
  const zoneById = new Map(placed.zones.map((z) => [z.id, z]));
  const anchorOf = new Map(world.rooms.map((r) => [r.zoneId, r.anchor]));
  let covered = false; // màn bài học Flutter đang che cảnh → ngừng vẽ (docs/bridge.md)
  const closeLesson = (): void => {
    paused = false;
    covered = false;
    learn.suspend(false);
  };
  const lesson = new LessonBoard(closeLesson);
  // bảng gỡ lỗi: ?debug (trình duyệt) hoặc Flutter gửi `debug` (bản debug của app)
  const fps = new FpsCounter(new URLSearchParams(location.search).has('debug'));
  // dừng hẳn vòng lặp khi app xuống nền (Flutter gửi `lifecycle`) hoặc tab bị ẩn — đỡ tốn pin (mốc 4)
  let appHidden = false;
  let running = true;
  const setRunning = (): void => {
    const want = !appHidden && !document.hidden;
    if (want === running) return;
    running = want;
    if (want) {
      clock.getDelta(); // bỏ khoảng thời gian đã dừng
      requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', setRunning);
  const bridge = new FlutterBridge({
    onResume: closeLesson,
    onVisible: (visible) => {
      appHidden = !visible;
      setRunning();
    },
    onDebug: (on) => fps.setEnabled(on),
  });
  const openLesson = (zone: Zone): void => {
    if (paused) return; // đang mở rồi (chạm hai lần khi chờ Flutter trả lời)
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    // trong app: Flutter mở màn native; không có Flutter / Flutter chưa có màn → bảng HTML
    void bridge.openLesson(zone.id, zone.lesson).then((native) => {
      if (native) covered = true;
      else lesson.open(zone.lesson);
    });
  };
  const learn = new LearnButton(openLesson);
  const zones = new ZoneTracker(placed.zones, (z) => learn.setZone(z));

  /* ---------- điều khiển ---------- */
  const orbit = new OrbitCamera(spec.camera);
  const joystick = new Joystick(el('joy'), el('knob'), el('joyGhost'));
  const picker = new GroundPicker(camera, world.ground);
  const hideHint = createHint();
  const keyboard = new Keyboard(hideHint);
  attachPointerInput(canvas, {
    joystick,
    orbit,
    onFirstInput: hideHint,
    onJoystickStart: () => (player.moveTarget = null),
    onTap: (x, y) => {
      if (paused) return;
      // đang trong nhà: chạm trúng vật học của nhà → mở bài (R-VUNG-2)
      const room = roomAt(player.position.x, player.position.z);
      const hit = room ? picker.pickObject(x, y, room.hits) : null;
      const zone = hit ? zoneById.get(hit.userData.zoneId as string) : undefined;
      if (zone) {
        openLesson(zone);
        return;
      }
      const p = picker.pick(x, y);
      if (p) player.moveTarget = p;
    },
  });
  bindCameraButton(() => orbit.toggleView());

  /* ---------- chip: tên nhà (khi đứng trong) ưu tiên hơn tên khu (R-HUD-1) ---------- */
  const chip = new PlaceChip(spec.site.name);
  const placeOf = new Map(ZONE_CONTENT.map((c) => [c.id, c.place]));
  const roomAreas = world.rooms.map((r) => ({
    name: placeOf.get(r.zoneId) ?? r.zoneId,
    from: [r.floor.minX, r.floor.minZ] as [number, number],
    to: [r.floor.maxX, r.floor.maxZ] as [number, number],
  }));
  const areas = new AreaTracker({ name: spec.site.name, areas: [...roomAreas, ...spec.site.areas] }, (label) => chip.set(label));
  // thẻ tên khu chỉ theo khu của đặc tả (không theo nhà) → vào / ra nhà không hiện thẻ (R-HUD-3)
  const banner = new AreaBanner();
  const entries = new AreaEntryTracker(spec.site.areas, (a) => banner.show(a));

  /* ---------- vòng lặp ---------- */
  const nameTag = new NameTag();
  const input: MoveInput = { x: 0, y: 0 };
  // tường / nhà chắn tầm nhìn → camera kéo lại gần (R-DIEU-4)
  const sight = colliders.sightBlock.bind(colliders);
  orbit.update(camera, player.position, 0, true, groundAt, undefined, sight);

  function tick(): void {
    if (!running) return; // vòng lặp tự tắt; setRunning gọi lại khi hiện
    // kẹp dt: tab bị treo vài giây rồi chạy lại thì nhân vật không "dịch chuyển tức thời"
    const dt = Math.min(clock.getDelta(), 0.05);
    input.x = joystick.x;
    input.y = joystick.y;
    keyboard.apply(input);

    // màn tải còn hiện (kể cả lúc mờ ra) → không điều khiển (R-MAN-2); chạm đã bị lớp màn tải chặn
    const fromX = player.position.x;
    const fromZ = player.position.z;
    player.update(dt, input, orbit.yaw, paused || loading.active);
    const pos = player.position;
    orbit.follow(dt, pos.x - fromX, pos.z - fromZ); // camera tự xoay ra sau lưng khi đi (R-DIEU-3)
    for (const npc of npcSet.npcs) npc.update(dt, pos);
    zones.update(pos);
    areas.update(pos);
    entries.update(pos);
    world.update(dt, pos);
    const room = roomAt(pos.x, pos.z);
    orbit.update(camera, pos, dt, false, groundAt, room?.floor, sight);
    if (!covered) renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    learn.follow(zones.current ? anchorOf.get(zones.current.id) : undefined, camera);
    fps.tick(dt, renderer.info.render.calls, renderer.info.render.triangles);
    if (!firstFrame) {
      firstFrame = true;
      loading.done();
    }
    requestAnimationFrame(tick);
  }
  let firstFrame = false;
  requestAnimationFrame(tick);
}

void boot();
