# V-20261118-106 — Đổi tên NPC cũ + xưng hô theo tuổi (phần code)

Nguồn đã duyệt (người dùng 2026-11-18): `docs/tham_khao/npc-kieu-moly.md` §3.2b, §3.4b, §4, §5.0, §7.

## Phạm vi
- Tên hiển thị (mã / model / vị trí giữ): Điển Thư → **Thư cô nương**, Trận sư → **La đại thúc**, Tú Tài → **A Chén**,
  Tài Nữ → **Vần cô nương**, Trúc Ông → **Măng bà bà** (nữ già), Tiểu Khất → **Tiểu Líu Lo** (bé đưa tin).
- Xưng hô theo tuổi cho thoại mọi NPC: Tiểu … (bé) xưng đệ / muội / tên mình, gọi "thiếu hiệp"; Lão …, … Ông, … bà bà,
  … đại thúc xưng lão / bà / ta, gọi "cháu"; A …, … cô nương, … Muội, … Nương xưng huynh / tỷ, gọi "em". Bỏ "đạo hữu",
  "lão phu", "bần đạo", "tiểu khất", "tiểu sinh", "tiểu nhân", "khách quan" trong lời NPC.
- Không đổi: cơ chế (cho 5 văn → tin của ngày, bán măng, Lưu Thương…), mã, model, chữ HUD người kể (nhãn "Lượt đạo hữu",
  thẻ điểm "Đạo hữu", tiêu đề bảng cách chơi) — là chuỗi thiết kế, ghi báo cáo cho phiên thiết kế.

## Nhiệm vụ
1. Sổ luật `docs/testing/quy_tac.md`: R-NPC-1…7, R-VA-5, R-GIAO-2, R-CO-3, R-DAU-1/2, R-LUU-1/2/4/5, R-MANG-5, R-TRA-1,
   R-TIEN-1/5/8, R-TUI-1 → đồng bộ online (`/dong-bo-quy-tac`).
2. Web: `zones/dialogs.ts`, `library.ts`, `libraryDesk.ts`, `trucLamThoai.ts`, `trucLao.ts`, `alms.ts`, `tinDon.ts`,
   `tranSu.ts`, `gioVN.ts`, `teaService.ts`, `gameGuides.ts`, `studyGuide.ts`, `tuiDo.ts`, `mangHud.ts`, `wallet.ts`,
   `walletRules.ts`, `games/luuThuong.ts`, `gamePlay.ts`, `haiMang.ts`, `townNpcs.ts`, `chat/npcChatter.ts`, xem thử HUD.
3. Flutter: `app/lib/journey/wallet.dart` (`almsLabel`), chú thích.
4. Test: sửa chuỗi; thêm `zones/xungHo.test.ts` chặn tái phạm (không "đạo hữu" / từ thô / tên cũ trong lời NPC).
5. `design/CHANGELOG.md` mục 2026-11-18.3; `design/scene/bai_tri/khoi-nguyen-tran.md` tên.
6. Kiểm: check.dart, tsc, npm test, build, flutter analyze / test, rule_trace.
