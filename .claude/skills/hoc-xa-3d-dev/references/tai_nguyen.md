# Tài nguyên: model .glb, font, file sinh

Quyết định: `decisions/0003-tai-san-ai.md` (model AI) · `decisions/0002-thiet-ke-3d.md` (cảnh bằng code). Tạo model:
skill `/tai-nguyen` (Hunyuan3D trên máy người dùng). Mọi thứ đóng gói vào bản build — app chạy **offline**.

## Model .glb

| Thứ | Ở đâu |
|---|---|
| file model (người dùng / `/tai-nguyen` đặt) | `design/models/<tên>.glb` + `design/models/LICENSES.md` |
| nhân vật chính | `design/models/nhan-vat.glb` → `player/playerCharacter.ts` (`import.meta.glob` `?url`, Vite gói vào `dist/assets`) |
| nạp + chuẩn hoá | `player/glbCharacter.ts`: `GLTFLoader` + `MeshoptDecoder` (`three/examples/jsm`), co về cao `GLB_HEIGHT` 2,1 m, chân y 0, tâm về gốc, mặt trước +z; vật liệu → Lambert (giữ màu / map / màu đỉnh); thiếu pháp tuyến → `computeVertexNormals` |
| động tác | clip tên chứa `idle` / `walk` → `AnimationMixer`, trộn theo tốc độ; không có clip → `player/autoRig.ts` tự gắn 7 xương (hông, đầu, tay, chân) theo tỉ lệ chibi chữ A (`P`), trọng số mềm, rồi đi / đứng lập trình (chân so le, tay vung ngược, thở, nghiêng đầu). Thuộc tính meshopt lượng tử hoá phải đổi sang Float32 trước khi biến đổi (`toFloat`) |
| chọn / dự phòng | `createPlayerCharacter(?nhan-vat)`: `gau` · `khoi` · mặc định .glb; lỗi nạp → đệ tử khối (`console.warn`) |
| tô màu bằng chiếu ảnh | `npm run model:paint -- <model.glb> <atlas.png> [--4goc] [--ra]` (`--4goc`: atlas 2 × 2 trước / trái / sau / phải từ `atlas4.py`, bộ ảnh chuẩn hoá đỉnh 10 % đế 90 %, mỗi tam giác lấy ảnh phía nó quay về) (`scripts/model-paint.mjs`): tách đỉnh, UV chiếu từ trước theo khung bao (tam giác quay trước → nửa trái atlas, quay sau → nửa phải), vật liệu nhám; atlas làm bằng `.claude/skills/tai-nguyen/scripts/atlas.py` |
| nướng texture 4 góc | `.claude/skills/tai-nguyen/scripts/bake.py` (Python của gói Hunyuan: xatlas UV, trộn 4 ảnh theo n·hướng⁴ + che khuất, `--jpg`) — cách tô màu tốt nhất khi có bộ ảnh 4 góc |
| làm sạch | `cd web && npm run model:clean -- <in.glb> [--loai nhan-vat\|cong-trinh] [--ten] [--ra]` (`scripts/model-clean.mjs`, glTF-Transform + meshoptimizer — gói dev ghim): dedup, weld, simplify về ngân sách, prune, nén meshopt; báo vượt |

Ngân sách: nhân vật ≤ 10k tam giác ≤ 1,5 MB, công trình ≤ 20k ≤ 3 MB, ≤ 1024² texture; cả cảnh ≤ 150 draw call ≤ 150k
tam giác. Model AI một khối = 1 draw call (đệ tử khối ~25). Công trình `.glb` **chưa** có code đặt vào cảnh (cần
trường đặc tả + nạp + hộp va chạm theo kích thước nhà, giữ bản khối dự phòng).

Mẫu nạp model mới (giữ hợp đồng `Character` / bản khối dự phòng):

```ts
const MODELS = import.meta.glob('../../../design/models/<tên>.glb', { query: '?url', import: 'default', eager: true });
const url = Object.values(MODELS)[0] as string | undefined; // không có file → undefined → dùng bản khối
```

## Font

| Dùng ở | Cách | File sinh (không sửa tay) |
|---|---|---|
| web (scene, HUD) | `@fontsource` Be Vietnam Pro 500/700, Lora 700 (import trong `style.css`); chữ Hán "Han Serif" = Noto Serif SC 700 cắt đúng chữ dùng (`scripts/subset-han.mjs`, quét `src/**/*.ts`, `*.html`, `design/scene/scene.json`) | `web/src/fonts/**` |
| Flutter (màn bài học) | `scripts/fonts-app.mjs`: @fontsource woff2 → `.ttf` theo từng bảng chữ (latin / latin-ext / vietnamese), chữ Hán của `src/zones/` + `app/lib/`, nguyên âm pinyin dấu mũ ngược (ǎ ǐ ǒ ǔ ǚ — Be Vietnam Pro / Lora thiếu) từ Noto Serif SC; mỗi phần một họ, dùng qua `fontFamilyFallback` | `app/assets/fonts/**`, `app/lib/theme/app_fonts.g.dart`, khối `fonts:` trong `app/pubspec.yaml` |

Chữ Hán mới trong bài học / code / đặc tả → `npm run build` tự cắt lại cả hai. Chữ gõ lúc chạy (người dùng nhập) thì
không có — khi cần, đổi cách (font đầy đủ, nặng).

## Lệnh `npm run build` làm gì (theo thứ tự)

`tsc --noEmit` → `check-scene.mjs` (kiểm `scene.json`) → `subset-han.mjs` → `vite build` → `copy-to-app.mjs`
(`dist/` → `app/assets/scene/`) → `fonts-app.mjs`. `build:design` → `dist-design/` (Canvas 3D, không vào app).
