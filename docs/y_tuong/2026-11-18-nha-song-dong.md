# Nhà sống động: sân và gian trong có sức sống + việc nhỏ mỗi ngày ở nhà (家园 · 小屋)
- Ngày: 2026-11-18 · Việc: V-20261118-114 · Hệ thống (khung 摩尔庄园): **nhà** (+ thú nuôi, nhịp ngày, sự kiện nhỏ)
- Trạng thái: **nháp — chờ người dùng chọn** · Điểm: 12–20/21 tuỳ ý (bảng §3)
- Yêu cầu người dùng (nguyên văn): "Ở nhà tôi hiện nay đang rất trống trải hãy nghiên cứu xem nên thêm gì và làm gì".
- Đọc kèm: `docs/tham_khao/nha-vuon-bo-cuc.md` (bố cục "Trục giữa" V-82), `docs/tham_khao/vuon-mole.md` (vòng công cụ),
  `docs/tham_khao/npc-kieu-moly.md` (tên NPC cổ phong), `web/src/zones/decor.ts` (13 vật), luật R-NHA-*, R-VUON-*, R-NGAY-*,
  R-TU-*, R-ON-*, R-MANG-4 (mẫu "thẻ từ trong cảnh"). Phiếu concept kèm: `docs/phieu_thiet_ke/2026-11-18-concept-nha-song-dong.md`.

## Một câu
Nhà riêng ở các game được yêu thích "sống" nhờ **ba lớp**: (1) ngày đầu đã có **vài thứ bày sẵn + sinh vật + tiếng + đổi
theo giờ** nên không bao giờ là bãi cỏ chết; (2) **mỗi ngày có vài thứ nhỏ đang chờ mình** ở nhà (thư, quả chín, thú đói,
khách ghé, cá cắn câu) — mỗi thứ 30 giây; (3) người chơi **tự thêm dần** đồ, cây, thú. Nhà mình hiện chỉ có lớp (3) (trang trí
tự do) và vườn; lớp (1) gần như bằng 0 (`nha-ta.json`: `props: []`, `npcs: []`, `water: []`, mây trôi 0, cây sân 0) và lớp
(2) chỉ có vườn. Đề xuất: thêm lớp (1) ngay (rẻ), lớp (2) gắn **ôn từ vựng đã học**.

## 0. Hiện trạng (ảnh `design/screens/Canh-nha-ta-truc-giua-tren.png`, `-vao.png`, `Canh-nha-ta-trong.png`)
| Chỗ | Có | Thiếu (cảm giác "trống") |
|---|---|---|
| Sân (đảo ∅ ≈ 54 m) | lối trục, 12 luống, thùng thu mua, nhà cuối lối (2 đèn lồng ở cửa), đồi trúc, 2 cụm tùng mép | hai cánh cỏ ~330 + 350 m² trơn; không hoa, không vật nhỏ, không sinh vật, không tiếng, không khói / ánh cửa sổ; mây trôi tắt |
| Gian trong (14 × 10) | sàn gỗ, 2 cửa sổ, 2 đèn lồng treo | **trống hẳn** khi mới cài (R-NHA-3: "mới cài → chưa món nào"; 3 vật khởi đầu nằm trong túi) |
| Việc ở nhà | vườn (gieo / tưới / sâu / cỏ / phân / thu / bán), trang trí | không gì khác để làm ngoài vườn; chưa có lý do nào ở nhà gắn **ôn từ** |
| Dữ liệu từ | HSK 1–2 có: 猫 狗 鱼 桌子 椅子 杯子 茶 书 房间 门 水果 苹果 米饭 菜 天气 晴 阴 下雨 雪 早上 晚上 睡觉 朋友 送 喜欢 | **không có** trong HSK 1–2: 花 鸟 树 床 太阳 月亮 (HSK 3) → sinh vật / đồ dùng làm "móc từ" nên chọn từ có trong sổ |

## 1. Nghiên cứu — các game làm nhà "sống" thế nào

| Game | Có sẵn từ đầu (không khí) | Người chơi thêm dần | Vòng quay lại mỗi ngày ở nhà |
|---|---|---|---|
| **摩尔庄园 web 2008** | 小屋 có đồ cơ bản; thú 拉姆 theo chân / ở nhà | đồ nội thất mua theo bộ (có bộ "đồ tương tác"); nhiều thú (≤ 4) | **cho 拉姆 ăn** (độ no tụt, bỏ bê thì nguy hiểm — bản gốc nặng tay); **拉姆 "bỏ nhà đi chơi" rồi về mang theo đồ**; gửi 拉姆 đi học có kỹ năng [MG] [XM-a] |
| **摩尔庄园 手游 2021** | nông trang riêng, ruộng quanh nhà | ruộng mở rộng theo độ phồn vinh; **chuồng gà / bò / cừu** (trứng, sữa, len); bản vẽ nhà (家装设计) chia sẻ | tưới / thu, cho vật nuôi ăn, câu cá ở hồ chân núi tuyết, nhiệm vụ ngày (bị chê **quá nhiều**) [TT] [XM-b] |
| **Animal Crossing NH** | đảo có cây ăn quả bản địa, hoa, côn trùng, cá, tiếng sóng / gió, nhạc đổi **theo giờ**; hộp thư trước nhà | lều → nhà, đồ, hoa lai, cây, rào; bảo tàng đầy dần | **checklist sáng**: đọc thư, đá ra tiền, đào hoá thạch, hái quả, chai thư trôi vào bờ, **một khách đặc biệt ghé mỗi ngày** (bán hàng / thử thách câu cá / bắt bọ), cư dân nhờ việc [NL] [PG] [NP-sc] |
| **Stardew Valley** | ngày 1 có **15 hạt củ cải để sẵn trên sàn** (nhiệm vụ đầu), ruộng sát nhà, thùng giao hàng cạnh cửa | công trình, chuồng, nhà to hơn | tưới, cho thú ăn, **bát nước của chó / mèo** (bỏ quên **không bị phạt**), thư buổi sáng [SDV] |
| **Hay Day** | chó / mèo đi lại trong trang trại, ong, sóc trong góc nhìn đầu | công trình chế biến, đồ trang trí | **bảng đơn hàng** + khách ghé xe tải mua hàng (quan sát chung, độ tin vừa) |
| **Noun Town** (học tiếng Trung) | thị trấn bắt đầu **đen trắng** | mỗi từ học được **trả màu lại cho một phần** thị trấn | trò nhỏ trong thế giới, ôn lặp cách quãng, luyện nói [NT] |

Không tìm thấy game học ngôn ngữ nào có **nhà riêng + thú nuôi** gắn từ vựng (tìm 1 lượt; gần nhất là Noun Town, Studycat,
WonderLang — chỉ có thị trấn / phiêu lưu). Đây là **khoảng trống** Tiểu Mặc lấp được.

### Điều rút ra (dùng cho phần đề xuất)
1. **Không bao giờ trống ngày đầu.** Stardew đặt sẵn hạt + ruộng, ACNH có cây quả + sinh vật sẵn; trang trí là *thêm vào*, không
   phải *bắt đầu từ số 0*. Nhà mình "mới cài → chưa món nào" là ngược quy ước.
2. **Sinh vật + chuyển động + tiếng là thứ rẻ nhất mà hiệu quả nhất** (bướm, chim, mèo đi lại, khói, gió trúc). Mình đã có sẵn
   khung: bướm (`scene/buom.ts`), đàn hạc (`scene/fauna.ts`), ngày đêm (R-NGAY-*), tiếng tự tổng hợp (R-AM-3/4).
3. **"Checklist sáng" 3–5 việc × 30 giây** là vòng quay lại của ACNH (thư, quả, đá, khách, chai thư). Ngắn — đúng bài học
   摩尔 2021 (việc ngày quá nặng thì bỏ).
4. **Thú nuôi là móc mạnh nhất** (摩尔: trẻ quý thú hơn nhân vật). Cơ chế đáng lấy: cho ăn mỗi ngày, **đi chơi rồi mang đồ về**,
   lớn theo giai đoạn. Bỏ bê **không chết** (Stardew: quên bát nước không phạt) — đúng điều cấm §4 của khung.
5. **Khách ghé luân phiên** (ACNH đặc khách theo lịch tuần): một NPC mỗi ngày ở sân, một việc nhỏ → nhà thành nơi "có người tới".
6. **Tiến độ học hiện thành cảnh** (Noun Town trả màu): từ đã thuộc biến thành thứ nhìn thấy ở nhà (tường từ, cây lớn, đèn sáng)
   — khoe được, có lý do cảm xúc để ôn.
7. **Đổi theo giờ / ngày / thời tiết** làm cùng một cảnh trông mới mỗi lần mở (đèn chiều, khói bếp sáng, mưa thì khỏi tưới —
   摩尔 web).

## 2. Đề xuất — 15 ý + 1 ý kèm (C5), 3 nhóm
Quy ước "Công": **S** ≤ 1 ngày (đặc tả + ít code, dùng lại khung có sẵn) · **M** 2–4 ngày (luật + code + HUD nhỏ) · **L** ≥ 1 tuần
(model AI, hệ thống mới, nhiều màn). "Quy trình": theo CLAUDE.md — khu / công trình mới → **ảnh concept trước**; giao diện mới →
**phiếu `/ui-apply phieu`**; vật nhỏ (đặt, chỉnh cỡ / màu) → miễn. Toạ độ chỉ là gợi ý, đo lại trên Canvas 3D.

### (a) Không khí / bày sẵn — rẻ, làm ngay (không dạy từ trực tiếp; giữ người chơi ở lại và quay về)

**A1. Sân bày sẵn khi mới cài** — 6–8 món đặt sẵn để ảnh đầu không trống: 2 đèn lồng cột hai bên sân trước, 2 chậu lan
trước bậc, 1 trúc cảnh cạnh thùng thu mua, bàn trà dưới cụm tùng cánh tây, một hàng **hoa dại thấp** dọc mép lối (vật cảnh, không
va chạm). Món trang trí đặt sẵn vẫn **nhấc vào túi được** (đề xuất) → người chơi sửa theo ý. *Cảm hứng*: Stardew hạt sẵn, ACNH
hộp thư + cây sẵn. *Học*: không. *Công*: S (đổi R-NHA-3/R-NHA-4 "mới cài", thêm `STARTER_PLACED`; hoa dại = `/canh`).
*Quy trình*: miễn concept (đặt vật có sẵn); concept kèm chỉ để duyệt bố cục.

**A2. Sinh vật nhỏ** — ban ngày **bướm** quanh luống có cây (dùng lại `buom.ts`), **chim sẻ** nhảy trên cỏ hai cánh, lại gần thì
bay vụt lên mái nhà; ban đêm **đom đóm** quanh đồi trúc; xa xa **đàn hạc** bay vòng biển mây (`fauna.flocks`). *Cảm hứng*: ACNH
côn trùng / chim, Hay Day ong, sóc. *Học*: không (鸟 là HSK 3 — không gắn từ). *Công*: S–M (chim sẻ là mesh mới nhỏ, +1–3 draw
call, mức đồ hoạ Thấp tắt). *Quy trình*: miễn.

**A3. Nhà theo giờ** — **khói bếp** mỏng từ góc mái sau 6–8 h và 17–19 h (bể hạt có sẵn); **cửa sổ sáng vàng** từ 18 h; đèn lồng
cửa + đèn đặt sẵn sáng theo R-NGAY-3; buổi sáng có **sương mỏng** trên biển mây. *Cảm hứng*: ACNH đổi theo giờ, bếp nhà nông.
*Học*: không. *Công*: S. *Quy trình*: miễn.

**A4. Tiếng sân** — tự tổng hợp như R-AM-3/4 (không file, không mạng): **gió trúc** xào xạc gần đồi, chim hót sáng 6–9 h, dế đêm,
**chuông gió** ở hiên nhà khi gió thổi. *Cảm hứng*: ACNH. *Học*: không. *Công*: S. *Quy trình*: miễn.

**A5. Trời quanh đảo** — bật lại **mây trôi** (`floating.clouds.count` đang 0), 2–3 **đảo đá nhỏ lơ lửng** xa có cây (`floating.islands`),
một **dải thác mây** chảy qua mép đảo phía đông. *Cảm hứng*: cảnh tiên hiệp "động phủ trên mây". *Học*: không. *Công*: S (đặc tả
`/canh`). *Quy trình*: miễn (chỉnh cảnh), duyệt qua ảnh chụp Canvas 3D.

### (b) Hoạt động ở nhà gắn từ vựng — mỗi việc ≤ 1 phút, chỉ **ôn từ đã học** (không mở bài học mới — R-VUNG-2; học bài mới vẫn ở thầy Trúc Lão)

**B1. Thú nhỏ ở nhà (mèo hoặc chó con)** — lần đầu về nhà có một **mèo con** (猫) hoặc **chó con** (狗) ở sân, người chơi chọn một
và **đặt tên láy Việt** (kiểu Đậu Đậu của Moly Việt — tên không chữ Hán). **Cho ăn = ôn hôm nay**: làm xong lượt ôn đúng hạn
(R-ON-*) thì bát đầy, thú vui, ra đón ở chỗ xuất hiện; chưa ôn thì thú **ngủ gà gật** (không đói, không chết). Chạm thú → nó
**"nói" một từ đã học** (phát âm R-AM-5) và hỏi 1 câu dạng *b* "Nghe — nghĩa là gì?". Mỗi ngày thú **đi dạo rồi tha về 1 món nhỏ**
(hạt, phân, Văn tiền ít) — cơ chế 拉姆 "bỏ nhà đi chơi". Sau: lớn 3 giai đoạn theo **số từ đã thuộc**. *Cảm hứng*: 拉姆, Stardew
pet, Hay Day chó mèo. *Học*: nghe + nghĩa từ đã học, móc cảm xúc cho thói quen ôn. *Công*: **L** (model AI qua `/tai-nguyen`
+ động tác; luật mới R-THU-*; HUD đặt tên / chăm). *Quy trình*: **cần thiết kế nhân vật** (bộ ảnh 4 góc `/ui-design` → Tripo),
góc thú ở sân (ổ rơm / bát) là vật nhỏ — miễn concept; HUD → phiếu `/ui-apply phieu`.

**B2. Ao cá + câu cá ra từ** — một **ao nhỏ có cầu đá** ở cánh đông (thềm đông). Cần câu (nông cụ mới trên vòng công cụ / Túi đồ).
Cá cắn câu → **giật** → thẻ 1 câu về **một từ đã học** (ưu tiên từ đến hạn): đúng → cá to, sai → cá nhỏ + hiện nghĩa đúng (như
Măng chữ R-MANG-4). Cá bán ở thùng thu mua; mỗi ngày ~5 lượt có thưởng. 鱼 là từ HSK 1. *Cảm hứng*: ACNH cá + C.J., 摩尔 câu cá,
phiếu cũ "Câu cá chữ" (Thiên Bậc, thời học bộ thủ — nay chuyển về nhà và đổi sang từ vựng). *Học*: đọc / nghe → nghĩa, lặp từ đến
hạn. *Công*: M–L (trò mới, cá động, HUD). *Quy trình*: **ao là công trình / khu mới → ảnh concept trước** (góc đã soạn sẵn trong
phiếu concept, mục "đợt 2 xem trước"); HUD → phiếu.

**B3. Cây quả trước sân (táo)** — 2–3 **cây táo** ở hai cánh (vật cảnh cố định). Mỗi ngày (0 h giờ VN) mỗi cây ra 3 quả; chạm cây →
nhân vật **lắc cây**, quả rơi; **1 quả "có khắc từ"** → thẻ 1 câu (dạng *a* hoặc *b*, từ đã học) — đúng được 2 quả, sai 1, như
Măng chữ. Quả vào kho nông sản, bán ở thùng. 苹果 / 水果 là từ HSK 1. *Cảm hứng*: ACNH cây quả + lắc cây, R-MANG-4. *Học*: nghĩa /
nghe từ đã học, 1–3 từ / ngày. *Công*: **S–M** (dùng lại thẻ Măng chữ, kho nông sản, thùng; cây = biến thể `cayChum` + quả khối).
*Quy trình*: cây là vật nhỏ → miễn concept; không HUD mới (thẻ có sẵn).

**B4. Hộp thư trước cửa — thư buổi sáng** — hộp thư gỗ cạnh lối ở sân trước; mỗi ngày **1 lá thư** từ một NPC trong dàn tên cổ
phong (Măng bà bà, Đăng đại thúc…) hoặc từ thú nhỏ (khi có B1). Thư viết **tiếng Việt**, chèn **1–3 từ đã học** dạng chữ Hán +
pinyin + nút loa (chạm từ → nghe + nghĩa); dòng cuối nhắc "Hôm nay có n từ đến hạn ôn" và **quà nhỏ** đính kèm (2 hạt, 1 phân,
5 Văn tiền). Thư cũ lưu trong "hộp thư" để đọc lại. Thư soạn sẵn theo khuôn (chủ đề × từ đã học) — không cần mạng, không AI lúc
chạy. *Cảm hứng*: ACNH thư sáng, Stardew thư, 摩尔 bản tin. *Học*: **đọc từ trong ngữ cảnh** + nghe, ưu tiên từ đến hạn. *Công*: M
(nội dung khuôn thư, HUD thư, luật). *Quy trình*: hộp thư vật nhỏ → miễn concept; **HUD thư → phiếu `/ui-apply phieu`**.

**B5. Khách ghé nhà theo lịch tuần** — mỗi ngày (trừ CN) một NPC đã có ở trấn / vùng **đứng ở sân** cả ngày, nhờ một việc dùng
từ: "Cho ta 3 bó **菜**", "Mời ta chén **茶**" (pha trà ở bàn trà), "Ta tìm con **猫** đi lạc" (tìm quanh đảo). Xong → thưởng + câu
cảm ơn có từ vừa dùng. NPC dùng model sẵn có, không thêm người mới. *Cảm hứng*: ACNH khách đặc biệt luân phiên, Hay Day xe
khách mua hàng, 摩尔 NPC mua hàng mỗi ngày. *Học*: nhận mặt chữ / nghe từ trong yêu cầu, nối từ ↔ vật thật. *Công*: M–L (lịch,
đơn hàng, thoại, NPC đi đứng ở nhà). *Quy trình*: miễn concept (đặt NPC); bảng đơn → phiếu.

**B6. Thời tiết ở nhà mỗi ngày** — mỗi ngày một kiểu **晴 nắng / 阴 âm u / 下雨 mưa / 雪 tuyết (mùa đông)**, định sẵn bằng hàm băm
ngày (Flutter / TS cùng kết quả, như sâu / cỏ R-VUON-10). Mưa → **luống tự ẩm, khỏi tưới** (摩尔 web). Lần đầu vào nhà trong
ngày: một dòng nhỏ "Hôm nay: 下雨 xià yǔ · mưa" + loa. *Cảm hứng*: ACNH thời tiết, 摩尔 web mưa khỏi tưới. *Học*: ~6 từ thời tiết
(天气 晴 阴 下雨 雪 冷 热), lặp tự nhiên mỗi ngày. *Công*: M (hạt mưa / tuyết một `Points`, đổi màu trời; đo fps — quy tắc 4).
*Quy trình*: miễn concept; dòng báo → phiếu nhỏ.

### (c) Gian trong (nội thất)

**C1. Bộ đồ khởi đầu bày sẵn** — gian trong mới cài đã có: **án đọc + đôn**, **kệ sách nhỏ**, **sạp ngủ** (giường gỗ thấp có chăn
— vật mới), **thảm**, **tranh chữ** (vật khởi đầu), **bình trà trên bàn thấp** (vật mới). Nhấc / dời được như món trang trí.
Thêm vào danh mục vài vật trong nhà còn thiếu (sạp ngủ, tủ áo, bàn thấp + bộ trà, chậu cây trong nhà, thảm) để Tạp hoá có thứ
mua cho gian trong (hiện chỉ 4 vật trong nhà). *Cảm hứng*: 摩尔 小屋 đồ cơ bản, Stardew nhà có giường + TV + bàn. *Học*: không
trực tiếp (dọn đường cho C2, C3). *Công*: M (6 vật khối low-poly, giá, luật). *Quy trình*: vật mới dạng khối như 13 vật cũ —
miễn concept; ảnh gian trong trong phiếu concept chỉ để duyệt bố cục / màu.

**C2. Góc học + "Tường từ đã thuộc"** — ngồi **án đọc** ở nhà → cuộn (R-ON-8) có ô "Ôn hôm nay" (đã có luật, chỉ cần án đọc ở nhà
là chỗ ngồi được) + **sổ từ của ta**. Trên tường cạnh án đọc là **tường từ**: mỗi từ đạt "đã thuộc" (bậc ≥ 30 ngày) thành **một
tấm thẻ gỗ nhỏ** treo lên tường (chữ Hán là nội dung học — hợp R-HUD-4), chạm thẻ → nghe + nghĩa. Mốc 10 / 50 / 100 / 304 từ
→ tường đổi khung (gỗ → son → vàng). *Cảm hứng*: Noun Town trả màu, ACNH bảo tàng đầy dần, khoe nhà. *Học*: ôn đúng hạn + nhìn lại
từ đã thuộc, động lực "lấp đầy tường". *Công*: M (tường thẻ = 1 InstancedMesh + chữ trên atlas; ngồi án đọc ở gian trong).
*Quy trình*: miễn concept (vật trong nhà); sổ từ của ta → phiếu (nếu chưa có màn tương tự).

**C3. Đồ trong nhà có tên tiếng Trung (kiểu Noun Town)** — chạm một đồ có "từ" (bàn 桌子, ghế / đôn 椅子, chén 杯子, trà 茶, sách
书, cửa 门, mèo 猫…) → thẻ nhỏ: chữ + pinyin + nghĩa + loa. **Chỉ hiện chữ khi từ đã học**; chưa học → thẻ ghi "Học ở thầy Trúc Lão"
(không mở bài — giữ R-VUNG-2). *Cảm hứng*: Noun Town (từ gắn vật thật). *Học*: nối từ ↔ vật, nghe. *Công*: S–M (bảng vật → mã từ,
thẻ). *Quy trình*: thẻ → phiếu nhỏ; **cần người dùng cho phép** chạm cảnh hiện thẻ từ (R-VUNG-2 hiện chỉ cấm mở bài / lượt ôn —
thẻ xem từ không phải lượt ôn, nhưng nên ghi rõ vào sổ).

**C4. Bếp nhỏ nấu món từ nông sản** — góc bếp (lò đất + nồi) trong gian trong hoặc hiên sau; nấu **米饭** (từ lúa), **菜** (cải),
**茶** (lá chè từ Đồi Chè) theo công thức; món ăn cho thú nhỏ (B1) hoặc đãi khách (B5), hoặc bán giá cao hơn nông sản. *Cảm hứng*:
摩尔 nhà hàng / nghề đầu bếp, Stardew nấu ăn. *Học*: tên món + động từ 吃 喝 做. *Công*: L (công thức, chế biến theo giờ, HUD). *Quy
trình*: bếp là vật mới (miễn concept nếu trong gian trong), HUD → phiếu.

**C5. Chuông gió / cửa sổ nhìn ra vườn** *(nhỏ, đi kèm C1)* — cửa sổ gian trong thấy **ảnh mờ của vườn và trời theo giờ** (đêm thấy trăng,
mưa thấy giọt) thay giấy trơn → gian trong không "hộp kín". *Học*: không. *Công*: S. *Quy trình*: miễn.

## 3. Chấm điểm (khung `.claude/skills/y-tuong/references/khung.md` §2 — Học ×2, tối đa 21)

| Ý | Học (×2) | Quay lại | Hợp thế giới | Giai đoạn | Chi phí | An toàn | **Tổng** | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| A1 Sân bày sẵn | 0 | 1 | 3 | 3 | 3 | 3 | **13** | không dạy từ — nền cho mọi thứ khác, ảnh đầu hết trống |
| A2 Sinh vật | 0 | 1 | 3 | 3 | 3 | 3 | **13** | dùng lại bướm / hạc |
| A3 Nhà theo giờ | 0 | 2 | 3 | 3 | 3 | 3 | **14** | lý do ghé buổi tối |
| A4 Tiếng sân | 0 | 1 | 3 | 3 | 3 | 3 | **13** | |
| A5 Trời quanh đảo | 0 | 1 | 3 | 3 | 3 | 3 | **13** | chỉ đặc tả |
| B1 Thú nhỏ | 3 → 6 | 3 | 2 | 3 | 1 | 3 | **18** | móc mạnh nhất, đắt nhất (model) |
| B2 Ao cá câu từ | 2 → 4 | 2 | 3 | 3 | 1 | 3 | **16** | cần concept |
| B3 Cây táo | 2 → 4 | 3 | 3 | 3 | 2 | 3 | **18** | dùng lại thẻ Măng chữ |
| B4 Thư buổi sáng | 3 → 6 | 3 | 3 | 3 | 2 | 3 | **20** | đọc từ trong ngữ cảnh + nhắc ôn |
| B5 Khách ghé | 2 → 4 | 3 | 3 | 3 | 1 | 3 | **17** | |
| B6 Thời tiết | 2 → 4 | 2 | 3 | 3 | 1 | 3 | **16** | đo fps mưa / tuyết |
| C1 Nội thất khởi đầu | 0 | 1 | 3 | 3 | 2 | 3 | **12** | nền cho C2–C4 |
| C2 Góc học + tường từ | 3 → 6 | 2 | 3 | 3 | 2 | 3 | **19** | tiến độ học thành cảnh |
| C3 Đồ có tên tiếng Trung | 2 → 4 | 1 | 2 | 3 | 2 | 3 | **15** | cần quyết R-VUNG-2 |
| C4 Bếp | 2 → 4 | 2 | 3 | 3 | 1 | 3 | **16** | sau B1 / B5 |
| C5 Cửa sổ nhìn vườn | 0 | 0 | 3 | 3 | 3 | 3 | **12** | đi kèm C1 |

Nhóm (a) điểm thấp theo thang (không dạy từ) nhưng **rẻ và đúng chỗ người dùng than** ("trống trải") — khung cho phép ý không dạy
từ nếu nó giữ người chơi để học chỗ khác. Không ý nào chạm điều cấm (§4): thú không chết, không trả tiền thật, không chuỗi ngày
mất thưởng, tên thú / NPC không chữ Hán.

## 4. Đề xuất thứ tự

### Đợt 1 — rẻ, thấy khác ngay (≈ 1 tuần, không cần model AI)
1. **"Gói sân sống"** = A1 + A2 + A3 + A4 + A5 (một việc `/canh` + lead nhỏ): ảnh đầu tiên có đồ, hoa, bướm, chim, khói, tiếng,
   mây. Đổi luật R-NHA-3 / R-NHA-4 (đồ đặt sẵn), thêm R-NGAY cho khói / cửa sổ, R-AM cho tiếng sân.
2. **B3 Cây táo** — việc ôn đầu tiên ở nhà, dùng lại thẻ Măng chữ; 2–3 cây cũng làm hai cánh cỏ đỡ trống.
3. **B4 Hộp thư buổi sáng** — điểm cao nhất (20), mở vòng "checklist sáng" ở nhà; cần phiếu HUD trước.
4. **C1 + C5 + C2 (phần ngồi án đọc)** — gian trong không còn trống, ngồi án đọc ôn được; tường từ có thể sang đợt 2 nếu nặng.

Vòng sáng sau đợt 1 (≈ 3–5 phút, đúng "nhẹ nhàng"): về nhà → đọc thư (quà + nhắc ôn) → lắc cây táo (1 thẻ từ) → chăm vườn →
vào nhà ngồi án đọc ôn hôm nay.

### Đợt 2 — móc dài hạn (cần thiết kế / model / concept)
5. **B1 Thú nhỏ** (bắt đầu thiết kế nhân vật song song với đợt 1 vì model lâu nhất).
6. **B2 Ao cá câu từ** (sau khi chốt ảnh concept ao).
7. **B5 Khách ghé** + **C4 Bếp** (hai cái nối nhau: nấu món đãi khách / cho thú ăn).
8. **B6 Thời tiết**, **C2 tường từ** (nếu chưa làm), **C3** (nếu người dùng cho phép).

## 5. Quy trình cho đợt 1
- Ảnh concept: theo quy định chỉ bắt buộc cho khu / công trình mới — đợt 1 không có (đồ đặt sẵn, cây, hộp thư là vật nhỏ). Đã soạn
  sẵn **phiếu concept không bắt buộc** `docs/phieu_thiet_ke/2026-11-18-concept-nha-song-dong.md` (sân ban ngày / chiều tối + gian
  trong + xem trước ao cá & góc thú đợt 2) để người dùng **duyệt không khí trước khi dựng**; người dùng có thể bỏ qua.
- HUD mới: thư buổi sáng (B4) → `/ui-apply phieu thư buổi sáng ở Nhà của ta`.
- Luật cần thêm / sửa (sổ trước, rồi `/dong-bo-quy-tac`): R-NHA-3 (mới cài có đồ đặt sẵn), R-NHA-4 (vật mới, vật khởi đầu), mới
  R-NHA-8 (cây táo: ra quả, lắc, thẻ từ), R-NHA-9 (hộp thư: một thư / ngày giờ VN, quà, lưu), R-NGAY-7 (khói bếp, cửa sổ), R-AM-6
  (tiếng sân).
- Ngân sách: A2 + A3 + B3 dự kiến **+4–6 draw call** ở nhà (chim 1, đom đóm 1, khói 1, quả 1, hoa 1–2); mức Thấp tắt chim / đom đóm
  / khói. Đo fps trước / sau (quy tắc 4).
- Chờ giai đoạn mạng: thư **từ bạn bè thật**, khách là **bạn thật ghé nhà**, tặng quà — làm bản NPC trước.

## 6. Câu hỏi cho người dùng
1. **Đồ bày sẵn** ở sân / gian trong: là **món trang trí nhấc được** (khuyên — người chơi tự sửa) hay **cảnh cố định**?
2. **Thú nhỏ** (đợt 2): **mèo / chó con** thật (có từ 猫 狗 trong HSK 1, dễ thương, dễ hiểu) hay **linh thú cổ phong** tự thiết kế
   (hợp tiên hiệp hơn nhưng không có từ HSK)? Khuyên: mèo hoặc chó, cho chọn một.
3. **Thư buổi sáng**: chèn từ đã học vào câu tiếng Việt (khuyên, hợp người mới) hay viết **câu tiếng Trung ngắn** HSK 1 có dịch?
4. **Ao cá**: đặt ở nhà (khuyên — thay phiếu cũ "Câu cá chữ" Thiên Bậc) hay để ở trấn?
5. **C3**: cho phép **chạm đồ trong nhà hiện thẻ từ** (chỉ xem, không phải lượt ôn) không?
6. Có muốn **tạo ảnh concept** trước khi làm đợt 1 không, hay làm thẳng (đợt 1 được miễn)?

## Bước kế
- Chọn đợt 1 → `/lead Nhà sống động đợt 1: gói sân sống + cây táo + hộp thư + gian trong khởi đầu (phiếu docs/y_tuong/2026-11-18-nha-song-dong.md)`.
- HUD thư → `/ui-apply phieu thư buổi sáng`.
- (Tuỳ) ảnh concept → `/ui-design` với `docs/phieu_thiet_ke/2026-11-18-concept-nha-song-dong.md`.
- Thú nhỏ → `/ui-design` bộ ảnh 4 góc → `/tai-nguyen`.

## Nguồn
- [MG] 摩尔庄园 — 萌娘百科 https://mzh.moegirl.org.cn/%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD (拉姆 ba giai đoạn, học ở 拉姆学院, bỏ bê có thể chết — bản gốc;
  拉姆 bỏ nhà đi chơi rồi mang đồ về — đọc qua đoạn trích tìm kiếm)
- [XM-a] 小米游戏 摩尔庄园 https://game.xiaomi.com/viewpoint/1359077112_1627347196516_9 (độ no 拉姆, chuồng gà — đoạn trích)
- [XM-b] 摩尔庄园手游 农夫职业 https://game.xiaomi.com/viewpoint/1359077112_1635909862400_13 (câu cá, chăn nuôi thuộc nghề nông)
- [TT] TapTap 摩尔庄园 https://www.taptap.cn/app/78344 (gà / bò / cừu → trứng / sữa / len; 家装设计)
- [NL] Nintendo Life — ACNH daily tasks https://www.nintendolife.com/guides/animal-crossing-new-horizons-daily-tasks-10-reasons-to-check-in-on-your-island-every-day (403 — đọc qua tóm tắt tìm kiếm)
- [PG] PocketGamer — 10 things to do every day in ACNH https://www.pocketgamer.com/animal-crossing-new-horizons/10-things-to-do-every-day-in-animal-crossing-new-horizons/
- [NP-sc] Nookipedia — Special character https://nookipedia.com/wiki/Special_character (một khách đặc biệt mỗi ngày, lịch đặt đầu tuần, khách bỏ tuần trước được ưu tiên)
- [SDV] Stardew Valley Getting Started https://www.stardewvalleywiki.com/Getting_Started ; Gamerant first week https://gamerant.com/stardew-valley-beginner-guide-first-week/ (15 hạt củ cải sẵn, thú ngày 5, bát nước quên không phạt)
- [NT] Noun Town — Chinese https://noun.town/language-learning-game/chinese/ (thị trấn đen trắng, mỗi từ học trả màu; ôn lặp; luyện nói)
- Hay Day: quan sát chung (chó / mèo, xe khách mua hàng) — độ tin vừa, chưa đọc nguồn trong lượt này; bố cục Hay Day xem `nha-vuon-bo-cuc.md`.
