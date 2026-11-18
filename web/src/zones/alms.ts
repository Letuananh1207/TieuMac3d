/**
 * Tiểu Líu Lo — bé đưa tin (mã `khat-nhi`, tên cũ Tiểu Khất) xin vài văn rồi kể tin (R-NPC-6, R-TIEN-8); xưng tên mình,
 * gọi "thiếu hiệp" (R-NPC-11): trạng thái thoại theo ví + bản ghi đã cho, câu chào theo số lần đã cho, câu cảm ơn
 * kèm tin đồn của ngày. Luật trừ tiền ở `walletRules.ts` (`giveAlms`; Dart `giveAlms` là nguồn thật khi có Flutter).
 * Thuần (không DOM, không three).
 */
import type { Dialog, DialogChoice } from './dialogs';
import { tinDonCuaNgay } from './tinDon';
import { ALMS_COINS, almsGivenOn, type AlmsRecord } from './walletRules';

/** `chua-cho` hôm nay chưa cho, đủ tiền · `thieu` chưa cho, ví dưới 5 · `da-cho` hôm nay đã cho. */
export type AlmsState = 'chua-cho' | 'thieu' | 'da-cho';

/** Ví chưa biết (Flutter bản cũ không gửi số dư) → coi như đủ tiền; khi cho, Flutter / ví thử mới quyết. */
export function almsState(alms: AlmsRecord, today: number, balance: number | null): AlmsState {
  if (almsGivenOn(alms, today)) return 'da-cho';
  return balance !== null && balance < ALMS_COINS ? 'thieu' : 'chua-cho';
}

/** Mốc số lần đã cho đổi câu chào (R-NPC-6). */
export const ALMS_FRIEND = 3;
export const ALMS_LOYAL = 10;

/** Câu chào đầu của Tiểu Líu Lo theo trạng thái + số lần đã cho. */
export function almsGreeting(state: AlmsState, count: number): string {
  if (state === 'da-cho') return 'Hôm nay thiếu hiệp cho rồi, mai ghé nhé! Líu Lo ở đây cả ngày mà.';
  const ask = 'cho Líu Lo xin vài văn mua bánh, Líu Lo kể tin nóng cho nghe nhé?';
  const loyal = count >= ALMS_LOYAL ? ' Líu Lo nhớ ơn thiếu hiệp mãi.' : '';
  if (count >= ALMS_FRIEND) return `Ân nhân lại tới!${loyal} Hôm nay ân nhân ${ask}`;
  return `Thiếu hiệp ơi, ${ask}`;
}

/** Câu sau khi cho được: cảm ơn + tin đồn của ngày (R-NPC-6). */
export function almsThanks(today: number): string {
  return `Đa tạ thiếu hiệp! ${tinDonCuaNgay(today).text}`;
}

/** "Nhắc lại tin hôm nay" (đã cho hôm nay). */
export function almsRepeat(today: number): string {
  return `Tin hôm nay đây: ${tinDonCuaNgay(today).text}`;
}

/** Không cho: câu vui vẻ, không có tin. */
export const ALMS_DECLINED = 'Không sao, không sao! Mai thiếu hiệp có tiền lẻ thì nhớ tới Líu Lo nhé.';

/** Lựa chọn thay "Cho 5 văn" khi ví dưới 5 (R-TIEN-8). */
export function almsShortChoice(balance: number): string {
  return `Ta chỉ còn ${balance} văn…`;
}

/** Tiểu Líu Lo trả lời khi người chơi chỉ còn ít tiền. */
export const ALMS_SHORT_REPLY = 'Ôi, thiếu hiệp cũng hết tiền lẻ à? Giữ lại mà mua bánh. Đi học chữ kiếm thêm văn nhé!';

/** Mã NPC Tiểu Líu Lo (giữ mã cũ — đặc tả cảnh `npcs[].id`). */
export const KHAT_NHI = 'khat-nhi';
export const KHAT_NHI_NAME = 'Tiểu Líu Lo';

const BYE: DialogChoice = { text: 'Tạm biệt', next: null };

/**
 * Hội thoại Tiểu Líu Lo theo trạng thái (R-NPC-6): chưa cho → "Cho 5 văn" (`action: 'alms'`) / "Hôm nay ta không có tiền
 * lẻ" / Tạm biệt; thiếu tiền → "Ta chỉ còn n văn…" thay "Cho 5 văn"; đã cho hôm nay → "Nhắc lại tin hôm nay".
 */
export function khatNhiDialog(alms: AlmsRecord, today: number, balance: number | null): Dialog {
  const state = almsState(alms, today, balance);
  const decline: DialogChoice = { text: 'Hôm nay ta không có tiền lẻ', next: 'khong-cho' };
  const first: DialogChoice[] =
    state === 'da-cho'
      ? [{ text: 'Nhắc lại tin hôm nay', next: 'nhac-tin' }, BYE]
      : state === 'thieu'
        ? [{ text: almsShortChoice(balance ?? 0), next: 'thieu' }, decline, BYE]
        : [{ text: `Cho ${ALMS_COINS} văn`, next: null, action: 'alms' }, decline, BYE];
  return {
    npc: KHAT_NHI,
    name: KHAT_NHI_NAME,
    start: 'chao',
    lines: [
      { id: 'chao', text: almsGreeting(state, alms.count), choices: first },
      { id: 'khong-cho', text: ALMS_DECLINED, choices: [BYE] },
      { id: 'thieu', text: ALMS_SHORT_REPLY, choices: [BYE] },
      { id: 'nhac-tin', text: almsRepeat(today), choices: [BYE] },
    ],
  };
}
