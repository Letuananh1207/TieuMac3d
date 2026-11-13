# Phiếu: Bảng cách chơi trò chơi Kỳ Văn Uyển (Ngũ Tử Kỳ · Đấu chữ)
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-13.35
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-bien-tro-choi.md` (nhiệm vụ 7). Người dùng (2026-11-13): "tôi không thích
  phong cách hướng dẫn như hiện tại mà nên có 1 bảng giải thích cách chơi". Đã có: biển tên 3D + nút "Cách chơi"
  (`web/src/ui/guideButton.ts`); hiện bấm nút thì NPC giảng luật qua khung thoại — chỉ là tạm, thay bằng bảng này.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bảng cách chơi (Học Xá 3D, khu giao lưu Kỳ Văn Uyển 棋文苑)

Bối cảnh: mỗi bàn chơi có biển gỗ ghi tên trò (五子棋 · Ngũ Tử Kỳ, 鬥字 · Đấu chữ — ảnh design/screens/Canh-bien-tro-choi.png,
Canh-bien-ngu-tu-ky.png). Đứng gần biển → nút nổi "Cách chơi" (kiểu nút "Xem bảng", 2026-11-13.25). Bấm → BẢNG CÁCH CHƠI
mở ra. Người dùng không thích kiểu NPC giảng qua khung thoại nhiều trang — muốn một bảng đọc lướt được trong một lần.

Cần vẽ (dọc 390×844 + ngang 844×390), cho CẢ HAI trò, dùng chung một khung:
1. BẢNG CÁCH CHƠI (lớp phủ trên cảnh — đề xuất HUD web như khung thoại để chạy cả khi không có Flutter; hoặc màn Flutter
   như bảng nhiệm vụ — người thiết kế chọn, ghi lý do):
   - Đầu bảng: tên Hán lớn + tên Việt (五子棋 Ngũ Tử Kỳ / 鬥字 Đấu chữ), một dòng giới thiệu ngắn.
   - Các mục ngắn, có biểu tượng hoặc số thứ tự: Mục tiêu · Mỗi lượt làm gì · Thắng / thua / hoà · Vào bàn & rời bàn.
   - HÌNH MINH HOẠ: Ngũ Tử Kỳ — lưới nhỏ với 5 quân đen liền (ngang / chéo) sáng lên; Đấu chữ — một thẻ bộ thủ (vd. 木)
     + 4 nghĩa, một nghĩa đúng tô xanh.
   - (tuỳ) một dòng "mẹo" do NPC của bàn nói (cờ: Tiểu Mặc, Đấu chữ: Mặc Ông) — có avatar nhỏ / tên.
   - Nút đóng (+ nút quay lại của máy). Nội dung dài hơn màn ngang → cuộn trong bảng.
   - (tuỳ) nút phụ "Vào bàn" ngay trong bảng — chỉ khi hợp luồng (ghế gần nhất); nếu không thì bỏ.
2. Trạng thái: Ngũ Tử Kỳ dọc · Đấu chữ dọc · ngang (một trò) · Đấu chữ khi chưa học bộ nào (ghi chú "Hãy tới Rừng
   trúc tu luyện trước" trong bảng).

Nội dung (đúng luật — docs/testing/quy_tac.md):
- Ngũ Tử Kỳ (R-CO-1…3): bàn 13 × 13 giao điểm; mình cầm quân đen, đi trước; Tiểu Mặc cầm trắng. Tới lượt: chạm giao điểm
  trống để đặt quân. 5 quân trở lên liền nhau ngang / dọc / chéo → thắng; đầy bàn chưa ai đủ 5 → hoà. Tiểu Mặc luôn chặn
  hàng 4 — phải tạo hai đường thắng cùng lúc. Hết ván: 5 quân thắng sáng, ván mới bắt đầu, mình lại đi trước.
- Đấu chữ (R-DAU-1, R-DAU-2): ôn bộ thủ đã học ở Rừng trúc, không mở bài mới, không tính tiến độ. Ván 10 câu; mỗi câu một
  bộ thủ + 4 nghĩa, đúng một. Câu lẻ mình chọn, câu chẵn Mặc Ông chọn (nghĩ 1–2 giây). Đúng +1 điểm; hết 10 câu, nhiều
  điểm hơn thắng, bằng điểm hoà. Chưa học bộ nào → chưa chơi được.
- Vào / rời bàn (R-GIAO-1): đứng gần bồ đoàn → nút "Vào bàn"; rời bàn theo cách đang chốt ở R-GIAO-1 (hiện: kéo cần điều
  khiển hoặc bấm Thiền; thiết kế 2026-11-13.27 đề xuất nút "Rời bàn") — ván đang chơi bỏ, không tính.

Luật phải theo: R-GIAO-2 (đứng dưới 2,5 m → nút "Cách chơi"; bảng mở thì nhân vật đứng yên; đóng → về cảnh, đứng chỗ cũ),
R-MAN-1 (ngoài vùng bị che — safe area).
Chuỗi mới: tiêu đề mục (Mục tiêu, Mỗi lượt, Thắng thua, Vào bàn), nội dung 2 trò ở trên, "Đóng", (tuỳ) "Vào bàn".
Dùng lại: token HUD, khung thẻ của bảng nhiệm vụ / thẻ học bộ thủ, HUD trò chơi 2026-11-13.27 (quân cờ, thẻ nghĩa), màu
vàng #d4a64a.
App đang có: web/src/zones/gameGuides.ts (dữ liệu biển + lời giảng tạm) · web/src/ui/guideButton.ts (nút) ·
design/docs/screen_specs.md mục "Trò chơi Kỳ Văn Uyển".
```
