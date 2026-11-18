# Phiếu: Ảnh concept Nhà sống động (Nhà của ta — `nha-ta` + gian trong `nha-ta-trong`)

- Trạng thái: **nháp — chờ người dùng quyết có tạo ảnh không** (đợt 1 được miễn concept theo quyết định 0006 vì chỉ thêm vật nhỏ;
  phiếu này để duyệt **không khí** trước khi dựng, và xem trước ao cá + góc thú của đợt 2 — ao là khu mới, **bắt buộc** concept
  trước khi làm B2).
- Việc: V-20261118-114. Phiếu ý tưởng: `docs/y_tuong/2026-11-18-nha-song-dong.md` (ý A1–A5, B1–B4, C1–C2, C5).
- Ảnh đính kèm Gemini (giữ phong cách + bố cục "Trục giữa" đã chốt V-82): `design/screens/Canh-nha-ta-truc-giua-tren.png`,
  `design/screens/Canh-nha-ta-truc-giua-vao.png`; gian trong: `design/screens/Canh-nha-ta-trong.png`.
- Nơi lưu khi chốt: `design/concept/nha-song-dong/<góc>.png`.

## Giữ nguyên (không đổi bố cục V-82)
Đảo tròn ∅ ≈ 54 m trên biển mây; Bến mây nam + lối đá trục thẳng tới nhà; nhà model `nha-ta` (tường vôi, mái ngói xám, 2 đèn
lồng đỏ ở cửa, biển trên cửa **không chữ trong ảnh**) cuối lối, dựa đồi trúc bắc; 12 luống (6 mỗi bên lối, viền đá cuội, không
rào); thùng thu mua gỗ mép phải lối; cụm tùng mép tây / đông; hai cánh cỏ tây / đông.

## Thêm vào ảnh (đợt 1)
- Sân trước: 2 đèn lồng cột gỗ hai bên sân lát, 2 chậu lan trước bậc; **hộp thư gỗ nhỏ có mái** bên trái lối, mép sân trước.
- Dọc mép lối trục: hàng hoa dại thấp (trắng, vàng, hồng phấn).
- Cánh tây: bàn trà gỗ + 2 đôn dưới cụm tùng; **2 cây táo** tròn có quả đỏ. Cánh đông: 1 cây táo, một trúc cảnh.
- Sinh vật: vài bướm trên luống có cây, 2–3 chim sẻ trên cỏ; mây trôi thấp quanh đảo, 2 đảo đá nhỏ lơ lửng xa có cây.
- Theo giờ (ảnh chiều tối): khói bếp mỏng từ góc mái sau, cửa sổ sáng vàng ấm, đèn lồng sáng, trời hoàng hôn cam hồng.
- Gian trong: án đọc + đôn cạnh cửa sổ, kệ sách nhỏ, sạp ngủ gỗ thấp có chăn, thảm, bàn thấp với bình trà, tranh treo (không chữ
  trong ảnh), chậu cây; **tường thẻ gỗ nhỏ** cạnh án đọc (thẻ trơn, không chữ).
- Xem trước đợt 2 (ảnh `dot2-tren`): **ao nhỏ có cầu đá** ở cánh đông, **góc thú** (ổ rơm + bát gỗ) cạnh hiên nhà có một mèo con.

## Phong cách
Như ảnh đính kèm: low-poly hoạt hình mềm, mặt phẳng tam giác, chất đất sét mờ, màu phấn, trời lam nhạt, biển mây trắng.
**Không chữ**: không chữ Hán, không chữ Latin, không số, không biển có chữ, không logo, không HUD.

## Góc ảnh
1. `tren` — cả đảo chéo ~55° từ nam, ban ngày (như `Canh-nha-ta-truc-giua-tren.png`) với mọi thứ đợt 1.
2. `vao-chieu` — góc camera game sau lưng Tiểu Mặc ở chỗ xuất hiện, nhìn bắc, **chiều tối** (đèn, khói, cửa sổ sáng).
3. `trong` — gian trong, góc camera như `Canh-nha-ta-trong.png` nhưng cao hơn, thấy cả phòng đã bày bộ khởi đầu.
4. `dot2-tren` — như `tren` nhưng có thêm ao cá cánh đông + góc thú (chỉ để xem trước, không chốt đợt 1).

## Tiêu chí chốt
- Ảnh `tren` / `vao-chieu` **không còn cảm giác trống** nhưng hai cánh cỏ vẫn còn chỗ để bày đồ (≥ ½ diện tích cánh trống).
- Đồ thêm không che lối trục, luống, cửa nhà; không chữ.
- Gian trong ấm, đủ chức năng (học, ngủ, uống trà), còn chỗ trống bày thêm.
- Sau khi chọn: sửa sổ luật (phiếu ý tưởng §5) → `/dong-bo-quy-tac` → đặc tả `nha-ta.json` / `nha-ta-trong.json` (Canvas 3D) → code.

## Dán vào canvas
```text
PHIẾU CONCEPT: Nhà sống động — Nhà của ta (2026-11-18, V-114, không bắt buộc cho đợt 1)
Giữ bố cục Trục giữa V-82: Bến mây nam, lối đá thẳng tới nhà dựa đồi trúc, 6 luống mỗi bên lối, thùng gỗ phải lối, cụm tùng 2 mép.
Thêm: đèn lồng cột + chậu lan sân trước, hộp thư gỗ trái lối, hoa dại dọc lối, bàn trà + 2 cây táo cánh tây, 1 cây táo + trúc cảnh cánh đông,
bướm, chim sẻ, mây trôi, đảo đá nhỏ xa. Chiều tối: khói bếp, cửa sổ sáng, đèn lồng sáng.
Gian trong: án đọc, kệ sách, sạp ngủ, thảm, bàn trà thấp, tranh, chậu cây, tường thẻ gỗ trơn.
Đợt 2 xem trước: ao nhỏ cầu đá cánh đông, góc thú (ổ rơm, bát, mèo con) cạnh hiên.
Góc: tren · vao-chieu · trong · dot2-tren. Low-poly mềm, màu phấn, không chữ. Lưu design/concept/nha-song-dong/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: nha-song-dong
loai: concept
mau: khong
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, cute, friendly — not realistic, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat-shaded surfaces, matte clay-like materials, pastel colours, light grass green, pale blue sky, white cloud sea, soft haze, no harsh shadows. Ignore any user-interface overlay or labels in the screenshots. No text anywhere: no Chinese characters, no letters, no numbers, no signs with writing, no logo, no watermark.
```

```gemini tren
tham-chieu: design/screens/Canh-nha-ta-truc-giua-tren.png
The scene is the player's own home on a small round floating grass island (about 54 m across) with low-poly earthen cliffs dropping into a sea of clouds, and the layout must stay EXACTLY as in the screenshots: a short stone pier with low wooden railings on the south edge, one straight grey stone path (2.4 m wide) running north from the pier to the house; the house is a long one-storey whitewashed house with a grey tiled gable roof, dark timber posts, paper lattice windows and two small red lanterns at the door (no writing on any board), standing at the north end of the path on a small stone-paved forecourt, its back against a hill with tall bamboo; twelve small square soil beds (six on each side of the path, two columns by three rows, low pebble edging, no fence), some with green sprouts and a few with golden ripe crops; one small wooden selling crate at the right edge of the path; clumps of layered pine trees at the west and east edges. The home now feels lived-in and alive but not crowded: two wooden post lanterns at the corners of the forecourt and two potted orchids beside the steps; a small wooden mailbox with a tiny tiled roof on a post at the left side of the path near the forecourt; a low strip of wild flowers (white, butter yellow, soft pink) along both edges of the path; on the west lawn a low wooden tea table with two round stools under the pines and two round apple trees with red fruit; on the east lawn one apple tree and a slender potted bamboo. A few white and yellow butterflies over the beds, two or three small brown sparrows hopping on the grass, low puffy clouds drifting around the island and two tiny far-away floating rock islets with little trees. More than half of each side lawn stays open and empty for the player's own decorations. The small chibi child in pale blue hanfu with a black hair bun is the player (about 1.1 m tall). Landscape 16:9. Island overview in bright daytime: camera high above the south edge, looking north at about 55 degrees down, the whole island in frame, same framing as the attached screenshot. The child stands on the path near the pier. Show clearly every new item: forecourt lanterns and orchids, the mailbox left of the path, flower strips along the path, the tea table and two apple trees on the west lawn, the apple tree and potted bamboo on the east lawn, butterflies, sparrows, drifting clouds and far islets.
```

```gemini vao-chieu
tham-chieu: design/screens/Canh-nha-ta-truc-giua-vao.png
The scene is the player's own home on a small round floating grass island (about 54 m across) with low-poly earthen cliffs dropping into a sea of clouds, and the layout must stay EXACTLY as in the screenshots: a short stone pier with low wooden railings on the south edge, one straight grey stone path (2.4 m wide) running north from the pier to the house; the house is a long one-storey whitewashed house with a grey tiled gable roof, dark timber posts, paper lattice windows and two small red lanterns at the door (no writing on any board), standing at the north end of the path on a small stone-paved forecourt, its back against a hill with tall bamboo; twelve small square soil beds (six on each side of the path, two columns by three rows, low pebble edging, no fence), some with green sprouts and a few with golden ripe crops; one small wooden selling crate at the right edge of the path; clumps of layered pine trees at the west and east edges. The home now feels lived-in and alive but not crowded: two wooden post lanterns at the corners of the forecourt and two potted orchids beside the steps; a small wooden mailbox with a tiny tiled roof on a post at the left side of the path near the forecourt; a low strip of wild flowers (white, butter yellow, soft pink) along both edges of the path; on the west lawn a low wooden tea table with two round stools under the pines and two round apple trees with red fruit; on the east lawn one apple tree and a slender potted bamboo. A few white and yellow butterflies over the beds, two or three small brown sparrows hopping on the grass, low puffy clouds drifting around the island and two tiny far-away floating rock islets with little trees. More than half of each side lawn stays open and empty for the player's own decorations. The small chibi child in pale blue hanfu with a black hair bun is the player (about 1.1 m tall). Landscape 16:9. Player view at dusk: camera behind and above the child (about 4 m back, 2.5 m up, looking slightly down), same framing as the attached screenshot, the child seen from behind on the stone path, looking north toward the house at the end of the path. Warm sunset sky in peach, coral and lavender, the cloud sea tinted pink. The lanterns at the door and the two post lanterns glow warm orange with a small soft halo, the paper windows glow warm yellow from inside, a thin wisp of grey-white cooking smoke rises from behind the roof. Garden beds on both sides of the path a step ahead, flower strips along the path, the mailbox at the left near the forecourt, an apple tree visible on each side lawn, a few fireflies starting to appear near the bamboo hill.
```

```gemini trong
tham-chieu: design/screens/Canh-nha-ta-trong.png
Interior of the player's own home, seen from a slightly high camera near the door looking into the single large room (no ceiling shown, wooden beams above), same style as the attached interior screenshot. The house is a long one-storey whitewashed house with a grey tiled roof seen from inside: warm wooden plank floor, cream plaster walls with dark timber posts, two paper lattice windows letting in soft daylight, two round orange paper lanterns hanging. The room is now furnished with a cosy starter set, leaving open floor in the middle: a low reading desk with a floor cushion beside the left window; next to the desk a wall of small blank wooden plaques hanging in neat rows (plain wood, nothing written on them); a small bookshelf with scrolls and bound books; in the back right corner a low wooden day-bed with a folded quilt in soft blue; a round woven rug in the middle; a low tea table with a clay teapot and two cups; a hanging painting of mountains and a crane (no writing); a potted green plant by the right window. Cosy, tidy, children's-book feeling. The small chibi child in pale blue hanfu stands near the rug (about 1.1 m tall). Landscape 16:9. No text anywhere: no characters, no letters, no numbers.
```

```gemini dot2-tren
tham-chieu: design/screens/Canh-nha-ta-truc-giua-tren.png
The scene is the player's own home on a small round floating grass island (about 54 m across) with low-poly earthen cliffs dropping into a sea of clouds, and the layout must stay EXACTLY as in the screenshots: a short stone pier with low wooden railings on the south edge, one straight grey stone path (2.4 m wide) running north from the pier to the house; the house is a long one-storey whitewashed house with a grey tiled gable roof, dark timber posts, paper lattice windows and two small red lanterns at the door (no writing on any board), standing at the north end of the path on a small stone-paved forecourt, its back against a hill with tall bamboo; twelve small square soil beds (six on each side of the path, two columns by three rows, low pebble edging, no fence), some with green sprouts and a few with golden ripe crops; one small wooden selling crate at the right edge of the path; clumps of layered pine trees at the west and east edges. The home now feels lived-in and alive but not crowded: two wooden post lanterns at the corners of the forecourt and two potted orchids beside the steps; a small wooden mailbox with a tiny tiled roof on a post at the left side of the path near the forecourt; a low strip of wild flowers (white, butter yellow, soft pink) along both edges of the path; on the west lawn a low wooden tea table with two round stools under the pines and two round apple trees with red fruit; on the east lawn one apple tree and a slender potted bamboo. A few white and yellow butterflies over the beds, two or three small brown sparrows hopping on the grass, low puffy clouds drifting around the island and two tiny far-away floating rock islets with little trees. More than half of each side lawn stays open and empty for the player's own decorations. The small chibi child in pale blue hanfu with a black hair bun is the player (about 1.1 m tall). Landscape 16:9. Island overview in bright daytime, same camera as an overview from high above the south edge (about 55 degrees down, whole island in frame), with everything described above PLUS two future additions: on the east lawn, a small natural pond (about 7 m across) with clear blue-green water, lily pads, round stones around its edge and a tiny arched stone footbridge or a short wooden fishing deck, a few orange fish shadows in the water; and beside the front of the house on the east side of the forecourt, a little pet corner with a round straw bed, a wooden food bowl and a cute small cream-and-ginger kitten curled up on the straw. The west lawn and the rest of the east lawn still have open empty grass.
```
