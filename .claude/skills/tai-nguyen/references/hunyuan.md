# Hunyuan3D trên máy người dùng — chạy, lỗi hay gặp, ảnh đầu vào

Gói: **Hunyuan3D2_WinPortable** (bản cu129, YanWenKun) ở `C:\ai3d\Hunyuan3D2_WinPortable\`. Máy: RTX 5070 Ti Laptop
12 GB VRAM, RAM 31 GB. Model tải về `HuggingFaceHub\` (lần đầu vài chục GB).

## Chạy

| Chế độ (tab *Program Parameters* → *Select Program*) | Dùng khi | Cổng |
|---|---|---|
| **API 2.0 \| For Blender Addon, etc.** | Claude tạo model qua `scripts/hunyuan.mjs` (cách chính) | 8081 |
| Hunyuan 3D 2.0 \| Comprehensive Features | người dùng tự bấm trên web (`http://127.0.0.1:8080`) | 8080 |

- Mở: PowerShell **trong thư mục gói** → `.\RUN.bat` (PowerShell cần `.\`; mở từ chỗ khác / Win+R → không thấy Python,
  cửa sổ tắt ngay).
- *General Settings*: để trống.
- API 2.0: *Model to Use* giữ `tencent/Hunyuan3D-2mini` (mini-turbo, 5 bước); *HTTP Service Listen Address* đổi
  `0.0.0.0` → `127.0.0.1` (chỉ máy này truy cập). Bản web 2.0 không có ô này → tường lửa Windows hỏi thì bỏ
  *Public networks*.
- Lần đầu: tắt *Enable Texture Generation* (tô màu cần MSVC). Model trắng vẫn dùng được (app tô trắng).
- Chạy xong: dòng `Uvicorn running on http://127.0.0.1:8081` (API) / `Running on local URL` (web). Đừng tắt cửa sổ.

## Lỗi hay gặp

| Thấy | Vì sao | Sửa (người dùng gõ trong PowerShell ở thư mục gói) |
|---|---|---|
| bấm `RUN.bat` cửa sổ hiện rồi tắt | mở ngoài thư mục gói → `.\python_standalone\python.exe` không thấy | mở PowerShell trong thư mục gói, gõ `.\RUN.bat` |
| `RUN.bat : The term … is not recognized` | PowerShell không chạy file ở thư mục hiện tại khi thiếu `.\` | `.\RUN.bat` |
| `ImportError: huggingface-hub>=0.34.0,<1.0 is required … found huggingface-hub==2.x` | launcher (lần chạy đầu, một lần) cài bản mới nhất, `transformers` 4.55 cần < 1.0 | `.\python_standalone\python.exe -s -m pip install "huggingface-hub[hf-transfer,cli,hf-xet]>=0.34,<1.0"` rồi `.\RUN.bat` lại (launcher không nâng lại: dấu `python_standalone\Scripts\.hf-reinstalled`) |
| `CUDA out of memory` | 12 GB không đủ cho cấu hình đang chọn | web: *VRAM Optimization* 4–5; API: tắt texture; giảm `--octree` (256 → 192) |
| tô màu lỗi biên dịch / `cl.exe` / `DISO` | thiếu MSVC (Visual Studio Build Tools, workload "Desktop development with C++") | cài Build Tools rồi bật lại *Enable Texture Generation*; hoặc để trắng |
| `hunyuan.mjs` báo quá thời gian | API lỗi trong luồng nền (không trả lỗi về) | đọc cửa sổ PowerShell của Hunyuan (Traceback) |
| tải model đứng / rất chậm | mạng tới HuggingFace | để chạy tiếp; *HuggingFace Mirror* ở *General Settings* chỉ khi người dùng có mirror tin cậy |

Lỗi mới: người dùng dán ~20 dòng cuối → đọc Traceback từ dưới lên, tìm dòng `Error:` cuối. Có thể đọc (không chạy)
code gói ở `C:\ai3d\Hunyuan3D2_WinPortable\WinScripts-GUI\py\launcher.en.py`, `Hunyuan3D-2\api_server.py`,
`gradio_app.py` để hiểu. Sửa được bằng một lệnh → đưa lệnh cho người dùng gõ; thêm dòng vào bảng trên.

## Claude tự bật API (người dùng đã cho phép, 2026-11-12)

`.claude/settings.local.json` (chỉ máy này, không commit) cho phép `Bash(/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe *)`.
Chạy nền (`run_in_background`), không qua launcher:

```
/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe -s -c "import os,sys,runpy; R=r'C:\ai3d\Hunyuan3D2_WinPortable'; os.environ['HF_HUB_CACHE']=R+r'\HuggingFaceHub'; os.environ['HY3DGEN_MODELS']=R+r'\HuggingFaceHub'; os.environ['PYTHONPYCACHEPREFIX']=R+r'\pycache'; os.chdir(R+r'\Hunyuan3D-2'); sys.path.insert(0,'.'); sys.argv=['api_server.py','--host','127.0.0.1','--port','8081']; runpy.run_path('api_server.py', run_name='__main__')"
```

Chờ sẵn sàng bằng vòng `curl http://127.0.0.1:8081/status/x` (khoảng 1–2 phút). Log có `No module named 'triton'` (xformers)
là **cảnh báo vô hại** — đừng coi là lỗi. Xong việc: dừng tiến trình đó (giải phóng VRAM).

Số đo thực tế (RTX 5070 Ti, mini-turbo, octree 256, không texture): 6–18 s / model, ~500 000 tam giác, ~7 MB →
`model:clean` còn 9 500 tam giác, 34 KB.

**Bài học ảnh đầu vào**: ảnh chụp bản khối từ Canvas 3D cho ra **bản sao trắng** của bản khối (cùng dáng, mượt hơn, mất
màu) — 3 seed gần như giống nhau, không đẹp hơn bản khối. Muốn hơn hẳn: ảnh vẽ chi tiết (AI ảnh, câu lệnh dưới) **và**
bật tô màu (texture — cần MSVC + tải thêm model tô màu). Ảnh chụp Canvas 3D chỉ để thử đường ống.

Thêm (thử với nhân vật Tiểu Mặc, 2026-11-12):
- Ảnh có **khung / nền màu** (thẻ, vòng tròn, mây) → rembg giữ cả khung → ra **tấm phẳng hình chữ nhật**. Phải tự tách
  nền trước: nhân vật hoạt hình viền đen → loang từ mép + từ vài điểm nền qua vùng sáng (độ sáng > 85), giữ mảng nối
  với thân, dán lên nền **trắng trơn**, không đệm thêm khung màu khác.
- Ảnh **2D vẽ phẳng** (cel / flat, không bóng đổ) → ra **hình nhân vật cắt bìa** (đúng dáng nhìn thẳng, mỏng như tấm
  giấy, mặt bên trống). Hunyuan đoán độ sâu từ sáng tối → cần ảnh **render 3D có khối, có bóng** (kiểu đồ chơi vinyl /
  đất sét / Pop Mart), tốt nhất kèm ảnh nhìn nghiêng / sau (chế độ đa góc `--mv` của bản web).
- Seed lỗi `IndexError: min(): Expected reduction dim 0 to have non-zero size` (FlashVDM không thấy bề mặt): API không
  trả lỗi, `/status` mãi `processing` → đổi seed; dùng `--cho 90` (bình thường 3–20 s).

## Ngân sách (quyết định 0003) và khi `model:clean` báo vượt

| | Tam giác | Dung lượng | Vật liệu / texture |
|---|---|---|---|
| nhân vật | ≤ 10 000 | ≤ 1,5 MB | 1, ≤ 1024² |
| công trình | ≤ 20 000 | ≤ 3 MB | 1–2, ≤ 1024² |

- Tam giác vẫn vượt sau làm sạch: lưới vụn / nhiều mảnh rời → thử seed khác hoặc ảnh nền trơn hơn.
- Texture > 1024 / nhiều vật liệu / dung lượng vượt: cần Blender (thu nhỏ ảnh, *Bake* một vật liệu) — hướng dẫn
  `docs/ai3d.md` bước 3.
- Hướng sai (mặt sau nhìn +z): Blender xoay 180° quanh trục đứng, hoặc tạo lại bằng ảnh nhìn chính diện.

## Câu lệnh tạo ảnh đầu vào (để người dùng dán vào AI ảnh)

Nhân vật (sửa theo yêu cầu, giữ phần kỹ thuật cuối):

```text
Chibi Chinese xianxia disciple, full body, standing straight in A-pose, arms slightly away from the body, facing the
camera. White-blue Taoist robe (#DCE8EE) with blue trim (#3F5FA0), cross-collar with the LEFT lapel over the RIGHT,
jade pendant at the waist, black hair in a top bun with a golden hairpin, cloth shoes. Big head, short body, cute.
Simple low-poly game style, flat soft colors, no text. Plain light grey background, even lighting, no shadows,
whole figure visible, centered, square image.
```

Công trình: `<tên công trình, mô tả mái / cột / màu theo design/scene/phong_cach.md>, single building, three-quarter
front view, whole building visible including roof and base, plain light grey background, no people, no trees, no
text, simple low-poly game style, square image.`
