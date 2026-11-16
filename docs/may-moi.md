# Chuyển sang máy mới

Những thứ **không** nằm trong git (máy cũ có, máy mới phải dựng lại). Làm theo thứ tự; xong bước nào đánh dấu.

## 1. Lấy code

```sh
git clone https://github.com/Letuananh1207/TieuMac3d.git
cd TieuMac3d
cd web && npm ci && cd ..              # gói npm ghim cố định
cd app && flutter pub get && cd ..     # nếu chạy app Flutter
cd web && npm run build                # sinh font, hình, bản scene cho app
```

Cần cài sẵn: Git, Node (bản như máy cũ — xem `web/package.json` `engines` nếu có), Dart / Flutter, Python 3.11, Chrome
(chụp Canvas 3D headless).

## 2. Bộ nhớ của Claude (ghi chú dài hạn)

Máy cũ lưu ở `~/.claude/projects/<thư mục dự án>/memory/` — không đi theo git. Bản chép: `docs/ai/bo-nho/`.
Trên máy mới, mở Claude Code trong thư mục dự án một lần rồi nói: "khôi phục bộ nhớ từ docs/ai/bo-nho" — Claude chép các
file vào thư mục memory của máy mới.

## 3. Quyền cho phép riêng máy (`.claude/settings.local.json`, không commit)

Máy cũ cho phép Claude chạy Python của Hunyuan3D không hỏi. Máy mới: tạo lại nếu cài Hunyuan ở cùng chỗ, hoặc bỏ qua
(Claude sẽ hỏi khi cần).

## 4. Công cụ tạo ảnh Gemini (V-98)

Venv + cookie nằm ngoài repo, ở `C:/ai3d/gemini/` (đổi chỗ được bằng biến `GEMINI_GOC`).

```sh
bash .claude/skills/ui-design/scripts/gemini-anh.sh cai     # tạo venv, cài gói ghim (gemini-requirements.txt)
```

Cookie (bạn tự làm, **không** dán vào chat, **không** commit):
1. Chrome → https://gemini.google.com, đăng nhập tài khoản Gemini Pro.
2. F12 → Application → Storage → Cookies → `https://gemini.google.com` (không thấy thì `https://www.google.com`), lọc
   `__Secure-1PSID`.
3. Chép giá trị hai dòng `__Secure-1PSID` và `__Secure-1PSIDTS`.
4. Tạo `C:\ai3d\gemini\cookie.json`:
   `{"__Secure-1PSID": "<giá trị>", "__Secure-1PSIDTS": "<giá trị>"}`
5. Kiểm: `bash .claude/skills/ui-design/scripts/gemini-anh.sh kiem` → "Cookie dùng được".

Cookie hết hạn (vài ngày / đăng xuất) → chép lại bước 2–4. Chi tiết: `.claude/skills/ui-design/references/gemini.md`.

## 5. Tripo / Hunyuan3D (chỉ khi làm model)

- `tripo.sh` đọc file Tripo tải về ở `C:/ai3d/tripo/<tên>-lowpoly.glb`, ra `C:/ai3d/tripo/ra/`; bước xem ảnh (`xem.py`) dùng
  Python của Hunyuan `C:/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe`. Máy mới không cài Hunyuan → cần một Python
  có `numpy`, `trimesh`, `Pillow` (đủ cho `xem.py`) và sửa biến `PY` trong `tripo.sh` (hoặc cài Hunyuan WinPortable như
  `docs/ai3d.md`).
- Tripo dùng trên web (tripo3d.ai) bằng tài khoản Professional — không cần cài.

## 6. Việc đang dở lúc chuyển máy (2026-11-16)

- Cloud đang chạy (một lần): L-24 mắt Cầm Nương → nhánh `viec/mat-cam-nu`; V-104 nắn dáng hạc → nhánh `viec/hac-thon`.
  Trên máy mới: `/task tiep` → Claude tải nhánh, cho xem ảnh, duyệt rồi gộp.
- Sổ việc đầy đủ: `docs/viec/so_viec.md`. Lỗi: `docs/loi.md`.
