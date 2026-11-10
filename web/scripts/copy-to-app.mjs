// Chép web/dist → app/assets/scene/ sau khi build (xoá bản cũ, giữ .gitkeep).
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist');
const dest = resolve(root, '..', 'app', 'assets', 'scene');

if (!existsSync(src)) {
  console.error('Không thấy web/dist — chạy vite build trước.');
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
for (const name of readdirSync(dest)) {
  if (name !== '.gitkeep') rmSync(join(dest, name), { recursive: true, force: true });
}
cpSync(src, dest, { recursive: true });
console.log(`Đã chép bản build vào ${dest}`);
