# Cuộn Ngồi ôn thành bảng chọn lưới ô (V-20261114-45)
- Yêu cầu: "tôi muốn nội dung cuộn ra thì chiều ngang phải dài hơn bây giờ và nó giống 1 cái bảng lựa chọn làm gì và các
  chức năng hơn là hiện tại ví dụ: đọc sách,..." — người dùng đã chốt: bố cục **lưới ô** (cuộn trải ngang rộng, ô vuông
  có hình + tên, "Đứng dậy" ở góc); mục **Đọc sách** + **Xem bộ đã học** + chừa chỗ mục sau; **bỏ "Ôn bộ đến hạn" và
  "Học bộ mới" khỏi cuộn — học / ôn chuyển chỗ khác** (đã được nhắc "Học bộ mới" trên cuộn ở Rừng trúc là cách duy nhất).
- Loại: sửa hành vi + giao diện (cuộn) + thêm (chỗ học bộ mới ở Rừng trúc) · Cỡ: lớn · Trạng thái: đã duyệt 2026-11-16 (theo đề xuất: A Trúc Lão + ô Nhiệm vụ hôm nay) — chờ V-79 (L-12) gộp rồi làm
- Phiếu thiết kế: `docs/phieu_thiet_ke/2026-11-15-cuon-bang-chon.md` (nháp — chờ duyệt kế hoạch)

## 1. Học bộ mới ở đâu (Rừng trúc)

Ràng buộc đang có: R-VUNG-1 (cảnh của chung, không đặt vật học theo tiến độ), R-VUNG-2 (chạm cảnh không mở bài), trấn
không học bộ mới. Rừng trúc hiện `npcs: []`, khu: Cửa rừng (vòng trận (0; 39), rào z = 31 có lối −3,7 … 0,7), Trúc Xá,
Lối trúc, Vọng Trúc Đài…

| | A. Thầy **Trúc Lão** ở Cửa rừng (đề xuất) | B. Giá thẻ tre / bia bộ thủ + nút nổi "Học bộ mới" | C. Bồ đoàn học ở Trúc Xá (ngồi → cuộn học) |
|---|---|---|---|
| Cách chơi | Nói chuyện (R-NPC-2) → lựa chọn "Học bộ mới — bộ trúc", "Ôn bộ đến hạn (n)", "Tạm biệt" → thẻ bộ thủ; đóng thẻ → thoại mở lại với bộ kế | Đứng gần giá thẻ tre ở Trúc Xá → nút nổi (kiểu "Hướng dẫn" R-VA-5) → thẻ bộ thủ | Ngồi bồ đoàn riêng ở Trúc Xá → cuộn khác chỉ có "Học bộ mới" |
| Dựng lại được gì | khung thoại + nút "Nói chuyện" + lựa chọn có `action` (như thủ thư `librarianDialog`, Tiểu Mặc `action: 'daily'`) — **không cần HUD mới**; thẻ `openRadical` có sẵn | nút nổi kiểu "Hướng dẫn" có sẵn; cần prop giá thẻ tre mới (`/canh`) | bồ đoàn + nút "Ngồi" có sẵn |
| Luật | khớp R-VUNG-1/2 (NPC không phải vật học trong cảnh; lựa chọn theo tiến độ riêng chỉ trong thoại) | phải nới R-VUNG-2 ("chạm vật" mở bài) — vật nằm trong cảnh chung nhưng mở theo tiến độ | trái ý người dùng (lại thành "cuộn học"), hai loại cuộn dễ lẫn |
| Học + ôn một chỗ | có (thầy hỏi cả ôn) | chỉ học | chỉ học |
| Việc thêm | NPC mới (`NPC_IDS`), đặt trong `rung-truc.json` bằng `/canh`, model tạm (Q4) | prop + tờ ảnh + vùng chạm | chỗ ngồi + cuộn biến thể |
| Hợp hướng "thế giới ảo" | thầy dạy chữ, có lời thoại, dễ mở rộng mỗi vùng một thầy | trung tính | yếu |

**Đề xuất A** — vì: (1) không cần thành phần HUD mới (khung thoại đã thiết kế), chỉ phiếu cho cuộn; (2) giữ nguyên R-VUNG-1/2;
(3) học + ôn ở cùng một người, ngay chỗ người mới xuống đài (cách vòng trận ~8 m) nên khó bỏ lỡ; (4) mỗi vùng sau có thể có
một thầy riêng (Giang Nam dạy chữ…) theo cùng mẫu.

## 2. Ôn ở đâu

Sau khi bỏ khỏi cuộn, đường ôn còn lại: bảng nhiệm vụ "Ôn ngay" (R-ON-5, R-NV-3 — Cổng Trấn, hoặc hỏi Tiểu Mặc "Hôm nay có
việc gì?") + Trúc Lão (A) "Ôn bộ đến hạn (n)". Đề xuất thêm **ô "Nhiệm vụ hôm nay" trên cuộn** (Q2): mở bảng nhiệm vụ ở mọi
nơi (có sẵn màn Flutter + "Ôn ngay"), đóng → cuộn hiện lại. Không thêm nút ôn mới trên HUD (HUD dọc đã chật: cụm nút, thẻ
Đọc sách, ví, bản đồ nhỏ); chấm son trên nút ngồi **giữ số bộ đến hạn** (bỏ loại "số bộ chưa học") — nhắc ôn, và ô Nhiệm vụ
trên cuộn mang cùng chấm son. Không chọn ô Nhiệm vụ → bỏ chấm son trên nút ngồi (ngồi không còn dẫn tới ôn).

## 3. Cuộn mới (đề xuất — phiếu vẽ chi tiết)

- Giấy **0,48 × 0,27 m** (≈ 16 : 9, thay 0,26 × 0,35) — trục đứng hai đầu dài 0,29 m, hai tay cầm hai trục như nay.
  Màn ngang: giấy cao ~**66 %** chiều cao (844 × 390 → ~258 × 458 px, hai tay + cảnh hai bên); màn dọc: giấy ~**90 %** bề
  ngang (390 × 844 → ~351 × 197 px, giữa màn). Bố cục px thiết kế: dọc 352 × 198, ngang 464 × 261.
- **4 ô một hàng** (cả dọc lẫn ngang): **Đọc sách** · **Bộ đã học** · **Nhiệm vụ hôm nay** (Q2) · ô **"Sắp có"** (nét đứt, không
  chạm). Mỗi ô: hình vẽ + tên + dòng phụ 1 dòng. Ô ≥ 70 × 90 px trên màn nhỏ nhất (360 × 640 dọc), "Đứng dậy" góc trên phải
  ≥ 44 px. Đầu cuộn: dòng nơi ("Rừng trúc · Cửa rừng") + tiêu đề + ấn son "Ôn" (đổi theo Q3).
- Ô mờ + lý do: Đọc sách chưa mượn → mờ, "Mượn ở Tàng Thư Các"; Bộ đã học chưa học bộ nào → mờ, "Chưa học bộ nào" + dòng gợi
  ý dưới hàng ô "Chưa học bộ nào. Sang Rừng trúc, gặp Trúc Lão ở cửa rừng để học bộ đầu tiên." (đủ câu, không cắt).
  Đang mượn: dòng phụ = tên cuốn ("HSK 1 · Nhập môn"; không ghi trang — `getProgress` không có trang, sổ tự mở đúng trang).
- Chạm ô dùng được → **ngón trỏ tay gần ô** (ô nửa trái → tay trái, nửa phải → tay phải; giấy rộng, một tay với không tới)
  chỉ vào ô rồi mở; chạm ô mờ / "Sắp có" → không mở, không vệt vàng; kéo = nhìn quanh (R-DIEU-7 giữ nguyên ±60°/20°/70°).
- **Ngồi ở đâu có cuộn**: giữ như nay — Ngồi tại chỗ (nút / phím C) ở mọi nơi + bồ đoàn khu tự học (R-VA-4); các chỗ ngồi khác
  không cuộn. Vì cuộn giờ là "bảng chức năng" riêng, mở được ở mọi nơi mới có ích (Đọc sách mọi nơi — R-SACH-2).
- Không mục nổi bật theo ôn / học nữa (bỏ `highlight`).

## 4. Luật đổi (sửa sổ trước → `/dong-bo-quy-tac` → test → code)

Nguyên văn đề xuất (tóm cụm chính; câu không nhắc giữ nguyên):

- **R-ON-8 (viết lại)** — **Cuộn bảng chọn**: ngồi (R-DIEU-7) đủ **1 giây** ở bất kỳ đâu → hai tay mở cuộn trước mặt, giấy
  **trải ngang** 0,48 × 0,27 m cầm giữa màn: màn ngang giấy cao khoảng **66 %** chiều cao màn, màn dọc rộng khoảng **90 %**
  bề ngang. Trên giấy là **lưới ô** một hàng, mỗi ô có hình + tên + dòng phụ: **"Đọc sách"** (đang mượn → mở sổ từ cuốn đó ở
  trang đã nhớ, R-SACH-3; dòng phụ = tên cuốn; chưa mượn → mờ, ghi "Mượn ở Tàng Thư Các") · **"Bộ đã học"** (danh sách bộ đã
  học, chạm một bộ → thẻ của bộ đó; chưa học bộ nào → mờ, ghi "Chưa học bộ nào") · **"Nhiệm vụ hôm nay"** (bảng nhiệm vụ
  R-NV-3; chấm son = số việc còn lại) · ô **"Sắp có"** (nét đứt, không chạm). Ô và "Đứng dậy" (góc trên phải) cao ≥ 44 px kể
  cả màn 360 × 640. Chưa học bộ nào → thêm dòng gợi ý "Chưa học bộ nào. Sang Rừng trúc, gặp Trúc Lão ở cửa rừng để học bộ
  đầu tiên." đủ cả câu. Chạm ô dùng được → ngón trỏ của tay gần ô chỉ vào ô rồi mở; chạm ô mờ → không mở; kéo là nhìn quanh.
  Lúc yên không tay nào đè chữ. Đóng màn Flutter (sổ từ, Bộ đã học, bảng nhiệm vụ) → vẫn ngồi, cuộn hiện lại (không chạy lại
  nhịp 1 giây). Cuộn **không** có ôn / học bộ mới (học ở Trúc Lão — R-HANH-6; ôn R-ON-5). (giữ: đang mở cuộn đứng yên, ẩn
  cần điều khiển / cụm nút / Trò chuyện; chỗ ngồi R-NGOI-1 không cuộn trừ bồ đoàn khu tự học; Esc / quay lại = Đứng dậy;
  không Flutter: "Đọc sách" → không mở (chưa có màn đọc web), "Bộ đã học" → thẻ HTML bộ gần nhất, "Nhiệm vụ" → bảng HTML.)
  Ví dụ: ở quảng trường, đang mượn HSK 1, đã học 5 bộ, 2 bộ đến hạn → C → 1 s → 4 ô: "Đọc sách · HSK 1 · Nhập môn",
  "Bộ đã học · 5 / 50 bộ", "Nhiệm vụ hôm nay" chấm "1" (Ôn tập còn 2 bộ, Lĩnh hội 3/3), "Sắp có"; chạm "Đọc sách" (ô 1, nửa
  trái) → tay trái trỏ → sổ từ ở trang đã nhớ (vd. 12); đóng → cuộn hiện lại. Chưa mượn, chưa học → "Đọc sách" mờ "Mượn ở
  Tàng Thư Các", "Bộ đã học" mờ, dòng gợi ý đủ câu. Màn ngang 844 × 390: giấy cao ~258 px, rộng ~458 px, giữa màn.
- **R-HANH-6 (mới)** — **Trúc Lão — thầy dạy bộ thủ ở Rừng trúc**: NPC đứng ở Cửa rừng cạnh lối từ vòng trận vào rừng (cách
  tâm vòng ~8 m). Nói chuyện (R-NPC-2) → lựa chọn theo tiến độ: **"Học bộ mới — bộ <tên>"** (bộ chưa học đầu tiên, R-HANH-3;
  học đủ 50 → không có, thầy nói đã học đủ), **"Ôn bộ đến hạn (n)"** (chỉ khi n > 0 — R-ON-5), "Tạm biệt". Chọn học → khung
  thoại đóng, thẻ bộ thủ mở; đóng thẻ → khung thoại mở lại ở câu "Học tiếp" với lựa chọn đã cập nhật. Chọn ôn → lượt ôn; xong /
  thoát → khung thoại mở lại. Ví dụ: chưa học bộ nào → "Học bộ mới — bộ trúc", "Tạm biệt"; chọn → thẻ 竹; "Đã lĩnh hội" →
  thoại "Học bộ mới — bộ mộc". 2 bộ đến hạn → thêm "Ôn bộ đến hạn (2)"; ôn 1 rồi thoát → "(1)". Đứng cách thầy 2,4 m → nút
  "Nói chuyện"; 2,5 m → mất.
- **R-HANH-3** — "chọn **"Học bộ mới"** trên cuộn sách Ngồi ôn (R-ON-8)" → "nói chuyện với **Trúc Lão** ở Rừng trúc, chọn
  **"Học bộ mới — bộ <tên>"** (R-HANH-6)"; "Đóng thẻ → vẫn ngồi, cuộn sách hiện lại" → "Đóng thẻ → khung thoại Trúc Lão mở
  lại"; câu nhập định chuyển sang R-ON-8 (nhịp mở cuộn); "Xuất định" chỉ còn cho thẻ mở lại từ "Bộ đã học". Ví dụ đổi theo
  (mới vào Rừng trúc → gặp Trúc Lão → "Học bộ mới — bộ trúc" → thẻ 竹 → "Đã lĩnh hội" → thoại có "bộ mộc"; đã học 49 bộ, học
  bộ cuối → không còn lựa chọn học).
- **R-ON-5** — mở lượt ôn: nút "Ôn ngay" trên bảng nhiệm vụ (R-NV-3 — mở ở bảng, hỏi Tiểu Mặc, hoặc ô "Nhiệm vụ hôm nay" trên
  cuộn R-ON-8) · "Ôn bộ đến hạn (n)" với Trúc Lão (R-HANH-6). Bỏ "trên cuộn sách Ngồi ôn". Ví dụ: 3 bộ đến hạn, ở quảng trường
  ngồi → cuộn → "Nhiệm vụ hôm nay" → "Ôn ngay" → lượt 3 bộ; ôn 1 thoát → bảng "còn 2 bộ"; đóng bảng → cuộn hiện lại.
- **R-VUNG-1** — "(Rừng trúc: Ngồi ôn → "Học bộ mới", R-HANH-3)" → "(Rừng trúc: Trúc Lão, R-HANH-6)"; ôn ở trấn: bảng nhiệm vụ
  "Ôn ngay" (cả từ ô trên cuộn) + Đấu chữ; bỏ "cuộn sách … 'Học bộ mới' mờ". Ví dụ: ở quảng trường bấm ngồi → cuộn 4 ô, không
  có mục học; Rừng trúc: chỉ Trúc Lão mở bài.
- **R-VUNG-2** — bài học / lượt ôn chỉ mở từ Trúc Lão (R-HANH-6), bảng nhiệm vụ (R-NV-3) hoặc bàn Đấu chữ (R-DAU-1); cuộn chỉ
  mở lại thẻ bộ **đã học** ("Bộ đã học"). **R-VUNG-3** ví dụ: "Ở Rừng trúc nói chuyện Trúc Lão → Học bộ mới → thẻ…; giữ
  joystick → không đi; đóng thẻ → thoại hiện lại".
- **R-DIEU-7** — chấm son: chỉ **số bộ đến hạn** (bỏ "không có bộ đến hạn mà ở vùng có bài học → số bộ chưa học"); ví dụ "Rừng
  trúc đã học 3 bộ, không bộ đến hạn → không chấm" (thay "47"). Tên nút theo Q3 (đề xuất "Tĩnh toạ", ngồi → "Đang tĩnh toạ").
  Nhìn quanh, camera, nhịp giữ nguyên. (Q2 = không → bỏ hẳn chấm son.)
- **R-VA-4** — bồ đoàn khu tự học: "cuộn sách trước mặt + các mục như Ngồi ôn (R-ON-8): … 'Học bộ mới' mờ…" → "cuộn bảng chọn
  như R-ON-8"; ví dụ "1 giây → cuộn 4 ô". **R-VA-5** — nội dung hướng dẫn khu tự học (`zones/studyGuide.ts`): bỏ câu "Học bộ
  mới mờ…", minh hoạ "cuộn 4 ô", cách học: "gặp Trúc Lão ở Rừng trúc"; tip chấm son giữ nếu Q2 = có.
- **R-NV-3** — thêm cách mở: ô "Nhiệm vụ hôm nay" trên cuộn (R-ON-8) khi đang ngồi — đóng bảng → cuộn hiện lại. **R-NV-1**
  giữ nguyên văn (Lĩnh hội đếm "Đã lĩnh hội" lần đầu ở thẻ — giờ thẻ mở từ Trúc Lão; ví dụ đúng).
- **R-SACH-2** — thêm: đang mượn → cuộn bảng chọn có ô "Đọc sách" (R-ON-8) mở cùng sổ từ; nút HUD "Đọc sách" vẫn ẩn khi cuộn mở.
- **R-NPC-1** (nếu liệt kê NPC theo cảnh) — thêm Trúc Lão (Rừng trúc).

**Cầu nối** — không đổi tên / dạng sự kiện. `docs/bridge.md` chỉ sửa cột "lúc gửi": `openRadical` (chọn học ở Trúc Lão; thẻ
mở lại từ Bộ đã học), `openReview` (Trúc Lão; "Ôn ngay" vẫn ở Flutter), `openLearned` / `openBook` / `openDaily` (ô trên
cuộn). `openStudy` giữ dòng "thôi dùng".

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — các luật ở mục 4 (trước code) → `/dong-bo-quy-tac`.
- `docs/bridge.md` — cột "lúc gửi" (không đổi dạng).
- `design/scene/rung-truc.json` — đặt Trúc Lão (`npcs`) — **việc thiết kế qua `/canh`**, phiên code không sửa `design/`.
- `web/src/scene/spec.ts` — `NPC_IDS` thêm `truc-lao`; model tạm (Q4: trường `model?` của `NpcSpec` hoặc bảng mã → file).
- `web/src/zones/trucLao.ts` (mới, thuần) — thoại động theo tiến độ (mẫu `zones/library.ts` `librarianDialog`); `dialogs.ts`
  Mặc Ông câu `hoc` ("tìm chỗ yên tĩnh mà ngồi thiền" → "gặp Trúc Lão ở cửa rừng").
- `web/src/zones/studyMenu.ts` — thành dữ liệu ô cuộn (đọc sách / bộ đã học / nhiệm vụ / sắp có + lý do); `sitBadge` chỉ đếm
  đến hạn; bỏ `highlight`, `fallbackStudy`, `next/upcoming` cho cuộn.
- `web/src/zones/cuonMuc.ts` — `cuonView` ô; `cuonLayout` lưới ô dọc / ngang; `cuonHit` theo ô + "Đứng dậy" góc; `PAPER_RATIO`
  mới; gợi ý mới; `CuonRowId` → mã ô.
- `web/src/zones/studyGuide.ts` — chữ hướng dẫn khu tự học (R-VA-5).
- `web/src/scene/cuonSachNhip.ts` — `CUON_GIAY_W/H` 0,48 × 0,27, `CUON_GIAY_NGANG` 0,9, `CUON_GIAY_CAO` 0,66.
- `web/src/scene/cuonSach.ts` — trục theo giấy mới; `web/src/scene/tayNgoi.ts` / `tayNgoiDang.ts` — tay gần ô trỏ.
- `web/src/ui/cuonMucPaint.ts` — vẽ ô + hình (canvas 2D) + `CuonA11y` nút ẩn cho từng ô — **chờ thiết kế**.
- `web/src/ui/actionButtons.ts` (+ `index.html` nhãn) — tên nút (Q3), chấm son chỉ đến hạn.
- `web/src/ngoiMat.ts` — tay nào trỏ, toạ độ ô (dùng `cuonLayout` mới).
- `web/src/trucLao.ts` (file ghép mới) — thoại Trúc Lão → `openRadical` / `openReview`, mở lại thoại sau `resume`.
- `web/src/main.ts` — `pickScroll` mới (đọc sách → `desk.read`; bộ đã học → `openLearned`; nhiệm vụ → `openDaily`); bỏ nhánh
  review / learn của cuộn; `dialogFor` thêm Trúc Lão; `closeLesson` → thoại Trúc Lão khi mở từ đó; vài dòng gọi `trucLao.ts`.
- `web/src/designPreview.ts` — trạng thái Canvas 3D `?dang=ngoi-mat` (có sách / chưa mượn / chưa học).
- Test: `zones/cuonMuc.test.ts`, `zones/studyMenu.test.ts`, `zones/trucLao.test.ts` (mới), `ngoiMatKhung.test.ts`,
  `ui/actionButtons.test.ts`, `zones/studyGuide.test.ts`, `zones/dialogs.test.ts`.

**Cần kiểm tra**
- `app/lib/lesson/daily_screen.dart` — mở khi đang ngồi; "Ôn ngay" → đóng → `resume` → cuộn hiện lại.
- `app/lib/lesson/radical_screen.dart` (+ `scene/review_event.dart`) — thẻ mở từ Trúc Lão (đang đứng): "Đã lĩnh hội" → `resume`;
  `resume {stand: true}` khi không ngồi không gây lỗi.
- `web/src/libraryDesk.ts` `read()` — gọi được từ cuộn (đang ngồi); `ui/readBookButton.ts` vẫn ẩn khi ngồi.
- `web/src/ui/dailyPanel.ts` (bảng HTML dự phòng) mở khi ngồi; `zones/dailyBoard.ts`.
- `app/test/scene/review_event_test.dart`, `app/test/rules/ngoi_on_test.dart` (bảng `openStudy` cũ — chỉ chạy lại).
- `web/src/zones/areaMapView.ts` / bản đồ vùng — icon NPC mới ở Rừng trúc (nếu bản đồ vẽ NPC).
- `npm run scene:check` — NPC mới ngoài vật cản, trong tầm từ vòng trận.

**Không đụng**
- `app/lib/lesson/study_screen.dart`, `study_parts.dart`, `study_board.dart` (bảng `openStudy` thôi dùng) — xoá là việc riêng sau
  khi thử máy.
- Lịch ôn (R-ON-1…4), màn ôn, màn Bộ đã học, sổ từ Flutter, ví / thưởng (R-TIEN-*) — chỉ đổi chỗ mở.
- Nhịp ngồi / nhập định / camera mắt (R-DIEU-7 phần camera) — giữ.
- `design/l10n/vi.arb` — chuỗi mới do phiên thiết kế đặt (phiếu); chuỗi cũ `reviewDue*`, `learnNew*`, `learnAtForest`,
  `hintGoForest` thành thừa trên cuộn (Flutter vẫn dùng ở màn khác thì giữ).

Hiệu năng: +1 NPC ở Rừng trúc (~2–3 draw call, ẩn từ 35 m); cuộn giữ số mesh, texture giấy cùng cỡ (464 × 261 thay 343 × 462).
Không thêm thư mục `web/src`.

## Giả định / cần quyết định

- **Q1 — Chỗ học bộ mới**: A Trúc Lão ở Cửa rừng (đề xuất) · B giá thẻ tre + nút nổi · C bồ đoàn học ở Trúc Xá.
- **Q2 — Ô "Nhiệm vụ hôm nay" trên cuộn** (ôn ở mọi nơi qua "Ôn ngay", chấm son nút ngồi giữ số bộ đến hạn): có (đề xuất) ·
  không (ô 3 = "Sắp có", bỏ chấm son; ôn chỉ ở bảng nhiệm vụ Cổng Trấn / Tiểu Mặc / Trúc Lão).
- **Q3 — Tên nút "Ngồi ôn"** (cuộn không còn ôn): đổi **"Tĩnh toạ"** / "Đang tĩnh toạ", ấn son "Tĩnh" (đề xuất) · giữ "Ngồi ôn".
  ("Ngồi" trùng nút nổi R-NGOI-1.)
- **Q4 — Model Trúc Lão**: dùng tạm `su-phu.glb` (Mặc Ông) cỡ 0,95 + ảnh cận mặt chung, model riêng sau bằng `/tai-nguyen`
  (đề xuất — chạy được ngay) · chờ model riêng (cần ảnh 4 góc từ `/ui-design` trước).
- Giả định: tên "Trúc Lão" (chữ Việt — R-HUD-4); vị trí cụ thể do `/canh` chọn trong Cửa rừng (≈ (−5,5; 33), mặt nhìn về vòng
  trận), `scene:check` kiểm.
- Giả định: lựa chọn trong thoại ghi tên bộ bằng chữ Việt ("bộ trúc"), không chữ Hán (chữ Hán chỉ trên thẻ).

## Nhiệm vụ

- [ ] 0. Người dùng chốt Q1–Q4 + duyệt phiếu → phiếu `chờ thiết kế`; `/ui-design` vẽ cuộn lưới ô; `/canh` đặt Trúc Lão trong
  `design/scene/rung-truc.json` (thiết kế — xong khi CHANGELOG có mục mới + `scene:check` đạt).
- [ ] 1. Sổ luật: sửa R-ON-8, R-HANH-3, R-ON-5, R-VUNG-1/2/3, R-DIEU-7, R-VA-4/5, R-NV-3, R-SACH-2 (+R-NPC-1), thêm R-HANH-6
  theo mục 4 → `/dong-bo-quy-tac` (Claude tự chép). (`docs/testing/quy_tac.md` · xong khi `rule_trace.dart --pending` trống.)
- [ ] 2. `docs/bridge.md` cột "lúc gửi" của `openRadical`, `openReview`, `openLearned`, `openBook`, `openDaily`. (xong khi hai
  phía đọc cùng chỗ gửi; không đổi dạng.)
- [ ] 3. Dữ liệu Trúc Lão: `zones/trucLao.ts` (thoại theo `learned`, `due`) + `NPC_IDS` `truc-lao` + model tạm (Q4) + Mặc Ông
  câu `hoc`. (zones / scene/spec · test `zones/trucLao.test.ts`: chưa học → "Học bộ mới — bộ trúc"; 2 đến hạn → "(2)"; đủ 50 →
  không lựa chọn học; `dialogs.test.ts` · xong khi vitest xanh.)
- [ ] 4. Dữ liệu ô cuộn: `zones/studyMenu.ts` (ô + lý do + chấm son đến hạn) + `zones/cuonMuc.ts` (`cuonView`, `cuonLayout`
  lưới ô dọc / ngang theo phiếu, `cuonHit`, gợi ý mới). (zones · test: 4 ô đúng thứ tự, mờ + lý do, chạm góc "Đứng dậy", ô ≥ 44
  px ở 360 × 640 và 640 × 360, gợi ý đủ câu · **chờ thiết kế** cho số px cuối — làm trước với số tạm ở mục 3 được.)
- [ ] 5. Cuộn 3D: giấy 0,48 × 0,27, `fitScroll` hằng mới, trục, tay gần ô trỏ, tay yên không đè chữ. (scene · test
  `ngoiMatKhung.test.ts`: giấy giữa màn ~66 % cao / ~90 % ngang, tay ngoài giấy · đo fps trước / sau — quy tắc 4.)
- [ ] 6. Vẽ ô trên giấy + nút ẩn đọc màn hình: `ui/cuonMucPaint.ts`. (ui · **chờ thiết kế** (`2026-11-15-cuon-bang-chon`).)
- [ ] 7. Nút ngồi: tên (Q3) + chấm son chỉ đến hạn: `ui/actionButtons.ts`, `index.html`. (ui · test `actionButtons.test.ts`.)
- [ ] 8. Ghép: `web/src/trucLao.ts` + `main.ts` (`pickScroll` 3 ô, bỏ ôn / học khỏi cuộn, `dialogFor`, thoại mở lại sau
  `resume`); `ngoiMat.ts` tay trỏ theo ô. (ghép · thử tay `npm run dev`: Rừng trúc gặp Trúc Lão học 竹 → thoại "bộ mộc"; trấn
  ngồi → 4 ô, Đọc sách mở sổ, đóng → cuộn hiện lại.)
- [ ] 9. Chữ hướng dẫn khu tự học `zones/studyGuide.ts` + Canvas 3D `designPreview.ts` (`?dang=ngoi-mat` 3 trạng thái).
  (test `studyGuide.test.ts`.)
- [ ] 10. Flutter: kiểm `daily_screen` / thẻ bộ thủ mở từ Trúc Lão (đứng) đóng đúng; sửa nếu lệch. (`app/lib/lesson/` ·
  `flutter test test/scene test/lesson`.)
- [ ] 11. Build + kiểm cuối; thử máy: màn dọc / ngang, 360 × 640, tay trái / phải trỏ ô.

Xong khi: ngồi ở mọi nơi → cuộn ngang 4 ô đúng thiết kế (có sách / chưa mượn, đã / chưa học); Rừng trúc học bộ mới + ôn qua
Trúc Lão; ôn ở trấn qua bảng nhiệm vụ (và ô trên cuộn nếu Q2 = có); luật đã đồng bộ, test xanh, build vào app.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build (PowerShell) ·
cd app && flutter analyze · flutter test -r failures-only test/scene test/lesson test/rules · dart tool/rule_trace.dart


## Người dùng trả lời (2026-11-15)
- Q1 chỗ học bộ mới: **để sau** — chưa bỏ "Học bộ mới" khỏi cuộn tới khi chọn (không để mất đường học).
- Q2 ô "Nhiệm vụ hôm nay": **để sau**.
- Q3 tên nút "Ngồi ôn": người dùng gợi ý **"Học"** ("Học hay gì đó") — chốt khi làm (cân nhắc trùng nghĩa nếu cuộn không còn học).
- Q4 model Trúc Lão: **chờ model riêng** (ảnh 4 góc `/ui-design` → `/tai-nguyen`).
