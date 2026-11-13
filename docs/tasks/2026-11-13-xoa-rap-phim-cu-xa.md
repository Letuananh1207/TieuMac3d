# Xoá rạp phim và Đệ Tử Cư Xá
- Yêu cầu: "xóa chỗ xem phim chung và cư xá"
- Quyết định người dùng: rạp phim **xoá hẳn** (code + luật + quyết định 0004); cư xá **bỏ cả tên khu**.
- Loại: xoá · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `web/src/scene/{rapPhim,videoScreen}.ts`, `kien_truc/rap_phim.ts`, `zones/videos.ts` — xoá.
- `web/src/scene/seat.ts` (mới) — kiểu `Seat` (trước ở `rapPhim.ts`), dùng bởi `rooms.ts`, `gameTable.ts`, `world.ts`.
- `web/src/zones/seats.ts` — bỏ loại chỗ `rap` / nhãn "Ngồi xem"; nhận `nearestSeat` (trước ở `videos.ts`).
- `web/src/main.ts`, `scene/world.ts`, `scene/spec.ts` — bỏ ghép rạp, `World.cinema`, kiểu `rap-phim`.
- Test: `zones/seats.test.ts` (ví dụ R-NGOI-1 đổi sang bàn trà), `lauSach.test.ts`, `traLau.test.ts` (đổi import).
- `design/scene/scene.json` — bỏ nhà rạp + lối; 4 nhà cư xá + lối + khu "Đệ Tử Cư Xá"; `design/CHANGELOG.md` .30.
- `docs/testing/quy_tac.md` + online — bỏ R-RAP-1..3; R-VUNG-1, R-NGOI-1 bỏ chữ rạp.
- `CLAUDE.md`, `decisions/0004` (bãi bỏ), `web_scene.md`, `canh/truong-dac-ta.md`, `lead/SKILL.md` (bản đồ).

**Không đụng**: `design/docs/` (nhãn "Ngồi xem" còn trong đặc tả màn — ghi ở CHANGELOG cho phiên thiết kế);
kế hoạch / phiếu cũ (lưu sử); cầu nối (rạp không dùng sự kiện nào).

## Nhiệm vụ
- [x] 1. Xoá code rạp, dời `Seat` / `nearestSeat`.
- [x] 2. Sổ quy tắc + online + `--mark-synced`.
- [x] 3. `scene.json` + `scene:check`.
- [x] 4. Tài liệu (CLAUDE.md, 0004, skill).
- [x] 5. Kiểm tra cuối + build.
