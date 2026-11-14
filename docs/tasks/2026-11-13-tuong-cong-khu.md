# Tường mỏng + cổng khu phân cấp + biển tên trên cổng
- Yêu cầu: "tường đang hơi dày và tôi nghĩ nên đổi phong cách cổng đi vào các khu ngoài ra cũng cần có biển treo đầu
  các cửa vào khu" — người dùng chọn: cổng **phân cấp** (cổng chính 門樓, cổng phụ cổng trăng + biển đá); tường bao
  **0,5 m**, tường chia sân **0,35 m**.
- Loại: thêm (kiểu cổng, biển) + sửa ngoại hình / va chạm (độ dày) · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — trường mới (mặc định giữ cảnh cũ): `walls.thickness` (1), `WallSegment.thickness?`,
  `WallSegment.gates?`, `WallGate.kind?` (`trang` mặc định | `lau`), `WallGate.signs?` (chữ theo hướng mặt nhìn).
- `web/src/scene/walls.ts` — `ringRuns` / `segmentRun` theo độ dày; cắt khe trên đoạn tường thêm.
- `web/src/scene/kien_truc/tuong.ts` — thân / chân / mái tường, cửa sổ hoa, tấm cổng trăng, va chạm theo độ dày; cổng
  trên đoạn tường thêm; kiểu cổng `lau` (門樓); biển đá trên vòm cổng trăng.
- `web/src/scene/kien_truc/chi_tiet.ts` (nếu cần) — biển đá khắc (nền đá, chữ đậm) cạnh `addSign` biển gỗ sẵn có.
- `web/src/scene/signAtlas.ts` — `signText` gom thêm chữ biển cổng (để nạp font Hán).
- `web/src/scene/specCheck.ts` — kiểm trường mới (độ dày 0,2…1,2; khe trên đoạn nằm trong đoạn; `kind`; biển ≤ 4 chữ).
- `web/scripts/check-scene.mjs` — in kiểu cổng, lối đi, biển, độ dày.
- `docs/testing/quy_tac.md` (+ tài liệu online, `--mark-synced`) — ví dụ R-VA-1 (mặt trong tường, cổng nam / bắc là
  門樓 lối đi mới, cổng trăng chia sân z −11), R-DIEU-4 + R-HUD-3 (điểm (0; 0) giờ là đỉnh đồng → (0; 6)), R-HANH-2
  (về tông môn đứng (21,8; 0)), R-GIAO-1 (bỏ "quây lan can son").
- `web/src/zones/dialogs.ts` — Tiểu Mặc: "Truyền Tống Đài giữa sân" → "ngoài cổng đông".
- test: `web/src/scene/walls.test.ts` (mới hoặc thêm) — độ dày, khe trên đoạn, va chạm cổng (R-VA-1).

**Cần kiểm tra** — `collision/colliders.ts` (hộp mỏng hơn: camera kéo lại R-DIEU-4 vẫn đúng), `designPreview.ts`,
`scene/world.ts` (truyền tham số), test `lauSach.test.ts` / `traLau.test.ts` (không dùng tường, chỉ chạy lại).

**Không đụng** — cổng sơn môn đứng riêng (`gates` / `gate.ts`), Flutter `app/`, cầu nối.

## Giả định / cần quyết định
- Biển: mỗi mặt cổng ghi tên khu **người đi qua sẽ vào**; khai báo theo hướng mặt nhìn, vd. cổng nam
  `signs: { nam: "外門", bac: "山門" }` (mặt nhìn nam — phía Sơn Môn — ghi 外門).
  Nam 外門 / 山門 · bắc 天階 (mặt nhìn nam) / 外門 · đông 傳送台 (mặt nhìn tây) / 外門 · tây 棋文苑 (mặt nhìn đông) /
  外門 · khe z −11 藏書閣 (mặt nhìn nam) / 棋文苑.
- 門樓: cửa chữ nhật rộng = `width` − 2 × khung 0,3; cao lối ≈ 3,2 m (thấp hơn tường ≥ 1 m); mái ngói hai mái nhỏ dài
  `width` + 1,6, nhô 0,8 m ra mỗi mặt tường, đỉnh cao hơn tường ≈ 1,2 m; trụ gạch hai bên; biển gỗ (kiểu `addSign`) dưới
  mái hai mặt. Không cánh cửa (luôn đi qua được).
- Tường chia sân cao 2,6 → cổng trăng bán kính 1,25, lối 2,0 m (đủ đi, bán kính nhân vật 0,5). Phiên `/canh` có thể
  nâng lên 3,0 m (lối 2,4) khi đặt lại.
- Mái tường (`prism` 1,5 × 0,5) thu theo độ dày (≈ thickness + 0,5); chân đá dày thêm 0,15 như cũ.
- Ước tính hiệu năng: mỗi 門樓 + biển thêm vài mesh, cùng vật liệu tường / mái / ảnh biển chung → gộp `mergeStatic`;
  +0–2 draw call, < 1k tam giác.

## Nhiệm vụ
- [x] 1. Sổ quy tắc: sửa ví dụ R-VA-1, R-DIEU-4, R-HUD-3, R-HANH-2, R-GIAO-1 → chép lên tài liệu online (ô Xác nhận về
  Chờ) → `dart tool/rule_trace.dart --mark-synced <mã>`. (docs · xong khi rule_trace sạch)
  — **sổ đã sửa** (R-VA-1: trụ 門樓 dày 0,8 → x 3 dừng ở z 16,1); **chưa chép online**: phiên VS Code này không có công
  cụ Claude Docs → chờ người dùng / phiên có Claude Docs chép rồi `--mark-synced R-DIEU-4 R-VA-1 R-HUD-3 R-HANH-2 R-GIAO-1`.
- [x] 2. `spec.ts` + `specCheck.ts`: trường mới + mặc định + kiểm. (scene · test specCheck · xong khi tsc sạch, cảnh cũ
  không đổi)
- [x] 3. `walls.ts`: độ dày cho `ringRuns` / `segmentRun`, khe trên đoạn tường thêm; test thuần (R-VA-1: mặt trong tường,
  khe đoạn). (scene · `walls.test.ts` · xong khi test xanh)
- [x] 4. `tuong.ts`: tường vôi theo độ dày, cổng trăng trên đoạn tường thêm, biển đá trên vòm. (scene)
- [x] 5. `tuong.ts`: kiểu cổng `lau` (門樓) + biển gỗ hai mặt + va chạm hai trụ. (scene · test va chạm lối đi)
- [x] 6. `signAtlas.signText` + `check-scene.mjs` in thông tin cổng. (scene / script)
- [x] 7. Lời thoại Tiểu Mặc (`dialogs.ts`). (zones)
- [x] 8. Đặc tả cảnh qua `/canh` (phiên thiết kế, người dùng đã nhờ): `thickness` 0,5, đoạn z −11 thành một đoạn có
  cổng trăng + `thickness` 0,35, cổng nam / bắc `kind: lau`, `signs` mọi cổng → `scene:check` → Canvas 3D + ảnh.
  (đoạn z −11 cao 3; Canvas 3D bản 35; draw call góc chơi 76 như cũ, nhìn trên 117 · 131,6k tam giác)
- [x] 9. Kiểm tra cuối + `npm run build` (chép sang app). tsc sạch · 141 test xanh · build + chép app xong.
  Ghi chú: `npm run build:design` chạy trong Git Bash (đường dẫn `c:/…` chữ thường) hay lỗi vite html-proxy → chạy
  trong PowerShell.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart ·
dart tool/guard.dart
