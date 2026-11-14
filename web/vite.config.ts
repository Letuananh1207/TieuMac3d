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

// base './' → mọi đường dẫn trong bản build là tương đối, để Flutter phục vụ
// từ bất kỳ thư mục nào (http://localhost:<port>/assets/scene/index.html).
// `--mode design` → Canvas 3D (design.html) ra dist-design/, không chép sang app.
export default defineConfig(({ mode }) => {
  const design = mode === 'design';
  return {
    base: './',
    // design/scene/scene.json nằm ngoài web/ (decisions/0002); đường dẫn tính từ web/
    server: { fs: { allow: ['.', '../design'] } },
    plugins: design ? [emitDefaultScene()] : [],
    build: {
      outDir: design ? 'dist-design' : 'dist',
      emptyOutDir: true,
      // Android WebView (Chromium) và iOS WKWebView từ iOS 14 trở lên.
      target: ['es2020', 'chrome87', 'safari14'],
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1000,
      // Canvas 3D + Catalog kiến trúc (catalog.html — bộ asset chuẩn) cùng ra dist-design/
      rollupOptions: { input: design ? { design: 'design.html', catalog: 'catalog.html' } : 'index.html' },
    },
  };
});
