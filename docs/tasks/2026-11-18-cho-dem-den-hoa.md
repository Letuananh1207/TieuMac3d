# Kế hoạch V-20261118-108 — dựng Chợ Đêm Đèn Hoa (cảnh `giang-nam`)

- Trạng thái: xong code, chờ thử máy (fps điện thoại)
- Nguồn: ảnh concept đã chốt `design/concept/cho-dem-den-hoa/{toan-canh,cong-trinh,vao}.png`, phiếu
  `docs/phieu_thiet_ke/2026-11-17-concept-cho-dem-den-hoa.md`, CHANGELOG 2026-11-18.2. Người dùng: "tiến hành xây".
- Giữ: mã cảnh `giang-nam`, `site.name` (đổi tên vùng là việc `viec/ten-map-moi`), 3 cổng + vị trí cổng (V-59, V-81),
  bãi hạc (0; 39), chỗ xuất phát. Không NPC mới, không trò mới, không sửa thoại.

## Phạm vi

| # | Việc | File |
|---|---|---|
| 1 | Trường đặc tả mới (mặc định rỗng = cảnh cũ): `lanternTrees`, `stalls`, `piers`, `choDemStyle`; `buildings[].plaque`; `dayNight.gioCoDinh` (−1 = theo đồng hồ) | `web/src/scene/choDemSpec.ts`, `spec.ts`, `specCheck.ts`, `ngayDem.ts` |
| 2 | Dựng Cây Đèn Trăm Tầng (đài bát giác hai bậc đi lên được, lan can, trục son, 7 vòng đèn, đèn sen), sạp mái vải, bến gỗ; đèn tự sáng (`lampMaterial`), quầng giả thưa, đĩa sáng ấm trên sân thay đèn thật (0 PointLight) | `web/src/scene/vat_cho_dem.ts`, ghép `world.ts` |
| 3 | Giờ cố định: `NgayDem`, mây hạc dùng `gioCoDinh` | `web/src/ngayDem.ts`, `cuoiHac.ts` |
| 4 | Đặc tả cảnh: sông z −12 … −4 kè đá (sunk 1), cầu vòm x 18, hai ao kè hai bên đài, 11 nhà phố (`nha-nho`, không biển), 14 sạp, dây đèn, bậc xuống nước, thuyền, bến gỗ, đêm 21:00, kiểu nhìn mềm | `design/scene/giang-nam.json` |
| 5 | Luật: R-HANH-9 mới (chợ đêm), R-NGAY-1 (giờ cố định), R-BANDO-2 (bản đồ Yên Vũ Lâu) — đồng bộ online | `docs/testing/quy_tac.md` |
| 6 | Test: đi bộ tới 3 cổng + lên đài, sông/ao chặn, bản đồ lớn; giờ cố định | `web/src/choDem.test.ts`, `scene/ngayDem.test.ts` |
| 7 | Ảnh Canvas 3D 3 góc như concept + CHANGELOG 2026-11-18.5 | `design/screens/Canh-cho-dem-*.png`, `design/CHANGELOG.md` |

## Ngân sách (Canvas 3D, đo headless)

| Góc | Trước (nền trống) | Sau |
|---|---|---|
| Trên xuống | 52 draw call · 48,1k tam giác | 79 · 92,0k |
| Góc vào (bãi hạc nhìn bắc) | 46 · 41,2k | 73 · 85,1k |

Trong ngưỡng ≤ 150 draw call / ≤ 150k tam giác. fps: chưa đo trên điện thoại (headless swiftshader không có số) → chờ thử máy.
