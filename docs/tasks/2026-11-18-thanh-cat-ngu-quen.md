# V-20261118-112 — Dựng cảnh Thành Cát Ngủ Quên (vùng `to-lua`)

- Yêu cầu (người dùng 2026-11-18, sau khi chốt concept — `design/CHANGELOG.md` 2026-11-18.2): "tiến hành xây". Nguồn:
  `design/concept/thanh-cat-ngu-quen/{toan-canh,cong-trinh,vao}.png`, phiếu `docs/phieu_thiet_ke/2026-11-17-concept-thanh-cat-ngu-quen.md`,
  ý tưởng `docs/y_tuong/2026-11-17-the-gioi-moi.md` (dòng `to-lua`).
- Loại: thêm (cảnh) · Cỡ: vừa · Trạng thái: xong

## Phạm vi

- **Làm**: đồi cát gợn + trời chiều muộn (giờ cố định 16:30), Cổng Thành Vùi Cát (vòm đi qua, mặt thành lên được từ dốc
  cát, lầu gỗ), đầu lạc đà đá, tường thành đổ, lối đá cổ lún dần, ụ cát đào + cờ, cờ phướn, ốc đảo (ao, cây, lều, lau).
- **Giữ**: mã cảnh, bãi hạc (0; 56) + chỗ xuất phát (−1,25; 56), cổng "Đỉnh Hạc Bay" (46,6; 19,5). Vùng không có NPC / bàn /
  trò → không có tính năng phải dời. Gỡ hồ lưỡi liềm (16; −14) — thay bằng ao ốc đảo.
- **Không làm**: NPC, trò đào cổ vật (chờ chủ đề từ vựng), bản đồ lớn vẽ cổng / tường.
- **Sẽ sửa**: `web/src/scene/{thanhCatSpec,congThanh,vat_thanh_cat}.ts` (mới), `spec.ts` / `specCheck.ts` / `world.ts` (vài
  dòng), `design/scene/to-lua.json`, `web/src/thanhCat.test.ts`, sổ luật, `design/CHANGELOG.md`, `design/screens/`.

## Nhiệm vụ

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | Trường `sandCity` (mặc định tắt / rỗng), mặt bằng va chạm cổng thuần (`gateLayout`), chia tường đổ (`wallChunks`), kiểm | `thanhCatSpec.ts`, `spec.ts`, `specCheck.ts` | xong |
| 2 | Cổng thành (đùn chữ U, vòm, răng cưa, lầu) + lạc đà; tấm mặt thành `upper` | `congThanh.ts` | xong |
| 3 | Tường đổ, ụ đào + cờ + lấp lánh, cờ phướn, phiến lối cổ (InstancedMesh), cỏ ốc đảo, lều; ghép | `vat_thanh_cat.ts`, `world.ts` | xong |
| 4 | Đặc tả cảnh theo concept, chụp 3 góc so concept, chỉnh (lạc đà, tường thấp, màu lối) | `design/scene/to-lua.json`, `design/screens/Canh-thanh-cat-*.png` | xong |
| 5 | Luật R-VA-1, R-VA-3, R-NGAY-1 (sổ + online) + test đi bộ | `docs/testing/quy_tac.md`, `web/src/thanhCat.test.ts` | xong |
| 6 | Mục CHANGELOG 2026-11-18.9, build, kiểm | `design/CHANGELOG.md` | xong |

## Chờ

- Thử máy: fps Android tầm trung ở bãi hạc / trên mặt thành (≈ 39k tam giác góc vào), leo sống đụn lên mặt thành bằng joystick.
- Đăng lại Canvas 3D sau khi gộp; bản đồ lớn vùng này chưa vẽ cổng / tường.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
dart tool/rule_trace.dart
