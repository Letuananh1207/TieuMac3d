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

1. Bảng `Lệnh · Làm gì · Cửa sổ`: mỗi skill một dòng. Cửa sổ = **VS Code** (phiên Claude trong dự án này);
   skill không có lệnh gõ (vd. `hoc-xa-3d-dev`) ghi **tự gọi** — Claude tự đọc khi viết code.
2. Các luồng thường dùng — chỉ liệt kê luồng mà mọi skill trong luồng đều có thật:
   - tính năng / mốc mới: `/lead <yêu cầu>` → duyệt kế hoạch → `/lead tiếp`
   - lỗi: `/loi <mô tả>` → `/loi sua L-…` → thử máy → `/loi xong L-…` (hoặc `/loi mo L-…`)
   - xác nhận quy tắc nghiệp vụ: chọn Đúng/Sai trên tài liệu online (link ở `docs/testing/quy_tac.md`) → nói
     "xử lý xác nhận quy tắc"
3. Một dòng: chốt chặn tự chạy khi Claude báo xong (hook Stop) và khi commit (nếu đã bật
   `git config core.hooksPath tool/git_hooks`).

## `/guide <tên skill>`

Chi tiết một skill: làm gì, các dạng lệnh (từ bảng lệnh / `argument-hint`), 2–3 ví dụ gõ thật với nội dung của dự
án này (vd. `/loi nhân vật đi xuyên tường thư viện`, `/lead thêm vùng sự kiện ở giếng`).

## `/guide <việc muốn làm>`

Một lệnh nên dùng (và cửa sổ), kèm câu lệnh gõ sẵn trong khối code. Không có skill phù hợp → nói thẳng, gợi ý
cách hỏi Claude bình thường.
