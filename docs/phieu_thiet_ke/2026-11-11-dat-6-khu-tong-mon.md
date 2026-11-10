# Phiếu: Đặt 6 khu phẳng của tông môn (cảnh 3D)

- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-10-tong-mon-dot-1.md` (việc 13); đáp phần đợt 1 của mục thiết kế 2026-11-10.3
- Đã vẽ: 2026-11-11.1

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Đặt 6 khu phẳng của tông môn (Học Xá 3D)

Lệnh: /ui-design canh đặt 6 khu tông môn — làm theo mục "Cảnh 3D" trong skill ui-design (đã có bảng trường mới).

Cần gì:
- Đặt bằng design/scene/scene.json 6 khu trên mặt phẳng theo design/scene/tong_mon.md: 1 Ngoại Môn (sân hiện có,
  giữ giảng đường, thư viện, giếng), 2 Sơn Môn (cổng + lối đá, điểm xuất phát mới), 3 Diễn Võ Trường (đài tỉ thí,
  giá binh khí), 4 Đệ Tử Cư Xá (nhà nhỏ, hàng cây), 5 Linh Dược Viên (luống thuốc, ao), 6 Luyện Đan Phòng (điện
  luyện đan, lò đan). Khu 7–10 (núi, bậc đá, thác) CHƯA làm được — đợt 2, sau mốc 3. Phù Không Đảo (đảo nổi + mây)
  đặt được ngay, chỉ để ngắm.
- Phiên code đã thêm đủ loại vật; bảng trường + ví dụ trong skill ui-design. Bản thử cú pháp (KHÔNG phải thiết kế,
  toạ độ ước chừng): docs/phieu_thiet_ke/2026-11-11-tong-mon-dot-1-mau.json — chép làm khởi điểm cũng được.
- Lối nối 1↔2 (tường nam), 1↔3 (tường đông), 1↔5 (tường tây), 3↔4, 5↔6 bằng walls.gates + paths.
- Cảnh rộng hơn: tăng ground.size, fog.far; cây vòng ngoài tường (trees.ring) đang nằm ở bán kính 25–31 — sẽ chen
  vào các khu mới, nên dời / tắt (count 0) và trồng cụm cây (trees.groves) quanh rìa.
- npm run scene:check "Không có lỗi"; Canvas 3D bảng Hiệu năng ≤ 150 draw call ở cả 3 góc (?view=tren, ca-san, góc
  chơi). Chụp design/screens/Canh-tren.png, Canh-ca-san.png nếu được.
- Chốt: CHANGELOG loại "cảnh 3D", **bố cục**; ghi điểm xuất phát mới, các khe cổng (cạnh, tâm, rộng) để phiên code
  đối chiếu R-VA-1.

Luật phải theo (chép nguyên văn):
- R-VA-1: Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cột cổng, giếng, ao / hồ, vật trang trí có va chạm
  (đài tỉ thí, giá binh khí, lò đan…) và cây có va chạm (cây trong sân, cụm cây); đi qua được khe cổng trên tường.
  Cây vòng ngoài tường, lối lát đá, đảo nổi, mây không có va chạm. Ví dụ: Mặt trong tường bắc ở z = −20,5 → đi thẳng
  lên bắc thì dừng ở z = −20,0. Tường nam có khe cổng tâm x = 0 rộng 4: đi thẳng xuống nam ở x = 0 thì qua được; ở
  x = 3 thì dừng ở z = 20,0.
  → Giữ tường bắc liền ở x = 0 (khe bắc lên Thiên Bậc là đợt 2). Khe nam rộng khác 4 thì ghi rõ, phiên code sửa ví dụ.
- R-VUNG-1: Nhân vật đứng cách tâm vùng nhỏ hơn bán kính thì hiện thẻ mời của vùng đó; ra ngoài thì thẻ ẩn.
  Ví dụ: vùng lớp HSK 3 tâm (0; −6,4), bán kính 2,6. → Giữ giảng đường, thư viện đúng chỗ (vùng neo theo nhà).

Không làm ở phiếu này: vùng bài học cho khu mới (cần nội dung bài trong code — quyết sau), nhân vật / model .glb.
Dùng lại: màu buildingStyle (stone, water, path, bronze, herb, smoke), token design/tokens/design_tokens.json.
App đang có: web/src/scene/{walls,paths,buildings,gate,water,props,trees,sky,merge}.ts; khuôn web/src/scene/spec.ts.
```
