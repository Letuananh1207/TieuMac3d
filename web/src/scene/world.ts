import { addBridges } from './bridges';
import { addChannels, type ChannelSet } from './channels';
import { addGalleries } from './vat_giang_nam';
import { addMirages } from './vat_bong_lai';
import { addMushroomForest } from './vat_rung_nam';
import { addMotherMushroom } from './namMe';
import { addFluteTower } from './thapSao';
import { addDinhHac } from './dinhHac';
import { addRamparts } from './thanh_luy';
import { addPlateauRails } from './cung_dien';
import { addFauna } from './fauna';
import { addOutdoorSeats, addTerraces, onTerraces, terraceRect } from './daiDa';
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { LayeredGround, type Ground, type Pad } from '../collision/ground';
import { addBuilding } from './buildings';
import { addEnvironment, addFlatGround } from './environment';
import { addCloudSea, addFarMountains, viewDistance } from './farMountains';
import { addGate, addGateModel } from './gate';
import { staticModelUrl } from './staticModel';
import { addGrassAndRocks } from './grass';
import { addSoftGrassAndFlowers } from './coHoa';
import { addGarden, type Garden3D } from './vuonLuong';
import { addTeaGarden } from './doiChe';
import { insideTea } from './luongCheLayout';
import { mergeSoft, mergeStatic } from './merge';
import { setLampGlow, setLampMode, tickWind } from './materials';
import { isColorManaged, isSoft } from './look';
import { createDayNight, type DayNight } from './apGio';
import { addNightSky } from './troiDem';
import { resetSignAtlas } from './signAtlas';
import { addCurbs, addPaths } from './paths';
import { addProps, DEN_DA_LIGHT_Y } from './props';
import { addLanternGlow } from './quangDen';
import { addFloating } from './sky';
import type { Seat } from './seat';
import { addLanternStrings } from './dayDenLong';
import { addFences } from './lanCan';
import { addGameSign, addGameTable, type GameTable } from './gameTable';
import { addRoomBuilding, addWalkIn, inRect, WALK_IN, type InteriorUse, type Room } from './rooms';
import { addHouseModel, houseFrame, type HouseReport } from './nhaModel';
import { addStairs } from './stairs';
import { roomKinds, zoneAnchors, type SceneSpec, type ZoneAnchor } from './spec';
import { addTerrain } from './terrain';
import { buildHeightfield, type GroundY } from './terrainHeight';
import { addTrees } from './trees';
import { addStoneYard, addTeleport, type TeleportRing } from './truyenTong';
import { addPortalMarkers } from './vongCong';
import { addBounds } from './ranhDi';
import { addRockyKe } from './keDa';
import { addWaterways } from './waterways';
import { addWalls } from './walls';
import { addWater } from './water';
import { addWell } from './well';
import { addChoDem } from './vat_cho_dem';
import { addSandCity } from './vat_thanh_cat';
import { addSeaFloor } from './vat_cung_ngoc';

/** Bán kính quầng đèn tối đa ban đêm (m) — quầng cộng màu tốn điểm ảnh trên máy yếu (kế hoạch 2026-11-14-ngay-dem). */
const NIGHT_GLOW_MAX = 1.1;

export interface World {
  /** mặt đất: đích của tia dò khi chạm để đi (sân phẳng hoặc lưới địa hình) */
  ground: THREE.Object3D;
  /** mặt đất cho nhân vật / camera: địa hình (hoặc phẳng y = 0) + nền nhà vào được */
  surface: Ground;
  /** nhà vào được (giảng đường, thư viện) */
  rooms: Room[];
  /** vị trí các vùng sự kiện, neo theo nhà trong đặc tả */
  zoneAnchors: ZoneAnchor[];
  /** chỗ ngồi trong nhà vào được (án thư Tàng Thư Các — R-VA-4), toạ độ cảnh */
  seats: Seat[];
  /** chân biển "Khu tự học" tầng 2 Tàng Thư Các (R-VA-5), toạ độ cảnh; không có nhà đó → `null` */
  studySign: { x: number; y: number; z: number } | null;
  /** bàn chơi khu giao lưu (R-GIAO-1) */
  gameTables: GameTable[];
  /** vòng trận truyền tống (`teleport.enabled`) */
  teleport: TeleportRing | null;
  /** vườn rau Nhà của ta (`garden.enabled`, R-VUON-1): đất + rào + thùng + lớp cây — `homeGarden.ts` đổi dáng cây; tắt = `null` */
  garden: Garden3D | null;
  /** mương khúc thuỷ: đường + chén lệnh (Lưu Thương — R-LUU-2) */
  channels: ChannelSet;
  /** ngày đêm (`dayNight.enabled`): áp giờ lên cảnh — `web/src/ngayDem.ts` gọi; tắt = `null` (luôn ban ngày) */
  dayNight: DayNight | null;
  /** hộp bao nhà kín `nha-o` (`closed`, toạ độ cảnh — mái, tường, cửa; model co vừa khung này): chạm nhà để vào (R-NHA-1, V-96) */
  closedHouses: { id: string; box: THREE.Box3 }[];
  /** model nhà (`buildings[].model`, V-88) nạp xong / lỗi (đã về bản khối); không có model → xong ngay. Màn tải chờ ≤ 2 s */
  ready: Promise<HouseReport[]>;
  /** gọi mỗi khung hình: khói lò đan, mây, đảo nổi, mờ mái nhà khi `player` đứng trong; `eye` = vị trí camera (LOD cây chùm) */
  update(dt: number, player?: { x: number; y?: number; z: number }, eye?: { x: number; y: number; z: number }): void;
}

/** Thời gian từng bước dựng (ms) theo tên bước — bước lặp (mỗi nhà) cộng dồn. `?debug` in ra (kế hoạch cưỡi hạc NV1). */
export type StepTimes = Map<string, number>;

type BuildArgs = [scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, interiors?: Record<string, InteriorUse>, detail?: number];

/**
 * Dựng toàn bộ cảnh theo đặc tả. Mọi vật cản đăng ký vào `colliders`.
 * `interiors` (mã vùng → kiểu nội thất, do nội dung bài quyết) biến nhà neo vùng đó thành nhà vào được.
 * `detail`: mật độ chi tiết trang trí theo mức đồ hoạ (`quality.ts` `detailOf`): 1 đủ, 0,5 = cỏ hoa thưa một nửa, nước không gợn.
 * Chạy một mạch (Canvas 3D, bench, màn tải thường); `times` nhận thời gian từng bước.
 */
export function buildWorld(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec,
  interiors: Record<string, InteriorUse> = {},
  detail = 1,
  times?: StepTimes,
): World {
  const steps = worldSteps(scene, colliders, spec, interiors, detail);
  let t = performance.now();
  for (;;) {
    const r = steps.next();
    const now = performance.now();
    times?.set(r.done ? 'ngay-dem' : r.value, (times.get(r.done ? 'ngay-dem' : r.value) ?? 0) + now - t);
    t = now;
    if (r.done) return r.value;
  }
}

/**
 * Như `buildWorld` nhưng nhường khung giữa các bước (`pause`) khi một loạt bước đã chạy quá `budgetMs` — hoạt cảnh bay
 * (R-HANH-5) vẫn vẽ trong lúc cảnh thật dựng ngầm. Bước dài hơn ngân sách vẫn chạy trọn (không cắt giữa một bước).
 */
export async function buildWorldStepped(args: BuildArgs, pause: () => Promise<void>, budgetMs = 10, times?: StepTimes, onStep?: (k: number) => void): Promise<World> {
  const steps = worldSteps(...args);
  let batch = performance.now();
  let t = batch;
  let n = 0;
  for (;;) {
    const r = steps.next();
    const now = performance.now();
    const name = r.done ? 'ngay-dem' : r.value;
    times?.set(name, (times.get(name) ?? 0) + now - t);
    t = now;
    if (r.done) return r.value;
    onStep?.(Math.min(1, ++n / STEP_ESTIMATE));
    if (now - batch > budgetMs) {
      await pause();
      batch = t = performance.now();
    }
  }
}

/** Số bước ước chừng của một cảnh (để báo tiến độ 0–1); cảnh nhiều nhà thì nhiều bước hơn — chỉ để hiện, kẹp ở 1. */
const STEP_ESTIMATE = 40;

function* worldSteps(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec,
  interiors: Record<string, InteriorUse> = {},
  detail = 1,
): Generator<string, World, void> {
  const style = spec.buildingStyle;
  resetSignAtlas(); // biển của cảnh này vẽ vào một ảnh chung → 1 draw call
  // có ngày đêm: đèn / cửa sổ dựng sẵn phần sáng, độ sáng đổi theo giờ (apGio.ts); không: sáng cố định `light.lampGlow`
  const dn = spec.dayNight.enabled;
  setLampMode(dn, spec.dayNight.dem.windowColor);
  setLampGlow(dn ? 0 : spec.light.lampGlow); // đèn dựng dưới đây (lampMaterial) sáng theo số này — 0 = ban ngày, không phát sáng
  const env = addEnvironment(scene, spec, viewDistance(spec));
  const hf = spec.terrain.enabled ? buildHeightfield(spec.terrain, spec.paths) : null;
  // ngoài lưới (vực) → 0; nhà, tường, lối đi nằm trên bục phẳng nên không cần độ cao riêng
  const groundY: GroundY | undefined = hf
    ? (x, z) => {
        const h = hf.heightAt(x, z);
        return Number.isFinite(h) ? h : 0;
      }
    : undefined;
  const ground = hf ? addTerrain(scene, spec, hf) : addFlatGround(scene, spec.ground);
  yield 'dia-hinh';
  let waterways: (dt: number) => void = () => {};
  if (hf && groundY) {
    addStairs(scene, spec.terrain, style);
    addRockyKe(scene, spec.terrain, spec.paths, groundY, spec.trees.seed, spec.terrain.colors.rock); // kè đá khối (V-66)
    const soft = isSoft(spec.look);
    // luống chè (V-46): cỏ / hoa / đá không mọc trong luống
    // + đài đá, nền đình / nhà tranh (V-66 B3): cỏ không mọc xuyên mặt đài, nền nhà
    const teaAt = spec.teaRows.length ? (x: number, z: number): boolean => insideTea(spec.teaRows, spec.teaStyle, x, z, 0.2) : undefined;
    const rects = [
      ...spec.terraces.map(terraceRect),
      ...spec.buildings.filter((b) => b.kind === 'dinh' || b.kind === 'nha-tranh').map((b) => terraceRect({ ...b, h: 0 })),
      ...(spec.fluteTower.enabled ? [terraceRect({ x: spec.fluteTower.x, z: spec.fluteTower.z, w: spec.fluteTower.base * 2, d: spec.fluteTower.base * 2, h: 0 })] : []), // đế Tháp Sáo Trúc (V-113)
    ];
    const inTea =
      teaAt || rects.length
        ? (x: number, z: number): boolean => !!teaAt?.(x, z) || rects.some((r) => x >= r.minX - 0.3 && x <= r.maxX + 0.3 && z >= r.minZ - 0.3 && z <= r.maxZ + 0.3)
        : undefined;
    addGrassAndRocks(scene, spec.terrain, hf, spec.paths, !soft, inTea);
    yield 'co-da';
    if (soft) addSoftGrassAndFlowers(scene, spec.terrain, hf, spec.paths, spec.look, detail, inTea, spec.trees.crown === 'chum');
    yield 'co-hoa';
    waterways = addWaterways(scene, spec.terrain, style, groundY);
  }
  addFarMountains(scene, spec, detail);
  addCloudSea(scene, spec);
  yield 'nui-xa';
  // độ cao nền của nhà / cổng / ao / giếng: tâm của nó trên mặt đất (nằm trên bục → độ cao bục)
  const base = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  addPaths(scene, spec.paths, style.path, groundY, style.pathLook === 'san' ? spec.ground : undefined);
  addCurbs(scene, spec, groundY);
  addWalls(scene, colliders, spec.walls, spec.wallSegments, style, groundY);
  yield 'loi-tuong';
  const kinds = roomKinds(spec.buildings, interiors);
  // cảnh mềm: mái / tầng trên nhà vào được nướng bóng + vật liệu mềm (phần thân gộp ở mergeSoft cuối hàm)
  const softLook = isSoft(spec.look) ? spec.look : undefined;
  const rooms: Room[] = [];
  /** nền + dốc của nhà kín (`closed` — V-68): đứng lên hiên được, không có "trong nhà" */
  const closedPads: Pad[] = [];
  /** chỗ ngồi + nền đi được của nhà không vào được (đình: nền đá, ghế tựa — V-66 B3) */
  const buildingSeats: Seat[] = [];
  const buildingPads: Pad[] = [];
  const houses: Promise<HouseReport>[] = [];
  const closedHouses: World['closedHouses'] = [];
  let dayNight: DayNight | null = null;
  for (const b of spec.buildings) {
    const use = b.zone && kinds[b.zone.id] ? interiors[b.zone.id] : undefined;
    const walkIn = b.kind ? WALK_IN[b.kind] : undefined;
    // nhà kín có model AI (V-88): va chạm / nền / biển như khối, hình model thêm sau khi gộp; thiếu file → khối
    const house = !use && b.kind === 'nha-o' && b.closed && b.model ? addHouseModel(scene, colliders, b, style, base(b.x, b.z), () => dayNight?.scan()) : null;
    if (house) {
      closedPads.push(...house.pads);
      houses.push(house.ready);
    } else if (use) rooms.push(addRoomBuilding(scene, colliders, b, style, use, base(b.x, b.z), softLook));
    else if (walkIn && b.closed) closedPads.push(...addWalkIn(scene, colliders, b, style, walkIn, base(b.x, b.z), softLook).pads);
    else if (walkIn) rooms.push(addWalkIn(scene, colliders, b, style, walkIn, base(b.x, b.z), softLook));
    else {
      const extra = addBuilding(scene, colliders, b, style, base(b.x, b.z));
      buildingSeats.push(...extra.seats);
      buildingPads.push(...extra.pads);
    }
    if (b.kind === 'nha-o' && b.closed && !use) {
      const at = new THREE.Matrix4().compose(new THREE.Vector3(b.x, base(b.x, b.z), b.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ((b.rotY ?? 0) * Math.PI) / 180), new THREE.Vector3(1, 1, 1));
      closedHouses.push({ id: b.id, box: houseFrame(b, style).applyMatrix4(at) });
    }
    yield 'nha';
  }
  const gameTables = spec.gameTables.flatMap((t) => addGameTable(scene, colliders, t, style, base(t.x, t.z)));
  for (const t of spec.gameTables) if (t.sign) addGameSign(scene, colliders, t.sign, style, base(t.sign.x, t.sign.z));
  for (const g of spec.gates) {
    // cổng model AI: nạp sau (không qua mergeStatic); thiếu file / nạp lỗi → cổng khối (thêm sau gộp, vài draw call)
    const url = g.model ? staticModelUrl(g.model) : null;
    if (g.model && !url) console.warn(`gates: thiếu design/models/${g.model}.glb — cổng "${g.id}" dùng bản khối`);
    if (!url) addGate(scene, colliders, g, style, base(g.x, g.z));
    else
      addGateModel(scene, colliders, g, url, base(g.x, g.z)).catch((e: unknown) => {
        console.warn(`gates: nạp model cổng "${g.id}" lỗi — dùng bản khối`, e);
        addGate(scene, colliders, g, style, base(g.x, g.z));
      });
  }
  yield 'ban-cong';
  // đài đá thấp (V-66 B3): mương, vật, chỗ ngồi trong chân đài nằm trên mặt đài
  const terracePads = addTerraces(scene, spec.terraces, style.stone, style.base, groundY ?? (() => 0));
  const onTop = onTerraces(spec.terraces, groundY ?? (() => 0));
  addWater(scene, colliders, spec.water, style, groundY, isSoft(spec.look) ? { look: spec.look, sky: spec.sky.middle, ripple: detail >= 1 } : undefined);
  const bridgePads = addBridges(scene, colliders, spec.bridges, style, groundY);
  const fauna = addFauna(scene, spec, groundY);
  // chén lệnh Lưu Thương (V-66 B4): mương của trò luu-thuong thêm 1 chén điều khiển được
  const commandChannels = new Set(spec.miniGames.flatMap((m) => (m.kind === 'luu-thuong' ? [m.channel] : [])));
  const channels = addChannels(scene, spec.channels, style, onTop, commandChannels);
  addGalleries(scene, colliders, spec.galleries, groundY);
  const mirages = addMirages(scene, spec.mirages);
  const rampartPads = addRamparts(scene, colliders, spec.ramparts, spec.walls, groundY);
  if (spec.terrain.enabled) addPlateauRails(scene, colliders, spec.terrain);
  yield 'nuoc-cau';
  const props = addProps(scene, colliders, spec.props, style, spec.trees, onTop);
  const flute = addFluteTower(scene, colliders, spec.fluteTower, groundY ?? (() => 0)); // Tháp Sáo Trúc (V-113)
  const outdoorSeats = addOutdoorSeats(scene, spec.seats, style.stone, onTop);
  yield 'do-vat';
  const trees = addTrees(scene, colliders, spec.trees, groundY, spec.look);
  const tea = addTeaGarden(scene, colliders, spec, groundY, detail); // Đồi Chè: luống + bướm + sương (V-46)
  const garden = spec.garden.enabled ? addGarden(scene, colliders, spec.garden, spec.look, groundY, spec.trees.crown === 'chum') : null; // Vườn rau (V-52)
  // Rừng Nấm Tiên (V-109): nấm khổng lồ, nhà nấm, luống thuốc; Nấm Mẹ + Lò Thuốc Tiên (thang + mũ đi được)
  addMushroomForest(scene, colliders, spec.mushroomForest, spec.look, groundY ?? (() => 0), spec.paths);
  const mm = spec.mushroomForest.mother;
  const mother = mm.enabled ? addMotherMushroom(scene, colliders, spec.mushroomForest, base(mm.x, mm.z)) : null;
  const dinhHacPads = addDinhHac(scene, colliders, spec, groundY ?? (() => 0)); // Đỉnh Hạc Bay (V-111): cột đá, cầu treo, đình
  yield 'cay';
  const lanternSpots = addLanternStrings(scene, colliders, spec, groundY);
  const choDem = addChoDem(scene, colliders, spec, groundY); // Chợ Đêm Đèn Hoa (V-108): cây đèn, sạp, bến gỗ
  const sandPads = addSandCity(scene, colliders, spec.sandCity, groundY ?? (() => 0)); // Thành Cát Ngủ Quên (V-112)
  const sea = addSeaFloor(scene, colliders, spec, groundY ?? (() => 0)); // Cung Ngọc Đáy Biển (V-110): Cung Vỏ Sò, san hô, bong bóng, cá
  let glow: THREE.InstancedMesh | null = null;
  // ngày đêm: quầng dựng sẵn, mờ theo giờ; mức Thấp bỏ quầng (R-NGAY-3)
  if (isSoft(spec.look) && (dn ? detail >= 1 : spec.light.lampGlow > 0)) {
    // quầng sáng giả: đèn lồng trên dây + hộp đèn đèn đá (quangDen.ts) — chỉ khi đèn đang sáng (`light.lampGlow`)
    const stone = spec.props.filter((p) => p.kind === 'den-da').map((p) => new THREE.Vector3(p.x, (p.y ?? base(p.x, p.z)) + DEN_DA_LIGHT_Y * (p.scale ?? 1), p.z));
    glow = addLanternGlow(scene, [...lanternSpots, ...stone, ...choDem.glow], spec.look, dn ? 1 : spec.light.lampGlow, dn ? NIGHT_GLOW_MAX : Infinity);
  }
  addFences(scene, colliders, spec, groundY);
  if (spec.well.enabled) addWell(scene, colliders, spec.well, base(spec.well.x, spec.well.z));
  const teleport = spec.teleport.enabled ? addTeleport(scene, colliders, spec.teleport, groundY) : null;
  // sân đá trống chỗ vòng trận cũ ở vùng — bãi hạc đáp (V-65)
  if (spec.stoneYard.enabled) addStoneYard(scene, spec.stoneYard, groundY);
  addBounds(colliders, spec.bounds); // ranh đi được của vùng (V-66)
  // vòng sáng + nhãn ở cổng đi bộ có `label` (R-HANH-4, V-39)
  const portalMarks = addPortalMarkers(scene, spec.portals, spec.teleport.colors, groundY);
  const floating = addFloating(scene, spec.floating, style, spec.trees.leaves[1], spec.trees.seed, spec.look);
  yield 'den-vong';
  // dựng xong mới gộp: khối đứng yên cùng vật liệu → một draw call (scene/merge.ts). Đã thử gộp theo ô (2026-11-14):
  // tam giác gần như không giảm, draw call tăng — phần nặng là địa hình + model người, không phải khối gộp.
  // cảnh mềm: khối Lambert tĩnh khác màu → một khối vật liệu mềm (bóng nướng vào màu đỉnh) trước khi gộp phần còn lại
  if (isSoft(spec.look)) {
    mergeSoft(scene, new Set([ground]), spec.look, base);
    yield 'gop-mem';
  }
  mergeStatic(scene, new Set([ground]));
  yield 'gop';
  // trăng + sao (mức Thấp: không sao — R-NGAY-4) và bộ áp giờ — dựng sau khi gộp: chỉ đổi số / màu, không dựng lại
  dayNight = dn
    ? createDayNight(scene, spec, env, {
        glow,
        sky: addNightSky(scene, spec.dayNight, viewDistance(spec) * 0.72, detail >= 1),
        colorManaged: isColorManaged(spec.look),
        hourly: tea?.hour,
      })
    : null;
  return {
    dayNight,
    ready: Promise.all(houses),
    closedHouses,
    garden,
    ground,
    surface: new LayeredGround(hf, [...(teleport?.pads ?? []), ...bridgePads, ...choDem.pads, ...sea.pads, ...terracePads, ...buildingPads, ...rampartPads, ...rooms.flatMap((r) => r.pads), ...closedPads, ...(mother?.pads ?? []), ...flute.pads, ...sandPads, ...dinhHacPads]),
    rooms,
    seats: [...rooms.flatMap((r) => r.seats ?? []), ...buildingSeats, ...outdoorSeats],
    studySign: rooms.find((r) => r.studySign)?.studySign ?? null,
    gameTables,
    channels,
    zoneAnchors: zoneAnchors(spec.buildings, kinds),
    teleport,
    update(dt, player, eye) {
      tickWind(dt);
      props(dt);
      trees(dt, player, eye);
      floating(dt);
      waterways(dt);
      fauna(dt);
      tea?.update(dt);
      channels.update(dt);
      mirages(dt);
      mother?.update(dt);
      sea.update(dt);
      teleport?.update(dt);
      portalMarks(dt, player);
      for (const r of rooms) r.update(dt, !!player && inRect(r.floor, player.x, player.z), player?.y, eye);
    },
  };
}
