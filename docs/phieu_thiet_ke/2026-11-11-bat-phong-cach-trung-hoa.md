# Phiếu: Bật phong cách Trung Hoa trong scene.json + đặt tên khu

- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-11-phong-cach-trung-hoa.md` (việc 12); đáp phần "Cần code" của 2026-11-11.1
- Đã vẽ: 2026-11-11.2

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bật phong cách Trung Hoa + đặt tên khu (Học Xá 3D)

Lệnh: /ui-design canh bật phong cách Trung Hoa — làm theo mục "Cảnh 3D" trong skill ui-design (bảng trường đã cập
nhật). Phiên code đã dựng xong mọi mục "Cần code" của 2026-11-11.1.

Đã tự đổi, không cần làm gì (code, theo bản mẫu): điện / giảng đường (nền đá + lan can, cột son, cửa bức bàn, xà
lục-lam-vàng; điện mái hiên kép), nhà nhỏ, tháp bát giác, cổng 3 gian 4 trụ (xà 6,2 m — camera qua cổng không còn
lọt sau biển), nhân vật đệ tử thay gấu.

Cần bật trong design/scene/scene.json (mặc định vẫn giữ cảnh cũ cho tới khi bật):
- walls.style: "voi" (+ walls.color màu vôi, walls.windows khoảng cách cửa sổ hoa) → tường vôi mái ngói, khe tường
  bao thành cổng trăng. Đoạn tường khu (wallSegments) cũng thành tường vôi; khe giữa các đoạn vẫn là khe thường.
- gates[]: "hanTitle" (vd. "文淵宗") và "roofColor" (ngói lưu ly lục).
- Cây: đổi trees.yard / trees.groves sang "tung" (cây chính), "lieu" (quanh ao), "mai" (điểm nhấn); màu
  trees.willow, trees.plum.
- props mới: "da-thai-ho", "den-da", "dinh-dong" (cạnh lối đi, trước điện).
- site: tên nơi + khu (hình chữ nhật from/to) để chip HUD hiện "<nơi> · <khu>" — đặt tên 6 khu đang có.
- buildingStyle mới: beamBlue, gold, timber (đã có mặc định theo bảng màu phong_cach.md).
Ví dụ đủ mọi thứ trên (bản thử của phiên code, toạ độ ước chừng — KHÔNG phải thiết kế):
docs/phieu_thiet_ke/2026-11-11-phong-cach-mau.json. Đo bản thử: 67–90 draw call, ~66k tam giác.

Kiểm: npm run scene:check "Không có lỗi"; Canvas 3D 3 góc ≤ 150 draw call; chụp gần bằng ?cam=x,y,z&tam=x,z.
So với bản mẫu: chỗ nào trông khác nhiều thì ghi lại (sửa bản mẫu, hoặc ghi "Cần code").

Luật phải theo (chép nguyên văn):
- R-VA-1: Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cột cổng, giếng, ao / hồ, vật trang trí có va chạm
  (đài tỉ thí, giá binh khí, lò đan…) và cây có va chạm (cây trong sân, cụm cây); đi qua được khe cổng trên tường.
  Cây vòng ngoài tường, lối lát đá, đảo nổi, mây không có va chạm. Ví dụ: Mặt trong tường bắc ở z = −20,5 → đi thẳng
  lên bắc thì dừng ở z = −20,0. Tường nam có khe cổng tâm x = 0 rộng 4: đi thẳng xuống nam ở x = 0 thì qua được; ở
  x = 3 thì dừng ở z = 20,0.
  → Với tường vôi, khe 4 m thành cổng trăng đi được 3,2 m (x −1,6…1,6); ví dụ vẫn đúng (đã mô phỏng).
- R-HUD-1: Chip góc trên trái hiện "<tên nơi> · <tên khu>" khi nhân vật đứng trong một khu (hình chữ nhật đặt trong
  đặc tả cảnh); đứng ngoài mọi khu thì chỉ hiện "<tên nơi>". Hai khu chồng nhau thì lấy khu khai báo trước. Đổi chữ
  ngay khi bước qua ranh giới. Ví dụ: Tên nơi "Văn Uyên Tông", khu "Diễn Võ Trường" x 27…60, z −15…15: đứng ở
  (43; 0) → "Văn Uyên Tông · Diễn Võ Trường"; đứng ở (24; 0) → "Văn Uyên Tông". Chưa đặt khu nào: "Học xá · Sân
  chính" như cũ.
  → Nếu đặt khu khác ví dụ (tên / ranh giới Diễn Võ Trường), ghi rõ để phiên code sửa ví dụ trong sổ.
- R-VUNG-1: giữ giảng đường, thư viện đúng chỗ (vùng neo theo nhà). Lưu ý: nền giảng đường mới rộng hơn 1 m mỗi
  bên (va chạm 15 × 9) — vùng lop-hsk3 vẫn đứng vào được (đã kiểm).

Chuỗi mới: tên nơi + 6 tên khu (tiếng Việt, gợi ý theo tong_mon.md: Ngoại Môn, Sơn Môn, Diễn Võ Trường, Đệ Tử Cư
Xá, Linh Dược Viên, Luyện Đan Phòng).
App đang có: web/src/scene/kien_truc/*, cay_moi.ts, props.ts, player/discipleCharacter.ts, zones/areaTracker.ts.
```
