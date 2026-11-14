# Tự động đồng bộ quy tắc + làm nhiều việc song song
- Yêu cầu: "vì sao bây giờ cứ liên tục báo là phải tự chép quy tắc rất phiền hãy suy nghĩ cập nhật làm sao để tự động xử
  lý, ngoài ra hiện nay cùng 1 lúc thì sẽ rất nhiều task được thực hiện nhiều file sửa hãy nghiên cứu làm sao để mọi thứ
  có thể làm đồng thời"
- Loại: sửa quy trình / công cụ (không đổi game) · Cỡ: vừa–lớn · Trạng thái: xong (chờ commit công cụ lên main)

## Vì sao đang phiền (nguyên nhân)

1. **Tài liệu xác nhận online là Claude Docs** — chỉ ghi được qua connector Claude Docs của phiên Claude (MCP), không có
   lệnh / API cho script. Nên mỗi lần sửa `docs/testing/quy_tac.md`, hook Stop (`tool/guard.dart stop`) chặn và bắt
   "chép lên tài liệu rồi `--mark-synced`, hoặc báo người dùng vì sao chưa" → phiên hay đẩy việc sang người dùng.
2. **Nhiều phiên cùng một thư mục**: phiên A sửa sổ quy tắc → hook Stop của phiên B (không đụng quy tắc) cũng bị nhắc
   (đầu phiên này: R-VA-1 của phiên khác). Cùng nguyên nhân: file đổi dưới tay nhau (`main.ts`, `docs/loi.md`, sổ quy tắc,
   bản đồ tính năng `/lead`), mã `L-…` hai phiên lấy trùng, build `app/assets/scene/` ghi đè lẫn nhau, máy kiểm báo lỗi
   của phiên khác.

## Phạm vi
**Sẽ sửa**
- `tool/rule_trace.dart` — thêm `--pending` in từng quy tắc chưa đồng bộ: mới / đổi, nhóm, dòng bảng (mã · quy tắc · ví dụ)
  sẵn để chép; `--mark-synced` giữ nguyên.
- Skill mới `.claude/skills/dong-bo-quy-tac/SKILL.md` — Claude **tự** chép lên tài liệu bằng connector Claude Docs (đọc
  khung bảng, thêm hàng / thay ô, đưa Xác nhận về Chờ khi nội dung đổi) rồi `--mark-synced`. Không hỏi người dùng.
- `tool/guard.dart` (hook Stop) — chỉ nhắc quy tắc **phiên này** sửa (đọc transcript trong JSON stdin), lời nhắc đổi thành
  "chạy /dong-bo-quy-tac"; phiên không có connector (đám mây) → ghi chờ, **không chặn**.
- `CLAUDE.md`, `/lead`, `/loi`, `/ui-apply` — thay câu "chép lên tài liệu online" bằng "/dong-bo-quy-tac (tự động)".
- Làm song song (theo lựa chọn bên dưới): `CLAUDE.md` mục "Làm song song", `.gitattributes`, script mở / gộp nhánh việc
  `tool/viec.dart`, tách sổ lỗi `docs/loi.md` → `docs/loi/L-<số>.md` + mục lục sinh tự động, mã `L-` / `R-` cấp khi gộp.

**Cần kiểm tra**: `tool/check.dart` (`--changed` so với gốc nhánh khi ở worktree), `web/scripts/copy-to-app.mjs` (build trong
worktree chép vào `app/` của worktree đó), hook `tool/git_hooks/*`.

**Không đụng**: code game (`web/src/`, `app/lib/`), nội dung quy tắc.

## Cần quyết định (đã chốt 2026-11-14: Claude tự chép · mỗi việc một worktree)
1. Đồng bộ quy tắc: Claude tự chép bằng connector (đề xuất) · hay bỏ tài liệu online, xác nhận ngay trong sổ / trang riêng.
2. Làm song song: mỗi việc một **worktree + nhánh** riêng, xong thì gộp về `main` (đề xuất) · hay vẫn chung một thư mục +
   "khoá mềm" theo file · hay chỉ giảm điểm nóng.

## Nhiệm vụ (theo phương án đề xuất)
- [x] 1. `rule_trace.dart --pending` (tool · test Dart nhỏ · xong khi in đúng quy tắc mới / đổi kèm dòng bảng).
- [x] 2. Skill `/dong-bo-quy-tac` + thử chạy thật trên tài liệu (đồng bộ các quy tắc đang chờ, nếu có).
- [x] 3. `guard.dart stop`: chỉ quy tắc phiên này sửa, nhắc gọi skill, không connector → không chặn.
- [x] 4. Sửa lời trong `CLAUDE.md`, `/lead`, `/loi`, `/ui-apply`, `/guide`.
- [x] 5. Song song — quy ước: mỗi việc `/lead` / `/loi sua` mở worktree `../TieuMac3d-viec/<tên>` nhánh `viec/<tên>`
  (`tool/viec.dart mo <tên>`: tạo worktree, nối `web/node_modules` dùng chung, ghi việc vào `docs/tasks`); xong →
  `tool/viec.dart gop <tên>`: rebase lên `main`, build lại file sinh, chạy kiểm, gộp, xoá worktree.
- [x] 6. Giảm xung đột khi gộp: file sinh (`app/assets/scene/**`, `web/src/fonts/**`, `app_fonts.g.dart`) không gộp tay —
  `.gitattributes` `merge=ours` + build lại sau gộp; nhật ký chỉ-thêm (`design/CHANGELOG.md`, `docs/thiet_ke_da_ap.md`)
  `merge=union`; sổ lỗi tách mỗi lỗi một file; mã `L-` / `R-` mới ghi tạm `L-?`, cấp số khi gộp (`viec.dart gop`).
- [x] 7. `main.ts` (683 dòng — mọi tính năng đều ghép ở đây): quy ước mỗi tính năng một file ghép riêng như
  `gamePlay.ts`, `chatRoom.ts`; ghi vào skill `hoc-xa-3d-dev` (không tách lại code cũ trong kế hoạch này).
- [x] 8. Thử: mở 2 việc song song trong 2 worktree, sửa cùng `main.ts` + thêm 2 lỗi, gộp cả hai → không mất sửa, mã không trùng.

## Kiểm tra cuối
dart tool/check.dart --changed · dart tool/rule_trace.dart · dart tool/guard.dart · cd web && npm test && npm run build

## Kết quả
- Đồng bộ quy tắc: `rule_trace.dart --pending` / `--forget`, skill `/dong-bo-quy-tac`, hook Stop chỉ nhắc phiên đã sửa sổ
  (dò transcript), nhắc một lần rồi cho qua.
- Song song: `tool/viec.dart` (`chuan-bi` · `gop [--thu]` · `don` · `ds`), `.claude/settings.json` `worktree.baseRef: head`,
  `.gitignore` `.claude/worktrees/`, `.gitattributes` (union nhật ký, ours file sinh), CLAUDE.md "Làm song song", `/lead`
  `/loi` `/ui-apply` `/guide`. Nhiệm vụ 6 đổi so với kế hoạch: **không tách** `docs/loi.md` từng file — dùng `merge=union`
  + mã tạm `L-?` (thử: hai bên cùng thêm vào cuối nhật ký → gộp giữ cả hai).
- Thử (8): worktree tạm — nối node_modules, rebase khi main vừa có commit mới, union gộp, `L-?1 → L-12`, build + kiểm đạt,
  `don` gỡ nối trước khi xoá (node_modules thư mục chính còn nguyên). Chưa chạy bước đưa vào main thật.
- Phát hiện: ExitWorktree "remove" / `git worktree remove` với nối junction → lỗi "Invalid argument" (nguy cơ xoá xuyên) →
  bắt buộc `viec.dart don`.
