// Tổng hợp tiếng mõ gỗ → web/src/nhac/mo.wav (R-AM-1). Tự tạo bằng toán, không lấy mẫu của ai → CC0 (xem nhac/LICENSES.md).
// Tiếng gỗ rỗng: sóng chính ~900 Hz + bội 2,7 lần (vật rắn không có bội nguyên), tắt nhanh; thêm tiếng "tách" ngắn lúc dùi
// chạm (nhiễu lọc, hạt giống cố định → chạy lại ra đúng file cũ). Đổi tiếng: sửa tham số dưới rồi `node scripts/mo-wav.mjs`.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const SECONDS = 0.28;
const F0 = 900; // Hz — tiếng chính
const PARTIALS = [
  // [hệ số tần số, biên độ, thời gian tắt (s)]
  [1, 1, 0.055],
  [2.7, 0.45, 0.022],
  [4.9, 0.15, 0.012],
];
const CLICK_MS = 4;
const CLICK_GAIN = 0.35;
const PEAK = 0.8;

const n = Math.round(RATE * SECONDS);
const out = new Float32Array(n);
let seed = 20261114;
const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1;
let lp = 0;
for (let i = 0; i < n; i++) {
  const t = i / RATE;
  const attack = Math.min(1, t / 0.0015); // 1,5 ms lên — khỏi tiếng bụp
  let v = 0;
  for (const [k, a, tau] of PARTIALS) v += a * Math.sin(2 * Math.PI * F0 * k * t) * Math.exp(-t / tau);
  if (t < CLICK_MS / 1000) {
    lp += 0.5 * (rand() - lp); // lọc thông thấp đơn giản
    v += CLICK_GAIN * lp * (1 - t / (CLICK_MS / 1000));
  }
  out[i] = v * attack;
}
const max = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
const pcm = Buffer.alloc(44 + n * 2);
pcm.write('RIFF', 0);
pcm.writeUInt32LE(36 + n * 2, 4);
pcm.write('WAVE', 8);
pcm.write('fmt ', 12);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20); // PCM
pcm.writeUInt16LE(1, 22); // mono
pcm.writeUInt32LE(RATE, 24);
pcm.writeUInt32LE(RATE * 2, 28);
pcm.writeUInt16LE(2, 32);
pcm.writeUInt16LE(16, 34);
pcm.write('data', 36);
pcm.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.round((out[i] / max) * PEAK * 32767), 44 + i * 2);
const file = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'nhac', 'mo.wav');
writeFileSync(file, pcm);
console.log(`mo.wav: ${n} mẫu, ${RATE} Hz, ${(pcm.length / 1024).toFixed(1)} KB → ${file}`);
