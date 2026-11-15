# V-65 — Bỏ vòng trận ở các vùng (chỉ giữ Truyền Tống Đài)

Yêu cầu (người dùng 2026-11-15): "tôi muốn xóa truyền tống trận ở các map ngoại từ khởi nguyên trấn". Đã chọn: xoá
ngay ở 6 vùng (Trúc Lâm, Yên Vũ Lâu, Bồng Lai Đảo, Nhạn Môn Quan, Tử Cấm Thành, Đôn Hoàng Lộ); giữ Truyền Tống Đài;
từ vùng tạm chỉ đi bằng cổng đi bộ (V-64 sau này mở bản đồ từ mọi nơi). Chỗ vòng cũ → sân đá trống, phẳng (bãi hạc đáp).

## Việc

1. Luật: R-HANH-2, R-HANH-4, R-HANH-5, R-BANDO-2, R-BANDO-5, R-MAN-2 (ví dụ) — vòng trận chỉ còn ở Truyền Tống Đài;
   ví dụ "phía tây vòng trận" / "sau vòng trận" viết lại bằng mốc khác.
2. Đặc tả: trường mới `stoneYard` (sân đá trống: `enabled`, `center`, `radius`, `colors.floor/rim`; mặc định tắt — cảnh
   cũ không đổi). 6 vùng: `teleport.enabled` false, `stoneYard` ở tâm vòng cũ, bán kính 4,7 m (= bệ cũ `ringRadius + 0,7`).
3. Code: `truyenTong.ts` `addStoneYard` (đĩa + viền, tĩnh → gộp), `world.ts` dựng; `specCheck` kiểm sân phẳng / cỡ;
   `check-scene.mjs` in sân; chú giải bản đồ lớn chỉ hiện loại biểu tượng có trên bản đồ (vùng / nhà không còn "Vòng trận").
   Lời Mặc Ông "Lúc muốn về, cứ vào vòng trận ở vùng đó" → về bằng cổng đi bộ.
4. Test: vùng không vòng trận + có sân đá, trấn vẫn có; bản đồ vùng không có icon `vong-tran`.
5. Kiểm: scene:check, tsc, npm test, build, check.dart, rule_trace; ảnh trước / sau; Canvas 3D.

Không đụng `trees` (V-63 đang sửa).
