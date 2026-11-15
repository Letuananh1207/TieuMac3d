# Phiếu: Trang trí tự do ở Nhà của ta — danh mục khi không còn ô, món đang cầm, nút nổi xoay / đặt / cất, gợi ý phím (HUD)
- Trạng thái: chờ thiết kế
- Đợi bởi: kế hoạch `docs/tasks/2026-11-15-trang-tri-tu-do.md` (nhiệm vụ 13, 14). Luật, lưu, chuyển dữ liệu cũ, toán chỗ đặt, lớp 3D,
  phím / chuột làm trước (NV 1–12); phiếu này chỉ phần HUD.
- Thay phần "chạm ô → bảng danh mục" của thiết kế 2026-11-14.13 (Nhà của ta) — ô đặt sẵn bị bỏ. Nút "Trang trí", nút "Xong", ví,
  thẻ vật (2026-11-14.12) dùng lại.
- Luật: nháp trong kế hoạch (R-NHA-2, R-NHA-6, R-NHA-7 — chưa chốt; 4 điểm chờ người dùng quyết: số bản / nơi đặt / chắn lối / camera).
  Khi luật chốt, phiên thiết kế đọc nguyên văn ở `docs/testing/quy_tac.md` mục NHA.

## Dán vào canvas

```text
PHIẾU THIẾT KẾ — Trang trí tự do ở Nhà của ta (Học Xá 3D) · HUD lớp nổi trên cảnh 3D (web, không phải màn Flutter)

Bối cảnh: Nhà của ta là đảo nhỏ trên biển mây: nhà chính sát mép tây, Vườn rau giữa đảo (rào tre, 12 luống, thùng thu
mua), lối lát trục từ Bến mây lên bắc; gian trong là cảnh riêng (phòng 14 × 10 m). Hôm nay trang trí = chạm 1 trong 12 Ô ĐẶT
SẴN → bảng danh mục theo ô (thiết kế 2026-11-14.13). BỎ HẾT Ô: người chơi đặt đồ TỰ DO ở bất cứ chỗ trống hợp lệ, dời,
xoay 8 hướng — cách làm như 摩尔庄园 (chỉ học cơ chế, không chép hình).
Không chữ Hán ở bất cứ đâu trong phiếu này (tên vật, nhãn, lý do chỉ tiếng Việt — R-HUD-4).

Luật (nháp, chờ chốt — R-NHA-2 / R-NHA-6 / R-NHA-7):
- Vào bằng nút "Trang trí" (có sẵn); nhân vật đứng yên; camera trượt lên cao nhìn chéo (~55°), vẫn xoay / zoom; "Xong" → về.
- Vật đã sở hữu đặt được NHIỀU BẢN (mua một lần là đủ), trần 40 món ở sân, 20 món ở gian trong.
- Vật ngoài trời (Trúc cảnh, Mai, Tùng, Đá Thái Hồ, Ao sen, Đèn lồng, Bàn trà, Chậu lan, Lư hương) chỉ ở sân / vườn;
  vật trong nhà (Tranh chữ, Kệ sách, Án đọc, Bình phong) chỉ ở gian trong.
- Lấy vật từ danh mục → món hiện để CẦM; chạm / click món đã đặt → NHẤC lên cầm. Món đang cầm dời theo lưới 0,5 m, xoay từng 45°.
  ĐẶT (chỉ khi hợp lệ) · HUỶ (món nhấc về chỗ cũ, món mới bỏ) · CẤT (món biến khỏi cảnh, vật vẫn sở hữu, còn trong danh mục).
- Món đang cầm XANH khi chỗ hợp lệ, ĐỎ khi không + lý do ngắn: "Ngoài chỗ đặt" · "Lối đi" · "Cửa nhà" · "Luống rau" ·
  "Thùng thu mua" · "Đè vật khác" · "Dốc quá" · "Chắn lối" · "Đã đủ 40 món".
- Máy tính: món theo con trỏ chuột · Q xoay trái 45° · E xoay phải 45° · R xoay 90° · click / Enter đặt · Esc huỷ (không cầm
  gì → thoát) · Delete cất · click món đã đặt → nhấc · kéo nền trống → xoay camera.
- Điện thoại: chạm thẻ danh mục → món hiện ở chỗ hợp lệ gần giữa màn · kéo món bằng ngón → dời · kéo ngoài món → xoay camera,
  chụm → zoom · chạm món đã đặt → nhấc · nút nổi cạnh món: Xoay · Đặt · Cất (+ Huỷ).

CẦN VẼ — mỗi mục: điện thoại dọc 390×844 + ngang 844×390, VÀ bản máy tính (1280×800, chuột — HUD máy tính hôm nay: thanh công
cụ dời sang trái, không joystick). Nền giữ chỗ: sân nhà nhìn chéo từ trên cao (có thể dùng ảnh Canvas 3D ?vung=nha-ta).

1. CHẾ ĐỘ TRANG TRÍ — CHƯA CẦM GÌ: cách mở DANH MỤC khi không còn ô. Cần quyết (gợi ý: thanh danh mục luôn hiện ở đáy kiểu
   kho đồ 摩尔 — một hàng thẻ cuộn ngang, kéo lên thành tấm đầy; ngang / máy tính: cột phải hoặc thanh đáy). Thẻ = kiểu thẻ vật
   2026-11-14.12 (có · khoá + giá "Mua ở Tạp hoá" · tấm báo khi chạm thẻ khoá) + số bản ĐANG ĐẶT ở nơi này ("Đang đặt 2").
   Chỉ vật hợp nơi (sân: 9 vật ngoài trời; gian trong: 4 vật trong nhà). Có đếm "12 / 40 món". Viên nhắc trên trái:
   "Chọn vật để đặt · chạm vật trong sân để dời" (chữ cụ thể tuỳ thiết kế). Nút "Xong" giữ. Giữ ví góc trên phải.
   Trạng thái: bình thường · ĐỦ TRẦN ("Đã đủ 40 món — cất bớt để đặt thêm", thẻ mờ) · chưa có vật nào (chỉ 3 vật khởi đầu) ·
   ở gian trong (4 vật).

2. ĐANG CẦM MỘT MÓN — HỢP LỆ (xanh) và SAI CHỖ (đỏ + lý do): điện thoại — NÚT NỔI CẠNH MÓN (neo theo món trong cảnh, đi theo
   khi kéo): Xoay (45°) · Đặt (nổi bật nhất; mờ khi đỏ) · Cất · Huỷ — bố cục (vòng quanh món / một hàng dưới món / …) tuỳ thiết
   kế, không che món, không ra ngoài safe area; ngón cái với tới được ở dọc. Lý do đỏ đặt ở đâu (nhãn trên món / viên nhắc).
   Máy tính — không nút nổi bắt buộc; vẽ GỢI Ý PHÍM (vd. dải nhỏ đáy màn hoặc cạnh con trỏ: "Q E xoay · R 90° · Click đặt ·
   Esc huỷ · Delete cất") + lý do đỏ. Trạng thái: món mới từ danh mục · món nhấc lên (Huỷ = về chỗ cũ) · đỏ "Lối đi" ·
   đỏ "Chắn lối" · đỏ "Đã đủ 40 món" (nếu khác mục 1). Danh mục khi đang cầm: thu nhỏ / ẩn? (tuỳ thiết kế).

3. DẤU TRONG CẢNH (code vẽ 3D — thiết kế chỉ chốt màu / độ mờ / có hay không): bóng ma món đang cầm nửa trong suốt tô
   xanh / đỏ; tấm khung chân món trên nền (hình chữ nhật theo hướng món); lưới 0,5 m mờ quanh món (khoảng 4 × 4 m); (tuỳ) mũi
   tên hướng mặt trước món; (tuỳ) tô mờ vùng cấm (lối lát, quanh cửa, luống) khi đang cầm. Code đang tạm dùng token `jade`
   (hợp lệ) / `lacquer` (sai) — chốt hoặc đổi.

4. TẤM BÁO (toast ~3 s, không chặn): "Đã cất {vật}" · "Không đặt được — {lý do}" (khi bấm Đặt lúc đỏ, nếu thiết kế muốn) ·
   lần đầu vào chế độ trên máy tính: hướng dẫn phím ngắn (tuỳ).

5. NÚT "TRANG TRÍ" + "XONG": giữ như 2026-11-14.13; chỉ xem lại chỗ đứng khi có thanh danh mục đáy (dọc) — không đè thanh
   công cụ đáy màn (Bản đồ / Về nhà / Biểu cảm / Túi đồ / Nhiệm vụ — ẩn khi trang trí hay giữ? tuỳ thiết kế), bản đồ nhỏ, ví.

6. CHUỖI TẠP HOÁ: dòng phụ hiện "Đồ trang trí Nhà của ta · mua một lần, đặt được nhiều ô" — không còn "ô"; đặt câu mới (vd.
   "mua một lần, đặt bao nhiêu tuỳ ý"); tấm "Vừa mua" đang ghi "Về nhà để đặt — chạm ô {loại} khi trang trí." → câu mới.

Chuỗi có sẵn: decorButton, decorDone, decorOwned, decorBuyAtShop, decorBuyAtShopDetail, homeName.
Chuỗi bỏ: decorSlotGarden, decorSlotYard, decorSlotIndoor, decorPick, decorReplace, decorRemove, decorPlacedHere, decorHint
(cũ "Chạm một ô để đặt vật"). Chuỗi mới cần đặt: viên nhắc chưa cầm / đang cầm, Xoay, Đặt, Cất, Huỷ, đếm món, đủ trần, 9 lý do
đỏ, gợi ý phím, "Đang đặt n", tấm báo cất, câu Tạp hoá.
Dùng lại: thẻ vật (2026-11-14.12), tấm đáy / cột phải bảng danh mục + viên nhắc + nút Xong (2026-11-14.13), nút nổi kiểu viên
thuốc (Vườn rau 2026-11-15.29), tấm báo `slate`, token jade / lacquer / gold / aura-light, kính sương.
App đang có: web/src/ui/decorHud.ts (nút Trang trí, viên nhắc, nút tròn bám ô, Xong), web/src/ui/decorPanel.ts (bảng danh
mục theo ô), web/src/scene/decorLayer.ts (dấu ô trên nền) — sẽ thay.
```
