# Kế hoạch: tên 6 map thế giới bộ 2 vào game (V-20261118-107)

- Trạng thái: xong (chờ thử máy) · Nhánh `viec/ten-map-moi`
- Nguồn đã duyệt: `docs/y_tuong/2026-11-17-the-gioi-moi.md` (bộ 2, mục 5 "giữ mã"), phiếu
  `docs/phieu_thiet_ke/2026-11-17-concept-the-gioi-moi.md`, `design/CHANGELOG.md` 2026-11-18.2.
- Loại: dữ liệu + giao diện (chỉ TÊN). Không dựng cảnh (6 việc khác dựng từng map) — trong `design/scene/<map>.json` chỉ
  sửa `site.name` và `label` cổng.

| Mã cảnh (giữ) | Tên cũ | Tên mới |
|---|---|---|
| `rung-truc` | Trúc Lâm | Thung Trúc Gió Hát |
| `giang-nam` | Yên Vũ Lâu | Chợ Đêm Đèn Hoa |
| `tu-cam-thanh` | Tử Cấm Thành | Rừng Nấm Tiên |
| `bong-lai` | Bồng Lai Đảo | Cung Ngọc Đáy Biển |
| `truong-thanh` | Nhạn Môn Quan | Đỉnh Hạc Bay |
| `to-lua` | Đôn Hoàng Lộ | Thành Cát Ngủ Quên |

Giữ Khởi Nguyên Trấn, Nhà của ta. Tên công trình trong vùng (Vọng Trúc Đình, Khúc Thuỷ Đài…), tên NPC (Trúc Lão, Trúc Ông)
không đổi ở việc này.

## Nhiệm vụ

- [x] NV1 Luật: `docs/testing/quy_tac.md` thay tên vùng ở mọi quy tắc; R-HANH-1 thêm "không còn tên cũ trong chuỗi hiển
  thị" → `/dong-bo-quy-tac`.
- [x] NV2 Dữ liệu: `ban-do.json` `noi[].ten` (`vung[]`, `han` giữ — chỉ để tra, không vẽ / không hiện), `site.name` + `label`
  cổng ở 7 đặc tả cảnh, `app/lib/journey/journey.dart` `regionNames` / `firstRegion`, `docs/bridge.md` ví dụ.
- [x] NV3 Chuỗi web: `ui/danCamHud.ts`, `zones/gameGuides.ts`, `zones/tuiDo.ts` (tên vùng viết thẳng). Thoại NPC chỉ thay tên
  vùng (không đụng xưng hô — việc `npc-doi-ten`).
- [x] NV4 Test: sửa kỳ vọng cũ; test chặn tái phạm — TS quét chuỗi trong `web/src` (bỏ comment, bỏ danh mục kiến trúc dev) +
  đặc tả cảnh + bản đồ; Dart quét `app/lib`.
- [x] NV5 Bản đồ: `ve-ban-do.html` — tên mới, biểu tượng theo phiếu (Tháp Sáo Trúc, Cây Đèn Trăm Tầng, Lò Thuốc Tiên trên nấm,
  Cung Vỏ Sò dưới nước, đình bát giác + tùng cổ trên cột đá — không tổ hạc, Cổng Thành Vùi Cát), bỏ Trường Thành mép trên,
  bỏ tên miền Hán Việt → vẽ lại `ban-do-goc.png`; ảnh `design/screens/BanDo-the-gioi-moi.png`.
- [x] NV6 Thiết kế: `design/CHANGELOG.md` mục 2026-11-18.4.
- [x] NV7 Kiểm: check.dart, tsc, npm test, build, scene:check, flutter analyze/test, rule_trace.

Xong khi: grep tên cũ trong chuỗi hiển thị = 0 (test xanh), bản đồ mới vẽ xong, mọi kiểm đạt. Chờ thử máy: nút "Đi …" dài
hơn (18 ký tự) ở cổng, màn tải, nhãn bản đồ vùng.
