---
name: guide
description: Trợ giúp — dự án có những lệnh gì, dùng lệnh nào để làm việc gì. Dùng khi người dùng gõ /guide, hỏi "có những lệnh gì", "dùng lệnh nào để…", "làm sao để báo lỗi / thêm tính năng".
argument-hint: "[<tên skill> | <việc muốn làm>]"
---

# /guide — trợ giúp

Tham số: $ARGUMENTS

Chỉ đọc, không sửa gì, không tự chạy lệnh nào.

**Mỗi lần chạy, đọc thật** frontmatter (`name`, `description`, `argument-hint`) và bảng lệnh (nếu có) của mọi
`.claude/skills/*/SKILL.md` — không dùng danh sách nhớ sẵn, vì skill có thể đã thêm / bớt.

## Không tham số

1. Bảng `Lệnh · Làm gì · Cửa sổ`, nhóm theo vai: **làm việc** (`lead`, `loi`), **thiết kế** (`ui-design` giao diện
   2D, `canh` cảnh 3D, `tai-nguyen` model AI, `khao-cuu` nghiên cứu phong cách, `y-tuong` ý tưởng sản phẩm), **áp** (`ui-apply`), **trợ giúp**
   (`guide`). Cửa sổ = **VS Code** (phiên Claude trong dự án này); `ui-design` thường **ngoài VS Code** (claude.ai/code
   hoặc tab Code của app máy tính) nhưng người dùng có thể nhờ VS Code làm thay; `canh`, `tai-nguyen`, `khao-cuu`
   chạy ở đâu cũng được (`tai-nguyen` cần máy có Hunyuan3D). Skill không có lệnh gõ (`hoc-xa-3d-dev`) ghi **tự
   gọi** — Claude tự đọc khi viết code.
2. Các luồng thường dùng — chỉ liệt kê luồng mà mọi skill trong luồng đều có thật:
   - tính năng / mốc mới: `/lead <yêu cầu>` → duyệt kế hoạch → `/lead tiếp`
   - lỗi: `/loi <mô tả>` → `/loi sua L-…` → thử máy → `/loi xong L-…` (hoặc `/loi mo L-…`)
   - làm nhiều việc cùng lúc: mở nhiều phiên Claude, mỗi phiên một việc — Claude tự vào worktree riêng và tự gộp về
     `main` khi xong (`dart tool/viec.dart ds` xem việc đang mở); sổ quy tắc đổi → Claude tự `/dong-bo-quy-tac` lên
     tài liệu online, người dùng không chép tay
   - giao diện 2D mới (HUD, màn): `/ui-apply phieu <yêu cầu>` → chép khối "Dán vào canvas" sang `/ui-design` → vẽ,
     góp ý trên canvas → "chốt" → `git pull` rồi `/ui-apply`
   - cảnh 3D (bố cục, nhà, địa hình, nước, cây, màu, ánh sáng, camera): `/canh <yêu cầu>` → xoay, góp ý trên Canvas
     3D → `/canh chot` → `/ui-apply` (kiểm luật rồi build cho app). Cần kiểu vật mới → "Cần code" → `/lead`
   - nhân vật / tài nguyên mới chỉ từ mong muốn: `/tai-nguyen <mong muốn>` → Claude tự khảo cứu + đẩy phiếu ảnh →
     `/ui-design` làm ảnh → `/tai-nguyen nhan-vat <tên>` dựng model
   - model 3D bằng AI (nhân vật, công trình nổi bật): mở Hunyuan3D chế độ API (`/tai-nguyen kiem` chỉ cách) →
     `/tai-nguyen nhan-vat <ảnh | mô tả>` → chọn bản đẹp nhất → commit; Hunyuan lỗi: `/tai-nguyen sua-loi <lỗi>`
   - nghiên cứu phong cách cổ trang / tiên hiệp: `/khao-cuu <chủ đề>` → chọn hướng → `/khao-cuu phieu <hồ sơ>` →
     `/canh` (cảnh) hoặc `/tai-nguyen` (model); soát cảnh: `/khao-cuu soat`
   - xác nhận quy tắc nghiệp vụ: chọn Đúng/Sai trên tài liệu online (link ở `docs/testing/quy_tac.md`) → nói
     "xử lý xác nhận quy tắc"
3. Một dòng: chốt chặn tự chạy khi Claude báo xong (hook Stop) và khi commit (nếu đã bật
   `git config core.hooksPath tool/git_hooks`).

## `/guide <tên skill>`

Chi tiết một skill: làm gì, các dạng lệnh (từ bảng lệnh / `argument-hint`), 2–3 ví dụ gõ thật với nội dung của dự
án này (vd. `/loi nhân vật đi xuyên tường thư viện`, `/lead thêm vùng sự kiện ở giếng`, `/canh thêm cầu đá qua suối
Hậu Sơn`, `/tai-nguyen nhan-vat`).

## `/guide <việc muốn làm>`

Một lệnh nên dùng (và cửa sổ), kèm câu lệnh gõ sẵn trong khối code. Không có skill phù hợp → nói thẳng, gợi ý
cách hỏi Claude bình thường.
