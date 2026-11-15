// Hình minh hoạ (thiết kế 2026-11-16.2 — phiếu 2026-11-15-hinh-minh-hoa, V-72): design/icons/hinh.json + xuat/*.webp
// → kiểm ngân sách (scripts/hinh-kiem.mjs) → chép vào web/public/hinh/ (Vite chép nguyên tên vào dist/hinh/, copy-to-app
// đưa sang app/assets/scene/hinh/ — web và Flutter dùng chung một bản ảnh) → sinh web/src/ui/hinh.g.ts và
// app/lib/theme/app_hinh.g.dart. Chỉ đọc / chép file, không gói npm mới, không mạng (app chạy offline).
// Chạy trong `npm run dev` / `build` / `build:design` (sau subset-han) hoặc `npm run hinh`.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kiemHinh, tenDart, TONG_TOI_DA } from './hinh-kiem.mjs';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const ICONS = join(WEB, '../design/icons');
const XUAT = join(ICONS, 'xuat');
const OUT = join(WEB, 'public/hinh');
const TS = join(WEB, 'src/ui/hinh.g.ts');
const DART = join(WEB, '../app/lib/theme/app_hinh.g.dart');

const bang = JSON.parse(readFileSync(join(ICONS, 'hinh.json'), 'utf8'));
const files = new Map();
if (existsSync(XUAT)) for (const ten of readdirSync(XUAT)) if (ten.endsWith('.webp')) files.set(ten, readFileSync(join(XUAT, ten)));

const { loi, canh, chep, tong } = kiemHinh(bang, files);
for (const c of canh) console.warn(`hinh: ${c}`);
if (loi.length) {
  console.error(`hinh: bảng hình minh hoạ lỗi (design/icons/):\n- ${loi.join('\n- ')}`);
  process.exit(1);
}

/** Ghi khi khác (giữ giờ sửa — Vite / Flutter không nạp lại vô cớ). */
function ghi(file, data) {
  if (existsSync(file) && readFileSync(file).equals(Buffer.from(data))) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

mkdirSync(OUT, { recursive: true });
const giu = new Set(chep.map((c) => c.ten));
for (const ten of readdirSync(OUT)) if (!giu.has(ten)) rmSync(join(OUT, ten), { force: true });
for (const c of chep) ghi(join(OUT, c.ten), files.get(c.ten));

const hinh = bang.hinh;
const dot = new Map();
for (const m of hinh) dot.set(m.dot, [...(dot.get(m.dot) ?? []), m.ma]);
const dots = [...dot.keys()].sort((a, b) => a - b);

const ts = `// Sinh bởi web/scripts/hinh.mjs từ design/icons/hinh.json — không sửa tay (\`npm run hinh\`).
// Ảnh ở public/hinh/ (đường dẫn tương đối — chạy được trong WebView localhost và trình duyệt).

/** Mã hình → cỡ có sẵn (cỡ đầu = \`<mã>.webp\`, cỡ khác \`<mã>@<cỡ>.webp\`) và đợt vẽ. */
export const HINH = {
${hinh.map((m) => `  '${m.ma}': { co: [${m.co.join(', ')}], dot: ${m.dot} },`).join('\n')}
} as const;

export type HinhId = keyof typeof HINH;

/** Mã theo đợt (đợt 1 nạp sẵn trong màn tải). */
export const HINH_DOT: Readonly<Record<number, readonly HinhId[]>> = {
${dots.map((d) => `  ${d}: [${dot.get(d).map((ma) => `'${ma}'`).join(', ')}],`).join('\n')}
};

/** Đường dẫn ảnh; \`co\` không có sẵn → cỡ gần nhất lớn hơn (hoặc lớn nhất). */
export function hinhUrl(id: HinhId, co?: number): string {
  const sizes: readonly number[] = HINH[id].co;
  const pick = co === undefined ? sizes[0] : (sizes.filter((s) => s >= co).sort((a, b) => a - b)[0] ?? Math.max(...sizes));
  return pick === sizes[0] ? \`./hinh/\${id}.webp\` : \`./hinh/\${id}@\${pick}.webp\`;
}
`;
ghi(TS, ts);

const dart = `// Sinh bởi web/scripts/hinh.mjs từ design/icons/hinh.json — không sửa tay (\`cd web && npm run hinh\`).
// Ảnh dùng chung với scene web: \`npm run build\` chép vào app/assets/scene/hinh/.

/// Đường dẫn asset hình minh hoạ (WebP alpha, cỡ ${hinh[0].co[0]}). Dùng qua widget \`Hinh\` (app/lib/theme/hinh.dart).
abstract final class AppHinh {
  static const dir = 'assets/scene/hinh';
${hinh.map((m) => `  /// ${String(m.mo_ta ?? '').split(' — ')[0]} (đợt ${m.dot})\n  static const ${tenDart(m.ma)} = '$dir/${m.ma}.webp';`).join('\n')}
}
`.replace(/\$dir/g, 'assets/scene/hinh');
ghi(DART, dart);

console.log(`hinh: ${chep.length} file, ${(tong / 1024).toFixed(1)} KB / ${TONG_TOI_DA / 1024} KB → public/hinh/, hinh.g.ts, app_hinh.g.dart`);
