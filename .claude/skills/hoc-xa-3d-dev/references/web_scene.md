# Scene 3D (web/src)

## Thông số đã chốt

| Thứ | Giá trị | Ở đâu |
|---|---|---|
| pixelRatio tối đa | 1,5 (`MAX_PIXEL_RATIO`) | `scene/renderer.ts` |
| quản lý màu | `ColorManagement.enabled = false`, đèn × π — giữ màu prototype r128 | `scene/renderer.ts`, `scene/environment.ts` |
| vật liệu | `MeshLambertMaterial` qua `lambert()`; `MeshBasicMaterial` cho thứ không cần sáng (biển, đèn lồng, nước) | `scene/materials.ts` |
| bóng | không shadow realtime; bóng giả = đĩa đen mờ dưới chân | `player/blockCharacter.ts` |
| texture | vẽ bằng canvas 2D (`makeCanvasTex`, `signTex`), không file ảnh | `scene/textures.ts` |
| số / màu của cảnh | đặc tả `SceneSpec` (`DEFAULT_SCENE` = cảnh gốc: tường ±21, sương 28–70); far 200 | `scene/spec.ts`, đọc `design/scene/scene.json` ở `scene/loadSpec.ts` |
| cây | 4 `InstancedMesh` cho cả rừng, ngẫu nhiên có hạt giống (`trees.seed`) | `scene/trees.ts` |
| gộp khối | dựng xong cảnh, `mergeStatic` gộp mọi khối đứng yên cùng vật liệu → 1 draw call; vật chuyển động `markDynamic` | `scene/merge.ts`, gọi ở `scene/world.ts` |
| chuyển động | `World.update(dt)` (khói lò đan, mây, đảo nổi) — `main.ts` / `designPreview.ts` gọi mỗi khung | `scene/props.ts`, `scene/sky.ts` |
| va chạm tròn | `Colliders.addCircle` (ao tròn, đài, lò đan) | `collision/colliders.ts` |
| ngân sách | ≤ 150 draw call, ≤ 150k tam giác (cảnh mẫu 6 khu: 41–65 draw call, ~20k tam giác) | Canvas 3D bảng "Hiệu năng" |
| tốc độ / bán kính | 4,2 m/s · 0,5 | `player/controller.ts` |

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

`PlayerController` chỉ biết `Character`. Nhân vật mới (model .glb, mốc 5) = một hàm khác trả về `Character`;
không sửa controller.

## Điều khiển (input/)

`attachPointerInput` phân luồng Pointer Events: ngón ở 45% trái (`JOYSTICK_ZONE`) → `Joystick`; còn lại →
xoay `OrbitCamera`, hai ngón → `pinch`, chạm ngắn (< 8 px, < 300 ms) → `onTap` → `GroundPicker.pick`.
Hằng số có tên ở đầu file; đổi hằng là đổi quy tắc `R-DIEU-…` → sửa `docs/testing/quy_tac.md` trước.

## Vùng và HUD

- Nội dung vùng/bài học: `ZONE_CONTENT` (`zones/zones.ts`); vị trí do đặc tả cảnh quyết. Tiêu đề thẻ tách `before / han / after`, không HTML thô.
- `ZoneTracker` chỉ báo khi đổi vùng; logic "Để sau" nằm ở `EventCard` (quy tắc `R-VUNG-2`).
- DOM HUD viết sẵn trong `web/index.html`, lấy bằng `el<T>(id)` (`ui/dom.ts`, thiếu id thì ném lỗi ngay).
- Dựng nội dung bằng `textContent` / `createElement` / `replaceChildren`, không `innerHTML`.
- Ẩn/hiện bằng thuộc tính `hidden`; CSS có `[hidden]{display:none !important}` (prototype từng bị
  `display:grid` đè lên `hidden`).
- Chữ giao diện tiếng Việt viết thẳng trong HTML/TS (chưa có i18n). Font: Be Vietnam Pro (UI), Lora (tiêu đề,
  biển), chữ Hán dùng font hệ thống — đều đóng gói qua `@fontsource`, không Google Fonts.
- Mọi phần tử bám mép dùng `env(safe-area-inset-*)` (viewport có `viewport-fit=cover`).

## Thêm gói npm

`npm install --save-exact <gói>@<phiên bản>`; addon của three import từ `three/examples/jsm/...` (cùng phiên bản).
Ghi lý do chọn vào `decisions/` nếu là thư viện lớn.
