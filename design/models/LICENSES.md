# Giấy phép model (`design/models/`)

Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0003-tai-san-ai.md`. Mỗi file một dòng. Hunyuan3D: Tencent Hunyuan
Community License — **không dùng ở EU / UK / Hàn Quốc**; đọc `LICENSE` của bản đã dùng trước khi phát hành app.

| File | Công cụ + phiên bản | Ảnh đầu vào | Ngày | Giấy phép |
|---|---|---|---|---|
| `nhan-vat.glb` | **Hunyuan3D-2mv bản đầy đủ** `hunyuan3d-dit-v2-mv` (đa góc trước / trái / sau / phải, Hunyuan3D2_WinPortable cu129, seed 1234, 50 bước, octree 512, `tai-nguyen/scripts/mv_gen.py --day-du`; 2026-11-12.12) → `smooth.py --min 2` (PyMeshLab Taubin + quadric, 16 000 tam giác) → `tai-nguyen/scripts/bake.py --jpg` (UV xatlas, nướng texture trộn 4 góc theo hướng mặt + che khuất, `anh/nhan-vat-atlas.png`) → `npm run model:clean` (nén meshopt, `--khong-sang`, 215 KB) | `anh/nhan-vat-{truoc,trai,sau,phai}.png` (bộ ảnh 2026-11-12.3, Google Gemini) | 2026-11-12 | Tencent Hunyuan Community License (model); ảnh: theo điều khoản Google Gemini của người dùng |

## Ảnh đầu vào (`design/models/anh/`)

| File | Công cụ tạo ảnh | Xử lý | Ngày | Giấy phép |
|---|---|---|---|---|
| `anh/nhan-vat-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png`, `-mat.png` | Google Gemini (ứng dụng Gemini, tạo ảnh — người dùng chạy, đính kèm `anh/nhan-vat.webp`; câu lệnh: `design/CHANGELOG.md` mục 2026-11-12.3) | chuẩn hoá bằng Pillow ở phiên thiết kế: nền trơn #DDDDDD, xoá dấu sao Gemini góc phải dưới, 4 góc cùng cỡ (đỉnh búi 10 %, đế ủng 90 %, trục thân giữa ảnh); PNG 1024 × 1024 | 2026-11-12 | theo điều khoản Google Gemini của người dùng |
