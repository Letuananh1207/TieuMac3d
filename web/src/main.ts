import * as THREE from 'three';
import './style.css';
import cursorArrow from './cursor/tro.svg?raw';
import cursorButton from './cursor/tro-nut.svg?raw';
import { installCursors } from './ui/cursor';
import { openTrialStore } from './bridge/browserStore';
import { FlutterBridge, getGarden, getHome, getMang, getProgress, hasFlutter } from './bridge/flutterBridge';
import { Colliders } from './collision/colliders';
import { GamePlay, type TableSeat } from './gamePlay';
import { Joystick } from './input/joystick';
import { attachCheDoNhap, troChuyenTrenThanh } from './input/cheDoNhap';
import { Keyboard } from './input/keyboard';
import { ChatRoom } from './chatRoom';
import { WalletRoom } from './walletRoom';
import { AreaMapRoom } from './areaMapRoom';
import { OrbitCamera } from './input/orbitCamera';
import { attachPointerInput } from './input/pointers';
import { GroundPicker } from './input/tapToMove';
import { createDiscipleCharacter } from './player/discipleCharacter';
import { createPlayerCharacter } from './player/playerCharacter';
import { PlayerController, type MoveInput } from './player/controller';
import { npcInTalkRange, placeNpcs, showNearNpcs } from './player/npc';
import { TownNpcs } from './townNpcs';
import { DanTranh } from './danTranh';
import { HOME_SCENE, loadScene, REGION_SCENES } from './scene/loadSpec';
import { HOME_OF_PLAYER, isHomeScene } from './scene/placeNames';
import { createMapScroll } from './scene/banDo';
import { arrivalSpot, CHARGE_SECONDS, ringTrigger } from './scene/teleportLayout';
import { arrivalFor, buttonPortalAt } from './scene/portals';
import { viewDistance } from './scene/farMountains';
import { createStage, gpuName, MAX_PIXEL_RATIO, probeGpu } from './scene/renderer';
import { detailOf, FrameCap, pickTier, ResolutionGovernor, tierParam, TIERS } from './scene/quality';
import { isColorManaged, isSoft, withLookParam } from './scene/look';
import { addVignette } from './ui/vignette';
import { mergeStatic } from './scene/merge';
import { inRect, type Room } from './scene/rooms';
import { signText } from './scene/signAtlas';
import { buildWorld, buildWorldStepped, type StepTimes } from './scene/world';
import { waitHouses } from './scene/nhaModel';
import { CraneFlight, CraneRide, cameraPose, clearCraneParam, craneArrives, craneDeparts, craneHud, craneParams, dropCraneVeil, preloadCrane, uncoverVeil } from './cuoiHac';
import { NHAP_DINH_OPEN_AT, NhapDinh } from './scene/nhapDinh';
import { NgoiMat, type SitPlace } from './ngoiMat';
import { el } from './ui/dom';
import { LearnButton } from './ui/learnButton';
import { FpsCounter, NameTag } from './ui/hud';
import { LessonBoard } from './ui/lessonBoard';
import { MapHud } from './ui/mapHud';
import { ActionButtons } from './ui/actionButtons';
import { DialogBox, TalkButton } from './ui/dialogBox';
import { SeatButton } from './ui/seatButton';
import { ExitButton } from './ui/exitButton';
import { BoardButton } from './ui/boardButton';
import { ReadBookButton } from './ui/readBookButton';
import { borrowedBook } from './zones/library';
import { GuideButton } from './ui/guideButton';
import { GuidePanel } from './ui/guidePanel';
import { GameHud } from './ui/gameHud';
import { gameSigns, miniGameSigns, signInRange, type GameSign } from './zones/gameGuides';
import { guideOf, studySign } from './zones/studyGuide';
import { DailyPanel } from './ui/dailyPanel';
import { DAILY_NEW_GOAL, boardBeforeNpc, dailyBoardSpot, dailyBoardView, nearBoard, tasksLeft } from './zones/dailyBoard';
import { seatInRange, type SeatSpot } from './zones/seats';
import { addSeatGlow } from './scene/seatGlow';
import { LoadingScreen, nextPaint } from './ui/loadingScreen';
import { HINH_HUD, preloadHinh } from './ui/hinh';
import { ZoneTracker } from './zones/zoneTracker';
import { JOURNEY_MAP, placeAt, placeScene, placeStates, type PlaceState } from './zones/journeyMap';
import { RingCharge } from './zones/ringCharge';
import { travelParams, type TravelHow } from './zones/cuoiHac';
import { ThanhCongCu } from './thanhCongCu';
import { MiniGames } from './miniGames';
import { PortalTrigger } from './zones/portal';
import { DIALOGS, DialogRunner, type Dialog } from './zones/dialogs';
import { LIBRARIAN, LibraryDesk } from './libraryDesk';
import { reviewItems } from './zones/review';
import { scrollMenu, sitBadge } from './zones/studyMenu';
import { TrucLao } from './trucLao';
import { TRUC_LAO } from './zones/trucLao';
import { cuonView, type CuonRowId } from './zones/cuonMuc';
import { RADICALS, type Radical } from './zones/radicals';
import { placeZones, ZONE_CONTENT, type Zone } from './zones/zones';
import { musicVolume, TRACKS } from './zones/music';
import { journeyLine } from './zones/tranSu';
import { AmbientMusic } from './ui/ambientMusic';
import { HomeDecor } from './homeDecor';
import { HomeGarden } from './homeGarden';
import { gardenSpeed } from './zones/vuonHud';
import { NgayDem } from './ngayDem';

// con trỏ hoạt hình nhúng sẵn (L-9) — đặt sớm nhất, trước cả màn tải
installCursors(cursorArrow, cursorButton);

/** Nhãn tên cao hơn đỉnh búi tóc đệ tử (~2,2 m) một chút. */
const NAME_TAG_HEIGHT = 2.5;
/** file nhạc đóng gói (R-NHAC-1): đường dẫn `./nhac/<file>` → URL sau build */
const MUSIC_URLS = import.meta.glob('./nhac/*.{ogg,mp3,wav,m4a}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

async function boot(): Promise<void> {
  // mỗi vùng một cảnh: ?vung=<mã> (không có = tông môn); về nhà: ?tu=<mã vùng vừa rời> (R-HANH-2);
  // qua cổng đi bộ: ?qua=<mã cảnh vừa rời> (R-HANH-4)
  const params = new URLSearchParams(location.search);
  const SCENE = loadScene(params.get('vung'));
  const SCENE_FILE = SCENE.file;
  const isHome = SCENE.id === HOME_SCENE;
  // ?look=cu — ép kiểu nhìn cũ để so trước / sau (Canvas 3D, đo)
  const spec = withLookParam(SCENE.spec, params.get('look'));
  // tiến độ học: Flutter giữ; không khoá vùng (R-HANH-1). Hỏi song song với nạp font.
  const progressAsk = getProgress();
  const flutterAsk = hasFlutter(); // không có Flutter → Văn tiền chế độ thử trong trình duyệt (R-TIEN-7)
  // màn tải che tới khung hình đầu (R-MAN-2); tiến độ theo các bước dựng thật
  const loading = new LoadingScreen(spec.site);
  loading.progress(10);
  // đo thời gian dựng (kế hoạch cưỡi hạc NV1) — `?debug` in bảng ms từng bước
  const laps: [string, number][] = [['bat-dau', performance.now()]];
  const lap = (name: string): void => void laps.push([name, performance.now()]);
  // model nhân vật nạp song song với font (cưỡi hạc: nhân vật ngồi trên hạc ngay khi bay)
  const characterAsk = createPlayerCharacter(params.get('nhan-vat'));

  const canvas = el<HTMLCanvasElement>('stage');
  // mức đồ hoạ theo máy + độ nét động (R-HIEU-1): chọn trước khi tạo WebGL (khử răng cưa chỉ đặt được lúc tạo)
  const gpu = probeGpu();
  // ?muc=cao|vua|thap — ép mức để đo (kế hoạch 2026-11-14-canh-dep), không có = tự chọn theo máy
  const tier = tierParam(params.get('muc')) ?? pickTier(gpu, (navigator as Navigator & { deviceMemory?: number }).deviceMemory);
  const tierSpec = TIERS[tier];
  const maxRatio = Math.min(window.devicePixelRatio || 1, tierSpec.maxRatio, MAX_PIXEL_RATIO);
  const governor = new ResolutionGovernor(Math.min(tierSpec.minRatio, maxRatio), maxRatio);
  const frameCap = new FrameCap(); // tối đa 60 fps; không gánh nổi → 30 đều (R-HIEU-2)
  const { renderer, scene, camera } = createStage(canvas, spec.camera.fov, viewDistance(spec), {
    antialias: tierSpec.antialias,
    ratio: maxRatio,
    colorManaged: isColorManaged(spec.look),
  });
  // tới bằng hạc (`?den=hac`, R-HANH-5): bay trên biển mây trong lúc cảnh thật dựng ngầm — màn tải mờ ngay khi cảnh bay hiện
  preloadCrane(); // model hạc (design/models/hac.glb) nạp sớm, cả khi cất cánh lát nữa; thiếu file → hạc khối
  const flight = craneArrives(params) ? new CraneFlight(renderer, spec, params, detailOf(tier), isColorManaged(spec.look)) : null;
  if (!flight) dropCraneVeil(); // màn mây của index.html chỉ khi thật sự bay (cùng điều kiện — phòng lệch)
  if (flight) {
    void flight.started.then(() => loading.done());
    void characterAsk.then((c) => flight.setRider(c));
  }
  // Biển hiệu, bảng phấn vẽ chữ lên canvas, nên phải nạp font trước khi dựng cảnh.
  // bộ thủ tu luyện ở vùng có bài học bộ thủ (R-HANH-3) — thẻ HTML dự phòng vẽ chữ bằng font này
  // biển / tên nơi chỉ tiếng Việt (R-HUD-4) — chữ Hán chỉ còn ở nội dung học
  const hanText = [...(spec.lessons.radicals ? RADICALS.map((r) => r.form) : []), ...ZONE_CONTENT.map((c) => c.lesson.han), signText(spec)].join('');
  await Promise.allSettled([
    // nạp đủ các mặt chữ Lora (Latin + tiếng Việt) theo chữ thật trên biển
    document.fonts.load('700 72px Lora', `Aa${signText(spec)}`),
    document.fonts.load('700 13px "Be Vietnam Pro"'),
    document.fonts.load('700 52px "Han Serif"', hanText || '字'),
    preloadHinh(HINH_HUD), // hình minh hoạ HUD đợt 1 (2026-11-16.2) giải mã sẵn dưới màn tải — nút hiện hình ngay
  ]);
  let progress = await progressAsk;
  const trial = (await flutterAsk) ? null : openTrialStore();
  loading.progress(30);
  lap('font');
  await nextPaint();

  const clock = new THREE.Clock();
  const colliders = new Colliders();
  // nhà nào có nội thất: theo nội dung bài (lớp học / thư viện), chữ phấn trên bảng = chữ của bài
  const interiors = Object.fromEntries(ZONE_CONTENT.map((c) => [c.id, { kind: c.interior, han: c.lesson.han }]));
  const steps: StepTimes = new Map();
  // đang bay: dựng chia bước, nhường khung cho cảnh bay (R-HANH-5); thường: một mạch dưới màn tải như cũ
  const world = flight
    ? await buildWorldStepped([scene, colliders, spec, interiors, detailOf(tier)], () => new Promise((r) => requestAnimationFrame(() => r())), 10, steps, (k) => flight.progress(k * 0.7))
    : buildWorld(scene, colliders, spec, interiors, detailOf(tier), steps);
  lap('canh');
  // tối nhẹ mép màn (CSS); mức Thấp bỏ — trình duyệt vẫn phải ghép thêm một lớp phủ cả màn (R-HIEU-1)
  const vignette = isSoft(spec.look) && detailOf(tier) >= 1 ? addVignette(canvas, spec.look.vignette, spec.look.vignetteColor) : null;
  // ngày đêm theo giờ VN (R-NGAY-1…3); ?gio=21 ép giờ, ?gio=17&toc=60 tua nhanh
  const ngayDem = new NgayDem(world.dayNight, spec, params, vignette);
  const placed = placeZones(ZONE_CONTENT, world.zoneAnchors);
  // bài học chỉ ở tông môn → cảnh vùng không báo thiếu vùng học
  const problems = [...SCENE.problems, ...(isHome ? placed.problems : [])];
  if (problems.length) console.warn(`Đặc tả cảnh (${SCENE_FILE}):\n- ${problems.join('\n- ')}`);
  loading.progress(80);

  // gấu khối (player/blockCharacter.ts) vẫn giữ làm bản dự phòng, cùng hợp đồng Character
  const character = await characterAsk;
  lap('nhan-vat');
  // về nhà từ một vùng: đứng trước cột của vùng đó, ngoài vòng, nhìn vào cột (R-HANH-2)
  // qua cổng đi bộ: đứng ở chỗ của cổng dẫn về cảnh vừa rời; không có cổng về → chỗ xuất phát (R-HANH-4)
  const viaGate = arrivalFor(spec.portals, params.get('qua'));
  // `player.arriveAtStart` (trấn): về bằng vòng trận cũng đứng ở chỗ xuất phát — cổng trấn (V-39)
  const ringBack = isHome && params.has('tu') && spec.teleport.enabled && !spec.player.arriveAtStart;
  const back = viaGate ?? (ringBack ? arrivalSpot(spec.teleport) : undefined);
  // ?dung=x,z — thử trên trình duyệt: đứng sẵn ở (x, z) (vd. cạnh bàn cờ ?dung=-22,36.5)
  const dung = (params.get('dung') ?? '').split(',').map(Number);
  const [sx, sz] = back ? back.at : dung.length === 2 && dung.every(Number.isFinite) ? dung : spec.player.start;
  character.root.position.set(sx, 0, sz);
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
  lap('npc');
  flight?.progress(0.8);
  const roomAt = (x: number, z: number): Room | undefined => world.rooms.find((r) => inRect(r.floor, x, z));

  /* ---------- bài học: nút nổi trên vật + chạm vật (R-VUNG-1/2/3) ---------- */
  let paused = false; // đang mở bài học: nhân vật đứng yên
  let mapOpen = false; // bản đồ truyền tống đang mở: đứng yên, chỉ nhận chạm (R-HANH-2)
  let talking = false; // đang hội thoại với NPC: đứng yên (R-NPC-2)
  let onMapTap = (_x: number, _y: number): void => {};
  // nút quay lại của máy: bản đồ đang mở thì đóng (R-HANH-2); gán ở phần bản đồ bên dưới
  let mapBack = (): boolean => false;
  // phím E khi không có chỗ ngồi: ra cửa bằng nút (V-71); gán ở phần cổng bên dưới
  let exitAction = (): boolean => false;
  let ride: CraneRide | null = null; // cưỡi hạc: cất cánh (trang cũ) / hạ cánh (trang mới) — R-HANH-5
  let thanh: ThanhCongCu | null = null; // thanh công cụ (R-THANH-1/2) — thanhCongCu.ts, dựng ở phần truyền tống
  const zoneById = new Map(placed.zones.map((z) => [z.id, z]));
  const anchorOf = new Map(world.rooms.map((r) => [r.zoneId, r.anchor]));
  let covered = false; // màn bài học Flutter đang che cảnh → ngừng vẽ (docs/bridge.md)
  let scrollOpen = false; // cuộn sách Ngồi ôn trước mắt đang mở (R-ON-8) — đóng màn Flutter thì vẫn ngồi, cuộn hiện lại
  let lastPick: CuonRowId | null = null; // mục vừa mở từ cuộn → viền ngọc nhấp khi cuộn hiện lại
  let trucLao: TrucLao | null = null; // thầy Trúc Lão (R-HANH-8) — trucLao.ts; chỉ cảnh có NPC `truc-lao`
  const closeLesson = (): void => {
    paused = scrollOpen;
    covered = false;
    learn.suspend(scrollOpen);
    void getProgress().then((p) => {
      if (p) {
        progress = p;
        learnedRadicals = new Set(p.radicals);
        desk.sync(p.book); // màn danh mục Flutter có thể vừa ghi mượn (R-SACH-1)
        walletRoom.sync(p); // về từ Tạp hoá: ví "−n" (R-TIEN-4)
      }
      void garden?.load(false); // Tạp hoá có thể vừa bán hạt vào túi (R-VUON-9); không báo lại luống chín
      if (scrollOpen) showScroll(lastPick); // cuộn hiện lại ngay, mục vừa dùng cập nhật (thiết kế 2026-11-14.21)
      lastPick = null;
      trucLao?.resume(); // thẻ / lượt ôn mở từ Trúc Lão → khung thoại mở lại (R-HANH-8)
    });
  };
  const lesson = new LessonBoard(closeLesson);
  const dailyPanel = new DailyPanel(closeLesson);
  // bảng gỡ lỗi: ?debug (trình duyệt) hoặc Flutter gửi `debug` (bản debug của app)
  const fps = new FpsCounter(new URLSearchParams(location.search).has('debug'));
  // `?debug`: cho công cụ đo (`npm run bench -- --tam-giac`) đọc cảnh — chỉ gỡ lỗi, không dùng trong app
  if (new URLSearchParams(location.search).has('debug')) Object.assign(window, { __hocXa: { scene, camera } });
  const TIER_NAME = { cao: 'Cao', vua: 'Vừa', thap: 'Thấp' } as const;
  const showInfo = (): void =>
    fps.setInfo(
      `${gpuName(renderer)} · ${TIER_NAME[tier]} ${renderer.getPixelRatio()}× · ${frameCap.fps} fps · ${renderer.domElement.width}×${renderer.domElement.height}${ngayDem.label ? ` · ${ngayDem.label}` : ''}`,
    );
  showInfo();
  // dừng hẳn vòng lặp khi app xuống nền (Flutter gửi `lifecycle`) hoặc tab bị ẩn — đỡ tốn pin (mốc 4)
  let appHidden = false;
  let running = true;
  let music: AmbientMusic | null = null; // nhạc nền trà lâu — dựng bên dưới (R-NHAC-1)
  let town: TownNpcs | null = null; // Tiểu Khất + Lão Canh — dựng bên dưới (townNpcs.ts)
  let danTranh: DanTranh | null = null; // nhạc công bục đàn Quảng Trường (R-NPC-9, R-AM-2) — danTranh.ts
  let mini: MiniGames | null = null; // 3 trò nhỏ Trúc Lâm (V-66 B4) — miniGames.ts; chỉ cảnh có `miniGames`
  const setRunning = (): void => {
    const want = !appHidden && !document.hidden;
    if (want === running) return;
    running = want;
    if (!want) music?.stopNow(); // app xuống nền / tab ẩn → nhạc dừng (R-NHAC-1)
    town?.setRunning(want); // tiếng mõ im khi nền / tab ẩn (R-AM-1)
    danTranh?.setRunning(want); // tiếng đàn cũng vậy (R-AM-2)
    mini?.setRunning(want); // tiếng Trúc Lâm (R-AM-3)
    if (want) {
      clock.getDelta(); // bỏ khoảng thời gian đã dừng
      requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', setRunning);
  const bridge = new FlutterBridge({
    onResume: (stand) => {
      closeLesson();
      // "Đứng dậy" / "Xuất định" → cuộn sách cuộn lại 0,25 s rồi đứng dậy (R-HANH-3, thiết kế 2026-11-14.10)
      if (stand && player.isSitting) {
        ngoiMat.rollUp(); // cuộn trước mắt cuộn lại cùng nhịp (R-DIEU-7)
        nhapDinh.rollUpThen(() => player.isSitting && player.toggleSit());
      }
    },
    onVisible: (visible) => {
      appHidden = !visible;
      setRunning();
    },
    onDebug: (on) => fps.setEnabled(on),
    onBack: (): boolean => mapBack() || !!decor?.back() || (gamePlay.active && (gamePlay.stand(), true)) || !!mini?.back(), // nút quay lại: đóng lớp phủ, rồi rời bàn / tiệc / đàn
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

  /* ---------- tu luyện (R-HANH-3): thẻ bộ thủ mở từ Trúc Lão (R-HANH-8); ngồi 1 giây → cuộn bảng chọn (R-ON-8) ---------- */
  // Bài học là lớp riêng của người học (theo tiến độ của họ) — cảnh không đổi theo tiến độ (R-VUNG-1).
  let learnedRadicals = new Set(progress?.radicals ?? trial?.wallet.learned ?? []); // chế độ thử: bộ đã mở thẻ HTML (R-TIEN-7)
  // ngồi ôn 1 s → bảng chọn cuộn sách (R-ON-8, thiết kế 2026-11-14.10 — scene/nhapDinh.ts)
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
      // không có Flutter (trình duyệt): bảng HTML dự phòng; mở là coi như đã học — lưu ở ví thử, lần đầu +10 (R-TIEN-7)
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
      walletRoom.learned(r); // xu bay khi đóng thẻ (ví hiện lại)
    });
  };
  let onSeat = false; // ngồi bằng nút nổi "Ngồi" / "Vào bàn" (R-NGOI-1) → không mở cuộn sách (R-ON-8)
  let seatStudy = false; // … trừ bồ đoàn khu tự học Tàng Thư Các: vẫn nhập định + cuộn sách (R-VA-4)
  let seatHold: Pick<SeatSpot, 'hold' | 'rail'> = {}; // vật cầm / lan can ở chỗ ngồi khi nhìn từ mắt (R-NGOI-1, R-VA-4)
  let miniSeated = false; // ngồi tiệc Lưu Thương / đàn cầm (V-66 B4): camera ngôi 3 (không từ mắt), không cuộn sách
  /** Chỗ đang ngồi cho góc nhìn từ mắt (R-DIEU-7): bàn chơi · chỗ ngồi · Ngồi ôn / bồ đoàn khu tự học (cuộn sách). */
  const sitPlace = (): SitPlace => {
    const g = gamePlay.seatedAt;
    if (g) return { kind: 'ban-choi', ...g };
    if (onSeat && !seatStudy) return { kind: 'ngoi', ...seatHold };
    return { kind: 'on' };
  };
  /** Mỗi khung: đếm thời gian ngồi ôn tại chỗ, ở bất kỳ đâu; đủ `SIT_TO_LEARN` thì mở cuộn sách Ngồi ôn (R-ON-8). */
  const meditate = (dt: number, busy: boolean): void => {
    if (miniSeated && !player.isSitting) {
      miniSeated = false; // đứng dậy khỏi tiệc / đàn: camera về như trước (V-66 B4)
      orbit.sit(false);
    }
    if (!player.isSitting) {
      if (scrollOpen) {
        scrollOpen = false; // đứng dậy (Xuất định / phím) khi cuộn còn mở
        lastPick = null;
        ngoiMat.setMenu(null);
        paused = false;
        learn.suspend(false);
      }
      sitTime = 0;
      sitOpened = false;
      onSeat = false;
      seatStudy = false;
      if (ngoiMat.seated) ngoiMat.stand(); // đứng dậy: camera trượt về ngôi 3 như trước khi ngồi (R-DIEU-7)
      return;
    }
    if (miniSeated) return; // tiệc Lưu Thương / đàn cầm: camera ngôi 3, không cuộn sách (R-LUU-1, R-CAM-1)
    if (!ngoiMat.seated) ngoiMat.sit(sitPlace()); // mọi kiểu ngồi: nhìn từ mắt (R-DIEU-7, R-NGOI-1, R-GIAO-1)
    if ((onSeat && !seatStudy) || sitOpened || busy) return;
    sitTime += dt;
    if (sitTime < SIT_TO_LEARN) return;
    sitOpened = true;
    study();
  };
  /** Dòng nơi đang ngồi trên đầu cuộn: "Khởi Nguyên Trấn · Quảng Trường" (khu `site.areas` chứa chỗ ngồi). */
  const sitPlaceName = (): string => {
    const { x, z } = player.position;
    const a = spec.site.areas.find((q) => x >= Math.min(q.from[0], q.to[0]) && x <= Math.max(q.from[0], q.to[0]) && z >= Math.min(q.from[1], q.to[1]) && z <= Math.max(q.from[1], q.to[1]));
    return a ? `${spec.site.name} · ${a.name}` : spec.site.name;
  };
  /** Mục in trên cuộn trước mắt theo tiến độ mới nhất (`flash` = mục vừa dùng — viền ngọc nhấp). */
  const showScroll = (flash: CuonRowId | null = null): void => {
    const book = borrowedBook(desk.book);
    const left = tasksLeft(progress?.daily ?? null, learnedRadicals.size >= RADICALS.length);
    ngoiMat.setMenu(cuonView(scrollMenu({ book, learned: learnedRadicals, tasksLeft: left }), sitPlaceName(), book), pickScroll, flash);
  };
  /**
   * Cuộn sách Ngồi ôn (R-ON-8, thiết kế 2026-11-14.21): các mục in thẳng trên cuộn trước mắt; nhân vật đứng yên, cần điều
   * khiển / cụm nút / nút Trò chuyện ẩn tới khi "Đứng dậy". Chọn mục → màn Flutter đè (đóng → cuộn hiện lại, mục cập nhật).
   */
  const study = (): void => {
    scrollOpen = true;
    paused = true;
    learn.suspend(true);
    player.moveTarget = null;
    joystick.end();
    showScroll();
  };
  const pickScroll = (id: CuonRowId): void => {
    if (id === 'stand') {
      standFromScroll();
      return;
    }
    lastPick = id;
    paused = false; // các màn tự đặt lại `paused`
    // Đọc sách → sổ từ ở trang đã nhớ (R-SACH-3); không có màn đọc (trình duyệt) → không mở, cuộn vẫn mở
    if (id === 'book') void desk.read().then((opened) => opened || closeLesson());
    else if (id === 'learned') openLearned();
    else openDaily(); // bảng nhiệm vụ (R-NV-3) — "Ôn ngay" ở đó (R-ON-5)
  };
  /** "Xem bộ đã học" (R-ON-8): màn Bộ đã học Flutter (`openLearned`); không có Flutter → thẻ HTML bộ học gần nhất. */
  const openLearned = (): void => {
    paused = true;
    learn.suspend(true);
    const learned = RADICALS.filter((r) => learnedRadicals.has(r.id));
    void bridge.openLearned(learned, spec.site.name).then((native) => {
      if (native) {
        covered = true; // đóng màn → resume → closeLesson: cuộn hiện lại
        return;
      }
      paused = false;
      const last = learned[learned.length - 1];
      if (last) openRadical(last);
      else closeLesson();
    });
  };
  /** "Đứng dậy" trên cuộn / Esc / nút quay lại: chữ đã mờ → cuộn lại 0,25 s → đứng dậy (R-ON-8). */
  const standFromScroll = (): void => {
    scrollOpen = false;
    lastPick = null;
    ngoiMat.setMenu(null);
    paused = false;
    learn.suspend(false);
    ngoiMat.rollUp();
    nhapDinh.rollUpThen(() => player.isSitting && player.toggleSit());
  };
  /** Lượt ôn câu đố (R-ON-5); chưa có màn ôn → thẻ bộ `next` nếu có, không thì `onNone` (Trúc Lão: thoại mở lại). */
  const openReview = (due: readonly string[], next: Radical | null, onNone?: () => void): void => {
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
      else if (onNone) onNone();
      else if (scrollOpen) closeLesson(); // không mở gì: cuộn vẫn mở, đứng yên (R-ON-8)
    });
  };
  /** Bảng nhiệm vụ hằng ngày (R-NV-3): màn Flutter; không có Flutter → bảng HTML `ui/dailyPanel.ts`. */
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
      // không có Flutter (trình duyệt): bảng HTML theo thiết kế; không có tiến độ → tính theo phiên này
      const due = progress?.due ?? [];
      const daily = progress?.daily ?? { learned: learnedRadicals.size, goal: DAILY_NEW_GOAL, due: due.length, streak: 0, best: 0 };
      const allLearned = learnedRadicals.size >= RADICALS.length;
      dailyPanel.open(dailyBoardView(daily, allLearned, learnedRadicals.size), due.map((id) => forms[id] ?? ''), () =>
        openReview(due, null),
      );
    })();
  };
  const nhapDinh = new NhapDinh(scene);
  // ngồi → nhìn từ mắt: hai tay + cuộn / chén trà / bàn chơi; thân mình ẩn khỏi camera mình (ngoiMat.ts)
  const ngoiMat = new NgoiMat(scene, character, spec.camera, spec.look);
  /** camera phụ: OrbitCamera (ngôi 3) và bàn chơi vẽ vào đây, `ngoiMat` trộn ra camera thật */
  const tpCam = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.1, 10);
  const gameCam = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.1, 10);
  const zones = new ZoneTracker(placed.zones, (z) => learn.setZone(z));

  /* ---------- chỗ ngồi (R-NGOI-1): nút nổi "Ngồi" / "Vào bàn"; nút Ngồi ôn ngồi tại chỗ ---------- */
  type SeatPick = TableSeat | SeatSpot;
  let seatList: SeatPick[] | null = null; // dựng lần đầu cần (gamePlay khai báo bên dưới)
  const seatSpots = (): SeatPick[] =>
    (seatList ??= [
      ...gamePlay.seatSpots(),
      ...world.seats.filter((s) => !mini?.seatTaken(s.x, s.z)).map((s) => ({ ...s, kind: 'ngoi' as const })), // đệm có văn nhân: không nút (R-NGOI-1)
      ...(mini?.seatSpots() ?? []), // "Ngồi đàn" (R-CAM-1)
    ]);
  /** Ngồi chỗ của trò Trúc Lâm (V-66 B4): camera ngôi 3 lùi / ngẩng theo trò, không góc từ mắt. */
  const sitMini = (s: { x: number; y: number; z: number; rotY: number }, view: { dist: number; pitch: number; side?: number }): void => {
    if (player.isSitting) return;
    onSeat = true;
    seatStudy = false;
    seatHold = {};
    miniSeated = true;
    player.moveTarget = null;
    player.position.set(s.x, s.y, s.z);
    character.facing.rotation.y = s.rotY;
    player.toggleSit();
    orbit.sit(true);
    orbit.yaw = s.rotY - Math.PI + (view.side ?? 0);
    orbit.dist = view.dist;
    orbit.pitch = view.pitch;
  };
  const sitAt = (spot: SeatPick): void => {
    if (player.isSitting) return;
    if (!('table' in spot) && mini?.sit(spot)) return; // "Ngồi đàn" (R-CAM-1)
    onSeat = true;
    seatStudy = !!spot.study;
    seatHold = 'table' in spot ? {} : { hold: spot.hold, rail: spot.rail };
    if ('table' in spot) {
      gamePlay.sitAt(spot); // ghế bàn chơi (R-GIAO-1)
      return;
    }
    // án thư / bàn trà (R-VA-4)
    player.moveTarget = null;
    player.position.set(spot.x, spot.y ?? player.position.y, spot.z);
    character.facing.rotation.y = spot.rotY;
    orbit.yaw = spot.rotY - Math.PI; // camera sau lưng, nhìn về án
    player.toggleSit(); // nhìn từ mắt: `meditate` gọi ngoiMat.sit (R-NGOI-1)
  };
  const seatButton = new SeatButton<SeatPick>((spot) => sitAt(spot));
  // nhạc nền trà lâu (R-NHAC-1): đài phát theo giờ thật, âm lượng theo khoảng cách tới sàn trà lâu
  const teaIds = new Set(spec.buildings.filter((b) => b.kind === 'tra-lau').map((b) => b.id));
  const teaFloors = world.rooms.filter((r) => teaIds.has(r.zoneId)).map((r) => r.floor);
  music = teaFloors.length > 0 ? new AmbientMusic(TRACKS, (f) => MUSIC_URLS[`./nhac/${f}`]) : null;
  const seatGlow = addSeatGlow(scene, spec.lanternStyle.trim);
  // Nhà của ta: trang trí tự do + nút "Trang trí" (R-NHA-2/3/4/6/7 — V-69, thiết kế 2026-11-15.42) — chỉ cảnh có `decorArea`
  const decor: HomeDecor | null = spec.decorArea
    ? new HomeDecor({
        scene,
        sceneId: SCENE.id,
        colliders,
        spec,
        groundY: groundAt,
        pick: (x, y) => picker.pick(x, y),
        save: (items): Promise<boolean> => bridge.setHome(items),
        coins: () => progress?.coins ?? 0,
        trial,
        onMode: (on) => {
          player.moveTarget = null;
          joystick.end();
          orbit.decorView(on); // camera nâng ~55° (R-NHA-6, 4B)
        },
      })
    : null;
  await decor?.load();

  /* ---------- điều khiển ---------- */
  const orbit = new OrbitCamera(spec.camera);
  const joystick = new Joystick(el('joy'), el('knob'), el('joyGhost'));
  attachCheDoNhap(); // máy tính chuột: ẩn joystick gợi ý, thanh công cụ sang trái (R-DIEU-1, R-THANH-1)
  const picker = new GroundPicker(camera, world.ground);
  // trò chuyện kênh chung (R-CHAT-1..3, thiết kế 2026-11-14.9) — tên NPC lấy từ dữ liệu hội thoại
  const chat = new ChatRoom((id) => dialogFor(id));
  // Space nhảy, F chào, C ngồi ôn (R-DIEU-6, R-DIEU-7); đang học / màn tải thì bỏ qua
  const keyboard = new Keyboard((a, key) => {
    if (a === 'back') {
      if (!mapBack() && !decor?.back() && !garden?.back() && !mini?.back()) gamePlay.stand(); // Esc: đóng bảng / thoại / bản đồ, không có thì rời bàn / tiệc / đàn (R-GIAO-1)
      return;
    }
    // M / H / G / B / J: thanh công cụ (R-THANH-1; luật ẩn / ngồi / nhảy ở zones/thanhCongCu.ts); G rồi 1…8: biểu cảm.
    if (a === 'tool') {
      if (key === 'm' && closeMap()) return; // M khi bản đồ truyền tống đang mở → đóng (R-HANH-6)
      return void thanh?.key(key);
    }
    if (a === 'digit') {
      if (thanh?.digit(Number(key))) return; // G rồi số: biểu cảm
      return void garden?.key(Number(key)); // vòng công cụ đang mở: 1…6 chọn ô / loại hạt (V-73)
    }
    if (a === 'map') {
      areaMap.toggle(); // N: mở / đóng bản đồ lớn (R-BANDO-5)
      return;
    }
    if (paused || loading.active || mapOpen || talking || decor?.active || garden?.active) return;
    if (a === 'chat') {
      if (!gamePlay.active) chat.open(); // Enter: mở ô nhập (gửi do ô nhập tự lo)
      return;
    }
    if (a === 'jump') player.jump();
    else if (a === 'bow') player.bow();
    else if (a === 'seat') {
      if (garden?.use()) return; // gần luống: E = mở vòng công cụ (R-VUON-2, V-73)
      const spot = seatButton.current;
      if (spot) sitAt(spot); // phím E = nút nổi Ngồi (R-NGOI-1)
      else exitAction(); // không có chỗ ngồi: E = nút nổi ra cửa (V-71)
    } else player.toggleSit(); // C: ngồi ôn tại chỗ (R-DIEU-7)
  }, (key) => !!decor?.key(key)); // trang trí: Q E R Enter Esc Delete thuộc trang trí (R-NHA-6)
  attachPointerInput(canvas, {
    joystick,
    orbit,
    onJoystickStart: () => (player.moveTarget = null),
    tapOnly: () => mapOpen || areaMap.open || talking || gamePlay.active || chat.typing, // ngồi chơi: chạm là chạm bàn (R-GIAO-1, R-DIEU-1)
    lookMode: () => ngoiMat.seated, // ngồi: kéo = nhìn quanh từ mắt, chụm không zoom (R-DIEU-7, R-DIEU-1)
    onLook: (dx, dy) => ngoiMat.drag(dx, dy),
    noJoystick: () => !!decor?.active || !!garden?.active || scrollOpen, // trang trí: kéo đâu cũng xoay camera (R-NHA-2); cuộn mở: kéo = nhìn quanh (R-ON-8)
    decorDrag: decor
      ? { start: (x, y, mouse) => decor.dragStart(x, y, mouse), move: (x, y) => decor.dragMove(x, y), end: () => decor.dragEnd(), hover: (x, y) => decor.hoverAt(x, y) }
      : undefined, // kéo / di chuột món trang trí (R-NHA-6)
    onTap: (x, y) => {
      if (mapOpen) {
        onMapTap(x, y);
        return;
      }
      if (chat.close()) return; // đang gõ: chạm cảnh = đóng ô nhập
      if (decor?.tap(x, y)) return; // trang trí: chạm món = nhấc, đang cầm = đặt (chuột) / dời tới (chạm) — R-NHA-6
      if (garden?.tap(garden.picks ? picker.pick(x, y) : null)) return; // bảng vườn rau mở: chạm cảnh = đóng bảng; trong rào: chạm luống = vòng công cụ (V-73)
      if (scrollOpen && !covered && !talking) {
        ngoiMat.tapScroll(x, y, camera); // cuộn sách mở: chạm thẳng vào mục trên giấy (R-ON-8)
        return;
      }
      if (paused || talking) return;
      if (gamePlay.tap(x, y, camera)) {
        const at = gamePlay.takePlayed();
        if (at) ngoiMat.playAt(at); // tay phải đưa quân tới giao điểm (R-GIAO-1)
        return; // đang ngồi chơi: chạm vào bàn, không đi (R-GIAO-1)
      }
      if (ngoiMat.tapScroll(x, y, camera)) return; // chạm giấy cuộn trước mắt: tay trỏ vào mục rồi mở (R-ON-8)
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
      if (c?.action === 'journey') afterSay = () => say('tran-su', journeyLine(progress && { chars: progress.chars, radicals: progress.radicals.length }, JOURNEY_MAP.places, REGION_SCENES), () => {}); // R-NPC-5
      if (LibraryDesk.handles(c)) afterSay = () => desk.act(c); // mượn / trả sách (R-SACH-1, R-SACH-4)
      if (town?.handles(c)) afterSay = () => town?.act(c); // cho Tiểu Khất, hỏi giờ Lão Canh (R-NPC-6, R-NPC-7)
      if (mini?.handles(c)) afterSay = () => mini?.act(c); // dự tiệc Lưu Thương, bán măng (R-LUU-1, R-MANG-5)
      if (trucLao?.handles(c)) afterSay = () => trucLao?.act(c); // học bộ mới / ôn với Trúc Lão (R-HANH-8)
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
  const dialogOf = new Map(DIALOGS.map((d) => [d.npc, d]));
  // nút "Cách chơi" trên biển tên trò chơi Kỳ Văn Uyển → bảng cách chơi, nhân vật đứng yên tới khi đóng (R-GIAO-2);
  // nút "Hướng dẫn" trên biển "Khu tự học" tầng 2 Tàng Thư Các → bảng hướng dẫn cùng khung (R-VA-5)
  // + "Cách chơi" 3 trò Trúc Lâm (R-GIAO-2, V-66 B4)
  const signs = [...gameSigns(spec.gameTables), ...(world.studySign ? [studySign(world.studySign)] : []), ...miniGameSigns(spec.miniGames)];
  const guidePanel = new GuidePanel(() => {
    paused = false;
  });
  const openGuide = (sign: GameSign): void => {
    const g = guideOf(sign.kind);
    if (!g || paused) return;
    paused = true;
    player.moveTarget = null;
    joystick.end();
    guidePanel.open(g, dialogOf.get(g.tipBy)?.name ?? g.tipBy, learnedRadicals.size === 0);
  };
  const guideButton = signs.length ? new GuideButton(openGuide) : null;
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
  // thầy Trúc Lão ở Trúc Lâm: học bộ mới + ôn qua khung thoại (R-HANH-8)
  if (spec.npcs.some((n) => n.id === TRUC_LAO))
    trucLao = new TrucLao({ learned: () => learnedRadicals, due: () => progress?.due ?? [], openRadical, openReview: (due) => openReview(due, null, closeLesson), talk: startTalk });
  const dialogFor = (npcId: string): Dialog | undefined =>
    npcId === LIBRARIAN ? desk.dialog() : (trucLao?.dialog(npcId) ?? town?.dialog(npcId) ?? mini?.dialog(npcId) ?? dialogOf.get(npcId));
  // thẻ "Đọc sách" khi đang mượn sổ từ, mọi khu mọi vùng → mở sổ từ Flutter (R-SACH-2, R-SACH-3)
  const readBook = new ReadBookButton(() => {
    player.moveTarget = null;
    void desk.read();
  });

  /* ---------- khu giao lưu (R-GIAO-1, R-CO-1..3, R-DAU-1): bàn cờ, bàn đấu chữ — gamePlay.ts ---------- */
  let afterSay: (() => void) | null = null;
  /** Một câu NPC nói qua khung thoại có sẵn; đóng khung → `onClose`. */
  const say = (npcId: string, text: string, onClose: () => void, choice = 'Vâng'): void => {
    const base = dialogFor(npcId);
    const d: Dialog = { npc: npcId, name: base?.name ?? npcId, han: base?.han, start: 'loi', lines: [{ id: 'loi', text, choices: [{ text: choice, next: null }] }] };
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
    npcInfo: (id) => dialogFor(id),
    ended: (game, outcome, result) => walletRoom.gameEnded(game, outcome, result), // R-TIEN-3
  });
  // Văn tiền (R-TIEN-1..7): ví HUD, thưởng trò, nút "Vào tiệm" Tạp hoá — walletRoom.ts
  const walletRoom = new WalletRoom({
    bridge,
    trial,
    buildings: spec.buildings,
    groundAt,
    cover: () => {
      paused = true;
      covered = true;
      learn.suspend(true);
      player.moveTarget = null;
    },
    uncover: closeLesson, // Tạp hoá bản web đóng ("Đóng" / Esc)
    setReward: (result, line) => gamePlay.setReward(result, line),
  });
  walletRoom.sync(progress);
  // vườn rau Nhà của ta (R-VUON-1…9, HUD thiết kế 2026-11-15.29) — homeGarden.ts
  const garden = world.garden
    ? new HomeGarden({
        garden: world.garden,
        bridge,
        trial,
        speed: gardenSpeed(location.search),
        debug: params.has('debug'),
        coins: (amount, label, balance, from) => {
          walletRoom.gardenCoins(amount, label, balance, from);
          if (progress) progress = { ...progress, coins: balance };
        },
        balance: () => trial?.wallet.coins ?? progress?.coins ?? 0,
        onOpen: () => {
          player.moveTarget = null;
          joystick.end();
        },
        player,
        character,
        fence: { from: { x: spec.garden.fence.from[0], z: spec.garden.fence.from[1] }, to: { x: spec.garden.fence.to[0], z: spec.garden.fence.to[1] } },
        plotSize: spec.garden.size,
      })
    : null;
  await garden?.load(!isHomeScene(params.get('qua'))); // ra sân từ gian trong: không báo lại luống chín (V-68)
  // Tiểu Khất + Lão Canh (R-NPC-6/7/8, R-AM-1) — townNpcs.ts; chỉ khi cảnh có hai NPC này (có model)
  town = new TownNpcs(npcSet.npcs, {
    bridge,
    trial,
    progress: () => progress,
    groundAt,
    say: (id, text) => say(id, text, () => {}),
    chatSay: (id, text) => chat.npcSay(id, text),
    spent: (amount, label, balance, gameToday) => walletRoom.spent(amount, label, balance, gameToday),
    almsSaved: (coins, alms) => {
      if (progress) progress = { ...progress, coins, alms };
    },
  });
  // 3 trò nhỏ Trúc Lâm (V-66 B4): Lưu Thương, hái măng, đàn cầm — miniGames.ts; chỉ khi đặc tả có `miniGames`
  if (spec.miniGames.length) {
    mini = new MiniGames(
      {
        spec,
        world,
        scene,
        npcs: npcSet.npcs,
        colliders,
        player,
        character,
        groundAt,
        bridge,
        trial,
        progress: () => progress,
        learned: () => learnedRadicals,
        lowTier: tier === 'thap',
        say: (id, text, then) => say(id, text, then ?? (() => {})),
        chatSay: (id, text) => chat.npcSay(id, text),
        openGuide: (kind) => openGuide({ kind, npc: '', x: 0, z: 0, han: '', name: '' }),
        sit: sitMini,
        earn: (game, outcome, song) => walletRoom.miniEarn(game, outcome, song),
        coins: (amount, label, balance) => {
          walletRoom.gardenCoins(amount, label, balance);
          if (progress) progress = { ...progress, coins: balance };
        },
      },
      params,
    );
    await mini.load();
  }
  // nhạc công + tiếng đàn trên bục đàn (R-NPC-9, R-AM-2): chỉ khi cảnh có `buc-dan` và có model `cam-nu`
  void DanTranh.create(scene, spec, groundAt).then((d) => (danTranh = d));
  // bản đồ vùng (R-BANDO-1…5, thiết kế 2026-11-14.20): bản đồ nhỏ góc trên trái + bản đồ lớn — areaMapRoom.ts
  const areaMap = new AreaMapRoom({
    spec,
    seats: world.seats,
    studySign: world.studySign,
    groundAt,
    opened: () => {
      player.moveTarget = null;
      joystick.end();
    },
  });
  // HUD trò chơi (thiết kế 2026-11-13.27): "Rời bàn", tỉ số, lượt, câu hỏi Đấu chữ, thẻ kết quả
  const gameHud = new GameHud({
    leave: () => gamePlay.stand(),
    newRound: () => gamePlay.newRound(),
    pick: (i) => gamePlay.pick(i),
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
  // nút quay lại: đóng bảng cách chơi / khung thoại trước, rồi bản đồ (docs/bridge.md `back`)
  mapBack = (): boolean => {
    // đang cưỡi hạc: nút quay lại = bỏ qua (R-HANH-5)
    if (flight && !flight.clock.done) {
      flight.clock.skip();
      return true;
    }
    if (ride?.owns) {
      ride.skip();
      return true;
    }
    if (thanh?.back()) return true; // đang chờ chọn biểu cảm (tạm — R-BIEU-1)
    if (areaMap.back()) return true; // bản đồ lớn (R-BANDO-5)
    if (scrollOpen && !covered) {
      standFromScroll(); // Esc / nút quay lại khi cuộn sách mở = "Đứng dậy" (R-ON-8)
      return true;
    }
    if (chat.close()) return true; // nút quay lại / Esc: đóng ô nhập trò chuyện trước
    if (guidePanel.close()) return true;
    if (dialogBox.isOpen) {
      dialogBox.close();
      return true;
    }
    return closeMap();
  };
  /** `from`: cuộn bay lên từ đâu — vòng trận (mặc định) hay chỗ nhân vật (nút Bản đồ trên thanh — R-HANH-6) */
  const openMap = (from: 'vong' | 'thanh' = 'vong'): void => {
    mapOpen = true;
    mapFrom = from;
    player.moveTarget = null;
    joystick.end();
    ring?.rearm(); // mở bằng thanh khi đang nạp vòng → huỷ nạp; đóng bản đồ phải ra khỏi vòng rồi vào (R-THANH-2)
    // gian trong Nhà của ta (V-68) không có nơi riêng: bản đồ coi như đang ở Nhà của ta
    states = placeStates(JOURNEY_MAP.places, isHomeScene(SCENE.id) ? HOME_OF_PLAYER : SCENE.id, HOME_SCENE, REGION_SCENES);
    scroll.open(from === 'vong' ? (world.teleport?.center ?? player.position) : player.position, states);
    mapHud.show(true);
  };
  let mapFrom: TravelHow = 'vong';
  let travelling = false;
  /** `cong`: qua cổng đi bộ → nơi đến đứng ở cổng về (`qua`, R-HANH-4); `vong` / `thanh`: bản đồ, nút Về nhà (R-HANH-2/6/7) */
  const travel = (to: string, how: TravelHow = 'vong'): void => {
    if (travelling) return;
    travelling = true;
    player.moveTarget = null;
    // giữ tham số thử trên trình duyệt
    const next = travelParams(to, SCENE.id, how, HOME_SCENE, params, ['debug', 'nhan-vat', 'muc', 'look', 'gio', 'toc', 'hac', 'vuon']);
    // replace: không chất lịch sử trang mỗi lần đi về
    const go = (): void => location.replace(`${location.pathname}?${next.toString()}`);
    // bản đồ / nút Về nhà + hoạt cảnh bật (giảm chuyển động, trong nhà → không) → cưỡi hạc: cất cánh ở đây, bay + hạ ở trang
    // mới (R-HANH-5)
    const indoor = !!roomAt(player.position.x, player.position.z);
    if (craneDeparts(params, how, indoor)) {
      closeMap();
      loading.hold(true); // đứng yên, HUD ẩn như màn tải
      const hud = craneHud(spec, params, loadScene(to).spec.site.name);
      craneParams(next, hud);
      const p = player.position;
      ride = new CraneRide('cat', { scene, character, spec, at: [p.x, p.z], heading: character.facing.rotation.y, groundAt, camera: cameraPose(camera), hud, onEnd: go });
      return;
    }
    loading.show(loadScene(to).spec.site); // loading.active → nhân vật đứng yên
    void nextPaint().then(go);
  };
  // thanh công cụ (R-THANH-1/2, R-HANH-6/7, R-BIEU-1…3, R-TUI-1) — thanhCongCu.ts (HUD thiết kế 2026-11-15.35)
  thanh = new ThanhCongCu({
    context: () => ({
      loading: loading.active || travelling,
      crane: !!ride?.owns,
      covered: covered || (paused && !scrollOpen), // cuộn sách Ngồi ôn mở: thanh vẫn hiện (đứng dậy rồi làm — R-THANH-2)
      travelMap: mapOpen,
      areaMap: areaMap.open,
      talking,
      gameTable: gamePlay.active || !!mini?.active,
      decorating: !!decor?.active,
      garden: !!garden?.active,
      chatTyping: chat.typing,
      chatDocked: troChuyenTrenThanh(), // máy tính màn ngang: Trò chuyện trên thanh, gõ không ẩn thanh (R-THANH-1)
      sitting: player.isSitting,
      air: player.state.air,
      atHome: isHomeScene(SCENE.id), // sân + gian trong (V-68)
      tasksLeft: tasksLeft(progress?.daily ?? null, (progress?.radicals.length ?? 0) >= RADICALS.length),
    }),
    standUp: () => (scrollOpen && !covered ? standFromScroll() : player.isSitting && player.toggleSit()),
    halt: () => {
      player.moveTarget = null;
      joystick.end();
      player.stopEmote();
    },
    openMap: () => openMap('thanh'),
    goHome: () => travel(HOME_OF_PLAYER, 'thanh'),
    openDaily,
    emote: (e) => (e.asBow ? player.bow() : void player.emote(e.id, e.seconds, e.sits)),
    bubble: (e) => chat.emote(e.id),
    // túi đồ ở mọi cảnh: số đã lưu (getGarden / getHome — docs/bridge.md; chế độ thử: ví thử R-TIEN-7)
    bagSource: async () => {
      const w = trial?.wallet;
      const [garden, home, mang] = w ? [w.garden, { items: w.items, owned: w.owned, placed: w.placed }, w.mang] : await Promise.all([getGarden(), getHome(), getMang()]);
      const b = borrowedBook(desk.book);
      return { garden, home, book: b ? { title: b.title, subtitle: b.subtitle } : null, coins: w?.coins ?? progress?.coins ?? null, forest: mang?.bag }; // + Lâm sản (getMang — R-TUI-1)
    },
    readBook: () => {
      player.moveTarget = null;
      void desk.read();
    },
    toggleChat: () => void (chat.typing ? chat.close() : chat.open()), // hình Trò chuyện = phím Enter (R-CHAT-3)
  });
  // `?debug`: kịch bản thử / chụp ảnh gọi thẳng truyền tống (`__hocXaTravel('rung-truc')`), thanh (`__hocXaThanh.press('veNha')`)
  if (params.has('debug')) Object.assign(window, { __hocXaTravel: travel, __hocXaThanh: thanh });
  onMapTap = (x, y) => {
    mapHud.hideCard(); // chạm chỗ khác → ẩn thẻ "sắp mở"
    const hit = scroll.pick(x, y);
    const place = hit ? placeAt(JOURNEY_MAP.places, hit.px, hit.py) : null;
    if (!place || travelling) return;
    const st = states[place.id];
    const to = placeScene(place.id, HOME_SCENE);
    if (st === 'mo') travel(to, mapFrom);
    else if (st === 'sapMo') {
      scroll.flash(place.id);
      mapHud.soon({ name: place.ten });
    }
    // nơi đang ở ('oDay') → không có gì
  };

  // cổng đi bộ sang cảnh (R-HANH-4): bước từ ngoài vào vùng → sang ngay
  const portals = spec.portals.filter((p) => p.via !== 'nut').map((p) => ({ to: p.scene, trigger: new PortalTrigger(p.area, { x: sx, z: sz }) }));
  // cổng bấm nút (cửa gian trong "Ra sân" — V-71): đứng trong vùng → nút nổi, bấm (hoặc phím E) mới sang
  const exitButton = new ExitButton<{ x: number; y: number; z: number; label: string; to: string }>((d) => travel(d.to, 'cong'));
  const exitSpots = spec.portals.map((p) => {
    const [x, z] = [(p.area.from[0] + p.area.to[0]) / 2, (p.area.from[1] + p.area.to[1]) / 2];
    return { x, y: groundAt(x, z), z, label: p.label ?? '', to: p.scene };
  });
  exitAction = () => {
    const d = exitButton.current;
    if (d) travel(d.to, 'cong');
    return !!d;
  };

  /* ---------- vòng lặp ---------- */
  const nameTag = new NameTag();
  const input: MoveInput = { x: 0, y: 0 };
  // tường / nhà chắn tầm nhìn → camera kéo lại gần (R-DIEU-4)
  const sight = colliders.sightBlock.bind(colliders);
  // tới qua cổng: nhìn theo hướng của chỗ đứng (R-HANH-4); về trấn bằng vòng trận giữ hướng mặc định (R-HANH-2)
  if (viaGate) orbit.yaw = viaGate.rotY - Math.PI;
  character.facing.rotation.y = orbit.yaw + Math.PI; // vào game: nhân vật quay lưng về camera, nhìn về phía trước
  orbit.viewAspect = camera.aspect; // khung phòng (gian trong — V-71) tính theo màn thật
  orbit.update(tpCam, player.position, 0, true, groundAt, undefined, sight);
  ngoiMat.update(0, camera, tpCam, null, null);

  function tick(): void {
    if (!running) return; // vòng lặp tự tắt; setRunning gọi lại khi hiện
    // R-HIEU-2: chưa tới nhịp (60 fps trên màn 120 Hz, hoặc chế độ 30 fps) → bỏ nhịp này; dt khung sau gộp cả nhịp bỏ
    if (!frameCap.shouldRender(performance.now())) {
      requestAnimationFrame(tick);
      return;
    }
    // kẹp dt: tab bị treo vài giây rồi chạy lại thì nhân vật không "dịch chuyển tức thời"
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    input.x = joystick.x;
    input.y = joystick.y;
    keyboard.apply(input);

    // màn tải còn hiện (kể cả lúc mờ ra) → không điều khiển (R-MAN-2); chạm đã bị lớp màn tải chặn
    const fromX = player.position.x;
    const fromZ = player.position.z;
    // hướng đi khoá khi giữ joystick cùng hướng → camera tự xoay không làm nhân vật đi vòng (R-DIEU-3)
    // cưỡi hạc: hoạt cảnh giữ nhân vật + camera (không đi, camera không bám)
    const riding = !!ride?.owns;
    if (!riding) player.update(dt, input, orbit.steerYaw(input.x, input.y), paused || loading.active || mapOpen || areaMap.open || talking || chat.typing || !!decor?.active || !!garden?.active || !!thanh?.busy);
    const pos = player.position;
    // camera bám êm: dây kéo + tự về sau lưng chậm (R-DIEU-3)
    if (!riding) orbit.follow(dt, pos.x - fromX, pos.z - fromZ, character.facing.rotation.y, player.state.mps > 0);
    town?.update({ dt, player: pos, camera, talkingTo: talking ? (runner?.dialog.npc ?? null) : null, covered: paused || covered || loading.active }); // NPC đi (R-NPC-7)
    const talkTo = talking ? (runner?.dialog.npc ?? null) : null;
    const talkLine = runner?.current?.id ?? null;
    for (const npc of showNearNpcs(npcSet.npcs, pos.x, pos.z)) {
      npc.watch?.(pos.x, pos.z, npc.id === talkTo ? talkLine : null); // nhìn người chơi, gật khi sang câu (R-NPC-10)
      npc.update(dt); // xa từ 35 m → ẩn (R-NPC-1)
    }
    danTranh?.update({ dt, player: pos, camera, covered: paused || covered || loading.active || travelling }); // R-AM-2
    mini?.update({ dt, player: pos, camera, covered: paused || covered || loading.active || travelling, busy: paused || mapOpen || talking || loading.active || !!thanh?.busy }); // V-66 B4
    gamePlay.update(dt);
    gameHud.render(talking ? null : gamePlay.view());
    if (ring && !travelling && !loading.active && !mapOpen && !thanh?.busy) {
      if (ring.update(pos, dt)) openMap();
      world.teleport?.setCharge(ring.charge);
    }
    const walking = !(paused || covered || loading.active || mapOpen || talking || travelling || !!decor?.active || !!garden?.active);
    for (const p of portals) if (p.trigger.update(pos, walking) && !travelling) travel(p.to, 'cong');
    scroll.update(dt);
    thanh?.update(dt); // việc chờ đứng dậy / chạm đất (R-THANH-2)
    zones.update(pos);
    world.update(dt, pos, camera.position);
    const room = roomAt(pos.x, pos.z);
    ngayDem.update(dt, !!room);
    orbit.viewAspect = camera.aspect;
    if (!riding) orbit.update(tpCam, pos, dt, false, groundAt, room?.floor, sight);
    // ngồi: trượt 0,4 s vào mắt / cúi nhìn bàn chơi, thân mình ẩn (R-DIEU-7, R-GIAO-1); đứng: camera ngôi 3 như cũ
    const atTable = gamePlay.placeCamera(gameCam);
    ngoiMat.update(dt, camera, tpCam, atTable ? gameCam : null, player.isSitting && (!onSeat || seatStudy) ? sitTime : null);
    ride?.update(dt, camera); // hạc, nhân vật trên lưng, camera hoạt cảnh (R-HANH-5)
    if (ride?.finished) ride = null;
    if (!covered) renderer.render(scene, camera);
    nameTag.update(pos, camera, NAME_TAG_HEIGHT);
    const busy = paused || covered || loading.active || mapOpen || talking;
    meditate(dt, busy);
    // nhập định khi Ngồi ôn (R-ON-8, thiết kế 2026-11-14.10): vòng sáng + cuộn sách trên tay; đứng dậy → tắt / cuộn lại
    nhapDinh.update(dt, pos, character.facing.rotation.y, player.isSitting && (!onSeat || seatStudy) ? sitTime : null);
    // ẩn khi bản đồ / màn tải / bài học phủ cảnh (L-11: nhãn HTML luôn đè lên cuộn bản đồ 3D)
    nameTag.setVisible(!mapOpen && !loading.active && !covered && !ngoiMat.firstPerson); // nhìn từ mắt: không nhãn tên mình
    // màn Flutter đè cảnh (bảng chọn cuộn sách, thẻ học, màn ôn…) → ẩn cần điều khiển (R-ON-8)
    // cưỡi hạc cũng ẩn cần điều khiển (R-HANH-5)
    const hideHud = covered || riding;
    if (document.body.classList.contains('covered') !== hideHud) document.body.classList.toggle('covered', hideHud);
    if (document.body.classList.contains('scroll-open') !== scrollOpen) document.body.classList.toggle('scroll-open', scrollOpen);
    chat.update({ camera, player: pos, nameTagHeight: NAME_TAG_HEIGHT, npcs: npcSet.npcs, busy: busy || gamePlay.active, hideMe: ngoiMat.firstPerson, docked: troChuyenTrenThanh() && !!thanh?.view?.visible });
    learn.follow(zones.current ? anchorOf.get(zones.current.id) : undefined, camera);
    // nút "Nói chuyện": NPC gần nhất trong 2,5 m, không đang học / ngồi / bản đồ / thoại / màn tải (R-NPC-2)
    const npcNear = paused || mapOpen || talking || loading.active || player.isSitting ? null : npcInTalkRange(npcSet.npcs, pos);
    const seatFree = !(paused || covered || loading.active || mapOpen || talking || player.isSitting || player.state.air);
    // Tiểu Mặc đứng sát bảng nhiệm vụ: "Nói chuyện" và "Xem bảng" cùng trong tầm → chỉ nút của vật gần hơn (R-NPC-2, R-NV-3)
    let atBoard = !!boardAt && seatFree && nearBoard(boardAt, pos.x, pos.z);
    if (atBoard && boardAt && npcNear) atBoard = boardBeforeNpc(boardAt, npcNear.root.position, pos.x, pos.z);
    const near = atBoard ? null : npcNear;
    talk.set(near ? (dialogFor(near.id) ?? null) : null);
    if (near) talk.follow(talkAnchor.copy(near.root.position).setY(near.root.position.y + 2.3), camera);
    // nút nổi "Ngồi": chỗ ngồi gần nhất trong tầm, cùng tầng; không khi đang ngồi / bay / bận (R-NGOI-1)
    const spot = seatFree ? (seatInRange(seatSpots(), pos.x, pos.z, pos.y) ?? null) : null;
    seatButton.set(spot);
    seatButton.follow(camera);
    seatButton.avoid(el('talk')); // không đè nút "Nói chuyện"
    const door = seatFree && !travelling && !decor?.active && !garden?.active ? buttonPortalAt(spec.portals, pos.x, pos.z) : undefined;
    exitButton.set(door ? exitSpots[spec.portals.indexOf(door)] : null);
    exitButton.follow(camera);
    readBook.set(borrowedBook(desk.book) ?? null, !(paused || covered || loading.active || mapOpen || talking || player.isSitting));
    if (boardButton && boardAt) {
      const allLearned = (progress?.radicals.length ?? 0) >= RADICALS.length;
      boardButton.set(atBoard, tasksLeft(progress?.daily ?? null, allLearned));
      boardButton.follow(camera);
    }
    if (guideButton) {
      const sign = seatFree ? signInRange(signs, pos.x, pos.z, pos.y) : null;
      guideButton.set(sign, sign ? (sign.y ?? groundAt(sign.x, sign.z)) : 0);
      guideButton.follow(camera);
    }
    walletRoom.update({ camera, player: pos, roomId: room?.zoneId, busy: busy || gamePlay.active || !!mini?.active, free: seatFree }); // ngồi tiệc / đàn: ví ẩn (R-TIEN-1)
    areaMap.update(dt, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      facing: character.facing.rotation.y,
      view: orbit.yaw + Math.PI,
      busy: {
        loading: loading.active || travelling,
        travelMap: mapOpen,
        covered: paused || covered,
        talking,
        gameTable: gamePlay.active || !!mini?.active,
        sitting: player.isSitting,
        chatTyping: chat.typing,
        decorating: !!decor?.active,
      },
    });
    seatGlow.set(spot);
    decor?.update(dt, camera, seatFree); // nút "Trang trí" ẩn khi bản đồ / thoại / ngồi / màn Flutter
    garden?.update(dt, pos);
    // HUD vườn: vòng công cụ / nhãn / dấu luống / chữ nổi (2026-11-16.4); ẩn khi trang trí, bản đồ, thoại, ngồi, màn Flutter, màn tải (2026-11-15.29)
    garden?.frame(camera, {
      decorating: !!decor?.active,
      map: mapOpen || areaMap.open,
      talking: talking || gamePlay.active || chat.typing,
      sitting: player.isSitting,
      covered: paused || covered || !!ride?.owns,
      loading: loading.active || travelling,
    }, dt);
    seatGlow.update(dt);
    // mở bài học / ôn / bảng, màn tải → nhạc tắt dần; đóng → phát tiếp theo giờ (R-NHAC-1)
    music?.update(dt, paused || covered || loading.active ? 0 : musicVolume(teaFloors, pos.x, pos.z));
    actions.update({
      hidden: paused || covered || loading.active || mapOpen || areaMap.open || talking,
      air: player.state.air,
      sitting: player.isSitting,
      bowing: player.isBowing,
      badge: sitBadge(progress?.due ?? []), // chỉ số bộ đến hạn (R-DIEU-7)
    });
    fps.tick(rawDt, renderer.info.render.calls, renderer.info.render.triangles);
    // độ nét động (R-HIEU-1): chậm kéo dài → vẽ thưa đi một bậc; mượt lại → nét lên. HUD là HTML nên vẫn nét.
    if (frameCap.fps === 60 && governor.update(rawDt * 1000)) {
      renderer.setPixelRatio(governor.ratio);
      showInfo();
    }
    if (frameCap.observe(rawDt * 1000, governor)) showInfo(); // 60 ↔ 30 fps (R-HIEU-2)
    if (!firstFrame) {
      firstFrame = true;
      loading.done();
    }
    requestAnimationFrame(tick);
  }
  let firstFrame = false;
  // biên dịch sẵn shader mọi vật liệu trong cảnh lúc màn tải còn che (như game) → lần đầu vào nhà / thấy vật mới không
  // khựng vì GPU dịch shader giữa chừng. Máy hỗ trợ KHR_parallel_shader_compile thì dịch song song, không treo trang.
  loading.progress(90);
  lap('lap-rap');
  flight?.progress(0.9);
  // model nhà (`buildings[].model`, V-88 Q4): nhà là thứ thấy đầu tiên khi về → màn tải chờ tối đa 2 s; quá hạn thì nhà hiện khi nạp xong
  await waitHouses(world.ready);
  lap('model-nha');
  await renderer.compileAsync(scene, camera).catch(() => undefined);
  lap('shader');
  if (params.has('debug')) {
    const ms = (a: number, b: number): number => Math.round(laps[b][1] - laps[a][1]);
    console.info(`dựng cảnh (ms): ${laps.slice(1).map((l, i) => `${l[0]} ${ms(i, i + 1)}`).join(' · ')} · tổng ${ms(0, laps.length - 1)}`);
    console.info(`bước dựng (ms): ${[...steps].map(([n, v]) => `${n} ${Math.round(v)}`).join(' · ')}`);
    Object.assign(window, { __bootTimes: { laps: laps.map(([n, t]) => [n, Math.round(t - laps[0][1])]), steps: Object.fromEntries([...steps].map(([n, v]) => [n, Math.round(v)])) } });
  }
  if (flight) {
    // hết bay (đủ 1,5 s, hoặc đã chạm bỏ qua) → mây phủ → cảnh thật: hạ cánh, hoặc (bỏ qua) đứng ngay ở chỗ xuất hiện
    const lands = await flight.finish();
    const home = cameraPose(camera);
    const onEnd = (): void => {
      loading.hold(false);
      player.snapToGround();
      clearCraneParam();
    };
    loading.hold(true);
    if (lands) ride = new CraneRide('ha', { scene, character, spec, at: [sx, sz], heading: character.facing.rotation.y, groundAt, camera: home, hud: flight.hud, onEnd });
    else {
      flight.hud.capture(null);
      uncoverVeil(flight.hud);
      onEnd();
    }
  }
  requestAnimationFrame(tick);
}

void boot();
