import * as THREE from 'three';
import './style.css';
import { FlutterBridge, getProgress, type JourneyProgress } from './bridge/flutterBridge';
import { Colliders } from './collision/colliders';
import { GamePlay, type TableSeat } from './gamePlay';
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
import { NHAP_DINH_OPEN_AT, NhapDinh } from './scene/nhapDinh';
import { el } from './ui/dom';
import { LearnButton } from './ui/learnButton';
import { FpsCounter, NameTag } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { MapHud } from './ui/mapHud';
import { ActionButtons } from './ui/actionButtons';
import { DialogBox, TalkButton } from './ui/dialogBox';
import { SeatButton } from './ui/seatButton';
import { BoardButton } from './ui/boardButton';
import { ReadBookButton } from './ui/readBookButton';
import { borrowedBook } from './zones/library';
import { GuideButton } from './ui/guideButton';
import { gameSigns, guideDialog, signInRange } from './zones/gameGuides';
import { dailyBoardSpot, nearBoard, tasksLeft } from './zones/dailyBoard';
import { seatInRange, type SeatSpot } from './zones/seats';
import { addSeatGlow } from './scene/seatGlow';
import { LoadingScreen, nextPaint } from './ui/loadingScreen';
import { ZoneTracker } from './zones/zoneTracker';
import { JOURNEY_MAP, placeAt, placeScene, placeStates, type PlaceState } from './zones/journeyMap';
import { RingCharge } from './zones/ringCharge';
import { DIALOGS, DialogRunner, dailyLine, type Dialog } from './zones/dialogs';
import { LIBRARIAN, LibraryDesk } from './libraryDesk';
import { reviewItems } from './zones/review';
import { fallbackStudy, studyMenu } from './zones/studyMenu';
import { RADICALS, type Radical } from './zones/radicals';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';
import { musicVolume, TRACKS } from './zones/music';
import { AmbientMusic } from './ui/ambientMusic';

/** Nhãn tên cao hơn đỉnh búi tóc đệ tử (~2,2 m) một chút. */
const NAME_TAG_HEIGHT = 2.5;
/** file nhạc đóng gói (R-NHAC-1): đường dẫn `./nhac/<file>` → URL sau build */
const MUSIC_URLS = import.meta.glob('./nhac/*.{ogg,mp3,wav,m4a}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

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
  const hanText = [spec.site.han, TELEPORT_TEXT, '此', ...(spec.lessons.radicals ? RADICALS.map((r) => r.form) : []), ...JOURNEY_MAP.places.map((p) => p.han), ...spec.site.areas.map((a) => a.han ?? ''), ...ZONE_CONTENT.map((c) => c.lesson.han), signText(spec)].join('');
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
  // NPC đứng tại chỗ, giữ hướng đặc tả (R-NPC-1)
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
      desk.sync(p.book); // màn danh mục Flutter có thể vừa ghi mượn (R-SACH-1)
    });
  };
  const lesson = new LessonBoard(closeLesson);
  // bảng gỡ lỗi: ?debug (trình duyệt) hoặc Flutter gửi `debug` (bản debug của app)
  const fps = new FpsCounter(new URLSearchParams(location.search).has('debug'));
  // dừng hẳn vòng lặp khi app xuống nền (Flutter gửi `lifecycle`) hoặc tab bị ẩn — đỡ tốn pin (mốc 4)
  let appHidden = false;
  let running = true;
  let music: AmbientMusic | null = null; // nhạc nền trà lâu — dựng bên dưới (R-NHAC-1)
  const setRunning = (): void => {
    const want = !appHidden && !document.hidden;
    if (want === running) return;
    running = want;
    if (!want) music?.stopNow(); // app xuống nền / tab ẩn → nhạc dừng (R-NHAC-1)
    if (want) {
      clock.getDelta(); // bỏ khoảng thời gian đã dừng
      requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', setRunning);
  const bridge = new FlutterBridge({
    onResume: (stand) => {
      closeLesson();
      if (stand && player.isSitting) player.toggleSit(); // "Xuất định" → đứng dậy (R-HANH-3)
    },
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
  // ngồi 1 s nhập định + 0,15 s chữ tan rồi thẻ mới mở (thiết kế 2026-11-13.19 — scene/nhapDinh.ts)
  const SIT_TO_LEARN = NHAP_DINH_OPEN_AT;
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
  let onSeat = false; // ngồi bằng nút nổi "Ngồi" / "Vào bàn" (R-NGOI-1) → không mở cuộn sách (R-ON-8)
  /** Mỗi khung: đếm thời gian ngồi ôn tại chỗ, ở bất kỳ đâu; đủ `SIT_TO_LEARN` thì mở cuộn sách Ngồi ôn (R-ON-8). */
  const meditate = (dt: number, busy: boolean): void => {
    if (!player.isSitting) {
      sitTime = 0;
      sitOpened = false;
      onSeat = false;
      return;
    }
    if (onSeat || sitOpened || busy) return;
    sitTime += dt;
    if (sitTime < SIT_TO_LEARN) return;
    sitOpened = true;
    study();
  };
  /** Cuộn sách Ngồi ôn (R-ON-8): bảng chọn ở Flutter; chưa có màn → còn bộ đến hạn thì lượt ôn, không thì thẻ bộ mới. */
  const study = (): void => {
    const due = progress?.due ?? [];
    const menu = studyMenu({ due, learned: learnedRadicals, hasLessons: !!spec.lessons.radicals });
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    const learned = RADICALS.filter((r) => learnedRadicals.has(r.id));
    void bridge.openStudy({ menu, review: reviewItems(due), learned, region: spec.site.name }).then((native) => {
      if (native) {
        covered = true; // "Đứng dậy" → resume {stand: true} → closeLesson hỏi lại tiến độ, nhân vật đứng dậy
        return;
      }
      paused = false;
      learn.suspend(false);
      const pick = fallbackStudy(menu);
      if (pick === 'review') openReview(due, menu.next);
      else if (pick === 'learn' && menu.next) openRadical(menu.next);
    });
  };
  /** Lượt ôn câu đố (R-ON-5); chưa có màn ôn → thẻ bộ mới nếu học được ở đây. */
  const openReview = (due: readonly string[], next: Radical | null): void => {
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    void bridge.openReview(reviewItems(due), spec.site.name).then((native) => {
      if (native) {
        covered = true; // đóng màn ôn → resume → closeLesson hỏi lại tiến độ (bộ đã ôn hết đến hạn)
        return;
      }
      paused = false;
      learn.suspend(false);
      if (next) openRadical(next);
    });
  };
  /** Bảng nhiệm vụ hằng ngày (R-NV-3): màn Flutter; chưa có màn → Tiểu Mặc đọc bảng qua khung thoại. */
  const openDaily = (): void => {
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    // hỏi tiến độ mới nhất (sang ngày mới → bộ đến hạn đổi) rồi gửi kèm câu đố "Ôn ngay" + chữ từng bộ
    void (async () => {
      const fresh = await getProgress();
      if (fresh) progress = fresh;
      const forms = Object.fromEntries(RADICALS.map((r) => [r.id, r.form]));
      if (await bridge.openDaily(reviewItems(progress?.due ?? []), forms)) {
        covered = true; // đóng bảng → resume → closeLesson hỏi lại tiến độ
        return;
      }
      paused = false;
      learn.suspend(false);
      say('tieu-mac', dailyLine(progress?.daily ?? null), () => {});
    })();
  };
  /** Bộ sắp học khi tu luyện (vùng có bộ thủ, còn bộ chưa học) — `undefined` = không tu luyện được ở đây. */
  const nextRadical = (): Radical | undefined => (spec.lessons.radicals ? RADICALS.find((r) => !learnedRadicals.has(r.id)) : undefined);
  const nhapDinh = new NhapDinh(scene);
  const zones = new ZoneTracker(placed.zones, (z) => learn.setZone(z));

  /* ---------- chỗ ngồi (R-NGOI-1): nút nổi "Ngồi" / "Vào bàn"; nút Ngồi ôn ngồi tại chỗ ---------- */
  type SeatPick = TableSeat | SeatSpot;
  let seatList: SeatPick[] | null = null; // dựng lần đầu cần (gamePlay khai báo bên dưới)
  const seatSpots = (): SeatPick[] =>
    (seatList ??= [
      ...gamePlay.seatSpots(),
      ...world.seats.map((s) => ({ ...s, kind: 'ngoi' as const })),
    ]);
  const sitAt = (spot: SeatPick): void => {
    if (player.isSitting) return;
    onSeat = true;
    if ('table' in spot) {
      gamePlay.sitAt(spot); // ghế bàn chơi (R-GIAO-1)
      return;
    }
    // án thư / bàn trà (R-VA-4)
    player.moveTarget = null;
    player.position.set(spot.x, spot.y ?? player.position.y, spot.z);
    character.facing.rotation.y = spot.rotY;
    orbit.yaw = spot.rotY - Math.PI; // camera sau lưng, nhìn về án
    player.toggleSit();
  };
  const seatButton = new SeatButton<SeatPick>((spot) => sitAt(spot));
  // nhạc nền trà lâu (R-NHAC-1): đài phát theo giờ thật, âm lượng theo khoảng cách tới sàn trà lâu
  const teaIds = new Set(spec.buildings.filter((b) => b.kind === 'tra-lau').map((b) => b.id));
  const teaFloors = world.rooms.filter((r) => teaIds.has(r.zoneId)).map((r) => r.floor);
  music = teaFloors.length > 0 ? new AmbientMusic(TRACKS, (f) => MUSIC_URLS[`./nhac/${f}`]) : null;
  const seatGlow = addSeatGlow(scene, spec.lanternStyle.trim);

  /* ---------- điều khiển ---------- */
  const orbit = new OrbitCamera(spec.camera);
  const joystick = new Joystick(el('joy'), el('knob'), el('joyGhost'));
  const picker = new GroundPicker(camera, world.ground);
  // Space nhảy, F chào, C ngồi ôn (R-DIEU-6, R-DIEU-7); đang học / màn tải thì bỏ qua
  const keyboard = new Keyboard((a) => {
    if (paused || loading.active || mapOpen || talking) return;
    if (a === 'jump') player.jump();
    else if (a === 'bow') player.bow();
    else if (a === 'seat') {
      const spot = seatButton.current;
      if (spot) sitAt(spot); // phím E = nút nổi Ngồi (R-NGOI-1)
    } else player.toggleSit(); // C: ngồi ôn tại chỗ (R-DIEU-7)
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

  // không báo tên khu: chip tên nơi + nút góc nhìn bỏ (R-HUD-1), thẻ tên khu giữa màn bỏ (R-HUD-3) — 2026-11-13

  /* ---------- nút hành động (R-DIEU-6/7) + hội thoại NPC (R-NPC-2) — thiết kế 2026-11-13.9 ---------- */
  const actions = new ActionButtons({
    jump: () => player.jump(),
    bow: () => player.bow(),
    sit: () => player.toggleSit(), // Thiền: luôn tại chỗ (R-DIEU-7)
  });
  let runner: DialogRunner | null = null;
  const dialogBox = new DialogBox(
    (i) => {
      const c = runner?.current?.choices[i];
      if (c?.action === 'daily') afterSay = openDaily; // đóng khung rồi mở bảng (R-NV-3)
      if (LibraryDesk.handles(c)) afterSay = () => desk.act(c); // mượn / trả sách (R-SACH-1, R-SACH-4)
      return runner?.choose(i) ?? null;
    },
    () => {
      runner?.close();
      runner = null;
      talking = false;
      const then = afterSay;
      afterSay = null;
      then?.();
    },
  );
  const startTalk = (d: Dialog): void => {
    runner = new DialogRunner(d);
    talking = true;
    player.moveTarget = null;
    joystick.end();
    dialogBox.open(d, runner.start());
  };
  const talk = new TalkButton(startTalk);
  // nút "Xem bảng" trên bảng nhiệm vụ 日課榜, chấm son = số việc còn hôm nay (R-NV-3)
  const boardAt = isHome ? dailyBoardSpot(spec.props) : null;
  const boardButton = boardAt ? new BoardButton({ ...boardAt, y: groundAt(boardAt.x, boardAt.z) }, openDaily) : null;
  // nút "Cách chơi" trên biển tên trò chơi Kỳ Văn Uyển → NPC của bàn giảng luật (R-GIAO-2)
  const signs = gameSigns(spec.gameTables);
  const guideButton = signs.length ? new GuideButton((sign) => startTalk(guideDialog(sign))) : null;
  const dialogOf = new Map(DIALOGS.map((d) => [d.npc, d]));
  // thủ thư Tàng Thư Các: thoại đổi theo việc đang mượn sách (R-SACH-1, R-SACH-4)
  const desk = new LibraryDesk(bridge, progress?.book ?? null, {
    talk: startTalk,
    say: (text) => say(LIBRARIAN, text, () => {}),
    cover: () => {
      paused = true;
      covered = true;
      learn.suspend(true);
    },
  });
  const dialogFor = (npcId: string): Dialog | undefined => (npcId === LIBRARIAN ? desk.dialog() : dialogOf.get(npcId));
  // thẻ "Đọc sách" khi đang mượn sổ từ, mọi khu mọi vùng → mở sổ từ Flutter (R-SACH-2, R-SACH-3)
  const readBook = new ReadBookButton(() => {
    player.moveTarget = null;
    void desk.read();
  });

  /* ---------- khu giao lưu (R-GIAO-1, R-CO-1..3, R-DAU-1): bàn cờ, bàn đấu chữ — gamePlay.ts ---------- */
  let afterSay: (() => void) | null = null;
  /** Một câu NPC nói qua khung thoại có sẵn; đóng khung → `onClose`. */
  const say = (npcId: string, text: string, onClose: () => void): void => {
    const base = dialogFor(npcId);
    const d: Dialog = { npc: npcId, name: base?.name ?? npcId, han: base?.han, start: 'loi', lines: [{ id: 'loi', text, choices: [{ text: 'Vâng', next: null }] }] };
    runner = new DialogRunner(d);
    talking = true;
    joystick.end();
    afterSay = onClose;
    dialogBox.open(d, runner.start());
  };
  const gamePlay = new GamePlay(world.gameTables, {
    scene,
    colliders,
    player,
    face: (rotY) => {
      character.facing.rotation.y = rotY;
      orbit.yaw = rotY - Math.PI; // đứng dậy: camera sau lưng
    },
    groundAt,
    say,
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
    for (const npc of npcSet.npcs) npc.update(dt);
    gamePlay.update(dt);
    if (ring && !travelling && !loading.active && !mapOpen) {
      if (ring.update(pos, dt)) openMap();
      world.teleport?.setCharge(ring.charge);
    }
    scroll.update(dt);
    zones.update(pos);
    world.update(dt, pos);
    const room = roomAt(pos.x, pos.z);
    if (!gamePlay.placeCamera(camera)) orbit.update(camera, pos, dt, false, groundAt, room?.floor, sight);
    if (!covered) renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    const busy = paused || covered || loading.active || mapOpen || talking;
    meditate(dt, busy);
    // nhập định (R-HANH-3): vòng sáng + chữ bộ sắp học; đứng dậy / đã mở thẻ → tắt dần
    const upcoming = player.isSitting && !onSeat && !sitOpened && !busy ? nextRadical() : undefined;
    nhapDinh.update(dt, pos, upcoming ? sitTime : null, upcoming?.form ?? '');
    nameTag.setVisible(!nhapDinh.charShown);
    learn.follow(zones.current ? anchorOf.get(zones.current.id) : undefined, camera);
    // nút "Nói chuyện": NPC gần nhất trong 2,5 m, không đang học / ngồi / bản đồ / thoại / màn tải (R-NPC-2)
    const near = paused || mapOpen || talking || loading.active || player.isSitting ? null : npcInTalkRange(npcSet.npcs, pos);
    talk.set(near ? (dialogFor(near.id) ?? null) : null);
    if (near) talk.follow(talkAnchor.copy(near.root.position).setY(near.root.position.y + 2.3), camera);
    // nút nổi "Ngồi": chỗ ngồi gần nhất trong tầm, cùng tầng; không khi đang ngồi / bay / bận (R-NGOI-1)
    const seatFree = !(paused || covered || loading.active || mapOpen || talking || player.isSitting || player.state.air);
    const spot = seatFree ? (seatInRange(seatSpots(), pos.x, pos.z, pos.y) ?? null) : null;
    seatButton.set(spot);
    seatButton.follow(camera);
    seatButton.avoid(el('talk')); // không đè nút "Nói chuyện"
    readBook.set(borrowedBook(desk.book) ?? null, !(paused || covered || loading.active || mapOpen || talking || player.isSitting));
    if (boardButton && boardAt) {
      const allLearned = (progress?.radicals.length ?? 0) >= RADICALS.length;
      boardButton.set(seatFree && nearBoard(boardAt, pos.x, pos.z), tasksLeft(progress?.daily ?? null, allLearned));
      boardButton.follow(camera);
    }
    if (guideButton) {
      const sign = seatFree ? signInRange(signs, pos.x, pos.z) : null;
      guideButton.set(sign, sign ? groundAt(sign.x, sign.z) : 0);
      guideButton.follow(camera);
    }
    seatGlow.set(spot);
    seatGlow.update(dt);
    // mở bài học / ôn / bảng, màn tải → nhạc tắt dần; đóng → phát tiếp theo giờ (R-NHAC-1)
    music?.update(dt, paused || covered || loading.active ? 0 : musicVolume(teaFloors, pos.x, pos.z));
    dialogBox.update(dt);
    actions.update({
      hidden: paused || covered || loading.active || mapOpen || talking,
      air: player.state.air,
      sitting: player.isSitting,
      bowing: player.isBowing,
      cultivate: spec.lessons.radicals ? RADICALS.filter((r) => !learnedRadicals.has(r.id)).length || null : null,
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
