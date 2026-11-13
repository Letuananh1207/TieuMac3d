# Scene 3D (web/src)

## Thông số đã chốt

| Thứ | Giá trị | Ở đâu |
|---|---|---|
| pixelRatio tối đa | 1,5 (`MAX_PIXEL_RATIO`) | `scene/renderer.ts` |
| quản lý màu | `ColorManagement.enabled = false`, đèn × π — giữ màu prototype r128 | `scene/renderer.ts`, `scene/environment.ts` |
| vật liệu | `MeshLambertMaterial` qua `lambert()`; `MeshBasicMaterial` cho thứ không cần sáng (biển, đèn lồng, nước) | `scene/materials.ts` |
| bóng | không shadow realtime; bóng giả = đĩa đen mờ dưới chân | `player/blockCharacter.ts` |
| texture | vẽ bằng canvas 2D (`makeCanvasTex`, `drawSign` / `drawBanner` / `drawBoard`), không file ảnh | `scene/textures.ts` |
| biển, cờ, bảng | **ảnh chung** `signMesh` (`scene/signAtlas.ts`): mọi biển của cảnh một canvas 2048², một vật liệu → 1 draw call; `buildWorld` gọi `resetSignAtlas()`; chữ cần font: `signText(spec)` nạp trước khi dựng | `kien_truc/chi_tiet.ts` `addSign` |
| số / màu của cảnh | đặc tả `SceneSpec` (`DEFAULT_SCENE` = cảnh gốc: tường ±21, sương 28–70); far 200 | `scene/spec.ts`, đọc `design/scene/scene.json` ở `scene/loadSpec.ts` |
| cây | 4 `InstancedMesh` cho cả rừng, ngẫu nhiên có hạt giống (`trees.seed`) | `scene/trees.ts` |
| gộp khối | dựng xong cảnh, `mergeStatic` gộp mọi khối đứng yên cùng vật liệu → 1 draw call; vật chuyển động `markDynamic` | `scene/merge.ts`, gọi ở `scene/world.ts` |
| chuyển động | `World.update(dt)` (khói lò đan, mây, đảo nổi) — `main.ts` / `designPreview.ts` gọi mỗi khung | `scene/props.ts`, `scene/sky.ts` |
| va chạm tròn | `Colliders.addCircle` (ao tròn, đài, lò đan) | `collision/colliders.ts` |
| ngân sách | ≤ 150 draw call, ≤ 150k tam giác (cảnh mẫu đủ kiểu mới: 67–90 draw call, ~66k tam giác) | Canvas 3D bảng "Hiệu năng" |
| kiến trúc | `scene/kien_truc/`: `hinh.ts` (chóp cụt, lăng trụ), `mai.ts` (mái chái, yết sơn, hai mái, đầu đao), `chi_tiet.ts` (biển, đèn, lan can, xà, cửa), `dien.ts`, `nha_thap.ts`, `tuong.ts` (tường vôi + cổng trăng) | `buildings.ts` chọn kiểu |
| cây | `tan` · `truc` (`trees.ts`), `tung` · `lieu` · `mai` (`cay_moi.ts`); mỗi kiểu dãy ngẫu nhiên riêng (`random.ts`) | |
| chip khu | `zones/areaTracker.ts` (`placeLabel`, R-HUD-1) → `ui/hud.ts` `PlaceChip` | đặc tả `site` |
| tốc độ / bán kính | 4,2 m/s · 0,5 | `player/controller.ts` |
| địa hình | `terrain.enabled` (mặc định tắt = sân phẳng). Độ cao: `scene/terrainHeight.ts` (thuần toán: nhiễu + đỉnh → ép phẳng bục / lối lát → đổ vực) → `collision/heightfield.ts` (`heightAt`, `slopeAt`); lưới vẽ `scene/terrain.ts` (màu từng tam giác theo dốc, 1 draw call). Chia tam giác hai file **phải khớp** | `World.heightfield` |
| đặt vật lên đất | cây, đồ trang trí nhận `groundY`; nhà, tường, cổng, ao, giếng **không** — phải nằm trên bục (`scene:check` báo "nằm trên đất dốc") | `world.ts` |
| dốc | `MAX_SLOPE` 35° + `canStep` (R-VA-2) trong `player/controller.ts`; camera không chui xuống đất (`orbit.update(…, groundAt)`) | |
| chiều cao kiến trúc | `buildingStyle.heightScale` qua `hk(style)` (`kien_truc/chi_tiet.ts`): nhân nền, cột, tường thân, cửa, mái, tầng tháp, cổng sơn môn; **giữ cỡ người**: bậc (thêm bậc — `stepCount`), lan can, biển, đèn lồng, cửa sổ tròn, đồ đạc. Sàn nhà vào được `hallFloor(style)`. Nội thất đặt theo kích thước phòng (phòng to → thêm án / kệ); cổng trăng thu bán kính cho vừa tường (`moonRadius`) | `kien_truc/` |
| tiện ích vào được (2026-11-13.13) | `hi-dai` · `tra-lau` · `lau-sach` · `cua-hang`: hàm dựng `kien_truc/<kiểu>.ts` trả `Shell` (`kien_truc/vao_trong.ts`: hộp / tròn va chạm, `pads` nền + dốc, `floor`) → `rooms.ts` `addWalkIn` (bảng `WALK_IN`) → `Room` không vật học; nhóm `fade` gộp **màu theo đỉnh** (`mergeVertexColors`) → ~3 draw call / nhà dù nhiều màu. Đồ phố chợ `kien_truc/do_pho.ts` (bàn trà, sạp ô, cờ, bảng) | `world.ts` |
| nhà vào được | nhà kiểu giảng đường có `zone` mà `ZONE_CONTENT` cho `interior` (`lop-hoc` · `thu-vien`) → `scene/rooms.ts`: thân rỗng, gian giữa mặt trước để trống làm cửa, nội thất `kien_truc/noi_that.ts`; va chạm theo lan can + tường + đồ đạc (R-VA-3); nền + dốc bậc là `Pad` trong `collision/ground.ts` (`LayeredGround`, `World.surface`); mái + tường trước + hàng cột trước gộp riêng rồi mờ 15 % / 0,3 s khi đứng trên sàn (R-HUD-2); hộp bắt chạm vô hình `markDynamic` (R-VUNG-2). Vùng học = điểm học trong nhà (`interiorSpot`, R-VUNG-1) | `world.ts` `buildWorld(…, interiors)` |
| bậc đá, cỏ, đá rải | `terrain.stairs` ép dải dốc trong `terrainHeight.ts` (`stairEnds`), khối bậc ở `scene/stairs.ts`; cỏ búi + đá rải `scene/grass.ts` (mỗi loại 1 `InstancedMesh`, `setColorAt`, tối đa 3000 / 400) | `world.ts` khi có địa hình |
| núi xa, biển mây | `scene/farMountains.ts`: không chịu sương, tự pha màu; far plane = `viewDistance(spec)` | `renderer.ts` nhận `far` |

## Mẫu: thêm một vật vào sân

```ts
// web/src/scene/well.ts — vị trí, màu lấy từ đặc tả; hình dạng (kích thước chi tiết) ở code
export function addWell(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec['well']): void {
  const { x, z } = spec;
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 12), lambert(spec.stone));
  well.position.set(x, 0.4, z);
  scene.add(well);
  // …
  colliders.add(x, z, 2.2, 2.2); // hộp va chạm thẳng trục: tâm x, z, rộng, sâu
}
```

Vật mới: thêm trường vào `SceneSpec` + `DEFAULT_SCENE` (`scene/spec.ts`, giá trị = cảnh hiện tại; danh sách mới thì
thêm cách đọc phần tử vào `LISTS` ở `scene/specCheck.ts`), dựng ở
`scene/<vật>.ts`, gọi trong `scene/world.ts`. Thứ thiết kế quyết (vị trí, kích thước, màu) vào đặc tả; chi tiết
hình dạng ở code. Danh sách trong đặc tả → kiểm từng phần tử bằng `parseList` / `parseItem`. Kiểm:
`npm run scene:check`. Geometry/material dùng chung tạo một lần ở cấp module; vật lặp nhiều → `InstancedMesh`.

Va chạm chỉ là hộp thẳng trục → vật xoay chỉ được bội 90° (`rotY` tính bằng độ; 90 / 270 thì đổi rộng ↔ sâu, như
`addBuilding`). Vùng sự kiện neo theo nhà (`zone.front`), `zoneAnchors` → `zones/placeZones`.

Canvas 3D: `web/design.html` + `src/designPreview.ts` (file gốc như `main.ts`, được import mọi lớp và CSS),
`npm run build:design` → `web/dist-design/` (không vào app).

## Mẫu: nhân vật

Hình tách khỏi di chuyển qua hợp đồng `Character` (`player/character.ts`):

```ts
export interface Character {
  readonly root: THREE.Object3D;   // đặt vị trí
  readonly facing: THREE.Object3D; // xoay theo hướng đi
  animate(dt: number, speed: number): void; // speed 0..1
}
```

`PlayerController` chỉ biết `Character`. Có sẵn: `discipleCharacter.ts` (đệ tử khối), `blockCharacter.ts` (gấu),
`glbCharacter.ts` (model .glb — `references/tai_nguyen.md`); chọn ở `playerCharacter.ts`. NPC (`npc.ts`, R-NPC-1)
dùng chung `loadGlbModel` + `autoRig` với dáng riêng từng model (`NPC_RIGS` — NPC mới phải đo vai / tay trên ảnh `-truoc.png`, chưa đo thì chỉ thở), tay buông, giữ hướng đặc tả (không quay theo người chơi); đặt theo `spec.npcs` qua `placeNpcs`. Nhân vật mới = một hàm trả
về `Character`; không sửa controller.

## Điều khiển (input/)

`attachPointerInput` phân luồng Pointer Events: ngón ở 45% trái (`JOYSTICK_ZONE`) → `Joystick`; còn lại →
xoay `OrbitCamera`, hai ngón → `pinch`, chạm ngắn (< 8 px, < 300 ms) → `onTap` → `GroundPicker.pick`.
Hằng số có tên ở đầu file; đổi hằng là đổi quy tắc `R-DIEU-…` → sửa `docs/testing/quy_tac.md` trước.

## Vùng và HUD

- Nội dung vùng/bài học: `ZONE_CONTENT` (`zones/zones.ts`); vị trí do đặc tả cảnh quyết. Tiêu đề thẻ tách `before / han / after`, không HTML thô.
- `ZoneTracker` chỉ báo khi đổi vùng → nút học nổi `ui/learnButton.ts` (bám vật học, R-VUNG-1/2); mở bài: `main.ts`
  hỏi Flutter qua cầu nối (`bridge/`), không có Flutter → bảng HTML `ui/lessonBoard.ts` (R-VUNG-3). Không còn thẻ mời.
- DOM HUD viết sẵn trong `web/index.html`, lấy bằng `el<T>(id)` (`ui/dom.ts`, thiếu id thì ném lỗi ngay).
- Dựng nội dung bằng `textContent` / `createElement` / `replaceChildren`, không `innerHTML`.
- Ẩn/hiện bằng thuộc tính `hidden`; CSS có `[hidden]{display:none !important}` (prototype từng bị
  `display:grid` đè lên `hidden`).
- Chữ giao diện tiếng Việt viết thẳng trong HTML/TS (chưa có i18n). Font: Be Vietnam Pro (UI), Lora (tiêu đề,
  biển) qua `@fontsource`; chữ Hán = "Han Serif" (`--han`): Noto Serif SC 700 **cắt đúng các chữ app dùng** bằng
  `scripts/subset-han.mjs` (quét chữ Hán trong `src/**/*.ts`, `*.html`, `design/scene/scene.json`) → `src/fonts/`
  (file sinh, dev / build tự chạy). Chữ Hán mới viết trong code / đặc tả tự có; chữ gõ lúc chạy thì không.
- HUD hướng C: token ở `:root` của `style.css` (theo `design/tokens/design_tokens.json`); kính sương = lớp `.frost`
  (nền đủ đặc, blur chỉ là thêm — WebView không có `backdrop-filter` vẫn đọc được). Thẻ tên khu `ui/areaBanner.ts`
  + `zones/AreaEntryTracker` (R-HUD-3, chỉ theo khu của đặc tả, không theo nhà); màn tải `ui/loadingScreen.ts`
  (R-MAN-2, `main.ts` báo tiến độ theo bước dựng, `done()` sau khung đầu); bảng gỡ lỗi (fps · draw call · tam giác)
  khi `?debug` hoặc Flutter gửi `debug` (bản debug của app). Vòng lặp dừng khi app xuống nền (`lifecycle`) / tab ẩn.
- Mọi phần tử bám mép dùng `env(safe-area-inset-*)` (viewport có `viewport-fit=cover`).

## Thêm gói npm

`npm install --save-exact <gói>@<phiên bản>`; addon của three import từ `three/examples/jsm/...` (cùng phiên bản).
Ghi lý do chọn vào `decisions/` nếu là thư viện lớn.
