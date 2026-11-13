# Tiện ích giao lưu Văn Uyên Tông — trà lâu, hí đài, tàng thư các, phố chợ (茶樓 · 戲臺 · 藏書閣 · 市街)
- Ngày: 2026-11-13 · Khu: 1 Ngoại Môn, 2 Sơn Môn, khu Thị Tập (mục `/canh` chưa chốt) · Trạng thái: đã chọn hướng A (người dùng 2026-11-13) · đã chuyển bản mẫu (design 2026-11-13.13) · chờ code (`/lead`)

## Một câu
Văn Uyên Tông là **nhà / trạm gốc** để người chơi tụ tập (bây giờ với NPC, sau này người thật): không lớp học, mà là
quảng trường, trà lâu, sân khấu, phố chợ, lầu sách. Cảm giác: **mở, rộng, đông vui** — ngược với nhà học kín cửa.

## Vì sao bản hiện tại "xấu và hẹp"
- Đặc tả chỉ có 4 kiểu nhà, **đều là khối kín một cửa** (`giang-duong`, `dien`, `nha-nho`, `thap`). Hí đài và sạp
  hàng đang mượn `nha-nho` (hộp tường vôi + 2 cửa sổ tròn) → trông như cư xá, không thấy công năng.
- Trà lâu = giảng đường cũ (một tầng, cửa bức bàn đóng) → không thấy ai ngồi, không có tầng lầu, không có trà kỳ.
- Thị Tập 15 × 30 m kẹp sau đài → 4 hộp quay lưng vào nhau, lối 6 m nhưng không có mặt tiền mở → như ngõ kho.
- Mọi tiện ích đặt rời ở rìa; quảng trường giữa (Ngoại Môn) không có gì để tụ lại.

## Đặc điểm nhận diện (nhìn từ camera chơi 6–15 m)

**Trà lâu 茶樓**
1. **Hai tầng, tầng trên là hành lang mở có lan can + ghế tựa 美人靠**, hiên tầng trên vươn 0,6–1 m (suy luận).
2. **Mặt tiền tầng dưới mở hết** (không tường) — thấy bàn ghế bên trong; nhà Tống tiệm trà mở mặt tiền.
3. **Cờ chữ 茶 trên cột cao** + biển ngang; đèn lồng đỏ dưới hiên.
4. **Bàn ghế ngoài trời** dưới cây / mái che (trà quán Hạc Minh, Thành Đô: ghế trúc ngoài trời).
5. **Gần nước**: lý tưởng là đình trên ao + cầu chín khúc (Hồ Tâm Đình, Thượng Hải — 2 tầng, lục giác, giữa ao).

**Hí đài 戲臺**
1. **Nền cao 1,4–2 m** (ngang / trên đầu người) — thiếu là mất chất nhất.
2. **Mở 1 hoặc 3 mặt**, 4 cột lớn ở góc đỡ mái; **mái yết sơn 歇山 góc vểnh mạnh**.
3. **Tường hậu đài** với 2 cửa có rèm (上場 / 下場 — ra / vào sân khấu).
4. **Sân khán giả trước mặt rộng ≥ 2–3 lần bề rộng sân khấu**, trống — là quảng trường.
5. Biển ngang tên đài; trần 藻井 bát giác (bỏ được ở low-poly).

**Tàng thư các 藏書閣**
1. **Dài và thấp, 2 tầng, 6 gian** (số chẵn — "thiên nhất sinh thuỷ, địa lục thành chi"), **không phải tháp**.
2. **Ngói đen, viền / bờ nóc lục** (đen = thuỷ khắc hoả; Văn Uyên Các, Cố Cung).
3. **Ao vuông ngay trước mặt + một cầu đá ở giữa** + đá giả sơn.
4. **Cột lục / sẫm, không son đỏ**; xà vẽ kiểu Tô Châu (phong cảnh) thay xà điện.
5. Tình cờ: Văn Uyên Các 文淵閣 trùng tên tông môn 文淵 — rất hợp làm công trình biểu tượng.

**Phố chợ 市街**
1. **Dãy mặt tiền hẹp lặp lại** (mỗi gian 3,3–4 m), cao thấp / biển khác nhau — không phải một nhà to.
2. **Tầng dưới mở** (ván cửa 排門板 tháo xếp bên), hàng hoá bày ra; **2 tầng 下店上宅** (dưới bán, trên ở).
3. **Cờ dọc 幌子, biển treo, đèn lồng**; sạp lẻ có ô giấy dầu / mái vải.
4. **Cổng 牌坊 ở đầu phố**.
5. **Phố hẹp vừa phải**: rộng ≈ cao hiên (≈ 1 : 1) — phố chính 6–10 m; quá rộng là trống trải.

## Quy chế · cấp bậc
Trong tông môn: Chưởng Môn Điện (ngói vàng) > Tàng Thư Các (ngói đen viền lục — đặc cách vì chức năng) ≈ Hí đài
(yết sơn, ngói lục) > Trà lâu (yết sơn / ngói xám) > cửa hàng phố chợ (huyền sơn 懸山 hai mái, ngói xám, gỗ sẫm, tường
vôi — giọng Giang Nam). Một khu một giọng: phố chợ + trà lâu = Giang Nam 粉牆黛瓦; hí đài + tàng thư = khung Tống.

## Tỉ lệ · số đo (mét, hệ cảnh; nhân vật ≈ 1,6 m, `heightScale` 1,6 áp cho kiến trúc)

| Bộ phận | Ngoài đời | Trong cảnh (đề xuất) | Ghi chú |
|---|---|---|---|
| Hí đài: nền | 1,1–1,6 m (Nguyên); ~2 m (Huy Châu) | 1,5 m, bậc hai bên hậu đài | nguồn: Kiều Trạch Miếu 1,6; Ngưu Vương Miếu 1,4 |
| Hí đài: sân khấu | 5×5 … 9,3×9,3 m; tiền đài ≈ 2/3 | tiền đài 9 × 6, hậu đài 9 × 3 | Kiều Trạch Miếu 9,3 × 9,3 |
| Hí đài: sân khán giả | ≥ 2–3 × bề rộng đài | ≥ 20 × 18 m (sân Ngoại Môn) | suy luận |
| Trà lâu | 2 tầng, 3 gian, ~10–12 × 8–10 m (suy luận) | 12 × 9, tầng 3,2 m, lan can tầng 2 | Hồ Tâm Đình ~200 m² hai tầng |
| Tàng thư các | Thiên Nhất Các cao 8,5 m, 6 gian, 2 tầng | 6 gian × 3,6 = 22 × 10, 2 tầng, cao ≈ 11 m (có hệ số) | ao trước ≈ 16 × 6 |
| Cửa hàng | gian 3,3–4 m, sâu 8–12 m, hiên 5,5–6,5 m (suy luận) | 1–2 gian (4–8 m) × 6 m sâu, 2 tầng | |
| Phố chợ | phố chính 6–10 m; phố phục dựng 8–10 m, mặt tiền 8–9 m | 8 m (lối Sơn Môn sẵn rộng 8) | tỉ lệ ≈ 1 : 1 |
| Đình nghỉ | vuông 3–4,5 m / lục giác ∅ 4,5–5 m; cột 2,7–3,2 m | lục giác ∅ 5, chóp 攢尖 | suy luận |

## Màu
| Vai trò | Hex | Có trong phong_cach.md? | Lý do |
|---|---|---|---|
| Ngói đen tàng thư | `#2F3236` | có (bờ nóc `ridge`) | đen = thuỷ |
| Viền / bờ lục tàng thư | `#2B5446` | có (ngói lưu ly lục) | Văn Uyên Các viền lục |
| Cột tàng thư | `#2F6F73` | có (`eave`) | cột lục thay son |
| Cờ / rèm vải | `#E8E1D2` nền + chữ `#2F3236`; rèm hậu đài `#A8322A` | có | điểm ấm nhỏ |
| Ô giấy dầu sạp | `#C9803A` / `#A8322A` | **mới** `#C9803A` (cam đất) | điểm ấm, không lạm đỏ |
| Gỗ cửa hàng | `#3A2418` | có (`timber`) | Giang Nam gỗ sẫm |

## Hướng (chờ người dùng chọn)

- **A — Quảng trường làm tim, phố chợ trên lối Sơn Môn (khuyên).**
  - Ngoại Môn thành **quảng trường**; **hí đài thay giảng đường** ở trục bắc, quay nam → cả sân là chỗ khán giả.
  - **Phố chợ dọc lối Sơn Môn** (z 21…40, sau cổng 文淵宗 là bước vào phố): 2 dãy cửa hàng 2 tầng hai bên lối 8 m,
    sạp ô giấy lẻ — giống phố trước cổng chùa / đạo quán (廟前街). Bỏ khu Thị Tập phía đông → tông môn gọn lại.
  - **Tàng Thư Các** giữ phía tây Ngoại Môn, dựng lại dài thấp 2 tầng + ao + cầu.
  - **Trà lâu 2 tầng bên ao** Linh Dược Viên (ao tròn có sẵn + liễu) hoặc trong Ngoại Môn góc đông nam + đình nghỉ.
- **B — Giữ chỗ hiện tại, chỉ thay kiểu nhà.** Trà lâu ở trục bắc, hí đài cuối Thị Tập, sạp trong Thị Tập. Ít xáo
  bố cục nhưng hí đài không có sân khán giả, Thị Tập vẫn chật (15 m).
- **C — Gom tất cả vào một "Thị Tập" lớn** thay Đệ Tử Cư Xá (x 21…54, z 9…45): phố + trà lâu + hí đài một chỗ.
  Ngoại Môn giữ giảng đường cũ (khó vì người dùng muốn bỏ lớp học).

## Dựng low-poly

| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ước draw call |
|---|---|---|---|
| Hí đài: nền cao, 4 cột, mái yết sơn, tường hậu + 2 rèm | giữ | nền hộp, cột trụ, `gableHipRoof` sẵn có, rèm = tấm màu | 0–1 (gộp theo vật liệu) |
| Trà lâu: 2 tầng, tầng dưới mở (chỉ cột + bàn), lan can tầng 2, mái yết sơn | giữ | thân tầng 2 lùi, lan can hàng trụ, bàn = hộp thấp + 4 đôn | 0–1 |
| Tàng thư các: 2 tầng, mái hiên kép, ngói đen viền lục | giữ | như `dien` thấp, hai tầng thân, màu mái đen + gờ lục | 0–1 |
| Cửa hàng: 2 tầng, tầng dưới mở, ván cửa xếp bên, hàng hoá | giữ | hộp + khung gỗ, 2–3 khối hàng (thùng, rổ) | 0–1 |
| Sạp ô giấy | giữ | trụ + nón dẹt 8 cạnh + bàn | instanced 1–2 |
| Cờ 幌子, biển | gộp | **một atlas cho mọi biển / cờ** (hiện mỗi biển một texture = 1 draw call) | 1 thay vì 15+ |
| Bàn ghế ngoài trời | gộp | instanced | 1 |
| 藻井, ngói ống, hoạ tiết xà | bỏ | | |

Tổng ước: khối tĩnh gộp theo vật liệu nên nhà mới gần như không thêm draw call; **biển là thứ tốn** — phải làm atlas
trước, nếu không phố chợ 8–10 cửa hàng sẽ đẩy cảnh lên ~165 (hiện 155 / ngân sách 150).

## Sai thường gặp cần tránh
- Mặt tiền kín (trà lâu, cửa hàng) — nhà Tống mở mặt tiền.
- Hí đài thấp < 1 m, kín như nhà, không tường hậu đài, không sân khán giả.
- Tàng thư cao như tháp, sơn đỏ, số gian lẻ, không có nước trước.
- Phố chợ là vài nhà to giống hệt nhau; phố quá rộng, trống; không có đồ lặt vặt (sạp, thùng, rổ, cờ).
- Lạm đỏ / vàng ở phố chợ → ra "phố Tàu", mất tiên khí; giữ nền trắng – xám – gỗ, điểm ấm nhỏ.

## Đưa vào cảnh
- Tả được ngay bằng `scene.json`: vị trí, ao (`water`), cây, đèn đá, lối (`paths`), tên khu (`site.areas`).
- **Cần code** (kiểu nhà mới cho `buildings[].kind`, mặc định giữ cảnh cũ):
  1. `hi-dai` — nền 1,5 m, tiền đài mở 3 mặt, 4 cột góc, tường hậu đài + 2 cửa rèm đỏ, mái yết sơn; va chạm = nền.
  2. `tra-lau` — 2 tầng; tầng 1 mở (cột + bàn trà + đôn), tầng 2 lùi 0,6 m có lan can + ghế tựa; cờ 茶 trên cột cao;
     mái yết sơn; đèn lồng.
  3. `lau-sach` (tàng thư) — 2 tầng dài thấp, mái hiên kép, `roofColor` đen + trường viền lục, cột theo `pillar` riêng.
  4. `cua-hang` — 2 tầng hẹp (w 4–8), tầng 1 mở + ván cửa xếp bên + 2–3 khối hàng; mái huyền sơn; cờ dọc.
  5. `props.kind`: `sap-o` (sạp ô giấy), `ban-tra` (bàn + 4 đôn), `co` (cờ dọc 幌子 có chữ).
  6. **Atlas biển / cờ** — mọi biển, cờ dùng chung một texture (giảm draw call).
  7. Bỏ 2 vùng học Ngoại Môn (sổ `R-VUNG-*` + `ZONE_CONTENT`) — từ mục `/canh` chưa chốt.

## Nguồn
- Mộng Lương Lục 夢粱錄 · trà tứ Hàng Châu, Thanh Minh Thượng Hà Đồ ~20 trà quán — https://www.rujiazg.com/article/3786 — đặc điểm trà lâu Tống
- Quảng cáo trong Thanh Minh Thượng Hà Đồ (幌子, 招牌, 彩樓歡門) — https://www.digitaling.com/articles/58792.html · https://m.thepaper.cn/newsDetail_forward_18530690 — cờ, biển phố chợ
- Hồ Tâm Đình Thượng Hải (2 tầng, lục giác, giữa ao, cầu chín khúc) — https://www.news.cn/culture/20250711/64df470bd3194748a55b9778b41d6d46/c.html
- Trà xã Hạc Minh, Thành Đô (ghế trúc ngoài trời) — https://m.thepaper.cn/baijiahao_24326120
- Ngưu Vương Miếu hí đài (1283, nền 1,4 m, 3 mặt, 4 cột) — https://www.yzwb.net/news/yw/202604/t20260420_343979.html
- Hí đài thời Nguyên 40–50 m², Kiều Trạch Miếu 9,3 × 9,3, nền 1,6 — https://www.aisixiang.com/data/84452.html
- Hí đài làng Kỳ Môn (nền ~2 m, tiền / hậu đài, 藻井) — https://www.sohu.com/a/75443904_119690
- Đức Hoà Viên đại hí lâu — https://travelchinaguide.com/attraction/beijing/summer/virtue.htm
- Hí đài nước Thiệu Hưng — https://www.ihchina.cn/project_details/15241/
- Thiên Nhất Các (6 gian, 2 tầng, cao 8,5 m, ao 天一池) — https://zh.wikipedia.org/wiki/%E5%A4%A9%E4%B8%80%E9%98%81 · https://m.maigoo.com/citiao/188112.html
- Văn Uyên Các Cố Cung (ngói đen viền lục, cột lục, ao + cầu) — https://zh.wikipedia.org/wiki/%E6%96%87%E6%B7%B5%E9%98%81
- Văn Lan Các Hàng Châu — https://www.chinawriter.com.cn/n1/2025/1021/c442005-40586068.html
- Phố thương mại Khúc Phường Tô Châu (phố 8–10 m, mặt tiền 8–9 m) — https://worldarchitecture.org/architecture-projects/hgchf/suzhou-qufang-commercial-street-project-pages.html
- Thanh Minh Thượng Hà Đồ — phố không còn phường kín — https://www.aisixiang.com/data/93358.html
- Chu Trang 前街後河 — https://appbook.qq.com/read/1035091114/3
- Đình Trung Hoa — https://en.wikipedia.org/wiki/Chinese_pavilion
