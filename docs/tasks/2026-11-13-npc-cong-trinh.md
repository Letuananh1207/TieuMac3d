# NPC cho các công trình (tiểu nhị, quản sự, trận sư)
- Yêu cầu: "Lên kế hoạch npc tiểu nhị và npc cho các công trình khác như khu vui chơi" → chọn: **Tiểu nhị trà lâu**
  (gọi trà mang tới bàn), **Quản sự Kỳ Văn Uyển**, **Người coi rạp phim**, **Trận sư Truyền Tống Đài**
- Loại: thêm (tài nguyên + dữ liệu + hành vi) · Cỡ: lớn · Trạng thái: đợt 1 code xong — chờ thiết kế ảnh + tài nguyên (2026-11-13)
- Duyệt 2026-11-13: **bỏ "Người coi rạp"** (rạp phim đã xoá, thiết kế .30) — còn 3 NPC; làm **đợt 1 trước**, đợt 2 sau.

## Ràng buộc chính
- **Ngân sách**: mỗi NPC hiện tại 16k tam giác (Tiểu Mặc, Mặc Ông). Thêm 3 NPC + thủ thư (phiên khác) = 6 NPC —
  vượt xa trần 150k cùng cảnh. Cách giải: (a) model NPC mới **8k tam giác** (`smooth.py --tam-giac 8000`), (b) **ẩn NPC
  ở xa > 35 m** (mỗi khu cách nhau ≥ 40 m → cùng lúc thấy ≤ 2–3 NPC), (c) đo ngân sách **trong app** (Canvas 3D không nạp
  NPC). Ghi vào R-NPC-1.
- **Tài nguyên**: model AI qua `/tai-nguyen` — cần bộ ảnh 4 góc từ `/ui-design` (Gemini) rồi Hunyuan3D chạy trên máy
  người dùng → việc của người dùng, phiên code chờ file `design/models/<mã>.glb`.

## Đợt 1 — NPC đứng + hội thoại (R-NPC-1/2 như cũ)
| Mã | Tên | Đứng ở | Hội thoại (R-NPC-2) |
|---|---|---|---|
| `tieu-nhi` | Tiểu nhị 小二 | sau quầy trà tầng 1 Phẩm Minh Các | chào khách, giới thiệu trà, "lên lầu ngồi, tiểu nhân mang trà lên" |
| `quan-su` | Quản sự Kỳ Văn Uyển | cạnh lối vào sân chơi (−39; 1) | luật Ngũ Tử Kỳ, Đấu chữ (ôn bộ đã học), ghế đối diện để dành |
| `tran-su` | Trận sư 陣師 | chân bậc tây Truyền Tống Đài (−8,2; 2) | các vùng hành trình, mở vùng theo số chữ đã học (đọc tiến độ) |

- [x] 1. Phiếu ảnh 4 góc cho 3 NPC: `docs/phieu_thiet_ke/2026-11-13-anh-{tieu-nhi,quan-su,tran-su}.md` → **chờ thiết kế** (`/ui-design`).
- [ ] 2. `/tai-nguyen` mỗi NPC → `design/models/<mã>.glb` 8k tam giác → **chờ tài nguyên** (máy người dùng).
- [x] 3. Sổ: R-NPC-1 thêm "ẩn khi cách nhân vật từ 35 m"; R-NPC-3 tiểu nhị, R-NPC-4 quản sự, R-NPC-5 trận sư (đọc tiến độ — khác Mặc Ông) → online → mark-synced.
- [x] 4. Code: `NPC_IDS` thêm 3 mã; `showNearNpcs` (`player/npc.ts`) ẩn từ 35 m; thoại 3 NPC (`zones/dialogs.ts`); trận sư đọc tiến độ `zones/tranSu.ts` (`action: 'journey'`); test `dialogs.test.ts`, `tranSu.test.ts`, `player/npcVisibility.test.ts`.
- [ ] 5. `/canh`: đặt 3 NPC trong `scene.json`; đo ngân sách trong app (build + thiết bị).
(Bước 3–4 làm được trước khi có model — thiếu model thì NPC bị bỏ qua như R-NPC-1.)

## Đợt 2 — Tiểu nhị mang trà tới bàn (luật mới, lớn)
- Luật mới **R-TRA-1**: ngồi vào một chỗ ở trà lâu (R-NGOI-1) → sau ≈ 2 s tiểu nhị rời quầy, **đi** theo lối định sẵn
  (quầy → cầu thang → bàn), đứng cạnh bàn rót trà ≈ 2 s (chén trà hiện trên bàn), rồi về quầy. Đứng dậy trước khi tới →
  tiểu nhị quay về. Mỗi lúc phục vụ một bàn. Chén trà mất khi người rời bàn. **Ngoại lệ R-NPC-1** (NPC này đi lại).
- Cần: dáng đi cho NPC (dùng `player/autoRig.ts` như nhân vật chính), lối đi = các điểm mốc trong `traLauLayout`
  (cùng chỗ cầu thang), vật cản NPC tạm bỏ khi đi (không kẹt người chơi).
- Sau này nhiều người chơi: ai thấy tiểu nhị đi → để đợt nhiều người chơi.
- [ ] 6. Sổ R-TRA-1 → online → mark-synced; test đỏ (máy trạng thái tiểu nhị: chờ → đi tới → rót → về).
- [ ] 7. `player/npcWalker.ts` (đi theo điểm mốc + dáng đi), điểm mốc trà lâu, chén trà.
- [ ] 8. Ghép `main.ts`; thử trên máy.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · dart tool/rule_trace.dart
