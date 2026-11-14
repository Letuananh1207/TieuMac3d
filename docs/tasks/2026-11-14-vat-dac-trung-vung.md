# Vật đặc trưng 5 vùng hành trình
- Yêu cầu: "Làm phần "Cần code" cho 5 vùng hành trình: cầu vòm qua kênh, thuyền ô bồng (Giang Nam); hạc bay, cầu
  treo (Bồng Lai); tường bám theo sống núi (Trường Thành); cầu đá Kim Thuỷ, cổng thành vòm vuông, hạc/rùa đồng (Tử Cấm
  Thành); lạc đà, hang bích hoạ (Con đường tơ lụa)."
- Loại: thêm (kiểu vật mới trong đặc tả cảnh) + sửa hành vi nhỏ (đi qua cầu trên nước) · Cỡ: lớn · Trạng thái: đang làm

## Phạm vi
**Sẽ sửa**
- `web/src/scene/spec.ts` — trường mới `bridges[]` (kiểu `vom` · `da` · `treo`), `flocks[]` (đàn hạc), `boats[]`
  (thuyền trôi theo đường), prop mới `hac-dong` · `rua-dong` · `lac-da` · `hang`, cổng tường kiểu `thanh`, cờ
  `wallSegments[].follow` (bám địa hình); mặc định rỗng / tắt → cảnh cũ giữ nguyên.
- `web/src/scene/specCheck.ts` — kiểm cầu (thẳng trục, hai đầu trên đất, dốc ≤ 35°), đường thuyền nằm trong nước,
  `follow` chỉ khi có địa hình.
- `web/src/scene/bridges.ts` (mới) — dựng cầu + trả `Pad` dốc lên / xuống (như bậc hí đài) + lan can có va chạm; khe
  va chạm của nước dưới mặt cầu.
- `web/src/scene/fauna.ts` (mới) — đàn hạc bay vòng (không va chạm), thuyền ô bồng trôi qua lại; một `Updater` mỗi thứ.
- `web/src/scene/props.ts` — `hac-dong`, `rua-dong` (đồng, có va chạm), `lac-da` (đứng, cúi đầu nhai chậm, có va
  chạm), `hang` (vách đá + cửa hang tối + tấm bích hoạ hoa văn tự vẽ — không chép tranh có thật; không vào được).
- `web/src/scene/textures.ts` — vẽ tấm bích hoạ (hoa văn mây, hoa sen, dải lụa bay) vào ảnh biển chung.
- `web/src/scene/walls.ts` — đoạn tường `follow`: chia khúc ~2 m, mỗi khúc đặt theo độ cao đất, răng cưa trên đỉnh
  (tường gạch); va chạm từng khúc.
- `web/src/scene/kien_truc/tuong.ts` — cổng kiểu `thanh`: cửa vòm vuông son, đinh vàng, lầu mái trên (tường vôi).
- `web/src/scene/world.ts` — ghép cầu, đàn hạc, thuyền; `Pad` cầu vào `LayeredGround`.
- `web/src/designPreview.ts` — chỉ kiểm: Canvas 3D tự hiện (đi qua `buildWorld`).
- `docs/testing/quy_tac.md` — R-VA-1: thêm "cầu đi qua được nước; lan can cầu chặn; thuyền, hạc không chặn".
- `design/scene/*.json` 5 vùng — đặt cầu / thuyền / hạc / lạc đà… (việc `/canh`, làm thay sau khi code xong).
- `.claude/skills/canh/references/truong-dac-ta.md` + Bản đồ tính năng `/lead` — thêm dòng trường mới.

**Cần kiểm tra** `collision/ground.ts` (`LayeredGround`, pad chồng nước), `scene/merge.ts` (vật động không gộp),
`scripts/check-scene.mjs`, `scene/signAtlas.ts` (chỗ trống ảnh chung cho bích hoạ).

**Không đụng** `app/` (Flutter), cầu nối, HUD, tông môn `scene.json`, bản đồ truyền tống.

## Giả định / cần quyết định
1. ✅ (người dùng 2026-11-14: a) **Cầu treo Bồng Lai**: (a) nối đảo chính sang một đảo nhỏ cùng độ cao, đi qua được (thêm bục đảo nhỏ); hay
   (b) chỉ trang trí, vắt từ mép đảo sang đảo nổi trên không, không đi được.
2. ✅ (người dùng 2026-11-14: a) **Tường Trường Thành**: (a) tường bám đất, nhân vật đi dọc chân tường (không lên mặt tường) — vừa sức; hay
   (b) đi trên mặt tường (lối đi trên đỉnh, bậc lên ở tháp canh) — lớn, cần thêm tấm dốc dài theo địa hình.
- Giả định: lạc đà đứng yên (chỉ cúi đầu), không đi theo đoàn; thuyền và hạc không chạm được, không va chạm.
- Hiệu năng: mỗi vùng thêm ≈ 3–6 draw call (cầu, lan can gộp; thuyền 1–2; đàn hạc 1 InstancedMesh), < 5k tam giác.

## Nhiệm vụ
- [ ] 1. (sổ đã sửa; chờ người dùng chép online) Sổ quy tắc R-VA-1 (cầu, lan can, thuyền / hạc) → chép online → `--mark-synced R-VA-1`.
- [x] 2. `spec.ts` + `specCheck.ts`: trường mới + mặc định + kiểm (test `specCheck` cho cầu dốc quá / đầu cầu trong nước).
- [x] 3. `bridges.ts`: cầu vòm (đá, lưng gù, lan can), cầu đá phẳng (Kim Thuỷ, lan can cẩm thạch), cầu treo (ván + dây
      võng); `Pad` + test hàm thuần (độ cao trên cầu tại x, z).
- [x] 4. `walls.ts` `follow`: khúc theo đất + răng cưa; test số khúc / độ cao khúc.
- [x] 5. `tuong.ts` cổng `thanh`.
- [x] 6. `props.ts` + `textures.ts`: hạc đồng, rùa đồng, lạc đà, hang bích hoạ.
- [x] 7. `fauna.ts`: đàn hạc, thuyền ô bồng.
- [x] 8. `world.ts` ghép; `npx tsc --noEmit`, `npm test`.
- [x] 9. (làm thay `/canh`) đặt vật vào 5 đặc tả vùng, `scene:check`, Canvas 3D, chụp, đo draw call / tam giác.
- [x] 10. Tài liệu trường đặc tả + Bản đồ tính năng; `npm run build` cho app.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build ·
dart tool/rule_trace.dart
