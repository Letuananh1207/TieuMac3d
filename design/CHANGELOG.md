# Nhật ký thiết kế

Mỗi lần chốt một mục, mới nhất ở trên. Mã `<YYYY-MM-DD>.<số>`. Mỗi mục: loại (token · chuỗi · giao diện ·
luồng/luật · dữ liệu), màn / thành phần, phiếu đáp ứng (nếu có), file đổi.

## 2026-11-11.2 — Bật phong cách Trung Hoa + đặt tên khu

- Loại: cảnh 3D — **ngoại hình** (tường vôi, cổng, cây, màu) + **bố cục** nhỏ (thêm Văn Tháp, đồ trang trí, cây lẻ
  có va chạm) · chuỗi (tên nơi + 6 khu).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-11-bat-phong-cach-trung-hoa.md`.
- Trường đã đổi (cũ → mới):
  - `walls.style` gach → **voi**, `walls.color` #7a6e62 → #e8e1d2, `walls.windows` 0 → 6 (khe tường bao thành cổng
    trăng, lối đi 0,8 × khe = 3,2 m).
  - `gates[son-mon]` + `hanTitle` "文淵宗", `roofColor` #2b5446.
  - `buildingStyle` + `beamBlue` #3f5fa0, `gold` #d4a64a, `timber` #3a2418.
  - Mái lưu ly lục #3e6b5a → **#2b5446** (giảng đường, Dược các, cổng).
  - Nhà mới `van-thap` (`thap`, 5 tầng) tâm (−14,5; −14,5) 5×5.
  - Cây: mọi `yard` cũ + cụm cây chính → `tung`; thêm `yard` mai (±8,5; −4), (−36; −26), (−54; −26), liễu (−50,5; 15,5),
    (−50; 6,5), (−41; 16,5); hàng sau Cư Xá → `mai`; rìa cảnh thêm cụm mai / liễu (không va chạm).
    `trees.willow` #5f8a3e/#7a9f4c, `trees.plum` #3a2418/#e88aa4/#f2b8c6.
  - `props` +11: `dinh-dong` (0; −0,5); `den-da` (±3,5; −4,8), (±4,5; 40), (−47,5; −22), (−42,5; −22); `da-thai-ho`
    (−16; −6), (−40; 7), (−56; 15), (16; 16).
  - `buildings[giang-duong].notice` "Buổi tối" → "Buổi sáng" (trời đã là ban ngày).
  - **`site`**: tên nơi "Văn Uyên Tông"; khu (thứ tự khai báo): Sơn Môn x −6…6 z 21…56 · Ngoại Môn ±21 · **Diễn Võ
    Trường x 27…60, z −15…15** · Đệ Tử Cư Xá x 27…60 z 21…45 · Linh Dược Viên x −62…−27 z −15…20 · Luyện Đan Phòng
    x −62…−27 z −42…−21.
- `npm run scene:check`: **Không có lỗi**. Draw call: trên xuống 85–86 · cả sân 62 · góc chơi 62 (≤ 150, đo trên máy
  tính); ~80k tam giác.
- Kiểm đi tới được (code app, bán kính 0,5): tới được mọi khu, qua 3 cổng trăng + cổng sơn môn; vùng `lop-hsk3` đứng
  vào được 44 % ô lưới, `thu-vien` 38 % — **bằng đúng cảnh gốc trên code mới** (nền giảng đường rộng hơn), đồ trang
  trí không lấn vùng.
- Luật: `R-VA-1` ví dụ đúng (bắc dừng z −20,0; nam ở x 3 dừng z 20,0; x 0 qua khe). `R-HUD-1` ví dụ đúng (Diễn Võ
  Trường đúng ranh giới; (24; 0) ngoài mọi khu → "Văn Uyên Tông"). `R-VUNG-1` không đổi.
- Chuỗi mới: `l10n/vi.arb` (`siteName`, `area*`).
- **Cần code** (không gấp, chi tiết `scene/phong_cach.md` mục "Còn khác bản mẫu"): liễu mềm hơn (dải mảnh, cong, so
  le); đảo nổi có mặt cỏ, cây, đá; khe giữa đoạn tường khu thành cổng trăng.
- Ảnh: `screens/Canh-tren.png`, `Canh-ca-san.png` (chụp lại), `Canh-giang-duong.png` (mới).
- File: `scene/scene.json`, `scene/phong_cach.md`, `scene/tong_mon.md`, `l10n/vi.arb`, `screens/*.png`.

## 2026-11-11.1 — Tông môn đợt 1: đặt 6 khu phẳng + bảng màu + bản mẫu phong cách Trung Hoa

- Loại: cảnh 3D — **bố cục** (6 khu, điểm xuất phát, khe cổng) + **ngoại hình** (bảng màu, trời, đèn).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-11-dat-6-khu-tong-mon.md`.
- Bố cục (chi tiết `scene/tong_mon.md` mục "Đã đặt"):
  - **Điểm xuất phát: (0; 6) → (0; 50)** (trước cổng sơn môn).
  - Khe tường bao: **nam** tâm x 0 rộng **4** · **đông** tâm z 0 rộng 4 · **tây** tâm z **−4** rộng 4 (lệch để lối không
    đâm góc thư viện). **Tường bắc liền** (khe lên Thiên Bậc là đợt 2).
  - Tường khu: Diễn Võ x 27…60 × z −15…15 (khe tây z 0 rộng 5, khe nam x 44 rộng 5); Linh Dược x −62…−27 × z −15…20
    (khe đông z −4 rộng 5, khe bắc x −45 rộng 4).
  - Thêm: `paths` 6, `gates` 1 (`son-mon` (0; 44) rộng 6, "Văn Uyên Tông"), `water` 1, `props` 15, nhà mới 6
    (4 cư xá, `duoc-cac`, `luyen-dan`), `trees.yard` +2, `trees.groves` 11, `floating` 3 đảo + 10 mây.
  - `ground.size` 90 → 200; `fog` 28–70 → 45–140; `trees.ring.count` 26 → 0.
  - Giảng đường, thư viện, giếng, 5 cây cũ giữ nguyên chỗ → vùng `lop-hsk3` (0; −6,4) r 2,6 và `thu-vien` (−8,6; 4)
    r 2,4 không đổi.
- Ngoại hình (bảng màu đầy đủ `scene/phong_cach.md`): trời chạng vạng → chiều trong (`sky` #0f1730/#33476e/#8a7a86 →
  #5d86b5/#a8c0d6/#f0d9b0), sương #2c3a58 → #c3cbd4, nắng #ffd8a8 0,85 (−12;20;8) → #ffe2b8 0,95 (−24;26;10), hemi
  0,75 → 0,8; nền đá trắng #d9d4c7, cột son #a8322a, tường nhà #e8e1d2, xà #2f6f73; mái: giảng đường + Dược các
  lưu ly lục #3e6b5a, còn lại ngói xám #4f5a63; tường bao vân #7a6e62 hue 28, đỉnh ngói #4f5a63; sân hue 10 → 30;
  lá cây xanh tươi hơn; nước #3d6e86.
- `npm run scene:check`: **Không có lỗi**. Draw call (Canvas 3D, không tính lớp phủ): trên xuống 66–69 · cả sân 44 ·
  góc chơi 61 (≤ 150; đo trên máy tính, chưa đo điện thoại).
- Kiểm đi tới được (dựng thế giới bằng code app, dò lưới bán kính 0,5): từ xuất phát tới được cả 2 vùng và 6 khu;
  lối đá không bị chặn. Đối chiếu `R-VA-1`: từ (0; −17) đi lên bắc dừng z = −20,0; ở x = 3 đi xuống nam dừng z = 20,0;
  ở x = 0 qua khe nam → **ví dụ luật giữ nguyên** (khe nam rộng 4). `R-VUNG-1` không đổi.
- Chơi thử đi lại bằng nhân vật: https://claude.ai/artifact/GXXVj7PRJUsuZRxa8MHp7n (ghi trong `scene/README.md`).
- Bản mẫu phong cách Trung Hoa (miễn phí, code dựng lại, không gói ngoài): `source/PhongCach-KienTruc.dc.html`,
  `source/PhongCach-CayNhanVat.dc.html`, mô tả `scene/phong_cach.md`.
- **Cần code** (đủ trong `scene/phong_cach.md`): điện mái hiên kép + nền đá lan can; nhà nhỏ; tháp bát giác; cổng 3
  gian 4 trụ, xà ≥ 6 m (camera đang lọt sau biển khi qua cổng); tường vôi mái ngói + cổng trăng + màu tường riêng;
  cây `tung` · `lieu` · `mai`; props `da-thai-ho` · `den-da` · `dinh-dong`; nhân vật đệ tử chibi thay gấu khối;
  đo lại draw call. Ngoài ra: chip HUD "Học xá · Sân chính" nên đổi theo khu đang đứng.
- Ảnh: `screens/Canh-tren.png`, `screens/Canh-ca-san.png` (bảng màu mới, tắt lớp phủ).
- File: `scene/scene.json`, `scene/tong_mon.md`, `scene/phong_cach.md` (mới), `scene/README.md`,
  `source/canvas.json`, `source/PhongCach-*.dc.html` (mới), `screens/Canh-*.png` (mới).

## 2026-11-10.3 — Đề xuất quy hoạch tông môn (cảnh 3D, cần code trước)

- Loại: cảnh 3D — **bố cục (đề xuất)**. `scene/scene.json` **không đổi** (vẫn như 2026-11-10.2); `scene:check`:
  Không có lỗi.
- Mở rộng cảnh thành tông môn tu tiên 10 khu, sân hiện có làm Ngoại Môn. Chi tiết, toạ độ khu, lối nối:
  `scene/tong_mon.md`. Bản vẽ: `source/TongMon-ban-do.dc.html`. Chưa có ảnh.
- **Cần code** (đủ trong `scene/tong_mon.md`, theo thứ tự): nhiều khu + tường có cổng mở; địa hình cao thấp;
  bậc đá; kiểu nhà mới (điện hai tầng mái, tháp, mái cong); cổng sơn môn; ao / hồ / thác; vật trang trí khu (đài
  tỉ thí, giá binh khí, luống thuốc, lò đan); rừng trúc; đảo nổi + mây; hiệu năng cảnh lớn. Mọi thứ thêm vào
  `SceneSpec` có mặc định giữ cảnh cũ.
- Luật sẽ chạm khi đặt thật: `R-VA-1` (tường có khe, đi theo độ cao — cần đổi ví dụ), `R-VUNG-1` giữ ý. Lần này
  chưa đổi luật.
- Không phiếu (yêu cầu trong chat). Canvas 3D giữ cảnh 2026-11-10.2.
- File: `scene/tong_mon.md` (mới), `source/TongMon-ban-do.dc.html` (mới), `source/canvas.json`.

## 2026-11-10.2 — Khởi tạo cảnh 3D

- Loại: cảnh 3D. Ngoại hình + bố cục: **không đổi so với code (khởi tạo)**. `scene/scene.json` là bản chép
  `web/dist-design/scene.default.json` (= `DEFAULT_SCENE` trong `web/src/scene/spec.ts`), không sửa trường nào.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-10-khoi-tao-canh-3d.md`.
- `npm run scene:check`: Không có lỗi. Tường ±21 · xuất phát (0; 6) · nhà giang-duong tâm (0; -11) 13×7 quay 0° ·
  nhà thu-vien tâm (-12,5; 4) 7×6 quay 90° · vùng lop-hsk3 tâm (0; -6,4) r 2,6 · vùng thu-vien tâm (-8,6; 4)
  r 2,4 · 5 cây trong sân · giếng (6; 2).
- Luật: không chạm `R-VA-1`, `R-VUNG-1` (giá trị giữ nguyên).
- Canvas 3D: https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so (ghi trong `scene/README.md`).
- Cần code: không.
- File: `scene/scene.json`, `scene/README.md` (mới), `README.md` (thêm dòng `scene/`, câu về cảnh 3D).
- Ảnh cảnh: chưa có.

## 2026-11-10.1 — Khởi tạo canvas

- Loại: token
- Tạo canvas với artboard "Bảng token" rút từ code (`web/src/style.css`, `app/lib/theme/app_colors.dart`) →
  `tokens/design_tokens.json`. Không đổi giá trị nào so với code.
- Màn cũ (cảnh 3D, HUD, bảng bài học HTML) vẫn theo code, chưa vẽ lại.
- File: `source/canvas.json`, `source/Main.dc.html`, `tokens/design_tokens.json`.
