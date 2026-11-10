# Scene 3D (web/src)

## Thông số đã chốt

| Thứ | Giá trị | Ở đâu |
|---|---|---|
| pixelRatio tối đa | 1,5 (`MAX_PIXEL_RATIO`) | `scene/renderer.ts` |
| quản lý màu | `ColorManagement.enabled = false`, đèn × π — giữ màu prototype r128 | `scene/renderer.ts`, `scene/environment.ts` |
| vật liệu | `MeshLambertMaterial` qua `lambert()`; `MeshBasicMaterial` cho thứ không cần sáng (biển, đèn lồng, nước) | `scene/materials.ts` |
| bóng | không shadow realtime; bóng giả = đĩa đen mờ dưới chân | `player/blockCharacter.ts` |
| texture | vẽ bằng canvas 2D (`makeCanvasTex`, `signTex`), không file ảnh | `scene/textures.ts` |
| sân | tường ở ±21 (`WALL`), sương mù 28–70, far 200 | `scene/walls.ts`, `scene/environment.ts` |
| tốc độ / bán kính | 4,2 m/s · 0,5 | `player/controller.ts` |

## Mẫu: thêm một vật vào sân

```ts
// web/src/scene/well.ts
export function addWell(scene: THREE.Scene, colliders: Colliders): void {
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 12), lambert(0x6c6660));
  well.position.set(6, 0.4, 2);
  scene.add(well);
  // …
  colliders.add(6, 2, 2.2, 2.2); // hộp va chạm thẳng trục: tâm x, z, rộng, sâu
}
```

Rồi gọi trong `scene/world.ts`. Màu viết thẳng hex ở chỗ dựng là cách dự án đang làm (không có bảng màu riêng
cho cảnh). Geometry/material dùng chung thì tạo một lần ở cấp module (xem `scene/trees.ts`).

Va chạm chỉ là hộp thẳng trục → vật xoay chỉ được 0 hoặc π/2 (đổi rộng ↔ sâu, như `addBuilding`).

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

- Dữ liệu vùng/bài học: `ZONES` (`zones/zones.ts`). Tiêu đề thẻ tách `before / han / after`, không HTML thô.
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
