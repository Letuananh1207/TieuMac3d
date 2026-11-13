# Truyền Tống Đài nhiều tầng
- Yêu cầu: "phần truyền tống nên để ở quảng trường và kích thước nên thu nhỏ và phong cách cũng cần đổi để không phẳng
  như hiện nay" → "làm đài nhiều tầng qua /lead"
- Loại: thêm (kiểu dựng mới cho vòng trận) · Cỡ: vừa · Trạng thái: xong

Bối cảnh: phiên `/canh` cùng ngày đã dời vòng trận vào giữa quảng trường (0; 0), bỏ sân ∅15 m (`teleport.radius` 0 →
bệ ∅9,4 m), thêm 8 đèn đá vòng quanh (bán kính 6,8). Vòng trận vẫn là đĩa đá dày 6 cm — đặc tả không tả được tầng / bậc.

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — `TeleportSpec.dais` (mới): `{ tiers, tierHeight, tierWidth, pillars, colors }`; mặc định
  `tiers: 0` = dựng như cũ (cảnh vùng, cảnh cũ không đổi).
- `web/src/collision/ground.ts` — `Pad` thêm dạng tròn (`round: { x, z, r }`) để mặt tầng tròn đứng lên được.
- `web/src/scene/truyenTong.ts` — dựng đài: các tầng trụ tròn, lan can đá trắng (chừa 4 lối), 4 lối bậc, trụ đá phù văn
  (sáng theo độ nạp); trả về `pads` + thêm vật cản (lan can, trụ) vào `colliders`; vòng + phù hiệu + cột sáng + hạt đặt
  trên mặt tầng trên cùng.
- `web/src/scene/teleportLayout.ts` — `daisRadius(tp)`; `arrivalSpot` đứng ngoài chân đài (phía tây, trên mặt đất) khi có đài.
- `web/src/scene/world.ts` — truyền `colliders` cho `addTeleport`, gộp `pads` của đài vào `LayeredGround`.
- `web/src/scene/specCheck.ts` — kiểm `dais` (tiers 0…3, tierHeight 0,2…0,8, dốc bậc ≤ 35° theo R-VA-2, tierWidth ≥ 1);
  ô "vùng phải phẳng" dùng bán kính chân đài.
- `web/scripts/check-scene.mjs` — in "đài N tầng, cao …, chân ∅ …".
- `design/scene/scene.json` (vai `/canh`, người dùng nhờ) — bật `teleport.dais`, dời 8 đèn đá khỏi chân đài (hoặc bỏ nếu
  có trụ phù văn).

**Cần kiểm tra**
- `web/src/main.ts` — `RingCharge` theo x, z (không đổi); `arrivalSpot` khi về tông môn; camera `groundAt` = `world.surface` → tự lên đài.
- `web/src/designPreview.ts` — `?nap=` phải thấy trụ phù văn sáng.
- `web/src/player/controller.ts` — `canStep` dùng `slopeAt` của tấm dốc (bậc ≤ 35°).
- Cảnh vùng `design/scene/rung-truc.json` — không có `dais` → giữ bệ đá cũ.

**Không đụng**: cầu nối Flutter, app Flutter, bản đồ truyền tống (cuộn), luật nạp 1,2 s.

## Giả định / cần quyết định
- Vòng trận giữ bán kính 4 m (R-HANH-2) → mặt tầng trên cùng bán kính ≈ 4,9 m. Người dùng chọn **2 tầng, 4 trụ** (bỏ 8 đèn đá). Số tầng quyết định cỡ chân đài:
  2 tầng ≈ ∅12,6 m, cao 1 m · 3 tầng ≈ ∅15,4 m, cao 1,5 m (tầng rộng 1,4 m). **Hỏi người dùng.**
- Trụ phù văn: 4 hoặc 8, đặt trên tầng dưới cùng, xen giữa 4 lối bậc. **Hỏi người dùng.**
- Bước lên tầng chỉ qua 4 lối bậc; mép tầng ngoài lối bậc có lan can (vật cản) — không "nhảy" lên 0,5 m.
- Luật: hành vi R-HANH-2 không đổi. Ví dụ trong sổ còn toạ độ cũ (vòng (30; 0), về đứng (24,5; 0)) do phiên `/canh`
  dời đài → cập nhật ví dụ khi chốt thiết kế (sửa sổ → chép online → `--mark-synced R-HANH-2`).
- Hiệu năng: tầng + lan can + bậc + chân trụ đứng yên → gộp (≈ +2 draw call); phù văn sáng (động) +1. Tam giác ≈ +3–5 nghìn.
  Cảnh đang 131 draw call · 148,5k tam giác → bỏ 8 đèn đá (−0 draw call, −~2k tam giác) để chừa chỗ.

## Nhiệm vụ
- [x] 1. `Pad` dạng tròn (`collision/ground.ts` · collision) — xong khi `LayeredGround` trả đúng độ cao trong / ngoài
  tấm tròn, tấm khai báo trước vẫn thắng (kiểm bằng kịch bản esbuild).
- [x] 2. `TeleportSpec.dais` + mặc định + kiểm (`spec.ts`, `specCheck.ts`, `check-scene.mjs` · scene) — xong khi
  `scene:check` không đổi với `scene.json` / `rung-truc.json` hiện tại và báo lỗi khi dốc bậc > 35°.
- [x] 3. Dựng đài (`truyenTong.ts`, `teleportLayout.ts` · scene): tầng, lan can, bậc, trụ phù văn, vòng trên mặt trên;
  `pads` + vật cản; `arrivalSpot` ngoài chân đài — xong khi `tiers: 0` trông y như cũ.
- [x] 4. Ghép (`world.ts`) — pads đài vào `LayeredGround`, colliders vào `addTeleport`.
- [x] 5. `/canh`: bật `dais` trong `scene.json`, dời / bỏ đèn đá; `scene:check`; kịch bản dò đường: lên được đài chỉ qua
  4 lối bậc, đứng giữa vòng thì nạp; Canvas 3D chụp `?nap=0` / `?nap=0.8`, đo draw call / tam giác.
- [x] 6. `npm run build` (app nhận bản mới) + Kiểm tra cuối.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm run build · dart tool/guard.dart ·
dart tool/rule_trace.dart · đi thử trên trình duyệt (`npm run dev`): lên đài bằng bậc, không lên được qua lan can,
đứng giữa vòng 1,2 s → bản đồ mở, về tông môn đứng chân đài phía tây.

## Kết quả
- Code: `collision/ground.ts` (tấm tròn `round`), `scene/spec.ts` (`DaisSpec`, mặc định `tiers: 0`), `scene/teleportLayout.ts`
  (`daisLayout`, `daisPads`, `railPosts`, `pillarSpots`, `arrivalSpot` ra chân bậc tây), `scene/truyenTongDai.ts` (mới — dựng
  đài), `scene/truyenTong.ts` (vòng trên mặt đài, phù văn sáng theo nạp), `scene/world.ts`, `scene/specCheck.ts`,
  `scripts/check-scene.mjs`.
- Đặc tả: `teleport.dais { tiers: 2, pillars: 4 }`, bỏ 8 đèn đá quanh vòng, tùng sườn núi 9 → 8 / cụm.
- Đài 2 tầng cao 1 m, mặt trên ∅9,8, chân ∅12,6 (∅14,4 kể bậc), dốc bậc 23,5°. Về tông môn đứng (−8,2; 0).
- Dò đường (kịch bản esbuild, đúng `canStep` + `Colliders`): lên tới tâm được; chặn 4 lối bậc → không lên được tầng nào.
- Ngân sách Canvas 3D `?view=tren`: 133 draw call · 149,5k tam giác (sát trần 150k — thêm vật lớn phải bớt chỗ khác).
- `scene:check` không lỗi (cả `rung-truc.json`: không có đài, giữ bệ cũ) · `tsc` sạch · `npm run build` xong.
- Còn chờ: thử trên máy (lên bậc, đứng giữa vòng 1,2 s → bản đồ mở, về tông môn đứng chân bậc tây); ví dụ R-HANH-2
  trong sổ còn toạ độ cũ (30; 0) / (24,5; 0) → sửa khi chốt thiết kế (sổ → online → `--mark-synced R-HANH-2`).
