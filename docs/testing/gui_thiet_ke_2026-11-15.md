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

## Vẽ lại bản đồ truyền tống (V-20261114-54: người dùng 2026-11-15 — đúng thế đất, trấn góc trái dưới, icon nhỏ)

Ảnh nền mới `design/scene/ban-do/ban-do-goc.png` + `screens/BanDo-trang-thai.png`, toạ độ / `r` mới ở `ban-do.json`
(Khởi Nguyên Trấn (440; 800) trên núi Ba Thục giữa biển mây, Nhà của ta (230; 975) đảo mây góc trái dưới của trấn, Trúc
Lâm (860; 740) đồng bằng Trung Nguyên; biểu tượng × 0,36; vùng chạm r 120 / nhà 95; ghim dx −62; huy hiệu dx 46 dy −46).
Artboard còn bố cục cũ → phiên `/ui-design` thay ảnh nền + dời ghim / huy hiệu theo toạ độ mới, không đổi kiểu vẽ:
`BanDo-doc`, `BanDo-ngang`, `BanDo-giay`, `TruyenTongDai`, `NhaTa-ban-do` (nơi Nhà của ta không còn ở Trung Nguyên
(1190; 560) — nay ở vùng Ba Thục).

## Đổi tên 6 vùng (V-20261114-50 → V-20261114-53: người dùng chốt bộ tên Hán Việt cổ trang ngày 2026-11-15)

Code + đặc tả cảnh + `design/scene/ban-do/ban-do.json` + ảnh bản đồ (`ban-do-goc.png`, `screens/BanDo-trang-thai.png`) +
`design/l10n/vi.arb` đã theo tên mới (R-HANH-1: nguồn tên là `ban-do.json` `ten`; mã cảnh không đổi). Bộ tên từ láy của
V-50 (cột giữa) đã bỏ — artboard nào lỡ thay theo V-50 thì thay tiếp sang cột phải. Artboard trên canvas còn tên cũ →
phiên `/ui-design` thay chữ, không đổi bố cục.

| Tên gốc | V-50 (bỏ) | Tên mới (mã cảnh) |
|---|---|---|
| Rừng trúc | Rừng Trúc Rì Rào | **Trúc Lâm** (`rung-truc`) |
| Giang Nam | Phố Nước Lung Linh | **Yên Vũ Lâu** (`giang-nam`) |
| Bồng Lai | Đảo Mây Bồng Bềnh | **Bồng Lai Đảo** (`bong-lai`) — "Bồng Lai Các" (tên lầu) giữ |
| Trường Thành | Ải Gió Lồng Lộng | **Nhạn Môn Quan** (`truong-thanh`) — biển "Trường Thành" trên quan thành (tên công trình) giữ |
| Tử Cấm Thành | Cung Vàng Rực Rỡ | **Tử Cấm Thành** (`tu-cam-thanh`) — như tên gốc |
| Con đường tơ lụa / Tơ lụa | Đường Cát Leng Keng | **Đôn Hoàng Lộ** (`to-lua`) |

Tên vùng dài nhất 13 ký tự ("Nhạn Môn Quan"); cả bộ nơi dài nhất vẫn là "Khởi Nguyên Trấn" 16.

| Artboard (`design/source/`) | Chỗ có tên cũ |
|---|---|
| `BanDo-doc`, `BanDo-ngang`, `TruyenTongDai`, `HanhTrinh-so-do`, `canvas.json` | nhãn nơi, thẻ "— sắp mở", sơ đồ 7 chặng (ảnh nền mới đã ở `design/scene/ban-do/ban-do-goc.png`) |
| `BanDoVung-lon-tct-doc` | tên cảnh đầu giấy / cổng (nếu đã đổi theo V-50 "Cung Vàng Rực Rỡ" → trả về "Tử Cấm Thành") |
| `CuoiHac-bay-*`, `CuoiHac-may-*` (7 bản) | dòng tên nơi đến dưới "Cưỡi hạc tới" — tên vùng ≤ 13 ký tự, vừa một dòng ở 360 px |
| `NgoiOn-*` (7 bản), `NgoiMat-*` (10 bản, nhiều nhất `NgoiMat-bien-the`) | "Học ở Rừng trúc", gợi ý "chọn Rừng trúc", dải "Đã học đủ 50 bộ thủ Rừng trúc", đầu cuộn "… · Rừng trúc" (code cắt "…" khi dài) |
| `TuHoc-*` (3), `CachChoi-doc-dau*` (2), `Dau-doc-chua-hoc` | "Học bộ mới ở Rừng trúc", "tới Rừng trúc tu luyện" |
| `TheBoThu-*` (3), `OnTap-doc-tong-ket`, `NhiemVu-*` (3), `TuLuyen-*` (5) | dòng vùng (`region`), "Ngồi thiền ở Rừng trúc" |
| `Chat-*` (5) | ví dụ tin nhắn nêu tên vùng (tuỳ — chỉ là chữ mẫu) |

Cần thiết kế thêm: không còn. (V-50 ghi hai việc — biển cổng vùng tên dài bị nén ngang và nhãn "Đảo Mây Bồng Bềnh" che
đường ra bến — tên V-53 ngắn: biển cổng `giang-nam` "Yên Vũ Lâu" / `bong-lai` "Bồng Lai Đảo" không còn bị nén, nhãn
"Bồng Lai Đảo" trên bản đồ truyền tống nằm dưới đầu đường ra bến, không che — ảnh V-53.)

## 2026-11-15.29 Vườn rau + Tạp hoá Hạt giống (/ui-apply V-20261115-62)

Người dùng đã chốt luật thiết kế đề xuất: mua hạt chọn **× 1 · × 5 · × 10** (R-VUON-9 sửa sổ, chờ đồng bộ online). Còn lại:

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| `shopSeedSub` (dòng trên lưới tab Hạt giống) + dòng phụ hộp xác nhận hạt | "Mỗi lần mua 1 hạt vào túi hạt · …" | R-VUON-9 (mới): chọn × 1 · × 5 · × 10 mỗi lần mua | lưới: "Hạt vào túi hạt · gieo ở Vườn rau · mua × 1 · × 5 · × 10, mua được nhiều lần"; hộp: "Hạt vào túi hạt · gieo ở Vườn rau. Trong túi: n." — xin `/ui-design` đặt lại chuỗi `shopSeedSub` |
| `VuonRau-kho-ngang` (vượt trần) | đã bán 40, kho 4 Bí đỏ + 2 Ngô (+3 Cải) → nút "Bán · +20" | R-VUON-7: bán theo giá cao trước, không bán lẻ nửa cái → Bí đỏ 2 (14) + Ngô 1 (5) = **+19** (ví dụ sổ mới) | số thật theo luật ("Bán · +19"); dòng "Hôm nay còn bán được 20 — …" đúng như vẽ |
| Hình cây 8 loại | artboard chỉ vẽ 6 (Cải ngọt, Củ cải, Ngô, Lúa, Bí đỏ, Hoa cúc) | R-VUON-4 có Dưa hấu, Trà | code tự dựng Dưa hấu (quả xanh sọc + lá) và Trà (bụi tròn + búp non) cùng kiểu — xin vẽ chuẩn hai hình |
| Tấm báo (dọc) | trái 132 (cạnh bản đồ nhỏ tròn 104) | R-BANDO-1 (người dùng đổi 2026-11-15): bản đồ nhỏ vuông 148 / 128 | trái = bản đồ nhỏ + 12 (dọc ≈ 180, tấm hẹp hơn, chữ xuống dòng); ngang: trên 12, sau bản đồ 128 — xin vẽ lại `VuonRau-tam-bao` với bản đồ vuông |
| Ấn son Tạp hoá | artboard hạt dùng ấn chữ Việt "Tạp hoá"; đề xuất đổi ấn 雜貨 cũ | R-HUD-4 | đã đổi cả Flutter + web sang ấn "Tạp hoá" (trước đó code bỏ hẳn ấn) — các artboard `CuaHang-*` cũ (2026-11-14.12) còn 雜貨, xin vẽ lại |
| Thứ tự hàng kho | Bí đỏ · Cải ngọt · Ngô | (không có luật) | theo bảng cây (Cải ngọt · Ngô · Bí đỏ) — cùng thứ tự thẻ hạt / Tạp hoá |
## Bản máy tính: theo yêu cầu người dùng (V-20261115-67, 2026-11-15)

Thiết kế .35 (`ThanhCongCu-*`) chỉ vẽ điện thoại (dọc + ngang). Người dùng xem bản web trên máy tính: "không cần hiện nút
joystick và nên di chuyển phần thanh công cụ sang trái". Code đã theo luật mới; xin `/ui-design` vẽ thêm artboard máy tính.

| Mục thiết kế | Thiết kế vẽ gì | Luật nói gì | Code đang làm |
|---|---|---|---|
| 2026-11-15.35 Thanh công cụ | màn ngang: vòng joystick gợi ý góc dưới trái, thanh 380 × 56 giữa đáy | R-DIEU-1 (máy tính dùng chuột, chưa chạm màn: không hiện joystick gợi ý), R-THANH-1 (máy tính màn ngang: thanh sát trái đáy) | máy `(hover: hover) and (pointer: fine)` chưa chạm → `body.ban-may` (`web/src/input/cheDoNhap.ts`): ẩn `#joyGhost`; thanh trái safe + 12, rộng min(380, màn − 218); bảng Biểu cảm trái safe + 12 (mũi nhọn vẫn trỏ ô Biểu cảm); tấm báo "Bạn đang ở Nhà của ta" giữa thanh. Chạm màn cảm ứng → về bố cục điện thoại. Điện thoại / máy tính bảng không đổi |
| 2026-11-14.9 Trò chuyện (V-20261115-70) | nút "Trò chuyện" tròn bên phải; Enter / nút → khung kênh + ô nhập sát mép dưới (ngang: khung gọn trái trên) | R-CHAT-3 (máy tính dùng chuột: ô nhập luôn hiện trên thanh, Enter / bấm ô để gõ, Esc / Enter khi trống / bấm ra ngoài = thôi gõ), R-THANH-1 (máy tính: đang gõ thanh vẫn hiện) | `body.ban-may` + thanh hiện → `#chat.dock` (`ui/chatPanel.ts`, `chat.css`): ô nhập cao 40 kính, trái safe + 12, rộng bằng thanh, đáy safe + 72 (dọc 76), gợi ý "Nhấn Enter để trò chuyện…"; đang gõ → viền ngọc + nút Gửi, khung kênh cao 240 ngay trên ô; khung thu gọn 3 tin ngay trên ô; nút Trò chuyện tròn ẩn. Bảng Biểu cảm + tấm báo nhà nâng lên trên ô (đáy safe + 126 / 122); Túi đồ mở → thanh ẩn → ô ẩn. Điện thoại / máy tính bảng không đổi |

## V-69 — Trang trí tự do (2026-11-15.42) — lệch / đề xuất khi áp

- Luật theo đề xuất thiết kế đã ghi sổ (R-NHA-6): chế độ trang trí ẩn thanh công cụ + bản đồ nhỏ; cầm món trên điện thoại → khay túi thu
  thành dải "Đang cầm"; máy tính chọn thẻ khác khi đang cầm → món đang cầm về túi / chỗ cũ rồi cầm món mới. Không lệch luật.
- Vùng cấm khi cầm: code tô phủ `lacquer` 12 % (không gạch chéo) — gạch chéo cần texture / shader riêng; đề xuất giữ tô phẳng.
- Viền khung chân "3 px": code vẽ dải 6 cm trên mặt đất (WebGL không vẽ được đường dày); nhìn từ camera trang trí ≈ 2–3 px.
- Nhãn tên nhân vật ẩn khi trang trí (thiết kế không vẽ nhãn; nhãn đè hàng nút khi món gần nhân vật).
- Hàng nút cầm món bám **mép chân gần camera** + 24 px, kẹp trong màn (cách đáy ≥ 110 px để không đè dải "Đang cầm").
- Chuỗi bỏ (`decorSlot*`, `decorPick`, `decorReplace`, `decorRemove`, `decorPlacedHere`, `decorOwned`, `decorHint`, `shopOwned`,
  `shopAllBought`, `bagPlaced`): code không còn dùng — phiên thiết kế xoá khỏi `design/l10n/vi.arb`.
- Dòng giải thích dưới "Không đặt được — {lý do}": thiết kế chỉ vẽ cho "Chắn lối"; code thêm một dòng cho từng lý do (chưa có chuỗi
  trong vi.arb — đề xuất thêm `decorWhy*`).
