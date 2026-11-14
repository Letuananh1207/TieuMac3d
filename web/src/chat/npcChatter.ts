/**
 * NPC nói câu có sẵn trên kênh chung (R-CHAT-3) để kênh có người khi chưa có máy chủ.
 * Mỗi NPC: chờ ngẫu nhiên 40–90 giây rồi nói một câu, không lặp câu vừa nói.
 */
import type { ChatChannel } from './chatChannel';
import type { Speaker } from './chatMessage';

export const CHATTER_MIN_S = 40;
export const CHATTER_MAX_S = 90;

/** Câu có sẵn theo mã NPC (đặc tả cảnh `npcs[].id`). */
export const NPC_LINES: Record<string, readonly string[]> = {
  'tieu-mac': [
    'Đạo hữu nào mới tới thì ghé cổng trấn chào Tiểu Mặc nhé!',
    'Hôm nay Tiểu Mặc thuộc thêm ba chữ rồi, 好!',
    'Ai rảnh ra Kỳ Văn Uyển đánh một ván Ngũ Tử Kỳ không?',
    'Học một chữ, thêm một phần tu vi — cố lên các đạo hữu!',
  ],
  'su-phu': [
    'Học mà không ôn, như nước đổ lá khoai.',
    'Chữ 人 hai nét, làm người cho ngay thẳng.',
    'Ngồi tĩnh một lát, chữ sẽ tự vào lòng.',
  ],
  'thu-thu': [
    'Tàng Thư Các mở cửa, ai mượn sách HSK cứ lên tầng một.',
    'Sách mượn rồi nhớ đọc, đừng để bụi phủ nhé.',
    'Hôm nay có ai ôn HSK 1 chưa?',
  ],
};

/** Số ngẫu nhiên trong [0, 1). */
export type Rng = () => number;

interface NpcState {
  speaker: Speaker;
  lines: readonly string[];
  nextAt: number;
  lastIndex: number;
}

export class NpcChatter {
  private readonly npcs: NpcState[];

  constructor(
    private readonly channel: ChatChannel,
    speakers: readonly Speaker[],
    private readonly rng: Rng,
    now = 0,
    lines: Record<string, readonly string[]> = NPC_LINES,
  ) {
    this.npcs = speakers
      .filter((s) => (lines[s.id]?.length ?? 0) > 0)
      .map((s) => ({ speaker: s, lines: lines[s.id], nextAt: now + this.wait(), lastIndex: -1 }));
  }

  /** Gọi mỗi khung; NPC tới giờ thì nói. */
  update(now: number): void {
    for (const n of this.npcs) {
      if (now < n.nextAt) continue;
      n.lastIndex = this.pick(n);
      this.channel.send(n.speaker, n.lines[n.lastIndex], now);
      n.nextAt = now + this.wait();
    }
  }

  private wait(): number {
    return CHATTER_MIN_S + this.rng() * (CHATTER_MAX_S - CHATTER_MIN_S);
  }

  /** Chọn câu khác câu vừa nói (chỉ một câu → nói lại câu đó). */
  private pick(n: NpcState): number {
    if (n.lines.length === 1) return 0;
    if (n.lastIndex < 0) return Math.floor(this.rng() * n.lines.length);
    const i = Math.floor(this.rng() * (n.lines.length - 1));
    return i >= n.lastIndex ? i + 1 : i;
  }
}
