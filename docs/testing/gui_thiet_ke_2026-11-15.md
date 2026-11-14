# Gửi lại thiết kế — 2026-11-15 (/ui-apply V-20261114-34)

Thiết kế trái luật đã chốt → code theo luật, không theo artboard. Phiên `/ui-design` sửa lại artboard cho khớp.

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-14.20 Bản đồ vùng | dấu bắc 北 trên vành bản đồ nhỏ, la bàn bản đồ lớn chữ 北 | R-HUD-4 (chữ trang trí HUD không chữ Hán), R-BANDO-3 (dấu "B") | chữ **B** |
| 2026-11-14.20 Bản đồ vùng | đầu giấy bản đồ lớn + thẻ tên cảnh (ngang) có chữ Hán tên cảnh 起源鎮 | R-HUD-4 (tên nơi / khu trên bản đồ vùng chỉ tiếng Việt) | bỏ chữ Hán, chỉ "Khởi Nguyên Trấn" |
| 2026-11-14.20 Bản đồ vùng | biểu tượng bàn Đấu chữ: ô giấy viền ngọc chữ 字 | R-HUD-4 (biểu tượng là trang trí, không phải nội dung học) | ô giấy viền ngọc + **dấu hỏi** ngọc (tạm — xin vẽ lại) |
| 2026-11-14.20 Bản đồ vùng | chữ chỗ "日課榜" (Noto Serif SC) | R-HUD-4 | "Bảng nhiệm vụ" |
| 2026-11-14.20 Bản đồ vùng | bán kính bản đồ nhỏ 25 m | R-BANDO-3 "thấy quanh mình **30 m**" (người dùng chốt ~30 m) | 30 m; dấu mép khi xa hơn 28 m (tỉ lệ ngưỡng 23/25 của artboard) |
| 2026-11-14.20 Bản đồ vùng | bản đồ nhỏ **tròn** 104 px dọc / 96 px ngang (`size.minimap-*`), dấu 北 + dấu mép trên vành tròn | **Người dùng đổi (2026-11-15, V-20261114-37)**: bản đồ nhỏ **vuông + to hơn** — R-BANDO-1 (vuông, cạnh 148 / 128), R-BANDO-3 (30 m theo nửa cạnh; dấu "B" + dấu mép trên cạnh vuông) | khung vuông bo 12 px, 148 / 128, giữ giấy + viền vàng + vành kính; mặt bằng xoay trong khung cắt vuông; "B" + dấu mép chiếu ra cạnh — xin vẽ lại `BanDoVung-HUD-*`, `BanDoVung-nho-trang-thai` + token |
| 2026-11-14.21 Ngồi nhìn từ mắt | ấn son 溫故 bên phải đầu cuộn | R-HUD-4 ("cuộn Ngồi ôn: ấn son 'Ôn'") | ấn son chữ **Ôn** |
| 2026-11-14.21 Ngồi nhìn từ mắt | giấy 0,26 × 0,25 m; dọc giấy 343 × 330 (88 % bề ngang — code thật ~70 %); **ngang giấy 300 × 286, lệch phải** (trái 470 / 844, ~73 % chiều cao — code thật ~60 %); gợi ý chưa học bên trái "Đứng dậy" (bị cắt dòng cuối ở màn ngang); "Đứng dậy" cao 44 | **Người dùng đổi (2026-11-15, V-20261114-43)**: cuộn **cầm giữa màn** cả dọc lẫn ngang, **dài hơn** — R-ON-8 (giấy 0,26 × 0,35; ngang ~84 % chiều cao, dọc ~80 % bề ngang; mục + "Đứng dậy" ≥ 44 px ở 360 × 640; gợi ý đủ cả câu; tay không đè chữ) | giấy 0,26 × 0,35 (trục 0,37), tâm giữa màn; bố cục dọc 343 × 462 (đệm 14 16 12, đầu 42, mục 70, gợi ý cả bề ngang dưới mục, "Đứng dậy" 53), ngang 250 × 337 (đệm 10 12 8, đầu 36, mục 53, "Đứng dậy" 49); gợi ý xuống dòng + chữ nhỏ dần (≥ 9) — xin `/ui-design` vẽ lại `NgoiMat-on-*`, `NgoiMat-cham-*`, `NgoiMat-tuhoc-*`, `NgoiMat-bien-the` |

Cột App các luật trên không đổi (`ok` / `sửa` như sổ) — code đã theo luật.
