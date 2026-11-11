# CHANGELOG bộ chuẩn

- 2026-11-10 — Tạo bộ chuẩn từ code mốc 1 (commit 051231e): bảng phụ thuộc web/src, quy tắc E-LOP, E-CDN, E-BONG.
- 2026-11-10 — Mốc 2: app_flutter.md viết lại từ code thật (WebView, server nội bộ, safe area, AppColors).
- 2026-11-10 — Thiết kế (lựa chọn C): design/ ưu tiên cao nhất cho màn đã vẽ; giao diện mới chưa vẽ → phiếu, không dựng tạm.
- 2026-11-10 — Thiết kế 3D (decisions/0002): số / màu cảnh lấy từ `SceneSpec` (đọc `design/scene/scene.json`), vùng neo theo nhà, cây gộp `InstancedMesh`, Canvas 3D (`design.html`), `npm run scene:check`.
- 2026-11-11 — Tông môn đợt 1: vật mới trong `SceneSpec`, `specCheck.ts` (danh sách `LISTS`), gộp khối `merge.ts`, va chạm tròn, `World.update`.
- 2026-11-11 — Phong cách Trung Hoa: `scene/kien_truc/`, cây `cay_moi.ts`, nhân vật đệ tử, chip khu (`zones/areaTracker.ts`, R-HUD-1).
- 2026-11-11 — HUD C (thiết kế 2026-11-11.3/.4): token kính sương, thẻ tên khu (R-HUD-3), màn tải (R-MAN-2); chữ Hán đóng gói cắt chữ (`scripts/subset-han.mjs` → `src/fonts/`).
- 2026-11-11 — Địa hình: terrain / farMountains / cloudSea trong đặc tả, Heightfield ở collision/, luật R-VA-2 (dốc 35°); nhà phải nằm trên bục.
- 2026-11-11 — Vào trong nhà: bỏ thẻ mời (eventCard), nút học nổi + chạm vật, rooms.ts / noi_that.ts, Ground nhiều lớp; luật R-VUNG-1/2/3, R-VA-3, R-HUD-1/2.
- 2026-11-11 — B6a: bậc đá (terrain.stairs), cỏ búi + đá rải (terrain.grass / rocks).
