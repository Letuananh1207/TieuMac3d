---
name: canh
description: Thiết kế CẢNH 3D Học Xá 3D (景) — bố cục tông môn, địa hình, nhà, cổng, cây, nước, màu, ánh sáng, sương, camera — bằng đặc tả design/scene/scene.json + Canvas 3D (trang chạy đúng code app), kiểm luật bằng scene:check, chụp ảnh, chốt vào design/. Chạy được ở cả VS Code lẫn ngoài VS Code. Dùng khi người dùng gõ /canh, hoặc nói "dời nhà", "thêm khu / nhà / cổng / ao / cây", "đổi màu trời / ánh sáng / sương", "sửa địa hình / núi / thác", "xem cảnh trên Canvas 3D", "chụp cảnh".
argument-hint: "[<yêu cầu sửa cảnh> | xem [<góc>] | chot]"
---

# /canh — thiết kế cảnh 3D

Tham số: $ARGUMENTS

**Mọi câu trả lời mở đầu bằng một dòng:** `Canvas 3D: <link trong design/scene/README.md>`

Cảnh 3D không vẽ trên canvas 2D mà thiết kế bằng **đặc tả** `design/scene/scene.json` + **Canvas 3D** (artifact chạy
chính code `web/` — thấy gì trên đó là app hiện nấy). Quyết định: `.claude/skills/hoc-xa-3d-dev/decisions/0002-thiet-ke-3d.md`.
Giao diện 2D (HUD, màn, thẻ) → `/ui-design`. Model AI (.glb) → `/tai-nguyen`. Phong cách "đúng chất" → `/khao-cuu`.

| Lệnh | Làm gì |
|---|---|
| `/canh <yêu cầu>` | sửa `scene.json` → `scene:check` → build + đăng Canvas 3D → chụp ảnh, báo. Chưa commit. |
| `/canh xem [tren \| ca-san \| <khu>]` | chỉ build + chụp (không sửa), kèm draw call / tam giác |
| `/canh chot` (hoặc "chốt") | mục `design/CHANGELOG.md` + ảnh `design/screens/Canh-*.png` → commit `design <mã>: …` |

## Vai

- Ghi: `design/scene/scene.json`, `design/CHANGELOG.md` (mục cảnh 3D), `design/screens/Canh-*.png`,
  `design/scene/{tong_mon,phong_cach,README}.md`, Canvas 3D. **Không** sửa code `web/` `app/` `tool/`, không sửa sổ quy tắc.
- Đặc tả không tả được (kiểu vật mới, trường mới) → ghi "Cần code" trong mục CHANGELOG (cái gì, ở đâu, trông thế nào, số
  đo). Ở VS Code, người dùng đồng ý thì chuyển thành kế hoạch `/lead` rồi quay lại `/canh`.
- Bố cục chạm luật → ghi trong CHANGELOG; sửa sổ là việc của `/ui-apply` / phiên code (hỏi người dùng trước).

## Đọc trước

| Thứ | Ở đâu |
|---|---|
| link Canvas 3D, ghi chú | `design/scene/README.md` |
| quy hoạch khu, phong cách đã chốt | `design/scene/tong_mon.md`, `design/scene/phong_cach.md` |
| các trường + ví dụ | `references/truong-dac-ta.md` (kiểu + chú thích đầy đủ: `web/src/scene/spec.ts`; khuôn mặc định: `web/dist-design/scene.default.json` sau `build:design`) |
| hồ sơ khảo cứu chủ đề | `docs/tham_khao/` |
| luật bố cục | `docs/testing/quy_tac.md` — `R-VA-1/2/3`, `R-VUNG-1`, `R-HUD-1/3` (đọc ví dụ) |
| nội dung vùng học (chỉ đọc) | `web/src/zones/zones.ts` (`ZONE_CONTENT`: `lop-hsk3`, `thu-vien`) |

## Sửa cảnh

1. Sửa `scene.json` (chỉ trường có trong khuôn). Màu `"#rrggbb"`; `rotY` nhà / cổng: 0 · 90 · 180 · 270 (độ); `pitch`
   camera: radian; mặt trước (cửa, biển) nhìn +z trước khi quay. Vùng neo theo nhà `zone: { id, front, r }`.
2. `cd web && npm run scene:check` → phải **"Không có lỗi"**; in toạ độ nhà / vùng / tường / bục để đối chiếu luật.
3. Phân loại: **bố cục** (nhà, tường, cổng, ao, giếng, cây trong sân, vùng, điểm xuất phát, bục, bậc — chạm `R-VA-*`,
   `R-VUNG-1`, `R-HUD-*`) hay **ngoại hình** (màu, ánh sáng, sương, trời, camera, núi xa, cây ngoài tường, cỏ, đá).
4. `npm run build:design` → đăng Canvas 3D (mục dưới) → chụp các góc liên quan → báo kèm ảnh + số.
5. Ngân sách (đo ở `?view=tren`, góc chơi, trong nhà): **≤ 150 draw call, ≤ 150k tam giác**. Vượt → báo, đề xuất bớt.

## Canvas 3D

- Tham số URL: `?view=tren | ca-san` · `?cam=x,y,z&tam=x,z` (camera nhìn điểm) · `?nv=x,z` (đặt nhân vật; trong nhà
  thì mái mờ sẵn) · `?nhan-vat=khoi | gau` (đệ tử khối / gấu thay model .glb) · `?chup` (ẩn bảng + lớp phủ — ảnh sạch) · `?di=0..1`
  (nhân vật đi tại chỗ) · `?pha=1.57` (đặt pha bước để chụp một tư thế, dùng với `?di=0`).
- Bảng "Hiệu năng": draw call · tam giác (không tính lớp phủ) · vật cản.
- **Đăng**: `Artifact` `action: list, scope: files` trên link → chỉ gửi file đổi (`design.html` + `assets/<file mới>`),
  `null` cho file cũ đã thay (tên có hash). Lần đầu chưa có link → tạo mới, ghi vào `design/scene/README.md`.
- **Chụp** (không màn hình): `npx vite preview --outDir dist-design --port 4174 --strictPort` chạy nền, đợi cổng mở,
  Chrome `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars
  --virtual-time-budget=9000 --window-size=900,600 --screenshot=<file> <URL>`. Xong **chỉ** dừng tiến trình giữ cổng
  4174 (`Get-NetTCPConnection -LocalPort 4174`) — không tắt mọi `node.exe` (phiên khác đang chạy). Trang chính
  `index.html` chụp headless dừng ở màn tải — dùng Canvas 3D.

## Chốt

1. Mã `<YYYY-MM-DD>.<số>` tiếp theo trong `design/CHANGELOG.md`.
2. Mục mới trên cùng: loại (cảnh 3D — **bố cục** / **ngoại hình**), ai làm (phiên nào, người dùng nhờ gì), trường đổi
   (cũ → mới, số đo), luật bị chạm (ví dụ nào lệch, đề xuất), kết quả `scene:check`, draw call / tam giác, "Cần code",
   bản Canvas 3D, ảnh, file.
3. Ảnh `design/screens/Canh-<góc>.png` (ghi đè ảnh cũ cùng góc nếu chụp lại).
4. `git add design/` (chỉ file của mình — có thể có phiên khác đang làm) → `design <mã>: <tóm tắt>`. Đẩy khi người dùng
   đồng ý. Báo: mã, ảnh, việc chờ (`/ui-apply` ở VS Code để kiểm luật + build cho app; "Cần code" → `/lead`).
