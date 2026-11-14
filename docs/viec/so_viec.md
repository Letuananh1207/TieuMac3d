# Sổ việc — Học Xá 3D

Mọi việc nhận qua `/task` (skill `.claude/skills/task/SKILL.md`). Mỗi việc một dòng; phiên điều phối cập nhật khi trạng
thái đổi. Việc đang chạy trong worktree: `dart tool/viec.dart ds`.

Trạng thái: `nhận` → `chờ trả lời` / `chờ duyệt` → `đang làm` → `chờ gộp` → `chờ thử máy` / `xong` · `chờ thiết kế` ·
`chờ người dùng` · `dừng (<lý do>)`.

| Mã | Việc | Skill | Trạng thái | Nhánh / kế hoạch / lỗi | Cần người dùng |
|---|---|---|---|---|---|
| V-20261114-01 | Áp Ngồi ôn | ui-apply / lead | chờ thử máy (xong code — 3ae8a08, 3abc6f2, 8ef6362) | `docs/tasks/2026-11-14-ap-ngoi-on.md` | thử (app, sau build): ngồi ôn 1 s → cuộn sách trước ngực + bảng cuộn treo dọc / ngang · 4 trạng thái · học liên tiếp 竹 → 木 → 氵 · Bộ đã học → chạm → Xuất định · Đứng dậy / nút quay lại · ấn son 溫故 · cảnh đứng hình dưới bảng có chấp nhận được không |
| V-20261114-02 | Nhà của ta | lead + canh + ui-apply | đang làm — NV4 chốt cảnh + NV6 13 vật: nhánh `viec/nha-ta-vat`; NV8 HUD trang trí + NV9 bản đồ theo thiết kế 2026-11-14.13 (vừa kéo về): sau khi Văn tiền NV1–8 gộp (chung decor.ts / progress_store) | `docs/tasks/2026-11-14-nha-nguoi-dung.md` | — |
| V-20261114-03 | Văn tiền (thiết kế 2026-11-14.12) | lead | đang làm — NV1–8 (461ebe2) + NV10 tiệm (b765aba) đã gộp, quy tắc đã đồng bộ; NV9 ví HUD + NV11 ghép: nhánh `viec/van-tien-2` | `docs/tasks/2026-11-14-van-tien.md` | xem chỗ đặt tiệm Tạp hoá trên app |
| V-20261114-04 | Catalog kiến trúc | lead | đang làm — đợt 1 đã duyệt 2026-11-14; đợt 2 (8 mẫu) nhánh `viec/catalog-dot-2` | `docs/tasks/2026-11-14-catalog-kien-truc.md` | duyệt đợt 2 khi đăng (https://claude.ai/artifact/VHdbpqKax8q8Ya5fUxeGXc) |
| V-20261114-05 | Khu tự học | lead | chờ thử máy (đã gộp e077ea3; quy tắc đã đồng bộ) · bảng hướng dẫn chờ thiết kế (phiếu `docs/phieu_thiet_ke/2026-11-14-huong-dan-tu-hoc.md`) | `docs/tasks/2026-11-14-khu-tu-hoc.md` | thử: tầng 2 Tàng Thư Các thấy biển, đi vào bị chặn · bấm Ngồi ở bồ đoàn → 1 s cuộn sách + bảng, "Học bộ mới" mờ · Đứng dậy · bàn trà trà lâu 5 s không có cuộn sách |
| V-20261114-06 | Nhân vật chibi | lead | chờ thử máy (mặc định chibi đã gộp 07d9dd3) + xếp hàng: dáng nhảy / ngồi / chào / đứng lâu cho chibi (người dùng chọn làm) | `docs/tasks/2026-11-12-nhan-vat-chibi.md` — quay về: `?nhan-vat=glb` / `khoi` | thử: fps trên máy thật, biểu cảm mặt trong WebView; chibi 21 draw call · 8,4k tam giác (vượt ước 6–8 / 5k) |
| V-20261114-07 | Kiến trúc chuẩn bài trí — Catalog 3D | lead | đang làm (cùng V-04 — catalog các đợt) | `docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md` | — |
| V-20261114-08 | Mốc 4 hiệu năng: đo fps trên Android thật · vật đặc trưng vùng (bước R-VA-1 xong) · nâng cấp đồ hoạ (hết bước, chờ đóng) | lead | chờ thử máy | `docs/tasks/2026-11-11-moc-4-hieu-nang.md` NV4, `2026-11-14-vat-dac-trung-vung.md`, `2026-11-11-nang-cap-do-hoa.md` | đo fps / nóng máy trên Android (bản debug có bảng gỡ lỗi) |
| V-20261114-09 | Thử máy: mốc 3 cầu nối, động tác nhân vật | lead | chờ thử máy | `docs/tasks/2026-11-11-moc-3-cau-noi.md`, `2026-11-12-dong-tac-nhan-vat.md` | thử trên máy |
| V-20261114-10 | Thử máy lỗi L-6 … L-11 (chớp bề mặt, nhãn tên đè bản đồ, con trỏ, bàn ngồi, camera, cầu thang) | loi | chờ thử máy | `docs/loi.md` | thử, báo `/loi xong` / `/loi mo` |
| V-20261114-11 | Áp thiết kế 2026-11-14.1 – .8 | ui-apply | xong (30a5ca5 — cả 8 mục đã có trong code, chỉ ghi nhật ký) | `docs/thiet_ke_da_ap.md`; còn ngoài phạm vi: bản đồ kéo / phóng (cần kế hoạch riêng) | thử máy: ghim đầu nhân vật + huy hiệu đồng hồ trên bản đồ, nhãn tên viền mực, tên app trên màn hình chính |
| V-20261114-12 | Model NPC Tiểu nhị từ bộ ảnh 2026-11-14.11 | tai-nguyen | chờ người dùng | `docs/phieu_thiet_ke/2026-11-13-anh-tieu-nhi.md` | mở Hunyuan3D, gõ `/task` khi sẵn sàng |
