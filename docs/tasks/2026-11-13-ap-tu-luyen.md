# Áp thiết kế 2026-11-13.19 — Tu luyện (nhập định, nút "Tu luyện", thẻ bộ thủ)
- Yêu cầu: `/ui-apply` — người dùng duyệt 2026-11-13 ("duyệt")
- Loại: giao diện · token · chuỗi · luồng/luật · cầu nối · Cỡ: vừa · Trạng thái: xong (chờ thử máy)

Nguồn: `design/docs/screen_specs.md` mục "Tu luyện", "Thẻ học bộ thủ"; `design/source/TuLuyen-*.dc.html`;
`design/tokens/design_tokens.json` (`aura-light`, `count-badge`); `design/l10n/vi.arb`. Phiếu: `2026-11-13-tu-luyen`,
`2026-11-13-chu-goi-y-hud` (+ thẻ bộ thủ — phiếu `2026-11-13-hanh-trinh-hud` mục 3).

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` + online — R-DIEU-7 (nhãn "Tu luyện" + chấm đếm), R-HANH-3 ("Xuất định" đứng dậy; vòng sáng + chữ).
- `docs/bridge.md`, `app/lib/scene/scene_event.dart`, `app/lib/scene/scene_view.dart`, `web/src/bridge/flutterBridge.ts` —
  `resume` thêm `{stand: true}` (thẻ đóng bằng "Xuất định").
- `app/lib/lesson/radical_screen.dart` — "Đã lĩnh hội" / "Xuất định" (pop `true`).
- `web/src/scene/nhapDinh.ts` (mới) — vòng sáng dưới đệm + chữ bộ sắp học trên đầu (timeline 0 → 0,3 → 1 s).
- `web/src/ui/actionButtons.ts`, `web/index.html`, `web/src/style.css` — nhãn "Tu luyện" / "Đang tu luyện", chấm đếm 22,
  aria; joystick "kéo để đứng dậy" khi ngồi; token CSS.
- `web/src/main.ts` — nối nhập định vào `meditate`, `resume` có `stand`, ẩn nhãn tên khi chữ hiện.

**Không đụng**: "người khác thấy", đốm linh tự (đợt 2); Chào khi ngồi (spec ghi "Chào thường" — giữ mờ như R-DIEU-7, báo lại).

## Nhiệm vụ
- [x] 1. Sổ R-DIEU-7, R-HANH-3 → online (Chờ) → `--mark-synced`.
- [x] 2. Cầu nối `resume {stand}`: bridge.md → Dart (`resumeScript(stand:)`) + test → JS.
- [x] 3. Thẻ bộ thủ Flutter: chữ nút, "Xuất định" trả `true` → `resume {stand: true}`; test widget.
- [x] 4. Nút ngồi "Tu luyện" + chấm đếm + "kéo để đứng dậy"; token `count-badge`, `aura-light` (CSS biến).
- [x] 5. Nhập định 3D (`scene/nhapDinh.ts`) + nối `meditate`; đứng dậy sớm → tắt 0,2 s.
- [x] 6. Kiểm: tsc, npm test, build, flutter analyze/test, rule_trace; chụp Rừng trúc khi ngồi (CDP); ghi `appliedVersion`.

## Kết quả
- Thử Chrome headless (CDP) ở `?vung=rung-truc`: nút "Tu luyện" chấm 50 → ngồi "Đang tu luyện", joystick "kéo để đứng dậy",
  chữ 竹 trên đầu (nhãn tên ẩn), thẻ mở. Vòng sáng dưới đệm nằm ngoài khung camera mặc định — xem trên máy.
- Test: `app/test/lesson/radical_screen_test.dart` (2), `app/test/scene/scene_event_test.dart` (`resumeScript(stand:)`).
- Thẻ mở ở 1,15 s (đặc tả: chữ tan 0,15 s rồi thẻ mở).
- Thấy khi thử (không do việc này): ô vuông vàng lơ lửng ở Rừng trúc + cảnh báo `THREE.Material: parameter 'map' undefined`
  có từ trước khi ngồi.
