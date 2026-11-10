# Quy hoạch tông môn (đề xuất cảnh 3D) · từ mục 2026-11-10.3

Bản vẽ: `source/TongMon-ban-do.dc.html` (canvas, artboard "Đề xuất: quy hoạch tông môn"). Chưa có ảnh.

Mở rộng cảnh từ một sân học thành một **tông môn tu tiên** (bối cảnh tiểu thuyết tiên hiệp) gồm nhiều khu. Sân
đang có giữ nguyên làm **Ngoại Môn**. `scene.json` **chưa đổi**: phần lớn các khu cần loại vật / địa hình mà đặc tả
hiện chưa tả được, phiên code làm trước (mục "Cần code" bên dưới), rồi phiên thiết kế mới sắp từng khu bằng đặc tả.

## Các khu

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
