// Kiểm dữ liệu từ vựng (R-TU-4): `npm run tu:check` (chạy trong `npm run build`; lỗi → thoát 1).
// `npm run tu:am-list` (= `--am-list [--ra <file.tsv>]`): danh sách văn bản cần đọc cho file âm (R-AM-5) — mỗi dòng
// `<loại>\t<tên tệp>\t<chữ>\t<pinyin>` (loại `tu` / `cau`), để chạy TTS ở gđ 2 (kế hoạch V-80).
// Logic ở `web/src/zones/tuVung/kiem.ts` (có test vitest); script chỉ nạp bằng esbuild rồi in.
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = await build({
  stdin: {
    contents:
      "export { kiemTuVung } from './src/zones/tuVung/kiem.ts';\n" +
      "export { TU_VUNG } from './src/zones/tuVung/tu.ts';\n" +
      "export { tenTepAm } from './src/zones/tuVung/am.ts';\n",
    resolveDir: web,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const args = process.argv.slice(2);

if (args.includes('--am-list')) {
  const rows = [];
  for (const t of mod.TU_VUNG) {
    rows.push(['tu', `${mod.tenTepAm(t.id)}.mp3`, t.han.replace('…', ''), t.pinyin].join('\t'));
    rows.push(['cau', `${mod.tenTepAm(t.id)}.mp3`, t.example.han, t.example.pinyin].join('\t'));
  }
  const ra = args[args.indexOf('--ra') + 1];
  if (args.includes('--ra') && ra) {
    writeFileSync(ra, rows.join('\n') + '\n', 'utf8');
    console.log(`Đã ghi ${rows.length} dòng (${mod.TU_VUNG.length} từ + câu ví dụ) → ${ra}`);
  } else {
    console.log(rows.join('\n'));
  }
  process.exit(0);
}

const r = mod.kiemTuVung();
const verbose = args.includes('-v');
if (verbose) for (const c of r.canhBao) console.log(`  cảnh báo: ${c}`);
console.log(
  `Từ vựng: ${mod.TU_VUNG.length} từ · ${r.canhBao.length} cảnh báo đa âm${verbose ? '' : ' (-v để xem)'} · ${r.thieuAm} từ chưa có âm (R-AM-5)`,
);
if (r.loi.length) {
  for (const l of r.loi) console.error(`  LỖI: ${l}`);
  console.error(`tu:check: ${r.loi.length} lỗi — sửa web/src/zones/sach/hsk*.ts hoặc web/src/zones/tuVung/bai.ts`);
  process.exit(1);
}
