---
name: hoc-xa-3d-dev
description: Bộ chuẩn code Học Xá 3D. Đọc TRƯỚC khi viết, sửa, review bất kỳ code nào trong web/src/ (TypeScript + three.js), web/index.html, app/lib/, app/test/ (Dart/Flutter) hoặc tool/.
---

# Bộ chuẩn code — Học Xá 3D

Ưu tiên khi mâu thuẫn: `design/` (thiết kế đã chốt, cho màn đã vẽ), `reference/hoc-xa-3d.html` (hành vi gốc),
`docs/bridge.md` > `CLAUDE.md` > bộ chuẩn này > thói quen chung. Giao diện mới chưa có trong `design/` → không dựng
tạm, soạn phiếu (`/ui-apply phieu`).

## Quy trình mỗi lần sửa

1. Xác định lớp của việc → đọc **đúng một** file reference ở bảng dưới, không đọc hết.
2. Mở file theo bảng "Đường dẫn đoán được", không quét thư mục. Không đọc `app/assets/scene/`, `web/dist/`,
   `web/node_modules/`, `reference/` (trừ khi cần đối chiếu hành vi gốc — đọc đúng đoạn).
3. Sửa theo mẫu. Logic mới có thể tách khỏi DOM/three thì kèm test (xem `references/testing.md`).
4. Kiểm bằng lệnh có đầu ra ngắn:
   - `dart tool/check.dart --changed`
   - web: `cd web && npx tsc --noEmit` · app: `cd app && flutter analyze`
   - test phần vừa sửa: `cd app && flutter test -r failures-only test/<phần>`
   - đổi giao diện scene: `cd web && npm run build` (chép sang app) rồi xem trên máy / `npm run dev`.

## Việc → đọc reference nào

| Việc | Reference |
|---|---|
| thêm thư mục / module, đổi ai import ai, cầu nối Flutter ↔ JS | `references/architecture.md` |
| cảnh 3D, nhà, cây, vật liệu, texture, nhân vật, điều khiển, va chạm, vùng, HUD HTML | `references/web_scene.md` |
| code Dart / Flutter trong app/ | `references/app_flutter.md` |
| viết test, sửa lỗi | `references/testing.md` |
| đặt tên, comment, kiểu, lỗi (cả TS lẫn Dart) | `references/style.md` |

## Đường dẫn đoán được

| Cần | Ở đâu |
|---|---|
| điểm vào scene, vòng lặp | `web/src/main.ts` |
| renderer, camera, pixelRatio | `web/src/scene/renderer.ts` |
| một vật trong sân (nhà, tường, cây, giếng) | `web/src/scene/<vật>.ts`, ghép ở `scene/world.ts` |
| số / màu của cảnh, đặc tả, Canvas 3D | `web/src/scene/spec.ts` (kiểu + mặc định), `loadSpec.ts`, `web/src/designPreview.ts` |
| hình nhân vật / di chuyển | `web/src/player/blockCharacter.ts` / `player/controller.ts` |
| joystick, xoay/zoom camera, chạm để đi, phím | `web/src/input/{joystick,orbitCamera,tapToMove,keyboard,pointers}.ts` |
| va chạm | `web/src/collision/colliders.ts` |
| nội dung vùng + bài học (vị trí: đặc tả cảnh) | `web/src/zones/zones.ts` |
| thẻ mời, bảng bài học, fps, nhãn tên | `web/src/ui/{eventCard,lessonBoard,hud}.ts`, DOM ở `web/index.html`, CSS `web/src/style.css` |
| màn Flutter | `app/lib/` (hiện chỉ `main.dart`) |
| test của `app/lib/a/b.dart` | `app/test/a/b_test.dart`; test theo quy tắc: `app/test/rules/` |
| test của `web/src/a/b.ts` (khi có trình chạy test) | `web/src/a/b.test.ts` |

## Điều cấm

| Điều cấm | Máy kiểm |
|---|---|
| import sai lớp theo bảng ở `decisions/0001-kien-truc.md` | `E-LOP` |
| nạp mã / CSS / font từ http(s) (CDN, Google Fonts) — app chạy offline | `E-CDN` |
| bật shadow realtime (`castShadow`, `shadowMap.enabled`) | `E-BONG` |
| sửa tay `app/assets/scene/` (bản build, bị ghi đè) hoặc `reference/hoc-xa-3d.html` | — |
| đổi phiên bản gói npm sang dải `^`/`~` — luôn ghim cố định (`npm install --save-exact`) | — |
| `any`, gán `innerHTML` | `W-ANY`, `W-HTML` (cảnh báo) |
| file > 400 dòng; `Color(0x…)`, `fontSize: <số>` trong Dart | `W-DAI`, `W-MAU`, `W-COCHU` (cảnh báo) |

## Cập nhật bộ chuẩn

Đổi quy tắc → sửa reference liên quan + thêm một dòng `CHANGELOG.md`. Quyết định lớn (thêm lớp, đổi cầu nối,
thêm thư viện) → `decisions/000N-<tên>.md`. Đổi bảng phụ thuộc → sửa cả `LAYERS` trong `tool/check.dart`.
Mỗi reference ≤ ~150 dòng.
