# Văn tiền trên web — chế độ thử khi không có Flutter (V-20261114-14)
- Yêu cầu: "tôi không thấy [tiền tệ] trên giao diện web" → người dùng chọn **"Thêm chế độ thử trên web"**: mở cảnh bằng
  trình duyệt không có Flutter (`npm run dev`) thì vẫn có ví (lưu trong trình duyệt), thưởng trò chơi (và học nếu được),
  mua ở Tạp hoá bằng giao diện web, Nhà của ta dùng đồ sở hữu từ ví web. **Có Flutter thì giữ nguyên** (Flutter là nguồn thật).
- Loại: sửa hành vi · giao diện (áp thiết kế có sẵn cho nền web) · luồng/luật · dữ liệu · Cỡ: vừa – lớn ·
  Trạng thái: đang làm (duyệt 2026-11-14)

Hiện nay (đọc code): không Flutter → `getProgress()` trả `null` → `WalletHud.sync(null)` **ẩn ví**; `earnGame` trả `null` →
không thưởng; `openShop` trả `false` → khung thoại "Tiệm chưa mở" (`zones/shop.ts` `SHOP_CLOSED_TEXT`); `getHome` `null` →
`NEW_HOME` (3 vật khởi đầu), `setDecor` `false` → nhà chỉ giữ trong bộ nhớ trang; thẻ bộ thủ HTML (`ui/lessonBoard.ts`)
"mở là coi như đã học, chỉ trong phiên". Luật tiền chỉ có ở Dart `app/lib/journey/wallet.dart`.

## Cách làm (tóm tắt)
- **Nhận biết chế độ thử một lần lúc tải**: cầu nối không sẵn sàng (`hostReady()` hết 800 ms, không có
  `window.flutter_inappwebview`) → chế độ thử. Flutter có mặt nhưng bản cũ không gửi `coins` → **vẫn như cũ** (ví ẩn), không
  chuyển sang chế độ thử. Canvas 3D (`web/design.html` → `designPreview.ts`) không chạy `main.ts` → không bị ảnh hưởng.
- **Kho thử trong trình duyệt**: một khoá `localStorage` `hoc-xa.thu.v1` (JSON `{coins, gameDay, gameToday, owned, placed,
  learned}`), đọc / ghi bọc `try/catch` — bị chặn (cửa sổ ẩn danh, chặn dữ liệu trang) → giữ trong bộ nhớ, trang vẫn chạy.
  Không đụng dữ liệu app (app lưu ở `ProgressStore`, hai nơi tách hẳn).
- **Luật**: chép phần luật cần dùng từ `wallet.dart` sang TypeScript thuần (`zones/walletRules.ts`) — test cùng ví dụ của sổ
  ở cả hai phía; comment hai file ghi "đổi luật → sửa cả hai" (quyết định 4).
- **Giao diện**: ví HUD, xu bay, nhãn, thẻ "kiếm từ đâu" **đã có trên web** (`ui/wallet.ts`, thiết kế 2026-11-14.12) — chỉ cần
  cho số dư. Thẻ vật khoá / tấm báo "Mua ở Tạp hoá" ở Nhà của ta **đã có** (`ui/decorPanel.ts`). Còn thiếu đúng một màn:
  **Tạp hoá bản HTML** — làm theo 6 artboard `CuaHang-*` (xem mục "Giao diện").

## Giao diện — dùng lại thiết kế Tạp hoá, không cần phiếu
Đặc tả `design/docs/screen_specs.md` mục "Tạp hoá 雜貨 — cửa hàng đồ trang trí (Flutter native)" + artboard
`design/source/CuaHang-doc.dc.html`, `-doc-ngheo`, `-doc-xac-nhan`, `-doc-vua-mua`, `-doc-het`, `CuaHang-ngang` (mục
2026-11-14.12). Đánh giá: **dùng lại được nguyên cho bản HTML**, không cần vẽ thêm:
- Artboard là HTML/CSS với số đo đủ (đầu ấn son 雜貨, ví đầu màn, tab, lưới 3 / 5 cột, thẻ 4 trạng thái, tấm đáy xác nhận,
  tấm "Đã mua", dải nghèo, dải đã mua hết), **đủ dọc 390×844 lẫn ngang 844×390**; chữ "(Flutter native)" chỉ nói nền tảng
  đợt trước, không phải thiết kế riêng cho Flutter.
- Nút **"Đóng"** có ở cả 6 artboard (web không có nút quay lại của máy → vẫn đóng được; thêm Esc trên bàn phím như các bảng
  HTML khác).
- Hình vật: `web/src/ui/decorIcons.ts` **đã chép hình phẳng 13 vật từ artboard `CuaHang-*`** (đang dùng ở bảng trang trí) ·
  đồng xu `coinIcon` (`ui/wallet.ts`) · chuỗi `shop*` `slot*` (`design/l10n/vi.arb`) — Flutter `shop_screen.dart` đã dùng,
  chép đúng chữ.
- Không có giao diện **mới** nào khác: ví / hiệu ứng / thẻ khoá đã có; quyết định 3 đề xuất **không** thêm nhãn "bản thử" (nếu
  người dùng muốn có nhãn → khi đó mới soạn phiếu `/ui-apply phieu`, việc nhãn chờ thiết kế).

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — thêm **R-TIEN-7** (chế độ thử trên trình duyệt), sửa câu ở **R-TIEN-1**, **R-TIEN-6**, **R-NHA-3**
  (xem "Luật đề xuất"); ghi chú code nhóm TIEN thêm file web mới → `/dong-bo-quy-tac` (tự chép online, `--mark-synced`).
- `docs/bridge.md` — không đổi tên / dạng sự kiện; chỉ sửa cột "khác (không có Flutter)" của `getProgress.coins`, `getHome`,
  `setDecor`, `earnGame`, `openShop` và mục "Không có `window.flutter_inappwebview`" (dòng ~69): "→ chế độ thử trình duyệt
  (R-TIEN-7), kho `localStorage`".
- `web/src/zones/walletRules.ts` (mới, thuần) — chép từ `wallet.dart`: `gameEarn` (bảng 8/5/3 · 3, trần 60, cắt cho vừa),
  `LEARN_COINS` 10, `buyDecor` (đủ → trừ, đã có → không mua lại, thiếu → còn thiếu n), `dayKey` (0 giờ giờ máy); kiểu
  `TrialWallet` + `parseTrial` (hỏng / thiếu trường → ví mới: 0 Văn tiền, `STARTER_DECOR`, nhà trống) — dùng
  `STARTER_DECOR`, `DECOR_ITEMS` của `decor.ts` (một nguồn giá).
- `web/src/zones/shopView.ts` (mới, thuần) — trạng thái thẻ (Mua / Đã có / Còn thiếu n / đang chọn), lọc tab Tất cả · Vườn ·
  Sân · Trong nhà + nhóm, dải nghèo (không mua nổi vật rẻ nhất còn thiếu) / dải đã mua hết, chữ hộp xác nhận (Đang có / Giá /
  Còn lại) — bản TS của phần logic `shop_parts.dart` / `shop_confirm.dart`.
- `web/src/bridge/browserStore.ts` (mới) — đọc / ghi `localStorage` `hoc-xa.thu.v1` an toàn lỗi; tham số URL thử theo quyết
  định 2. Lớp `bridge/` (chạm `window`, không DOM, không three) — không thêm thư mục, không đổi `decisions/0001` / `LAYERS`.
- `web/src/ui/shopPanel.ts` (mới) + `web/src/ui/shop.css` (mới, như `wallet.css`) + khung DOM ở `web/index.html` — Tạp hoá
  HTML theo artboard; dựng bằng `createElement` / `textContent`, safe area `env(safe-area-inset-*)`.
- `web/src/walletRoom.ts` — chế độ thử: `sync` lấy số dư từ ví thử khi `progress` `null`; `gameEnded` tính bằng `walletRules`
  rồi ghi kho (cùng luồng thẻ kết quả "+n Văn tiền" + xu bay khi "Rời bàn" như Flutter); "Vào tiệm" → mở `ShopPanel` thay
  "Tiệm chưa mở"; mua → ghi kho, ví trong tiệm "−n", đóng → ví HUD "−n"; hàm mới `learned(r)` (+10 lần đầu, quyết định 1).
- `web/src/homeDecor.ts` — chế độ thử: `load` đọc `{placed, owned}` từ ví thử (qua `cleanHome` như cũ), `save` ghi ô vào kho;
  `coins()` lấy số dư ví thử (tấm báo thẻ khoá).
- `web/src/main.ts` — ghép: xác định chế độ một lần, truyền kho thử cho `WalletRoom` / `HomeDecor`; nhánh dự phòng của
  `openRadical` (bảng HTML) báo `walletRoom.learned(r)` và (quyết định 1) nạp / lưu bộ đã học vào kho thử; hiệu ứng chạy khi
  đóng bảng bài học; ví ẩn khi `ShopPanel` mở (như mọi màn che HUD).
- `web/src/zones/shop.ts` + `shop.test.ts` — bỏ `SHOP_CLOSED_TEXT` (thành rác: không còn "Tiệm chưa mở").
- Test (đỏ trước): `web/src/zones/walletRules.test.ts` (R-TIEN-2 phần học, R-TIEN-3, R-TIEN-4, R-TIEN-7 — cùng ví dụ sổ như
  `app/test/rules/tien_test.dart`), `web/src/zones/shopView.test.ts` (R-TIEN-4), `web/src/bridge/browserStore.test.ts` (kho
  giả: lưu / đọc lại, hỏng → ví mới, bị chặn → bộ nhớ — R-TIEN-7), `walletRoom` nếu tách được phần thuần.
- `.claude/skills/lead/SKILL.md` — Bản đồ tính năng dòng "Văn tiền…" thêm `walletRules`, `browserStore`, `shopPanel`.

**Cần kiểm tra**
- `web/src/ui/wallet.ts` — `sync` giảm số → "−n" (dùng sẵn cho lúc đóng Tạp hoá); `push` xếp hàng khi `busy` (dùng cho thưởng
  học lúc bảng HTML còn mở). Dự kiến không sửa; cần thì chỉ thêm hàm nhỏ (vd. xuất viên ví dùng ở đầu Tạp hoá).
- `web/src/ui/decorPanel.ts`, `zones/decorMode.ts` — thẻ khoá đã đọc `owned`; sau khi mua trên web, vào Nhà của ta thẻ phải
  thành "Đã có" (nạp lại `owned` từ kho khi vào cảnh).
- `web/src/gamePlay.ts` — `ended` / `setReward` dùng nguyên, không sửa.
- `web/src/bridge/flutterBridge.ts` — giữ nguyên hành vi khi có Flutter; chỉ cần xuất cách biết "không có Flutter" (dùng lại
  `hostReady`) nếu chưa có.
- `web/scripts/subset-han.mjs` — chữ 雜貨 + số chữ Hán của giá (quét `web/src/**/*.ts`, `decor.ts` đã có 零一…九 千百十文) có
  trong font cắt.
- R-MAN-1 (không đè nút) — Tạp hoá HTML che toàn màn, joystick / nút HUD ẩn khi mở.
- Hiệu năng: chỉ DOM / CSS — **0 draw call** thêm.

**Không đụng**
- Toàn bộ `app/` (Flutter): `wallet.dart`, `progress_store.dart`, `shop_screen.dart`, cầu nối Dart — có Flutter thì y như cũ.
- `design/` (chỉ đọc), Canvas 3D (`designPreview.ts`).
- Ôn / nhiệm vụ ngày / chuỗi trên web (web chưa có màn ôn; bảng nhiệm vụ HTML `ui/dailyPanel.ts` chỉ xem) — xem quyết định 1.
- Đồng bộ ví thử ↔ ví app: không có (hai nơi riêng, không chép qua lại).

## Luật đề xuất (sửa sổ trước khi code — chép vào `docs/testing/quy_tac.md` sau khi duyệt)
- **R-TIEN-7 (mới) — Chế độ thử trên trình duyệt**: mở cảnh bằng trình duyệt **không có Flutter** (vd. `npm run dev`) → Văn
  tiền chạy ở **chế độ thử**: ví, đồ sở hữu, nhà của ta và bộ đã học trên bảng HTML lưu **trong trình duyệt đó** (giữ qua tải
  lại trang; xoá dữ liệu trang / trình duyệt khác / ẩn danh → bắt đầu lại như mới cài: 0 Văn tiền, 3 vật khởi đầu, nhà trống).
  Luật giống app: thưởng trò chơi R-TIEN-3 (cả trần 60 / ngày), thưởng học bộ mới **+10** khi lần đầu mở thẻ bộ đó trên bảng
  HTML (R-TIEN-2; ôn, nhiệm vụ ngày, chuỗi **không** thưởng ở chế độ thử — web chưa có màn ôn), Tạp hoá mở **bản web** theo
  R-TIEN-4, Nhà của ta đặt được vật đã mua (R-NHA-4). Ví thử **tách hẳn** ví trong app: không chép qua lại. Có Flutter (kể
  cả bản cũ không gửi số dư) → không dùng chế độ thử.
  Ví dụ: `npm run dev`, mới mở → ví "0"; thắng Đấu chữ → "+8 · Thắng Đấu chữ", ví 8; tải lại trang → vẫn 8. Mở thẻ 竹 lần đầu
  → "+10 · Học bộ 竹"; tải lại, mở lại 竹 → 0. Có 100, Vào tiệm mua Mai 60 → còn 40; vào Nhà của ta → Mai đặt được. Mở app
  trên điện thoại → ví app không có 40 này.
- **R-TIEN-1 (sửa một câu)**: "…mỗi người chơi có một số dư Văn tiền, lưu trên máy (**chạy trình duyệt không có Flutter: ví
  thử lưu trong trình duyệt — R-TIEN-7**), giữ qua những lần mở app; …" — phần còn lại giữ nguyên.
- **R-TIEN-6 (sửa)**: bỏ câu "Không có Flutter (chạy trình duyệt thường) → khung thoại báo 'Tiệm chưa mở'." → thay bằng
  "**Không có Flutter → mở Tạp hoá bản web** (cùng thiết kế, mua bằng ví thử — R-TIEN-7)." Ví dụ thêm: "`npm run dev`, bấm
  'Vào tiệm' → màn Tạp hoá HTML; 'Đóng' / Esc → về đứng trước tiệm."
- **R-NHA-3 (sửa một câu)**: "Vật đã đặt ở từng ô giữ nguyên qua những lần mở app sau… (**chạy trình duyệt không có Flutter:
  lưu trong trình duyệt — R-TIEN-7**)." Ví dụ giữ nguyên.
- **R-NHA-4**: không đổi chữ (luật sở hữu như cũ; nguồn sở hữu ở chế độ thử đã nói trong R-TIEN-7).
- R-TIEN-2 / R-TIEN-3 / R-TIEN-4 / R-TIEN-5: không đổi chữ (R-TIEN-7 dẫn sang).

## Đã chốt (người dùng, 2026-11-14)
1. Thưởng học trên web: **+10 khi lần đầu mở thẻ một bộ** (đề xuất); ôn / nhiệm vụ / chuỗi không thưởng.
2. Tiền thử: **ví thử có sẵn 300 Văn tiền** khi mở web lần đầu (KHÔNG theo đề xuất `?tien=`); app vẫn bắt đầu 0.
   Vẫn nên có cách xoá dữ liệu thử (vd. `?tien=xoa`) để về lại 300.
3. Không thêm nhãn "Bản thử" — chỉ `console.info`.
4. Luật web **giống hệt app** (trần 60 / ngày, giá, …), test dùng cùng ví dụ sổ.

## Cần quyết định
1. **Thưởng học trên web tới đâu?** Bảng HTML chỉ có thẻ bộ thủ; không có màn ôn, bảng nhiệm vụ HTML chỉ để xem.
   - **Đề xuất A**: thưởng **+10 khi lần đầu mở thẻ một bộ** trên bảng HTML; **bộ đã học lưu trong trình duyệt** (tải lại không
     nhận lại; ngồi tu luyện tiếp bộ chưa học thay vì luôn bắt đầu từ 竹). Ôn / nhiệm vụ / chuỗi: không thưởng ở chế độ thử.
     Xu bay chạy khi đóng thẻ (như trò chơi chạy khi "Rời bàn" — không cần vẽ thêm).
   - B: chỉ thưởng trò chơi, không thưởng học trên web (thẻ HTML giữ "chỉ trong phiên").
   - **Duyệt xong người dùng thấy**: `npm run dev` → ngồi ở Rừng trúc mở thẻ 竹 → đóng thẻ, 2 xu bay vào ví "+10 · Học bộ 竹";
     tải lại trang, ngồi lại → thẻ bộ kế tiếp (không phải 竹).
2. **Tiền để thử nhanh**: mua đồ 30–200 cần nhiều ván (trần 60 / ngày).
   - **Đề xuất**: bắt đầu **0** như app; thêm tham số URL chỉ dùng thử: `?tien=500` đặt số dư 500, `?tien=xoa` xoá sạch dữ liệu thử
     (ví, đồ đã mua, nhà, bộ đã học). Chỉ có tác dụng ở chế độ thử (trong app bỏ qua), như `?debug`.
   - B: chế độ thử mới mở có sẵn 300 Văn tiền, không có tham số URL.
   - **Duyệt xong người dùng thấy**: mở `http://localhost:5173/?tien=500` → ví "500", vào Tạp hoá mua ngay được; `?tien=xoa` →
     ví "0", nhà trống, Mai lại khoá.
3. **Có báo "đang ở chế độ thử" trên màn không?**
   - **Đề xuất**: **không** thêm giao diện (chưa có thiết kế — CLAUDE.md "không dựng tạm"); chỉ một dòng `console.info` lúc tải
     + ghi trong sổ R-TIEN-7. Giao diện web trông y như app.
   - B: soạn phiếu `/ui-apply phieu` cho nhãn nhỏ "Bản thử · lưu trong trình duyệt" (vd. trong thẻ "Văn tiền kiếm từ đâu"); phần
     nhãn chờ thiết kế, các phần khác làm trước.
   - **Duyệt xong người dùng thấy**: (đề xuất) không có nhãn nào mới; mở DevTools → Console thấy "Văn tiền: chế độ thử (lưu
     trong trình duyệt)".
4. **Luật tiền nằm hai nơi** (Dart cho app, TS cho chế độ thử).
   - **Đề xuất**: chép phần luật cần (thưởng trò + trần, +10 học, mua) sang `zones/walletRules.ts`; test hai phía dùng **cùng ví
     dụ của sổ** (R-TIEN-3, R-TIEN-4) để lệch là đỏ; Dart vẫn là nguồn thật khi có Flutter. Đổi luật tiền sau này → sửa sổ →
     sửa cả hai file (ghi trong comment đầu file và trong sổ dòng "Code").
   - B: không chép luật — web chỉ cộng bảng cố định, không trần 60 (đơn giản hơn nhưng web chạy khác app).
   - **Duyệt xong người dùng thấy**: trên web, hôm nay chơi đến 60 thì ván sau hiện "Hôm nay trò chơi đã đủ thưởng" y như app.

## Nhiệm vụ
- [ ] 1. Sổ: thêm **R-TIEN-7**, sửa câu R-TIEN-1, R-TIEN-6, R-NHA-3 theo "Luật đề xuất" + quyết định 1–4 → `/dong-bo-quy-tac`
      (tự chép online, `--mark-synced`). (`docs/testing/quy_tac.md` · xong khi `dart tool/rule_trace.dart` thấy R-TIEN-7, cột
      App `sửa`)
- [ ] 2. `docs/bridge.md`: cột "khác" của `getProgress.coins`, `getHome`, `setDecor`, `earnGame`, `openShop` + mục "Không có
      `window.flutter_inappwebview`" → chế độ thử (R-TIEN-7). Không đổi tên / dạng. (cầu nối · xong khi người dùng duyệt)
- [ ] 3. `zones/walletRules.ts` + `walletRules.test.ts` (test đỏ trước): `gameEarn`, `LEARN_COINS`, `buyDecor`, `dayKey`,
      `TrialWallet` / `parseTrial`, `learnOnce`. (zones · `npm test` · xong khi ví dụ R-TIEN-3 "57 → +3 → 60 → 0 + đủ thưởng",
      R-TIEN-4 "100 mua Mai → 40; 40 Tùng → còn thiếu 40", R-TIEN-7 "mở lại 竹 → 0" xanh)
- [ ] 4. `zones/shopView.ts` + test: thẻ 4 trạng thái, tab + nhóm, dải nghèo / đã mua hết, chữ xác nhận + "Đã mua …". Chuỗi
      `shop*`, `slot*` chép đúng `vi.arb`. (zones · `npm test`)
- [ ] 5. `bridge/browserStore.ts` + test (kho giả): đọc / ghi `hoc-xa.thu.v1`, hỏng → ví mới, bị chặn → bộ nhớ; `?tien=` theo
      quyết định 2. (bridge · `npm test` · `dart tool/check.dart --changed` sạch `E-LOP`)
- [ ] 6. HUD `ui/shopPanel.ts` + `ui/shop.css` + khung `index.html`: Tạp hoá HTML theo 6 artboard `CuaHang-*` (đầu ấn son
      雜貨 + ví, tab, lưới 3 / 5 cột, thẻ, tấm đáy xác nhận, tấm "Đã mua" 3 s, dải nghèo, dải hết; "Đóng" + Esc); hình vật
      `decorIcons.ts`, xu `coinIcon`. (ui · xong khi khớp artboard dọc 390×844 + ngang 844×390, safe area, không `innerHTML`)
- [ ] 7. Ghép: `walletRoom.ts` (ví thử: `sync`, `gameEnded`, "Vào tiệm" → `ShopPanel`, mua → kho + "−n", `learned(r)`),
      `homeDecor.ts` (nạp / lưu nhà + sở hữu từ kho thử), `main.ts` (chọn chế độ một lần; thẻ HTML → +10 lần đầu, bộ đã học
      từ kho thử; ví ẩn khi Tạp hoá mở; `console.info` theo quyết định 3). Có Flutter: không nhánh nào đổi. (ghép · `npx tsc
      --noEmit` · test `gamePlay.test.ts` vẫn xanh)
- [ ] 8. Dọn + build: bỏ `SHOP_CLOSED_TEXT` (+ test), Bản đồ tính năng `lead/SKILL.md`, `npm run build`.
- [ ] 9. Thử máy: `npm run dev` trên máy tính + điện thoại cùng Wi-Fi (dọc + ngang): ví "0" → Đấu chữ thắng → "+8" khi rời bàn
      → tải lại còn 8 → `?tien=500` → Vào tiệm mua Mai (xác nhận, "Đã mua Mai", ví "−60") → Nhà của ta đặt Mai → tải lại còn Mai.
      Rồi `flutter run` (Android) → ví app không đổi, "Vào tiệm" mở màn Flutter như cũ.

Thứ tự: 1–2 trước (sổ, cầu nối docs) → 3–5 song song được → 6 → 7 → 8 → 9. Không chạm file của việc khác đang làm ngoài
`main.ts` / `index.html` (ghép cuối, rebase lên main trước NV7).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules · dart tool/rule_trace.dart
