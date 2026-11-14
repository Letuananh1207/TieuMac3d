# Kiến trúc

Chi tiết + lý do: `../decisions/0001-kien-truc.md`. Ở đây chỉ phần cần khi viết code.

## Hai phía

| Phía | Làm gì | Không làm gì |
|---|---|---|
| `web/` (three.js) | cảnh 3D, nhân vật, điều khiển cảm ứng, va chạm, vùng sự kiện, HUD nổi trên cảnh | màn hình app, lưu dữ liệu, mạng |
| `app/` (Flutter) | vỏ app, WebView chứa scene, màn bài học native (mốc 3), vòng đời app | vẽ 3D |

Dòng chảy build: `web/src` → `npm run build` → `web/dist` → tự chép → `app/assets/scene/` (khai báo trong
`app/pubspec.yaml`, mỗi thư mục con một dòng — thêm thư mục con trong bản build thì thêm dòng).

## Ai được import ai (`web/src/`, máy kiểm `E-LOP`)

```
main.ts ──► mọi lớp
ui ──► zones, chat      input ──► player
player ──► scene, collision      scene ──► collision
zones ──► collision     collision, chat ──► (không gì)
three: chỉ scene, player, input, ui
```

Muốn lớp A dùng thứ của lớp B mà bảng không cho → truyền qua `main.ts` (callback / tham số), như
`EventCard` nhận `onGo` thay vì tự gọi `LessonBoard`:

```ts
// web/src/main.ts
const lesson = new LessonBoard(() => (paused = false));
const card = new EventCard((zone) => {
  paused = true;
  lesson.open(zone.lesson);
});
const zones = new ZoneTracker(ZONES, (z) => card.setZone(z));
```

## File mới đặt ở đâu

| Thứ mới | Chỗ |
|---|---|
| vật dựng trong sân | `scene/<vật>.ts` xuất `add<Vật>(scene, colliders)`, gọi trong `scene/world.ts` |
| kiểu điều khiển mới | `input/<tên>.ts`, nối trong `input/pointers.ts` hoặc `main.ts` |
| nhân vật khác (vd. model .glb mốc 5) | `player/<tên>Character.ts` trả về `Character` |
| vùng / bài học mới | thêm phần tử vào `ZONES` ở `zones/zones.ts` |
| phần tử HUD | DOM trong `web/index.html` + CSS `style.css` + class trong `ui/` |
| cầu nối Flutter ↔ JS (mốc 3) | `web/src/bridge/` + `docs/bridge.md` + bảng ở decisions/0001 + `LAYERS` trong `tool/check.dart` |

## Vòng lặp (main.ts)

Mỗi khung: đọc input → `player.update` → `zones.update` → `orbit.update` → `renderer.render` → HUD.
`dt` kẹp tối đa 0,05 s. Biến `paused` làm nhân vật đứng yên (chưa dừng render — mốc 3/4 thêm dừng hẳn).
Font Lora phải nạp xong trước khi dựng cảnh vì biển hiệu vẽ chữ lên canvas.
