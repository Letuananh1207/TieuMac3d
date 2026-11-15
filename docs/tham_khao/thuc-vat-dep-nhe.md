# Thực vật đẹp mà nhẹ: cây, hoa, cỏ, cây trồng (植被 · 卡通樹)
- Ngày: 2026-11-15 · Khu: cả 7 map + Nhà của ta (làm thử Khởi Nguyên Trấn) · Việc: V-20261114-58 · Trạng thái: nháp — chờ người
  dùng chọn hướng (khuyên A + D, B làm mức Cao sau khi đo)
- Đọc kèm: `canh-hoat-hinh-mem.md` (kỹ thuật 6–7 đã áp), `assets-free-thuc-vat.md` (gói CC0), quyết định
  `decisions/0005-canh-hoat-hinh-mem.md`.

## Một câu
Cây đẹp trong game hoạt hình trên điện thoại **không đến từ nhiều tam giác** mà từ 4 thứ rẻ: **dáng (silhouette) có nhịp
chùm lá**, **pháp tuyến "mượt theo chùm"** để ánh sáng chạy mềm trên cả tán, **màu nướng sẵn** (dưới tối – trên sáng – lõi tán
tối – mép sáng ấm) và **chuyển động nhẹ**. Mỗi cây vài trăm tam giác là đủ; cái đắt thật trên GPU điện thoại là **tô điểm ảnh
chồng lớp** (lá cắt alpha, trong suốt), không phải tam giác.

## Hiện trạng — đọc code 2026-11-15 (Khởi Nguyên Trấn, `look.style: "mem"`)

| Vật | Code | Tam giác / cái (đếm từ code) | Số lượng ở trấn | Vì sao trông "xấu" |
|---|---|---|---|---|
| Tùng | `cay_moi.ts addPine`: thân 2 trụ 6 cạnh + 4 đám `softBlob` (cầu 8 × 4) dẹt | 2 × 24 + 4 × 48 ≈ **240** | 19 lẻ + 18 trong cụm = **37** | đám lá là cầu nhẵn → viền tròn trơn như "bánh bao xếp", không có nhịp lá; thân trụ thẳng 6 cạnh, Lambert một màu, không nối vào tán |
| Cây tán (`tan`) | `trees.ts broadleaf`: thân + 3 `softBlob` | 24 + 3 × 48 ≈ **170** | 0 ở trấn (map khác) | như trên; cảnh cũ (`cu`) còn icosahedron 20 mặt |
| Mai / đào | `addPlum` / `addPeach`: cành trụ 6 cạnh + hoa icosahedron 20 mặt, `lambert` thường | ~ 9 × 24 + 16 × 20 ≈ **540** | 4 | hoa là viên đá 20 mặt flat, không màu đỉnh, không gió |
| Liễu | `addWillow`: vòm nửa cầu 8 × 4 + 12 dải hộp | ~ 32 + 12 × 12 ≈ **180** | 2 | dải là hộp phẳng, Lambert, không màu đỉnh |
| Trúc | `bamboo`: 5 thân trụ + 5 nón 5 cạnh | ~ 5 × 20 + 5 × 10 ≈ **150** | 16 | ngọn là nón cứng |
| Bụi `bui` | `addBush`: 3 icosahedron 20 mặt | 60 | 6 | khối 20 mặt flat-shaded |
| Cỏ / hoa | `coHoa.ts`: búi 4 lá (4 tam giác), hoa 5 cánh phẳng (5 tam giác), gió, màu đỉnh | 4 / 5 | ≤ 1 500 / ≤ 600 | ổn về kỹ thuật; hoa phẳng như đĩa nhìn từ trên |
| Cây trồng vườn | `cayTrong.ts`: Kenney Nature Kit → màu đỉnh, gộp 1 lưới | 16–336 | ≤ 4 luống / nhà | mẫu Kenney **flat-shaded góc cạnh** (chính hồ sơ `assets-free` đã ghi "lệch") |
| Luống chè | Tiny Treats hedge giảm còn 90 tam giác | 90 | ~24 đoạn | giảm quá tay → mặt trên gãy góc |

**Kết luận (suy luận từ code):** toàn bộ cây ở trấn ≈ 37 × 240 + 16 × 150 + 4 × 540 + … ≈ **14k tam giác** trong tổng ~150k
nhìn từ trên — cây chỉ chiếm ~10 %. Cây xấu **không phải vì thiếu tam giác** mà vì (1) mỗi đám lá là cầu nhẵn nên viền không có
nhịp chùm, (2) pháp tuyến hướng tâm *từng cầu* → mỗi cầu sáng tối riêng như quả bóng, cả tán không đọc thành một khối,
(3) thân / cành / hoa còn Lambert một màu flat, không nối với tán, (4) mẫu Kenney / 90 tam giác giảm quá tay ra góc cạnh.

## Các game cùng thể loại làm thế nào

Cột "Nguồn": **có nguồn** = tài liệu / bài nói của chính hãng hoặc bài kỹ thuật kèm URL; **quan sát** = nhìn ảnh / video gameplay
(quy ước thể loại, không có số); **không tìm thấy** = đã tìm (en / zh) mà không có tài liệu kỹ thuật công khai.

| Game | Nền tảng | Cây / tán | Hoa / cỏ | Cây trồng | Nguồn |
|---|---|---|---|---|---|
| **原神 Genshin Impact** (bản mobile) | Unity, điện thoại tầm cao | tán = **thẻ lá alpha xếp quanh khối**, pháp tuyến làm mượt theo khối tán → bóng tối sáng chạy liền cả tán kiểu anime; 2 bậc màu sáng / tối mềm; xa → giảm thẻ / impostor | cỏ thẻ alpha + mesh, mật độ theo mức đồ hoạ | — | **quan sát** + kỹ thuật chung (normal transfer, xem "Kỹ thuật"); bài GDC 2021 "Crafting an Anime-Style Open World" không có chi tiết cây công khai; cả trang tổng hợp nói ~500–850k tam giác / khung (nguồn kém, chỉ để thấy Genshin ở hạng khác hẳn ta) |
| **光遇 Sky: Children of the Light** | engine riêng, chạy cả máy cũ | cây ít, khối mềm + sương, ánh sáng làm "đẹp" | thảm cỏ / hoa lay theo nhân vật đi qua | — | **có nguồn (gián tiếp)**: GDC "Dynamic Environment Lighting in Sky" — ánh sáng môi trường tính trên **CPU** để GPU điện thoại rảnh; App Store: tài sản tự hạ độ phân giải / chi tiết theo máy. Không có tài liệu riêng về cỏ |
| **摩尔庄园手游** (Mole Manor mobile) | Unity | tán **khối đặc bo tròn**, texture / màu vẽ tay, sáng trên tối dưới, không lá rời | bụi tròn + hoa điểm màu, cỏ ít (mặt đất là texture) | ô ruộng: cây đứng thẳng, dáng to rõ mỗi giai đoạn | **quan sát**; không tìm thấy tài liệu kỹ thuật |
| **Animal Crossing Pocket Camp / New Horizons** | Unity (Pocket Camp) / Switch | tán **khối đặc tròn "bông"**, viền có vài múi chùm, texture vẽ tay nét lá, đổ bóng mềm | hoa = mesh nhỏ đặc nhiều màu, mỗi giống một dáng; cỏ gần như không có (đất texture) | hoa lai giống 3–4 giai đoạn, nảy (scale pop) khi lớn | **quan sát**; Nintendo không công bố. Bản dựng lại kiểu AC trên Sketchfab ~1 700 tam giác / cây |
| **Hay Day** | 2D | ảnh vẽ tay | — | **4 giai đoạn đọc được ngay bằng dáng + màu** (mầm xanh → cây → chín màu đặc trưng), hiệu ứng nảy khi thu | **có nguồn (một phần)**: "colorful, hand-drawn"; đội Hay Day: người chơi thích nét **đơn giản**, chỉnh icon / hình để hiểu không cần hướng dẫn (mobilegamer.biz) |
| **江南百景图 / 桃源深处有人家** | 2D / 2.5D vẽ tay | cây là tranh thuỷ mặc / màu nước | — | ruộng vẽ tay | **quan sát** — 2D, chỉ lấy màu + bố cục, không lấy kỹ thuật |
| **小森生活** | Unity 3D anime | thẻ lá alpha + màu tươi | cỏ dày | ruộng nhiều giai đoạn | **quan sát**, không tìm thấy tài liệu |
| **Ooblets** | Unity | tán khối tròn màu kẹo, không lá rời | cỏ thưa, hoa to | cây "ooblet" mỗi giai đoạn một dáng to rõ | **quan sát**, không tìm thấy devlog cây |
| **Tiny Glade** | Rust / Vulkan riêng, PC | cây thủ tục: nhiều **chùm lá tròn nhỏ** ghép, đổi mùa; GI mềm | cỏ / hoa dày | — | **quan sát** (PC, không phải điện thoại — chỉ lấy ý "nhiều chùm nhỏ" thay vì một cầu to) |
| **Townscaper** | Unity, PC / mobile | gần như không có cây; đẹp nhờ AO mềm + màu | — | — | **quan sát** |
| **Sunrise Village** (InnoGames, mobile / trình duyệt) | engine riêng | — | **vi thực vật**: cỏ / hoa instanced, chia ô cắt CPU | — | **có nguồn**: blog InnoGames "Microvegetation in Sunrise Village" (trang không tải được lúc đọc — chỉ dẫn link) |
| **Demo WebGL của keaukraine** (Android) | WebGL | — | cỏ / hoa instanced, ma trận từ texture, **4 × 4 = 16 ô cắt trên CPU (~1 ms máy yếu, cắt từng instance mất ~10 ms)**; máy Android yếu: **cỏ thưa hơn + tắt gió vì nghẽn ở vertex shader**; app Android dùng texture nén ASTC / ETC2 | — | **có nguồn** (dev.to) |

**Điểm chung rút ra (suy luận từ bảng):** game điện thoại "mềm" (AC, 摩尔庄园, Ooblets) dùng **khối đặc bo tròn, không lá rời** —
rẻ nhất, không overdraw. Game anime tầm cao (Genshin, 小森生活) dùng **thẻ lá alpha + pháp tuyến làm mượt** — đẹp "Ghibli" nhưng
tốn tô điểm ảnh, chỉ hợp máy mạnh. Hay Day / AC làm cây trồng đẹp bằng **dáng rõ từng giai đoạn + nảy khi đổi**, không bằng chi tiết.

## Bài học chính (6)

1. **Dáng trước, tam giác sau** (AC, 摩尔庄园, Tiny Glade): viền tán phải có **nhịp múi chùm** (5–9 múi lồi nhỏ), không phải một
   cầu nhẵn hay vài cầu to rời. Đó là thứ mắt đọc ra "cây" ở camera 10–15 m. *Quy ước / quan sát.*
2. **Pháp tuyến mượt theo khối tán** (mẹo kinh điển, cả thẻ lá Genshin lẫn khối đặc): chuyển pháp tuyến từ một khối bao (cầu /
   nửa elip) sang lá → cả tán sáng tối liền như một đám mây. Bẫy: cầu bao **tròn tuyệt đối** làm lá phẳng lì, mất lớp chùm
   (NextPCG: pháp tuyến cầu của SpeedTree "làm phẳng mất tầng lớp giữa các chùm") → dùng **pha trộn**: pháp tuyến chùm + pháp
   tuyến tán (vd. 60 / 40). Đáy tán dùng bao hình nón / nửa elip để mặt dưới không quay hẳn xuống đất (polycount). *Có nguồn.*
3. **Màu nướng sẵn thay đèn** (AC, 摩尔庄园): dải màu theo độ cao + **lõi tán tối** (đỉnh gần tâm tán sẫm 25–40 %) + **mép trên
   ấm sáng** + thân tối dần ở chỗ chui vào tán. Đây là "AO + rim light giả" miễn phí lúc chạy. Bài Eurographics 2005 (Candussi):
   pháp tuyến hướng ra từ cầu bao, chia đôi cường độ khuếch tán + cộng ánh sáng môi trường để lá không bao giờ đen — đúng cái
   `softMaterial` wrap đang làm. *Có nguồn.*
4. **Né trong suốt, nếu dùng lá alpha thì chỉ ở viền** (Android / Arm): "luôn đắt hơn vật đục", `discard` (alpha test) và
   alpha-to-coverage ép **late-Z** và tắt FPK (loại bỏ mặt khuất) trên Mali; alpha blend tắt early-ZS + FPK và lá nhìn sai thứ tự
   khi chuyển động. Cây khối đặc + một vòng thẻ nhỏ ở viền = đẹp gần như Ghibli mà diện tích tô chồng nhỏ. *Có nguồn.*
5. **Một kiểu cây = một lần vẽ**: thân + tán chung một hình (màu đỉnh) + `InstancedMesh`; biến thể bằng xoay / co giãn / lệch màu
   từng cây (`instanceColor`), không nhân bản hình. Mật độ cỏ hoa theo mức đồ hoạ, máy yếu tắt gió (keaukraine: nghẽn vertex
   shader). *Có nguồn.*
6. **Cây trồng: dáng to rõ 3–4 giai đoạn + "nảy" khi lớn** (Hay Day, AC): mỗi giai đoạn khác nhau rõ ở **cỡ + màu + dáng**, chín
   có màu quả đặc trưng; hiệu ứng scale-pop 0,2 s khi đổi giai đoạn quan trọng hơn chi tiết lá. 30–150 tam giác / khóm là đủ. *Quan sát + suy luận.*

## Kỹ thuật cụ thể

### Tán cây mềm, đẹp, ít tam giác — "tán chùm nổi"
1. **Khung tán**: 5–8 "múi" = cầu icosahedron chia 1 (80 tam giác) hoặc cầu 8 × 6 (≈ 80), đặt trên mặt một elip bao (tán rộng
   hơn cao, ~1,4 : 1), múi giữa to, múi viền nhỏ, đáy cắt phẳng. Lệch đỉnh theo nhiễu tần số thấp ±8 % để múi không tròn hoàn
   hảo. Gộp thành một hình mẫu. ≈ **400–600 tam giác**.
2. **Pháp tuyến**: `n = normalize(0.6 · (v − tâm_múi) + 0.4 · (v − tâm_tán))`; đỉnh ở đáy: kéo `n.y` lên ≥ −0,3 (bao nón). Không
   tính lại pháp tuyến hình học (sẽ lộ mặt cắt giữa các múi).
3. **Màu đỉnh** (3 màu `trees.leaves` có sẵn): `t = độ cao trong tán` → tối → giữa → sáng; nhân `ao = 1 − 0.35 · (1 − khoảng cách
   tới tâm tán / bán kính)` (lõi tối); cộng ấm `+ rim` ở đỉnh có `n.y > 0.5` và nằm ngoài cùng (vàng lục `#B5C46E` pha 20 %).
   Bóng không đen — tối nhất là `aoTint` (luật bảng màu hồ sơ `canh-hoat-hinh-mem`).
4. **Ánh sáng**: `softMaterial` wrap 0,5 sẵn có (half-Lambert). Tuỳ chọn thêm 2 dòng: **dải bậc mềm** `smoothstep(0.35, 0.65, dotNL)`
   pha 30 % để có "mảng sáng" kiểu anime mà không cứng như `MeshToonMaterial`. Chi phí ≈ 0.
5. **Thân + cành**: ống thon 6 cạnh × 3–4 khúc cong (tùng: 2 khúc gãy + 2–3 cành ngang chui vào múi), gốc loe; màu đỉnh tối dần
   ở chỗ vào tán (AO). ≈ **100–160 tam giác**. **Gộp chung hình với tán** (cả hai màu đỉnh, cùng `softMaterial`) → 1 draw call /
   kiểu; gió dùng `tip` theo độ cao để thân đứng yên, tán lay.
6. **Biến thể**: 1 hình / kiểu; mỗi cây xoay ngẫu nhiên, co giãn 0,8–1,3, `instanceColor` lệch sáng ±6 % và lệch sắc nhẹ → rừng
   không lặp. (Nếu cần 2–3 dáng: mỗi dáng +1 draw call.)
7. **Tùng 松 giữ chất Trung Hoa**: múi xếp thành **3–4 tầng mây dẹt** (卷雲 — đặc điểm nhận diện đã chốt ở bản mẫu
   `PhongCach-CayNhanVat`), mỗi tầng 3–5 múi dẹt ghép (không phải một đĩa), mặt trên sáng, mép dưới tối; thân vặn.
   Mai 梅: giữ cành gãy khúc, hoa = **cụm 3–5 cánh** (thẻ nhỏ hoặc nón 5 cạnh dẹt, màu đỉnh nhị vàng) thay icosahedron 20 mặt.
   Liễu 柳: dải rủ = dải phẳng **thon, 3 khúc, uốn** (6 tam giác) màu đỉnh gốc sẫm → ngọn sáng, gió trong shader (thay cập nhật
   ma trận CPU 24 dải / khung hiện nay).

### Thẻ lá alpha ở viền (tuỳ chọn, mức Cao)
- 16–32 thẻ / cây (mỗi thẻ 2 tam giác) **chỉ đặt trên vỏ ngoài tán**, pháp tuyến lấy từ tán (mục 2), quay theo camera một phần
  trong vertex shader (offset theo UV trong không gian nhìn — douges.dev, godotshaders), texture **một atlas 256 × 256 PNG** 4 hình
  chùm lá (~20 KB, 256 KB VRAM).
- `alphaTest 0.5` + `alphaToCoverage: true` (renderer đang bật `antialias` = MSAA → mép lá mềm, không răng cưa). **Không** alpha blend.
- Chi phí: +1 draw call / kiểu, +32–64 tam giác / cây; fill: mỗi thẻ ~0,6 × 0,6 m → vài trăm điểm ảnh ở góc chơi; late-Z chỉ
  ảnh hưởng chính lần vẽ này. Vẽ **sau** tán đặc (tán che bớt thẻ sau lưng).

### Hoa, cỏ
- **Cỏ** (`coHoa.ts` đã đúng hướng: búi 4 lá, gió, gốc tối → ngọn sáng, chia ô 60 m). Hai việc nhỏ đáng làm: (a) **màu gốc búi =
  màu đất / cỏ địa hình tại chỗ** (Codrops "fluffiest grass": búi tan vào mặt đất, không thấy chân); (b) pháp tuyến hướng lên
  (đã có) để búi sáng như mặt đất. Máy Thấp: thưa ½ (đã có) + **tắt gió** (keaukraine).
- **Hoa**: bông 5 cánh phẳng nhìn từ trên như đĩa → đổi thành **chén cánh nghiêng 25–35°** (5 cánh + nhị, 10 tam giác) + **1 cuống
  + 1 lá** (2 tam giác) — vẫn một `InstancedMesh`, `instanceColor`. Mọc thành khóm (đã có). +5 tam giác × 600 = +3k.
- **Bụi** (`bui`, bồn hoa): dùng cùng hàm "tán chùm nổi" với 3–4 múi thấp, đáy phẳng, có thể **điểm hoa** (instance hoa đặt trên
  vỏ bụi). Thay 3 khối 20 mặt flat.

### Cây trồng (vườn rau, luống chè)
- 3–4 giai đoạn đang có (`vua-gieo · mam · lon · chin`) là đúng (Hay Day / AC). Đổi phần hình: bỏ mẫu Kenney flat → **dựng code**
  từ 3 "viên gạch": *lá* (dải thon 2–4 khúc, màu đỉnh), *cụm lá* (vòng 5–7 lá quanh tâm — cải, củ cải), *quả* (cầu 8 × 6, pháp
  tuyến mượt, màu đỉnh có đốm sáng — bí, dưa, cà). Ước **30–150 tam giác / khóm**, gộp một lưới như hiện nay (1 draw call).
- **Nảy khi đổi giai đoạn**: co 0,6 → 1,1 → 1,0 trong 0,25 s (cập nhật ma trận / dựng lại lưới đã có — chỉ vài lần / giờ).
- Luống chè: bản 90 tam giác gãy góc → dựng code theo hướng B của `assets-free-thuc-vat.md` (ống nửa elip, ~16 tam giác / m,
  mặt trên gợn nhiễu, pháp tuyến mượt) hoặc lấy lại bản 122–186 tam giác khi đã gỡ được tam giác ở chỗ khác.

### Cây xa
- Cảnh ta nhỏ (trấn ~130 m, sương ấm 70–280 m): **impostor / billboard không đáng** — cây xa nhất vẫn ~100 m, thẻ phẳng lộ ra
  khi xoay camera. Thay bằng **LOD 2 bậc**: gần (< ~35 m tính từ nhân vật) = hình đầy đủ; xa = hình rút (3 múi, ≈ 150 tam giác) —
  2 `InstancedMesh` / kiểu, CPU chia lại 37 cây mỗi 0,5 s (rẻ). Góc trên xuống (`?view=tren`) → mọi cây dùng bậc xa.
- Vòng cây trên núi xa / sườn đồi (nếu có): gộp vào `farMountains` dưới dạng múi tròn màu núi, không phải cây thật.

## Áp vào three.js + WebView

| Vấn đề | Kết luận cho dự án | Nguồn / mức chắc |
|---|---|---|
| Alpha test vs alpha blend | Đục là rẻ nhất; alpha test (`alphaTest` / `discard`) + alpha-to-coverage ép late-Z, tắt FPK trên Mali; blend tắt early-ZS + FPK và lá sai thứ tự khi chuyển động. → tán đặc; thẻ lá chỉ ở viền, alpha test, không blend | Android Developers "Materials"; Arm "Hidden surface removal in Mali"; Arm forum — **có nguồn** |
| Overdraw rừng thẻ lá | rừng thẻ ngây thơ 8–15 × overdraw; bộ kỹ thuật (prepass độ sâu, impostor) đưa về 1–2 × — kỹ thuật PC / console, ta né từ gốc bằng khối đặc | cinevva 2026 — **có nguồn (bài tổng hợp)** |
| InstancedMesh / gộp | đúng như đang làm (`finish`, `mergeSoft`); gộp thân + tán vào một hình bớt 1 draw call / kiểu; `computeBoundingSphere` cả cụm → cụm cây cắt theo khung nhìn nguyên khối (37 cây một cụm thì gần như luôn vẽ — chấp nhận, tam giác ít) | code dự án + three.js forum (instanced forest cắt lá xa trong vertex shader) |
| Shader tuỳ biến | `onBeforeCompile` trên Lambert (`softMaterial`) như hiện nay — giữ gộp được với `mergeSoft`; thẻ lá viền cần thêm map alpha + offset hướng camera: vẫn làm được bằng `onBeforeCompile` (không cần `ShaderMaterial`). Quy tắc 4: shader riêng chỉ trong `web/src/scene/` cho nước / trời / **cỏ** — tán cây lay gió đã có tiền lệ trong `softMaterial`; thẻ lá viền là "cỏ / lá" — **cần người dùng xác nhận** coi là cùng nhóm | quyết định 0005 |
| Texture nén KTX2 / Basis | Đóng gói offline **được**: chép `three/examples/jsm/libs/basis/` (wasm + js) vào bản build, `KTX2Loader.setTranscoderPath` trỏ đường nội bộ; phải cùng phiên bản three; tốn worker + wasm (~0,5 MB) + bộ nhớ. **Không cần** cho thực vật: hướng khuyên **0 texture** (màu đỉnh); nếu có atlas lá 256² thì PNG ~20 KB / 256 KB VRAM — nén không đáng | three.js KTX2Loader docs, PR #31446 — **có nguồn** |
| Ngưỡng tam giác / draw call | Nguồn rất lệch nhau: máy yếu "< 100 draw call", "100–150k tam giác / khung"; Unreal mobile: < 500 draw call máy thấp. Trần dự án **150 / 150k** đã nằm ở mức an toàn của các nguồn; fill (overdraw) thường nghẽn trước draw call trên Android | Unity / Unreal / diễn đàn — **có nguồn, số chỉ tham khảo** |
| Vertex shader trên máy yếu | gió = ~10 phép tính / đỉnh; nhân với số đỉnh cỏ là chỗ nghẽn trên Android yếu → tắt gió cỏ ở mức Thấp; tán cây ít đỉnh, gió cây giữ được | keaukraine — **có nguồn** |
| Biên dịch shader | thêm vật liệu mới (thẻ lá) = thêm chương trình → gọi `renderer.compile` lúc màn tải (đã ghi ở hồ sơ cũ) | hồ sơ `canh-hoat-hinh-mem` |

## Phương án Hunyuan3D cho cây — đánh giá

**Số (suy luận từ ngân sách):** một model Hunyuan đã làm sạch ~16–20k tam giác. Trấn có ~60 cây → nếu mỗi cây một model như
NPC: **~1 triệu tam giác**, gấp ~7 lần trần cả cảnh. Instancing **không giảm tam giác** (chỉ giảm draw call). Muốn dùng lặp lại,
phải ép xuống **≤ 600 tam giác / cây** (≈ 3 % — quadric giảm mạnh cỡ này làm khối AI thành cục sần, mất hết chi tiết đã tạo).

**Tính chất mesh AI (có nguồn gián tiếp):** công cụ ảnh → 3D kiểu Hunyuan cho tán là **khối đặc**, không có lá rời / thẻ alpha
(3D AI Studio: "leaves are solid geometry, not alpha cards"; khuyên tả "chunky solid clumps"); Hunyuan có PolyGen (retopo tự hồi
quy ra lưới thấp, arxiv Hunyuan3D Studio) — chưa có trong luồng máy người dùng. Phần mảnh (cành nhỏ, dải liễu, cánh hoa, lá cỏ)
mesh AI thường dính thành mảng — *suy luận từ cách các mô hình này dựng bề mặt kín, chưa thử trên máy dự án*.

**Phải làm gì nếu dùng:** (1) ép tam giác: cây nổi bật 2–4k, cây lặp ≤ 600; (2) **bỏ texture**, nướng lại màu đỉnh theo độ cao +
AO lõi (ảnh từ Gemini có ánh sáng in sẵn, lệch với đèn cảnh); (3) **thay pháp tuyến** bằng pháp tuyến mượt theo khối bao (mesh AI
sần → pháp tuyến hình học nhiễu, lộ lốm đốm); (4) tách thân / tán nếu cần gió chỉ ở tán; (5) giấy phép Hunyuan (không dùng ở EU /
UK / Hàn Quốc — đã ghi `LICENSES.md`).

| | Hunyuan3D | Dựng code "tán chùm nổi" |
|---|---|---|
| Tam giác / cây | 16–20k gốc → phải ép 2–4k (nổi bật) / ≤ 600 (lặp) | 500–750, tự chọn |
| Draw call | 1 / model (instancing được nếu cùng model) | 1 / kiểu (thân + tán gộp) |
| Kích thước tải | ~200–270 KB / model (như NPC) | ~0 (sinh lúc chạy) |
| Dáng riêng, "có hồn" | **mạnh**: thân vặn, gốc rễ, dáng cổ thụ khó dựng tay | trung bình — theo công thức, lặp lại được |
| Mềm / đồng bộ cảnh | phải làm lại pháp tuyến + màu, khó khớp gió | khớp sẵn `softMaterial`, gió, bảng màu, mức đồ hoạ |
| Đổi theo `scene.json` (quy tắc 8) | khó (hình cố định) | dễ (màu, cỡ, số múi là trường) |
| Hợp loại | **1–3 cây nổi bật**: tùng nghênh khách 迎客松 ở cổng / Quảng Trường, cổ thụ trước Học đường, cây bồn cảnh 盆景, đá Thái Hồ | mọi cây lặp lại, bụi, hoa, cỏ, cây trồng |

→ **Hunyuan chỉ cho cây "nhân vật"** (1–3 cái, đặt đúng chỗ người chơi dừng nhìn), ép 2–4k tam giác, nướng màu đỉnh + pháp tuyến
mượt; **mọi cây lặp lại dựng code**. Không dùng Hunyuan cho hoa, cỏ, liễu, trúc, cây trồng.

## Hướng (chờ người dùng chọn)

- **A — "Tán chùm nổi" dựng code (khuyên)**: thay `softBlob` một cầu bằng hình tán 5–8 múi + pháp tuyến pha trộn + màu đỉnh AO lõi /
  mép ấm, thân cong gộp chung hình; áp cho tùng, tán, bụi, mai (hoa cụm), liễu (dải thon). Đục hoàn toàn, 0 texture. Giống
  AC / 摩尔庄园 / Ooblets.
- **B — A + thẻ lá alpha ở viền** (gần Genshin / "Ghibli"): đẹp hơn rõ ở góc gần, tốn fill + 1 draw call / kiểu + 1 atlas; **chỉ
  bật ở mức Cao** sau khi đo Android. Cần xác nhận quy tắc 4 (shader lá).
- **C — Cây CC0 (Tiny Treats `tree` 320 tam giác, KayKit 324–2 228) qua `npm run model:thuc-vat`**: nhanh, nhưng dáng cây "công
  viên phương Tây", không ra tùng / mai Trung Hoa; tốt cho bụi, đá.
- **D — Hunyuan cho 1–3 cây nổi bật** (đi kèm A): theo luồng `/tai-nguyen` (ảnh 4 góc → `cong-trinh.sh`), ép 2–4k tam giác.
→ Khuyên **A + D**, thử **B** sau khi A đo đạt.

## Công thức đề xuất + ngân sách (Khởi Nguyên Trấn, ước — suy luận)

| Vật | Cách | Tam giác / cái | Số | Tổng tam giác | Draw call | Fill |
|---|---|---|---|---|---|---|
| Tùng (gần) | 4 tầng × 3–4 múi dẹt + thân vặn 2 khúc + 2 cành, gộp | ~650 | 37 | ~24k (gần) | 1 | đục |
| Tùng (xa, LOD) | 3 tầng × 1 múi + thân 1 khúc | ~180 | (phần ở xa) | — | +1 | đục |
| Mai / đào | cành ống thon + 16 cụm hoa nón dẹt màu đỉnh | ~450 | 4 | ~1,8k | 1 | đục |
| Liễu | vòm 5 múi + 16 dải thon 6 tam giác, gió shader | ~500 | 2 | 1k | 1 | đục (2 mặt) |
| Trúc | giữ thân; ngọn = 3 dải lá thon chéo thay nón | ~140 | 16 | 2,2k | 2 | đục |
| Bụi / bồn hoa | tán chùm 3–4 múi thấp + điểm hoa | ~300 | 6 + bồn | ~3k | 1 | đục |
| Hoa | chén 5 cánh + cuống + lá | 12 | ≤ 600 | 7,2k | 1 (như cũ) | đục |
| Cỏ | như cũ, màu gốc theo đất | 4 | ≤ 1 500 | 6k | như cũ | đục |
| Cây trồng | dựng code từ lá / cụm / quả | 30–150 / khóm | ≤ 16 khóm | ≤ 2,4k | 1 (như cũ) | đục |
| *(B) thẻ lá viền* | 24 thẻ / cây, atlas 256² | +48 | 37 | +1,8k | +1 / kiểu | alpha test, nhỏ |

**So với hiện nay** (cây ~14k): góc chơi **+10–15k tam giác, +0 → +3 draw call** (gộp thân + tán bù cho LOD). **Góc trên xuống
đang 149,4k / 150k** → bắt buộc: mọi cây dùng bậc LOD xa khi camera cao (≈ 37 × 180 ≈ 6,7k — *ít hơn* hiện nay), hoặc bớt cỏ ở
`?view=tren`. GPU: chi phí điểm ảnh như hiện nay (vẫn `softMaterial`, vẫn đục); vertex shader thêm vài nghìn đỉnh gió — không đáng kể
so với 1 500 búi cỏ.

## Bước làm thử nhỏ (1–2 cây, so trước / sau)

1. **Chọn**: tùng (37 cây — nhiều nhất, đứng ở Quảng Trường / cổng) + một bụi `bui`.
2. **Dựng** (phiên code, worktree): hàm `softCrown(opts)` trong `web/src/scene/khoiMem.ts` cạnh `softBlob` (múi, pháp tuyến pha
   trộn, màu đỉnh AO lõi + mép ấm); thân cong gộp; bật bằng trường mới `trees.crown: "chum"` (mặc định `"cau"` = cảnh cũ — quy tắc 8).
3. **So**: Canvas 3D `?view=ca-san`, góc chơi `?nv=0,6`, `?look=cu`… chụp trước / sau cùng góc; bảng "Hiệu năng" ghi draw call +
   tam giác ở 3 góc (≤ 150 / ≤ 150k); `npm run bench -- --ghi` (GPU máy tính + SwiftShader); **Android người dùng**: trung vị ≥ 45 fps,
   1 % chậm ≤ 50 ms (quyết định 0005).
4. **Duyệt**: người dùng xem ảnh so → đạt thì nhân ra tán / mai / liễu / trúc / bụi; rồi hoa chén; rồi cây trồng; cuối cùng thử B.
5. Song song (tuỳ chọn): một cây nổi bật bằng Hunyuan (tùng nghênh khách) theo `/tai-nguyen`, đặt cạnh bản code để so.

## Rủi ro
- **Trần tam giác góc trên xuống** đã chạm 150k — không có LOD / bớt cỏ thì A vượt trần. Làm LOD cùng lúc với A.
- **Pháp tuyến pha trộn chọn sai tỉ lệ** → hoặc lốm đốm từng múi (quá "chùm"), hoặc phẳng lì (quá "tán"). Cần chỉnh trên Canvas 3D
  (đưa tỉ lệ thành trường đặc tả).
- **Thẻ lá viền (B)** trên Mali đời cũ: late-Z + MSAA A2C có thể tốn hơn ước; chỉ mức Cao, đo trước khi mặc định bật.
- **Hunyuan**: ép 20k → 600 ra cục sần; giấy phép khu vực; mỗi model 200+ KB tăng kích thước app.
- **Phong cách**: tán quá tròn / màu kẹo → mất chất cổ trang. Giữ dáng nhận diện tùng tầng mây, mai cành gãy, liễu rủ, trúc thẳng;
  bảng màu A Xuân ấm.
- Gió: thân gộp chung hình với tán phải có trọng số gió theo độ cao (`tip`), không thì cả cây đung đưa như cao su.

## Sai thường gặp cần tránh
- Thêm tam giác vào cầu nhẵn (detail 2, 3) — tròn hơn nhưng vẫn là "quả bóng"; cái thiếu là **múi**, không phải độ mịn.
- Lá alpha blend (trong suốt) hoặc phủ thẻ lá kín cả tán — overdraw, sai thứ tự khi xoay.
- Mỗi cây / mỗi múi một vật liệu → vỡ gộp, draw call vọt.
- Pháp tuyến hình học của mesh AI / mẫu flat (Kenney) giữ nguyên → lốm đốm, góc cạnh.
- Hoa là đĩa phẳng nằm ngang → nhìn từ camera nghiêng thành vệt; cánh phải nghiêng lên.
- Cây trồng giai đoạn giống nhau chỉ khác cỡ → người chơi không đọc được "đã chín".

## Đưa vào cảnh
- Tả được ngay bằng `scene.json`: không có thay đổi hình nào làm được bằng đặc tả hiện tại; chỉ chỉnh được màu `trees.leaves`,
  `trees.trunk`, `look.flowers`, mật độ cỏ.
- **Cần code** (phiếu sang `/lead` + `/canh`, mọi trường có mặc định giữ cảnh cũ):
  1. `trees.crown`: `"cau"` (cũ) · `"chum"` (tán chùm nổi) + `trees.crownStyle` { `lobes`, `normalBlend` 0,6, `coreAo` 0,35, `rim` màu + mức };
     hàm `softCrown` (`khoiMem.ts`), dùng trong `broadleaf`, `addPine`, `addBush`.
  2. Gộp thân + tán một hình (`softMaterial` + `tip`) cho tùng / tán.
  3. LOD 2 bậc theo khoảng cách nhân vật + góc `?view=tren` (`trees.lodDistance` ~35 m).
  4. Hoa chén nghiêng (`coHoa.ts flowerGeometry`), màu gốc cỏ theo địa hình.
  5. Mai / đào: hoa cụm màu đỉnh + `softMaterial`; liễu: dải thon gió shader; trúc: ngọn dải lá.
  6. Cây trồng dựng code (`cayTrong.ts` — thay hình Kenney, giữ `PlotShow` / `CROP_LOOKS`) + nảy khi đổi giai đoạn.
  7. (B) thẻ lá viền: `trees.leafCards` { `count`, `atlas` } — chỉ mức Cao; cần quyết định về quy tắc 4.
  8. (D) cây nổi bật Hunyuan: kiểu vật / `staticModel` có sẵn, ngân sách `cong-trinh` 2–4k tam giác.

## Nguồn
- Android Developers — "Optimize materials and shaders" (dựa trên tài liệu Arm) — https://developer.android.com/games/optimize/materials — trong suốt luôn đắt hơn đục; alpha test vs blend cho lá; tính ở vertex shader; sin/cos đắt
- Arm — "Hidden surface removal methods in Mali GPUs" — https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/hidden-surface-graphics-removal-methods-in-mali-gpus — discard / alpha-to-coverage ép late-Z, tắt FPK
- Arm forum — "Subpasses, alpha blending, FPK, early ZS" — https://community.arm.com/support-forums/f/graphics-gaming-and-vr-forum/54421/subpasses-alpha-blending-fpk-early-zs — blend tắt early-ZS + FPK
- Cinevva (O. Sidorkin, 2026) — "How modern engines beat foliage overdraw" — https://app.cinevva.com/blog/2026-05-11-foliage-overdraw — 8–15 × overdraw rừng thẻ lá, prepass, impostor (PC / console)
- keaukraine — "Efficient WebGL vegetation rendering" — https://dev.to/keaukraine/efficient-webgl-vegetation-rendering-4g2g — 16 ô cắt CPU ~1 ms, máy yếu thưa cỏ + tắt gió (nghẽn vertex shader), ASTC / ETC2
- Codrops 2025 — "How to make the fluffiest grass with three.js" — https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/ — cỏ tan vào đất, màu gốc → ngọn
- Candussi et al., Eurographics 2005 — "Rendering Realistic Trees and Forests in Real Time" — https://sites.cs.ucsb.edu/~holl/pubs/Candussi-2005-EG.pdf — pháp tuyến từ cầu bao, chia đôi khuếch tán + môi trường
- NextPCG — "SpeedTree Smooth Normal Baker" — https://devcopilot.notion.site/NextPCG-SpeedTree-Smooth-Normal-Baker-c633d36bddc7423d8dc2a0c1e5e60086 — pháp tuyến cầu làm phẳng tầng chùm; pháp tuyến mượt theo chùm
- DreamWorks Research — tô bóng tán bằng pháp tuyến gộp — https://research.dreamworks.com/?p=524 — lá hướng ngẫu nhiên gây nhiễu, dùng pháp tuyến chung
- Polycount — stylized foliage, normal transfer — https://polycount.com/discussion/comment/2717684 · https://polycount.com/discussion/comment/2696460 — chuyển pháp tuyến từ cầu, cắt nửa cầu thành nón cho đáy tán, lỗi mặt sau
- Unreal forum — "Spherical normals for trees (Blender)" — https://forums.unrealengine.com/t/spherical-normals-for-trees-blender/98732 — Data Transfer modifier
- trungduyng — "Blender Anime Foliage Pipeline" — https://trungduyng.substack.com/p/tutorial-blender-anime-foliage-pipeline — Transfer Vertex Normal cho tán anime
- SpeedTree (Unity docs) — Clusters — https://docs.unity3d.com/speedtree-modeler/manual/clusters.html — dùng texture chùm lá thay nhiều lá rời, ít tam giác
- Michael Dougall — "Creating fluffy trees with Three.js (part 1)" — https://douges.dev/blog/threejs-trees-1 — thẻ quad, UV đủ ô, offset hướng camera trong vertex shader, alphaTest 0,5
- Godot Shaders — "Simple, cheap stylized tree shader" — https://godotshaders.com/shader/simple-cheap-stylized-tree-shader/ — billboard thẻ trên lưới quad, alpha_to_coverage
- Godot docs — "Making trees" — https://docs.godotengine.org/zh-cn/4.x/tutorials/shaders/making_trees.html — tán 2 mặt, alpha prepass, xuyên sáng
- three.js forum — "Procedural Instanced Forest" — https://discourse.threejs.org/t/procedural-instanced-forest-high-performance-real-trees/88610 — InstancedMesh lá, cắt lá xa trong vertex shader
- three.js — KTX2Loader docs — https://threejs.org/docs/pages/KTX2Loader.html · PR setTranscoderUrls — https://github.com/mrdoob/three.js/pull/31446 — transcoder wasm chép vào dự án được (offline), cùng phiên bản three
- Unity — `Terrain.treeBillboardDistance` — https://docs.unity3d.com/ScriptReference/Terrain-treeBillboardDistance.html — billboard xa: nhanh hơn, chuyển tiếp lộ
- Unreal — mobile best practices — https://dev.epicgames.com/documentation/en-us/unreal-engine/optimization-and-development-best-practices-for-mobile-projects-in-unreal-engine — ngưỡng draw call máy thấp
- Unity — mobile optimization tips part 2 — https://unity.com/how-to/mobile-game-optimization-tips-part-2 — ngân sách khung 33 / 16,6 ms
- 3D AI Studio — tree generator — https://www.3daistudio.com/templates/3d-tree-model-generator — tán AI là khối đặc, không thẻ alpha
- Hunyuan3D Studio (arxiv 2509.12815) — https://arxiv.org/html/2509.12815v1 — PolyGen retopo lưới thấp
- GDC digest — "Dynamic Environment Lighting in Sky" — https://recapio.com/digest/dynamic-environment-lighting-in-sky-children-of-the-light-gdcrewind-gdc2026-gaming-by-gdc-festival-o — ánh sáng tính trên CPU giữ GPU rảnh (trang tóm tắt thứ cấp)
- Apple App Store story — Sky — https://apps.apple.com/us/story/id1465180456 — tự hạ chi tiết theo máy
- GDC Vault — "Genshin Impact: Crafting an Anime Style Open World" — https://gdcvault.com/play/1027538/-Genshin-Impact-Crafting-an — có bài nói, không có chi tiết cây công khai
- mobilegamer.biz — Hay Day 10 năm — https://mobilegamer.biz/what-supercells-hay-day-team-learned-from-ten-years-of-updates/ — nét đơn giản, icon / hình tự giải thích
- InnoGames — "Microvegetation in Sunrise Village part 1" — https://blog.innogames.com/microvegetation-in-sunrise-village-part-1-rendering/ — vi thực vật mobile (trang lỗi kết nối lúc đọc — chưa trích)
- Mã dự án (đọc 2026-11-15): `web/src/scene/khoiMem.ts`, `trees.ts`, `cay_moi.ts`, `coHoa.ts`, `cayTrong.ts`, `doiChe.ts`, `materials.ts`,
  `renderer.ts` (MSAA bật), `design/scene/scene.json` (37 tùng, 16 trúc, 4 mai, 2 liễu, 6 bụi), `docs/perf/bench.md`
- *Suy luận / quan sát*: bảng game (trừ dòng ghi "có nguồn"), số tam giác hiện trạng (đếm từ code), ngân sách công thức, tỉ lệ pháp
  tuyến 60 / 40, đánh giá mesh AI với phần mảnh — chưa đo trên máy dự án.
