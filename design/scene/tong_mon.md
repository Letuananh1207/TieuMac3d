# Quy hoạch tông môn (đề xuất cảnh 3D) · từ mục 2026-11-10.3

> **2026-11-13.6**: tông môn là **nhà / trạm gốc** của hành trình nhiều vùng — xem `hanh_trinh.md`. Khu 3 Diễn Võ
> Trường đổi thành **Truyền Tống Đài** (6 cột trận sang các vùng).
>
> **2026-11-13.13**: Văn Uyên Tông **không có lớp học** — là nơi giao lưu (bây giờ với NPC). Hướng A: Ngoại Môn thành
> quảng trường, hí đài thay giảng đường, Tàng Thư Các + ao thay thư viện, trà lâu góc đông nam, phố chợ trên lối Sơn Môn;
> Truyền Tống Đài thu 18 × 18 m. Bản mẫu: `source/TienIch-kien-truc.dc.html`, `source/TienIch-mat-bang.dc.html`; khảo cứu
> `docs/tham_khao/tien-ich-giao-luu.md`. Bảng "Đã đặt" dưới đây là bố cục cũ.

Bản vẽ: `source/TongMon-ban-do.dc.html` (canvas, artboard "Đề xuất: quy hoạch tông môn"). Chưa có ảnh.

Mở rộng cảnh từ một sân học thành một **tông môn tu tiên** (bối cảnh tiểu thuyết tiên hiệp) gồm nhiều khu. Sân
đang có giữ nguyên làm **Ngoại Môn**. `scene.json` **chưa đổi**: phần lớn các khu cần loại vật / địa hình mà đặc tả
hiện chưa tả được, phiên code làm trước (mục "Cần code" bên dưới), rồi phiên thiết kế mới sắp từng khu bằng đặc tả.

## Trạng thái

- **Đợt 1 — đã đặt** (mục 2026-11-11.1): khu 1–6 trên mặt phẳng + Phù Không Đảo (đảo nổi, mây). Toạ độ thật xem
  `scene.json` và bảng "Đã đặt" dưới đây; ảnh `screens/Canh-tren.png`, `screens/Canh-ca-san.png`.
- **Đợt 2 — chưa làm** (cần địa hình cao thấp, bậc đá, thác): khu 7 Thiên Bậc, 8 Nội Môn · Chủ Phong, 9 Hậu Sơn.

### Đã đặt (đợt 1)

| Khu | Vị trí thật | Gồm |
|---|---|---|
| 1 Ngoại Môn | tường bao ±21; khe nam tâm x 0 rộng 4, khe đông tâm z 0 rộng 4, khe tây tâm z −4 rộng 4 | giảng đường, thư viện, giếng, 5 cây — giữ nguyên |
| 2 Sơn Môn | lối (0; 21) → (0; 56) rộng 5; cổng `son-mon` tâm (0; 44) rộng 6, biển "Văn Uyên Tông" | 2 cụm cây hai bên lối; **xuất phát (0; 50)** |
| 3 Diễn Võ Trường | tường riêng x 27…60, z −15…15; khe tây tâm z 0 rộng 5, khe nam tâm x 44 rộng 5 | đài tỉ thí (44; 0), 4 giá binh khí sát tường bắc, 2 cây góc |
| 4 Đệ Tử Cư Xá | lối x 44 từ z 6 tới 40 | 4 nhà nhỏ z 36 (x 33 · 39,5 · 48,5 · 55) quay bắc, hàng cây z 43,5, rừng trúc x 63 |
| 5 Linh Dược Viên | tường riêng x −62…−27, z −15…20; khe đông tâm z −4 rộng 5, khe bắc tâm x −45 rộng 4 | 8 luống thuốc, ao tròn (−45; 11) r 4, Dược các (−36; 14), rừng trúc sát tường tây |
| 6 Luyện Đan Phòng | lối x −45 từ z −15 tới −31 | điện `luyen-dan` (−45; −36) 12×8 mái cong, 2 lò đan (−49; −26), (−41; −26), hàng cây z −45 |
| 10 Phù Không Đảo | 3 đảo nổi ở rìa bắc, 10 mây độ cao 34 | không va chạm |

Thêm ở 2026-11-11.2: **Văn Tháp** (tháp 5 tầng) tâm (−14,5; −14,5) góc tây bắc Ngoại Môn; đỉnh đồng (0; −0,5); đèn
đá cạnh bậc giảng đường (±3,5; −4,8), sau cổng (±4,5; 40), trước Luyện Đan (−47,5 / −42,5; −22); đá Thái Hồ ×4; mai
(±8,5; −4), (−36 / −54; −26); liễu quanh ao. Tên khu (`site.areas`, chip HUD) đúng ranh giới bảng trên; Sơn Môn
x −6…6, z 21…56.

Rìa cảnh: cụm cây trang trí (không va chạm) bắc / tây / đông / nam; vòng cây ngoài tường tắt (`ring.count` 0).

## Các khu (quy hoạch ban đầu)

Toạ độ mét, cùng hệ với `scene.json` (bắc = −z). Là khung gợi ý, sẽ chỉnh khi đặt thật trên Canvas 3D.

| # | Khu | Chữ Hán | x | z | Có gì |
|---|---|---|---|---|---|
| 1 | Ngoại Môn · Học đường | 外門 | −21 … 21 | −21 … 21 | sân hiện có: giảng đường (lớp HSK 3), thư viện, giếng |
| 2 | Sơn Môn | 山門 | −6 … 6 | 21 … 55 | cổng tông môn có bảng hiệu, bậc đá đi lên từ nam; điểm xuất phát mới |
| 3 | Diễn Võ Trường | 演武場 | 27 … 60 | −15 … 15 | quảng trường lát đá, đài tỉ thí tròn, giá binh khí |
| 4 | Đệ Tử Cư Xá | 弟子居 | 27 … 60 | 21 … 45 | dãy nhà nhỏ của đệ tử, hàng cây |
| 5 | Linh Dược Viên | 靈藥園 | −62 … −27 | −15 … 20 | luống linh thảo bậc thang, ao linh tuyền |
| 6 | Luyện Đan Phòng | 煉丹房 | −62 … −27 | −42 … −21 | nhà luyện đan, lò đan đồng, khói |
| 7 | Thiên Bậc | 天階 | −5 … 5 | −55 … −21 | bậc đá dài từ Ngoại Môn lên núi chính |
| 8 | Nội Môn · Chủ Phong | 主峰 | −25 … 25 | −88 … −55 | đỉnh núi: Chưởng Môn Điện, Tàng Kinh Các dạng tháp nhiều tầng |
| 9 | Hậu Sơn | 後山 | 32 … 75 | −92 … −30 | thác nước, hồ, rừng trúc, động bế quan |
| 10 | Phù Không Đảo | 浮空島 | ngoài rìa tây bắc | | đảo đá lơ lửng trong mây, chỉ để ngắm |

Lối đi nối: 1↔3 và 1↔5 (giữa tường đông / tây), 5↔6, 3↔4, 1↔7 (giữa tường bắc), 8↔9, 1↔2 (giữa tường nam).

## Cần code

Theo thứ tự nên làm. Mỗi thứ thêm vào `SceneSpec` kèm giá trị mặc định giữ nguyên cảnh cũ (quy tắc 8).

1. **Nhiều khu, tường có cổng mở.** `walls` đang là một vòng vuông ±`half`. Cần danh sách đoạn tường (từ điểm
   → tới điểm, cao, màu) để mỗi khu có tường riêng và chừa khe làm lối đi; nền sân (`ground`) phủ hết các khu.
   Lối lát đá giữa các khu: dải nền khác màu.
2. **Địa hình cao thấp.** Khu 7, 8, 9 nằm trên núi. Cần nền có độ cao (bục nền theo khu hoặc bản đồ độ cao),
   nhân vật đi lên xuống theo độ cao, va chạm và vùng sự kiện tính theo độ cao, camera bám theo.
3. **Bậc đá** nối hai độ cao (Thiên Bậc, Sơn Môn): rộng, số bậc, hướng.
4. **Kiểu nhà mới** — thêm trường kiểu cho `buildings`: điện lớn mái hai tầng (Chưởng Môn Điện), tháp nhiều tầng
   (Tàng Kinh Các), mái cong đầu đao. Nhà hiện có giữ kiểu cũ làm mặc định.
5. **Cổng sơn môn** (cổng có mái, hai cột, bảng hiệu chữ lớn) — đặt giữa tường / đầu bậc.
6. **Nước:** ao / hồ (mặt nước phẳng, không đi xuống được), thác (dải nước dọc đổ xuống hồ).
7. **Vật trang trí khu:** đài tỉ thí tròn, giá binh khí (khu 3); luống thuốc (khu 5); lò đan đồng có khói nhẹ (khu 6).
8. **Kiểu cây mới:** rừng trúc (khu 9) — `trees` thêm kiểu, mỗi cây / nhóm chọn kiểu.
9. **Đảo nổi + mây** (khu 10): trang trí, không va chạm, có thể trôi chậm.
10. **Hiệu năng:** cảnh to gấp nhiều lần — gộp instancing, sương che xa, đo fps trên máy yếu (không shadow,
    pixelRatio ≤ 1,5 vẫn giữ). Có thể cần chỉ dựng khu gần người chơi.

Không bắt buộc ở bước này: mỗi khu một vùng bài học riêng (thêm mã vào `ZONE_CONTENT` + nội dung bài) — quyết sau.

## Luật bị chạm (đề xuất, khi đặt thật)

- `R-VA-1`: tường không còn là một vòng ±21 liền; ví dụ "mặt trong tường bắc ở z = −20,5" sẽ có khe lên Thiên
  Bậc → cần đổi ví dụ sang một đoạn tường liền, và thêm ý "đi theo độ cao địa hình, không đi xuyên vách núi".
- `R-VUNG-1`: giữ nguyên ý; nếu vùng nằm trên núi thì khoảng cách tính trên mặt sân (x, z).
- Điểm xuất phát dời về Sơn Môn: chưa có luật nói về điểm xuất phát.
