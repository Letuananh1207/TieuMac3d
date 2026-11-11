# 0003 — Tài sản 3D lai: code + model AI (thử nghiệm)

Ngày: 2026-11-11 · Trạng thái: đã chốt hướng (người dùng), đang thử · Bổ sung 0002 · Kế hoạch:
`docs/tasks/2026-11-11-nang-cap-do-hoa.md` đợt D · Hướng dẫn: `docs/ai3d.md`

## Quyết định

- **Lai**: địa hình, bố cục, nhà thường, cây, đồ trang trí tiếp tục dựng bằng khối trong code (0002). Thử model `.glb`
  sinh bằng AI cho **nhân vật** và **1–2 công trình nổi bật**; chỉ thay bản code khi đẹp hơn rõ và giữ ngân sách.
- **Công cụ**: mã nguồn mở chạy trên máy người dùng (Hunyuan3D qua gói WinPortable; TRELLIS.2 để sau vì cần ~24 GB VRAM).
  Phiên code không tự chạy công cụ AI; người dùng tạo model, làm sạch, đặt vào `design/models/`.
- **Nạp**: `GLTFLoader` + `MeshoptDecoder` của `three/examples/jsm` (cùng gói three, offline, không thêm thư viện).
  Nhân vật `.glb` qua hợp đồng `Character` (`player/glbCharacter.ts`, `AnimationMixer` clip `idle` / `walk`); đệ tử dựng
  bằng khối giữ làm dự phòng khi thiếu file hoặc lỗi nạp.

## Ngân sách mỗi model

| | Tam giác | Dung lượng | Vật liệu / texture |
|---|---|---|---|
| nhân vật | ≤ 10 000 | ≤ 1,5 MB | 1 vật liệu, ≤ 1024² |
| công trình | ≤ 20 000 | ≤ 3 MB | 1–2 vật liệu, ≤ 1024² |

Cả cảnh vẫn ≤ 150 draw call, ≤ 150k tam giác. Model có texture ảnh là ngoại lệ có chủ đích với quy tắc "màu phẳng" của
0002 — chỉ cho các model AI đã duyệt.

## Giấy phép

Mỗi file trong `design/models/` một dòng `design/models/LICENSES.md`: công cụ + phiên bản, ảnh đầu vào (tự làm / nguồn),
ngày, giấy phép. Hunyuan3D: giấy phép cộng đồng Tencent (loại trừ EU / UK / Hàn; đọc file LICENSE bản dùng trước khi phát
hành).
