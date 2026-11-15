# Làm lại 6 vùng — địa hình trước, kiến trúc sau (重做六域 · 先地形後建築)
- Ngày: 2026-11-15 · Khu: 6 vùng hành trình (Trúc Lâm làm thử trước) · Việc: V-20261115-66 B1 · Trạng thái: **nháp — chờ người
  dùng chọn phương án địa hình Trúc Lâm** (mục 4)
- Thay phần "bố cục / bài trí" của các hồ sơ vùng cũ (`rung-truc.md`, `giang-nam.md`, `bong-lai.md`, `truong-thanh.md`,
  `tu-cam-thanh.md`, `to-lua.md`). Phần số đo vật, màu, văn hoá, trò chơi trong hồ sơ cũ **vẫn dùng được**. Thước đo chung,
  thang cấp bậc, 4 mục đích đặt vật: theo `kien-truc-chuan.md` (K = 1,25).

## Một câu
Mỗi vùng là **một "khu vườn trong hộp"** ≈ 80–100 m mỗi cạnh: một **thế đất rõ** (thung, đồi, đảo, đèo, trục, ốc đảo),
**một mốc lớn** thấy được từ chỗ hạc đáp, **ba cổng ở mép** đúng hướng bản đồ, vài **khoảng trống chờ sẵn** cho kiến trúc —
đẹp vì gọn và có thứ bậc, không phải vì nhiều đồ.

## Vì sao 6 vùng cũ "xấu, lộn xộn" (nhìn ảnh `design/screens/Canh-rung-truc-*.png` + `kien-truc-chuan.md`)
1. **Đất phẳng**, địa hình chỉ là núi xa → không có tầng, không có chỗ đứng nhìn xuống, mọi thứ cùng một mặt.
2. **Không có mốc lớn**: đứng ở bãi hạc không biết đi đâu; thác nằm sau rừng, đình thấp hơn ngọn trúc.
3. **Vật xếp hàng đều** (bia hai bên lối như nghĩa trang, trúc cùng cỡ) hoặc **rải đều khắp** (bồ đoàn, đèn, lều) → không
   có chỗ dày – chỗ thưa, mắt không có chỗ nghỉ.
4. **Nhét quá nhiều chủ đề** vào một map (Trúc Lâm: bia bộ thủ + khúc thuỷ + Trúc Xá + Vọng Trúc Đài + ao ngỗng + thác) →
   cái nào cũng nhỏ, không cái nào làm chủ.
5. **Kiến trúc đặt trước, đất làm sau** → đất phải "lách" quanh nhà; cổng / lối nối không theo thế đất.

---

## 1. Nguyên tắc level design cho map nhỏ trên điện thoại

Số đo theo hệ cảnh: nhân vật chibi ≈ 1,6 m (kiến trúc ×1,25), đi bộ 3,2 m/s, chạy 7 m/s (`player/controller.ts`), camera
FOV 55°, gần 4,2 m / pitch 0,32, xa 18 m / pitch 0,7 (`rung-truc.json`).

| # | Nguyên tắc | Làm thế nào · số đo |
|---|---|---|
| 1 | **Một mốc lớn (weenie) mỗi vùng** — vật hút mắt, kéo người chơi đi tới [1][2][3] | Thấy được từ bãi hạc **và** từ ≥ 2 cổng. Cao ≥ 1,5 × tán xung quanh (trúc 12–18 m → mốc ≥ 22 m, hoặc đặt trên gò +6–10 m). Giữ **hành lang nhìn** rộng ≥ 10 m không có trúc từ bãi hạc tới mốc. Cách bãi hạc 35–60 m (đi 11–19 s). |
| 2 | **Ba tầng dẫn đường** (Sky: vĩ mô – trung – vi mô) [4] | Vĩ mô: mốc + bóng núi. Trung: lối lát, đổi vật liệu nền, đổi độ cao, khung cửa. Vi mô: nhóm màu, đèn, biển tiếng Việt. Kiểm bằng ảnh **xám** (bỏ màu) — mốc và lối vẫn phải đọc được. |
| 3 | **Nén → mở** (compression → release) [4] | Từ cổng vào: lối hẹp 3 m giữa tường trúc dài 12–20 m, rồi mở ra bãi Ø 20–30 m. Mỗi lần mở là một "khung cảnh mới" (移步換景). Không để hẹp quá 25 m liền (bí, camera khó). |
| 4 | **Bãi trung tâm + nhánh** (hub & spoke) [2][5] | Một bãi chính Ø 20–30 m (chỗ tụ tập, giao lưu — kiểu quảng trường 摩尔庄园), 3–4 nhánh ra cổng / khu, nhánh nào cũng quay về bãi. Không quá 2 lần rẽ để từ cổng tới bãi. |
| 5 | **Mép mềm, không tường vô hình** | Biên = thế đất thật: đồi dốc > 35°, tường trúc dày, sông rộng, vực mây. Dải mép sâu 15–20 m (trúc dày + đất dâng 6–12 m + sương). Va chạm đặt ở chân dải mép, không giữa bãi trống. |
| 6 | **Cửa ngõ (cổng đi bộ) đọc từ xa** | Ở **mép**, đúng hướng bản đồ; lối loe 5–6 m ở 10 m cuối; hai vật đứng cặp làm khung (cột đá, cặp trúc già, bài phường thấp) + biển tiếng Việt chữ cao ≥ 0,5 m; cửa nhìn ra "ngoài" (đường xa, sương) để biết đó là lối đi tiếp. |
| 7 | **Vùng mở / kín xen nhau** | Tỉ lệ diện tích đi được ≈ **40 % mở** (bãi, bờ nước) · **40 % nửa kín** (rừng thưa đi xuyên, trúc cách 3–4 m) · **20 % kín** (lối hẹp giữa tường trúc). Mở để nhìn mốc + chụp ảnh; kín để tạo bất ngờ. |
| 8 | **Nhịp dày – thưa** | Một "điểm có việc" mỗi **15–25 m** đường đi (5–8 s); giữa hai điểm là đoạn **nghỉ** (cỏ, lối trơn). Vật trang trí gom **cụm lẻ 3 / 5 / 7**, không xếp hàng đều, không rải đều; ≥ 50 % mặt bãi trống. |
| 9 | **Phân tầng độ cao** (AC: 3 tầng vách) [6] | 3 mức: nền ±0 · gò / bậc +3–4 m · đỉnh mốc +8–12 m. Dốc đi bộ ≤ 25°; dốc hơn → bậc đá rộng ≥ 2,4 m. Từ tầng cao **nhìn lại** được bãi hạc + mốc (phần thưởng). |
| 10 | **Khung camera sau lưng gần** | Camera gần lùi 4,2 m sau lưng, cao ≈ 1,4 m: lối có vật cao (trúc, tường) phải chừa **≥ 2,5 m mỗi bên tâm lối** (lối chính 3–4 m + lề 1 m) để camera không xuyên thân trúc. Cổng / khe ≥ 4 m rộng, ≥ 5 m cao [7]. Mốc nằm ở **1/3 trên** khung khi đứng 30–40 m: tức cao ≥ 15 m so với mắt. |
| 11 | **Độ rộng lối** [7] | Lối chính (quan đạo) 4 m · lối mòn 3 m · lối nhánh 2–2,4 m · bậc đá 2,4 m · cầu ≥ 3 m. Rộng hơn 6 m chỉ ở cổng và bãi. |
| 12 | **Mật độ vật vừa đủ** | Mỗi 20 × 20 m bãi: ≤ 1 công trình + ≤ 1 cụm vật (3–7 món). Mọi vật có **một trong 4 mục đích** (`kien-truc-chuan.md` §6) — không có thì bỏ. Ưu tiên khối to ít chi tiết hơn nhiều vật nhỏ. |
| 13 | **Chi tiết chỉ dọc đường chính** [4] | Lối chính + bãi: đủ chi tiết, có va chạm. Xa lối > 20 m: chỉ là bóng (trúc instancing, thẻ ảnh, không va chạm). Thế đất (gò, vách, rừng dày) che tầm nhìn → ít vật phải vẽ. |
| 14 | **Ánh sáng & màu có thứ bậc** [4] | Mốc + bãi chính sáng nhất / tương phản nhất; rừng xung quanh trầm hơn 15–25 %. Mỗi khu một nhóm màu nhấn (đỏ son ở đình, vàng ở măng / lá già…). Bảng màu hẹp, cùng "nhiệt" (`canh-hoat-hinh-mem.md`). |
| 15 | **Kích thước cả vùng** | Lõi đi được **≈ 80–90 m** mỗi cạnh (đi chéo ≈ 35–40 s; vòng quanh 2–3 phút) + dải mép 15–20 m + nền xa. Map lớn hơn → trống, tốn vật; nhỏ hơn → không đủ chỗ nén – mở. |

Ngân sách: lúc **chỉ có địa hình** (B2) nên ≤ 30 draw call / 40k tam giác — chừa ≥ 100 draw call cho kiến trúc + NPC + trò.

---

## 2. Game cùng thể loại — họ chia map nhỏ thế nào

| Game | Cách chia | Kích thước / số mốc | Vì sao trông gọn đẹp |
|---|---|---|---|
| **摩尔庄园** (web 2008) · **摩尔庄园手游** (2021) [8][9] | Thế giới = nhiều **cảnh nhỏ một chủ đề** (摩尔城堡, 淘淘乐街, 爱心广场, 摩尔拉雅雪山, 开心农场…) nối bằng lối ở mép; bản web mỗi cảnh ≈ một màn hình. Bản 3D giữ các cảnh kinh điển, thêm ngày đêm + đất có trò (cáp treo, đường trượt tuyết, suối phun nước hất nhân vật lên) | 1 cảnh = 1 mốc + 1 quảng trường + 1–2 trò gắn địa hình | Mỗi cảnh **một ý** — tên cảnh nói luôn nó là gì; quảng trường trống cho người chơi đứng tụ; trò chơi **mọc từ thế đất** (dốc tuyết → trượt). Người chơi chê: ít trò nhỏ, trồng trọt đơn điệu [9]. |
| **Animal Crossing: New Horizons** [6][10] | Đảo 7 × 6 "acre" (mỗi acre 16 × 16 ô ≈ 112 × 96 ô kể cả biển); lõi đi được nhỏ hơn. Sông chia đảo thành 3–4 khu, cầu là nút; vách 3 tầng; thác ở chỗ đổi tầng | 3–5 công trình cố định (Dịch vụ, Bảo tàng, Cửa hàng, sân bay) | Người chơi giỏi **quy hoạch khu + đường đi trước, nắn đất sau** (đất phục vụ khu), làm từng khu một [10]; ít vách quá thì "bí" [10]. Sân bay = chỗ đến, nhìn thẳng ra đảo. |
| **Sky: Children of the Light** [4][11] | Mỗi vương quốc 3–6 khu nối tiếp; mỗi khu một hình khối (thung, tháp, hang). Đến = **nén rồi mở**; trong khu lớn chia nhiều tầng / vùng để tự chọn | 1 mốc sáng / khu (đền, ánh trời) | Mốc sáng nhất; dẫn đường bằng **bóng + màu**, ít biển; chi tiết dồn vào đường chính, nền xa chỉ là bóng; dùng vách / khúc rẽ che tầm nhìn để vừa đẹp vừa nhẹ máy [4]. |
| **Genshin Impact — Liyue** [12][13] | Vùng lấy **địa mạo Trung Hoa thật** làm "chữ ký": cổng đá theo vòm karst Tây Nam (Thạch Môn), Vọng Thư Khách Sạn theo Huyền Không Tự, Lộc Hoa Trì theo ruộng ao Hoàng Long | 1 mốc mỗi "tiểu vùng", thấy nhau từ xa | Một hình địa mạo đặc biệt (cột đá, ao bậc) nhận ra ngay; đường vào cảng được dựng có **nghi thức**; mốc được sửa đi sửa lại nhiều lần [12]. |
| **逆水寒手游** · **天涯明月刀** [14] | Thành lớn chép **cảnh nổi tiếng có thật** (汴京 theo 《清明上河图》 + cầu Hồng Kiều; Hàng Châu theo Tây Hồ; Nhạn Môn Quan) | rất lớn — không hợp điện thoại cỡ ta | Bài học dùng được: chọn **một cảnh nổi tiếng** (cầu Hồng Kiều, Tây Hồ) làm trung tâm, phần còn lại phụ hoạ. Phần ta không theo: quy mô 100 phân tuyến, mật độ nhà dày. |
| **Captain Toad / Mario 3D World** [15] | "vườn trong hộp" — cả màn là một khối nhìn từ ngoài, đích ở trên cao | 1 đích / màn | Ranh rõ, thấy hết từ một góc; độ cao là trò chơi. |

**Bài học rút ra (8):**
1. **Một vùng — một ý — một mốc.** Tên vùng nói ngay thế đất (thung trúc, phố nước, đảo tiên, đèo ải, trục cung, ốc đảo).
   Ý phụ làm sau, nhỏ hơn hẳn ý chính.
2. **Chữ ký địa mạo trước, nhà sau** (Liyue, AC): chọn 1 hình đất đặc trưng có thật (thác trong rừng trúc, vách đỏ Bồng
   Lai, cồn cát lưỡi liềm) và để nó chiếm 20–30 % khung hình từ bãi hạc.
3. **Quy hoạch khu + đường cùng lúc với đất** (AC): ở B2 vẽ luôn bãi trống (P1, P2…) và lối, để B3 chỉ "đặt vào", không nắn
   đất lại.
4. **Đến = nén rồi mở** (Sky): bãi hạc / cổng nhìn ra cảnh rộng có mốc; lối từ cổng có một đoạn hẹp trước khi mở.
5. **Quảng trường trống là tính năng** (摩尔庄园): bãi chính ≥ 20 m trống để tụ tập, chụp ảnh, sau này đặt trò.
6. **Trò mọc từ thế đất** (摩尔庄园 suối phun, cáp treo): thác → trò thả thuyền / lưu thương; gò → trò ngắm; dốc → trò lăn.
   Chừa thế đất cho trò ngay từ B2.
7. **Chi tiết chỉ nơi người chơi đi qua, phần còn lại là bóng** (Sky): rừng mép + núi xa = instancing / thẻ, không va chạm.
8. **Nhóm màu theo khu, cụm lẻ, không xếp hàng** (Sky, AC): mỗi khu một màu nhấn; vật 3 / 5 / 7 món một cụm; xám hoá
   ảnh để kiểm.

---

## 3. Sáu vùng — địa danh, thế đất, màu, hình ảnh chủ đạo, thứ KHÔNG nhét

Cổng đi bộ theo bản đồ `design/scene/ban-do/ban-do.json` (−z = bắc, +x = đông). Màu: khởi điểm, đối chiếu lại với hồ sơ
vùng cũ + bảng "Xuân ấm" khi làm `/canh`.

### 3.1 Trúc Lâm 竹林 (Trung Nguyên — thung lũng đồng bằng, đồi trúc phía bắc, sông phía tây – nam)
- **Gốc thật**: 竹林七賢 — Kê Khang, Nguyễn Tịch… "du ư trúc lâm" ở huyện **Sơn Dương 山陽** (nay Tu Vũ / Huy Huyện, Hà Nam —
  đúng Trung Nguyên) [16]; tương truyền nơi đó là Bách Gia Nham 百家岩 thuộc Vân Đài Sơn 雲臺山 (núi đá đỏ, thác cao 314 m) [17]
  — *tương truyền, chưa kiểm*. Cảnh rừng trúc mẫu: **蜀南竹海** (10,2 km², hơn 500 đỉnh đồi phủ trúc, thác Thất Thải 4 bậc,
  "Vong Ưu Cốc" thung hẹp trúc rợp trời) [18]; An Cát (Chiết Giang) — trúc vừa, lối đá, suối (hồ sơ `rung-truc.md`).
- **Thế đất**: thung nông giữa các **đồi tròn phủ trúc**; suối từ khe đồi chảy xuống thành **thác thấp nhiều bậc**; bãi cỏ
  bằng ven sông; đá xám lộ ở bờ suối.
- **Màu**: thân trúc `#7D9A4A` / già `#9AA86A` · lá `#86AE5A` · cỏ ấm `#8FAE5C` · suối `#5E9C9A` · đá `#9A968C` · sương lục
  nhạt `#D9E3D6` · nhấn: mái tranh `#B49A6A`, đèn / lá vàng `#E3C46A`.
- **Hình ảnh chủ đạo (4)**: ① đứng giữa tường trúc nhìn lên "trần lá", vệt nắng · ② thác bậc + suối đá cuội · ③ gò có đình
  nhô trên ngọn trúc (mốc) · ④ bãi cỏ sáng giữa rừng (thất hiền ngồi đàn, uống rượu).
- **KHÔNG nhét**: bia xếp hai hàng dọc lối (ra nghĩa trang) — nếu cần bia bộ thủ thì gom **một vườn bia** cụm lẻ; ao ngỗng
  + khúc thuỷ + thác cùng lúc (chọn **một** thứ nước làm chính); nhiều đình; cây hoa đào / tán tròn lẫn vào trúc; đèn
  trúc rải khắp.
- Cổng: **tây** → Khởi Nguyên Trấn (đường mòn) · **đông** → Yên Vũ Lâu (quan đạo lát đá) · **bắc** → Nhạn Môn Quan (đường mòn
  lên đèo).

### 3.2 Yên Vũ Lâu 煙雨樓 (Ngô Việt — sông nước Giang Nam)
- **Gốc thật**: lầu 煙雨樓 trên đảo giữa **Nam Hồ, Gia Hưng** (lầu trên đảo hồ, sương mưa) [19]; thuỷ trấn **Chu Trang / Ô
  Trấn**: kênh hẹp, nhà sát nước, cầu đá vòm, bậc bến (hồ sơ `giang-nam.md`).
- **Thế đất**: **phẳng tuyệt đối**, nước chiếm 1/3; một **hồ** + 1–2 kênh chia đất thành 3–4 "cù lao" nối cầu; lầu trên đảo
  giữa hồ = mốc. Mép = hồ rộng + bờ lau + đồi xa thấp.
- **Màu**: tường vôi `#EDE8DC` · ngói đen `#4A4F55` · nước ngọc xám `#7FA6A0` · liễu `#9DBA6A` · đá cầu `#A8A49A` · nhấn đèn lồng
  `#C8553D`.
- **Hình ảnh (4)**: lầu 2 tầng trên đảo giữa sương · cầu vòm bóng nước thành vòng tròn · dãy nhà trắng ngói đen soi kênh ·
  thuyền ô bồng + liễu rủ.
- **KHÔNG nhét**: cả phố chợ dày + hồ + nhiều cầu (chọn hồ làm chính, phố chỉ một dãy ngắn); vò rượu, sào phơi, chậu sen
  rải khắp; nhiều loại cầu khác nhau (≤ 2 kiểu).
- Cổng: **tây** → Trúc Lâm (quan đạo) · **bắc** → Tử Cấm Thành · **đông** → Bồng Lai (**bến thuyền**).

### 3.3 Bồng Lai Đảo 蓬萊島 (Đông Hải — tiên đảo)
- **Gốc thật**: 蓬萊閣 trên **vách Đan Nhai 丹崖** đỏ sát biển (Sơn Đông) [20]; Tam thần sơn Bồng Lai – Phương Trượng – Doanh
  Châu (Liệt Tử); 海市蜃樓 thành ảo trên biển (hồ sơ `bong-lai.md`).
- **Thế đất**: **một đảo chính có vách đỏ dựng** (lầu trên đỉnh vách = mốc), đảo tròn thoải về phía bến; 1–2 **đảo nổi nhỏ**
  chỉ để nhìn (nền xa) hoặc nối một cầu treo. Mép = biển mây / vực mây.
- **Màu**: vách đỏ `#B5563E` · cỏ tiên `#7DBA8A` · biển mây `#F4F1EA` · đào `#F2B8B0` · nước biển `#6FB0B8` · nhấn ngói lục
  `#3E8C7A`.
- **Hình ảnh (4)**: vách đỏ + lầu trên đỉnh · bến đá nhìn biển mây · vườn đào tiên · đảo nổi xa có hạc bay.
- **KHÔNG nhét**: 8 pháp bảo Bát Tiên rải, cự ngao + thuyền Từ Phúc + thành ảo + 3 đảo đủ cả (chọn vách + 1 đảo nổi);
  nhiều cầu treo đan nhau.
- Cổng: **tây** → Yên Vũ Lâu (**bến thuyền**). Một cổng → map hình "ngõ cụt đẹp", nên bãi hạc + bến cạnh nhau.

### 3.4 Nhạn Môn Quan 雁門關 (Yên Vân — cửa ải)
- **Gốc thật**: Nhạn Môn Quan, Đại Huyện, Sơn Tây — "Thiên hạ cửu tái, Nhạn Môn vi thủ"; ở núi Nhạn Môn, cao > 1 800 m;
  **quan thành** chỗ cao nhất, tường ≈ 10 m, chu vi ≈ 1 000 m, có úng thành + vây thành; tường **bò theo sống núi**
  xuống đáy thung; công sự > 5 km [21][22].
- **Thế đất**: **đèo (yên ngựa) giữa hai sống núi**; quan thành chặn ngang chỗ thấp nhất của đèo = mốc; tường thành chạy
  lên hai sống núi; phía nam (trong) dốc thoải có trại, phía bắc (ngoài) dốc gắt ra thảo nguyên mờ.
- **Màu**: gạch xám xanh `#8C9096` · đá núi `#9A8F80` · cỏ thu `#B9A169` · đất `#9C7E5A` · trời cao `#A9C3D6` · nhấn cờ đỏ
  `#B23A2E`.
- **Hình ảnh (4)**: lầu cổng ải giữa đèo · tường răng cưa bò lên núi · phong hoả đài trên đỉnh · đàn nhạn bay qua đèo.
- **KHÔNG nhét**: lều + soái trướng + ngựa + chợ + đền + Thi Bích cùng lúc (trại một góc, chợ để sau); nhiều địch lâu
  sát nhau (≤ 3, cách 40 m+); Long Đầu ra biển (là Sơn Hải Quan, không phải Nhạn Môn).
- Cổng: **nam** → Trúc Lâm · **đông** → Tử Cấm Thành · **tây** → Đôn Hoàng Lộ (đường cát) · bắc: cổng ải đóng (Mạc Bắc
  chưa mở) — cổng quan thành **là** mốc nhưng không đi qua được.

### 3.5 Tử Cấm Thành 紫禁城 (Kinh Kỳ — trục cung)
- **Gốc thật**: trục Ngọ Môn → sông Kim Thuỷ 5 cầu → sân → Thái Hoà Điện trên Tam Đài 3 tầng đá trắng (hồ sơ
  `tu-cam-thanh.md`).
- **Thế đất**: **phẳng, đối xứng tuyệt đối**; độ cao chỉ đến từ **nền đài** (3 tầng, mỗi tầng 2–2,5 m); sông Kim Thuỷ cong
  như cánh cung cắt ngang trục. Map nên là **một sân + một điện** (không cả Tử Cấm Thành): cổng – sông – sân – đài – điện.
- **Màu**: tường son `#A33B2E` · ngói lưu ly vàng `#E0B04A` · đá trắng `#E9E6DD` · gạch sân `#B9B2A5` · trời thu `#9EC0DA`.
- **Hình ảnh (4)**: điện mái vàng trên đài trắng 3 tầng · 5 cầu cong qua sông Kim Thuỷ · sân gạch rộng trống · tường son
  dài ngói vàng.
- **KHÔNG nhét**: Văn Uyên Các + Ngự Hoa Viên + Kim Bảng + sân thi trong cùng một khung (để sau, sau tường bên);
  sư tử / vạc / nhật quỹ rải nhiều; cây trong sân chính (sân chính ngoài đời **không trồng cây**).
- Cổng: **tây** → Nhạn Môn Quan · **nam** → Yên Vũ Lâu (Ngọ Môn hướng nam — trùng trục, rất đẹp).

### 3.6 Đôn Hoàng Lộ 敦煌路 (Tây Vực — sa mạc, ốc đảo)
- **Gốc thật**: **Minh Sa Sơn + Nguyệt Nha Tuyền** (hồ lưỡi liềm giữa cồn cát), **Mạc Cao Quật** (vách đất đỏ vàng có hang,
  Cửu Tầng Lâu dựa vách), Dương Quan / dịch trạm đất nện (hồ sơ `to-lua.md`).
- **Thế đất**: lòng chảo nhỏ giữa **cồn cát sống lưng sắc** (mép), giữa là **hồ lưỡi liềm** + lau sậy; một phía là **vách đất**
  có hang + lầu dựa vách = mốc. Đường cát vào từ đông.
- **Màu**: cát `#E3C38A` · bóng cát `#B98A55` · nước hồ `#5FA3A0` · vách `#C9A274` · lau `#B8B070` · trời `#8FB8D8` · nhấn lầu đỏ
  `#B04A35`.
- **Hình ảnh (4)**: hồ lưỡi liềm ôm bởi cồn cát · lầu nhiều tầng dựa vách hang · đoàn lạc đà trên sống cát · hoàng hôn cam.
- **KHÔNG nhét**: chợ 15 lều + dịch trạm + Dương Quan + Mạc Cao cùng lúc (chọn hồ + vách làm chính); nhiều cồn cát nhỏ
  lổn nhổn (cồn ít mà to, sống sắc).
- Cổng: **đông** → Nhạn Môn Quan (đường cát).

| Vùng | Kiểu thế đất | Mốc lớn | Số cổng | Nước |
|---|---|---|---|---|
| Trúc Lâm | thung + đồi tròn | gò đình + thác | 3 | suối + thác |
| Yên Vũ Lâu | phẳng, hồ chia cù lao | lầu trên đảo hồ | 3 (1 bến) | hồ + kênh |
| Bồng Lai | đảo + vách | lầu trên vách đỏ | 1 (bến) | biển mây |
| Nhạn Môn Quan | đèo giữa 2 sống núi | quan thành giữa đèo | 3 | không / khe suối |
| Tử Cấm Thành | phẳng đối xứng + nền đài | điện trên Tam Đài | 2 | sông Kim Thuỷ |
| Đôn Hoàng Lộ | lòng chảo cồn cát | lầu dựa vách hang | 1 | hồ lưỡi liềm |

Sáu thế đất khác nhau rõ — đó là cái "nét riêng" lớn nhất, rẻ nhất (địa hình ≈ 1 draw call).

---

## 4. Trúc Lâm B2 — địa hình + phạm vi: 3 phương án

Chung cho cả 3: lõi đi được **≈ 88 × 88 m** (toạ độ −44…+44), dải mép 15–20 m, `terrain.size` 200 như cũ, sương 20–75 m.
Hướng: lên = **bắc (−z)**. Ô chữ: 1 cột ≈ 2 m, 1 dòng ≈ 6 m.

Ký hiệu: `^` đồi / vách mép (+8–14 m) · `T` tường trúc dày (không đi) · `t` trúc thưa (đi xuyên được) · `.` cỏ trống ·
`=` lối chính 3–4 m · `-` lối nhánh 2 m · `~` suối / hồ · `|` thác · `≈` sông lớn (mép) · `o` gò +5–7 m · `╪` cầu ·
`[T]` cổng tây → Khởi Nguyên Trấn · `[Đ]` cổng đông → Yên Vũ Lâu · `[N]` cổng bắc → Nhạn Môn Quan · `H` bãi hạc ·
`P1…P3` bãi trống chờ kiến trúc (B3) · `★` mốc lớn.

### Phương án A — "Thung suối, bãi giữa" (khuyên)
*Cảm giác: bước ra khỏi rừng trúc mát, gặp một khoảng trời sáng có suối và gò đình — nơi bảy hiền nhân ngồi đàn.*

```
               BẮC · Nhạn Môn Quan
   ^^^^^^^^^^^^^^^^^^^^[N]^^^^^^^^^^^^^^^^^^^^^^
   ^^TTTTTTTTTTTTTTTTTTT=TTTTTTTTTTTTTTTT^^|^^^^
   ^TTTTTT oooooo TTTTTT=TTTTTTTTTTTTTTT^^ | ^^^
   TTTTTT oo P1 oo -----=---- TTTTTT  ~~~~~ ^^
   TTTTTT ooo★ooo  ttt  =  ttt  P2   ~~~~~~~ TT
   TTTTTTT oooooo  ttt  =  ttt       ~~~~~  TTT
   TTTTTTTTT  -    ttt  =  ttt    -----~~  TTTT
   TTTTTTTTTT -  .......=.......  -    ~   TTTT
 [T]=========.:  BÃI GIỮA  :.=====╪=========[Đ]
   TTTTTTTTTT .:  (Ø 26 m)  :.    ~   TTTTTTTTT
   TTTTTTTT P3 .........=......    ~~   TTTTTTTT
   TTTTTTTT    ttt      =     ttt   ~~   TTTTTTT
   TTTTTTTTTTttttt  ....=....  tttt  ~~  TTTTTTT
   TTTTTTTTTTTTTT ..... H .....  TTT  ~~~ TTTTTT
   ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
               NAM · sông lớn (mép, không đi)
```
- **Bãi hạc** H ở nam (z ≈ +36), đồng cỏ ven sông, nhìn thẳng bắc theo lối chính → thấy **gò P1 (+6 m) và thác** (đông bắc,
  rơi 10–12 m xuống ao P2). Hành lang nhìn rộng ≥ 10 m.
- **Bãi giữa** Ø 26 m (giao lưu, chừa trò). Lối chính bắc – nam (3,5 m) từ H qua bãi lên khe đồi tới [N] (bậc đá ở 15 m cuối,
  +8 m). Lối tây: đường mòn 3 m, **đoạn nén 20 m** giữa tường trúc rồi mở ra bãi. Lối đông: quan đạo 4 m, qua **cầu đá** trên
  suối, hơi dốc xuống về phía đồng bằng.
- **Suối**: thác ĐB → ao P2 → uốn qua đông bãi → đổ ra sông nam. Ranh tự nhiên cho khu đông.
- **P1** gò Vọng (đình / mốc) · **P2** ven ao chân thác (nước, khúc thuỷ) · **P3** góc tây nam rừng thưa (nhà tranh ở).
- Ưu: rõ nhất (hub + 3 nhánh), khớp bản đồ (đồi bắc, sông nam), mốc thấy ngay từ H, đủ cả mở / nửa kín / kín. Nhược: phẳng
  ở giữa — độ cao chỉ ở gò + đèo bắc; suối chia đông cần một cầu.
- Ước B2: địa hình 1 · nước suối + ao + sông 2 · thác 1 · trúc (thân, lá, tường xa) 3 · cỏ 1 · đá 1 · trời + mây + núi xa 3 ·
  3 cổng ≈ 3–6 · bãi hạc 2 → **≈ 18–21 draw call**, tam giác ≈ 35–45k (trúc instancing chiếm phần lớn).

### Phương án B — "Ba bậc đồi"
*Cảm giác: leo dần từ đồng cỏ ven sông lên đồi trúc, mỗi bậc một thác nhỏ, quay lại thấy cả thung.*

```
               BẮC · Nhạn Môn Quan
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^[N]^^^^^^^^^^^^
   ^^ TTTTTTTTTTTTTTTTTT ★ P1 ===/  TTTTTTTT ^^    bậc 2  +8 m
   ^^ TTTTTTT  ............... |   TTTTTTTTT ^^    (sống đồi, nhìn về nam)
   ^^ TTTTTTT  .....P2.....   ~|~  TTTTTTTTT ^^
   ─────────── vách đá thấp 4 m ─╫──|──────────    ← thác 1 + bậc đá
   TT TTTTT  tttt  tttt   tttt  ~~  tttt  TTTTT    bậc 1  +4 m
 [T]=======.......  rừng xuyên  ...~~.......TTTT   (trúc thưa, lối uốn)
   TT TTTTT  tttt  .. P3 .. tttt ~~  tttt  TTTTT
   ─────────────────────────────╫──|────────────   ← thác 2 + bậc đá
   TT ..........  bãi cỏ  ......~~~..........==[Đ] bậc 0  ±0
   TT .........  H  ...........~~~~ ........TTT    (đồng cỏ ven sông)
   ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
```
- H ở bậc 0 (đồng cỏ), mốc ★ trên sống đồi bậc 2 (+8 m) — luôn thấy được vì cao. [Đ] ở bậc 0, [T] ở bậc 1, [N] ở bậc 2.
- Suối chảy từ bắc xuống, mỗi bậc một thác 4 m (2 thác) → nhiều "khung ảnh".
- Ưu: phân tầng mạnh nhất, nhìn lại rất đẹp, mỗi bậc một cảm giác (đồng – rừng – đỉnh). Nhược: nhiều dốc / bậc (va chạm +
  camera khó hơn), bãi giao lưu nhỏ hơn (bậc 0 hẹp), 3 cổng ở 3 độ cao — đường nối sang vùng khác phải khớp.
- Ước B2: ≈ 20–24 draw call (thêm 1 thác + bậc đá).

### Phương án C — "Hồ giữa rừng"
*Cảm giác: vườn văn nhân tĩnh lặng — một mặt hồ phẳng ôm bởi trúc, đi vòng quanh hồ.*

```
               BẮC · Nhạn Môn Quan
   ^^^^^^^^^^^^^^^^^^^^[N]^^^^^^^^^^^^^^^^^^^^^^
   ^^TTTTTTTTTTTTTTTTTTT=TTTTTTTTTTTTTTTTTT|^^^^
   TTTTTTTT  P1 ★ ------=-------- P2    ~~|  TTT
   TTTTTT  ..-----------=------------.. ~~  TTTT
   TTTTT  .-  ~~~~~~~~~~~~~~~~~~~~~~~ -.~   TTTT
   TTTT  .-  ~~~~~~~~~~~~~~~~~~~~~~~~~~ -.  TTTT
 [T]=====-  ~~~~~ [đảo] ~~~~~~~~~~~~~~~ -======[Đ]
   TTTT  .-  ~~~~~~~~╪~~~~~~~~~~~~~~~~~ -.  TTTT
   TTTTT  .-  ~~~~~~~╪~~~~~~~~~~~~~~~~ -.  TTTTT
   TTTTTT  ..-------- P3 -------------..  TTTTTT
   TTTTTTTT   ......  H  .......   TTTTTTTTTTTT
   ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
```
- Hồ ≈ 50 × 24 m (≈ 1/3 lõi — luật vườn 園林), lối vòng quanh hồ, đảo nhỏ nối cầu từ bờ nam. H bờ nam nhìn qua hồ thấy
  ★ (gò bờ bắc) soi bóng nước.
- Ưu: đẹp tĩnh, vòng đi tự nhiên (không ngõ cụt), mặt nước là "khoảng nghỉ" lớn cho mắt. Nhược: **trùng ý nước với Yên Vũ Lâu**
  (hồ + đảo + cầu là chữ ký của vùng kế bên); hồ ăn mất bãi tụ tập; ít cảm giác "rừng trúc".
- Ước B2: ≈ 17–20 draw call.

**Khuyên: A** — rõ đường nhất cho người mới (vùng đầu tiên sau trấn), khớp thế đất trên bản đồ, chữ ký "thác trong rừng trúc +
bãi thất hiền" khác hẳn hồ Giang Nam; có thể **mượn một nét B**: đặt gò P1 thành 2 bậc (+3 / +6 m) có bậc đá, để có chỗ
đứng nhìn lại.

Kiểm khi dựng B2 (`/canh`): ảnh từ H (thấy ★ + thác), từ mỗi cổng (thấy bãi giữa trong ≤ 2 khúc rẽ), ảnh trên xuống
(`?view=tren`) thấy rõ 3 bãi P trống; ảnh xám hoá; draw call ≤ 30.

---

## 5. Phác lộ trình B3 kiến trúc + B4 mini game (Trúc Lâm — chỉ để hình dung, chưa chốt)

**B3 — 3 công trình chủ đạo, không hơn** (cấp C4–C5, mộc mạc, không cột son):
1. **P1 · Vọng Trúc Đình** — đình lục giác mái tranh trên gò, mái nhô trên ngọn trúc = mốc (đình 6 m + gò 6 m + chóp →
   đỉnh ≈ 14 m; nếu chưa đủ nổi, thêm một cây tùng già cạnh đình làm bóng).
2. **P2 · Khúc Thuỷ Đài** chân thác — mương đá uốn khúc + bậc ngồi bằng đá (gốc Lan Đình 曲水流觴 — hồ sơ `rung-truc.md`).
3. **P3 · Trúc Lư** (thảo đường) — nhà tranh 3 gian, rào trúc, sân nhỏ; NPC ra đề.
   Bãi giữa: chỉ **một** vật — tảng đá phẳng lớn + đàn cầm (chỗ "thất hiền" ngồi), còn lại để trống.

**B4 — mini game (1–2, gắn thế đất)** — dạng phiếu `/y-tuong` / `/lead` sau:
- **Lưu Thương Lệnh** (P2, học chữ): chén trôi theo mương, dừng trước ai thì người đó ghép bộ thủ thành chữ; chơi một mình
  với NPC hoặc nhiều người. Mọc từ thế đất "suối + thác" (bài học 6).
- **Hái măng sau mưa** (rừng thưa `t`, thuần chơi + tiền trong game): măng mọc ngẫu nhiên mỗi ngày trong vùng trúc thưa, hái
  đổi lấy đồ trang trí Nhà của ta — vòng chơi hằng ngày kiểu 摩尔庄园; tuỳ chọn: măng to có chữ bộ thủ ẩn để sưu tầm.
- (để sau) Chiết Tự / Biên Giản ở Trúc Lư — giữ trong hồ sơ `rung-truc.md`.

Luật bị chạm khi tới B3 / B4 (chưa sửa): R-HANH-3 (cổng / đường giữa vùng), R-BANDO-2, R-NGOI-1 nếu cho ngồi, luật trò mới.

---

## Cần người dùng chọn
1. Phương án địa hình Trúc Lâm: **A** (khuyên, + nét B: gò 2 bậc) · B · C.
2. Cỡ lõi: **≈ 88 m** (khuyên) · 70 m (gọn, ít chỗ) · 100 m (rộng, tốn vật).
3. Mốc lớn: **thiên nhiên — gò đình + thác** (khuyên, hợp vùng đầu) · hay một công trình cao (lầu / tháp trúc ≥ 20 m).

## Sai thường gặp cần tránh (khi làm lại cả 6 vùng)
- Đặt nhà trước rồi nắn đất → làm đất + lối + bãi trống trước, duyệt, rồi mới đặt nhà.
- Mốc thấp hơn tán / bị rừng che từ bãi hạc → kiểm ảnh từ H trước khi đặt bất cứ gì khác.
- Xếp vật hàng đều, rải đều; quá 1 cụm vật / 400 m².
- Tường vô hình giữa bãi; mép là sương trắng phẳng không có thế đất.
- Lối hẹp < 3 m giữa trúc → camera xuyên thân trúc, thấy lủng.
- Chép bố cục một game / phim cụ thể → lấy nguyên tắc, bố cục riêng.
- Chữ Hán trên biển cổng / tên khu → chỉ tiếng Việt (R-HUD-4).

## Đưa vào cảnh
- Tả được ngay bằng `design/scene/rung-truc.json`: `terrain.peaks` (đồi mép + gò P1), `terrain.plateaus` (bãi giữa ±0,
  gò 2 bậc), `terrain.stairs` (lên gò, lên đèo bắc), `terrain.waterfalls` + `streams` (thác ĐB → ao → sông), `terrain.edge`
  (vành mép), `trees.groves` kiểu `truc-mao` (tường trúc T + trúc thưa t), `paths` (3 lối), `portals` (3 cổng ở mép), toạ độ
  bãi hạc (`player.start` / `crane`).
- Có thể cần code (xác nhận ở `/canh`): sông lớn ở mép nam (dải nước dài, không đi được) nếu `water` chưa tả được; "vùng cấm
  trúc" để giữ bãi P trống khi rải trúc; khoảng chừa camera dọc lối (trúc cách tâm lối ≥ 2,5 m).

## Nguồn
- [1] Level Design Book — Disneyland (weenie, hub-and-spoke) — https://book.leveldesignbook.com/studies/irl/disneyland — mốc lớn, trục + nhánh
- [2] Game Developer — What Mario learned from Mickey Mouse, part 3: weenies — https://gamedeveloper.com/design/what-mario-learned-from-mickey-mouse---part-3-decision-making-and-weenies — chuỗi mốc dẫn nhau
- [3] Ghost of Tsushima weenies — https://www.gamedeveloper.com/design/a-taxonomy-of-weenies-the-landmarks-that-define-i-ghost-of-tsushima-i- — phân loại mốc
- [4] 80.lv — How to design emotional game environments for Sky (Flora Yu, thatgamecompany) — https://80.lv/articles/how-to-design-emotional-game-environments-for-sky-children-of-the-light/ — dẫn đường 3 tầng, nén → mở, kiểm xám, ánh sáng thứ bậc, chi tiết theo đường chính, che tầm nhìn để nhẹ máy
- [5] Scott Rogers, GDC 2009 "Everything I learned about level design I learned from Disneyland" (ghi chép) — https://boingboing.net/2009/03/27/gamedesign-lessons-f.html — mốc dẫn khách
- [6] Nookipedia — Acre / Town (New Horizons 7 × 6 acre, 16 × 16 ô) — https://nookipedia.com/wiki/Acre · https://nookipedia.com/wiki/Town
- [7] Level design metrics (lối 4 m, cửa to cho camera ngôi thứ 3) — https://coreydelorenzo.squarespace.com/designblog/2019/6/22/level-design-metrics · https://www.gamesradar.com/why-are-the-doors-so-big-in-video-games-some-developers-explain
- [8] TapTap — 摩尔庄园手游 (cảnh kinh điển làm 3D) — https://www.taptap.cn/app/170078 · Xiaomi — 实录视频 (ngày đêm, cáp treo, suối phun) — https://game.xiaomi.com/viewpoint/1137230246_1569726472850_11
- [9] 36氪 — phản hồi người chơi 摩尔庄园手游 (ít trò nhỏ, trồng trọt đơn điệu) — https://www.36kr.com/p/1256569971329284 · 萌娘百科 摩尔庄园 — https://mzh.moegirl.org.cn/%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD
- [10] ACNH island planning (quy hoạch khu + đường trước, nắn đất sau; làm từng khu) — https://acnhislandplanner-blog.pages.dev/acnh-island-planning-guide · TheGamer terraforming tips — https://www.thegamer.com/animal-crossing-new-horizons-terraforming-tips-tricks/
- [11] GDC Vault — Art of Sky: Children of the Light — https://gdcvault.com/play/1026903/Art-of-Sky-Children-of
- [12] Wikipedia — Liyue (Genshin Impact) (cổng đá theo vòm karst, Vọng Thư theo Huyền Không Tự, nghi thức vào cảng) — https://en.wikipedia.org/wiki/Liyue_(Genshin_Impact)
- [13] Screen Rant — Liyue vs. Trung Quốc thật — https://screenrant.com/genshin-impact-liyue-china-comparison-architecture-landmarks-map/
- [14] IT之家 — 逆水寒手游 汴京 复刻《清明上河图》, 杭州 西湖, 雁门关 — https://www.ithome.com/0/780/921.htm · https://www.ithome.com/0/882/578.htm
- [15] GameSpot — Captain Toad "garden-in-a-box" — https://gamespot.com/articles/nintendo-changed-captain-toad-to-avoid-zelda-simil/1100-6423612/
- [16] 竹林七贤 · 山阳 (《魏氏春秋》 qua chú Bùi Tùng Chi) — https://www.chinanews.com.cn/hwjy/2011/09-23/3350064.shtml · https://paper.people.com.cn/hqrw/html/2013-09/16/content_1300642.htm
- [17] Yuntai Mountain (Henan) — thác 314 m, Bách Gia Nham — https://kaweah.freedombox.rocks/kiwix/wikipedia_en_all_maxi_2023-10/Yuntai_Mountain_(Henan) (liên hệ thất hiền: tương truyền, chưa kiểm)
- [18] 蜀南竹海 (10,2 km², > 500 đỉnh, thác Thất Thải, Vong Ưu Cốc) — https://gs.ctrip.com/html5/you/sight/3114.html · https://gs.ctrip.com/html5/you/travels/3114/4152840.html
- [19] Yên Vũ Lâu, Nam Hồ, Gia Hưng — https://en.wikipedia.org/wiki/Nanhu_Lake_(Jiaxing) (suy ra từ hiểu biết chung; kiểm lại khi làm vùng này) · thuỷ trấn: nguồn trong `giang-nam.md`
- [20] Penglai Pavilion (vách Đan Nhai) — https://en.wikipedia.org/wiki/Penglai_Pavilion
- [21] 人民日报 2024-10-05 — 雁门关 (quan thành, úng thành, tường ≈ 10 m, chu vi ≈ 1 000 m) — https://paper.people.com.cn/rmrbwap/html/2024-10/05/nw.D110000renmrb_20241005_3-07.htm
- [22] China Daily — Yanmen Pass (tường theo sống núi xuống đáy thung, công sự > 5 km) — https://regional.chinadaily.com.cn/shanxi/2024-06/07/c_994267.htm · https://www.chinahighlights.com/greatwall/section/yanmenguan-pass.htm
- Hồ sơ trong dự án: `kien-truc-chuan.md` (thước đo, 4 mục đích, luật map nhỏ), `canh-hoat-hinh-mem.md` (màu, ngân sách), `rung-truc.md`, `giang-nam.md`, `bong-lai.md`, `truong-thanh.md`, `tu-cam-thanh.md`, `to-lua.md`.
