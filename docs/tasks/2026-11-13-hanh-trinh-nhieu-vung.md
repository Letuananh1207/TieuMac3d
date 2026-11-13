# Hành trình nhiều vùng — Truyền Tống Đài + vùng 1 Rừng trúc
- Yêu cầu: "Hành trình nhiều vùng theo design 2026-11-13.6 (design/scene/hanh_trinh.md + docs/tham_khao/rung-truc.md):
  nhiều cảnh, Truyền Tống Đài thay Diễn Võ Trường, mở vùng theo số chữ, vùng 1 Rừng trúc."
- Loại: thêm (nhiều cảnh, đài, vùng mới, tiến độ) + sửa hành vi (khu 3) + xoá (đài tỉ thí, giá binh khí) · Cỡ: lớn
- Trạng thái: đang làm — đợt 2 xong code, chờ duyệt ảnh cảnh + thử máy (vật sống: đợt sau)

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — luật mới R-HANH-1 (mở vùng theo số chữ), R-HANH-2 (truyền tống + về nhà); sửa ví dụ
  R-HUD-1, R-VA-1 (bỏ Diễn Võ / đài tỉ thí / giá binh khí), R-MAN-2 (màn tải khi đổi vùng mang tên vùng).
- `docs/bridge.md` + `web/src/bridge/flutterBridge.ts` + `app/lib/scene/` — sự kiện tiến độ (số chữ, bộ thủ đã học).
- `web/src/scene/loadSpec.ts` — nạp nhiều đặc tả (`design/scene/*.json`), chọn theo mã vùng.
- `web/src/scene/spec.ts`, `specCheck.ts` — trường mới `teleport` (đài: tâm, ∅, 6 cột → mã vùng) và `homeRing`
  (vòng về nhà của vùng); mặc định = không có (cảnh cũ giữ nguyên).
- `web/src/scene/truyenTong.ts` (mới) — sân tròn, viền, phù hiệu 文淵, 6 cột + biểu tượng, vòng trận sáng / tối, hạt sáng.
- `web/src/zones/journey.ts` (mới) — dữ liệu 7 chặng (mã, tên, chữ Hán, mốc), `isOpen(vùng, tiến độ)`; thuần, có test.
- `web/src/zones/` — theo dõi đứng trong vòng trận (dùng lại kiểu `ZoneTracker`).
- `web/src/scene/props.ts`, `spec.ts` — bỏ `dai-ti-thi`, `gia-binh-khi` (sau khi đặc tả không còn dùng).
- `web/src/main.ts` — chọn vùng theo `?vung=`, ghép đài + vòng về nhà, chuyển cảnh.
- `web/scripts/check-scene.mjs` — kiểm mọi file đặc tả, không chỉ `scene.json`.
- `design/scene/scene.json` (khu 3 → Truyền Tống Đài) và `design/scene/rung-truc.json` (mới) — **việc thiết kế**
  (`/canh`); xem điểm cần quyết định 2.

**Cần kiểm tra**
- `app/lib/scene/` — sau khi trang tải lại (đổi vùng), Flutter có gửi lại biến safe area, `debug`, tiến độ không
  (đang gửi ở `onLoadStop`?).
- `web/design.html` / `designPreview.ts` — Canvas 3D phải chọn được vùng để xem.
- `web/src/zones/areaTracker.ts` — chip / thẻ khu theo từng cảnh (R-HUD-1/3).
- `web/src/player/npc.ts` — NPC theo đặc tả từng vùng (Tiểu Mặc đọc mẫu ở đình — đợt 2).

**Không đụng**: giảng đường, thư viện, nội thất, bài học 快 / 書, màn bài học native, nhân vật, điều khiển.

## Giả định / cần quyết định

1. **Chuyển cảnh = tải lại trang** với `?vung=rung-truc` (giả định, đề xuất). Vì sao: three.js không tự giải phóng
   bộ nhớ GPU khi bỏ cảnh; tải lại trang thì sạch hoàn toàn, dùng lại đúng màn tải hiện có (R-MAN-2), mỗi vùng chỉ
   tốn bộ nhớ của chính nó — hợp điện thoại. Giá phải trả: tiến độ phải lưu ngoài trang (xem 3).
2. ✅ (người dùng 2026-11-13) Phiên này **làm thay `/canh`**: sửa khu 3, dựng `rung-truc.json` bằng thứ đã có, chụp
   ảnh cho duyệt rồi mới áp.
3. ✅ **Flutter giữ tiến độ** (gói `shared_preferences`, ghim phiên bản — gói chính thức của Flutter, lưu khoá–giá trị
   nhỏ, chạy cả Android / iOS / web), gửi sang trang qua cầu nối khi trang tải xong. Trình duyệt không có Flutter →
   trang tự lưu tạm `localStorage`.
4. ✅ **Mở bài là tính** "đã học" (tạm). Thử mốc: `?chu=<số>` (chỉ trình duyệt / bản debug).
- ✅ Làm **hai đợt**; xong đợt 1 báo duyệt rồi mới sang đợt 2.
5. Mốc mở khoá lấy đúng đề xuất 2026-11-13.6 (Giang Nam "xong bộ thủ" = học đủ ≈ 50 bộ thủ của vùng 1).

## Giao diện chưa có thiết kế (không dựng tạm)
- Nhãn "Cần … chữ" khi tới gần cột khoá · thẻ học bộ thủ (chạm bia / vật) → phiếu
  `docs/phieu_thiet_ke/2026-11-13-hanh-trinh-hud.md` (soạn ở nhiệm vụ 1).
- Thẻ tên vùng khi tới: dùng màn tải (tên vùng + chữ Hán) và thẻ tên khu sẵn có (R-HUD-3) — không cần màn mới.

## Nhiệm vụ

### Đợt 1 — nhiều cảnh, Truyền Tống Đài, Rừng trúc dựng bằng thứ đã có
- [x] 1. Soạn phiếu thiết kế HUD hành trình (`docs/phieu_thiet_ke/` · theo `/ui-apply phieu` · xong khi phiếu có
      nhãn "Cần … chữ" + thẻ bộ thủ).
- [x] 2. Luật: R-HANH-1, R-HANH-2 + sửa R-HUD-1, R-VA-1, R-MAN-2 trong sổ → chép lên tài liệu xác nhận (ô Xác nhận
      về Chờ) → `--mark-synced` (`docs/testing/quy_tac.md` · xong khi `rule_trace` không báo lệch).
- [x] 3. Dữ liệu chặng `zones/journey.ts` + test mở khoá (299 → Bồng Lai tối, 300 → sáng) (lớp `zones` · xong khi
      test xanh).
- [x] 4. Đặc tả nhiều cảnh: `loadSpec` nạp `design/scene/*.json`, trường `teleport` / `homeRing` có mặc định,
      `check-scene` kiểm mọi file (lớp `scene` · xong khi `scene:check` in cả hai cảnh, cảnh cũ không đổi).
- [x] 5. (gộp vào 21) Thiết kế cảnh (theo quyết định 2): khu 3 → Truyền Tống Đài, bỏ đài tỉ thí + 4 giá binh khí, tên khu
      "Truyền Tống Đài 傳送台"; `rung-truc.json`: trúc dày, lối đá, suối, thác cuối lối, sương lục nhạt, vòng về nhà
      ở chỗ xuất hiện (`design/scene/` · xong khi người dùng duyệt ảnh).
- [x] 6. Dựng Truyền Tống Đài `scene/truyenTong.ts` — sân ∅ 26, 6 cột 5 m + biểu tượng, vòng ∅ 4 sáng (ngọc lục +
      chấm vàng, hạt sáng) / tối (lớp `scene` · ước +6–8 draw call, bỏ đài + giá ≈ −2 · xong khi chụp headless đúng).
- [x] 7. Tiến độ qua cầu nối: `docs/bridge.md` trước, rồi `bridge/` + Flutter (theo quyết định 3, 4) (xong khi
      `flutter test test/scene` xanh).
- [x] 8. Ghép `main.ts`: `?vung=`, đứng vào vòng sáng → màn tải → vùng; vòng về nhà → về đài trước cột vùng vừa rời;
      vòng tối không tác dụng (xong khi đi thử trên trình duyệt đủ hai chiều).
- [x] 9. Bỏ mã `dai-ti-thi` / `gia-binh-khi` khỏi `props.ts` + `PROP_KINDS`, cập nhật Bản đồ tính năng `/lead`.
- [x] 10. Build + kiểm cuối, báo người dùng.

### Đợt 1b — một vòng trận + cuộn bản đồ 3D (người dùng 2026-11-13, sau khi thử máy)
Yêu cầu: "thay vì hiện ra nhiều ô cho các map khác nhau thì hiện ra 1 ô rồi tạo hiệu ứng chung sau đó hiển 1 cái bản
đồ lớn bay lên và chọn". Đã chọn: cuộn bản đồ **3D trong cảnh** · đài chỉ còn **một vòng trận lớn giữa sân** (bỏ 6 cột)
· vòng trận ở vùng **cũng mở bản đồ** (về tông môn hoặc đi thẳng vùng khác).
Trái quyết định cũ "không có màn bản đồ" (mục 2026-11-13.6) → ghi mục thiết kế mới.

Luồng: bước vào vòng → vòng sáng dần + cột sáng bốc lên + hạt xoáy (~1,2 s) → cuộn bản đồ bay lên trước mặt, mở ra →
chạm một vùng: đã mở + có cảnh → màn tải → sang vùng; khoá → mục đó nhấp nháy, ghi "Cần 300 chữ" sẵn trên bản đồ;
đóng bằng **nút rõ ràng** (người dùng: "cần phải rõ ràng") → HUD mới. Người dùng chọn **đợi thiết kế** vẽ bản đồ
+ nút đóng (phiếu `2026-11-13-hanh-trinh-hud.md` mục 1–2) rồi mới dựng.

- [x] 15. Luật: viết lại R-HANH-1 (trạng thái vùng trên bản đồ thay cho cột), R-HANH-2 (vòng → hiệu ứng → bản đồ →
      chạm chọn; ra khỏi vòng thì cuộn lại; xuất hiện cạnh vòng, ngoài vòng) → chép online → `--mark-synced`.
- [x] 16. Cầu nối: `getProgress` trả thêm `need` (mốc từng vùng khoá: số chữ / số bộ thủ) để bản đồ ghi "Cần … chữ";
      sửa `docs/bridge.md` trước, Dart + TS + test.
- [x] 17. Đặc tả: `teleport` gọn lại `{enabled, center, radius (sân; 0 = chỉ vòng), ringRadius, colors}`, bỏ cột /
      `arc` / `regions` / `homeRing`; Rừng trúc dùng `teleport` (radius 0) thay `homeRing`; `check-scene` + `/canh`
      tham chiếu.
- [x] 18. (làm ở 23) Dữ liệu bản đồ `web/src/zones/journeyMap.ts`: 7 nơi (tông môn + 6 vùng) — mã, tên, chữ Hán, vị trí trên bản
      đồ; vùng "đang ở" đánh dấu.
- [x] 19. (đã xong phần vòng trận lớn + hiệu ứng nạp, cột sáng, hạt xoáy — `truyenTong.ts`; **cuộn bản đồ chờ thiết kế**) Dựng: vòng trận lớn + hiệu ứng (cột sáng, hạt xoáy) + cuộn bản đồ (2 trục cuộn + tấm giấy vẽ bằng canvas
      kiểu thuỷ mặc: núi, sông, mỗi vùng chữ Hán + tên + trạng thái), chạm chọn bằng tia dò → vùng. Ước ≈ 6 draw call
      (ít hơn 6 cột cũ). Bỏ code 6 cột.
- [x] 20. (thay bằng bản đồ ở 27; đã xong bản tạm: `zones/ringCharge.ts` — ở trong vòng 1,2 s → đi tới nơi duy nhất (tông môn → vùng đầu đã mở có cảnh; vùng → tông môn); **bản đồ + nút đóng chờ thiết kế**) Ghép `main.ts`: máy trạng thái (đứng ngoài → nạp ~1,2 s → bản đồ mở → chọn / ra khỏi vòng), về nhà đứng
      cạnh vòng, ngoài vòng.
- [x] 21. Chụp ảnh → người dùng duyệt → `/canh chot` một mục CHANGELOG gộp (Truyền Tống Đài kiểu mới + Rừng trúc) →
      build, kiểm cuối.

### Đợt 1c — áp thiết kế 2026-11-13.9: bản đồ truyền tống (`/ui-apply`)
Nguồn: `design/docs/screen_specs.md` "Bản đồ truyền tống", `design/scene/ban-do/{ban-do-goc.png,ban-do.json}`,
`design/source/BanDo-{giay,doc,ngang}.dc.html`, `design/l10n/vi.arb` (`map*`, `place*`), token `map-paper`,
`scroll-wood`, `jade-press`. Không đụng: nút hành động, hội thoại NPC (kế hoạch khác), thẻ bộ thủ (đợt 2).

- [x] 22. Luật: R-HANH-2 theo thiết kế — vòng → hiệu ứng 1,2 s → bản đồ; mở thì đứng yên (joystick ẩn, kéo không xoay
      camera); "Đóng bản đồ" → đóng; chạm nơi đã mở có cảnh → màn tải; chạm nơi khoá / sắp mở → thẻ yêu cầu ≈ 3 s;
      chạm nơi đang ở → không gì. Bỏ phần "tạm". Chép online → `--mark-synced`.
- [x] 23. Dữ liệu: `web/src/zones/journeyMap.ts` đọc `ban-do.json` (Vite import lúc build như `scene.json`), trạng thái
      từng nơi (mở · đang ở · sắp mở · khoá) từ `open` + cảnh có sẵn; `van-uyen` = tông môn. Thuần.
- [x] 24. Cuộn 3D `web/src/scene/banDo.ts`: giấy = CanvasTexture (ảnh gốc + lớp trạng thái vẽ theo `ban-do.json`,
      nhấp nháy son khi chạm nơi khoá), 2 trục `scroll-wood` đầu `jade` viền `gold`; bay lên từ vòng + mở cuộn
      (~0,6 s), đặt trước camera: dọc rộng 97 % màn, tâm ở 40 % chiều cao; ngang cao 76 %. Chạm → tia dò → UV → nơi
      (r 150 px). Ước +3 draw call khi mở.
- [x] 25. HUD `web/src/ui/mapHud.ts` + `index.html` + `style.css`: lớp tối 28 %, viên gợi ý "Chạm một nơi để truyền tống",
      thẻ yêu cầu (kính sương, viền son, khoá 28, 2 dòng, tự ẩn 3 s), nút "Đóng bản đồ" (dọc giữa dưới, ngang góc dưới
      phải), safe area; token mới vào `:root`.
- [x] 26. `input/pointers.ts`: cờ chặn kéo (bản đồ mở → không joystick, không xoay; chạm vẫn nhận).
- [x] 27. Ghép `main.ts`: máy trạng thái vòng (nạp 1,2 s → bản đồ mở → chọn / đóng); bỏ `interimDestination`.
- [x] 28. (tuỳ quyết định) Nút quay lại của máy đóng bản đồ: sự kiện cầu nối `back` (Flutter → JS, trả "đã xử lý").
- [x] 29. Build, chụp dọc + ngang, `appliedVersion`, phiếu `2026-11-13-hanh-trinh-hud.md` mục 1–2 → đã áp.

### Đợt 2 — Rừng trúc cho ra chất (người dùng "bắt đầu", 2026-11-13)
Nguồn: `docs/tham_khao/rung-truc.md` ("Dựng low-poly", "Bộ thủ trong cảnh"), thiết kế 2026-11-13.9 "Thẻ học bộ thủ"
(`design/source/TheBoThu-*.dc.html`, chuỗi `radical*`).

- Đã chọn (người dùng 2026-11-13): 50 bộ thủ ngay · Claude vẽ dải "từ hình đến chữ" cho 19 bộ tượng hình · vật "sống" để đợt sau.

**2a — cảnh**
- [x] 11. Trúc mao: kiểu cây mới `truc-mao` (`scene/trucMao.ts`) — thân 6 cạnh 12–18 m có vòng đốt, chùm lá dẹt ở 1/3
      trên, 2 màu thân (xanh / già vàng), nghiêng nhẹ, **đung đưa ở ngọn** (lệch đỉnh trong shader Lambert theo độ cao +
      pha mỗi cây); instancing 3 draw call; ≤ 1 500 cây. Kiểu `truc` cũ giữ cho tông môn.
- [x] 12. Đình mái chóp: kiểu nhà mới `dinh` (`kien_truc/dinh.ts`) — nền đá, 4 / 6 cột gỗ mộc, mái chóp toản tiêm ngói xám
      xanh, không tường, đi vào được (va chạm cột); `buildings[].kind: "dinh"`, `sides: 4 | 6`.
- [x] 13. Bia bộ thủ: danh sách đặc tả mới `steles: [{x, z, rotY, radical}]` (`scene/bia.ts`) — đá bia chóp bán nguyệt
      ≈ 0,9 × 1,6 m trên đế, mặt khắc bộ thủ lớn + tên Việt nhỏ (atlas chữ, 1 draw call cho mọi bia), viền vàng khi đã học,
      mờ khi chưa; va chạm hộp.
- [ ] 14. (đã dựng, chờ duyệt ảnh → chốt mục CHANGELOG) `/canh` (làm thay): `rung-truc.json` đổi cụm `truc` → `truc-mao`, đặt đình ở chỗ nghỉ giữa lối, ≈ 50 bia rải dọc
      lối theo thứ tự học; chụp → duyệt → chốt mục CHANGELOG.

**2b — học bộ thủ**
- [x] 15. Luật R-HANH-3 (bia: chạm bia / nút nổi cạnh bia → thẻ học; "Đã học · khắc vào bia" → bộ thủ đã học, bia viền
      vàng; Giang Nam mở khi học đủ bộ thủ Rừng trúc) → sổ + online.
- [x] 16. Dữ liệu `web/src/zones/radicals.ts`: bộ thủ (mã, dạng, dạng đủ, tên Việt, pinyin, số nét, 2–3 chữ ví dụ, hình
      "từ hình đến chữ" SVG nét nếu có). `rungTrucRadicalCount` (Dart) = số bộ trong dữ liệu.
- [x] 17. Cầu nối: `openRadical` (JS → Flutter, như `openLesson`) + Flutter ghi bộ thủ đã học; `getProgress` trả thêm
      `radicals: [...]`. `docs/bridge.md` trước; test Dart.
- [x] 18. Màn Flutter `app/lib/lesson/radical_screen.dart` theo `TheBoThu-*` (dọc + ngang, lần đầu / đã học, một / hai
      dạng); dải "Từ hình đến chữ" vẽ SVG nét bằng `CustomPaint`. Không có Flutter → bảng HTML dự phòng (`lessonBoard`).
- [x] 19. Ghép `main.ts`: nút học nổi cạnh bia gần nhất (kiểu nút học "Học bộ 氵"), chạm bia mở thẻ; bia đổi viền khi học.
- [ ] 20. (đợt sau — người dùng chọn) Vật "sống": chạm suối → 氵, đá → 石, trúc → ⺮… mở thẻ bộ thủ đó.
- [ ] 21. Build, kiểm cuối, thử máy.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build ·
cd app && flutter analyze · flutter test -r failures-only test/scene · dart tool/rule_trace.dart
