---
name: ui-design
description: Phiên THIẾT KẾ Học Xá 3D — vẽ màn / thành phần mới trên canvas theo phiếu, thiết kế cảnh 3D (bố cục sân, nhà, cây, màu, ánh sáng, camera) bằng đặc tả + Canvas 3D, chốt thì xuất vào design/ và đẩy lên nhánh chính. Dùng ở Claude ngoài VS Code (claude.ai/code hoặc tab Code của app máy tính) khi người dùng gõ /ui-design, dán một phiếu "Dán vào canvas", hoặc nói "vẽ màn …", "sửa thiết kế …", "dời nhà / đổi màu trời / sửa cảnh …", "chốt".
argument-hint: "[<phiếu dán vào> | <yêu cầu vẽ> | canh <yêu cầu> | chot]"
---

# /ui-design — vẽ trên canvas (phiên thiết kế)

Tham số: $ARGUMENTS

**Mọi câu trả lời mở đầu bằng một dòng:** `Canvas: https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1`

## Vai

Hai phiên, hai vai. Phiên này **chỉ** vẽ canvas và ghi thư mục `design/` (cùng trạng thái phiếu trong
`docs/phieu_thiet_ke/`). **Không sửa code ứng dụng** (`web/`, `app/`, `tool/`), không sửa sổ quy tắc — thiết kế cần đổi
luật thì ghi rõ trong mục CHANGELOG, phiên code (`/ui-apply`) hỏi người dùng rồi sửa sổ.

| Lệnh | Làm gì |
|---|---|
| `/ui-design <phiếu>` hoặc `<yêu cầu>` | Đọc bối cảnh, vẽ / sửa artboard trên canvas. Chưa ghi repo. |
| `/ui-design canh <yêu cầu>` | Sửa cảnh 3D: đặc tả `design/scene/scene.json` → Canvas 3D (mục "Cảnh 3D"). Chưa commit. |
| `/ui-design chot` (hoặc người dùng nói "chốt") | Xuất mọi thứ đã vẽ vào `design/`, commit, đẩy lên nhánh chính. |

## Trước khi vẽ — đọc

1. Phiếu: người dùng dán, hoặc `docs/phieu_thiet_ke/*.md` có trạng thái `chờ thiết kế`.
2. `design/tokens/design_tokens.json` — chỉ dùng màu, chữ, bo góc, khoảng cách ở đây; token mới thì thêm vào và ghi lý do.
3. `design/docs/components.md` — dùng lại thành phần đang có trước.
4. `design/docs/screen_specs.md` — mục của màn liên quan (nếu đã có).
5. `docs/testing/quy_tac.md` — luật `R-…` mà phiếu nêu; thiết kế không được trái luật đã chốt (`đúng`).
6. Cảnh 3D / phong cách: hồ sơ khảo cứu liên quan trong `docs/tham_khao/` (do `/khao-cuu` ghi) — đặc điểm nhận
   diện, tỉ lệ, màu, sai thường gặp. Chủ đề chưa có hồ sơ mà cần "đúng chất" → gợi ý người dùng chạy `/khao-cuu` trước.

## Vẽ

- Canvas đã có — luôn dùng đúng link trên, không tạo canvas mới. Đọc `project/canvas.json` của canvas trước khi
  thêm artboard; làm theo hướng dẫn của loại Design khi đọc canvas.
- Mỗi màn hai artboard: `<Man>-doc.dc.html` 390×844 và `<Man>-ngang.dc.html` 844×390 (app xoay tự do), thêm
  artboard cho từng trạng thái phiếu yêu cầu. Chừa vùng an toàn: tai thỏ / thanh trạng thái trên (dọc), hai bên (ngang).
- Giao diện tiếng Việt; chữ Hán dùng font Noto Serif SC. Cảnh 3D không vẽ trên canvas 2D — dùng khối màu
  `scene-bg` hoặc ảnh chụp app / Canvas 3D làm nền giữ chỗ; thiết kế cảnh theo mục "Cảnh 3D" bên dưới.
- Chưa "chốt" thì **không commit gì** (riêng cảnh 3D: sửa `scene.json` trong máy để build Canvas 3D, chưa commit). Người dùng xem và góp ý trực tiếp trên canvas.

## Cảnh 3D (bối cảnh, bố cục, màu, ánh sáng, camera)

Cảnh 3D không vẽ trên canvas 2D mà thiết kế bằng **đặc tả** `design/scene/scene.json` + **Canvas 3D** (artifact
chạy chính code `web/` — cái thấy trên đó là cái app sẽ hiện). Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0002-thiet-ke-3d.md`.

| Thứ | Ở đâu |
|---|---|
| link Canvas 3D | `design/scene/README.md` (dòng `Canvas 3D: <link>`); chưa có → tạo mới lần đầu và ghi vào đó |
| khuôn + giá trị mặc định (mọi trường hợp lệ) | `web/dist-design/scene.default.json` sau `build:design`; kiểu + chú thích: `web/src/scene/spec.ts` |
| nội dung vùng (chữ thẻ, bài học) — chỉ đọc | `web/src/zones/zones.ts` (`ZONE_CONTENT`, mã: `lop-hsk3`, `thu-vien`) |

1. `cd web && npm ci` (lần đầu). Chưa có `design/scene/scene.json` → `npm run build:design`, chép
   `web/dist-design/scene.default.json` thành `design/scene/scene.json`.
2. Sửa `scene.json` theo yêu cầu. Chỉ dùng trường có trong khuôn. Màu `"#rrggbb"`; `rotY` của nhà: 0 · 90 · 180 ·
   270 (độ); `pitch` camera: radian; mặt trước nhà (cửa, biển) nhìn về +z trước khi quay. Vùng sự kiện neo theo
   nhà: `zone: { id, front, r }` — `id` phải là mã đã có nội dung trong `ZONE_CONTENT`.
3. `npm run scene:check` → phải "Không có lỗi" (in cả toạ độ vùng, nhà, tường để đối chiếu luật).
4. `npm run build:design` → đăng `web/dist-design/design.html` lên link Canvas 3D, `files` = mọi file trong
   `web/dist-design/assets/` (đường dẫn `assets/<tên>`). Báo link; người dùng xoay / bay quanh cảnh, bật khung va
   chạm, chạm mặt sân để lấy toạ độ, góp ý.
5. Cần thứ đặc tả không tả được (kiểu vật mới: cầu, ao, bàn ghế; hình mái khác; vùng có bài học mới) → **không
   sửa code**: ghi vào mục CHANGELOG phần "Cần code" (cái gì, ở đâu, trông thế nào) để phiên code làm trước.
6. Dời nhà / tường / cây trong sân / giếng / vùng / điểm xuất phát là đổi **bố cục** — chạm luật `R-VA-1`,
   `R-VUNG-1` (đọc ví dụ của hai luật trong `docs/testing/quy_tac.md`); ghi rõ trong CHANGELOG. Chỉ đổi màu, ánh
   sáng, sương, trời, camera, cây ngoài tường là **ngoại hình**.

**Các loại vật đặc tả tả được** (đầy đủ kiểu + chú thích: `web/src/scene/spec.ts`; ví dụ đủ 6 khu phẳng:
`docs/phieu_thiet_ke/2026-11-11-tong-mon-dot-1-mau.json` — bản thử cú pháp của phiên code, không phải thiết kế).
Vật có va chạm chỉ quay 0 · 90 · 180 · 270; lối đá, mây, đảo: không va chạm.

| Trường | Ví dụ | Ghi chú |
|---|---|---|
| `walls.gates` | `{ "side": "nam", "at": 0, "width": 5 }` | khe trên tường bao; `side`: bac · nam · dong · tay; `at` = tâm khe dọc cạnh |
| `wallSegments` | `{ "from": [27, -15], "to": [60, -15] }` | đoạn tường thêm, thẳng trục; `height` tuỳ chọn |
| `paths` | `{ "from": [0, 21], "to": [0, 55], "width": 5 }` | lối lát đá, góc tự do; `color` tuỳ chọn (mặc định `buildingStyle.path`) |
| `buildings[].kind` | `"dien"` · `"thap"` (+ `"floors": 5`) · `"nha-nho"` | thiếu = `giang-duong`; `"roof": "cong"` = mái cong đầu đao (tháp mặc định cong) |
| `gates` | `{ "id": "son-mon", "x": 0, "z": 45, "width": 6, "title": "Thanh Vân Tông" }` | cổng sơn môn; va chạm chỉ hai cột |
| `water` | `{ "x": -45, "z": 10, "r": 4 }` · `{ "x": 52, "z": -8, "w": 6, "d": 4 }` | ao tròn hoặc chữ nhật, không đi xuống được |
| `props` | `{ "kind": "lo-dan", "x": -41, "z": -27 }` | dai-ti-thi (r 6) · gia-binh-khi (3,2 × 0,8) · luong-thuoc (4 × 1,6) · lo-dan (có khói); `scale` tuỳ chọn |
| `trees.groves` | `{ "kind": "truc", "x": 63, "z": 30, "w": 4, "d": 20, "count": 10 }` | cụm cây rải trong chữ nhật; `"collide": false` = chỉ trang trí; `trees.yard[].kind` cũng nhận `truc` |
| `floating` | `"islands": [{ "x": -90, "y": 35, "z": -90, "scale": 2 }]`, `"clouds": { "count": 10, … }` | đảo nổi, mây trôi |
| `buildingStyle` | `stone` · `water` · `path` · `bronze` · `herb` · `smoke` · `beamBlue` · `gold` · `timber` | màu chung (xà lam, vàng kim, gỗ sẫm) |
| `walls.style` | `"voi"` (+ `"windows": 6`) | tường vôi + chân đá + mái ngói; khe tường bao thành **cổng trăng** (lối đi = 0,8 × bề rộng khe); `walls.color` = màu vôi. Mặc định `"gach"` |
| `gates[]` | `"hanTitle": "文淵宗"`, `"roofColor": "#3e6b5a"` | cổng 3 gian 4 trụ (gian giữa = `width`, gian bên 3,5 m, xà ≥ 6 m) |
| `trees…kind` | `"tung"` · `"lieu"` · `"mai"` | tùng (cây chính), liễu (quanh ao, dải rủ đung đưa), mai; màu `trees.leaves` (tùng), `trees.willow`, `trees.plum` |
| `props` | `"da-thai-ho"` · `"den-da"` · `"dinh-dong"` | đá Thái Hồ, đèn đá, đỉnh đồng có khói hương |
| `site` | `{ "name": "Văn Uyên Tông", "areas": [{ "name": "Diễn Võ Trường", "from": [27, -15], "to": [60, 15] }] }` | chip HUD hiện tên khu đang đứng (luật `R-HUD-1`); chưa có = "Học xá · Sân chính" |
| `terrain` | `"enabled": true`, `"center": [0, -5]`, `"size": 300`, `"cell": 2.5` | **địa hình** thay mặt sân phẳng (`ground` khi đó chỉ còn là màu gạch lát); `size / cell` ≤ 400 |
| `terrain.plateaus` | `{ "from": [-22, -22], "to": [22, 22], "y": 0, "pave": true, "blend": 5 }` | bục khu ép phẳng; `pave` = lát gạch; `blend` nhỏ (≤ 1) = kè đá dựng đứng. Nhà, tường, cổng, ao, giếng **phải nằm trên bục** |
| `terrain.peaks` | `{ "x": 0, "z": -82, "r": 48, "h": 42 }` | đỉnh núi / đồi (chủ phong). Cây, đồ trang trí tự đặt lên mặt đất |
| `terrain.edge` · `noise` · `colors` | `{ "radius": 105, "width": 15, "y": -30, "wobble": 8 }` | mép cao nguyên đổ xuống vực; nhiễu nhấp nhô; màu cỏ (3) · đất · đá · đá cao theo dốc `slopeDirt` / `slopeRock` |
| `farMountains` | `{ "base": -40, "layers": [{ "radius": 170, "height": 45, "color": "#5f7a80", "peaks": 9, "width": 2, "spurs": 2 }] }` | núi xa nhiều lớp, không chịu sương — lớp xa nhạt dần; `width` = hệ số bề ngang đỉnh (1 = nhọn như cũ, 2 = rộng chân, đỉnh tròn hơn), `spurs` = số đỉnh phụ mỗi bên (0…3) |
| `cloudSea` | `{ "radius": 420, "y": -8, "color": "#f4f1ea" }` | biển mây dưới mép cao nguyên; `radius` 0 = tắt |
| `terrain.stairs` | `{ "from": [0, -24], "to": [0, -57], "width": 4 }` | bậc đá thẳng; độ cao hai đầu = bục (nếu đầu nằm trên bục) hoặc đất tự nhiên; dốc trung bình ≤ 35° (`scene:check` báo) |
| `terrain.grass` · `terrain.rocks` | `{ "density": 6, "colors": ["#6f8c50", "#93ad66"] }` · `{ "density": 4, "color": "#8d8a84" }` | cỏ búi (búi / 100 m², dốc < 25°, không trên bục lát / lối / bậc) · đá rải (tảng / 1000 m², nhiều hơn trên dốc); 0 = tắt |
| `terrain.waterfalls` | `{ "x": 42, "z": -76, "top": 15, "bottom": 4, "width": 3, "rotY": 0 }` | thác dựng đứng (mặt nhìn +z trước khi quay), vân chảy, bọt ở chân; đặt ở mép kè giữa hai bục; không va chạm |
| `terrain.streams` | `{ "points": [[42, -66], [46, -58], [44, -48]], "width": 1.6 }` | suối bám mặt đất qua các điểm, vân chảy theo dòng; không va chạm (muốn chặn thì đặt `water` ở chỗ đó) |

Kiểu nhà (`dien`, `giang-duong`, `nha-nho`, `thap`), cổng, cây, đồ trang trí, nhân vật đệ tử đã dựng theo bản mẫu
`source/PhongCach-*.dc.html` — ví dụ dùng hết kiểu mới: `docs/phieu_thiet_ke/2026-11-11-phong-cach-mau.json`.
Cảnh rộng: tăng `ground.size` (phủ hết các khu) và `fog.far`. Canvas 3D: `?view=tren` / `?view=ca-san` để chụp ảnh,
`?cam=x,y,z&tam=x,z` chụp gần một chỗ, `?nhan-vat=gau` xem lại gấu khối;
bảng "Hiệu năng" in draw call (không tính lớp phủ) — giữ ≤ 150. Có địa hình (đồi, chủ phong, vực, núi xa, biển
mây — ví dụ `docs/phieu_thiet_ke/2026-11-11-dia-hinh-mau.json`, hồ sơ `docs/tham_khao/dia-hinh-tong-mon.md`); nhân
vật không leo dốc > 35° (`R-VA-2`). Có bậc đá, cỏ búi, đá rải, suối, thác. Nhà, cổng, ao, giếng, lối lát tự đặt theo độ cao mặt đất
tại tâm (đặt trên bục cao bao nhiêu cũng được; lối lát nối hai bục khác độ cao thành dốc).
Nhà vào được (2026-11-11): nhà kiểu giảng đường có `zone` mà nội dung bài trong code cho nội thất (`lop-hsk3` → lớp
học, `thu-vien` → thư viện) tự thành nhà rỗng có cửa giữa + nội thất; vùng học nằm trong nhà (trường `zone.front` / `r`
không còn tác dụng với nhà đó). Không còn thẻ mời. Canvas 3D: `?nv=x,z` đặt nhân vật (vd. `?nv=0,-10.5` trong giảng
đường, mái mờ sẵn).

Model `.glb` chưa dùng — mốc 3D-b. Nhân vật: đệ tử chibi dựng bằng khối (`web/src/player/discipleCharacter.ts`).

## Chốt

1. Mã mục mới: `<YYYY-MM-DD>.<số>` (số tiếp theo trong ngày, xem `design/CHANGELOG.md`).
2. Xuất canvas: đọc `project/canvas.json` và các artboard đã đổi → ghi vào `design/source/` (cùng tên file).
3. Ảnh: chụp artboard đã chốt vào `design/screens/<Man>-doc.png`, `-ngang.png` nếu công cụ cho phép; không được thì
   ghi "chưa có ảnh" trong đặc tả (phiên code dùng `source/*.dc.html`).
4. `design/docs/screen_specs.md`: thêm / sửa mục `## <Màn>` theo mẫu trong file (bố cục dọc + ngang, trạng thái,
   số đo theo token, chuỗi, luật `R-…`).
5. Thành phần mới → `design/docs/components.md`. Token mới / đổi → `design/tokens/design_tokens.json`.
6. Chuỗi mới → `design/l10n/vi.arb` (`"<khoá>": "<chữ>"`).
7. `design/CHANGELOG.md`: mục mới ở trên cùng — loại (token · chuỗi · giao diện · luồng/luật · dữ liệu · cảnh 3D),
   màn, phiếu đáp ứng, file đổi, luật bị chạm (nếu thiết kế cần đổi luật: ghi rõ đề xuất). Mục cảnh 3D ghi thêm:
   **bố cục** hay **ngoại hình**, trường đã đổi (cũ → mới), kết quả `npm run scene:check`, "Cần code" (nếu có).
   Ảnh cảnh (nếu chụp được): `design/screens/Canh-<goc>.png`.
8. Phiếu đáp ứng: giữ `chờ thiết kế` (phiên code đóng phiếu khi áp xong), thêm dòng `- Đã vẽ: <mã>`.
9. `git add design/ docs/phieu_thiet_ke/` → commit `design <mã>: <tóm tắt>` → đẩy lên nhánh chính (`main`).
10. Báo: mã, màn đã chốt, nhắc người dùng mở VS Code chạy `/ui-apply`.
