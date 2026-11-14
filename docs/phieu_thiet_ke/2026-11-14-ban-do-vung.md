# Phiếu: Bản đồ vùng — bản đồ nhỏ góc màn + bản đồ lớn cả cảnh
- Trạng thái: chờ thiết kế
- Đã vẽ: 2026-11-14.20
- Đợi bởi: kế hoạch `docs/tasks/2026-11-14-ban-do-vung.md` (nhiệm vụ 5–9)

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Bản đồ vùng: bản đồ nhỏ + bản đồ lớn (Học Xá 3D)

Màn: HUD (lớp nổi trên cảnh 3D) — thêm 2 thành phần, vẽ trên HUD-doc 390×844 và HUD-ngang 844×390.
Cần gì: ở mọi cảnh (Khởi Nguyên Trấn, Nhà của ta, 6 vùng) người chơi biết mình đang ở đâu và các chỗ quan trọng ở hướng
nào. Bản đồ do code TỰ VẼ từ đặc tả cảnh (design/scene/*.json — toạ độ nhà, khu, tường, cổng, vòng trận…), không phải
ảnh vẽ tay → thiết kế cần chốt NÉT VẼ + BIỂU TƯỢNG + CHỖ ĐẶT, áp được cho cảnh nào cũng được. Chất liệu: giấy cổ, nét
mực — cùng họ với bản đồ truyền tống (BanDo-giay), nhưng đây là MẶT BẰNG MỘT CẢNH nhìn từ trên xuống, không phải lục địa.

1) Bản đồ nhỏ (luôn hiện khi đi lại)
- Tròn, góc TRÊN TRÁI (góc trên phải đã có ví Văn tiền). Thiết kế chọn cỡ (gợi ý 96–112) + chỗ: dọc trái 16, trên
  safe + 10 · ngang trái safe + 12, trên 12. Phải để ý: chỗ này trùng viên nhắc chế độ trang trí (Nhà của ta) và khung
  chat ngang lúc gõ — lúc đó bản đồ nhỏ ẩn nên không cần tránh.
- Trong vòng: mặt bằng quanh mình ~30 m, tâm luôn là nhân vật; MŨI TÊN ở giữa = mình, chỉ hướng nhân vật quay mặt.
- Bản đồ XOAY THEO CAMERA (hướng camera nhìn luôn ở phía trên — người dùng đã chốt); viền có dấu 北 chạy theo để biết
  bắc ở đâu.
- Vòng trận / cổng sang cảnh ở ngoài tầm → dấu nhỏ ở MÉP vòng chỉ về phía đó (thiết kế kiểu dấu).
- Không ghi tên khu trên bản đồ nhỏ (luật R-HUD-1 / R-HUD-3: màn không báo tên khu — chỉ bản đồ lớn được).
- Đang ở tầng 2 → nhãn nhỏ "Tầng 2" gắn vào bản đồ nhỏ (thiết kế chọn chỗ).
- Chạm cả vòng → mở bản đồ lớn; trạng thái đang nhấn. Vùng chạm ≥ 44. Có thể cần một gợi ý nhỏ "chạm để mở" lần đầu
  (thiết kế quyết có hay không).
- Ẩn khi: màn tải, bản đồ truyền tống, bản đồ lớn mở, bài học / màn phủ, thoại NPC, ngồi bàn chơi, đang gõ chat, chế
  độ trang trí, VÀ KHI ĐANG NGỒI (ghế, bàn trà, thiền, Ngồi ôn, bồ đoàn — người dùng đã chốt). Đứng dậy → hiện lại.

2) Bản đồ lớn (chạm bản đồ nhỏ → mở; phím M trên máy tính)
- Phủ cảnh (cảnh tối phía sau như bản đồ truyền tống, hoặc kiểu khác — thiết kế chọn). Cả cảnh vừa khung, BẮC LÊN TRÊN,
  có la bàn 北. Không chụm / kéo ở đợt này.
- Mũi tên / ghim "đang ở đây" ở chỗ nhân vật, chỉ hướng quay mặt (có thể dùng ghim đầu nhân vật của bản đồ truyền tống
  ban-do-nhan-vat.png + mũi tên — thiết kế chọn).
- Tên cảnh ở đầu (vd. "Khởi Nguyên Trấn 起源鎮", "Nhà của ta 我家"); TÊN CÁC KHU trên mặt bằng (tên Việt, có thể kèm chữ Hán
  của khu — thiết kế chọn; bản đồ truyền tống đã bỏ chữ Hán trên giấy, cân nhắc cho đồng bộ).
- Tên nhà, tên nơi đến của cổng sang cảnh ("→ Nhà của ta", "→ Khởi Nguyên Trấn"), tên chỗ (bàn cờ, Đấu chữ, Tạp hoá,
  Khu tự học · tầng 2…). Nhãn chồng nhau thì code bỏ bớt theo ưu tiên: khu > nơi đến cổng > nhà > chỗ — thiết kế ghi rõ
  cỡ chữ từng cấp.
- Có chú giải (legend) biểu tượng không? (thiết kế chọn — nếu có thì ở đâu ở dọc / ngang.)
- Chạm lên bản đồ KHÔNG đưa nhân vật đi đâu (đợt này). Đóng: nút "Đóng" (dùng lại kiểu nút "Đóng bản đồ"), nút quay lại
  của máy, phím M / Esc. Đang mở: nhân vật đứng yên, joystick + cụm nút + chat + ví ẩn (hay giữ ví — thiết kế chọn).

3) Nét vẽ (một bộ cho cả hai bản đồ — code vẽ bằng Canvas 2D theo đúng số đo thiết kế ghi)
- Nền giấy (map-paper) + hoạ tiết giấy nhẹ (nếu có: vẽ bằng code được, không ảnh lớn); mép đất / vực của cảnh vùng (đất
  đổ xuống biển mây) — vẽ ra sao.
- Nét mực cho: tường bao + tường đoạn (chừa khe cổng), lối lát, nước (ao / hồ / mương), cầu; chân nhà (hình chữ nhật
  đúng hướng — tô ra sao: nhà thường / nhà đang ở bên trong tô đậm).
- Khu (site.areas là hình chữ nhật, có khu chồng nhau): có tô mảng màu nhạt theo khu không, hay chỉ có chữ?
- Ghi rõ: màu mực (gợi ý dùng mực nâu của bản đồ truyền tống rgba(58,48,36,…)), độ dày nét theo cấp, độ mờ.

Trạng thái phải vẽ (luôn có dọc 390×844 + ngang 844×390):
- Bản đồ nhỏ trên HUD đi lại — cảnh LỚN: Khởi Nguyên Trấn, đứng ở Quảng Trường (0; 12) nhìn về bắc.
- Bản đồ nhỏ — cảnh NHỎ: Nhà của ta, đứng ở Sân trước gần vòng trận (−10; −1,5) → gần như thấy cả nhà.
- Bản đồ nhỏ khi vòng trận ở ngoài tầm (dấu ở mép).
- Đang ở TRONG NHÀ: trong Tàng Thư Các tầng 1 (nhà tô đậm) và TẦNG 2 (thêm nhãn "Tầng 2").
- Bản đồ nhỏ đang nhấn.
- Đang ngồi (ghế / bàn trà / thiền / bồ đoàn) → bản đồ nhỏ ẩn (chỉ cần ghi chú trên artboard, không cần vẽ riêng).
- Bản đồ lớn Khởi Nguyên Trấn (dọc + ngang): 8 khu, 3 nhà, vòng trận, lối xuống núi về nhà, 2 bàn chơi, Tạp hoá, khu tự học
  tầng 2, chỗ ngồi ôn, bảng nhiệm vụ 日課榜.
- Bản đồ lớn Nhà của ta (dọc): 3 khu, 1 nhà, vòng trận, cổng về trấn.
- Bản đồ lớn một cảnh vùng dài (Tử Cấm Thành ≈ 120 × 176 m, 9 khu) — để thấy chữ nhiều nhất / chồng nhãn.
- Nhãn khu dài nhất + khu chồng nhau.
Số liệu thật để vẽ (đặc tả cảnh, bắc = −z ở trên, tây = −x bên trái, mét):
- Khởi Nguyên Trấn: khu Truyền Tống Đài [17,−10]→[41,10] · Cổng Trấn [−26,17]→[8,41] · Quảng Trường [−17,−17]→[17,17] ·
  Kỳ Văn Uyển [−51,−11]→[−17,17] · Thiên Bậc [−6,−52]→[6,−19] · Thượng Trấn [−14,−67]→[14,−52] · Hậu Sơn [32,−88]→[56,−60] ·
  Tàng Thư Các [−51,−32]→[−17,−11]. Nhà: Trà lâu (Phẩm Minh Các), Tàng Thư Các (2 tầng), Tạp hoá. Vòng trận (30; 0).
  Lối xuống núi về nhà (cổng đi bộ) quanh (0; 45) (V-23 — thay ngõ cũ (−22; 36)). Bàn cờ (−34; 4), Đấu chữ (−34; 11).
- Nhà của ta: Chính phòng [−5,25,−11]→[5,25,−5] · Vườn [6,5,−14]→[16,12] · Sân trước [−16,−14]→[6,5,12]; vòng trận
  (−10; −1,5); cổng về trấn (0; 14).
- Toạ độ đầy đủ: `cd web && npm run scene:check` (in toạ độ nhà / vùng / tường) hoặc design/scene/*.json.

Biểu tượng cần vẽ (cỡ nhỏ trên bản đồ nhỏ ~14–18, trên bản đồ lớn ~20–24 — thiết kế chốt; nét mực trên đĩa giấy):
- Mũi tên "mình" (+ ghim bản đồ lớn nếu khác).
- Vòng trận truyền tống (cùng họ biểu tượng vòng trận ở bản đồ truyền tống).
- Cổng sang cảnh (lối xuống núi / cửa đi bộ sang cảnh khác).
- Bàn cờ Ngũ Tử Kỳ 五子棋 · bàn Đấu chữ 鬥字 (hai biểu tượng hay một biểu tượng "bàn chơi" — thiết kế chọn).
- Tạp hoá (tiệm). Khu tự học 自習 / chỗ ngồi ôn (bồ đoàn, án thư — một hay hai biểu tượng). Bảng nhiệm vụ 日課榜.
- Dấu mép (chỉ hướng vòng trận / cổng ngoài tầm). La bàn 北.
- (tuỳ) cổng tường / sơn môn, giếng, cầu.

Luật phải theo (nguyên văn docs/testing/quy_tac.md):
- R-HUD-1: Góc trên màn hình không có chip tên nơi / tên khu và không có nút đổi góc nhìn (bỏ 2026-11-13). Camera chỉ có
  một góc chuẩn: sau lưng, sát nhân vật (đặc tả cảnh camera.near); vẫn kéo để xoay, chụm 2 ngón để zoom. Màn không báo
  tên khu ở đâu cả (R-HUD-3), trừ bản đồ lớn (R-BANDO-2).  [đã sửa 2026-11-14]
- R-DIEU-1: Ngón tay chạm vào 45% bên trái màn hình thì thành joystick (mỗi lúc một joystick); chạm chỗ khác thì kéo để
  xoay camera, hai ngón thì chụm để zoom. Chuột không dùng joystick. Chạm trúng bản đồ nhỏ (R-BANDO-1) không thành
  joystick. [đã thêm 2026-11-14] (bản đồ nhỏ nằm trong 45 % trái — không được chiếm chỗ ngón cái kéo joystick, nên ở trên).
- R-MAN-1: App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống; chữ
  và nút của HUD luôn nằm ngoài vùng bị che.
- R-NPC-2: đang thoại NPC thì khung thoại ở đáy màn — bản đồ nhỏ ẩn lúc đó.
- (mới, đã duyệt 2026-11-14 — sổ quy tắc, Xác nhận "chờ") R-BANDO-1…5:
  1 bản đồ nhỏ tròn góc trên trái ở mọi cảnh, ẩn khi màn tải / bản đồ truyền tống / bản đồ lớn / màn phủ / thoại /
    bàn chơi / gõ chat / trang trí / đang ngồi (ghế, bàn trà, thiền, Ngồi ôn, bồ đoàn); chạm trúng không thành joystick.
  2 nội dung vẽ từ đặc tả: mép đất, nước, lối, tường + khe cổng, chân nhà, vòng trận, cổng sang cảnh (bản đồ lớn ghi nơi
    đến), bàn chơi, Tạp hoá, khu tự học, chỗ ngồi ôn (một dấu mỗi nhà / tầng), bảng nhiệm vụ; KHÔNG NPC, người khác, cây
    lẻ, ô trang trí; bản đồ lớn thêm tên khu + tên nhà.
  3 mũi tên ở chỗ nhân vật, chỉ hướng quay mặt; bản đồ nhỏ tâm = mình, ~30 m, xoay theo camera; vòng trận / cổng ngoài
    tầm → dấu ở mép; bản đồ lớn bắc lên trên, cả cảnh.
  4 trong nhà → nhà đó tô đậm; tầng 2 → nhãn "Tầng 2"; chỗ ở tầng 2 ghi "· tầng 2" trên bản đồ lớn.
  5 chạm bản đồ nhỏ / phím M → bản đồ lớn; nhân vật đứng yên; chạm lên bản đồ không đi tới; đóng bằng "Đóng" / nút quay
    lại của máy / M / Esc.

Chuỗi có sẵn: tên cảnh + tên khu + chữ Hán khu (đặc tả cảnh site.name / site.han / site.areas[].name / .han), tên nhà
(buildings[].title), "Đóng bản đồ" (mapClose), "Khu tự học" + 自習, "Tạp hoá" 雜貨, "Ngũ Tử Kỳ" 五子棋, "Đấu chữ" 鬥字,
"Nhà của ta" 我家, 日課榜.
Chuỗi mới cần đặt (design/l10n/vi.arb, thiết kế đặt tên + chữ): nhãn trợ năng bản đồ nhỏ (vd. "Bản đồ — chạm để mở"),
tiêu đề bản đồ lớn nếu có (vd. "Bản đồ" / "Địa đồ 地圖"), nút đóng (dùng lại mapClose hay chuỗi riêng "Đóng"), "Tầng 2",
tiền tố nơi đến của cổng (vd. "→ {nơi}" / "Đường về {nơi}"), nhãn "· tầng 2", nhãn chú giải (nếu có), gợi ý lần đầu (nếu có).

Dùng lại: token map-paper (#F2EADA), scroll-wood, slate, slate-muted, jade, gold, lacquer; mực nâu bản đồ truyền tống
(design/scene/ban-do/ve-ban-do.html: rgba(58,48,36,…)); kính sương frost* + frost-outline của HUD; nút "Đóng bản đồ"
(viên thuốc kính .92, × 18 + chữ 15/700); ghim đầu nhân vật ban-do-nhan-vat.png; font Be Vietnam Pro / Lora / Noto
Serif SC; components.md mục HUD hướng C.
Gợi ý (không bắt buộc): viền bản đồ nhỏ như đồng xu / ngọc bội (vành gold mảnh + kính) cho hợp ví; bản đồ lớn có thể là
tờ giấy trên cuộn (hai trục scroll-wood như bản đồ truyền tống) để người chơi nhận ra "đây là bản đồ"; vẽ ít — mặt bằng
nét mảnh, chỉ chỗ quan trọng có biểu tượng.

App đang có gì:
- Chưa có bản đồ cảnh. Có bản đồ truyền tống (chọn vùng): cuộn giấy 3D web/src/scene/banDo.ts + HUD web/src/ui/mapHud.ts,
  giấy là ảnh design/scene/ban-do/ban-do-goc.png (lục địa, không dùng được cho mặt bằng cảnh).
- HUD góc màn hiện có: ví Văn tiền góc trên phải (web/src/ui/wallet.ts); góc trên trái TRỐNG khi đi lại; dưới trái
  joystick; dưới phải cụm Nhảy / Chào / Ngồi thiền + nút Trò chuyện; khung chat thu gọn trên joystick (trái, dưới 184);
  viên nhắc trang trí trên trái (chỉ khi trang trí ở Nhà của ta).
- Code sẽ dựng dữ liệu bản đồ (lớp thuần web/src/zones/areaMap.ts) trước khi có thiết kế; thiết kế chỉ quyết nét vẽ,
  biểu tượng, chỗ đặt, chữ.
```
