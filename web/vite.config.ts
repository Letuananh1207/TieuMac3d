import { defineConfig } from 'vite';

// base './' → mọi đường dẫn trong bản build là tương đối, để Flutter phục vụ
// từ bất kỳ thư mục nào (http://localhost:<port>/assets/scene/index.html).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Android WebView (Chromium) và iOS WKWebView từ iOS 14 trở lên.
    target: ['es2020', 'chrome87', 'safari14'],
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000,
  },
});
