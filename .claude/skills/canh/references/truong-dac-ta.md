# Trường đặc tả cảnh (`design/scene/scene.json`)

Kiểu + chú thích đầy đủ: `web/src/scene/spec.ts`; khuôn mặc định: `web/dist-design/scene.default.json`. Mọi trường mới
mặc định giữ cảnh cũ. Vật có va chạm chỉ quay 0 · 90 · 180 · 270; lối đá, mây, đảo, thác, suối: không va chạm.
Ví dụ: đủ 6 khu phẳng `docs/phieu_thiet_ke/2026-11-11-tong-mon-dot-1-mau.json` · mọi kiểu Trung Hoa
`docs/phieu_thiet_ke/2026-11-11-phong-cach-mau.json` · địa hình `docs/phieu_thiet_ke/2026-11-11-dia-hinh-mau.json`.

## Sân, tường, nhà, cổng

| Trường | Ví dụ | Ghi chú |
|---|---|---|
| `walls.gates` | `{ "side": "nam", "at": 0, "width": 5 }` | khe trên tường bao; `side`: bac · nam · dong · tay; `at` = tâm khe dọc cạnh |
| `walls.style` | `"voi"` (+ `"windows": 6`) | tường vôi + chân đá + mái ngói; khe thành **cổng trăng** — vòm thu bán kính theo chiều cao tường (đỉnh vòm dưới mái tường 0,6 m), lối đi hẹp theo; `walls.color` = màu vôi. Mặc định `"gach"` |
| `wallSegments` | `{ "from": [27, -15], "to": [60, -15] }` | đoạn tường thêm, thẳng trục; `height` tuỳ chọn |
| `paths` | `{ "from": [0, 21], "to": [0, 55], "width": 5 }` | lối lát đá, góc tự do; `color` tuỳ chọn; nối hai bục khác độ cao thành dốc |
| `buildings[].kind` | `"dien"` · `"thap"` (+ `"floors": 5`) · `"nha-nho"` | thiếu = `giang-duong`; `"roof": "cong"` = mái cong đầu đao (tháp mặc định cong) |
| `buildings[].zone` | `{ "id": "lop-hsk3", "front": 3, "r": 1.8 }` | nhà giảng đường có `zone` mà `ZONE_CONTENT` cho nội thất → **nhà vào được** (cửa giữa, nội thất, mái mờ; vùng học trong nhà, `front` / `r` không tác dụng) |
| `buildingStyle` | `stone` · `water` · `path` · `bronze` · `herb` · `smoke` · `beamBlue` · `gold` · `timber` | màu chung (xà lam, vàng kim, gỗ sẫm) |
| `buildingStyle.heightScale` | `1.6` | hệ số chiều cao kiến trúc (nền, cột, tường, cửa, mái, tầng tháp, cổng); thứ cỡ người (bậc — thêm bậc, lan can, biển, đèn, đồ đạc) giữ. Mặc định 1 |
| `gates` | `{ "id": "son-mon", "x": 0, "z": 45, "width": 6, "title": "Thanh Vân Tông", "hanTitle": "文淵宗", "roofColor": "#3e6b5a" }` | cổng sơn môn 3 gian 4 trụ (gian giữa = `width`, gian bên 3,5 m); va chạm chỉ trụ |
| `water` | `{ "x": -45, "z": 10, "r": 4 }` · `{ "x": 52, "z": -8, "w": 6, "d": 4 }` | ao tròn / chữ nhật, không đi xuống được |
| `props` | `{ "kind": "lo-dan", "x": -41, "z": -27, "scale": 1 }` | dai-ti-thi (r 6) · gia-binh-khi · luong-thuoc · lo-dan (khói) · da-thai-ho · den-da · dinh-dong (khói hương) |
| `site` | `{ "name": "Văn Uyên Tông", "han": "文淵宗", "areas": [{ "name": "Diễn Võ Trường", "han": "演武場", "from": [27, -15], "to": [60, 15] }] }` | chip HUD (R-HUD-1) + thẻ tên khu (R-HUD-3) + màn tải; chữ Hán mới tự được cắt font khi build |
| `player.start` | `[0, 80]` | điểm xuất phát (bố cục) |

## Cây, trời

| Trường | Ví dụ | Ghi chú |
|---|---|---|
| `trees.groves` | `{ "kind": "truc", "x": 63, "z": 30, "w": 4, "d": 20, "count": 10, "collide": false }` | cụm cây rải trong chữ nhật; `kind`: tan · truc · tung · lieu · mai |
| `trees.leaves` · `willow` · `plum` | màu | tùng, liễu, mai |
| `floating` | `"islands": [{ "x": -90, "y": 35, "z": -90, "scale": 2 }]`, `"clouds": { "count": 10 }` | đảo nổi, mây trôi |
| `sky` · `fog` · `light` · `ground` · `well` | xem `spec.ts` | trời 3 màu, sương `near` / `far` (cảnh rộng: tăng `far`), đèn, màu gạch sân, giếng |
| `camera` | `fov`, `minDist`, `maxDist`, `near` / `far` (góc gần / xa) | `pitch` trong góc: radian |

## Địa hình (`terrain.enabled: true`)

| Trường | Ví dụ | Ghi chú |
|---|---|---|
| `terrain` | `"center": [0, -5]`, `"size": 300`, `"cell": 2.5` | thay mặt sân phẳng; `size / cell` ≤ 400 |
| `terrain.plateaus` | `{ "from": [-22, -22], "to": [22, 22], "y": 0, "pave": true, "blend": 5 }` | bục ép phẳng; `pave` = lát gạch; `blend` ≤ 1 = kè dựng đứng. Nhà, tường, cổng, ao, giếng **phải nằm trên bục** (đặt theo độ cao mặt đất tại tâm — bục cao bao nhiêu cũng được) |
| `terrain.peaks` | `{ "x": 0, "z": -82, "r": 48, "h": 42 }` | đỉnh núi / đồi. Cây, đồ trang trí tự đặt lên mặt đất |
| `terrain.edge` · `noise` · `colors` | `{ "radius": 105, "width": 15, "y": -30, "wobble": 8 }` | mép cao nguyên đổ xuống vực; nhiễu; màu cỏ (3) · đất · đá · đá cao theo dốc `slopeDirt` / `slopeRock` |
| `terrain.stairs` | `{ "from": [0, -24], "to": [0, -57], "width": 4 }` | bậc đá thẳng; hai đầu theo bục / đất; dốc TB ≤ 35° (`scene:check` báo) |
| `terrain.grass` · `rocks` | `{ "density": 6, "colors": ["#6f8c50", "#93ad66"] }` · `{ "density": 4, "color": "#8d8a84" }` | cỏ búi / 100 m² (dốc < 25°, không trên bục lát / lối / bậc) · đá / 1000 m²; 0 = tắt |
| `terrain.waterfalls` | `{ "x": 42, "z": -76, "top": 15, "bottom": 4, "width": 3, "rotY": 0 }` | thác đứng (mặt nhìn +z), bọt chân; đặt ở kè giữa hai bục |
| `terrain.streams` | `{ "points": [[42, -66], [46, -58], [44, -48]], "width": 1.6 }` | suối bám đất; muốn chặn đi thì đặt `water` |
| `farMountains` | `{ "base": -40, "layers": [{ "radius": 170, "height": 45, "color": "#5f7a80", "peaks": 9, "width": 2, "spurs": 2 }] }` | núi xa nhiều lớp, không sương, lớp xa nhạt dần; `width` bề ngang đỉnh (1 nhọn, 2 rộng tròn), `spurs` đỉnh phụ mỗi bên 0…3 |
| `cloudSea` | `{ "radius": 420, "y": -8, "color": "#f4f1ea" }` | biển mây dưới mép; `radius` 0 = tắt |

Nhân vật không leo dốc > 35° (R-VA-2). Nhân vật: `design/models/nhan-vat.glb` nếu có (`/tai-nguyen`), không thì đệ tử
khối.
