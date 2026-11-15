# NPC gảy đàn cổ tranh ở Quảng Trường
- Yêu cầu: "ở trong chỗ nào đó của quảng trường thêm 1 npc gảy đàn cổ tranh"
- Việc: V-20261115-61 · nhánh `viec/dan-tranh`
- Loại: thêm (NPC không tương tác, vật cảnh, âm thanh) · Cỡ: vừa · Trạng thái: xong phần code (trước model) — phần người
  chờ thiết kế: phiếu ảnh `2026-11-15-anh-cam-nu` → `/tai-nguyen nhan-vat cam-nu`
- Người dùng đã chọn: nhân vật **chờ model Hunyuan riêng** (không khối tạm trong app); chỗ **bục nhỏ cạnh mép Quảng
  Trường** (không chắn lối / khe cổng / đồng hồ, giữa để thoáng); **có tiếng, to dần khi lại gần** (~15 m, đoạn nhạc lặp,
  offline); **không tương tác**.
- Tên: **Cầm Nương** (mã `cam-nu`) — chỉ tiếng Việt (R-HUD-4); không nói chuyện nên tên không hiện trong game.

## Phạm vi
**Sẽ sửa** (mới):
- `web/src/scene/bucDan.ts` — số đo bục / đàn, chỗ nhạc công ngồi (`bucDanSeat`), thuần.
- `web/src/scene/vat_dan_tranh.ts` — dựng bục gỗ viền son + bồ đoàn + bình phong ba tấm + đàn cổ tranh 21 dây (thân gỗ mặt
  cong đùn, nhạc sơn hai đầu, dây tơ tấm mảnh, 21 nhạn đàn xếp chéo, giá thấp). Lambert tĩnh → cảnh mềm gộp chung.
- `web/src/zones/danTranh.ts` — bản nhạc ngũ cung Rê tự soạn (30 s, có vuốt dây), đài phát theo đồng hồ, âm lượng theo
  khoảng cách, mượt 1 s, tay gảy (thuần, vitest).
- `web/src/ui/zitherSound.ts` — tiếng dây gảy tự tổng hợp (Karplus–Strong, `pluckSamples` thuần có test) + Web Audio
  (gain chung, lệch tai); mở tiếng ở lần chạm đầu như `moSound.ts`.
- `web/src/danTranh.ts` — file ghép: nạp model `cam-nu` (thiếu → `null`, không người không tiếng), ngồi + gảy, ẩn từ
  35 m, tiếng theo khoảng cách; `main.ts` thêm vài dòng; Canvas 3D `?dang=dan-tranh` dùng model thế `nhan-vat.glb`.
- Test: `zones/danTranh.test.ts`, `scene/bucDan.test.ts`, `danTranh.test.ts`.
- Phiếu ảnh `docs/phieu_thiet_ke/2026-11-15-anh-cam-nu.md`.

**Sẽ sửa** (có sẵn):
- `web/src/scene/spec.ts`: `PROP_KINDS` + `'buc-dan'` (cảnh cũ không có prop này → không đổi, quy tắc 8); `NPC_IDS` + `'cam-nu'`.
- `web/src/scene/props.ts`: gọi `danTranhProp` trong chuỗi mặc định.
- `web/src/player/character.ts` + `glbCharacter.ts`: `CharacterState.pluck?` — hai tay đưa ra trước trên dây, tay phải nhấc
  theo nốt (nhân vật người chơi bỏ qua).
- `design/scene/scene.json`: một prop `{ "kind": "buc-dan", "x": 8.5, "z": 14.3, "rotY": 180 }` (vai `/canh`, theo yêu cầu).
- `docs/testing/quy_tac.md`: R-NPC-9, R-AM-2 (mới, chờ). `.claude/skills/lead/SKILL.md`: một dòng bản đồ tính năng.

**Không đụng**: `PlayerController`, `npcs` của đặc tả (nhạc công không ở đó → không nút "Nói chuyện", không bong bóng
kênh — R-NPC-2, R-CHAT-3 không áp), cây (V-60 đang sửa cây trấn), `reference/`, `app/` (chỉ nhận bản build).

## Chỗ đặt bục: (8,5; 14,3), `rotY` 180 — góc đông nam, mép nam Quảng Trường
Quảng Trường x −17 … 17, z −17 … 17. Bục 3,4 × 2,6 m chiếm x 6,8 … 10,2, z 13 … 15,6; nhạc công ngồi (8,5; 14,85) nhìn bắc.
| Thứ | Khoảng cách | Vì sao chọn |
|---|---|---|
| lòng cổng nam (x −4,8 … 4,8, z 17) | mép bục cách 2 m | không chắn lối chính Cổng Trấn ↔ Quảng Trường |
| lan can nam z 17 | 1,4 m | sát mép như sân diễn dựa lưng tường, vẫn có lối sau bục |
| khoảng giữa (\|x\|, \|z\| < 6) | ngoài | giữa quảng trường để trống |
| nhật quỹ (10,5; −10,5) | góc đối diện (24 m) | không đụng chỗ đồng hồ |
| tùng (12,5; 13) | 2,3 m tới mép bục | cây che nhẹ phía đông, nhạc công ngồi dưới tán — đẹp, không chặn |
| khe cổng đông (x 17, z −12 … 12) / tây (x −17, z −10 … 10) | xa | không chắn khe cổng sang Kỳ Văn Uyển / đường đông |
| đường vòng Lão Canh (bản thử, đoạn (8; 8) → (2,5; 14)) | ≥ 3 m | không vướng NPC đi |
Góc tây nam đối xứng (−8,5; 14,3) bị loại: đường Lão Canh (−2,5; 18) → (−8; 10) cắt qua.

## Thiết kế kỹ thuật
- **Bục + đàn là vật cảnh** (prop `buc-dan`, va chạm cả bục): luôn có, kể cả khi chưa có model.
- **Người + tiếng chỉ khi có `design/models/cam-nu.glb`** (`npcModelUrl`). Nhạc công dựng bằng `loadGlbCharacter` (hợp
  đồng `Character`, xương tự gắn), `sit: 1` (ngồi xếp bằng có sẵn) + `pluck` (mới). Không qua `PlayerController`.
- **Tiếng**: không file — tổng hợp Karplus–Strong (nhiễu → vòng trễ một chu kỳ → trung bình hai mẫu → tắt dần), mỗi cao độ
  dựng một `AudioBuffer` lần đầu cần rồi giữ (≤ 12 cao độ × 2,2 s). Vì sao không tải file CC0: khỏi lo giấy phép, file
  nặng; tiếng dây gảy tổng hợp gần giống cổ tranh. Nốt theo đồng hồ thật (vòng 30 s) như R-NHAC-1. Âm lượng ≤ 3 m đầy →
  15 m tắt, mượt 1 s; màn che / màn tải / đổi cảnh → 0; nền / tab ẩn → `suspend`. Ban đêm vẫn đàn. Không có nút tắt
  tiếng trong app (như R-NHAC-1, R-AM-1).
- **Ngân sách** (Canvas 3D `?view=tren`, cả trấn): trước 143 draw call · 148 275 tam giác → sau 143 · 148 793 (+518 tam
  giác, 0 draw call — gộp vào khối mềm). Trần 150 / 150 000. Khi có model `cam-nu` (+1 draw call, +tam giác model) ở góc
  nhìn cả trấn sẽ sát / vượt 150k → **model nên ≤ 5 000 tam giác** (ngồi, ít lộ chân), hoặc ẩn sớm hơn 35 m.

## Nhiệm vụ
- [x] NV1 Luật R-NPC-9, R-AM-2 (chờ) — phiên chính đồng bộ online.
- [x] NV2 Phiếu ảnh 4 góc `2026-11-15-anh-cam-nu`; `cam-nu` vào `NPC_IDS`.
- [x] NV3 Bục + đàn (prop `buc-dan`), đặt vào `scene.json`; `scene:check` không lỗi.
- [x] NV4 Tiếng đàn (thuần + Web Audio), file ghép `danTranh.ts`, `main.ts`, Canvas 3D `?dang=dan-tranh`.
- [x] NV5 Test + build + bench trước / sau + ảnh Canvas 3D.
- [ ] NV6 (sau khi có model) `/tai-nguyen nhan-vat cam-nu` → chỉnh `DAN_SEAT_Z` / góc tay cho tay chạm dây, đo ngân sách
  lại, chụp, đổi App của R-NPC-9 / R-AM-2 sang `ok`.
