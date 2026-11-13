# Bỏ thẻ tên khu khi chuyển khu
- Yêu cầu: "bỏ việc hiển thị tên khu vực khi chuyển qua"
- Loại: xoá · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-HUD-3 viết lại thành "không hiện thẻ tên khu (bỏ 2026-11-13)"; R-HUD-1 bỏ câu "Tên khu chỉ
  báo bằng thẻ giữa màn (R-HUD-3)". Chép lên tài liệu xác nhận online (ô Xác nhận → Chờ) → `--mark-synced R-HUD-1 R-HUD-3`.
- `web/src/main.ts` — bỏ `AreaBanner`, `AreaEntryTracker` (2 import, 2 dòng tạo, 1 dòng `entries.update`).
- `web/src/ui/areaBanner.ts` — **xoá file**.
- `web/src/zones/areaTracker.ts` — xoá lớp `AreaEntryTracker` (còn `Area`, `areaAt` — giữ, rẻ, có thể dùng lại).
- `web/index.html` — xoá khối `#areaCard`.
- `web/src/style.css` — xoá 3+ dòng `#areaCard…` và token `--frost-strong` nếu không còn ai dùng.
- `web/src/scene/spec.ts` — sửa chú thích nhắc R-HUD-3 ở `AreaSpec` / `site`.
- `npm run build`.

**Cần kiểm tra** màn tải (R-MAN-2) không dùng thẻ này · `designPreview.ts` không dùng.

**Không đụng**
- Dữ liệu `site.areas` trong `design/scene/scene.json` (tên khu + chữ Hán) — giữ: `scene:check` vẫn in, có thể dùng lại.
- `design/` (thiết kế HUD-doc-vao-khu / HUD-ngang-vao-khu, `design/docs/screen_specs.md`) — phiên code không sửa;
  báo người dùng để `/ui-design` đánh dấu đã bỏ.
- Flutter, cầu nối: không có phần nào dùng thẻ tên khu.

## Rác sau khi xoá
Chuỗi: không (chữ lấy từ đặc tả). DOM `#areaCard/#areaHan/#areaName`, CSS `#areaCard*`, file `ui/areaBanner.ts`, lớp
`AreaEntryTracker`. Test: không có test riêng (R-HUD-3 đang "chờ" test).

## Nhiệm vụ
- [x] 1. Sổ quy tắc + tài liệu online + `--mark-synced`.
- [x] 2. Xoá code (main.ts, areaBanner.ts, areaTracker.ts, index.html, style.css, chú thích spec.ts).
- [x] 3. Kiểm + build; chụp headless đi qua ranh khu → không có thẻ.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart

## Kết quả
- Sổ + tài liệu online (R-HUD-1 ô Xác nhận về Chờ, R-HUD-3 viết lại) + `--mark-synced`. Bản build `app/assets/scene/` không còn `#areaCard`.
- Kiểm bằng xem bản build (phần tử thẻ không còn) thay cho chụp đi qua ranh khu.
- Còn: thiết kế HUD-doc-vao-khu / HUD-ngang-vao-khu trên canvas + `design/docs/screen_specs.md` — `/ui-design` đánh dấu đã bỏ.
