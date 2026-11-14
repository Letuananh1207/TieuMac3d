---
name: task
description: Cửa nhận việc duy nhất của Học Xá 3D — nhận MỌI yêu cầu (một hay nhiều việc trong một tin: tính năng, lỗi, giao diện, cảnh 3D, model, nghiên cứu, ý tưởng, đồng bộ thiết kế / quy tắc), tự tách việc, chọn skill phù hợp (lead, loi, ui-apply, canh, tai-nguyen, khao-cuu, y-tuong, dong-bo-quy-tac…), gom câu hỏi hỏi một lần, chạy song song mỗi việc một worktree, theo dõi tới khi xong, gộp về main và báo. Dùng khi người dùng gõ /task, hoặc giao nhiều việc một lúc, "làm hết", "làm song song", "xử lý giúp các việc sau". "/task" không tham số = xem sổ việc + làm tiếp việc dở.
argument-hint: "[<một hay nhiều việc bằng lời> | tiep | so]"
---

# /task — nhận việc, chia việc, đưa việc tới xong

Tham số: $ARGUMENTS

Phiên chạy `/task` là **người điều phối**: không tự viết code dài — chia việc, gọi skill, giao subagent, gộp, báo.
Được gọi mọi skill của dự án. Sổ việc: `docs/viec/so_viec.md` (bảng, mỗi việc một dòng — luôn cập nhật).

| Tham số | Làm gì |
|---|---|
| `<việc…>` | Nhận việc mới → các bước 1–6 |
| *(trống)* / `tiep` | Đọc sổ việc, làm tiếp mọi việc chưa `xong` (việc đang chạy ở worktree: `dart tool/viec.dart ds`) |
| `so` | Chỉ in sổ việc (trạng thái, chờ ai), không làm gì |

## 1. Tách + phân loại (chưa đọc code)

Tách tin nhắn thành từng việc (một câu một việc nếu độc lập). Mỗi việc → một skill:

| Việc | Skill | Chạy được bằng subagent? |
|---|---|---|
| tính năng / mốc / sửa hành vi / xoá | `lead` (lập kế hoạch → duyệt → `lead tiep`) | lập kế hoạch: có · làm: có, sau khi duyệt |
| báo lỗi | `loi <mô tả>` (ghi) → `loi sua L-…` | ghi: phiên chính · sửa: có |
| thiết kế vừa cập nhật / áp thiết kế | `ui-apply` | có |
| giao diện mới chưa có thiết kế | `ui-apply phieu` → người dùng vẽ bằng `ui-design` | soạn phiếu: có · vẽ: **chờ người dùng** |
| cảnh 3D (bố cục, nhà, màu…) | `canh` | có (trừ khi cần người dùng xoay xem Canvas 3D) |
| model AI (Hunyuan3D trên máy người dùng) | `tai-nguyen` | **phiên chính** (cần máy + Hunyuan đang mở) |
| nghiên cứu phong cách | `khao-cuu` | có |
| ý tưởng sản phẩm | `y-tuong` | có |
| sổ quy tắc đổi | `dong-bo-quy-tac` | phiên chính (connector Claude Docs) |
| câu hỏi / giải thích | trả lời ngay, không ghi sổ | — |

Hai việc sửa cùng tính năng / cùng file chính (theo Bản đồ tính năng của `lead`) → **gộp thành một việc** hoặc xếp
nối tiếp, không chạy song song.

## 2. Ghi sổ việc

Thêm mỗi việc một dòng vào `docs/viec/so_viec.md` (mẫu ở đầu file): mã `V-<ngày>-<số>`, việc (nguyên văn ngắn),
skill, trạng thái `nhận`, nhánh / kế hoạch / mã lỗi khi có. Cập nhật dòng mỗi khi trạng thái đổi.

Trạng thái: `nhận` → `chờ trả lời` / `chờ duyệt` → `đang làm` → `chờ gộp` → `chờ thử máy` / `xong`;
`chờ thiết kế` · `chờ người dùng` (việc cần máy / Hunyuan / canvas) · `dừng (<lý do>)`.

## 3. Gom câu hỏi — hỏi MỘT lần

- Việc mơ hồ (hai cách hiểu → hai kế hoạch khác nhau), thiếu thông tin lỗi (theo `loi`), lựa chọn thư viện / hướng
  thiết kế → gom hết vào **một** lần hỏi (tối đa 4 câu, mỗi câu tự đứng được, ghi mã việc).
- Việc `lead` cỡ vừa / lớn: giao subagent **chỉ lập kế hoạch** (ghi `docs/tasks/`, không sửa code) cho mọi việc
  cùng lúc → trình **một** bảng duyệt (việc · phạm vi · số nhiệm vụ · điểm cần quyết định).
- Việc đã rõ thì không chờ câu hỏi của việc khác — chạy luôn.

## 4. Chạy

- Việc chạy được bằng subagent → `Agent` (`isolation: "worktree"`, `run_in_background: true`), **tối đa 4 cùng
  lúc**, phần còn lại xếp hàng. Lời giao (subagent chỉ biết những gì được viết):
  > Bạn làm việc `<mã>` của dự án Học Xá 3D, trong worktree riêng. Gọi skill `<skill>` với tham số `<…>`
  > (kế hoạch đã duyệt: `<docs/tasks/…>` / mục lỗi `<L-…>`). Theo CLAUDE.md và skill `hoc-xa-3d-dev`. Đầu việc chạy
  > `dart tool/viec.dart chuan-bi`. Không hỏi người dùng: gặp chỗ cần quyết định thì chọn phương án an toàn nhất nếu
  > không đổi hành vi nghiệp vụ, còn lại dừng và ghi vào báo cáo. Sửa sổ quy tắc thì để lại danh sách mã (phiên chính
  > đồng bộ). Lỗi mới: mã tạm `L-?1`. Xong: chạy kiểm của skill, **commit trên nhánh của mình, không gộp, không push**.
  > Báo cáo: đã làm gì · file · test · việc còn chờ · tên nhánh + đường dẫn worktree.
- Việc phải ở phiên chính (`tai-nguyen`, `dong-bo-quy-tac`, ghi lỗi mới, việc cần người dùng thao tác) → làm tuần tự
  trong phiên này trong lúc subagent chạy nền.
- Việc phụ thuộc việc khác (cần code của việc kia) → chờ việc kia gộp xong mới giao.

## 5. Nhận kết quả → gộp

Mỗi subagent báo xong (thông báo tự đến — không thăm dò, không đoán kết quả):
1. Đọc báo cáo; kiểm nhanh trong worktree đó (`git log main..HEAD`, test chính của việc).
2. Gộp: `cd <worktree> && dart tool/viec.dart gop` → xung đột thì tự sửa (xem CLAUDE.md "Làm song song"), chạy lại.
   Gộp xong, ở thư mục chính: `git worktree remove <đường dẫn worktree>` + `git branch -d <nhánh>` (an toàn — gói npm
   dùng chung nằm ngoài worktree; nhánh chưa gộp thì `-d` từ chối, đúng ý).
3. Sổ quy tắc đổi → `/dong-bo-quy-tac` ngay. Việc có `chờ thử máy` → ghi các bước thử vào dòng sổ việc.
4. Hỏng / dừng giữa chừng → giao lại **một** lần với lời giao rõ hơn; vẫn hỏng → `dừng (<lý do>)`, đưa vào báo cáo.
5. Gộp xong việc A làm mở khoá việc B → giao B.

## 6. Báo

Khi mọi việc hết chạy (xong / chờ người dùng): một bảng `Mã · Việc · Kết quả · Cần bạn làm` — đã gộp gì vào main,
việc nào chờ thử máy (các bước), chờ thiết kế (phiếu), chờ trả lời (câu hỏi). Không push nếu chưa được bảo.

## Không làm

- Không tự viết code dài trong phiên điều phối khi có thể giao subagent (giữ phiên chính rảnh để nhận việc mới).
- Không chạy song song hai việc cùng sửa một tính năng.
- Không `ExitWorktree` / xoá worktree còn commit chưa gộp. Không push.
- Không bịa kết quả subagent chưa báo; người dùng hỏi giữa chừng → đọc sổ việc + `viec.dart ds`, nói việc nào đang chạy.
