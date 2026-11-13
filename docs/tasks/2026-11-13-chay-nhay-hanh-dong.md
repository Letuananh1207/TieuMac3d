# Chạy, nhảy, chào, ngồi thiền, động tác khi đứng lâu
- Yêu cầu: "Tốc độ di chuyển của nhân vật chậm và tôi muốn có nhiều hành động như chạy nhảy,..."
- Đã chọn (2026-11-13): đẩy joystick hết cỡ = chạy; thêm chào (拱手), ngồi thiền, động tác khi đứng lâu.
- Loại: thêm · Cỡ: lớn · Trạng thái: xong (nút trên điện thoại áp 2026-11-13.9 — chờ thử máy) — phần còn lại xong

## Nhiệm vụ
- [x] 1. Sổ quy tắc R-DIEU-5 (đi / chạy), R-DIEU-6 (nhảy), R-DIEU-7 (ngồi, chào), R-DIEU-8 (đứng lâu) → online → mark-synced.
- [x] 2. `player/character.ts`: `CharacterState` (mps, air, vy, sit, bow, idle) — tham số thêm của `animate`, nhân vật cũ bỏ qua.
- [x] 3. `player/controller.ts`: `speedFor` (3,2 / 7 m/s, chạy từ 85 %), chạm để đi chạy nếu > 6 m, nhảy (5,4 m/s, g 17),
      `jump()` `bow()` `toggleSit()`, đi thì đứng dậy / thôi chào, đếm giây đứng yên.
- [x] 4. `player/glbCharacter.ts`: dáng chạy, nhảy, ngồi thiền, chào 拱手, vươn vai / nhìn quanh (7 xương tự gắn).
- [x] 5. `input/keyboard.ts` + `main.ts`: Space / F / C, Shift = đi bộ; `orbitCamera` chuẩn hoá theo tốc độ đi bộ.
      Canvas 3D: `?dang=chay|nhay|ngoi|chao|vuon|nhin`.
- [x] 6. (áp thiết kế 2026-11-13.9 — `web/src/ui/actionButtons.ts`, `index.html`, `style.css`; R-DIEU-6/7 thêm ẩn / mờ, online) Nút Nhảy / Chào / Thiền trên điện thoại (`docs/phieu_thiet_ke/2026-11-13-nut-hanh-dong.md`).

## Kiểm
- Mô phỏng mã thật (esbuild): 15 ca theo ví dụ R-DIEU-5…8 đạt (nhảy cao 0,81 m / 0,63 s, chạy nhảy xa 4,4 m …).
- Chụp 6 dáng trước / sau trên Canvas 3D. `tsc` · `check.dart --changed` · build.
- Còn: dáng ngồi hơi gượng (xương tự gắn không có đầu gối); đệ tử khối / chibi chưa có dáng mới (chỉ nhân vật .glb).
