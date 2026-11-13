# Phiếu: HUD trò chơi khu giao lưu — Ngũ Tử Kỳ + Đấu chữ
- Trạng thái: chờ vẽ
- Đã vẽ: 2026-11-13.27
- Đợi bởi: kế hoạch `docs/tasks/2026-11-13-khu-giao-luu-co-dau-chu.md` (nhiệm vụ 9 — HUD trò chơi, Đấu chữ chơi trọn)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — HUD trò chơi ở khu giao lưu Kỳ Văn Uyển 棋文苑 (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) khi người chơi NGỒI VÀO BÀN — camera nhìn gần như thẳng xuống mặt bàn đá; NPC đứng
phía trên khung (thấy nửa người), hai tay nhân vật mình ở mép dưới. Bàn chiếm gần hết bề ngang màn dọc.
Hai trò, cùng một khung HUD:

1. NGŨ TỬ KỲ 五子棋 (cờ caro 5, bàn 13 × 13) với Tiểu Mặc 小墨 — ĐÃ CHƠI ĐƯỢC, chạm thẳng giao điểm trên bàn 3D.
   Cần: thanh lượt / tỉ số nhỏ (lượt ai: "Lượt đạo hữu" / "Tiểu Mặc đang nghĩ…"; thắng–thua trong phiên, vd 2 : 1);
   nút RỜI BÀN; kết quả ván (hiện đang mượn khung thoại NPC: "Đạo hữu cao tay quá!" … nút "Vâng" → ván mới) —
   vẽ lại cho ra "kết quả ván" hay giữ khung thoại cũng được, tuỳ thiết kế.
2. ĐẤU CHỮ 鬥字 với Mặc Ông 墨翁 — CHƯA CHƠI ĐƯỢC, chờ thiết kế này. Thẻ bộ thủ (vd 木) nằm úp/ngửa giữa bàn 3D.
   Cần: câu hỏi "Bộ 木 nghĩa là gì?" + 4 nghĩa để chọn (nút to, ngón cái chạm được); lượt ai (câu lẻ người, câu
   chẵn Mặc Ông "nghĩ" 1–2 giây rồi chọn — cho thấy Mặc Ông đang chọn / đã chọn gì); đúng / sai (hiện nghĩa đúng
   ~1 giây); tiến độ câu 3 / 10; điểm hai bên; kết quả cuối ván; nút RỜI BÀN.

Mở khi: ngồi vào bàn (nút Ngồi khi đứng cạnh bàn). Ẩn khi đứng dậy (kéo joystick / bấm lại Ngồi = rời bàn, ván bỏ).

Trạng thái phải vẽ:
- Dọc 390×844 (chính) và ngang 844×390.
- Ngũ Tử Kỳ: lượt người · NPC đang nghĩ · thắng · thua · hoà.
- Đấu chữ: lượt người đang chọn · đã chọn đúng · đã chọn sai (hiện nghĩa đúng) · lượt Mặc Ông đang nghĩ ·
  Mặc Ông chọn xong · cuối ván (thắng / thua / hoà, 4 : 3…) · chưa học bộ nào (Mặc Ông bảo tới Rừng trúc).
- Cùng lúc với: nút hành động (Nhảy / Chào / Thiền — đang ở trạng thái "Đang thiền"), joystick, khung thoại NPC —
  nút Nhảy / Chào có nên ẩn khi ngồi chơi không?

Luật phải theo (nguyên văn trong docs/testing/quy_tac.md):
- R-GIAO-1: … Đang ngồi chơi: chạm màn hình là chạm vào bàn (không đi tới chỗ chạm); kéo cần điều khiển hoặc bấm
  Ngồi lần nữa → đứng dậy, ván đang chơi bỏ (không tính), bàn dọn sạch.
- R-CO-1: bàn 13 × 13 giao điểm. Người cầm quân đen, đi trước; NPC cầm trắng. … chạm lúc NPC đang nghĩ → không có gì.
  ≥ 5 quân liền ngang / dọc / chéo thắng; bàn đầy hoà.
- R-CO-2: NPC đáp sau khoảng 0,5–1 giây …
- R-CO-3: Hết ván → 5 quân thắng sáng lên, Tiểu Mặc nói một câu … Đóng → bàn dọn sạch, ván mới, người lại đi trước.
- R-DAU-1: Đấu chữ chỉ ôn bộ thủ đã học: 10 câu; mỗi câu một bộ thủ đã học + 4 nghĩa khác nhau, đúng 1 nghĩa. Không mở
  thẻ học, không ghi tiến độ. Chưa học bộ nào → Mặc Ông nói "Con hãy tới Rừng trúc tu luyện trước, học vài bộ thủ rồi
  lại đây đấu với lão." và ván không bắt đầu.
- R-DAU-2: câu 1, 3, 5, 7, 9 người chọn; câu 2, 4, … 10 Mặc Ông "nghĩ" 1–2 giây rồi chọn (đúng ~70 %). Đúng 1 điểm.
  Sau mỗi câu hiện nghĩa đúng ~1 giây. Hết 10 câu: điểm cao hơn thắng, bằng điểm hoà.
- R-DIEU-1: chạm 45% bên trái = joystick → khi ngồi chơi, nút / lựa chọn ở đâu để không đụng vùng joystick?
- R-MAN-1: chữ và nút của HUD luôn nằm ngoài vùng bị che (safe area).

Chuỗi mới (thêm design/l10n/vi.arb): "Rời bàn", "Lượt đạo hữu", "Tiểu Mặc đang nghĩ…", "Mặc Ông đang nghĩ…",
"Bộ {chữ} nghĩa là gì?", "Câu {n} / 10", "Đúng rồi!", "Chưa đúng — {nghĩa}", "Thắng", "Thua", "Hoà".
Dùng lại: token màu / bo góc / frost của HUD (design/tokens/design_tokens.json), khung thoại NPC + chân dung
(phiếu 2026-11-13-hoi-thoai-npc), nút hành động (2026-11-13.9).
Gợi ý (không bắt buộc): 4 nghĩa thành 2 × 2 ô giấy gạo ở nửa dưới màn, trên vùng tay nhân vật; điểm hai bên như
"thẻ bài" nhỏ hai góc trên (chân dung NPC góc trái, mình góc phải); Ngũ Tử Kỳ chỉ cần một dải mỏng trên cùng để không
che bàn.
App đang có: web/src/gamePlay.ts (ngồi bàn, lượt, camera), web/src/games/{gomoku,charDuel}.ts (luật), mặt bàn 3D
web/src/scene/gameTable.ts, khung thoại web/src/ui/dialogBox.ts. Ảnh: design/screens/Ky-van-uyen-*.png.
```
