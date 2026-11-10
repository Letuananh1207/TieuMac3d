# Phong cách code

## TypeScript (web/src)

| Thứ | Quy ước | Ví dụ |
|---|---|---|
| tên file | camelCase | `orbitCamera.ts`, `blockCharacter.ts` |
| class / interface / type | PascalCase | `PlayerController`, `MoveInput` |
| hàm dựng vật | `add<Vật>(scene, colliders)` | `addWalls`, `addBuilding` |
| hàm tạo | `create<Thứ>()` | `createStage`, `createBlockCharacter` |
| hằng cấu hình | UPPER_SNAKE ở đầu file, có comment đơn vị | `SPEED = 4.2 // mét / giây` |
| dữ liệu tĩnh | UPPER_SNAKE, mảng có kiểu | `ZONES: Zone[]`, `BUILDINGS: BuildingSpec[]` |
| import kiểu | `import type` khi chỉ dùng kiểu | `import type { Colliders } from '../collision/colliders';` |

- `strict`, `noUnusedLocals`, `noUnusedParameters` bật trong `web/tsconfig.json`. Không `any` (`W-ANY`).
- Số thập phân viết đủ `0.5`, không `.5` (prototype viết `.5`, bản TS đã chuẩn hoá).
- Vector tạm dùng lại (trường `private readonly v = new THREE.Vector3()`), không `new` trong vòng lặp mỗi khung.
- DOM: `el<T>(id)` từ `ui/dom.ts`; không `!` rải rác.
- Lỗi khởi động (thiếu phần tử) ném `Error` có thông báo tiếng Việt; không nuốt lỗi im lặng.
- Code được Prettier-like: 2 dấu cách, nháy đơn, dấu chấm phẩy, dòng ≤ ~120 ký tự.

## Comment

Tiếng Việt, ngắn, nói **vì sao** chứ không lặp lại code. JSDoc `/** … */` cho mọi export; giải thích lựa chọn
kỹ thuật cho người mới làm game:

```ts
/** Giới hạn mật độ điểm ảnh: màn điện thoại 3x mà vẽ đủ 3x thì GPU gánh gấp 4 lần so với 1.5x. */
export const MAX_PIXEL_RATIO = 1.5;
```

## Dart (app/, tool/)

Theo `flutter_lints`. Script trong `tool/` là Dart thuần (chỉ `dart:io`, `dart:convert`), không thêm gói, chạy từ
gốc repo, gọi tiến trình con với `runInShell: true` + UTF-8 (Windows). In chỉ chỗ lỗi, im lặng khi ổn.
