# Nâng cấp đồ hoạ: giao diện + địa hình (+ đề xuất AI vẽ)

- Yêu cầu: "bây giờ giao diện hiện nay đang không chuyên nghiệp tôi cần bạn sửa lại hết ngoài ra địa hình cũng vậy
  đang rất đơn giản, hãy nghiên cứu cải thiện vẽ lại hết nếu cần hãy đề xuất sử dụng các mô hình ai tiên tiến để vẽ"
- Loại: chỉ giao diện (HUD) + thêm (địa hình) + dữ liệu (cảnh) · Cỡ: lớn · Trạng thái: đang làm

## Hiện trạng (khảo sát 2026-11-11)

- Địa hình: một mặt phẳng gạch 200×200 m (`ground.size`), thấy rõ mép vuông khi nhìn xa; không đồi núi, cỏ, đất,
  suối; cây rải thưa. Nhà, cổng, tháp kiểu Trung Hoa đã khá (ảnh `design/screens/Canh-giang-duong.png`).
- Giao diện: HUD vẫn là bản prototype (chip, joystick, thẻ mời, nút góc nhìn, bảng bài học HTML), chưa có thiết kế
  trên canvas (`design/docs/screen_specs.md` rỗng). Màn bài học Flutter đang chờ thiết kế (phiếu 2026-11-10).
- Địa hình cao thấp đã nằm trong quy hoạch tông môn "đợt 2" (`design/scene/tong_mon.md` mục Cần code 2–3).

## Phạm vi

**Sẽ sửa (code — phiên này)**
- `web/src/scene/spec.ts`, `scene/specCheck.ts` — trường `terrain` (mặc định phẳng = cảnh cũ không đổi)
- `web/src/scene/terrain.ts` (mới) — lưới độ cao, màu theo độ cao / độ dốc, bục phẳng cho khu, lối đá
- `web/src/scene/environment.ts`, `scene/world.ts` — thay mặt gạch bằng địa hình; núi xa vòng ngoài che mép
- `web/src/collision/` — hàm độ cao `heightAt(x, z)` + chặn dốc quá đứng
- `web/src/player/controller.ts`, `input/tapToMove.ts`, `input/orbitCamera.ts` — đi / chạm / camera theo độ cao
- `web/src/scene/{buildings,trees,props,…}.ts` — đặt vật lên mặt đất
- `docs/testing/quy_tac.md` — sửa ví dụ R-VA-1, thêm luật dốc (sổ → online → `--mark-synced` → test → code)
- (nếu chọn AI) `web/src/scene/models.ts`, `player/glbCharacter.ts` — nạp `.glb` (= nhiệm vụ 8 của `2026-11-10-thiet-ke-3d.md`)

**Chờ thiết kế (phiên `/ui-design`)** — phiếu mới, phiên code không dựng tạm
- HUD làm lại toàn bộ → phiếu `docs/phieu_thiet_ke/2026-11-11-hud-lam-lai.md`
- Màn bài học → phiếu có sẵn `2026-11-10-man-bai-hoc.md`
- Địa hình thật của tông môn (đồi, núi chủ phong, thung lũng, suối) → phiếu `2026-11-11-dia-hinh.md`, dựng bằng
  `/ui-design canh` sau khi code có trường `terrain`

**Cần kiểm tra**: `zones/` (khoảng cách vùng tính trên x, z — R-VUNG-1), `scene/merge.ts` (gộp khối), Canvas 3D
`designPreview.ts`, ngân sách ≤ 150 draw call.

**Không đụng**: logic điều khiển cảm ứng (R-DIEU-1), cầu nối, Flutter (trừ màn bài học khi có thiết kế).

## Đề xuất dùng AI để vẽ

| Việc | Công cụ AI đề xuất | Vì sao | Lưu ý |
|---|---|---|---|
| Ảnh ý tưởng (concept) cho cảnh + HUD | mô hình tạo ảnh (GPT-image, Gemini, Midjourney, Flux…) | ra nhanh 10–20 hướng phong cách để chọn, làm "bản mẫu nhìn" cho phiên thiết kế | chỉ làm tham khảo, không đưa thẳng vào app |
| Model 3D nhân vật, đồ vật, công trình nổi bật | ảnh → 3D: **Tripo** hoặc **Meshy** (trả phí), **Hunyuan3D / TRELLIS.2** (mã nguồn mở) | Tripo được đánh giá mạnh về nhân vật và lưới low-poly sạch; Meshy mạnh texture + tự gắn xương + thư viện động tác; TRELLIS.2 (Microsoft, MIT) miễn phí | gói miễn phí của Meshy / Tripo **không** cho dùng thương mại; Hunyuan3D có giấy phép riêng (loại trừ EU / UK / Hàn); lưới AI thường nặng → phải giảm tam giác, nén meshopt cho điện thoại |
| Địa hình | **không cần AI** — sinh bằng code (nhiễu + điểm điều khiển trong `scene.json`) | nhẹ, chạy offline, phiên thiết kế chỉnh được bằng số; mô hình AI địa hình chưa hơn cách này cho cảnh nhỏ | có thể dùng ảnh AI làm tham khảo bố cục núi |
| Trời / núi xa | dựng bằng code (dải núi nhiều lớp + gradient) | không tốn dung lượng ảnh; ảnh 360° AI (kiểu Skybox AI) là phương án thay nếu cần đẹp hơn | ảnh 360° ~1–4 MB |
| HUD | phiên thiết kế (canvas) vẽ; họa tiết trang trí có thể nhờ ảnh AI làm mẫu rồi vẽ lại bằng SVG / CSS | sắc nét mọi độ phân giải, nhẹ | không dùng ảnh bitmap AI làm khung UI |

Nguồn so sánh (bài đánh giá bên thứ ba, nên thử 2–3 công cụ trên cùng một ảnh trước khi chọn):
3daistudio.com best-image-to-3d-tools-2026 · vsquad.art best-ai-3d-generators · cinevva ai-3d-model-generation-timeline-2026 ·
makerstack.co meshy-review · sloyd.ai ai-3d-model-generator-pricing.

## Đã quyết (người dùng, 2026-11-11)

1. **Thứ tự**: đồ hoạ **trước** mốc 3.
2. **Tài sản 3D**: **lai** — địa hình, bố cục, nhà thường bằng code; thử model AI cho nhân vật + 1–2 công trình nổi
   bật, so sánh rồi mới quyết. → quyết định `0003` bổ sung 0002.
3. **Công cụ AI**: **mã nguồn mở chạy trên máy** (Hunyuan3D / TRELLIS.2). Máy: RTX 5070 Ti Laptop 12 GB VRAM,
   RAM 31 GB, Python 3.11 → cần PyTorch bản CUDA ≥ 12.8 (dòng RTX 50); 12 GB vừa khít — tạo hình được, tô texture có
   thể phải dùng chế độ tiết kiệm VRAM. Giấy phép: TRELLIS.2 MIT; Hunyuan3D giấy phép cộng đồng (đọc file LICENSE
   bản dùng, loại trừ EU / UK / Hàn). Cài và chạy ngoài repo (`C:\…\ai3d\`), repo chỉ nhận `.glb` đã làm sạch.
4. **HUD**: phiên thiết kế vẽ **3 hướng** để chọn.

## Còn chờ quyết định
- (đã chốt) Ngưỡng dốc 35°; địa hình hướng A — cao nguyên giữa biển mây.

## Nhiệm vụ

Đợt A — nghiên cứu
- [x] A1. `/khao-cuu` địa hình tông môn tiên hiệp → `docs/tham_khao/dia-hinh-tong-mon.md` (đã chọn hướng A — cao
      nguyên giữa biển mây; ngưỡng dốc 35°).
- [x] A2. `/khao-cuu` HUD cổ trang / tiên hiệp trên điện thoại → `docs/tham_khao/hud-co-trang.md` (3 hướng).

Đợt B — địa hình (code trước, thiết kế sau)
- [x] B1. Luật mới R-VA-2 (dốc 35°, vực) — sổ + tài liệu online + `--mark-synced`; R-VA-1 giữ nguyên ví dụ.
- [x] B2. `terrain` · `farMountains` · `cloudSea` trong `SceneSpec` (mặc định tắt); `scene:check` in địa hình + báo
      vật nằm trên đất dốc.
- [x] B3. `scene/terrainHeight.ts` + `collision/heightfield.ts` + `scene/terrain.ts` (1 draw call, màu theo dốc);
      sân lát gạch chỉ trên bục `pave`.
- [x] B4. Nhân vật (`canStep`, R-VA-2), chạm để đi (tia dò vào lưới), camera không chui đất, cây + đồ trang trí theo
      độ cao. Kiểm bằng script tạm với code app (chưa có trình chạy test TS — 4 ví dụ đúng).
- [x] B5. Núi xa 3 lớp (không sương) + biển mây; far plane theo `viewDistance`. Mẫu: 62–95 draw call, ~110k tam giác.
- [ ] B6. Cỏ búi + đá rải (instanced), suối / thác, bậc đá, bục ở độ cao khác 0 (lối lát dốc theo).
- [ ] B7. Phiếu `2026-11-11-dia-hinh.md` (đã soạn, chờ thiết kế) → `/ui-design canh` dựng địa hình thật → `/ui-apply`.

Đợt C — giao diện (chờ thiết kế)
- [x] C1. Phiếu `2026-11-11-hud-lam-lai.md` (chip khu, joystick, nút, thẻ mời, nhãn tên, hướng dẫn, màn tải, fps chỉ
      ở chế độ gỡ lỗi) → `chờ thiết kế`.
- [ ] C2. Áp HUD + màn bài học khi thiết kế chốt (`/ui-apply`).

Đợt D — model AI (đã chọn lai, mã nguồn mở trên máy)
- [x] D0. Hướng dẫn cài Hunyuan3D / TRELLIS.2 trên máy người dùng (ngoài repo) + quy trình làm sạch trong Blender
      (giảm tam giác, gộp texture) → `docs/ai3d.md`; quyết định `0003`. Khuyên Hunyuan3D-2 WinPortable (RTX 50, 12 GB:
      tạo hình được, tô màu cần chế độ VRAM thấp); TRELLIS.2 để sau (~24 GB).
- [ ] D1. Nạp `.glb` (GLTFLoader + meshopt, đã có trong three) + `glbCharacter` (idle / walk), giữ đệ tử khối làm dự phòng.
- [ ] D2. Thử 1 nhân vật + 1 công trình bằng 2 công cụ AI → so hình, số tam giác, dung lượng, fps → chọn.
- [ ] D3. `design/models/` + `LICENSES.md` (công cụ, gói trả phí, ngày tạo).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run scene:check && npx tsc --noEmit && npm run build ·
cd app && flutter analyze && flutter test · dart tool/rule_trace.dart · đo draw call trên Canvas 3D (≤ 150)
