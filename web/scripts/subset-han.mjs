// Cắt font chữ Hán Noto Serif SC 700 chỉ còn các chữ app dùng → web/src/fonts/ (file sinh tự động, không sửa tay).
// Chữ quét từ web/src/**/*.ts, web/*.html, design/scene/*.json. Nguồn: @fontsource/noto-serif-sc (devDependency,
// 102 file chia theo unicode-range) → mỗi file có chữ cần thì cắt còn đúng các chữ đó (vài KB), sinh han.css.
// Chạy trước dev / build (package.json). Thiếu chữ trong font → báo lỗi, thoát 1.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Thư mục `node_modules/<rel>` gần nhất đi lên từ web/ — worktree dùng chung gói npm ở thư mục cha (tool/viec.dart). */
function nodeModule(rel) {
  for (let d = WEB; ; d = dirname(d)) {
    const p = join(d, 'node_modules', rel);
    if (existsSync(p)) return p;
    if (dirname(d) === d) return join(WEB, 'node_modules', rel);
  }
}
const SRC_DIR = nodeModule('@fontsource/noto-serif-sc');
const OUT_DIR = join(WEB, 'src/fonts');
const FAMILY = 'Han Serif';
const HAN = /\p{Script=Han}/gu;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (p !== OUT_DIR) walk(p, out);
    } else if (name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const sources = [
  ...walk(join(WEB, 'src')),
  ...readdirSync(WEB).filter((n) => n.endsWith('.html')).map((n) => join(WEB, n)),
].filter(existsSync);
// mọi đặc tả cảnh: tông môn + từng vùng (tên vùng, tên khu trên màn tải / chip)
const SCENE_DIR = join(WEB, '../design/scene');
if (existsSync(SCENE_DIR)) sources.push(...readdirSync(SCENE_DIR).filter((n) => n.endsWith('.json')).map((n) => join(SCENE_DIR, n)));
// bản đồ truyền tống: chữ Hán tên các nơi (thẻ yêu cầu HUD)
const MAP_JSON = join(SCENE_DIR, 'ban-do', 'ban-do.json');
if (existsSync(MAP_JSON)) sources.push(MAP_JSON);
const chars = new Set();
for (const f of sources) for (const m of readFileSync(f, 'utf8').matchAll(HAN)) chars.add(m[0]);

// @font-face của gói: file + unicode-range
const faces = [...readFileSync(join(SRC_DIR, '700.css'), 'utf8').matchAll(/url\(\.\/files\/([^)]+?\.woff2)\)[^;]*;\s*unicode-range:\s*([^;]+);/g)].map(
  ([, file, range]) => ({
    file,
    ranges: range.split(',').map((r) => {
      const [a, b] = r.trim().replace(/^U\+/i, '').split('-');
      return [parseInt(a, 16), parseInt(b ?? a, 16)];
    }),
  }),
);

const groups = new Map(); // file → chữ
const missing = [];
for (const ch of [...chars].sort()) {
  const cp = ch.codePointAt(0);
  const face = faces.find((f) => f.ranges.some(([a, b]) => cp >= a && cp <= b));
  if (!face) missing.push(ch);
  else groups.set(face.file, (groups.get(face.file) ?? '') + ch);
}
if (missing.length) {
  console.error(`subset-han: Noto Serif SC không có chữ: ${missing.join(' ')}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const keep = new Set(['han.css']);
const css = ['/* Sinh bởi web/scripts/subset-han.mjs — không sửa tay. Noto Serif SC 700 (SIL OFL 1.1), chỉ các chữ app dùng. */'];
let bytes = 0;
for (const [file, text] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
  const out = `han-${file.match(/-(\d+)-700/)[1]}.woff2`;
  const buf = await subsetFont(readFileSync(join(SRC_DIR, 'files', file)), text, { targetFormat: 'woff2' });
  const dest = join(OUT_DIR, out);
  if (!existsSync(dest) || !readFileSync(dest).equals(buf)) writeFileSync(dest, buf);
  keep.add(out);
  bytes += buf.length;
  const range = [...text].map((c) => `U+${c.codePointAt(0).toString(16)}`).join(',');
  css.push(
    `@font-face{font-family:'${FAMILY}';font-style:normal;font-weight:700;font-display:swap;src:url(./${out}) format('woff2');unicode-range:${range}}`,
  );
}
for (const name of readdirSync(OUT_DIR)) if (!keep.has(name)) rmSync(join(OUT_DIR, name));
const cssText = `${css.join('\n')}\n`;
const cssPath = join(OUT_DIR, 'han.css');
if (!existsSync(cssPath) || readFileSync(cssPath, 'utf8') !== cssText) writeFileSync(cssPath, cssText);
console.log(`subset-han: ${chars.size} chữ, ${groups.size} file, ${(bytes / 1024).toFixed(1)} KB → ${relative(WEB, OUT_DIR)}/`);
