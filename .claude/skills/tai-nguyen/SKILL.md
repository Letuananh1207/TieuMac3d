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

- Claude **chạy Hunyuan trực tiếp** bằng Python của gói (`/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe`
  — người dùng đã cho phép trong `.claude/settings.local.json`, 2026-11-12). Máy chủ API (`scripts/hunyuan.mjs`) chỉ còn
  cho luồng một ảnh (dự phòng).
- Claude **không tự vẽ ảnh** đầu vào. Thiếu ảnh / ảnh không đạt → **soạn phiếu cho `/ui-design`** (phiên thiết kế trong
  app Claude tạo ảnh được), mẫu `docs/phieu_thiet_ke/2026-11-12-anh-nhan-vat-3d.md`: bộ 4 góc trước / trái / sau / phải
  (+ cận mặt), tư thế chữ A, render kiểu đồ chơi 3D (không vẽ phẳng), không viền, nền trơn sáng, không watermark, chuẩn
  hoá: vuông 1024, đỉnh búi 10 %, đế 90 %, trục thân giữa ảnh, 4 góc cùng tỉ lệ. In khối "Dán vào canvas" cho người dùng chép sang.
- Ghi: `design/models/*.glb`, `design/models/LICENSES.md`, `design/CHANGELOG.md`, ảnh `design/screens/Model-<tên>*.png`.
  **Không** sửa code `web/` `app/`; cần code (vd. NPC chưa có chỗ đặt) → kế hoạch `/lead`.
- Ảnh có bản quyền (phim, game, truyện) không làm đầu vào cho tài nguyên đưa vào app — nhắc người dùng.

## Luồng chuẩn: nhân vật từ bộ ảnh 4 góc (chốt 2026-11-12.12)

Vì sao luồng này: 4 ảnh cho Hunyuan đủ dáng mọi phía; bản **đầy đủ** Hunyuan3D-2mv (không turbo) cho tóc / tai / đầu
khớp ảnh nên màu chiếu từ chính bộ ảnh lên không lem; vật liệu không-sáng giữ đúng màu ảnh thiết kế ở mọi góc.

1. **Ảnh**: `design/models/anh/<tên>-{truoc,trai,sau,phai}.png` (góc "trái" = nhìn từ bên trái nhân vật, mặt quay sang
   trái ảnh). Thiếu / lệch chuẩn → phiếu `/ui-design`, dừng chờ. Đúng phong cách `design/scene/phong_cach.md`
   (đệ tử: **vạt trái đè vạt phải**); chủ đề chưa có hồ sơ → gợi ý `/khao-cuu`.
2. **Thử nhanh** (tuỳ, ~2 phút): `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh <tên> <scratchpad>/<tên>-nhanh --nhanh --seed 1234`
   — bản turbo, để xem bộ ảnh có dựng ra dáng đúng không trước khi chạy thật.
3. **Chạy thật** (nền, `run_in_background`; ~10 phút / seed):
   `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh <tên> <scratchpad>/<tên> --seed 1234,7`
   Lệnh làm hết: `mv_gen.py --day-du` (50 bước, octree 512) → `smooth.py --min 2` (16 000 tam giác) → `bake.py --jpg`
   (UV xatlas, trộn 4 góc theo hướng mặt + che khuất, khớp khung từng góc + riêng đầu, chân tóc / tóc mai) →
   `model:clean --khong-sang` (nén meshopt, `KHR_materials_unlit`, ~0,2 MB) → chụp Canvas 3D. Mỗi seed ra
   `<tên>-s<seed>-final.glb`, `-so.png` (trên ảnh thiết kế · dưới model, 4 góc thẳng), `-6goc.png` (cận 6 góc).
   Seed lỗi FlashVDM / không ra hình → thêm seed khác (42, 99).
4. **Xem + chọn**: Read các `-so.png` / `-6goc.png`, soát: dáng khớp ảnh, chân tóc / thái dương / tóc mai, mặt, viền áo,
   tay. Trình người dùng (đính đường dẫn ảnh), **hỏi chọn seed** — không tự quyết thẩm mỹ. Lỗi màu còn lại → sửa
   `bake.py` (có cờ: `--bat-dong`, `--khong-chan-toc`, `--giu-toc-mai`, `--xem-toc-mai`, `--mu`), không vẽ tay.
5. **Đưa vào**: chép bản chọn vào `design/models/<tên>.glb` (hoặc chạy lại với `--seed <n> --dat`); nhân vật chính:
   kiểm đi / đứng (`?di&pha=0.25` trên Canvas 3D — xương tự gắn `autoRig` đo theo dáng chibi chữ A; dáng khác hẳn → báo
   `/lead` chỉnh số đo `P`); chép ảnh so sánh sang `design/screens/Model-<tên>.png`, `-so-thiet-ke.png`; một dòng
   `design/models/LICENSES.md`; mục `design/CHANGELOG.md`; `cd web && npm run build`.
6. Commit chỉ các đường dẫn của mình: `asset: <tên> (Hunyuan3D-2mv đầy đủ, seed <n>)`.

NPC (vd. Tiểu Mặc): cùng luồng, `<tên>` riêng (`tieu-mac`); app chưa nạp NPC `.glb` → kế hoạch `/lead` để đặt vào cảnh.

## Dự phòng: chỉ có một ảnh

1. **API**: `node .claude/skills/tai-nguyen/scripts/hunyuan.mjs kiem`. Không chạy → hướng dẫn người dùng: PowerShell trong
   `C:i3d\Hunyuan3D2_WinPortable` → `.\RUN.bat` → *Program Parameters* → **"API 2.0 | For Blender Addon"** → *HTTP Service
   Listen Address* `127.0.0.1` → *Save and Start* → chờ `Uvicorn running on …:8081`.
2. **Tạo**: `node .claude/skills/tai-nguyen/scripts/hunyuan.mjs tao <ảnh> --ra <scratchpad>/<tên>-s<seed>.glb --seed <n>` (2–3 seed).
3. **Mịn**: `smooth.py <thô.glb> <mịn.glb> --tam-giac 16000`; **tô màu** chiếu một phía: `atlas.py <ảnh> <atlas.png>` (`--phang 32`)
   rồi `cd web && npm run model:paint -- <mịn> <atlas.png> --ra <màu>` (lưng mang hoạ tiết mặt trước). Đồ vật không cần mịn:
   `npm run model:clean -- <file> --loai <loai> --ten <tên> --ra <ra.glb>`.
4. Kết quả kém xa luồng chuẩn → khuyên người dùng xin bộ ảnh 4 góc qua `/ui-design`.

`LICENSES.md` — bảng `| File | Công cụ + phiên bản | Ảnh đầu vào | Ngày | Giấy phép |`, vd.
`| nhan-vat.glb | Hunyuan3D-2mv đầy đủ (WinPortable cu129, seed 1234, nhan-vat.sh) → smooth → bake → model:clean --khong-sang | anh/nhan-vat-{truoc,trai,sau,phai}.png | 2026-11-12 | Tencent Hunyuan Community License (không dùng ở EU / UK / Hàn) |`

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
