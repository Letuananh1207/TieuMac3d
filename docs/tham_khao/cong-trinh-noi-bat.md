# Ba công trình nổi bật làm model AI (掌門殿 · 山門 · 煉丹房)
- Ngày: 2026-11-13 · Khu: Nội Môn (8), Sơn Môn (2), Luyện Đan Phòng (6) · Trạng thái: đã chọn hướng (người dùng, 2026-11-13): điện ngói vàng · chỉ lò đan · cổng 3 gian 4 trụ 3 mái

## Một câu

Ba "điểm nhìn" của Văn Uyên Tông, làm bằng model AI (Hunyuan3D-2mv từ 4 ảnh Gemini) theo quyết định 0003 — chỉ ngắm
từ ngoài, không vào trong: **Chưởng Môn Điện** là nóc cao nhất và uy nghi nhất của tông môn, **Cổng Sơn Môn** là ấn
tượng đầu tiên khi vào, **lò đan đồng** của Luyện Đan Phòng là vật "tiên hiệp" dễ nhận nhất. Cả ba phải cùng một chất
"đồ chơi vinyl" với nhân vật (đã có ở `design/models/anh/`) — to, khối chắc, góc bo, màu phẳng sáng.

## Đặc điểm nhận diện (thiếu là "không ra chất")

**Chưởng Môn Điện 掌門殿**
1. **Mái yết sơn hiên kép** (重檐歇山 — hai tầng hiên; tầng trên có tam giác hồi hai bên): hình mái chiếm ≈ 1/2 chiều
   cao nhà. Đây là mái của điện chính trên núi Võ Đang (Tử Tiêu Cung 紫霄宮 — "duy nhất còn lại trên Võ Đang").
2. **Bốn góc mái vểnh cao** (đầu đao), bờ nóc thẳng, hai đầu nóc có si vẫn (鴟吻 — khối cong như đuôi cá).
3. **Nền đá trắng cao** nhiều bậc (台基) + lan can + một lối bậc giữa — Tử Tiêu Cung đứng trên ba tầng nền.
4. **5 gian mặt tiền** (số lẻ), cột son, cửa bức bàn (槅扇 — cửa ô lưới) ở cả 5 gian, gian giữa rộng nhất.
5. **Biển ngang** giữa hai tầng mái (chữ Hán, nền xanh viền vàng).
6. Dải xà xanh lục – lam dưới hiên, đấu củng gộp thành dải tối (bóng dưới hiên).

**Cổng Sơn Môn 山門 (dạng 牌樓 — cổng có mái)**
1. **3 gian 4 trụ** (三間四柱), gian giữa rộng + cao hơn hai gian bên — dạng phổ biến nhất của cổng 牌坊/牌樓.
2. **Ba mái nhỏ riêng** (三樓): mái giữa cao, hai mái bên thấp, đầu đao vểnh; ngói lục.
3. **Biển chữ Hán 文淵宗** dưới mái giữa (nền xanh đậm, chữ vàng).
4. **Chân trụ đá** (khối vuông ôm chân cột) — cột gỗ son cắm trên đế đá.
5. Hai mặt **giống nhau** (đi từ ngoài vào hay từ trong ra đều thấy biển) — lợi cho ảnh 4 góc (trước = sau).

**Lò đan 丹爐 (vật trung tâm Luyện Đan Phòng)**
1. **Đỉnh đồng 3 chân hoặc 4 chân** (鼎): bụng tròn phình, hai quai đứng trên miệng, chân trụ — gợi đỉnh đồng Thương –
   Chu (thiết kế lò đan trong phim 哪吒 2 cũng lấy từ đây).
2. **Nắp lò nhiều tầng** hình chóp (như mái chùa nhỏ), núm trên đỉnh; lỗ thoát khói.
3. Màu **đồng xanh** (đồng có lớp gỉ) + viền vàng; **cửa lò** phía trước lộ ánh lửa đỏ cam.
4. Đặt trên **bệ đá bát giác** thấp — để lò không "trôi".
5. Khói / lửa: **không** đưa vào model (code làm hạt khói như `lo-dan` đang có).

## Quy chế · cấp bậc

- Chưởng Môn Điện là nhà **cao cấp nhất** tông môn: duy nhất có mái hiên kép, nền cao nhất, ngói vàng (bảng màu
  `phong_cach.md` đã để dành `#C9A13B` cho điện này). Giảng đường, điện Luyện Đan: một tầng hiên, ngói lục / xám.
- Cổng: ngói lục như giảng đường; cao nhưng mảnh, không lấn điện.
- Lò đan: vật, không phải nhà — nhưng là thứ to nhất trong sân Luyện Đan.

## Tỉ lệ · số đo (mét, hệ cảnh — đã phóng ×1,6 ở 2026-11-11.11; đệ tử chibi ≈ 2,1 m)

| Bộ phận | Ngoài đời | Trong cảnh | Ghi chú |
|---|---|---|---|
| Chưởng Môn Điện: mặt tiền × sâu | Tử Tiêu Cung chính điện ≈ 29,9 × 12 m, cao ≈ 18,3 m (số du ký, chưa kiểm) | 19,2 × 12,8 m (đặc tả hiện có) | chibi: mái phóng to, cột ngắn — tổng cao ≈ 14–16 m |
| Chưởng Môn Điện: nền | 3 tầng nền | ≈ 2–2,5 m, 2 tầng | bậc giữa rộng ≈ 1/3 mặt tiền |
| Cổng Sơn Môn: bề rộng × cao | không có số chuẩn (cổng Bắc Hải 3 gian 4 trụ; cổng bê tông Triệu Khánh 17,5 × 12 m) | rộng ≈ 9,6 + 2 × 5,6 ≈ 21 m · cao ≈ 11–12 m | **xà thấp nhất ≥ 6 × 1,6 ≈ 9,6 m** (camera không lọt sau biển — lỗi đã gặp) |
| Lò đan | lò thật nhỏ (chu vi ≈ 50 cm); trong phim / tiên hiệp phóng đại | cao ≈ 4–5 m, bụng ∅ ≈ 3 m, bệ ∅ ≈ 4,5 m | to gấp đôi nhân vật — "vật tiên", không phải đồ thật |

Model AI ra theo tỉ lệ ảnh; **kích thước thật do code đặt** (scale khi nạp, theo đặc tả). Ảnh chỉ cần đúng tỉ lệ
nội bộ: rộng : cao : sâu.

## Màu

| Vai trò | Hex | Có trong phong_cach.md? | Nguồn / lý do |
|---|---|---|---|
| Ngói vàng lưu ly (Chưởng Môn Điện) | `#C9A13B` | có — để dành | vàng một chỗ = thứ bậc |
| Ngói lục lưu ly (cổng, điện phụ) | `#2B5446` | có | đồng bộ giảng đường |
| Cột / cửa son | `#A8322A` | có | |
| Đá trắng nền, lan can, chân trụ | `#D9D4C7` | có | |
| Xà lục / lam | `#2F6F73` / `#3F5FA0` | có | dải dưới hiên |
| Vàng kim (biển, viền, núm lò) | `#D4A64A` | có | |
| Biển nền xanh đậm | `#24323A` | có (slate, token HUD) | chữ vàng trên nền đậm đủ tương phản |
| Đồng xanh lò đan | `#5E8C7A` (sáng `#86B09B`, tối `#3D5E52`) | **mới** | đồng gỉ xanh, hợp nền lạnh |
| Ánh lửa cửa lò | `#F08A3C` | **mới** | điểm ấm nhỏ |
| Đá bệ lò | `#9A968C` | có (đá giếng) | |

## Hướng — đã chọn: A · A · A (người dùng 2026-11-13)

- **Chưởng Môn Điện — A: ngói vàng** (uy nghi, đúng quy chế, đã để dành) · **B: ngói lục** (đồng bộ cả tông môn, "tiên"
  hơn, ít Tết). → khuyên **A**: một mái vàng duy nhất trên đỉnh núi là điểm ấm đẹp nhất trong khung nền lạnh.
- **Luyện Đan Phòng — A: chỉ lò đan làm AI** (vật gọn, Hunyuan dựng vật tròn tốt; nhà luyện đan giữ code) · **B: cả
  nhà + lò trong một model** (to, nhiều chi tiết mảnh, khó ghép 4 góc). → khuyên **A**.
- **Cổng — A: 3 gian 3 mái (三樓)** (bóng dáng rõ, ít chi tiết mảnh) · **B: 3 gian 7 mái (七樓)** (cổng Càn Long, cầu kỳ —
  Hunyuan dễ làm dính mái). → khuyên **A**.

## Làm ảnh cho Hunyuan (khác nhân vật)

| Điều | Vì sao |
|---|---|
| Kiểu **đồ chơi vinyl / mô hình đất sét**: khối dày, góc bo, không chi tiết mảnh < 1/40 bề rộng ảnh | Hunyuan bỏ hoặc làm dính chi tiết mảnh (lan can song, ngói ống, đấu củng) |
| **Phóng đại** bóng dáng chibi: mái to (≈ 1/2 cao), đầu đao vểnh dày, cột ngắn mập | khớp nhân vật; mái là thứ nhận diện |
| Lan can = **gờ đặc** (không song thưa); cửa bức bàn = **khắc nổi** trên mặt phẳng, không lỗ thủng | lỗ thủng / song thưa làm lưới vỡ |
| **Không bóng tối sâu** dưới hiên (ánh sáng đều, có phản quang) | bóng đen bị nướng thành màu, AI đoán sai độ sâu |
| 4 ảnh **chiếu thẳng**: trước · trái · sau · phải, **cùng cỡ, đế trên cùng một đường đất** | ghép 4 góc thành một khối |
| Nền xám trơn `#DDDDDD`, không đất / cỏ / mây quanh chân, không bóng đổ | như nhân vật |
| Công trình đối xứng: ảnh **sau = gần như trước** (điện: sau không cửa / ít cửa; cổng: giống hệt) | dễ cho Gemini giữ nhất quán |
| Thêm ảnh **¾ chếch trên** (nên có, để duyệt) | mái nhìn rõ nhất ở góc chơi |

## Dựng low-poly (model AI)

| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ước draw call |
|---|---|---|---|
| Mái hiên kép + đầu đao | giữ, phóng đại | trong model | 1 (1 vật liệu nướng) |
| Si vẫn, biển | giữ (khối to) | trong model; chữ biển vẽ trên texture | — |
| Lan can, đấu củng, ngói ống | gộp thành gờ / dải màu | trong ảnh vẽ đặc | — |
| Khói lò, lửa nhấp nháy | bỏ khỏi model | code: hạt khói `lo-dan` + khối tự sáng | +1–2 |
| Va chạm | — | code: hộp nền điện, 4 trụ cổng, trụ lò (như hiện tại) | 0 |

Tổng: mỗi model 1–2 draw call (ít hơn bản code 3–6). **Tam giác** là giới hạn chặt: mỗi công trình ≤ 20 000; cảnh đo
2026-11-11.11 đã ≈ 180 000 (> trần 150 000) → model phải **thay** bản code (bớt tam giác cũ), và nên nén công trình xa
(Chưởng Môn Điện) xuống ≈ 12 000.

## Sai thường gặp cần tránh

- Mái nhỏ, thẳng, ít vểnh → ra nhà Tây / Nhật. Mái ≥ 1/2 chiều cao ảnh, góc vểnh rõ.
- **Torii** (cổng Nhật: 2 trụ, xà cong, không mái ngói) thay cho 牌樓 — Gemini hay lẫn khi nghe "Asian gate". Ghi rõ
  "Chinese paifang with three tiled roofs, four pillars".
- Mái **cong lên ở giữa nóc** → ra Hàn. Nóc thẳng, chỉ hai đầu + góc cong.
- Số gian **chẵn**, cửa lệch trục.
- Vàng khắp nơi (cột vàng, cổng vàng) → phố Tàu. Vàng chỉ ngói điện + viền nhỏ.
- Lò đan thành **nồi / vạc nấu ăn** hoặc **lư hương nhỏ** → phải to, có nắp chóp nhiều tầng, cửa lò lửa, bệ đá.
- Chi tiết mảnh / song thưa / bóng sâu → lưới vỡ khi dựng.
- Dựng lại cổng / điện của một phim cụ thể (Vân Lam Tông, Thanh Vân Môn…) — lấy tinh thần, giữ tên Văn Uyên Tông.

## Đưa vào cảnh

- Tả được ngay bằng `scene.json`: chưa — vị trí / cỡ dùng lại `buildings[chuong-mon-dien]`, `gates[son-mon]`,
  `props[lo-dan]` hiện có.
- Cần code (sau khi có model, `/lead`): nạp `.glb` công trình thay bản dựng khối khi có file (`design/models/<tên>.glb`),
  scale theo đặc tả; giữ va chạm + khói từ code; bản khối làm dự phòng như nhân vật.
- Ảnh: phiếu `/ui-design` "bộ ảnh 4 góc công trình" (khuôn như `docs/phieu_thiet_ke/2026-11-12-anh-nhan-vat-3d.md`, bỏ
  tư thế chữ A, thêm bảng "Làm ảnh cho Hunyuan" ở trên) → `/tai-nguyen cong-trinh <tên>`.

## Nguồn

- Purple Heaven Palace (Zixiao) — China Daily — https://global.chinadaily.com.cn/m/wudang/2011-07/11/content_12877878.htm — điện chính Võ Đang trên nền cao
- Zixiao Palace — https://wiki.riteme.site/wiki/Zixiao_Palace — quần thể Minh, chân núi Triển Kỳ, UNESCO 1994
- Du ký Tử Tiêu Cung — https://offpeaktrip.com/en/notes/goldcoast/4008489 — số đo chính điện (18,3 m cao, 29,9 × 12 m; du ký, chưa kiểm), yết sơn hiên kép, ba tầng nền
- Architecture in ancient China — https://raider.pressbooks.pub/chineseculture/chapter/1-architecture-in-ancient-china/ — cấu tạo mái yết sơn (1 nóc, 4 bờ đứng, 4 bờ chéo)
- Decorative Architecture (paifang) — https://raider.pressbooks.pub/chineseculture/chapter/4-decorative-architecture/ — 三間四柱七樓 thời Càn Long
- Paifang — Wikipedia — https://en.Wikipedia.com/wiki/Paifang — số cửa lẻ, gian giữa lớn hơn
- páifāng 牌坊 — Architectura Sinica — https://www.architecturasinica.org/keyword/k000212 — thuật ngữ
- Beihai Park pailou — https://offpeaktrip.com/en/notes/beijing/4056583 — trụ gỗ trên đế đá, đấu củng gian giữa nhiều tầng hơn
- Zhaoqing Seven Star Crags archway — https://funes.world/entities/zhaoqing-seven-star-crags-archway — cỡ tham khảo 12 m cao, 17,5 m nhịp
- The Tripods in Daoist Alchemy (MDPI Religions 13/9/867) — https://0-www-mdpi-com.brum.beds.ac.uk/2077-1444/13/9/867 — vai trò đỉnh trong luyện đan, lò thật nhỏ (chu vi ≈ 50 cm)
- Ancient cultural treasures in Ne Zha 2 — China Daily — https://www.chinaservicesinfo.com/s/202503/19/WS67da1d2b498eec7e1f7322cb/ancient-cultural-treasures-in-ne-zha-2_3.html — lò đan phim lấy dáng đỉnh đồng Thương – Chu (bụng phình, chân trụ) — chỉ lấy tinh thần
- Hunyuan 3D Models — The Essentials (Scenario) — https://help.scenario.com/articles/5886286147-hunyuan-3d-models-the-essentials — ảnh đa góc cùng cỡ + ánh sáng, chủ thể chiếm phần lớn khung; lưới dày cần giảm
- Hunyuan3D 2.0 (arXiv 2501.12202) — https://arxiv.org/html/2501.12202v3 — hai bước: lưới trần rồi texture
