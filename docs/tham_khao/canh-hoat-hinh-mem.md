# Cảnh hoạt hình mềm, màu ấm mà không lag (柔和卡通 · 暖色)
- Ngày: 2026-11-14 · Khu: cả 7 map + Nhà của ta (làm thử Khởi Nguyên Trấn) · Trạng thái: nháp — chờ chọn bảng màu (A / B / C) ·
  kế hoạch `docs/tasks/2026-11-14-canh-dep.md`

## Một câu
Kiểu Animal Crossing / 摩尔庄园 / Sky: **khối tròn mềm, màu pastel ấm, ánh sáng dịu không có mặt đen, đất phủ cỏ hoa,
trời và núi xa nhạt dần như tranh màu nước** — vẫn giữ 粉牆黛瓦 · 朱柱青檐 của tông môn, chỉ "dịu" đi. Đẹp đến từ **màu +
ánh sáng + mật độ chi tiết nhỏ**, không đến từ đồ hoạ nặng: mọi kỹ thuật dưới đây rẻ (0–2 draw call mỗi thứ, không hậu kỳ
toàn màn hình).

## Hiện trạng — vì sao cảnh đang "xấu" (đọc code 2026-11-14)

| Chỗ | Thấy gì trong code | Hệ quả nhìn thấy |
|---|---|---|
| Nhà | `kien_truc/` dựng bằng `BoxGeometry` + lăng trụ, mỗi khối một màu Lambert phẳng; trà lâu / Tàng Thư Các / Tạp hoá ở trấn vẫn là **hàm cũ** (Catalog ghi "duyệt lại ở GĐ 4–5"); `SceneSpec.buildings` chưa có `mau` / `co` (chưa dùng được mẫu Catalog trong cảnh) | cạnh sắc, mặt tường phẳng một màu, gầm mái không tối → "hộp" |
| Đất | `terrain.ts` mỗi tam giác một màu (flat shading), lưới ô 2 m; cỏ 3 000 búi 3 lá, đá 400; không hoa | mặt đất lốm đốm tam giác, xa thì trống |
| Cây | tán = icosahedron 0 chia (20 mặt) chồng 3 tầng, Lambert một màu mỗi tầng | tán như viên đá cắt, không có sáng trên / tối dưới |
| Trời | nền = ảnh gradient 3 màu (`environment.ts`); mây = icosahedron trong suốt 0,85 | trời phẳng, mây như đá trắng |
| Núi xa | 3 vòng răng cưa, màu đặc, chân pha mây 45 % (`farMountains.ts`) | đẹp hơn cả; đỉnh nhọn, màu lạnh xám lục |
| Nước | `MeshBasicMaterial` một màu `#3d6e86` + bờ torus | tấm nhựa xanh, không gợn, không phản trời |
| Ánh sáng | Hemisphere `#dfe8ff` / `#6b5a48` 0,8 + nắng 0,95; sương `#c3cbd4` (xám lạnh) | mặt khuất nắng xám bẩn, xa thì xám |
| Đường màu | `renderer.ts` tắt `ColorManagement` nhưng vẫn xuất `SRGBColorSpace` → màu hex của vật liệu được coi là tuyến tính rồi **mã hoá sRGB thêm một lần** (đã soát mã three 0.170: `ColorManagement.convert` bỏ qua khi `enabled = false`, còn `linearToOutputTexel` theo `outputColorSpace`) | màu phẳng bị **nhạt, bệch, thiếu tương phản** so với hex chọn; ảnh (texture sRGB) thì đúng → hai thứ lệch tông nhau. *Suy luận từ mã nguồn — thử A/B trên Canvas 3D trước khi đổi.* |

## Đặc điểm nhận diện của "hoạt hình mềm" (thiếu là không ra chất)
1. **Không có màu đen / xám chết ở mặt khuất**: bóng là màu ấm-tím nhạt (ánh trời + đất dội lên), tương phản sáng – tối thấp.
2. **Chuyển màu mềm trên mỗi khối**: tán cây sáng trên tối dưới, chân tường sẫm nhẹ, gầm mái tối — "bóng nướng sẵn".
3. **Khối bo tròn**: tán cây chùm cầu, mép tường / nền vát, mái cong mềm, đá tròn — không cạnh sắc ở tầm nhìn chơi.
4. **Mặt đất "đầy"**: cỏ nhiều tầng màu, khóm hoa, sỏi, viền lối đi mềm; cỏ hoa lay nhẹ theo gió.
5. **Không khí**: sương ấm theo khoảng cách, núi xa nhạt dần thành lam-tím, chân trời hồng đào; mây phồng.
6. **Nước trong**: nông thì ngọc nhạt, sâu thì lam, rìa có viền bọt trắng, mặt có vệt sáng gợn.
7. **Bảng màu hẹp, bão hoà vừa**: mọi màu cùng "nhiệt" (pha một chút vàng), không có màu thuần (đỏ / lục / lam tinh).

## Kỹ thuật chọn (xếp theo lợi / chi phí)

Chi phí ghi theo cảnh hiện tại (góc chơi, bench 2026-11-14: 53–65 draw call, 49–80k tam giác vẽ). "Fill" = chi phí điểm ảnh
(GPU điện thoại thường nghẽn ở đây: mỗi lớp trong suốt phủ cả màn là thêm một lần tô toàn màn).

| # | Kỹ thuật | Làm thế nào (three.js 0.170, không thư viện mới) | Draw call | Tam giác | Fill / GPU | Cách đo |
|---|---|---|---|---|---|---|
| 1 | **Bảng màu ấm + ánh sáng dịu** | đổi số `light` / `fog` / `sky` trong `scene.json`; Hemisphere trời kem – đất lục ấm mạnh hơn, nắng yếu hơn (tương phản thấp); sương ấm | 0 | 0 | 0 | ảnh trước / sau |
| 2 | **Vật liệu cảnh chung "mềm"** = `MeshLambertMaterial` + `onBeforeCompile` chèn 3 dòng shader: *wrap lighting* (half-Lambert: `dot(N,L)·0,5+0,5` thay cho `max(dot,0)` → mặt khuất không đen), nhân `vertexColor` (AO nướng), pha màu bóng ấm `aoTint` | **giảm**: bật `vertexColors` → các khối tĩnh khác màu gộp chung một vật liệu (`merge.ts` hiện gộp theo *màu*; 1 vật liệu → ít nhóm hơn hẳn) | 0 | +2–3 phép tính / điểm ảnh — như Lambert (từ r151 Lambert đã tính sáng theo điểm ảnh) | bench `npm run bench`, bảng gỡ lỗi trên máy thật |
| 3 | **Bóng nướng sẵn vào màu đỉnh (baked AO)** | tính một lần lúc dựng (CPU, không GPU): theo độ cao trong khối (chân tường sẫm 15–25 %), mặt hướng xuống (gầm mái, gầm hiên sẫm 35–45 %), tán cây (dưới tối trên sáng), mặt đất quanh chân nhà / cây (vòng sẫm mềm, dùng danh sách vật cản `colliders`). Không ray-cast cả cảnh (chậm lúc tải) | 0 | 0 (thêm thuộc tính `color` 12 byte / đỉnh) | 0 | thời gian tải (bảng gỡ lỗi "tải … s") |
| 4 | **Trời vòm gradient + quầng nắng + mây phồng** | vòm cầu 16 × 8 đoạn, `MeshBasicMaterial` `vertexColors`, `fog:false`, `depthWrite:false`, vẽ đầu tiên: 4 màu theo độ cao + quầng sáng quanh hướng nắng (tính màu đỉnh trên CPU). Mây: mỗi đám 4–6 cầu low-poly gộp, **đục** (không trong suốt), đáy phẳng, màu đỉnh trắng → bụng hồng đào; InstancedMesh trôi chậm | 1 (vòm, thay nền ảnh) + 1 (mây, như cũ) | +~1k + ~3k | vòm = 1 lần tô toàn màn, như xoá nền; mây đục rẻ hơn mây trong suốt hiện nay | đếm draw call Canvas 3D |
| 5 | **Núi xa nhiều lớp pastel + dải sương** | giữ `farMountains.ts` (1 draw call), đổi màu 3 lớp sang lục ngọc → lam lục → lam tím, đỉnh tròn hơn (`width` lớn hơn), thêm dải sương mỏng giữa các lớp (vòng dải dọc, gradient alpha theo màu đỉnh) | +1 (dải sương) | +~1k | dải sương trong suốt nhưng thấp, chỉ phủ ~15 % màn | ảnh `?view=ca-san` |
| 6 | **Đất mềm + cỏ hoa có gió** | địa hình đổi flat shading → pháp tuyến mượt + màu đỉnh pha 3 sắc lục + vệt đất ấm theo nhiễu (mảng màu lớn, không lốm đốm); cỏ: búi 5 lá cong, màu gốc sẫm → ngọn vàng lục (vertex color), gió = 2 sóng sin theo vị trí instance trong vertex shader (chỉ đỉnh trên lay); hoa: một InstancedMesh, màu từng bông bằng `instanceColor` (4 màu), mọc thành khóm (nhiễu) quanh mép lối, chân tường, gốc cây. Mật độ theo mức đồ hoạ (Thấp ½) | cỏ 1 (như cũ) + hoa 1 + sỏi 0 (gộp vào đá) | cỏ 3 000 → 5 000 búi × 15 tam giác ≈ +60k *trong toàn cảnh* — chỉ phần trong khung nhìn được vẽ khi chia ô; hoa 1 500 × 12 ≈ 18k | vertex shader thêm ~10 phép tính / đỉnh (diễn đàn three.js: nghẽn trên Android yếu ở vertex shader khi instance quá nhiều → giới hạn số, cắt xa > 40 m) | bench "Đứng giữa sân" / "Đi + rẽ" |
| 7 | **Cây tán tròn nhiều lớp** | tán = 3–5 cầu low-poly (icosahedron chia 1, 80 mặt) gộp thành một hình mẫu; **pháp tuyến "cầu hoá"** (pháp tuyến trỏ từ tâm tán ra — mẹo kinh điển cho tán lá mềm, không thấy mặt cắt); màu đỉnh: dưới tối / trên sáng + ánh viền; lay nhẹ cả tán (vertex shader). Tùng giữ "đám mây dẹt" nhưng bo tròn | như cũ (mỗi kiểu 2–3 InstancedMesh) | +~10–15k | 0 | Canvas 3D |
| 8 | **Nước stylized** | `ShaderMaterial` nhỏ (một đoạn GLSL, không texture, **không depth texture** — tốn thêm một lượt vẽ): màu nông → sâu theo khoảng cách tới bờ (tính sẵn vào màu đỉnh hoặc UV toả tròn), *fresnel* (nhìn xiên → pha màu trời), vệt sáng gợn = 2–3 sóng sin theo thời gian ngưỡng hoá (`step`) thành vạch trắng mềm, **viền bọt** = dải vòng quanh mép (hình học), alpha nhịp chậm | = số mặt nước (2 ở trấn) + 1 (viền bọt, gộp) | +<1k | mặt nước đục; viền bọt trong suốt nhỏ | Canvas 3D góc ao Hậu Sơn |
| 9 | **Nhà Catalog làm mềm** | mẫu `dungMau(ma, co, giong, style)` đã có; thêm: mép khối vát (BoxGeometry → hộp vát 1 đoạn, +12 tam giác / khối), mái cong theo `DOC` giọng Tống (đường cong 3–4 đoạn thay mặt phẳng), AO gầm mái / chân tường (kỹ thuật 3), màu ấm. Ngân sách tam giác Catalog giữ (C3 ≤ 8k, C4 ≤ 4k) | 0 (gộp theo vật liệu chung) | +~10 % mỗi nhà | 0 | Catalog 3D + Canvas 3D |
| 10 | **Quầng sáng giả cho đèn lồng / đèn đá** | sprite cộng màu (additive) nhỏ, một InstancedMesh hướng camera | +1 | ~0 | nhỏ (mỗi quầng vài nghìn điểm ảnh) | — |

**Không chọn (lý do + chi phí):**
- **Hậu kỳ toàn màn (bloom, SSAO, DOF, viền theo depth)**: cần vẽ cảnh vào render target rồi tô lại cả màn 2–6 lần; trên GPU
  điện thoại kiểu tile (Mali, Adreno) bloom là loại "tốn băng thông" phải ra bộ nhớ ngoài (Arm, SIGGRAPH 2015) — đắt nhất với
  máy tầm trung, mất cả MSAA sẵn có. Thay bằng: màu nướng sẵn + quầng giả + (tuỳ chọn) **vignette bằng CSS** trên lớp HTML
  (trình duyệt ghép, không tốn GPU của WebGL).
- **Shadow map realtime**: vẽ cảnh thêm một lần từ phía mặt trời → gấp đôi draw call. Giữ đĩa bóng mờ dưới chân nhân vật /
  NPC + AO nướng.
- **Viền đen kiểu "hull đảo"** cho mọi vật: nhân đôi tam giác + draw call của vật có viền; phong cách AC / Sky gần như không
  dùng viền. Chỉ cân nhắc cho nhân vật / NPC nếu sau này cần (cần quyết định riêng).
- **MeshStandard / Physical (PBR)**: đắt hơn Lambert nhiều (specular, môi trường), không hợp phong cách màu phẳng mềm.
- **MeshToonMaterial (ramp bậc)**: rẻ, nhưng bậc sáng cứng ra kiểu anime cel, không "mềm"; wrap lighting + ramp mịn trong
  vật liệu chung (kỹ thuật 2) cho cùng hiệu quả mà vẫn gộp được với `merge.ts`.
- **Ảnh trời 360° / texture vẽ tay**: 1–4 MB, lệch phong cách khối; vòm gradient đủ.

## Bảng màu ấm đề xuất (Khởi Nguyên Trấn, chờ chọn hướng)

Ba hướng, cùng một cấu trúc trường `scene.json`. Màu cuối chốt **trên Canvas 3D** (đường màu hiện nay làm màu phẳng nhạt
hơn hex — xem "Hiện trạng").

- **A — Xuân ấm 春暖** (AC / 摩尔庄园: trời lam nhạt, chân trời hồng đào, cỏ lục tươi, hoa đào) — **khuyên**: hợp "hoạt hình
  mềm, ấm", vẫn sáng sủa cho học.
- **B — Chiều mật ong 蜜色黃昏** (Sky: nắng vàng cam xiên, bóng tím hồng, mọi thứ ửng vàng) — đẹp nhất trên ảnh, nhưng ngả
  vàng cả ngày dễ mỏi mắt; hợp làm biến thể cho Giang Nam (hồ sơ `giang-nam.md` khuyên chiều tà).
- **C — Sương sớm ngọc 晨霧青玉** (tiên hiệp thanh nhã: lục ngọc, trắng sương, lam nhạt) — gần cảnh hiện tại nhất, "ấm" ít.

| Vai trò | A Xuân ấm | B Mật ong | C Sương ngọc | Hiện tại | Trường |
|---|---|---|---|---|---|
| Trời đỉnh | `#8EC5E8` | `#9FB4DA` | `#A9CFDA` | `#5D86B5` | `sky.top` |
| Trời giữa | `#CFE6F0` | `#F3D3B0` | `#DCEBE6` | `#A8C0D6` | `sky.middle` |
| Chân trời | `#FCE6C8` | `#FFC98F` | `#F4F1E6` | `#F0D9B0` | `sky.horizon` |
| Quầng nắng | `#FFF2D0` | `#FFE0A8` | `#FFFBEF` | — | *mới* `sky.sunGlow` |
| Mây thân / bụng | `#FFFDF7` / `#F4D9D0` | `#FFF3E2` / `#EFB9A8` | `#FFFFFF` / `#D9E6E8` | `#F4F1EA` | `floating.clouds.color` + *mới* `belly` |
| Sương (gần–xa m) | `#EADFCB` 70–280 | `#F2D2AE` 60–260 | `#E3EAE4` 60–240 | `#C3CBD4` 60–260 | `fog` |
| Đèn trời / đất | `#FFF4E0` / `#8FA36B` · 1,0 | `#FFE6C6` / `#A07D5E` · 0,95 | `#F2F7F4` / `#7E9C7A` · 1,0 | `#DFE8FF` / `#6B5A48` · 0,8 | `light.skyColor/groundColor/hemiIntensity` |
| Nắng | `#FFE7C2` · 0,75 | `#FFC98A` · 0,9 | `#FFF4E0` · 0,65 | `#FFE2B8` · 0,95 | `light.sunColor/sunIntensity` |
| Màu bóng ấm (AO) | `#6B5A70` | `#7A4F66` | `#5A6B6E` | (đen) | *mới* `look.aoTint` |
| Núi xa gần → xa | `#7FA58F` · `#9DB7B8` · `#BFCBD6` | `#A88F86` · `#BFA6A0` · `#D9C6C0` | `#6F9A8A` · `#9CB9B4` · `#C9D8D8` | `#4F6B66` · `#6D8790` · `#93A7B2` | `farMountains.layers[].color` |
| Biển mây | `#FBF4EA` | `#FCE7D2` | `#F4F7F4` | `#F4F1EA` | `cloudSea.color` |
| Cỏ (3 sắc) | `#8DBF5A` · `#A6CC66` · `#79AD52` | `#A3B85A` · `#B8C46A` · `#8EA650` | `#7FB08A` · `#97C29A` · `#6C9E78` | — | `terrain.colors.grass` |
| Đất / lối đá | `#C9A77A` / `#D8CBB3` | `#C99A6A` / `#DCC4A4` | `#B9A88E` / `#D3CFC2` | — | `terrain.colors.dirt`, `buildingStyle.path` |
| Hoa (4 màu) | đào `#F4A7B9` · ngà `#FFF6E5` · mơ `#F6CF5E` · oải `#B9A3E3` | cam `#F6A86B` · ngà · đỏ son `#E9705E` · tím `#C59AD6` | trắng `#FFFFFF` · lam `#A8C8F0` · ngà · hồng nhạt `#F2C6D2` | — | *mới* `terrain.flowers.colors` |
| Lá tùng tối / giữa / sáng | `#3F7A55` · `#5E9A62` · `#8CC07A` | `#55784A` · `#7E9A55` · `#B5C46E` | `#3D7262` · `#5C9481` · `#8DBFA8` | `#2F5A3A` · `#3F6E45` · `#4A7A4A` | `trees.leaves` |
| Nước nông / sâu / bọt | `#8FD3D0` / `#3E8FA8` / `#F4FBF8` | `#A9D6C8` / `#4E879A` / `#FFF6EA` | `#9FD8D0` / `#4A9A9A` / `#FFFFFF` | `#3D6E86` | `buildingStyle.water` + *mới* `water.look` |
| Tường vôi / nền đá | `#F4EAD8` / `#E3D9C6` | `#F6E4CC` / `#E6D3B8` | `#F1EEE6` / `#DCDCD2` | `#E8E1D2` / `#D9D4C7` | `buildingStyle.wall/base` |
| Cột son / gỗ | `#C4483B` / `#7A4E34` | `#C9563D` / `#80553A` | `#B54A42` / `#6E5040` | `#A8322A` / `#3A2418` | `buildingStyle.pillar/timber` |
| Ngói xám / lưu ly lục | `#5B6878` / `#3F7A66` | `#6A6470` / `#4E7A62` | `#56636B` / `#3B7469` | `#4F5A63` / `#2B5446` | `roofColor`, `walls.capColor` |
| Xà lục / lam / kim | `#3D8A84` / `#5274B8` / `#E2B65A` | `#4A8A7A` / `#5F75B0` / `#E8B45A` | `#3E8A86` / `#5A7EB4` / `#D9B66A` | `#2F6F73` / `#3F5FA0` / `#D4A64A` | `buildingStyle.eave/beamBlue/gold` |
| Đèn lồng | `#F06A4A` | `#F2774A` | `#E6624E` | `#E2553A` | `buildingStyle.lantern` |

Luật dùng bảng: (1) bóng không bao giờ đen — tối nhất là `aoTint` pha 40 %; (2) độ bão hoà mọi màu ≤ ~60 %; (3) ngói, cột, tường
vẫn giữ **thứ bậc** của danh mục (vàng chỉ Tử Cấm Thành, lục C2–C4 có chủ đích) — chỉ đổi sắc độ, không đổi vai; (4) map khác
nhân ra ở GĐ 2 bằng cách đổi 4 trường (trời, sương, đèn, núi xa) theo giọng vùng, giữ phần còn lại.

`design/scene/phong_cach.md` (đã chốt) sẽ phải cập nhật bảng màu → việc của vai thiết kế (`/canh`) sau khi người dùng chọn.

## Ví dụ cụ thể cho tông môn cổ trang (Khởi Nguyên Trấn, hướng A)
- **Quảng Trường**: sân lát đá ngà `#D8CBB3`, mép sân viền cỏ + khóm hoa đào / ngà sát chân tường vôi; chân tường sẫm nhẹ
  `aoTint`; tùng hai bên cổng tán bo tròn, gốc có vòng bóng mềm.
- **Cổng Trấn → ngõ Tạp hoá**: lối đá viền mềm, hai bên cỏ cao + hoa mơ; đèn đá có quầng vàng ấm lúc đi ngang.
- **Phẩm Minh Các / Tàng Thư Các**: mái cong giọng Tống ngói xám lam `#5B6878`, gầm hiên tối ấm (AO 40 %), cột son ấm, tường
  vôi kem; đèn lồng đỏ cam có quầng.
- **Thiên Bậc → Thượng Trấn**: bậc đá hai bên cỏ + hoa oải; nhìn lên thấy núi lục ngọc nhạt dần, chân núi chìm sương hồng đào.
- **Hậu Sơn**: ao nước ngọc nông → lam sâu, viền bọt trắng quanh bờ đá, vệt sáng gợn; thác phía trên.
- **Xa**: mây phồng trắng bụng hồng trôi chậm quanh, đảo nổi có cỏ + tùng nhỏ (Cần code cũ `phong_cach.md` mục 2).

## Sai thường gặp cần tránh
- Thêm hậu kỳ (bloom) "cho đẹp" → tụt fps máy tầm trung, mất khử răng cưa.
- Mây / sương / nước **trong suốt lớn chồng nhau** → overdraw (mỗi lớp = tô lại cả vùng). Mây đục, sương mỏng, nước đục.
- Màu bão hoà cao ("xanh lá tinh", "đỏ tươi") → ra kiểu đồ chơi nhựa, không mềm.
- Cỏ hoa phủ đều khắp nơi → nhiễu; phải thành **khóm** (nhiễu), dày ở mép lối / chân tường / gốc cây, thưa giữa sân.
- Mỗi vật một vật liệu riêng → `merge.ts` không gộp được → draw call vọt. Mọi vật tĩnh dùng **vật liệu chung + màu đỉnh**.
- Shader mới biên dịch lần đầu khi hiện ra → khựng (đang có khựng ~0,7 s lúc vào cảnh). Gọi `renderer.compile(scene, camera)`
  trong lúc màn tải.
- Gió cỏ làm lệch khung bao → cỏ biến mất khi quay camera (đã gặp trên diễn đàn three.js) — nới khung bao từng ô cỏ.

## Đưa vào cảnh
- Tả được ngay bằng `scene.json`: kỹ thuật 1 (màu `sky`, `fog`, `light`, `farMountains`, `cloudSea`, `trees.leaves`,
  `buildingStyle`, `terrain.colors`) — đổi được ngay bằng `/canh`, chưa đẹp hẳn nhưng hết "xám lạnh".
- Cần code (kế hoạch `docs/tasks/2026-11-14-canh-dep.md`): trường `look` (vật liệu mềm, `wrap`, `ao`, `aoTint`); `sky.sunGlow`
  + `sky.dome`; `floating.clouds.style`/`belly`; `farMountains.mist`; `terrain.shading`, `terrain.flowers`, `terrain.grass.wind`;
  `water[].look` (hoặc `waterLook` chung); `trees.crown`; `buildings[].mau` + `co` (mẫu Catalog). Mọi trường mặc định = cảnh cũ.

## Cách đo (bắt buộc trước / sau mỗi bước)
1. **Máy thật** (quyết định): bản debug app → `debug {on:true}` → bảng "fps · ms · 1 % chậm · draw call · tam giác" ở 3 góc:
   đứng giữa Quảng Trường, đi + rẽ, zoom ra cả sân; 60 giây mỗi góc; ghi cả nóng máy. Đạt: **trung vị ≥ 30 fps ở mọi góc,
   mục tiêu 60**; 1 % chậm ≤ 50 ms; không xuống 30 cố định (R-HIEU-2) ở mức Cao / Vừa.
2. **Bench tự động** `cd web && npm run build && npm run bench -- --ghi` (GPU máy tính + SwiftShader CPU ×4) — so trước / sau
   cùng máy, ghi `docs/perf/bench.md`.
3. **Canvas 3D**: bảng "Hiệu năng" ở `?view=tren`, `?view=ca-san`, góc chơi — ≤ 150 draw call, ≤ 150k tam giác.

## Nguồn
- Diễn đàn three.js — tối ưu cỏ instanced, nghẽn vertex shader trên Android yếu — https://discourse.threejs.org/t/performance-optimizing-3m-instanced-grass-in-three-js/81286 — giới hạn số instance, cắt xa
- Codrops 2025 "How to make the fluffiest grass with three.js" — https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/ — búi cỏ, màu gốc → ngọn, gió
- keaukraine "Efficient WebGL vegetation rendering" — https://dev.to/keaukraine/efficient-webgl-vegetation-rendering-4g2g — gió bằng sin trong vertex shader, cây trên WebGL mobile
- al-ro grass — https://al-ro.github.io/projects/grass — gió hai sóng sin quay quanh gốc lá
- Procedural Instanced Forest (three.js) — https://discourse.threejs.org/t/procedural-instanced-forest-high-performance-real-trees/88610 — cắt lá xa trong vertex shader cho máy yếu
- Cỏ biến mất trên mobile với InstancedMesh — https://discourse.threejs.org/t/grass-disappears-on-mobile-with-instancedmesh/77180 — lỗi khung bao / culling
- three.js forum "bake lighting / AO into vertex color" — https://discourse.threejs.org/t/how-would-i-begin-to-bake-lighting-ao-into-vertex-color-data/48689 — AO theo đỉnh bằng dò tia / tỉ lệ che
- Unity Asset Transformer "Bake Ambient Occlusion" (vertex) — https://docs.unity.com/en-us/asset-transformer-sdk/2026.4/manual/functions/bakeao — AO trong màu đỉnh: nhẹ bộ nhớ, hợp máy yếu, chỉ bóng tiếp xúc
- Tuts+ "Creating toon water for the web" (1–3) — https://code.tutsplus.com/creating-toon-water-for-the-web-part-1--cms-30447t — nước toon, bọt theo depth (ta bỏ depth, dùng dải bọt hình học)
- three.js forum "depthTexture for water toon shader" — https://discourse.threejs.org/t/how-to-effectively-use-depthtexture-for-water-toon-shader/49773 — chi phí / độ khó depth texture
- Arm SIGGRAPH 2015 "Moving Mobile Graphics" (Marius Bjørge) — https://community.arm.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-20-66/siggraph2015_2D00_mmg_2D00_marius_2D00_slides.pdf — bloom tốn băng thông trên GPU tile; color grading rẻ
- Arm Performance Studio blog — https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/finding-and-fixing-hidden-performance-problems-in-mobile-games-with-arm-performance-studio — fill rate, overdraw trên mobile
- 80.lv "The Art of Sky: Children of the Light" — https://80.lv/articles/the-art-of-sky-children-of-the-light — tinh thần ánh sáng / màu cảm xúc (quy ước thể loại)
- GDC Vault "Art of Sky: Children of the Light" (Yuichiro Tanabe) — https://gdcvault.com/play/1026903/Art-of-Sky-Children-of — bố cục môi trường, chủ đề màu
- Sketchfab "Moving the New Horizons" — https://sketchfab.com/blogs/community/art-spotlight-moving-the-new-horizons/ — khối tròn, màu pastel (quy ước, không phải tài liệu kỹ thuật)
- three.js manual "Materials" — https://threejs.org/manual/en/materials — thứ tự chi phí Basic < Lambert < Phong < Standard
- Mã nguồn three 0.170 (`math/ColorManagement.js`, `renderers/webgl/WebGLPrograms.js`) — trong `web/node_modules/three` — đường màu khi tắt ColorManagement
- *Suy luận / quy ước*: wrap lighting, pháp tuyến cầu hoá cho tán lá, mây đục thay mây trong suốt, vignette CSS — kỹ thuật phổ biến trong game stylized, chưa có số đo trên máy dự án → đo ở GĐ 1.
