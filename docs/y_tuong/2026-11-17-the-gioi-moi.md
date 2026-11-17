# Thế giới mới cho 6 vùng (đề xuất làm lại hoàn toàn)
- Ngày: 2026-11-17 · Việc: V-20261117-79 · Hệ thống (khung 摩尔庄园): bản đồ / khu vực + trò chơi nhỏ
- Trạng thái: **nháp, chờ người dùng chọn bộ** · Điểm: bộ 1 16/21, bộ 2 19/21 (chấm ở §7)
- Hồ sơ gốc: `docs/tham_khao/ten-map-kieu-moly.md` (cách Moly đặt tên, 3 bộ tên trước). Phiếu này **chỉ đề xuất**, chưa sửa
  đặc tả, bản đồ, luật hay code.

## Một câu
Mỗi vùng là **một nơi có một công trình nhìn là nhận ra + một trò chơi chính**, giống Lâu Đài Moor hay Rừng Quả Mọng của Moly.
Tên thuần Việt, trẻ đọc là thấy hình ảnh và cảm giác; chữ Hán chỉ nằm trong trò chơi.

## Diễn biến thảo luận (để không quay lại hướng đã bỏ)
| Lần | Hướng | Người dùng |
|---|---|---|
| 1 | Bộ A/B/C: Hán Việt + việc làm (Hội Đèn Yên Vũ, Tiệc Đào Bồng Lai…) | nên thuần Việt; mỗi map cần **kiến trúc đặc trưng** |
| 2 | "loại nơi + công trình" (Làng Lầu Sách, Hồ Lầu Mưa…) | vẫn khó hiểu; muốn **đơn giản, dễ hiểu mà vẫn văn học** |
| 3 | thuần Việt có chất thơ theo bối cảnh cũ (Rừng Trúc Reo, Phố Mưa Bụi, Đảo Mây Tiên…) | **không cần giữ bối cảnh cũ, đề xuất mới hoàn toàn** |

## Lấy cảm hứng từ
- Moly (摩尔庄园, bản Việt VNG 2011–2012; Moly Mobile 2023): khu nào cũng có **một vật / công trình là linh hồn** và tên nói
  ra vật đó: Lâu Đài Moor, Rừng Quả Mọng (quả để hái), Thác Cầu Vồng, Núi Raya (trượt tuyết). Chỉ học cơ chế, không chép tên.
- Animal Crossing: mỗi mùa đổi màu và đổi việc làm. Club Penguin: mỗi khu có một trò chơi riêng đặt ngay trong cảnh.
- Nguồn đầy đủ: `docs/tham_khao/ten-map-kieu-moly.md` mục Nguồn.

## Luật đặt tên dùng ở đây
1. Thuần Việt, 2–4 tiếng, ≤ 20 ký tự; **danh từ nơi đứng đầu, mỗi vùng một danh từ khác nhau** (không trùng "Trấn", "Nhà").
2. Tên = **hình ảnh + cảm giác** (mưa xuân, đèn hoa, ngủ quên), không tả địa lý khô, không từ láy cho có (lỗi bộ V-50).
3. Không chữ Hán, không Hán Việt khó (R-HUD-4). Từ Hán Việt trẻ quen (tiên, ngọc) vẫn dùng được.
4. Công trình đặc trưng: **một** vật to, dáng lạ, thấy từ xa, chụp ảnh nhận ra ngay; công trình phụ thì để sau.
5. Tránh trùng cảm giác với **trấn** (núi cao, chè, sách, cờ, trà lâu) và **nhà** (đảo nhỏ trên biển mây, vườn rau).

## 1. Bộ 1: "Bốn mùa, sáng tối" (thiên nhiên)
Sáu vùng là sáu khoảnh khắc trong năm và trong ngày. Dễ hiểu nhất với trẻ; mỗi vùng một màu trời riêng.

| # | Mã cảnh (giữ) | Tên | Công trình đặc trưng | Trò chính · chữ đi vào đâu | Màu · mùa · thời tiết |
|---|---|---|---|---|---|
| 1 | `rung-truc` | **Suối Mưa Xuân** | **Guồng Nước Tre** khổng lồ quay bên suối | 3 trò có sẵn (chén trôi suối, hái măng sau mưa, đàn cầm) + học bộ thủ: mỗi gầu guồng mang một bộ thủ, chọn đúng bộ người kia hỏi | xanh non, trắng sương · xuân · mưa bụi rồi tạnh |
| 2 | `giang-nam` | **Hồ Sen Nắng Hạ** | **Đình Lá Sen**: lá sen khổng lồ nổi giữa hồ, có đình nhỏ trên lá | **Nhảy lá sen**: mỗi lá một chữ, nhảy theo nghĩa / âm đúng để qua hồ (đọc chữ HSK 1); chèo thuyền thúng hái sen | hồng sen, lục đậm · hạ · nắng trưa, ve kêu |
| 3 | `bong-lai` | **Bờ Cát Bình Minh** | **Rùa Đá Ngắm Biển**: rùa đá khổng lồ nằm mép nước, lưng đội mái đình (dáng bia rùa) | **Nhặt sò lúc triều rút** (có giờ): vỏ sò mang chữ, gom theo bộ (氵, 魚…); xếp đá trên cát thành nét chữ | cam hồng, cát trắng, biển ngọc · sáng sớm · gió nhẹ |
| 4 | `tu-cam-thanh` | **Đồng Lúa Diều Bay** | **Ông Bù Nhìn Rơm** khổng lồ đội nón, tay giữ dây diều | **Thả diều chữ**: ghép đúng từ hai chữ thì diều lên cao (từ ghép HSK 3); gặt lúa đổi bánh | vàng lúa, đỏ diều, trời xanh · thu · chiều lộng gió |
| 5 | `truong-thanh` | **Núi Tuyết Hoa Mai** | **Thác Băng** đóng giữa vách, gốc mai hồng trên đỉnh | **Trượt băng vẽ chữ**: trượt theo đúng thứ tự nét để "viết" chữ trên mặt hồ băng; nặn người tuyết | trắng tuyết, hồng mai, lam băng · đông · tuyết rơi nhẹ |
| 6 | `to-lua` | **Rừng Đom Đóm** | **Cây Đèn Ngàn Năm**: cổ thụ phát sáng, đom đóm quanh tán | **Gọi đom đóm**: nghe đọc âm, chọn đúng chữ thì đom đóm bay xếp thành chữ đó (nghe + đọc, HSK cao) | tím than, lam đêm, vàng đom đóm · đêm trăng non |

Câu chào khi vào vùng:
1. Suối Mưa Xuân: "Mưa xuân vừa tạnh, măng non đội đất. Nghe kìa, guồng tre đang hát bên suối!"
2. Hồ Sen Nắng Hạ: "Nắng hạ vàng ươm, sen nở kín hồ. Nhảy qua lá sen nào!"
3. Bờ Cát Bình Minh: "Mặt trời vừa nhô khỏi biển, sóng mang về bao vỏ sò lấp lánh."
4. Đồng Lúa Diều Bay: "Lúa chín vàng đồng, gió thu lồng lộng. Thả diều lên thật cao!"
5. Núi Tuyết Hoa Mai: "Tuyết phủ trắng núi mà hoa mai vẫn nở. Nhớ mặc áo ấm nhé!"
6. Rừng Đom Đóm: "Suỵt… trời tối rồi, ngàn con đom đóm đang thắp đèn cho rừng."

Ưu: cả bộ có một ý chung (vòng năm), trẻ hiểu ngay, màu sắc rất khác nhau, hợp "hoạt hình mềm". Vị trí cũng có lý: bình minh
ở biển phía đông, tuyết ở núi phía bắc, đêm ở phía tây (nơi mặt trời lặn).
Nhược: thiên về cảnh hơn là "chốn kỳ lạ"; chất cổ trang / tiên hiệp nhạt; công trình (guồng, bù nhìn, rùa) nhỏ hơn tầm "lâu đài".
Mùa đã gắn cứng vào vùng thì sau này khó làm sự kiện "mùa" chung cho cả thế giới.

## 2. Bộ 2: "Phiêu lưu kỳ ảo" (tiên hiệp nhẹ)
Sáu vùng là sáu chốn lạ: có phép, có vật khổng lồ, mỗi nơi một "bí mật" để khám phá. Công trình to như lâu đài Moly.

| # | Mã cảnh (giữ) | Tên | Công trình đặc trưng | Trò chính · chữ đi vào đâu | Màu · mùa · thời tiết |
|---|---|---|---|---|---|
| 1 | `rung-truc` | **Thung Trúc Gió Hát** | **Tháp Sáo Trúc**: tháp ghép từ ống trúc to, gió lùa qua kêu thành tiếng | 3 trò có sẵn + **Trúc hát**: mỗi ống trúc một thanh điệu, nghe đọc rồi gõ đúng ống (4 thanh), cùng bộ thủ (R-HANH-3) | lục trúc, trắng sương · đầu xuân · gió nhẹ, sương sớm |
| 2 | `giang-nam` | **Chợ Đêm Đèn Hoa** | **Cây Đèn Trăm Tầng** giữa bến sông (dáng "cây đèn" hội Nguyên tiêu thời Đường) | **Đố đèn**: mỗi đèn một câu đố chữ; **Bán hàng**: khách gọi món bằng số + lượng từ (一碗面), trả Văn tiền (HSK 1–2) | đỏ son, vàng đèn, lam đêm · tối hội · mặt sông soi đèn |
| 3 | `tu-cam-thanh` | **Rừng Nấm Tiên** | **Lò Thuốc Tiên**: đỉnh đồng ba chân khổng lồ đặt trên mũ nấm, khói thơm | **Luyện thuốc ghép chữ**: bỏ bộ thủ vào lò, ghép đúng ra chữ (木+木→林, 氵+每→海), được "thuốc" làm đồ; hái thảo dược bộ 艹 | tím nhạt, hồng nấm, lục rêu · cuối hạ · chiều ẩm, khói tím |
| 4 | `bong-lai` | **Cung Ngọc Đáy Biển** | **Cung Vỏ Sò**: cung điện vỏ ốc xà cừ khổng lồ, mái san hô | **Đưa cá về nhà**: cá mang chữ, dẫn về đúng hang theo nghĩa / bộ (chữ có 氵, 魚); nhặt ngọc trai = chữ đến hạn ôn (ôn cách quãng) | xanh ngọc, hồng san hô · không mùa · nắng xuyên nước, bong bóng |
| 5 | `truong-thanh` | **Đỉnh Hạc Bay** | **Tổ Hạc trên Cột Đá**: cột đá cao vút, nối bằng cầu treo, tổ hạc trên đỉnh | **Cưỡi hạc**: bay qua các vòng mang chữ theo đúng thứ tự để thành câu / thành ngữ (HSK 4–6) | trắng, lam trời, đá xám · thu trời trong · gió lộng |
| 6 | `to-lua` | **Thành Cát Ngủ Quên** | **Cổng Thành Vùi Cát**: cổng thành cổ lún nửa trong cát, đầu lạc đà đá | **Đào cổ vật**: đào được mảnh xương, chuông đồng khắc chữ cổ, ghép với chữ ngày nay (chữ đổi dáng qua thời gian, phồn thể) | cam cát, lam gắt, đỏ hoàng hôn · nắng nóng · gió cát nhẹ |

Câu chào khi vào vùng:
1. Thung Trúc Gió Hát: "Gió lùa qua thung, cả rừng trúc cất tiếng hát. Lắng nghe nào!"
2. Chợ Đêm Đèn Hoa: "Đèn hoa đã thắp sáng bờ sông. Chợ đêm mở cửa rồi!"
3. Rừng Nấm Tiên: "Nấm cao hơn cả nhà, khói thơm bay từ lò thuốc tiên… ai đang nấu gì thế?"
4. Cung Ngọc Đáy Biển: "Hít một hơi thật sâu nào. Cung ngọc dưới biển đang chờ bạn!"
5. Đỉnh Hạc Bay: "Núi cao chạm mây, đàn hạc trắng đã sẵn sàng chở bạn bay."
6. Thành Cát Ngủ Quên: "Dưới lớp cát vàng, một toà thành cổ đã ngủ quên cả ngàn năm…"

Ưu: mỗi vùng có công trình "khổng lồ, lạ" đúng kiểu Moly; chất tiên hiệp rõ (lò thuốc, hạc, long cung); **mỗi trò dạy một kỹ
năng chữ khác nhau** (thanh điệu → số / lượng từ → ghép bộ → bộ + ôn → câu → chữ cổ), thành một bậc thang học.
Văn hoá thật để `/khao-cuu`: cây đèn hội Nguyên tiêu (灯树), đỉnh luyện đan, long cung, giáp cốt văn.
Nhược: **Cung Ngọc Đáy Biển khó dựng nhất** (cảnh dưới nước không được dùng hậu kỳ, quy tắc 4: phải làm bằng sương xanh + màu
đỉnh + vệt nắng giả, cần đo fps); Chợ Đêm cần nhiều đèn tự sáng (không đèn thật, nướng vào màu). Không có cảnh tuyết.

Chất liệu bối cảnh cũ được dùng lại **làm nguyên liệu, không làm tên**: đèn hội (Giang Nam), long cung / hạc (Bồng Lai),
sa mạc (Đôn Hoàng). Không giữ lại tên cũ nào.

## 3. Nghiêng về: **Bộ 2**, mượn một chỗ từ bộ 1 nếu muốn
Bộ 2 giống Moly hơn ở điểm người dùng thích nhất: **mỗi khu một công trình lạ + một việc vui**, tên vẫn giản dị. Nó cũng cho
mỗi vùng một kỹ năng học riêng, nên tên vùng gắn với "ở đó học gì" mà không cần ghi cấp độ. Hai phương án trộn:
- Muốn có tuyết: thay **Đỉnh Hạc Bay** bằng **Núi Tuyết Hoa Mai** (giữ trò "cưỡi hạc" thành "trượt băng vẽ chữ" hoặc cả hai).
- Cung dưới nước quá nặng cho điện thoại: thay **Cung Ngọc Đáy Biển** bằng **Bờ Cát Bình Minh** (Rùa Đá Ngắm Biển), làm
  long cung sau như một gian trong.

## 4. Trúc Lâm: tận dụng, không làm lại
Cả hai bộ **giữ nguyên địa hình thung suối, rừng trúc và 3 trò** (Lưu Thương Lệnh, Hái măng, Đàn cầm), chỉ đổi tên vùng và
thêm **một** công trình đặc trưng ở chỗ nhìn thấy từ cổng vào:
- Bộ 1 "Suối Mưa Xuân": thêm Guồng Nước Tre bên suối; trời đổi sang mưa bụi, tạnh dần. Trò hái măng sau mưa khớp chủ đề sẵn.
- Bộ 2 "Thung Trúc Gió Hát": thêm Tháp Sáo Trúc; trò Đàn cầm và trò mới "Trúc hát" cùng chủ đề âm thanh.
- Tên công trình đang là Hán Việt có thể Việt hoá cho đồng bộ (tuỳ chọn): Vọng Trúc Đình → **Đình Ngắm Trúc**, Khúc Thuỷ Đài →
  **Suối Chén Trôi**, Trúc Lư → **Lều Trúc**. Tên trò cũng vậy: Lưu Thương Lệnh → **Chén Trôi Đố Chữ**.
- Bộ thủ vẫn học ở vùng này (R-HANH-3 không đổi).

## 5. Vị trí trên bản đồ và thứ tự mở
Giữ **6 ô vị trí, 6 mã cảnh và mọi lối đi bộ V-59** trong `design/scene/ban-do/ban-do.json`; chỉ đổi chủ đề ô nào sang gì.
Thứ tự mở dưới đây đi theo đúng các lối đã có (đề xuất; mốc số chữ duyệt ở sổ quy tắc khi chốt).

| Ô (toạ độ px) | Lối đi bộ có sẵn | Bộ 1 | Bộ 2 | Mở (bộ 2) |
|---|---|---|---|---|
| giữa đồng bằng (860, 740) | trấn, ô đông, ô bắc | Suối Mưa Xuân | Thung Trúc Gió Hát | từ đầu · bộ thủ, thanh điệu |
| đông, có ao hồ (1400, 790) | ô giữa, ô đông bắc; thuyền ra đảo | Hồ Sen Nắng Hạ | Chợ Đêm Đèn Hoa | HSK 1 |
| đông bắc (1430, 300) | ô đông, ô bắc | Đồng Lúa Diều Bay | Rừng Nấm Tiên | HSK 2 |
| biển đông (1880, 610) | thuyền từ ô đông | Bờ Cát Bình Minh | Cung Ngọc Đáy Biển (lặn từ bến chợ) | HSK 3 |
| núi phía bắc (930, 235) | ô giữa, ô đông bắc, ô tây bắc | Núi Tuyết Hoa Mai | Đỉnh Hạc Bay | HSK 4–6 |
| tây bắc (330, 290) | ô bắc | Rừng Đom Đóm | Thành Cát Ngủ Quên | HSK 7–9, mở rộng |

Mã cảnh sẽ lệch nghĩa (vd. `tu-cam-thanh` thành Rừng Nấm Tiên). Đề xuất **giữ mã** cho đỡ vỡ tiến độ đã lưu và `?vung=`; đổi mã
là việc riêng, sau. Các miền lớn in trên giấy bản đồ (Tây Vực, Yên Vân, Kinh Kỳ…) cũng là Hán Việt: khi vẽ lại `ban-do-goc.png`
nên bỏ, hoặc đổi thành tên miền thuần Việt (vd. Miền Cát, Miền Núi Bắc, Miền Sông Nước).

## 6. Tuỳ chọn: tên trấn và nhà
- Trấn: nghiêng **giữ "Khởi Nguyên Trấn"** (đã nói được "nơi bắt đầu", có trong rất nhiều chỗ). Nếu muốn cả thế giới thuần
  Việt: **Làng Mực Thơm** (chơi chữ "Mặc" của Tiểu Mặc; làng của chữ và mực).
- Nhà: **Đảo Nhà Ta** (nói rõ là đảo nhỏ trên biển mây) hoặc giữ "Nhà của ta".

## 7. Chấm điểm (theo `.claude/skills/y-tuong/references/khung.md` §2)
| Mục | Bộ 1 | Bộ 2 | Lý do |
|---|---|---|---|
| Học chữ (×2) | 2 → 4 | 3 → 6 | bộ 2 mỗi vùng một kỹ năng khác nhau, thành bậc thang; bộ 1 nhiều trò "chọn chữ đúng" giống nhau |
| Lý do quay lại | 2 | 3 | bộ 2 có thứ đang chờ: lò thuốc nấu xong, cổ vật mới, ngọc trai ôn tới hạn |
| Hợp thế giới | 2 | 3 | bộ 2 tiên hiệp rõ, văn hoá thật để khảo cứu; bộ 1 đẹp nhưng nhạt cổ trang |
| Giai đoạn | 3 | 3 | chơi một mình / NPC được |
| Chi phí | 2 | 1 | bộ 2 có cảnh dưới nước và đêm nhiều đèn, công trình to hơn |
| An toàn | 3 | 3 | không rủi ro |
| **Tổng** | **16** | **19** | cả hai ≥ 15; bộ 2 đắt hơn nhưng đáng hơn |

## Đặt ở đâu
6 cảnh vùng (mã giữ nguyên). Trúc Lâm dùng lại cảnh; 5 vùng còn lại dựng mới từ nền trống (đã xoá kiến trúc ở V-66 B0).

## Cần gì (khi người dùng chốt một bộ)
- Ảnh concept trước (CLAUDE.md, `decisions/0006`): xem §8.
- Luật: đổi tên vùng trong sổ `docs/testing/quy_tac.md` (khoảng 22 luật, theo khung V-53 `docs/tasks/2026-11-15-doi-ten-vung.md`),
  thêm luật cho từng trò mới khi làm trò đó; mốc mở vùng nếu đổi thứ tự.
- Giao diện: nhãn bản đồ, màn tải, biển cổng (tên ≤ 18 ký tự, đã vừa giới hạn 20 của `scene/placeNames.ts`).
- Cảnh: `/khao-cuu` cho cây đèn hội, đỉnh luyện đan, long cung, giáp cốt văn (bộ 2) trước `/canh`.
- Dữ liệu: bảng thanh điệu, cặp bộ thủ ghép chữ, lượng từ HSK 1–2, chữ cổ ↔ chữ nay.
- Chờ giai đoạn mạng: chợ đêm có người chơi khác bán hàng (bản đầu: khách NPC).

## 8. Bước tiếp theo (theo "ảnh concept trước")
1. Người dùng chọn bộ (hoặc bộ trộn ở §3), chốt tên trấn / nhà ở §6.
2. Soạn phiếu ảnh concept (chưa soạn), mỗi phiếu có câu lệnh Gemini soạn sẵn, phong cách low-poly hoạt hình mềm, không chữ Hán:
   - `docs/phieu_thiet_ke/<ngày>-concept-the-gioi-moi.md`: bản đồ tổng thể mới (6 vùng + trấn + nhà, tên mới, bỏ miền Hán Việt);
   - một phiếu mỗi vùng, gồm toàn cảnh + cận công trình đặc trưng. Nếu chọn bộ 2:
     `-concept-thung-truc-gio-hat.md` (chỉ Tháp Sáo Trúc đặt vào thung có sẵn), `-concept-cho-dem-den-hoa.md`,
     `-concept-rung-nam-tien.md`, `-concept-cung-ngoc-day-bien.md`, `-concept-dinh-hac-bay.md`, `-concept-thanh-cat-ngu-quen.md`;
     bộ 1 tương ứng: `-concept-suoi-mua-xuan.md`, `-concept-ho-sen-nang-ha.md`, `-concept-bo-cat-binh-minh.md`,
     `-concept-dong-lua-dieu-bay.md`, `-concept-nui-tuyet-hoa-mai.md`, `-concept-rung-dom-dom.md`.
3. Người dùng tạo ảnh ở `/ui-design` (Gemini) và chốt vào `design/concept/<tên>/`.
4. Chỉ khi đó: `/lead` đổi tên (khung V-53) + bản đồ; `/canh` dựng từng vùng; `/tai-nguyen` cho 1–2 công trình nổi bật
   (vd. Lò Thuốc Tiên, Cung Vỏ Sò); `/lead` cho từng trò mới (mỗi trò một việc, sửa sổ quy tắc trước).

## Bước kế
Người dùng chọn bộ → soạn phiếu concept §8 → `/ui-design` tạo ảnh → `/lead đổi tên vùng theo docs/y_tuong/2026-11-17-the-gioi-moi.md`.
