/**
 * Ghép bản đồ vùng (R-BANDO-1…5; thiết kế 2026-11-14.20; kế hoạch `docs/tasks/2026-11-14-ban-do-vung.md`): dựng `AreaMap`
 * từ đặc tả cảnh lúc vào cảnh, bản đồ nhỏ góc trên trái mỗi khung, bản đồ lớn mở / đóng (chạm bản đồ nhỏ, phím M; đóng:
 * nút "Đóng", nút quay lại, M, Esc). Tách khỏi main.ts như walletRoom.ts — main chỉ gọi `update`, `toggle`, `back`.
 */
import type { SceneSpec } from './scene/spec';
import { loadScene } from './scene/loadSpec';
import { AreaMapPanel } from './ui/areaMapPanel';
import { MiniMap } from './ui/miniMap';
import { buildAreaMap, type AreaMap } from './zones/areaMap';
import { BigMapState, miniMapShown, UPPER_FLOOR_MIN, whereAmI, type MapBusy } from './zones/areaMapView';
import { dailyBoardSpot } from './zones/dailyBoard';
import { shopDoor } from './zones/shop';

export interface AreaMapHost {
  spec: SceneSpec;
  /** chỗ ngồi trong cảnh (án thư, bàn trà, bồ đoàn) — `world.seats` */
  seats: readonly { x: number; y: number; z: number; study?: boolean }[];
  /** chân biển "Khu tự học" — `world.studySign` */
  studySign: { x: number; y: number; z: number } | null;
  /** mặt đất tầng 1 (không tính sàn tầng trên) */
  groundAt(x: number, z: number): number;
  /** bản đồ lớn vừa mở: nhân vật dừng, joystick thả */
  opened(): void;
}

export interface AreaMapFrame {
  x: number;
  y: number;
  z: number;
  /** hướng nhân vật quay mặt */
  facing: number;
  /** hướng camera nhìn (`orbit.yaw + π`) */
  view: number;
  busy: MapBusy;
}

export class AreaMapRoom {
  private readonly state = new BigMapState();
  private readonly map: AreaMap;
  private readonly mini: MiniMap;
  private readonly panel: AreaMapPanel;
  private busy: MapBusy = { loading: true };
  private frame: AreaMapFrame | null = null;

  constructor(private readonly host: AreaMapHost) {
    const spec = host.spec;
    const floorOf = (p: { x: number; y: number; z: number }): number => (p.y - host.groundAt(p.x, p.z) >= UPPER_FLOOR_MIN ? 2 : 1);
    const sceneNames: Record<string, string> = {};
    for (const p of spec.portals) sceneNames[p.scene] ??= loadScene(p.scene).spec.site.name;
    const sign = host.studySign;
    this.map = buildAreaMap(spec, {
      seats: host.seats.map((s) => ({ x: s.x, z: s.z, floor: floorOf(s), study: s.study })),
      studySign: sign ? { x: sign.x, z: sign.z, floor: floorOf(sign) } : null,
      shopDoor: shopDoor(spec.buildings),
      board: dailyBoardSpot(spec.props),
      sceneNames,
    });
    this.mini = new MiniMap(() => this.toggle());
    this.panel = new AreaMapPanel(() => this.back());
    this.mini.setMap(this.map);
    this.panel.setMap(this.map);
  }

  /** Bản đồ lớn đang mở: nhân vật đứng yên, joystick + cụm nút ẩn, kéo màn không xoay camera (R-BANDO-5). */
  get open(): boolean {
    return this.state.open;
  }

  /** Chạm bản đồ nhỏ / phím M (R-BANDO-5). */
  toggle(): void {
    const was = this.state.open;
    if (this.state.toggle(this.busy) === was) return;
    this.sync();
  }

  /** Nút "Đóng" / nút quay lại / Esc: `true` = đã đóng bản đồ lớn. */
  back(): boolean {
    if (!this.state.back()) return false;
    this.sync();
    return true;
  }

  update(dt: number, f: AreaMapFrame): void {
    this.busy = f.busy;
    this.frame = f;
    const was = this.state.open;
    this.state.update(f.busy);
    if (was !== this.state.open) this.sync();
    const where = whereAmI(this.map, f.x, f.z, f.y - this.host.groundAt(f.x, f.z));
    this.mini.setShown(miniMapShown({ ...f.busy, bigMap: this.state.open }));
    this.mini.update(dt, { x: f.x, z: f.z, facing: f.facing, view: f.view, building: where.building, floor: where.floor });
  }

  private sync(): void {
    const open = this.state.open;
    const f = this.frame;
    if (open) {
      this.mini.dismissHint();
      this.mini.setShown(false);
      this.host.opened();
    }
    const where = f ? whereAmI(this.map, f.x, f.z, f.y - this.host.groundAt(f.x, f.z)) : { building: null };
    this.panel.show(open, f ? { x: f.x, z: f.z, facing: f.facing, building: where.building } : undefined);
  }
}
