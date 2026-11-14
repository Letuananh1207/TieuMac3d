# Phiếu: Trò chuyện kênh chung — ô nhập, khung kênh chung, bong bóng trên đầu nhân vật
- Trạng thái: đã áp (2026-11-14.1)
- Đã vẽ: 2026-11-14.1
- Đợi bởi: kế hoạch `docs/tasks/2026-11-14-tro-chuyen-kenh-chung.md` (nhiệm vụ 6, 7)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Trò chuyện kênh chung (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) — thêm 3 thành phần, vẽ trên HUD-doc 390×844 và HUD-ngang 844×390.
Cần gì: người chơi gõ một câu ngắn lên "kênh chung" của tông môn; câu đó hiện thành bong bóng thoại trên đầu nhân
vật (kiểu game nhập vai online) và thành một dòng trong khung kênh chung. Hiện chưa có máy chủ nên chỉ mình người
chơi (và có thể NPC nói câu có sẵn) — nhưng thiết kế như có nhiều người.

1) Nút mở chat + ô nhập
- Nút nhỏ (biểu tượng bong bóng / bút lông) luôn có trên HUD khi đi lại; ẩn khi đang mở bài học, đang thoại NPC,
  đang chơi bàn cờ.
- Bấm → ô nhập một dòng + nút "Gửi"; bàn phím điện thoại bật lên (ô nhập phải nằm ngay trên bàn phím).
- Giới hạn 60 ký tự — cần trạng thái gần hết / đủ (đếm ký tự hay chỉ chặn — thiết kế chọn).
- Gửi xong: ô nhập đóng hay giữ mở để gõ tiếp? (thiết kế chọn, ghi rõ). Gửi dồn quá nhanh (dưới 1,5 giây) → nút Gửi mờ.
- Máy tính: Enter mở / gửi, Esc đóng.

2) Khung kênh chung
- Danh sách tin gần nhất (tối đa 50): tên người nói (người chơi: "Đạo hữu" hoặc tên nhân vật; NPC: tên + chữ Hán,
  vd. Tiểu Mặc · 小墨), nội dung; phân biệt tin của mình / của người khác / NPC.
- Thu gọn (chỉ 2–3 dòng cuối mờ dần, không chặn chạm vào cảnh) và mở rộng (cuộn được).
- Trạng thái: rỗng ("Chưa ai lên tiếng…" — chuỗi gợi ý), vài tin, đầy (cuộn), tin dài 60 ký tự.

3) Bong bóng thoại trên đầu
- Neo trên đầu nhân vật nói, đi theo nhân vật; hiện 6 giây rồi mờ đi; tin mới thay tin cũ của cùng người.
- Tối đa 60 ký tự → tối đa khoảng 2–3 dòng; có đuôi chỉ xuống đầu nhân vật.
- Nhân vật xa (trên 25 m) hoặc sau camera → không hiện. Nhiều bong bóng gần nhau → xử lý chồng (thiết kế gợi ý).
- Trạng thái: câu ngắn 1 từ, câu 60 ký tự, chữ Hán lẫn tiếng Việt, bong bóng của NPC vs của mình.

Luật phải theo (nguyên văn docs/testing/quy_tac.md):
- R-DIEU-1: joystick ở vùng trái màn — ô nhập / khung kênh chung không được chặn joystick khi đang đi lại.
- R-MAN-1: nút và chữ nằm ngoài vùng bị che (safe area).
- R-NPC-2: đang thoại với NPC thì khung thoại NPC ở đáy màn — chat phải ẩn lúc đó.
- (mới, đang soạn) R-CHAT-1..3: tối đa 60 ký tự, bỏ khoảng trắng thừa, tin rỗng không gửi, cách nhau ≥ 1,5 giây;
  bong bóng 6 giây, tin mới thay tin cũ; khung giữ 50 tin gần nhất trong phiên.

Chuỗi mới (design/l10n/vi.arb): "Gửi", gợi ý ô nhập (vd. "Nói gì đó với đồng môn…"), tên kênh ("Kênh chung" /
"Tông môn" — thiết kế chọn), chuỗi rỗng ("Chưa ai lên tiếng…"), nhãn người chơi ("Đạo hữu" / "Ta").
Dùng lại: token HUD (frost, bo góc, Be Vietnam Pro / Lora / Han Serif); bong bóng ô mẹo NPC (`CachChoi-*`,
components.md) gần với bong bóng trên đầu; khung thoại NPC (phiếu 2026-11-13-hoi-thoai-npc).
App đang có: chưa có chat. Thành phần gần nhất: nút học nổi neo theo vật web/src/ui/learnButton.ts (bong bóng sẽ
neo theo đầu nhân vật cùng cách), khung thoại NPC web/src/ui/dialogBox.ts.
```
