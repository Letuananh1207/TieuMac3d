# 0001 — Kiến trúc: scene 3D web trong WebView Flutter

Ngày: 2026-11-10 · Trạng thái: giữ nguyên (người dùng chọn)

## Hiện trạng

- `web/`: three.js 0.170.0 + TypeScript 5.9 + Vite 6.4, ghim phiên bản cố định. Build ra file tĩnh,
  `npm run build` tự chép sang `app/assets/scene/`. Không CDN — app phải chạy offline.
- `app/`: Flutter 3.41, hiện mới là khung `flutter create` (Android, iOS). Mốc 2 hiển thị scene bằng
  `flutter_inappwebview`, phục vụ file qua `InAppLocalhostServer` (ES module cần http, không chạy từ `file://`).
- Cầu nối (mốc 3, chưa làm): JS → Flutter `window.flutter_inappwebview.callHandler('sceneEvent', {type, payload})`;
  Flutter → JS `evaluateJavascript` gọi `window.scene.handle({type, payload})`. Tên sự kiện định nghĩa một chỗ
  ở `docs/bridge.md`.

## Lý do

Người dùng là dev Flutter, chưa làm game. three.js có prototype chạy sẵn (`reference/hoc-xa-3d.html`) và hệ
sinh thái lớn; Flutter giữ phần app (màn bài học, điều hướng, vòng đời). Chia hai phía rõ ràng: 3D ở web/,
mọi thứ không phải cảnh 3D ở Flutter.

## Bảng phụ thuộc trong `web/src/` (đầu vào cho `tool/check.dart` → `E-LOP`)

| Lớp (thư mục) | Được import | Ghi chú |
|---|---|---|
| `collision/` | — | toán thuần, không three, không DOM |
| `zones/` | `collision` | dữ liệu + theo dõi vùng, không three, không DOM |
| `scene/` | `collision`, `three` | dựng cảnh; đăng ký vật cản vào `Colliders` |
| `player/` | `collision`, `scene`, `three` | `Character` (hình) tách khỏi `PlayerController` (di chuyển) |
| `input/` | `player`, `three` | chỉ dùng kiểu `MoveInput` của player |
| `ui/` | `zones`, `three` | HUD HTML; không biết tới scene/player |
| `bridge/` | `zones` | cầu nối Flutter ↔ JS theo `docs/bridge.md` (kiểu `Lesson`); không DOM, không three |
| `main.ts` (gốc) | mọi thứ | nơi duy nhất ghép các lớp, giữ vòng lặp |

Cùng thư mục import nhau tự do. Gói npm khác `three` chưa kiểm. CSS chỉ import ở `main.ts`.

## Khi thêm lớp mới

Ví dụ mốc 3 thêm `web/src/bridge/`: thêm một dòng bảng trên + mục trong `LAYERS` ở `tool/check.dart`
(trước đó `check` cảnh báo `W-LOPMOI`). Hướng đề xuất: `bridge/` chỉ import `zones` (kiểu sự kiện), `main.ts`
nối bridge với ui/player.

## Dữ liệu cảnh từ design/ (2026-11-10, xem 0002)

`scene/spec.ts` đọc `design/scene/scene.json` lúc build (ngoài `web/src`, không phải lớp). Vùng sự kiện lấy toạ
độ từ nhà trong spec: `scene/` trả `ZoneAnchor[]`, `main.ts` gọi `zones/placeZones` để ghép với nội dung bài học.
Trang `designPreview.ts` (gốc `web/src`, như `main.ts`) được import mọi thứ.
