# Đặt model Cổng Sơn Môn vào cảnh
- Yêu cầu: "đặt model cổng sơn môn vào cảnh"
- Loại: thêm · Cỡ: vừa · Trạng thái: xong
- Nguồn: `design/models/cong-son-mon.glb` (design 2026-11-13.16, seed 7, 20 000 tam giác, không-sáng) · kế hoạch cha
  `docs/tasks/2026-11-11-nang-cap-do-hoa.md` đợt D (D4 — công trình `.glb` đầu tiên).

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — `GateSpec.model?: string` (mã file trong `design/models/`); thiếu → cổng khối như cũ.
- `web/src/scene/specCheck.ts` — nhận trường `model` (chuỗi, tuỳ chọn).
- `web/src/scene/staticModel.ts` (mới) — nạp `.glb` tĩnh cho lớp `scene/` (GLTFLoader + meshopt, `import.meta.glob`
  `design/models/*.glb` như `player/npc.ts`); `scene/` không được import `player/` (0001) nên không dùng lại
  `loadGlbModel`.
- `web/src/scene/gate.ts` — tách `gateSpan(width, k)` (bề ngang tổng của cổng khối) để model dùng đúng bề ngang đó;
  `addGateModel(...)`: co giãn model cho bề ngang = `gateSpan`, đặt theo `x / z / rotY`, chân chạm đất; vật cản = 4 trụ
  đo từ chính model (lát đáy lưới → gom cụm theo x); biển chữ `hanTitle` dán lên biển trống của model (tia dò từ trước
  vào giữa biển để lấy mặt biển).
- `web/src/scene/world.ts` — cổng có `model` và có file: không dựng cổng khối (khỏi bị `mergeStatic` gộp), nạp model
  bất đồng bộ; nạp lỗi → dựng cổng khối (dự phòng, chưa gộp — thêm ~6 draw call trong trường hợp lỗi).
- `design/scene/scene.json` — thêm `"model": "cong-son-mon"` cho `gates[son-mon]` (**file thiết kế** — xem quyết định 1)
  + mục `design/CHANGELOG.md`.

**Cần kiểm tra** `web/src/designPreview.ts` (Canvas 3D dùng chung `world.ts` → thấy model luôn) · `web/scripts/check-scene.mjs`
(vùng phẳng quanh cổng `width + 8`) · R-VA-1 (cột cổng vẫn có va chạm — không đổi luật).

**Không đụng** `player/` (nhân vật, NPC) · `zones/`, HUD, cầu nối, Flutter · `reference/`.

## Giả định / cần quyết định
1. Phiên code sửa `design/scene/scene.json` (vai `/canh`, một trường) — hay để phiên thiết kế làm. Đề xuất: làm luôn.
2. Cỡ: bề ngang model = bề ngang cổng khối hiện tại (≈ 19,9 m với `width` 9,6) → cao ≈ 17,7 m (tỉ lệ ảnh thiết kế),
   đáy xà giữa ≈ 9,6 m (đúng ngưỡng camera không lọt sau biển trong hồ sơ). Cổng khối cao ≈ 14,6 m.
3. Biển chữ: model có biển trống → dán biển chữ 文淵宗 của code lên (như cổng khối).

## Nhiệm vụ
- [x] 1. `spec.ts` + `specCheck.ts`: trường `model` tuỳ chọn (scene · `npm run scene:check` không lỗi · xong khi đặc tả cũ
      không đổi gì).
- [x] 2. `staticModel.ts`: `staticModelUrl(id)`, `loadStaticModel(url)` → `THREE.Group` đã chuẩn hoá (scene · xong khi tsc sạch).
- [x] 3. `gate.ts`: `gateSpan`, `addGateModel` (co giãn, đặt, vật cản 4 trụ từ lưới, biển chữ) (scene).
- [x] 4. `world.ts`: chọn model / khối, dự phòng khi lỗi (scene).
- [x] 5. `scene.json` + CHANGELOG (nếu duyệt quyết định 1).
- [x] 6. Kiểm: chụp Canvas 3D cổng từ lối Sơn Môn (trước, chếch, sau), xem vật cản trên bảng gỡ lỗi; đi xuyên giữa hai
      trụ giữa được, đâm vào trụ thì dừng. Ước tính: −(cổng khối đã gộp vào lô chung) + 1 draw call model + 1 biển;
      +20 000 tam giác.
- [x] 7. `npm run build` → app nhận bản mới; đợt D ghi D4.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run scene:check && npm run build ·
dart tool/rule_trace.dart

## Kết quả
- Canvas 3D: 108 draw call, **148 618 tam giác** (trần 150k — model +20 000). Cổng cao 18,8 m, rộng 19,9 m; đáy xà giữa
  10,1 m; khe giữa hai trụ giữa 5,1 m. Vật cản: 4 hộp chân trụ ≈ 2,1 × 2,7 m (x ±2,5…4,6 · ±6,8…8,8).
- Còn: vệt nhạt mặt trong cột (lỗi nướng màu, design .16). Lớp "Khung va chạm" của Canvas 3D không vẽ hộp cổng model
  (vẽ lúc dựng, model nạp sau).
