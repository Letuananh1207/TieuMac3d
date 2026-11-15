# Phiếu: Trang trí tự do ở Nhà của ta — danh mục theo túi, món đang cầm, nút nổi xoay / đặt / cất, gợi ý phím (HUD) + Tạp hoá bán đồ trang trí theo cái
- Trạng thái: đã áp (2026-11-15.42) — V-69 nhánh `viec/trang-tri-code`
- Đã vẽ: 2026-11-15.42 (20 artboard: túi đồ trang trí dọc / ngang / máy, đủ trần, mới cài, túi trống, gian trong, đang cầm xanh / đỏ + nút Xoay · Đặt · Cất · Huỷ, dải phím máy tính, dấu trong cảnh, Tạp hoá theo cái, Túi đồ — đặc tả `design/docs/screen_specs.md` mục "Trang trí tự do")
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-trang-tri-tu-do.md` (nhiệm vụ 14, 15). Luật, lưu, số lượng, chuyển dữ liệu cũ, toán chỗ đặt,
  lớp 3D, phím / chuột làm trước (NV 1–13); phiếu này chỉ phần HUD + hình Tạp hoá.
- Thay phần "chạm ô → bảng danh mục" của thiết kế 2026-11-14.13 (Nhà của ta) — ô đặt sẵn bị bỏ — và trạng thái "Đã có" / "đã mua hết"
  của Tạp hoá 2026-11-14.12 (đồ trang trí nay mua theo cái). Nút "Trang trí", nút "Xong", ví, kiểu thẻ vật dùng lại.
- Quyết định người dùng 2026-11-15: mua mỗi lần 1 cái (kiểu 摩尔) · hai nhóm ngoài trời / trong nhà · vùng cấm + kiểm còn đường đi ·
  camera nâng ~55°. Luật nháp R-NHA-2/3/4/6/7, R-TIEN-4, R-TUI-1 trong kế hoạch; khi chốt, đọc nguyên văn ở `docs/testing/quy_tac.md`.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Trang trí tự do ở Nhà của ta + Tạp hoá bán đồ trang trí theo cái (Học Xá 3D) · HUD lớp nổi trên cảnh 3D (web)
+ màn Tạp hoá (Flutter + bản web, cùng thiết kế 2026-11-14.12)

Bối cảnh: Nhà của ta là đảo nhỏ trên biển mây: nhà chính sát mép tây, Vườn rau giữa đảo (rào tre, 12 luống, thùng thu
mua), lối lát trục từ Bến mây lên bắc; gian trong là cảnh riêng (phòng 14 × 10 m). Hôm nay trang trí = chạm 1 trong 12 Ô ĐẶT
SẴN → bảng danh mục theo ô (thiết kế 2026-11-14.13), và mỗi vật "mua một lần, đặt được nhiều ô". ĐỔI CẢ HAI, kiểu 摩尔庄园
(chỉ học cơ chế, không chép hình):
(a) BỎ HẾT Ô — đặt đồ TỰ DO ở bất cứ chỗ trống hợp lệ, dời, xoay 8 hướng;
(b) ĐỒ TRANG TRÍ TÍNH THEO CÁI — mỗi lần mua ở Tạp hoá được 1 cái vào TÚI; muốn 3 cây Mai thì mua 3 lần; mỗi cái đặt một chỗ;
    cất → về túi.
Không chữ Hán ở bất cứ đâu trong phiếu này (tên vật, nhãn, lý do chỉ tiếng Việt — R-HUD-4).

Luật (nháp, chờ chốt — R-NHA-2 / R-NHA-4 / R-NHA-6 / R-NHA-7 / R-TIEN-4 / R-TUI-1):
- Vào bằng nút "Trang trí" (có sẵn); nhân vật đứng yên; camera trượt lên cao nhìn chéo (~55°), vẫn xoay / zoom; "Xong" → về.
- Mỗi vật có SỐ CÁI = đang đặt + trong túi. Mới cài: 1 Trúc cảnh, 1 Đèn lồng, 1 Tranh chữ trong túi.
- Vật ngoài trời (Trúc cảnh, Mai, Tùng, Đá Thái Hồ, Ao sen, Đèn lồng, Bàn trà, Chậu lan, Lư hương) chỉ ở sân / vườn;
  vật trong nhà (Tranh chữ, Kệ sách, Án đọc, Bình phong) chỉ ở gian trong.
- Trần 40 món ở sân, 20 món ở gian trong (trần số món đặt, không phải số mua).
- Lấy vật từ danh mục (trong túi > 0) → món hiện để CẦM, túi −1; chạm / click món đã đặt → NHẤC lên cầm. Món đang cầm dời theo
  lưới 0,5 m, xoay từng 45°. ĐẶT (chỉ khi hợp lệ) · HUỶ (món nhấc về chỗ cũ, món vừa lấy về túi) · CẤT (món biến khỏi cảnh, về
  túi +1). Trong túi 0 (đặt hết hoặc chưa mua) → thẻ "Mua ở Tạp hoá" → chạm: tấm báo "Mua {vật} ở Tạp hoá phố chợ — {n} Văn
  tiền (đang có {m})"; không mua trong nhà.
- Món đang cầm XANH khi chỗ hợp lệ, ĐỎ khi không + lý do ngắn: "Ngoài chỗ đặt" · "Lối đi" · "Cửa nhà" · "Luống rau" ·
  "Thùng thu mua" · "Đè vật khác" · "Dốc quá" · "Chắn lối" · "Đã đủ 40 món" (gian trong "Đã đủ 20 món").
- Máy tính: món theo con trỏ chuột · Q xoay trái 45° · E xoay phải 45° · R xoay 90° · click / Enter đặt · Esc huỷ (không cầm
  gì → thoát) · Delete cất · click món đã đặt → nhấc · kéo nền trống → xoay camera.
- Điện thoại: chạm thẻ danh mục → món hiện ở chỗ hợp lệ gần giữa màn · kéo món bằng ngón → dời · kéo ngoài món → xoay camera,
  chụm → zoom · chạm món đã đặt → nhấc · nút nổi cạnh món: Xoay · Đặt · Cất · Huỷ.
- Tạp hoá: đồ trang trí mua được nhiều lần, MỖI LẦN 1 CÁI (không × 5 / × 10 — đồ đắt; hạt giống vẫn × 1 · × 5 · × 10); thẻ
  hiện "Trong túi: n · Đang đặt: m"; không còn "Đã có" và trạng thái "đã mua hết"; thiếu tiền → "Còn thiếu n".

CẦN VẼ — mỗi mục: điện thoại dọc 390×844 + ngang 844×390, VÀ bản máy tính (1280×800, chuột — HUD máy tính hôm nay: thanh công
cụ dời sang trái, không joystick). Nền giữ chỗ: sân nhà nhìn chéo từ trên cao (có thể dùng ảnh Canvas 3D ?vung=nha-ta).

1. CHẾ ĐỘ TRANG TRÍ — CHƯA CẦM GÌ: DANH MỤC = TÚI ĐỒ TRANG TRÍ khi không còn ô. Cần quyết cách mở (gợi ý: thanh luôn hiện ở
   đáy kiểu kho đồ 摩尔 — một hàng thẻ cuộn ngang, kéo lên thành tấm đầy; ngang / máy tính: cột phải hoặc thanh đáy). Thẻ = kiểu
   thẻ vật 2026-11-14.12 + SỐ TRONG TÚI (huy hiệu "× 2" hoặc dòng "Trong túi 2") + (tuỳ) "Đang đặt 3" ở nơi này.
   - Có trong túi → thẻ sáng, chạm → cầm món.
   - Trong túi 0 nhưng đang đặt (đã đặt hết) → thẻ mờ "Đặt hết · Mua thêm ở Tạp hoá" + giá.
   - Chưa có cái nào → thẻ khoá nét đứt "Mua ở Tạp hoá" + giá (như 2026-11-14.12).
   Chỉ vật hợp nơi (sân: 9 vật ngoài trời; gian trong: 4 vật trong nhà). Xếp: có trong túi trước, còn lại sau (rẻ → đắt).
   Có đếm "12 / 40 món". Viên nhắc trên trái: "Chọn đồ trong túi để đặt · chạm đồ trong sân để dời" (chữ cụ thể tuỳ thiết kế).
   Nút "Xong" giữ. Giữ ví góc trên phải.
   Trạng thái: bình thường (vài vật × 1, × 3) · ĐỦ TRẦN ("Đã đủ 40 món — cất bớt để đặt thêm", thẻ mờ) · mới cài (3 vật × 1) ·
   TÚI TRỐNG (mọi cái đã đặt: "Túi trống — mua thêm ở Tạp hoá phố chợ") · ở gian trong (4 vật) · chạm thẻ khoá (tấm báo).

2. ĐANG CẦM MỘT MÓN — HỢP LỆ (xanh) và SAI CHỖ (đỏ + lý do): điện thoại — NÚT NỔI CẠNH MÓN (neo theo món trong cảnh, đi theo
   khi kéo): Xoay (45°) · Đặt (nổi bật nhất; mờ khi đỏ) · Cất (về túi) · Huỷ — bố cục (vòng quanh món / một hàng dưới món / …)
   tuỳ thiết kế, không che món, không ra ngoài safe area; ngón cái với tới được ở dọc. Lý do đỏ đặt ở đâu (nhãn trên món / viên
   nhắc). Máy tính — không nút nổi bắt buộc; vẽ GỢI Ý PHÍM (vd. dải nhỏ đáy màn hoặc cạnh con trỏ: "Q E xoay · R 90° · Click đặt ·
   Esc huỷ · Delete cất") + lý do đỏ. Trạng thái: món vừa lấy từ túi · món nhấc lên (Huỷ = về chỗ cũ) · đỏ "Lối đi" · đỏ "Chắn
   lối" · đỏ "Đã đủ 40 món" (nếu khác mục 1). Danh mục khi đang cầm: thu nhỏ / ẩn? (tuỳ thiết kế; số trong túi giảm 1 ngay).

3. DẤU TRONG CẢNH (code vẽ 3D — thiết kế chỉ chốt màu / độ mờ / có hay không): bóng ma món đang cầm nửa trong suốt tô
   xanh / đỏ; tấm khung chân món trên nền (hình chữ nhật theo hướng món); lưới 0,5 m mờ quanh món (khoảng 4 × 4 m); (tuỳ) mũi
   tên hướng mặt trước món; (tuỳ) tô mờ vùng cấm (lối lát, quanh cửa, luống) khi đang cầm. Code đang tạm dùng token `jade`
   (hợp lệ) / `lacquer` (sai) — chốt hoặc đổi.

4. TẤM BÁO (toast ~3 s, không chặn): "Đã cất {vật} vào túi" · "Không đặt được — {lý do}" (khi bấm Đặt lúc đỏ, nếu thiết kế
   muốn) · lần đầu vào chế độ trên máy tính: hướng dẫn phím ngắn (tuỳ).

5. NÚT "TRANG TRÍ" + "XONG": giữ như 2026-11-14.13; chỉ xem lại chỗ đứng khi có thanh danh mục đáy (dọc) — không đè thanh
   công cụ đáy màn (Bản đồ / Về nhà / Biểu cảm / Túi đồ / Nhiệm vụ — ẩn khi trang trí hay giữ? tuỳ thiết kế), bản đồ nhỏ, ví.

6. TẠP HOÁ — ĐỒ TRANG TRÍ BÁN THEO CÁI (màn có sẵn 2026-11-14.12; Flutter + bản web; mục Hạt giống 2026-11-15.29 làm mẫu mua lặp):
   - Thẻ đồ trang trí: bỏ "Đã có"; hiện "Trong túi: n · Đang đặt: m" (chưa có cái nào → chỉ giá; n = 0 mà m > 0 vẫn hiện).
     Nút luôn "Mua" (đủ tiền) / "Còn thiếu n" (thiếu).
   - Hộp xác nhận: chỉ × 1 (không có chọn số lượng); đang có / giá / còn lại; dòng phụ "Mỗi lần mua 1 cái vào túi · đặt ở Nhà
     của ta" (chữ tuỳ thiết kế).
   - Tấm "Vừa mua": "Đã mua {vật}" + "Trong túi {k} · về nhà để đặt" (thay "Về nhà để đặt — chạm ô {loại} khi trang trí.").
   - Dòng phụ tiêu đề: bỏ "mua một lần, đặt được nhiều ô" → câu mới (vd. "Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ · hạt
     giống cho Vườn rau").
   - BỎ trạng thái "đã mua hết" (artboard CuaHang-doc-het) — đồ trang trí không bao giờ hết hàng. Trạng thái "nghèo" giữ.
   - Vẽ: thẻ chưa có · thẻ "Trong túi: 2 · Đang đặt: 1" · thẻ "Trong túi: 0 · Đang đặt: 3" · hộp xác nhận × 1 · vừa mua · thiếu
     tiền; dọc + ngang.

7. TÚI ĐỒ — ngăn Đồ trang trí (2026-11-15.35): thẻ nhỏ thêm số "Trong túi n · Đang đặt m" thay nhãn "Đang đặt" (chỉ xem).

Chuỗi có sẵn: decorButton, decorDone, decorBuyAtShop, decorBuyAtShopDetail, homeName, shopBuy, shopShort, bagDecor.
Chuỗi bỏ: decorSlotGarden, decorSlotYard, decorSlotIndoor, decorPick, decorReplace, decorRemove, decorPlacedHere, decorOwned,
decorHint (cũ "Chạm một ô để đặt vật"), shopOwned ("Đã có"), chuỗi "đã mua hết", shopSubtitle cũ, bagPlaced ("Đang đặt" đơn).
Chuỗi mới cần đặt: viên nhắc chưa cầm / đang cầm, Xoay, Đặt, Cất, Huỷ, đếm món, đủ trần, túi trống, "Đặt hết · Mua thêm",
9 lý do đỏ, gợi ý phím, "Trong túi n", "Đang đặt m", tấm báo cất, Tạp hoá: dòng phụ tiêu đề, dòng phụ hộp xác nhận, tấm vừa mua.
Dùng lại: thẻ vật + màn Tạp hoá (2026-11-14.12), tấm đáy / cột phải bảng danh mục + viên nhắc + nút Xong (2026-11-14.13), nút
nổi kiểu viên thuốc + thẻ hạt "Trong túi" (Vườn rau 2026-11-15.29), Túi đồ (2026-11-15.35), tấm báo `slate`, token jade /
lacquer / gold / aura-light, kính sương.
App đang có: web/src/ui/decorHud.ts (nút Trang trí, viên nhắc, nút tròn bám ô, Xong), web/src/ui/decorPanel.ts (bảng danh
mục theo ô), web/src/scene/decorLayer.ts (dấu ô trên nền) — sẽ thay; app/lib/lesson/shop_screen.dart + web/src/ui/shopPanel.ts
(Tạp hoá: thẻ "Đã có", trạng thái đã mua hết) — sẽ sửa; web/src/ui/bagPanel.ts (Túi đồ).
```
