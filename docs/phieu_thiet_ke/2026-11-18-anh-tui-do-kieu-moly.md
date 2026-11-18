# Phiếu: Túi đồ kiểu 摩尔 — ảnh mẫu Gemini (V-116)
- Trạng thái: đã chốt (2026-11-18.13) — Giấy + son bản 1
- Đợi bởi: V-20261118-116

Người dùng 2026-11-18: "tôi muốn khi mở bag thì sẽ như phong cách này của 摩尔" (ảnh túi đồ 摩尔 bản web: thẻ nhân vật bên
trái, lưới ô 3×4 có số lượng, lật trang "1/1", tab phân loại dọc mép phải, nút đóng tròn). Chọn: **Gemini vẽ mẫu trước**; ô trái
là **nhân vật 3D xoay được + tên + tiền**.

Giữ: màu / chất liệu cổ trang của game (giấy, gỗ, son, ngọc — xem `design/screens/TuiDo-ngang.png`), chữ tiếng Việt, không
chữ Hán trên khung. Học bố cục 摩尔, không chép màu cam / hình nhân vật của họ. Ảnh tham chiếu bố cục 摩尔 để ngoài repo
(`C:/ai3d/gemini/ref/moly-tui.png`, không commit).

Tab đề xuất (theo túi đồ hiện có): Tất cả · Hạt giống · Nông sản · Lâm sản · Trang trí · Sách.

## Câu lệnh Gemini

```gemini-cau-hinh
ten: tui-do-kieu-moly
loai: concept
tham-chieu: C:/ai3d/gemini/ref/moly-tui.png, design/screens/TuiDo-ngang.png
mau: khong
```

```gemini chung
UI mockup for a cozy children's mobile game set in a gentle ancient-Chinese fairy-tale world (soft, cute, warm, not realistic). Draw ONE inventory / bag window floating over a softly blurred 3D game scene, landscape 16:9, like a polished game UI screenshot. LAYOUT exactly like the first attached image (a reference from another game — copy only the LAYOUT, not its colours or character): a round close button at the top-right corner of the window; LEFT panel = a character card: a small banner with the player name at the top, a large framed portrait area showing a cute chibi child in pale-blue ancient Chinese robe (hanfu) with a black hair bun standing on grass, a small star badge in a corner, and under the portrait a coin row with a round copper coin icon and a number; RIGHT panel = a grid of 3 columns x 4 rows of rounded square item slots, two or three slots filled with cute item icons (a seed pouch, a bunch of bamboo shoots, a red lantern) with a small number at the bottom-right of each, the other slots empty; under the grid a page switcher "‹ 1/1 ›"; along the RIGHT EDGE of the window a vertical column of 5–6 rounded category tabs, each with a small picture icon only (seed, harvest basket, bamboo, lantern/decoration, book), one tab highlighted. Use only digits and the arrows as text — NO letters, no Chinese characters, no words anywhere; the name banner shows a blank light strip. The second attached image shows our game's current colours and materials to follow.
```

```gemini giay-son
STYLE A — "paper and vermilion": warm cream rice-paper panels with soft wood-brown borders, vermilion-red accents on the close button, tabs and selected slot, jade-green small details, slots are light parchment squares with a thin brown inner line, gentle drop shadow, rounded corners.
```

```gemini go-ngoc
STYLE B — "wood and jade": panels framed in honey-coloured carved wood with soft rounded bevels, slots are pale jade-green rounded tiles, gold coin, tabs like small wooden plaques with pastel icons, selected tab glowing soft jade.
```

```gemini may-tien
STYLE C — "cloud and silk": very light lavender-white silk panels with soft cloud-shaped border ornaments, pastel pink and sky-blue accents, slots are soft white rounded pillows with a faint gold rim, tabs like little round cloud badges, airy and dreamy.
```
