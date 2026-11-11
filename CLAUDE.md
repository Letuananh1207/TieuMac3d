# Học Xá 3D (TieuMac3d)

App mobile thử nghiệm: một "học xá" low-poly 3D, người dùng điều khiển một nhân vật đi trong sân, đến gần lớp
học thì hiện thẻ mời vào học chữ Hán. Giao diện **tiếng Việt**; trả lời người dùng bằng tiếng Việt. Người dùng là
dev Flutter chưa làm game: mỗi khi chọn thư viện / cách làm, giải thích ngắn vì sao; chỗ cần quyết định thì hỏi.

- `web/` — scene 3D: three.js + TypeScript + Vite, build ra file tĩnh, **chạy offline (không CDN)**.
- `app/` — Flutter (Android, iOS, **web**), hiển thị scene bằng WebView (`flutter_inappwebview`; Android / iOS qua
  `InAppLocalhostServer`, web nạp thẳng asset — `app/lib/scene/scene_server.dart`). Không làm bản desktop.
- Làm theo mốc; xong mốc nào báo người dùng rồi mới sang mốc sau. Không multiplayer / đăng nhập / backend.

## Nguồn sự thật ngoài code

| File | Dùng cho |
|---|---|
| `reference/hoc-xa-3d.html` | prototype gốc: hành vi điều khiển, cảnh, giao diện. Chỉ đọc, không sửa. |
| `docs/bridge.md` | tên + dạng mọi thứ trao đổi Flutter ↔ JS; hai phía dùng đúng tên ở đây |
| `design/` | thiết kế đã chốt từ canvas (đặc tả, token, ảnh, nhật ký) — phiên VS Code chỉ đọc |
| `design/scene/scene.json` | đặc tả cảnh 3D (bố cục, kích thước, màu, đèn, camera) — code đọc thẳng lúc build; chưa có → mặc định `web/src/scene/spec.ts` |

## Thiết kế trước, code sau (chỉ phần mới)

- Hai phiên, hai vai: **phiên thiết kế** (`/ui-design`, Claude ngoài VS Code) vẽ
  [canvas](https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1) và ghi `design/`; **phiên code** (VS Code) sửa code, không
  sửa `design/`.
- HUD đang có theo code + prototype. Giao diện **mới** chưa có trên canvas → không dựng tạm: soạn phiếu
  bằng `/ui-apply phieu <yêu cầu>`, việc đó chờ thiết kế.
- Cảnh 3D thiết kế bằng đặc tả `design/scene/scene.json` + **Canvas 3D** (`/ui-design canh …`, trang
  `web/design.html` chạy đúng code app). Quyết định: `decisions/0002-thiet-ke-3d.md`.
- Khi thiết kế được cập nhật (mục mới trong `design/CHANGELOG.md`): `/ui-apply`.
- Phong cách cổ trang / tiên hiệp: `/khao-cuu <chủ đề>` nghiên cứu → hồ sơ `docs/tham_khao/` (tham khảo, chưa chốt)
  → phiên thiết kế đọc khi dựng. `/khao-cuu soat` soát cảnh. Skill này chỉ ghi `docs/tham_khao/`.

## File sinh tự động — không sửa tay, sẽ bị ghi đè

| File | Tạo lại bằng |
|---|---|
| `app/assets/scene/**` | `cd web && npm run build` |
| `web/dist/**` | `cd web && npm run build` |
| `web/dist-design/**` (Canvas 3D, không vào app) | `cd web && npm run build:design` |

## Lệnh thường dùng

```sh
cd web && npm run dev          # thử scene trên trình duyệt / điện thoại cùng Wi-Fi
cd web && npm run build        # kiểm kiểu + kiểm đặc tả cảnh + build + chép sang app/assets/scene/
cd web && npm run scene:check  # kiểm design/scene/scene.json, in toạ độ nhà / vùng / tường
cd web && npm run build:design # Canvas 3D → web/dist-design/ (đăng artifact ở phiên thiết kế)
cd web && npx tsc --noEmit     # chỉ kiểm kiểu TS
cd app && flutter run          # chạy app (build web trước); trình duyệt: flutter run -d chrome
cd app && flutter analyze && flutter test
dart tool/check.dart --changed # quy tắc bộ chuẩn trên file vừa đổi (--summary: đếm)
dart tool/guard.dart           # chốt chặn: lỗi biên dịch Dart/TS + lỗi E
dart tool/rule_trace.dart      # quy tắc nghiệp vụ ↔ test
dart tool/rule_trace.dart --mark-synced <mã>  # sau khi chép quy tắc lên tài liệu xác nhận online
```

## Quy tắc khi viết code

Đọc skill **`hoc-xa-3d-dev`** trước khi viết / sửa / review code trong `web/`, `app/`, `tool/`. Quy tắc cứng:

1. Phụ thuộc giữa các thư mục `web/src/` theo bảng ở `.claude/skills/hoc-xa-3d-dev/decisions/0001-kien-truc.md`;
   ghép lớp chỉ ở `main.ts`. Máy kiểm (`E-LOP`).
2. Không nạp gì từ mạng: gói npm và font đóng gói (`@fontsource`), không CDN / Google Fonts.
3. Phiên bản gói npm ghim cố định (`npm install --save-exact`).
4. Không shadow realtime; pixelRatio tối đa 1,5; vật liệu Lambert.
5. Nhân vật qua hợp đồng `Character`; di chuyển ở `PlayerController` — đổi nhân vật không sửa controller.
6. DOM dựng bằng `textContent` / `createElement`, không `innerHTML`; bám mép dùng `env(safe-area-inset-*)`.
7. Sửa web xong thì `npm run build` để app nhận bản mới.
8. Vị trí, kích thước, màu, đèn, camera của cảnh lấy từ `SceneSpec` (`web/src/scene/spec.ts`), không viết số mới
   thẳng trong code dựng cảnh; thêm trường thì thêm cả giá trị mặc định giữ nguyên cảnh cũ.

## Quy tắc nghiệp vụ

Sổ: `docs/testing/quy_tac.md` (xác nhận trên tài liệu online — link trong sổ). Đổi hành vi: sửa sổ trước →
chép lên tài liệu online → `--mark-synced` → test → code.

## Làm việc

- Yêu cầu tính năng / mốc mới: `/lead <yêu cầu>`.
- Báo lỗi: `/loi <mô tả>` ghi vào `docs/loi.md`; `/loi sua [L-…]` để sửa. Người dùng báo lỗi trong chat mà không
  gõ `/loi` thì vẫn ghi vào sổ.
- Trợ giúp: `/guide` — có những lệnh gì, dùng lệnh nào để làm gì.
