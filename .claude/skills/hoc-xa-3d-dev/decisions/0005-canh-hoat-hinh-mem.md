# 0005 — Cảnh "hoạt hình mềm, màu ấm": nới luật vật liệu có đo đạc

Ngày: 2026-11-14 · Trạng thái: đã chốt (người dùng cho nới luật có đo, duyệt kế hoạch + 4 điểm + đường màu) · Kế hoạch:
`docs/tasks/2026-11-14-canh-dep.md` · Hồ sơ: `docs/tham_khao/canh-hoat-hinh-mem.md`

## Bối cảnh

Người dùng: "giao diện bối cảnh ở các map đang rất xấu, nhiều game cùng thể loại làm rất đẹp mà không lag". Hướng chọn:
hoạt hình mềm, màu ấm (kiểu Animal Crossing / 摩尔庄园 / Sky), giữ chất cổ trang. Quy tắc cứng 4 cũ ("vật liệu Lambert")
chặn những kỹ thuật rẻ làm nên cái "mềm": wrap lighting, bóng nướng vào màu đỉnh, nước có shader, cỏ lay gió. Người dùng
cho nới luật **miễn đo** (Android tầm trung ≥ 30 fps, mục tiêu 60; máy chuẩn = Android của người dùng, đạt khi trung vị
≥ 45 fps và 1 % khung chậm ≤ 50 ms).

## Quyết định

1. **Kiểu nhìn theo cảnh**: trường đặc tả `look.style` (`cu` mặc định · `mem`), `web/src/scene/look.ts`. Cảnh chưa chuyển giữ
   y nguyên (quy tắc 8). Canvas 3D / app nhận `?look=cu` để so trước / sau; `?muc=cao|vua|thap` ép mức đồ hoạ để đo.
2. **Quản lý màu đúng chuẩn chỉ ở cảnh mềm**: `createStage({ colorManaged })` bật `ColorManagement` (hex hiểu là sRGB). Cảnh cũ
   giữ tắt (màu đã chỉnh theo đường cũ — đổi là phải soát lại hex 7 map). Ảnh so: `docs/tasks/anh/*-mau-ab-*.jpg`.
3. **Vật liệu được dùng trong cảnh**:
   - `lambert()` như cũ;
   - `softMaterial(wrap, side, wind?)` (`scene/materials.ts`) = `MeshLambertMaterial` + `onBeforeCompile`: wrap lighting
     (mặt khuất không đen), màu theo đỉnh (bóng nướng sẵn — `scene/bake.ts`), gió lay trong vertex shader (cỏ, hoa, tán);
     chi phí điểm ảnh như Lambert;
   - `ShaderMaterial` riêng **chỉ trong `web/src/scene/`** cho nước (`waterShader.ts`) — không depth texture;
   - `MeshBasicMaterial` cho thứ không cần sáng (vòm trời, mây, núi xa, quầng đèn cộng màu).
4. **Vẫn cấm**: shadow realtime (`E-BONG`); hậu kỳ toàn màn (bloom, SSAO, DOF, `EffectComposer`) và vật liệu PBR
   (`MeshStandard` / `MeshPhysical`) — máy kiểm cảnh báo `W-VATLIEU`; muốn dùng phải có quyết định mới kèm số đo máy thật.
   Vignette làm bằng lớp CSS (`ui/vignette.ts`), không trong WebGL.
5. **Gộp khối**: cảnh mềm gộp mọi khối Lambert tĩnh khác màu thành một khối mỗi mặt vẽ (`mergeSoft`, trước `mergeStatic`);
   nhóm tự đổi vật liệu (mái mờ R-HUD-2) đánh dấu `markOwnMaterials`, gộp riêng bằng `mergeVertexColors(group, look)`.
6. **Chi tiết theo mức đồ hoạ** (R-HIEU-1): mức Thấp cỏ, hoa thưa một nửa, nước không gợn, không dải sương núi, không
   vignette (`detailOf(tier)`) — bench máy yếu: hai lớp phủ rộng này tốn ~2–4 fps.
7. **Ngân sách giữ**: ≤ 150 draw call, ≤ 150k tam giác (Canvas 3D, mọi góc). Cỏ chia ô 60 m (cắt ngoài khung nhìn), trần
   1 500 búi / 600 bông; tán cây cầu 48 mặt.

## Lý do

- Wrap + màu đỉnh + gió = vài phép tính mỗi điểm ảnh / đỉnh, không thêm lượt vẽ; bloom / shadow map thêm cả lượt vẽ toàn
  màn — đắt nhất trên GPU điện thoại kiểu tile (hồ sơ, nguồn Arm).
- Giữ nền Lambert để `merge.ts` và mái mờ hoạt động như cũ; mọi đổi bị khoá sau `look.style` nên không làm hỏng map khác.

## Số đo (Khởi Nguyên Trấn, Canvas 3D SwiftShader)

| Góc | Trước (cũ) | Sau (mềm) |
|---|---|---|
| Góc chơi `?nv=0,6` | 69 draw call · 64,9k tam giác | 54 · 81,3k |
| Trên xuống `?view=tren` | 155 (vượt) · 140,1k | 136 · 149,4k |

Số bench và máy Android: kế hoạch, mục "Số đo" (Android: chờ người dùng đo).

## Hệ quả

- CLAUDE.md quy tắc cứng 4 đổi câu (xem file); `references/web_scene.md` dòng vật liệu / quản lý màu.
- Map khác (GĐ 2) bật `look.style: "mem"` + đổi 4 nhóm màu theo giọng vùng; xong cả 7 map thì bỏ đường `cu`.
