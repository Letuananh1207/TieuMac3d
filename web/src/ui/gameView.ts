/**
 * Dữ liệu HUD trò chơi Kỳ Văn Uyển (thiết kế 2026-11-13.27): `gamePlay.ts` dựng, `ui/gameHud.ts` vẽ. Thuần — không DOM.
 */

/** NPC của bàn (chân dung theo `id`). */
export interface GameNpc {
  id: string;
  name: string;
  han?: string;
}

/** Thẻ kết quả ván (R-CO-3, R-DAU-2): thắng / thua / hoà theo phía người chơi, tỉ số người : NPC, lời NPC. */
export interface GameResult {
  outcome: 'thang' | 'thua' | 'hoa';
  you: number;
  npc: number;
  line: string;
  /** dòng nhỏ "+8 Văn tiền" khi Flutter đã ghi thưởng ván (R-TIEN-3, quyết định 4); chưa / không thưởng → không có */
  reward?: string;
}

/** Ngũ Tử Kỳ (R-CO-1..3). */
export interface GomokuView {
  kind: 'co';
  npc: GameNpc;
  /** tỉ số phiên: số ván thắng từ lúc ngồi */
  you: number;
  npcWins: number;
  /** `you` = lượt người · `npc` = NPC đang nghĩ · `het` = hết ván (thẻ kết quả) */
  turn: 'you' | 'npc' | 'het';
  result: GameResult | null;
}

/** Một ô nghĩa Đấu chữ sau khi chấm: `dung` ✓ · `sai` × (ô bị chọn sai) · `mo` mờ. */
export type DuelOptionMark = 'dung' | 'sai' | 'mo' | null;

/** Đấu chữ (R-DAU-1, R-DAU-2). */
export interface DuelView {
  kind: 'dau-chu';
  npc: GameNpc;
  /** câu đang hỏi, 0..9 */
  step: number;
  total: number;
  /** kết quả từng câu đã xong: true đúng, false sai */
  marks: boolean[];
  you: number;
  npcScore: number;
  /** ai trả lời câu này */
  answerer: 'you' | 'npc';
  /** bộ thủ đang hỏi (chữ to) */
  form: string;
  /** "mộc · mù — cây" — hiện sau khi chấm */
  detail: string;
  /** 4 nhãn nghĩa "mộc — cây" */
  options: string[];
  /** `hoi` chờ chọn · `nghi` NPC đang nghĩ · `cham` đang hiện nghĩa đúng (~1 s) · `het` hết ván */
  phase: 'hoi' | 'nghi' | 'cham' | 'het';
  /** dấu từng ô khi `cham` */
  optionMarks: DuelOptionMark[];
  /** ô NPC vừa chọn (gắn huy hiệu tên) */
  npcPick: number | null;
  /** viên báo khi `cham`: đúng / sai + chữ */
  toast: { right: boolean; text: string } | null;
  /** bên vừa được điểm (quầng vàng thẻ điểm) */
  scored: 'you' | 'npc' | null;
  result: GameResult | null;
}

export type GameView = GomokuView | DuelView;
