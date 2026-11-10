# Test

**Sửa lỗi → `/loi`, thêm test tái hiện lỗi trước** (test đỏ đúng như hiện tượng, rồi mới sửa).

## Quy tắc ↔ test

- Sổ: `docs/testing/quy_tac.md`. Tên test bắt đầu bằng mã quy tắc: `'R-VUNG-2: …'`; test khoá lỗi thêm mã lỗi:
  `'R-VUNG-2 (L-3): …'`, chưa có quy tắc thì `'(L-3): …'`.
- Kiểm truy vết: `dart tool/rule_trace.dart` (`-v` chi tiết). Quy tắc `ok` chưa có test → "THIẾU TEST", thoát 1.

## Các tầng test đang có

| Tầng | Có chưa | Dùng khi |
|---|---|---|
| Dart unit / widget (`flutter_test`) | có — `app/test/widget_test.dart` (mẫu của flutter create) | logic và màn Flutter; test theo quy tắc đặt ở `app/test/rules/` |
| TS unit cho `web/src` | **chưa có trình chạy** (chưa cài vitest) | logic thuần: `collision/`, `zones/zoneTracker.ts`, `player/controller.ts`, `input/orbitCamera.ts` |
| Kiểm kiểu TS | có — `cd web && npx tsc --noEmit` | mọi thay đổi web |
| Xem cảnh trên trình duyệt | có — `cd web && npm run dev` (mở bằng điện thoại cùng Wi-Fi) | cảm ứng, hình ảnh |
| Chụp màn headless | có — `npm run build && npx vite preview --port 4173`, rồi Chrome `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --window-size=390,844 --screenshot=<file> http://localhost:4173/` | so hình với prototype, kiểm cảnh dựng không lỗi |
| Trên máy Android thật | mốc 2 | WebView, hiệu năng, safe area |

Phần lớn quy tắc hiện nằm ở web/ mà chưa có trình chạy test TS → muốn khoá bằng test thì **hỏi người dùng** có
thêm `vitest` (devDependency, ghim phiên bản) không; được đồng ý thì test đặt cạnh file: `web/src/<lớp>/<tên>.test.ts`
(`tool/rule_trace.dart` đã dò `*.test.ts`). Không dựng được test → ghi rõ "chưa khoá được bằng test".

## Mẫu viết test logic thuần (khi có vitest)

```ts
// web/src/collision/colliders.test.ts
import { describe, expect, test } from 'vitest';
import { Colliders } from './colliders';

test('R-VA-1: không xuyên tường bắc', () => {
  const c = new Colliders();
  c.add(0, -21, 43, 1); // tường bắc như scene/walls.ts
  const pos = { x: 0, z: -20.3 };
  c.resolve(pos, 0.5);
  expect(pos.z).toBeCloseTo(-20.0);
});
```

Lớp `collision/` và `zones/` không phụ thuộc three hay DOM nên test được trực tiếp; `ui/` cần DOM giả (jsdom).
