// Font cho phần Flutter (màn bài học native) → app/assets/fonts/ (file sinh tự động, không sửa tay).
// Vì sao cần: Flutter chỉ đọc .ttf / .otf, còn gói @fontsource chỉ có .woff / .woff2 chia theo bảng chữ. Script đổi
// từng phần sang .ttf bằng subset-font (đã ghim) — không tải gì từ mạng, app chạy offline.
// Mỗi phần (latin, latin mở rộng, tiếng Việt; chữ Hán: các file chứa chữ app dùng) thành một "họ" font Flutter;
// app/lib/theme/app_fonts.g.dart liệt kê họ chính + họ dự phòng (Flutter tìm chữ thiếu ở họ dự phòng),
// app/pubspec.yaml nhận khối fonts giữa hai dòng đánh dấu.
// Chạy trong `npm run build` (sau copy-to-app) hoặc `npm run fonts:app`.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(WEB, '../app');
const OUT = join(APP, 'assets/fonts');
const FS = join(WEB, 'node_modules/@fontsource');

/** unicode-range của một file font trong `<độ đậm>.css` của gói → chuỗi mọi ký tự trong khoảng (giữ nguyên cả phần). */
function rangeText(cssFile, fontFile) {
  const css = readFileSync(cssFile, 'utf8');
  const at = css.indexOf(`files/${fontFile}`);
  const m = at < 0 ? null : css.slice(at).match(/unicode-range:\s*([^;]+);/);
  if (!m) throw new Error(`fonts-app: không thấy unicode-range của ${fontFile} trong ${cssFile}`);
  let s = '';
  for (const r of m[1].split(',')) {
    const [a, b] = r.trim().replace(/^U\+/i, '').split('-');
    const lo = parseInt(a, 16);
    const hi = parseInt(b ?? a, 16);
    for (let c = lo; c <= Math.min(hi, lo + 4000); c++) s += String.fromCodePoint(c);
  }
  return s;
}

const SUBSETS = [
  ['latin', ''],
  ['latin-ext', 'Ext'],
  ['vietnamese', 'Vi'],
];

/** họ Flutter → [{ asset, weight }] */
const families = new Map();
const keep = new Set();
async function emit(family, weight, src, text, outName) {
  const buf = await subsetFont(readFileSync(src), text, { targetFormat: 'truetype' });
  const dest = join(OUT, outName);
  if (!existsSync(dest) || !readFileSync(dest).equals(buf)) writeFileSync(dest, buf);
  keep.add(outName);
  if (!families.has(family)) families.set(family, []);
  families.get(family).push({ asset: `assets/fonts/${outName}`, weight });
}

mkdirSync(OUT, { recursive: true });

// chữ giao diện (Be Vietnam Pro 500 / 700) + chữ trang trí (Lora 700, pinyin)
const LATIN = [
  { pkg: 'be-vietnam-pro', family: 'BeVietnamPro', weights: [500, 700] },
  { pkg: 'lora', family: 'Lora', weights: [700] },
];
for (const f of LATIN) {
  for (const [sub, suffix] of SUBSETS) {
    for (const w of f.weights) {
      const file = `${f.pkg}-${sub}-${w}-normal.woff2`;
      const text = rangeText(join(FS, f.pkg, `${w}.css`), file);
      await emit(f.family + suffix, w, join(FS, f.pkg, 'files', file), text, `${f.pkg}-${sub}-${w}.ttf`);
    }
  }
}

// chữ Hán (Noto Serif SC 700): chỉ các chữ trong nội dung bài (web/src/zones/) + code Flutter
const HAN = /\p{Script=Han}/gu;
const walk = (dir, ext, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (n.endsWith(ext)) out.push(p);
  }
  return out;
};
const chars = new Set();
for (const f of [...walk(join(WEB, 'src/zones'), '.ts'), ...walk(join(APP, 'lib'), '.dart')]) {
  for (const m of readFileSync(f, 'utf8').matchAll(HAN)) chars.add(m[0]);
}
const NOTO = join(FS, 'noto-serif-sc');
const faces = [...readFileSync(join(NOTO, '700.css'), 'utf8').matchAll(/url\(\.\/files\/([^)]+?\.woff2)\)[^;]*;\s*unicode-range:\s*([^;]+);/g)].map(
  ([, file, range]) => ({
    file,
    ranges: range.split(',').map((r) => {
      const [a, b] = r.trim().replace(/^U\+/i, '').split('-');
      return [parseInt(a, 16), parseInt(b ?? a, 16)];
    }),
  }),
);
/** chữ → file Noto Serif SC chứa nó, mỗi file thành một họ `<prefix><số>`. */
async function notoFamilies(text, prefix, outPrefix) {
  const groups = new Map();
  for (const ch of [...new Set(text)].sort()) {
    const cp = ch.codePointAt(0);
    const face = faces.find((f) => f.ranges.some(([a, b]) => cp >= a && cp <= b));
    if (!face) {
      console.error(`fonts-app: Noto Serif SC không có chữ ${ch}`);
      process.exit(1);
    }
    groups.set(face.file, (groups.get(face.file) ?? '') + ch);
  }
  const names = [];
  for (const [file, t] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    // tên phần trong tên file: noto-serif-sc-<phần>-700-normal.woff2 (số, hoặc latin / latin-ext…)
    const n = file.replace(/^noto-serif-sc-|-700-normal\.woff2$/g, '').replace(/[^a-z0-9]/gi, '');
    names.push(prefix + n);
    await emit(prefix + n, 700, join(NOTO, 'files', file), t, `${outPrefix}-${n}.ttf`);
  }
  return names;
}
const hanFamilies = await notoFamilies([...chars].join(''), 'HanSerif', 'han');
// Be Vietnam Pro và Lora thiếu nguyên âm pinyin dấu mũ ngược (ǎ ǐ ǒ ǔ ǚ…) → lấy từ Noto Serif SC (font Trung có đủ pinyin)
const PINYIN = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛÜ';
const pinyinFamilies = await notoFamilies(PINYIN, 'Pinyin', 'pinyin');

for (const name of readdirSync(OUT)) if (!keep.has(name)) rmSync(join(OUT, name));

// app/lib/theme/app_fonts.g.dart
const list = (xs) => `[${xs.map((x) => `'${x}'`).join(', ')}]`;
const dart = `// Sinh bởi web/scripts/fonts-app.mjs — không sửa tay.
// Font đóng gói từ @fontsource (SIL OFL 1.1), đổi sang .ttf; mỗi bảng chữ một họ, chữ thiếu tìm ở họ dự phòng.

/// Họ font của app (token \`font.*\` trong design/tokens/design_tokens.json).
abstract final class AppFonts {
  /// Chữ Hán (Noto Serif SC 700) — chỉ các chữ có trong nội dung bài và code Flutter.
  static const han = ${list(hanFamilies)};

  /// Chữ giao diện (Be Vietnam Pro 500 / 700).
  static const ui = 'BeVietnamPro';
  static const uiFallback = ${list(['BeVietnamProVi', 'BeVietnamProExt', ...pinyinFamilies, ...hanFamilies])};

  /// Chữ trang trí, pinyin (Lora 700). Nguyên âm pinyin Lora thiếu → Noto Serif SC (\`Pinyin*\`).
  static const display = 'Lora';
  static const displayFallback = ${list(['LoraExt', 'LoraVi', ...pinyinFamilies])};
}
`;
const dartPath = join(APP, 'lib/theme/app_fonts.g.dart');
if (!existsSync(dartPath) || readFileSync(dartPath, 'utf8') !== dart) writeFileSync(dartPath, dart);

// khối fonts trong app/pubspec.yaml
const BEGIN = '  # >>> fonts (sinh bởi web/scripts/fonts-app.mjs — không sửa tay)';
const END = '  # <<< fonts';
const block = [BEGIN, '  fonts:'];
for (const [family, assets] of families) {
  block.push(`    - family: ${family}`, '      fonts:');
  for (const a of assets) block.push(`        - asset: ${a.asset}`, `          weight: ${a.weight}`);
}
block.push(END);
const pubPath = join(APP, 'pubspec.yaml');
let pub = readFileSync(pubPath, 'utf8').replace(/\r\n/g, '\n');
const re = new RegExp(`${BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END}\\n`);
const blockText = `${block.join('\n')}\n`;
pub = re.test(pub) ? pub.replace(re, blockText) : pub.replace(/^flutter:\n/m, `flutter:\n${blockText}`);
if (readFileSync(pubPath, 'utf8').replace(/\r\n/g, '\n') !== pub) writeFileSync(pubPath, pub);

console.log(`fonts-app: ${families.size} họ, ${keep.size} file .ttf (${chars.size} chữ Hán) → app/assets/fonts/`);
