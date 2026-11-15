# Trang trí tự do — đặt đồ ở bất cứ đâu trong nhà, xoay, kéo kiểu 摩尔
- Yêu cầu: "khi trang trí trong vườn tôi muốn tùy ý di chuyển đồ trang trí rồi xoay đồ trang trí theo các hướng dựa vào thao tác
  bàn phím, nói chung là cách thao tác giống của 摩尔"
- Người dùng đã chọn (V-20261115-69): phạm vi **mọi nơi ở nhà** — sân, vườn (`nha-ta`), gian trong (`nha-ta-trong`) — **bỏ hết ô
  trang trí cố định**; đặt tự do trên nền được phép (không chắn lối ra Bến mây, cửa nhà, cổng vườn, luống rau, thùng thu mua, chỗ
  xuất phát / bãi hạc; không đè vật khác). Thao tác: **máy tính** — chuột di / kéo theo **lưới 0,5 m**, **Q / E xoay 45°**, **R xoay
  90°**, **Enter / click đặt**, **Esc huỷ**, **Delete cất vào túi**; **điện thoại** — kéo món bằng ngón, nút **xoay / đặt / cất**
  nổi cạnh món. Món **đỏ** khi đặt sai chỗ.
- Loại: sửa hành vi + dữ liệu (đổi dạng lưu, chuyển dữ liệu cũ) + giao diện mới · Cỡ: **lớn** · Trạng thái: **chờ duyệt** (4 điểm cần
  quyết định) — phần HUD **chờ thiết kế** (`docs/phieu_thiet_ke/2026-11-15-trang-tri-tu-do.md`)

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-NHA-2, R-NHA-3, R-NHA-4, R-NHA-5 (bỏ "12 ô"), R-TUI-1 (ngăn Đồ trang trí); thêm R-NHA-6 (thao tác),
  R-NHA-7 (chỗ đặt hợp lệ). Nháp ở cuối kế hoạch.
- `docs/bridge.md` — `getHome` trả thêm `items`; `setDecor` (theo ô) → `setHome` (cả danh sách món); `openShop` không đổi.
- `web/src/zones/decor.ts` — `HomeState.placed` (ô → vật) → `items: PlacedDecor[]`; bỏ `placeDecor` theo ô, `catalogForSlot` theo loại ô
  → danh mục theo **nơi** (ngoài trời / trong nhà — điểm quyết định 2); `cleanHome` đọc dạng mới + dạng cũ.
- `web/src/zones/decorLegacy.ts` (mới) — bảng **ô cũ đóng băng** (12 ô: mã, cảnh, x, z, rotY — chép từ `nha-ta.json` /
  `nha-ta-trong.json` hiện nay) + `migrateHome(raw)` ô → món (toạ độ + góc tương đương).
- `web/src/zones/decorPlace.ts` (mới, thuần, vitest) — lưới 0,5 m, xoay bước 45°, khung bao xoay (OBB), kiểm chỗ hợp lệ (vùng cho
  phép, vùng cấm, đè món khác, đè vật cản cảnh, dốc, thông lối), trần số món, tìm ô hợp lệ gần nhất.
- `web/src/zones/decorEdit.ts` (mới, thuần, vitest) — máy trạng thái chế độ trang trí: `xem` → `cam` (đang cầm: món mới từ danh mục /
  món nhấc lên) → đặt / huỷ (Esc trả món nhấc về chỗ cũ) / cất; phím → việc.
- `web/src/zones/decorMode.ts` — bỏ (thay bằng `decorEdit.ts`); `web/src/zones/walletRules.ts` — `TrialWallet.placed` → `items`,
  `placeTrial` → `setTrialItems`; `web/src/bridge/browserStore.ts` — đọc ví thử cũ (`placed`) → chuyển như Flutter.
- `web/src/zones/tuiDo.ts` — ngăn Đồ trang trí: "Đang đặt" → số món đang đặt ("Đang đặt 3").
- `web/src/collision/colliders.ts` — thêm hỏi chồng lấn (`overlapsBox` / `overlapsObb`, không tính vật cản của chính món) cho kiểm chỗ;
  hộp xoay 45° → vật cản = vài vòng tròn dọc trục dài (Colliders chỉ có hộp thẳng trục + tròn).
- `web/src/scene/spec.ts`, `specCheck.ts`, `decorSlots.ts` → `decorArea.ts` — bỏ `decorSlots`, thêm `decorArea` (mặc định `null` = cảnh
  không trang trí được → cảnh cũ không đổi — quy tắc 8); `vuonLayout.ts` (bỏ kiểm ô sát rào), `web/scripts/check-scene.mjs` (in vùng).
- `design/scene/nha-ta.json`, `design/scene/nha-ta-trong.json` — bỏ `decorSlots`, thêm `decorArea` (**qua `/canh`**, người dùng duyệt
  ảnh vùng — CLAUDE.md: phiên code không tự sửa `design/`).
- `web/src/scene/decorLayer.ts` — dựng theo **danh sách món** (không theo ô), **InstancedMesh theo mã vật** (điểm quyết định 1 / ngân
  sách); bóng ma món đang cầm (xanh / đỏ) + tấm khung chân + lưới 0,5 m quanh món; bỏ dấu ô. `decorItems.ts` — `decorFootprint`
  nhận góc 45°.
- `web/src/homeDecor.ts` — ghép lại theo `decorEdit.ts`; `web/src/input/keyboard.ts` (Q, R, Delete, Backspace thêm vào `KeyAction`
  `decor-*`; E / Enter / Esc khi đang trang trí chuyển cho trang trí); `web/src/input/pointers.ts` (`decorDrag`: ngón / chuột bắt đầu
  trên món đang cầm → kéo món, không xoay camera; chuột di không giữ nút → món theo con trỏ); `web/src/main.ts` (vài dòng).
- `web/src/ui/decorHud.ts`, `ui/decorPanel.ts` (+ CSS) — **chờ thiết kế**: thanh danh mục, nút nổi xoay / đặt / cất, gợi ý phím.
- `app/lib/journey/progress_store.dart` — khoá mới `nha.do` (danh sách món), `homeItems` / `setHomeItems`; `nha.dat` cũ giữ đọc tới khi
  web ghi dạng mới thì xoá; `_adoptOwned` vẫn đọc `nha.dat`. `app/lib/scene/scene_event.dart` (`homeReply` + `setHomeArgs`),
  `scene_view.dart`, `main.dart` (`onSetHome`). Test `app/test/rules/nha_test.dart`, `app/test/scene/scene_event_test.dart`.
- `.claude/skills/lead/SKILL.md` — Bản đồ tính năng dòng "trang trí" (thêm `decorPlace`, `decorEdit`, `decorArea`, `decorLegacy`).

**Cần kiểm tra**
- `web/src/homeGarden.ts` (cùng cảnh; nút vườn ẩn khi trang trí — R-VUON), `web/src/thanhCongCu.ts` (thanh công cụ ẩn / mờ khi trang
  trí), `ui/bagPanel.ts` (ngăn Đồ trang trí), `zones/shopView.ts` + `app/lib/scene/shop_event.dart` + `shop_screen.dart` (tab Tạp hoá
  vẫn theo `DecorItem.slot` Vườn / Sân / Trong nhà — **giữ** làm nhóm hiển thị; chuỗi "mua một lần, đặt được nhiều ô" đổi chữ),
  `scene/kien_truc/nha_o.ts` + `gian_trong.ts` (độ cao sàn), `web/src/nhaPhamVi.test.ts` (đang khẳng định 9 + 3 ô), `scene/decorItems.test.ts`,
  `scene/decorSlots.test.ts`, `zones/decor.test.ts`, `zones/decorMode.test.ts`, `zones/walletRules.test.ts`, `zones/tuiDo.test.ts`,
  `cuoiHac.ts` (chỗ hạ cánh ở nhà = chỗ xuất phát), `designPreview.ts` (Canvas 3D — thêm `?dang=trang-tri` để chụp).
- Hiệu năng: đo fps sân nhà trước / sau với 40 món (Android tầm trung ≥ 30).

**Không đụng**: luật mua / giá (R-TIEN-4, `wallet.dart` `buyDecor`), Vườn rau (luống, thùng, R-VUON-*), danh mục 13 vật + hình dựng
từng vật (`decorItems.ts` builders), cổng / màn tải vào gian trong (R-NHA-1), cảnh `tong-mon`.

## Dữ liệu mới

```ts
/** Một món đã đặt (R-NHA-2, R-NHA-3). */
interface PlacedDecor {
  item: string;            // mã DECOR_ITEMS
  scene: 'nha-ta' | 'nha-ta-trong'; // mã cảnh có `decorArea`
  x: number; z: number;    // tâm, bội 0,5 m (lưới)
  rot: number;             // độ, 0 · 45 · … · 315 (mặt trước nhìn +z khi 0)
}
interface HomeState { items: readonly PlacedDecor[]; owned: readonly string[] }
```

- **Lưu**: Flutter giữ nguyên JSON danh sách (không kiểm, như `nha.dat` hôm nay); trang làm sạch (`cleanHome`: bỏ mã lạ, cảnh lạ, góc
  không bội 45 → làm tròn, ngoài lưới → làm tròn, vượt trần → bỏ món cuối; **món đặt nay không còn hợp lệ** (cảnh đổi) → **cất**, không
  lỗi — R-NHA-3).
- **Cầu nối**: `getHome` → `{items: [...], owned: [...]}` (+ `placed` cũ chừng nào Flutter còn khoá `nha.dat` mà chưa có `nha.do`);
  `setHome {items: [...]}` = **cả danh sách mọi cảnh** (≤ 60 món, vài KB) — đơn giản, ghi đè được, không lệch thứ tự. Flutter nhận
  `setHome` hợp lệ → ghi `nha.do`, xoá `nha.dat`. `setDecor` bỏ (trang mới không gửi; Flutter giữ đọc một bản rồi xoá — không cần,
  trang + app luôn đi cùng nhau trong một bản build).
- **Chuyển dữ liệu cũ** (`migrateHome`, chạy ở trang, lần đầu nạp nhà mà `getHome` chỉ có `placed`): mỗi ô cũ → món {vật, cảnh của ô,
  x / z của ô **làm tròn về lưới 0,5**, rot = rotY của ô (đều 0)}; nếu chỗ đó không hợp lệ theo luật mới (vd. `san-3` (−4; 8) sát lối
  trục) → tìm chỗ hợp lệ gần nhất trong 1,5 m (xoắn ốc trên lưới); không có → **cất** (vật vẫn sở hữu, nằm trong danh mục). Ô lạ (đã bỏ
  từ bản trước) → bỏ như R-NHA-3 hôm nay. Ghi ngay `setHome` một lần. Sở hữu (`owned`) không đụng. Ví thử trình duyệt chuyển cùng hàm.
- **Vùng đặt** (đặc tả cảnh, `SceneSpec.decorArea`, mặc định `null`):
  ```jsonc
  "decorArea": {
    "where": "ngoai",                       // nhóm vật nhận: "ngoai" (Vườn + Sân) | "trong" — điểm quyết định 2
    "bounds": [[x, z], ...],                // đa giác cho phép (đảo: vòng 24 m quanh (0; −2) trừ bến; gian trong: phòng trừ 0,4 m sát tường)
    "keepOut": [{ "from": [x, z], "to": [x, z], "label": "Lối ra Bến mây" }], // hộp cấm vẽ tay (lối trục, Bến mây, lối nhánh tới cửa)
    "maxItems": 40,                         // trần món trong cảnh
    "maxSlope": 0.35                        // chênh cao tối đa trong khung chân (m)
  }
  ```
  Vùng cấm **tự sinh** thêm từ đặc tả có sẵn (không phải ghi tay, khỏi lệch khi dời): ô cổng `portals[].area` + 1 m, chỗ tới
  `portals[].arrive.at` / `player.start` (bãi hạc) tròn 1,5 m, luống `garden.plots` + 0,3 m, thùng `garden.bin` + 1 m, khe cổng vườn
  `garden.fence.gate` (hành lang 2 m trong + ngoài rào), vật cản tĩnh của cảnh (nhà, rào, cây, lan can — hỏi `Colliders`).
- **Ngân sách vẽ**: hôm nay mỗi vật 1 draw call (tranh chữ / đèn lồng sáng 2). Tự do + 40 món → tới 50 draw call — **quá**. Đề xuất gộp
  **InstancedMesh theo mã vật**: ≤ 13 mã + 2 phần sáng = **≤ 15 draw call bất kể số món**; bóng ma + khung chân + lưới khi trang trí
  +3. Vật cản: mỗi món to 1 hộp / tròn (45° → 2–3 tròn).

## Giả định / cần quyết định

Giả định (không hỏi, ghi lại): lưới 0,5 m; góc lưu bước 45°; chế độ trang trí vẫn bấm nút "Trang trí" (nhân vật đứng yên — R-NHA-2);
mỗi lần đặt / nhấc / cất ghi `setHome` ngay (như hôm nay ghi từng ô); trong vườn rau (trong rào) **được đặt** ngoài luống + hành lang
cổng; vật nhỏ không chặn người (như cũ) nhưng vẫn không đè vật khác; trần 40 món sân / 20 món gian trong; món đặt hợp lệ khi nằm trong
một cảnh có `decorArea`. HUD cũ (ô + bảng theo ô) **giữ chạy** tới khi HUD mới áp xong — đổi hẳn một lần (cờ `?trangtri=tudo` để thử).

1. **Số lượng mỗi vật** — (A) **mua một lần, đặt bao nhiêu bản tuỳ ý** trong trần mỗi cảnh (giữ R-TIEN-4, Tạp hoá / ví không đổi) ·
   (B) kiểu 摩尔: mỗi lần mua = 1 cái, đặt 1 cái bớt 1 trong túi (đổi luật mua, Tạp hoá mua lặp, `owned` thành số đếm) · (C) mỗi vật chỉ
   đặt **một chỗ** (đặt chỗ mới = dời). **Đề xuất A** — ít đổi nhất, đúng lời hứa "mua một lần là đủ" đang có; "cất vào túi" = gỡ khỏi
   cảnh, vật vẫn trong danh mục.
2. **Vật nào đặt ở đâu** — (A) **hai nhóm**: ngoài trời (Vườn + Sân: cây, đá, ao, đèn, bàn trà, chậu lan, lư hương) đặt ở sân / vườn;
   trong nhà (tranh chữ, kệ sách, án đọc, bình phong) đặt ở gian trong · (B) mọi vật đặt mọi nơi (ao sen trong phòng, kệ sách ngoài
   sân) · (C) giữ ba loại, vẽ vùng Vườn / Sân riêng trên sân. **Đề xuất A** — bỏ được ranh giới Vườn / Sân vô hình mà vẫn hợp lý;
   tab Tạp hoá vẫn chia ba như cũ.
3. **"Không chắn lối"** kiểm thế nào — (A) chỉ **vùng cấm cố định** (lối trục, Bến mây, trước cửa, cổng vườn…) · (B) A + **kiểm thông
   lối**: khi đặt vật to, tìm đường trên lưới 0,5 m từ chỗ xuất phát tới cổng Bến mây, cửa nhà, cổng vườn, thùng thu mua — bị cắt thì
   đỏ "Chắn lối" · (C) không kiểm, chỉ chặn đè vật. **Đề xuất B** — vùng cấm giữ lối chính, kiểm thông lối bắt chỗ người chơi xếp
   tường bàn trà quây kín (chỉ chạy khi món đổi ô lưới, ~11 000 ô — nhẹ).
4. **Camera khi trang trí** — (A) giữ camera đang chơi, kéo màn trống vẫn xoay (như hôm nay) · (B) **kiểu 摩尔**: vào trang trí camera
   trượt lên cao nhìn chéo (~55°, xa hơn), vẫn xoay / zoom được; Xong → trả về như trước · (C) nhìn thẳng từ trên xuống (bản đồ).
   **Đề xuất B** — đặt đồ dễ thấy lưới, vẫn thấy dáng vật; giống trải nghiệm 摩尔 người dùng muốn.

## Nhiệm vụ

Làm ngay (sau khi duyệt 4 điểm) — 1…12; chờ thiết kế — 13…14; chốt — 15.

- [ ] 1. **Luật** — sửa sổ `docs/testing/quy_tac.md` theo nháp dưới (theo lựa chọn 4 điểm) → `/dong-bo-quy-tac` (tự chép online) →
  `dart tool/rule_trace.dart`. (docs · xong khi sổ + online đồng bộ, `--pending` rỗng)
- [ ] 2. **Cầu nối** — `docs/bridge.md`: `getHome` (thêm `items`, `placed` chỉ khi còn dữ liệu cũ), `setHome` thay `setDecor`; hai phía
  cùng đổi ở NV 6 + NV 10. (docs · xong khi bảng có dạng + ví dụ + "khi nào")
- [ ] 3. **Toán chỗ đặt** — `zones/decorPlace.ts` + `collision/colliders.ts` (`overlapsBox`/OBB): `snap(x)` 0,5; `rotStep(rot, ±45 | 90)`;
  `footprint(item, rot)` OBB (45° đúng hình xoay, không phình hộp); `checkSpot(ctx, món) → ok | 'ngoaiVung' | 'vungCam' (+ nhãn) | 'deVat'
  | 'vatCanh' | 'doc' | 'chanLoi' | 'het'(trần) | 'saiNoi'(nhóm)`; `nearestValid(ctx, món, r)`; BFS thông lối (điểm quyết định 3). Test
  vitest: lưới, xoay 8 hướng, đè ở 45°, mép đa giác, vùng cấm tự sinh từ portal / luống / thùng / start, chắn lối bằng hàng bàn trà, trần.
  (zones + collision · xong khi `npm test` xanh, R-NHA-7 có test)
- [ ] 4. **Dữ liệu + chuyển cũ** — `zones/decor.ts` (`HomeState.items`, `cleanHome` hai dạng, danh mục theo nhóm), `zones/decorLegacy.ts`
  (12 ô đóng băng + `migrateHome`), `walletRules.ts` + `browserStore.ts` (ví thử). Test: mỗi ô cũ → đúng toạ độ / góc; `san-3` không hợp lệ
  → chỗ gần nhất hoặc cất; ô lạ bỏ; thiếu `owned` → khởi đầu + vật đang đặt (R-NHA-4 giữ); bản đã chuyển không chuyển lại. (zones · xong
  khi test R-NHA-3 / R-NHA-4 xanh)
- [ ] 5. **Máy trạng thái trang trí** — `zones/decorEdit.ts`: xem / cầm (mới · nhấc) / đặt / huỷ / cất; phím Q E R Enter Esc Delete
  (+ Backspace) → việc; Esc khi cầm món nhấc = trả chỗ cũ, món mới = bỏ; Esc khi không cầm = thoát chế độ (như nút quay lại); đặt sai chỗ
  → giữ cầm, trả lý do. Test vitest từng chuyển. (zones · xong khi test R-NHA-6 xanh)
- [ ] 6. **Flutter lưu** — `progress_store.dart` (`nha.do`, `homeItems`, `setHomeItems`, xoá `nha.dat` khi đã ghi mới; `_adoptOwned`
  giữ), `scene_event.dart` (`homeReply` + `setHomeArgs` — sai dạng → `null`), `scene_view.dart`, `main.dart`. Test `nha_test.dart`,
  `scene_event_test.dart` (R-NHA-3: ghi → mở lại còn đúng toạ độ / góc; dữ liệu cũ trả `placed`). (app · xong khi `flutter test` xanh)
- [ ] 7. **Đặc tả cảnh** — `spec.ts` (`DecorAreaSpec`, mặc định `null`), `specCheck.ts` + `scene/decorArea.ts` (kiểm đa giác kín, hộp
  cấm trong vùng, `maxItems` 1…60, nhóm hợp lệ), `vuonLayout.ts`, `check-scene.mjs` (in vùng + vùng cấm), bỏ `decorSlots` + `decorSlots.ts`
  + test; `nhaPhamVi.test.ts` đổi sang khẳng định vùng. (scene · xong khi `npm run scene:check` + `npm test` xanh)
- [ ] 8. **Vùng đặt trong `design/scene/`** — qua `/canh`: `decorArea` cho `nha-ta` (đảo trừ bến, vùng cấm lối trục x −1,6…1,6 từ bến tới
  z −9,5, lối nhánh z −1,4 tới cửa, Bến mây) và `nha-ta-trong` (phòng trừ 0,4 m, ô cửa); chụp ảnh vùng (Canvas 3D `?dang=trang-tri` tô vùng
  cho / cấm) cho người dùng duyệt. (design qua /canh · xong khi người dùng duyệt ảnh, CHANGELOG có mục)
- [ ] 9. **Lớp 3D** — `scene/decorLayer.ts` viết lại: `setItems(items)` dựng InstancedMesh theo mã vật (dựng hình một lần / mã, cập nhật ma
  trận khi đổi), vật cản theo món; `decorItems.ts` `decorFootprint` góc 45°; bóng ma món đang cầm (cùng hình, vật liệu nửa trong, tô
  `jade` khi hợp lệ / `lacquer` khi sai — token, phiếu có thể đổi) + tấm khung chân + lưới 0,5 m 4 × 4 m quanh món (1 InstancedMesh vạch);
  ẩn bản thật của món đang nhấc; bắt món dưới con trỏ / ngón (raycast trên khung chân). Đo draw call + fps trước / sau (ghi vào kế hoạch).
  Test `decorItems.test.ts` (khung xoay nằm gọn), test khung chân ↔ vật cản. (scene · xong khi 40 món sân ≤ 15 draw call cho đồ trang trí)
- [ ] 10. **Ghép + nhập** — `homeDecor.ts` theo `decorEdit.ts` + `decorLayer.ts`, nạp → `migrateHome` → `setHome`; `input/keyboard.ts`
  (`KeyAction` mới, đang trang trí thì Q E R Enter Esc Delete về trang trí — E không "ngồi", Enter không mở trò chuyện); `input/pointers.ts`
  (`decorDrag`: bắt đầu trên món đang cầm → kéo món, nơi khác → xoay camera như cũ; chuột di không giữ = món theo con trỏ, click = đặt; chạm
  món đã đặt = nhấc); camera trang trí (điểm 4) ở `input/orbitCamera.ts`; `main.ts` vài dòng. Chạy được bằng phím + chuột sau cờ
  `?trangtri=tudo` **khi chưa có HUD mới** (chỉ nhấc / dời / xoay / cất món đã có — món mới cần danh mục, NV 13). (input + gốc · xong khi
  thử trình duyệt: nhấc mai, Q xoay 45°, đặt đỏ trên lối trục bị từ chối, Esc trả chỗ cũ)
- [ ] 11. **Túi đồ** — `zones/tuiDo.ts` ngăn Đồ trang trí đếm "Đang đặt n" từ `items` (+ dạng cũ). Test `tuiDo.test.ts`. (zones · xong khi
  R-TUI-1 test xanh)
- [ ] 12. **Canvas 3D + đo** — `designPreview.ts` `?dang=trang-tri` (vùng cho / cấm, vài món mẫu, bóng ma đỏ / xanh) để ảnh phiếu + so; đo
  fps Android tầm trung trước / sau (rule 4). (scene / gốc · xong khi có ảnh + số đo)
- [ ] 13. **HUD trang trí mới** — chờ thiết kế (`docs/phieu_thiet_ke/2026-11-15-trang-tri-tu-do.md`): thanh / bảng danh mục khi không còn
  ô (cách mở, chạm thẻ → món hiện để cầm), nút nổi cạnh món (xoay · đặt · cất · huỷ) trên điện thoại, gợi ý phím trên máy tính, viên nhắc
  + lý do đỏ ("Chắn lối ra Bến mây"…), nút "Xong", đếm "12 / 40". `ui/decorHud.ts`, `ui/decorPanel.ts` (+ CSS) viết lại theo thiết kế;
  bỏ cờ `?trangtri=tudo` (bật hẳn), bỏ dấu ô. (ui · xong khi `/ui-apply` mục thiết kế áp, kiểm dọc + ngang + máy tính)
- [ ] 14. **Chuỗi Tạp hoá** — dòng "mua một lần, đặt được nhiều ô" → theo thiết kế (phiếu mục 6) ở `shop_screen.dart` + `shopPanel.ts`.
  Chờ thiết kế.
- [ ] 15. **Chốt** — Bản đồ tính năng trong `lead/SKILL.md`; dọn rác (`decorMode.ts`, `decorSlots.ts`, `addDecorMarkers`, chuỗi ô cũ
  `decorSlot*`, test cũ); `npm run build`; Kiểm tra cuối.

Ước lượng: NV 1–2 nhỏ · 3 vừa-lớn (toán OBB + BFS) · 4–7 vừa · 8 nhỏ (+ chờ duyệt ảnh) · 9 lớn · 10 vừa-lớn · 11–12 nhỏ · 13 vừa (sau
thiết kế) · tổng **lớn** (~2–3 phiên làm; NV 3–7 làm song song được thành 2 nhánh: web thuần 3–5 / Flutter 6).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart · thử máy: điện thoại dọc + ngang (kéo món, nút nổi), máy
tính (Q / E / R / Enter / Esc / Delete), mở lại app còn đúng chỗ + góc, bản cũ có đồ ở ô → lên bản mới đồ ở đúng chỗ.

## Nháp luật (chưa sửa sổ — theo đề xuất A / A / B / B)

- **R-NHA-2 (sửa) — Đặt đồ tự do**: không còn ô đặt sẵn. Ở nhà, chế độ trang trí (nút "Trang trí"; đang trang trí nhân vật đứng yên)
  cho **đặt vật đã sở hữu ở bất cứ chỗ nào hợp lệ** (R-NHA-7): vật **ngoài trời** (Trúc cảnh, Mai, Tùng, Đá Thái Hồ, Ao sen, Đèn lồng,
  Bàn trà, Chậu lan, Lư hương) ở sân / vườn; vật **trong nhà** (Tranh chữ, Kệ sách, Án đọc, Bình phong) ở gian trong. Một vật đặt được
  **nhiều bản** — mua một lần là đủ — tới **trần 40 món ở sân, 20 món ở gian trong** (đủ trần → danh mục báo "Đã đủ 40 món — cất bớt để
  đặt thêm"). Thao tác: **lấy** vật từ danh mục → cầm; **nhấc** món đã đặt → cầm; món đang cầm **dời** theo lưới 0,5 m, **xoay** từng
  45° (8 hướng); **đặt** (chỉ khi hợp lệ); **huỷ** (món nhấc về chỗ cũ, món mới bỏ); **cất** (món biến khỏi cảnh, vật vẫn sở hữu). Vật hiện
  ngay trong cảnh. Vật to (bàn trà, kệ sách, bình phong, đá cảnh, ao sen) chặn người đi; vật nhỏ không chặn. Mỗi nơi chỉ thấy và trang trí
  món của nơi đó. Luống vườn rau, thùng thu mua không phải đồ trang trí (R-VUON-1). · Ví dụ: Lấy "Mai" → cầm mai, đặt ở (8; 4) → mai đứng
  đó; lấy "Mai" lần nữa đặt ở (10; 4) → hai cây mai. Nhấc mai thứ nhất, xoay 45° hai lần, đặt → mai quay 90°. Ở gian trong, danh mục chỉ có
  Tranh chữ, Kệ sách, Án đọc, Bình phong. Đặt Bàn trà ở (−6; 4) → đi vào chỗ bàn bị chặn.
- **R-NHA-3 (sửa) — Lưu nhà**: mỗi món giữ **vật, nơi, chỗ, hướng** qua những lần mở app, cả khi đi vùng khác rồi về (trình duyệt không
  Flutter: lưu trong trình duyệt — R-TIEN-7). Nhà là của riêng người chơi. Mới cài → chưa món nào. Vật không còn trong danh mục → bỏ qua;
  món mà bản mới không còn đặt hợp lệ (đổi cảnh) → **cất**, không lỗi. **Từ bản có ô** (trước V-69): vật ở mỗi ô cũ thành một món đứng
  **đúng chỗ ô đó** (làm tròn về lưới 0,5 m), cùng hướng; chỗ ô nay không hợp lệ → món dời tới chỗ hợp lệ gần nhất trong 1,5 m, không có
  → cất. Không mất vật nào. · Ví dụ: Đặt Mai ở (8; 4) quay 45°, Đèn lồng ở (−11; −3) → tắt, mở lại → đúng chỗ, đúng hướng. Bản cũ có Mai ở
  ô `vuon-1` (−6; −13), Tranh chữ ở ô `trong-2` → lên bản mới: Mai ở (−6; −13) hướng nam ở sân, Tranh chữ ở (0; −3,5) gian trong.
- **R-NHA-4 (sửa nhỏ)**: thẻ "Đang đặt ở ô này" → số bản đang đặt ở nơi này ("Đang đặt 2"); "gỡ vật khỏi ô" → "cất món"; dữ liệu cũ giữ
  nguyên (vật đang đặt ở ô lúc lên bản Văn tiền tính là đã có).
- **R-NHA-5 (sửa nhỏ)**: "chỗ trống để người chơi tự đặt đồ vào 12 ô (9 ô Sân / Vườn ở sân, 3 ô Trong nhà ở gian trong)" → "chỗ trống
  để người chơi tự đặt đồ (R-NHA-2, R-NHA-7)".
- **R-NHA-6 (mới) — Thao tác trang trí**: **máy tính** — món đang cầm đi theo con trỏ chuột trên nền (lưới 0,5 m); **Q** xoay trái 45°,
  **E** xoay phải 45°, **R** xoay 90°; **click** hoặc **Enter** đặt; **Esc** huỷ (không cầm gì → thoát chế độ trang trí); **Delete** (hoặc
  Backspace) cất món đang cầm; click món đã đặt → nhấc; kéo nền trống → xoay camera. Khi trang trí, E không ngồi, Enter không mở trò
  chuyện, WASD không đi. **Điện thoại** — chạm vật trong danh mục → món hiện ở chỗ hợp lệ gần giữa màn; kéo món bằng một ngón → dời; kéo
  ngoài món → xoay camera, chụm → zoom; chạm món đã đặt → nhấc; nút nổi cạnh món: **Xoay** (45°), **Đặt**, **Cất** (+ Huỷ). Đang cầm: món
  **xanh** khi chỗ hợp lệ, **đỏ** khi không (kèm lý do ngắn — R-NHA-7); đặt khi đỏ → không đặt, vẫn cầm. Vào trang trí camera lên cao nhìn
  chéo, vẫn xoay / zoom; "Xong" → camera về như trước. · Ví dụ: Máy tính: click mai đã đặt → cầm, Q → quay 45° trái, đưa chuột lên lối trục
  → mai đỏ "Chắn lối", click → không đặt; đưa ra bãi cỏ → xanh, Enter → đặt. Esc khi đang cầm mai vừa nhấc → mai về chỗ cũ. Điện thoại: kéo
  bàn trà bằng ngón sang phải 2 m → bàn dời theo lưới, nút Đặt → đặt.
- **R-NHA-7 (mới) — Chỗ đặt hợp lệ**: món đặt được khi cả **chân món** (khung bao theo hướng) nằm trong vùng đặt của nơi đó (sân: trong
  đảo, không trên Bến mây, không quá dốc — chênh cao trong chân ≤ 0,35 m; gian trong: trong phòng, cách tường ≥ 0,4 m) và **không** đè:
  lối lát trục từ Bến mây lên cổng Vườn rau, lối nhánh tới cửa nhà chính, ô cửa nhà / ô cửa phòng, vòng sáng ra Bến mây, chỗ xuất phát /
  bãi hạc (1,5 m quanh (0; 6,5) và (0; 10)), luống vườn rau (+0,3 m), thùng thu mua (+1 m), lối qua cổng vườn, nhà / rào / cây / lan can
  của cảnh, món khác; và vật to **không cắt đường đi** từ chỗ xuất phát tới vòng sáng Bến mây, cửa nhà chính, cổng vườn, thùng thu mua.
  Lý do khi đỏ: "Ngoài chỗ đặt", "Lối đi", "Cửa nhà", "Luống rau", "Thùng thu mua", "Đè vật khác", "Dốc quá", "Chắn lối", "Đã đủ 40 món".
  · Ví dụ: Đặt Ao sen ở (0; 0) (lối trục) → đỏ "Lối đi". Đặt Mai sát Mai khác (khung chồng) → đỏ "Đè vật khác". Xếp 6 bàn trà quây kín cổng
  vườn → bàn thứ 6 đỏ "Chắn lối". Đặt Chậu lan trong rào vườn giữa hai luống cách ≥ 0,3 m → được.
- **R-TUI-1 (sửa nhỏ)**: ngăn Đồ trang trí "vật đã có, đánh dấu vật đang đặt" → "vật đã có, kèm số bản đang đặt (mọi nơi ở nhà)";
  chân "đặt đồ ở chế độ trang trí" giữ.
