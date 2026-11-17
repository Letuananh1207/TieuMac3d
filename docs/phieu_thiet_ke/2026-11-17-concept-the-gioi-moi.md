# Phiếu: Ảnh concept bản đồ thế giới mới (8 nơi, bộ "Phiêu lưu kỳ ảo")

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` (người dùng chọn bộ 2, 2026-11-17; giữ
  Khởi Nguyên Trấn + Nhà của ta). Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0006-anh-concept-truoc.md`.
- Nơi lưu khi chốt: `design/concept/the-gioi-moi/ban-do.png` (+ `CHANGELOG` loại concept).
- Đợi bởi: 6 phiếu concept vùng cùng ngày (`2026-11-17-concept-*.md`); sau khi chốt → `/lead` đổi tên vùng (khung V-53) + vẽ
  lại `design/scene/ban-do/ban-do-goc.png` bằng `ve-ban-do.html` (tên do trang vẽ, **không** lấy chữ từ ảnh Gemini).

## Mục đích
Một ảnh bản đồ tổng thể để người dùng duyệt **cảm giác cả thế giới**: 8 nơi nằm đâu, mỗi nơi có biểu tượng (công trình đặc
trưng) gì, màu miền nào, đường nào nối. Đây là ảnh duyệt hướng, không phải ảnh dùng trong app.

## Bố cục (giữ đúng vị trí `design/scene/ban-do/ban-do.json`, khung 2048 × 1152, gốc trên trái)
| Nơi (mã) | Toạ độ px | Biểu tượng vẽ trên bản đồ | Màu miền |
|---|---|---|---|
| Khởi Nguyên Trấn (`van-uyen`) | 440, 800 | đỉnh núi trong biển mây, một lầu mái xanh | xanh xám núi |
| Nhà của ta (`nha-ta`) | 230, 975 | đảo nhỏ nổi trên biển mây, nhà ngói + khóm trúc | trắng mây |
| Thung Trúc Gió Hát (`rung-truc`) | 860, 740 | thung trúc, **Tháp Sáo Trúc** (bó ống trúc cao) | lục non |
| Chợ Đêm Đèn Hoa (`giang-nam`) | 1400, 790 | phố bên sông, **Cây Đèn Trăm Tầng** sáng vàng | xanh lam chiều + đỏ son |
| Rừng Nấm Tiên (`tu-cam-thanh`) | 1430, 300 | nấm khổng lồ, **lò đồng ba chân** trên mũ nấm, khói tím | tím nhạt, hồng |
| Cung Ngọc Đáy Biển (`bong-lai`) | 1880, 610 | dưới làn nước trong: **cung vỏ ốc xà cừ**, san hô | xanh ngọc |
| Đỉnh Hạc Bay (`truong-thanh`) | 930, 235 | rừng cột đá, **tổ hạc** trên cột cao nhất, hạc bay | trắng đá, lam trời |
| Thành Cát Ngủ Quên (`to-lua`) | 330, 290 | đồi cát, **cổng thành lún nửa trong cát**, đầu lạc đà đá | cam cát |

Đường nối giữ như V-59: trấn – Trúc; Trúc – Chợ Đêm; Trúc – Đỉnh Hạc; Chợ Đêm – Rừng Nấm; Đỉnh Hạc – Rừng Nấm; Đỉnh Hạc – Thành
Cát (đường cát); Chợ Đêm – Cung Ngọc là **đường thuyền** (chấm trắng trên biển). Sông lớn chảy từ tây sang đông qua giữa bản đồ
như cũ. Bỏ Vạn Lý Trường Thành ở mép trên, bỏ tên miền Hán Việt (Tây Vực, Kinh Kỳ…); mép trên, mép dưới là sương mù "chưa khám
phá" (không chữ).

## Phong cách
Bản đồ giấy vẽ tay kiểu hoạt hình mềm, cùng chất ảnh `design/scene/ban-do/ban-do-goc.png` (mảng màu phẳng, viền miền nét đứt,
biểu tượng nhỏ đặt trên đĩa tròn). **Không chữ nào**: tên do code vẽ lên sau.

## Tiêu chí chốt
- 8 biểu tượng đọc ra ngay là nơi nào khi đặt cạnh bảng trên; mỗi miền một màu, không hai miền trùng tông.
- Vị trí gần đúng toạ độ (lệch ≤ ~80 px); đường nối đúng cặp.
- Không chữ, không chữ Hán, không ký hiệu giống chữ, không watermark.

## Dán vào canvas
```text
PHIẾU CONCEPT: Bản đồ thế giới mới Học Xá 3D — 8 nơi, bộ "Phiêu lưu kỳ ảo" (2026-11-17)
Một ảnh 2048×1152 (16:9), bản đồ giấy vẽ tay hoạt hình mềm như design/scene/ban-do/ban-do-goc.png, KHÔNG CHỮ.
Giữ vị trí 8 nơi theo design/scene/ban-do/ban-do.json; thay biểu tượng: Tháp Sáo Trúc (giữa), Cây Đèn Trăm Tầng (đông, bên
sông), Lò Thuốc Tiên trên nấm khổng lồ (đông bắc), Cung Vỏ Sò dưới biển (biển đông), Tổ Hạc trên Cột Đá (bắc), Cổng Thành Vùi
Cát (tây bắc); Khởi Nguyên Trấn + Nhà của ta giữ như cũ. Bỏ Trường Thành và tên miền. Đường nối như V-59, Chợ Đêm – Cung Ngọc là
đường thuyền. Lưu: design/concept/the-gioi-moi/ban-do.png.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: the-gioi-moi
loai: concept
tham-chieu: design/scene/ban-do/ban-do-goc.png
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary, set in a gentle ancient-Chinese fairy-tale world (light xianxia, cute, friendly — not realistic, not dark, not modern). Style: hand-drawn illustrated paper map, soft cartoon, flat pastel colour areas with subtle paper grain, region borders as soft dashed lines, each place shown as a small cute 3D-looking icon standing on a round light disc. Wide landscape 16:9 (2048 x 1152). ABSOLUTELY NO WRITING anywhere: no letters, no Chinese characters, no labels, no symbols that look like writing, no compass letter, no legend, no logo, no watermark.
```

```gemini ban-do
The attached map is ONLY a layout reference: keep its coastline, the big river flowing west to east across the middle, the sea on the right side and the cloud sea at the bottom-left, and keep the eight places at the same positions — but REMOVE every text label, remove the Great Wall along the top edge, and replace the place icons as follows.
Bottom-left: a misty mountain top rising from a white cloud sea with one small green-roofed pavilion (the home town). Below-left of it: a tiny floating island on the cloud sea with a small grey-tiled house and a clump of bamboo (the player's home).
Centre (green valley): a bamboo valley with a tall tower made of a bundle of thick bamboo tubes of different heights, like giant panpipes, light green-yellow.
East, beside the river with small ponds: a little riverside town at dusk, with a tree-shaped stand of many glowing round lanterns in tiers (vermilion and warm gold glow).
North-east (soft lilac region): a forest of giant pink and cream mushrooms; on top of the biggest flat mushroom cap stands a bronze three-legged cauldron puffing lilac smoke.
Far east, in the teal sea near a small isle: seen through clear turquoise water, a palace made from a giant spiral pearly conch shell with pink coral around it.
North (white-grey stone region): a cluster of tall rounded stone pillars with pine trees on top, thin rope bridges between them, a big twig nest with white red-crowned cranes on the tallest pillar, cranes flying.
North-west (warm orange sand region): golden sand dunes with an ancient city gate tower half-buried and tilted in the sand, and a big stone camel head poking out of the sand beside it.
Roads: light dirt paths link home town to bamboo valley; bamboo valley to riverside town and to the stone pillars; riverside town to the mushroom forest; stone pillars to the mushroom forest and (sandy path) to the desert; a white dotted boat route links the riverside town to the sea palace. Top and bottom edges fade into soft unexplored mist. Each region a clearly different soft colour.
```
