# Bỏ chạm-để-đi + hội thoại với NPC
- Yêu cầu: "Tôi muốn vô hiệu hóa việc click vào chỗ khác để di chuyển đến, ngoài ra tôi muốn khi lại gần npc sẽ có các
  lựa chọn giống thoại ở các game"
- Đã chọn (2026-11-13): hiện nút "Nói chuyện" khi lại gần; nội dung chào hỏi / trò chuyện.
- Loại: sửa hành vi + thêm · Cỡ: vừa · Trạng thái: chờ thiết kế (khung thoại) — phần còn lại xong

## Nhiệm vụ
- [x] 1. R-DIEU-2 đổi: chạm mặt sân không đi; chạm vật học trong nhà vẫn mở bài (R-VUNG-2). Bỏ "chạm để đi" ở R-DIEU-3,
      R-DIEU-5, R-DIEU-7. Sổ + online + mark-synced. `main.ts`: bỏ `player.moveTarget = picker.pick(…)`.
- [x] 2. R-NPC-2 (App: sửa — chờ thiết kế). Sổ + online + mark-synced.
- [x] 3. `zones/dialogs.ts`: dữ liệu hội thoại Tiểu Mặc, `checkDialog`, `DialogRunner`; `player/npc.ts`: `NPC_TALK_DIST`,
      `npcInTalkRange`, `Npc.id`. Mô phỏng 7 ca đạt.
- [ ] 4. Giao diện: nút "Nói chuyện" + khung thoại — chờ thiết kế (`docs/phieu_thiet_ke/2026-11-13-hoi-thoai-npc.md`);
      khi có: dựng ở `web/src/ui/`, nối ở `main.ts` (đang thoại → `paused`-như, NPC nhìn người chơi), R-NPC-2 → ok.

## Còn
- `PlayerController.moveTarget` / `GroundPicker.pick` không còn ai dùng — để lại (gỡ khi chắc không cần lại chạm-để-đi).
