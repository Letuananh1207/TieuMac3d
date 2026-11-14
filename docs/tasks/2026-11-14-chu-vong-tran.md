# Chữ trên vòng trận theo cảnh (Nhà của ta khắc 我家)
- Yêu cầu: "Làm bằng /lead" — phần "Cần code" của `design/CHANGELOG.md` mục 2026-11-14.16
- Loại: thêm (trường đặc tả) · Cỡ: nhỏ–vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — `TeleportSpec.text` (chuỗi Hán 1–3 chữ) + mặc định `"起源"` trong `DEFAULT_SCENE` (giữ cảnh cũ).
- `web/src/scene/truyenTong.ts` — phù hiệu vẽ `tp.text` thay hằng; giữ `TELEPORT_TEXT` làm giá trị mặc định.
- `web/src/scene/specCheck.ts` — `checkTeleport`: `text` 1–3 ký tự.
- `web/src/main.ts`, `web/src/designPreview.ts` — nạp font Hán cho chữ của cảnh đang mở.
- `design/scene/nha-ta.json` — `teleport.text: "我家"` (phần thiết kế của mục 2026-11-14.16, người dùng nhờ làm luôn).
- `web/src/scene/truyenTong.test.ts` (mới) hoặc test đặc tả — mặc định + giá trị lạ.

**Cần kiểm tra**: các cảnh vùng khác (`design/scene/*.json`) vẫn khắc 起源 (mặc định); `npm run scene:check` mọi cảnh.

**Không đụng**: luật (R-NHA-1, R-HANH-2 không nói chữ), cầu nối, Flutter.

## Nhiệm vụ
- [x] 1. `TeleportSpec.text` + mặc định + kiểm (spec · specCheck · test vitest: thiếu → 起源; "" / > 3 chữ → lỗi)
- [x] 2. Vẽ phù hiệu theo `tp.text`; nạp font chữ đó ở `main.ts` + `designPreview.ts` (scene)
- [x] 3. `nha-ta.json` `teleport.text = "我家"`; `scene:check` không lỗi
- [x] 4. Kiểm tra cuối + build

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build
