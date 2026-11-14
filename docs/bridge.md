# Cầu nối Flutter ↔ scene 3D

Nguồn sự thật cho mọi thứ hai phía trao đổi. Đổi gì ở đây trước, rồi sửa **cả hai phía** cùng lúc.

| Phía | File |
|---|---|
| Flutter | `app/lib/scene/` |
| Web | `web/src/style.css` (biến CSS); `web/src/bridge/` (sự kiện, mốc 3) |

## Biến CSS do Flutter đặt (mốc 2)

Flutter gọi `evaluateJavascript` đặt lên `document.documentElement.style` sau khi trang tải xong và mỗi khi
`MediaQuery.viewPadding` đổi (xoay máy, hiện/ẩn thanh hệ thống). Tạo chuỗi JS: `app/lib/scene/safe_area_script.dart`.

| Biến | Giá trị | Nghĩa |
|---|---|---|
| `--inset-top` | `<số>px` | vùng bị che phía trên (thanh trạng thái, tai thỏ) |
| `--inset-right` | `<số>px` | bên phải (tai thỏ khi máy nằm ngang) |
| `--inset-bottom` | `<số>px` | phía dưới (thanh điều hướng, thanh home iOS) |
| `--inset-left` | `<số>px` | bên trái |

Web dùng qua `--sa-*` = `max(env(safe-area-inset-*), var(--inset-*))` (`web/src/style.css`). Đơn vị px của CSS
bằng đơn vị logic của Flutter (viewport `width=device-width`).

## Sự kiện (mốc 3)

Dạng chung `{type: string, payload: object}`.

- JS → Flutter: `window.flutter_inappwebview.callHandler('sceneEvent', {type, payload})` — Flutter đăng ký handler
  tên `sceneEvent`; giá trị handler trả về là kết quả `Promise` phía JS.
- Flutter → JS: `evaluateJavascript` gọi `window.scene.handle({type, payload})` (chuỗi JS: `app/lib/scene/scene_event.dart`).

| type | Chiều | payload | Trả về | Khi nào |
|---|---|---|---|---|
| `openLesson` | JS → Flutter | `{zoneId: 'lop-hsk3', lesson: {han: '快', pinyin: 'kuài', meaning: 'nhanh; vui', info: [['Bộ', '忄 tâm đứng'], …]}}` (`lesson` = kiểu `Lesson` của `web/src/zones/zones.ts`) | `true` = Flutter đã mở màn bài học native · khác (`false`, lỗi, không có Flutter) = JS tự mở bảng HTML | người chơi bấm nút học hoặc chạm vật học (R-VUNG-2/3) |
| `openRadical` | JS → Flutter | `{radical: {id: 'thuy', form: '氵', full: '水', name: 'thuỷ', meaning: 'nước', pinyin: 'shuǐ', strokes: 3, fullStrokes: 4, examples: [{han, pinyin, meaning}, …], evolution?: {hinh: ['M50 10 …'], trien: […]}}, learned: false, region: 'Rừng trúc'}` (`radical` = kiểu `Radical` của `web/src/zones/radicals.ts`; nét SVG khung 0 0 100 100, lệnh M L Q C Z và cung tròn `a`) | `true` = Flutter đã mở thẻ học bộ thủ native · khác = trang tự mở bảng HTML | người chơi ngồi thiền ≥ 1 giây ở vùng có bài học bộ thủ (`lessons.radicals` — tu luyện, R-HANH-3); thẻ = bộ thủ chưa học đầu tiên theo thứ tự `RADICALS`. Bấm "Đã lĩnh hội" (lần đầu) → Flutter ghi bộ thủ đã học rồi đóng thẻ → `resume` (vẫn ngồi); bộ đã học bấm "Xuất định" → đóng → `resume {stand: true}` (2026-11-13.19) |
| `getProgress` | JS → Flutter | `{}` | `{chars: 2, radicals: ['truc', 'thuy', …]}` — **không khoá vùng** (R-HANH-1: mọi vùng có cảnh đều đi được; không còn `open` / `need`), `chars` = số chữ đã học, `radicals` = mã bộ thủ đã học (trang chọn bộ chưa học đầu tiên khi tu luyện — R-HANH-3), `due` = mã bộ thủ **đến hạn ôn** hôm nay theo thứ tự hỏi (R-ON-4), `daily` = `{learned: 2, goal: 3, due: 4, streak: 5, best: 7}` hai việc của bảng nhiệm vụ hôm nay (R-NV-1: bộ mới đã học / mục tiêu, số bộ còn đến hạn) + chuỗi ngày và kỷ lục (R-NV-2); `book` = mã sổ từ đang mượn ở Tàng Thư Các (`'hsk1'`; `null` = không mượn — R-SACH-2); `coins` = số dư Văn tiền (R-TIEN-1, `1280`), `gameCoinsToday` = Văn tiền trò chơi đã nhận hôm nay (trần 60 — R-TIEN-3, `24`); thiếu `due` / `daily` (bản cũ) → coi như không có bộ đến hạn, thiếu `book` → không mượn, thiếu `coins` → **ví ẩn** (coi như 0) · khác (`null`, lỗi, không có Flutter) = trang coi như chưa học gì | trang hỏi lúc tải và sau mỗi lần đóng bài học / màn Flutter (tiến độ ôn, bảng nhiệm vụ, sổ đang mượn) |
| `openReview` | JS → Flutter | `{items: [{radical: {…như openRadical…}, questions: [{ask: 'pinyin', options: ['zhú', 'mù', 'shān'], answer: 0}, {ask: 'meaning', options: […], answer: 2}]}, …], region: 'Rừng trúc'}` — `items` theo thứ tự `due`; mỗi bộ 2 câu Pinyin → Nghĩa, 3 phương án — chữ phương án nghĩa dạng `'thuỷ — nước'` (R-ON-2; trang dựng câu đố ở `web/src/zones/review.ts`) | `true` = Flutter đã mở màn ôn (tự chấm từng bộ khi xong câu 2 → `ProgressStore.reviewRadical`, đóng → `resume`) · khác = trang mở thẻ bộ mới như cũ (không có Flutter / kho tiến độ) | ngồi thiền ≥ 1 giây ở vùng có bài học bộ thủ khi `due` còn bộ (R-ON-5) |
| `openDaily` | JS → Flutter | `{review: [{radical, questions}, …], forms: {truc: '竹', moc: '木', …}}` — `review` = câu đố các bộ `due` (cùng dạng `items` của `openReview`) để "Ôn ngay" mở màn ôn ngay trên bảng (R-ON-5); `forms` = chữ của cả 50 bộ (mã → chữ) để bảng hiện các bộ học hôm nay | `true` = Flutter đã mở bảng nhiệm vụ ("Ôn ngay" mở màn ôn đè lên bảng, chấm như `openReview`; đóng bảng → `resume`) · khác = trang cho Tiểu Mặc nói tóm tắt `daily` qua khung thoại | người chơi chọn "Hôm nay có việc gì?" khi nói chuyện với Tiểu Mặc, hoặc bấm "Xem bảng" gần bảng 日課榜 (R-NV-3) |
| `openStudy` | JS → Flutter | `{items: [{id: 'review' \| 'learn' \| 'learned', enabled: true, reason: null \| 'reviewedToday' \| 'learnInRegion' \| 'allLearned' \| 'noneLearned', count: 2}, …], highlight: 'review' \| 'learn' \| null, review: [{radical, questions}, …], next: {…Radical} \| null, upcoming: [{…Radical}, …], learned: [{…Radical}, …], region: 'Văn Uyên Tông'}` — `items` luôn đủ 3 mục theo thứ tự trên (dựng ở `web/src/zones/studyMenu.ts`); `review` = câu đố các bộ đến hạn (cùng dạng `items` của `openReview`); `next` = bộ mở khi chọn "Học bộ mới"; `upcoming` = các bộ chưa học sau `next` theo thứ tự Rừng trúc (rỗng khi `next` null) — học xong `next` ngay trên bảng thì Flutter lấy bộ kế từ đây, trang không phải gửi lại (2026-11-14); `learned` = các bộ đã học theo thứ tự Rừng trúc (màn "Bộ đã học"; chạm một bộ → thẻ như `openRadical` với `learned: true`). Chuỗi hiển thị theo `reason` do Flutter giữ | `true` = Flutter đã mở bảng chọn cuộn sách (chọn mục → màn ôn / thẻ bộ thủ / bộ đã học mở đè lên, đóng → về bảng; Flutter tự ghi bộ đã học / chấm ôn như `openRadical` / `openReview`); bảng chỉ đóng bằng "Đứng dậy" (hoặc nút quay lại hệ thống) → `resume {stand: true}` · khác = trang tự mở: còn bộ đến hạn → `openReview`; không thì ở vùng có bài học → `openRadical` bộ `next`; còn lại không mở gì | người chơi ngồi ôn (nút "Ngồi ôn" / phím C) đủ 1 giây ở bất kỳ đâu (R-ON-8). Ngồi vào chỗ ngồi bằng nút nổi "Ngồi" không gửi — trừ bồ đoàn khu tự học tầng 2 Tàng Thư Các (R-VA-4): ngồi đủ 1 giây → gửi như Ngồi ôn; "Đứng dậy" → đứng khỏi bồ đoàn |
| `borrowBook` | JS → Flutter | `{id: 'hsk1'}` (mã sổ từ — `BOOKS` ở `web/src/zones/books.ts`) | `true` = Flutter đã ghi cuốn đang mượn (giữ qua tắt app) · khác = trang giữ trong bộ nhớ trang | người chơi chọn một cuốn khi nói chuyện với thủ thư mà chưa có màn danh mục (R-SACH-1). Trang đã kiểm `canBorrow` trước khi gửi |
| `returnBook` | JS → Flutter | `{}` | `true` = Flutter đã xoá cuốn đang mượn (trang nhớ của cuốn đó vẫn giữ — R-SACH-3) · khác = trang xoá trong bộ nhớ | chọn "Trả sách «…»" khi nói chuyện với thủ thư (R-SACH-4) |
| `getHome` | JS → Flutter | `{}` | `{placed: {'vuon-1': 'mai', 'san-2': 'den-long'}}` — nhà của ta đã lưu (R-NHA-3): mã ô (`decorSlots[].id` của cảnh `nha-ta`) → mã vật (`DECOR_ITEMS` ở `web/src/zones/decor.ts`). Flutter trả nguyên như đã lưu, không kiểm; trang bỏ ô / vật không còn (`cleanHome`). `owned: ['truc-canh', 'den-long', 'tranh-chu', 'mai']` = vật đã sở hữu (R-NHA-4, mua ở Tạp hoá — R-TIEN-4); thiếu `owned` (bản cũ) → trang coi là vật khởi đầu + vật đang đặt · khác (`null`, lỗi, không có Flutter) = nhà trống | trang hỏi khi vào cảnh có `decorSlots` |
| `setDecor` | JS → Flutter | `{slot: 'vuon-1', item: 'mai'}` · `{slot: 'vuon-1', item: null}` (gỡ) | `true` = Flutter đã ghi (giữ qua tắt app — R-NHA-3) · khác = trang giữ trong bộ nhớ trang (tắt là mất) | người chơi đặt / thay / gỡ vật ở một ô (R-NHA-2). Trang đã kiểm bằng `placeDecor` trước khi gửi |
| `earnGame` | JS → Flutter | `{game: 'dau-chu' \| 'co', outcome: 'thang' \| 'hoa' \| 'thua'}` | `{amount: 8, balance: 1288, gameToday: 32, capped: false}` — Flutter tính theo R-TIEN-3 (bảng thưởng, trần 60 / ngày — `app/lib/journey/wallet.dart`) và ghi ngay; `amount` = số vừa cộng (0 khi đã đủ trần), `capped: true` = hôm nay trò chơi đã đủ 60 (nhãn "đủ thưởng") · khác (`null`, lỗi, không có Flutter) = không thưởng, ví ẩn | hết một ván ở bàn chơi Kỳ Văn Uyển (Đấu chữ, Ngũ Tử Kỳ); rời bàn giữa ván → không gửi. Thẻ kết quả ván ghi "+n Văn tiền", hiệu ứng xu bay xếp hàng tới khi "Rời bàn" (R-TIEN-3) |
| `openShop` | JS → Flutter | `{items: [{id: 'mai', name: 'Mai', han: '梅', slot: 'vuon', price: 60, priceHan: '六十文'}, …]}` (`DECOR_ITEMS` của `web/src/zones/decor.ts` — một nguồn giá, đủ 13 vật theo thứ tự danh mục) | `true` = Flutter mở Tạp hoá (mua → trừ ví + ghi `owned`; "Đóng" / nút quay lại → `resume`; trang hỏi lại `getProgress` / `getHome`, số dư giảm → ví HUD chạy "−n") · khác = trang báo trong khung thoại "Tiệm chưa mở" | bấm nút nổi "Vào tiệm" trước cửa Tạp hoá ở Khởi Nguyên Trấn (R-TIEN-6) |
| `openLibrary` | JS → Flutter | `{books: [{id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn', planned: 150, words: 152, ready: true}, …], borrowed: null}` (`books` = `BOOKS` của `web/src/zones/books.ts`, đủ 6 cuốn theo thứ tự cấp) | `true` = Flutter đã mở danh mục (chọn cuốn `ready` → Flutter ghi mượn → đóng → `resume`; trang hỏi lại `getProgress`) · khác = trang cho chọn cuốn ngay trong khung thoại | chọn "Mượn sách" khi nói chuyện với thủ thư (R-SACH-1). **Màn danh mục chờ thiết kế** (phiếu `2026-11-13-muon-sach`) — tới lúc đó Flutter trả `false` |
| `openBook` | JS → Flutter | `{book: {id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn'}, words: [{han: '爱', pinyin: 'ài', meaning: 'yêu', example: {han: '我爱妈妈。', pinyin: 'Wǒ ài māma.', meaning: 'Tôi yêu mẹ.'}}, …]}` (`words` = `bookWords(id)`, thứ tự trang) | `true` = Flutter đã mở sổ từ ở trang đã nhớ của cuốn đó (đóng → ghi trang → `resume`) · khác = chưa có màn đọc | bấm "Đọc sách" khi đang mượn (R-SACH-2/3). **Màn đọc + nút chờ thiết kế** (phiếu `2026-11-13-muon-sach`) |
| `resume` | Flutter → JS | `{}` · `{stand: true}` | — | đóng màn bài học native → nhân vật đi lại được, cảnh vẽ tiếp đúng chỗ cũ. `stand: true` = thẻ bộ thủ đóng bằng "Xuất định" → nhân vật đang ngồi đứng dậy (R-HANH-3); nút quay lại của máy / "Đã lĩnh hội" → `{}` (vẫn ngồi) |
| `back` | Flutter → JS | `{}` | `true` = trang đã xử lý (vd. đóng bản đồ truyền tống — R-HANH-2) · khác = Flutter làm như thường (thoát app) | người dùng bấm nút quay lại của máy khi đang ở màn cảnh 3D (không có màn native nào mở). Flutter đọc giá trị trả về của `evaluateJavascript` (`window.scene.handle` trả `true` / `false`) |
| `lifecycle` | Flutter → JS | `{state: 'hidden' \| 'visible'}` | — | app xuống nền / bị che (`hidden`) → trang dừng hẳn vòng lặp vẽ; app hiện lại (`visible`) → chạy tiếp (mốc 4) |
| `debug` | Flutter → JS | `{on: true \| false}` | — | bản debug của app gửi `{on: true}` sau khi trang tải xong → bảng gỡ lỗi (fps · draw call · tam giác) (mốc 4) |

- **Thưởng học / ôn / nhiệm vụ / chuỗi** (R-TIEN-2) không qua cầu nối: xảy ra trong màn Flutter, `ProgressStore` cộng luôn
  và màn đó chạy hiệu ứng (ví tạm); trang chỉ thấy số dư mới ở `getProgress` sau `resume` — ví HUD đổi số, không chạy "+n"
  lần nữa. Luật tiền (thưởng, trần, mua) một nguồn ở Dart `wallet.dart`; giá + chữ Hán của vật một nguồn ở `decor.ts`.
- `openLesson` cũng là lúc Flutter ghi chữ `lesson.han` là **đã học** (lần đầu mở — R-HANH-1, tạm tới khi có nút
  "Đã thuộc"); tiến độ lưu ở Flutter (`app/lib/journey/progress_store.dart`).
- **Đổi vùng** (R-HANH-2) không qua Flutter: trang tự tải lại `index.html?vung=<mã vùng>` (về nhà:
  `index.html?tu=<mã vùng vừa rời>`). Flutter thấy một lần tải trang mới → `onLoadStop` gửi lại biến safe area và `debug`
  như lúc mở app; trang gọi lại `getProgress`.
- Trang cũng tự dừng khi `document.hidden` (trình duyệt thường đổi tab). Dừng vì bất kỳ lý do nào → không vẽ, không
  cập nhật; chạy lại thì bước thời gian đầu tiên bỏ qua (nhân vật không "nhảy").
- `?debug` trên URL vẫn bật bảng gỡ lỗi khi chạy trình duyệt thường.

- Trong lúc màn bài học native mở (đã trả `true`), JS **ngừng vẽ** (không gọi `renderer.render`) tới khi nhận `resume`.
- Màn bài học native chưa có thiết kế (phiếu `2026-11-10-man-bai-hoc`) → Flutter hiện trả `false`, app vẫn dùng bảng
  HTML. Có màn thì chỉ đổi phía Flutter, không đổi hợp đồng này.
- Không có `window.flutter_inappwebview` (trình duyệt thường, `npm run dev`, Canvas 3D) → bảng HTML.
