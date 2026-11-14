/**
 * Tiểu Khất xin tiền (R-NPC-6, R-TIEN-8): trạng thái thoại theo ví + bản ghi đã cho, câu chào theo số lần đã cho, câu cảm ơn
 * kèm tin đồn của ngày. Luật trừ tiền ở `walletRules.ts` (`giveAlms`; Dart `giveAlms` là nguồn thật khi có Flutter).
 * Thuần (không DOM, không three).
 */
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

/** Câu chào đầu của Tiểu Khất theo trạng thái + số lần đã cho. */
export function almsGreeting(state: AlmsState, count: number): string {
  if (state === 'da-cho') return 'Hôm nay đạo hữu cho rồi, mai ghé nhé! Tiểu khất ngồi đây cả ngày mà.';
  const ask = 'cho tiểu khất xin vài văn mua bánh, được không ạ?';
  const loyal = count >= ALMS_LOYAL ? ' Tiểu khất nhớ ơn đạo hữu mãi.' : '';
  if (count >= ALMS_FRIEND) return `Ân nhân lại tới!${loyal} Hôm nay ân nhân ${ask}`;
  return `Đạo hữu ơi, ${ask}`;
}

/** Câu sau khi cho được: cảm ơn + tin đồn của ngày (R-NPC-6). */
export function almsThanks(today: number): string {
  return `Đa tạ đạo hữu! ${tinDonCuaNgay(today).text}`;
}

/** "Nhắc lại tin hôm nay" (đã cho hôm nay). */
export function almsRepeat(today: number): string {
  return `Tin hôm nay đây: ${tinDonCuaNgay(today).text}`;
}

/** Không cho: câu vui vẻ, không có tin. */
export const ALMS_DECLINED = 'Không sao, không sao! Mai đạo hữu có tiền lẻ thì nhớ tới tiểu khất nhé.';

/** Lựa chọn thay "Cho 5 văn" khi ví dưới 5 (R-TIEN-8). */
export function almsShortChoice(balance: number): string {
  return `Ta chỉ còn ${balance} văn…`;
}

/** Tiểu Khất trả lời khi người chơi chỉ còn ít tiền. */
export const ALMS_SHORT_REPLY = 'Ôi, đạo hữu cũng khó khăn à? Giữ lại mà mua bánh. Đi học chữ kiếm thêm văn nhé!';
