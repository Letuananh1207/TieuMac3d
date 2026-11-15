// Sinh bởi web/scripts/hinh.mjs từ design/icons/hinh.json — không sửa tay (`npm run hinh`).
// Ảnh ở public/hinh/ (đường dẫn tương đối — chạy được trong WebView localhost và trình duyệt).

/** Mã hình → cỡ có sẵn (cỡ đầu = `<mã>.webp`, cỡ khác `<mã>@<cỡ>.webp`) và đợt vẽ. */
export const HINH = {
  'ban-do': { co: [160], dot: 1 },
  've-nha': { co: [160], dot: 1 },
  'bieu-cam': { co: [160], dot: 1 },
  'tui-do': { co: [160], dot: 1 },
  'nhiem-vu': { co: [160], dot: 1 },
  'nhay': { co: [160], dot: 1 },
  'nhay-nut': { co: [160], dot: 1 },
  'chao': { co: [160], dot: 1 },
  'chao-nut': { co: [160], dot: 1 },
  'ngoi-on': { co: [160], dot: 1 },
  'ngoi-on-nut': { co: [160], dot: 1 },
  'tro-chuyen': { co: [160], dot: 1 },
  'trang-tri': { co: [160], dot: 1 },
  'doc-sach': { co: [160], dot: 1 },
  'doc-sach-nut': { co: [160], dot: 1 },
} as const;

export type HinhId = keyof typeof HINH;

/** Mã theo đợt (đợt 1 nạp sẵn trong màn tải). */
export const HINH_DOT: Readonly<Record<number, readonly HinhId[]>> = {
  1: ['ban-do', 've-nha', 'bieu-cam', 'tui-do', 'nhiem-vu', 'nhay', 'nhay-nut', 'chao', 'chao-nut', 'ngoi-on', 'ngoi-on-nut', 'tro-chuyen', 'trang-tri', 'doc-sach', 'doc-sach-nut'],
};

/** Đường dẫn ảnh; `co` không có sẵn → cỡ gần nhất lớn hơn (hoặc lớn nhất). */
export function hinhUrl(id: HinhId, co?: number): string {
  const sizes: readonly number[] = HINH[id].co;
  const pick = co === undefined ? sizes[0] : (sizes.filter((s) => s >= co).sort((a, b) => a - b)[0] ?? Math.max(...sizes));
  return pick === sizes[0] ? `./hinh/${id}.webp` : `./hinh/${id}@${pick}.webp`;
}
