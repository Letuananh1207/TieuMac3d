/**
 * Ghép Văn tiền 文錢 trên cảnh (R-TIEN-1, R-TIEN-3, R-TIEN-5, R-TIEN-6; thiết kế 2026-11-14.12): ví HUD theo `getProgress`,
 * thưởng trò khi hết ván (`earnGame` → dòng "+n Văn tiền" trên thẻ kết quả, xu bay xếp hàng tới khi "Rời bàn"), nút nổi
 * "Vào tiệm" trước Tạp hoá → `openShop`. Tách khỏi main.ts như chatRoom.ts. Luật tiền ở Flutter (`journey/wallet.dart`).
 */
import * as THREE from 'three';
import type { FlutterBridge, JourneyProgress } from './bridge/flutterBridge';
import type { GameResult } from './ui/gameView';
import { ShopButton } from './ui/shopButton';
import { WalletHud } from './ui/wallet';
import { DECOR_ITEMS } from './zones/decor';
import { SHOP_CLOSED_TEXT, SHOP_ID, shopButtonShown, shopDoor, type BuildingLike } from './zones/shop';
import { gameResultLine, gameRewardLabel, type GameKind, type GameOutcome } from './zones/wallet';

/** Xu bay ra từ chỗ bàn: ngang ngực nhân vật vừa đứng dậy cạnh bàn (m). */
const FROM_HEIGHT = 1;

export interface WalletRoomHost {
  bridge: Pick<FlutterBridge, 'earnGame' | 'openShop'>;
  buildings: readonly BuildingLike[];
  groundAt(x: number, z: number): number;
  /** Flutter đã mở Tạp hoá: nhân vật đứng yên, ngừng vẽ tới `resume` (R-TIEN-4) */
  cover(): void;
  /** không có Flutter: một câu báo qua khung thoại (R-TIEN-6 "Tiệm chưa mở") */
  notice(text: string): void;
  /** gắn dòng "+n Văn tiền" lên thẻ kết quả ván (`GamePlay.setReward`) */
  setReward(result: GameResult, line: string | null): void;
}

export interface WalletFrame {
  camera: THREE.Camera;
  player: THREE.Vector3;
  /** mã nhà đang đứng trong (`Room.zoneId`) */
  roomId: string | undefined;
  /** ví ẩn: bài / thẻ học / màn ôn / bản đồ / thoại / bàn chơi / màn Flutter / màn tải (R-TIEN-1) */
  busy: boolean;
  /** rảnh để hiện nút nổi (không bận, không ngồi, không bay — như "Xem bảng") */
  free: boolean;
}

export class WalletRoom {
  private readonly wallet = new WalletHud();
  private readonly door: { x: number; z: number } | null;
  private readonly shop: ShopButton | null;
  private opening = false;
  private camera: THREE.Camera | null = null;
  private readonly player = new THREE.Vector3();
  private readonly v = new THREE.Vector3();

  constructor(private readonly host: WalletRoomHost) {
    this.door = shopDoor(host.buildings);
    const d = this.door;
    this.shop = d ? new ShopButton({ ...d, y: host.groundAt(d.x, d.z) }, () => this.openShop()) : null;
  }

  /** Số dư mới nhất (`getProgress` lúc vào cảnh / sau `resume`): ví hiện số; giảm (vừa mua) → "−n". */
  sync(p: JourneyProgress | null): void {
    this.wallet.sync(p?.coins ?? null, p?.gameCoinsToday ?? 0);
  }

  /** Hết một ván ở bàn chơi (R-TIEN-3): Flutter ghi tiền ngay; thẻ kết quả thêm "+n Văn tiền"; xu bay khi rời bàn. */
  gameEnded(game: GameKind, outcome: GameOutcome, result: GameResult): void {
    void this.host.bridge.earnGame(game, outcome).then((e) => {
      if (!e) return; // không có Flutter → không thưởng, ví ẩn
      this.host.setReward(result, gameResultLine(e.amount));
      this.wallet.push({ amount: e.amount, label: gameRewardLabel(game, outcome, e.amount), from: () => this.fromPoint() }, e.balance, e.gameToday);
    });
  }

  update(f: WalletFrame): void {
    this.camera = f.camera;
    this.player.copy(f.player);
    this.wallet.update(f.busy);
    if (!this.shop) return;
    const { x, z } = f.player;
    this.shop.set(!this.opening && shopButtonShown(this.door, { x, z, inShop: f.roomId === SHOP_ID, free: f.free }));
    this.shop.follow(f.camera);
  }

  private openShop(): void {
    if (this.opening) return;
    this.opening = true;
    void this.host.bridge.openShop(DECOR_ITEMS).then((native) => {
      this.opening = false;
      if (native) this.host.cover(); // "Đóng" → resume → main hỏi lại getProgress → sync → "−n"
      else this.host.notice(SHOP_CLOSED_TEXT);
    });
  }

  /** Điểm màn xu bật ra: chỗ bàn (ngang ngực nhân vật lúc rời bàn); ra sau camera → không bay. */
  private fromPoint(): { x: number; y: number } | null {
    if (!this.camera) return null;
    this.v.copy(this.player).setY(this.player.y + FROM_HEIGHT).project(this.camera);
    if (this.v.z > 1) return null;
    return { x: ((this.v.x + 1) / 2) * window.innerWidth, y: ((1 - this.v.y) / 2) * window.innerHeight };
  }
}
