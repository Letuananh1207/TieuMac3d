# Bộ kiến trúc chuẩn + bài trí có mục đích (7 map)
- Yêu cầu: "Hiện nay ở cách bài trí trong các map đang rất là lộn xộn có nghĩa là có những kiến trúc không nhằm mục đích
  sử dụng, và kiến trúc xấu, tôi muốn lên 1 kế hoạch cụ thể sao cho tất cả các bài trí đều có mục đích và bộ asset kiến
  trúc cũng không được vẽ tự phát như hiện tại mà phải chuẩn bị sẵn dựa trên nghiên cứu"
- Loại: mốc mới (nghiên cứu → thiết kế → code → dựng lại cảnh) · Cỡ: lớn · Trạng thái: GĐ 2 — danh mục **đã duyệt** (`design/kien_truc/danh_muc.md`); tiếp: Catalog 3D (code, kế hoạch riêng)

## Hiện trạng (kiểm kê nhanh 2026-11-14)

| Map | Nhà (kiểu đang dùng) | Vật | Vấn đề thấy ngay |
|---|---|---|---|
| Văn Uyên Tông | trà lâu, lầu sách | 13 | ổn nhất; giữa sân đổi qua lại (đỉnh đồng → nhật quỹ) không có lý do ghi lại |
| Rừng trúc | 2 đình, 1 `nha-nho` (Trúc Xá) | 25 | nhiều vật nhỏ (đèn, bồ đoàn ×9) rải không gắn hoạt động |
| Giang Nam | 3 `nha-nho`, 2 cửa hàng, trà lâu, tháp, đình | 22 | "Thư phòng", "Thuỷ các", "Nhà ven sông" cùng một khối `nha-nho` |
| Bồng Lai | lầu sách (Bồng Lai Các), tháp, 3 đình | 24 | Bồng Lai Các = mượn Thư viện tông môn; 8 pháp bảo rải |
| Trường Thành | 2 `nha-nho` (Kho lương, Khương Nữ Từ) | 30 | đền thờ dựng bằng nhà nhỏ; 6 lều + 4 sạp không rõ dùng |
| Con đường tơ lụa | 1 `nha-nho` (Nguyệt Tuyền Các) | 39 | "các" bên hồ = nhà nhỏ; 15 lều / lán rải |
| Tử Cấm Thành | 5 `dien` giống nhau, lầu sách, 3 đình | 35 | Thái Hoà / Trung Hoà / Bảo Hoà cùng một kiểu điện — mất thứ bậc |

Gốc rễ: (1) chỉ 9 kiểu nhà cho 7 map → dùng sai loại; (2) ~60 loại vật dựng tự phát theo từng vùng (`vat_*.ts` ≈ 3 600
dòng) — không quy chuẩn tỉ lệ, cấp bậc, màu; (3) khảo cứu theo vùng có (`docs/tham_khao/`) nhưng không có **bộ quy chuẩn
chung** và không map nào có **bản mô tả bài trí** nói mỗi thứ đặt để làm gì.

## Đích

- Mọi công trình / vật đặt trong cảnh có **mục đích ghi rõ** thuộc một trong 4 loại: **hoạt động** (NPC, ngồi, học, chơi,
  mượn sách…) · **dẫn đường** (cổng, lối, mốc nhìn từ xa) · **kể chuyện** (đặc trưng vùng, có nguồn khảo cứu) · **nền xa**
  (không va chạm, chỉ để nhìn). Không có mục đích → bỏ.
- Kiến trúc chỉ lấy từ **bộ asset chuẩn** đã nghiên cứu + duyệt trên catalog; cảnh không tự đặt kích thước / màu tuỳ ý.
- Máy kiểm (`scene:check`) chặn được: vật thiếu mục đích, kiểu ngoài bộ chuẩn, sai cấp bậc (vd. nhà dân mái vũ điện).

## Các giai đoạn (mỗi giai đoạn xong → người dùng duyệt → mới sang giai đoạn sau)

### GĐ 1 — Nghiên cứu quy chuẩn kiến trúc (`/khao-cuu`) → `docs/tham_khao/kien-truc-chuan.md`
- **Loại hình** (mỗi loại: dùng cho chức năng gì, số gian, tỉ lệ cao / rộng, nền, cột, mái, màu, chi tiết nhận diện,
  biến thể theo vùng, nguồn): điện 殿 · lâu / các 樓閣 · đình 亭 · tạ / hiên 榭軒 · hành lang 廊 · nhà ở (Giang Nam / phương
  Bắc / hoang mạc) · cửa hàng 2 tầng · từ / miếu 祠廟 · tháp 塔 · cổng (sơn môn, bài phường, môn lâu, cổng trăng, thuỳ hoa
  môn) · tường (phấn tường, tường cung, thành gạch, tường đất nện) · cầu (vòm đá, cầu bằng, cửu khúc, cầu treo) · đài / nền
  (tu di toạ) · quân sự (địch lâu, phong hoả đài) · lều / lán.
- **Cấp bậc** (quy chế): mái vũ điện > yết sơn > huyền sơn > ngạnh sơn > toản tiêm; màu ngói / cột theo cấp; số gian 3 / 5
  / 7 / 9 — để Thái Hoà ≠ Trung Hoà ≠ nhà dân.
- **Nguyên tắc bài trí**: trục chính + viện lạc nối tiếp (cung điện, tông môn) vs vườn tự do (Giang Nam, Bồng Lai) vs
  trại / chợ (Trường Thành, Tơ lụa); khoảng cách đi bộ hợp lý trên điện thoại; mật độ vật.
- **Dịch sang low-poly**: mỗi loại = các bộ phận dùng chung (nền, cột, vì kèo, mái, lan can, cửa), ngân sách tam giác.
- Xong khi: hồ sơ có bảng loại hình + bảng cấp bậc + nguyên tắc bài trí, có nguồn; người dùng duyệt.

### GĐ 2 — Thiết kế bộ asset chuẩn (`/canh` — vai thiết kế) → `design/kien_truc/`
- **Danh mục** `design/kien_truc/danh_muc.md`: ~15–20 công trình mẫu + bộ phận dùng chung, mỗi mẫu có **cỡ chuẩn** (S / M / L
  theo số gian, không còn `w`, `d` tuỳ ý), cấp bậc, màu theo `phong_cach.md`, ngân sách tam giác / draw call.
- **Catalog 3D** (artifact, chạy đúng code app): lưới trưng bày từng mẫu ở cỡ chuẩn, kèm nhân vật đứng cạnh để so tỉ lệ;
  người dùng duyệt từng mẫu (đạt / sửa).
- Model AI (Hunyuan, `/tai-nguyen`) chỉ cho 1 công trình biểu tượng mỗi vùng (theo `decisions/0003`) — ghi rõ mẫu nào.
- Xong khi: danh mục chốt, catalog đăng, mỗi mẫu có ảnh `design/screens/KienTruc-*.png`.

### GĐ 3 — Bản mô tả bài trí từng map → `design/scene/bai_tri/<map>.md`
- Mỗi map: một câu mục đích của map; luồng người chơi (xuất hiện → điểm chính → hoạt động → truyền tống về); các khu chức
  năng; **bảng mọi công trình / vật**: tên · mẫu trong bộ chuẩn · mục đích (4 loại) · hoạt động / NPC gắn kèm · nguồn
  khảo cứu (với "kể chuyện"); danh sách **bỏ** kèm lý do; ngân sách (số công trình, draw call).
- Thứ tự: Văn Uyên Tông (ở nhiều nhất) → Rừng trúc → Giang Nam → Bồng Lai → Trường Thành → Tơ lụa → Tử Cấm Thành.
- Xong khi: người dùng duyệt bản mô tả của map đó (có thể làm map 1 xong rồi mới viết map 2).

### GĐ 4 — Code bộ asset + luật kiểm (`/lead`)
- `web/src/scene/kien_truc/`: dựng các mẫu theo danh mục (bộ phận dùng chung, cỡ chuẩn); gom `vat_*.ts` theo loại hình
  thay vì theo vùng; kiểu cũ giữ tới khi map cuối chuyển xong rồi xoá.
- `SceneSpec`: `buildings[].kind` + `size` (S / M / L) thay cho `w` / `d` tự do (kiểu cũ vẫn đọc được trong lúc chuyển);
  trường `purpose` bắt buộc cho nhà / vật (`hoat-dong` · `dan-duong` · `ke-chuyen` · `nen-xa`) + ghi chú ngắn.
- `scene:check`: báo vật thiếu `purpose`, kiểu ngoài danh mục, sai cấp bậc, vượt ngân sách map.
- Test cho từng mẫu (va chạm, vào được nếu có, không trùng mặt — `zfight.test.ts`), hiệu năng ≤ 150 draw call / 150k tam giác.

### GĐ 5 — Dựng lại từng map (`/canh` theo bản mô tả GĐ 3)
- Mỗi map: sửa `design/scene/<map>.json` chỉ bằng mẫu trong bộ chuẩn → `scene:check` sạch → ảnh trước / sau → luật bị
  chạm (sổ + online) → chốt `design <mã>`. Map xong mới sang map sau.

## Đã quyết định (người dùng, 2026-11-14)
1. **Cách làm asset**: bộ tham số trong code (cỡ chuẩn) + **model AI cho 1 công trình biểu tượng mỗi vùng** (Hunyuan,
   `/tai-nguyen`, theo `decisions/0003`).
2. **Phạm vi**: GĐ 1–2 (nghiên cứu + bộ asset chuẩn) cho cả 7 map trước; GĐ 3–5 làm mẫu ở **Văn Uyên Tông**, đạt rồi
   lần lượt các vùng.
3. **Phong cách**: **theo từng vùng**, chung một hệ cấp bậc — tông môn + Bồng Lai: tiên hiệp khung Tống; Tử Cấm Thành:
   Minh–Thanh cung đình; Giang Nam: dân gian Minh; Trường Thành / Tơ lụa: quân sự, đất nện.
4. **Thứ không có mục đích**: **bỏ hẳn**.
5. GĐ 1 (2026-11-14): thước đo chung **K = 1,25** cho mọi map (bỏ `heightScale` riêng từng map) · độ dốc mái **theo giọng vùng** · **3 cỡ S / M / L** cố định cho mỗi loại.
6. Các phiên khác **dừng thêm vật / kiểu nhà mới** cho tới khi GĐ 2 chốt danh mục (báo người dùng khi gặp phiên đang làm
   `vat-dac-trung-vung`).

## Kiểm tra cuối (mỗi GĐ code / cảnh)
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build ·
dart tool/rule_trace.dart · ảnh trước / sau mỗi map · draw call / tam giác.
