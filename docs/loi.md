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

### L-10 · Bề mặt chớp sáng liên tục (sàn tầng 2 trong nhà, cổng mái ngói)

- Trạng thái: chờ thử máy (đợt 2: các vùng) · Mức độ: khó chịu (chớp liên tục trên mặt sàn / cổng khi camera di chuyển, khó chịu mắt) · Phần:
  kiến trúc — `scene/kien_truc/tuong.ts` (cổng `lau`), `lau_sach.ts` (hiên lửng), `mai.ts` / `hinh.ts` · Quy tắc: chưa có
- Báo: 2026-11-14 — "đôi khi ở các đồ họa như sàn hoặc cổng lại xuất hiện những chớp sáng liên tục trên bề mặt"
- Các bước: 1. Trình duyệt máy tính. 2. Đứng trong nhà / lên tầng 2 (Thư viện), hoặc nhìn cổng "Bậc lên Trà lâu" (cổng
  bắc, mái ngói) từ trong sân. 3. Xoay / di chuyển camera.
- Mong đợi / thực tế: bề mặt đứng yên một màu / mặt sàn và cạnh trong khung cửa chớp sọc hai màu (z-fighting: hai mặt
  khác màu nằm trùng một mặt phẳng).
- Bằng chứng: ảnh người dùng (cổng bắc — cạnh trong khung cửa phải có vệt sọc sáng); ảnh L-6 lần 3 (sàn tầng 2 Thư viện
  có vệt sọc mảnh). Chạy trên trình duyệt máy tính.

**Sửa**
- Nguyên nhân (quét hình học các khối trong nhà + tường): (1) Tàng Thư Các — hiên lửng tầng 1 (`skirt`, chóp cụt có nắp
  trên) cao đúng tới mặt sàn tầng 2: nắp 18,2 × 9,2 m màu ngói nằm trùng mặt sàn gỗ (y = 6,26) gần như cả sàn. (2) Cổng
  `lau` (門樓): trụ khung gỗ áp mặt trong trụ vôi đúng mép lối đi (x = ±2,9) — hai mặt trùng; xà ngang trên lối có mặt dưới
  trùng mặt dưới mảng tường trên cửa (y = 3,2).
- Test: `web/src/scene/zfight.test.ts` — quét mặt các khối hộp tìm cặp cùng mặt phẳng khác vật liệu:
  `'(L-10): cổng mái ngói — khung gỗ (trụ, xà) không nằm trùng mặt tường vôi của cổng'` (đỏ: 12 cặp → xanh),
  `'(L-10): Tàng Thư Các — hiên lửng tầng 1 thấp hơn mặt sàn tầng 2'` (đỏ: đỉnh hiên 6,26 = mặt sàn → xanh). Toàn bộ 205 test
  web xanh. Chớp thật chỉ thấy khi camera chuyển động trên GPU thật — ảnh tĩnh không bắt được, nên khoá bằng hình học.
- Code: `kien_truc/tuong.ts` (`PROUD` 3 cm: trụ khung gỗ nhô vào lối, xà ngang thò xuống dưới mảng tường, dải xà dưới mái
  hạ dưới đỉnh trụ), `kien_truc/lau_sach.ts` (hiên lửng cao 0,9 → 0,86: nắp thấp hơn sàn tầng 2 4 cm). Đã `npm run build`.
  Trà lâu: hiên lửng đỉnh ở mặt dưới sàn (ngược chiều) — không chớp, không đổi.
- Thử máy: trình duyệt máy tính — (1) đứng trong sân nhìn cổng bắc "Bậc lên Trà lâu" / cổng nam, xoay camera: cạnh trong
  khung cửa và mặt dưới xà không chớp; (2) lên tầng 2 Thư viện, đi quanh, xoay camera: mặt sàn không chớp sọc. Còn chớp ở
  chỗ khác → chụp màn (hoặc quay) gửi, ghi đứng ở đâu.

- **Đợt 2 (2026-11-14, người dùng chọn "sửa tận gốc từng chỗ")** — dò cả cảnh: `web/src/scene/zfightScan.ts` so mặt phẳng
  từng tam giác (tắt gộp khối), tính cả hai khối **cùng ảnh** (vôi, gạch, đá — UV lệch nhau nên vẫn lấm tấm), bỏ mặt bị khối
  khác che, khối vô hình, vật liệu có polygonOffset. Sau lọc còn ~200 chỗ thấy được; nguyên nhân + sửa:
  - Cửa bức bàn (`kien_truc/chi_tiet.ts` `addDoors`, mọi điện / nhà ở Tử Cấm Thành, Bồng Lai, tông môn): chân cửa gỗ rộng đúng
    bằng tấm vôi (mặt đầu trùng), song gỗ có mặt sau trùng mặt sau tấm → chân cửa thò vào cột 1 cm, song lệch ra trước 1 cm.
  - Góc tường (`walls.ts` gạch — Tử Cấm Thành, Con đường tơ lụa; `kien_truc/tuong.ts` vôi — Giang Nam): hai đoạn kéo dài nửa bề
    dày, chồng nhau ở góc → mặt ngoài trùng → đoạn trục x dài thêm, trục z ngắn lại `CORNER_EPS` 5 mm mỗi đầu (vật cản giữ nguyên);
    chân đá xếp dài hơn thân vôi 5 mm mỗi đầu.
  - Cuộn lụa trên sạp (`vat_sa_mac.ts`, ảnh 5): 3 cuộn cùng trục, cùng bán kính, nối đuôi lồng nhau → xếp cạnh nhau.
  - Cổng chào (`gate.ts`): mặt trên xà trên trùng đỉnh cột giữa → hạ xà 1 cm.
  - Lan can thang (`kien_truc/cau_thang.ts`): cột 0,1 áp sát tường thành / đáy trùng đáy bậc → cột 0,096, nhấc 2 mm.
- Test đợt 2: `web/src/scene/zfightRegions.test.ts` — `'(L-10): <cảnh> — không có mặt trùng khác màu'` (đỏ trước khi sửa:
  bong-lai 49, to-lua 19, tu-cam-thanh 129, giang-nam 5 … → 0 cả 7 cảnh). Mặc định chạy to-lua + bong-lai (≈ 3 s mỗi cảnh);
  cả 7 cảnh: `ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts` (≈ 2 phút). 208 test web xanh. Đã `npm run build`.
- Chưa khoá được bằng test: ảnh 4 (chân cầu đá trên hồ Giang Nam) và ảnh 1 (góc tường nhà 2 tầng Giang Nam) — máy dò không thấy
  mặt trùng ở đó sau khi sửa; nếu còn chớp có thể là hai mặt **gần** trùng (lệch vài mm) hoặc ảnh lấm tấm của vôi → cần ảnh /
  vị trí đứng để xem tiếp.
- Thử máy đợt 2 (trình duyệt): Tử Cấm Thành — nhìn gần cửa các điện + góc tường thành, thang lên tường; Con đường tơ lụa —
  sạp lều vải (cuộn lụa), góc tường; Giang Nam — cổng chào, chân tường vôi, chân cầu; Bồng Lai — cửa Tàng Thư Các, lan can
  thang. Xoay / đi quanh camera: không còn vệt chớp. Còn chỗ chớp → ảnh + đứng ở đâu (vùng, gần vật gì).

**Lịch sử**
- 2026-11-14: ghi, sửa luôn → chờ thử máy.
- 2026-11-14: thử máy trình duyệt đạt (người dùng `/loi xong L-10`) → xong.
- 2026-11-14: **tái phát ở các vùng** (mở lại) — "hiện nay có 1 số lỗi hiện tượng chớp ở các kiến trúc ở 1 số map như
  giang nam (chân cầu, chân cổng,..), tử cấm thành, mở rộng tôi sẽ gửi ảnh". Trình duyệt máy tính; 5 ảnh: nhà 2 tầng
  Giang Nam (góc tường dưới mái), chân tường / chân cổng đỏ Tử Cấm Thành, chân cầu đá trên hồ, cuộn vải trên sạp (Con
  đường tơ lụa). Dò cả cảnh bằng `web/src/scene/zfightScan.ts` + `zfightRegions.test.ts` (chạy riêng:
  `ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts`, tắt gộp khối): tong-mon 259 · bong-lai 164 · giang-nam 137 ·
  rung-truc 27 · to-lua 23 · truong-thanh 13 · tu-cam-thanh 380 chỗ (~195 cặp khối, ~10–15 file dựng). Nhiều nhất: song
  gỗ cửa trên tường đỏ (điện Tử Cấm Thành), cột / khung sẫm chìm trong tường vôi (Giang Nam), kệ trong nhà (0,6×2,4 × nẹp
  gỗ), đài tròn tông môn (mặt nắp trùng mặt bậc), cuộn vải đồng trục cùng bán kính (sạp tơ lụa).
- 2026-11-14: lọc mặt bị che / vô hình / có polygonOffset → còn thật ~200; sửa 5 chỗ dựng (xem Đợt 2) → 0 cả 7 cảnh, chờ thử máy.


### L-11 · Nhãn tên người chơi nổi đè lên bản đồ truyền tống

- Trạng thái: chờ thử máy · Mức độ: nhỏ (nhãn che một phần chữ trên bản đồ) · Phần: HUD — `web/src/ui/hud.ts`
  (`NameTag`), `web/src/main.ts` · Quy tắc: R-HANH-2 (bản đồ mở: nhân vật đứng yên, HUD điều khiển ẩn)
- Báo: 2026-11-14 — "tên người dùng đang bị nổi lên trên cả bản đồ" (ảnh: pill "Tuấn Anh" đè chữ 長城 Trường Thành)
- Các bước: 1. Vào vòng trận Truyền Tống Đài, đứng 1,2 s. 2. Bản đồ mở.
- Mong đợi / thực tế: bản đồ phủ, không có nhãn tên / pill "Tuấn Anh" nằm trên giấy bản đồ.
- Nguyên nhân: nhãn tên là lớp HTML (z-index 4) trên canvas 3D; cuộn bản đồ là vật 3D nên luôn nằm dưới nhãn. `main.ts`
  chỉ ẩn nhãn khi chữ nhập định hiện.
- Sửa: ẩn nhãn tên khi bản đồ mở, màn tải đang hiện, hoặc màn bài học che cảnh (`main.ts`, `nameTag.setVisible`).
  Không có test (vòng lặp khung hình trong `main.ts` — kiểm bằng thử tay).

### L-9 · Để yên chuột trên cảnh thì con trỏ hoạt hình thỉnh thoảng thành chuột máy tính

- Trạng thái: chờ thử máy · Mức độ: nhỏ (chỉ đổi hình con trỏ, vẫn dùng bình thường; di chuột là trở lại) · Phần: HUD /
  con trỏ chuột — `web/src/style.css` (`cursor: url(./cursor/*.svg)`) · Quy tắc: chưa có
- Báo: 2026-11-14 — "bây giờ có 1 vài lúc đôi khi để yên thì chuột lại quay về chuột máy tính sau đó di chuyển thì lại
  trở về chuột hoạt hình"
- Các bước: 1. `npm run dev`, mở trên trình duyệt máy tính. 2. Để chuột đứng yên trên cảnh 3D (không trên nút), chờ.
- Mong đợi / thực tế: con trỏ luôn là mũi tên ngọc lục / thỉnh thoảng thành mũi tên mặc định của máy, di chuột thì trở lại.
- Bằng chứng: chưa có (trình duyệt, `npm run dev`, chuột trên cảnh 3D).

**Sửa**
- Nguyên nhân: con trỏ trỏ tới file ảnh riêng (`url(./cursor/tro.svg)`). Bản dev phục vụ file với `Cache-Control:
  no-cache`, bản build cũng để file riêng (`assetsInlineLimit: 0`) → trình duyệt có lúc phải hỏi lại máy chủ. Để yên
  chuột mà DOM dưới chuột đổi (bong bóng thoại, nhãn tên, NPC nói trên kênh chung…) thì Chrome tính lại con trỏ; ảnh
  chưa sẵn → dùng con trỏ dự phòng `default` và giữ tới lần di chuột kế tiếp.
- Test: `web/src/ui/cursor.test.ts` — `'(L-9): style.css không trỏ con trỏ tới file ảnh riêng …'` (đỏ trước khi sửa),
  `'(L-9): con trỏ là data URI nhúng sẵn …'`. Hiện tượng trên màn (con trỏ đổi khi để yên) chưa khoá được bằng test —
  headless không vẽ con trỏ; đã kiểm `getComputedStyle(...).cursor` = `url("data:image/svg+xml,…")`.
- Code: `web/src/ui/cursor.ts` (`installCursors` → biến `--cur`, `--cur-btn` từ `src/cursor/*.svg?raw`), gọi đầu
  `web/src/main.ts`; `web/src/style.css` dùng `cursor:var(--cur,default)` / `var(--cur-btn,pointer)`;
  `web/src/node-fs.d.ts` (kiểu `readFileSync` cho test). Đã `npm run build`.
- Thử máy: `npm run dev` (tải lại trang, Ctrl+F5), để chuột yên trên cảnh 2–3 phút (gần Tiểu Mặc để có bong bóng hiện /
  mất) → con trỏ luôn là mũi tên ngọc lục. Còn lỗi → quay màn hình lúc con trỏ đổi.
- Commit: chưa (chưa được bảo).

**Lịch sử**
- 2026-11-14: ghi lỗi, sửa luôn (người dùng chọn) → nhúng con trỏ thành data URI, chờ thử máy.

### L-8 · Bàn ngồi ở các nơi nhỏ hẹp: bàn ghế nhỏ so người, ngồi sát nhau, camera khi ngồi chật

- Trạng thái: chờ thử máy · Mức độ: khó chịu (trông như đồ chơi, ngồi chen chúc, nhìn chật chội) · Phần: nội thất + chỗ ngồi —
  `scene/kien_truc/{tra_lau,lau_sach,noi_that}.ts`, `scene/gameTable.ts`, `scene/seat.ts` · Quy tắc: R-VA-4, R-GIAO-1, R-NGOI-1
- Báo: 2026-11-13 — "bàn ngồi ở các nới đang hơi nhỏ hẹp"
- Các bước: 1. Vào trà lâu / Tàng Thư Các tầng 2 / Kỳ Văn Uyển. 2. Đứng cạnh hoặc ngồi vào bàn.
- Mong đợi / thực tế: bàn ghế vừa tầm người, chỗ ngồi thoáng, camera khi ngồi thấy rõ / bàn ghế nhỏ so nhân vật, ngồi
  sát nhau, camera khi ngồi chật. Cả ba nơi (người dùng chọn "tất cả các nơi").
- Bằng chứng: chưa có

**Sửa**
- Nguyên nhân: nhân vật chibi cao 2,1 m nhưng bàn ghế làm theo cỡ người thật ~1,65 m (bàn thấp 0,35–0,4, bồ đoàn ∅ ~0,65,
  ghế cách tâm bàn 0,6–0,8, hai ghế cạnh nhau 1,0–1,2); ngồi xuống camera giữ góc đứng (4,2 m, ngang, ngắm cao 1,2 m).
- Test: `scene/gameTable.test.ts` `'R-GIAO-1 (L-8): …'` (toạ độ ghế thật), `input/orbitCamera.test.ts` `'R-NGOI-1 (L-8): …'`
  (camera ngồi); cập nhật số trong `gamePlay.test.ts`, `zones/seats.test.ts`, `traLau.test.ts`. vitest 145/145.
- Code: kế hoạch `docs/tasks/2026-11-13-ban-ghe-rong-hon.md` — `kien_truc/{do_pho,tra_lau,lau_sach}.ts`, `gameTable.ts`,
  `spec.ts` (GAME_SLOT 2,5, `camera.seated`), `input/orbitCamera.ts` (`sit`), `main.ts`.
- Thử máy: 1. Trà lâu tầng 1 + tầng 2, Tàng Thư Các tầng 2, Kỳ Văn Uyển: bàn ghế vừa tầm nhân vật, ngồi không chen
  nhau. 2. Bấm "Ngồi" ở án thư / bàn trà → camera lùi ra, chúc xuống thấy cả bàn; đi → camera về như cũ. 3. Đi quanh
  bàn tầng 2 trà lâu, lối phía đông → không vướng. Còn lỗi: ảnh chụp chỗ chật.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn ghi rồi sửa luôn.
- 2026-11-13: duyệt ×1,3, camera ngồi "lùi xa + hơi chúc", làm cả 3 nơi; Kỳ Văn Uyển dọc bàn 2,5 (biển tên). Sửa xong, build.

### L-7 · Quay đầu đi về phía camera thì chỉ thấy mặt nhân vật, không thấy phía trước

- Trạng thái: chờ thử máy · Mức độ: khó chịu (điều khiển / tầm nhìn sai, không thấy đường đi) · Phần: điều khiển + camera —
  `input/orbitCamera.ts`, `main.ts` · Quy tắc: R-DIEU-3
- Báo: 2026-11-13 — "hiện nay cảm giác camera đang chưa xoay đúng ý đảm bảo tầm nhìn khi người dùng di chuyển, đặc biệt là
  khi quay lại thì lại chỉ thấy mặt nhân vật đi lên chứ không thấy những gì nhân vật đang nhìn thấy"
- Các bước: 1. Đi tới một đoạn. 2. Kéo joystick xuống (quay đầu, đi về phía camera) và giữ.
- Mong đợi / thực tế: camera vòng ra sau lưng, thấy phía trước nhân vật / camera đứng yên, chỉ thấy mặt nhân vật đi tới.
- Bằng chứng: chưa có

**Sửa**
- Nguyên nhân: R-DIEU-3 cũ cố ý không tự xoay khi hướng đi lệch hướng nhìn ≥ 120°, vì hướng joystick tính theo camera
  từng khung hình — camera mà xoay thì "xuống" đổi nghĩa, nhân vật đi vòng. Đổi luật: khoá hướng đi khi giữ joystick
  cùng hướng, nên camera xoay ra sau lưng cả khi đi về phía camera.
- Test: `web/src/input/orbitCamera.test.ts` — `'R-DIEU-3 (L-7): giữ joystick xuống (đi về phía camera) → đi thẳng, camera
  vòng ra sau lưng trong ~1,5 s'` (+ 5 test R-DIEU-3: đi ngang, thả tay bấm lại, đổi hướng ≥ 45°, kéo tay khi đi, chờ 1,5 s).
  Đỏ trước khi sửa, xanh sau (vitest 128/128).
- Code: `orbitCamera.ts` — thêm `steerYaw(ix, iy)` (khoá hướng đi; thả tay / đổi hướng ≥ 45° → theo camera; kéo tay → xoay
  theo), bỏ ngưỡng 120°, lệch càng nhiều xoay càng nhanh (180° → gấp ba). `main.ts` — controller nhận `orbit.steerYaw(…)`
  thay cho `orbit.yaw`. Cảm giác (tốc độ xoay, ngưỡng 45°) chỉ thử máy mới chốt được.
- Thử máy: 0. Đi vòng, rẽ trái / phải → camera xoay êm, không chóng mặt; dừng → camera hãm lại, đứng yên, không tự xoay
  về chính diện. 1. Đi tới vài bước. 2. Kéo joystick xuống và giữ → nhân vật đi thẳng (không vòng), camera vòng êm ra sau
  lưng trong ~3 s, thấy phía trước. 3. Vẫn giữ → đi tiếp đúng hướng. 4. Thả, đẩy lên → đi tới theo camera mới. 5. Đang đi
  dùng ngón kia kéo xoay camera → hướng đi xoay theo. Còn lỗi: quay màn / mô tả lúc nào thấy khó chịu.
- Commit: …

**Lịch sử**
- 2026-11-13: ghi; người dùng chọn "khoá hướng + xoay ra sau".
- 2026-11-13: sửa xong, build; R-DIEU-3 sửa trong sổ, **chưa chép lên tài liệu xác nhận online** (phiên VS Code không có
  công cụ Claude Docs).
- 2026-11-13: thử máy — "camera vẫn bị lệch góc nhìn từ mắt nhân vật": đổi trái / phải rồi dừng thì camera đứng chéo sau
  vai (có ảnh). Nguyên nhân: xoay theo hàm mũ nên càng gần càng chậm, bám theo quãng vừa đi (không theo hướng quay mặt),
  dừng là thôi xoay. Sửa: bám hướng quay mặt bằng lò xo giảm chấn (`AUTO_SMOOTH` 0,22 s → rẽ / quay đầu ~0,8 s lệch
  < 3°), dừng thì xoay nốt 0,8 s; `follow(dt, facing, moving)`. Thêm 3 test (trái/phải liên tục, dừng xoay nốt, kéo tay
  rồi đứng). R-DIEU-3 sửa lần 2 — cần chép lại lên tài liệu online.
- 2026-11-13: thử máy — "nhanh chóng mặt", nhờ bắt chước game cùng thể loại. Làm lại theo kiểu Zelda / Genshin / Mario
  (Cinemachine "recentering"): **dây kéo** (`LEASH` 0,6 — đi ngang thì camera bị kéo vòng theo) + **tự về sau lưng
  chậm** (lò xo `AUTO_SMOOTH` 0,5 s, tối đa 75°/s, gia tốc 200°/s² nên bắt đầu êm) + tổng xoay ≤ 90°/s; dừng thì xoay
  nốt 1,5 s. Rẽ 90° ~2 s, quay đầu ~3 s. `follow(dt, dx, dz, facing, moving)`. 10 test (có kiểm tốc độ xoay ≤ 90°/s,
  0,3 s đầu rẽ < 20°). R-DIEU-3 sửa lần 3.
- 2026-11-13: thử máy — "vẫn còn chóng mặt ở chỗ sau khi nhân vật đứng lại thì camera tự xoay về chính diện". Bỏ xoay
  nốt khi dừng: dừng thì hãm (`AUTO_BRAKE` 400°/s², ~0,2 s) rồi đứng yên, đứng yên không tự xoay (như game cùng thể
  loại). R-DIEU-3 sửa lần 4.

### L-6 · Cầu thang trà lâu + Tàng Thư Các khó đi, đi lên bị che khuất

- Trạng thái: chờ thử máy · Mức độ: khó chịu (lên tầng 2 vất vả, camera bị che) · Phần: nhà vào được — `scene/kien_truc/cau_thang.ts`,
  `lau_sach.ts`, `tra_lau.ts` · Quy tắc: R-VA-3 (+ R-DIEU-4 camera)
- Báo: 2026-11-13 — "cầu thang hiện nay đang rất khó đi ở cả trà lâu và tàng thư các khi hướng lên lại bị che đi đổi
  phong cách khác"
- Các bước: 1. Vào Tàng Thư Các (−39; −34) hoặc trà lâu Phẩm Minh Các (0; −64). 2. Đi lên cầu thang gian phải.
- Mong đợi / thực tế: lên tầng 2 dễ, nhìn rõ / thang gấp khúc hai vế trong gian hẹp ~3 m có tường: khó lái, quay đầu ở
  chiếu nghỉ, camera sau lưng bị tường + sàn tầng 2 che.
- Bằng chứng: lời người dùng; chưa có ảnh.
- Hướng sửa (Claude chọn — người dùng "tiếp tục làm"): thang **thẳng một vế ngoài trời** dọc đầu hồi phải, chiếu nghỉ +
  cầu nối vào sàn tầng 2.

**Sửa**
- Nguyên nhân: thang gấp khúc hai vế (mỗi vế 1,5 m) trong gian hồi kín tường: phải quay đầu 180° ở chiếu nghỉ; camera sau
  lưng nằm trong gian ~3 m bị tường (vật cản che tầm nhìn, R-DIEU-4) và sàn tầng 2 ép sát / che.
- Test: `web/src/lauSach.test.ts`, `web/src/traLau.test.ts` — `'R-VA-3 (L-6): thang thẳng một vế ngoài trời…'`, `'R-VA-3 (L-6):
  đang trên thang đi ngang → lan can hai bên chặn…'`, `'R-VA-3 (L-6): dưới đất không lọt vào gầm thang…'` + leo lên / xuống,
  mép hồi chỉ hở chỗ cầu nối (17 test, xanh). Camera thoáng: chưa khoá được bằng test (cần thử máy).
- Code: `scene/kien_truc/cau_thang.ts` viết lại (`stairLayout` thang thẳng ngoài trời rộng 1,8 m, dốc 30°, chiếu nghỉ + cầu
  nối; `gapForBridge` mở đầu tường cho cầu nối), `lau_sach.ts` (`lauSachStairs`, sàn tầng 2 liền, kệ tầng 1 hết bị gian
  thang cắt), `tra_lau.ts` (tầng 1 lại 3 bàn trà). Luật R-VA-3 sửa (sổ + online, `--mark-synced`). Cảnh: hồ phải Tàng Thư Các
  (−30; −25) rộng 7 → (−31,5; −25) rộng 5 (hồ trái đối xứng −46,5), tùng (−24; −31) → (−22; −31) — không chắn thang
  (design 2026-11-13.26). Ảnh `design/screens/Canh-loi-L6-*.png`.
- Thử máy: trà lâu (0; −64): ra ngoài hồi phải, đi thẳng lên thang → camera không bị che, qua cầu nối vào tầng 2. Tàng Thư
  Các: chân thang ở (−27,4; −25), đi thẳng về bắc lên. Còn khó / bị che → quay màn hình gửi.
- Lần 2 (trà lâu — khe giữa lan can thang và mép sàn tầng 2): thang đặt cách mép nền 1 m (`clear: 1`) để tránh hiên lửng
  → dọc vế thang có khe ~1 m nhìn xuống mái hiên, chỉ đoạn chiếu nghỉ có cầu nối. Người dùng chọn "áp thang sát nhà":
  `tra_lau.ts` `clear: 0` (thang sát mép nền), hiên lửng phía hồi phải lùi vào sát tường (`skirt` thêm tham số `dx` —
  `mai.ts`), cầu nối gỗ lấn 0,15 m vào trong mép nền phủ chỗ nối (`cau_thang.ts`, dùng chung cả Tàng Thư Các). Test:
  `web/src/traLau.test.ts` — `'R-VA-3 (L-6): thang áp sát nhà — … không còn khe hở'`, `'(L-6): mái hiên lửng phía hồi phải
  lùi vào, không đâm vào thang'` (đỏ trước, xanh sau). Tàng Thư Các chưa đổi: thang ở ngoài nền đá rộng 1 m có lan can →
  áp sát vẫn còn khe trên nền; muốn liền phải làm hành lang tầng 2 — chờ người dùng quyết.
- Thử máy (lần 2): trà lâu — leo thang hồi phải, nhìn sang trái: lan can thang sát mép sàn tầng 2, không còn dải hở; qua cầu
  nối vào tầng 2 không thấy khe. Còn hở → chụp màn gửi.
- Lần 3 (Tàng Thư Các — khe giữa cầu nối và sàn tầng 2): nguyên nhân — sàn tầng 2 chỉ tới x = w / 2 (9) mà cầu nối gỗ +
  lan can hai bên bắt đầu từ mặt ngoài nền đá (w / 2 + 1 = 10) → dải hở ~0,85 m nhìn xuống mái hiên, và dải đó không có lan
  can (bước ra là rơi). Sửa: `StairInput.deckX` (mới; thiếu = `xWall`, trà lâu giữ nguyên) — cầu nối, lan can trước / sau
  và hộp chặn mép trước kéo vào tới hàng lan can tầng 2; `lauSachStairs` đặt `deckX` = hàng cột hồi tầng 2 (8,4).
  Test `web/src/lauSach.test.ts` — `'R-VA-3 (L-6): cầu nối + lan can kéo vào tới hàng lan can tầng 2 …'`, `'R-VA-3 (L-6):
  đứng trên cầu nối ở dải giữa sàn tầng 2 và nền đá, đi ra trước → lan can chặn …'` (đỏ trước, xanh sau; 27 test Tàng
  Thư Các + trà lâu xanh). Code: `scene/kien_truc/cau_thang.ts`, `lau_sach.ts`. Đã `npm run build`.
- Thử máy (lần 3): Tàng Thư Các (−33; −22) — lên thang hồi phải tới chiếu nghỉ, nhìn về phía nhà: cầu nối gỗ liền vào sàn
  tầng 2, lan can hai bên chạy tới hàng cột; đi dọc mép trước cầu nối → bị lan can chặn. Còn hở → chụp màn gửi.
- Commit: chưa (chưa được yêu cầu).

**Lịch sử**
- 2026-11-13: ghi, sửa luôn.
- 2026-11-13: thử máy trà lâu — "khoảng cách giữa lan can đến bề mặt tầng 2 có khoảng trống mặc dù vẫn đi qua được" (ảnh: khung lan can cầu nối, mặt lối xám, hở trước sàn tầng 2). Mở lại, sửa luôn.
- 2026-11-14: "cầu thang ở tàng thư các vẫn đang lỗi . Phần cầu thang lên với phần tầng vẫn chưa khớp nhau vẫn còn khoảng
  trống" (ảnh: từ chiếu nghỉ thấy dải mái xám giữa cầu nối và sàn tầng 2). Sửa luôn (lần 3) → chờ thử máy.

### L-5 · Cổng Sơn Môn (model AI) quá lớn, đế đá chân trụ cao hơn người

- Trạng thái: chờ thử máy · Mức độ: nhỏ (sai tỉ lệ nhìn thấy rõ nhưng không cản chơi) · Phần: cảnh — cổng `gates[].model`
  (`web/src/scene/gate.ts`) · Quy tắc: chưa có (R-VA-1 cột cổng — va chạm giữ nguyên)
- Báo: 2026-11-13 — "cổng sơn môn hiện tại đang quá lớn đặc biệt là các khối đã ở chân"
- Các bước: 1. Mở app / Canvas 3D. 2. Đi từ chỗ xuất phát (0; 50) lên cổng Sơn Môn (0; 44).
- Mong đợi / thực tế: cổng cỡ như cổng khối cũ (~15 m), đế đá thấp hơn vai nhân vật / cổng rộng 19,9 m, cao 18,8 m, đế đá
  cao ~3 m, rộng 2,1 m (nhân vật 2,1 m).
- Bằng chứng: ảnh chụp Canvas 3D khi làm `docs/tasks/2026-11-13-cong-son-mon-model.md` (scratchpad); trên máy: chưa có.
- Hướng sửa (người dùng chọn): thu nhỏ cả cổng × 0,75 + nén riêng khối đá chân xuống ~1,2 m, hẹp lại.

**Sửa**
- Nguyên nhân: model giữ tỉ lệ ảnh thiết kế (đế đá ≈ 0,16 chiều cao cổng) và được co cho bề ngang bằng cổng khối
  (19,9 m) → cổng cao 18,8 m, đế ~3 m. Co đều cả cổng không đủ: cổng vừa cảnh thì đế vẫn ≈ cao người.
- Test: `web/src/scene/gateFeet.test.ts` — `'(L-5): khối đá chân trụ thấp xuống ~1,2 m và hẹp lại, trụ giữ nguyên bề dày'`,
  `'(L-5): đế đã thấp hơn mức cần → không đổi gì'` (đỏ trước khi có `squashFeet`).
- Code: `web/src/scene/gateFeet.ts` (mới, `squashFeet` — tìm trục trụ + đỉnh đế từ lưới, nén đế về 1,2 m, thu ngang × 0,75,
  hạ phần trên), `scene/staticModel.ts` `bakeTransforms` (toạ độ meshopt lượng tử hoá → số thực), `scene/gate.ts`
  (`FEET`, `modelScale`), `scene/spec.ts` + `specCheck.ts` (`gates[].modelScale`), `design/scene/scene.json`
  `modelScale: 0.75` (design 2026-11-13.22). Kết quả: cổng rộng ≈ 14,9 m, cao ≈ 13 m, đế 1,2 m; ảnh
  `design/screens/Canh-loi-L5.png`.
- Thử máy: `flutter run` → đi từ (0; 50) lên cổng: đế đá thấp hơn vai nhân vật, đi qua khe giữa được, đâm trụ thì dừng.
  Còn lỗi → gửi ảnh chụp màn.
- Commit: chưa (chưa được yêu cầu).

**Lịch sử**
- 2026-11-13: ghi, sửa luôn (người dùng chọn).

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

