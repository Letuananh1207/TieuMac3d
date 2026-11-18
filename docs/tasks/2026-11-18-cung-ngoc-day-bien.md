# V-20261118-110 — Dựng cảnh Cung Ngọc Đáy Biển (vùng `bong-lai`)

- Trạng thái: xong code, chờ thử máy (fps điện thoại)
- Yêu cầu (người dùng 2026-11-18, sau khi chốt concept — `design/CHANGELOG.md` 2026-11-18.2): "tiến hành xây". Nguồn:
  `design/concept/cung-ngoc-day-bien/{toan-canh,cong-trinh,vao}.png`, phiếu `docs/phieu_thiet_ke/2026-11-17-concept-cung-ngoc-day-bien.md`,
  ý tưởng `docs/y_tuong/2026-11-17-the-gioi-moi.md` (dòng `bong-lai`).

## Phạm vi

- **Làm**: đáy biển xanh ngọc (trời / sương màu nước, giờ cố định 11:00), Cung Vỏ Sò (vỏ ốc xà cừ dải kem / hồng / tím, mái
  san hô, cửa vòm rèm rong, cột san hô, đèn ngọc) trên nền san hô hai bậc đi lên được, lối cát san hô viền cuội, bãi cát trắng,
  hang đá, vỏ trai ngọc, cột đá san hô cửa lặn, san hô, rong lay, vệt nắng, bong bóng, đàn cá.
- **Giữ**: mã cảnh, `site.name`, bãi hạc (0; 39) + chỗ xuất phát (−1,25; 39), cổng "Chợ Đêm Đèn Hoa" (−9; 42,2) + chỗ tới
  (−5; 41,8). Vùng trống từ V-66 (không NPC, bàn, trò) → không có tính năng nào phải dời.
- **Không làm**: NPC, trò "đưa cá về hang" / "nhặt ngọc trai" (chờ chủ đề từ vựng), vào trong cung, bản đồ lớn vẽ cung.
- Kỹ thuật: không hậu kỳ, không shadow realtime, không PointLight; vệt nắng = ống loe cộng màu cố định; bong bóng, cá =
  InstancedMesh động; khối tĩnh Lambert → `mergeSoft`.

## Nhiệm vụ

| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | Trường `seaFloor` (mặc định rỗng / tắt), kiểm đặc tả (bậc nền ≤ 0,6 m, thân ốc + cửa trên nền, `beamOpacity`) | `web/src/scene/cungNgocSpec.ts`, `spec.ts`, `specCheck.ts` | xong |
| 2 | Cung Vỏ Sò: nền 2 bậc (tấm đi được), vỏ ốc lathe dải xà cừ, cửa, cột, mái san hô, đèn ngọc; va chạm thân ốc tầm người | `web/src/scene/cungVoSo.ts` | xong |
| 3 | Cát, cuội, hang, trai, cột, san hô 2 dáng, rong lay gió, vệt nắng; bong bóng, cá | `web/src/scene/vat_cung_ngoc.ts`, `dongBien.ts`, `hinhBien.ts`, ghép `world.ts` | xong |
| 4 | Đặc tả cảnh theo concept, chụp 3 góc so concept, chỉnh | `design/scene/bong-lai.json`, `design/screens/Canh-cung-ngoc-*.png` | xong |
| 5 | Luật R-HANH-10 mới, R-NGAY-1, R-BANDO-2 (sổ + online) + test | `docs/testing/quy_tac.md`, `web/src/cungNgoc.test.ts` | xong |
| 6 | Mục CHANGELOG 2026-11-18.7, build | `design/CHANGELOG.md` | xong |

## Ngân sách (Canvas 3D, đo headless)

| Góc | Trước (nền trống) | Sau |
|---|---|---|
| Trên xuống | 37 draw call · 30,8k tam giác | 36 · 72,8k |
| Góc vào (bãi hạc nhìn bắc) | 33 · 28,7k | 23 · 68,4k |

## Chờ

- Thử máy: fps Android tầm trung ở bãi hạc / trên nền cung (vệt nắng cộng màu phủ nhiều điểm ảnh khi nhìn lên).
- Đăng lại Canvas 3D sau khi gộp.
