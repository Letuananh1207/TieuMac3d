/**
 * Ghép trang trí tự do Nhà của ta (R-NHA-2, R-NHA-3, R-NHA-4, R-NHA-6, R-NHA-7 — V-69, thiết kế 2026-11-15.42): nạp nhà đã lưu
 * (`getHome` / ví thử), chuyển ô cũ → món (`zones/decorLegacy.ts`), xếp món hợp lệ trong cảnh (`decorPlace.ts` `settleScene`), dựng
 * món (`scene/decorLayer.ts`), vùng đặt (`scene/decorArea.ts`), máy trạng thái lấy / nhấc / dời / xoay / đặt / huỷ / cất
 * (`zones/decorEdit.ts`), HUD (`ui/decorHud.ts` + túi `ui/decorPanel.ts`), lưu cả danh sách (`setHome`). File gốc như `main.ts`;
 * `main.ts` chỉ tạo khi cảnh có `decorArea` và gọi vài hàm (chạm, kéo, phím, khung hình).
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import { getHome } from './bridge/flutterBridge';
import type { Colliders } from './collision/colliders';
import { buildDecorArea } from './scene/decorArea';
import { DECOR_SHAPES } from './scene/decorItems';
import { DecorLayer } from './scene/decorLayer';
import type { SceneSpec } from './scene/spec';
import type { GroundY } from './scene/terrainHeight';
import { DecorHud, isDesktop } from './ui/decorHud';
import { DecorTray } from './ui/decorPanel';
import { cleanHome, decorItem, NEW_HOME, type HomeState, type PlacedDecor } from './zones/decor';
import { bagStock } from './zones/decorStock';
import { bagLeft, editStep, keyVerb, VERB_ROT, type EditAction, type EditState } from './zones/decorEdit';
import { migrateHome } from './zones/decorLegacy';
import { checkSpot, nearestValid, settleScene, snap, type DecorShape, type PlaceArea, type Spot, type SpotCheck } from './zones/decorPlace';
import { setTrialHome } from './zones/walletRules';

/** Màu dấu = token thiết kế (`design/tokens/design_tokens.json`): jade (hợp lệ), lacquer (sai). */
const GHOST_COLORS = { jade: '#2B5446', lacquer: '#A8322A' };

/** Dòng giải thích dưới tấm báo "Không đặt được — {lý do}" (thiết kế `TrangTriTuDo-cam-do-may`). */
const WHY: Readonly<Record<string, string>> = {
  'Chắn lối': 'Đặt ở đây sẽ bịt đường từ Bến mây lên nhà',
  'Lối đi': 'Lối lát, bến và chỗ xuất phát phải để trống',
  'Cửa nhà': 'Chừa lối trước cửa để ra vào',
  'Luống rau': 'Cách luống rau ít nhất 0,3 m',
  'Thùng thu mua': 'Chừa chỗ quanh thùng thu mua',
  'Đè vật khác': 'Dời sang chỗ trống hơn',
  'Dốc quá': 'Đặt trên nền phẳng hơn',
  'Ngoài chỗ đặt': 'Chỉ đặt trong sân / trong phòng',
};

const shapeOf = (id: string): DecorShape | undefined => DECOR_SHAPES[id];

export interface HomeDecorDeps {
  scene: THREE.Scene;
  /** mã cảnh đang ở (`nha-ta` / `nha-ta-trong`) — món đặt mới thuộc cảnh này */
  sceneId: string;
  colliders: Colliders;
  spec: SceneSpec;
  groundY: GroundY;
  /** điểm mặt sân dưới toạ độ màn hình (`GroundPicker`) */
  pick(clientX: number, clientY: number): THREE.Vector3 | null;
  /** ghi cả danh sách món (`FlutterBridge.setHome`); `false` = Flutter không ghi */
  save(items: readonly PlacedDecor[]): Promise<boolean>;
  /** số Văn tiền đang có (tấm báo thẻ khoá) */
  coins(): number;
  /** vào / ra chế độ trang trí: dừng joystick, camera nâng ~55° (R-NHA-6) */
  onMode(on: boolean): void;
  /** ví thử (không có Flutter — R-TIEN-7): nhà + số cái lấy / ghi ở đây thay cho `getHome` / `save` */
  trial?: TrialStore | null;
}

export class HomeDecor {
  private s: EditState;
  private on = false;
  private area: PlaceArea | null = null;
  private check: SpotCheck = { ok: true };
  private checkKey = '';
  private hover: { x: number; z: number } | null = null;
  private dragging = false;
  private keysShown = false;
  private reloading = false;
  private readonly layer: DecorLayer;
  private readonly hud: DecorHud;
  private readonly tray: DecorTray;

  constructor(private readonly d: HomeDecorDeps) {
    this.s = { home: NEW_HOME, scene: d.sceneId, held: null };
    this.layer = new DecorLayer(d.scene, d.colliders, d.spec, d.groundY, GHOST_COLORS);
    this.hud = new DecorHud({
      open: () => this.enter(),
      rotate: () => this.act({ kind: 'rotate', delta: 45 }),
      place: () => this.place(),
      store: () => this.act({ kind: 'store' }),
      cancel: () => this.act({ kind: 'cancel' }),
    });
    this.tray = new DecorTray({ card: (id) => this.card(id), done: () => this.exit() });
  }

  /** Đang ở chế độ trang trí → nhân vật đứng yên, không joystick (R-NHA-2). */
  get active(): boolean {
    return this.on;
  }

  /** Nhà hiện tại (Canvas 3D đo ngân sách / thử). */
  get home(): HomeState {
    return this.s.home;
  }

  /** Lớp 3D (Canvas 3D đếm draw call). */
  get decorLayer(): DecorLayer {
    return this.layer;
  }

  /**
   * Nạp nhà đã lưu (R-NHA-3): `getHome` (chế độ thử: ví thử) → làm sạch → ô cũ thành món (lần đầu lên bản mới) → xếp món của cảnh
   * này (món nay không hợp lệ dời ≤ 1,5 m hoặc về túi) → dựng; có đổi → lưu một lần.
   */
  async load(raw?: unknown): Promise<void> {
    const w = this.d.trial?.wallet;
    const data = raw !== undefined ? raw : w ? { items: w.items, owned: w.owned, placed: w.placed } : await getHome();
    const clean = cleanHome(data);
    let items: PlacedDecor[] = [...clean.items];
    let changed = false;
    if (Object.keys(clean.legacy).length) {
      items = migrateHome(items, clean.legacy, clean.owned);
      changed = true;
    }
    const area = this.buildArea();
    if (area) {
      const settled = settleScene(area, items, shapeOf);
      items = settled.items;
      changed ||= settled.changed;
    }
    this.s = { home: { items, owned: clean.owned }, scene: this.d.sceneId, held: null };
    this.redraw();
    if (changed) await this.persist();
  }

  /** Vùng đặt với vật cản tĩnh của cảnh (bỏ vật cản món — lớp này tự thêm). */
  private buildArea(): PlaceArea | null {
    const own = this.layer.ownBlocks();
    const boxes = this.d.colliders.boxes.filter((b) => !own.has(b));
    const circles = this.d.colliders.circles.filter((c) => !own.has(c));
    const heightAt = this.d.spec.decorArea?.where === 'ngoai' ? (x: number, z: number): number => this.d.groundY(x, z) : undefined;
    this.area = buildDecorArea(this.d.sceneId, this.d.spec, boxes, circles, heightAt);
    if (this.area) this.layer.setKeepOut(this.area.keepOut.flatMap((k) => (k.rect ? [k.rect] : [])), this.area.keepOut.flatMap((k) => (k.circle ? [k.circle] : [])));
    return this.area;
  }

  /** Mỗi khung: nút "Trang trí" (`canDecorate` = đi lại bình thường), nút cầm món bám món, viên lý do. */
  update(_dt: number, camera: THREE.Camera, canDecorate: boolean): void {
    this.hud.setButton(!this.on && canDecorate);
    const h = this.s.held;
    if (!this.on || !h) return;
    const shape = shapeOf(h.item);
    const near = new THREE.Vector3(h.spot.x, this.layer.floorY(h.spot.x, h.spot.z), h.spot.z);
    // điểm mép chân gần camera (hàng nút "dưới" món trên màn)
    const toCam = new THREE.Vector3().subVectors(camera.position, near).setY(0).normalize();
    near.addScaledVector(toCam, (shape ? Math.max(shape.w, shape.d) : 1) / 2);
    this.hud.follow(camera, near, this.layer.topOf(h.item, h.spot.x, h.spot.z));
  }

  /** Chạm / click cảnh khi trang trí (R-NHA-6): cầm món → (chuột) đặt · (chạm) dời tới đó; không cầm → nhấc món dưới điểm. */
  tap(x: number, y: number): boolean {
    if (!this.on) return false;
    const p = this.d.pick(x, y);
    const h = this.s.held;
    if (h) {
      if (isDesktop()) this.place();
      else if (p) this.act({ kind: 'move', spot: { x: snap(p.x), z: snap(p.z), rot: h.spot.rot } });
      return true;
    }
    if (p) this.liftAt(p.x, p.z);
    return true;
  }

  /** Kéo bằng ngón (điện thoại): bắt đầu trên món đang cầm → kéo món; trên món đã đặt → nhấc rồi kéo; nơi khác → xoay camera. */
  dragStart(x: number, y: number, mouse: boolean): boolean {
    if (!this.on || mouse) return false;
    const p = this.d.pick(x, y);
    if (!p) return false;
    const h = this.s.held;
    if (h) {
      const s = shapeOf(h.item);
      const reach = (s ? Math.max(s.w, s.d) / 2 : 0.5) + 0.4;
      if (Math.hypot(p.x - h.spot.x, p.z - h.spot.z) > reach) return false;
      this.dragging = true;
      return true;
    }
    if (!this.liftAt(p.x, p.z)) return false;
    this.dragging = true;
    return true;
  }

  dragMove(x: number, y: number): void {
    const h = this.s.held;
    const p = this.d.pick(x, y);
    if (!this.dragging || !h || !p) return;
    this.act({ kind: 'move', spot: { x: snap(p.x), z: snap(p.z), rot: h.spot.rot } });
  }

  dragEnd(): void {
    this.dragging = false;
  }

  /** Chuột di (máy tính): món đang cầm đi theo con trỏ (lưới 0,5 m). */
  hoverAt(x: number, y: number): void {
    if (!this.on) return;
    const p = this.d.pick(x, y);
    if (!p) return;
    this.hover = { x: p.x, z: p.z };
    const h = this.s.held;
    if (h) this.act({ kind: 'move', spot: { x: snap(p.x), z: snap(p.z), rot: h.spot.rot } });
  }

  /**
   * Phím khi trang trí (R-NHA-6): Q / E / R xoay, Enter đặt, Esc huỷ (không cầm → thoát), Delete / Backspace cất. Đang trang trí thì
   * nuốt mọi phím (E không ngồi, Enter không mở trò chuyện, WASD không đi); `''` = phím giữ lặp.
   */
  key(key: string): boolean {
    if (!this.on) return false;
    const v = keyVerb(key);
    if (!v) return true;
    const rot = VERB_ROT[v];
    if (rot !== undefined) this.act({ kind: 'rotate', delta: rot });
    else if (v === 'place') this.place();
    else if (v === 'store') this.act({ kind: 'store' });
    else this.act({ kind: 'cancel' });
    return true;
  }

  /** Nút quay lại / Esc từ nơi khác: huỷ món đang cầm, rồi thoát chế độ; `true` = đã xử lý. */
  back(): boolean {
    if (!this.on) return false;
    this.act({ kind: 'cancel' });
    return true;
  }

  private enter(): void {
    this.on = true;
    this.d.onMode(true);
    this.hud.setMode(true);
    this.tray.show(true);
    this.redraw();
  }

  private exit(): void {
    if (this.s.held) this.act({ kind: 'cancel' });
    this.on = false;
    this.d.onMode(false);
    this.hud.setMode(false);
    this.tray.show(false);
    this.layer.setGhost(null);
  }

  /** Nhấc món dưới (x, z) — `false` = không có món. */
  private liftAt(x: number, z: number): boolean {
    const local = this.layer.pick(x, z);
    if (local < 0) return false;
    const target = this.layer.placed[local];
    const index = this.s.home.items.findIndex((p) => p.scene === this.d.sceneId && p.item === target.item && p.x === target.x && p.z === target.z && p.rot === target.rot);
    if (index < 0) return false;
    this.act({ kind: 'lift', index });
    return true;
  }

  /** Chạm thẻ trong túi: còn trong túi → cầm (chỗ hợp lệ gần giữa màn / con trỏ); không → tấm báo "Mua … ở Tạp hoá". */
  private card(id: string): void {
    const it = decorItem(id);
    if (!it) return;
    if (bagLeft(this.s, id) <= 0 && this.s.held?.item !== id) {
      this.tray.flash(id);
      const coins = this.d.trial?.wallet.coins ?? this.d.coins();
      this.hud.toast(`Mua ${it.name} ở Tạp hoá phố chợ — ${it.price} Văn tiền (đang có ${coins})`, undefined, it.name); // decorBuyAtShopDetail
      return;
    }
    this.act({ kind: 'take', item: id, spot: this.startSpot(id) });
  }

  /** Chỗ hiện món vừa lấy: máy tính = dưới con trỏ; điện thoại = chỗ hợp lệ gần giữa màn (≤ 6 m). */
  private startSpot(id: string): Spot {
    const c = isDesktop() && this.hover ? this.hover : this.d.pick(window.innerWidth / 2, window.innerHeight * 0.42);
    const base = { x: snap(c?.x ?? this.d.spec.player.start[0]), z: snap(c?.z ?? this.d.spec.player.start[1]), rot: 0 };
    const area = this.area;
    if (!area) return base;
    return nearestValid(area, this.others(), shapeOf, id, base, 6) ?? base;
  }

  /** Món khác trong cảnh này (không gồm món đang cầm — đã bỏ khỏi danh sách khi nhấc). */
  private others(): PlacedDecor[] {
    return this.s.home.items.filter((p) => p.scene === this.d.sceneId);
  }

  private place(): void {
    const h = this.s.held;
    if (!h) return;
    const c = this.spotCheck();
    if (!c.ok) {
      this.hud.toast(`Không đặt được — ${c.label}`, WHY[c.label]); // decorCantPlace
      return;
    }
    this.act({ kind: 'place', valid: true });
  }

  private act(a: EditAction): void {
    const before = this.s.held;
    const r = editStep(this.s, a);
    this.s = r.state;
    if (r.exit) {
      this.exit();
      return;
    }
    if (r.stored) this.hud.toast(`Đã cất ${decorItem(r.stored)?.name ?? ''} vào túi`); // decorStored
    if (!before && this.s.held && isDesktop() && !this.keysShown) {
      this.keysShown = true;
      this.hud.toast('Q E xoay · Click đặt · Esc huỷ · Delete cất'); // gợi ý phím lần đầu
    }
    this.redraw();
    if (r.save) void this.persist();
  }

  /** Kiểm chỗ món đang cầm (nhớ theo vật + chỗ — tìm đường chỉ chạy khi đổi ô lưới / hướng). */
  private spotCheck(): SpotCheck {
    const h = this.s.held;
    if (!h || !this.area) return { ok: true };
    const key = `${h.item}|${h.spot.x}|${h.spot.z}|${h.spot.rot}|${this.s.home.items.length}`;
    if (key !== this.checkKey) {
      this.checkKey = key;
      this.check = checkSpot(this.area, this.others(), shapeOf, h.item, h.spot);
    }
    return this.check;
  }

  /** Vẽ lại món, bóng ma, HUD, túi theo trạng thái. */
  private redraw(): void {
    this.layer.setItems(this.others().map((p) => ({ ...p, blocks: decorItem(p.item)?.blocks ?? false })));
    const h = this.s.held;
    const c = this.spotCheck();
    this.layer.setGhost(this.on && h ? { item: h.item, x: h.spot.x, z: h.spot.z, rot: h.spot.rot, ok: c.ok } : null);
    if (!this.on) return;
    const area = this.area;
    const indoor = area?.where === 'trong';
    const cards = bagStock(this.s.home, area?.where ?? 'ngoai', h ? { item: h.item, lifted: !!h.from } : null);
    const desk = isDesktop();
    this.tray.render({ indoor, count: this.others().length + (h?.from ? 1 : 0), max: area?.maxItems ?? 40, cards });
    this.tray.hold(h ? { item: h.item, name: decorItem(h.item)?.name ?? '', lifted: !!h.from, left: bagLeft(this.s, h.item) } : null);
    this.hud.setHolding(h ? { ok: c.ok, reason: c.ok ? null : c.label } : null);
    let hint: string;
    if (h) hint = desk ? 'Di chuột để dời · Q E xoay · click để đặt' : 'Kéo món để dời · Xoay, Đặt, Cất, Huỷ'; // decorHintHoldDesktop / decorHintHold
    else if (indoor) hint = 'Gian trong · chọn đồ trong nhà để đặt'; // decorHintIndoor
    else if (!cards.length) hint = 'Chạm đồ trong sân để dời hoặc cất'; // decorHintBagEmpty
    else hint = desk ? 'Chọn đồ trong túi để đặt · click đồ trong sân để dời' : 'Chọn đồ trong túi để đặt · chạm đồ trong sân để dời'; // decorHintIdle
    this.hud.setHint(hint, !!h);
  }

  /** Lưu cả danh sách (R-NHA-3): ví thử → trình duyệt; Flutter từ chối (vượt số cái) → nạp lại. */
  private async persist(): Promise<void> {
    const items = this.s.home.items;
    const trial = this.d.trial;
    if (trial) {
      trial.update((w) => setTrialHome(w, items));
      return;
    }
    const ok = await this.d.save(items);
    if (ok || this.d.trial === undefined || this.reloading) return; // Canvas 3D: giữ trong bộ nhớ trang
    this.reloading = true;
    await this.load();
    this.reloading = false;
  }
}
