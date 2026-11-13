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
| `buildings[].kind` tiện ích (2026-11-13.13, **vào được**) | `"hi-dai"` · `"tra-lau"` · `"lau-sach"` · `"cua-hang"` | hí đài: nền 1,5 m, dốc bậc 3 m sau lưng hai bên (chừa ≥ 2 m tới tường), `w` ~11 × `d` ~9; trà lâu: 2 tầng, tầng 1 mở (3 bàn trà), `w` 12 × `d` 9; Tàng Thư Các: 2 tầng 6 gian, lan can + bậc như giảng đường, `w` 18 × `d` 9; cửa hàng: 2 tầng mặt tiền mở, `w` 4–8 × `d` 6. Mái / tầng trên mờ khi ở trong (R-HUD-2). Bản mẫu `source/TienIch-kien-truc.dc.html` |
| `buildings[].kind` `"rap-phim"` (R-RAP-1) | `{ "kind": "rap-phim", "x": 0, "z": -12, "w": 12, "d": 14, "title": "影戲臺" }` | rạp ngoài trời: màn 8 × 4,5 m ở mép sau (z − d/2 + 0,5), 4 hàng × 6 bồ đoàn từ tâm −2 tới +2,5 về phía trước; lưng màn chặn camera — chừa ≥ 1,5 m sau màn để đi vòng. Phim: `web/src/zones/videos.ts` |
| `buildings[]` trường phụ | `"trim": "#2b5446"` · `"pillarColor": "#2f6f73"` · `"sign": "筆"` · `"goods": "but"` | `trim` bờ nóc + viền mép mái, `pillarColor` màu cột (Tàng Thư Các: lục); cửa hàng: `sign` một chữ Hán trên cờ dọc, `goods` but · vai · bua · thuoc · thung |
| `buildings[].zone` | `{ "id": "lop-hsk3", "front": 3, "r": 1.8 }` | nhà giảng đường có `zone` mà `ZONE_CONTENT` cho nội thất → **nhà vào được** (cửa giữa, nội thất, mái mờ; vùng học trong nhà, `front` / `r` không tác dụng) |
| `buildingStyle` | `stone` · `water` · `path` · `bronze` · `herb` · `smoke` · `beamBlue` · `gold` · `timber` · `cloth` (ô giấy dầu) | màu chung (xà lam, vàng kim, gỗ sẫm) |
| `buildingStyle.heightScale` | `1.6` | hệ số chiều cao kiến trúc (nền, cột, tường, cửa, mái, tầng tháp, cổng); thứ cỡ người (bậc — thêm bậc, lan can, biển, đèn, đồ đạc) giữ. Mặc định 1 |
| `gates` | `{ "id": "son-mon", "x": 0, "z": 45, "width": 6, "title": "Thanh Vân Tông", "hanTitle": "文淵宗", "roofColor": "#3e6b5a" }` | cổng sơn môn 3 gian 4 trụ (gian giữa = `width`, gian bên 3,5 m); va chạm chỉ trụ |
| `water` | `{ "x": -45, "z": 10, "r": 4 }` · `{ "x": 52, "z": -8, "w": 6, "d": 4 }` | ao tròn / chữ nhật, không đi xuống được |
| `props` | `{ "kind": "lo-dan", "x": -41, "z": -27, "scale": 1 }` | luong-thuoc · lo-dan (khói) · da-thai-ho · den-da · dinh-dong (khói hương) · ban-tra (bàn trà + 4 đôn) · sap-o (sạp ô giấy) · co (cột cờ 9 m, `text` một chữ Hán, phấp phới) · bang (bảng vinh danh, `text` = tiêu đề) |
| `site` | `{ "name": "Văn Uyên Tông", "han": "文淵宗", "areas": [{ "name": "Diễn Võ Trường", "han": "演武場", "from": [27, -15], "to": [60, 15] }] }` | chip HUD (R-HUD-1) + thẻ tên khu (R-HUD-3) + màn tải; chữ Hán mới tự được cắt font khi build |
| `player.start` | `[0, 80]` | điểm xuất phát (bố cục) |
| `teleport` | `{ "enabled": true, "center": [44, 0], "radius": 13, "ringRadius": 4 }` | vòng trận truyền tống (R-HANH-2): tông môn = sân đá ∅ `2 × radius` + vòng giữa sân; vùng: `"radius": 0` = vòng trên bệ đá. `player.start` phải ngoài vòng (≥ 0,8 × ringRadius + 1 m). `colors`. Canvas 3D `?nap=0..1` xem hiệu ứng nạp |
| `steles` | `{ "x": -2.9, "z": 31.4, "rotY": 77, "radical": "thuy" }` | bia bộ thủ (R-HANH-3, Rừng trúc): mặt khắc nhìn +z khi `rotY` 0 (độ, tuỳ ý); `radical` = mã trong `web/src/zones/radicals.ts` (50 bộ, không trùng). Màu `stele` (đá, chữ, viền vàng). Canvas 3D `?hoc=n` = n bộ đầu đã học |
| `trees.groves[].kind: "truc-mao"` | — | trúc mao 12–18 m, 4 thân / khóm, đung đưa; màu `trees.mao` (thân, thân già, lá). ≈ 60 tam giác / thân — giữ ≤ 1 500 thân thấy được |
| `buildings[].kind: "dinh"` | `{ "kind": "dinh", "sides": 6, "w": 5, "d": 5, "roofColor": "#56635b" }` | đình mái chóp không tường (đi vào được, chỉ chân cột chặn); `sides` 4 / 6 |
| `walls.enabled` · `well.enabled` | `false` | cảnh vùng: không tường bao (đoạn `wallSegments` vẫn dựng), không giếng |

**Nhiều cảnh** (mục 2026-11-13.6): `scene.json` = tông môn; mỗi vùng một file `design/scene/<mã vùng>.json` (vd.
`rung-truc.json`), ghép lên khuôn mặc định như `scene.json` — danh sách (`buildings`, `trees.yard`…) ghi rõ `[]` nếu
không muốn thứ của khuôn. Canvas 3D: `?vung=<mã>` xem cảnh vùng.

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
