# Sổ lỗi — Học Xá 3D

| Lệnh | Làm gì |
|---|---|
| `/loi` | Liệt kê lỗi chưa `xong`, xếp theo mức độ rồi theo mã. |
| `/loi <mô tả>` | Ghi lỗi mới, chưa sửa. |
| `/loi sua [L-…]` | Sửa lỗi đó (không mã → lỗi đầu danh sách mở). |
| `/loi xong L-…` | Thử trên máy thật đạt → `xong`. |
| `/loi mo L-…` | Thử trên máy vẫn lỗi → mở lại. |

Trạng thái: `mới` → `đang sửa` → `chờ thử máy` → `xong` · `không sửa (<lý do>)`.
Mã `L-<số>` tăng dần, không dùng lại.

Mức độ:
- **chặn dùng** — văng app, màn trắng / scene không hiện, nhân vật không đi được hoặc kẹt cứng, không vào được bài học.
- **khó chịu** — điều khiển sai hướng / giật, thẻ mời hiện sai lúc, va chạm xuyên vật, chữ vỡ dấu, HUD bị tai thỏ che, tụt fps rõ.
- **nhỏ** — lệch màu, lệch vài pixel, chữ sai chính tả, thứ chỉ thấy khi cố tìm.

## Đang mở

### L-4 · Quảng trường Văn Uyên Tông: lư hương + "cục trắng" + cây đặt không hợp lý

- Trạng thái: chờ thử máy · Mức độ: nhỏ (bố cục / thẩm mỹ, không cản chơi) · Phần: cảnh — bố cục `design/scene/scene.json`
  (props, trees.yard, rạp phim), khói `scene/props.ts` · Quy tắc: chưa có
- Báo: 2026-11-13 — "ở quảng trường có 1 số món đồ đặt không hợp lý như lô hương cục gì trắng nổi lên và cây không
  đúng chỗ" (kèm ảnh: khu rạp phim 影戲臺, bồ đoàn, khối trắng góc phải)
- Các bước: 1. Mở app / Canvas 3D. 2. Đi vào sân Văn Uyên Tông (quanh Truyền Tống Đài, rạp phim).
- Mong đợi / thực tế: đồ vật, cây đặt có chủ ý, cân đối / lư hương đứng lẻ giữa lối, khói như khối trắng đặc, cây chen
  sát hàng ghế rạp và choán góc sân.
- Bằng chứng: ảnh người dùng chụp trên trình duyệt; ảnh Canvas 3D chụp lại.

**Sửa**
- Nguyên nhân: (1) đỉnh đồng `dinh-dong` (0; 12) đứng một mình giữa lối Sơn Môn → đài; khói là khối 20 mặt
  `MeshBasicMaterial` không bóng, nên trông như cục trắng đặc trôi lên. (2) Hai cây mai (±8,5; −9) mọc sát mép hàng
  bồ đoàn rạp phim; tùng (14; −14) to 1,68, hai tùng (±15; 15) to 1,5–1,6 choán góc sân, che tầm nhìn. (3) Rạp (bồ đoàn
  tới z −8,5) chỉ cách bậc bắc Truyền Tống Đài (z −7,2) ≈ 1,3 m.
- Hướng sửa (người dùng chọn): bỏ lư hương; bỏ 3 tùng, 2 mai sang hai bên màn chiếu; rạp sang khu giao lưu vui chơi
  mới **Tụ Hiền Viên 聚賢園** phía đông sân (R-RAP-1 viết lại + online + `--mark-synced`).
- Test: chưa khoá được bằng test (bố cục hình ảnh) — `scene:check` không lỗi; chụp Canvas 3D
  `design/screens/Canh-loi-L4-san.png`, `design/screens/Canh-loi-L4-tu-hien-vien.png`.
- Code: không đổi code — `design/scene/scene.json` (mục thiết kế `2026-11-13.15`), build lại `app/assets/scene/`.
- Thử máy: 1. Vào sân Văn Uyên Tông: không còn lư hương, cây tùng; quanh đài thoáng. 2. Ra cổng đông, rẽ theo lối đá về
  bắc tới Tụ Hiền Viên. 3. Đứng sát bồ đoàn, bấm Ngồi → ngồi lên, phim chạy. Còn lỗi → gửi ảnh chỗ đó.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn ghi + sửa luôn. Sửa bằng bố cục, chờ thử máy.
- 2026-11-13: người dùng gửi ảnh khối trắng tròn → là giếng (−15; −15), "xóa khối này" → `well.enabled: false`.
- 2026-11-13: "phần dược các và các luống cây là không cần thiết nên xóa" → bỏ nhà `duoc-cac` (−49; 3) + 4 `luong-thuoc`
  (x −31).
- 2026-11-13: "cỏ và cây ở chỗ ngoài … lộn xộn xấu; phường thị … vô dụng" → xoá khu Thị Tập, cây ngoài xếp đối xứng,
  cỏ búi 6 → 1,5 / 100 m² (mục thiết kế 2026-11-13.15, đợt 3). Khu giao lưu thay chỗ Thị Tập = tính năng mới, chờ `/lead`.

### L-3 · Lối lát đá bị cắt ngang, chìm dưới nền gạch khi nhìn gần

- Trạng thái: chờ thử máy · Mức độ: khó chịu (thấy ngay ở chỗ xuất phát) · Phần: cảnh — lối đá (`scene/paths.ts`) · Quy tắc: chưa có
- Báo: 2026-11-13 — "ở góc nhìn gần cũng đang xảy ra lỗi khi đường đi bị cắt như ảnh" (kèm ảnh: sân Sơn Môn, lối đá
  dừng giữa chừng, phía trước chỉ còn gạch nâu)
- Các bước: 1. Mở app / Canvas 3D. 2. Đứng ở chỗ xuất phát (0; 80), nhìn về cổng Sơn Môn.
- Mong đợi / thực tế: lối đá liền tới chân / lối đá bị cắt, đoạn gần chìm dưới nền gạch.
- Bằng chứng: ảnh người dùng chụp trên Chrome.

**Sửa**
- Nguyên nhân: mỗi lối đá là MỘT tứ giác phẳng nối hai đầu (Sơn Môn: z 33,6 → 89,6, dài 56 m), độ cao lấy ở hai đầu, ở
  giữa nội suy thẳng; mặt đất ở giữa cao hơn đường nội suy (bục, gờ, nhiễu) → lối chìm dưới nền.
- Test: chưa khoá được bằng test (hình ảnh) — chụp Canvas 3D ở góc người dùng.
- Code: `web/src/scene/paths.ts` — chia lối thành đoạn ≤ 1 m theo chiều dài, 3 điểm theo bề ngang, mỗi điểm lấy độ cao
  mặt đất.
- Thử máy: đứng ở chỗ xuất phát nhìn về cổng; đi dọc lối đá lên Thiên Bậc. Ảnh sau sửa: `design/screens/Canh-loi-L3.png`.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi + sửa.

### L-2 · Nhân vật .glb: mặt loang lổ, sống mũi gồ, vệt trắng ở tai / cạnh đầu

- Trạng thái: chờ thử máy · Mức độ: khó chịu (nhân vật chính nhìn lỗi ở mọi khung hình) · Phần: nhân vật, model .glb
  (`player/glbCharacter.ts`, `web/scripts/model-paint.mjs`, `tai-nguyen/scripts/atlas.py`) · Quy tắc: chưa có
- Báo: 2026-11-12 — "nhân vật đang bị lỗi và đang khá cứng đờ tôi cần có động tác" (kèm ảnh)
- Các bước: 1. `cd web && npm run dev`, mở Chrome. 2. Nhìn nhân vật ở góc chơi.
- Mong đợi / thực tế: mặt mịn, màu như ảnh gốc / mặt chia mảng sáng tối rõ từng tam giác, mũi gồ, tai và cạnh đầu có
  vệt trắng xám.
- Bằng chứng: ảnh người dùng chụp trên Chrome (`npm run dev`).
- "Cứng đờ, cần động tác" là tính năng mới → kế hoạch `docs/tasks/2026-11-12-dong-tac-nhan-vat.md`.

**Sửa**
- Nguyên nhân: (1) model Hunyuan không có pháp tuyến; `model:paint` tách đỉnh (unweld) rồi app tự tính pháp tuyến →
  mỗi tam giác một pháp tuyến riêng → mặt chia mảng sáng tối. (2) mép model (tai, cạnh đầu, hông) lấy mẫu trúng nền xám
  + nét viền của ảnh chiếu. Mũi gồ là hình khối Hunyuan dựng + giảm còn 9 500 tam giác — giảm nhẹ được, không hết.
- Test: chưa khoá được bằng test (hình ảnh — kiểm bằng chụp Canvas 3D `?chup&nv=0,80&cam=…`, trước / nghiêng / sau).
- Code: `web/scripts/model-paint.mjs` (weld → `normals()` → unweld; lấy mẫu lùi vào 3 %), `.claude/skills/tai-nguyen/
  scripts/atlas.py` (bỏ 3 px mép + lan màu bên trong ra phủ nền), model chạy lại → `design/models/nhan-vat.glb`.
- Còn lại: vạt áo dưới có vài vệt lam (mép áo), mặt hơi gợn — muốn sạch hẳn cần tô màu thật của Hunyuan (MSVC).
- Thử máy: `cd web && npm run dev` → Chrome, nhìn mặt / tai / vạt áo ở góc chơi và khi xoay quanh.
- Commit: …

**Lịch sử**
- 2026-11-12: ghi; sửa pháp tuyến + lan màu mép (chờ thử máy).

### L-1 · Chạy app trên máy tính (Windows) / web báo lỗi build

- Trạng thái: chờ thử máy · Mức độ: chặn dùng (không mở được app trên máy tính) · Phần: app Flutter, WebView · Quy tắc: chưa có
- Báo: 2026-11-11 — "vì ứng dụng này sẽ chạy được cả trên nền tảng web nhưng hiện tại khi run ở web thì đang báo lỗi"
- Các bước: 1. `cd app && flutter run`, chọn thiết bị Windows. 2. Build lỗi.
- Mong đợi / thực tế: app mở, thấy cảnh 3D / build thất bại `error MSB3073 … NUGET-NOTFOUND install Microsoft.Web.WebView2`,
  dòng đầu "Nuget is not installed! The flutter_inappwebview_windows plugin requires it."
- Bằng chứng: log build người dùng dán (Windows 11, Visual Studio 18 Insiders). Chạy thử trên web (`flutter build web`):
  "This project is not configured for the web."

**Sửa**
- Nguyên nhân:
  1. Windows: máy chưa cài NuGet (`where nuget` không thấy). Gói `flutter_inappwebview_windows` dùng NuGet tải WebView2
     + 2 thư viện C++ khi build → lỗi môi trường, không phải code.
  2. Web (trình duyệt): app chỉ tạo cho android + ios ở mốc 1, chưa bật nền tảng web. Bật lên rồi vẫn hỏng tiếp:
     `InAppLocalhostServer` dùng `dart:io` (mở cổng http) — trình duyệt không có.
- Hướng (người dùng chọn): **chỉ web (trình duyệt)**, không làm bản Windows desktop → không cần NuGet, bỏ `app/windows/`.
- Test: `app/test/scene/scene_server_test.dart` — `'(L-1): trên web nạp cảnh thẳng từ asset cùng nguồn, không dùng máy chủ
  localhost'` (+ chạy ở gốc, + Android / iOS vẫn qua cổng 8080). Đỏ trước khi sửa (chưa có `sceneUrl`).
- Code: `flutter create . --platforms web` (`app/web/`, tên / màu / `viewport-fit=cover` / nạp `web_support.js` của
  flutter_inappwebview); `app/lib/scene/scene_server.dart` — web: không tạo `InAppLocalhostServer`, mở
  `assets/assets/scene/index.html` cùng nguồn; `app/lib/main.dart` — không gọi bật gỡ lỗi WebView Android khi chạy web.
  `flutter build web` thành công; mở `app/build/web/` bằng Chrome headless thấy cảnh 3D trong khung WebView.
- Thử máy: `cd web && npm run build`, rồi `cd ../app && flutter run -d chrome` → thấy cảnh, đi lại được; nếu còn lỗi gửi
  log terminal + ảnh màn, F12 → Console.
- Commit: —

**Lịch sử**
- 2026-11-11: ghi; người dùng chọn "ghi rồi sửa luôn". Log người dùng dán là bản **Windows** (thiếu NuGet); hỏi lại →
  người dùng chọn chỉ web.

## Đã xong
