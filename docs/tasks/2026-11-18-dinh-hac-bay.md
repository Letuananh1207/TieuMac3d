# V-20261118-111 — Dựng cảnh Đỉnh Hạc Bay (vùng `truong-thanh`)

- Yêu cầu (người dùng 2026-11-18, sau khi chốt concept — `design/CHANGELOG.md` 2026-11-18.2): "tiến hành xây". Nguồn:
  `design/concept/dinh-hac-bay/{toan-canh,cong-trinh,vao}.png`, phiếu `docs/phieu_thiet_ke/2026-11-17-concept-dinh-hac-bay.md`
  (đã sửa: không tổ hạc — đình bát giác + tùng cổ trên đỉnh cột).
- Loại: cảnh 3D (bố cục + ngoại hình) + vật mới bằng code · Cỡ: lớn · Trạng thái: xong (chờ thử máy)

## Phạm vi

- **Làm**: thung lũng cột đá vôi (khối xếp vát mép), tùng trên đỉnh / phong đỏ, tùng lá kim dưới thung, sông uốn + thác nhỏ
  trên một cột, trời thu trong; **cột chính** (0; −4) cao 40 m: bậc đá xoắn lên **gờ** 10,5 m → bậc thứ hai lên **thềm đỉnh**
  có đình bát giác (cột son, lan can vôi trắng, mái ngói xám vểnh góc), tùng cổ nghiêng ra mép, hạc đứng; 3 **cầu treo** gỗ
  (gờ cột chính ↔ gờ cột đông / tây, gờ cột tây ↔ đỉnh cột bắc); đàn hạc bay (`flocks`, dùng lại hạc khối của `fauna.ts`).
- **Giữ**: mã cảnh, bãi hạc (0; 39) + chỗ xuất phát (−1,25; 39), 3 cổng (toạ độ cũ — R-HANH-4 / R-BANDO-2). Vùng trống từ
  V-66 (không còn tường thành, NPC, bàn, trò) → không có tính năng nào phải dời.
- **Không làm**: NPC, trò cưỡi hạc qua vòng (chờ chủ đề từ vựng), bản đồ lớn vẽ cột đá.

## Nhiệm vụ

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | Trường `pillarValley` (mặc định tắt / rỗng), toán bậc xoắn + gờ (`peakStairs`, `ledgeArc`), kiểm đặc tả (dốc ≤ 34°, khoảng đầu ≥ 2,6 m giữa các vòng, đình / tùng trên thềm, lối ra bậc, cột không chồng, đầu cầu nằm đúng trên gờ / đỉnh) | `web/src/scene/dinhHacSpec.ts`, `spec.ts`, `specCheck.ts` | xong |
| 2 | Cột đá (lõi + vòng khối vát mép 44 tam giác), thềm cỏ, gờ, cầu treo, tùng lá kim + phong (InstancedMesh) | `web/src/scene/vat_dinh_hac.ts` | xong |
| 3 | Cột chính: bậc 1 + gờ cung + bậc 2 (tấm `helix`), đình bát giác, tùng cổ, hạc đứng; rào vô hình mép gờ / thềm / bậc | `web/src/scene/dinhHac.ts`, ghép `world.ts` | xong |
| 4 | Đặc tả cảnh theo concept, chụp 3 góc so concept, chỉnh | `design/scene/truong-thanh.json`, `design/screens/Canh-dinh-hac-*.png` | xong |
| 5 | Luật R-VA-1, R-VA-3 (sổ + online) + test đi bộ | `docs/testing/quy_tac.md`, `web/src/dinhHac.test.ts` | xong |
| 6 | Mục CHANGELOG 2026-11-18.8, build | `design/CHANGELOG.md` | xong |

## Chờ

- Thử máy: fps Android tầm trung ở bãi hạc / trên thềm đỉnh (~87k tam giác góc chơi), leo bậc xoắn + qua cầu treo bằng joystick.
- Đăng lại Canvas 3D sau khi gộp; bản đồ lớn vùng này chưa vẽ cột đá / cầu treo.
