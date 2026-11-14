# Sổ việc — Học Xá 3D

Mọi việc nhận qua `/task` (skill `.claude/skills/task/SKILL.md`). Mỗi việc một dòng; phiên điều phối cập nhật khi trạng
thái đổi. Việc đang chạy trong worktree: `dart tool/viec.dart ds`.

Trạng thái: `nhận` → `chờ trả lời` / `chờ duyệt` → `đang làm` → `chờ gộp` → `chờ thử máy` / `xong` · `chờ thiết kế` ·
`chờ người dùng` · `dừng (<lý do>)`.

| Mã | Việc | Skill | Trạng thái | Nhánh / kế hoạch / lỗi | Cần người dùng |
|---|---|---|---|---|---|
| V-20261114-01 | Áp Ngồi ôn — còn cuộn sách trên tay, 2 màn Flutter, build | ui-apply / lead | đang làm (dừng giữa chừng, đã lưu 7961c4e) | `docs/tasks/2026-11-14-ap-ngoi-on.md` (5 bước) | — |
| V-20261114-02 | Nhà của ta (nhà riêng + vườn + trang trí) | lead + canh | chờ duyệt | `docs/tasks/2026-11-14-nha-nguoi-dung.md` — NV4 cảnh `nha-ta` chờ duyệt (Canvas 3D TyJxrgsBcj5ryHakv7c1so v48); NV6 chưa làm; NV5, 8–10 chờ thiết kế (phiếu `2026-11-14-nha-nguoi-dung`) | duyệt cảnh Nhà của ta |
| V-20261114-03 | Văn tiền / cửa hàng | ui-design | chờ thiết kế | phiếu `docs/phieu_thiet_ke/2026-11-14-van-tien-cua-hang.md` | vẽ trên canvas |
| V-20261114-04 | Catalog kiến trúc — đợt 1 | lead | chờ duyệt | `docs/tasks/2026-11-14-catalog-kien-truc.md` (artifact VHdbpqKax8q8Ya5fUxeGXc) | duyệt 8 mẫu |
| V-20261114-05 | Khu tự học | lead | chờ duyệt | `docs/tasks/2026-11-14-khu-tu-hoc.md` (sửa theo Ngồi ôn trước — V-01 bước 7) | duyệt kế hoạch |
| V-20261114-06 | Nhân vật chibi — bản mẫu | lead | chờ duyệt | `docs/tasks/2026-11-12-nhan-vat-chibi.md` | duyệt bản mẫu Canvas 3D |
| V-20261114-07 | Kiến trúc chuẩn bài trí — GĐ kế: Catalog 3D | lead | nhận | `docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md` | — |
| V-20261114-08 | Mốc 4 hiệu năng (1 bước) · nâng cấp đồ hoạ · vật đặc trưng vùng (1 bước) | lead | đang làm (dừng) | `docs/tasks/2026-11-11-moc-4-hieu-nang.md`, `2026-11-11-nang-cap-do-hoa.md`, `2026-11-14-vat-dac-trung-vung.md` | — |
| V-20261114-09 | Thử máy: mốc 3 cầu nối, động tác nhân vật | lead | chờ thử máy | `docs/tasks/2026-11-11-moc-3-cau-noi.md`, `2026-11-12-dong-tac-nhan-vat.md` | thử trên máy |
| V-20261114-10 | Thử máy lỗi L-6 … L-11 (chớp bề mặt, nhãn tên đè bản đồ, con trỏ, bàn ngồi, camera, cầu thang) | loi | chờ thử máy | `docs/loi.md` | thử, báo `/loi xong` / `/loi mo` |
