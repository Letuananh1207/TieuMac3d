# Hạc cưỡi truyền tống: hạc đỉnh đỏ / hạc tiên (丹顶鹤 · 仙鹤)
- Ngày: 2026-11-16 · Khu: Truyền Tống Đài + mọi nơi đến (hoạt cảnh cưỡi hạc R-HANH-5) · Trạng thái: đã chọn hướng (Claude, một bước) · đã chuyển phiếu (`docs/phieu_thiet_ke/2026-11-16-anh-hac.md`)

## Một câu
Con hạc trắng lớn chở đệ tử bay giữa các vùng: nhìn là nhận ra **hạc đỉnh đỏ** (thân trắng, cổ đen, chỏm đỏ, viền cánh
đen), nhưng tròn, mềm, "đồ chơi" như nhân vật chibi. Phải hiền, sang và đủ to để người ngồi trên lưng trông vừa vặn.

## Đặc điểm nhận diện (thiếu là "không ra chất")
Xếp theo độ quan trọng khi nhìn từ camera cưỡi hạc (sau và trên lưng hạc, 4–8 m) và camera hạ cánh (dưới đất nhìn lên).
1. **Chỏm đầu đỏ** (da trần đỏ trên đỉnh đầu, không phải lông, không phải mào dựng). Đây là dấu hiệu số 1 của 丹顶鹤.
2. **Thân và cánh trắng tinh**, có **dải đen ở mép sau cánh** (lông cánh thứ cấp + lông cánh tam cấp). Lông cánh sơ cấp
   (đầu cánh ngoài) của loài này **trắng**, khác các loài sếu khác. Từ trên và từ dưới nhìn lên đều thấy viền đen chạy
   dọc mép sau, nên đây là nét quan trọng thứ hai khi bay.
3. **Cổ và mặt đen**, có **một dải trắng** chạy từ sau mắt vòng xuống gáy. Má và họng đen.
4. **Dáng bay**: cổ duỗi thẳng ra trước, chân duỗi thẳng ra sau vượt quá đuôi. Hạc (khác diệc) bay **không** gập cổ.
   Tranh 《瑞鶴圖》 của Tống Huy Tông (1112) vẽ đúng như vậy.
5. Mỏ dài vừa, màu **vàng ô liu xám**. Chân đen xám.
6. Khi đứng, lông tam cấp đen rủ phủ lên đuôi nên trông như "đuôi đen". **Khi bay, đuôi thật màu trắng.** Code khối hiện
   có (`hac.ts`) đang dựng "đuôi đen". Model mới theo dáng bay nên vẽ đuôi trắng, chỉ mép sau cánh màu đen.

## Quy chế · cấp bậc (quy ước thể loại)
- Hạc là **sứ giả / vật cưỡi của tiên**. 《列仙傳》 kể Vương Tử Kiều cưỡi bạch hạc đậu trên đỉnh núi rồi bay đi. "駕鶴西去"
  (cưỡi hạc về tây) là cách nói tránh cái chết. 「松鶴延年」 là đề tài chúc thọ. Trong Đạo giáo, hạc tiên đón đạo sĩ lên trời.
- Tiểu thuyết 《封神演義》 cho Thái Ất Chân Nhân cưỡi hạc lông đen. Đây là chi tiết riêng của truyện; dự án **không dùng**
  (hạc của R-HANH-5 là hạc trắng, và vùng Bồng Lai dùng ý "禽獸盡白" (chim thú đều trắng), xem `bong-lai.md`).
- Phim / tranh tiên hiệp thường vẽ hạc cưỡi **to gấp nhiều lần hạc thật**, người ngồi xếp bằng hoặc đứng trên lưng, cánh
  dang rộng lướt trên biển mây, không yên, không cương. Đây là *quy ước thể loại* (không chép phim cụ thể nào). Hạc là vật
  linh, nên không đeo yên cương như ngựa.

## Tỉ lệ · số đo (mét, hệ cảnh)
| Bộ phận | Ngoài đời | Trong cảnh | Ghi chú |
|---|---|---|---|
| Dài mỏ → đuôi | 1,0–1,5 m | ≈ 3 m (× `crane.scale` 1,25 → ≈ 3,75 m) | phóng to ≈ 2,5 lần để chở người (quy ước) |
| Sải cánh | 2,2–2,5 m | ≈ 5,6 m (× 1,25 → ≈ 7 m) | sải / dài ≈ 1,9 (đời thật ≈ 1,7) |
| Bề ngang thân (trước nhìn) | — | ≈ 0,75 m (× 1,25) | ≈ 1/7 sải cánh: thân phải **hẹp hơn nhiều** so với cánh để code tách cánh |
| Cổ | dài, mảnh | ngắn, dày hơn (chibi) | cổ chiếm ≈ 1/4 chiều dài, không cong chữ S |
| Đầu | nhỏ | to hơn (≈ 1,4 lần tỉ lệ thật) | chibi, mắt tròn đen hiền |
| Chỗ ngồi | — | `SEAT_AT` (0; 1,82; −0,1), sau gốc cánh một chút | lưng phẳng, rộng ≥ 0,6 m |

Nhân vật đệ tử cao ≈ 2,1 m trong cảnh. Khi ngồi xếp bằng, nhân vật chiếm ≈ 1/3 chiều dài lưng hạc, trông như chim lớn chở
một đứa trẻ. Đúng cảm giác cổ tích.

## Màu
| Vai trò | Hex | Có trong phong_cach.md / spec? | Nguồn / lý do |
|---|---|---|---|
| Thân, cánh, đuôi, dải gáy | `#F6F4EE` | có (`crane.body`) | trắng ấm, không xanh lạnh |
| Cổ, mặt, mép sau cánh | `#25242B` | có (`crane.tip`) | đen ấm, có ánh than |
| Chỏm đỏ | `#C8343A` | có (`crane.crest`; Bồng Lai `#C8322A`) | da trần đỏ son |
| Mỏ | `#C2B17C` | có (`crane.beak`) | vàng ô liu xám |
| Chân | `#3B3A3A` | có (`crane.leg`) | đen xám |
| Mắt | `#1E1C20` | mới | chấm tròn, có điểm sáng nhỏ như mắt nhân vật |
| Bóng khối dưới cánh / bụng (trong ảnh render) | ≈ `#DCD9D2` | mới (chỉ là bóng mềm trong ảnh) | AI cần bóng để đoán độ dày cánh |

## Hướng
- **A (chọn): hạc đỉnh đỏ chibi "đồ chơi"**, theo bộ màu loài thật (trắng, cổ đen, dải gáy trắng, chỏm đỏ, mép sau cánh
  đen), thân tròn mập, đầu to, cổ ngắn dày, mỏ ngắn vừa, cánh to bản, lưng phẳng rộng. Render vinyl / đất sét giống nhân
  vật chính. Hợp `phong_cach.md` (màu đã có trong `crane.*`), đứng cạnh nhân vật chibi không lạc, và hình khối liền mạch
  giúp Tripo dựng sạch, code tách cánh dễ.
- B (bỏ): hạc tiên trang trí kiểu phim (đuôi lông dài bay như phượng, ánh vàng, mây lành quanh chân, yên ngọc, dải lụa).
  Chi tiết rời, AI dựng hỏng. Trông giống phượng hơn hạc. Yên thì phải dựng riêng.
- C (bỏ): hạc tả thực theo tỉ lệ thật (cổ dài mảnh, mỏ dài, chân mảnh). Lạc với nhân vật chibi. Phần mảnh làm lưới rách,
  và cổ dài chiếm hết khung khi cưỡi.
- D (bỏ): hạc lông đen (《封神》). Trái R-HANH-5 ("hạc trắng") và ý "thú trắng" của Bồng Lai.

## Dựng (model Tripo + code)
| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ước draw call |
|---|---|---|---|
| Thân + cổ + đầu + chân + đuôi | giữ, một khối | model Tripo (texture 2K, không-sáng như nhân vật) | 1 |
| Hai cánh | giữ, **tách bằng code** | đỉnh có \|x\| > nửa bề ngang thân + vùng chuyển → mesh cánh trái / phải, trục quay ở vai | 2 |
| Lông cánh rời, ngón lông sơ cấp | gộp | khắc nông trên mảng cánh liền, không khe | 0 |
| Yên, dây | bỏ | nhân vật ngồi bằng code ở `seat` | 0 |
Tổng: 3 draw call (bằng bản khối hiện tại), 8 000–12 000 tam giác (chỉ có trong hoạt cảnh, không cộng vào cảnh thường).

## Sai thường gặp cần tránh
- Cánh khép, cánh nghiêng lên kiểu chữ V hoặc cụp xuống, hai cánh không đối xứng. Khi đó code không tách cánh theo
  khoảng cách ngang được.
- Cánh che thân, hoặc gốc cánh phình ra phủ cả lưng. Lưng phải lộ, phẳng.
- Lông rời từng sợi bay tách (đầu cánh xoè ngón, đuôi tua). AI dựng ra mảnh vụn, lưới thủng.
- Cổ cong chữ S, đầu ngoái. Thế là sai dáng bay của hạc, lại che thân.
- Chân co dưới bụng. Hạc bay thì chân duỗi thẳng ra sau.
- Mỏ quá dài mảnh (dễ gãy, nhọn như kim). Nên mỏ dài ≈ 1,3 lần đầu, đầu mỏ tù tròn.
- Đuôi đen (lẫn lông tam cấp khi đứng). Khi bay, đuôi trắng.
- Chỏm đỏ thành mào dựng như gà. Chỏm phải là mảng đỏ phẳng trên đỉnh đầu.
- Thêm yên, dây cương, chuông, dải lụa, mây dưới chân, chữ.

## Đưa vào cảnh
- `scene.json` không cần đổi (màu `crane.*` giữ để dự phòng cho bản khối).
- **Cần code** (kế hoạch `/lead` sau khi có model): `hac.ts` nạp `design/models/hac.glb` nếu có (không có thì dùng khối như
  cũ). Lúc nạp, tách đỉnh theo \|x\| thành thân + 2 cánh, đặt trục ở vai, vỗ bằng `flapAngle` quanh trục dọc thân. Tính lại
  `seat` theo đỉnh lưng của model. Hai điểm cần quyết khi lập kế hoạch: (1) lúc đứng trên đất có gập cánh không (model
  dáng bay; quay mesh cánh quanh trục đứng như `FOLD_YAW` có thể méo, hoặc để cánh nửa dang, vì hạc thật đáp cũng dang
  cánh); (2) chân duỗi sau lúc đứng: hạ thân cho chân chạm đất, hay để hạc "lơ lửng" một chút khi đáp.

## Nguồn
- Red-crowned crane, Wikipedia — https://en.wikipedia.org/wiki/Red-crowned_crane — số đo (dài 101–150 cm, sải 220–250 cm),
  chỏm đỏ là da trần, lông sơ cấp trắng (riêng loài này), thứ cấp + tam cấp đen
- Red-crowned crane, International Crane Foundation — https://savingcranes.org/species/red-crowned-crane/ — màu cổ / mặt,
  dải trắng gáy
- Red-crowned Crane, BirdForum Opus — https://birdforum.net/opus/Red-crowned_Crane — dài 138–152 cm, bộ lông
- 宋画里的鸟类 (《瑞鶴圖》, Tống Huy Tông, Bảo tàng tỉnh Liêu Ninh) — https://hznews.hangzhou.com.cn/wenti/content/2024-07/06/content_8755178.htm
  — khoảng 20 hạc đỉnh đỏ bay trên lầu cung, cổ duỗi, chân duỗi sau (tham khảo dáng bay)
- Crane in Chinese mythology — https://kaweah.freedombox.rocks/kiwix/wikipedia_en_all_maxi_2023-10/Crane_in_Chinese_mythology
  — Vương Tử Kiều cưỡi hạc (《列仙傳》), hạc là sứ giả / vật cưỡi của tiên, Thái Ất Chân Nhân cưỡi hạc đen (《封神演義》)
- Birds and their meanings in China, The World of Chinese — https://www.theworldofchinese.com/2022/04/birds-and-their-meanings-in-china/
  — 仙鶴, 松鶴延年, 駕鶴西去
- Quy ước tiên hiệp (người cưỡi hạc to ngồi trên lưng, không yên) là *quy ước thể loại*, tổng hợp chung, không theo phim nào.
