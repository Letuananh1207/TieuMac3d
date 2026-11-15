# Gói tài sản miễn phí: thực vật low-poly cho Đồi Chè (茶園 trà viên)
- Ngày: 2026-11-15 · Khu: Khởi Nguyên Trấn — Đồi Chè (`site.areas` "Đồi Chè" x 9…29, z −52…−36; 3 bậc ruộng y 0,9 / 2,7 / 4,5) · Việc: V-20261114-46 · Trạng thái: nháp — chờ người dùng chọn hướng (khuyên A)

## Một câu
Đồi chè trông sơ sài vì nó **không phải luống chè**: mỗi bậc chỉ là 6 bụi `bui` rời rạc (18 bụi, `trees.yard[].kind = "bui"`,
cách nhau 2,6 m, `scale 0.8`) mà `bui` lại là **"bụi lá thu hoàng lư" của Trường Thành** (`web/src/scene/cay_moi.ts` `addBush`:
3 khối 20 mặt / bụi, vật liệu `lambert` thường — **không gió**, không màu đỉnh, không bóng nướng). Đồi chè thật được nhận ra
bằng **những luống liền, mặt trên phẳng tròn như được xén ("mặt hái" 採摘面), chạy song song theo đường đồng mức**, giữa các
luống là rãnh đất hẹp. Có gói CC0 dựng sẵn đúng dạng "hàng rào cây xén mềm" — dùng làm luống chè được.

## Đặc điểm nhận diện (thiếu là "không ra chất")
1. **Luống liền, không bụi rời**: mỗi luống là một dải dài liền mạch, mép trên bo tròn, mặt trên gần phẳng (cây chè xén thành
   "bàn hái"). Ngoài đời hàng cách hàng 1,05–1,5 m, cây cách cây 0,75 m → nhìn xa là một khối liền.
2. **Song song theo bậc / đồng mức**: 2 luống mỗi bậc, chạy dọc chiều dài bậc; nhịp lặp "luống – rãnh – luống" là thứ mắt bắt.
3. **Dải màu trên → dưới**: mặt trên lục non sáng (búp mới), sườn lục giữa, chân luống tối gần đất (bóng nướng). Không phải
   một màu phẳng.
4. **Lay nhẹ**: mặt trên lay rất ít (chè cứng, thấp) — chủ yếu cỏ / hoa quanh luống và bướm làm cảnh "sống".
5. Rãnh giữa luống là đất / cỏ thấp, có lối người hái; đầu luống bo tròn, có thể có 1–2 cây chè đơn lẻ ở mép.
6. Không khí: sương sớm mỏng nằm dưới chân bậc, nắng xiên — đi kèm **người hái chè** đeo giỏ (NPC sau).

## Tỉ lệ · số đo (mét, hệ cảnh — đệ tử ≈ 1,6 m)
| Bộ phận | Ngoài đời | Trong cảnh | Ghi chú |
|---|---|---|---|
| Hàng cách hàng | 1,05–1,5 m (hàng đơn 1,2 × 0,75 m; hàng kép 1,35 × 0,75 × 0,75 m) | tâm luống cách ~1,4 m | nguồn TNAU / KAU / indiatea |
| Cao mặt hái | 0,65–1,2 m | **0,8 m** (dưới hông nhân vật) | nhìn từ camera chơi vẫn thấy mặt trên |
| Bề ngang luống | ~1–1,5 m (dải máy hái Nhật ~1,5 m) | **1,0 m** | để chừa rãnh 0,4 m |
| Bậc ruộng hiện có | — | 16,6 × 3,5 / 16,6 × 2,5 / 19 × 2,5 m | → 2 luống / bậc × 3 bậc = 6 luống ≈ 100 m |

## Gói đã tìm (miễn phí, dùng thương mại + đóng gói vào app được)
Tam giác = số **đo thật** bằng script đọc glTF (gói đã tải) hoặc ghi "ước" (chưa tải).

| # | Gói | Giấy phép (trích) | Định dạng | Tam giác / mẫu | Màu | Hợp "hoạt hình mềm, ấm"? | Giống luống chè? |
|---|---|---|---|---|---|---|---|
| 1 | **Tiny Treats — Pretty Park 1.0** (Isa Lousberg) — https://tinytreats.itch.io/pretty-park · cũng trên Poly Pizza (`Hedge Straight Long` https://poly.pizza/m/So5EAOMoNy) và OpenGameArt | "License: (Creative Commons Zero, CC0) … free to use in personal, educational and commercial projects. Support me by crediting Isa Lousberg … (this is not mandatory)" | glTF, FBX, OBJ (+ GLB trên Poly Pizza) | **đo**: `hedge_straight_long` 372 (4 × 1,5 × 1,5 m), `hedge_straight` 232, `hedge_corner` 432, `bush` 180, `bush_large` 312, `grass_A` 312, `grass_B` 208, `flower_A` 192, `flower_B` 166, `tree` 320 | 1 texture dải màu 1024² (**19 KB**) dùng chung + cỏ 256² | **Rất hợp**: khối bo tròn mềm, dải màu đậm chân → sáng đỉnh, kiểu Animal Crossing | **Có — gần nhất**: hedge dài mặt trên gợn sóng, bo đầu. Ép thấp (y × 0,55, z × 0,67) = luống chè 0,8 × 1,0 m |
| 2 | **KayKit — Forest Nature Pack 1.0 FREE** (Kay Lousberg) — https://kaylousberg.itch.io/kaykit-forest | "License: (Creative Commons Zero, CC0) … free to use in personal, educational and commercial projects." | glTF, FBX, OBJ | **đo**: bụi 44–984 (`Bush_2_A/4_A` 44, `Bush_1_E` 552), cỏ 14–528 (bản 1 mặt 14–168), đá 12–529, cây 324–2 228 | 1 texture dải màu 1024² (**48 KB**) | Hợp: tán bo tròn, màu tươi (hơi "lục chanh", phải chỉnh màu) | Không có hedge; bụi tròn cụm 3 quả bóng — làm cây chè đơn / bụi ven lối |
| 3 | **Kenney — Nature Kit 2.1** — https://kenney.nl/assets/nature-kit | "License: (Creative Commons Zero, CC0) … free to use in personal, educational and commercial projects." | GLB, FBX, OBJ (329 mẫu) | **đo**: `plant_bush*` 16–104, `grass*` 36–224, `flower_*` 76, `crops_bambooStage*` 276–564, `crops_leafsStage*` 76–84, `rock_small*` 16–20, `tree_pine*` 164–204 | không texture — màu theo vật liệu (1–3 vật liệu / mẫu) | **Lệch**: góc cạnh phẳng mặt (flat-shaded), giống đúng cái đang có (khối 20 mặt) | Không; `crops_leafs` + `crops_dirtRow` là luống rau |
| 4 | **Quaternius — Stylized Nature MegaKit** (bản Standard miễn phí 68/116 mẫu) — https://quaternius.com/packs/stylizednaturemegakit.html · https://quaternius.itch.io/stylized-nature-megakit | "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication" | glTF, FBX, OBJ | **đo**: `Bush_Common` 900, `Bush_Common_Flowers` 1 368, `Grass_Common_Short` 155, `Fern_1` 288, `Flower_3_Single` 285, cây 1 646–10 104 | texture 1–2K, **lá là thẻ cắt alpha (`alphaMode: MASK`)**, vỏ cây 2048² + normal (4–5,6 MB / ảnh) | Ảnh đẹp nhất (kiểu Ghibli), nhưng **nặng và tốn tô điểm ảnh** (alpha-test chồng lớp) trên GPU điện thoại; đẹp nhờ shader Unreal/Unity riêng | Không |
| 5 | **Quaternius — bamboo lẻ** (Poly Pizza, CC0): `Bamboo` https://poly.pizza/m/xBPj13w3JQ, `Bamboo` https://poly.pizza/m/FUgtfvqgMx, `Bamboo Mid` https://poly.pizza/m/z0d6CbNtrz | "Public Domain (CC0)" (nhãn trang) | GLB, FBX | **đo**: 1 200 / 400 / 656 | màu phẳng | Trung bình: thân lục xám nhạt, đốt vàng, mặt phẳng — dự án đã có `truc` / `truc-mao` dựng code đẹp hơn | — |

Nguồn khác đã xem, không chọn: Quaternius *Ultimate Nature* (2019, CC0, 150 mẫu, không texture — ước kiểu góc cạnh như Kenney),
*Ultimate Stylized Nature* (CC0, 63 mẫu, texture + normal map — nặng như #4); OpenGameArt "Low Poly Nature Group" (CC0, chưa
tải); Sketchfab / CGTrader có "tea bushes" nhưng là giấy phép Royalty-Free riêng (không CC) — **không dùng**. Polyhaven: thực vật
toàn ảnh thật (photoreal, hàng chục nghìn tam giác) — lệch phong cách, bỏ.

**Bụi chè dựng sẵn (CC0 / CC-BY, low-poly)**: **không tìm thấy**. Gần nhất là hedge Tiny Treats (#1).

### Kiểm thực tế (đã tải về `scratchpad/assets-free/`, không chạy gì trong gói)
- Tiny Treats Pretty Park: zip 3,0 MB; `hedge_straight_long` 372 tam giác, gltf + bin 12 KB, texture chung 19 KB.
  **Thử chuyển** (script riêng, dùng `@gltf-transform` + `meshoptimizer` + `sharp` sẵn trong `web/node_modules`): đọc texture
  dải màu → ghi vào **màu đỉnh** `COLOR_0`, bỏ UV / texture, hàn đỉnh, giảm tam giác:
  372 → **186** (tỉ lệ 0,5, 6,5 KB GLB) · → **130** (0,35, 4,9 KB). Dải màu giữ được: chân `#249750` → giữa `#4da949`/`#63b245`
  → đỉnh `#77bb41`/`#89c33e` (sẽ chỉnh sang lục chè, xem "Màu"). Nghĩa là dùng thẳng được với `softMaterial` (màu đỉnh) và
  `mergeSoft`, không cần texture.
- KayKit Forest: zip 6,4 MB; 105 mẫu glTF, texture chung 48 KB.
- Kenney Nature Kit: zip 10,5 MB; 329 GLB 3–40 KB.
- Quaternius SNM Standard: zip 99 MB (glTF 48 MB, texture 38 MB).
- Ảnh xem trước:
  - Tiny Treats: https://static.poly.pizza/5f4cc353-cd03-42d3-ad93-8eca79712673.jpg (hedge dài) · trong gói `overview.png`, `sample.png`
  - KayKit: trong gói `contents.png`, `Samples/Forest_Nature_Pack_sample1.png`; trang itch ở trên
  - Kenney: https://kenney.nl/media/pages/assets/nature-kit/2d81fc716e-1677698893/preview.png
  - Quaternius SNM: trong gói `Preview_1..4.jpg`; trang quaternius.com ở trên
  - Hedge Quaternius (Poly Pizza, CC0, 956 tam giác, lá alpha — không hợp): https://static.poly.pizza/c9493f96-5158-4a5a-8742-79eaf50676a5.jpg

## Màu
| Vai trò | Hex | Có trong phong_cach.md? | Nguồn / lý do |
|---|---|---|---|
| Chân luống (bóng nướng) | `#3F7A55` | có (lá tùng tối) | tối ấm, khớp tùng |
| Sườn luống | `#5E9A62` | có (lá tùng giữa) | |
| Mặt hái (búp non) | `#A9CC66` | có (búi cỏ sáng) | lục non vàng ấm, hướng A Xuân ấm |
| Rãnh / đất giữa luống | `#C8B392` | có (đất dốc) | |
| Bướm | `#FFF6E5` `#F6CF5E` `#F4A7B9` | có (`look` hoa) | dùng lại màu hoa cảnh mềm |
Đổi màu: gán lại dải màu đỉnh theo độ cao (y/h → nội suy 3 màu trên) lúc chuẩn bị model — bỏ hẳn lục chanh của gói.

## Hướng (chờ người dùng chọn)
- **A — Hedge Tiny Treats làm luống chè (khuyên)**: `hedge_straight_long` + `hedge_straight` (đoạn ngắn lấp cuối luống) +
  `bush` (cây chè lẻ ở mép). Dạng mềm đúng phong cách, có sẵn, CC0, nhỏ. Rủi ro: 4 m một đoạn → chỗ nối hai đoạn phải che
  bằng cách chồng mép 0,2 m + lật / co giãn ngẫu nhiên.
- **B — Luống chè dựng bằng code** (ống dài theo bậc, mặt cắt nửa elip 5–6 điểm, mép trên gợn bằng nhiễu, màu đỉnh theo độ cao):
  rẻ nhất (~16 tam giác / m), bám mọi hình bậc, không cần giấy phép; mất công viết + chỉnh cho "đáng yêu" như A.
- **C — Cụm bụi tròn KayKit xếp hàng** (`Bush_2/4` 44–284 tam giác): nhanh, nhưng vẫn là "bụi rời" — chính là lỗi hiện tại, chỉ đẹp hơn.
→ Khuyên **A**, giữ **B** làm phương án dự phòng nếu `?view=tren` vượt 150k tam giác.

## Dựng low-poly + hiệu ứng (ước ngân sách)
| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Draw call | Tam giác |
|---|---|---|---|---|
| 18 bụi `bui` hiện có | **bỏ** | xoá khỏi `trees.yard` vùng Đồi Chè | −0 (vẫn còn `bui` nơi khác) | −1 080 |
| Luống chè (6 luống ≈ 100 m) | giữ | `hedge_straight_long` giảm còn 130–186 tam giác, ép 0,8 × 1,0 m, **InstancedMesh** ~24 đoạn, `instanceColor` lệch sáng tối ±6 % | +1 | +3,1k (130) – +4,5k (186) |
| Lá lay gió | giữ | `softMaterial(wrap, FrontSide, { amp: look.wind × 0,4, tip: 0,8 })` — gốc đứng, mặt trên lay ~2 cm | 0 | 0 |
| Cây chè lẻ mép bậc | giữ | `bush` 180 → ~90 tam giác, cùng InstancedMesh khác (hoặc gộp chung hình luống) | +1 (hoặc 0) | +0,5k (6 cây) |
| Cỏ + hoa quanh luống | giữ | đã có `coHoa.ts` (gió sẵn); chỉ chặn cỏ mọc **trong** luống, dày hơn ở rãnh / mép bậc | 0 | ≈ 0 (đổi chỗ) |
| Bướm / chuồn chuồn | giữ | 20–30 con, mỗi con 2 cánh = 2 tứ giác (4 tam giác), **InstancedMesh**, vỗ cánh + bay vòng bằng cập nhật `instanceMatrix` trên CPU mỗi khung (≤ 30 ma trận — không cần shader mới); `MeshBasic`/`softMaterial` 2 mặt; mức Thấp: tắt | +1 | +0,1k |
| Sương sớm dưới chân bậc | tuỳ | 2–3 tấm ngang trong suốt dải alpha theo màu đỉnh, chỉ buổi sáng (`dayNight`) — **phủ nhỏ** để tránh tô chồng; mức Thấp: tắt | +1 | +12 |
| Nắng xuyên (tia) | tuỳ | 3–4 tấm dọc cộng màu kiểu `lanternGlow` (MeshBasic additive), xiên theo hướng nắng, mờ dần | +1 | +16 |
| Người hái chè | sau | NPC qua `/tai-nguyen` (ảnh 4 góc → Hunyuan), giỏ tre dựng code; đứng giữa rãnh | +1 | +16k (ngân sách NPC sẵn) |
Tổng ước (không tính NPC): **+3 → +5 draw call, +2,1k → +3,6k tam giác** (sau khi bỏ 18 bụi). Draw call còn dư (~137/150),
nhưng **tam giác `?view=tren` đang 149,4k / 150k** → phải bù: chọn bản 130 tam giác, bớt búi cỏ ở 3 bậc chè (luống chiếm chỗ cỏ),
hoặc chuyển sang hướng B (~1,6k tam giác cho 100 m). Đo lại bằng Canvas 3D trước / sau, và fps Android (quy tắc 4).

## Sai thường gặp cần tránh
- Bụi tròn rời rạc xếp hàng (lỗi hiện tại) — chè trồng **luống liền**.
- Luống cao quá hông (che nhân vật, trông như tường xanh) hoặc phẳng tuyệt đối như hộp (mất "mềm").
- Một màu lục chanh bão hoà (màu gốc gói Tiny Treats / KayKit) — lệch bảng màu ấm A.
- Lá cắt alpha nhiều lớp (Quaternius SNM) — đẹp trên PC nhưng tốn tô điểm ảnh trên GPU điện thoại.
- Lay gió mạnh như cỏ — chè là bụi xén cứng, chỉ mặt trên rung nhẹ.
- Hai đoạn hedge cạnh nhau lay **khác pha** (pha gió tính theo gốc instance — `windChunk`) → khe hở nhấp nháy ở chỗ nối.

## Đưa vào cảnh
- Tả được ngay bằng `scene.json`: bỏ 18 mục `trees.yard[] kind "bui"` trong vùng x 9…29, z −52…−36 (thay bằng luống khi code xong).
- **Cần code** (phiếu sang `/lead` + `/canh`):
  1. Kiểu vật mới `luong-che` (hoặc `terrain.plateaus[].crop: "che"`): trường `rows` (số luống), `width`, `height`, `gap`, màu 3 tầng
     trong `SceneSpec` có mặc định giữ cảnh cũ (quy tắc 8). Dựng: InstancedMesh từ GLB luống (hướng A) hoặc ống code (B), một draw call.
  2. Nạp **hình** từ GLB cho InstancedMesh (hiện `staticModel.ts` nạp cả model làm vật tĩnh): lấy geometry + `COLOR_0` từ
     `design/models/thuc-vat/*.glb` (Vite glob như `staticModel.ts`, giải meshopt).
  3. `model:clean --loai thuc-vat` (ngân sách ≤ 300 tam giác, ≤ 50 KB, 0 texture): **nướng texture dải màu → màu đỉnh** + đổi màu
     theo độ cao + giảm tam giác + nén meshopt (cách làm đã thử được — xem "Kiểm thực tế").
  4. Gió: tuỳ chọn **pha theo toạ độ thế giới của đỉnh** (thay vì gốc instance) cho vật dài nối nhau — sửa nhỏ trong `windChunk`.
  5. Bướm: file ghép riêng (vd. `web/src/scene/buom.ts`) — InstancedMesh + updater; mức Thấp tắt (R-HIEU-1).
  6. Sương sớm / tia nắng: tuỳ, gắn `dayNight`; tắt ở mức Thấp.

## Cách dùng gói (theo hướng A)
1. Chép từ gói Tiny Treats Pretty Park (bản tải về, không lấy bản Poly Pizza để có `License.txt` gốc):
   `hedge_straight_long`, `hedge_straight`, `bush` (+ tuỳ chọn `flower_A/B`, `grass_A`) → chạy `model:clean --loai thuc-vat`
   → `design/models/thuc-vat/luong-che.glb`, `luong-che-ngan.glb`, `cay-che.glb` (vài KB / file). **Không** đặt `web/public`
   (Vite đã gói `design/models` vào app — đúng quy tắc 2 offline).
2. Chép `License.txt` gốc thành `design/models/thuc-vat/LICENSE-tiny-treats.txt`; thêm dòng vào `design/models/LICENSES.md`
   (cột "Công cụ" = "Tiny Treats – Pretty Park 1.0, Isa Lousberg, tải 2026-11-15 từ tinytreats.itch.io/pretty-park → nướng màu
   đỉnh, giảm tam giác"; "Giấy phép" = CC0 1.0). CC0 không bắt ghi công — vẫn nên ghi "Isa Lousberg" ở màn giới thiệu nếu có.
3. Nếu sau này cần đá / cỏ / bụi tròn thêm: KayKit Forest (CC0) — cùng kiểu dải màu, cùng cách nướng.

## Rủi ro
- **Ngân sách tam giác** góc trên xuống đang sát trần — phải đo; dự phòng hướng B.
- **Phong cách**: Tiny Treats rất "tròn trẻ con"; ép thấp + màu ấm + gợn mặt trên sẽ đưa về gần đồi chè. Cần ảnh so trên Canvas 3D.
- **Giấy phép**: CC0 rõ ràng trong `License.txt` từng gói (đã đọc). Không lấy mẫu có giấy phép "Royalty Free" của CGTrader / Sketchfab
  Standard. Logo "Tiny Treats" / "KayKit" chỉ ở ảnh xem trước, không vào app.
- Phần "Cần code" thuộc lớp `scene/` — không đụng `PlayerController`, không shadow, không hậu kỳ (quy tắc 4).

## Nguồn
- Tiny Treats Pretty Park — https://tinytreats.itch.io/pretty-park — gói, `License.txt` CC0, số đo mẫu (đã tải)
- OpenGameArt Tiny Treats Pretty Park — https://opengameart.org/content/tiny-treats-pretty-park-set — xác nhận CC0
- Poly Pizza Hedge Straight Long — https://poly.pizza/m/So5EAOMoNy — CC0, GLB, ảnh xem trước
- KayKit Forest Nature Pack — https://kaylousberg.itch.io/kaykit-forest — gói, `License.txt` CC0 (đã tải)
- Kenney Nature Kit — https://kenney.nl/assets/nature-kit — gói, `License.txt` CC0 (đã tải)
- Quaternius Stylized Nature MegaKit — https://quaternius.com/packs/stylizednaturemegakit.html — CC0, 116 mẫu (Standard 68, đã tải)
- Quaternius Ultimate Nature — https://quaternius.com/packs/ultimatenature.html — CC0, 150 mẫu, không texture (chưa tải)
- Quaternius Ultimate Stylized Nature — https://quaternius.com/packs/ultimatestylizednature.html — CC0, 63 mẫu, texture + normal (chưa tải)
- Poly Pizza bamboo Quaternius — https://poly.pizza/m/xBPj13w3JQ · https://poly.pizza/m/FUgtfvqgMx · https://poly.pizza/m/z0d6CbNtrz — CC0 (đã tải GLB)
- TNAU Agritech — Tea — https://agritech.tnau.ac.in/horticulture/horti_plantation%20crops_tea.html — khoảng cách hàng chè
- KAU Celkau — Tea cultivation practices — https://celkau.in/crops/Plantation%20Crops/Tea/cultivation_practices.aspx — hàng đơn 1,2 × 0,75 m, hàng kép 1,35 × 0,75 × 0,75 m
- WSU — Tea plant care and maintenance — https://vegetables.wsu.edu/tea-plant-care-and-maintenance/ — mặt hái phẳng ngang hông – ngực
- India Tea — https://www.indiatea.org/uploads/documents/1493021370.pdf — chiều cao bàn hái 65–90 cm
