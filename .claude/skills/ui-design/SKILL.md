---
name: ui-design
description: Phiên THIẾT KẾ Học Xá 3D — vẽ màn / thành phần mới trên canvas theo phiếu, chốt thì xuất vào design/ và đẩy lên nhánh chính. Dùng ở Claude ngoài VS Code (claude.ai/code hoặc tab Code của app máy tính) khi người dùng gõ /ui-design, dán một phiếu "Dán vào canvas", hoặc nói "vẽ màn …", "sửa thiết kế …", "chốt".
argument-hint: "[<phiếu dán vào> | <yêu cầu vẽ> | chot]"
---

# /ui-design — vẽ trên canvas (phiên thiết kế)

Tham số: $ARGUMENTS

**Mọi câu trả lời mở đầu bằng một dòng:** `Canvas: https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1`

## Vai

Hai phiên, hai vai. Phiên này **chỉ** vẽ canvas và ghi thư mục `design/` (cùng trạng thái phiếu trong
`docs/phieu_thiet_ke/`). **Không sửa code ứng dụng** (`web/`, `app/`, `tool/`), không sửa sổ quy tắc — thiết kế cần đổi
luật thì ghi rõ trong mục CHANGELOG, phiên code (`/ui-apply`) hỏi người dùng rồi sửa sổ.

| Lệnh | Làm gì |
|---|---|
| `/ui-design <phiếu>` hoặc `<yêu cầu>` | Đọc bối cảnh, vẽ / sửa artboard trên canvas. Chưa ghi repo. |
| `/ui-design chot` (hoặc người dùng nói "chốt") | Xuất mọi thứ đã vẽ vào `design/`, commit, đẩy lên nhánh chính. |

## Trước khi vẽ — đọc

1. Phiếu: người dùng dán, hoặc `docs/phieu_thiet_ke/*.md` có trạng thái `chờ thiết kế`.
2. `design/tokens/design_tokens.json` — chỉ dùng màu, chữ, bo góc, khoảng cách ở đây; token mới thì thêm vào và ghi lý do.
3. `design/docs/components.md` — dùng lại thành phần đang có trước.
4. `design/docs/screen_specs.md` — mục của màn liên quan (nếu đã có).
5. `docs/testing/quy_tac.md` — luật `R-…` mà phiếu nêu; thiết kế không được trái luật đã chốt (`đúng`).

## Vẽ

- Canvas đã có — luôn dùng đúng link trên, không tạo canvas mới. Đọc `project/canvas.json` của canvas trước khi
  thêm artboard; làm theo hướng dẫn của loại Design khi đọc canvas.
- Mỗi màn hai artboard: `<Man>-doc.dc.html` 390×844 và `<Man>-ngang.dc.html` 844×390 (app xoay tự do), thêm
  artboard cho từng trạng thái phiếu yêu cầu. Chừa vùng an toàn: tai thỏ / thanh trạng thái trên (dọc), hai bên (ngang).
- Giao diện tiếng Việt; chữ Hán dùng font Noto Serif SC. Cảnh 3D không vẽ — dùng khối màu `scene-bg` hoặc ảnh
  chụp app làm nền giữ chỗ.
- Chưa "chốt" thì **không ghi gì vào repo**. Người dùng xem và góp ý trực tiếp trên canvas.

## Chốt

1. Mã mục mới: `<YYYY-MM-DD>.<số>` (số tiếp theo trong ngày, xem `design/CHANGELOG.md`).
2. Xuất canvas: đọc `project/canvas.json` và các artboard đã đổi → ghi vào `design/source/` (cùng tên file).
3. Ảnh: chụp artboard đã chốt vào `design/screens/<Man>-doc.png`, `-ngang.png` nếu công cụ cho phép; không được thì
   ghi "chưa có ảnh" trong đặc tả (phiên code dùng `source/*.dc.html`).
4. `design/docs/screen_specs.md`: thêm / sửa mục `## <Màn>` theo mẫu trong file (bố cục dọc + ngang, trạng thái,
   số đo theo token, chuỗi, luật `R-…`).
5. Thành phần mới → `design/docs/components.md`. Token mới / đổi → `design/tokens/design_tokens.json`.
6. Chuỗi mới → `design/l10n/vi.arb` (`"<khoá>": "<chữ>"`).
7. `design/CHANGELOG.md`: mục mới ở trên cùng — loại (token · chuỗi · giao diện · luồng/luật · dữ liệu), màn, phiếu
   đáp ứng, file đổi, luật bị chạm (nếu thiết kế cần đổi luật: ghi rõ đề xuất).
8. Phiếu đáp ứng: giữ `chờ thiết kế` (phiên code đóng phiếu khi áp xong), thêm dòng `- Đã vẽ: <mã>`.
9. `git add design/ docs/phieu_thiet_ke/` → commit `design <mã>: <tóm tắt>` → đẩy lên nhánh chính (`main`).
10. Báo: mã, màn đã chốt, nhắc người dùng mở VS Code chạy `/ui-apply`.
