# Phiếu: Ảnh concept Thành Cát Ngủ Quên (vùng `to-lua`, mở HSK 7–9 / mở rộng)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2. Quyết định 0006.
- Cảnh hiện tại: nền trống, đặc tả `design/scene/to-lua.json` (nền 160 m, màu cát `#cfae74`).
- Nên `/khao-cuu` trước khi dựng: thành lũy đất nện vùng sa mạc cổ (cổng thành, lầu cổng), cây hồ dương, ốc đảo.
- Nơi lưu khi chốt: `design/concept/thanh-cat-ngu-quen/toan-canh.png`, `cong-trinh.png`, `vao.png`.

## Mục đích
Đồi cát vàng, một toà thành cổ lún trong cát; người chơi **đào cổ vật** ở các ụ cát lấp lánh. Học qua trò (từ vựng, **chờ người
dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): chủ đề lịch sử / đồ vật / nghề — đào được đồ vật thì nghe và gọi đúng tên
(chuông, bình, đồng tiền…), đoán đồ đó của người làm nghề gì. Câu chào: "Dưới lớp cát vàng, một toà thành cổ đã ngủ quên cả
ngàn năm…"

## Bố cục (toạ độ m theo `to-lua.json`, x đông, z nam)
| Chỗ | Toạ độ | Ghi chú |
|---|---|---|
| Bãi hạc / chỗ xuất hiện | (-1,25; 56) | sân đá cổ lộ ra khỏi cát, phía nam |
| Cổng đông → Đỉnh Hạc Bay | (46,6; 19,5) | lối đá đổi dần sang cỏ |
| **Cổng Thành Vùi Cát** | ≈ (0; -5) | giữa khung khi nhìn từ bãi hạc |
| Tường thành vùi | hai đoạn tường đất nện chạy sang hai bên cổng, chỉ nhô ≈ 1–2 m | lối đi bên trên tường |
| Đầu lạc đà đá | cạnh cổng, phía đông ≈ (14; 0), cao ≈ 8 m | nhô nửa đầu khỏi cát |
| Ụ cát đào | 6–8 ụ rải quanh, có cọc gỗ cắm cờ vải (trơn) | trò đào cổ vật |
| Ốc đảo nhỏ | tây nam ≈ (-25; 30), ao + 3–4 cây hồ dương | chỗ nghỉ, lều NPC nhà khảo cổ |

## Công trình đặc trưng: Cổng Thành Vùi Cát
Cổng thành đất nện cổ, nghiêng nhẹ, cát vùi tới nửa vòm cửa (vòm còn lộ ≈ 3 m); trên cổng là **lầu cổng** gỗ một tầng mái ngói
xám đã sứt, một góc mái sụp nhẹ, một bên cát tràn lên thành dốc để người chơi trèo lên. Cao tổng ≈ 16 m, rộng ≈ 20 m. Bên cạnh:
**đầu lạc đà đá** khổng lồ hiền lành nhô khỏi cát. Màu đất nện `#C9A06A`, bóng `#A97E50`, gỗ `#7A5A40`, ngói `#6E6A66`, đá lạc
đà `#D8C3A0`.

## Bảng màu + giờ
Nắng chiều muộn sắp hoàng hôn: cát `#E2B878`, mặt khuất `#C98F5A`; trời lam đậm `#4F9BD9` chuyển hồng cam `#E27D5F` ở chân trời;
gió cát nhẹ (vài vệt cát bay); ốc đảo xanh `#6FA87A`, nước `#6A9AAE`. Ấm, yên, hơi bí ẩn nhưng không đáng sợ.

## Phong cách
Như ảnh cảnh hiện có (`design/screens/Canh-truc-lam-b3-dinh.png`, `Canh-truc-lam-b3-bai-hac.png`): low-poly hoạt hình mềm, đồi
cát là mặt đa giác mềm. Không chữ Hán, không chữ trên cổng / cờ / đồ vật.

## Góc ảnh
1. `toan-canh`: chếch từ trên cao (≈ 45°) từ phía nam: đồi cát, cổng thành + tường vùi, đầu lạc đà, ụ đào, ốc đảo, lối ra đông.
2. `cong-trinh`: cận cổng thành + đầu lạc đà, ¾ từ đông nam, ngang thấp; Tiểu Mặc đứng ở dốc cát trước cổng để so cỡ.
3. `vao`: từ bãi hạc nhìn bắc, ngang tầm người chơi.

## Tiêu chí chốt
- Nhận ra ngay "thành cổ ngủ quên dưới cát"; cổng là thứ to và nổi nhất; khác hẳn các vùng khác về màu (cam vàng).
- Không chữ (kể cả hoa văn giống chữ trên cổng).

## Dán vào canvas
```text
PHIẾU CONCEPT: Thành Cát Ngủ Quên (vùng to-lua) — 2026-11-17
Đồi cát vàng chiều muộn sắp hoàng hôn. Bãi hạc nam (-1,25;56); cổng đông (46,6;19,5) đi Đỉnh Hạc Bay. Công trình: cổng thành
đất nện cổ ≈(0;-5) nghiêng, cát vùi nửa vòm, lầu cổng gỗ mái ngói sứt, tổng cao 16 m; tường thành vùi hai bên; đầu lạc đà đá
khổng lồ cạnh cổng ≈(14;0). 6–8 ụ cát đào có cờ vải trơn; ốc đảo nhỏ tây nam có hồ dương. Low-poly hoạt hình mềm, không chữ.
3 ảnh: toan-canh, cong-trinh, vao. Lưu design/concept/thanh-cat-ngu-quen/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: thanh-cat-ngu-quen
loai: concept
tham-chieu: design/screens/Canh-truc-lam-b3-dinh.png, design/screens/Canh-truc-lam-b3-bai-hac.png
mau: toan-canh
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, cute, friendly — not realistic, not scary, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat shading, matte clay-like materials, pastel colours, simple chunky shapes, no harsh shadows. The place: "The Sleeping Sand City" — golden rolling sand dunes in late afternoon just before sunset: sand #E2B878 with shaded sides #C98F5A, deep blue sky #4F9BD9 turning rose-orange #E27D5F at the horizon, a light breeze blowing a few thin streaks of sand. The landmark: the "Sand-Buried City Gate" — an ancient rammed-earth city gate, slightly tilted, buried in sand up to half of its arched doorway (about 3 m of the arch still visible), topped by a one-storey wooden gate tower with a worn grey tiled roof, one roof corner gently sagging; a sand slope piles up on one side so a child could climb onto it; about 16 m tall and 20 m wide in total; low remains of earthen city walls run out to both sides, only 1–2 m above the sand. Beside the gate, a giant gentle stone camel head (about 8 m tall) pokes out of the sand. Around the dunes, six to eight small sparkling sand mounds marked by little wooden stakes with plain cloth flags (dig spots). In the south-west, a small oasis: a little pond with three or four poplar trees and a small canvas tent. Earth #C9A06A, wood #7A5A40, roof tiles #6E6A66, camel stone #D8C3A0, oasis green #6FA87A. No text anywhere: no Chinese characters, no letters, no carved writing or writing-like patterns on the gate, no signs, no logo, no watermark. Landscape 16:9.
```

```gemini toan-canh
High three-quarter bird's-eye view from the south, about 45 degrees down: the dunes with the buried city gate and its low walls in the centre, the stone camel head beside it, the dig mounds scattered around, the oasis at the lower-left, a path leaving to the right (east) toward greener land; an old stone-paved arrival plaza emerging from the sand at the bottom of the frame.
```

```gemini cong-trinh
Close view of the buried city gate and the stone camel head: three-quarter view from the south-east, low camera, the whole gate tower and camel head in frame; a small chibi child in pale blue hanfu stands on the sand slope in front of the gate for scale; warm sunset light.
```

```gemini vao
Player's view: standing on the old stone arrival plaza in the south at eye level of a small child, looking north across the dunes; the buried city gate with its gate tower in the middle distance, the camel head beside it, a dig mound with a little cloth flag nearby.
```
