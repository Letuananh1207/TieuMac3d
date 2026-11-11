# Tạo model 3D bằng AI chạy trên máy (thử nghiệm, kế hoạch D)

Kế hoạch: `docs/tasks/2026-11-11-nang-cap-do-hoa.md` đợt D · quyết định `.claude/skills/hoc-xa-3d-dev/decisions/0003-tai-san-ai.md`.
Hướng đã chọn (2026-11-11): **lai** — địa hình, bố cục, nhà thường vẫn dựng bằng code; thử AI cho **nhân vật + 1–2 công
trình nổi bật**; công cụ **mã nguồn mở chạy trên máy**. Repo chỉ nhận file `.glb` đã làm sạch; phần mềm AI cài ngoài repo.

## Máy hiện tại (đo 2026-11-11)

| | Có | Cần (theo các nguồn dưới) |
|---|---|---|
| GPU | RTX 5070 Ti Laptop, **12 GB** VRAM, driver 577.05 | driver ≥ 576.57 cho bản WinPortable hỗ trợ RTX 50 |
| RAM | 31 GB | ≥ 24 GB khi phải đẩy bớt model sang RAM (VRAM ít) |
| Ổ đĩa | — | ~ 50 GB trống (trọng số model rất nặng) |

## Chọn công cụ

| Công cụ | Trên máy này | Ghi chú |
|---|---|---|
| **Hunyuan3D-2 WinPortable** (gói chạy sẵn của YanWenKun) — **khuyên dùng** | tạo hình được; tô màu (texture) phải bật chế độ tiết kiệm VRAM | có bản hỗ trợ RTX 50 (Python 3.12, CUDA 12.9, PyTorch 2.8), có giao diện bấm nút; không phải tự biên dịch |
| Hunyuan3D-2mini (bản nhỏ 0,6 B tham số) | chạy thoải mái | ComfyUI ghi bản mini cần khoảng 5 GB VRAM; chất lượng thấp hơn — dùng để thử nhanh |
| TRELLIS.2 (Microsoft, MIT) | **chưa nên** | nhiều nguồn ghi cần ~24 GB VRAM; Windows không được hỗ trợ chính thức |

Các con số VRAM giữa các nguồn **vênh nhau nhiều** (vd. Hunyuan3D-2.1 cả quy trình: 12 GB theo ComfyUI, 29 GB theo một tài
liệu khác) — chạy thử rồi đo thật (Task Manager → GPU → "Dedicated GPU memory").

**Giấy phép Hunyuan3D**: giấy phép cộng đồng của Tencent, không áp dụng ở EU, Anh, Hàn Quốc; có thể có ngưỡng người dùng
cho thương mại. Trước khi phát hành app: đọc file `LICENSE` đúng bản đã dùng, ghi vào `design/models/LICENSES.md`.

## Cài (ngoài repo)

1. Tải bản phát hành mới nhất của **Hunyuan3D-2-WinPortable** từ GitHub (YanWenKun), giải nén vào một thư mục **không
   có dấu cách, không dấu tiếng Việt**, vd. `C:\ai3d\Hunyuan3D-2-WinPortable\` — đừng đặt trong thư mục dự án (đường dẫn
   dự án có dấu cách "Start up", và repo không nhận file AI).
2. Chạy file khởi động trong thư mục giải nén (đọc README của gói: có bản cho 2.0 / 2.1 / VRAM thấp). Lần đầu nó tải
   trọng số model (vài chục GB) — để chạy qua đêm nếu mạng chậm.
3. Mở giao diện web nó in ra (thường `http://127.0.0.1:…`).
4. Hết VRAM ("CUDA out of memory") → dùng script VRAM thấp của gói, hoặc chỉ tạo hình (tắt texture) rồi tô màu trong Blender.

## Quy trình một model

1. **Ảnh đầu vào** — một ảnh, vật đứng giữa, nền trơn sáng, nhìn chính diện hơi chếch:
   - nhân vật: đệ tử chibi đứng **tư thế chữ A** (tay dang chéo xuống — gắn xương dễ), theo bản mẫu
     `design/source/PhongCach-CayNhanVat.dc.html` (đạo bào `#DCE8EE`, viền `#3F5FA0`, búi tóc trâm vàng, **vạt trái đè
     vạt phải** — lỗi trang phục hay gặp, xem `docs/tham_khao/` + `.claude/skills/khao-cuu/references/nen-tang.md`);
   - công trình: một điện / đình, ảnh có đủ mái, cột, nền.
   Có thể vẽ ảnh bằng mô hình tạo ảnh AI, hoặc chụp từ Canvas 3D (`?cam=…`) rồi nhờ mô hình ảnh "vẽ lại đẹp hơn".
2. **Tạo model** trong Hunyuan3D → xuất `.glb`. Thử 2–3 lần (đổi seed), giữ bản đẹp nhất.
3. **Làm sạch trong Blender** (miễn phí):
   - giảm tam giác (modifier *Decimate*): nhân vật **≤ 10 000**, công trình **≤ 20 000** tam giác;
   - một vật liệu, texture ≤ 1024 × 1024 (*Bake* nếu model có nhiều texture);
   - đặt gốc toạ độ dưới chân, mặt trước nhìn **+Z**, đơn vị mét (đệ tử cao ≈ 1,6–1,8 m);
   - nhân vật: gắn xương + động tác **idle** và **walk** (Mixamo của Adobe — miễn phí, cần tài khoản; hoặc Rigify trong
     Blender). Tên clip: `idle`, `walk`.
4. **Nén** bằng `gltfpack` (meshoptimizer) — three.js giải nén được bằng `MeshoptDecoder` có sẵn trong gói, chạy offline.
   Đích: nhân vật ≤ 1,5 MB, công trình ≤ 3 MB.
5. **Đưa vào repo**: `design/models/<tên>.glb` + một dòng `design/models/LICENSES.md` (công cụ + phiên bản, ảnh đầu vào
   tự làm hay nguồn nào, ngày tạo, giấy phép).
   - **Nhân vật chính**: đặt tên đúng `design/models/nhan-vat.glb` → app tự dùng (đã có code D1). Mặt trước nhìn về +z
     (trong Blender: −Y lúc xuất glTF +Y up), đứng thẳng, chân ở đáy; cỡ bao nhiêu cũng được (app co về cao 2,1 m).
   - Có xương + clip tên chứa `idle` / `walk` → app chạy clip; không có → app tự nhún nhẹ khi đi.
   - Không có màu / texture → app tô trắng; thiếu pháp tuyến → app tự tính.
   - So với đệ tử khối: Canvas 3D `?nhan-vat=khoi`. Lỗi nạp → app dùng đệ tử khối (xem console).

## So sánh (D2)

Mỗi model thử ghi: ảnh chụp trong Canvas 3D cạnh bản dựng bằng code, số tam giác, dung lượng, fps trên điện thoại. Chỉ
thay bản code khi model AI đẹp hơn rõ **và** giữ được ≤ 150 draw call, fps ổn trên máy thật.

## Nguồn

- [Hunyuan3D-2-WinPortable (YanWenKun)](https://github.com/YanWenKun/Hunyuan3D-2-WinPortable) — gói Windows, RTX 50, driver ≥ 576.57, VRAM ≥ 3 GB tạo hình / ≥ 6 GB tô màu (bản 2.0, có tối ưu)
- [Comfy3D-WinPortable r8](https://github.com/YanWenKun/Comfy3D-WinPortable/releases/tag/r8-hunyuan3d2) — 6 GB đủ cho tạo hình, cần ≥ 24 GB RAM
- [ComfyUI — Hunyuan3D-2](https://docs.comfy.org/tutorials/3d/hunyuan3D-2) — 2mini ~5 GB, bản chuẩn 6 GB tạo hình, cả quy trình 12 GB
- [Tencent Hunyuan3D-2](https://github.com/Tencent/Hunyuan3D-2) — repo chính thức, cờ `--low_vram_mode`
- [Hunyuan3D-2.1 Installation (DeepWiki)](https://deepwiki.com/Tencent-Hunyuan/Hunyuan3D-2.1/2.1-shape-generation-pipeline) — 10 GB tạo hình / 21 GB tô màu (bản 2.1 đầy đủ)
- [Set up Hunyuan3D-2 on Windows (Codersera)](https://codersera.com/blog/set-up-hunyuan3d-2-on-windows-a-step-by-step-guide/) — hướng dẫn Windows 2.0 / 2.1 / WinPortable
- [TRELLIS.2 VRAM guide](https://book.st-hakky.com/en/data-science/trellis2-native-vs-legacy-vram-guide) · [AI Radar — TRELLIS.2](https://ai-radar.it/article/microsoft-presenta-trellis-2-un-modello-open-source-da-immagine-a-3d-con-4-miliardi-di-parametri?lang=en) — ~24 GB, Windows không chính thức
