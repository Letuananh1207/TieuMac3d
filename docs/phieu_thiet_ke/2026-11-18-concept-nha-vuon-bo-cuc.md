# Phiếu: Ảnh concept Bố cục nhà + vườn (Nhà của ta — `nha-ta`, bố cục lại cả đảo)

- Trạng thái: chờ thiết kế (tạo ảnh Gemini → người dùng chọn **một** phương án → chốt)
- Việc: V-20261118-82 (mở rộng). Hồ sơ khảo cứu: `docs/tham_khao/nha-vuon-bo-cuc.md` (nguyên tắc N1–N9 + số đo + nguồn), kèm
  `docs/tham_khao/vuon-de-vao.md`. Quyết định 0006.
- **Thay phiếu** `2026-11-18-concept-vuon-de-vao.md` (chỉ dời vườn — bỏ). Người dùng sau khi xem ảnh phiếu đó: "Tôi nghĩ cũng
  nên đổi vị trí nhà và vườn tôi nghĩ nên tham khảo của các game như 摩尔 hay animal crossing,.."
- Ảnh đính kèm Gemini (giữ phong cách): `design/screens/Canh-nha-ta-dao.png` (đảo nổi trên mây, vách, đồi trúc — **bỏ** cổng
  lầu + hành lang mái cũ trong ảnh), `design/screens/Canh-nha-ta-trang-tri-tu-do.png` (nhà chính hiện tại, lối đá, đồ trang trí
  tự do), `design/screens/Canh-lam-vuon-tuoi.png` (luống, Tiểu Mặc, thùng gỗ).
- Nơi lưu khi chốt: `design/concept/nha-vuon-bo-cuc/<góc>.png` (góc của phương án được chọn là đủ).

## Giữ nguyên (cả ba phương án)
Đảo tròn ∅ ≈ 54 m trên biển mây, tâm (0; −2); đồi trúc phía bắc; hai cụm tùng mép tây / đông; **Bến mây** x −3 … 3, z 13 … 23
lan can gỗ, vòng về trấn (0; 21); chỗ xuất hiện (0; 6,5) nhìn bắc (cưỡi hạc) và (0; 10) (đi bộ); nhà chính model `nha-ta`
10,5 × 6 (tường vôi, mái ngói xám, nhìn nam); 12 luống 1,6 m bước 2,6; thùng thu mua gỗ. **Không rào quanh vườn** — viền đá
cuội thấp; chạm luống ở đâu cũng mở vòng công cụ. Không thêm vòng trận ở nhà.

## Ba phương án
| PA | Bố cục | Quãng đi từ (0; 6,5) — luống gần / xa / cửa nhà |
|---|---|---|
| **A — Trục giữa** (khuyên) | Nhà chính **cuối lối trục**, tâm (0; −11,5), dựa đồi trúc, sân lát nhỏ trước nhà x −7 … 7, z −8,5 … −5,5. Lối trục thẳng từ bến tới cửa. **6 luống mỗi bên lối** (x ±3,4 / ±6,0, z 2,6 / 0 / −2,6) ngay giữa chỗ xuất hiện và nhà. Thùng (2,3; 5) mép lối. Hai cánh cỏ tây / đông để trang trí | 5,2 m / 10,9 m / 14,4 m · 0 rẽ |
| **B — Cụm tây** | Nhà tâm (−9; −4) nhìn nam; lối nhánh z −0,4 từ trục sang cửa; **vườn 4 × 3 luống ngay trước cửa nhà**, giữa nhà và Bến mây (x −4,4 … −12,2, z 2,4 … 7,6); thùng (−2,2; 1,4) ở ngã rẽ. **Cả nửa đông trống** (≈ 520 m²) để trang trí | 4,5 m / 12,9 m / 15,9 m · 1 rẽ |
| **C — Vườn đón khách** | **Vườn khối vuông giữa đảo** ngay trước chỗ xuất hiện (x −5,4 … 5,4, z −4 … 2,8), lối trục đi xuyên giữa vườn; nhà tây bắc tâm (−8; −9), lối nhánh z −5,4; thùng (6,2; 3) góc đông nam vườn. Trang trí tây nam + đông | 4,9 m / 10,7 m / 19,9 m · 1 rẽ |

Sơ đồ chữ từng PA: hồ sơ khảo cứu mục 4.

## Phong cách
Đúng như ảnh cảnh đính kèm: low-poly hoạt hình mềm, mặt tam giác phẳng, màu phấn, cỏ xanh non, đất luống nâu, tre / gỗ vàng
nhạt, trời lam nhạt, biển mây trắng quanh đảo. **Không chữ**: không chữ Hán, không chữ Latin, không biển có chữ, không logo,
không HUD.

## Góc ảnh (mỗi phương án 2 góc)
1. `<pa>-tren`: cả đảo nhìn chéo từ trên (~55°) từ phía nam, như `Canh-nha-ta-dao.png` nhưng cao hơn — thấy rõ Bến mây, chỗ
   xuất hiện, lối, nhà, vườn, thùng, khu cỏ trống để trang trí.
2. `<pa>-vao`: góc camera game lúc vừa xuất hiện — sau lưng Tiểu Mặc ~4 m, cao ~2,5 m, đứng (0; 6,5) nhìn bắc.

## Tiêu chí chốt (người dùng chọn một)
- Ảnh `-vao` thấy **luống gần trong 2–3 bước** và thấy nhà; không rào chắn.
- Nhà – vườn – thùng thành **một cụm** dễ hiểu; còn mảng cỏ rộng thấy rõ để bày đồ.
- Đảo vẫn thoáng, nhà dựa đồi / mép, không chữ.
- Sau khi chọn: sửa sổ luật R-NHA-1, R-NHA-5, R-NHA-7, R-VUON-1, R-VUON-2, R-VUON-7, R-VUON-8 (xem hồ sơ mục 5) →
  `/dong-bo-quy-tac` → đặc tả `nha-ta.json` (Canvas 3D) → code (V-82).

## Dán vào canvas
```text
PHIẾU CONCEPT: Bố cục nhà + vườn — Nhà của ta (2026-11-18, V-82, thay phiếu vuon-de-vao)
Giữ đảo nổi trên mây, Bến mây nam, chỗ xuất hiện (0;6,5) nhìn bắc, đồi trúc bắc, nhà chính tường vôi mái xám, 12 luống, thùng gỗ.
Không rào quanh vườn (viền đá cuội thấp).
A Trục giữa: nhà cuối lối trục ở bắc giữa đảo, dựa đồi trúc; 6 luống mỗi bên lối giữa chỗ xuất hiện và nhà; hai cánh cỏ trống.
B Cụm tây: nhà nửa tây gần giữa; vườn 4x3 ngay trước cửa nhà, giữa nhà và bến; thùng ở ngã rẽ; cả nửa đông trống để trang trí.
C Vườn đón khách: vườn khối vuông giữa đảo ngay trước chỗ xuất hiện, lối trục xuyên giữa; nhà tây bắc sau vườn.
Mỗi PA 2 ảnh: <pa>-tren (cả đảo chéo ~55° từ nam), <pa>-vao (sau lưng Tiểu Mặc ở chỗ xuất hiện, nhìn bắc).
Low-poly hoạt hình mềm, màu phấn, không chữ. Lưu design/concept/nha-vuon-bo-cuc/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: nha-vuon-bo-cuc
loai: concept
tham-chieu: design/screens/Canh-nha-ta-dao.png, design/screens/Canh-nha-ta-trang-tri-tu-do.png, design/screens/Canh-lam-vuon-tuoi.png
mau: khong
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, cute, friendly — not realistic, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat-shaded terrain, matte clay-like materials, pastel colours, light grass green, pale blue sky, white cloud sea all around, soft haze, no harsh shadows. Ignore any user-interface overlay, labels or signboards in the screenshots, and ignore the old roofed gate and side corridors in the island screenshot — they no longer exist. The scene is the player's own home, redesigned: a small round floating grass island (about 54 m across) with low-poly earthen cliffs dropping into a sea of clouds. Fixed features: on the south edge a short stone-paved pier with low wooden railings sticking out over the clouds (the way back to town); a hill with a belt of tall bamboo along the north edge; small clumps of layered pine trees at the west and east edges. The single house is the one in the attached screenshot: a long one-storey whitewashed house with a grey tiled gable roof, dark timber posts and paper lattice windows, about 10.5 m wide and 6 m deep, facing south (front toward the camera), with small red lanterns at the door but NO sign board. The vegetable garden has exactly twelve small square raised soil beds (each about 1.6 m, brown soil with three furrows, some with small green sprouts, a few with ripe golden crops sparkling), on light orange packed earth, edged only by low round pebbles — NO fence around the garden — plus one small wooden selling crate. Paths are 2.4 m wide grey stone paving. The rest of the island is open soft lawn kept empty on purpose for the player's own decorations (only a few tiny tufts and pebbles). The small chibi child in pale blue hanfu with a black hair bun is the player (about 1.1 m tall, small compared with the house). No text anywhere: no Chinese characters, no letters, no numbers, no signs with writing, no logo, no watermark. Landscape 16:9.
```

```gemini a-tren
Option A "central axis", island overview: camera high above the south edge, looking north at about 55 degrees down, the whole island in frame. One straight stone path runs from the pier northward through the middle of the island and ends at the house, which stands at the far (north) end of the path in the middle of the island, its back against the bamboo hill, with a small stone-paved forecourt in front of it. Between the pier and the house the twelve beds line BOTH sides of the path: six beds (two columns x three rows) on the left of the path and six on the right, each block starting one step from the path. The wooden selling crate stands at the right edge of the path just before the first beds. Wide open empty lawns fill the left (west) and right (east) parts of the island. The child stands on the path at the inner end of the pier.
```

```gemini a-vao
mau: a-tren
Option A "central axis", player view: camera behind and above the child (about 4 m back, 2.5 m up, looking slightly down), the child seen from behind in the centre foreground standing on the stone path near the south of the island, looking north. The straight path runs ahead to the house, which faces us at the end of the path with the bamboo hill behind it — a welcoming "coming home" view. Garden beds begin just one or two steps ahead on BOTH sides of the path, three rows each side, no fence, a small wooden crate at the right edge of the path. Open lawn on the far left and far right.
```

```gemini b-tren
Option B "west cluster", island overview: camera high above the south edge, looking north at about 55 degrees down, the whole island in frame. A stone path runs from the pier north a short way, then a side path turns west (left) to the house, which stands in the west-centre of the island facing south. Directly in front of the house, between the house and the pier, lies the garden: twelve beds in three rows of four, filling the south-west area just left of the main path, so house, garden and crate form one tight cluster on the left half. The wooden selling crate stands at the corner where the side path leaves the main path. The whole right (east) half of the island is one large open empty lawn waiting for decorations. The child stands on the path at the inner end of the pier, right beside the nearest beds.
```

```gemini b-vao
mau: b-tren
Option B "west cluster", player view: camera behind and above the child (about 4 m back, 2.5 m up, looking slightly down), the child seen from behind in the centre foreground standing on the stone path near the south of the island, looking north. Immediately to the left, one step away, the garden beds begin and stretch away to the left in three rows, with the house just behind them on the left facing us; a side path turns left to the house door, with a small wooden crate at that corner. To the right is a wide open empty lawn reaching to the pine trees at the east edge. Bamboo hill in the distance ahead.
```

```gemini c-tren
Option C "welcome garden", island overview: camera high above the south edge, looking north at about 55 degrees down, the whole island in frame. The garden is a compact square block in the very middle of the island, right in front of the pier: twelve beds in three rows of four, with the main stone path running straight through the middle of the garden (two columns of beds on each side of the path). Beyond the garden, the house stands in the north-west part of the island facing south, reached by a side path that turns west from the main path just past the garden. The wooden selling crate stands at the south-east corner of the garden. The bamboo hill in the north-centre stays fully visible. Open empty lawns in the south-west and the whole east side. The child stands on the path at the inner end of the pier.
```

```gemini c-vao
mau: c-tren
Option C "welcome garden", player view: camera behind and above the child (about 4 m back, 2.5 m up, looking slightly down), the child seen from behind in the centre foreground standing on the stone path near the south of the island, looking north. The path leads straight into the garden a few steps ahead: beds on both sides of the path, two columns each side, three rows deep, so the garden fills the middle of the frame like a little square; a small wooden crate at its right corner. Beyond the garden, the house stands at the upper left facing us, with the bamboo hill in the centre background. Open lawn at the left and right edges.
```
