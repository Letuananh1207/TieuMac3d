---
name: dong-bo-quy-tac
description: Tự đồng bộ sổ quy tắc nghiệp vụ (docs/testing/quy_tac.md) lên tài liệu xác nhận online (Claude Docs) — Claude tự chép bằng connector Claude Docs rồi --mark-synced, KHÔNG nhờ người dùng chép. Dùng ngay sau khi sửa / thêm / xoá quy tắc trong sổ, khi hook Stop báo "Chưa đồng bộ online", hoặc người dùng gõ /dong-bo-quy-tac.
---

# /dong-bo-quy-tac — sổ quy tắc → tài liệu xác nhận online (tự động)

Người dùng **không** chép tay. Phiên nào sửa sổ thì phiên đó đồng bộ, trước khi kết thúc lượt.

## 1. Xem việc cần làm

```sh
dart tool/rule_trace.dart --pending
```

In theo nhóm (`## CHAT — …`): mỗi quy tắc `MỚI` / `ĐỔI (đưa ô Xác nhận về Chờ)` kèm dòng bảng `| mã | quy tắc | ví dụ |`,
và `XOÁ` (mã không còn trong sổ). "Không có quy tắc chờ đồng bộ." → xong.

## 2. Ghi lên tài liệu (connector Claude Docs)

Tài liệu: https://claude.ai/artifact/UF5NiGq5yVL1imQWFeMgh6 — doc id `dc9dda35-a884-4765-9989-b0cae88b1b81`, một tab, thân
(prose node) `7d4430ba-96ac`. Mỗi nhóm = tiêu đề `## <NHÓM> — …` + một bảng 4 cột **Mã · Quy tắc · Ví dụ · Xác nhận**; cột
Xác nhận là dropdown enum `2f4b566d-0f56` (index 0 = Chờ, 1 = Đúng, 2 = Sai).

Trước lần gọi connector đầu tiên của phiên: nạp skill docs nếu client có, rồi `guide(items=["topic.index","topic.editing"])`.

1. `read` doc (`ref {"object":"project","id":"<doc id>"}`) → `read` thân với `{"projection":"outline"}` → id tiêu đề nhóm +
   id bảng. Cần hàng cụ thể → `{"kind":"view","parentId":"<id bảng>"}`.
2. **Nhóm mới** (chưa có tiêu đề): `insert` trước tiêu đề nhóm đứng sau nó trong sổ (hoặc cuối tab), `"as":"markdown"`:
   `## <nhóm>` + bảng 4 cột; ô Xác nhận mỗi hàng là chip `{"type":"dropdown","enum":"2f4b566d-0f56","index":0}`.
3. **MỚI** trong nhóm đã có: chèn hàng cuối bảng (`insert` `side:"end"` trên id bảng, `"as":"blocks"`, đủ 4 ô; ô Xác nhận
   chứa dropdown index 0). Chữ đậm `**…**` của sổ có thể để thường trong hàng chèn kiểu blocks.
4. **ĐỔI**: thay ô Quy tắc + Ví dụ của hàng đó bằng nội dung mới (cell target + `ifRev` của lần đọc); ô Xác nhận về **Chờ**
   (dropdown index 0). Không đụng hàng khác, không đụng comment của người dùng.
5. **XOÁ**: xoá hàng của mã đó (block id hàng + `ifHash`/`ifRev`).
6. Refused / `guard_mismatch` → đọc lại đúng bảng đó rồi làm lại; người dùng vừa sửa ô Xác nhận thì giữ lựa chọn của họ
   (trừ quy tắc ĐỔI — vẫn về Chờ).

## 3. Đánh dấu

```sh
dart tool/rule_trace.dart --mark-synced <các mã MỚI / ĐỔI>
dart tool/rule_trace.dart --forget <các mã XOÁ>      # nếu có
dart tool/rule_trace.dart --pending                    # phải ra "Không có quy tắc chờ đồng bộ."
```

## Không có connector Claude Docs (phiên đám mây, connector tắt)

Không chặn việc: báo một dòng "chưa đồng bộ online <mã> — phiên sau có connector sẽ tự làm", không `--mark-synced`.
Hook Stop không chặn trong trường hợp này.

## Không làm

- Không nhờ người dùng chép, không hỏi "đã chép chưa".
- Không `--mark-synced` khi chưa ghi thật lên tài liệu.
- Không đồng bộ quy tắc của phiên khác đang sửa dở trong worktree khác — chỉ sổ trong thư mục đang làm.
