# Nông trại ở Nhà của ta (V-20261118-114 — phần code)
- Yêu cầu: "thêm nông trại ở Nhà của ta: chuồng gà, ao cá + bến câu, chuồng bò con, giàn bầu bí — đặt sẵn cố định đúng chỗ như ảnh"
  (thiết kế `design/CHANGELOG.md` 2026-11-18.11, ý tưởng `docs/y_tuong/2026-11-18-nha-song-dong.md`, ảnh `design/concept/nong-trai-nha/`).
- Loại: thêm · Cỡ: lớn · Trạng thái: xong (chờ gộp + thử máy thật)

## Phạm vi
**Sẽ sửa / thêm**
- Luật: `docs/testing/quy_tac.md` nhóm mới **NONG** (R-NONG-1…8) + sửa R-VUON-7 (bảng kho có thêm sản phẩm nông trại), R-VUON-11
  (nhổ cỏ → +1 Cỏ khô), R-TUI-1 (ngăn Nông sản), R-NHA-5 (bố cục có nông trại), R-NHA-7 (lý do "Nông trại"), R-TIEN-1 (dòng ví).
- Cầu nối: `docs/bridge.md` `getNong`, `nongAct` (mới); `gardenAct` weed ghi thêm Cỏ khô.
- Luật thuần: Dart `app/lib/journey/nong.dart` (một nguồn) + bản chép `web/src/zones/nong.ts`; test hai phía cùng ví dụ sổ
  (`app/test/rules/nong_test.dart`, `web/src/zones/nong.test.ts`).
- Lưu: `app/lib/journey/progress_store.dart` khoá `nong.state`; `app/lib/scene/nong_event.dart`, `scene_view.dart`, `main.dart`.
- Ví thử (không Flutter): `web/src/zones/walletRules.ts`, `bridge/browserStore.ts`, `bridge/flutterBridge.ts`.
- Cảnh: `web/src/scene/nongSpec.ts` (kiểu + mặc định tắt), `scene/nongTrai.ts` (công trình tĩnh), `scene/nongVat.ts` (gà, bò, phao,
  trứng, dây leo — động); `spec.ts` / `world.ts` chỉ thêm vài dòng; `design/scene/nha-ta.json` thêm `farm` + `decorArea.keepOut`.
- Ghép: `web/src/nongTrai.ts` (file ghép riêng như `haiMang.ts`), `main.ts` vài dòng.
- HUD dùng lại: nút nổi kiểu "Bán" ở thùng (`#gardenBtn` → `ui/nongHud.ts` cùng CSS), tấm báo vườn, chữ nổi vườn, bảng kho
  (`ui/gardenPanel.ts` thêm hàng sản phẩm), túi đồ (`zones/tuiDo.ts`, `ui/bagPanel.ts`), hình vật phẩm `ui/nongArt.ts`.

**Cần kiểm tra**: `homeGarden.ts` (bán hết gộp), `gardenWork.ts` (nhổ cỏ → cỏ khô), `zones/decorPlace.ts` (dời món cũ — R-NHA-3),
`scripts/check-scene.mjs`.

**Không đụng**: luống / vòng công cụ vườn, Tạp hoá (hạt giàn miễn phí — xem giả định), các vùng khác.

## Giả định / quyết định (phiên chọn an toàn nhất — ghi báo cáo)
- Sản phẩm nông trại **không tính trần 60 Văn / ngày** của nông sản vườn (như măng R-MANG-5) — số ra mỗi ngày đã giới hạn sẵn.
- Giàn: 2 gốc cố định (tây = Bầu, đông = Dưa leo), **gieo miễn phí** (hạt để giống), không tưới / sâu; lớn theo giờ thật.
- Cá: tối đa 5 con / ngày VN; loại cá định theo (ngày, con thứ n) — hai phía tính giống nhau; quăng hụt không mất lượt.
- Cỏ khô giữ trong kho nông trại (ngăn Nông sản), không bán.
- Từ HSK hiện ở thẻ chi tiết túi đồ **chỉ khi đã học** (鸡蛋, 鱼, 牛奶) — không mở bài mới (R-VUNG-2), không ghi lịch ôn.
- Bò con: khối low-poly code; có `design/models/bo-con.glb` thì nạp model (chờ `/tai-nguyen`).
- Không cần khung HUD mới: câu cá dùng nút nổi + phao trong cảnh → không soạn phiếu.

## Nhiệm vụ
- [x] 1. Sổ luật R-NONG-* + sửa luật chạm → `/dong-bo-quy-tac` → `--mark-synced`
- [x] 2. Cầu nối `docs/bridge.md` (`getNong`, `nongAct`, `gardenAct` weed)
- [x] 3. Test đỏ: `zones/nong.test.ts`, `app/test/rules/nong_test.dart`
- [x] 4. Luật Dart `nong.dart` + lưu + sự kiện + ghép `main.dart`
- [x] 5. Luật TS `zones/nong.ts` + ví thử
- [x] 6. Cảnh: đặc tả + công trình + vật động; `nha-ta.json`; `scene:check`; draw call trước / sau
- [x] 7. Ghép `nongTrai.ts` + HUD (nút nổi, tấm báo, bảng kho, túi đồ)
- [x] 8. Ảnh Canvas 3D `design/screens/Canh-nha-ta-nong-trai-*.png`, `docs/thiet_ke_da_ap.md`
- [x] 9. Kiểm tra cuối + commit

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build && npm run scene:check ·
cd app && flutter analyze && flutter test -r failures-only · dart tool/rule_trace.dart
