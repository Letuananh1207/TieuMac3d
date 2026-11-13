appliedVersion: 2026-11-11.10

2026-11-11.2: "Cần code" (không gấp — liễu mềm hơn, đảo nổi có cỏ / cây / đá, khe đoạn tường khu thành cổng trăng) chưa làm; để sau mốc 3 — docs/tasks/2026-11-11-phong-cach-trung-hoa.md.

2026-11-11.3: HUD C + thẻ tên khu (R-HUD-3) + màn tải (R-MAN-2) đã áp — docs/tasks/2026-11-11-hud-c.md. Chữ Hán: Noto Serif SC 700 cắt chữ lúc build (web/scripts/subset-han.mjs). Chờ thiết kế điền `site.han`, `site.areas[].han` vào scene.json (trường đã có, mặc định rỗng). Màn lỗi tải cảnh (Flutter) giữ nền tối cũ — chưa có thiết kế.
2026-11-11.4: nút học nổi đúng kiểu mục "Trong nhà" (thêm bóng ngọc, cỡ ngang 44 / padding 0 18 0 14); phần còn lại đã có từ b3c4cf3.
2026-11-11.5 – .9: cảnh 3D — phiên VS Code làm thay phiên thiết kế, code + đặc tả cùng lúc (B6a, B6b, núi xa, cổng bắc; R-VA-1 đã sửa sổ + online).
2026-11-11.10: màn bài học Flutter (`app/lib/lesson/lesson_screen.dart`), nối cầu nối `onOpenLesson` ở `main.dart`; font Flutter đóng gói (`web/scripts/fonts-app.mjs` → `app/assets/fonts/`, `app/lib/theme/app_fonts.g.dart`). Bóng `shadow.primary` không có phần inset (Flutter không có bóng trong) — chỉ bóng ngoài.
2026-11-13.9 (một phần): **Bản đồ truyền tống** đã áp — cuộn 3D `web/src/scene/banDo.ts`, dữ liệu `web/src/zones/journeyMap.ts` (đọc `design/scene/ban-do/`), HUD `web/src/ui/mapHud.ts`, nút quay lại qua cầu nối `back`; R-HANH-2 viết lại + online. **Nút hành động** (`web/src/ui/actionButtons.ts`) và **hội thoại NPC** (`web/src/ui/dialogBox.ts`, chân dung `design/models/anh/<mã>-chan-dung.png`) cũng đã áp. Chưa áp: thẻ học bộ thủ (đợt 2 hành trình) — `appliedVersion` giữ nguyên tới khi áp hết mục.
