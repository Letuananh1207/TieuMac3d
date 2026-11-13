import * as THREE from 'three';
import './style.css';
import { FlutterBridge, getProgress, type JourneyProgress } from './bridge/flutterBridge';
import { Colliders } from './collision/colliders';
import { GamePlay } from './gamePlay';
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
import { signText } from './scene/signAtlas';
import { buildWorld } from './scene/world';
import { el } from './ui/dom';
import { LearnButton } from './ui/learnButton';
import { AreaBanner } from './ui/areaBanner';
import { FpsCounter, NameTag } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { MapHud } from './ui/mapHud';
import { ActionButtons } from './ui/actionButtons';
import { DialogBox, TalkButton } from './ui/dialogBox';
import { LoadingScreen, nextPaint } from './ui/loadingScreen';
import { AreaEntryTracker } from './zones/areaTracker';
import { ZoneTracker } from './zones/zoneTracker';
import { JOURNEY_MAP, placeAt, placeScene, placeStates, type PlaceState } from './zones/journeyMap';
import { RingCharge } from './zones/ringCharge';
import { DIALOGS, DialogRunner, type Dialog } from './zones/dialogs';
import { RADICALS, type Radical } from './zones/radicals';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';
import { FILMS, nearestSeat } from './zones/videos';

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
  // bộ thủ tu luyện ở vùng có bài học bộ thủ (R-HANH-3) — thẻ HTML dự phòng vẽ chữ bằng font này
  const hanText = [spec.site.han, TELEPORT_TEXT, '此', ...(spec.lessons.radicals ? RADICALS.map((r) => r.form) : []), ...JOURNEY_MAP.places.map((p) => p.han), ...spec.site.areas.map((a) => a.han ?? ''), ...ZONE_CONTENT.map((c) => c.lesson.han), signText(spec), ...FILMS.map((f) => f.title)].join('');
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
  // ?dung=x,z — thử trên trình duyệt: đứng sẵn ở (x, z) (vd. cạnh bàn cờ ?dung=-22,36.5)
  const dung = (params.get('dung') ?? '').split(',').map(Number);
  const [sx, sz] = back ? back.at : dung.length === 2 && dung.every(Number.isFinite) ? dung : spec.player.start;
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
      learnedRadicals = new Set(p.radicals);
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
    if (!want) world.cinema?.screen.pause(); // app xuống nền → dừng phim (R-RAP-2)
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

  /* ---------- tu luyện (R-HANH-3): ngồi thiền ≥ 1 giây ở vùng có bộ thủ → thẻ bộ chưa học đầu tiên ---------- */
  // Bài học là lớp riêng của người học (theo tiến độ của họ) — cảnh không đổi theo tiến độ (R-VUNG-1).
  let learnedRadicals = new Set(progress?.radicals ?? []);
  const SIT_TO_LEARN = 1; // giây ngồi trước khi thẻ mở
  let sitTime = 0;
  let sitOpened = false; // lần ngồi này đã mở thẻ → đứng dậy rồi ngồi lại mới mở thẻ sau
  const openRadical = (r: Radical): void => {
    if (paused) return;
    const id = r.id;
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    void bridge.openRadical(r, learnedRadicals.has(id), spec.site.name).then((native) => {
      if (native) {
        covered = true;
        return;
      }
      // không có Flutter (trình duyệt): bảng HTML dự phòng; mở là coi như đã học (chỉ trong phiên, không lưu)
      lesson.open({
        han: r.form,
        pinyin: r.pinyin,
        meaning: `${r.name} — ${r.meaning}`,
        info: [
          ...(r.full ? ([['Dạng đủ', r.full]] as [string, string][]) : []),
          ['Nét', String(r.strokes)],
          ['Chữ có bộ này', r.examples.map((e) => `${e.han} ${e.pinyin} · ${e.meaning}`).join(' — ')],
        ],
      });
      learnedRadicals.add(id);
    });
  };
  /** Mỗi khung: đếm thời gian ngồi thiền; đủ `SIT_TO_LEARN` thì mở thẻ bộ chưa học đầu tiên (R-HANH-3). */
  const meditate = (dt: number, busy: boolean): void => {
    if (!spec.lessons.radicals || !player.isSitting) {
      sitTime = 0;
      sitOpened = false;
      return;
    }
    if (sitOpened || busy) return;
    sitTime += dt;
    if (sitTime < SIT_TO_LEARN) return;
    sitOpened = true;
    const next = RADICALS.find((r) => !learnedRadicals.has(r.id));
    if (next) openRadical(next); // học đủ → ngồi thiền chỉ là ngồi
  };
  const zones = new ZoneTracker(placed.zones, (z) => learn.setZone(z));

  /* ---------- rạp phim (R-RAP-1): Ngồi gần bồ đoàn → lên bồ đoàn, nhìn về màn; xa → ngồi thiền tại chỗ ---------- */
  world.cinema?.screen.setFilms(FILMS);
  const sitOrWatch = (): void => {
    if (gamePlay.trySit()) return; // gần ghế bàn chơi → ngồi vào bàn (R-GIAO-1)
    const seat = !player.isSitting && world.cinema ? nearestSeat(world.cinema.seats, player.position.x, player.position.z) : undefined;
    if (seat) {
      player.position.set(seat.x, seat.y, seat.z);
      character.facing.rotation.y = seat.rotY;
      orbit.yaw = seat.rotY - Math.PI; // camera sau lưng, nhìn về màn
    }
    player.toggleSit();
  };

  /* ---------- điều khiển ---------- */
  const orbit = new OrbitCamera(spec.camera);
  const joystick = new Joystick(el('joy'), el('knob'), el('joyGhost'));
  const picker = new GroundPicker(camera, world.ground);
  // Space nhảy, F chào, C ngồi thiền (R-DIEU-6, R-DIEU-7); đang học / màn tải thì bỏ qua
  const keyboard = new Keyboard((a) => {
    if (paused || loading.active || mapOpen || talking) return;
    if (a === 'jump') player.jump();
    else if (a === 'bow') player.bow();
    else sitOrWatch();
  });
  attachPointerInput(canvas, {
    joystick,
    orbit,
    onJoystickStart: () => (player.moveTarget = null),
    tapOnly: () => mapOpen || talking,
    onTap: (x, y) => {
      if (mapOpen) {
        onMapTap(x, y);
        return;
      }
      if (paused || talking) return;
      if (gamePlay.tap(x, y, camera)) return; // đang ngồi chơi: chạm vào bàn, không đi (R-GIAO-1)
      if (world.cinema?.screen.playing) world.cinema.screen.unmute(); // chạm lần đầu khi xem → có tiếng (R-RAP-2)
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

  /* ---------- thẻ tên khu (R-HUD-3); chip tên nơi + nút góc nhìn đã bỏ (R-HUD-1, 2026-11-13) ---------- */
  // thẻ tên khu chỉ theo khu của đặc tả (không theo nhà) → vào / ra nhà không hiện thẻ (R-HUD-3)
  const banner = new AreaBanner();
  const entries = new AreaEntryTracker(spec.site.areas, (a) => banner.show(a));

  /* ---------- nút hành động (R-DIEU-6/7) + hội thoại NPC (R-NPC-2) — thiết kế 2026-11-13.9 ---------- */
  const actions = new ActionButtons({
    jump: () => player.jump(),
    bow: () => player.bow(),
    sit: () => sitOrWatch(),
  });
  let runner: DialogRunner | null = null;
  const dialogBox = new DialogBox(
    (i) => runner?.choose(i) ?? null,
    () => {
      runner?.close();
      runner = null;
      talking = false;
      const then = afterSay;
      afterSay = null;
      then?.();
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

  /* ---------- khu giao lưu (R-GIAO-1, R-CO-1..3, R-DAU-1): bàn cờ, bàn đấu chữ — gamePlay.ts ---------- */
  let afterSay: (() => void) | null = null;
  const gamePlay = new GamePlay(world.gameTables, {
    scene,
    colliders,
    player,
    face: (rotY) => {
      character.facing.rotation.y = rotY;
      orbit.yaw = rotY - Math.PI; // đứng dậy: camera sau lưng
    },
    groundAt,
    // một câu NPC nói qua khung thoại có sẵn; đóng khung → onClose
    say: (npcId, text, onClose) => {
      const base = dialogOf.get(npcId);
      const d: Dialog = { npc: npcId, name: base?.name ?? npcId, han: base?.han, start: 'loi', lines: [{ id: 'loi', text, choices: [{ text: 'Vâng', next: null }] }] };
      runner = new DialogRunner(d);
      talking = true;
      joystick.end();
      afterSay = onClose;
      dialogBox.open(d, runner.start());
    },
    learned: () => learnedRadicals,
  });
  void gamePlay.placeNpcs().then((p) => {
    if (p.length) console.warn(p.join('\n'));
  });
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
    gamePlay.update(dt, pos);
    if (ring && !travelling && !loading.active && !mapOpen) {
      if (ring.update(pos, dt)) openMap();
      world.teleport?.setCharge(ring.charge);
    }
    scroll.update(dt);
    zones.update(pos);
    entries.update(pos);
    world.update(dt, pos);
    // R-RAP-2: đang ngồi trên bồ đoàn → phim phát; đứng dậy → dừng
    if (world.cinema) {
      const watching = player.isSitting && !!nearestSeat(world.cinema.seats, pos.x, pos.z, 0.3);
      if (watching) world.cinema.screen.play();
      else world.cinema.screen.pause();
    }
    const room = roomAt(pos.x, pos.z);
    if (!gamePlay.placeCamera(camera)) orbit.update(camera, pos, dt, false, groundAt, room?.floor, sight);
    if (!covered) renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    meditate(dt, paused || covered || loading.active || mapOpen || talking);
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
