import * as THREE from 'three';
import './style.css';
import { FlutterBridge, getProgress, type JourneyProgress } from './bridge/flutterBridge';
import { Colliders } from './collision/colliders';
import { Joystick } from './input/joystick';
import { Keyboard } from './input/keyboard';
import { OrbitCamera } from './input/orbitCamera';
import { attachPointerInput } from './input/pointers';
import { GroundPicker } from './input/tapToMove';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { createPlayerCharacter } from './player/playerCharacter';
import { PlayerController, type MoveInput } from './player/controller';
import { npcInTalkRange, placeNpcs } from './player/npc';
import { HOME_SCENE, loadScene, REGION_SCENES } from './scene/loadSpec';
import { createMapScroll } from './scene/banDo';
import { arrivalSpot, CHARGE_SECONDS, ringTrigger } from './scene/teleportLayout';
import { TELEPORT_TEXT } from './scene/truyenTong';
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
import { MapHud } from './ui/mapHud';
import { ActionButtons } from './ui/actionButtons';
import { DialogBox, TalkButton } from './ui/dialogBox';
import { LoadingScreen, nextPaint } from './ui/loadingScreen';
import { AreaEntryTracker, AreaTracker } from './zones/areaTracker';
import { ZoneTracker } from './zones/zoneTracker';
import { JOURNEY_MAP, placeAt, placeScene, placeStates, type PlaceState } from './zones/journeyMap';
import { RingCharge } from './zones/ringCharge';
import { DIALOGS, DialogRunner } from './zones/dialogs';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';

/** Nhãn tên cao hơn đỉnh búi tóc đệ tử (~2,2 m) một chút. */
const NAME_TAG_HEIGHT = 2.5;

async function boot(): Promise<void> {
  // mỗi vùng một cảnh: ?vung=<mã> (không có = tông môn); về nhà: ?tu=<mã vùng vừa rời> (R-HANH-2)
  const params = new URLSearchParams(location.search);
  const SCENE = loadScene(params.get('vung'));
  const SCENE_FILE = SCENE.file;
  const isHome = SCENE.id === HOME_SCENE;
  const { spec } = SCENE;
  // vùng đã mở (R-HANH-1): Flutter giữ tiến độ; không có Flutter → ?mo=<mã>,<mã> hoặc chỉ Rừng trúc. Hỏi song song với nạp font.
  const fallbackOpen = (params.get('mo') ?? 'rung-truc').split(',').filter(Boolean);
  const openList = (p: JourneyProgress | null): string[] => p?.open ?? fallbackOpen;
  const progressAsk = getProgress();
  // màn tải che tới khung hình đầu (R-MAN-2); tiến độ theo các bước dựng thật
  const loading = new LoadingScreen(spec.site);
  loading.progress(10);
  // Biển hiệu, bảng phấn vẽ chữ lên canvas, nên phải nạp font trước khi dựng cảnh.
  const hanText = [spec.site.han, TELEPORT_TEXT, '此', ...JOURNEY_MAP.places.map((p) => p.han), ...spec.site.areas.map((a) => a.han ?? ''), ...ZONE_CONTENT.map((c) => c.lesson.han)].join('');
  await Promise.allSettled([
    document.fonts.load('700 72px Lora'),
    document.fonts.load('700 13px "Be Vietnam Pro"'),
    document.fonts.load('700 52px "Han Serif"', hanText || '字'),
  ]);
  let progress = await progressAsk;
  let open = openList(progress);
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
  // bài học chỉ ở tông môn → cảnh vùng không báo thiếu vùng học
  const problems = [...SCENE.problems, ...(isHome ? placed.problems : [])];
  if (problems.length) console.warn(`Đặc tả cảnh (${SCENE_FILE}):\n- ${problems.join('\n- ')}`);
  loading.progress(80);

  // gấu khối (player/blockCharacter.ts) vẫn giữ làm bản dự phòng, cùng hợp đồng Character
  const character = await createPlayerCharacter(new URLSearchParams(location.search).get('nhan-vat'));
  // về nhà từ một vùng: đứng trước cột của vùng đó, ngoài vòng, nhìn vào cột (R-HANH-2)
  const back = isHome && params.has('tu') && spec.teleport.enabled ? arrivalSpot(spec.teleport) : undefined;
  const [sx, sz] = back ? back.at : spec.player.start;
  character.root.position.set(sx, 0, sz);
  if (back) character.facing.rotation.y = back.rotY;
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
  let mapOpen = false; // bản đồ truyền tống đang mở: đứng yên, chỉ nhận chạm (R-HANH-2)
  let talking = false; // đang hội thoại với NPC: đứng yên (R-NPC-2)
  let onMapTap = (_x: number, _y: number): void => {};
  // nút quay lại của máy: bản đồ đang mở thì đóng (R-HANH-2); gán ở phần bản đồ bên dưới
  let mapBack = (): boolean => false;
  const zoneById = new Map(placed.zones.map((z) => [z.id, z]));
  const anchorOf = new Map(world.rooms.map((r) => [r.zoneId, r.anchor]));
  let covered = false; // màn bài học Flutter đang che cảnh → ngừng vẽ (docs/bridge.md)
  const closeLesson = (): void => {
    paused = false;
    covered = false;
    learn.suspend(false);
    // vừa học thêm chữ → có thể mở vùng mới (R-HANH-1)
    void getProgress().then((p) => {
      if (!p) return;
      progress = p;
      open = openList(p);
    });
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
    onBack: () => mapBack(),
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
  // Space nhảy, F chào, C ngồi thiền (R-DIEU-6, R-DIEU-7); đang học / màn tải thì bỏ qua
  const keyboard = new Keyboard(hideHint, (a) => {
    if (paused || loading.active || mapOpen || talking) return;
    if (a === 'jump') player.jump();
    else if (a === 'bow') player.bow();
    else player.toggleSit();
  });
  attachPointerInput(canvas, {
    joystick,
    orbit,
    onFirstInput: hideHint,
    onJoystickStart: () => (player.moveTarget = null),
    tapOnly: () => mapOpen || talking,
    onTap: (x, y) => {
      if (mapOpen) {
        onMapTap(x, y);
        return;
      }
      if (paused || talking) return;
      // đang trong nhà: chạm trúng vật học của nhà → mở bài (R-VUNG-2)
      const room = roomAt(player.position.x, player.position.z);
      const hit = room ? picker.pickObject(x, y, room.hits) : null;
      const zone = hit ? zoneById.get(hit.userData.zoneId as string) : undefined;
      if (zone) {
        openLesson(zone);
        return;
      }
      // chạm mặt sân không làm nhân vật đi nữa — chỉ joystick / phím (R-DIEU-2, 2026-11-13)
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

  /* ---------- nút hành động (R-DIEU-6/7) + hội thoại NPC (R-NPC-2) — thiết kế 2026-11-13.9 ---------- */
  const actions = new ActionButtons({
    jump: () => player.jump(),
    bow: () => player.bow(),
    sit: () => player.toggleSit(),
  });
  let runner: DialogRunner | null = null;
  const dialogBox = new DialogBox(
    (i) => runner?.choose(i) ?? null,
    () => {
      runner?.close();
      runner = null;
      talking = false;
    },
  );
  const talk = new TalkButton((d) => {
    runner = new DialogRunner(d);
    talking = true;
    player.moveTarget = null;
    joystick.end();
    dialogBox.open(d, runner.start());
  });
  const dialogOf = new Map(DIALOGS.map((d) => [d.npc, d]));
  const talkAnchor = new THREE.Vector3();

  /* ---------- truyền tống (R-HANH-2): ở trong vòng 1,2 s → bản đồ mở → chạm nơi → màn tải → trang tải lại ---------- */
  const tp = spec.teleport;
  const ring = tp.enabled ? new RingCharge({ x: tp.center[0], z: tp.center[1] }, ringTrigger(tp), CHARGE_SECONDS, { x: sx, z: sz }) : null;
  const scroll = createMapScroll(scene, camera, JOURNEY_MAP);
  let states: Record<string, PlaceState> = {};
  const closeMap = (): boolean => {
    if (!mapOpen) return false;
    mapOpen = false;
    scroll.close();
    mapHud.show(false);
    ring?.rearm(); // đứng yên trong vòng không mở lại — phải ra rồi vào
    return true;
  };
  const mapHud = new MapHud(closeMap);
  // nút quay lại: đóng khung thoại trước, rồi bản đồ (docs/bridge.md `back`)
  mapBack = (): boolean => {
    if (dialogBox.isOpen) {
      dialogBox.close();
      return true;
    }
    return closeMap();
  };
  const openMap = (): void => {
    mapOpen = true;
    player.moveTarget = null;
    joystick.end();
    states = placeStates(JOURNEY_MAP.places, SCENE.id, HOME_SCENE, open, REGION_SCENES);
    scroll.open(world.teleport?.center ?? player.position, states);
    mapHud.show(true);
  };
  let travelling = false;
  const travel = (to: string): void => {
    travelling = true;
    player.moveTarget = null;
    loading.show(loadScene(to).spec.site); // loading.active → nhân vật đứng yên
    const next = new URLSearchParams(to === HOME_SCENE ? { tu: SCENE.id } : { vung: to });
    // giữ tham số thử trên trình duyệt
    for (const k of ['debug', 'mo', 'nhan-vat']) if (params.has(k)) next.set(k, params.get(k) ?? '');
    // replace: không chất lịch sử trang mỗi lần đi về
    void nextPaint().then(() => location.replace(`${location.pathname}?${next.toString()}`));
  };
  onMapTap = (x, y) => {
    mapHud.hideCard(); // chạm chỗ khác → ẩn thẻ yêu cầu
    const hit = scroll.pick(x, y);
    const place = hit ? placeAt(JOURNEY_MAP.places, hit.px, hit.py) : null;
    if (!place || travelling) return;
    const st = states[place.id];
    const to = placeScene(place.id, HOME_SCENE);
    if (st === 'mo') travel(to);
    else if (st === 'khoa' || st === 'sapMo') {
      scroll.flash(place.id);
      const need = st === 'khoa' ? progress?.need[to] : undefined;
      mapHud.need({ han: place.han, name: place.ten, ...need }, progress?.chars ?? 0);
    }
    // nơi đang ở ('oDay') → không có gì
  };

  /* ---------- vòng lặp ---------- */
  const nameTag = new NameTag();
  const input: MoveInput = { x: 0, y: 0 };
  // tường / nhà chắn tầm nhìn → camera kéo lại gần (R-DIEU-4)
  const sight = colliders.sightBlock.bind(colliders);
  character.facing.rotation.y = orbit.yaw + Math.PI; // vào game: nhân vật quay lưng về camera, nhìn về phía trước
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
    player.update(dt, input, orbit.yaw, paused || loading.active || mapOpen || talking);
    const pos = player.position;
    orbit.follow(dt, pos.x - fromX, pos.z - fromZ); // camera tự xoay ra sau lưng khi đi (R-DIEU-3)
    for (const npc of npcSet.npcs) npc.update(dt, pos);
    if (ring && !travelling && !loading.active && !mapOpen) {
      if (ring.update(pos, dt)) openMap();
      world.teleport?.setCharge(ring.charge);
    }
    scroll.update(dt);
    zones.update(pos);
    areas.update(pos);
    entries.update(pos);
    world.update(dt, pos);
    const room = roomAt(pos.x, pos.z);
    orbit.update(camera, pos, dt, false, groundAt, room?.floor, sight);
    if (!covered) renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    learn.follow(zones.current ? anchorOf.get(zones.current.id) : undefined, camera);
    // nút "Nói chuyện": NPC gần nhất trong 2,5 m, không đang học / ngồi / bản đồ / thoại / màn tải (R-NPC-2)
    const near = paused || mapOpen || talking || loading.active || player.isSitting ? null : npcInTalkRange(npcSet.npcs, pos);
    talk.set(near ? (dialogOf.get(near.id) ?? null) : null);
    if (near) talk.follow(talkAnchor.copy(near.root.position).setY(near.root.position.y + 2.3), camera);
    dialogBox.update(dt);
    actions.update({
      hidden: paused || covered || loading.active || mapOpen || talking,
      air: player.state.air,
      sitting: player.isSitting,
      bowing: player.isBowing,
    });
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
