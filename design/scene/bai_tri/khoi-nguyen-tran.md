# Bài trí Khởi Nguyên Trấn 起源鎮 · bản nháp chờ duyệt (V-20261114-17, gộp V-20261114-07)

Kế hoạch: `docs/tasks/2026-11-14-canh-dep.md` (NV11) · kế hoạch mẹ GĐ 3: `docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md` ·
danh mục mẫu: `design/kien_truc/danh_muc.md` · đặc tả: `design/scene/scene.json` (bản đang dùng — **không dời gì**, chọn 3A).
Phiên code soạn thay vai thiết kế (`/canh`); chưa ghi `design/CHANGELOG.md` — chờ người dùng duyệt cùng Canvas 3D.

## Một câu mục đích
Trấn khởi đầu và trạm gốc của hành trình: **xuất hiện ở Cổng Trấn (gặp Tiểu Mặc, nhận việc hằng ngày cạnh Tạp hoá) → Quảng Trường →
toả ra bốn hướng có việc làm** (Truyền Tống Đài đi vùng, Kỳ Văn Uyển chơi cờ chữ, Tàng Thư Các mượn sách / tự học, Thiên
Bậc lên Phẩm Minh Các uống trà nghe đàn) **→ về nhà qua ngõ Tạp hoá**.

## Luồng người chơi
1. Xuất hiện ngay trong cổng xuống núi (0; 48) — mọi lần vào trấn (mở app, về từ vòng trận, về từ Nhà của ta; V-39) — đi lên lối Cổng Trấn thấy ngay Tạp hoá bên trái, phía trước bên trái (bên phải tiệm khi nhìn vào mặt tiệm) là Tiểu Mặc và bảng "Nhiệm vụ hằng ngày"; ngõ "Nhà của ta", đèn đá hai bên lối.
2. Đi bắc vào Quảng Trường qua cổng mái ngói nam — nhật quỹ giữa sân.
3. Cổng đông → Truyền Tống Đài (Trận sư) · cổng tây → Kỳ Văn Uyển → Tàng Thư Các · cổng bắc → Thiên Bậc → Thượng Trấn.
4. Lối phụ Hậu Sơn: ao + thác (ngắm, nghỉ).

## Khu chức năng
| Khu | Vai | Trần cấp |
|---|---|---|
| Cổng Trấn | đón, nhận việc hằng ngày, mua bán, về nhà | C5 |
| Quảng Trường | trung tâm | C4 (tường bao C4) |
| Truyền Tống Đài | đi các vùng | — (đài) |
| Kỳ Văn Uyển | chơi trò chữ với NPC | C5 |
| Tàng Thư Các | mượn sách, tự học tầng 2 | C3 (`lau` L) |
| Thiên Bậc → Thượng Trấn | dẫn lên mốc cao nhất của trấn | C3 (`lau` M — trà lâu trên đỉnh, mốc nhìn từ xa) |
| Hậu Sơn | nghỉ, ngắm thác | — |

## Mọi công trình / vật
Mục đích: **hoạt động** (có việc làm, NPC, ngồi, chơi) · **dẫn đường** (cổng, lối, mốc) · **kể chuyện** (chất trấn tiên hiệp) ·
**nền xa** (chỉ ngắm, không va chạm).

| Tên | Ở đâu | Mẫu (danh mục) | Mục đích | Lý do / gắn với |
|---|---|---|---|---|
| Phẩm Minh Các (trà lâu 2 tầng) | (0; −60) | `lau` M (hàm cũ, 3A) | hoạt động + dẫn đường | Tiểu nhị, 18 chỗ ngồi tầng 2, nghe đàn (R-NHAC); mốc cao nhất nhìn từ Quảng Trường |
| Tàng Thư Các (lầu sách) | (−33; −22) | `lau` L (hàm cũ, 3A) | hoạt động | Thủ thư Điển Thư, mượn sách, khu tự học 24 bồ đoàn (R-VA-4/5) |
| Tạp hoá | (−11; 30) | `cua-hang` S (hàm cũ, 3A) | hoạt động | cửa hàng Văn tiền (R-TIEN) |
| Tường bao Quảng Trường + 4 cổng mái ngói | ±17 | `tuong` vôi L + `cong-tuong` `lau` L | dẫn đường | 4 cổng có biển chỉ hướng (đông Đài truyền tống, tây Sân chơi · Thư viện, bắc Bậc lên Trà lâu, nam Lối ra núi); **cổng nam bỏ mái ngói** (`roof: false`, V-39 — người dùng: "không hợp"), giữ khung gỗ + biển "Quảng trường" trên tường |
| Cổng xuống núi "Khởi Nguyên Trấn" | (0; 51) (V-39: từ z 41, lối dài thêm 10 m) | cổng sơn môn khối, cao 8 m (V-39: từ 6,6) | dẫn đường | cuối lối Cổng Trấn; ngay trong cổng là chỗ xuất phát (0; 48) |
| Vòng sáng "Về nhà" | (0; 54) chiếu nghỉ ngoài cổng, trước bậc xuống núi (z 56 → 77) | vòng cổng (`portals[].label`, `vongCong.ts`) | hoạt động + dẫn đường | bước vào → Nhà của ta (R-HANH-4); thay biển gỗ "Xuống núi · Về nhà" (bỏ, V-39) |
| Tường viện Kỳ Văn Uyển – Tàng Thư Các | x −51…−17 | `tuong` vôi M | dẫn đường | khoanh khu chơi + thư viện thành một viện |
| Khoảnh tường "Nhà của ta" + cổng | (−22; 36) | `tuong` vôi M + `cong-tuong` `lau` M | hoạt động + dẫn đường | cổng đi bộ sang Nhà của ta (R-HANH-4, V-16) |
| Truyền Tống Đài + 6 cột trận | đông sân | đài (code riêng) | hoạt động | Trận sư, đi vùng (R-HANH-2) |
| Nhật quỹ (đồng hồ mặt trời) | (0; 0) | `nhat-quy` | kể chuyện + dẫn đường | tâm sân, chữ 子丑寅…; mốc giữa trấn |
| 4 bồn hoa 梅 蘭 菊 竹 | quanh nhật quỹ | (vật cũ) `bon-hoa` | kể chuyện | "tứ quân tử" của văn nhân |
| Bảng "Nhiệm vụ hằng ngày" | (−7,5; 18,8) Cổng Trấn, bên phải Tạp hoá (phía bắc tiệm, sát tường trấn), mặt nhìn nam | `bang` | hoạt động | việc hằng ngày (R-NV-1); cách cửa tiệm 11,2 m; Tiểu Mặc đứng ngay bên phải — "Xem bảng" / "Nói chuyện" chỉ hiện nút của vật gần hơn (R-NV-3, R-NPC-2) |
| Tiểu Mặc | (−4,4; 19) ngay bên phải bảng (phía đông, cách mép bảng 1,4 m), sát mép tây lối chính, nhìn nam cùng hướng bảng | NPC | hoạt động | dẫn nhập, trông bảng; người chơi đi lên từ (0; 36) thấy cả bảng lẫn Tiểu Mặc; cách cửa tiệm (−8; 30) 11,6 m, cách trụ cổng (−4,8; 17) 2 m |
| Trận sư | (21,5; −4,5) | NPC | hoạt động | truyền tống |
| Bàn cờ · bàn Đấu chữ | (−34; 4), (−34; 11) | `ban-co` | hoạt động | trò chơi với NPC (R-GIAO) |
| 4 dây đèn lồng | Kỳ Văn Uyển | dây đèn | kể chuyện | không khí hội chữ; có quầng sáng (NV12) |
| Đèn đá ×6 hai bên lối Cổng Trấn | (±8,6; 35,5 / 41,5 / 47,5) (V-39: từ (±4,5; 27,5) + (±4,6; 39,4) — trước nằm trên nền lát, chắn đường) | `den-da` | dẫn đường | hàng đèn trên cỏ ngoài mép lát, cách đều 6 m, dẫn tới cổng xuống núi; có quầng sáng |
| Đèn đá ×4 Kỳ Văn Uyển | (−37 / −29; −15 / −3,5) | `den-da` | dẫn đường | lối giữa sân chơi → Tàng Thư Các |
| Cờ "Trà" | (11,5; −54,5) | `co` | dẫn đường | thấy từ chân Thiên Bậc: trên kia là trà lâu |
| Thiên Bậc (bậc đá) | x 0, z −52…−19 | `bac` | dẫn đường | lên Thượng Trấn |
| 5 lối lát đá | | `paths` | dẫn đường | nối các cổng |
| Tùng ×10 trong sân / lối | quanh Quảng Trường, Cổng Trấn, Tàng Thư Các | `tung` (tán tròn mềm NV8) | kể chuyện | tùng = khí tiết; có va chạm |
| Mai ×2 | Kỳ Văn Uyển (z 13,5) | `mai` | kể chuyện | hoa đầu xuân cạnh sân chơi |
| Rừng tùng 5 cụm (29 cây) | vòng ngoài, Thượng Trấn | `tung` | nền xa | che mép cao nguyên, không va chạm |
| Ao + thác + suối Hậu Sơn | (42; −71), (42; −80,5) | ao `nước stylized` (NV4) | kể chuyện | chỗ nghỉ ngắm cảnh, lối phụ |
| 3 đảo nổi + mây + biển mây + núi xa 3 lớp | xa | trời (NV7) | nền xa | chất tiên hiệp "cao nguyên giữa biển mây" |
| Cỏ búi, hoa khóm, đá rải | đất cỏ | `coHoa` (NV9) | nền xa | mặt đất "đầy", không va chạm |

## Bỏ
Không bỏ gì ở lượt này: mọi vật đang đặt đều có việc hoặc dẫn đường. **Đề xuất xem lại** (chờ người dùng): 4 bồn hoa quanh
nhật quỹ hơi dày khi đã có hoa rải ngoài sân — giữ vì có chữ 梅 蘭 菊 竹 (kể chuyện).

## Ngân sách (đo Canvas 3D 2026-11-14, sau NV4–NV12)
Góc chơi 52–53 draw call / ~79–81k tam giác · trên xuống 135 / 149,3k (≤ 150 / ≤ 150k). Số đủ ở kế hoạch, mục "Số đo".
