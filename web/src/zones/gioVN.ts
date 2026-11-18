/**
 * Đồng hồ chung giờ Việt Nam (GMT+7) cho lớp `zones/` — tính từ mốc UTC (`Date.now()`), **không** đọc múi giờ của máy: máy
 * đặt múi giờ nào cũng ra cùng giờ, cùng ngày (R-TIEN-8, R-NPC-7, R-NPC-8). Kèm canh giờ / canh đêm, câu rao của Lão Canh,
 * số tiếng mõ. Thuần (không three, không DOM).
 *
 * Giờ thập phân (`gioVN`) dùng bản của ngày đêm V-27: `scene/ngayDem.ts` — không viết lại ở đây. File này chỉ thêm phần
 * ngày đêm chưa có (giây trong ngày, mã ngày, canh giờ); `zones/` không import được `scene/` nên tự tính từ cùng công thức.
 */

const VN_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;

/** Giây VN tính từ 0 giờ hôm nay (0 … 86 399,999…). */
export function giayTrongNgayVN(nowMs: number): number {
  const ms = (((nowMs + VN_OFFSET_MS) % DAY_MS) + DAY_MS) % DAY_MS;
  return ms / 1000;
}

/** Mã ngày VN: số ngày từ 1970-01-01 theo lịch GMT+7 (ngày mới lúc 0 giờ VN — R-TIEN-8). */
export function maNgayVN(nowMs: number): number {
  return Math.floor((nowMs + VN_OFFSET_MS) / DAY_MS);
}

/** Mười hai canh giờ (地支), giờ Tý bắt đầu 23 giờ. */
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;
const CANH = ['một', 'hai', 'ba', 'tư', 'năm'] as const;

/** Tên canh giờ của giờ nguyên `h` (0…23): 23, 0 → Tý; 1, 2 → Sửu; … 11, 12 → Ngọ. */
export function canhGio(h: number): string {
  return CHI[Math.floor((((h + 1) % 24) + 24) % 24 / 2)];
}

/** Canh đêm 1…5 (19 giờ → canh một … 3 giờ → canh năm), ban ngày (5 giờ – 19 giờ) → 0 (R-NPC-8). */
export function canhDem(h: number): number {
  const g = ((h % 24) + 24) % 24;
  if (g >= 5 && g < 19) return 0;
  return Math.floor((((g - 19) % 24) + 24) % 24 / 2) + 1;
}

/** Số tiếng mõ lúc đầu giờ `h`: đêm = số canh, ngày = 3 (R-NPC-8). */
export function soTiengMo(h: number): number {
  return canhDem(h) || 3;
}

/** Giờ hiện đại kiểu nói: 0 → "12 giờ đêm", 7 → "7 giờ sáng", 12 → "12 giờ trưa", 15 → "3 giờ chiều", 23 → "11 giờ đêm". */
export function gioNoi(h: number): string {
  const g = ((h % 24) + 24) % 24;
  if (g === 0) return '12 giờ đêm';
  if (g < 11) return `${g} giờ sáng`;
  if (g < 13) return `${g} giờ trưa`;
  if (g < 18) return `${g - 12} giờ chiều`;
  if (g < 22) return `${g - 12} giờ tối`;
  return `${g - 12} giờ đêm`;
}

/** Câu theo buổi của giờ `h` (sau dấu gạch ngang trong câu rao). */
function cauBuoi(h: number): string {
  if (h >= 19 || h < 5) return 'Trời hanh vật khô, cẩn thận đèn đuốc!';
  if (h < 7) return 'Gà gáy rồi, dậy thôi các vị!';
  if (h < 11) return 'Trời sáng rồi, ai học chữ thì học đi thôi!';
  if (h < 14) return 'Nắng đứng bóng, nghỉ tay uống chén trà.';
  if (h < 17) return 'Xế chiều rồi, ôn lại chữ cũ kẻo quên.';
  return 'Chiều tà, ai về nhà thì về kẻo tối.';
}

/** Đầu giờ / chính giờ theo giờ lẻ / chẵn, kèm giờ hiện đại: "đầu giờ Thìn (7 giờ sáng)". */
export function tenGio(h: number): string {
  const g = ((h % 24) + 24) % 24;
  return `${g % 2 === 1 ? 'đầu' : 'chính'} giờ ${canhGio(g)} (${gioNoi(g)})`;
}

const hoaDau = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Câu rao đầu giờ `h` (R-NPC-8): "Canh ba, đầu giờ Tý (11 giờ đêm) — Trời hanh vật khô, cẩn thận đèn đuốc!". */
export function cauRao(h: number): string {
  const g = ((h % 24) + 24) % 24;
  const canh = canhDem(g);
  const dau = canh ? `Canh ${CANH[canh - 1]}, ${tenGio(g)}` : hoaDau(tenGio(g));
  return `${dau} — ${cauBuoi(g)}`;
}

/**
 * Câu rao tách hai dòng cho kênh chung (mỗi tin ≤ 60 ký tự — R-CHAT-1): [tên giờ, câu theo buổi]. Ghép lại bằng " — " ra
 * đúng `cauRao`.
 */
export function cauRaoHaiDong(h: number): [string, string] {
  const [a, b] = cauRao(h).split(' — ');
  return [a, b];
}

/** Trả lời "Bây giờ là giờ gì?" (R-NPC-7): giờ phút hiện tại + canh giờ đang ở. */
export function cauHoiGio(nowMs: number): string {
  const sec = giayTrongNgayVN(nowMs);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const canh = canhDem(h);
  const dem = canh ? `, canh ${CANH[canh - 1]}` : '';
  const phut = m ? ` ${m} phút` : '';
  return `Bây giờ là giờ ${canhGio(h)}${dem} — ${gioNoi(h).replace(' giờ', ` giờ${phut}`)} đó cháu.`;
}

/**
 * Ép giờ thử (Canvas 3D `?gio=…`, chỉ để xem): "08:59:50", "8:59" hoặc số giờ thập phân "21.5" (như `?gio` của V-27) →
 * độ lệch ms cộng vào `Date.now()` sao cho đồng hồ VN bắt đầu từ giờ đó (rồi chạy đúng tốc độ thật). Sai dạng → `null`.
 */
export function lechGioThu(value: string | null, nowMs: number): number | null {
  if (!value) return null;
  let sec: number;
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (m) sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0);
  else {
    const h = Number(value);
    if (!Number.isFinite(h)) return null;
    sec = h * 3600;
  }
  if (!(sec >= 0 && sec < 86_400)) return null;
  return (sec - giayTrongNgayVN(nowMs)) * 1000;
}
