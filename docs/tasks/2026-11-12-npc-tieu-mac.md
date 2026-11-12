# NPC Tiểu Mặc trong cảnh
- Yêu cầu: "đặt NPC tiểu mặc vào cảnh"
- Loại: thêm · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — trường mới `npcs: [{ id, x, z, rotY? }]`, mặc định `[]` (cảnh cũ giữ nguyên — quy tắc 8).
- `web/src/player/npc.ts` (mới) — nạp `design/models/<id>.glb`, cỡ chuẩn, động tác đứng (thở, đầu nghiêng nhẹ); không gắn
  xương tay (xương tự gắn đo theo nhân vật chính → tay Tiểu Mặc gập sai, áo rách); quay về phía người chơi khi lại gần.
- `web/src/player/glbCharacter.ts` — tách phần nạp + chuẩn cỡ + bóng giả thành hàm dùng chung với NPC (không đổi hành vi).
- `web/src/main.ts` — dựng NPC theo `spec.npcs`, thêm vật cản tròn, gọi cập nhật mỗi khung.
- `web/src/designPreview.ts` — Canvas 3D hiện NPC như app.
- `web/scripts/check-scene.mjs` — kiểm `npcs` (id có model, không đặt trong nhà / tường), in toạ độ.
- `docs/testing/quy_tac.md` — luật mới R-NPC-1 (chép lên tài liệu online, `--mark-synced`).
- `design/scene/scene.json` — **không sửa ở phiên code**: vị trí đặt bằng `/canh` (người dùng nhờ phiên này làm thay theo skill).

**Cần kiểm tra**: `player/playerCharacter.ts` (dùng `loadGlbCharacter`), `collision/colliders.ts` (vật cản tròn),
draw call (NPC +2: model + bóng → còn trong ngân sách ≤ 150).

**Không đụng**: `PlayerController`, joystick / camera, cầu nối Flutter, app Flutter.

## Giả định / cần quyết định
- Vị trí: người dùng chọn (đề xuất: trong sân Sơn Môn, cạnh lối vào, quay về phía điểm xuất phát (0; 80)).
- Động tác: đứng thở + quay mặt về người chơi khi cách < 4 m (đề xuất).
- Nói chuyện với NPC (bong bóng thoại, hội thoại) → giao diện mới chưa có thiết kế → **không làm trong kế hoạch này**;
  muốn có thì soạn phiếu `/ui-apply phieu`.
- Không có trình chạy test TS → R-NPC-1 kiểm bằng chụp headless + thử tay (ghi rõ trong sổ).

## Nhiệm vụ
- [x] 1. Sổ quy tắc: R-NPC-1 (vị trí theo đặc tả, có va chạm bán kính 0,45, quay mặt khi người chơi < 4 m, không chặn
      lối cổng) → tài liệu online → `--mark-synced R-NPC-1`.
- [x] 2. `spec.ts`: `NpcSpec`, `npcs` mặc định `[]`; `check-scene.mjs` kiểm + in toạ độ.
- [x] 3. `glbCharacter.ts`: tách `loadGlbModel(url)` (nạp, đổi vật liệu, chuẩn cỡ, bóng) — nhân vật chính không đổi (chụp so).
- [x] 4. `player/npc.ts`: `createNpc(id)` → `{ root, update(dt, playerPos) }`; thở, quay mặt mượt (≤ 3 rad/s).
- [x] 5. `main.ts` + `designPreview.ts`: dựng NPC, `colliders.addCircle`, cập nhật mỗi khung; model thiếu → bỏ qua + cảnh báo.
- [x] 6. `/canh`: thêm Tiểu Mặc vào `design/scene/scene.json` ở vị trí đã chọn, `scene:check`, chụp Canvas 3D.
- [x] 7. Build + chụp kiểm: Tiểu Mặc đứng đúng chỗ, không gập tay, quay về người chơi; draw call.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run build · dart tool/rule_trace.dart ·
chụp headless Canvas 3D (`?nv=` cạnh NPC)

## Kết quả
- Đã kiểm: `tsc` sạch · `check.dart --changed` không lỗi (W-DAI `spec.ts` 501 dòng — đã > 400 từ trước) · `scene:check`
  không lỗi · `npm run build` · `rule_trace` (R-NPC-1 đã đồng bộ online, miễn test).
- Chụp Canvas 3D: `design/screens/Canh-npc-tieu-mac.png`. Canvas 3D gọi `npc.update(1, …)` lúc dựng để ảnh chụp thấy
  hướng quay (headless gần như không trôi thời gian giữa khung hình — như `world.update(1, …)` cho mái mờ).
- Thử máy: mở app → thấy Tiểu Mặc cạnh cổng nhìn về mình; đi lại gần (< 4 m) → cô quay theo; đi thẳng vào → bị chặn.
- Chưa làm: nói chuyện với NPC (cần thiết kế — `/ui-apply phieu`).
