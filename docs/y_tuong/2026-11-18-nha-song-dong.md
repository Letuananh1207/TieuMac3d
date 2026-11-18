# Nông trại Nhà của ta: thêm gì ngoài sân để đảo bớt trống (农场 · 牧场 · 果园 · 鱼塘)
- Ngày: 2026-11-18 · Việc: V-20261118-114 · Hệ thống (khung 摩尔庄园): **nhà — phần nông trại ngoài sân**
- Trạng thái: **nháp — chờ người dùng chọn ý** (xem ảnh concept trước khi chọn)
- Yêu cầu người dùng (nguyên văn): "Ở nhà tôi hiện nay đang rất trống trải hãy nghiên cứu xem nên thêm gì và làm gì".
- **Thu hẹp phạm vi (người dùng 2026-11-18)**: "bạn đang đi quá xa mục đích của tôi chỉ là thêm các phần liên quan đến nông trại ở
  nhà của tôi. Ngoài ra hãy gen ảnh cho các ý tưởng" → phiếu này **chỉ còn nông trại ngoài sân** (chăn nuôi, cây quả, ao cá,
  nước tưới, chế biến nông sản, đồ nông trại). Thư buổi sáng, gian trong, khách NPC, thú cưng, thời tiết… chuyển xuống
  "Đã loại khỏi phạm vi". Tên file giữ nguyên để link cũ không gãy.
- Đọc kèm: `design/scene/nha-ta.json` (bố cục "Trục giữa" V-82), ảnh `design/screens/Canh-nha-ta-truc-giua-tren.png`, `-vao.png`,
  `docs/tham_khao/nha-vuon-bo-cuc.md`, `docs/tham_khao/vuon-mole.md` (vòng công cụ), luật R-VUON-*, R-NHA-5/7, R-TUI-1.
- Phiếu ảnh concept: `docs/phieu_thiet_ke/2026-11-18-concept-nong-trai-nha.md` (mỗi ý một ảnh + ảnh toàn đảo).

## Một câu
Trồng trọt đã có (12 luống, vòng công cụ: gieo / tưới / bắt sâu / nhổ cỏ / bón / thu / bán), nhưng **nông trại ở các game được
yêu thích không chỉ có luống**: còn **con vật cho sản phẩm mỗi ngày** (gà → trứng, bò → sữa), **cây quả lắc là rụng**, **ao câu cá**,
**chỗ chế biến** (thóc → gạo) và **đồ nông trại nhìn là biết** (giếng, bù nhìn, giàn dưa, tổ ong). Đề xuất 9 thành phần đặt vào
**hai cánh cỏ đông / tây đang trống**, mỗi thứ chỉ 1–2 thao tác kiểu 摩尔, ra sản phẩm bán ở **thùng thu mua** có sẵn hoặc
**nối vòng** với vườn (thóc nuôi gà, cỏ nhổ nuôi bò, nước giếng tưới luống).

## 0. Hiện trạng sân (đo theo `nha-ta.json`, x đông, z nam; tâm đảo (0; −2), mép ≈ 27 m)
| Chỗ | Toạ độ | Có | Trống |
|---|---|---|---|
| Lối trục + chỗ xuất hiện | x −1,2…1,2, z −6…13; xuất hiện (0; 6,5) | lối đá, Bến mây nam | — |
| Vườn rau (12 luống) | x ±2,1…±7,4, z −4…4 | luống, viền cuội | — |
| Thùng thu mua | (2,3; 5) | thùng gỗ | — |
| Nhà + sân lát | nhà (0; −11,5), sân x ±7, z −15…−5,5 | nhà, 2 đèn lồng | — |
| **Cánh tây** | x −22…−8, z −16…12 | 3 cây tùng mép (−20; 5) | **≈ 330 m² cỏ trơn** |
| **Cánh đông + thềm đông** | x 8…23, z −16…12; thềm phẳng x 13,5…23, z −6…6 | 3 cây tùng (20; −10) | **≈ 350 m² cỏ trơn** |
| Nam (quanh chỗ xuất hiện) | z 5…12 | — | dải cỏ hai bên lối |

Sản phẩm vườn hiện có (R-VUON-9): Cải ngọt, Củ cải, Ngô, **Lúa**, Bí đỏ, Hoa cúc, Dưa hấu, Trà. Cỏ dại nhổ ra (R-VUON-11) hiện
chỉ biến mất — có thể thành **cỏ khô** nuôi con vật (nối vòng, ý 5).

## 1. Nghiên cứu — nông trại ở các game (chỉ phần nông trại)

| Game | Chăn nuôi | Cây quả / ao | Chế biến / công trình | Bài học cho mình |
|---|---|---|---|---|
| **摩尔庄园 手游 2021** | nghề nông gồm trồng trọt, **câu cá, nuôi con vật nhỏ**; **chuồng (禽舍)** cho **trứng, sữa, len** — dân trong trấn thích các thứ này [XM-b] [TT] | câu cá ở hồ chân núi tuyết: phao động → **đợi rồi mới chạm** thì cá tốt hơn [XM-c] | nông sản dùng cho **đơn của dân, bán cho 花婶, làm món ở nhà hàng** [XM-b]; nông cụ lên cấp, **máy tưới / gieo / thu tự động** [XM-b] | con vật = sản phẩm mỗi ngày; nông sản có **nhiều chỗ dùng** chứ không chỉ bán |
| **摩尔庄园 web 2008** | — | — | ngày mưa đất tự ẩm (vuon-mole.md) | việc nhỏ, nhịp ngày |
| **Hay Day** | **chuồng gà 6 con**, trứng mỗi 20 phút, **gà cần thức ăn** mới đẻ tiếp; thức ăn gà làm từ **ngô + lúa mì** ở **máy nghiền thức ăn** [HD-w] | cây ăn quả, **hồ câu cá** (sửa bến rồi thả mồi) [HD-a] | chuỗi chế biến (máy nghiền, máy đường…) [HD-a]; tổ ong (quan sát chung) | **vòng khép**: trồng → nuôi → sản phẩm → chế biến → bán |
| **Stardew Valley** | chuồng gà / chuồng gia súc; nhặt trứng, vắt sữa; cho ăn cỏ khô [SDV] | cây ăn quả ra quả mỗi ngày theo mùa; ao câu | **tổ ong** gần hoa cho mật; bù nhìn giữ quạ khỏi ăn cây; giếng / vòi tưới [SDV] | đồ nông trại quen mặt (bù nhìn, giếng, tổ ong) làm sân "ra chất nông trại" |
| **Animal Crossing NH** | — | **cây quả bản địa, lắc cây rụng quả**, câu cá ở ao / sông | — | lắc cây là thao tác vui nhất, rẻ nhất |

> Độ tin: 摩尔 2021 và Hay Day gà / thức ăn có nguồn (dưới); Stardew / ACNH là quy ước quen thuộc (đọc qua wiki các lượt trước,
> không đọc lại lượt này); tổ ong Hay Day chưa có nguồn — quan sát chung.

### Điều rút ra
1. **Con vật là trái tim nông trại** (摩尔 禽舍, Hay Day, Stardew): mỗi ngày ghé nhặt trứng / lấy sữa = lý do quay về nhà.
2. **Vòng khép với vườn**: thức ăn con vật lấy từ nông sản mình trồng (Hay Day gà ăn ngô + lúa) → luống có thêm ý nghĩa.
3. **Một chỗ chế biến** làm nông sản đáng giá hơn (thóc → gạo).
4. **Thao tác 1–2 bước**, không phạt nặng: con vật không ăn thì **chỉ ngừng cho sản phẩm**, không ốm / chết (khung §4).
5. **Đồ nông trại nhìn là biết** (giếng, bù nhìn, giàn, tổ ong, rào thấp) là cách rẻ nhất lấp chỗ trống cho đúng chất.

## 2. Đề xuất — 9 thành phần nông trại
Quy ước "Công": **S** ≤ 1 ngày (đặc tả + ít code, khung có sẵn) · **M** 2–4 ngày (luật + code + HUD nhỏ) · **L** ≥ 1 tuần (model AI
hoặc hệ thống mới). "Dựng": **code** = khối low-poly dựng bằng code như 13 vật trang trí; **AI** = model qua `/tai-nguyen`. Toạ độ là
gợi ý, đo lại trên Canvas 3D. Từ vựng chỉ gắn khi **có trong HSK 1–2** của app (đã soát `web/src/zones/sach/hsk1.ts`, `hsk2.ts`):
鸡蛋 鱼 苹果 水果 水 米饭 牛奶 西瓜 茶 菜 买 卖 吃 喝 — gắn nhẹ: tên sản phẩm hiện chữ Hán + pinyin + loa **trong kho / bảng bán**
(nội dung học, hợp R-HUD-4), không biển chữ Hán trên công trình.

| Mã góc ảnh | Ý | Đặt ở đâu | Người chơi làm gì | Ra gì | Từ | Công | Dựng |
|---|---|---|---|---|---|---|---|
| `chuong-ga` | **Chuồng gà** + sân gà rào tre thấp | cánh tây bắc, cạnh nhà ≈ (−13; −10), sân ≈ 7 × 5 m | (1) chạm máng → **rắc thóc** (lấy 1 Lúa trong kho); (2) sáng hôm sau chạm ổ rơm → **nhặt trứng** | 2–3 trứng / ngày (có cho ăn), 0 nếu không cho ăn — gà vẫn đi lại vui | 鸡蛋 | M | code (chuồng + 3–4 gà khối nhỏ đi lại) |
| `cay-qua` | **Vườn cây quả**: táo, đào, cam (3 cây) | cánh tây nam ≈ (−13; 6), trước cụm tùng | chạm cây → nhân vật **lắc cây**, quả rụng → nhặt (tự vào kho) | mỗi cây 3 quả / ngày (giờ VN) | 苹果 水果 | S–M | code (biến thể cây chùm + quả khối) |
| `to-ong` | **Tổ ong** (2 đõ gỗ trên kệ) | giữa cánh tây ≈ (−16; −2), giữa chuồng gà và cây quả, cạnh luống hoa cúc | chạm đõ → **lấy mật** (mỗi 2 ngày); ong bay quanh luống — có tổ ong thì **hoa cúc / cây quả chín nhanh hơn chút** | hũ mật (bán giá cao) | — | S | code (đõ khối + ong là hạt nhỏ) |
| `bu-nhin` | **Bù nhìn** nón lá, áo vải | mép tây vườn rau ≈ (−8,3; 1) | món trang trí vườn: chạm → nó lắc lư, chim sẻ bay vụt lên; đổi áo / nón như món trang trí | không (không khí nông trại) | — | S | code |
| `gieng-nuoc` | **Giếng nước** có gàu + guồng tre | cánh đông, cạnh góc đông bắc luống ≈ (9; −5) | chạm giếng → **múc nước** → bình tưới "đầy nước giếng": lượt tưới kế tiếp **tưới một lần cả hàng 3 luống** (kiểu bình đồng 摩尔) | tưới nhanh hơn (đỡ lặp tay) | 水 | S–M | code (đặc tả `well` đã có, đang tắt) |
| `kho-thoc` | **Vựa thóc + cối giã gạo** (chày đạp chân) | cánh đông bắc, cạnh nhà ≈ (11; −11) | (1) bỏ Lúa vào cối; (2) chạm chày → nhân vật **đạp chày** vài nhịp → gạo; vựa thóc là chỗ chứa nhìn thấy (đống bao thóc to dần theo kho) | Gạo (bán ×2 giá Lúa); thóc nuôi gà | 米饭 (trong bảng bán) | M | code |
| `ao-ca` | **Ao cá nhỏ** + bến gỗ câu cá, bờ đá, lá sen | **thềm đông** (đã phẳng) ≈ (18; 0), ao ∅ ≈ 7 m | cầm cần câu (thêm vào vòng công cụ / túi) → **quăng** → phao động → **chạm đúng lúc** (đợi phao chìm hẳn — như 摩尔) | cá to / nhỏ (bán); ~5 lượt có cá / ngày | 鱼 | M–L | code (nước dùng shader nước có sẵn) — **khu mới: bắt buộc chốt concept** |
| `chuong-bo` | **Chuồng bò con** (một bò vàng nhỏ, máng cỏ) | cánh đông nam ≈ (12; 8), cạnh lối về Bến mây | (1) chạm máng → **cho cỏ khô** (cỏ dại nhổ ở vườn thành "cỏ khô" trong kho — nối R-VUON-11); (2) hôm sau chạm bò → **lấy sữa** (bình sữa) | 1 bình sữa / ngày (có cho ăn) | 牛奶 | L | **AI** (bò con, `/tai-nguyen`); chuồng code |
| `gian-dua` | **Giàn tre dưa bầu** dạng cổng vòm qua lối | trên lối trục, đoạn nam ≈ z 8…11 (người chơi đi dưới giàn từ Bến mây vào) | 2 gốc dây mỗi bên chân giàn: gieo hạt bầu / dưa leo (hạt mới ở Tạp hoá) → dây leo lên giàn → **chạm quả treo** để hái | bầu hồ lô, dưa leo (bán) | — | M | code (giàn + dây + quả treo). Cột giàn **ngoài lối** (x ±1,8), cao ≥ 2,6 m để không chắn camera |

Thêm kèm (không thành ý riêng): **hàng rào tre thấp** quanh chuồng gà / chuồng bò (đã có `fences`, kiểu `go`) — viền chứ không
bao kín sân.

### Vòng chơi sau khi có nông trại (≈ 3–5 phút, đúng "nhẹ nhàng")
Về nhà → nhặt trứng, lấy sữa → lắc 3 cây quả → chăm vườn (tưới bằng nước giếng một lần cả hàng) → thu Lúa → giã gạo / rắc thóc cho
gà, cỏ khô cho bò → (tuỳ) câu vài con cá → bỏ hết vào thùng thu mua. Mọi thứ **không hỏng, không chết** khi bỏ mặc; chỉ ngừng ra
sản phẩm (đúng khung §4 — không chuỗi ngày mất thưởng).

## 3. Chấm điểm (khung `.claude/skills/y-tuong/references/khung.md` §2 — Học ×2, tối đa 21)
| Ý | Học (×2) | Quay lại | Hợp thế giới | Giai đoạn | Chi phí | An toàn | **Tổng** |
|---|---|---|---|---|---|---|---|
| chuong-ga | 1 → 2 | 3 | 3 | 3 | 2 | 3 | **16** |
| cay-qua | 1 → 2 | 3 | 3 | 3 | 3 | 3 | **17** |
| to-ong | 0 | 2 | 3 | 3 | 3 | 3 | **14** |
| bu-nhin | 0 | 0 | 3 | 3 | 3 | 3 | **12** |
| gieng-nuoc | 1 → 2 | 1 | 3 | 3 | 3 | 3 | **15** |
| kho-thoc | 1 → 2 | 2 | 3 | 3 | 2 | 3 | **15** |
| ao-ca | 1 → 2 | 3 | 3 | 3 | 1 | 3 | **15** |
| chuong-bo | 1 → 2 | 3 | 2 | 3 | 1 | 3 | **14** |
| gian-dua | 0 | 2 | 3 | 3 | 2 | 3 | **13** |

Học thấp theo thang (nông trại không phải chỗ học chính — học vẫn ở thầy Trúc Lão); điểm học 1 là phần **tên sản phẩm có chữ Hán +
loa** trong kho / bảng bán. Nếu sau này muốn mạnh hơn: con cá / quả "có khắc từ" ra thẻ 1 câu ôn (mẫu Măng chữ R-MANG-4) — để quyết
sau, không làm trong đợt này.

## 4. Đề xuất thứ tự
- **Đợt 1 — code dựng được, không model AI** (≈ 1 tuần): `cay-qua`, `chuong-ga`, `kho-thoc` (vòng Lúa → gạo / thóc → trứng), `gieng-nuoc`,
  `bu-nhin`. Lấp **cả hai cánh** (tây: gà + cây quả + bù nhìn; đông: giếng + vựa) ngay.
- **Đợt 2**: `ao-ca` (sau khi chốt concept — khu mới), `to-ong`, `gian-dua`.
- **Đợt 3**: `chuong-bo` (cần model bò con: `/ui-design` bộ ảnh 4 góc → `/tai-nguyen`).
- Ngân sách: mỗi ý +1–3 draw call (gà / ong instanced), mức đồ hoạ Thấp tắt con vật đi lại / ong. Đo fps trước / sau (quy tắc 4).

## 5. Quy trình
- **Ảnh concept trước** (quyết định 0006 — công trình mới ở nhà): phiếu `docs/phieu_thiet_ke/2026-11-18-concept-nong-trai-nha.md`,
  mỗi ý một góc + góc `tong` toàn đảo. Người dùng chọn ý nào làm và chốt ảnh → mới sửa sổ luật / đặc tả / code.
- Luật dự kiến (sổ trước → `/dong-bo-quy-tac`): nhóm mới **R-NONG-*** (chuồng gà, cây quả, tổ ong, giếng, cối giã, ao cá, chuồng
  bò, giàn) + sửa R-VUON-7 (bán thêm trứng / quả / gạo / cá / sữa / mật), R-VUON-9 (hạt bầu / dưa leo, cần câu), R-VUON-11 (cỏ nhổ →
  cỏ khô), R-TUI-1 (tab Nông sản thêm loại mới), R-NHA-7 (công trình nông trại chiếm chỗ — không đặt đồ trang trí đè lên).
- Câu hỏi cho người dùng: (1) chọn ý nào (sau khi xem ảnh)? (2) công trình nông trại **đặt cố định** (khuyên — đơn giản) hay
  **mua ở Tạp hoá rồi tự đặt** như đồ trang trí (giống 摩尔 / Hay Day, linh hoạt hơn, công thêm M)? (3) con vật nào: gà + bò con
  (khuyên) hay vịt / dê?

## Đã loại khỏi phạm vi (người dùng thu hẹp 2026-11-18 — giữ để tham khảo sau)
Các ý của lượt trước **không thuộc nông trại**, không làm trong việc này: A1 sân bày sẵn đèn lồng / chậu lan / bàn trà · A2 bướm,
chim sẻ, đom đóm · A3 khói bếp, cửa sổ sáng theo giờ · A4 tiếng sân · A5 mây trôi / đảo đá xa · B1 thú cưng mèo / chó con · B4 hộp
thư buổi sáng · B5 khách NPC ghé nhà · B6 thời tiết mỗi ngày · C1 nội thất khởi đầu · C2 góc học + tường từ · C3 đồ trong nhà có tên
tiếng Trung · C4 bếp nấu món · C5 cửa sổ nhìn vườn. Hai ý cũ **đã chuyển vào nông trại**: B2 ao cá → `ao-ca`, B3 cây táo → `cay-qua`.
Nghiên cứu lượt trước về "nhà sống" (ACNH checklist sáng, Noun Town, 拉姆) còn trong lịch sử git của file này (commit trước
V-114 lượt 2).

## Bước kế
- Phiên chính tạo ảnh: `bash .claude/skills/ui-design/scripts/gemini-anh.sh tao docs/phieu_thiet_ke/2026-11-18-concept-nong-trai-nha.md`.
- Người dùng chọn ý + chốt ảnh → `/lead Nông trại Nhà của ta đợt 1: … (phiếu docs/y_tuong/2026-11-18-nha-song-dong.md)`.

## Nguồn
- [XM-b] 摩尔庄园手游 农夫职业全面介绍 https://game.xiaomi.com/viewpoint/1359077112_1635909862400_13 (种田、钓鱼、养殖小动物; 禽舍: 蛋、牛奶、羊毛;
  nông sản cho đơn dân / 花婶 / nhà hàng; máy tưới / gieo / thu tự động)
- [XM-c] 摩尔庄园手游 新玩家需要注意哪些细节 https://game.xiaomi.com/viewpoint/1359077112_1635819527649_13 (câu cá: phao động đợi rồi mới chạm)
- [TT] TapTap 摩尔庄园 https://www.taptap.cn/app/78344 (gà / bò / cừu → trứng / sữa / len)
- [HD-w] Hay Day Wiki — Chicken https://hayday.fandom.com/wiki/Chicken (chuồng 6 gà, trứng 20 phút, cần thức ăn; thức ăn gà = ngô + lúa mì)
- [HD-a] Hay Day — App Store https://apps.apple.com/gb/app/hay-day/id506627515 (hồ câu cá sửa bến, máy nghiền thức ăn, máy đường)
- [SDV] Stardew Valley Wiki https://www.stardewvalleywiki.com/ (chuồng, tổ ong, bù nhìn, cây ăn quả — quy ước chung, đọc lượt trước)
