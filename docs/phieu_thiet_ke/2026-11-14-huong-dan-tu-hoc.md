# Phiếu: Bảng hướng dẫn Khu tự học (tầng 2 Tàng Thư Các)
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-14.17
- Đợi bởi: kế hoạch `docs/tasks/2026-11-14-khu-tu-hoc.md` (nhiệm vụ 5 — biển đã dựng, chưa có nút "Hướng dẫn")

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bảng hướng dẫn Khu tự học (Học Xá 3D)

Màn: HUD (lớp phủ trên cảnh 3D) — cùng họ "Bảng cách chơi Kỳ Văn Uyển" (mục 2026-11-13.35, artboard CachChoi-*):
nút nổi trên biển gỗ + bảng đọc lướt.
Cần gì: tầng 2 Tàng Thư Các đã có biển gỗ "Khu tự học" (chữ Việt, sát tường sau phía đông) và 24 bồ đoàn. Người
mới chưa biết ngồi lên bồ đoàn thì mở cuộn sách ôn → cần một bảng hướng dẫn ngắn: khu này để làm gì, cách ngồi,
cuộn sách có gì, vì sao "Học bộ mới" mờ ở đây (học bộ mới ở Rừng trúc), cách đứng dậy.
Mở khi: đứng cách biển dưới 2,5 m (không ngồi, không thoại / bản đồ / màn phủ) → nút nổi trên biển (như "Cách chơi"
R-GIAO-2); bấm → bảng. Đóng: nút "Đóng" / nút quay lại của máy → về cảnh, đứng chỗ cũ; nhân vật đứng yên khi mở.

Trạng thái phải vẽ (dọc 390×844 + ngang 844×390):
- Cảnh: nút nổi trên biển "Khu tự học" (tầng 2, mái + tầng 1 mờ) — nhãn nút cần chốt ("Hướng dẫn"? "Cách dùng"?).
- Bảng: đã học ≥ 1 bộ (bình thường).
- Bảng: chưa học bộ nào — ô báo gợi ý đi Rừng trúc học bộ đầu tiên (như ô báo Đấu chữ chưa học).
- Tuỳ chọn: hình minh hoạ người ngồi bồ đoàn + cuộn sách mở (nhập định, thiết kế 2026-11-14.10).

Luật phải theo (nguyên văn trong docs/testing/quy_tac.md): R-VA-4 (khu tự học: biển, bồ đoàn, ngồi 1 giây → cuộn
sách, "Học bộ mới" mờ "Học ở Rừng trúc"), R-ON-8 (cuộn sách Ngồi ôn: 3 mục, "Đứng dậy"), R-NGOI-1 (nút nổi "Ngồi"),
R-VUNG-1 (trấn không học bộ mới), R-ON-4/R-ON-5 (bộ đến hạn, lượt ôn), R-HANH-3 (nhập định), R-MAN-1.

Đã chốt (người dùng 2026-11-14): nút nổi ở bồ đoàn giữ nhãn "Ngồi" (không "Ngồi ôn"); dòng nơi đang ngồi trên đầu
bảng chọn cuộn sách giữ tên vùng như mọi nơi. Muốn đổi một trong hai → ghi rõ trong thiết kế, sẽ thành kế hoạch riêng.

Chuỗi: "Khu tự học" (có sẵn trên biển 3D); nhãn nút nổi, tiêu đề, các mục, ô báo — chuỗi mới, thêm design/l10n/vi.arb.
Dùng lại: khung "Bảng cách chơi" (kính sương frost, đầu bảng eyebrow + tên, vùng cuộn 4 mục vòng jade đánh số, ô mẹo
chân dung, nút "Đóng"), nút nổi "Cách chơi" (#guide), token HUD.
Gợi ý (không bắt buộc): eyebrow "Tàng Thư Các · Khu tự học"; tên Hán 自習 (chữ Hán mới tự vào bộ font cắt); 4 mục:
Ngồi vào bồ đoàn · Cuộn sách ôn · Học bộ mới ở Rừng trúc · Đứng dậy; ô mẹo lời thủ thư.
App đang có: biển 3D web/src/scene/kien_truc/lau_sach.ts (STUDY_SIGN, dựng bằng gameSign của do_pho.ts — một dòng
chữ Việt, cao ≈ 1,85 m); nút + bảng cách chơi web/src/ui/guideButton.ts, guidePanel.ts, dữ liệu zones/gameGuides.ts
(chỉ cho biển bàn chơi — chưa gắn biển khu tự học).
```
