# Biển trong cảnh bằng chữ Việt + bỏ tường trước Tàng Thư Các
- Yêu cầu: "Tất cả các biển đều phải là tiếng việt và là tên đọc dễ hiểu" · "Tường ở phía trước tàng thư các" — người dùng
  chọn: **tên công năng**, **mọi biển trong cảnh**, **bỏ hẳn** tường z −11.
- Loại: sửa ngoại hình + dữ liệu cảnh · Cỡ: vừa · Trạng thái: xong

## Phạm vi
**Sẽ sửa**
- `design/scene/scene.json` (vai `/canh`, người dùng nhờ) — chữ mọi biển; xoá đoạn tường z −11.
- `web/src/scene/kien_truc/tuong.ts` — bề rộng biển cổng theo chữ Latin (hiện tính theo ô vuông chữ Hán → biển chữ Việt
  bị bóp hẹp).
- `web/src/scene/specCheck.ts` — biển cổng tối đa 4 chữ → tối đa 20 ký tự.
- `web/src/scene/spec.ts` — chú thích `gameTables[].sign.han` ("dòng trên", không bắt buộc chữ Hán).
- `docs/testing/quy_tac.md` (+ online, `--mark-synced`) — R-VA-1 (bỏ ví dụ tường chia sân), R-GIAO-1 (bỏ "tường thấp
  z −11"), R-GIAO-2 (chữ biển trò chơi), R-NV-1 (tên bảng).
- `web/src/scene/walls.test.ts` — bỏ ca tường chia sân khỏi `world()` (giữ ca cổng trên đoạn tường bằng đoạn giả).

**Cần kiểm tra** — `drawBanner` (cờ dọc: "Trà" 3 chữ cái trên cờ hẹp), `drawBoard` (tiêu đề bảng dài hơn), biển tên nhà
`addSign` (2,8 × 0,9 m — co chữ theo `maxWidth`).

**Không đụng** — HUD (nút "Xem bảng", bảng nhiệm vụ trên web vẫn ghi 日課榜 — giao diện 2D do `/ui-design` quyết);
phù hiệu 文淵 trên mặt Truyền Tống Đài (hoa văn khắc trên đài, không phải biển); chú thích trong code.

## Chữ mới
| Biển | Cũ | Mới |
|---|---|---|
| cổng nam — mặt ngoài / trong | 外門 / 山門 | Quảng trường / Lối ra núi |
| cổng bắc — mặt trong / ngoài | 天階 / 外門 | Bậc lên Trà lâu / Quảng trường |
| cổng đông — mặt trong / ngoài | 傳送台 / 外門 | Đài truyền tống / Quảng trường |
| cổng tây — mặt trong / ngoài | 棋文苑 / 外門 | Sân chơi · Thư viện / Quảng trường |
| nhà Phẩm Minh Các | 品茗閣 | Trà lâu |
| nhà Tàng Thư Các | 藏書閣 | Thư viện |
| cờ trà lâu | 茶 | Trà |
| bảng nhiệm vụ | 日課榜 | Nhiệm vụ hằng ngày |
| biển bàn cờ (dòng trên / dưới) | 五子棋 / Ngũ Tử Kỳ | Cờ caro / Năm quân liền hàng là thắng |
| biển bàn Đấu chữ | 鬥字 / Đấu chữ | Đấu chữ / Chọn đúng nghĩa bộ thủ |

(Cổng tây: tường chia sân bỏ nên một biển chỉ cả hai sân.)

## Nhiệm vụ
- [x] 1. Sổ quy tắc R-VA-1, R-GIAO-1, R-GIAO-2, R-NV-1 → người dùng chép online → `--mark-synced`.
- [x] 2. `specCheck.ts` + `spec.ts`: giới hạn chữ biển cổng; chú thích. (scene · tsc)
- [x] 3. `tuong.ts`: bề rộng biển theo loại chữ (Hán ≈ 1 em, Latin ≈ 0,55 em), vẫn kẹp trong lối cổng. (scene)
- [x] 4. `walls.test.ts`: cập nhật theo bỏ tường chia sân. (test)
- [x] 5. `scene.json`: chữ mới + xoá đoạn z −11 → `scene:check` → Canvas 3D + ảnh (cờ, bảng, biển trò chơi, cổng).
- [x] 6. Kiểm tra cuối + `npm run build` (PowerShell).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart

## Ghi chú khi làm
- Biển trò chơi: **một dòng** tên Việt ("Cờ caro", "Đấu chữ"), bỏ câu gợi ý dòng dưới — dòng dưới (`name`) cũng là nhãn
  nút HUD "Cách chơi", để câu gợi ý ở đó thì nút ghi sai. `han` rỗng → `gameSign` vẽ một dòng; `specCheck` chỉ còn đòi `name`.
- Cờ dọc chữ Việt nhiều chữ cái: viết hoa, xếp dọc ("T / R / À") — `drawBanner`.
- Kiểm chữ Hán trong `textEm` bằng mã số, không viết dải chữ Hán dạng mã thoát backslash-u trong regex (công cụ cắt font quét mã nguồn coi là chữ cần nạp).
- Canvas 3D bản 36. tsc sạch · 141 test xanh · build + chép app xong. Luật R-VA-1, R-NV-1, R-GIAO-1, R-GIAO-2 chờ chép online.
