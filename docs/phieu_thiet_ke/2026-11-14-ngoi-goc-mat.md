# Phiếu: Ngồi — nhìn từ mắt nhân vật, hai bàn tay + cuộn sách 3D có mục chạm được
- Trạng thái: đã áp (2026-11-14.21)
- Đã vẽ: 2026-11-14.21
- Đợi bởi: kế hoạch `docs/tasks/2026-11-14-ngoi-goc-mat.md` (nhiệm vụ 12, 13). Quyết định đã duyệt 2026-11-14 (Q1-C,
  Q2-A, Q3-B, Q4-A, Q5-A, Q6-A).

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Ngồi: nhìn từ mắt nhân vật (ngôi 1), hai bàn tay + cuộn sách 3D có mục (Học Xá 3D)

Màn: khung cảnh 3D ngôi thứ nhất lúc NGỒI (vật 3D code dựng + chữ vẽ lên giấy cuộn) — THAY bảng chọn cuộn treo Flutter
của mục 2026-11-14.10 "Ngồi ôn". Áp cho mọi kiểu ngồi.

Cần gì: ngồi xuống thì camera vào mắt nhân vật: thấy hai bàn tay (tay áo cùng màu áo) và thứ đang cầm / trước mặt.
Ngồi ôn: hai tay cầm cuộn sách mở; các mục (Ôn bộ đến hạn, Học bộ mới, Xem bộ đã học, Đứng dậy) IN TRÊN GIẤY CUỘN, chạm
thẳng lên chữ; tay phải trỏ vào mục được chạm. Người ngoài nhìn vẫn thấy nhân vật ngồi như cũ (không vẽ phần này).
Mở khi: ngồi (Ngồi ôn tại chỗ — nút C; bồ đoàn khu tự học; án thư / bàn trà / đôn / sập / ghế lan can; ghế bàn chơi).
Đóng khi: đứng dậy (Đứng dậy trên cuộn, joystick, nút Đang ôn, Esc, Rời bàn).

Hình 3D đã có trong code (vẽ chữ / mục LÊN đó; chụp nền bằng Canvas 3D ?dang=ngoi-mat khi code đợt 1 xong):
- Mắt ngồi ~1,35 m trên chân, FOV dọc 55° (màn dọc chỉ ~27° ngang). Cuộn đặt vừa khung: dọc → giấy rộng ~88 % bề ngang,
  giữa-dưới màn; ngang → giấy cao ~70 %, lệch phải, cảnh bên trái. Giấy ngửa về mắt ≤ 20°, hơi phối cảnh (chữ ở mép xa
  nhỏ hơn mép gần ~10 %).
- Cuộn tay 手卷 mở ngang: 2 trục gỗ đứng scroll-wood, đầu trục jade viền gold, giấy map-paper (như cuộn trên tay hiện
  nay, phóng to). Tỉ lệ giấy hiện 0,26 × 0,18 (≈ 13:9) — được đổi tỉ lệ nếu cần chỗ cho chữ (ghi rõ).
- Hai tay khối low-poly: ống tay áo loe 6 cạnh + viền cổ tay, bàn tay hộp vát, ngón cái, ba ngón gộp, ngón trỏ riêng.
  Không bóng đổ, Lambert.

Trạng thái phải vẽ — mỗi trạng thái DỌC 390×844 và NGANG 844×390:
1. Ngồi ôn — bảng chọn trên cuộn, ở trấn (Văn Uyên Tông): "Ôn bộ đến hạn (2)" nổi bật, "Học bộ mới" mờ "Học ở Rừng trúc",
   "Xem bộ đã học", "Đứng dậy". Biến thể: Rừng trúc (Học bộ mới nổi bật) · chưa học bộ nào (3 mục mờ + dòng gợi ý) · đủ 50.
2. Ngồi ôn — vừa chạm một mục: mục sáng nhấn, ngón trỏ tay phải chạm vào mục (khung trước khi màn ôn / thẻ mở).
3. Ngồi ôn — nhịp mở: 0,3 s hai trục chập giữa trong hai tay → 1 s giấy mở hết, mục hiện (mờ → rõ). Nhịp "Đứng dậy":
   chữ mờ → tay chập trục → camera lùi ra.
4. Xem bộ đã học — giữ màn Flutter "Bộ đã học" (đã có thiết kế) đè lên: chỉ vẽ khung chuyển từ cuộn sang màn và lúc
   đóng màn quay về cuộn.
5. Đang học / đang ôn (màn Flutter mở đè): cuộn giữ mở trong tay phía sau; vẽ khung lúc đóng màn → cuộn hiện lại ngay
   (không chạy lại nhịp 1 s), mục vừa dùng cập nhật (vd. "Hôm nay đã ôn xong").
6. Khu tự học tầng 2 Tàng Thư Các: như 1 nhưng cảnh nội thất, hàng bồ đoàn phía trước, "Học bộ mới" mờ.
7. Án thư / bàn trà / đôn / sập / ghế lan can: KHÔNG có mục. Hai tay đặt trên bàn (lan can / gối); đề xuất vật cầm trang
   trí (đã chốt): chén trà trong tay phải (bàn trà, đôn, sập), sách mở trên án (án thư) — chỉ để nhìn, không chạm được.
   Code đã dựng bằng khối — vẽ lại hình / màu nếu muốn. Vẽ: bàn trà trà lâu, án thư Tàng Thư Các,
   ghế lan can trà lâu nhìn ra núi.
8. Bàn cờ Ngũ Tử Kỳ (đã chốt) "cúi nhìn bàn" ~70°, bàn 13×13 vừa bề ngang màn, hai tay áo ở mép dưới; tay
   phải cầm quân đưa tới giao điểm. Vẽ cùng HUD đang có (Rời bàn, tỉ số, viên lượt — thiết kế 2026-11-13.27) để thấy
   tay không đè HUD.
9. Đấu chữ (đã chốt): hai tay cầm mép thẻ bộ thủ trên bàn; HUD câu hỏi + 4 nghĩa giữ như 2026-11-13.27.
10. Nhìn quanh: đang kéo lệch 60° sang phải (cuộn trôi ra mép trái màn); gợi ý lần đầu (nếu cần) "Kéo để nhìn quanh".
    Không có nút quay về nhìn từ ngoài khi ngồi (đã chốt).
Mỗi khung ghi rõ: vùng chạm của từng mục trên giấy (≥ 44 px trên màn nhỏ nhất 360×640 — mép xa của giấy nghiêng cũng
phải đạt), cỡ chữ trên giấy tính ra px màn.

Luật phải theo (nguyên văn trong docs/testing/quy_tac.md — đang có): R-DIEU-7, R-ON-8, R-NGOI-1, R-VA-4, R-GIAO-1, R-DAU-2,
R-CO-3, R-HANH-3, R-ON-5, R-VUNG-1, R-MAN-1, R-BANDO-1. Đã sửa theo kế hoạch docs/tasks/2026-11-14-ngoi-goc-mat.md (chờ xác nhận):
- R-DIEU-7: ngồi → camera vào mắt trong ~0,4 s; không thấy đầu / thân mình; kéo nhìn quanh ±60° ngang, ngẩng ≤ 20°, cúi
  ≤ 70°; thả 1 s → nhìn lại tài liệu trong ~0,6 s; ngồi không zoom; đứng dậy → về đúng góc cũ.
- R-ON-8: mục in trên giấy cuộn (không còn bảng chồng lên cảnh); chạm thẳng chữ → tay trỏ → mở; mục mờ chạm không mở;
  kéo = nhìn quanh, không chọn; "Đứng dậy" cuối giấy; cảnh KHÔNG tối 16 % nữa (nếu cần độ tương phản cho chữ → đề xuất).
- R-NGOI-1 / R-VA-4: án thư, bàn trà, đôn, sập, lan can — nhìn từ mắt, hai tay đặt trên bàn / lan can, không mục.
- R-GIAO-1: bàn chơi "cúi nhìn bàn" từ mắt mình, hai tay ở mép dưới, chạm = chạm bàn.

Chuỗi có sẵn (design/l10n/vi.arb — giữ nguyên chữ): reviewScroll, reviewScrollSeal, reviewDue, reviewDueSub,
reviewDueDone, reviewDueNone, reviewDueNothing, learnNew, learnNewNext, learnAtForest, learnAllDone, learnAllDoneBanner,
viewLearned, viewLearnedSub, viewLearnedNone, hintGoForest, standUp, learned* (màn Bộ đã học).
Chuỗi mới cần đặt (nếu dùng): gợi ý "Kéo để nhìn quanh"; nhãn trợ năng cho từng mục trên cuộn (đọc màn hình — cuộn 3D
không có nút DOM, code thêm nút ẩn đọc được).

Dùng lại: thành phần bảng chọn cuộn treo 2026-11-14.10 (đầu cuộn, ấn son 溫故, vạch chấm vàng, 3 trạng thái mục nổi bật /
thường / mờ nét đứt + biểu tượng lý do, khung gợi ý jade 8 %) — chuyển lên giấy cuộn tay; token scroll-wood, map-paper,
jade, gold, lacquer, slate, #5E6A70. Màu tay áo: màu áo đệ tử chibi (DE_TU) — đề xuất token nếu cần (vd. robe-sleeve,
skin).

Gợi ý (không bắt buộc): giấy cuộn tay có thể chia cột kiểu sách dọc cổ nhưng chữ Việt đọc ngang; mục trên giấy giống "dòng
mực" hơn nút bóng; ngón trỏ chạm mục để lại vệt mực / ánh vàng nhẹ; tay trái giữ trục, tay phải thả ra khi trỏ.

App đang có:
- web/src/scene/cuonSach.ts + cuonSachNhip.ts — cuộn trên tay trước ngực (ngôi 3), nhịp 0,3 → 1 s.
- web/src/scene/nhapDinh.ts — vòng sáng dưới đệm.
- app/lib/lesson/study_screen.dart, study_parts.dart — bảng chọn cuộn treo Flutter (SẼ THÔI DÙNG).
- app/lib/lesson/learned_screen.dart — màn Bộ đã học; review_screen.dart, radical_screen.dart — màn ôn / thẻ bộ thủ.
- web/src/gamePlay.ts placeCamera — camera bàn chơi nhìn xuống 75° từ sau lưng; web/src/ui/gameHud.ts — HUD trò chơi.
- web/src/input/orbitCamera.ts — camera ngồi hiện tại (lùi 5,5 m, sau vai phải 45°).
```
