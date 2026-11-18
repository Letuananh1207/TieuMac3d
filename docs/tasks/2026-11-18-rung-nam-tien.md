# V-20261118-109 — Dựng cảnh Rừng Nấm Tiên (vùng `tu-cam-thanh`)

Yêu cầu (người dùng 2026-11-18, sau khi chốt concept — `design/CHANGELOG.md` 2026-11-18.2): "tiến hành xây". Nguồn:
`design/concept/rung-nam-tien/{toan-canh,cong-trinh,vao}.png`, phiếu `docs/phieu_thiet_ke/2026-11-17-concept-rung-nam-tien.md`,
ý tưởng `docs/y_tuong/2026-11-17-the-gioi-moi.md` (dòng `tu-cam-thanh`).

## Phạm vi

- **Làm**: địa hình + màu chiều hồng tím, suối + 2 cầu ván, lối đất, nấm khổng lồ, nấm nhỏ, luống thảo dược, nhà nấm cửa
  tròn, Nấm Mẹ + thang gỗ xoắn lên mũ + Lò Thuốc Tiên (đỉnh đồng ba chân, lửa, khói tím), hũ sứ, bàn đá.
- **Giữ**: mã cảnh, bãi hạc (0; 70) + chỗ xuất phát (−1,25; 70), 2 cổng (toạ độ cũ — không đổi luật R-HANH-4 / R-BANDO-2).
  Vùng đã trống từ V-66 B0 (không còn cung điện, NPC, bàn, trò) → không có tính năng nào phải dời.
- **Không làm**: đổi tên vùng (`viec/ten-map-moi`), thoại / NPC (`viec/npc-doi-ten`), NPC mới, trò nấu thuốc (chờ chủ đề
  từ vựng), bản đồ lớn vẽ nấm.

## Nhiệm vụ

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | Tấm đi được mới: thang xoắn (`helix`, chọn vòng theo chân) + tấm tròn khoét giếng (`hole`) | `web/src/collision/ground.ts` (+ test) | xong |
| 2 | Trường `mushroomForest` (mặc định rỗng / tắt), kiểm đặc tả (thang dốc ≤ 35°, đủ đầu, lò trên mũ ngoài giếng, nấm không cắm vào mũ) | `web/src/scene/rungNamSpec.ts`, `spec.ts`, `specCheck.ts` | xong |
| 3 | Nấm lặp InstancedMesh (thân, 3 dáng mũ, chấm, nấm nhỏ, thảo dược), nhà nấm khối mềm | `web/src/scene/vat_rung_nam.ts` | xong |
| 4 | Nấm Mẹ + thang + giếng + lò + khói + đồ trên mũ; va chạm có khoảng cao | `web/src/scene/namMe.ts`, ghép `world.ts` | xong |
| 5 | Đặc tả cảnh theo concept, chụp 3 góc so concept, chỉnh | `design/scene/tu-cam-thanh.json`, `design/screens/Canh-rung-nam-*.png` | xong |
| 6 | Luật R-VA-1, R-VA-3 (sổ + online) + test đi bộ | `docs/testing/quy_tac.md`, `web/src/rungNam.test.ts` | xong |
| 7 | Mục CHANGELOG 2026-11-18.6, build | `design/CHANGELOG.md` | xong |

## Chờ

- Thử máy: fps Android tầm trung ở bãi hạc / trên mũ (khói động + ~86k tam giác góc vào), đi thang xoắn bằng joystick.
- Đăng lại Canvas 3D sau khi gộp; bản đồ lớn vùng này chưa có nấm / nhà nấm.
