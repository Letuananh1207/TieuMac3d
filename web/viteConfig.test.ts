import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import config from './vite.config';

// L-12: chữ Việt vẽ lên canvas (tiêu đề "Ngồi ôn" trên cuộn sách) tách dấu "Ngô`i ôn" khi chạy `npm run dev` trong
// worktree — gói npm nối ra ngoài web/ (tool/viec.dart chuan-bi), Vite dev chặn file font @fontsource, canvas vẽ bằng
// Georgia (thiếu "ồ" dựng sẵn). Font phải nằm trong `server.fs.allow`.
const WEB = dirname(fileURLToPath(import.meta.url));
const inside = (file: string, dir: string): boolean => {
  const r = relative(resolve(WEB, dir), file);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
};

describe('Vite dev phục vụ được font chữ Việt (L-12)', () => {
  it('(L-12): file font Lora / Be Vietnam Pro (đường dẫn thật, như Vite tìm) nằm trong server.fs.allow', () => {
    const cfg = typeof config === 'function' ? config({ command: 'serve', mode: 'development' }) : config;
    const allow = (cfg as { server?: { fs?: { allow?: string[] } } }).server?.fs?.allow ?? [];
    const req = createRequire(import.meta.url);
    for (const css of ['@fontsource/lora/vietnamese-700.css', '@fontsource/be-vietnam-pro/vietnamese-700.css']) {
      const font = realpathSync(resolve(dirname(req.resolve(css)), 'files', css.split('/')[1] + '-' + css.split('/')[2].replace('.css', '-normal.woff2')));
      expect(allow.some((d) => inside(font, d)), font).toBe(true);
    }
  });
});
