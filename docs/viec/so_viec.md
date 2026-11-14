# Sổ việc — Học Xá 3D

Mọi việc nhận qua `/task` (skill `.claude/skills/task/SKILL.md`). Mỗi việc một dòng; phiên điều phối cập nhật khi trạng
thái đổi. Việc đang chạy trong worktree: `dart tool/viec.dart ds`.

Trạng thái: `nhận` → `chờ trả lời` / `chờ duyệt` → `đang làm` → `chờ gộp` → `chờ thử máy` / `xong` · `chờ thiết kế` ·
`chờ người dùng` · `dừng (<lý do>)`.

| Mã | Việc | Skill | Trạng thái | Nhánh / kế hoạch / lỗi | Cần người dùng |
|---|---|---|---|---|---|
| V-20261114-01 | Áp Ngồi ôn | ui-apply / lead | đang làm — đợt 2 (cuộn sách 3D) đã gộp 3ae8a08; đợt 3–4 Flutter đang chạy | `docs/tasks/2026-11-14-ap-ngoi-on.md`; nhánh Flutter `worktree-agent-ab21045be964e8529` | thử (npm run dev): cuộn trước ngực khi ngồi, nhịp mở 1 s, bấm Đứng dậy → cuộn chập lại rồi đứng; có thể cần chỉnh TAM_CAO / TAM_TRUOC / NGUA trong `web/src/scene/cuonSach.ts` |
| V-20261114-02 | Nhà của ta (nhà riêng + vườn + trang trí) | lead + canh | chờ duyệt | `docs/tasks/2026-11-14-nha-nguoi-dung.md` — NV4 cảnh `nha-ta` chờ duyệt (Canvas 3D TyJxrgsBcj5ryHakv7c1so v48); NV6 chưa làm; NV5, 8–10 chờ thiết kế (phiếu `2026-11-14-nha-nguoi-dung`) | duyệt cảnh Nhà của ta |
| V-20261114-03 | Văn tiền / cửa hàng — thiết kế đã có (2026-11-14.12) | ui-apply → lead | đang làm (subagent lập kế hoạch) | nhánh `viec/van-tien` → `docs/tasks/2026-11-14-van-tien.md` | duyệt kế hoạch khi xong |
| V-20261114-04 | Catalog kiến trúc — đợt 1 | lead | chờ duyệt | `docs/tasks/2026-11-14-catalog-kien-truc.md` (artifact VHdbpqKax8q8Ya5fUxeGXc) | duyệt 8 mẫu |
| V-20261114-05 | Khu tự học | lead | chờ duyệt | `docs/tasks/2026-11-14-khu-tu-hoc.md` (sửa theo Ngồi ôn trước — V-01 bước 7) | duyệt kế hoạch |
| V-20261114-06 | Nhân vật chibi — bản mẫu | lead | chờ duyệt | `docs/tasks/2026-11-12-nhan-vat-chibi.md` | duyệt bản mẫu Canvas 3D |
| V-20261114-07 | Kiến trúc chuẩn bài trí — GĐ kế: Catalog 3D | lead | chờ V-04 | `docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md` — làm sau khi duyệt catalog đợt 1 (V-04) | — |
| V-20261114-08 | Mốc 4 hiệu năng: đo fps trên Android thật · vật đặc trưng vùng (bước R-VA-1 xong) · nâng cấp đồ hoạ (hết bước, chờ đóng) | lead | chờ thử máy | `docs/tasks/2026-11-11-moc-4-hieu-nang.md` NV4, `2026-11-14-vat-dac-trung-vung.md`, `2026-11-11-nang-cap-do-hoa.md` | đo fps / nóng máy trên Android (bản debug có bảng gỡ lỗi) |
| V-20261114-09 | Thử máy: mốc 3 cầu nối, động tác nhân vật | lead | chờ thử máy | `docs/tasks/2026-11-11-moc-3-cau-noi.md`, `2026-11-12-dong-tac-nhan-vat.md` | thử trên máy |
| V-20261114-10 | Thử máy lỗi L-6 … L-11 (chớp bề mặt, nhãn tên đè bản đồ, con trỏ, bàn ngồi, camera, cầu thang) | loi | chờ thử máy | `docs/loi.md` | thử, báo `/loi xong` / `/loi mo` |
| V-20261114-11 | Áp thiết kế 2026-11-14.1 – .8 | ui-apply | xong (30a5ca5 — cả 8 mục đã có trong code, chỉ ghi nhật ký) | `docs/thiet_ke_da_ap.md`; còn ngoài phạm vi: bản đồ kéo / phóng (cần kế hoạch riêng) | thử máy: ghim đầu nhân vật + huy hiệu đồng hồ trên bản đồ, nhãn tên viền mực, tên app trên màn hình chính |
| V-20261114-12 | Model NPC Tiểu nhị từ bộ ảnh 2026-11-14.11 | tai-nguyen | chờ người dùng | `docs/phieu_thiet_ke/2026-11-13-anh-tieu-nhi.md` | mở Hunyuan3D, gõ `/task` khi sẵn sàng |
