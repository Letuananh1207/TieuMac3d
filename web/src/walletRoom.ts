/**
 * Ghép Văn tiền 文錢 trên cảnh (R-TIEN-1…7; thiết kế 2026-11-14.12): ví HUD theo `getProgress`, thưởng trò khi hết ván
 * (`earnGame` → dòng "+n Văn tiền" trên thẻ kết quả, xu bay xếp hàng tới khi "Rời bàn"), nút nổi "Vào tiệm" trước Tạp hoá →
 * `openShop`. Tách khỏi main.ts như chatRoom.ts. Có Flutter: luật tiền ở Flutter (`journey/wallet.dart`), trang chỉ hiện.
 * **Không có Flutter → chế độ thử** (R-TIEN-7): ví thử `bridge/browserStore.ts`, luật `zones/walletRules.ts`, Tạp hoá bản web
 * `ui/shopPanel.ts`, +10 khi lần đầu mở bài từ trên bảng HTML.
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import type { FlutterBridge, JourneyProgress } from './bridge/flutterBridge';
import type { GameResult } from './ui/gameView';
import { ShopButton } from './ui/shopButton';
import { ShopPanel } from './ui/shopPanel';
import { WalletHud } from './ui/wallet';
import { DECOR_ITEMS, placedCount } from './zones/decor';
import { SHOP_ID, shopButtonShown, shopDoor, type BuildingLike } from './zones/shop';
import { DECOR_ENTRIES, isFertEntry, SEED_ITEMS, seedCrop } from './zones/shopView';
import { FERT_ITEM } from './zones/vuonCham';
import { gameResultLine, gameRewardLabel, type GameEarning, type GameKind, type GameOutcome } from './zones/wallet';
import { buyTrial, dayKey, earnTrialGame, gameTodayOn, gardenTrialAct, learnOnce, learnRewardLabel, type BuyResult } from './zones/walletRules';

/** Xu bay ra từ chỗ bàn: ngang ngực nhân vật vừa đứng dậy cạnh bàn (m). */
const FROM_HEIGHT = 1;

export interface WalletRoomHost {
  bridge: Pick<FlutterBridge, 'earnGame' | 'openShop'>;
  /** kho ví thử khi không có Flutter (R-TIEN-7); `null` = có Flutter → mọi thứ như cũ */
  trial: TrialStore | null;
  buildings: readonly BuildingLike[];
  groundAt(x: number, z: number): number;
  /** Tạp hoá đang che cảnh (Flutter hoặc bản web): nhân vật đứng yên, ngừng vẽ (R-TIEN-4) */
  cover(): void;
  /** Tạp hoá bản web vừa đóng → cảnh chạy tiếp (như `resume`) */
  uncover(): void;
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
  /** Tạp hoá bản web — chỉ dựng ở chế độ thử */
  private readonly panel: ShopPanel | null;
  private opening = false;
  private camera: THREE.Camera | null = null;
  private readonly player = new THREE.Vector3();
  private readonly v = new THREE.Vector3();

  constructor(private readonly host: WalletRoomHost) {
    this.door = shopDoor(host.buildings);
    const d = this.door;
    this.shop = d ? new ShopButton({ ...d, y: host.groundAt(d.x, d.z) }, () => this.openShop()) : null;
    const trial = host.trial;
    this.panel = trial
      ? new ShopPanel([...DECOR_ENTRIES, ...SEED_ITEMS], {
          bag: () => ({ ...trial.wallet.garden.seeds, [FERT_ITEM]: trial.wallet.garden.fert }),
          buy: (item, count): BuyResult => {
            // hạt giống Vườn rau (R-VUON-9): + [count] hạt (× 1 · × 5 · × 10) vào túi ở ví thử
            // phân bón (R-VUON-12): + [count] bao
            const c = seedCrop(item);
            if (c || isFertEntry(item)) {
              const g = gardenTrialAct(trial.wallet, c ? { act: 'buy', crop: c.id, count } : { act: 'buy', item: FERT_ITEM, count }, Date.now());
              trial.update(() => g.wallet);
              return g.result.ok
                ? { ok: true, balance: g.wallet.coins, owned: g.wallet.owned }
                : { ok: false, reason: g.result.reason === 'short' ? 'short' : 'invalid', short: g.result.short };
            }
            const r = buyTrial(trial.wallet, item.id);
            trial.update(() => r.wallet);
            return r.result;
          },
          closed: () => {
            host.uncover();
            this.syncTrial(); // ví HUD "−n" nếu vừa mua (R-TIEN-4)
          },
        })
      : null;
  }

  /**
   * Số dư mới nhất (`getProgress` lúc vào cảnh / sau `resume`): ví hiện số; giảm (vừa mua) → "−n". Chế độ thử → số dư
   * ví thử (không có `getProgress`).
   */
  sync(p: JourneyProgress | null): void {
    if (this.host.trial) this.syncTrial();
    else this.wallet.sync(p?.coins ?? null, p?.gameCoinsToday ?? 0);
  }

  /** Hết một ván ở bàn chơi (R-TIEN-3): ghi tiền ngay; thẻ kết quả thêm "+n Văn tiền"; xu bay khi rời bàn. */
  gameEnded(game: GameKind, outcome: GameOutcome, result: GameResult): void {
    const trial = this.host.trial;
    if (trial) {
      const r = earnTrialGame(trial.wallet, game, outcome, new Date());
      trial.update(() => r.wallet);
      this.showEarning(game, outcome, result, r.earning);
      return;
    }
    void this.host.bridge.earnGame(game, outcome).then((e) => {
      if (e) this.showEarning(game, outcome, result, e); // Flutter lỗi / bản cũ → không thưởng, ví ẩn
    });
  }

  /**
   * Hết ván Lưu Thương / một bài Đàn cầm (R-LUU-5, R-CAM-4): ghi thưởng (ví thử hoặc Flutter `earnGame`) rồi ví HUD
   * "+n · …" (xu bay từ giữa màn khi ví hiện lại). Thẻ kết quả trò chờ thiết kế — trả câu trả lời để nơi gọi ghi.
   */
  async miniEarn(game: GameKind, outcome: GameOutcome, song?: string): Promise<GameEarning | null> {
    const trial = this.host.trial;
    let e: GameEarning | null;
    if (trial) {
      const r = earnTrialGame(trial.wallet, game, outcome, new Date(), song);
      trial.update(() => r.wallet);
      e = r.earning;
    } else e = await this.host.bridge.earnGame(game, outcome, song);
    const center = (): { x: number; y: number } => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    if (e) this.wallet.push({ amount: e.amount, label: gameRewardLabel(game, outcome, e.amount, e.songDone), from: center }, e.balance, e.gameToday);
    return e;
  }

  /**
   * Bài từ HTML vừa mở (không có Flutter): chế độ thử → lần đầu +10 "Học bài Chào hỏi" (R-TIEN-2, R-TIEN-7), xu bay khi đóng
   * thẻ (ví hiện lại); mở lại → 0. Có Flutter thì Flutter tự thưởng — không làm gì.
   */
  learned(b: { id: string; ten: string }): void {
    const trial = this.host.trial;
    if (!trial) return;
    const { wallet: w, amount } = learnOnce(trial.wallet, b.id);
    if (amount <= 0) return;
    trial.update(() => w);
    const center = (): { x: number; y: number } => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    this.wallet.push({ amount, label: learnRewardLabel(b.ten, amount), from: center }, w.coins, gameTodayOn(w, dayKey(new Date())));
  }

  /** Vừa trừ tiền ngoài Tạp hoá (cho Tiểu Líu Lo — R-TIEN-8): ví HUD "−n" + nhãn khi ví hiện lại; [balance] = số dư mới. */
  spent(amount: number, label: string, balance: number, gameToday: number): void {
    const w = this.host.trial?.wallet;
    this.wallet.push({ amount: -amount, label }, balance, w ? gameTodayOn(w, dayKey(new Date())) : gameToday);
  }

  /** Tiền đổi ở vườn rau (R-VUON-7/8/9, R-TIEN-5): bán → "+n · Bán nông sản" có xu bay; mở ô / hạt → "−n" không xu. */
  gardenCoins(amount: number, label: string, balance: number, from?: () => { x: number; y: number } | null): void {
    const w = this.host.trial?.wallet;
    const center = (): { x: number; y: number } => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    // bán: xu bay từ thùng thu mua tới ví (2026-11-15.29 `VuonRau-kho-vua-ban-doc`); không có điểm → giữa màn
    this.wallet.push({ amount, label, ...(amount > 0 ? { from: from ?? center } : {}) }, balance, w ? gameTodayOn(w, dayKey(new Date())) : 0);
  }

  /** Tạp hoá bản web đang mở (Esc do `ShopPanel` tự bắt). */
  get shopOpen(): boolean {
    return !!this.panel?.isOpen;
  }

  update(f: WalletFrame): void {
    this.camera = f.camera;
    this.player.copy(f.player);
    this.wallet.update(f.busy || this.shopOpen);
    if (!this.shop) return;
    const { x, z } = f.player;
    this.shop.set(!this.opening && !this.shopOpen && shopButtonShown(this.door, { x, z, inShop: f.roomId === SHOP_ID, free: f.free }));
    this.shop.follow(f.camera);
  }

  private showEarning(game: GameKind, outcome: GameOutcome, result: GameResult, e: GameEarning): void {
    this.host.setReward(result, gameResultLine(e.amount));
    this.wallet.push({ amount: e.amount, label: gameRewardLabel(game, outcome, e.amount), from: () => this.fromPoint() }, e.balance, e.gameToday);
  }

  private syncTrial(): void {
    const w = this.host.trial?.wallet;
    if (w) this.wallet.sync(w.coins, gameTodayOn(w, dayKey(new Date())));
  }

  private openShop(): void {
    if (this.opening || this.shopOpen) return;
    const trial = this.host.trial;
    if (trial && this.panel) {
      // không có Flutter → Tạp hoá bản web (R-TIEN-6, R-TIEN-7)
      this.host.cover();
      const w = trial.wallet;
      const placed = Object.fromEntries(DECOR_ITEMS.map((i) => [i.id, placedCount(w.items, i.id)]));
      this.panel.open(w.coins, { owned: w.owned, placed });
      return;
    }
    this.opening = true;
    void this.host.bridge.openShop(DECOR_ITEMS).then((native) => {
      this.opening = false;
      if (native) this.host.cover(); // "Đóng" → resume → main hỏi lại getProgress → sync → "−n"
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
