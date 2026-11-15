# Trang trí tự do — đặt đồ ở bất cứ đâu trong nhà, xoay, kéo kiểu 摩尔; đồ trang trí tính theo số cái
- Yêu cầu: "khi trang trí trong vườn tôi muốn tùy ý di chuyển đồ trang trí rồi xoay đồ trang trí theo các hướng dựa vào thao tác
  bàn phím, nói chung là cách thao tác giống của 摩尔"
- Người dùng đã chọn (V-20261115-69): phạm vi **mọi nơi ở nhà** — sân, vườn (`nha-ta`), gian trong (`nha-ta-trong`) — **bỏ hết ô
  trang trí cố định**; đặt tự do trên nền được phép (không chắn lối ra Bến mây, cửa nhà, cổng vườn, luống rau, thùng thu mua, chỗ
  xuất phát / bãi hạc; không đè vật khác). Thao tác: **máy tính** — chuột di / kéo theo **lưới 0,5 m**, **Q / E xoay 45°**, **R xoay
  90°**, **Enter / click đặt**, **Esc huỷ**, **Delete cất vào túi**; **điện thoại** — kéo món bằng ngón, nút **xoay / đặt / cất**
  nổi cạnh món. Món **đỏ** khi đặt sai chỗ.
- Quyết định (người dùng 2026-11-15): **1B** — kiểu 摩尔, **mua mỗi lần 1 cái** (muốn 3 cây mai thì mua 3 lần), sở hữu = số lượng
  (đang đặt + trong túi), cất → về túi · **2A** — hai nhóm ngoài trời / trong nhà · **3B** — vùng cấm + kiểm còn đường đi ·
  **4B** — vào trang trí camera nâng nhìn chéo ~55°.
- Loại: sửa hành vi + dữ liệu (đổi dạng lưu, chuyển dữ liệu cũ, đổi luật mua) + giao diện mới · Cỡ: **lớn** · Trạng thái: **đã duyệt 2026-11-15** (người dùng chọn 1B mua từng cái, 2A hai nhóm, 3B vùng cấm + còn đường đi, 4B camera ~55°)
  (kế hoạch đã theo 4 lựa chọn) — phần HUD + Tạp hoá **chờ thiết kế** (`docs/phieu_thiet_ke/2026-11-15-trang-tri-tu-do.md`)

## Phạm vi

**Sẽ sửa**
- `docs/testing/quy_tac.md` — R-NHA-2, R-NHA-3, R-NHA-4, R-NHA-5 (bỏ "12 ô"), R-TIEN-4 (mua lặp, × 1), R-TIEN-7 (ví thử: số lượng),
  R-TUI-1 (ngăn Đồ trang trí: trong túi / đang đặt); thêm R-NHA-6 (thao tác), R-NHA-7 (chỗ đặt hợp lệ). Nháp ở cuối kế hoạch.
- `docs/bridge.md` — `getHome`: `owned` từ danh sách mã → **số cái mỗi vật** (`{mai: 3}`), thêm `items`; `setDecor` (theo ô) →
  `setHome` (cả danh sách món); `openShop` trả lời / trang hỏi lại `getHome` như cũ (số lượng nằm trong `owned`).
- **Luật mua (Dart gốc)** `app/lib/journey/wallet.dart` — `buyDecor` mua lặp được (bỏ `BuyError.owned`), trả `owned` dạng số lượng
  (`Map<String, int>`), `migrateOwned` → `migrateOwnedCounts(oldOwned, oldPlaced)`; `starterDecor` = mỗi vật 1 cái. Chép sang
  `web/src/zones/walletRules.ts` (`buyTrial`, ví thử) — đổi luật sửa cả hai (như hôm nay).
- `app/lib/journey/progress_store.dart` — khoá số lượng mới `nha.so-luong` (JSON `{mã: n}`), khoá món `nha.do` (danh sách món);
  `nha.so-huu` + `nha.dat` cũ đọc để chuyển rồi xoá; `homeItems` / `setHomeItems` (kiểm **số bản đang đặt mỗi vật ≤ số sở hữu**, sai
  → không ghi, `false`); `buyDecor`. `app/lib/scene/scene_event.dart` (`homeReply`, `setHomeArgs`), `scene_view.dart`, `main.dart`
  (`onSetHome`, Tạp hoá nhận số lượng + số đang đặt).
- **Tạp hoá** — `app/lib/lesson/shop_screen.dart` (thẻ đồ trang trí "Trong túi: n · Đang đặt: m", không còn "Đã có", bỏ trạng thái
  "đã mua hết", hộp xác nhận × 1, tấm "Vừa mua" chữ mới — **chờ thiết kế** phần hình, luật làm trước), `app/lib/scene/shop_event.dart`;
  bản web `web/src/zones/shopView.ts` (`CardState` bỏ `owned`), `web/src/ui/shopPanel.ts`.
- `web/src/zones/decor.ts` — `HomeState = {items, owned: Record<mã, số>}`; `inBag(home, mã) = owned − số đang đặt`; danh mục theo
  **nơi** (ngoài trời / trong nhà) kèm trong túi / đang đặt; `cleanHome` đọc dạng mới + dạng cũ.
- `web/src/zones/decorLegacy.ts` (mới) — bảng **12 ô cũ đóng băng** (mã, cảnh, x, z, rotY — chép từ `nha-ta.json` / `nha-ta-trong.json`
  hiện nay) + `migrateHome(raw)` ô → món + số lượng.
- `web/src/zones/decorPlace.ts` (mới, thuần, vitest) — lưới 0,5 m, xoay bước 45°, khung chân xoay (OBB), kiểm chỗ hợp lệ, kiểm còn
  đường đi, trần số món, tìm chỗ hợp lệ gần nhất.
- `web/src/zones/decorEdit.ts` (mới, thuần, vitest) — máy trạng thái trang trí: `xem` → `cam` (món mới lấy từ túi / món nhấc lên) →
  đặt / huỷ / cất; phím → việc.
- `web/src/zones/decorMode.ts` — bỏ (thay bằng `decorEdit.ts`); `web/src/bridge/browserStore.ts` — đọc ví thử cũ → chuyển như Flutter.
- `web/src/zones/tuiDo.ts` — ngăn Đồ trang trí: "Trong túi n · Đang đặt m".
- `web/src/collision/colliders.ts` — hỏi chồng lấn (`overlapsBox` / OBB) cho kiểm chỗ; vật to xoay 45° → 2–3 vòng tròn dọc trục dài.
- `web/src/scene/spec.ts`, `specCheck.ts`, `decorSlots.ts` → `decorArea.ts` — bỏ `decorSlots`, thêm `decorArea` (mặc định `null` = không
  trang trí được → cảnh cũ không đổi — quy tắc 8); `vuonLayout.ts`, `web/scripts/check-scene.mjs`.
- `design/scene/nha-ta.json`, `design/scene/nha-ta-trong.json` — bỏ `decorSlots`, thêm `decorArea` (**qua `/canh`**, người dùng duyệt ảnh).
- `web/src/scene/decorLayer.ts` — dựng theo **danh sách món**, **InstancedMesh theo mã vật**; bóng ma món đang cầm (xanh / đỏ) + khung
  chân + lưới 0,5 m; bỏ dấu ô. `decorItems.ts` — `decorFootprint` góc 45°.
- `web/src/homeDecor.ts` (ghép lại), `web/src/input/keyboard.ts` (Q, R, Delete, Backspace; E / Enter / Esc khi trang trí về trang trí),
  `web/src/input/pointers.ts` (`decorDrag`), `web/src/input/orbitCamera.ts` (camera trang trí ~55°), `web/src/main.ts` (vài dòng).
- `web/src/ui/decorHud.ts`, `ui/decorPanel.ts` (+ CSS) — **chờ thiết kế**.
- `.claude/skills/lead/SKILL.md` — Bản đồ tính năng (dòng trang trí + Văn tiền).

**Cần kiểm tra**
- `web/src/homeGarden.ts` (HUD vườn ẩn khi trang trí), `web/src/thanhCongCu.ts`, `ui/bagPanel.ts`, `ui/wallet.ts` (nhãn "−n · {vật}" khi mua
  ở Tạp hoá web), `scene/kien_truc/nha_o.ts` + `gian_trong.ts` (độ cao sàn), `cuoiHac.ts` (chỗ hạ cánh = chỗ xuất phát), `designPreview.ts`
  (thêm `?dang=trang-tri`); test cũ: `nhaPhamVi.test.ts`, `scene/decorItems.test.ts`, `scene/decorSlots.test.ts`, `zones/decor.test.ts`,
  `zones/decorMode.test.ts`, `zones/walletRules.test.ts`, `zones/shopView.test.ts`, `zones/tuiDo.test.ts`, `app/test/rules/nha_test.dart`,
  `app/test/rules/*tien*` / `wallet_test.dart`, `app/test/lesson/shop_screen_test.dart`, `app/test/scene/scene_event_test.dart`.
- Hiệu năng: đo fps sân nhà trước / sau với 40 món (Android tầm trung ≥ 30).

**Không đụng**: bảng giá 13 vật (giá giữ nguyên), luật thưởng / trần thưởng trò chơi (R-TIEN-1…3, 5, 8), Vườn rau (R-VUON-*; hạt giống
vẫn × 1 · × 5 · × 10), hình dựng từng vật (`decorItems.ts` builders), cổng / màn tải gian trong (R-NHA-1), cảnh `tong-mon`.

## Dữ liệu mới

```ts
/** Một món đã đặt (R-NHA-2, R-NHA-3). */
interface PlacedDecor {
  item: string;            // mã DECOR_ITEMS
  scene: 'nha-ta' | 'nha-ta-trong'; // cảnh có `decorArea`
  x: number; z: number;    // tâm, bội 0,5 m (lưới)
  rot: number;             // độ, 0 · 45 · … · 315 (mặt trước nhìn +z khi 0)
}
interface HomeState {
  items: readonly PlacedDecor[];
  /** số cái sở hữu mỗi vật (đang đặt + trong túi) — R-NHA-4 */
  owned: Readonly<Record<string, number>>;
}
// trong túi = owned[mã] − số món mã đó đang đặt (mọi cảnh) — tính ra, không lưu riêng → không lệch
```

- **Bất biến**: số món đang đặt của mỗi vật ≤ số sở hữu. Trang kiểm trước khi lấy vật ra (trong túi 0 → không lấy được, thẻ "Mua ở Tạp
  hoá"); Flutter kiểm lại khi nhận `setHome` (vượt → không ghi, trả `false`, trang báo và nạp lại).
- **Mua** (R-TIEN-4): mỗi lần **1 cái** (không × 5 / × 10 — đồ trang trí đắt, mua nhầm 10 bàn trà = 1000 Văn tiền; hạt giống vẫn × 1 / 5 / 10),
  trừ đúng giá, `owned[mã] += 1`, cái mới vào **túi** (không tự ra nhà). Mua lặp không giới hạn (trần là số **món đặt** mỗi cảnh, không phải
  số mua). Thiếu tiền → "Còn thiếu n". Không còn "Đã có" / "đã mua hết".
- **Cầu nối**: `getHome` → `{items: [...], owned: {mai: 3, 'truc-canh': 1}}` (+ `placed` cũ chừng nào Flutter còn `nha.dat` mà chưa có
  `nha.do`); `setHome {items: [...]}` = cả danh sách mọi cảnh (≤ 60 món). Flutter: hợp lệ → ghi `nha.do`, xoá `nha.dat`, `true`; vượt sở hữu
  / sai dạng → `false`. Trang chỉ đọc `owned` (mua chỉ ở Tạp hoá). `owned` còn dạng mảng (bản cũ) → trang coi mỗi mã 1 cái.
- **Chuyển dữ liệu cũ** — hai nửa, mỗi nửa ở chỗ có đủ dữ liệu:
  - **Số lượng (Flutter, `migrateOwnedCounts`; ví thử: bản TS)** — lần đầu mở bản mới, chưa có `nha.so-luong`: mỗi vật trong `nha.so-huu`
    cũ = **1 cái**; vật đang đặt ở **nhiều ô** cũ (luật cũ: mua 1 lần đặt nhiều ô) → số cái = **số ô đang đặt vật đó** (tặng thêm bản cho khỏi
    mất đồ); chưa có cả `nha.so-huu` (bản trước Văn tiền) → 3 vật khởi đầu 1 cái + vật đang đặt theo số ô. Ví dụ: sở hữu Mai, Tùng; Mai ở 3
    ô, Tùng không đặt → Mai 3, Tùng 1. Ghi `nha.so-luong`, xoá `nha.so-huu`.
  - **Chỗ đặt (trang, `migrateHome`)** — `getHome` chỉ có `placed`: mỗi ô cũ → món {vật, cảnh của ô, x / z ô **làm tròn về lưới 0,5**, rot =
    rotY ô (đều 0)}; chỗ đó nay không hợp lệ (vd. `san-3` (−4; 8) sát lối trục) → chỗ hợp lệ gần nhất trong 1,5 m (xoắn ốc trên lưới); không
    có → **cất** (về túi — số sở hữu đã tính đủ ở nửa trên nên túi +1). Ô lạ (bỏ từ trước) → bỏ như R-NHA-3 hôm nay. Ghi `setHome` một lần.
    Không mất cái nào: mọi bản đang đặt hoặc đứng ở nhà, hoặc nằm trong túi.
- **Vùng đặt** (đặc tả cảnh `decorArea`, mặc định `null`):
  ```jsonc
  "decorArea": {
    "where": "ngoai",                       // nhóm vật nhận: "ngoai" (Vườn + Sân) | "trong"
    "bounds": [[x, z], ...],                // đa giác cho phép (đảo: vòng 24 m quanh (0; −2) trừ bến; gian trong: phòng trừ 0,4 m sát tường)
    "keepOut": [{ "from": [x, z], "to": [x, z], "label": "Lối đi" }], // hộp cấm vẽ tay (lối trục, lối nhánh tới cửa, Bến mây)
    "maxItems": 40,                         // trần món trong cảnh (gian trong 20)
    "maxSlope": 0.35                        // chênh cao tối đa trong khung chân (m)
  }
  ```
  Vùng cấm **tự sinh** thêm từ đặc tả có sẵn: ô cổng `portals[].area` + 1 m, chỗ tới `portals[].arrive.at` / `player.start` (bãi hạc) tròn 1,5 m,
  luống `garden.plots` + 0,3 m, thùng `garden.bin` + 1 m, khe cổng vườn (hành lang 2 m trong + ngoài rào), vật cản tĩnh (hỏi `Colliders`).
  **Còn đường đi** (3B): khi vật to đổi ô lưới, tìm đường trên lưới 0,5 m (≈ 11 000 ô) từ chỗ xuất phát tới vòng sáng Bến mây, ô cửa nhà
  chính, cổng vườn, thùng thu mua (gian trong: chỗ tới → ô cửa phòng); mất đường → đỏ "Chắn lối".
- **Ngân sách vẽ**: InstancedMesh theo mã vật → ≤ 13 mã + 2 phần sáng = **≤ 15 draw call bất kể số món**; khi trang trí +3 (bóng ma, khung
  chân, lưới). Vật cản: mỗi món to 1 hộp / tròn (45° → 2–3 tròn).

## Giả định / cần quyết định

Đã quyết: 1B, 2A, 3B, 4B (trên). Giả định (không hỏi, ghi lại):
- Đồ trang trí mua **chỉ × 1** mỗi lần (đắt; hạt giống giữ × 1 / × 5 / × 10). Không bán lại đồ trang trí (chưa có yêu cầu).
- Vật khởi đầu: Trúc cảnh, Đèn lồng, Tranh chữ — **mỗi vật 1 cái**, trong túi.
- Trần 40 món sân / 20 món gian trong (trần số món đặt, không phải số mua); lưới 0,5 m; góc lưu bước 45°.
- Mỗi lần đặt / nhấc-đặt / cất → `setHome` ngay. Trong rào vườn rau **được đặt** ngoài luống + hành lang cổng. Vật nhỏ không chặn người
  nhưng vẫn không đè vật khác.
- HUD ô cũ **giữ chạy** tới khi HUD mới áp — luật mua + số lượng + chuyển dữ liệu lên trước thì HUD ô cũ phải hiểu số lượng (một ô = một
  cái; thẻ khoá khi trong túi 0) — xem NV 7. Thử chế độ mới bằng cờ `?trangtri=tudo`.

## Nhiệm vụ

Làm ngay 1…13; chờ thiết kế 14…15; chốt 16.

- [ ] 1. **Luật** — sửa sổ `docs/testing/quy_tac.md` theo nháp dưới → `/dong-bo-quy-tac` (tự chép online) → `dart tool/rule_trace.dart`.
  (docs · xong khi sổ + online đồng bộ, `--pending` rỗng)
- [ ] 2. **Cầu nối** — `docs/bridge.md`: `getHome` (`owned` số lượng, `items`, `placed` chỉ khi còn cũ), `setHome` thay `setDecor`, ghi chú
  `openShop` (Tạp hoá nhận số lượng + đang đặt). (docs · xong khi bảng có dạng + ví dụ + "khi nào")
- [ ] 3. **Luật mua + số lượng (Dart gốc)** — `wallet.dart`: `buyDecor` mua lặp × 1 trả `Map<String,int>`, `migrateOwnedCounts`;
  `progress_store.dart` khoá `nha.so-luong`, chuyển `nha.so-huu` + `nha.dat`. Test `wallet_test.dart` / `nha_test.dart`: mua Mai 2 lần → 2;
  thiếu tiền; chuyển: sở hữu Mai + Mai ở 3 ô → 3; bản trước Văn tiền → khởi đầu 1 + đang đặt theo số ô. (app · R-TIEN-4, R-NHA-4 xanh)
- [ ] 4. **Bản TS luật mua** — `walletRules.ts` (`buyTrial`, ví thử `owned` số lượng + chuyển ví thử cũ), `browserStore.ts`, `shopView.ts`
  (thẻ: mua được / còn thiếu; trong túi / đang đặt). Test vitest cùng ví dụ với Dart. (zones · R-TIEN-7 xanh)
- [ ] 5. **Toán chỗ đặt** — `zones/decorPlace.ts` + `collision/colliders.ts`: `snap` 0,5; `rotStep` ±45 / 90; OBB khung chân (45° đúng
  hình xoay); `checkSpot → ok | 'ngoaiVung' | 'vungCam'(+ nhãn) | 'deVat' | 'vatCanh' | 'doc' | 'chanLoi' | 'het'(trần) | 'saiNoi'`;
  `nearestValid`; tìm đường còn lối. Test: lưới, 8 hướng, đè ở 45°, mép đa giác, vùng cấm tự sinh, hàng bàn trà chắn cổng vườn, trần.
  (zones + collision · R-NHA-7 xanh)
- [ ] 6. **Dữ liệu nhà + chuyển chỗ đặt** — `zones/decor.ts` (`HomeState`, `inBag`, danh mục theo nơi, `cleanHome` hai dạng — `owned`
  mảng → 1 cái mỗi mã), `zones/decorLegacy.ts` (12 ô + `migrateHome`). Test: mỗi ô cũ → đúng toạ độ / góc; `san-3` → chỗ gần nhất hoặc cất
  (túi +1); Mai ở 3 ô + Mai 3 cái → 3 món, túi 0; ô lạ bỏ; đã chuyển không chuyển lại. (zones · R-NHA-3 xanh)
- [ ] 7. **HUD ô cũ hiểu số lượng (cầu tạm, đến NV 14)** — `zones/decorMode.ts`: thẻ đặt được khi trong túi > 0 (một ô = một cái), gỡ → về
  túi; Tạp hoá thẻ bỏ "Đã có". Không thêm giao diện mới — chỉ đổi điều kiện khoá trên thẻ có sẵn. (zones · test `decorMode.test.ts`)
- [ ] 8. **Máy trạng thái trang trí** — `zones/decorEdit.ts`: lấy từ túi (túi 0 → không lấy) / nhấc / đặt / huỷ (món nhấc về chỗ cũ, món mới về
  túi) / cất (về túi +1); Q E R Enter Esc Delete (+ Backspace); Esc không cầm = thoát. Test từng chuyển. (zones · R-NHA-6 xanh)
- [ ] 9. **Flutter lưu món + Tạp hoá** — `progress_store.dart` (`nha.do`, `homeItems`, `setHomeItems` kiểm ≤ sở hữu, xoá `nha.dat`),
  `scene_event.dart` (`homeReply` số lượng, `setHomeArgs`), `scene_view.dart`, `main.dart`; `shop_screen.dart` + `shop_event.dart` luật mua lặp
  (thẻ hiện số "Trong túi / Đang đặt" bằng kiểu chữ có sẵn tới khi có thiết kế). Test `nha_test.dart`, `scene_event_test.dart`,
  `shop_screen_test.dart`. (app · `flutter test` xanh)
- [ ] 10. **Đặc tả cảnh** — `spec.ts` (`DecorAreaSpec`, mặc định `null`), `specCheck.ts` + `scene/decorArea.ts`, `vuonLayout.ts`,
  `check-scene.mjs`, bỏ `decorSlots` (+ `decorSlots.ts`, test) **khi NV 14 áp** — trước đó hai trường cùng có; `nhaPhamVi.test.ts`.
  (scene · `scene:check` + `npm test` xanh)
- [ ] 11. **Vùng đặt trong `design/scene/`** — qua `/canh`: `decorArea` cho `nha-ta` (đảo trừ bến; cấm lối trục x −1,6…1,6 từ bến tới z −9,5,
  lối nhánh z −1,4 tới cửa, Bến mây) và `nha-ta-trong` (phòng trừ 0,4 m, ô cửa); ảnh Canvas 3D `?dang=trang-tri` tô vùng cho / cấm để người
  dùng duyệt. (design qua /canh · xong khi duyệt + CHANGELOG)
- [ ] 12. **Lớp 3D** — `scene/decorLayer.ts` viết lại (`setItems`, InstancedMesh theo mã, vật cản theo món, ẩn bản thật món đang nhấc, bắt món
  dưới con trỏ bằng khung chân); `decorItems.ts` 45°; bóng ma `jade` / `lacquer` (token tạm — phiếu chốt) + khung chân + lưới 4 × 4 m. Đo
  draw call + fps trước / sau. (scene · 40 món ≤ 15 draw call đồ trang trí)
- [ ] 13. **Ghép + nhập + camera** — `homeDecor.ts`, `keyboard.ts`, `pointers.ts` (`decorDrag`: bắt đầu trên món cầm → kéo món, nơi khác
  xoay camera; chuột di không giữ = món theo con trỏ; click = đặt; chạm món đặt = nhấc), `orbitCamera.ts` (trượt lên ~55°, Xong → về),
  `main.ts`, Canvas 3D `?dang=trang-tri`, Túi đồ (`tuiDo.ts` "Trong túi n · Đang đặt m"). Chạy sau cờ `?trangtri=tudo` khi chưa có HUD (nhấc /
  dời / xoay / cất món đã có bằng phím + chuột). (gốc + input · thử trình duyệt: nhấc mai, Q 45°, đỏ trên lối trục, Esc về chỗ cũ, Delete → túi +1)
- [ ] 14. **HUD trang trí mới** — chờ thiết kế (phiếu mục 1–5): danh mục khi không còn ô (thẻ trong túi / hết → Tạp hoá), nút nổi Xoay / Đặt /
  Cất / Huỷ, gợi ý phím, lý do đỏ, đếm món, Xong. `ui/decorHud.ts`, `ui/decorPanel.ts` (+ CSS); bỏ cờ, bỏ ô (NV 10), bỏ cầu tạm NV 7.
  (ui · `/ui-apply`, kiểm dọc + ngang + máy tính)
- [ ] 15. **Tạp hoá đồ trang trí theo số cái** — chờ thiết kế (phiếu mục 6): thẻ "Trong túi: n · Đang đặt: m", hộp xác nhận × 1, tấm "Vừa
  mua", dòng phụ — `shop_screen.dart` + `ui/shopPanel.ts`. (lesson + ui · `/ui-apply`)
- [ ] 16. **Chốt** — Bản đồ tính năng `lead/SKILL.md`; dọn rác (`decorMode.ts`, `decorSlots.ts`, `addDecorMarkers`, chuỗi `decorSlot*`,
  `BuyError.owned`, `migrateOwned`, trạng thái Tạp hoá "đã mua hết", test cũ); `npm run build`; Kiểm tra cuối.

Ước lượng: 1–2 nhỏ · 3–4 vừa · 5 vừa-lớn (OBB + tìm đường) · 6–9 vừa · 10–11 nhỏ (+ chờ duyệt ảnh) · 12 lớn · 13 vừa-lớn · 14–15 vừa (sau
thiết kế) · tổng **lớn** (~3 phiên; song song được 3 nhánh: Dart 3 + 9 / web thuần 4–8 / 3D 10–13).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/scene test/lesson · dart tool/rule_trace.dart · thử máy: điện thoại dọc + ngang (kéo món, nút
nổi), máy tính (Q / E / R / Enter / Esc / Delete), mua Mai 3 lần → đặt 3 cây, cái thứ 4 không lấy được; mở lại app còn đúng chỗ + góc; bản cũ
có Mai ở 3 ô → lên bản mới 3 cây Mai đúng chỗ, sở hữu 3.

## Nháp luật (chưa sửa sổ — theo 1B / 2A / 3B / 4B)

- **R-NHA-2 (sửa) — Đặt đồ tự do**: không còn ô đặt sẵn. Ở nhà, chế độ trang trí (nút "Trang trí"; nhân vật đứng yên) cho **đặt đồ trong túi
  ở bất cứ chỗ nào hợp lệ** (R-NHA-7): vật **ngoài trời** (Trúc cảnh, Mai, Tùng, Đá Thái Hồ, Ao sen, Đèn lồng, Bàn trà, Chậu lan, Lư hương) ở sân
  / vườn; vật **trong nhà** (Tranh chữ, Kệ sách, Án đọc, Bình phong) ở gian trong. **Mỗi cái đặt được một chỗ**: có 3 Mai thì đặt được 3 cây Mai;
  trong túi hết thì không lấy thêm được (thẻ "Mua ở Tạp hoá" — R-NHA-4). Trần **40 món ở sân, 20 món ở gian trong** (đủ trần → "Đã đủ 40 món —
  cất bớt để đặt thêm"). Thao tác: **lấy** vật từ túi → cầm (túi −1); **nhấc** món đã đặt → cầm; món đang cầm **dời** theo lưới 0,5 m, **xoay**
  từng 45° (8 hướng); **đặt** (chỉ khi hợp lệ); **huỷ** (món nhấc về chỗ cũ; món vừa lấy về túi); **cất** (món biến khỏi cảnh, **về túi +1**).
  Vật hiện ngay trong cảnh. Vật to (bàn trà, kệ sách, bình phong, đá cảnh, ao sen) chặn người đi; vật nhỏ không chặn. Mỗi nơi chỉ thấy và trang
  trí món của nơi đó. Luống vườn rau, thùng thu mua không phải đồ trang trí (R-VUON-1). · Ví dụ: Có Mai × 2 trong túi → lấy Mai, đặt ở (8; 4)
  → túi còn 1; lấy Mai đặt ở (10; 4) → hai cây, túi 0, thẻ Mai "Mua ở Tạp hoá". Nhấc mai thứ nhất, xoay 45° hai lần, đặt → quay 90°. Cất mai
  thứ hai → túi 1. Ở gian trong danh mục chỉ có Tranh chữ, Kệ sách, Án đọc, Bình phong. Đặt Bàn trà ở (−6; 4) → đi vào chỗ bàn bị chặn.
- **R-NHA-3 (sửa) — Lưu nhà**: mỗi món giữ **vật, nơi, chỗ, hướng**; số cái mỗi vật giữ nguyên; qua những lần mở app, cả khi đi vùng khác rồi về
  (trình duyệt không Flutter: lưu trong trình duyệt — R-TIEN-7). Nhà là của riêng người chơi. Mới cài → chưa món nào. Vật không còn trong danh mục
  → bỏ qua; món mà bản mới không còn đặt hợp lệ (đổi cảnh) → **về túi**, không lỗi. **Từ bản có ô** (trước V-69): vật ở mỗi ô cũ thành một món
  đứng **đúng chỗ ô đó** (làm tròn lưới 0,5 m), cùng hướng; chỗ ô nay không hợp lệ → dời tới chỗ hợp lệ gần nhất trong 1,5 m, không có → về túi.
  Không mất cái nào. · Ví dụ: Đặt Mai ở (8; 4) quay 45°, Đèn lồng ở (−11; −3) → tắt, mở lại → đúng chỗ, đúng hướng. Bản cũ có Mai ở ô `vuon-1`
  (−6; −13), Tranh chữ ở ô `trong-2` → lên bản mới: Mai ở (−6; −13) ở sân, Tranh chữ ở (0; −3,5) gian trong.
- **R-NHA-4 (sửa) — Danh mục và sở hữu**: danh mục 13 vật như cũ (thẻ chỉ tên Việt — R-HUD-4). Sở hữu tính **theo cái**: mỗi vật có **số cái**
  = đang đặt + **trong túi**. Mới cài app có **1 Trúc cảnh, 1 Đèn lồng, 1 Tranh chữ** trong túi. Mua thêm ở Tạp hoá (R-TIEN-4), mỗi lần 1 cái.
  Danh mục trang trí hiện mọi vật hợp nơi: trong túi > 0 → lấy được ("Trong túi n"); trong túi 0 (đã đặt hết hoặc chưa mua) → thẻ "Mua ở Tạp
  hoá", chạm → thẻ nhỏ "Mua {vật} ở Tạp hoá phố chợ — {n} Văn tiền (đang có {m})", không mua trong nhà. Xếp: có trong túi trước, còn lại sau (rẻ
  → đắt). **Dữ liệu từ bản cũ**: mỗi vật đã sở hữu = **1 cái**; vật đang đặt ở **nhiều ô** (bản cũ cho mua một lần đặt nhiều ô) → số cái = **số ô
  đang đặt** vật đó (tặng thêm để không mất đồ); bản trước Văn tiền → 3 vật khởi đầu 1 cái + vật đang đặt theo số ô. · Ví dụ: Mới cài → Trúc
  cảnh "Trong túi 1", Mai "Mua ở Tạp hoá · 60". Đặt Trúc cảnh → thẻ "Mua ở Tạp hoá"; cất → "Trong túi 1". Bản cũ sở hữu Mai, Tùng, Mai ở 3 ô
  → bản mới Mai 3 (3 cây đứng ở 3 chỗ ô cũ), Tùng 1 trong túi.
- **R-NHA-5 (sửa nhỏ)**: "chỗ trống để người chơi tự đặt đồ vào 12 ô (9 ô Sân / Vườn ở sân, 3 ô Trong nhà ở gian trong)" → "chỗ trống để
  người chơi tự đặt đồ (R-NHA-2, R-NHA-7)".
- **R-NHA-6 (mới) — Thao tác trang trí**: vào trang trí → camera trượt lên cao nhìn chéo (~55°), vẫn xoay / zoom; "Xong" → camera về như trước.
  **Máy tính** — món đang cầm đi theo con trỏ chuột trên nền (lưới 0,5 m); **Q** xoay trái 45°, **E** xoay phải 45°, **R** xoay 90°; **click**
  hoặc **Enter** đặt; **Esc** huỷ (không cầm gì → thoát chế độ); **Delete** (hoặc Backspace) cất về túi; click món đã đặt → nhấc; kéo nền trống →
  xoay camera. Khi trang trí E không ngồi, Enter không mở trò chuyện, WASD không đi. **Điện thoại** — chạm thẻ trong danh mục → món hiện ở chỗ hợp
  lệ gần giữa màn; kéo món bằng một ngón → dời; kéo ngoài món → xoay camera, chụm → zoom; chạm món đã đặt → nhấc; nút nổi cạnh món: **Xoay**
  (45°), **Đặt**, **Cất**, **Huỷ**. Đang cầm: món **xanh** khi chỗ hợp lệ, **đỏ** khi không (kèm lý do — R-NHA-7); đặt khi đỏ → không đặt, vẫn cầm.
  · Ví dụ: Máy tính: click mai đã đặt → cầm, Q → quay 45° trái, đưa lên lối trục → đỏ "Lối đi", click → không đặt; ra bãi cỏ → xanh, Enter → đặt.
  Esc khi cầm mai vừa nhấc → về chỗ cũ. Delete khi cầm mai → mai biến, túi +1. Điện thoại: kéo bàn trà sang phải 2 m → bàn dời theo lưới, Đặt →
  đặt.
- **R-NHA-7 (mới) — Chỗ đặt hợp lệ**: món đặt được khi cả **chân món** (khung bao theo hướng) nằm trong vùng đặt của nơi đó (sân: trong đảo,
  không trên Bến mây, chênh cao trong chân ≤ 0,35 m; gian trong: trong phòng, cách tường ≥ 0,4 m) và **không** đè: lối lát trục từ Bến mây lên
  cổng Vườn rau, lối nhánh tới cửa nhà chính, ô cửa nhà / ô cửa phòng, vòng sáng ra Bến mây, chỗ xuất phát / bãi hạc (1,5 m quanh (0; 6,5) và
  (0; 10)), luống vườn rau (+0,3 m), thùng thu mua (+1 m), lối qua cổng vườn, nhà / rào / cây / lan can của cảnh, món khác; và vật to **không làm mất
  đường đi** từ chỗ xuất phát tới vòng sáng Bến mây, cửa nhà chính, cổng vườn, thùng thu mua (gian trong: tới ô cửa phòng). Lý do khi đỏ: "Ngoài chỗ
  đặt", "Lối đi", "Cửa nhà", "Luống rau", "Thùng thu mua", "Đè vật khác", "Dốc quá", "Chắn lối", "Đã đủ 40 món" (gian trong "Đã đủ 20 món"). · Ví dụ:
  Ao sen ở (0; 0) → đỏ "Lối đi". Mai sát Mai khác (khung chồng) → đỏ "Đè vật khác". 6 bàn trà quây kín cổng vườn → bàn thứ 6 đỏ "Chắn lối". Chậu lan
  trong rào vườn giữa hai luống cách ≥ 0,3 m → được.
- **R-TIEN-4 (sửa) — Tạp hoá — mua**: bảng giá 13 vật giữ nguyên. Đồ trang trí **mua được nhiều lần, mỗi lần 1 cái** (không chọn × 5 / × 10): đủ
  tiền → "Mua" → hộp xác nhận (đang có / giá / còn lại) → "Mua · n" → trừ đúng giá, **+1 cái vào túi**, báo "Đã mua {vật} — trong túi {k}, về nhà để
  đặt" (không tự đặt ra nhà). Thẻ hiện **"Trong túi: n · Đang đặt: m"** (chưa có cái nào → chỉ giá). Thiếu tiền → "Còn thiếu n". Không còn "Đã có"
  và không còn "đã mua hết". Màn mở → nhân vật đứng yên; "Đóng" / nút quay lại → về cảnh, ví HUD trừ ("−n"). Hạt giống (R-VUON-9) như cũ (× 1 · × 5 ·
  × 10). · Ví dụ: Có 200, mua Mai 60 → còn 140, Mai "Trong túi: 1"; mua Mai lần nữa → còn 80, "Trong túi: 2". Đặt 1 Mai ở nhà → Tạp hoá "Trong túi: 1
  · Đang đặt: 1". Có 40, Tùng 80 → "Còn thiếu 40". Mới cài → Trúc cảnh, Đèn lồng, Tranh chữ "Trong túi: 1".
- **R-TIEN-7 (sửa nhỏ)**: "3 vật khởi đầu" → "3 vật khởi đầu, mỗi vật 1 cái"; ví dụ "Mai lại khoá" → "Mai về 0 cái"; thêm "mua Mai 2 lần → vào
  Nhà của ta đặt được 2 cây".
- **R-TUI-1 (sửa nhỏ)**: ngăn Đồ trang trí "vật đã có, đánh dấu vật đang đặt" → "vật đã có, mỗi vật **Trong túi n · Đang đặt m** (mọi nơi ở nhà)";
  vật có 0 trong túi mà đang đặt vẫn hiện. Ví dụ thêm: "Mai 3 cái, đặt 2 → 'Mai · Trong túi 1 · Đang đặt 2'".
