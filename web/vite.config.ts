import { existsSync, realpathSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { DEFAULT_SCENE } from './src/scene/spec';

/** Bản build Canvas 3D kèm `scene.default.json` = cảnh mặc định trong code, để phiên thiết kế khởi tạo / so sánh. */
function emitDefaultScene(): Plugin {
  return {
    name: 'emit-default-scene',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'scene.default.json', source: `${JSON.stringify(DEFAULT_SCENE, null, 2)}\n` });
    },
  };
}

/**
 * Thư mục gói npm THẬT mà `from` dùng (đi ngược lên như Node, theo nối về đích). Worktree (`tool/viec.dart chuan-bi`):
 * gói nằm ở `.claude/worktrees/node_modules` → nối tới `web/node_modules` của thư mục chính — ngoài `web/` của worktree,
 * Vite dev chặn ("outside of Vite serving allow list") → font @fontsource không nạp, canvas vẽ bằng Georgia, chữ Việt
 * tách dấu "Ngô`i ôn" (L-12). Thêm các thư mục này vào `server.fs.allow`.
 */
export function npmDirs(from: URL): string[] {
  const out: string[] = [];
  for (let d = from; ; ) {
    const nm = new URL('node_modules', d);
    if (existsSync(nm)) out.push(realpathSync(nm));
    const up = new URL('../', d);
    if (up.href === d.href) return out;
    d = up;
  }
}

// base './' → mọi đường dẫn trong bản build là tương đối, để Flutter phục vụ
// từ bất kỳ thư mục nào (http://localhost:<port>/assets/scene/index.html).
// `--mode design` → Canvas 3D (design.html) ra dist-design/, không chép sang app.
export default defineConfig(({ mode }) => {
  const design = mode === 'design';
  return {
    base: './',
    // design/scene/scene.json nằm ngoài web/ (decisions/0002); đường dẫn tính từ web/
    // + gói npm thật (worktree nối ra ngoài web/ — L-12)
    server: { fs: { allow: ['.', '../design', ...npmDirs(new URL('./', import.meta.url))] } },
    plugins: design ? [emitDefaultScene()] : [],
    build: {
      outDir: design ? 'dist-design' : 'dist',
      emptyOutDir: true,
      // Android WebView (Chromium) và iOS WKWebView từ iOS 14 trở lên.
      target: ['es2020', 'chrome87', 'safari14'],
      // không nhúng tài sản vào mã; riêng Canvas 3D nhúng model nhỏ (< 16 KB — luống chè V-46): artifact không phục vụ .glb
      assetsInlineLimit: design ? (file: string, content: { length: number }) => file.endsWith('.glb') && content.length < 16_384 : 0,
      chunkSizeWarningLimit: 1000,
      // Canvas 3D + Catalog kiến trúc (catalog.html — bộ asset chuẩn) cùng ra dist-design/
      rollupOptions: { input: design ? { design: 'design.html', catalog: 'catalog.html' } : 'index.html' },
    },
  };
});
