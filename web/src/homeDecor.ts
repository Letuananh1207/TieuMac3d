/**
 * Ghép trang trí Nhà của ta (R-NHA-2, R-NHA-3, R-NHA-4 — thiết kế 2026-11-14.13): nạp nhà đã lưu (`getHome`), dựng vật
 * ở ô (`scene/decorLayer.ts`), nút "Trang trí" + chế độ trang trí (`ui/decorHud.ts`, `ui/decorPanel.ts`), luật chạm thẻ
 * (`zones/decorMode.ts`), lưu từng ô qua cầu nối (`setDecor`). File gốc như `main.ts` (được import mọi lớp);
 * `main.ts` chỉ tạo khi cảnh có `decorSlots` và gọi vài hàm.
 */
import type * as THREE from 'three';
import { getHome } from './bridge/flutterBridge';
import type { Colliders } from './collision/colliders';
import { addDecorMarkers, DecorLayer, slotFloorY, slotMark, type DecorMarkers, type SlotMark } from './scene/decorLayer';
import type { DecorSlotSpec, SceneSpec } from './scene/spec';
import type { GroundY } from './scene/terrainHeight';
import { DecorHud } from './ui/decorHud';
import { DecorPanel } from './ui/decorPanel';
import { cleanHome, decorItem, NEW_HOME, type HomeState } from './zones/decor';
import { buyAtShopText, decorCards, panelHint, removeFrom, SLOT_LABEL, tapCard } from './zones/decorMode';

/** Màu dấu ô = token thiết kế (`design/tokens/design_tokens.json`): white, aura-light (bỏ alpha — vật liệu tự mờ), gold, jade. */
const MARKER_COLORS = { white: '#FFFFFF', aura: '#FFECBE', gold: '#D4A64A', jade: '#2B5446' };

export interface HomeDecorDeps {
  scene: THREE.Scene;
  colliders: Colliders;
  spec: SceneSpec;
  groundY: GroundY;
  /** ghi một ô (`FlutterBridge.setDecor`); `false` = không có Flutter → chỉ giữ trong bộ nhớ trang */
  save(slot: string, item: string | null): Promise<boolean>;
  /** số Văn tiền đang có (tấm báo thẻ khoá) */
  coins(): number;
  /** vào chế độ trang trí: dừng joystick / bỏ đích đi */
  onEnter(): void;
}

export class HomeDecor {
  private home: HomeState = NEW_HOME;
  private on = false;
  private selected: DecorSlotSpec | null = null;
  private readonly layer: DecorLayer;
  private readonly markers: DecorMarkers;
  private readonly hud: DecorHud;
  private readonly panel: DecorPanel;
  private readonly slots: readonly DecorSlotSpec[];

  constructor(private readonly d: HomeDecorDeps) {
    this.slots = d.spec.decorSlots;
    this.layer = new DecorLayer(d.scene, d.colliders, d.spec, d.groundY);
    this.markers = addDecorMarkers(d.scene, this.slots, (s) => slotFloorY(d.spec, s, d.groundY), MARKER_COLORS);
    this.hud = new DecorHud(this.slots, { open: () => this.enter(), done: () => this.exit(), pick: (id) => this.pick(id) });
    this.panel = new DecorPanel({ card: (id) => this.card(id), remove: () => this.remove(), close: () => this.closePanel() });
  }

  /** Đang ở chế độ trang trí → nhân vật đứng yên, không joystick (R-NHA-2). */
  get active(): boolean {
    return this.on;
  }

  /** Nạp nhà đã lưu (R-NHA-3): `getHome` → làm sạch theo cảnh → dựng vật. Không có Flutter → nhà mới. */
  async load(): Promise<void> {
    this.home = cleanHome(await getHome(), this.slots);
    this.layer.setAll(this.home.placed, decorItem);
  }

  /** Mỗi khung: nút "Trang trí" (`canDecorate` = đi lại bình thường), dấu ô + nút tròn bám ô khi trang trí. */
  update(dt: number, camera: THREE.Camera, canDecorate: boolean): void {
    this.hud.setButton(!this.on && canDecorate);
    if (!this.on) return;
    this.markers.update(dt);
    this.hud.follow(camera, (id) => this.layer.anchor(id), (id) => !!this.home.placed[id], this.selected?.id ?? null);
  }

  /** Chạm cảnh khi trang trí: đóng bảng (vẫn ở chế độ trang trí); `true` = đã nhận chạm. */
  tap(): boolean {
    if (!this.on) return false;
    this.closePanel();
    return true;
  }

  /** Nút quay lại / Esc: đóng bảng, rồi thoát chế độ; `true` = đã xử lý. */
  back(): boolean {
    if (!this.on) return false;
    if (this.panel.isOpen) this.closePanel();
    else this.exit();
    return true;
  }

  private enter(): void {
    this.on = true;
    this.d.onEnter();
    this.hud.setMode(true);
    this.markers.show(true);
    this.refresh();
  }

  private exit(): void {
    this.closePanel();
    this.on = false;
    this.hud.setMode(false);
    this.markers.show(false);
  }

  private pick(slotId: string): void {
    this.selected = this.slots.find((s) => s.id === slotId) ?? null;
    this.refresh();
  }

  private closePanel(): void {
    this.selected = null;
    this.refresh();
  }

  private card(itemId: string): void {
    const slot = this.selected;
    if (!slot) return;
    const t = tapCard(this.home, slot, itemId);
    if (t.kind === 'locked') this.panel.toast(buyAtShopText(t.item, this.d.coins()), t.item.name);
    if (t.kind !== 'place') return;
    this.apply(t.home, slot, itemId);
  }

  private remove(): void {
    const slot = this.selected;
    const next = slot ? removeFrom(this.home, slot) : null;
    if (slot && next) this.apply(next, slot, null);
  }

  /** Đổi nhà: vật hiện ngay ở ô, lưu ô đó qua cầu nối (không chờ — không có Flutter thì giữ trong bộ nhớ trang). */
  private apply(home: HomeState, slot: DecorSlotSpec, itemId: string | null): void {
    this.home = home;
    this.layer.set(slot.id, itemId ? decorItem(itemId) ?? null : null);
    void this.d.save(slot.id, itemId);
    this.refresh();
  }

  /** Vẽ lại dấu ô, viên nhắc, bảng theo ô đang chọn. */
  private refresh(): void {
    const marks: Record<string, SlotMark> = {};
    for (const s of this.slots) marks[s.id] = slotMark(s.id, this.home.placed, this.selected?.id ?? null);
    this.markers.mark(marks);
    const s = this.selected;
    this.hud.setHint(s ? SLOT_LABEL[s.kind].name : 'Chạm một ô để đặt vật');
    if (!s) {
      this.panel.close();
      return;
    }
    const label = SLOT_LABEL[s.kind];
    this.panel.show({
      kind: s.kind,
      name: label.name,
      han: label.han,
      sub: panelHint(this.home, s.id),
      canRemove: !!this.home.placed[s.id],
      cards: decorCards(this.home, s),
    });
  }
}
