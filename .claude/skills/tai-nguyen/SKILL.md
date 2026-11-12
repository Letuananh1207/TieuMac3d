---
name: tai-nguyen
description: Tài nguyên 3D (資源) Học Xá 3D — phối hợp với Hunyuan3D chạy trên máy người dùng để tạo model .glb (nhân vật, công trình nổi bật) từ ảnh, làm sạch về ngân sách điện thoại, đặt vào design/models/, ghi giấy phép, chụp so với bản dựng bằng khối để người dùng chọn. Dùng khi người dùng gõ /tai-nguyen, hoặc nói "tạo model", "dùng Hunyuan", "AI vẽ 3D", "thay nhân vật bằng model", "model .glb", "Hunyuan lỗi / không chạy".
argument-hint: "[kiem | nhan-vat [<ảnh | mô tả>] | cong-trinh <tên> [<ảnh | mô tả>] | lam-sach <file.glb> [loai] [ten] | ds | sua-loi <lỗi dán vào>]"
---

# /tai-nguyen — tạo tài nguyên 3D bằng Hunyuan3D

Tham số: $ARGUMENTS

Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0003-tai-san-ai.md` (lai: cảnh dựng bằng code, AI chỉ cho nhân vật +
1–2 công trình nổi bật; ngân sách; giấy phép). Hướng dẫn cài / quy trình tay: `docs/ai3d.md`. Lỗi Hunyuan hay gặp:
`references/hunyuan.md` — đọc khi API không chạy hoặc người dùng dán lỗi.

| Lệnh | Làm gì |
|---|---|
| `/tai-nguyen kiem` | API Hunyuan có chạy không; model nào đang có trong `design/models/` |
| `/tai-nguyen nhan-vat [<ảnh> \| <mô tả>]` | tạo nhân vật chính → `design/models/nhan-vat.glb` (app tự dùng) |
| `/tai-nguyen cong-trinh <tên> [<ảnh> \| <mô tả>]` | tạo công trình → `design/models/<tên>.glb` (chưa đặt vào cảnh — cần code, xem cuối) |
| `/tai-nguyen lam-sach <file.glb> [nhan-vat\|cong-trinh] [tên]` | file người dùng tự tạo (web Hunyuan, công cụ khác) → làm sạch + đưa vào |
| `/tai-nguyen ds` | liệt kê model, tam giác, dung lượng, dòng giấy phép |
| `/tai-nguyen sua-loi <lỗi>` | chẩn đoán lỗi Hunyuan theo `references/hunyuan.md` |

## Vai và giới hạn

- Claude **không chạy phần mềm Hunyuan** (`C:\ai3d\…`, python của gói — chế độ quyền chặn, đúng như vậy). Người dùng
  mở launcher; Claude chỉ gọi máy chủ API cục bộ qua `scripts/hunyuan.mjs` (fetch tới 127.0.0.1).
- Claude **không tự vẽ ảnh** đầu vào. Nguồn ảnh, theo thứ tự ưu tiên:
  1. ảnh người dùng đưa (vẽ / chụp / tạo bằng AI ảnh như ChatGPT, Gemini) — tốt nhất;
  2. Claude soạn **câu lệnh tạo ảnh** (mẫu ở `references/hunyuan.md`) để người dùng dán vào AI ảnh, lưu file, gửi đường dẫn;
  3. dự phòng: chụp bản dựng bằng khối trên Canvas 3D (`?chup`, mục "Ảnh từ Canvas 3D") — ra hình mượt hơn bản khối
     nhưng cùng dáng, nền rối nên kém hơn 1–2.
- Ghi: `design/models/*.glb`, `design/models/LICENSES.md`, ảnh đầu vào tự làm `design/models/anh/<tên>.png`, ảnh so
  sánh `design/screens/Model-<tên>.png`. **Không** sửa code `web/` `app/`; cần code → kế hoạch `/lead`.
- Ảnh có bản quyền (phim, game, truyện) không làm đầu vào cho tài nguyên đưa vào app — nhắc người dùng.

## Quy trình `nhan-vat` / `cong-trinh`

1. **API**: `node .claude/skills/tai-nguyen/scripts/hunyuan.mjs kiem`. Không chạy → hướng dẫn người dùng (ngắn, từng
   bước): PowerShell trong `C:\ai3d\Hunyuan3D2_WinPortable` → `.\RUN.bat` → tab *Program Parameters* → **"API 2.0 |
   For Blender Addon"** → *HTTP Service Listen Address* `127.0.0.1` → *Save and Start* → chờ dòng `Uvicorn running on
   …:8081` → báo lại. Dừng chờ.
2. **Ảnh đầu vào** (theo thứ tự ở trên). Yêu cầu ảnh: một vật, đứng giữa, nhìn chính diện (hơi chếch được), nền trơn
   sáng, không cắt mất phần nào; nhân vật tư thế chữ A. Đúng phong cách đã chốt: `design/scene/phong_cach.md`, bản mẫu
   `design/source/PhongCach-*.dc.html` (đệ tử: đạo bào `#DCE8EE` viền `#3F5FA0`, búi tóc trâm vàng, **vạt trái đè vạt
   phải**); chủ đề chưa có hồ sơ → gợi ý `/khao-cuu` trước.
3. **Tạo** (mỗi lần ~1–3 phút trên RTX 5070 Ti; chạy nền với `run_in_background` nếu cần):
   `node .claude/skills/tai-nguyen/scripts/hunyuan.mjs tao <ảnh> --ra <scratchpad>/<tên>-s<seed>.glb --seed <n>`
   Tạo **2–3 seed** (1234, 42, 7) để có lựa chọn. Thêm `--texture` chỉ khi người dùng đã bật tô màu (cần MSVC).
4. **Làm sạch** từng bản: `cd web && npm run model:clean -- <file> --loai <loai> --ten <tên> --ra <scratchpad>/<tên>-s<seed>-sach.glb`
   (giảm tam giác về ngân sách, nén meshopt; báo VƯỢT NGÂN SÁCH → xem `references/hunyuan.md`).
   **Tô màu** (model ra trắng khi chưa bật texture): `python .claude/skills/tai-nguyen/scripts/atlas.py <ảnh> <atlas.png>`
   (nửa trước = ảnh, nửa sau = da đầu → tóc) rồi `cd web && npm run model:paint -- <bản sạch> <atlas.png> --ra <bản màu>`
   (chiếu ảnh từ trước lên model; ~0,4 MB với texture 1024 × 512). Lưng áo mang hoạ tiết mặt trước — chấp nhận được;
   muốn đúng hẳn: bật texture của Hunyuan (MSVC).
5. **So sánh** (mục "So sánh trên Canvas 3D"): chép từng bản vào `design/models/<tên>.glb`, `build:design`, chụp, rồi
   chụp bản khối (`?nhan-vat=khoi`). Ghép thành bảng cho người dùng: ảnh · tam giác · KB · draw call. **Hỏi chọn** —
   không tự quyết thẩm mỹ.
6. **Đưa vào**: bản được chọn ở `design/models/<tên>.glb`; ảnh đầu vào (+ atlas nếu tô màu) → `design/models/anh/`; một dòng
   `design/models/LICENSES.md` (mẫu dưới); ảnh so sánh `design/screens/Model-<tên>.png`. Nhân vật: `cd web && npm run
   build` (app nhận). Cập nhật đợt D trong `docs/tasks/2026-11-11-nang-cap-do-hoa.md` (D2 / D3).
7. Commit khi người dùng đồng ý: `git add design/models design/screens/Model-*.png docs/tasks/…` →
   `asset: <tên> (Hunyuan3D-2 mini-turbo, seed <n>)`.

`LICENSES.md` — bảng `| File | Công cụ + phiên bản | Ảnh đầu vào | Ngày | Giấy phép |`, vd.
`| nhan-vat.glb | Hunyuan3D-2mini-turbo (WinPortable cu129) + model:clean | design/models/anh/nhan-vat.png (tự vẽ) | 2026-11-12 | Tencent Hunyuan Community License (không dùng ở EU / UK / Hàn) |`

## Ảnh từ Canvas 3D (dự phòng)

`cd web && npm run build:design`, `npx vite preview --outDir dist-design --port 4174 --strictPort` (nền), Chrome
headless: `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars
--virtual-time-budget=9000 --window-size=768,768 --screenshot=<file>` URL
`http://localhost:4174/design.html?chup&nhan-vat=khoi&nv=<x>,<z>&cam=<x>,1.3,<z+3.6>&tam=<x>,<z>` (nhân vật đứng ở
`player.start` của `design/scene/scene.json`; công trình: `cam` chếch trước nhà, `tam` = tâm nhà). Tắt preview sau khi
chụp — chỉ dừng tiến trình giữ cổng 4174 (`Get-NetTCPConnection -LocalPort 4174`), **không** tắt mọi `node.exe`.

## So sánh trên Canvas 3D

Cùng cách chụp, bỏ `chup` để thấy bảng "Hiệu năng" (draw call, tam giác) hoặc giữ `chup` cho ảnh đẹp; cửa sổ 900×600,
`cam` cách 4–5 m. Model không màu → trắng (bình thường khi chưa bật texture). Xong thì trả `design/models/` về đúng
bản được chọn (không để bản thử).

## Đưa công trình vào cảnh

App mới nạp `.glb` cho **nhân vật** (`web/src/player/glbCharacter.ts`, `playerCharacter.ts`). Công trình `.glb` cần code:
trường đặc tả (vd. `buildings[].model: "dien"`), nạp + đặt + hộp va chạm theo kích thước nhà, giữ bản khối dự phòng —
chuyển thành kế hoạch `/lead` (ghi trong đợt D), không tự sửa.
