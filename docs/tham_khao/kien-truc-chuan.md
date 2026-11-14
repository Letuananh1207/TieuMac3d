# Quy chuẩn kiến trúc chung + bài trí có mục đích (建築規制 · 佈局)
- Ngày: 2026-11-14 · Khu: **cả 7 map** (Văn Uyên Tông, Rừng trúc, Giang Nam, Bồng Lai, Trường Thành, Tơ lụa, Tử Cấm Thành)
  · Trạng thái: **đã chọn hướng** (người dùng 2026-11-14): K = 1,25 mọi map · dốc mái theo giọng vùng · 3 cỡ S / M / L cố định · Kế hoạch: `docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md`
  (GĐ 1)

## Một câu
Một **bộ luật chung** để mọi công trình trong 7 map được chọn từ cùng một danh mục, đặt đúng **cấp bậc** (nhìn mái, màu,
số gian là biết nhà quan trọng cỡ nào), đúng **thước đo** (so với nhân vật), và chỉ xuất hiện khi có **việc để làm** — thay
cho việc mỗi vùng tự vẽ nhà / vật riêng.

## Hiện trạng — vì sao "lộn xộn, xấu" (kiểm kê 2026-11-14)
1. **Thiếu loại hình → dùng sai.** 9 kiểu nhà cho 7 map. `nha-nho` đóng vai Nhà ven sông, Thư phòng, Thuỷ các (Giang
   Nam), Kho lương, Khương Nữ **Từ** (đền — Trường Thành), Nguyệt Tuyền **Các** (Tơ lụa), Trúc Xá. `lau-sach` vừa là Thư viện
   tông môn vừa là Bồng Lai Các vừa là Văn Uyên Các. Tử Cấm Thành: Thái Hoà / Trung Hoà / Bảo Hoà cùng kiểu `dien` →
   mất thứ bậc mà hồ sơ `tu-cam-thanh.md` coi là đặc điểm số 3.
2. **Công trình lẫn trong "vật trang trí".** Quan thành, Ngọ Môn, địch lâu, phong hoả đài, nhà đất, lầu dựa vách, cổng
   quan… là `props` (~60 loại trong `vat_*.ts`, ≈ 3 600 dòng, vẽ riêng từng vùng) — không chung tỉ lệ, cấp, màu.
3. **Mỗi map một thước đo.** `buildingStyle.heightScale`: tông môn 1,6 · Tử Cấm Thành 1,3 · Bồng Lai 1,1 · còn lại 1. Hồ sơ
   vùng lại tính "nhân vật ≈ 2,1 m". Cùng một nhân vật mà cửa, bậc, lan can mỗi nơi một cỡ.
4. **Không có bản mô tả bài trí.** Hồ sơ vùng nói "nên có gì" nhưng không map nào ghi mỗi thứ đặt ra để làm gì → vật
   rải theo cảm hứng (đèn, bồ đoàn, lều, sạp, pháp bảo…).

---

## 1. Thước đo chung (một cho cả 7 map)

Nhân vật đệ tử chibi cao ≈ 1,6 m nhưng đầu to — đứng cạnh cửa thật 2,4 m trông lọt thỏm, nên kiến trúc phải phóng to theo
**một hệ số chung** `K` (hiện mỗi map một số). Mọi số đo "ngoài đời" trong hồ sơ này nhân `K` khi dựng; chi tiết theo
**cỡ người** (bậc 0,15 m · lan can 0,9 m · ghế 0,45 m · bàn 0,75 m) **không nhân** — như quy tắc `hk()` đang làm.
→ Chọn `K` ở mục "Hướng" (khuyên 1,25).

## 2. Thang cấp bậc dùng chung (6 bậc)

Rút từ thứ bậc mái 9 bậc Minh–Thanh (重檐廡殿 > 重檐歇山 > 單檐廡殿 > 單檐歇山 > 卷棚歇山 > 懸山 > 卷棚懸山 > 硬山 >
卷棚硬山; 攢尖 · 盝頂 là "kiểu phụ") [1][2], 《明會典》 về số gian / đấu củng / vẽ màu [3], quy chế phủ vương Thanh [4], thú
nóc [5], nền theo cấp [6].

| Bậc | Dùng cho | Mái | Ngói | Gian | Nền | Đấu củng 斗栱 | Xà vẽ 彩畫 | Thú nóc |
|---|---|---|---|---|---|---|---|---|
| **C1** cung đình tối cao | chỉ Thái Hoà Điện | 重檐廡殿 vũ điện hiên kép | vàng | 9–11 | tu di 3 tầng (8,13 m thật) | dày | 和璽 rồng vàng | 9–10 |
| **C2** điện chính | Bảo Hoà, Ngọ Môn, Chưởng Môn Điện (sau này), điện chính đạo quán | 重檐歇山 yết sơn hiên kép | vàng (cung) · lục (miếu) · xám | 5–9 | tu di 1–3 tầng, lan can đá trắng | dày | 旋子 hoa xoáy | 7–9 |
| **C3** công trình chính của vùng | lầu cổng ải, Cửu Tầng Lâu, Bồng Lai Các, Văn Hoa / Võ Anh Điện, hí đài | 單檐歇山 (廡殿 nếu cung) | lục · xám | 3–5 | đá 1–1,5 m | dải | 旋子 / 蘇式 | 3–5 |
| **C4** công trình công cộng, vườn | trà lâu, thư viện, đình, thuỷ tạ, hành lang, tháp vừa | 卷棚歇山 · 攢尖 · 歇山 nhỏ | xám (thư viện: đen viền lục — đặc cách) | 1–5 | đá 0,5 m | không / rất nhẹ | 蘇式 tranh cảnh | 0–3 |
| **C5** nhà ở, cửa hàng, kho | nhà dân, cửa hàng 2 tầng, đạo phòng, doanh trại, kho lương | 懸山 / 硬山 (卷棚 cho nhà vườn) | xám | 1–3 (dân ≤ 3 gian — luật Minh [3]) | 0,3 m | **cấm** | không (gỗ mộc / quét màu đất) | 0 |
| **C6** tạm, quân dụng, đất | lều, sạp, chòi, nhà đất nện, phong hoả đài, địch lâu | mái bằng đất · vải · chòi | không ngói | — | không / đất | không | không | 0 |

Luật dùng:
- **Mỗi map có trần cấp** (mục 7). Công trình cao nhất của map = trần; chỉ **một** công trình ở trần, đứng cuối trục / chỗ cao
  nhất. Ngói vàng chỉ có ở Tử Cấm Thành (+ Chưởng Môn Điện nếu dựng — `phong_cach.md`).
- Số gian luôn **lẻ** (ngoại lệ có chủ đích: tàng thư 6 gian "天一地六" [7]).
- Cột son đỏ từ **C4 trở lên**; C5–C6 gỗ mộc / nâu sẫm / đất.

## 3. Danh mục loại hình — đầu vào cho bộ asset (GĐ 2)

Mỗi loại ghi: việc dùng (để biện minh khi đặt) · cỡ chuẩn S / M / L · số đo thật (chưa nhân `K`) · mái theo cấp · nguồn.
Mã đề xuất (`kind`) để phiên code dùng; chưa phải tên trường đã chốt.

### 3a. Nhà

| Mã đề xuất | Loại | Việc dùng | Cỡ S / M / L | Số đo, quy tắc (thật) | Mái / cấp | Nguồn |
|---|---|---|---|---|---|---|
| `dien` | Điện 殿 | thờ, nghi lễ, việc chính của khu | 3 / 5 / 7 gian (9–11 chỉ Tử Cấm Thành) | gian giữa 4–6 m, gian phụ = 0,8 × gian giữa; cột 大式 cao ≈ 10 × đường kính; Thái Hoà 63,96 × 37 m, cột 12,7 m; Tử Tiêu Điện 29,9 × 12 m, cao 18,3 m | C1–C3 | [8][9][10] |
| `sanh` | Sảnh 廳堂 | tiếp khách, giảng, nhà chính khu vườn | 3 / 5 gian | cao hiên ≈ 0,8 × gian giữa; Viễn Hương Đường 12,66 × 10,19 m | C3–C4, 歇山 / 硬山 | [11] |
| `lau` | Lầu 樓 (mặt dài, 2 tầng) | trà lâu, tửu lâu, tàng thư, lầu ở | 3 / 5 / 6 gian | tầng trên cao ≈ 0,7 × tầng dưới; Thiên Nhất Các 2 tầng cao 8,5 m, dưới 6 gian, trên 1 gian liền, hồ phòng hoả trước mặt | C3–C4, 歇山 / 硬山 | [11][7] |
| `cac` | Các 閣 (gần vuông, có 平坐 ban công vòng quanh) | ngắm cảnh, thờ, công trình biểu tượng (Bồng Lai Các, Nguyệt Tuyền Các, Vọng Giang Lâu) | 1 / 3 / 5 gian vuông, 2–3 tầng | dưới để trống cao, trên có hành lang vòng | C3–C4, 歇山 / 攢尖 | [12] |
| `thap` | Tháp 塔 | mốc nhìn xa, thờ | 5 / 7 / 9 tầng | tầng lẻ; vuông (Đường), bát giác (Tống–Liêu), lục giác; mỗi tầng thu đều; 樓閣式 hoặc 密檐式 | C3–C4 | [13] |
| `dinh` | Đình 亭 | nghỉ chân, ngắm, che giếng / bia | vuông · lục · bát giác; cạnh 3 / 4 / 5 m | cột vuông = 0,8 × cạnh; lục giác = 1,5 × cạnh; bát giác = 1,6 × cạnh; ∅ cột = 0,1 × cao cột; Tú Ỷ Đình 5 × 3,32 m, hiên 2,8 m | C4, 攢尖 / 卷棚歇山 | [11][14] |
| `ta` | Thuỷ tạ 榭 · Hiên 軒 | nghỉ bên nước, nghe nhạc, ngồi | 1 / 3 gian | nửa trên bờ nửa trên nước, mặt nước mở, 美人靠 cao 0,9 m (ngồi 0,45 m) | C4, 卷棚歇山 | [15][16] |
| `phuong` | Thạch phảng 舫 (nhà thuyền) | ngồi bên nước, biểu tượng vườn | 1 cỡ | mũi hở, khoang thấp, đuôi lầu 2 tầng; Thanh Yến Phảng dài ≈ 36 m | C4 | [17] |
| `lang` | Hành lang 廊 (thẳng · bò núi · lang bồng ven kênh) | nối hai nhà, che mưa, dẫn đường | đoạn 3 m nối tiếp | lòng 1,2–1,5 m, cột 2,5 m ∅ 0,15, gian 3 m; lang bồng Giang Nam rộng 2–2,5 m | C4–C5, 卷棚 | [11][18] |
| `nha-giang-nam` | Nhà gối sông 枕河人家 / thuỷ các 水閣 | ở, bến nhà, thuyền ghé | 1 / 2 / 3 gian, 2 tầng | móng đá chìa ra, nửa phòng trên cột trên nước; tường vôi ngói đen | C5, 硬山 / 懸山, đầu hồi 觀音兜 | [19][20] |
| `nha-day` | Dãy nhà 1 tầng (đạo phòng 道房, sương phòng 廂房, doanh trại, kho lương) | ở, trọ, chứa | 3 / 5 / 7 gian | gian 3–3,3 m, sâu 3,5–5,5 m, thấp hơn nhà chính; kho lương nền cao | C5, 硬山 | [21] |
| `nha-dat` | Nhà đất nện / gạch mộc 夯土 · 土坯 | ở, chứa (Tơ lụa, Trường Thành) | 1 / 2 / 3 ô | 1 tầng mái bằng, tường dày, lớp nện ≈ 0,4 m | C6 | [22] |
| `cua-hang` | Cửa hàng 下店上宅 | bán (gắn NPC / trò) | 1 / 2 / 3 gian | gian 3–4 m, tầng dưới ván cửa tháo, trên ở; phố rộng ≈ 0,5 × cao mái | C5, 硬山 | [19][23] |
| `tu-mieu` | Từ đường / miếu nhỏ 祠廟 | thờ (Khương Nữ Từ, miếu đất) | 1 viện: cổng + điện S | trục 山門 → 享堂 → 寢殿 | C3–C4 | [24] |
| `hi-dai` | Hí đài 戲臺 | biểu diễn, tụ tập | 1 gian vuông | nền 1–1,5 m, xem ba mặt; Đức Hoà Viên đại hí lâu 3 tầng 21 m | C3 | [25] |
| `lau-thanh` | Lầu trên đôn đài 城樓 (thành môn, Ngọ Môn, lầu cổng ải) | cổng chính + mốc | 3 / 5 / 9 gian trên đôn đài | Gia Dục Quan: lầu 3 tầng ≈ 17 m, 3 × 2 gian, tường 9 m + đoạ 1,7 m; Chính Dương Môn đôn 12–13 m | C2–C3 | [26][27] |
| `dich-lau` | Địch lâu rỗng 空心敵台 | canh, bắn, trú (Trường Thành) | 1 cỡ | cao 10–13 m, cạnh 10–14 m, 2–3 tầng, 4 mặt cửa bắn, chòi 鋪房 trên nóc; dày nhất ≈ 101 m / đài | C6 (chòi C5) | [28] |
| `phong-hoa` | Phong hoả đài / phong toại 烽燧 | báo hiệu (khói ngày, lửa đêm) + đống củi 積薪 | gạch (Minh) · đất (Hán) | chóp cụt vuông đáy 5–8 m, cao 6–12 m; Mã Quyển Loan đáy 8,35 × 7,6 m cao ≈ 9,7 m, sân 11 × 8,7 m | C6 | [29][30] |
| `leu` | Lều quân · lều tròn 蒙古包 · sạp chợ | trọ tạm, buôn bán | lều vuông · tròn ∅ 5 / 7 m · sạp 2 × 1,5 m | vách lều tròn cao 1,5–1,6 m, cửa hướng đông nam | C6 | [31] |

### 3b. Phần nối (cổng, tường, cầu, nền)

| Mã đề xuất | Loại | Việc dùng | Biến thể / cỡ | Số đo (thật) | Nguồn |
|---|---|---|---|---|---|
| `cong-bai-phuong` | 牌坊 (không mái) / 牌樓 (có mái) | cổng biểu trưng đầu đường, trước miếu, lăng — **mốc dẫn đường** | 1 gian 2 trụ · 3 gian 4 trụ · 5 gian 6 trụ | Linh Tinh Môn Khúc Phụ 13 × 8,9 m; thạch bài phường Minh Thập Tam Lăng 28,86 × 14 m | [32][33] |
| `son-mon` | 山門 cổng chùa / quán | cổng chính trên trục, 3 cửa | 3 gian, 單檐歇山 | — | [34] |
| `mon-lau` | 門樓 / 門罩 trên tường | cửa vào sân trên tường bao (đã có: cổng `lau`) | 門罩 (mái nhỏ) · 門樓 (chạm gạch) | xà chạm 1,6–2,2 m | [35] |
| `thuy-hoa-mon` | 垂花門 cổng hoa rủ | cửa thứ hai vào nội viện | 1 gian | rộng 2,5–3,3 m; rộng : cao cột : sâu ≈ 1 : 0,9 : 1,2 | [36] |
| `cong-trang` | 月洞門 · 地穴 | cửa không cánh trong tường vườn (đã có) | tròn · hải đường · bình | tròn ≈ 2 × 2 m; đa giác 1,9 × 1 m | [37] |
| `tuong-voi` | 粉牆 · 院牆 · 雲牆 | chia sân, bao vườn | thẳng · lượn sóng | cao 2,5–3 m, dày ≈ 0,24 m (tường sân), đỉnh 饅頭頂 / 蓑衣頂 lợp ngói; lậu song đáy ở 1,3 m, ô 0,6–1,2 m | [38][37] |
| `tuong-cung` | 宮牆 tường đỏ | bao cung | — | cao 6–8 m, đỏ, đỉnh ngói vàng; tường thành Tử Cấm Thành cao 9,9 m, chân 8,62 m | [39][40] |
| `tuong-thanh` | Tường thành gạch Minh | phòng thủ, đi được trên mặt | — | cao 7–8 m, mặt 4,5–6 m, đoạ khẩu cao 1,8 m, nữ tường trong 1–1,2 m | [41] |
| `tuong-dat` | Tường đất nện 夯土 | bao trạm dịch, nhà đất | — | dày 1–2,5 m chân, lớp nện 0,4 m; Huyền Tuyền Trí chân 1,5–2 m | [22][42] |
| `cau-vom` | Cầu vòm đá 拱橋 | qua sông, thuyền chui qua — mốc | 1 vòm · 3 vòm | Kim Thuỷ (cung): giữa 23,15 × 8,55 m, kế 5,78, ngoài 4,55 m — rộng theo cấp; Tô Châu nhịp 9–16 m, cao vòm 4,5–10 m | [43][44] |
| `cau-bang` | Cầu bằng 平橋 · cửu khúc 九曲橋 | qua ao trong vườn | thẳng · chữ chi | rộng 2–3,2 m, lan can 0,85 m, sát mặt nước | [45] |
| `cau-mai` | Cầu có mái 廊橋 | qua suối, nghỉ | — | Bắc Giản Kiều dài 51,87 × rộng 5,39 m | [46] |
| `cau-treo` | Cầu xích / dây 索橋 | nối đảo, vực (Bồng Lai) | — | Lô Định ≈ 103 × 3 m, 9 xích đáy + 4 tay vịn; cầu dây núi ván 0,8–1,5 m (suy luận) | [47] |
| `nen` | Nền 台基 · tu di 須彌座 · đôn đài | nâng cấp bậc | thường · tu di 1 / 2 / 3 tầng | cao theo cấp: dân 0,32 m · quan 0,64 m · chính điện vương 1,44 m · thân vương 3,2 m · Thái Hoà 8,13 m; tu di chia 51 phần: 圭角 10 · 下枋 8 · 下梟 7 · 束腰 10 · 上梟 7 · 上枋 9 | [6][48] |
| `lan-can` | Lan can đá 石欄杆 · gỗ / 美人靠 | chặn mép nền, cầu, ban công | đá trắng · gỗ | trụ đá ≈ 20/19 × cao nền lộ, bản : trụ ≈ 5 : 9, mô-đun ≈ 1,5 m; gỗ 0,85–0,9 m | [49][16] |
| `bac` | Bậc 踏跺 | lên nền | 御路 (có phiến rồng giữa) > 垂帶 > 如意 | bậc 0,13–0,15 × 0,32 m | [50] |

### 3c. Vật sân có việc (không phải "trang trí" thả tự do)

| Vật | Việc thật | Đặt ở đâu (luật) | Số đo (thật) | Nguồn |
|---|---|---|---|---|
| 影壁 / 照壁 chiếu bích | che nhìn từ ngoài, chắn khí | trên trục, đối diện cổng (trong hoặc ngoài) | Cửu Long Bích Bắc Hải 27 × 5 × 1,2 m | [51] |
| 石獅 sư tử đá | trấn cổng | **một cặp** hai bên cổng; nhìn từ trong ra: đực trái (đông, chân cầu), cái phải (tây, sư tử con) | — | [52] |
| 華表 hoa biểu | biểu trưng trước cổng cung / lăng | từng cặp hai bên trục | cao 9,57 m, ∅ 0,98 m | [53] |
| 日晷 + 嘉量 nhật quỹ + gia lượng | quyền định giờ, đo lường (cung) | sân nền trước điện chính: nhật quỹ **đông**, gia lượng **tây**; kèm rùa đồng, hạc đồng mỗi thứ 1 cặp | — | [54] |
| 銅缸 vạc nước (門海) | chữa cháy | hai bên điện, trước tường cửa | cao 1,2 m, ∅ 1,6 m | [55] |
| 寶鼎 / 香爐 đỉnh, lư hương | dâng hương | **giữa sân trước điện chính**; đỉnh trước, lư hương phía bắc đỉnh | — | [56] |
| 井 + 井亭 giếng, đình giếng | lấy nước | trước bếp / điện phụ, giữa sân trạm; đình giếng mái 盝頂 khoét lỗ | đình giếng Ngự Hoa Viên rộng 1,94 m | [57] |
| 石燈 đèn đá | chiếu sáng, cúng | dọc lối, trên trục trước điện | cao ≈ 1,9 m | [58] |
| 碑 · 碑亭 bia, đình bia | ghi công / ghi bài | trên trục (sau cổng) hoặc cặp đông–tây; bia lớn trên lưng rùa 贔屓 | — | [59] |
| 旗杆 cột cờ | báo hiệu nha môn, chùa, quân | từng cặp ngoài cổng, chân kẹp đá | cao 10–20 m (suy luận) | — |
| 積薪 đống củi báo hiệu | đốt báo hiệu | sát phong hoả đài | — | [30] |

---

## 4. Quy tắc tỉ lệ cho code (dựng tham số)

Tóm từ 清工部《工程做法》 / Lương Tư Thành [8] và 《營造法式》 [60]. Số đo nhân `K` (mục 1).

| Quy tắc | Giá trị |
|---|---|
| Gian phụ / gian giữa | 0,8 |
| Cột hiên nhà nhỏ (小式) | cao = 0,8 × gian giữa; ∅ ≈ cao / 11 |
| Cột nhà lớn (大式) | cao ≈ 10 × ∅ (60 đấu khẩu) |
| Mái đua (nhô hiên) | 0,3 × cao cột (小式); 0,35–0,45 (大式, suy luận) |
| Nền | 小式: cao = 1/5 cột, nhô = 0,8 × mái đua · 大式: cao = 1/4, nhô = 0,75 × mái đua |
| Độ dốc Thanh 舉架 | từ hiên 0,5 (27°) → 0,65 → 0,75 → nóc 0,9 (42°) — mái lõm dần lên |
| Độ dốc Tống 舉折 | 殿閣: cao nóc = 1/3 bề sâu (≈ 34°) · 廳堂: 1/4 + (≈ 30°); thoải hơn Thanh — **dùng cho tông môn / Bồng Lai** |
| Mái chiếm mặt đứng | ≈ 40–45 % (Thái Hoà, suy luận) — mái nhỏ là lỗi "nhà Tây" số một |
| Đình | cột vuông 0,8 × cạnh · lục giác 1,5 × · bát giác 1,6 × |
| Hành lang | lòng 1,2–1,5 m, gian 3 m, cột 2,5 m |
| Lầu | tầng trên ≈ 0,7 × tầng dưới |
| Tháp | tầng lẻ, mỗi tầng thu đều |
| Phố | rộng ≈ 0,5 × cao mái hai bên (ít khi > 1) |
| Cầu theo cấp | rộng giữa : kế : ngoài ≈ 8,5 : 5,8 : 4,5 |

## 5. Bốn kiểu không gian bài trí

Mỗi map thuộc một (hoặc ghép hai) kiểu — chọn kiểu trước, đặt nhà sau.

| Kiểu | Map | Luật |
|---|---|---|
| **Trục + viện lạc** 中軸 · 院落 | Văn Uyên Tông, Tử Cấm Thành, Bồng Lai (trục chính) | 坐北朝南; cổng → sân → điện phụ → điện chính → lầu sau; mỗi lớp sân một cổng ngăn và **một bậc nền cao hơn**; nhà quan trọng trên trục, nhà phụ cân hai bên; 前朝後寢 — việc chung ở trước, chỗ ở / tĩnh ở sau [21][61]. Đạo quán núi (Tử Tiêu Cung): 5 tầng nền, cổng–điện Long Hổ → đình bia → Thập Phương Đường (trọ) → điện chính trên nền 3 tầng → điện sau [9] |
| **Vườn tự do** 園林 | Rừng trúc, Bồng Lai (đảo phụ), Ngự Hoa Viên | nước là tâm (≈ 1/3 diện tích); lối cong 曲徑通幽 — cuối lối có cảnh chính ẩn rồi hiện; 借景 mượn mốc xa (tháp, núi) qua khe nhà; 對景 hai điểm nhìn nhau; 框景 cửa / cổng trăng đóng khung cảnh; 移步換景 vài bước mở một cảnh [62] |
| **Phố nước / chợ** 水鄉 · 市 | Giang Nam, chợ Tơ lụa | một bên dãy cửa hàng, một bên bờ kênh có lang bồng 2–2,5 m; cầu dày (Đồng Lý: 3 cầu < 50 m); đầu cầu chừa quảng trường nhỏ + trà quán + bến; mặt tiền theo nhịp gian 3–4 m [20][23] |
| **Trại / trạm** 營 · 驛 | Trường Thành, Tơ lụa (dịch trạm) | tường khép kín **một cổng**; lầu góc canh hướng nguy hiểm; phòng dồn sát tường; giếng / bể giữa sân; chuồng ngựa góc hoặc ngoài tường; phong hoả đài trên chỗ cao, thấy đài kế [42][28]. Huyền Tuyền Trí: sân 50 × 50 m, cổng đông, 27 phòng dồn tường tây + bắc |

### Luật thiết kế màn chơi cho map nhỏ (điện thoại)
1. **Mỗi map một mốc lớn (weenie)** nhìn thấy từ chỗ xuất hiện và giữ thông tầm nhìn tới nó [63] — chính là công trình ở
   trần cấp (Bồng Lai Các, Cửu Tầng Lâu, Thái Hoà Điện, lầu cổng ải…).
2. **Trục / nhánh**: một sân trung tâm, nhánh toả ra và luôn quay về đường chính [63].
3. **Vụn bánh mì** dẫn đường cách đều: bài phường, đèn đá, cột cờ, phong hoả đài [64].
4. Năm yếu tố Lynch: **đường** (trục), **ranh** (tường, sông), **khu**, **nút** (sân, đầu cầu), **mốc** [65].
5. Đi bộ 3–4 m/s → 100 m ≈ 30 s: **một điểm có việc mỗi 15–25 m** (suy luận); không đặt vật chỉ để lấp chỗ trống.

## 6. Bốn mục đích — mọi thứ đặt vào cảnh phải thuộc một

| Mục đích (đề xuất trường `purpose`) | Nghĩa | Ví dụ hợp lệ | Không hợp lệ |
|---|---|---|---|
| `hoat-dong` | người chơi **làm gì đó** ở đây | trà lâu (ngồi, nghe nhạc), Thư viện (mượn sách), bàn cờ, cửa hàng có NPC, đình có Tiểu Mặc chờ | 9 bồ đoàn không ai ngồi; sạp không bán gì |
| `dan-duong` | giúp **đi đúng / biết mình ở đâu** | cổng, bài phường, cầu, lối lát, đèn đá dọc lối, mốc cao | đèn đá giữa bãi cỏ không có lối |
| `ke-chuyen` | vật **đặc trưng vùng có nguồn**, đặt đúng chỗ như ngoài đời | đống củi cạnh phong hoả đài, sư tử cặp trước cổng, vạc nước hai bên điện, nhật quỹ phía đông sân điện | nhật quỹ giữa quảng trường tông môn (ngoài đời ở sân nền điện chính, phía đông) |
| `nen-xa` | **chỉ để nhìn**, không va chạm, ở xa lối đi | núi xa, đảo nổi, rừng ngoài tường, thành ảo | nhà đặc nằm ngay lối mà không vào được |

Kèm luật đặt: vật cung đình (sư tử, hoa biểu, vạc nước, nhật quỹ) chỉ ở C1–C3; vật đi cặp phải đặt cặp, đúng phía;
không có công năng trong bảng "mỗi vật một việc" dưới đây → bỏ.

| Công năng | Vật đặt |
|---|---|
| Lưu trú | đạo phòng, sương phòng, phòng quanh sân trạm, lều tròn, doanh trại |
| Thờ cúng | điện, linh quan điện, từ đường, đình bia, lư hương, cột cờ phướn |
| Buôn bán | cửa hàng 下店上宅, sạp, trà quán, sân trạm buôn |
| Kho | kho lương, kho cạnh sân, đống hàng, chum vại |
| Phòng thủ | tường, ủng thành, địch lâu, cổng |
| Báo hiệu | phong hoả đài + đống củi, cột cờ, chuông, trống |
| Nước | giếng, bậc bến 河埠頭, thuỷ các, bể, máng ngựa |
| Đi lại | cầu, lang bồng, bậc đá, bến thuyền, chuồng ngựa / lạc đà |

## 7. Áp vào 7 map — trần cấp + giọng + loại hình dùng

| Map | Giọng (đã chốt ở hồ sơ vùng) | Kiểu không gian | Trần cấp · mốc | Loại hình dùng | Sửa ngay thấy được |
|---|---|---|---|---|---|
| Văn Uyên Tông | tiên hiệp khung Tống, 粉牆黛瓦 + cột son | trục + viện lạc trên núi | C3 hiện tại (C2 khi có Chưởng Môn Điện) · trà lâu trên đỉnh | `lau`, `dinh`, `lang`, `son-mon` / `mon-lau`, `cong-trang`, `tuong-voi`, `nen`, `bac` | nhật quỹ giữa sân ngoài đời thuộc sân điện chính (C1–C2) — đổi thành đỉnh hương / bia ghi công hoặc bỏ |
| Rừng trúc | Giang Nam thư hương | vườn tự do | C4 · đình / thác | `dinh`, `ta`, `nha-day` S (Trúc Xá), `cau-bang`, bia | bồ đoàn ×9, đèn trúc ×6: chỉ giữ chỗ gắn hoạt động |
| Giang Nam | dân gian Minh | phố nước | C4 · Vọng Giang Lâu (`cac`) | `nha-giang-nam`, `cua-hang`, `lau` (trà lâu), `lang` (lang bồng), `cau-vom`, `cau-bang`, `ta` | Thư phòng / Thuỷ các / Nhà ven sông: thôi dùng `nha-nho` |
| Bồng Lai | tiên hiệp Tống, vách đỏ | trục (đảo chính) + vườn (đảo phụ) | C3 · Bồng Lai Các (`cac` 2 tầng) | `cac`, `dinh`, `thap` 5 tầng, `cau-treo`, `nen` | Bồng Lai Các thôi mượn thư viện tông môn; 8 pháp bảo rải → gom về chỗ có việc |
| Trường Thành | quân sự Minh | trại / trạm + tường | C3 · lầu cổng ải (`lau-thanh`) | `tuong-thanh`, `dich-lau`, `phong-hoa` + củi, `lau-thanh`, ủng thành, `nha-day` (doanh trại, kho lương), `tu-mieu` (Khương Nữ Từ), `leu` | đền dựng bằng nhà nhỏ → `tu-mieu`; 6 lều + 4 sạp chỉ giữ cái có việc |
| Tơ lụa | biên ải Đường, đất nện | trại / trạm + chợ | C3 · Cửu Tầng Lâu dựa vách | `nha-dat`, `tuong-dat` (dịch trạm 1 cổng), `phong-hoa` (đất), `leu` (tròn, vải), `cac` S (Nguyệt Tuyền Các) | Nguyệt Tuyền Các = `cac`, không phải nhà nhỏ; 15 lều / lán gom thành 1 chợ + 1 đoàn buôn |
| Tử Cấm Thành | cung đình Minh–Thanh | trục + viện lạc tuyệt đối | C1 · Thái Hoà Điện | `dien` C1 / C2 / C3, `lau-thanh` (Ngọ Môn), `nen` tu di 3 tầng, `cau-vom` ×5 (rộng theo cấp), `tuong-cung`, vật sân cung đình | Thái Hoà / Trung Hoà / Bảo Hoà phải khác mái (vũ điện kép / toản tiêm / yết sơn kép) |

## 8. Dựng low-poly — bộ phận dùng chung

Thay vì mỗi nhà / vật một hàm riêng, mọi loại ở mục 3 ghép từ **~12 bộ phận** có tham số (đa số đã có rời rạc trong
`kien_truc/`): nền (thường / tu di 1–3 tầng) · bậc (3 kiểu) · cột (tròn / vuông, son / mộc) · dải xà + đấu củng (theo
cấp) · tường (vôi / gạch / đất / cung) · cửa bức bàn · lan can (đá / gỗ / 美人靠) · **mái 7 kiểu** (vũ điện, yết sơn,
huyền sơn, ngạnh sơn, toản tiêm 4 / 6 / 8, quyển bồng, mái bằng) × hiên đơn / kép · bờ nóc + si vẫn + thú nóc (theo cấp) ·
biển · đèn lồng · ban công 平坐.

| Cấp | Ngân sách gợi ý / công trình (suy luận, theo `nen-tang.md` mục 8) |
|---|---|
| C1–C2 | ≤ 8 draw call, ≤ 12k tam giác |
| C3 | ≤ 6, ≤ 8k |
| C4 | ≤ 4, ≤ 4k |
| C5–C6 | ≤ 3, ≤ 2k (lặp nhiều → instancing / gộp) |

## Hướng — đã chọn (người dùng 2026-11-14): 1A · 2A · 3A
1. **Thước đo chung `K`**: A — **1,25** cho mọi map (cửa thật 2,4 m → 3 m; khớp "nhân vật ≈ 2,1 m" của hồ sơ vùng; tông
   môn thu nhỏ từ 1,6 → nhà gọn hơn, đi lại gần hơn) · B — giữ **1,6** cho mọi map (to, hoành tráng; các vùng phải
   phóng to, nặng hơn) · C — mỗi map một `K` như hiện nay nhưng ghi lý do. → khuyên **A**.
2. **Độ dốc mái**: A — **theo giọng vùng** (Tống thoải ~30–34° cho tông môn, Bồng Lai, Rừng trúc; Thanh dốc 27→42° cho Tử
   Cấm Thành, Trường Thành; Giang Nam đầu đao vểnh cao) · B — một độ dốc chung. → khuyên **A** (chi phí như nhau, chỉ là
   tham số).
3. **Số cỡ mỗi loại**: A — **3 cỡ S / M / L** cố định (danh mục gọn, dễ duyệt) · B — cỡ tự do trong khoảng cho phép
   (linh hoạt, dễ "tự phát" lại). → khuyên **A**.

## Sai thường gặp cần tránh
- Mượn một loại cho chức năng khác (đền = nhà nhỏ, các = nhà nhỏ, lầu biểu tượng = thư viện) — người xem đọc sai vai trò.
- Nhiều công trình cùng ở trần cấp trong một map → mất mốc; ba điện cùng một mái → mất thứ bậc.
- Vật cung đình (nhật quỹ, vạc nước, sư tử, hoa biểu) ở nơi dân gian / tông môn nhỏ, hoặc đặt lẻ khi ngoài đời đi cặp.
- Rải vật "cho đỡ trống" (bồ đoàn, đèn, lều, pháp bảo) không gắn hoạt động hay lối đi.
- Tường đầu ngựa 馬頭牆 ở Giang Nam Tô Châu (đó là Huy Châu) — xem `giang-nam.md`.
- Mỗi map một thước đo → cửa, bậc, lan can nhảy cỡ khi truyền tống.
- Mái nhỏ, phẳng, hiên không vươn (mái < 40 % mặt đứng).

## Đưa vào cảnh (→ GĐ 2 của kế hoạch)
- **GĐ 2 (`/canh`, thiết kế)**: chốt `K`, dốc mái, cỡ S / M / L → viết `design/kien_truc/danh_muc.md` theo mục 3 (mỗi loại:
  cỡ, cấp cho phép, màu theo `phong_cach.md`, ngân sách) + Catalog 3D duyệt từng mẫu.
- **Cần code (GĐ 4)**: `kind` theo danh mục + `size` (S / M / L) thay `w` / `d` tự do; trường `purpose` (mục 6) bắt buộc;
  `level` (C1–C6) + trần cấp của map → `scene:check` báo sai cấp, thiếu mục đích, vật đi cặp đặt lẻ; tách công trình khỏi
  `props`; gom `vat_*.ts` theo loại hình; một `K` chung thay `heightScale` từng map.
- Không đổi gì trong `scene.json` ở bước này.

## Nguồn
Ghi chú độ tin cậy: nhiều số từ Baidu Baike / Zhihu / báo điện tử, chưa đối chiếu bản vẽ đo đạc; số của Cố Cung
(dpm.org.cn), 《明會典》, Wikipedia tin hơn. Chỗ chưa có số tin cậy: dày tường đỏ cung, cao tường đầu ngựa, khoảng cách lậu
song, cao cột cờ, kích thước theo mét của Trung Hoà Điện, Thiên Nhất Các, trà lâu / tửu lâu / cửa hàng.

- [1] Thứ bậc mái — https://sohu.com/a/445441976_617491 — 9 bậc mái Minh–Thanh
- [2] https://www.epochtimes.com/gb/9/10/3/n2676853.htm — xếp hạng mái, kiểu phụ 攢尖 / 盝頂
- [3] 《明會典》 卷59 — https://zh.wikisource.org/wiki/明會典_(四庫全書本)/卷059 — số gian, cấm đấu củng / vẽ màu theo phẩm
- [4] Quy chế phủ thân vương — https://baike.baidu.com/item/亲王府规制/13210385 — gian, nền 10 thước, ngói lục
- [5] Thú nóc — https://www.ourchinastory.com/cn/15708 · https://www.sohu.com/a/417225201_487544
- [6] Nền theo cấp — https://www.pgm.org.cn/pgm/wftj/201808/02ca14fe26fe4924bfb7854ff049bdc9.shtml · https://zhuanlan.zhihu.com/p/513444009
- [7] 天一閣 — https://zh.wikipedia.org/wiki/天一閣 · http://www.ningbo.gov.cn/art/2016/10/12/art_1229099796_52048088.html
- [8] Tóm tắt 工程做法 / Lương Tư Thành (tỉ lệ cột, mái đua, nền, 舉架) — https://www.sohu.com/a/390219687_100017881
- [9] 紫霄宮 — https://baike.baidu.com/item/紫霄宫/3539370 · https://k.sina.cn/article_7055240114_p1a4866bb200100j1wg.html
- [10] 太和殿 / 中和殿 / 保和殿 — https://zh.wikipedia.org/wiki/太和殿 · https://zh.wikipedia.org/wiki/中和殿 · https://zh.wikipedia.org/wiki/保和殿
- [11] Cục Lâm viên Tô Châu — tỉ lệ sảnh, lầu, đình, hành lang, cửa vườn — https://ylj.suzhou.gov.cn/szsylj/ylys/201903/484421d38f504f5787a8f307925e3ad7.shtml
- [12] 樓 vs 閣 — https://www.zdic.net/hant/楼阁
- [13] Tháp — https://chiculture.org.hk/en/china-five-thousand-years/2101 · https://www.163.com/dy/article/G6VH4FP40543VP8P.html
- [14] 繡綺亭 — https://blog.sina.com.cn/s/blog_51a238b40102zgev.html (chưa đối chiếu)
- [15] 水榭 — https://zh.wikipedia.org/wiki/水榭
- [16] 美人靠 — https://gf.cabr-fire.com/article-62651.htm
- [17] 清晏舫 — https://imaginoso.com/china/beijing/new-summer-palace-marble-boat-southeast-elevation
- [18] 廊棚 — https://baike.baidu.com/item/十大江南水乡/15714190
- [19] Nhà thuỷ hương — https://chiculture.org.hk/sc/china-five-thousand-years/693
- [20] https://m.thepaper.cn/baijiahao_15704196 · http://news.sina.com.cn/c/2017-05-06/doc-ifyexxhw2556262.shtml
- [21] 四合院 — https://zh.wikipedia.org/wiki/四合院 · http://www.sihey.com/shy/wh/1569.html
- [22] Tường đất nện — https://www.puzhiyuan.com/hangtuqiang/2113.html
- [23] Tỉ lệ phố — http://zgfxkh.xml-journal.net/cn/article/pdf/preview/85.pdf
- [24] Từ đường Huy Châu — https://baike.baidu.com/item/徽派建筑/10640714
- [25] 德和園大戲樓 — https://www.visitbeijing.com.cn/article/47QtXfWkDiW
- [26] 嘉峪關 — https://www.gsei.com.cn/html/1654/2024-08-16/content-532457.html · https://zhuanlan.zhihu.com/p/27403657
- [27] 正陽門 — https://baike.baidu.com/item/正阳门/12836
- [28] 空心敵台 — https://www.sohu.com/a/552317967_100219920 · https://www.dpm.org.cn/lemmas/241765.html
- [29] 烽火台 — https://baike.baidu.com/item/烽火台/2768326
- [30] 烽燧 Hán Đôn Hoàng — https://baike.baidu.com/item/烽火台遗址/2602045 · https://www.silkroads.org.cn/portal.php?mod=view&aid=15168
- [31] 蒙古包 — https://zh.wikipedia.org/wiki/蒙古包 · https://en.wikipedia.org/wiki/Yurt
- [32] 牌坊 — https://zh.wikipedia.org/zh-cn/牌坊
- [33] 欞星門 · bài phường Thập Tam Lăng — https://baike.baidu.com/item/棂星门/1056284 · https://baike.baidu.com/item/明十三陵超大石牌坊/7057187
- [34] 山門 — https://baike.baidu.com/item/寺院山门/16293417
- [35] 門樓 Huy Châu — https://www.sohu.com/a/254626302_654278
- [36] 垂花門 — https://zh.wikipedia.org/zh-cn/垂花门 · https://zhuanlan.zhihu.com/p/69610970
- [37] Cửa vườn, lậu song — https://www.sohu.com/a/415546282_120083328 · [11]
- [38] Đỉnh tường — https://www.sohu.com/a/477523948_121124384 · https://baike.baidu.com/item/墙帽/14493634
- [39] Tường thành Tử Cấm Thành — https://www.dpm.org.cn/explore/building/236441.html
- [40] Tường đỏ — https://www.news.cn/tech/20210924/051ccd16321d498195fd40360d6db5c3/c.html
- [41] Trường Thành Minh — https://baike.baidu.com/item/明长城/1599784
- [42] 懸泉置 — https://baike.baidu.com/item/悬泉置遗址/8717786 · https://zh.wikipedia.org/wiki/悬泉置遗址
- [43] 趙州橋 — https://zh.wikipedia.org/zh-cn/赵州桥
- [44] 金水橋 — https://baike.baidu.com/item/金水桥/12176 · cầu Tô Châu https://www.sohu.com/a/398024554_120058100
- [45] 九曲橋 — https://zh.wikipedia.org/zh-cn/九曲桥_(惠州西湖)
- [46] 北澗橋 — https://baike.baidu.com/item/北涧桥/8698406
- [47] 瀘定橋 — https://baike.baidu.com/item/泸定桥/944710
- [48] 須彌座 — https://baike.baidu.com/item/须弥座/1658864 · https://www.dpm.org.cn/Uploads/File/2023/02/15/u63ec3cb1a5b6d.pdf
- [49] Lan can đá — https://bbs.co188.com/thread-10399307-1-1.html · https://news.bjd.com.cn/2024/01/23/10684347.shtml
- [50] Bậc 踏跺 — https://lhsr.sh.gov.cn/jnylwh/20231215/7220227653e74eeea8afff3a7f20e8f5.html
- [51] Cửu Long Bích — https://gygl.beijing.gov.cn/whgy/whgy_wwjs/201912/t20191206_885260.html
- [52] Sư tử đá — https://www.thepaper.cn/newsDetail_forward_4322426
- [53] 華表 — https://zhuanlan.zhihu.com/p/514534314
- [54] Nhật quỹ, gia lượng — https://www.sohu.com/a/226270817_469039
- [55] 銅缸 — https://amma.artron.net/observation_shownews.php?newid=1001084
- [56] Đỉnh / lư hương chùa — http://fo.sina.com.cn/intro/basic/2017-11-02/doc-ifynhhay9938013.shtml
- [57] 井亭 — https://www.dpm.org.cn/explore/building/236530.html
- [58] Đèn đá Đường — https://www.beilin-museum.com/index.php?m=home&c=view&a=index&aid=2539
- [59] Đình bia — https://zhuanlan.zhihu.com/p/365353709
- [60] 舉折 — https://zh.wikipedia.org/zh-hans/举折 · https://zh.wikisource.org/wiki/營造法式/第五卷
- [61] Tử Cấm Thành (前朝後寢, quy mô) — https://en.wikipedia.org/wiki/Forbidden_City
- [62] Vườn Tô Châu (借景, 對景, 框景, nước 1/3) — https://www.sohu.com/a/412010383_750655 · https://blog.sina.com.cn/s/blog_4c020eee0100i9q4.html
- [63] Level Design Book — Disneyland (weenie, hub-and-spoke) — https://book.leveldesignbook.com/studies/irl/disneyland
- [64] Ghost of Tsushima weenies — https://www.gamedeveloper.com/design/a-taxonomy-of-weenies-the-landmarks-that-define-i-ghost-of-tsushima-i-
- [65] GDC 2018 level design roundtable (Lynch) — https://www.gamedeveloper.com/design/gdc-2018-level-design-workshop-an-expert-roundtable-q-a
