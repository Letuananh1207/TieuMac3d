# Trúc Lâm — 3 mini game (V-20261115-66 B4): Lưu Thương Lệnh · Hái măng sau mưa · Đàn cầm bãi giữa
- Yêu cầu: "B4 mini game Trúc Lâm — người dùng chọn làm cả 3 trò: (1) Lưu Thương Lệnh ở Khúc Thuỷ Đài — ngồi đệm cỏ, chén
  trôi theo mương, dừng trước ai thì người đó ghép bộ thủ thành chữ Hán, chơi với 2–4 NPC văn nhân; (2) Hái măng sau mưa —
  trò thuần chơi hằng ngày, măng mọc ngẫu nhiên trong rừng trúc (theo giờ thật / sau mưa), nhặt → đổi Văn tiền / đồ trang trí;
  (3) Đàn cầm ở bãi giữa — ngồi tảng đá, đánh đàn theo nốt ngũ cung, thư giãn; nhịp rơi nốt đơn giản hoặc tự do."
- Loại: thêm (3 trò + dữ liệu + cầu nối) · Cỡ: **lớn** (≈ 3 kế hoạch vừa gộp; làm theo 3 đợt, mỗi trò một nhánh được) ·
  Trạng thái: **đã duyệt 2026-11-15** (người dùng chọn đề xuất cả 4 điểm: 1A chọn 1 bộ thủ trong 4, 2B hai lứa + mưa phùn, 3A bán Trúc Ông không tính trần, 4A tự do + theo bài) (4 điểm cần quyết định bên dưới; HUD cả 3 trò **chờ thiết kế** — phiếu
  `docs/phieu_thiet_ke/2026-11-15-truc-lam-mini-game.md`)
- Lộ trình mẹ: `docs/tasks/2026-11-15-lam-lai-vung.md` (B4). Cảnh đã có (CHANGELOG 2026-11-15.41, .44): Khúc Thuỷ Đài (21; −32,5)
  mương chữ S 18 m, 3 chén trôi (`channels[0].cups`), 8 đệm cỏ (`seats`, loại `dem`); Trúc Lư (−35; 24,5) nhà tranh + sân đất + rào
  trúc; 283 khóm trúc (`trees.groves`); tảng đá đàn cầm (−7,5; −4,5) (`props` `dan-cam`); Vọng Trúc Đình trên gò.

## Vòng chơi (kiểu 摩尔庄园 — trò nhỏ gắn chỗ, có thưởng, nhịp ngày)

```
vào Trúc Lâm ─► Ngồi ôn "Học bộ mới" (R-HANH-3) ─► Khúc Thuỷ Đài: Lưu Thương dùng ngay bộ vừa học (+Văn, trần trò chơi)
      │                                                     
      ├─► dọc lối / rừng trúc thưa: hái măng của ngày (lứa sáng + lứa sau mưa chiều) ─► Trúc Lư bán cho Trúc Ông (+Văn)
      │                                                          └─► Tạp hoá trấn mua đồ trang trí theo cái (V-69) ─► Nhà của ta
      └─► bãi giữa: ngồi đá đàn cầm — tự do thư giãn, hoặc theo nốt một bài (+ít Văn)
```
Ba trò ba nhịp: **học** (Lưu Thương, 3–4 phút / ván) · **lượm mỗi ngày** (măng, 2–5 phút, hết lứa thì thôi) · **thư giãn** (đàn,
không áp lực). Không trò nào chặn trò nào; không cần mạng, chỉ chơi với NPC (chưa multiplayer). Cảnh là **của chung** (R-VUNG-1):
vị trí măng, chén lệnh, tiếng đàn tính sao cho sau này nhiều người cùng thấy — phần **của riêng** (măng đã hái, điểm, tiền) lưu
trên máy.

---

## 1. Phạm vi (impact.dart `gamePlay charDuel danTranh zitherSound walletRules channels vat_truc` + grep)

### Hệ dùng lại — đang có gì / thiếu gì

| Hệ | Đang có | Thiếu cho B4 |
|---|---|---|
| Trò với NPC — `web/src/games/` (`charDuel.ts`, `duelRound.ts`, `gomoku.ts`), ghép `gamePlay.ts` | luật thuần + vitest; câu hỏi từ bộ đã học, NPC đúng ~70 % (`npcPick`), vòng thời gian `hoi → nghi → cham → het`; `GameView` + `ui/gameHud.ts` (thẻ điểm, viên lượt, thẻ kết quả, Rời bàn) | trò **nhiều người** (4 chỗ, lượt do chén quyết), câu **ghép chữ** (chưa có dữ liệu chữ = bộ thủ + phần còn lại), ngồi **đệm** thay ghế bàn chơi |
| Bộ thủ — `zones/radicals.ts` (50 bộ, mỗi bộ 3 `examples` han/pinyin/meaning) | đủ chữ ví dụ phồn thể | **không có** phần còn lại (可 của 河), âm Hán Việt của chữ ví dụ, kiểu ghép (trái-phải / trên-dưới / bao) → dữ liệu mới `games/ghepChu.ts` |
| Ngồi — `zones/seats.ts`, `scene/daiDa.ts` (`seats` loại `dem` / `da`), R-NGOI-1, `ngoiMat.ts` | 8 đệm Khúc Thuỷ ngồi được, góc nhìn từ mắt | đệm đang chơi (khoá chỗ NPC), chỗ ngồi trên **đá đàn cầm** (đá hiện chỉ là vật cản) |
| Chén trôi — `scene/channels.ts` `addChannels` | 3 chén InstancedMesh trôi đều theo `CatmullRomCurve3`, đồng hồ riêng | **chén lệnh** do luật điều khiển (vị trí t, dừng ở điểm trước một đệm); xuất đường cong + "điểm dừng" theo đệm |
| Văn tiền — `zones/walletRules.ts` ↔ `app/lib/journey/wallet.dart`, cầu nối `earnGame`, R-TIEN-3 trần **60 / ngày** chung mọi trò | bảng thưởng `dau-chu`, `co`; hiệu ứng xu + nhãn (R-TIEN-5); ví thử (R-TIEN-7) | mã trò mới `luu-thuong`, `dan-cam`; khoản "Bán măng" (như "Bán nông sản" R-VUON-7) |
| Vườn / kho — `zones/vuon.ts` ↔ `garden.dart`, `getGarden` / `gardenAct`, lưu `progress_store.dart` | mẫu "luật Dart gốc + chép TS + ví thử + trần bán / ngày giờ VN" | kho **lâm sản** (măng), lứa măng theo ngày, cầu nối `getMang` / `mangAct` |
| Túi đồ — `zones/tuiDo.ts`, `ui/bagPanel.ts`, R-TUI-1 | 4 ngăn chỉ xem | ngăn **Lâm sản** (măng thường / măng to) — giao diện chờ thiết kế |
| Tiếng đàn — `ui/zitherSound.ts` (Karplus–Strong, `pluck(midi, vel)`, âm lượng + lệch tai), `zones/danTranh.ts` (ngũ cung Rê, `midiHz`, `danVolume`) | tự tổng hợp, offline, có test `pluckSamples` | **âm sắc cổ cầm** (thấp, ngân dài, ít sáng) — thêm tham số; tiếng nước / rắc măng / mưa (nhiễu lọc tự tổng hợp) |
| NPC — `player/npc.ts`, `npcs` trong đặc tả, `NPC_IDS`, R-NPC-1…9 | model `.glb` theo mã; **thiếu model → bỏ NPC**; dáng `ngoi` (R-NPC-6); khối `player/discipleCharacter.ts` (đổi màu áo) | 4 mã mới (`thi-ong`, `tu-tai`, `tai-nu`, `truc-ong`); **thế bằng khối** khi chưa có model (NPC trò chơi không được biến mất) |
| Giờ / ngày — `zones/gioVN.ts`, `scene/ngayDem.ts` (giờ VN, `?gio=` `?toc=`), R-NGAY-5 "ngày đêm không đổi luật trừ khi có luật riêng" | giờ VN, ngày VN (`vnDay` Dart) | lứa măng theo giờ VN (luật riêng), **mưa phùn** (chưa có hệ thời tiết nào) |
| Bảng cách chơi — `zones/gameGuides.ts`, `ui/guideButton.ts`, R-GIAO-2 | biển + nút "Cách chơi" + bảng | nội dung 3 trò; chỗ đặt nút (đá khắc "Khúc Thuỷ Đài" đã có, đá đàn cầm, Trúc Lư) |
| Thanh công cụ — `zones/thanhCongCu.ts`, R-THANH-1 | ẩn khi ngồi bàn chơi | ẩn khi đang chơi 3 trò mới (như bàn chơi) |

### Sẽ sửa
- `docs/testing/quy_tac.md` — luật mới R-LUU-1…5, R-MANG-1…5, R-CAM-1…4, R-AM-3; sửa R-TIEN-1/3/5/7, R-TUI-1, R-NGOI-1, R-NPC-1, R-GIAO-2 → `/dong-bo-quy-tac`.
- `docs/bridge.md` — `earnGame.game` thêm `luu-thuong`, `dan-cam`; sự kiện mới `getMang`, `mangAct`.
- `design/scene/rung-truc.json` (vai thiết kế — `/canh`, không sửa trong phiên code) — khoá mới `miniGames`, NPC, chỗ ngồi đá đàn.
- `web/src/scene/spec.ts` (+ `loadSpec.ts`) — `MiniGameSpec`, mặc định `[]` (cảnh cũ giữ nguyên); `NPC_IDS` + 4 mã.
- `web/scripts/check-scene.mjs` — kiểm `miniGames` (đệm tồn tại, mương tồn tại, vùng măng trong `bounds`, chỗ đàn cạnh đá).
- `web/src/games/ghepChu.ts` (mới, dữ liệu) · `games/luuThuong.ts` + `games/luuThuongRound.ts` (mới, luật) · `games/danCam.ts` (mới, chấm nhịp + bài) — kèm `*.test.ts`.
- `web/src/zones/mang.ts` (mới — chép luật `mang.dart`) + test · `zones/walletRules.ts` (mã trò, bán măng thử) · `zones/tuiDo.ts` (ngăn Lâm sản) · `zones/gameGuides.ts` (3 bảng) · `zones/danTranh.ts` (tách bảng ngũ cung dùng chung).
- `web/src/scene/channels.ts` — xuất đường cong + chén lệnh điều khiển được · `scene/mangLam.ts` (mới, măng InstancedMesh) · `scene/muaPhun.ts` (mới, mưa 1 draw call) · `scene/vat_truc.ts` (đánh dấu ngồi trên đá đàn).
- `web/src/ui/zitherSound.ts` (âm sắc) · `ui/lamSound.ts` (mới: nước, rắc, mưa) · HUD `ui/luuThuongHud.ts`, `ui/mangHud.ts`, `ui/danCamHud.ts` (**chờ thiết kế**).
- Ghép (file riêng ở gốc): `web/src/luuThuong.ts`, `web/src/haiMang.ts`, `web/src/danCam.ts`; `main.ts` vài dòng.
- `web/src/player/npc.ts` — thế khối khi NPC trò chơi chưa có model.
- `app/lib/journey/wallet.dart` (mã trò), `app/lib/journey/mang.dart` (mới), `progress_store.dart` (khoá `mang.state`), `app/lib/scene/mang_event.dart` (mới) + chỗ nhận sự kiện; test `app/test/journey/mang_test.dart`, `wallet_test.dart`.
- `.claude/skills/lead/SKILL.md` — dòng Bản đồ tính năng "Lưu Thương, hái măng, đàn cầm".

### Cần kiểm tra
`gamePlay.ts` (không sửa — mẫu; hai hệ ngồi chơi không được chồng nhau), `ngoiMat.ts` (đệm đang chơi không vào góc từ mắt
thường), `thanhCongCu.ts` (ẩn thanh), `chatRoom.ts` (NPC nói bong bóng), `walletRoom.ts` (luồng `earnGame` + xu bay), `areaMapRoom.ts`
(biểu tượng 3 trò trên bản đồ vùng — để sau), `townNpcs.ts` (ẩn NPC 35 m), `cuoiHac.ts` / màn tải (dừng tiếng khi đổi cảnh),
`designPreview.ts` (Canvas 3D `?dang=luu-thuong|hai-mang|dan-cam`).

### Không đụng
Kỳ Văn Uyển (Đấu chữ, Ngũ Tử Kỳ giữ nguyên luật), tiến độ học (R-ON: trò chơi **không** ghi lịch ôn — như R-DAU-1),
Vườn rau / kho nông sản (măng là kho riêng), Tạp hoá (không bán măng, không thêm hàng — đồ trang trí độc quyền đổi bằng măng
để sau, xem QĐ 3), 5 vùng còn lại (B5).

---

## 2. Luật chơi chi tiết

### Trò 1 — Lưu Thương Lệnh (Khúc Thuỷ Đài) — trò học, bắt buộc gắn chữ Hán

**Gốc**: 曲水流觴 Lan Đình (hồ sơ `docs/tham_khao/rung-truc.md`): chén rượu thả trên mương uốn khúc, dừng trước ai người đó làm
thơ, không làm được thì uống phạt. Dịch: "làm thơ" → **ghép bộ thủ thành chữ**.

- **NPC văn nhân** (3, ngồi sẵn 3 đệm, dáng `ngoi` R-NPC-6): **Thi Ông** `thi-ong` (chủ tiệc, cụ đồ râu bạc, áo lam — đúng ~75 %) ·
  **Tú Tài** `tu-tai` (thư sinh trẻ, áo trắng ngà — ~60 %) · **Tài Nữ** `tai-nu` (nữ văn nhân, áo lục nhạt — ~70 %). Tên chỉ tiếng Việt
  (R-HUD-4). Chỗ: đệm chỉ số 1, 4, 6 của `seats` (chia đều quanh mương, khoá — người chơi không ngồi đè).
  **Model**: chưa có → **thế bằng khối** `discipleCharacter` đổi màu áo (làm được ngay); bản đẹp qua `/tai-nguyen` (bộ ảnh 4 góc
  `/ui-design` → `nhan-vat.sh thi-ong …`) — ghi việc riêng, **không chặn**.
- **Vào**: đứng gần Thi Ông (< 2,5 m) → "Nói chuyện" (R-NPC-2) → lựa chọn **"Dự tiệc Lưu Thương"** · "Cách chơi" · "Thôi". Chọn dự
  → nhân vật tự dời tới **đệm trống gần nhất** (5 đệm còn lại), ngồi quay mặt vào mương; camera chéo cao nhìn xuống đài từ sau lưng
  (như `tableCamera` bàn chơi), không góc từ mắt. Ngồi đệm Khúc Thuỷ **bằng nút "Ngồi"** (không qua Thi Ông) → vẫn chỉ là ngồi nghỉ như
  R-NGOI-1, kèm nút nổi "Dự tiệc" trên đầu Thi Ông nếu chưa có tiệc (gợi ý — đề xuất, phiếu vẽ).
- **Điều kiện**: đã học **≥ 3 bộ** có chữ ghép trong `ghepChu`. Chưa đủ → Thi Ông: "Đạo hữu hãy Ngồi ôn học thêm vài bộ thủ, rồi lại
  đây cùng thả chén." + "Vâng (đứng dậy)". (Ở Trúc Lâm học bộ mới được ngay — R-HANH-3.)
- **Ván = 8 lượt** (người 4, NPC 4 — mỗi văn nhân 1–2 lượt): đầu lượt Thi Ông thả **chén lệnh** (chén sáng viền vàng, khác 3 chén
  trang trí) ở đầu mương; chén trôi 3–6 giây rồi **xoáy chậm và dừng** ở điểm mương gần đệm của người tới lượt (thứ tự lượt định sẵn
  lúc mở ván, ngẫu nhiên nhưng người chơi đúng 4 lượt, không quá 2 lượt người liền nhau). Tiếng "cạch" gỗ khi dừng.
- **Câu ghép chữ** (lượt người): khung chữ hiện **phần còn lại** của một chữ (vd. 可) ở đúng chỗ trong khung theo kiểu ghép, ô bộ thủ
  trống; dưới khung: nghĩa + pinyin ("sông · hé"); **4 ô bộ thủ** (1 đúng 氵 + 3 nhiễu, ưu tiên bộ đã học, ghi kèm âm Hán Việt: "thuỷ").
  Chạm là chọn (như R-DAU-2). Đúng → chữ ghép hoàn chỉnh 河 hiện to + "hà · hé — sông", tiếng gảy dây, **+1 điểm**. Sai hoặc quá
  **20 giây** → chữ đúng hiện, nhân vật **nâng chén uống phạt** (động tác vui), 0 điểm. Chữ hỏi: chỉ chữ có **bộ đã học**; không lặp
  chữ trong một ván. (Phương án ghép — **QĐ 1**.)
- **Lượt NPC**: "nghĩ" 1,5–3 giây (bong bóng "…" trên đầu), rồi bong bóng chữ đáp + đúng / sai theo xác suất riêng; câu của NPC
  **hiện cho người xem** (khung chữ nhỏ, ô mờ) — người vẫn học khi xem.
- **Hết ván**: xếp hạng 4 người theo điểm (bằng điểm cùng hạng). Thẻ kết quả: hạng của mình + bảng 4 dòng + lời Thi Ông + **"Ván
  mới"** · **"Rời tiệc"**. Người hạng 1 (một mình) = `thang`, hạng 1 đồng = `hoa`, khác = `thua`.
- **Thưởng** (`earnGame {game: 'luu-thuong', outcome}`): **+8 / +5 / +3** — cùng bảng Đấu chữ, **chung trần 60 / ngày** R-TIEN-3
  (cắt bớt, "Hôm nay trò chơi đã đủ thưởng"). Rời giữa ván → không thưởng. **Không ghi tiến độ học / lịch ôn** (như R-DAU-1).
- **Ra**: nút "Rời tiệc" bất cứ lúc nào, hoặc nút quay lại máy → đứng dậy cạnh đệm.
- **Đặt bằng cấu hình** (đặc tả cảnh): `miniGames[] {kind: 'luu-thuong', channel: 0, seats: [0..7], npcs: [{id, seat}], host:
  'thi-ong'}`; số lượt, thời gian, xác suất, bảng thưởng ở luật thuần (`games/luuThuong.ts`), không ở cảnh.
- **Âm thanh** (tự tổng hợp, offline): róc rách nhẹ quanh mương (nhiễu hồng lọc thông dải, âm lượng theo khoảng cách ≤ 4 m đầy,
  ≥ 15 m tắt — cùng khuôn R-AM-2); "cạch" gỗ khi chén dừng; đúng → một nốt gảy ngũ cung (`ZitherSound`), sai → không nốt.

### Trò 2 — Hái măng sau mưa (rừng trúc) — trò thuần chơi hằng ngày

- **Măng mọc** (của chung — mọi máy cùng ngày thấy cùng chỗ): vị trí sinh từ **hạt giống = ngày VN + mã lứa** trong các **vùng trúc
  thưa** khai ở đặc tả (`areas`), trên nền đi được (không trên lối lát, mặt nước, trong vật cản, cách nhau ≥ 3 m, cách lối chính
  ≥ 1 m để thấy được). Hai **lứa / ngày** (khuyên — **QĐ 2**): **lứa sớm 5:00** (8 măng) và **lứa sau mưa 15:00** (6 măng); trong mỗi lứa
  có **1 măng to** (vỏ vàng sẫm, cao gấp đôi). Lứa mới không xoá măng chưa hái của lứa trước trong cùng ngày; **0:00 giờ VN** đổi ngày → măng
  cũ héo hết (không tích sang hôm sau).
- **Mưa phùn** (QĐ 2-B): **14:50 → 15:00 giờ VN** mưa phùn nhẹ ở Trúc Lâm (hạt mảnh rơi quanh camera, trời xám đi 15 %, tiếng mưa);
  tạnh đúng 15:00 → măng lứa chiều nhú lên (0,6 giây). Chỉ hình ảnh — không ướt, không đổi luật đi lại. Mức đồ hoạ Thấp: không hạt mưa
  (chỉ tiếng + trời xám). Vào cảnh lúc đang mưa → thấy mưa ngay.
- **Hái**: đứng cách măng **< 1,5 m** → nút nổi **"Hái"** (kiểu nút luống "Thu" — R-VUON) trên măng gần nhất. Bấm (máy tính: **E**) →
  nhân vật cúi 0,6 giây, măng biến mất **với riêng mình**, nhãn bay "+1 Măng" ("+1 Măng to"), tiếng "rắc". Măng đã hái lưu theo mã
  (`<ngày>-<lứa>-<i>`) → mở lại app cùng ngày không mọc lại. Mỗi người hái được **mỗi măng một lần** (tối đa 14 / ngày).
- **Măng chữ** (tuỳ chọn khuyên làm — gắn học nhẹ): măng **to** có một bộ thủ **đã học** khắc mờ trên vỏ. Hái măng to → thẻ nhỏ 1 câu
  "Bộ này nghĩa là gì?" 3 phương án (như R-ON-2, chạm là chọn). Đúng → **×2** (được 2 măng to), sai → vẫn 1. Chưa học bộ nào →
  măng to không có chữ, không hỏi. Không ghi lịch ôn.
- **Bán / thưởng** (khuyên — **QĐ 3-A**): ở sân **Trúc Lư** có **Trúc Ông** `truc-ong` (lão tiều phu, đứng, dáng R-NPC-1) — "Nói
  chuyện" → "Bán măng" → bảng bán (dòng Măng × n · 3 Văn / cái, Măng to × n · 8 Văn / cái, "Bán" từng loại + "Bán hết") — cùng khuôn
  thùng thu mua R-VUON-7. Cộng Văn tiền ngay, nhãn "+n · Bán măng". **Trần riêng** không cần: nguồn tự giới hạn (14 măng ≈ tối đa
  ~66 Văn / ngày khi đúng cả 2 măng chữ); **không** tính vào trần trò chơi 60. Măng **không hỏng** trong túi (bán lúc nào cũng được).
  Đổi đồ trang trí độc quyền bằng măng (Đèn trúc, Ghế trúc…) → **để đợt sau** (cần model + thẻ hình + Tạp hoá theo cái V-69).
- **Túi**: ngăn mới **Lâm sản** trong Túi đồ (R-TUI-1) — Măng × n, Măng to × n; trống → "Hái măng ở rừng Trúc Lâm".
- **Đặt bằng cấu hình**: `miniGames[] {kind: 'hai-mang', areas: [{from, to}], waves: [{at: '05:00', count: 8, big: 1}, {at: '15:00',
  count: 6, big: 1, rain: 10}], gap: 3, buyer: 'truc-ong'}`; giá ở `mang.dart` (một nguồn, chép TS).
- **Lưu** (Flutter, `progress_store.dart` khoá `mang.state`): `{day: <vnDay>, picked: ['20771-0-3', …], bag: {mang: 5, 'mang-to': 1}}`;
  cầu nối `getMang` / `mangAct {act: 'pick', id, big, right?} | {act: 'sell', kind: 'mang' | 'mang-to' | null}`; không Flutter → ví thử
  (R-TIEN-7). Flutter là nơi tính (chống hái trùng / ngày sai), trang chỉ gửi.
- **NPC Trúc Ông**: model chưa có → thế khối (áo nâu, nón lá); `/tai-nguyen` sau. Lời: "Măng sau mưa ngọt nhất đấy, con hái được bao
  nhiêu?"; hết măng trong túi → "Túi con còn trống. Mưa chiều xong là măng lại nhú."
- **Âm thanh**: "rắc" (xung nhiễu ngắn lọc thấp + gõ gỗ), mưa (nhiễu trắng lọc cao, âm lượng toàn cảnh 0,25, lên / xuống 2 giây).

### Trò 3 — Đàn cầm (bãi giữa) — thư giãn

- **Vào**: tảng đá đàn cầm có **chỗ ngồi** sau đàn (bồ đoàn rơm phía −z của đá) — nút nổi **"Ngồi đàn"** (tầm 1,2 m, R-NGOI-1). Ngồi →
  camera thấp chếch sau vai nhìn qua đàn ra bãi (không từ mắt); nhân vật dáng gảy (`CharacterState.pluck` có sẵn từ Cầm Nương).
- **Hai chế độ** (khuyên làm cả hai — **QĐ 4-A**; tấm chọn khi vừa ngồi: "Đàn tự do" · "Theo bài" · "Đứng dậy"):
  - **Đàn tự do**: **5 dây ngũ cung** (Rê – Mi – Pha♯ – La – Si, hai quãng tám = 10 phím xếp 2 hàng; tên chỉ chữ Việt "Cung · Thương ·
    Giốc · Chuỷ · Vũ") — chạm / giữ lướt qua các dây = gảy; máy tính phím **1–5** (quãng thấp) và **Q W E R T**… (đề xuất phím; phiếu
    chốt hiển thị). Không chấm, không thưởng, không giới hạn. Chỉ có ngũ cung → đánh gì cũng không chói tai.
  - **Theo bài** (nhịp rơi đơn giản): chọn 1 trong **3 bài tự soạn** ngắn 40–60 giây (tên Việt: "Suối trúc", "Mưa măng", "Trăng
    trên gò") — nốt rơi theo **5 làn** về vạch gảy; chạm đúng làn đúng lúc: **±0,12 s "Hay"**, **±0,25 s "Được"**, lệch / bỏ = trượt
    (bài vẫn chạy tiếp, không thua giữa chừng). Hết bài: tỉ lệ % (Hay = 1, Được = 0,5) → **"Tri âm" ≥ 85 %** · **"Thanh nhã" ≥ 60 %** ·
    **"Tập đàn"** < 60 %. Tốc độ chậm, ≤ 2 nốt / giây, không hợp âm (một làn một lúc) — thư giãn, không khó.
- **Thưởng** (`earnGame {game: 'dan-cam', outcome: thang | hoa | thua}` = Tri âm / Thanh nhã / Tập đàn): **+5 / +3 / +1**, **chung trần
  60** R-TIEN-3; **mỗi bài thưởng tối đa 1 lần / ngày** (3 bài = tối đa 15 Văn / ngày — để không "cày" đàn); đàn tự do không thưởng.
- **Gắn chữ Hán** (đề xuất: **không bắt buộc**): trò để thư giãn — không chữ trên HUD (R-HUD-4). Tuỳ chọn sau: hết bài "Tri âm" hiện
  một câu thơ ngắn có chữ đã học (nội dung học) — **để sau**, không trong kế hoạch này.
- **Âm thanh**: `ZitherSound` thêm **âm sắc cổ cầm** (thấp hơn tranh một quãng tám, tắt chậm 4–5 giây, lọc bớt tiếng sáng);
  người chơi nghe đầy (đang ngồi); sau này người khác nghe theo khoảng cách như R-AM-2 (≤ 3 m đầy, ≥ 15 m tắt) — giờ chưa
  multiplayer nên chỉ mình nghe. Đang ngồi đàn: **Cầm Nương** ở trấn không liên quan (khác cảnh).
- **Đặt bằng cấu hình**: `miniGames[] {kind: 'dan-cam', prop: <chỉ số vật dan-cam>, seat: {dx, dz, rotY}}`; bài + nhịp ở `games/danCam.ts`.
- **Ra**: "Đứng dậy" / điều khiển đi / nút quay lại → đứng cạnh đá. Rời giữa bài → không thưởng.

### Chung cả 3 trò
- Đang chơi (ngồi tiệc / ngồi đàn / bảng bán măng mở): thanh công cụ, bản đồ nhỏ, ví **ẩn** như ngồi bàn chơi (R-THANH-1, R-TIEN-1);
  nhân vật đứng yên; màn che / đổi cảnh / app xuống nền → tiếng tắt như R-AM-2.
- Mỗi trò một **"Cách chơi"** (bảng R-GIAO-2 dùng lại): đá khắc "Khúc Thuỷ Đài" (đã có), đá đàn cầm, rào Trúc Lư (biển gỗ nhỏ "Hái
  măng" — vật mới nhỏ, hoặc chỉ qua thoại Trúc Ông — phiếu quyết).
- Không chữ Hán ngoài nội dung học (R-HUD-4): chữ Hán chỉ ở câu ghép (Lưu Thương) và bộ thủ trên măng chữ.

---

## 3. Giả định / cần quyết định (4 điểm)

1. **Cách ghép chữ ở Lưu Thương**
   - **A (khuyên)**: có sẵn phần còn lại (可) + nghĩa + pinyin → chọn **1 bộ thủ** trong 4 ô. Nhanh (≤ 20 giây / lượt), dùng đúng thứ
     vừa học (bộ thủ), dữ liệu ít (mỗi chữ 1 phần còn lại).
   - B: chọn **2 mảnh** (bộ thủ + phần còn lại) trong 6 mảnh → khó hơn, cần thêm mảnh nhiễu cho phần còn lại.
   - C: **kéo thả** mảnh vào khung ghép → thích tay nhưng tốn HUD + khó trên màn ngang nhỏ.
   - Đề xuất: **A** cho bản đầu; B làm "tiệc khó" sau khi học > 20 bộ.
2. **Măng mọc "sau mưa"**
   - A: **một lứa / ngày** lúc 0:00 giờ VN (10 măng), không mưa — rẻ nhất.
   - **B (khuyên)**: **hai lứa** 5:00 (8) và 15:00 (6) + **mưa phùn 10 phút** trước lứa chiều (1 draw call hạt mưa, mức Thấp bỏ hạt) —
     đúng ý "sau mưa", tạo hẹn giờ quay lại kiểu 摩尔.
   - C: hệ **thời tiết ngẫu nhiên** dùng chung mọi vùng (mưa bất chợt, măng mọc sau mỗi cơn) — để sau (đụng R-NGAY-5, 6 vùng).
3. **Măng đổi lấy gì**
   - **A (khuyên)**: bán cho **Trúc Ông** ở Trúc Lư lấy Văn tiền (3 / 8 mỗi cái), không tính trần trò chơi (nguồn tự giới hạn ≤ 14 / ngày)
     → mua đồ trang trí theo cái ở Tạp hoá (V-69).
   - B: như A nhưng **tính chung trần 60** của trò chơi → đơn giản luật tiền, nhưng người chơi Lưu Thương nhiều thì hái măng thành vô ích.
   - C: chỉ **đổi đồ trang trí độc quyền** (Đèn trúc 12 măng, Ghế trúc 25…) — có đồ "chỉ Trúc Lâm mới có", nhưng cần thêm model + thẻ
     hình + thiết kế; để đợt 2 làm thêm cạnh A.
4. **Đàn cầm — chế độ**
   - **A (khuyên)**: **cả hai** — tự do (làm trước, nhỏ) + theo bài 3 bài nhịp rơi (thưởng nhỏ, 1 lần / bài / ngày).
   - B: chỉ **tự do** (không thưởng) — rẻ nhất, thuần thư giãn.
   - C: chỉ **theo bài** — có mục tiêu nhưng mất phần "ngồi gảy chơi".

Giả định đã tự chốt (đổi được khi duyệt): Lưu Thương 3 NPC, 8 lượt, thưởng như Đấu chữ; trò chơi không ghi tiến độ học; NPC
chưa có model dùng **khối đổi màu** (không chặn); thứ tự làm như mục 5.

---

## 4. Nháp luật (chưa sửa sổ — duyệt xong mới ghi `quy_tac.md` → `/dong-bo-quy-tac` → test → code)

| Mã | Nội dung (tóm) |
|---|---|
| **R-LUU-1** | Khúc Thuỷ Đài: 3 văn nhân Thi Ông / Tú Tài / Tài Nữ ngồi 3 đệm cố định; vào tiệc qua thoại Thi Ông "Dự tiệc Lưu Thương" → ngồi đệm trống gần nhất, camera chéo cao; cần ≥ 3 bộ đã học có chữ ghép, thiếu → câu nhắc + đứng dậy; "Rời tiệc" / nút quay lại → đứng cạnh đệm. |
| **R-LUU-2** | Ván 8 lượt (người 4, NPC 4, người không quá 2 lượt liền); chén lệnh viền vàng thả đầu mương, trôi 3–6 s, dừng ở điểm mương gần đệm người tới lượt; tiếng gỗ khi dừng. |
| **R-LUU-3** | Câu ghép chữ: phần còn lại + nghĩa + pinyin, 4 ô bộ thủ (1 đúng, nhiễu ưu tiên bộ đã học, kèm âm Hán Việt); chạm là chọn; đúng +1 điểm, chữ đầy đủ + "âm HV · pinyin — nghĩa"; sai / quá 20 s → chữ đúng + uống phạt; chữ chỉ từ bộ đã học, không lặp trong ván. |
| **R-LUU-4** | Lượt NPC: nghĩ 1,5–3 s, đúng theo xác suất riêng (Thi Ông 75 %, Tài Nữ 70 %, Tú Tài 60 %), câu hiện cho người xem (ô mờ). |
| **R-LUU-5** | Hết ván: xếp hạng 4 người (bằng điểm cùng hạng); hạng 1 một mình = thắng, hạng 1 đồng = hoà, khác = thua → +8 / +5 / +3 (R-TIEN-3, trần chung 60); thẻ kết quả "Ván mới" / "Rời tiệc"; rời giữa ván không thưởng; không ghi tiến độ học. |
| **R-MANG-1** | Măng mọc: vùng trúc thưa trong đặc tả; vị trí theo hạt ngày VN + lứa (mọi máy như nhau); 2 lứa 5:00 (8, 1 to) và 15:00 (6, 1 to); cách nhau ≥ 3 m, không trên lối / nước / vật cản; 0:00 VN măng cũ héo. |
| **R-MANG-2** | Mưa phùn 14:50–15:00 giờ VN ở Trúc Lâm (hạt + trời xám 15 % + tiếng); tạnh → lứa chiều nhú; chỉ hình ảnh; mức Thấp không hạt. |
| **R-MANG-3** | Hái: < 1,5 m → nút "Hái" (máy tính E) trên măng gần nhất; cúi 0,6 s, măng biến mất với riêng mình, "+1 Măng" / "+1 Măng to"; lưu theo mã, cùng ngày không mọc lại. |
| **R-MANG-4** | Măng chữ: măng to khắc bộ đã học; hái → 1 câu nghĩa 3 phương án; đúng ×2; chưa học bộ nào → không chữ, không hỏi; không ghi lịch ôn. |
| **R-MANG-5** | Bán ở Trúc Ông (Trúc Lư): Măng 3, Măng to 8 Văn / cái, "Bán" từng loại + "Bán hết"; "+n · Bán măng"; không trần riêng, không tính trần trò chơi; măng không hỏng. |
| **R-CAM-1** | Đá đàn cầm có chỗ "Ngồi đàn" (1,2 m); ngồi → camera sau vai, dáng gảy; tấm chọn "Đàn tự do" · "Theo bài" · "Đứng dậy"; đi / quay lại → đứng dậy. |
| **R-CAM-2** | Đàn tự do: 10 phím ngũ cung Rê (2 quãng), chạm / lướt = gảy, máy tính phím số + hàng Q; không chấm, không thưởng. |
| **R-CAM-3** | Theo bài: 3 bài 40–60 s, nốt rơi 5 làn ≤ 2 nốt / s; ±0,12 s Hay, ±0,25 s Được, còn lại trượt; hết bài % → Tri âm ≥ 85 · Thanh nhã ≥ 60 · Tập đàn. |
| **R-CAM-4** | Thưởng theo bài +5 / +3 / +1 (`dan-cam` thắng / hoà / thua), trần chung 60, mỗi bài tối đa 1 lần thưởng / ngày VN; rời giữa bài không thưởng. |
| **R-AM-3** | Tiếng Trúc Lâm tự tổng hợp: róc rách mương (≤ 4 m đầy, ≥ 15 m tắt), gỗ chén dừng, rắc măng, mưa phùn, cổ cầm (tắt chậm 4–5 s); màn che / đổi cảnh / nền → như R-AM-2. |
| sửa **R-TIEN-3** | thêm Lưu Thương (+8/+5/+3) và Đàn cầm theo bài (+5/+3/+1, 1 lần / bài / ngày) vào bảng; trần 60 chung. |
| sửa **R-TIEN-1 / 5 / 7** | thẻ "kiếm từ đâu" thêm 3 dòng; nhãn "+8 · Thắng Lưu Thương", "+5 · Tri âm", "+n · Bán măng"; ví thử giữ măng. |
| sửa **R-TUI-1** | ngăn thứ 5 **Lâm sản**. |
| sửa **R-NGOI-1** | đệm đang có văn nhân không hiện nút; đá đàn cầm thêm chỗ "Ngồi đàn". |
| sửa **R-NPC-1** | NPC trò chơi (văn nhân, Trúc Ông) thiếu model → thế bằng khối, không bỏ. |
| sửa **R-GIAO-2** | bảng "Cách chơi" cho 3 trò mới (chỗ đặt nút). |

---

## 5. Thứ tự đề xuất

1. **Lưu Thương Lệnh trước** — trụ cột học chữ, dùng ngay bộ vừa học ở Trúc Lâm; tái dùng nhiều nhất (Đấu chữ, đệm, chén).
2. **Đàn cầm tự do** — nhỏ, dùng lại `ZitherSound`, cho bãi giữa có việc ngay; theo bài làm sau cùng.
3. **Hái măng** — cần Flutter (lưu + cầu nối) + mưa; nặng phần nền nhất.
4. **Đàn cầm theo bài**.

Luật thuần + test của cả 3 (NV 3–6) độc lập nhau → giao song song được (3 worktree) sau khi duyệt; cảnh + ghép theo thứ tự trên.

---

## 6. Nhiệm vụ

Ký hiệu: **[ngay]** làm được ngay sau duyệt · **[chờ TK]** chờ thiết kế (phiếu `2026-11-15-truc-lam-mini-game`) · **[thiết kế]** vai
thiết kế (`/canh`, `/tai-nguyen`).

**Luật trước**
- [ ] 1. [ngay] Ghi luật R-LUU-1…5, R-MANG-1…5, R-CAM-1…4, R-AM-3 + sửa R-TIEN-1/3/5/7, R-TUI-1, R-NGOI-1, R-NPC-1, R-GIAO-2 vào
  `docs/testing/quy_tac.md` theo QĐ đã chọn → `/dong-bo-quy-tac` (subagent, ops JSON + ifRev). Xong khi `rule_trace --pending` rỗng.
- [ ] 2. [ngay] `docs/bridge.md`: `earnGame.game` + `luu-thuong`, `dan-cam`; `getMang` / `mangAct` (dạng ở mục 2). Xong khi hai phía có tên.

**Dữ liệu + luật thuần** (`web/src/games/`, `zones/` — vitest)
- [ ] 3. [ngay] `games/ghepChu.ts`: ≥ 2 chữ / bộ cho 50 bộ (≈ 100–120 chữ phồn thể, tách sạch), mỗi chữ `{han, radical, rest, layout:
  'trai-phai' | 'tren-duoi' | 'bao', hv, pinyin, meaning}`; test: mã bộ tồn tại, không trùng chữ, `rest` ≠ rỗng, mọi chữ lọt bộ font
  (`fonts:han` quét được). Xong khi test xanh + bảng soát tay 20 chữ đầu.
- [ ] 4. [ngay] `games/luuThuong.ts` (thứ tự lượt, chọn chữ theo bộ đã học, 4 phương án, NPC theo xác suất, xếp hạng → outcome) +
  `games/luuThuongRound.ts` (vòng thời gian: `tha → troi → hoi|nghi → cham → … → het`, hết giờ 20 s); test theo ví dụ luật R-LUU-2…5.
- [ ] 5. [ngay] `app/lib/journey/mang.dart` (gốc: lứa theo giờ VN, mã măng, hái / bán, ví) + chép `web/src/zones/mang.ts` (sinh vị trí
  theo hạt ngày + vùng + vật cản — phần vị trí **chỉ ở TS** vì cần cảnh; Dart chỉ kiểm mã hợp lệ của ngày) ; test Dart + vitest cùng ví dụ.
- [ ] 6. [ngay] `games/danCam.ts`: thang ngũ cung (dùng chung `zones/danTranh.ts`), 3 bài (mảng `[nhịp, làn]`), chấm ±0,12 / ±0,25, %
  → hạng, 1 lần thưởng / bài / ngày; test.
- [ ] 7. [ngay] `zones/walletRules.ts` + `wallet.dart`: `gameBase('luu-thuong'|'dan-cam')`, nhãn thưởng; ví thử giữ `mang` + bài đã thưởng
  hôm nay; test hai phía cùng ví dụ (57 + 8 → 3).

**Cảnh 3D** (`web/src/scene/` — đo fps trước / sau trên Trúc Lâm)
- [ ] 8. [thiết kế] `/canh`: thêm `miniGames` vào `design/scene/rung-truc.json` (3 mục như mục 2; vùng măng = các khóm trúc thưa trong
  rừng, tránh lối), NPC `thi-ong` `tu-tai` `tai-nu` (dáng `ngoi` trên đệm 1/4/6) + `truc-ong` (sân Trúc Lư (−32; 27)), chỗ ngồi đá đàn;
  `scene:check` xanh. (Phiên code chỉ thêm kiểu `MiniGameSpec` + mặc định `[]` + kiểm ở NV 9 trước.)
- [ ] 9. [ngay] `scene/spec.ts` + `loadSpec.ts`: `MiniGameSpec` (ba dạng), `miniGames: []` mặc định; `NPC_IDS` + 4 mã;
  `check-scene.mjs` kiểm (đệm / mương / vật tồn tại, vùng trong `bounds`, không chữ Hán). Xong khi cảnh cũ build y nguyên.
- [ ] 10. [ngay] `scene/channels.ts`: xuất đường cong mương + `stopPoint(seat)`; **chén lệnh** = thêm 1 instance vào InstancedMesh chén
  (draw call +0), vị trí do ghép đặt; viền vàng = màu instance. Test `stopPoint` gần đệm < 0,8 m.
- [ ] 11. [ngay] `scene/mangLam.ts`: măng (nón 3 lớp vỏ, 2 cỡ) InstancedMesh **2 draw call**, ẩn / hiện từng cái, nhú 0,6 s;
  `scene/muaPhun.ts`: hạt mưa `Points` 1 draw call quanh camera (~800 hạt), mức Thấp tắt. Đo fps.
- [ ] 12. [ngay] `player/npc.ts`: NPC có cờ trò chơi thiếu model → `discipleCharacter` đổi màu (bảng màu 4 mã), dáng ngồi / đứng;
  ước +8–12 draw call / NPC khi gần (ẩn ≥ 35 m — R-NPC-1). Đo fps ở Khúc Thuỷ Đài (3 NPC + chén).
- [ ] 13. [thiết kế · không chặn] `/tai-nguyen` 4 model `thi-ong`, `tu-tai`, `tai-nu`, `truc-ong` (bộ ảnh 4 góc `/ui-design` trước) —
  việc riêng trong sổ việc.

**Âm thanh**
- [ ] 14. [ngay] `ui/zitherSound.ts`: tham số âm sắc (`timbre: 'tranh' | 'cam'` — quãng, tắt dần, lọc); `ui/lamSound.ts` (mới): róc rách,
  gỗ, rắc, mưa — tự tổng hợp `AudioBuffer`, phần thuần (dựng mẫu, âm lượng theo khoảng cách) có test như `pluckSamples`.

**HUD** (chờ thiết kế — không dựng tạm)
- [ ] 15. [chờ TK] `ui/luuThuongHud.ts` + CSS: thẻ câu ghép, bảng điểm 4 người, viên lượt, thẻ kết quả, "Rời tiệc".
- [ ] 16. [chờ TK] `ui/mangHud.ts`: nút "Hái", nhãn "+1 Măng", chip lứa / đếm, thẻ măng chữ, bảng bán Trúc Ông; ngăn Lâm sản `ui/bagPanel.ts`.
- [ ] 17. [chờ TK] `ui/danCamHud.ts`: tấm chọn chế độ / bài, dây ngũ cung, làn nốt rơi + chấm Hay / Được, thẻ kết quả bài.
- [ ] 18. [ngay] `zones/gameGuides.ts`: nội dung 3 bảng "Cách chơi" (khung bảng đã có — R-GIAO-2), nút trên đá khắc / đá đàn / Trúc Lư.

**Ghép** (file riêng ở gốc `web/src/`, `main.ts` chỉ vài dòng)
- [ ] 19. [ngay phần logic · chờ TK phần HUD] `web/src/luuThuong.ts`: thoại Thi Ông → ngồi đệm → vòng `LuuThuongRound` ↔ chén lệnh ↔ bong
  bóng NPC (`chatRoom`) → `earnGame` → xu bay khi rời; ẩn thanh công cụ / ví; Canvas 3D `?dang=luu-thuong`.
- [ ] 20. [ngay phần logic · chờ TK phần HUD] `web/src/haiMang.ts`: lứa theo giờ VN (`?gio=` `?toc=` thử), dựng măng, mưa, nút Hái
  → `mangAct`, thoại Trúc Ông → bảng bán; Canvas 3D `?dang=hai-mang&gio=14.8`.
- [ ] 21. [ngay phần logic · chờ TK phần HUD] `web/src/danCam.ts`: chỗ ngồi đá, camera sau vai, tự do / theo bài, `earnGame`.
- [ ] 22. [ngay] `main.ts`: gọi 3 file ghép (chỉ khi cảnh có `miniGames` loại tương ứng); Bản đồ tính năng trong `lead/SKILL.md`.

**Flutter + cầu nối**
- [ ] 23. [ngay] `progress_store.dart` khoá `mang.state`; `app/lib/scene/mang_event.dart` + nhận `getMang` / `mangAct`; `earnGame` nhận
  mã mới; `web/src/bridge/flutterBridge.ts` + `browserStore.ts` (ví thử). Test `app/test/journey/mang_test.dart`, `wallet_test.dart`.
  (Túi đồ là HTML — `ui/bagPanel.ts` — ngăn Lâm sản nằm ở NV 16, không có màn Flutter mới.)

**Kiểm + build**
- [ ] 24. [ngay] `npm test` · `npx tsc --noEmit` · `npm run scene:check` · `npm run build` · `flutter analyze` · `flutter test -r failures-only
  test/journey` · `dart tool/rule_trace.dart` · fps Trúc Lâm (Khúc Thuỷ Đài có tiệc, rừng trúc lúc mưa) Android tầm trung ≥ 30.

Đếm: **24 nhiệm vụ** — **làm ngay 16** (1–7, 9–12, 14, 18, 22–24) + **3 nửa-nửa** (19–21: logic làm ngay, HUD chờ thiết kế) ·
**chờ thiết kế 3** (15–17) · **vai thiết kế 2** (8 chặn phần cảnh của ghép; 13 không chặn).

### Hiệu năng (ước)
Chén lệnh +0 draw call · măng +2 · mưa +1 (chỉ 10 phút / ngày) · 3 văn nhân khối +25–35 (chỉ khi < 35 m, ở Khúc Thuỷ Đài, xa bãi hạc)
· Trúc Ông khối +8–12. Trúc Lâm hiện 83 draw call (góc trên) → góc Khúc Thuỷ có tiệc ≈ 120 — **đo trước / sau** (luật cứng 4);
vượt thì gộp khối NPC (`mergeSoft`) hoặc chờ model `.glb`.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build · cd app && flutter
analyze · flutter test -r failures-only test/journey · dart tool/rule_trace.dart
