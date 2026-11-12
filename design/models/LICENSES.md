# Giấy phép model (`design/models/`)

Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0003-tai-san-ai.md`. Mỗi file một dòng. Hunyuan3D: Tencent Hunyuan
Community License — **không dùng ở EU / UK / Hàn Quốc**; đọc `LICENSE` của bản đã dùng trước khi phát hành app.

| File | Công cụ + phiên bản | Ảnh đầu vào | Ngày | Giấy phép |
|---|---|---|---|---|
| `nhan-vat.glb` | Hunyuan3D-2mini-turbo (Hunyuan3D2_WinPortable cu129, API, seed 1234, octree 256) → `npm run model:clean` (glTF-Transform + meshoptimizer, 9 500 tam giác) → `npm run model:paint` (chiếu ảnh trước / sau, `anh/nhan-vat-atlas.png`) | `anh/nhan-vat.webp` — người dùng tạo bằng Google Gemini từ câu lệnh trong `.claude/skills/tai-nguyen/references/hunyuan.md` | 2026-11-12 | Tencent Hunyuan Community License (model); ảnh: theo điều khoản Google Gemini của người dùng |
