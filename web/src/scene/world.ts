import { addBridges } from './bridges';
import { addChannels } from './channels';
import { addGalleries } from './vat_giang_nam';
import { addMirages } from './vat_bong_lai';
import { addRamparts } from './thanh_luy';
import { addPlateauRails } from './cung_dien';
import { addFauna } from './fauna';
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { LayeredGround, type Ground } from '../collision/ground';
import { addBuilding } from './buildings';
import { addEnvironment, addFlatGround } from './environment';
import { addCloudSea, addFarMountains, viewDistance } from './farMountains';
import { addGate, addGateModel } from './gate';
import { staticModelUrl } from './staticModel';
import { addGrassAndRocks } from './grass';
import { addSoftGrassAndFlowers } from './coHoa';
import { mergeSoft, mergeStatic } from './merge';
import { setLampGlow, tickWind } from './materials';
import { isSoft } from './look';
import { resetSignAtlas } from './signAtlas';
import { addPaths } from './paths';
import { addProps, DEN_DA_LIGHT_Y } from './props';
import { addLanternGlow } from './quangDen';
import { addFloating } from './sky';
import type { Seat } from './seat';
import { addLanternStrings } from './dayDenLong';
import { addFences } from './lanCan';
import { addGameSign, addGameTable, type GameTable } from './gameTable';
import { addRoomBuilding, addWalkIn, inRect, WALK_IN, type InteriorUse, type Room } from './rooms';
import { addStairs } from './stairs';
import { roomKinds, zoneAnchors, type SceneSpec, type ZoneAnchor } from './spec';
import { addTerrain } from './terrain';
import { buildHeightfield, type GroundY } from './terrainHeight';
import { addTrees } from './trees';
import { addTeleport, type TeleportRing } from './truyenTong';
import { addWaterways } from './waterways';
import { addWalls } from './walls';
import { addWater } from './water';
import { addWell } from './well';

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
  /** gọi mỗi khung hình: khói lò đan, mây, đảo nổi, mờ mái nhà khi `player` đứng trong */
  update(dt: number, player?: { x: number; y?: number; z: number }): void;
}

/**
 * Dựng toàn bộ cảnh theo đặc tả. Mọi vật cản đăng ký vào `colliders`.
 * `interiors` (mã vùng → kiểu nội thất, do nội dung bài quyết) biến nhà neo vùng đó thành nhà vào được.
 */
export function buildWorld(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec,
  interiors: Record<string, InteriorUse> = {},
  /** mật độ chi tiết trang trí theo mức đồ hoạ (`quality.ts` `detailOf`): 1 đủ, 0,5 = cỏ hoa thưa một nửa, nước không gợn */
  detail = 1,
): World {
  const style = spec.buildingStyle;
  resetSignAtlas(); // biển của cảnh này vẽ vào một ảnh chung → 1 draw call
  setLampGlow(spec.light.lampGlow); // đèn dựng dưới đây (lampMaterial) sáng theo số này — 0 = ban ngày, không phát sáng
  addEnvironment(scene, spec, viewDistance(spec));
  const hf = spec.terrain.enabled ? buildHeightfield(spec.terrain, spec.paths) : null;
  // ngoài lưới (vực) → 0; nhà, tường, lối đi nằm trên bục phẳng nên không cần độ cao riêng
  const groundY: GroundY | undefined = hf
    ? (x, z) => {
        const h = hf.heightAt(x, z);
        return Number.isFinite(h) ? h : 0;
      }
    : undefined;
  const ground = hf ? addTerrain(scene, spec, hf) : addFlatGround(scene, spec.ground);
  let waterways: (dt: number) => void = () => {};
  if (hf && groundY) {
    addStairs(scene, spec.terrain, style);
    const soft = isSoft(spec.look);
    addGrassAndRocks(scene, spec.terrain, hf, spec.paths, !soft);
    if (soft) addSoftGrassAndFlowers(scene, spec.terrain, hf, spec.paths, spec.look, detail);
    waterways = addWaterways(scene, spec.terrain, style, groundY);
  }
  addFarMountains(scene, spec, detail);
  addCloudSea(scene, spec);
  // độ cao nền của nhà / cổng / ao / giếng: tâm của nó trên mặt đất (nằm trên bục → độ cao bục)
  const base = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  addPaths(scene, spec.paths, style.path, groundY, style.pathLook === 'san' ? spec.ground : undefined);
  addWalls(scene, colliders, spec.walls, spec.wallSegments, style, groundY);
  const kinds = roomKinds(spec.buildings, interiors);
  // cảnh mềm: mái / tầng trên nhà vào được nướng bóng + vật liệu mềm (phần thân gộp ở mergeSoft cuối hàm)
  const softLook = isSoft(spec.look) ? spec.look : undefined;
  const rooms: Room[] = [];
  for (const b of spec.buildings) {
    const use = b.zone && kinds[b.zone.id] ? interiors[b.zone.id] : undefined;
    const walkIn = b.kind ? WALK_IN[b.kind] : undefined;
    if (use) rooms.push(addRoomBuilding(scene, colliders, b, style, use, base(b.x, b.z), softLook));
    else if (walkIn) rooms.push(addWalkIn(scene, colliders, b, style, walkIn, base(b.x, b.z), softLook));
    else addBuilding(scene, colliders, b, style, base(b.x, b.z));
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
  addWater(scene, colliders, spec.water, style, groundY, isSoft(spec.look) ? { look: spec.look, sky: spec.sky.middle, ripple: detail >= 1 } : undefined);
  const bridgePads = addBridges(scene, colliders, spec.bridges, style, groundY);
  const fauna = addFauna(scene, spec, groundY);
  const channels = addChannels(scene, spec.channels, style, groundY);
  addGalleries(scene, colliders, spec.galleries, groundY);
  const mirages = addMirages(scene, spec.mirages);
  const rampartPads = addRamparts(scene, colliders, spec.ramparts, spec.walls, groundY);
  if (spec.terrain.enabled) addPlateauRails(scene, colliders, spec.terrain);
  const props = addProps(scene, colliders, spec.props, style, spec.trees, groundY);
  const trees = addTrees(scene, colliders, spec.trees, groundY, spec.look);
  const lanternSpots = addLanternStrings(scene, colliders, spec, groundY);
  if (isSoft(spec.look) && spec.light.lampGlow > 0) {
    // quầng sáng giả: đèn lồng trên dây + hộp đèn đèn đá (quangDen.ts) — chỉ khi đèn đang sáng (`light.lampGlow`)
    const stone = spec.props.filter((p) => p.kind === 'den-da').map((p) => new THREE.Vector3(p.x, (p.y ?? base(p.x, p.z)) + DEN_DA_LIGHT_Y * (p.scale ?? 1), p.z));
    addLanternGlow(scene, [...lanternSpots, ...stone], spec.look, spec.light.lampGlow);
  }
  addFences(scene, colliders, spec, groundY);
  if (spec.well.enabled) addWell(scene, colliders, spec.well, base(spec.well.x, spec.well.z));
  const teleport = spec.teleport.enabled ? addTeleport(scene, colliders, spec.teleport, groundY) : null;
  const floating = addFloating(scene, spec.floating, style, spec.trees.leaves[1], spec.trees.seed, spec.look);
  // dựng xong mới gộp: khối đứng yên cùng vật liệu → một draw call (scene/merge.ts). Đã thử gộp theo ô (2026-11-14):
  // tam giác gần như không giảm, draw call tăng — phần nặng là địa hình + model người, không phải khối gộp.
  // cảnh mềm: khối Lambert tĩnh khác màu → một khối vật liệu mềm (bóng nướng vào màu đỉnh) trước khi gộp phần còn lại
  if (isSoft(spec.look)) mergeSoft(scene, new Set([ground]), spec.look, base);
  mergeStatic(scene, new Set([ground]));
  return {
    ground,
    surface: new LayeredGround(hf, [...(teleport?.pads ?? []), ...bridgePads, ...rampartPads, ...rooms.flatMap((r) => r.pads)]),
    rooms,
    seats: rooms.flatMap((r) => r.seats ?? []),
    studySign: rooms.find((r) => r.studySign)?.studySign ?? null,
    gameTables,
    zoneAnchors: zoneAnchors(spec.buildings, kinds),
    teleport,
    update(dt, player) {
      tickWind(dt);
      props(dt);
      trees(dt);
      floating(dt);
      waterways(dt);
      fauna(dt);
      channels(dt);
      mirages(dt);
      teleport?.update(dt);
      for (const r of rooms) r.update(dt, !!player && inRect(r.floor, player.x, player.z), player?.y);
    },
  };
}
