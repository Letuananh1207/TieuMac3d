# Phiếu: Ảnh concept Nông trại Nhà của ta (`nha-ta`, bố cục "Trục giữa" V-82)

- Trạng thái: **chờ tạo ảnh** (phiên chính chạy `gemini-anh.sh tao`) → người dùng chọn ý + chốt ảnh.
- Việc: V-20261118-114 (lượt 2 — người dùng thu hẹp phạm vi 2026-11-18: chỉ nông trại ngoài sân, "hãy gen ảnh cho các ý tưởng").
  Thay phiếu `2026-11-18-concept-nha-song-dong.md` (bỏ). Phiếu ý tưởng: `docs/y_tuong/2026-11-18-nha-song-dong.md` §2.
- Quyết định 0006: công trình mới ở nhà → ảnh concept trước, chốt rồi mới sửa sổ luật / đặc tả / code.
- Ảnh đính kèm Gemini (giữ phong cách + bố cục): `design/screens/Canh-nha-ta-truc-giua-tren.png` (mọi góc),
  `design/screens/Canh-nha-ta-truc-giua-vao.png` (góc `gian-dua`).
- Nơi lưu khi chốt: `design/concept/nong-trai-nha/<góc>.png`.

## Giữ nguyên (không đổi bố cục V-82)
Đảo tròn ∅ ≈ 54 m trên biển mây; Bến mây nam + lối đá trục thẳng tới nhà; nhà `nha-ta` (tường vôi, mái ngói xám, 2 đèn lồng đỏ ở
cửa, **không chữ trong ảnh**) cuối lối dựa đồi trúc bắc; 12 luống (6 mỗi bên lối, 2 cột × 3 hàng, viền cuội, không rào); thùng thu
mua gỗ mép phải lối; cụm tùng mép tây (nam) và mép đông (bắc).

## Góc ảnh — mỗi ý một ảnh + ảnh tổng
| Góc | Ý | Chỗ trên đảo (x đông, z nam, m) | Nhân vật đang làm |
|---|---|---|---|
| `chuong-ga` | chuồng gà + sân gà rào tre | cánh tây bắc, cạnh nhà ≈ (−13; −10) | nhặt trứng trong ổ rơm, gà quanh chân |
| `cay-qua` | 3 cây quả: táo, đào, cam | cánh tây nam ≈ (−13; 6), trước cụm tùng | lắc cây táo, quả rụng |
| `to-ong` | 2 đõ ong gỗ | giữa cánh tây ≈ (−16; −2), cạnh luống hoa | lấy hũ mật, ong bay quanh |
| `bu-nhin` | bù nhìn nón lá | mép tây vườn rau ≈ (−8,3; 1) | đứng cạnh, chim sẻ bay vụt lên |
| `gieng-nuoc` | giếng có gàu + máng tre | cánh đông, góc đông bắc luống ≈ (9; −5) | kéo gàu múc nước, bình tưới bên cạnh |
| `kho-thoc` | vựa thóc + cối giã gạo chày đạp | cánh đông bắc, cạnh nhà ≈ (11; −11) | đạp chày giã gạo |
| `ao-ca` | ao nhỏ + bến gỗ câu cá | thềm đông ≈ (18; 0), ao ∅ ≈ 7 m | ngồi bến câu cá, phao trên nước |
| `chuong-bo` | chuồng bò con + máng cỏ | cánh đông nam ≈ (12; 8) | bỏ cỏ khô vào máng, bò con ăn |
| `gian-dua` | giàn tre vòm qua lối, bầu + dưa leo | trên lối, đoạn nam z ≈ 8…11 | đứng dưới giàn hái quả bầu |
| `tong` | toàn đảo có đủ 9 ý | — | đứng trên lối |

## Phong cách
Như ảnh đính kèm: low-poly hoạt hình mềm, mặt phẳng tam giác, chất đất sét mờ, màu phấn, trời lam nhạt, biển mây trắng. Cổ trang
Trung Hoa vùng quê (tre, gỗ, ngói xám, rơm, đá) — không cối xay gió châu Âu, không máy móc hiện đại. Con vật cute tròn trịa.
**Không chữ**: không chữ Hán, không chữ Latin, không số, không biển có chữ, không logo, không HUD.

## Tiêu chí chọn / chốt
- Mỗi thành phần đọc được ngay là gì, đúng chỗ đề xuất, **không che lối trục, luống, cửa nhà, thùng thu mua**.
- Ảnh `tong`: đảo hết trống nhưng không chật; còn cỏ trống cho đồ trang trí (R-NHA-2).
- Người dùng chọn ý nào làm (có thể bỏ ý) → chốt ảnh các ý chọn → sửa sổ luật (phiếu ý tưởng §5) → `/dong-bo-quy-tac` → đặc tả
  `nha-ta.json` (Canvas 3D) → code.

## Dán vào canvas
```text
PHIẾU CONCEPT: Nông trại Nhà của ta (2026-11-18, V-114 lượt 2 — chỉ nông trại ngoài sân)
Giữ bố cục Trục giữa V-82: Bến mây nam, lối đá thẳng tới nhà dựa đồi trúc, 6 luống mỗi bên lối, thùng gỗ phải lối, tùng 2 mép.
Mỗi ý một ảnh, nhân vật chibi đang làm:
chuong-ga (tây bắc cạnh nhà, nhặt trứng) · cay-qua (tây nam: táo đào cam, lắc cây) · to-ong (giữa tây, lấy mật) ·
bu-nhin (mép tây vườn) · gieng-nuoc (đông bắc luống, múc nước) · kho-thoc (đông bắc cạnh nhà, giã gạo chày đạp) ·
ao-ca (thềm đông, câu cá ở bến gỗ) · chuong-bo (đông nam, cho bò con ăn cỏ) · gian-dua (giàn tre vòm qua lối đoạn nam, hái bầu) ·
tong (toàn đảo đủ 9 ý). Low-poly mềm, màu phấn, cổ trang vùng quê, không chữ. Lưu design/concept/nong-trai-nha/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: nong-trai-nha
loai: concept
tham-chieu: design/screens/Canh-nha-ta-truc-giua-tren.png
mau: khong
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese countryside fairy-tale world, cute, friendly — not realistic, not modern, no European windmills, no machines). Rendering style: EXACTLY like the attached in-game screenshot — soft low-poly 3D, faceted flat-shaded surfaces, matte clay-like materials, pastel colours, light grass green, pale blue sky, white cloud sea, soft haze, no harsh shadows. Ignore any user-interface overlay or labels in the screenshot. The scene is the player's own home farm on a small round floating grass island (about 54 m across) with low-poly earthen cliffs dropping into a sea of clouds. The existing layout must stay as in the screenshot: a short stone pier with low wooden railings on the south edge; one straight grey stone path (2.4 m wide) running north from the pier to the house; the house is a long one-storey whitewashed house with a grey tiled gable roof, dark timber posts, paper lattice windows and two small red lanterns at the door, on a small stone-paved forecourt at the north end of the path, its back against a hill with tall bamboo; twelve small rectangular soil beds (six on each side of the path, two columns by three rows, low white pebble edging, no fence), some with green sprouts, some with golden ripe crops; one small wooden selling crate at the right (east) edge of the path, south of the beds; clumps of layered pine trees at the west edge (south part) and the east edge (north part); open grass lawns west and east of the beds. The player is a small chibi child (about 1.1 m tall) in pale blue hanfu with a black hair bun. Materials of the farm: bamboo, unpainted wood, straw, grey tiles, rough stone. Keep the new farm element clear of the stone path, the beds, the house door and the selling crate. Landscape 16:9. No text anywhere: no Chinese characters, no letters, no numbers, no signs with writing, no logo, no watermark.
```

```gemini chuong-ga
NEW FARM ELEMENT — a little chicken coop: on the north-west lawn, just west of the house (left of the house when looking north), a small raised wooden hen house with a grey tiled mini roof, a tiny ramp, and a nest box full of straw with a few white and light-brown eggs; around it a small yard (about 7 by 5 m) bordered by a low woven bamboo fence knee-high, with a wooden feed trough and a shallow water dish; four cute round chickens (white, cream and one light brown, red combs) pecking at scattered golden grain. The chibi child kneels at the nest box holding up an egg happily, a small woven basket with eggs beside her. Camera: three-quarter view from the south-east, mid-height (about 10 m up, 14 m away), the coop and yard large in frame, the corner of the house and the bamboo hill visible behind, a few garden beds at the right edge of the image to show where it sits on the island.
```

```gemini cay-qua
NEW FARM ELEMENT — a small fruit orchard: on the south-west lawn, in front of the west pine trees, three round low-poly fruit trees in a loose row about 4 m apart — an apple tree with red apples, a peach tree with soft pink blossoms and pink-orange peaches, and an orange tree with bright orange fruit — each with a ring of darker grass at its foot and a few fallen fruits. The chibi child stands under the apple tree, both hands on the trunk shaking it, apples falling with small motion lines, a woven basket on the grass. Camera: three-quarter view from the south-east, mid-height (about 9 m up, 13 m away), the three trees large in frame, the west pine clump behind them, the edge of the island cliff and the cloud sea at the left, the stone path and a few garden beds at the right edge of the image.
```

```gemini to-ong
NEW FARM ELEMENT — beehives: on the middle of the west lawn, between a small chicken yard (further north) and fruit trees (further south), two traditional Chinese log beehives — short round hollow wooden logs lying on a low wooden stand, each with a little straw or tiled cap — next to a small patch of yellow chrysanthemum flowers; a few tiny round cute bees flying in loops around the hives and the flowers. The chibi child stands beside the hives holding a small clay honey jar with golden honey, smiling, one bee near her head. Camera: three-quarter view from the south-east, fairly close (about 6 m up, 9 m away), hives and child large in frame, the garden beds and stone path visible at the right edge, the cloud sea at the far left.
```

```gemini bu-nhin
NEW FARM ELEMENT — a scarecrow: at the west edge of the west group of garden beds, a cute friendly scarecrow on a wooden cross — straw body, a faded patched indigo cotton jacket, a wide conical bamboo hat, a round cloth face with a simple stitched smile (no writing), straw sticking out of the sleeves, a small red ribbon fluttering. Two or three little brown sparrows flutter up from the beds into the air. The chibi child stands next to the scarecrow waving at the flying sparrows. Camera: three-quarter view from the south-west, mid-height (about 7 m up, 11 m away), the scarecrow and the west beds large in frame, the stone path and the house visible behind.
```

```gemini gieng-nuoc
NEW FARM ELEMENT — a water well: on the east lawn, just north-east of the east group of garden beds (between the beds and the house), a round stone well with a low wall of rough grey stones, a small grey tiled roof on two wooden posts, a wooden crank with rope and a wooden bucket; beside it a short open bamboo-pipe channel on little forked sticks leading toward the beds, with clear water trickling out; a damp darker patch of stones around the well. The chibi child turns the crank pulling up the bucket full of sparkling water, a small wooden watering can at her feet. Camera: three-quarter view from the south-east, mid-height (about 8 m up, 12 m away), well and child large in frame, the east garden beds in the foreground left, the house and bamboo hill behind.
```

```gemini kho-thoc
NEW FARM ELEMENT — a granary and a rice pounder: on the north-east lawn, just east of the house (right of the house when looking north), a small raised wooden granary on short stone stilts with a grey tiled roof and a little ladder, a few tied sacks of grain stacked at its foot and a bundle of golden rice sheaves; in front of it under a tiny open thatched shelter a traditional foot-operated rice pounder (a long wooden lever on a pivot with a wooden pestle above a stone mortar). The chibi child stands on the end of the lever, pressing it down with one foot so the pestle lifts, white rice grains in the mortar. Camera: three-quarter view from the south-west, mid-height (about 9 m up, 13 m away), granary, pounder and child large in frame, the east side of the house and the forecourt at the left, the east pine trees and the cloud sea at the right.
```

```gemini ao-ca
NEW FARM ELEMENT — a fishing pond: on the flat terrace of the east lawn (east of the garden beds, near the east edge of the island), a small natural round pond (about 7 m across) with clear blue-green water, round grey stones around its edge, a few lily pads with one pink lotus flower, reeds on one side, and a short wooden fishing deck sticking out over the water; a few orange fish shadows under the surface. The chibi child sits at the end of the deck with legs dangling, holding a simple bamboo fishing rod, the line ending in a small red-and-white float in the water with ripples around it, a small woven fish basket beside her. Camera: three-quarter view from the south-west, mid-height (about 8 m up, 13 m away), the pond and child large in frame, the east garden beds at the left edge, the east pine clump behind the pond, the cliff edge and the cloud sea beyond.
```

```gemini chuong-bo
NEW FARM ELEMENT — a little calf pen: on the south-east lawn (east of the stone path near the pier, south of the selling crate), a small open wooden cattle shed with a grey tiled roof on four posts, a bed of straw, a wooden hay trough and a short low split-rail wooden fence around a small yard; inside a cute round-faced little yellow-brown calf with tiny horns and big gentle eyes, eating hay; a small stack of dried grass bundles next to the shed and a clay milk jug on a stool. The chibi child holds an armful of dried grass, putting it into the trough for the calf. Camera: three-quarter view from the south-west, mid-height (about 8 m up, 12 m away), the pen, calf and child large in frame, the stone path at the left, the garden beds and house in the background.
```

```gemini gian-dua
tham-chieu: design/screens/Canh-nha-ta-truc-giua-vao.png
NEW FARM ELEMENT — a bamboo gourd trellis arch over the path: on the southern part of the stone path, between the pier and the garden beds, a tunnel-like arched trellis made of bamboo poles (about 2.8 m high, about 3 m long, posts standing on the grass just outside both sides of the path so the path stays open), covered with green climbing vines and big leaves; hanging from it a few pale green bottle gourds (calabash shapes) and slim green cucumbers, small yellow flowers. The chibi child stands under the trellis on the path reaching up with both hands to pick a bottle gourd. Camera: player view like the attached screenshot — behind and a little above the child (about 4 m back, 2.5 m up), looking north along the path through the trellis toward the garden beds and the house at the end of the path.
```

```gemini tong
WHOLE FARM OVERVIEW — the island with ALL of these new farm elements together, each small and clearly readable, not crowded, more than a third of each lawn still open grass: west side (left of the path): (1) north-west next to the house, a small raised wooden chicken coop with a grey tiled mini roof inside a low woven bamboo fence yard with four cute chickens; (2) middle of the west lawn, two small log beehives on a wooden stand next to a patch of yellow chrysanthemums; (3) south-west in front of the west pines, three round fruit trees in a row — apple with red apples, peach with pink peaches, orange with orange fruit; (4) at the west edge of the west garden beds, a cute scarecrow with a conical bamboo hat. East side (right of the path): (5) just north-east of the east garden beds, a round stone well with a tiny tiled roof and a bamboo water channel toward the beds; (6) north-east next to the house, a small raised wooden granary on stone stilts with a foot-operated rice pounder under a thatched shelter; (7) on the flat east terrace near the east edge, a small round pond with lily pads and a short wooden fishing deck; (8) south-east near the pier, a small open wooden calf shed with a little yellow-brown calf in a split-rail yard. On the path: (9) on the southern part of the path between the pier and the beds, a short arched bamboo trellis tunnel with green vines and hanging gourds. The chibi child stands on the path just north of the trellis. Camera: island overview in bright daytime, high above the south edge, looking north at about 55 degrees down, the whole island in frame, same framing as the attached screenshot.
```
