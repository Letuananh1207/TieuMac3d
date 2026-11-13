# Tàng Thư Các: mượn sách HSK qua thủ thư
- Yêu cầu: "tầng 1 tàng thư các tôi muốn là nơi cho mượn sách qua npc riêng, và sẽ mang sách đó lên trên tầng đọc, về
  sách thì sẽ là các đầu sách giáo trình hán ngữ, chuẩn hsk, ..."
- Người dùng chọn (2026-11-13): nội dung = **sổ từ theo cấp HSK** (chữ, pinyin, nghĩa Việt, câu ví dụ — tự soạn theo
  danh sách từ HSK công khai, không chép giáo trình có bản quyền); **mang sách đi được** (đọc ở đâu cũng được, trả rồi
  mới mượn cuốn khác); thủ thư **model riêng bằng /tai-nguyen**.
- Loại: thêm (dữ liệu + hành vi + cảnh + giao diện) · Cỡ: lớn · Trạng thái: xong (giao diện áp 2026-11-13.28)

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — luật mới R-SACH-1…4 (mượn, mang theo, đọc, trả) → tài liệu online → `--mark-synced`.
- `web/src/zones/books.ts` (mới) — danh mục sách + sổ từ HSK (dữ liệu thuần, có test).
- `web/src/zones/library.ts` (mới) — luật mượn / trả thuần (đang mượn gì, được mượn không), có test.
- `web/src/zones/dialogs.ts` — hội thoại thủ thư: "Mượn sách" / "Trả sách" / "Tạm biệt" (khung thoại sẵn có, ≤ 3 lựa chọn).
- `web/src/scene/spec.ts` — thêm `'thu-thu'` vào `NPC_IDS`; `web/src/player/npc.ts` — dáng gắn xương thủ thư (sau khi có model).
- `docs/bridge.md` + `web/src/bridge/flutterBridge.ts` + `app/lib/scene/scene_event.dart` — sự kiện mở danh mục / mở
  sách; `getProgress` thêm `book` (cuốn đang mượn).
- `app/lib/journey/progress_store.dart` — lưu cuốn đang mượn (giữ qua tắt app).
- `app/lib/library/` (mới) — màn danh mục sách + màn đọc sổ từ (**chờ thiết kế**).
- `web/src/main.ts` — ghép: thoại thủ thư → mượn / trả; nút "Đọc sách" khi đang mang sách (**chờ thiết kế**).

**Cần kiểm tra**: font chữ Hán cắt tự động (`fonts:han`, `fonts:app`) — ~350 chữ mới của HSK 1–2 làm file font to
thêm (ước ~150–250 KB); thoại Tiểu Mặc / Sư phụ (cùng `dialogs.ts`); `npcInTalkRange` khi NPC đứng trong nhà.

**Không đụng**: tầng 2 / cầu thang (đã xong — `2026-11-13-tang-thu-cac-tang-2.md`), luật NPC R-NPC-1/2, rạp phim,
bàn cờ. Không làm sách cầm trên tay nhân vật (để sau nếu muốn).

## Giả định / cần quyết định
- **Bộ HSK**: đề xuất **HSK 2.0 — 6 cấp** (150 / 300 / 600 / 1200 / 2500 / 5000 từ cộng dồn), vì giáo trình ở Việt Nam
  phần lớn vẫn theo 6 cấp. Cách khác: HSK 3.0 — 9 cấp (chuẩn mới 2021, nhiều từ hơn).
- **Làm theo đợt**: đợt 1 có 2 cuốn **HSK 1** (150 từ) và **HSK 2** (150 từ mới); kệ vẫn bày đủ 6 cuốn, cuốn chưa
  soạn ghi "Đang biên soạn". Các cấp sau soạn dần (tôi soạn nghĩa Việt + câu ví dụ; bạn duyệt mẫu 20 từ đầu).
- Mượn 1 cuốn mỗi lần; đổi cuốn = trả rồi mượn lại. Không hạn ngày trả.
- Thủ thư đứng sau quầy ở tầng 1, đối diện cửa (vị trí chốt qua `/canh`). Chưa có model → NPC bị bỏ qua (R-NPC-1),
  nên phần mượn sách chỉ thử được trên máy sau khi có model.

## Nhiệm vụ
**Đợt A — làm ngay (không cần thiết kế)**
- [x] 1. Sổ quy tắc R-SACH-1…4 → tài liệu online (Chờ) → `--mark-synced` (docs · xong khi `rule_trace` sạch).
- [x] 2. `zones/books.ts`: 6 cuốn (mã `hsk1`…`hsk6`, tên, số từ), sổ từ HSK 1 + 2 `{han, pinyin, nghia, viDu}`;
      test: đủ 150 / 150 từ, không trùng, pinyin có dấu thanh, câu ví dụ chứa từ (zones · vitest).
- [x] 3. `zones/library.ts`: `canBorrow`, `borrow`, `giveBack` thuần; test theo R-SACH-1/4 (zones · vitest).
- [x] 4. Cầu nối: `docs/bridge.md` trước — `openLibrary {books, borrowed}` (JS → Flutter, mở danh mục), `openBook
      {book}` (mở sổ từ), `getProgress.book`; hai phía cùng lúc (bridge + Flutter · test `scene_event_test.dart`).
- [x] 5. `ProgressStore`: `borrowedBook`, `borrow(id)`, `giveBack()`; test `app/test/rules/sach_test.dart` (app).
- [x] 6. Thoại thủ thư trong `dialogs.ts` + ghép `main.ts` (chọn "Mượn sách" → `openLibrary`; "Trả sách" → trả);
      thêm `'thu-thu'` vào `NPC_IDS` (zones + ghép · test `dialogs.test.ts`).

**Đợt B — chờ thiết kế** (phiếu `docs/phieu_thiet_ke/2026-11-13-muon-sach.md` — đã đẩy lên `main` 3ce589b)
- [x] 7. Màn danh mục sách — áp 2026-11-13.28 (`app/lib/lesson/library_screen.dart`, `book_cover.dart`).
- [x] 8. Màn đọc sổ từ — áp 2026-11-13.28 (`app/lib/lesson/book_screen.dart`).
- [x] 9. Thẻ "Đọc sách" — áp 2026-11-13.28 (`web/src/ui/readBookButton.ts`).

**Đợt C — tài nguyên + cảnh**
- [ ] 10. (đang: hồ sơ `docs/tham_khao/thu-thu.md` + phiếu `2026-11-13-anh-thu-thu.md` đã đẩy — chờ bộ ảnh) `/tai-nguyen thu-thu` (một bước): khảo cứu thủ thư Tàng Thư Các → phiếu ảnh 4 góc cho `/ui-design` → bạn
      chạy Gemini → Hunyuan3D → `design/models/thu-thu.glb`; đo dáng → `NPC_RIGS`.
- [ ] 11. `/canh`: đặt thủ thư + quầy sách tầng 1 trong `scene.json` (`npcs`), kiểm `scene:check`, chụp duyệt.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart

## Ghi chú khi làm (2026-11-13)
- Mỗi cuốn HSK 1 / HSK 2 có 152 trang: bảng gốc gộp 哪（哪儿）, 那（那儿）…, sổ tách riêng cho dễ học — luật ghi "khoảng".
- Sổ từ viết GIẢN THỂ (chuẩn thi HSK), khác phần còn lại của app (phồn thể).
- Thủ thư tên Điển Thư 典書 (`zones/library.ts`); ghép ở `web/src/libraryDesk.ts` (main.ts đã > 400 dòng).
- `npm run build` chạy xong sau khi phiên cầu thang sửa xong (font chữ Hán cắt lại có thêm ~350 chữ HSK 1–2).
