# Kế hoạch: bản đồ thế giới nền minh hoạ (V-20261118-115)

- Trạng thái: xong (chờ thử máy) · Nhánh `viec/ban-do-song`
- Nguồn đã duyệt: `design/CHANGELOG.md` 2026-11-18.12 — ảnh `design/concept/the-gioi-moi/ban-do.png` (2752 × 1536, chữ tên
  8 nơi Gemini vẽ sẵn) thay nền `ban-do-goc.png` của bản đồ truyền tống.
- Phạm vi: chỉ bản đồ **truyền tống** (cuộn `web/src/scene/banDo.ts`, mở ở vòng trận / nút Bản đồ / phím M). Bản đồ nhỏ /
  bản đồ vùng (R-BANDO-*) vẽ từ đặc tả cảnh — không đụng. Flutter không hiện bản đồ này.

## Nhiệm vụ

- [x] NV1 Ảnh: cắt giữa về 16 : 9 (bỏ 10 px mỗi mép trái / phải → 2731 × 1536), thu về 2048 × 1152 (khung `ban-do.json`),
  WebP chất lượng 88 → `design/scene/ban-do/ban-do-nen.webp` (≤ 600 KB). Bản gốc giữ ở `design/concept/`.
- [x] NV2 Dữ liệu: `ban-do.json` `anh` → `ban-do-nen.webp`; đo lại tâm biểu tượng 8 nơi trên ảnh mới; vùng chạm r 135
  (Nhà của ta 115) phủ biểu tượng + phần lớn nhãn chữ. `ban-do-goc.png` + `ve-ban-do.html` giữ làm dự phòng (ghi chú).
- [x] NV3 Code: `scene/banDo.ts` nạp `ban-do-nen.webp` (đường cố định cho Vite — glob theo `anh` sẽ kéo cả ảnh cũ 1,5 MB
  vào bản build; test giữ hai chỗ khớp); code vẫn chỉ vẽ ghim "đang ở đây" + huy hiệu "sắp mở" — không vẽ tên, không vẽ
  đường (ảnh đã có).
- [x] NV4 Luật: R-HANH-2 thêm câu nền bản đồ (tranh có sẵn tên + đường; code không vẽ tên đè; chạm biểu tượng hoặc
  tên) → `/dong-bo-quy-tac`.
- [x] NV5 Test: ảnh đúng 2048 × 1152, ≤ 600 KB; 8 nơi trong ảnh, khớp tâm biểu tượng ± 25 px; chạm tâm nhãn tên → đúng
  nơi; `banDo.ts` không `fillText` / `strokeText`.
- [x] NV6 Ảnh chụp Canvas 3D `?bando&chup` ngang 900 × 600, dọc 390 × 844 → `design/screens/BanDo-song-{ngang,doc}.png`.
- [x] NV7 `docs/thiet_ke_da_ap.md` dòng 2026-11-18.12; kiểm check.dart, tsc, npm test, build, flutter analyze/test,
  rule_trace.

Xong khi: bản đồ truyền tống hiện tranh mới, chạm biểu tượng / tên đúng nơi, ghim đúng chỗ, mọi kiểm đạt.
