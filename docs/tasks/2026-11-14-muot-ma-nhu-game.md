# Mượt mà như game chuyên nghiệp — không lag, giữ đồ hoạ đẹp
- Yêu cầu: "nghiên cứu xem các game cùng nền tảng chuyên nghiệp làm sao để tối ưu mượt mà, không lag mà vẫn giữ đồ
  họa đẹp để áp dụng vào ứng dụng hiện tại"
- Loại: sửa (hiệu năng) · Cỡ: lớn · Trạng thái: xong bước 1–5 (còn: khựng ~0,7 s lúc vào cảnh, đo máy thật)
- Nối tiếp `2026-11-11-moc-4-hieu-nang.md` (đã có: pixelRatio ≤ 1,5, không bóng realtime, Lambert, gộp khối, cỏ / đá
  instanced, dừng vẽ khi app xuống nền, bảng gỡ lỗi; đo Canvas 3D ≤ 113 draw call, ≤ 131k tam giác). Còn dở: **đo máy thật**.

## Nghiên cứu — game di động chuyên nghiệp làm gì (và app mình đã có chưa)

| Kỹ thuật | Game làm thế nào | App hiện tại |
|---|---|---|
| Đo trước, tối ưu sau | Ngân sách ms / khung (60 fps = 16,6 ms; 30 fps = 33 ms), đo trên máy yếu nhất hỗ trợ | Bảng gỡ lỗi có fps, draw call, tam giác; **chưa đo máy thật**, chưa có ms / khung, 1 % khung chậm |
| Mức chất lượng theo máy | Genshin, Honkai…: Thấp / Vừa / Cao / tự chọn theo máy; khung hình 30 / 45 / 60 | **Chưa có** — mọi máy cùng một mức |
| Độ phân giải động | Unity Dynamic Resolution, drei PerformanceMonitor: đo thời gian khung, hạ / nâng độ phân giải vẽ theo bậc, có trễ để không nhấp nháy; chữ / HUD giữ nét | **Chưa có** — cố định pixelRatio ≤ 1,5 |
| Giới hạn khung hình đều | 30 fps đều mượt hơn 40–60 giật; máy nóng sau 10–20 phút thì hạ mức (giảm nóng = giảm tụt fps) | **Chưa có** — vẽ theo rAF, không giới hạn, không theo dõi nóng |
| Cắt bỏ (culling) | Chia thế giới thành ô; ô ngoài khung nhìn / ngoài sương không vẽ; vật nhỏ ở xa tắt sớm | **Gộp toàn cảnh theo vật liệu** (`scene/merge.ts`) → mỗi khối trải cả tông môn, không cắt được: GPU xử lý hết ~130k tam giác mọi khung |
| LOD (bớt chi tiết khi xa) | Cây / nhà xa dùng bản ít tam giác hoặc tấm ảnh (impostor) | Núi xa đã là khối đơn giản; cây / nhà chưa có LOD |
| Ánh sáng nướng sẵn | Không bóng realtime; bóng / AO nướng vào màu đỉnh hoặc texture; sương che xa | Đã không bóng realtime, có sương; chưa có AO nướng (đẹp hơn mà gần như miễn phí) |
| Khử răng cưa hợp lý | GPU điện thoại (tile-based) làm MSAA khá rẻ ở độ phân giải vừa; máy yếu tắt | MSAA bật mọi máy, cộng pixelRatio 1,5 |
| Hạn chế vật trong suốt chồng nhau (overdraw) | Vẽ vật đục trước, gần → xa; ít lớp trong suốt lớn | Mái mờ, mây, sương — chưa đo |
| Biên dịch shader trước | Màn tải biên dịch sẵn mọi vật liệu → không khựng khi vào khu mới | **Chưa có** (`renderer.compileAsync`) |
| Không rác bộ nhớ mỗi khung | Không tạo object mới trong vòng lặp → không khựng do dọn rác (GC) | Phần lớn đã dùng biến tái sử dụng; chưa soát hết |
| WebView (riêng app mình) | — | Nền WebView **trong suốt** → Android phải trộn lớp mỗi khung; nên đặt nền đục sau khi tải |

Nguồn: hướng dẫn cộng đồng Genshin (khung hình 30 / 45, render scale ~0,8, nóng máy sau 10–20 phút), Unity Dynamic
Resolution, drei PerformanceMonitor, Arm / Vulkan "tile-based rendering best practices", hướng dẫn hiệu năng three.js.
Số liệu cộng đồng chưa kiểm chứng — dùng làm hướng, quyết định bằng số đo trên máy thật.

## Phạm vi
**Sẽ sửa**
- `web/src/ui/hud.ts` — bảng gỡ lỗi thêm ms / khung (trung bình, 1 % chậm nhất), mức chất lượng, độ phân giải đang dùng.
- `web/src/scene/quality.ts` (mới, lớp `scene/`) — mức chất lượng Thấp / Vừa / Cao + bộ điều tiết độ phân giải động (thuần, có test).
- `web/src/scene/renderer.ts` — nhận mức chất lượng (pixelRatio, antialias), đổi độ phân giải lúc chạy.
- `web/src/scene/merge.ts` — gộp **theo ô** (vd. 24 m) thay vì toàn cảnh → cắt bỏ ngoài khung nhìn chạy được.
- `web/src/main.ts` — ghép: chọn mức lúc mở, điều tiết mỗi khung, giới hạn khung hình, biên dịch shader trong màn tải.
- `web/src/scene/spec.ts` — ngưỡng (ô gộp, khoảng cắt xa) nếu cần đưa vào đặc tả, có mặc định giữ cảnh cũ.
- `app/lib/scene/scene_view.dart` — nền WebView đục sau khi trang tải (giữ chống chớp trắng lúc tải).
- `docs/testing/quy_tac.md` — luật mới R-HIEU-1 (mức chất lượng tự chọn + độ phân giải động), R-HIEU-2 (giới hạn khung hình).

**Cần kiểm tra**: `rooms.ts` (mái mờ — khối riêng, không gộp chung), `tapToMove.ts` / `GroundPicker` (tia dò mặt sân — `keep`),
`designPreview.ts` (Canvas 3D dùng cùng `mergeStatic`), đo lại draw call (gộp theo ô làm **tăng** draw call — giữ ≤ 150).

**Không đụng**: model nhân vật / NPC, nội dung cảnh, thiết kế `design/`. **Không thêm giao diện cài đặt** (chưa có thiết kế →
nếu muốn nút "Đồ hoạ: Thấp / Vừa / Cao" thì soạn phiếu sau).

## Giả định / cần quyết định
Người dùng chốt (2026-11-14):
1. Khung hình: **60 fps máy khoẻ, tự xuống 30 fps đều** khi máy yếu / nóng.
2. Mức chất lượng **tự chọn, không có nút**.
3. **Làm lần lượt**: bước 1 (đo) trước, người dùng đo máy thật, rồi từng bước sau, đo lại mỗi bước.

## Nhiệm vụ (theo thứ tự lợi nhiều – rủi ít; mỗi bước đo lại)
- [x] 1. **Đo**: bảng gỡ lỗi thêm ms / khung + 1 % chậm; bạn đo trên máy thật → ghi số "trước" vào file này.
      (`ui/hud.ts` · test: hàm tính trung bình / 1 % thuần · xong khi bảng hiện đủ số)
- [x] 2. **Cắt bỏ ngoài khung nhìn** — *đổi so với kế hoạch*: đo `npm run bench -- --tam-giac` cho thấy gộp theo ô gần như
      không giảm tam giác (125k → 121–123k) mà thêm draw call (53 → 90) → **bỏ**. Phần nặng thật: **địa hình một lưới 45k**
      (luôn trong khung) + **3 model người × 16k luôn vẽ** (`frustumCulled = false`). Sửa: địa hình chia mảnh 24 × 24 ô
      (`scene/terrain.ts` `TERRAIN_TILE`), model người cắt bỏ được với khung bao nới 1,5 lần (`player/autoRig.ts`,
      test `autoRig.test.ts`). Kết quả (bench, 390×844): tam giác vẽ 115–125k → **49–80k**, draw call +10.
- [x] 3. **Biên dịch shader trong màn tải** (`main.ts` `renderer.compileAsync` · xong khi vào trà lâu / sang vùng không khựng).
      Đo 2 s đầu sau màn tải: GPU máy tính 1 % chậm 30–37 → 23–24 ms; máy yếu gần như không đổi (~0,7 s khựng lúc vào cảnh
      do **nguyên nhân khác** — nghi texture tải lần đầu / NPC nạp sau màn tải; ghi để tìm sau).
- [x] 4. **Mức chất lượng + độ phân giải động** (`scene/quality.ts`, `renderer.ts`, `main.ts` · test: bộ điều tiết hạ khi
      ms > ngưỡng đủ lâu, nâng khi dư, không nhấp nháy · xong khi máy yếu tự giữ ≥ 30 fps đều).
      Cao: pixelRatio ≤ 1,5, MSAA, cỏ đủ. Vừa: ≤ 1,25. Thấp: 1,0 (động tới 0,8), tắt MSAA, cỏ thưa, sương gần hơn.
      Đã làm: `scene/quality.ts` (`pickTier`, `ResolutionGovernor`, 7 test), `renderer.ts` (`probeGpu`, `createStage` nhận
      mức), `main.ts`; luật R-HIEU-1. Mức: Cao 1,5→1,0 · Vừa 1,25→0,85 · Thấp 1,0→0,7 (chưa làm "cỏ thưa, sương gần" — để
      dành nếu máy thật còn thiếu). Bench máy yếu: **11–16 → 34–59 fps**, khựng / 2 s 18–29 → 0,3–2,4; GPU máy tính giữ Cao 1,5×.
- [x] 5. **Giới hạn khung hình đều** — `scene/quality.ts` `FrameCap` (4 test), `main.ts`; luật R-HIEU-2. Tối đa 60 fps (màn
      120 Hz không vẽ 120); độ nét ở đáy mà vẫn chậm 3 s → 30 fps đều; 60 s sau thử lại 60, hỏng thì chờ gấp đôi (≤ 5 phút).
      Bench: GPU máy tính 120 → **60 fps đều** (GPU làm một nửa); máy yếu → **30 fps đều**, 1 % chậm khi đi 99–125 → 35–58 ms.
- [~] 6. **WebView nền đục — bỏ**: plugin tắt nền trong suốt thì tô nền **trắng**, mà đổi vùng (R-MAN-2) tải lại trang → chớp
      trắng giữa hai lần tải (lý do nền trong suốt có từ đầu). Lợi ích nhỏ, không đo được khi chưa có máy thật.
- [ ] 7. *(để sau, khi còn thiếu)* LOD cây xa, AO nướng vào màu đỉnh, soát rác bộ nhớ trong vòng lặp.
- [ ] 8. Đo lại trên máy thật → bảng "trước / sau".

Ước tính: bước 2 tăng draw call (mỗi vật liệu × số ô có vật liệu đó) — nhắm 120–150; đổi lại GPU chỉ xử lý phần nhìn thấy
(ước 30–60 % tam giác ở góc chơi). Bước 4 trên máy yếu: pixelRatio 1,5 → 1,0 giảm ~55 % điểm ảnh phải tô.

## Đo tự động (`cd web && npm run build && npm run bench [-- --ghi] [--ho-so yeu] [--dpr 1] [--tam-giac]`)
Chrome headless qua CDP, màn 390×844 @3x (app kẹp 1,5×), lộ trình phím / chuột cố định; hồ sơ `may-tinh` (GPU thật) và `yeu`
(SwiftShader + CPU ×4 ≈ máy yếu). Kết quả: `docs/perf/bench.md`. So TRƯỚC / SAU trên cùng máy — không thay đo máy thật.

| Máy yếu (fps theo chặng: giữa sân · đi rẽ · đi xa · cả sân) | tam giác vẽ |
|---|---|
| Trước: 10 · 13 · 13 · 15 | 115–125k |
| Sau bước 2: 11 · 15 · 13 · 16 | 49–93k |
| Thử pixelRatio 1,0 (chưa áp — bước 4): 14 · 21 · 25 · 29 | như trên |
| Sau bước 3 + 4 (tự chọn Thấp, độ nét động 0,7–1,0): **34 · 50 · 57 · 59** | 43–80k |

→ Máy yếu nghẽn ở **số điểm ảnh** (tô màu) hơn tam giác → bước 4 (độ phân giải động) lợi nhất.

## Số đo máy thật (khi có điện thoại cắm máy)
Bảng gỡ lỗi (bản debug `flutter run`, hoặc trình duyệt `?debug`): dòng 1 `fps · ms (1%: ms) · khựng N · dc · ▲`, dòng 2 GPU ·
pixelRatio · độ phân giải vẽ. Ghi mỗi chỗ sau ~10 giây đứng / đi:

| Chỗ | fps | ms tb | 1 % | khựng / 2 s | dc | ▲ |
|---|---|---|---|---|---|---|
| Góc chơi giữa sân | | | | | | |
| Đi vòng quanh sân (đổi hướng nhiều) | | | | | | |
| Trong trà lâu tầng 2 | | | | | | |
| Sau 15 phút chơi (nóng máy) | | | | | | |

Máy: … (dòng 2 của bảng)

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/scene · dart tool/rule_trace.dart · đo Canvas 3D (draw call ≤ 150, tam giác) + máy thật
