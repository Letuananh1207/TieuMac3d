# Nhật ký thiết kế

Mỗi lần chốt một mục, mới nhất ở trên. Mã `<YYYY-MM-DD>.<số>`. Mỗi mục: loại (token · chuỗi · giao diện ·
luồng/luật · dữ liệu), màn / thành phần, phiếu đáp ứng (nếu có), file đổi.

## 2026-11-14.16 — Nhà của ta: vườn theo cảnh (đặc tả HUD) · chữ vòng trận 我家 (Cần code)

- Loại: cảnh 3D — **ngoại hình** (đề xuất, chưa đổi được bằng đặc tả) + sửa ghi chú đặc tả giao diện. Phiên VS Code (`/canh`),
  người dùng nhờ "Sửa cả hai" sau khi soát cảnh 2026-11-14.15 với giao diện 2026-11-14.13.
- **Vườn**: cảnh `nha-ta.json` đặt Vườn phía **đông** (sau cổng trăng), artboard HUD 2026-11-14.13 vẽ vườn bên trái (hình giữ chỗ).
  Giữ cảnh; `docs/screen_specs.md` mục "Nhà của ta" thêm dòng: vị trí ô, dấu ô, camera lấy theo cảnh, không theo nền artboard.
  Không đổi `nha-ta.json`, không đổi mã ô.
- **Chữ trên vòng trận**: vòng trận về ở nhà đang khắc 起源 (Khởi Nguyên) như ở trấn. Đề xuất: ở Nhà của ta khắc **我家**; trấn giữ 起源;
  cảnh vùng khác giữ như hiện tại.
- **Cần code**: `TeleportSpec` thêm trường `text` (chuỗi Hán 1–3 chữ, mặc định `"起源"` — giữ cảnh cũ); `web/src/scene/truyenTong.ts`
  dùng `tp.text` thay hằng `TELEPORT_TEXT` khi vẽ phù hiệu; `specCheck` nhận trường mới; `designPreview.ts` nạp font cho chữ đó.
  Xong thì `design/scene/nha-ta.json` đặt `"teleport": { …, "text": "我家" }` (`/canh`).
- Luật: không chạm (R-NHA-1 chỉ nói có vòng trận).
- `scene:check`: không chạy lại (không đổi đặc tả). Ảnh: không chụp mới.
- File: `docs/screen_specs.md`, `CHANGELOG.md`.

## 2026-11-14.15 — Cảnh: Nhà của ta 我家 (tiểu viện riêng, 12 ô trang trí)

- Loại: cảnh 3D — **bố cục** (cảnh vùng mới `design/scene/nha-ta.json`, mã cảnh `nha-ta`). Đáp ứng kế hoạch
  `docs/tasks/2026-11-14-nha-nguoi-dung.md` NV4. Phiên VS Code làm thay vai thiết kế (`/canh`); **người dùng duyệt trên
  Canvas 3D 2026-11-14**.
- Bố cục: tiểu viện tường vôi 32 × 26 (x −16 … 16, z −14 … 12), cổng mái ngói giữa tường nam (biển "Nhà của ta"), tường
  thấp 2,2 m x 6,5 có cổng trăng "Vườn" chia **Sân trước** (tây) và **Vườn** (đông). Nhà chính `chinh-phong` kiểu mới
  **`nha-o`** (nhà ở 3 gian 正房, một tầng, gian giữa mở vào được, trong trống) tâm (0; −8) 10,5 × 6. Lối lát từ cổng lên
  thềm + nhánh sang cổng trăng và vào vườn. Tùng (−12,5; −10,5), trúc (−13; 8,5) trong sân; trúc mao ba phía ngoài tường.
  Vòng trận về (0; 7) r 4; người chơi bắt đầu (0; 2). Trời sáng xám xanh, sương 18–75, nền gạch vuông màu rêu.
- Khu (`site.areas`): Chính phòng 正房, Vườn 園, Sân trước 前院.
- Ô trang trí (`decorSlots`, R-NHA-2) — 12 ô: **trong** ×3 (−3,2; −9,8) · (0; −10) · (3,2; −9,8) sát tường sau nhà; **san**
  ×3 (−3,5; −2) · (3,5; −2,6) · (−7; 3,5); **vuon** ×6 (9; −11) · (13; −11) · (11; −7) · (14; −4) · (10,5; 4) · (14; 8).
  Mã ô là khoá lưu nhà (R-NHA-3) — **không đổi mã**.
- Luật: R-NHA-1 (vòng trận về, nơi trên bản đồ — mục 2026-11-14.13), R-NHA-2 (ô, loại ô), R-VA-* (tường viện, nhà
  `nha-o` va chạm tường + cột hiên) — không lệch.
- `scene:check`: Không có lỗi (mọi cảnh). Hiệu năng Canvas 3D (chưa có vật trang trí): trên xuống 55 draw call ·
  21,5k tam giác; cả sân 54 draw call. Đặt đủ 12 ô: thêm ≤ 14 draw call · ≤ 5,6k tam giác (vật 1 draw call, đèn lồng /
  tranh chữ 2) + dấu ô 6 draw call khi trang trí → vẫn < 80.
- Cần code: kiểu nhà `nha-o` (đã có, `web/src/scene/kien_truc/nha_o.ts`); hình 13 vật + dấu ô (NV6 — `scene/decorItems.ts`,
  `scene/decorLayer.ts`); ghép chế độ trang trí + HUD (NV8), nơi trên bản đồ (NV9).
- Canvas 3D: không đăng bản này (theo yêu cầu). Ảnh: `screens/Canh-nha-ta.png` (cả sân), `screens/Canh-nha-ta-tren.png`
  (trên xuống). Ảnh trong nhà (`?nv=0,-8.5`) chụp headless ra trang trắng — chưa có.
- File: `scene/nha-ta.json`, `screens/Canh-nha-ta.png`, `screens/Canh-nha-ta-tren.png`, `CHANGELOG.md`.

## 2026-11-14.14 — Cảnh: tiệm Tạp hoá 雜 bên lối Cổng Trấn (Khởi Nguyên Trấn)

- Loại: cảnh 3D — **bố cục**. Đáp ứng kế hoạch `docs/tasks/2026-11-14-van-tien.md` NV10, quyết định 1 (người dùng đã chọn
  hướng A: tiệm mới kiểu `cua-hang` biển 雜 trong trấn, mở bằng nút nổi "Vào tiệm"). Phiên VS Code làm thay vai thiết kế
  (`/canh`); người dùng duyệt hướng, **chưa duyệt trên Canvas 3D** — xem trên app sau khi gộp.
- `design/scene/scene.json`:
  - `buildings` thêm `{ "id": "tap-hoa", "kind": "cua-hang", "x": -11, "z": 30, "w": 8, "d": 6, "rotY": 90, "title": "Tạp hoá",
    "roofColor": "#3b3f44", "sign": "雜", "goods": "thung" }` — 2 gian, mặt tiền mở nhìn +x ra lối lát đá Cổng Trấn
    (x −4 … 4); chiếm x −14 … −8, z 26 … 34, mặt tiền đúng mép sân lát x −8.
  - `site.areas` "Cổng Trấn": `from` [−8, 17] → [−15, 17] — đứng trong tiệm chip vẫn ghi Cổng Trấn.
- Vì sao chỗ này: khảo cứu `docs/tham_khao/tien-ich-giao-luu.md` (hướng A) đặt **phố chợ dọc lối vào** (cửa hàng 2 tầng
  hai bên lối 8 m, kiểu 廟前街); người chơi bắt đầu ở (0; 36) đi thẳng lên cổng nên thấy tiệm ngay bên trái. Nền đã phẳng
  (bục x −53 … −8, z 18 … 42), không chắn lối 8 m, cách tùng (−11; 22) / (−11; 38) 4 m, đèn đá (−4,5; 27,5) 3,5 m, tường trấn
  z 17 cách 9 m. Phía đông lối để trống cho dãy tiệm sau (mép đông chưa san phẳng). Giọng C5: ngói xám, gỗ sẫm, cờ dọc.
- Nhận biết cho nút "Vào tiệm" (NV11): **mã nhà `tap-hoa`** — `cua-hang` là nhà vào được, `world.rooms` có phòng
  `zoneId === "tap-hoa"` (sàn `floor`). Không thêm trường đặc tả. **Không đổi mã này** (code NV11 sẽ dựa vào).
- Luật: `R-VA-*` (va chạm cửa hàng như hai tiệm Giang Nam), `R-HUD-1/3` (khu Cổng Trấn mở rộng) — không lệch.
- `scene:check`: Không có lỗi (mọi cảnh). Hiệu năng Canvas 3D: trên xuống 146 draw call · 116k tam giác (≤ 150 / 150k, sát
  trần — thêm tiệm ở trấn nên làm atlas biển trước); góc chơi trước cổng 80 draw call · 55k.
- Cần code: không (NV11 làm nút "Vào tiệm").
- Canvas 3D: chưa đăng bản này (theo yêu cầu). Ảnh: `screens/Canh-tap-hoa.png`.
- File: `scene/scene.json`, `screens/Canh-tap-hoa.png`, `CHANGELOG.md`; file sinh `web/src/fonts/han*` (thêm 雜).
## 2026-11-14.13 — Nhà của ta 我家: nơi trên bản đồ, nút Trang trí, chế độ trang trí

- Loại: giao diện · chuỗi · dữ liệu (bản đồ). Màn: **Nhà của ta** (HUD web) + **bản đồ truyền tống** (nơi mới). Đặc tả:
  `docs/screen_specs.md` mục cùng tên.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-14-nha-nguoi-dung.md` (mục 1–3; mục 4 thẻ tên khu bỏ theo R-HUD-3).
- Vẽ trong phiên VS Code theo vai thiết kế; người dùng duyệt "Ổn, chốt".
- Artboard: `NhaTa-ban-do`, `NhaTa-doc`, `NhaTa-doc-trang-tri`, `NhaTa-doc-o-trong`, `NhaTa-doc-o-co-vat`, `NhaTa-doc-the-khoa`,
  `NhaTa-ngang`, `NhaTa-ngang-o` (+ `canvas.json`).
- Quyết định:
  - Bản đồ: "Nhà của ta" ở góc trên phải **Trung Nguyên** (1190; 560), gần Khởi Nguyên Trấn; vùng chạm **r 80** riêng (để không chồng
    r 105 của trấn) → `ban-do.json` `noi` có thể mang `r` riêng; code đọc `r` từng nơi (trước dùng chung 105).
  - Nút "Trang trí" nằm cạnh nút Trò chuyện (dọc trên, ngang trái); chế độ trang trí ẩn cụm điều khiển, giữ ví, có viên nhắc + "Xong".
  - Dấu ô = vòng elip trên nền + nút tròn nổi có huy hiệu loại ô; bảng danh mục dọc nửa dưới / ngang cột phải; thẻ vật dùng lại kiểu
    2026-11-14.12 (khoá → chỉ dẫn Tạp hoá, không mua trong nhà).
- Dữ liệu: `scene/ban-do/ban-do.json` (+ nơi `nha-ta`, vùng trung-nguyen), `scene/ban-do/ve-ban-do.html` (biểu tượng + `r` riêng),
  `scene/ban-do/ban-do-goc.png` vẽ lại, `screens/BanDo-trang-thai.png` vẽ lại.
- Token: không thêm. Chuỗi mới: `homeName`, `decor*` (11).
- Luật bị chạm: không đổi — R-NHA-1 (đi từ bản đồ, luôn mở), R-NHA-2 (ô / đặt / thay / gỡ, đứng yên, xoay camera) khớp. Ghi chú cho
  phiên code: ví dụ R-NHA-1 có thể nêu toạ độ chạm (1190; 560) r 80. Thẻ khoá theo đề xuất R-NHA-4 của 2026-11-14.12.
- Cảnh 3D của nhà (`design/scene/nha-ta.json`, vị trí ô) chưa có — việc của `/canh`; nền artboard là hình vẽ giữ chỗ.

## 2026-11-14.12 — Văn tiền 文錢: ví HUD, hiệu ứng nhận tiền, Tạp hoá 雜貨, thẻ vật khoá ở nhà

- Loại: giao diện · token · chuỗi · dữ liệu (bảng giá đề xuất) · luồng/luật (đề xuất). Màn: **Ví Văn tiền + hiệu ứng** (HUD
  web + Flutter), **Tạp hoá** (Flutter, mới), **Danh mục trang trí — thẻ vật** (mở rộng phiếu `2026-11-14-nha-nguoi-dung`).
  Đặc tả: `docs/screen_specs.md` ba mục cùng tên.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-14-van-tien-cua-hang.md` (phiếu còn trong máy, chưa lên GitHub — phiên code
  đang soạn; dòng "Đã vẽ" ghi ở bản trong máy). Ý tưởng gốc: `docs/y_tuong/2026-11-14-van-tien.md` (hướng A).
- Vẽ trong phiên VS Code theo vai thiết kế (người dùng dán phiếu, duyệt "Ổn, chốt").
- Artboard: `VanTien-HUD-doc`, `VanTien-HUD-ngang`, `VanTien-vi-trang-thai`, `VanTien-hieu-ung`, `CuaHang-doc`,
  `CuaHang-doc-ngheo`, `CuaHang-doc-xac-nhan`, `CuaHang-doc-vua-mua`, `CuaHang-doc-het`, `CuaHang-ngang`,
  `TrangTri-the-vat` (+ `canvas.json`).
- Quyết định:
  - Ví ở **góc trên phải** (dọc + ngang), viên kính 36. Không trái R-HUD-1 (chỉ cấm chip tên khu + nút góc nhìn).
  - Đồng xu lỗ vuông vàng đồng; xu bay khắc chữ vừa học ở mặt sau; xu trong ví không khắc.
  - Màn Flutter che HUD → hiệu ứng dùng **ví tạm** trượt vào góc trên phải màn Flutter.
  - Tạp hoá là màn Flutter cùng họ Danh mục sách; giá ghi số + số chữ Hán (…文).
  - **Không mua trong nhà**: thẻ khoá ở danh mục trang trí chỉ dẫn ra Tạp hoá.
  - Hình vật trong thẻ là bản vẽ phẳng giữ chỗ — phiên code có thể thay ảnh chụp vật 3D.
- Token mới: `color.coin-rim` #A9802F, `color.coin-ink` #5A3E12 (đồng xu); `color.slate-muted` #5E6A70 (đã dùng từ các mục
  trước, nay đặt tên); `size.wallet` 36.
- Chuỗi mới (`l10n/vi.arb`): `coinName`, `wallet*`, `reward*`, `shop*`, `slotGarden/Yard/Indoor`, `decor*`.
- Dữ liệu — **bảng giá đề xuất** (`web/src/zones/decor.ts` `price`): Trúc cảnh 30 · Đèn lồng 30 · Tranh chữ 40 · Chậu lan 50 ·
  Mai 60 · Lư hương 70 · Tùng 80 · Án đọc 90 · Bàn trà 100 · Kệ sách 120 · Bình phong 150 · Đá Thái Hồ 160 · Ao sen 200.
- Luật bị chạm — **đề xuất** (phiên code hỏi người dùng rồi sửa sổ):
  - Nhóm mới **R-TIEN-*** theo ý tưởng (nguồn + mức thưởng, trần trò 60 / ngày, mua: đủ tiền → trừ → vào sở hữu, không âm,
    không mất khi nghỉ) — thêm: số xu bay = 1 / 5 Văn tiền (tối đa 5) chỉ là hiệu ứng, không ảnh hưởng số dư.
  - **R-NHA-4**: người mới sở hữu sẵn **Trúc cảnh, Đèn lồng, Tranh chữ**; các vật khác mua ở Tạp hoá với giá trên; thẻ chưa
    có hiện khoá + giá, không đặt được.
  - **R-NHA-2**: giữ "một vật đặt được ở nhiều ô" — mua một lần là đủ (bỏ cụm "tới khi có tiền tệ").
  - Người dùng đã duyệt ("Ổn, chốt").
- Ảnh: chưa có.

## 2026-11-14.11 — Bộ ảnh nhiều góc NPC Tiểu nhị 小二 (hướng A trà bác sĩ trẻ 茶博士)

- Loại: tài nguyên 3D — ảnh đầu vào (Hunyuan3D-2mv). Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-anh-tieu-nhi.md`.
- Mã mục: phiên thiết kế ghi `.7`; khi gộp nhánh (2026-11-14) đổi thành `.11` vì máy VS Code đã dùng .7 cho "Bản đồ truyền tống: chỉ chữ Việt…".
- Người dùng chưa ưng mô tả phiếu cũ (áo lam, khăn trắng vắt vai, kiểu tiểu nhị trên phim) → khảo cứu `docs/tham_khao/tieu-nhi.md`
  (3 hướng, artboard `TieuNhi-huong`) → người dùng chọn **A "trà bác sĩ trẻ"**: khăn vấn nâu sẫm #4A4038 thắt nút + 2 đuôi sau gáy,
  áo ngắn màu trà #B07A4A cổ giao lĩnh vạt trái đè phải, **dây tháp tay áo 襻膊 đỏ son #A8322A** buộc tay áo, chéo chữ X sau lưng,
  đai nâu #3A2418, tạp dề chàm #3F5873, khăn lau ngà gài hông, quần nâu #5A4636 + xà cạp ngà, giày đen. Màu ấm — tách khỏi Mặc
  Ông (chàm), Tiểu Mặc (trắng), thủ thư (thanh lục).
- Ảnh: `models/anh/tieu-nhi-{truoc,trai,sau,phai,mat}.png` — Google Gemini (người dùng chạy). Câu lệnh: ảnh trước đính kèm
  `anh/nhan-vat-truoc.png` ("NEW character in exactly the same 3D vinyl toy style… young Song-dynasty teahouse server… red cloth cord
  … crosses in an X on the back… A-pose… orthographic… plain #DDDDDD"); trái / sau / phải / cận mặt mỗi ảnh một cuộc trò chuyện mới,
  đính kèm ảnh trước. Nguyên văn cả 5 câu: ghi chú `tieu-nhi-cau-lenh` trong `source/canvas.json`.
- Chuẩn hoá (Pillow): tách nền xám nối mép ảnh, nền #DDDDDD, bỏ sao Gemini, 4 góc chung hệ số thu 0,978, đế giày 90 %, đỉnh đầu
  10 % (sau, búi cao nhất) – 11,6 % (trước), trục thân theo chân giữa ảnh; PNG 1024 × 1024. Ảnh duyệt: `screens/TieuNhi-bo-anh.png`.
- **Lưu ý cho `/tai-nguyen`**: khăn lau ở hông **trái** nhân vật (câu lệnh ghi phải) nhưng **khớp cả 4 góc** — giữ. Đuôi khăn vấn
  rủ cạnh má ở ảnh trước: mảnh nhỏ, có thể dính mặt khi dựng.
- Bước kế: `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh tieu-nhi <ra>` → `models/tieu-nhi.glb` (phiên `/tai-nguyen`).
- File: `models/anh/tieu-nhi-*.png` (5), `models/LICENSES.md`, `screens/TieuNhi-bo-anh.png`, `source/TieuNhi-bo-anh.dc.html`,
  `source/TieuNhi-huong.dc.html`, `source/canvas.json`; ngoài design: `docs/tham_khao/tieu-nhi.md` + README (khảo cứu).

## 2026-11-14.10 — Ngồi ôn: nút, cuộn sách trên tay, bảng chọn (cuộn treo), màn Bộ đã học

- Loại: giao diện · chuỗi · luồng/luật (đề xuất). Màn: **Ngồi ôn** (HUD web + vật 3D + bảng chọn Flutter) và **Bộ đã
  học** (Flutter) — đặc tả `docs/screen_specs.md` hai mục cùng tên.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-ngoi-on.md`.
- Mã mục: phiên thiết kế ghi `.6`; khi gộp nhánh (2026-11-14) đổi thành `.10` vì máy VS Code đã dùng .1 → .8 (người dùng chọn giữ số bên máy).
- Artboard: `NgoiOn-doc-ton-mon`, `NgoiOn-doc-rung-truc`, `NgoiOn-doc-chua-hoc`, `NgoiOn-doc-du-50`,
  `NgoiOn-ngang-ton-mon`, `NgoiOn-ngang-chua-hoc`, `NgoiOn-nut-trang-thai`, `NgoiOn-cuon-sach`, `BoDaHoc-doc`,
  `BoDaHoc-doc-day`, `BoDaHoc-ngang` (+ `canvas.json`).
- Quyết định:
  - Bảng chọn là **cuộn treo** (giấy `map-paper` giữa hai trục gỗ, đầu trục ngọc viền vàng, ấn son 溫故) — cùng họ với
    cuộn sách trên tay và cuộn bản đồ. Đặt **nửa trên** (dọc) / **bên phải** (ngang) để luôn thấy nhân vật ngồi cầm cuộn;
    cảnh tối 16 %; cần điều khiển, cụm nút, nút Trò chuyện ẩn khi bảng mở.
  - Mục mờ: viền nét đứt + dòng lý do có biểu tượng (không chỉ giảm độ mờ — chữ vẫn đọc được ≥ 4,5:1).
  - Cuộn sách trên tay: cuộn tay mở ngang, trục 0,22 m, giấy 0,26 × 0,18, tâm cao 0,30 trước ngực 0,18, ngửa 30°; nhịp mở
    0,3 → 1 s; bỏ chữ Hán trên đầu lúc nhập định (mục 2026-11-13.19).
  - Bộ đã học: lưới ô (chữ, tên, 7 chấm bậc nhớ theo R-ON-1, hạn ôn), bộ đến hạn viền son.
- Token: không thêm (dùng scroll-wood, map-paper, jade, gold, lacquer, frost*). Màu chữ mờ `#5E6A70` đã dùng ở các mục
  trước — phiên code xem có nên thành token `slate-muted`.
- Chuỗi (`l10n/vi.arb`): đổi `actionSit` "Ngồi ôn", `actionSitting` "Đang ôn", `actionSitLabel` "Ngồi ôn"; **bỏ**
  `actionCultivate`, `actionCultivating`, `actionCultivateLabel`; thêm `actionSit*Label`, `reviewScroll*`, `reviewDue*`,
  `learnNew*`, `learnAt*`, `learnAllDone*`, `viewLearned*`, `hintGoForest`, `standUp`, `learned*`.
- Luật bị chạm — **đề xuất** (phiên code hỏi người dùng rồi sửa sổ):
  - **R-ON-8**: chưa học bộ nào → mục Ôn ghi "Chưa có bộ nào để ôn" (thay "Hôm nay đã ôn xong") và bảng có thêm dòng gợi ý
    "Chưa học bộ nào. Đến Truyền Tống Đài, chọn Rừng trúc rồi Ngồi ôn để học bộ đầu tiên." Ôn khi n = 0 không ghi "(0)".
    Không mục nào dùng được → không mục nào nổi bật.
  - **R-ON-8 / R-VUNG-3**: khi bảng mở, ẩn cần điều khiển, cụm nút hành động, nút Trò chuyện.
  - Người dùng đã duyệt bố cục ("Ổn, chốt").
- Ảnh: chưa có (nền cảnh là hình vẽ giữ chỗ).

## 2026-11-14.9 — Trò chuyện kênh chung (nút, ô nhập, khung kênh, bong bóng trên đầu)

- Loại: giao diện · chuỗi. Màn: **Trò chuyện kênh chung** (HUD web) — đặc tả `docs/screen_specs.md` mục cùng tên.
- Mã mục: phiên thiết kế ghi `.1`; khi gộp nhánh (2026-11-14) đổi thành `.9` vì máy VS Code đã dùng .1 cho "Tường mỏng…".
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-14-tro-chuyen-kenh-chung.md` (phiếu còn trong máy, chưa lên GitHub — phiên
  code đang soạn; dòng "Đã vẽ" ghi ở bản trong máy).
- Artboard: `Chat-doc` (đi lại: khung thu gọn + bong bóng mình / NPC), `Chat-doc-go` (đang gõ, bàn phím, khung mở rộng,
  52/60), `Chat-ngang` (bong bóng chồng → đẩy lên + vạch nối), `Chat-ngang-go`, `Chat-trang-thai` (5 trạng thái ô nhập,
  khung rỗng / đầy + "Tin mới", bong bóng 1 từ / 57 chữ / Hán + Việt / NPC, vòng đời 6 s, nút thường / nhấn, khi nào
  ẩn). Nền giữ chỗ: ảnh Canvas 3D mới tải lên canvas (`chat-nen-doc.png`, `chat-nen-ngang.png`).
- Quyết định thiết kế (phiếu để ngỏ):
  - Nút "Trò chuyện" tròn 48 bên phải ngay trên cụm hành động (ngón cái với tới; góc trên trống theo `R-HUD-1`).
  - Khung thu gọn trái trên joystick, không bắt chạm (`R-DIEU-1`), mờ hết sau 10 s im lặng.
  - **Gửi xong đóng ô nhập** (thấy ngay bong bóng của mình).
  - Đếm chữ chỉ hiện từ 50; quá 60 không cắt chữ — báo đỏ, Gửi mờ. Gửi dồn < 1,5 s: Gửi mờ + vòng chờ.
  - Bong bóng 3 kiểu: mình viền `jade`, người khác kính, NPC giấy viền vàng. Chồng nhau → bong bóng cũ hơn đẩy lên.
  - Tên kênh "Kênh chung" + 傳音; tên mình "Ta".
- Thành phần mới (`docs/components.md`): nút Trò chuyện, khung thu gọn, khung mở rộng, ô nhập + Gửi, bong bóng. Token: không
  thêm.
- Chuỗi mới (`l10n/vi.arb`): `chatOpen`, `chatChannel`, `chatHint`, `chatSend`, `chatClose`, `chatEmpty`, `chatEmptySub`,
  `chatSelf`, `chatCount`, `chatTooLong`, `chatWait`, `chatNew`.
- Luật: không đổi. Theo `R-CHAT-1/2/3` (đang "chờ"), `R-DIEU-1`, `R-NPC-2`, `R-HUD-1`, `R-MAN-1`. Đề xuất ghi thêm vào
  `R-CHAT-3` (phiên code hỏi người dùng): khung thu gọn tự mờ sau 10 s im lặng; gửi xong ô nhập đóng.
- File: `source/Chat-*.dc.html` (mới), `source/canvas.json`, `docs/screen_specs.md`, `docs/components.md`, `l10n/vi.arb`.
## 2026-11-14.8 — Đổi tên: app "Tiểu Mặc 3D", trung tâm "Khởi Nguyên Trấn"

- Loại: chuỗi · dữ liệu (cảnh, bản đồ) · luồng/luật (chỉ chữ). Phiên VS Code (`/lead`, kế hoạch
  `docs/tasks/2026-11-14-doi-ten-khoi-nguyen-tran.md`); người dùng: "không muốn tên là văn uyên tông nữa mà cả ứng dụng
  tên Tiểu Mặc 3D còn phần trung tâm hãy tìm 1 cái tên khác phù hợp với vai trò của nó" → chọn **Khởi Nguyên Trấn**
  起源鎮 (nơi chung, ai cũng bắt đầu ở đây, trung tâm nối đi mọi vùng); đổi luôn tên khu kiểu môn phái. Chỉ tên hiển thị
  (mã `van-uyen`, `tong-mon`, gói `hoc_xa_3d` giữ).
- Tên app trên máy: "Học Xá 3D" → **"Tiểu Mặc 3D"** (Android, iOS, web, tiêu đề trang).
- `scene.json`: `site.name` Văn Uyên Tông → Khởi Nguyên Trấn, biển cổng 文淵宗 → 起源鎮; khu Sơn Môn 山門 → **Cổng Trấn**
  鎮門, Ngoại Môn 外門 → **Quảng Trường** 廣場, Nội Môn 內門 → **Thượng Trấn** 上鎮.
- Bản đồ: nơi `van-uyen` → "Khởi Nguyên Trấn" (Hán 起源), vẽ lại giấy. Phù hiệu vòng trận 文淵 → 起源.
- Chuỗi (`l10n/vi.arb`): `siteName`, `siteHan`, `areaNgoaiMon`, `areaSonMon`, `placeVanUyen`, `dailyEyebrow`, màn tải
  "Đang mở sơn môn…" → "Đang mở đường…". Lời thoại Tiểu Mặc / Mặc Ông viết lại theo vai trấn chung.
- Luật: 14 quy tắc chỉ đổi chữ (tông môn → trấn, tên khu) — sổ + tài liệu online, đã `--mark-synced`.
- File: `scene/scene.json`, `scene/ban-do/{ban-do.json,ve-ban-do.html,ban-do-goc.png}`, `screens/BanDo-trang-thai.png`,
  `l10n/vi.arb`. Tài liệu cũ (`scene/tong_mon.md`, `hanh_trinh.md`, mục CHANGELOG cũ) giữ tên cũ như lịch sử.

## 2026-11-14.7 — Bản đồ truyền tống: chỉ chữ Việt, bỏ đường toả về trung tâm

- Loại: giao diện (tấm giấy bản đồ). Phiên VS Code làm thay thiết kế; người dùng: "trên bản đồ bỏ tiếng trung và các
  đường nối đến trung tâm".
- Bỏ mọi chữ Hán trên giấy: tên vùng, tên nơi, dấu triện 文淵行旅, chữ 北 trên la bàn (→ "B"), triện 家 trên biểu tượng
  Văn Uyên Tông. Tên nơi chỉ còn tiếng Việt 46/700 `slate` viền giấy, cách tâm biểu tượng 76. Tên vùng: tiếng Việt in hoa
  46/700 giãn 12 px, mờ .42; vùng chưa khám phá giữ một dòng "MẠC BẮC · chưa khám phá".
- Bỏ quan đạo từ Văn Uyên Tông tới các nơi và đường cụt Văn Uyên → Lĩnh Nam. Giữ: đường biển Giang Nam → Bồng Lai, đường
  cụt từ các nơi vào vùng chưa khám phá (Tơ lụa → tây, Rừng trúc → Điền Nam, Trường Thành → Mạc Bắc qua cổng).
- Vị trí tên vùng dời theo chữ Việt dài hơn: Tây Vực (190; 538) · Kinh Kỳ (1560; 140) · Trung Nguyên (990; 925) · Ngô Việt
  (1420; 1050) · Đông Hải (1850; 1010).
- Toạ độ nơi, vùng chạm, ghim, huy hiệu: không đổi so với .6. `ban-do.json` giữ `han` (thẻ HUD "sắp mở" vẫn dùng). Cần
  code: không — `npm run build`.
- File: `scene/ban-do/ve-ban-do.html`, `ban-do-goc.png`, `ban-do.json` · `screens/BanDo-trang-thai.png` · `docs/screen_specs.md`.

## 2026-11-14.6 — Bản đồ truyền tống: thế giới chia vùng, mỗi cảnh là một điểm trong vùng

- Loại: giao diện (tấm giấy bản đồ) · dữ liệu (toạ độ + danh sách vùng). Phiên VS Code làm thay thiết kế; người dùng:
  "các vùng đất vẫn đang lớn… phải phân thành các vùng và các map hiện tại chỉ là 1 phần của vùng đó… trên nền 1 bản đồ
  có ý nghĩa chứ không phải chỉ cách thể hiện 7 vùng".
- **Nền = các miền** (theo địa lý Trung Hoa cổ, phân vùng nhiễu, ranh nét mực nâu đứt): 西域 Tây Vực (tơ lụa) · 燕雲 Yên
  Vân (Trường Thành) · 京畿 Kinh Kỳ (Tử Cấm Thành) · 中原 Trung Nguyên (Văn Uyên Tông, nhà) · 巴蜀 Ba Thục (Rừng trúc —
  "biển trúc" Thục Nam) · 吳越 Ngô Việt (Giang Nam) · 東海 Đông Hải (Bồng Lai). **Chưa khám phá** (giấy gạch chéo, chỗ cho
  nơi mới): 漠北 Mạc Bắc (bắc Trường Thành) · 嶺南 Lĩnh Nam · 滇南 Điền Nam.
- Tên vùng: Hán 96 mờ (.30) giãn 18 px + tên Việt in hoa 32 giãn 6 px (.62); vùng chưa khám phá một dòng "漠北 MẠC BẮC ·
  chưa khám phá" (Hán 40, Việt 26).
- **Nơi = điểm nhỏ**: biểu tượng × 0,6 trên đế elip giấy 184 × 52; tên Hán 56 / Việt 40 cách tâm 72; vùng chạm r 105.
  Toạ độ: Tơ lụa (380; 300) · Trường Thành (960; 225) · Tử Cấm Thành (1450; 290) · Rừng trúc (480; 770) · Văn Uyên
  (1000; 680) · Giang Nam (1450; 760) · Bồng Lai (1880; 610).
- Giữ từ .5: quan đạo toả từ nhà (dừng trước biểu tượng), đường biển + thuyền sang Bồng Lai, đường cụt nét đứt vào vùng
  chưa khám phá (Mạc Bắc qua cổng tường, Lĩnh Nam, Điền Nam, tây), Trường Thành = ranh Mạc Bắc. Sông Hoàng Hà / Trường
  Giang vắt ngang các miền.
- Lớp trạng thái theo cỡ mới: ghim dx −72 dy −40 r 52; huy hiệu dx 62 dy −62 r 28.
- `ban-do.json` thêm `vung` (id, Hán, tên, `noi` thuộc vùng, `chuaKhamPha`) — để tra khi thêm nơi; code chưa đọc.
  Cần code: không — `npm run build` (bộ cắt font lấy thêm chữ Hán tên vùng).
- Ở màn dọc tên nơi ≈ 7 px (Việt 40 trên giấy rộng 352) — nhỏ; hướng sau: bản đồ kéo / phóng được (cần code).
- File: `scene/ban-do/ve-ban-do.html`, `ban-do-goc.png`, `ban-do.json` · `screens/BanDo-trang-thai.png` · `docs/screen_specs.md`.

## 2026-11-14.5 — Bản đồ truyền tống: nối các khu thành một thế giới

- Loại: giao diện (tấm giấy bản đồ) · dữ liệu (toạ độ). Phiên VS Code làm thay thiết kế; người dùng: "cách trình bày của
  các vùng đất đang tách rời chứ chưa có logic nào".
- **Quan đạo toả từ nhà**: Văn Uyên Tông ở giữa, mỗi khu một đường đất (viền nâu 20 px, lòng #F3E9D2 9 px) về nhà — hình
  sao, không thứ tự (khác đường "rắn" cũ). Đường chỉ chạy giữa mép hai khu, không xuyên biểu tượng / chữ; đường lên
  Trường Thành vào sườn đông của khu để tránh nhãn.
- **Đường biển**: Giang Nam → bến bờ đông → nét đứt trắng + thuyền sang đảo Bồng Lai; một tuyến mờ ra khơi phía đông.
- **Đường cụt vào sương** (chỗ cho nơi mới): Tơ lụa → tây, Rừng trúc → tây nam, Văn Uyên → nam, Trường Thành → bắc (qua
  cổng trên tường), Giang Nam → nam; nửa sau nét đứt mờ dần, cuối đường có sương.
- **Trường Thành** chạy dọc dãy núi phía bắc (y ≈ 78), tháp canh cách 200 px, chừa cổng ở x 1000.
- Giãn khu: elip khu rx 190 · ry 180 (tâm dưới biểu tượng 60); bờ biển dời đông 90 px. Toạ độ: Tơ lụa (470; 320) ·
  Trường Thành (1000; 230) · Tử Cấm Thành (1500; 320) · Rừng trúc (500; 790) · Văn Uyên (1000; 700) · Giang Nam
  (1480; 800) · Bồng Lai (1880; 640). Cần code: không — `npm run build`.
- File: `scene/ban-do/ve-ban-do.html`, `ban-do-goc.png`, `ban-do.json` · `screens/BanDo-trang-thai.png` · `docs/screen_specs.md`.

## 2026-11-14.4 — Bản đồ truyền tống: khu nhỏ lại, chừa đất chưa khám phá

- Loại: giao diện (tấm giấy bản đồ) · dữ liệu (toạ độ). Phiên VS Code làm thay thiết kế; người dùng: "các vùng đất trên
  bản đồ hiện quá lớn tôi muốn nhỏ hơn vì sau này còn có những chỗ khác".
- Mỗi khu chỉ chiếm một mảng elip quanh biểu tượng (rx 205 · ry 185, tâm dưới biểu tượng 45 px, mép uốn nhiễu); phần đất
  còn lại là **đất chưa khám phá**: giấy #ECE5D3, vân gạch chéo mờ, núi xám nhạt, sương — chỗ cho nơi mới (rìa tây, rìa
  nam, khe giữa các khu, biển đông). Đảo Bồng Lai nhỏ lại (150 × 130).
- Biểu tượng × 0,8; nhãn Hán 92 → 74, Việt 62 → 50, cách tâm biểu tượng 150 → 120. Vùng chạm r 150 → **130**.
- Toạ độ (cũ → mới): Tơ lụa (330; 300) → (560; 330) · Trường Thành (950; 230) → (1000; 250) · Tử Cấm Thành (1450; 280) →
  (1400; 330) · Rừng trúc (300; 780) → (600; 760) · Văn Uyên (820; 720) → (1000; 680) · Giang Nam (1300; 770) → (1390; 760) ·
  Bồng Lai (1850; 700) → (1830; 640).
- Lớp trạng thái theo cỡ mới: ghim (dx −95, dy −50, r 66); huy hiệu đồng hồ (dx 82, dy −82, r 34). Cần code: không (code
  đọc số từ `ban-do.json`) — `npm run build`.
- Ở màn dọc chữ nhỏ hơn ≈ 20 % (Việt ≈ 9 px trên giấy rộng 352). Nếu khó đọc → hướng sau: bản đồ kéo / phóng được (cần code).
- File: `scene/ban-do/ve-ban-do.html`, `ban-do-goc.png`, `ban-do.json` · `screens/BanDo-trang-thai.png` · `docs/screen_specs.md`.

## 2026-11-14.3 — Nhãn tên trên đầu nhân vật: chữ trơn viền mực

- Loại: giao diện (thành phần HUD). Phiên VS Code làm thay thiết kế; người dùng: "thay đổi phong cách hiện tên sao cho
  chuyên nghiệp" → chọn **chữ trơn viền tối** (trong 3 hướng: chữ trơn · chữ trơn + danh hiệu · thẻ tên cổ trang).
- Cũ → mới: pill cao 24, nền `frost` .88, chấm vàng 4 px, chữ 12/700 `slate` → không nền / khung / chấm; chữ 13/700 ngà
  #F4F1EA, giãn .02em, viền mực .6 px, bóng 0 1 2 px `slate` .85 + quầng 6 px .45.
- Kèm sửa lỗi L-11: nhãn ẩn khi bản đồ truyền tống / màn tải / bài học phủ cảnh.
- Đã áp: `web/src/style.css` `.label`, `web/index.html` (bỏ chấm). Luật: không đổi.
- File: `docs/components.md`, `docs/screen_specs.md`.

## 2026-11-14.2 — Bản đồ truyền tống: lục địa chia khu + ghim đầu nhân vật chính (bỏ vòng tròn, bỏ triện 此)

- Loại: giao diện (tấm giấy bản đồ) · dữ liệu (toạ độ `ban-do.json`). Phiên VS Code (`/canh`), người dùng: "đổi phong
  cách bản đồ hiện nay thành 1 bản đồ với các khu chứ không theo thứ tự như hiện tại" → chọn **lục địa địa lý**; mở khoá
  "tự do" — đã đúng từ trước (R-HANH-1 không khoá theo tiến độ), không đổi luật.
- Giấy 2048 × 1152 vẽ lại bằng `ve-ban-do.html`: mỗi nơi một vùng đất màu riêng (ranh giới uốn tự nhiên, nét mực nâu,
  dải đậm 14 px trong mép), đại lục phía tây + biển đông, Bồng Lai là đảo ngoài khơi; bỏ đường chấm nối + dòng sông
  "rắn"; thêm sông Hoàng Hà / Trường Giang, la bàn 北, trang trí nhỏ theo khu (đồi cát, núi, ruộng, ao). Biểu tượng và cỡ
  nhãn giữ như .9; font lấy từ `web/node_modules/@fontsource` (vẽ lại không cần mạng); `?xuat` để xuất PNG headless.
- Toạ độ (tâm biểu tượng, r 150 giữ nguyên): Văn Uyên (260; 730) → **(820; 720)** · Rừng trúc (760; 730) → **(300; 780)** ·
  Giang Nam (1260; 730) → **(1300; 770)** · Bồng Lai (1760; 730) → **(1850; 700)** · Trường Thành (1760; 270) →
  **(950; 230)** · Tử Cấm Thành (1160; 270) → **(1450; 280)** · Tơ lụa (560; 270) → **(330; 300)**. `trangThai` giữ (mục
  `khoa` thừa — code đã bỏ). Ghi chú .11 (chấm vàng Rừng trúc đè chữ "lụa") hết: chấm ở (300; 630), nhãn Tơ lụa dừng 610.
- **Lớp trạng thái** (người dùng: "không thích biểu tượng khoanh vùng tròn … không dùng chữ đỏ để chỉ vùng đất đang ở mà
  nên dùng icon đầu nhân vật chính"): bỏ mọi vòng tròn r 150 (vùng chạm vẫn r 150, chỉ không vẽ).
  - `mo` (đã có cảnh): **không vẽ gì**.
  - `oDay`: bỏ triện son 此 → **ghim tròn đầu nhân vật chính** — tâm (x − 110; y − 60), r 80, nền #F4F7F6, viền `jade`
    8 + viền ngoài vàng #D4A64A 4, đuôi nhọn chỉ xuống dài 30 rộng 48, bóng elip 26 × 8. Ảnh mới
    `scene/ban-do/ban-do-nhan-vat.png` 256 × 256 nền trong suốt (cắt từ `models/anh/nhan-vat-mat.png`; ảnh phủ 2,16 r).
  - `sapMo`: bỏ vòng nét đứt, **chỉ còn huy hiệu đồng hồ** (x + 100; y − 100) r 40.
  - `vuaCham` (đổi tên từ `khoaVuaCham`): viền huy hiệu đồng hồ đổi son #A8322A, nhấp nháy 2 lần / 0,6 s (thay vòng son).
  - Bỏ `khoa`.
- Luật: R-HANH-2 không nêu hình vòng / triện → không đổi nội dung (chỉ "nơi đó nhấp nháy" = huy hiệu nhấp nháy).
- Ảnh PNG 1,5 → 2,4 MB (màu khu + vân giấy).
- **Cần code** (`/lead`): `web/src/scene/banDo.ts` vẽ lớp trạng thái theo `trangThai` mới — bỏ `ring` ở `mo` / `sapMo` /
  vừa chạm, bỏ triện 此; `oDay` vẽ ghim (nạp `ban-do-nhan-vat.png` như ảnh giấy — `import.meta.glob ?url`, chạy offline);
  nhấp nháy đọc `vuaCham` thay `khoaVuaCham`. Chưa sửa code thì app vẫn vẽ vòng + 此 (mặc định trong code) trên giấy mới.
- File: `scene/ban-do/ve-ban-do.html`, `ban-do-goc.png`, `ban-do.json`, `ban-do-nhan-vat.png` (mới) · `screens/BanDo-trang-thai.png` ·
  `docs/screen_specs.md` (mục Bản đồ truyền tống).

## 2026-11-14.1 — Tường mỏng, cổng phân cấp, biển chữ Việt, Truyền Tống Đài sang đông

- Loại: cảnh 3D — **bố cục** + **ngoại hình** (đã vào `scene.json`). Phiên VS Code (`/canh` + `/lead`), người dùng:
  "phân bổ ngăn cách tường đang không hợp lý" → phương án A; "tráo vị trí truyền tống trận sang 1 khu khác hợp lý hơn";
  "tường đang hơi dày… đổi phong cách cổng… biển treo đầu các cửa vào khu"; "tất cả các biển đều phải là tiếng việt và là
  tên đọc dễ hiểu"; "tường ở phía trước tàng thư các" → bỏ.
- **Tường**: `walls.thickness` (trường mới, mặc định 1) **1 → 0,5**. Khu tây: tường bắc z 18 → **17** (khớp góc Ngoại
  Môn); bỏ lan can son quanh sân chơi (`fences` → rỗng). Tường chia sân z −11 (thêm rồi **bỏ** theo người dùng) — Kỳ Văn
  Uyển và Tàng Thư Các chung sân, `site.areas` chia ở z −11.
- **Cổng phân cấp** (`walls.gates[].kind`, trường mới): nam + bắc **`lau` cổng mái ngói 門樓** — cửa chữ nhật khung gỗ, lối
  5,8 m, cao 3,2 m, trụ dày 0,8, mái nhô 0,8 m hai mặt, biển gỗ; đông + tây **`trang` cổng trăng** (lối 3,9 m) + biển đá
  khắc trên vòm. Cổng đông **mở lại** (dẫn ra Truyền Tống Đài).
- **Biển** (`walls.gates[].signs`, theo hướng mặt cổng nhìn ra, ghi khu người đi qua sẽ vào) — chữ Việt, tên công năng:
  nam Quảng trường / Lối ra núi · bắc Bậc lên Trà lâu / Quảng trường · đông Đài truyền tống / Quảng trường · tây Sân chơi ·
  Thư viện / Quảng trường. Biển nhà 品茗閣 → **Trà lâu**, 藏書閣 → **Thư viện**; cờ 茶 → **Trà** (chữ dọc T / R / À);
  bảng 日課榜 → **Nhiệm vụ hằng ngày**; biển bàn chơi 五子棋 / 鬥字 → **Cờ caro** / **Đấu chữ** (một dòng, `han` rỗng).
- **Truyền Tống Đài**: `teleport.center` (0; 0) → **(30; 0)** ngoài cổng đông, nền lát x 17…41, z −10…10 (`terrain.plateaus`
  thêm 1); về tông môn đứng (21,8; 0). Sư phụ Mặc Ông (−3,5; 9) → **(21,5; −4,5)** nhìn tây. Khu "Truyền Tống Đài" x 17…41,
  z −10…10. Giữa sân: phiên này đặt đỉnh đồng + 4 đèn đá + 4 tùng góc; **giữa sân hiện là nhật quỹ + 4 bồn hoa của phiên
  khác** (chưa có mục nhật ký). *Đính chính*: 梅 蘭 竹 菊 của bồn hoa chỉ là mã chọn cây trong đặc tả (`props[].text`),
  không vẽ ra cảnh — không phải biển, không lệch yêu cầu "biển chữ Việt"; tông môn không còn biển chữ Hán.
- Luật (đã sửa sổ + online, `--mark-synced`): R-VA-1 (tường dày 0,5 → dừng z −16,25; cổng 門樓 lối 5,8, x 3 dừng z 16,1),
  R-DIEU-4 + R-HUD-3 (điểm giữa sân (0; 0) → (0; 6)), R-HANH-2 (về đứng (21,8; 0)), R-GIAO-1, R-GIAO-2, R-NV-1. Test mới
  `web/src/scene/walls.test.ts` (R-VA-1).
- `scene:check`: không có lỗi. Draw call / tam giác: góc chơi 76 (không đổi), nhìn trên 117 · 131,6k (≤ 150 / 150k).
- Code (chưa commit — lẫn việc dở của phiên khác trong cùng file): `scene/walls.ts`, `kien_truc/tuong.ts`, `spec.ts`,
  `specCheck.ts`, `signAtlas.ts`, `textures.ts` (`drawStoneSign`, cờ chữ dọc), `kien_truc/do_pho.ts`, `scripts/check-scene.mjs`,
  `zones/dialogs.ts` (Tiểu Mặc: "Truyền Tống Đài ngoài cổng đông"). Kế hoạch `docs/tasks/2026-11-13-tuong-cong-khu.md`,
  `docs/tasks/2026-11-13-bien-tieng-viet.md`.
- Canvas 3D: bản 36. Ảnh: `screens/Canh-tren.png` (ghi đè), `Canh-cong-nam.png`, `Canh-cong-dong.png`, `Canh-cong-tay.png`,
  `Canh-truyen-tong-dai.png` (ghi đè), `Canh-thu-vien-mat-tien.png`, `Canh-bien-tra-lau.png`, `Canh-bien-nhiem-vu.png`,
  `Canh-bien-co-caro.png`.

## 2026-11-13.35 — Bảng cách chơi Kỳ Văn Uyển (Ngũ Tử Kỳ · Đấu chữ)

- Loại: giao diện · chuỗi. Màn: **Bảng cách chơi** (HUD web, lớp phủ) — đặc tả `docs/screen_specs.md` mục "Bảng cách chơi
  Kỳ Văn Uyển".
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-bang-cach-choi.md`.
- Artboard: `CachChoi-doc-co` (Ngũ Tử Kỳ dọc), `CachChoi-doc-dau` (Đấu chữ dọc), `CachChoi-doc-dau-chua-hoc` (chưa học bộ
  nào), `CachChoi-ngang` (Ngũ Tử Kỳ ngang). Ảnh nền giữ chỗ tải lên canvas: `Canh-bien-ngu-tu-ky.png`,
  `Canh-bien-tro-choi.png`.
- Chọn **HUD web** (không Flutter): nút "Cách chơi" ở web, nội dung là chữ tĩnh, chạy cả khi không có Flutter. Một khung
  chung, nội dung theo trò: tên Hán + Việt, hình minh hoạ, 4 mục đánh số, mẹo NPC, nút "Đóng" đáy; dài → cuộn trong bảng.
  Thay lời giảng nhiều trang tạm thời của NPC (`R-GIAO-2` phần "chưa có bảng").
- Không thêm "Vào bàn" trong bảng (biển ~2,5 m tới ghế gần nhất, ngoài 1,5 m của `R-GIAO-1`).
- Thành phần mới (`docs/components.md`): bảng cách chơi, mục đánh số, ô mẹo NPC. Token: không thêm (cảnh tối sau bảng
  `rgba(36,50,58,.28)`, nền gỗ lưới cờ #E7D6B4 ghi trong đặc tả).
- Chuỗi mới (`l10n/vi.arb`): `guideEyebrow`, `guideGoal`, `guideTurn`, `guideResult`, `guideSeat`, `guideTipBy`,
  `guideClose`, `guideGomoku*`, `guideDuel*`, `guideSeatBody`.
- Luật: không đổi. Nội dung theo `R-CO-1…3`, `R-DAU-1…2`, `R-GIAO-1` hiện tại. **Lưu ý**: mục "Vào bàn · rời bàn" ghi cách
  rời hiện tại (kéo cần / Ngồi ôn); nếu áp nút "Rời bàn" (đề xuất 2026-11-13.27) thì đổi `guideSeatBody`. Áp xong bảng →
  `R-GIAO-2` bỏ đoạn "Chưa có bảng → tạm: NPC giảng luật…" (phiên code hỏi người dùng rồi sửa sổ).
- File: `source/CachChoi-*.dc.html` (mới), `source/canvas.json`, `docs/screen_specs.md`, `docs/components.md`, `l10n/vi.arb`.

## 2026-11-13.34 — Co lòng chảo cỏ quanh tông môn

- Loại: cảnh 3D — **ngoại hình / địa hình** (đã vào `scene.json`). Phiên VS Code (`/canh`), người dùng: "diện tích vùng xanh
  đang quá lớn so với toàn bộ kiến trúc hãy co lại vừa đủ" (sau khi .32 thu gọn bố cục, lòng chảo vẫn rộng như cũ).
- Đổi: chỉ `terrain.peaks` (x, z của các đỉnh; r, h giữ nguyên) — mỗi đỉnh kéo vào theo hướng của nó (tâm (−3; −12)) để
  chân núi (chỗ đất nhô > 1,5 m) cách khu cần giữ ~10 m; không kéo nếu chân núi lấn vào khu tây, sân Ngoại Môn, Sơn Môn,
  Thiên Bậc + Nội Môn, Hậu Sơn, suối. Cỏ thừa ngoài khu: đông bắc → đông nam 44–47 → 12–19 m · nam 20–24 → 12–15 m ·
  tây nam 24–31 → 9–24 m; tây, bắc không đổi. Giữ đồi cỏ phía đông (suối Hậu Sơn, ra cổng đông) ~28 m.
- Không đổi: bục, bậc đá, suối, thác, cụm tùng, mép vực (bán kính 112 — còn vài dải cỏ nhỏ giữa vòng núi và mép, chỉ thấy
  từ trên cao).
- Luật: không chạm (bố cục nhà / vùng / tường giữ nguyên). `scene:check`: không có lỗi. Draw call / tam giác: không đổi.
- Canvas 3D: bản 32. Ảnh: `screens/Canh-tren.png`, `screens/Canh-ca-san.png` (ghi đè ảnh .32).

## 2026-11-13.33 — Bộ ảnh nhiều góc NPC thủ thư Điển Thư 典書

- Loại: tài nguyên 3D — ảnh đầu vào (Hunyuan3D-2mv). Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-anh-thu-thu.md`.
- Hồ sơ: `docs/tham_khao/thu-thu.md` (hướng A — nữ văn sĩ trẻ thời Tống, bối tử thanh lục #B9D0C2 viền #2B5446, áo trong ngà
  vạt trái đè phải, váy lục xám, búi cao + trâm vàng, ngọc bội + thẻ gỗ 典 bên đai). Cao ngang nhân vật chính.
- Ảnh: `models/anh/thu-thu-{truoc,trai,sau,phai,mat}.png` — Google Gemini (người dùng chạy). Câu lệnh: ảnh trước đính kèm
  `anh/nhan-vat-truoc.png` ("NEW character in exactly the same 3D vinyl toy style… beizi… A-pose… orthographic… plain #DDDDDD");
  ảnh trái / sau / phải / cận mặt mỗi ảnh một cuộc trò chuyện mới, đính kèm ảnh trước, tả đúng phần thấy được ở góc đó.
- Chuẩn hoá (Pillow): tách nền chặt, nền #DDDDDD, xoá sao Gemini, 4 góc chung một hệ số thu, đỉnh búi 10 %, đế giày 90 %, trục
  thân giữa ảnh; PNG 1024 × 1024. Ảnh duyệt: `screens/ThuThu-bo-anh.png`; canvas `source/ThuThu-bo-anh.dc.html`.
- **Lưu ý cho `/tai-nguyen`**: ngọc bội + thẻ 典 ở ảnh trước treo hông **trái** nhân vật (bên phải ảnh), ảnh phải lại thấy ở hông
  **phải** — lệch nhẹ; người dùng chọn giữ nguyên. Lúc nướng màu kiểm vùng hông hai bên (có thể hiện vệt ngọc mờ).
- Bước kế: `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh thu-thu <ra>` → `models/thu-thu.glb` (phiên `/tai-nguyen`).
- File: `models/anh/thu-thu-*.png` (5), `models/LICENSES.md`, `screens/ThuThu-bo-anh.png`, `source/ThuThu-bo-anh.dc.html`, `source/canvas.json`.

## 2026-11-13.32 — Thu gọn bố cục tông môn + bỏ cổng Sơn Môn

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`). Phiên VS Code làm thay theo yêu cầu người dùng ("phân bổ diện tích
  các khu không hợp lý, có chỗ quá rộng gây mệt khi đi lại"; "bỏ cổng sơn môn 3d"). Người dùng chọn cả 4 hướng thu gọn.
- Sân Ngoại Môn ±21 → **±17** (34 × 34 m); cổng tây tâm z −4 → −6. Tiểu Mặc (7,6; 17,6) → (7,6; 13,6), bảng 日課榜
  z 19,2 → 15,2.
- Sơn Môn: xuất phát (0; 50) → **(0; 36)**, lối (0; 17 → 40), tùng z 28/52 → 22/38, đèn đá z 41,5 → 27,5.
  **Bỏ cổng `son-mon`** (model `cong-son-mon`) — lối vào giờ chỉ có hai đèn đá + hai cây tùng.
- Đỉnh: bục y 11 dời z −71…−56 → −67…−52, trà lâu (0; −64) → (0; −60), cờ 茶 z −58,5 → −54,5, bậc đá (0; −20 → −53).
- Khu tây 40 × 68 m → **34 × 50 m** (tường x −51…−17, z −32…18). Tàng Thư Các (−39; −34) → (−33; −22), ao / đèn đá
  theo; Kỳ Văn Uyển (bàn, biển, rào, dây đèn, mai) dời (+6; −2): bàn cờ (−34; 4), Đấu chữ (−34; 11).
- Phía đông: bỏ 3 nền lát trống (Tụ Hiền Viên + nền cư xá cũ), lối cụt, 2 mai, tên khu "Tụ Hiền Viên"; giữ cổng đông
  (ra đồi cỏ, suối Hậu Sơn).
- Đường đi (chạy 7 m/s): xuất phát → giữa sân 50 → 36 m; giữa sân → bàn cờ ~45 → ~37 m; → cửa Tàng Thư Các ~64 → ~45 m;
  → trà lâu ~60 → ~56 m.
- Luật chạm (đã sửa ví dụ trong sổ + online, `--mark-synced`): R-VA-1, R-DIEU-4, R-NGOI-1, R-VA-3, R-NPC-1, R-NPC-2,
  R-NV-3, R-GIAO-1, R-GIAO-2; test ví dụ `gamePlay`, `gameGuides`, `seats` dời theo. `scene:check`: không có lỗi.
- Ảnh: `screens/Canh-tren.png`, `Canh-son-mon.png`, `Canh-khu-tay.png`, `Canh-ca-san.png`.

## 2026-11-13.31 — Nghe nhạc ở bàn trà Phẩm Minh Các

- Loại: giao diện · chuỗi · luồng/luật (đề xuất).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-rap-nhac-on-tap.md` — **chỉ phần 2 (nghe nhạc)**. Phần 1 rạp phim **bỏ** (đã xoá,
  mục .30); phần 3 phòng ôn tập **chuyển** sang phiếu "Ngồi ôn" (kế hoạch `docs/tasks/2026-11-13-ngoi-on.md`, chờ duyệt).
- Màn / thành phần: nút nổi "Nghe nhạc" khi ngồi bàn trà · trình phát (đang phát, danh sách mở, ngang tạm dừng) · bảng trạng
  thái (mới mở, nút lặp 3 chế độ, viên thu nhỏ). Đặc tả: `docs/screen_specs.md` mục mới.
- Đặc tả "Nút nổi Ngồi" (.28): bỏ nhãn "Ngồi xem" + `R-RAP-1` (rạp đã xoá); `l10n/vi.arb` bỏ `seatWatch`.
- Token: không thêm. Chuỗi mới: `music*`.
- **Đề xuất luật** (phiên code hỏi người dùng rồi ghi sổ) — R mới "nghe nhạc ở trà lâu": đang ngồi bàn trà tầng 2 Phẩm Minh
  Các → nút nổi "Nghe nhạc" → trình phát; nhạc đóng gói offline; mới mở tạm dừng ở bài nghe dở; lặp mặc định cả danh sách;
  **đứng dậy → nhạc tắt, trình phát đóng**. Ví dụ: ngồi bàn trà, phát "Cao sơn lưu thuỷ", kéo joystick → đứng dậy, nhạc tắt.
- Luật bị chạm: `R-VA-4`, `R-NGOI-1`, `R-DIEU-7`, `R-MAN-1`.
- File: `source/Nhac-*.dc.html` (5), `source/canvas.json` · `l10n/vi.arb` · `docs/screen_specs.md`, `docs/components.md`.
- Ảnh: chưa có ảnh (nền giữ chỗ vẽ tay).

## 2026-11-13.30 — Xoá rạp phim 影戲臺 và Đệ Tử Cư Xá

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`). Phiên VS Code làm thay theo yêu cầu người dùng ("xóa chỗ xem phim
  chung và cư xá"), kế hoạch `docs/tasks/2026-11-13-xoa-rap-phim-cu-xa.md`.
- Bỏ: nhà `rap-phim` (32; −19) và lối đá (32; −2,4 → −15); 4 nhà `cu-xa-1..4`, lối đá (37,5; 0 → 46) và khu tên
  "Đệ Tử Cư Xá 弟子居". Giữ: khu Tụ Hiền Viên (trống, 2 cây mai), lối từ cổng đông sân (21; 0 → 37,5; 0).
- Giao diện còn nhắc nhãn "Ngồi xem" (`docs/screen_specs.md` §nút Ngồi, `components.md`) — nhãn này không còn dùng;
  phiên thiết kế bỏ khi sửa lần tới.

## 2026-11-13.29 — Biển tên trò chơi ở Kỳ Văn Uyển (五子棋 · 鬥字)

- Loại: cảnh 3D — **đồ vật** (đã vào `scene.json`). Phiên VS Code làm thay phần cảnh theo kế hoạch đã duyệt
  `docs/tasks/2026-11-13-bien-tro-choi.md` (người dùng: "ở mỗi trò chơi thì cần có biển tên trò chơi và lại gần để xem
  hướng dẫn").
- Đổi: `gameTables[].sign` mới — biển gỗ đứng 1,9 × 1,85 m (hai trụ, xà, giấy ngà viền vàng, hai mặt) ở đầu đông mỗi
  bàn, quay về đông: `ban-co` (−35,5; 6) **五子棋 · Ngũ Tử Kỳ**, `ban-dau-chu` (−35,5; 13) **鬥字 · Đấu chữ**. Chữ vẽ vào
  ảnh biển chung (không thêm draw call).
- Giao diện: nút nổi "Cách chơi" dùng lại kiểu nút "Xem bảng" (2026-11-13.25), nhãn kính sương = tên trò; lời giảng đi
  qua khung thoại có sẵn (R-GIAO-2). Không thành phần mới.
- Ảnh: `screens/Canh-bien-tro-choi.png`, `screens/Canh-bien-ngu-tu-ky.png`. `scene:check`: không lỗi.

## 2026-11-13.28 — Tàng Thư Các: danh mục sách + sổ từ HSK + nút "Đọc sách" · nút nổi "Ngồi"

- Loại: giao diện · token · chuỗi.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-muon-sach.md`, `docs/phieu_thiet_ke/2026-11-13-nut-ngoi.md`.
- Màn / thành phần: **Danh mục sách** (Flutter; chưa mượn · chọn + xác nhận · đang giữ cuốn khác · ngang) · **Sổ từ** (Flutter;
  trang đầu · từ 4 chữ · từ hai phần · trang cuối · ngang) · **nút "Đọc sách"** (HUD dọc + ngang) · **nút nổi "Ngồi"** (Vào bàn
  cùng lúc Nói chuyện; bảng 3 nhãn + quy tắc không đè). Đặc tả: `docs/screen_specs.md` 4 mục mới.
- Quyết định thiết kế: danh mục là kệ gỗ 2 × 3 bìa sách (số cấp chữ Hán + "简体"); mượn qua thẻ xác nhận; sổ từ là trang giấy
  ngà, cỡ chữ theo độ dài từ, thanh kéo tới trang + nút lật; "Đọc sách" là thẻ có bìa mini đặt trên cụm nút hành động; nút
  "Ngồi" cùng họ "Nói chuyện" (code đã làm trước — canvas vẽ lại cho khớp, đổi biểu tượng thành người ngồi trên bồ đoàn).
- Token mới: `shelf-wood` #8A5A3A. Chuỗi mới (`l10n/vi.arb`): `lib*`, `hskLevel1…6`, `readBook*`, `book*`, `seat*`.
- Luật: theo đúng `R-SACH-1…4`, `R-NGOI-1`, `R-MAN-1` — không đề xuất đổi.
- File: `source/DanhMuc-*.dc.html` (4), `source/SoTu-*.dc.html` (5), `source/DocSach-*.dc.html` (2), `source/NutNgoi-*.dc.html` (2),
  `source/canvas.json` · `tokens/design_tokens.json` · `l10n/vi.arb` · `docs/screen_specs.md`, `docs/components.md`.
- Ảnh: chưa có ảnh (dùng `source/*.dc.html`).

## 2026-11-13.27 — HUD trò chơi Kỳ Văn Uyển: Ngũ Tử Kỳ + Đấu chữ

- Loại: giao diện · chuỗi · luồng/luật (đề xuất).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-tro-choi-giao-luu.md`.
- Màn / thành phần: **Ngũ Tử Kỳ** (lượt mình · Tiểu Mặc nghĩ · thắng 5 quân sáng · ngang · thẻ kết quả thắng / thua / hoà) ·
  **Đấu chữ** (lượt mình · đúng · sai · Mặc Ông nghĩ · Mặc Ông chọn · cuối ván · chưa học bộ nào · ngang). Đặc tả:
  `docs/screen_specs.md` 2 mục mới; thành phần: `docs/components.md`.
- Quyết định thiết kế: ngồi chơi → ẩn joystick + Nhảy / Chào / Thiền, rời bằng nút "Rời bàn"; kết quả ván là thẻ đáy riêng
  ("Ván mới" / "Rời bàn") thay khung thoại "Vâng"; Đấu chữ chạm là chọn (không "Kiểm tra"); điểm hai bên là hai thẻ góc trên.
- Token: không thêm (dùng `map-paper`, `jade`, `lacquer`, `gold`, frost). Chuỗi mới (`l10n/vi.arb`): `game*`, `gomokuHint`,
  `duel*`. Lời NPC (kết ván, chưa học) giữ trong dữ liệu hội thoại.
- **Đề xuất luật** (phiên code hỏi người dùng rồi ghi sổ):
  - `R-GIAO-1` (+ `R-DIEU-1`, `R-NGOI-1`): đang ngồi chơi **tắt joystick và ẩn cụm nút hành động**; đứng dậy bằng nút
    **"Rời bàn"** (máy tính: phím Esc / đi bằng phím vẫn đứng dậy) — thay "kéo cần điều khiển hoặc bấm Thiền". Lý do: 45 %
    bên trái màn là vùng joystick, trùng nửa trái bàn cờ. Ví dụ: ngồi bàn cờ, chạm giao điểm ở mép trái → đặt quân (không
    thành joystick); bấm "Rời bàn" → đứng dậy, ván bỏ.
  - `R-CO-3` / `R-DAU-2`: hết ván hiện thẻ kết quả (lời NPC trong thẻ) với "Ván mới" (= đóng, ván mới) và "Rời bàn".
- Luật bị chạm: `R-GIAO-1`, `R-CO-1/2/3`, `R-DAU-1/2`, `R-DIEU-1`, `R-NGOI-1`, `R-MAN-1`.
- File: `source/Co-*.dc.html` (5), `source/Dau-*.dc.html` (8), `source/canvas.json` · `l10n/vi.arb` · `docs/screen_specs.md`,
  `docs/components.md`.
- Ảnh: chưa có ảnh (dùng `source/*.dc.html`).

## 2026-11-13.26 — Tàng Thư Các: hồ trước nhà nhỏ lại, tùng lùi — chừa chỗ thang ngoài trời (L-6)

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`). Phiên VS Code sửa lỗi L-6 (thang lên tầng 2 đổi sang thang thẳng ngoài
  trời ở đầu hồi phải — code `scene/kien_truc/cau_thang.ts`).
- Đổi: `water` hồ phải (−30; −25) 7 × 3 → **(−31,5; −25) 5 × 3**, hồ trái (−48; −25) 7 × 3 → **(−46,5; −25) 5 × 3** (đối
  xứng); `trees.yard` tùng (−24; −31) → **(−22; −31)**. Trà lâu Phẩm Minh Các: không đổi đặc tả (thang nằm trong bục).
- Ảnh: `screens/Canh-loi-L6-tang-thu-cac.png`, `screens/Canh-loi-L6-tra-lau.png`. `scene:check`: không lỗi.

## 2026-11-13.25 — Bảng nhiệm vụ hằng ngày 日課榜 + màn ôn câu đố + nút "Xem bảng"

- Loại: giao diện · token · chuỗi.
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-nhiem-vu-hang-ngay.md` (thay phiếu bảng vinh danh đã bỏ).
- Màn / thành phần: **Bảng nhiệm vụ hằng ngày** (Flutter; đang dở · mới cài · xong cả 2 + chuỗi dài; ngang) · **Màn ôn
  câu đố** (Flutter; chưa chọn · đã chọn · đúng · sai · kết quả một bộ · tổng kết; ngang; bảng 3 mức) · **Nút "Xem
  bảng"** (HUD dọc + ngang). Đặc tả: `docs/screen_specs.md` 3 mục mới; thành phần: `docs/components.md`.
- Quyết định thiết kế: dùng khung màn bài học; "Ôn ngay" là nút chính trong thẻ, "Đóng bảng" là nút phụ; xong cả 2 →
  triện son 畢; chuỗi = số lớn + dải 7 ngày; ôn theo kiểu chọn → "Kiểm tra" → phản hồi → "Câu tiếp"; thoát giữa lượt
  không hỏi lại; số việc còn lại chỉ hiện ở chấm son trên nút "Xem bảng" (không chấm trên bảng 3D / Tiểu Mặc).
- Token mới: `answer-right-bg`, `answer-wrong-bg`, `answer-partial-bg`, `size.option-row` 58.
- Chuỗi mới (`l10n/vi.arb`): `daily*`, `boardOpen*`, `review*`.
- Luật: theo đúng `R-NV-1/2/3`, `R-ON-1…5`, `R-MAN-1` — không đề xuất đổi. (Tiêu đề bảng 3D trong ảnh `Canh-tieu-mac-bang.png`
  còn 文淵榜 — cảnh cần đổi 日課榜 nếu chưa đổi.)
- File: `source/NhiemVu-*.dc.html` (4), `source/OnTap-*.dc.html` (8), `source/XemBang-*.dc.html` (2), `source/canvas.json` ·
  `tokens/design_tokens.json` · `l10n/vi.arb` · `docs/screen_specs.md`, `docs/components.md`.
- Ảnh: chưa có ảnh (dùng `source/*.dc.html`).

## 2026-11-13.24 — Chưởng Môn Điện → trà lâu Phẩm Minh Các 品茗閣 (nơi giao lưu)

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`). Người dùng: "phần chưởng môn điện đang bị không dùng hãy sửa nó thành
  1 nơi gì đó để mọi người dùng chung giao lưu"; chọn **trà lâu trên đỉnh** (bỏ hướng hí đài, Luận Đạo Đường).
- Đổi: `buildings` `chuong-mon-dien` (kiểu `dien`, mái vàng, 19,2 × 12,8) → **`pham-minh-cac`** kiểu `tra-lau` (vào được,
  3 bàn trà, 2 tầng), tâm (0; −64) 19,2 × 11,2, mái lục `#2b5446`, biển 品茗閣 · `props` + cờ 茶 (11,5; −58,5).
  Khu `site.areas` "Nội Môn" giữ tên.
- Ảnh 4 góc Chưởng Môn Điện (`models/anh/chuong-mon-dien-*`) **để dành** (người dùng chọn) — chưa dựng model.
- Không người chơi thật (dự án không multiplayer): "dùng chung" = chỗ công cộng; NPC / hoạt động trong trà lâu → `/lead` sau.
- Ảnh: `screens/Canh-pham-minh-cac.png`. `scene:check`: không lỗi. Cần code: không.

## 2026-11-13.23 — Lối lát đá cùng gạch với sân

- Loại: cảnh 3D — **màu / chất liệu** (đã vào `scene.json`). Phiên VS Code, người dùng: "bỏ phần gạch màu trắng dẫn lối
  đi đổi thành chung 1 màu gạch với các chỗ khác".
- Đổi: `buildingStyle.pathLook` (trường mới, mặc định `phien` = cảnh cũ) → **`san`**: mọi lối lát dùng gạch vuông của sân
  (`ground`), mạch gạch theo toạ độ cảnh nên lối chạy qua sân liền mạch; màu `path` không còn dùng khi `san`.
- Code: `scene/paths.ts`, `scene/terrain.ts` (UV sân lát theo toạ độ cảnh), `scene/spec.ts`, `specCheck.ts`, `world.ts`.
- Ảnh: `screens/Canh-loi-gach-chung.png`. `scene:check`: không lỗi.

## 2026-11-13.22 — Cổng Sơn Môn model nhỏ lại, đế đá thấp (L-5)

- Loại: cảnh 3D — **dữ liệu** (đã vào `scene.json`). Phiên VS Code sửa lỗi L-5 (người dùng chọn "thu nhỏ cả + nén đế").
- Đổi: `gates[son-mon]` thêm `"modelScale": 0.75` → rộng ≈ 14,9 m, cao ≈ 13 m. Đế đá chân trụ nén về 1,2 m, hẹp × 0,75
  (code `scene/gateFeet.ts`, không sửa file model).
- Ảnh: `screens/Canh-loi-L5.png`. `scene:check`: không lỗi.

## 2026-11-13.21 — Văn Uyên Tông: khu giao lưu Kỳ Văn Uyển 棋文苑 (bàn cờ + bàn đấu chữ)

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`) + trường đặc tả mới `gameTables`. Phiên VS Code làm thay `/canh` trong
  kế hoạch `/lead` `docs/tasks/2026-11-13-khu-giao-luu-co-dau-chu.md` (người dùng duyệt).
- Người dùng: "khu giao lưu ở bãi phía tây Sơn Môn: cờ chung với NPC + trò chơi chữ Hán"; chọn Ngũ Tử Kỳ, Đấu chữ, chơi
  trên bàn 3D, tên Kỳ Văn Uyển.
- Đổi: `site.areas` + **Kỳ Văn Uyển** x −40…−12, z 28…52 · `terrain.plateaus` + nền lát cùng khung (blend 3) · `paths` +
  (−4; 40) → (−14; 40) rộng 3,6 · `props` + 2 `den-da` (−14; 36,5), (−14; 43,5) · `trees.yard` + 2 mai (−32; 30), (−32; 50) ·
  **`gameTables`** (mới): `ban-co` (co) (−22; 34), `ban-dau-chu` (dau-chu) (−22; 46), quay 0°, NPC tieu-mac / su-phu đứng
  sau bàn (bản riêng, không nói chuyện).
- Luật: R-VUNG-1 (ngoại lệ ôn bộ thủ), R-GIAO-1, R-CO-1..3, R-DAU-1..2 — sổ + online.
- `scene:check`: không lỗi. Draw call: tông môn thường 58–66; ngồi chơi cờ 39. Ảnh: `screens/Ky-van-uyen-toan-canh.png`,
  `screens/Ky-van-uyen-ngu-tu-ky.png`, `screens/Ky-van-uyen-dau-chu.png`.
- Cần thiết kế: HUD trong ván — phiếu `docs/phieu_thiet_ke/2026-11-13-tro-choi-giao-luu.md`.

## 2026-11-13.20 — Cổng Sơn Môn dùng model AI

- Loại: cảnh 3D — **dữ liệu** (đã vào `scene.json`). Phiên VS Code làm thay `/canh` trong `/lead` (người dùng cho phép),
  kế hoạch `docs/tasks/2026-11-13-cong-son-mon-model.md`.
- Đổi: `gates[son-mon]` thêm `"model": "cong-son-mon"` (model design .16). Bề ngang giữ như cổng khối (≈ 19,9 m với
  `width` 9,6 — người dùng chọn "khớp bề ngang"), cao ≈ 18,8 m, đáy xà giữa ≈ 10,1 m; biển 文淵宗 dán lên biển trống;
  vật cản 4 chân trụ đo từ model.
- Hiệu năng (Canvas 3D): 108 draw call, 148 618 tam giác — sát trần 150k.
- Cần code: đã làm (`scene/staticModel.ts`, `gate.ts` `addGateModel`).

## 2026-11-13.19 — Tu luyện: nhập định, nút "Tu luyện", chữ thẻ bộ thủ · dòng gợi ý HUD

- Loại: giao diện · token · chuỗi · luồng/luật (đề xuất).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-tu-luyen.md`, `docs/phieu_thiet_ke/2026-11-13-chu-goi-y-hud.md`.
- Màn / thành phần: **Tu luyện** (mục mới `screen_specs.md`): nhập định 1 s (vòng sáng dưới đệm + chữ bộ sắp học hiện
  trên đầu), nút ngồi "Tu luyện" + chấm đếm ở vùng có bài học, chốt hướng "người khác thấy" và đốm linh tự (đợt 2),
  gợi ý linh địa cho `/canh`. **Thẻ học bộ thủ**: "Đã lĩnh hội" / "Xuất định"; sửa ô chữ khải của 石 (trước vẽ nhầm 水).
  **HUD**: dòng gợi ý bỏ "chạm mặt đất để đi tới đó"; canvas bỏ chip tên khu + nút "Góc nhìn" ở `HUD-doc/-ngang`,
  `HUD-hanh-dong-*` cho khớp `R-HUD-1` (code đã bỏ).
- Người dùng chọn: nhãn "Tu luyện" + chấm "còn N bộ" ở vùng học (tông môn giữ "Thiền"); thẻ "Đã lĩnh hội" / "Xuất định".
  Người dùng nhờ quyết hộ "Xuất định" làm gì → **đóng thẻ và đứng dậy** (đúng nghĩa "ra khỏi định").
- Token mới: `size.count-badge` 22, `color.aura-light` rgba(255,236,190,.75).
- Chuỗi (`l10n/vi.arb`): đổi `radicalLearn` "Đã lĩnh hội", `radicalBack` "Xuất định"; mới `actionCultivate`,
  `actionCultivating`, `actionCultivateLabel`, `radicalLeft`, `spiritTap`, `hintFirst`. (`camNear`, `camYard` không còn
  dùng — R-HUD-1.)
- **Đề xuất luật** (phiên code hỏi người dùng rồi ghi sổ):
  - `R-DIEU-7` thêm: ở vùng có bài học còn bộ chưa học, nút ngồi ghi "Tu luyện" (chấm đếm số bộ còn lại), đang ngồi ghi
    "Đang tu luyện"; tông môn / học đủ giữ "Thiền" / "Đang thiền". Ví dụ: Rừng trúc đã học 3 bộ → nút "Tu luyện" chấm "47".
  - `R-HANH-3` thêm: thẻ bộ thủ đã học có nút "Xuất định" — bấm thì đóng thẻ và nhân vật đang ngồi đứng dậy; "Đã lĩnh
    hội" (lần đầu) vẫn như cũ — đóng thẻ, vẫn ngồi. Ngồi đủ 1 s mới có vòng sáng + chữ → thẻ; đứng dậy sớm thì tắt.
  - Đốm linh tự (đợt 2): mở bằng nút nổi khi đứng gần, không bằng chạm vào cảnh (giữ `R-VUNG-2`).
- Luật bị chạm: `R-HANH-3`, `R-DIEU-7`, `R-DIEU-2` (chữ gợi ý), `R-HUD-1`, `R-VUNG-1/2/3`, `R-MAN-1`.
- File: `source/TuLuyen-*.dc.html` (6), `source/HUD-doc`, `HUD-ngang`, `HUD-hanh-dong-doc`, `HUD-hanh-dong-ngang`,
  `TheBoThu-doc`, `TheBoThu-doc-on`, `TheBoThu-ngang` `.dc.html`, `source/canvas.json` · `tokens/design_tokens.json` ·
  `l10n/vi.arb` · `docs/screen_specs.md`, `docs/components.md`.
- Ảnh: chưa có ảnh (dùng `source/*.dc.html`).

## 2026-11-13.18 — Tiểu Mặc đứng ở bảng nhiệm vụ hằng ngày

- Loại: cảnh 3D — **bố cục NPC** (đã vào `scene.json`) + lời thoại + luật. Phiên VS Code làm thay `/canh` (người dùng:
  "Tiểu Mặc sẽ đứng ở bảng thông báo" → "bảng … là nhiệm vụ hàng ngày").
- `npcs` `tieu-mac` (4,5; 15) nhìn nam → **(7,6; 17,6) nhìn bắc (180°)**: đầu đông của bảng `bang` (5,5; 19,2) rộng 3,4,
  quay mặt vào sân; ngoài lối cổng nam (x ±3,2); cách Sư phụ 14 m.
- Bảng `bang` (5,5; 19,2) từ nay là **bảng nhiệm vụ hằng ngày** (chữ trên bảng 文淵榜 → **日課榜**; phiếu bảng vinh danh bỏ). Nhiệm vụ hằng ngày
  chưa có code → `/lead` khi làm.
- Lời thoại Tiểu Mặc: trông bảng nhiệm vụ hằng ngày, đón người mới (`chao`, `don-khach`); `khen` bỏ "trễ giờ giảng".
- Luật: R-NPC-1, R-NPC-2 đổi ví dụ theo vị trí mới — sổ + online, `--mark-synced`.
- `scene:check`: không lỗi. Ảnh: `screens/Canh-tieu-mac-bang.png`.

## 2026-11-13.17 — Sư phụ Mặc Ông đứng ở Truyền Tống Đài, hướng dẫn truyền tống

- Loại: cảnh 3D — **bố cục NPC** (đã vào `scene.json`) + lời thoại. Phiên VS Code làm thay `/canh` (người dùng: "sư phụ
  mặc ông sẽ là người đứng chỗ truyền tống và hướng dẫn").
- `npcs` `su-phu` (6; −10) → **(−3,5; 9)**, nhìn nam (0°): bên trái chân bậc nam của đài (tâm (0; 0), chân ∅ 14,4), đón
  người từ cổng nam đi lên; cách Tiểu Mặc (4,5; 15) 10 m (hai nút "Nói chuyện" không chồng).
- Lời thoại (`web/src/zones/dialogs.ts`): Mặc Ông "giữ Truyền Tống Đài", thêm câu `di` (vào vòng trận → bản đồ → chạm nơi
  đã mở; về thì vào vòng trận ở vùng đó, chọn Văn Uyên Tông) và `vung` (Rừng trúc mở sẵn, đủ bộ thủ → Giang Nam). Tiểu Mặc
  câu `tu-chu` chỉ sang Sư phụ ở đài giữa sân (bỏ "phía đông").
- Luật: không đổi (R-NPC-1/2 ví dụ dùng Tiểu Mặc; lời thoại theo R-HANH-1/2).
- `scene:check`: không lỗi. Ảnh: `screens/Canh-su-phu-truyen-tong.png`.

## 2026-11-13.16 — Model AI Cổng Sơn Môn 山門 (công trình 2/3, seed 7)

- Loại: tài nguyên 3D (`/tai-nguyen`). Bộ ảnh 4 góc 2026-11-13.3 → Hunyuan3D-2mv đầy đủ (seed 1234, 7) → luồng công trình
  mới `tai-nguyen/scripts/cong-trinh.sh` (làm mịn nhẹ `--min 1`, 20 000 tam giác; `bake.py --cong-trinh`: bỏ dò cổ / tóc,
  khớp khung cả vật từng góc). Người dùng chọn **seed 7**.
- File: `models/cong-son-mon.glb` (20 000 tam giác, 267 KB, 1 vật liệu không-sáng, texture 1024² JPEG) · ảnh
  `screens/Model-cong-son-mon-so-thiet-ke.png` (trên ảnh thiết kế · dưới model, 4 góc), `screens/Model-cong-son-mon.png`
  (3 góc chếch ¾).
- Còn lại: vệt nhạt nhỏ ở mặt trong cột và vài đốm màu trên đế đá (chỗ không ảnh thẳng nào nhìn rõ); thử ép bảng màu
  (`--tu-bang 12`) làm mất vân ngói → bỏ.
- Cần code: **có** — app chưa nạp công trình `.glb` (trường `buildings[].model`, nạp + scale theo `son-mon` rộng 6, giữ va
  chạm 4 trụ, bản khối dự phòng) → kế hoạch `/lead` (đợt D, `docs/tasks/2026-11-11-nang-cap-do-hoa.md`).

## 2026-11-13.15 — Văn Uyên Tông: rạp phim sang khu mới Tụ Hiền Viên 聚賢園, dọn quảng trường (L-4)

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`). Phiên VS Code làm thay `/canh` khi sửa lỗi L-4 (người dùng chọn
  từng mục trong phiên).
- Người dùng: "ở quảng trường có 1 số món đồ đặt không hợp lý như lô hương cục gì trắng nổi lên và cây không đúng chỗ";
  chọn: bỏ lư hương, bỏ bớt cây, "di chuyển rạp sang khu khác, khu chỉ dành cho giao lưu vui chơi", tên **Tụ Hiền Viên**.
- Đổi: `site.areas` + **Tụ Hiền Viên 聚賢園** x 21…42, z −34…−4 (ra cổng đông sân) · `terrain.plateaus` + nền lát x 20…42,
  z −34…−4 · `buildings` `rap-phim` (0; −12) → **(32; −19)** · `paths` + lối (32; −2,4) → (32; −15) rộng 3,6 ·
  `props` bỏ `dinh-dong` (0; 12) · `trees.yard` bỏ 3 tùng (14; −14), (±15; 15); 2 mai (±8,5; −9) → (24,5; −24), (39,5; −24)
  hai bên màn chiếu · `well.enabled` true → **false** (giếng (−15; −15) — "xóa khối này") · `buildings` bỏ `duoc-cac` (−49; 3) · `props` bỏ 4
  `luong-thuoc` (x −31; z −10 … 2,5) — "phần dược các và các luống cây là không cần thiết".
- Đợt 3 — "cỏ và cây ở chỗ ngoài … rất lộn xộn xấu; phường thị … không có chức năng gì": **xoá khu Thị Tập** (trà lâu
  樂坊, 6 `cua-hang`, 3 `ban-tra`, cờ 茶, 2 `sap-o`, 2 đèn đá x −8, mai (−36; 55), liễu (−52; 54), lối phố (−4; 40) → (−50; 40),
  khu `Thị Tập` trong `site.areas`); nền x −63…−8, z 22…58 giữ phẳng, `pave` → false (bãi cỏ, **để dành khu giao lưu /
  trò chơi** — chờ `/lead`). Cây: bỏ 6 cụm ngẫu nhiên gần nhà (tùng (±14,5) dọc Sơn Môn, mai (38; 49), trúc (−52,5; 6),
  (57; 30)); thêm 4 tùng đối xứng (±11; 28), (±11; 52) cỡ 1,2; giữ rừng xa. Cỏ búi 6 → **1,5** / 100 m².
  Ảnh `screens/Canh-loi-L4-son-mon.png`.
- Luật: R-RAP-1 viết lại (vị trí rạp + ví dụ) — sổ + online, `--mark-synced`.
- `scene:check`: không lỗi. Ảnh: `screens/Canh-loi-L4-tu-hien-vien.png`, `screens/Canh-loi-L4-san.png`.
- Cần code: không (build đọc thẳng `scene.json`).

## 2026-11-13.13 — Văn Uyên Tông: tiện ích giao lưu thay lớp học (bản mẫu hướng A) + Truyền Tống Đài thu nhỏ

- Loại: cảnh 3D — **bố cục** (đã vào `scene.json`) · bản mẫu kiến trúc (canvas) · luồng/luật (đề xuất). Phiên VS Code làm
  thay `/canh` + `/khao-cuu` + `/ui-design` (người dùng nhờ, duyệt trong phiên).
- Người dùng: "vùng truyền tống quá lớn"; "Văn Uyên Tông là nơi có nhiều tiện ích để người chơi giao lưu, không có lớp
  học"; "kiến trúc các nhà hiện tại quá xấu và hẹp, không phù hợp chức năng — khảo cứu rồi sửa lại". Chọn: đổi công năng
  nhà học, giao lưu bây giờ với NPC (chưa multiplayer), tiện ích = quảng trường + bảng vinh danh, trà lâu / đình, hí đài,
  phố chợ; bố cục **hướng A**; **vẽ bản mẫu trước khi code**.
- **Đã vào `scene.json`** (được commit kèm `dc18b7f`, ghi bù ở đây): Truyền Tống Đài 33 × 30 → **18 × 18 m** (tường
  x 21…39, z −9…9, góc đông nam mở; `teleport.center` (38; 0) → **(30; 0)**, `radius` 13 → 7,5; về tông môn đứng (24,5; 0)).
  Đất trống phía đông thành khu **Thị Tập 市集** x 39…54 (hí đài + 4 sạp bằng `nha-nho`, 2 đèn đá, lối đá) — **tạm**, hướng
  A bỏ khu này. Giảng đường đổi tên "Trà lâu", thư viện "Tàng Thư Các" — **tạm**: vẫn giữ 2 vùng học (`scene:check` đòi đủ
  mã trong `ZONE_CONTENT`). Ảnh: `screens/Canh-dai-thu-nho.png`.
- Khảo cứu: `docs/tham_khao/tien-ich-giao-luu.md` (hí đài nền 1,4–1,6 m mở 3 mặt + sân khán giả; trà lâu 2 tầng mặt tiền
  mở; tàng thư dài thấp 6 gian ngói đen viền lục + ao như Văn Uyên Các 文淵閣; phố chợ mặt tiền 4–6 m, phố 8 m).
- **Bản mẫu** (canvas, hàng "Văn Uyên Tông: tiện ích giao lưu"): `source/TienIch-kien-truc.dc.html` — mặt đứng hí đài
  (`hi-dai`), trà lâu (`tra-lau`), Tàng Thư Các (`lau-sach`), dãy cửa hàng (`cua-hang`) + sạp ô giấy (`sap-o`), bàn trà
  (`ban-tra`), cờ dọc (`co`), bảng vinh danh (`bang`); `source/TienIch-mat-bang.dc.html` — mặt bằng hướng A: hí đài
  (0; −12,5) thay giảng đường, sân giữa 20 × 16 m cho khán giả; Tàng Thư Các (−15,5; 9) 18 × 9 quay đông + ao (−8; 9) cầu
  giữa; trà lâu (13; 13) 12 × 9 quay bắc + bàn ngoài trời; giếng (−15; −15), đỉnh đồng (0; 12), bảng vinh danh (−9; 19,5);
  **phố chợ trên lối Sơn Môn** z 22…40: 8 cửa hàng hai bên phố 8 m, 3 sạp ô, bục lát x −12…12, tùng dời x ±14,5; bỏ Thị Tập.
- Màu mới: ô giấy dầu `#C9803A` (cam đất — điểm ấm, không lạm đỏ). Ngói đen tàng thư dùng `#2F3236`, viền lục `#2B5446`,
  cột lục `#2F6F73` (đều đã có).
- **Cần code** (`/lead`): kiểu nhà `hi-dai` (nền 1,5 m, 2 cột trước, tường hậu đài + 2 cửa rèm, mái yết sơn đầu hồi ra
  trước, bậc hai bên hậu đài), `tra-lau` (2 tầng, tầng 1 mở đi vào được + bàn trà, tầng 2 lùi + lan can, cờ 茶 cột 11 m),
  `lau-sach` (2 tầng 6 gian, mái hiên kép, ngói đen viền lục, cột lục), `cua-hang` (2 tầng, tầng 1 mở + ván cửa + hàng bày,
  trường chữ biển + loại hàng); đồ `sap-o`, `ban-tra`, `co`, `bang`; **gộp mọi biển tên / cờ vào một ảnh chung** (hiện mỗi
  biển 1 draw call; cảnh đang 155 / 150 ở `?view=tren`, thêm 8 cửa hàng sẽ vượt xa).
- **Luật bị chạm** (phiên code hỏi người dùng rồi sửa sổ): `R-VUNG-1/2/3` — bỏ vùng học `lop-hsk3`, `thu-vien` khỏi tông
  môn (bài học chuyển sang các vùng); `R-HANH-2` — ví dụ vòng (38; 0) → (30; 0), đi từ (30; 0) → nên từ (22,5; 0) sang
  (27; 0), về đứng (32,5; 0) → (24,5; 0); `R-VA-1` nếu ví dụ dùng tường Thị Tập / Ngoại Môn đổi; `R-NPC-1` giữ Tiểu Mặc (4,5; 15).
- Chưa có ảnh bản mẫu (artboard dùng `source/*.dc.html`).

## 2026-11-13.14 — Cảnh: Rừng trúc bỏ 50 bia bộ thủ, học bằng tu luyện

- Loại: cảnh 3D + luồng/luật (phiên VS Code làm thay `/canh`, kế hoạch `docs/tasks/2026-11-13-tu-luyen-thay-bia.md`).
- Người dùng: bia "nhìn rất mệt", và sau này nhiều người chung một vùng → chốt "cảnh là của chung, việc học là của
  riêng". `scene/rung-truc.json`: bỏ `stele`, `steles` (50 bia); trường mới `lessons: { radicals: true }` — ngồi thiền
  ≥ 1 giây ở đây mở thẻ bộ thủ chưa học đầu tiên (R-HANH-3 viết lại; R-VUNG-1/2/3, R-DIEU-2 sửa — sổ + online).
- Phần nhìn (nhập định, chữ bay quanh người, nhãn nút thẻ học, đốm linh tự, linh địa): phiếu
  `docs/phieu_thiet_ke/2026-11-13-tu-luyen.md` — chờ thiết kế.
- `scene:check`: Không có lỗi. Ảnh: `screens/Canh-rung-truc-tu-luyen.png` (thay `Canh-rung-truc-bia.png`, giữ làm lịch sử).

## 2026-11-13.13 — Cảnh: Sư phụ Mặc Ông đứng trước giảng đường

- Loại: cảnh 3D — **NPC** (phiên VS Code làm thay `/canh`, kế hoạch `docs/tasks/2026-11-13-npc-su-phu.md`, người dùng
  duyệt vị trí + lời thoại).
- `npcs` thêm `su-phu` ở (3; −3,5), nhìn về nam (+z, ra sân) — cạnh phải bậc thềm giảng đường (`tra-lau`, mặt trước
  z = −5,4), không chắn lối vào; hồ sơ `docs/tham_khao/su-phu.md` ghi "gần (0; −5)", dời sang phải để khỏi chắn bậc.
- Lời thoại "Mặc Ông 墨翁" (xưng "lão phu", gọi "con"): `web/src/zones/dialogs.ts`. Luật R-NPC-1/2 không đổi.
- `scene:check`: Không có lỗi. Ảnh: `screens/Canh-su-phu.png`.

## 2026-11-13.12 — Model NPC Sư phụ Mặc Ông (`su-phu.glb`)

- Loại: tài nguyên 3D (`/tai-nguyen nhan-vat`). Từ bộ ảnh 4 góc `models/anh/su-phu-{truoc,trai,sau,phai}.png` (mục .1).
- Hunyuan3D-2mv đầy đủ, 2 seed (1234, 7) → người dùng chọn **seed 1234** (râu đầy hơn, vạt áo sạch hơn). 16 000 tam
  giác, 221 KB, không-sáng. Tóc / râu bạc nướng đúng màu với cờ mặc định (không cần `--giu-toc-mai`).
- File: `models/su-phu.glb`, dòng `models/LICENSES.md`; ảnh `screens/Model-su-phu-so-thiet-ke.png` (trên thiết kế · dưới
  model), `screens/Model-su-phu.png` (cận 6 góc).
- Chưa đặt vào cảnh: cần thêm mã `su-phu` vào `NPC_IDS` (`web/src/scene/spec.ts`) + vị trí trong `scene.json` `npcs` +
  lời thoại → kế hoạch `/lead`.

## 2026-11-13.11 — Cảnh: Truyền Tống Đài một vòng trận + vùng 1 Rừng trúc + Tiểu Mặc vào sân Ngoại Môn

- Loại: cảnh 3D — **bố cục** + đặc tả cảnh mới. Phiên VS Code làm thay `/canh` (người dùng nhờ, duyệt ảnh trong phiên).
- Truyền Tống Đài (khu 3, sau phép dời 2026-11-13.10: tâm (38; 0)): sân đá ∅ 26, **một vòng trận** bán kính 4 giữa sân
  (phù hiệu 文淵 trong vòng) — người dùng đổi từ "6 cột / 6 vòng" (mục .6) sang một vòng + bản đồ (mục .9). Bỏ đài tỉ thí +
  4 giá binh khí; khu đổi tên "Truyền Tống Đài 傳送台"; lối đá vào đài dừng ở mép sân. Trường mới `teleport`
  `{enabled, center, radius, ringRadius, colors}` (mặc định tắt → cảnh cũ giữ nguyên).
- Hiệu ứng (code): vòng sáng dần + cột sáng mờ dần lên trên + hạt vàng xoáy trong 1,2 s rồi cuộn bản đồ bay lên.
- **Vùng 1 Rừng trúc** — đặc tả mới `scene/rung-truc.json` (mỗi vùng một file): không tường bao, không giếng (trường mới
  `walls.enabled`, `well.enabled`); lối đá uốn 4 đoạn, suối, thác trên sườn núi cuối lối, đồi bao, sương lục nhạt, trúc dày
  hai bên lối (kiểu trúc hiện có — trúc mao cao dày, đình, bia bộ thủ: đợt 2), 3 khu Cửa rừng 林口 · Lối trúc 竹徑 · Chân
  thác 瀑下; vòng trận (0; 39) trên bệ lát đá, xuất hiện ở (0; 34,5).
- NPC Tiểu Mặc dời từ cổng Sơn Môn (3,5; 46,25) vào sân Ngoại Môn, sau cổng trăng nam (4,5; 15), nhìn ra cổng (người dùng
  yêu cầu); lời thoại đổi theo (`web/src/zones/dialogs.ts`).
- Luật: R-HANH-1 (mốc mở), R-HANH-2 (vòng → bản đồ), R-VA-1 (bỏ đài tỉ thí / giá binh khí), R-NPC-1/2 (toạ độ Tiểu Mặc),
  R-MAN-2 (màn tải khi đổi vùng) — sổ + online.
- `npm run scene:check`: cả `scene.json` và `rung-truc.json` "Không có lỗi". Đài ≈ 7 draw call (ít hơn đài + giá cũ cộng
  6 cột).
- Ảnh: `screens/Canh-truyen-tong-dai.png`, `Canh-truyen-tong-nap.png`, `Canh-rung-truc-vong.png`, `Canh-rung-truc-loi.png`,
  `Canh-rung-truc-thac.png`.
- Ghi chú cho thiết kế bản đồ (.9): chấm vàng trạng thái "mở" của Rừng trúc (dy −150) đè dấu nặng chữ "lụa" của nhãn Con
  đường tơ lụa phía trên — nên dời chấm hoặc nhãn.

## 2026-11-13.10 — Cảnh: ghép sát các viện, dùng chung tường

- Loại: cảnh 3D — **bố cục**. Người dùng: "diện tích tông môn đang quá lớn có những chỗ không cần cách tường" → chọn ghép
  sát, dùng chung tường. Phiên VS Code làm thay `/canh`.
- Cụm đông (Truyền Tống Đài + Đệ Tử Cư Xá, mọi thứ x ≥ 24, z −18…48) dời x − 6; cụm tây (Linh Dược Viên + Luyện Đan Phòng,
  x ≤ −24, z −45…23) dời x + 6. Bỏ hai đoạn tường dọc x = ±27 (kẹp dải trống 6 m với tường Ngoại Môn) — Truyền Tống Đài và
  Linh Dược Viên dùng chung tường đông / tây Ngoại Môn có cổng trăng. Khu: Truyền Tống Đài / Cư Xá x 21…54, Linh Dược Viên /
  Luyện Đan Phòng x −56…−21. Lối vào Truyền Tống Đài [21; 0] → [25; 0] (mép sân đài).
- `scene:check`: Không có lỗi · không chồng lấn. Luật: ví dụ R-HUD-1, R-HUD-3 theo toạ độ mới (sổ + online).
- Ảnh: `screens/Canh-ghep-tuong.png` (trên xuống · cổng trăng tường đông).

## 2026-11-13.9 — Bản đồ truyền tống + thẻ học bộ thủ + nút hành động + hội thoại NPC

- Loại: giao diện · token · chuỗi · dữ liệu (toạ độ bản đồ) · luồng/luật (đề xuất).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-13-hanh-trinh-hud.md` (bản đồ + bộ thủ), `2026-11-13-nut-hanh-dong.md`,
  `2026-11-13-hoi-thoai-npc.md`.
- Màn / thành phần: **Bản đồ truyền tống** (tấm giấy + lớp trạng thái + màn ghép dọc / ngang + nút đóng + thẻ HUD) ·
  **Thẻ học bộ thủ** (Flutter native) · **Nút hành động** (nhảy, chào, ngồi thiền) · **Hội thoại NPC** (nút "Nói chuyện"
  + khung thoại). Đặc tả: `docs/screen_specs.md` 4 mục mới; thành phần: `docs/components.md`.
- Quyết định thiết kế:
  - Bản đồ: ảnh nền 2048 × 1152 vẽ bằng code (`scene/ban-do/ve-ban-do.html`, sơn thuỷ phẳng hợp vinyl) + toạ độ
    (`scene/ban-do/ban-do.json`); **code vẽ trạng thái** lên giấy; **chữ yêu cầu không vẽ trên giấy** (quá nhỏ ở dọc) →
    thẻ HUD khi chạm. Bố cục "rắn", đúng hướng địa lý (Bồng Lai đông, Tơ lụa tây).
  - Đóng bản đồ: nút "Đóng bản đồ" (viên thuốc kính) — dọc giữa dưới, ngang góc dưới phải. Bản đồ mở: đứng yên,
    joystick + nút hành động ẩn.
  - Thẻ bộ thủ: màn Flutter native, dùng khung màn bài học. Ví dụ "một dạng" là 石 — 竹 có dạng ⺮.
  - Nút hành động: cụm góc dưới phải, Nhảy 68 nổi bật (ngọc lục), Chào / Thiền 52 kính; nhãn nhỏ dưới mỗi nút.
  - Hội thoại: khung đáy màn, chân dung + bảng tên, lời chạy dần (chạm để hiện hết), "Tạm biệt" luôn cuối; lời giữ trong
    dữ liệu hội thoại.
- Token mới: `jade-press` #1F4035, `map-paper` #F2EADA, `scroll-wood` #3A2418; `size.action-main` 68, `action-sub` 52,
  `dialog-option` 46.
- Chuỗi mới (`l10n/vi.arb`): `map*`, `place*`, `radical*`, `action*`, `talk`.
- **Đề xuất luật** (phiên code hỏi người dùng rồi ghi sổ):
  - Bản đồ: bước vào vòng trận → bản đồ mở; trong lúc mở nhân vật đứng yên (joystick, phím, nút hành động không có tác
    dụng); "Đóng bản đồ" / nút quay lại → đóng, đi lại được. Chạm nơi khoá / sắp mở → không truyền tống, hiện thẻ yêu
    cầu ≈ 3 s. Ví dụ: 128 chữ, chạm Bồng Lai → thẻ "Bồng Lai — cần 300 chữ · Bạn đã học 128 chữ."; chạm Rừng trúc → màn tải.
  - Thẻ bộ thủ: lần đầu bấm "Đã học · khắc vào bia" → bộ thủ thành đã học, bia viền vàng; mở lại → huy hiệu "Đã học".
  - Nút hành động: ẩn khi bài học / thẻ bộ thủ / màn tải / bản đồ / hội thoại đang mở; vô hiệu (mờ) đúng như `R-DIEU-6/7`.
- Luật hiện có bị chạm: `R-HANH-1` (mốc), `R-NPC-2` (đúng theo), `R-DIEU-1` (nút nửa phải; khung thoại phủ vùng joystick
  khi thoại — joystick tắt), `R-DIEU-6/7`, `R-VUNG-3` (đứng yên), `R-MAN-1` (safe area).
- File: `source/BanDo-*.dc.html`, `source/TheBoThu-*.dc.html`, `source/HUD-hanh-dong-*.dc.html`,
  `source/NutHanhDong-trang-thai.dc.html`, `source/HoiThoai-*.dc.html`, `source/canvas.json` · `scene/ban-do/ban-do-goc.png`,
  `ban-do.json`, `ve-ban-do.html` · `screens/BanDo-trang-thai.png` · `tokens/design_tokens.json` · `l10n/vi.arb` ·
  `docs/screen_specs.md`, `docs/components.md`.
- Ảnh: chỉ `BanDo-trang-thai.png`; các màn chưa có ảnh (dùng `source/*.dc.html`).

## 2026-11-13.8 — Camera: bố cục như game góc nhìn thứ ba

- Loại: cảnh 3D — **ngoại hình** (camera) + code. Người dùng: "cảm giác vẫn chưa chuyên nghiệp như cách các game làm" →
  chọn "bố cục / góc nhìn".
- `camera.near.pitch` 0,38 → **0,30**; camera ngắm cao hơn đầu nhân vật `dist × 0,17` m (`input/orbitCamera.ts` `LOOK_UP`)
  → góc nhìn thật chỉ chúc ~7,5° (trước ~22°): nhân vật ở 1/3 dưới màn hình, thấy trời, núi, Chưởng Môn Điện phía trước.
- Vào game nhân vật quay lưng về camera (nhìn về cổng) thay vì nhìn vào camera; đang đi góc ngẩng tự về góc chuẩn (R-DIEU-3).
- Ảnh: `screens/Canh-camera-bo-cuc.png` (trái cũ · giữa mới chỗ xuất phát · phải mới sân giảng đường · dưới màn ngang).

## 2026-11-13.7 — Cảnh: camera gần hơn (9 → 6 m)

- Loại: cảnh 3D — **ngoại hình** (camera). Người dùng: "Khoảng cách giữa camera và nhân vật đang quá xa". Phiên VS Code làm thay `/canh`.
- `camera`: góc chơi `near` 9 m / 0,42 rad → **6 m / 0,38 rad** (≈ 3 lần chiều cao nhân vật 2,1 m, như game góc nhìn thứ ba);
  góc cả sân `far` 24 m / 0,75 → 15 m / 0,7; chụm zoom `minDist` 5 → 3, `maxDist` 30 → 20.
- Luật: ví dụ R-DIEU-4 "camera lùi về 9 m" → 6 m (sổ + tài liệu online).
- Ảnh: `screens/Canh-camera-gan.png` (trái 9 m cũ · phải 6 m mới, chỗ xuất phát).

## 2026-11-13.6 — Hành trình nhiều vùng + Truyền Tống Đài (hướng C)

- Loại: luồng/luật (đề xuất luật mới) · cảnh 3D (**bố cục** — khu 3 đổi vai) · dữ liệu (vùng, mốc mở khoá).
- Quyết định người dùng (2026-11-13), sau thảo luận "hình tượng bài trí tông môn": hướng **C — hành trình nhiều vùng**;
  tông môn = nhà / trạm gốc; đi lại bằng **trận truyền tống trong tông môn** (không màn bản đồ); **mở theo số chữ / cấp
  HSK**; vùng đầu **Rừng trúc** (hồ sơ `docs/tham_khao/rung-truc.md`: hướng A Giang Nam + thác; bia + vật "sống");
  **Truyền Tống Đài thay Diễn Võ Trường**.
- Tài liệu: `scene/hanh_trinh.md` (7 chặng, mốc, Truyền Tống Đài); `scene/tong_mon.md` (ghi chú đầu file).
- Artboard: `source/HanhTrinh-so-do.dc.html`, `source/TruyenTongDai.dc.html`, `source/canvas.json`. Chưa có ảnh.
- **Đề xuất luật mới** (phiên code hỏi người dùng rồi ghi sổ):
  - Mở vùng: cột trận của vùng sáng khi số chữ đã học ≥ mốc của vùng (Rừng trúc từ đầu; Giang Nam khi xong bộ thủ;
    Bồng Lai 300; Trường Thành 900; Tử Cấm Thành 1 800; Tơ lụa 3 000). Ví dụ: 299 chữ → Bồng Lai còn tối, tới gần hiện
    "Cần 300 chữ"; 300 chữ → sáng.
  - Truyền tống: đứng vào vòng trận **sáng** → màn tải → cảnh vùng, xuất hiện cạnh vòng trận về nhà; vòng tối không có
    tác dụng. Về nhà: đứng vào vòng trận về nhà → về Truyền Tống Đài, trước cột của vùng vừa rời.
  - Bia bộ thủ: bia của bộ thủ đã học có viền vàng; chưa học thì mờ.
- **Cần code** (`/lead`): nhiều cảnh (mỗi vùng một đặc tả, vd. `scene/rung-truc.json`), chuyển cảnh qua màn tải, lưu tiến
  độ (số chữ, bộ thủ đã học), mở khoá; Truyền Tống Đài (sân tròn, 6 cột + biểu tượng, vòng trận sáng / tối, hạt sáng,
  nhãn "Cần … chữ"); bỏ đài tỉ thí + giá binh khí khu 3; vùng 1 Rừng trúc (trúc mao cao dày đung đưa, đình mái chóp,
  bia bộ thủ có chữ, chạm vật hiện bộ thủ) — chi tiết `docs/tham_khao/rung-truc.md` mục "Đưa vào cảnh".
- Giao diện mới sẽ cần (phiếu `/ui-design` khi phiên code soạn): thẻ học bộ thủ (chạm bia / vật), nhãn "Cần … chữ" ở cột
  khoá, thẻ tên vùng khi tới.
- Luật hiện có bị chạm: `R-HUD-1` (chip tên — thêm tên vùng), `R-VA-1` / `R-VUNG-*` (theo từng cảnh) — phiên code soát.

## 2026-11-13.5 — Cảnh: thu tông môn ×0,625 (giữ cỡ nhà), sân gạch xanh xám, tường vôi, lối đá bám đất (L-3)

- Loại: cảnh 3D — **bố cục** + **ngoại hình**. Người dùng (kèm ảnh): "tỉ lệ và kích thước của vùng đất đang quá lớn tôi
  muốn thu hẹp lại … đường đi bị cắt … cải thiện chất lượng của các viên gạch và tường". Chọn: thu ×0,625 (bỏ lần phóng
  ×1,6 của 2026-11-11.11), nhà / cổng / tường / đồ / cây giữ cỡ, gạch xanh xám cổ + tường vôi. Phiên VS Code làm thay `/canh`.
- Bố cục (`scene.json`): mọi toạ độ ×0,625; khu, bục, lối đá, tường bao (±33,6 → ±21), ao, cụm cây (số cây ×0,39), núi,
  sương, biển mây thu theo; địa hình thu cả chiều cao (giữ độ dốc, R-VA-2); `terrain.cell` 3 → 2. Đi từ chỗ xuất phát
  (0; 50) tới Nội Môn (0; −64): 114 m ≈ 27 giây (cũ 182 m ≈ 43 giây). Dàn lại chỗ chồng do giữ cỡ: đèn đá + mai trước
  giảng đường giữ khoảng cách cũ tới mặt nhà; đỉnh đồng ra giữa sân (0; 7); 4 nhà cư xá xếp 2 × 2 (35 | 52; 25,5 | 36,5);
  tùng hai bên lối Sơn Môn ra x = ±11; lối Diễn Võ dừng ở mép đài; lối phụ hẹp lại (4,8 / 3,6). NPC Tiểu Mặc (3,5; 46,25).
- Ngoại hình: trường mới `ground.pattern: "vuong"` (mặc định `"gach"` = như cũ) — gạch vuông 0,6 m màu `ground.color`
  `#727a7e`, mạch vữa sáng, mép vát, viên đậm nhạt; lối đá = phiến chữ nhật so le mép vát; tường vôi có loang nhẹ + ố chân
  tường, chân đá xếp; lọc nghiêng ×8 (gạch xa không nhoè).
- L-3: lối đá là một tứ giác phẳng nội suy hai đầu → chìm dưới nền ở giữa; nay lưới bám mặt đất từng mét.
- Luật: không đổi nội dung; ví dụ toạ độ R-VUNG-1, R-VUNG-2, R-VA-1, R-VA-3, R-HUD-1, R-HUD-3, R-NPC-1 tính lại theo bản đồ
  mới (sổ + tài liệu online). `npm run scene:check`: Không có lỗi.
- Ảnh: `screens/Canh-thu-nho-gach-tuong.png` (trên xuống, chỗ xuất phát, cổng trăng cận, sân giảng đường, Diễn Võ, cư xá),
  `screens/Canh-loi-L3.png`.

## 2026-11-13.4 — Bộ ảnh nhiều góc Chưởng Môn Điện 掌門殿 (công trình 3/3, đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào (công trình). Hồ sơ `docs/tham_khao/cong-trinh-noi-bat.md` (hướng: ngói vàng).
- Thiết kế (theo ảnh trước **người dùng chọn**): mái yết sơn **hiên kép** ngói vàng `#C9A13B`, nóc thẳng, si vẫn hai đầu
  nóc, 8 góc vểnh; biển **trơn** (`#24323A`, khung vàng) giữa hai tầng mái — chữ code vẽ; **3 gian 4 cột** son `#A8322A`,
  **cửa gian giữa mở** (lòng ấm nông), hai gian bên cửa ô lưới; xà lục `#2F6F73` / lam `#3F5FA0` chấm vàng; nền đá trắng 2
  bậc `#D9D4C7`, lan can đá, một lối bậc giữa.
- Quá trình: bản 5 gian bị người dùng chê hẹp → câu lệnh 7 gian + cửa giữa mở; người dùng chọn một ảnh 3 gian cửa giữa
  mở (dáng gần vuông) → các góc còn lại viết theo ảnh đó.
- Sau: không bậc, không biển, 3 gian cửa ô lưới đóng, lan can liền. Trái (cuộc trò chuyện mới, không đính kèm ảnh điện):
  tam giác hồi mái trên, bậc nhô bên trái (mặt trước quay sang trái ảnh), 3 gian (câu lệnh xin 2 — chấp nhận; điện gần
  vuông). `-phai` = lật gương `-trai`.
- **Chấp nhận** (người dùng chốt): ở ảnh nghiêng đỉnh tam giác hồi cao hơn nóc ảnh trước ≈ 5 % chiều cao ảnh → model có
  thể nhô ở hai đầu nóc; sửa sau bằng ảnh trái mới ("gable top level with the main ridge").
- Lan can trụ + song thưa (ảnh trước) có thể thành lưới vỡ khi dựng → nếu xấu: xin lan can gờ đặc hoặc code dựng lan can.
- Chuẩn hoá: sao Gemini nằm trên nền đá ở cả 3 ảnh → thay bằng đoạn nền ngay bên trái (nền đá là dải ngang đều); hệ số
  thu chung căn theo **tâm thân nhà**, chừa chỗ cho bậc nhô ở ảnh nghiêng (điện nhỏ hơn trong khung).
- Cỡ trong cảnh: đặc tả hiện 19,2 × 12,8 m; ảnh cho mặt bằng gần vuông (sâu ≈ rộng) → khi đặt model (code / `/canh`) chỉnh
  `buildings[chuong-mon-dien]` cho khớp tỉ lệ model.
- File: `models/anh/chuong-mon-dien-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png` · `screens/ChuongMonDien-bo-anh.png` ·
  `source/ChuongMonDien-bo-anh.dc.html`, `source/canvas.json` · `models/LICENSES.md`.
- Luật: không chạm. Việc tiếp (VS Code): `/tai-nguyen cong-trinh chuong-mon-dien` → `design/models/chuong-mon-dien.glb`
  (xa → nén ≈ 12 000 tam giác); `/lead`: thay điện khối, vẽ chữ lên biển, giữ va chạm nền + bậc.
- Đủ 3 công trình nổi bật (lò đan · cổng · điện).

## 2026-11-13.3 — Bộ ảnh nhiều góc Cổng Sơn Môn 山門 (công trình 2/3, đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào (công trình). Hồ sơ `docs/tham_khao/cong-trinh-noi-bat.md` (hướng: 3 gian 4 trụ, 3 mái).
- Thiết kế: cổng 牌樓 3 gian 4 trụ son `#A8322A`, 3 mái ngói lục `#2B5446` (mái giữa cao), nóc thẳng `#24323A`, đầu nóc +
  góc vểnh; xà lục `#2F6F73` / lam `#3F5FA0` chấm vàng `#D4A64A`; **biển trơn** (nền `#24323A`, khung vàng) — chữ 文淵宗 code
  vẽ sau (Gemini viết sai chữ Hán); đế đá trắng `#D9D4C7`, **trống đá chỉ nổi ở mặt trước đế**.
- **Mặt sau KHÔNG có biển** (người dùng chọn; cổng thật thường treo biển hai mặt) — chỉ xà; đế mặt sau trơn.
- Bỏ ảnh chéo ¾ (không vào luồng dựng; `/tai-nguyen` tự chụp 6 góc model thật để duyệt).
- **Ảnh nghiêng — bài học**: "xoay 90°" + đính kèm ảnh trước → Gemini vẽ lại mặt trước, chồng thêm trụ (2 lần hỏng).
  Đạt khi: cuộc trò chuyện MỚI, **không đính kèm ảnh cổng** (chỉ ảnh mẫu kiểu render), **không dùng chữ "gate"**, tả thẳng
  hình nhìn thấy: "một vật hẹp đứng — MỘT trụ son giữa, khối đá vuông dưới chân có khối nổi chỉ ở bên TRÁI, hai đầu mái
  ngói chồng (dưới ≈ 40 %, trên ≈ 15–30 %), mỗi đầu mái là hình thang, hai góc vểnh, đầu nóc cong ở giữa; rộng ≈ 30 % ảnh".
  `-phai` = lật gương `-trai` (cổng đối xứng). Dùng lại cách này cho Chưởng Môn Điện.
- Quy ước góc (theo `mv_gen.py`): ảnh `trai` = nhìn từ bên trái vật, mặt trước quay sang TRÁI ảnh (khối nổi đế ở trái) ✓.
- Chuẩn hoá: tách nền chặt, nền #DDDDDD; sao Gemini ở ảnh trước / sau nằm trên trống đá trụ ngoài cùng phải → thay bằng
  cùng vùng của trụ kế bên (dịch −204 px, sai khác ≈ 2 / 255); một hệ số thu chung (cổng rộng ≈ 90 % ảnh), đáy đế ≈ 90 %,
  căn giữa; ảnh nghiêng căn theo tâm trụ.
- File: `models/anh/cong-son-mon-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png` · `screens/CongSonMon-bo-anh.png` ·
  `source/CongSonMon-bo-anh.dc.html`, `source/canvas.json` · `models/LICENSES.md`.
- Luật: không chạm. Việc tiếp (VS Code): `/tai-nguyen cong-trinh cong-son-mon` → `design/models/cong-son-mon.glb`
  (≤ 20 000 tam giác); code: thay cổng khối `gates[son-mon]`, giữ va chạm 4 trụ, **vẽ chữ 文淵宗 lên biển mặt trước**,
  xà thấp nhất ≥ ≈ 9,6 m.

## 2026-11-13.2 — Bộ ảnh nhiều góc lò đan đồng 丹爐 (công trình 1/3, đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào (vật / công trình). Không có phiếu: theo hồ sơ `docs/tham_khao/cong-trinh-noi-bat.md`
  (người dùng chọn 2026-11-13: lai — 3 công trình nổi bật bằng AI; Luyện Đan Phòng **chỉ làm lò đan**, nhà giữ code).
- Thiết kế: đỉnh đồng bụng tròn phình, hai quai đứng trên miệng, nắp chóp 3 tầng núm vàng, hoa văn mây nổi nông, cửa lò
  tròn **chỉ ở mặt trước** (đĩa cam phẳng `#F08A3C`, không lỗ thủng), chân sẫm, bệ đá bát giác. Màu: đồng gỉ `#5E8C7A`
  (sáng `#86B09B`, tối `#3D5E52`), viền vàng `#D4A64A`, bệ `#9A968C`, chân `#24323A`. Khói / lửa động: code (không vẽ).
- Câu lệnh Gemini (chung): vật mới, cùng kiểu đồ chơi vinyl như `nhan-vat-truoc.png`; khối dày, không chi tiết mảnh,
  không nhìn xuyên; ánh sáng đều, không bóng sâu, không nét viền; chiếu thẳng ngang bụng lò; không khói / lửa / tia; nền
  #DDDDDD trơn, không sàn, không chữ / watermark; 1024², núm nắp 10 %, đáy bệ 90 %. Riêng góc: trước (cửa lò giữa) ·
  bên trái (cửa lò chỉ là mép bên phải ảnh) · sau (không cửa) · bên phải (mép bên trái) · ¾ chếch trên (duyệt).
- Soát: đúng các điểm trên, 4 góc khớp nhau (cửa lò / quai / nắp). **Chấp nhận**: Gemini vẽ **4 chân** thay vì 3 (nhất
  quán cả 4 góc; phương đỉnh 4 chân có thật); ảnh trước cửa lò lệch phải ≈ 4 % (lò hơi xoay); ảnh "¾" ra gần chính diện
  — chỉ duyệt, không đưa vào Hunyuan.
- Chuẩn hoá: như bộ Mặc Ông (tách nền chặt, nền #DDDDDD, xoá sao, hệ số thu chung, đáy bệ 90 %, trục giữa).
- Cỡ trong cảnh (tham khảo, code đặt): cao ≈ 4–5 m, gấp ≈ 2 lần nhân vật (ô so cỡ trên ảnh duyệt).
- **Sửa 2026-11-13 (sau chốt)**: đổi tên `lo-dan-trai.png` ↔ `lo-dan-phai.png`. Quy ước của luồng dựng (`mv_gen.py`):
  ảnh `trai` = nhìn từ bên trái vật, **mặt trước quay sang TRÁI ảnh**; câu lệnh lò đan đã viết ngược (cửa lò ở mép phải
  ảnh `trai`). Ảnh không đổi, chỉ đổi tên; `screens/LoDan-bo-anh.png` vẫn ghi nhãn cũ.
- File: `models/anh/lo-dan-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png`, `-cheo.png` · `screens/LoDan-bo-anh.png` ·
  `source/LoDan-bo-anh.dc.html`, `source/canvas.json` · `models/LICENSES.md`.
- Luật: không chạm. Việc tiếp (VS Code): `/tai-nguyen cong-trinh lo-dan` → `design/models/lo-dan.glb` (≤ 20 000 tam giác,
  vật nên ≈ 8 000); đặt thay `props[lo-dan]` khối, giữ khói + va chạm từ code (`/lead`).

## 2026-11-13.2 — Tiểu Mặc: hết vệt đen ở mép má, bóng mờ cạnh mắt

- Loại: tài nguyên 3D — **ngoại hình**. Người dùng (kèm ảnh, Tiểu Mặc chếch 3/4): "viền thái dương đã hết nhưng ở mép má
  của tiểu mặc vẫn còn vệt đen".
- Nguyên nhân: viền bóng của lọn tóc mai trên má trong ảnh lệch vài điểm ảnh so với lọn tóc trên model → bị coi là "da",
  màu tối trộn vào má; mắt ở ảnh góc bên chiếu lệch thành bóng xám cạnh mắt.
- Sửa (`bake.py`, nướng theo vùng): màu da phần đầu quay về trước chỉ lấy điểm ảnh **xa mép tóc** (nới mặt nạ tóc
  `--vien-toc 0.006`); mắt / mày / miệng (mảng tối nhỏ trên cổ) chỉ lấy từ ảnh trước. Gáy / cổ áo lấy như thường (thử áp
  cho cả gáy: viền xanh cổ áo sau bị lấn trắng — bỏ). Nướng lại cả nhân vật chính (không đổi thấy được).
- Ảnh: `screens/Model-dau-theo-vung-34.png` (trên: Tiểu Mặc trước sửa + tư thế gốc sau sửa của hai nhân vật; dưới: trong
  cảnh sau sửa — Tiểu Mặc hai bên má, nhân vật chính 3/4).

## 2026-11-13.1 — Bộ ảnh nhiều góc Sư phụ Mặc Ông 墨翁 (đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào. Phiếu: `docs/phieu_thiet_ke/2026-11-12-anh-su-phu.md`.
- **Đổi thiết kế so với phiếu**: phiếu (hướng A "lão phu tử văn nhân Tống" — mũ Đông Pha, hạc sưởng ngà, râu ba chòm)
  được thay bằng **Sư phụ Mặc Ông 墨翁** theo tờ thiết kế của người dùng (`models/anh/su-phu-thiet-ke.webp`): vị đạo sư
  thư pháp giảng bài trong màn Truyện, thầy của Tiểu Mặc. Giữa chừng người dùng còn bỏ mũ Đông Pha; một bộ ảnh lão phu
  tử đã làm rồi bỏ (không vào repo). Hồ sơ `docs/tham_khao/su-phu.md` không còn khớp — chỉ tham khảo.
  Tên file giữ `su-phu-*` (khớp phiếu và `/tai-nguyen nhan-vat su-phu`).
- Thiết kế (màu rút từ tờ): búi tóc bạc #F2EFE7 đội đạo quan nhỏ #2C2D33, trâm gỗ #845D3F cắm ngang; mắt cười, mày bạc rủ,
  má hồng #F1BDAE, da rất nhạt; ria + **một chòm râu dài nhọn** tới đai; đạo bào xanh mực #3D4B5E dài chấm đất, cổ chéo
  màu giấy #E6E3D9 (vạt trái đè phải), gấu viền giấy; đai gỗ nâu #845D3F tua vàng #D4A64A phía trước (theo phần chữ của
  tờ — dáng "Đứng chờ" vẽ đai màu giấy có khoá tròn); giày đen.
- Chọn: tư thế chữ A tay không; **bút lông là vật gắn riêng** (không vào ảnh); mặt mặc định mắt cười (dáng "khen") —
  biểu cảm giảng / nhắc / khen của tờ làm sau bằng ảnh mặt.
- Câu lệnh Gemini (chung): render 3D đồ chơi vinyl, không nét viền; chiếu thẳng ngang ngực; chữ A, tay không; nền
  #DDDDDD trơn, không chữ / watermark; 1024²; đỉnh đạo quan 10 %, đế 90 %; đặc điểm + màu như trên. Riêng góc: trước ·
  profile thấy bên trái · sau (không thấy râu) · profile thấy bên phải · cận đạo quan + mặt + râu.
- Soát: đúng tờ ở mọi điểm trên ✓; tua vàng thấy ở ảnh trước + hai ảnh nghiêng ✓; trâm ở ảnh nghiêng chỉ thấy đầu (đúng);
  4 góc gốc cao 948–952 px ✓.
- Chuẩn hoá: tách nền chặt — nền = điểm xám trung tính (|r−b| ≤ 4) lệch ≤ 8 so với màu góc ảnh, tô loang từ mép, bỏ đốm
  lẻ (tóc / râu / áo sáng gần màu nền nên cách cũ ăn mất mảng); nền → #DDDDDD; một hệ số thu chung cho 4 góc; đế giày →
  90 %, trục thân giữa. Ảnh cận: sao Gemini nằm trên vạt áo → vá bằng nội suy màu áo xung quanh (còn một chấm rất nhỏ).
- So cỡ (ảnh duyệt): Mặc Ông cao hơn nhân vật chính ≈ 20 % theo dáng trên tờ — chỉ tham khảo, chiều cao trong cảnh do
  code đặt.
- File: `models/anh/su-phu-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png`, `-mat.png` · `screens/SuPhu-bo-anh.png` ·
  `source/SuPhu-bo-anh.dc.html`, `source/canvas.json` · `models/LICENSES.md`. (`su-phu-thiet-ke.webp`,
  `su-phu-chan-dung.png` đã vào repo ở commit `2aa4b8a`.)
- Luật: không chạm. Việc tiếp (VS Code): `/tai-nguyen nhan-vat su-phu` →
  `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh su-phu <thư mục ra>` → `design/models/su-phu.glb`; thay thầy dựng
  bằng khối trong giảng đường là việc code sau (`/lead`).

## 2026-11-13.1 — Nhân vật chính + Tiểu Mặc: nướng màu đầu THEO VÙNG (hết lem mặt / tóc mai)

- Loại: tài nguyên 3D — **ngoại hình**. Người dùng: "quy trình và mô hình hiện tại … hay bị lỗi ở mặt ở tóc mai" → đồng ý
  hướng 1 + 2.
- Nguyên nhân gốc: màu chiếu từ 4 ảnh lên hình Hunyuan; hình lệch ảnh vài mm ở ranh tóc / da nên ảnh này thấy tóc, ảnh kia
  thấy da → vệt lai, vệt sọc; các luật vá trước (.10, .11, cờ `--xien`) chỉ chữa từng ca.
- Sửa (`tai-nguyen/scripts/bake.py`, mặc định; `--cu` = cách cũ): mặt nạ tóc từng ảnh (mảng tối LỚN trên cổ, lấp lỗ vệt
  bóng sáng; mắt / lông mày là mảng nhỏ) → mỗi đỉnh lưới bỏ phiếu tóc / không-tóc (trọng số hướng nhìn + che khuất, trên
  chân tóc trán nghiêng về tóc) → làm mượt trên lưới → tóc chỉ lấy màu ảnh thấy tóc, da / phụ kiện chỉ ảnh thấy không-tóc.
  Kèm: tìm cổ = hẹp nhất DƯỚI hàng rộng nhất của đầu (cũ rơi vào đỉnh đầu ở Tiểu Mặc → má, tóc mai bị coi là thân); trục
  đầu model suy từ ảnh (cổ áo / kiếm làm lệch 4 % → mắt bóng đôi).
- Kết quả: Tiểu Mặc hết vệt sọc trên má và khe da giữa tóc mai – khối tóc, mắt hết bóng đôi; nhân vật chính hết vệt ở thái
  dương khi nhìn 3/4. Còn: viền rất mảnh ở mép thái dương phải Tiểu Mặc. 215 KB · 239 KB, 16 000 tam giác mỗi model.
- Mẫu phiếu ảnh (skill `/tai-nguyen`): thêm "Tóc và mặt cho 3D" — tóc liền khối, tóc mai sát má, không lọn rủ hở; phụ
  kiện tóc khác màu tóc; nên có 2 ảnh chếch 45° (bake chưa đọc — làm khi có bộ đầu tiên).
- Ảnh: `screens/Model-dau-theo-vung.png` (tư thế gốc: hàng 1–2 Tiểu Mặc cũ / mới, 3–4 nhân vật chính cũ / mới),
  `screens/Model-dau-theo-vung-34.png` (trong cảnh, chếch 3/4: trên cũ, dưới mới).

## 2026-11-12.15 — Cảnh: NPC Tiểu Mặc đứng cạnh cổng Sơn Môn

- Loại: cảnh 3D — **bố cục** (vật cản mới). Người dùng chọn vị trí + động tác (phiên VS Code làm thay `/canh`); kế hoạch
  `docs/tasks/2026-11-12-npc-tieu-mac.md`; luật mới **R-NPC-1** (đứng tại chỗ, va chạm tròn 0,45, quay về người chơi < 4 m).
- Trường mới (phiên code thêm, mặc định `[]` giữ cảnh cũ): `npcs: [{ id, x, z, rotY? }]`, `id` ∈ mã có model
  (`tieu-mac`). Đặt: `{ "id": "tieu-mac", "x": 3.5, "z": 74, "rotY": 0 }` — mép lối đá (rộng 8), trước cột cổng 3,6 m,
  nhìn về điểm xuất phát (0; 80); giữa lối còn > 3 m để đi.
- `npm run scene:check`: Không có lỗi · `NPC tieu-mac: (3,5; 74) nhìn 0°`. Draw call +2 (model + bóng).
- Ảnh: `screens/Canh-npc-tieu-mac.png` (trên: từ điểm xuất phát · cạnh nhân vật chính · nhân vật chính không đổi;
  dưới: người chơi sau lưng / bên trái → Tiểu Mặc quay theo; xa 8 m → giữ hướng gốc).

## 2026-11-12.14 — Model NPC Tiểu Mặc 小墨 (luồng chuẩn 4 góc)

- Loại: tài nguyên 3D. Phiếu: `docs/phieu_thiet_ke/2026-11-12-anh-nhan-vat-3d.md` (đợt 2, ảnh mục .13).
- Làm: `nhan-vat.sh tieu-mac` (Hunyuan3D-2mv đầy đủ, seed 1234 · 7) → người dùng chọn **seed 1234** →
  `design/models/tieu-mac.glb` (16 000 tam giác, 243 KB, vật liệu không-sáng). Nướng `--giu-toc-mai` (thiết kế có tóc mai).
- Sửa công cụ khi làm (`bake.py`): nền = vùng gần màu nền **nối ra mép ảnh** (áo trắng chỗ hơi tối gần trùng nền #DDDDDD bị
  coi là nền → viền xanh loang khắp áo); cổ đo ở góc trước dùng chung mọi góc (đuôi ngựa / kiếm làm sai cổ ở góc bên);
  cờ `--xien`. Nhân vật chính nướng lại bằng bản mới: không đổi. Thêm `xem.py` (xem tư thế gốc, không xương).
- Còn: vệt nhạt nhỏ ở thái dương, tóc mai rủ dính liền má (Hunyuan dựng lọn tóc sát mặt) — chấp nhận.
- Chưa đặt vào cảnh: app chưa nạp NPC `.glb` (xương tự gắn hiện đo theo nhân vật chính) → cần `/lead`.
- Ảnh: `screens/Model-tieu-mac-so-thiet-ke.png` (trên ảnh thiết kế · dưới model, tư thế gốc), `screens/Model-tieu-mac-dau.png`.

## 2026-11-12.13 — Bộ ảnh nhiều góc NPC Tiểu Mặc 小墨 (đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào. Phiếu: `docs/phieu_thiet_ke/2026-11-12-anh-nhan-vat-3d.md` (đợt 2).
- Nguồn thiết kế: tờ "小墨 Tiểu Mặc" của người dùng → `models/anh/tieu-mac-thiet-ke.webp`; chân dung cắt riêng
  `models/anh/tieu-mac-chan-dung.png` (đính kèm cho Gemini). Màu rút từ bảng màu của tờ: áo trắng #F7F3EB, lục bích
  #2F6D5B (viền), mực #241E1B (tóc, đai, ủng), chu hồng #B8332B (dây tóc, tua), yên chi #DF695A (má), bạc #CACDD3 (bao
  kiếm), kim #D2A62E (chuôi).
- Chọn (người dùng không đổi): tóc kiểu A "đuôi ngựa cao, dây đỏ" (kiểu nhận diện của tờ); tư thế chữ A, **không chắp tay
  chào** như tờ (tay chắp làm AI dính tay vào thân); mắt mở cười nhẹ (biểu cảm khác làm sau bằng mặt); mũ theo cấp tu
  đạo là vật gắn riêng, không vào model gốc.
- Câu lệnh Gemini (chung): render 3D đồ chơi vinyl, không nét viền; chiếu thẳng ngang ngực; chữ A, tay không chắp; nền
  #DDDDDD trơn, không chữ / watermark; 1024²; chibi đầu ≈ 2/5; tóc mái + tóc mai, đuôi ngựa cao dây đỏ; áo giao lĩnh
  trắng viền lục bích, vạt trái đè phải, tay áo rộng; đai đen + ngọc bội dây đỏ phía trước; ủng đen; kiếm thẳng đeo
  chéo lưng, bao bạc, chuôi vàng ló trên vai TRÁI, tua đỏ; má hồng, mắt mở, cười nhẹ. Riêng góc: trước · profile thấy
  bên trái (mặt sang trái ảnh) · sau (kiếm chéo lưng, chuôi trên vai trái) · profile thấy bên phải (mũi bao kiếm sau
  hông) · cận đầu + cổ.
- Soát: kiếm nhất quán 4 góc (trước: chuôi vai trái + mũi bao hông phải; sau: chéo, chuôi bên trái người xem; nghiêng:
  bao dọc sau lưng) ✓; vạt trái đè phải ✓; đuôi ngựa + dây đỏ ở 2 ảnh nghiêng ✓; 4 góc gốc cao 922–923 px ✓.
  **Chấp nhận lỗi nhỏ**: ảnh sau thiếu dây đỏ ở chân đuôi ngựa, đuôi ngựa vẽ dồn xuống gáy (người dùng chốt không sửa)
  → khi nướng màu, mặt sau búi có thể không có dây đỏ.
- Chuẩn hoá: nền trơn #DDDDDD (tô loang từ mép, ngưỡng 22, đóng khe mặt nạ 5 px), xoá sao Gemini (tô bằng màu nền góc
  ảnh), **một hệ số thu chung** cho 4 góc (theo góc cao nhất) thay vì căn đỉnh — đuôi ngựa cao khác nhau theo góc; đế
  ủng → 90 %, trục thân (tâm ủng) → giữa. Ảnh cận mặt: chỉ đổi nền + xoá sao, không tô loang từ mép dưới (thân chạm mép).
- File: `models/anh/tieu-mac-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png`, `-mat.png`, `tieu-mac-thiet-ke.webp`,
  `tieu-mac-chan-dung.png` · `screens/TieuMac-bo-anh.png` · `source/TieuMac-bo-anh.dc.html`, `source/canvas.json` ·
  `models/LICENSES.md`.
- Luật: không chạm. Việc tiếp (VS Code, `/tai-nguyen`):
  `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh tieu-mac <thư mục ra>` → `design/models/tieu-mac.glb`. Kiếm sau
  lưng dễ dính vào lưng / mất ở góc nghiêng — nếu xấu: bỏ kiếm khỏi ảnh, làm kiếm thành vật gắn riêng.

## 2026-11-12.12 — Nhân vật: tạo lại hình bằng Hunyuan3D-2mv bản đầy đủ

- Loại: tài nguyên 3D — **ngoại hình**. Người dùng chọn hướng A ("vì sao model chưa thực sự giống … ảnh chưa đủ hay cần
  gói lớn hơn"): đánh giá — 4 ảnh góc là đủ; nguyên nhân chính là **hình**: bản turbo (10 bước, octree 384) + làm mịn mạnh
  làm tóc mỏng, tai dẹt, đầu lệch ảnh 5–6 % → chiếu màu lệch ở chân tóc / tóc mai (mục .10, .11 chỉ vá triệu chứng).
- Làm: `mv_gen.py --day-du` (model `hunyuan3d-dit-v2-mv`, tải ~5 GB một lần; 50 bước, octree 512, không FlashVDM; ~7 phút
  / seed, ~1 triệu mặt) → `smooth.py --min 2` → `bake.py --jpg` → `model:clean --khong-sang`. Seed 1234 (seed 7: tóc lổn
  nhổn hơn). 16 000 tam giác, 215 KB. Xương tự gắn (`autoRig`) giữ nguyên số đo — đi / đứng vẫn đúng.
- Kết quả: hết vệt tóc mai, tóc ôm kín thái dương cả hai bên, 4 góc thẳng khớp ảnh thiết kế.
- Chốt làm **luồng chuẩn tạo nhân vật** (người dùng: "hướng này ổn … áp dụng cách tạo nhân vật theo luồng như này"):
  một lệnh `tai-nguyen/scripts/nhan-vat.sh <tên> <ra> [--seed] [--nhanh] [--dat]`, mô tả ở skill `/tai-nguyen`.
- Ảnh: `screens/Model-nhan-vat-so-thiet-ke.png` (trên ảnh thiết kế · dưới model), `screens/Model-nhan-vat.png` (6 góc),
  `screens/Model-nhan-vat-thai-duong.png` (cận 3/4: trên bản .11 · dưới bản này).

## 2026-11-12.11 — Nhân vật: bỏ vệt tóc mai đen trước tai

- Loại: tài nguyên 3D — **ngoại hình**. Người dùng: "phần màu đen ở mai đáng ra không có".
- Sửa (`tai-nguyen/scripts/bake.py`): ảnh bên tẩy phần tóc mảnh nối khối tóc, thấp hơn chân tóc trán → màu da quanh đó
  (mắt / lông mày là mảng tối riêng → giữ; `--giu-toc-mai` để tắt, `--xem-toc-mai` ghi ảnh đã tẩy); trên đầu, ảnh trước
  không dùng ở chỗ nhìn quá xiên (mép tóc sát mặt chiếu trượt sang bên đầu); dưới chân tóc, ảnh trước thấy da → chỉ trộn
  các ảnh có màu da.
- Còn: bên phải đầu vẫn một vệt mảnh ở mép tóc khi nhìn 3/4 — giới hạn của cách chiếu ảnh lên hình không khớp ảnh
  (tóc model mỏng hơn ảnh); hướng xử lý tận gốc: tạo lại hình tốt hơn (xem báo cáo cùng ngày).
- Ảnh: `screens/Model-nhan-vat.png`, `screens/Model-nhan-vat-thai-duong.png` (cận 3/4 hai bên).

## 2026-11-12.10 — Nhân vật: hết mảng da nhạt ở thái dương khi nhìn chếch

- Loại: tài nguyên 3D — **ngoại hình**. Người dùng: "có vẫn làm tôi khó chịu" (mảng nhạt thái dương, mục .9 còn lại).
- Nguyên nhân: ảnh trước và ảnh bên chiếu sáng khác nhau (mép mặt ảnh trước tối, má ảnh bên sáng); tóc model mỏng hơn
  ảnh nên ở chân tóc / thái dương ảnh này là tóc, ảnh kia là da → trộn ra màu lai nhạt.
- Sửa (`tai-nguyen/scripts/bake.py`): (1) đầu khớp **từng nửa** quanh trục giữa cổ; (2) trên đầu, các góc bất đồng về
  **loại** (tóc ↔ da) → lấy tóc, da ↔ da (chỉ lệch sáng tối) → trộn mượt (thử "góc nhìn thẳng nhất thắng" khi lệch màu:
  ra đường ranh cứng chéo qua má — bỏ); thân vẫn lấy góc nhìn thẳng nhất khi lệch màu > `--bat-dong` 90;
  (3) điểm trên đầu cao hơn chân tóc trán (đo trên ảnh trước) mà mang màu da → màu tóc (`--khong-chan-toc` để tắt).
  206 KB, 16 000 tam giác.
- Còn: vệt tóc mai mảnh trước tai khi nhìn 3/4 (có trong ảnh thiết kế góc bên).
- Ảnh: `screens/Model-nhan-vat.png` (6 góc), `screens/Model-nhan-vat-thai-duong.png` (cận 3/4: trên bản .9 · dưới bản này).

## 2026-11-12.9 — Nhân vật: màu đúng như bộ ảnh thiết kế (vật liệu không-sáng + khớp khung từng góc, riêng đầu)

- Loại: tài nguyên 3D + code — **ngoại hình**. Người dùng (kèm 3 ảnh): "vẫn có sự lem màu khác màu ở đầu mặt trước và
  phần xung quanh. Mục tiêu … màu sắc phải như các ảnh ở các góc độ tôi gửi trong design của nhân vật".
- Nguyên nhân: (1) texture nướng từ ảnh render đã có ánh sáng, app chiếu sáng thêm lần nữa → màu lệch ảnh; ép bảng màu
  mục .8 làm ranh giới vùng mặt giữ / vùng ép lộ ra. (2) ảnh và model lệch vị trí: khung cả người ở ảnh trước do hai tay
  dang quyết định → đầu lệch ngang; đầu model to hơn ảnh 5–6 %, cổ thấp hơn ~1 % → chân tóc / thái dương lấn da.
- Sửa: bỏ ép bảng màu; `bake.py` khớp khung từng góc (khung model chiếu ↔ khung nhân vật trong ảnh) và **riêng vùng đầu**
  (tìm cổ = chỗ hẹp nhất trong ảnh và model, khớp đầu ↔ đầu, thân ↔ thân, chuyển mượt quanh cổ); `model:clean
  --khong-sang` gắn `KHR_materials_unlit` → `glbCharacter` giữ `MeshBasicMaterial` (không chiếu sáng lại). 198 KB.
  Thử `--mu` 8 / 16 (ưu tiên ảnh nhìn thẳng mạnh hơn): 16 lộ đường nối gãy — giữ 4.
- Quy tắc 4 (vật liệu Lambert): ngoại lệ có chủ đích cho model AI đã nướng texture — ghi ở quyết định 0003.
- Còn: mảng nhạt nhỏ ở thái dương phải khi nhìn chếch 45°.
- Ảnh: `screens/Model-nhan-vat-so-thiet-ke.png` (hàng trên ảnh thiết kế · hàng dưới model, 4 góc),
  `screens/Model-nhan-vat.png` (cận đầu 6 góc).

## 2026-11-12.8 — Nhân vật: màu phẳng sạch theo bảng màu thiết kế (hết cảm giác nhem bẩn)

- Loại: tài nguyên 3D — **ngoại hình** nhân vật. Người dùng (kèm ảnh): "vẫn đem lại cảm giác nhem bẩn mặc dù tốt hơn nhiều".
- Nguyên nhân: texture nướng mang sẵn bóng đổ / vệt sáng của ảnh render → app chiếu sáng thêm lần nữa → vạt áo xám, gáy
  có vệt xám; trộn 4 ảnh làm mép viền nhoè.
- Sửa (`tai-nguyen/scripts/bake.py --bang-mau … --giu-mat`): mọi vùng trừ mặt ép về **bảng màu thiết kế của phiếu**
  (áo #D4DDE8, viền #4D6DB2, áo lót #F3F5F7, đai / ủng #33456D, ngọc #8CCB9E, tóc #26262B, da #F6D3BD, trâm #E2B24C);
  vùng mặt (đầu, quay về trước) giữ ảnh gốc; màu lệch xa mọi màu trong bảng giữ nguyên; lọc mode 3. Đã thử bảng màu tự
  gom k-means (`--tu-bang` 8 · 9 · 11 · 12): đai / ủng nhạt hoặc áo tách hai tông → dùng bảng thiết kế.
- Còn: đai ra lam sáng như viền (đai trong ảnh render được chiếu sáng, gần viền hơn xanh đậm).
- Ảnh: `screens/Model-nhan-vat.png` (trước · sau · nghiêng · cận mặt).

## 2026-11-12.7 — Nhân vật: tay buông xuôi (bỏ dáng chữ A khi chơi)

- Loại: code động tác — **ngoại hình**. Người dùng: "không muốn hình dáng tay dạng ngang như hiện tại vì không tự nhiên".
- Model vẫn dựng ở tư thế chữ A (dễ cho AI dựng + gắn xương); khi chơi `glbCharacter` hạ tay quanh khớp vai
  `ARM_REST` = 0,5 rad (thử 0,35 · 0,5 · 0,65 — 0,35 còn dang, 0,65 tay áo cắm vào thân) → tay buông sát thân, đi vẫn vung
  nhẹ + khép thêm 0,04 rad.
- Ảnh kiểm: Canvas 3D cận vai trước · nghiêng · sau · đang bước (chụp trong phiên).
- Sửa cùng ngày (người dùng: "quá cứng nhắc quá gần thân"): `ARM_REST` 0,5 → **0,4** (tay tách thân một khe), tay đưa ra
  trước `ARM_FORWARD` 0,12 rad; đứng: hai tay đung đưa khẽ theo nhịp thở lệch nhịp (trước / sau 0,04, ra / vào 0,03);
  đi: vung 0,34 rad + mở ra ngoài 0,07 ở cuối mỗi nhịp.

## 2026-11-12.6 — Nhân vật: màu dưới nách liền áo; tay đi theo khi bước

- Loại: tài nguyên 3D + code động tác — **ngoại hình**. Người dùng báo (kèm ảnh): "hiệu ứng tay khi nhân vật di chuyển
  đang rất xấu và ở dưới vùng cánh tay mực vẫn bị khác so với các vùng khác".
- Màu dưới nách: vùng bị tay che ở cả 4 ảnh trước đây lấy đại ảnh gần nhất (không kiểm che khuất) → dính màu tay áo / nền.
  `bake.py`: điểm không ảnh nào thấy rõ để trống rồi loang màu từ vùng áo bên cạnh. 252 KB.
- Tay khi đi (`web/src/player/autoRig.ts`, `glbCharacter.ts`): đo mặt cắt model → vai 53 % H / 17 % W, bàn tay xuống tới
  26 % H, mép thân xoè 17 → 25 % W. Trước: vùng "tay" bỏ sót bàn tay (bàn tay đứng yên, tay áo kéo giãn) + khớp vai đặt
  theo tỉ lệ đoán. Nay: tay = phần ngoài ranh giới chéo vai → mép thân, gồm bàn tay; vung 0,28 rad (trước 0,5), khép vào
  thân 0,05 rad khi đi.
- Ảnh kiểm: Canvas 3D `?nhan-vat=glb&di=0&pha=1.57` / `4.71` (chụp trong phiên, không lưu).

## 2026-11-12.5 — Nhân vật: nướng texture trộn 4 góc (hết lem mặt, màu áo đều)

- Loại: tài nguyên 3D — **ngoại hình** nhân vật. Người dùng báo (kèm ảnh): "vẫn còn các màu mực lem không đồng nhất
  ngoài ra mặt cũng lem".
- Nguyên nhân: `model:paint --4goc` cho mỗi tam giác lấy MỘT ảnh → má / thái dương lấy nhầm tóc, tai của ảnh nghiêng;
  chỗ chuyển góc lộ đường nối; ảnh render có sẵn bóng đổ khác nhau từng góc.
- Sửa (`tai-nguyen/scripts/bake.py`): trải UV riêng (xatlas), mỗi điểm texture trộn 4 ảnh theo max(0, n·hướng)⁴, bỏ ảnh
  mà điểm bị che (bộ đệm độ sâu từng góc), lan màu ra rãnh UV, texture JPEG; nén `model:clean` → **273 KB** (trước
  1,24 MB), 16 000 tam giác, 1 draw call. Thử thêm bản ép bảng màu (`--bang-mau`): mặt lem hơn (da tối bị ép sang màu
  tóc) → không dùng.
- Ảnh: `screens/Model-nhan-vat.png` (cận trước · nghiêng trái · sau · nghiêng phải · đang bước).
- File: `models/nhan-vat.glb`, `models/anh/nhan-vat-atlas.png` (texture đã nướng), `models/LICENSES.md`.

## 2026-11-12.4 — Nhân vật dựng từ bộ ảnh 4 góc (Hunyuan3D-2mv) + tô màu chiếu 4 phía

- Loại: tài nguyên 3D — **ngoại hình** nhân vật. Đáp phiếu `2026-11-12-anh-nhan-vat-3d` (đợt 1) bằng bộ ảnh mục .3.
- Phiên VS Code (`/tai-nguyen`): `mv_gen.py` Hunyuan3D-2mv-turbo (tải lần đầu ~7 phút), 3 seed (1234 · 7 · 42), octree 384
  (~880 nghìn mặt, 15 s / bản) → `smooth.py` 16 000 tam giác → `model:paint --4goc` (atlas 2 × 2 1024², mỗi tam giác
  lấy ảnh phía nó quay về) → chọn seed 1234. 1,24 MB, 1 draw call; gắn xương + đi / đứng như cũ.
- Kết quả: màu sạch cả 4 phía (lưng, hông, gáy có dây buộc búi), ngọc bội xanh đúng chỗ, hình đúng tỉ lệ ảnh. Còn: mặt
  cận cảnh hơi lốm đốm (ảnh trước 512 px trong atlas + bóng đổ sẵn của bản render); gấu áo tách nhẹ khi bước dài.
- Ảnh: `screens/Model-nhan-vat.png` (trước · trái · sau · phải · cận mặt).
- File: `models/nhan-vat.glb`, `models/anh/nhan-vat-atlas.png`, `models/LICENSES.md`.

## 2026-11-12.3 — Bộ ảnh nhiều góc của nhân vật chính (đầu vào Hunyuan3D đa góc)

- Loại: tài nguyên 3D — ảnh đầu vào (không phải giao diện).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-12-anh-nhan-vat-3d.md` (đợt 1 — nhân vật chính; đợt 2 Tiểu Mặc chưa làm).
- Cách làm: phiên thiết kế không tạo được ảnh render → dựng tờ khung `NhanVat-bo-anh` (5 ô, vạch đỉnh / đất, bảng kiểm,
  8 màu) + câu lệnh Gemini từng góc; người dùng tạo 5 ảnh bằng Gemini (đính kèm `anh/nhan-vat.webp`, cùng một cuộc trò
  chuyện); phiên thiết kế soát + chuẩn hoá.
- Câu lệnh chung (dán trước mỗi góc): render 3D đồ chơi vinyl, ánh sáng studio mềm, không nét viền / cel; chiếu thẳng ngang
  ngực; tư thế chữ A (tay chéo xuống ≈ 35°, tay áo không chạm thân, hai chân hơi tách); nền #DDDDDD trơn, không bóng đổ,
  không chữ / logo / watermark; 1024², đỉnh búi 10 %, đế 90 %; màu + trang phục theo phiếu (vạt trái đè phải, ngọc bội
  hông trái). Riêng góc: trước · profile 90° thấy bên TRÁI (mặt quay sang trái ảnh) · sau · profile 90° thấy bên PHẢI ·
  cận đầu + cổ.
- Soát: đúng kiểu render, không nét viền; vạt trái đè phải (trước, cận mặt); ngọc bội thấy ở ảnh trái, không có ở ảnh
  sau, ló nhẹ ở mép trước ảnh phải (chấp nhận — ngọc treo mép trước hông); trâm ngang búi → ở hai ảnh nghiêng chỉ thấy
  một chấm vàng (đúng). Chiều cao 4 góc gốc 863–865 px (Gemini giữ cỡ đều).
- Chuẩn hoá: nền trơn #DDDDDD (tô loang từ mép, ngưỡng 22), xoá dấu sao Gemini góc phải dưới, đỉnh búi → 10 %, đế ủng →
  90 %, trục thân (tâm ngang phần ủng) → giữa ảnh; ảnh cận mặt chỉ đổi nền + xoá sao.
- File: `models/anh/nhan-vat-truoc.png`, `-trai.png`, `-sau.png`, `-phai.png`, `-mat.png` · `screens/NhanVat-bo-anh.png`
  (5 góc cạnh nhau, có vạch) · `source/NhanVat-bo-anh.dc.html`, `source/canvas.json` · `models/LICENSES.md` (bảng ảnh
  đầu vào). Ảnh gốc Gemini tên tiếng Việt trong `models/anh/` **không** đưa vào repo.
- Luật: không chạm (ngoại hình nhân vật; cỡ 2,1 m, va chạm, tốc độ không đổi).
- Việc tiếp (phiên VS Code, `/tai-nguyen`): dựng lại `nhan-vat.glb` bằng Hunyuan3D-2 bản đa góc (trước / trái / sau /
  phải) + `model:paint` chiếu 4 phía — hết loang màu hông / lưng. Ảnh `mat` để vẽ mặt sắc nét.

## 2026-11-12.2 — Nhân vật AI mịn hơn (octree 384 + làm mịn Taubin + 16 000 tam giác)

- Loại: tài nguyên 3D — **ngoại hình** nhân vật. Người dùng không chọn bản chibi dựng code ("vẫn muốn dùng theo như ban
  đầu của hunyuan nhưng nâng cấp lên cho mịn"). Bản mẫu chibi giữ trong code (`?nhan-vat=chibi`, Canvas 3D mặc định)
  để so.
- Đổi: tạo lại seed 1234 với octree 384 (505 nghìn mặt thô) → `smooth.py` (PyMeshLab Taubin + quadric) 16 000 tam giác →
  `model:paint` với atlas gom 32 màu. 593 KB, 1 draw call. Ngân sách nhân vật trong quyết định 0003: 10 000 → 16 000.
- Còn: màu áo vài mảng loang, ngọc bội nhạt — giới hạn của chiếu ảnh 1 mặt. Đúng hẳn: tô màu thật của Hunyuan
  (Hunyuan3D-Paint) — cần NVIDIA CUDA Toolkit (MSVC đã có).
- Ảnh: `screens/Model-nhan-vat.png` (trước · nghiêng · sau · đang bước).

## 2026-11-12.1 — Nhân vật chính bằng model AI (Hunyuan3D)

- Loại: tài nguyên 3D (model) — **ngoại hình** nhân vật người chơi. Không chạm luật (cỡ, va chạm, tốc độ giữ nguyên:
  `glbCharacter` co về cao 2,1 m như đệ tử khối, va chạm vẫn bán kính 0,5).
- Người dùng đưa ảnh đệ tử (tạo bằng Google Gemini từ câu lệnh của skill), phiên VS Code chạy `/tai-nguyen`: Hunyuan3D-2
  mini-turbo seed 1234 → `model:clean` 9 500 tam giác → `model:paint` (chiếu ảnh trước / sau) → `models/nhan-vat.glb`
  (439 KB, 1 draw call — đệ tử khối ~25). Tiểu Mặc (tờ thiết kế của người dùng) giữ làm **NPC** — chưa dựng.
- Hạn chế: lưng áo mang hoạ tiết mặt trước (vạt chéo, ngọc bội); cạnh đầu có vệt xám nhỏ; chưa có động tác thật (app
  nhún khi đi). Muốn đẹp hơn: bật tô màu của Hunyuan (cần MSVC) hoặc ảnh nhìn sau.
- Ảnh: `screens/Model-nhan-vat.png` (đệ tử khối · trước · chếch · sau). Canvas 3D: `?nhan-vat=khoi` xem lại bản khối.
- File: `models/nhan-vat.glb`, `models/anh/nhan-vat.webp`, `models/anh/nhan-vat-atlas.png`, `models/LICENSES.md`.

## 2026-11-11.11 — Phóng tông môn ×1,6 + kiến trúc cao ×1,6 (heightScale)

- Loại: cảnh 3D — **bố cục** (toàn cảnh ×1,6) + **ngoại hình** (kiến trúc cao). Người dùng nhờ phiên VS Code (`/canh`)
  đặt hệ số và chốt bố cục ×1,6 đã sửa sẵn trong máy (chưa từng commit).
- Trường đổi (`scene.json`):
  - **Mới** `buildingStyle.heightScale`: (không có = 1) → **1,6** — nền, cột, tường thân, cửa, mái, tầng tháp, cổng sơn
    môn cao ×1,6; bậc (thêm bậc), lan can, biển, đèn lồng giữ cỡ người. Code: `8037d76`.
  - Bố cục ×1,6: toạ độ + kích thước nhà, cổng, ao, lối đá, đồ trang trí, giếng, khu (`site.areas`), tường (`half` 21 →
    33,6, đoạn tường, khe cổng 4 → 6,4), địa hình (bục, đỉnh, bậc đá, mép vực), núi xa, biển mây, đảo nổi, điểm xuất
    phát (0; 50) → (0; 80), sương ×1,6.
  - Khác ×1,6: tường cao 2,6 → **4,5**; camera ×1,36–1,41; cây ×1,4; thêm `scale` cho 5 đồ trang trí; thứ tự Văn Tháp /
    Chưởng Môn Điện trong `buildings` đổi chỗ (không đổi nhà).
- Nội thất (code tự theo phòng): giảng đường 20,8 × 11,2 — bảng 6,4 × 2,56 m, bục 9,6 m, 24 án thư (6 × 4), 5 bậc, nền
  0,96 m; thư viện 11,2 × 9,6 — kệ bên 6,6 m + 2 kệ đứng. Cổng trăng thu cho vừa tường 4,5 m: đỉnh vòm 3,9 m, lối đi 3,9 m.
- Luật: ví dụ toạ độ `R-VUNG-1/2`, `R-VA-1/3`, `R-HUD-1/3` đã được phiên code cập nhật theo bố cục này (`8037d76`, đồng
  bộ online, chờ xác nhận) — không lệch.
- `scene:check`: **Không có lỗi** (hệ số 1,6 · tường ±33,6 cao 4,5 · vùng lop-hsk3 (0; −20,9) r 1,8, thu-vien (−20; 6,4) r 1,6).
- Hiệu năng (Canvas 3D): trên xuống **140 draw call** · góc chơi Sơn Môn 127 — ≤ 150. Tam giác **~181k > 150k** (đã vượt
  trước khi tăng chiều cao — địa hình 480 m ô 3 m + bố cục ×1,6; việc này chỉ thêm ~3–4k). Đề xuất: `/lead` giảm tam
  giác (ô địa hình lớn hơn ở rìa, cỏ / đá thưa hơn).
- Cần code: không.
- Canvas 3D: phiên bản 16 (https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so).
- Ảnh (`?chup`): `screens/Canh-giang-duong.png` (chụp lại, cao ×1,6), `Canh-giang-duong-trong.png`, `Canh-thu-vien-trong.png`,
  `Canh-cong-bac.png` (chụp lại, cổng trăng vừa tường), `Canh-son-mon.png`.
- File: `scene/scene.json`, `screens/Canh-*.png`.

## 2026-11-11.10 — Màn bài học (Flutter native) theo chất liệu C

- Loại: giao diện (màn mới) · chuỗi. Người dùng nhờ phiên VS Code làm thay phiên thiết kế; người dùng duyệt trên canvas
  rồi "chốt".
- Màn: **Màn bài học** — mục mới trong `docs/screen_specs.md`. Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-10-man-bai-hoc.md`.
- Artboard (`source/`): vẽ lại `BaiHoc-doc`, `BaiHoc-ngang`, `BaiHoc-doc-chu-dai` (bản bảng đen cũ từ trước HUD C bỏ)
  theo chất liệu C: nền sương + núi như màn tải, thẻ lụa, chữ Hán `jade`, pinyin `lacquer`, nút chính `jade`.
  `canvas.json` không đổi (đã có ba mục này).
- Token: không thêm — dùng `jade`, `slate`, `lacquer`, `gold` (chỉ chấm), `frost-strong`, `frost-outline`, `mist*`,
  `radius.card`, `radius.button`, `shadow.card`, `shadow.primary`. Token `board*`, `ink` (bảng bài học HTML) giữ cho bản
  web chạy trong trình duyệt thường (không có Flutter → vẫn bảng HTML).
- Chuỗi mới (`l10n/vi.arb`): `lessonEyebrow` "Bài học chữ Hán", `lessonBack` "Ra sân".
- Luật: `R-VUNG-3` (đứng yên khi học, "Ra sân" → đi lại được, nút học vẫn hiện), `R-MAN-1` (xoay tự do, vùng an toàn)
  — thiết kế theo đúng, không đổi luật.
- Ảnh: `screens/BaiHoc-doc.png`, `BaiHoc-ngang.png`, `BaiHoc-doc-chu-dai.png` (chụp màn Flutter đã áp).
- File: `source/BaiHoc-*.dc.html`, `docs/screen_specs.md`, `l10n/vi.arb`, `screens/BaiHoc-*.png`.

## 2026-11-11.9 — Cổng trăng tường bắc Ngoại Môn

- Loại: cảnh 3D — **bố cục** (tường). Người dùng chốt mở cổng (đề xuất ở mục .6), nhờ phiên VS Code làm thay.
- Trường đã đổi: `walls.gates` +1 `{ side: "bac", at: 0, width: 4 }` → trục nam – bắc liền Sơn Môn → Ngoại Môn →
  Thiên Bậc → Nội Môn.
- Luật chạm: **`R-VA-1`** — đã sửa ví dụ trong sổ (đi lên bắc ở x = 6 thì dừng ở z = −20,0; ở x = 0 thì qua cổng bắc),
  chép lên tài liệu online (ô Xác nhận vẫn Chờ), `--mark-synced R-VA-1`. Kiểm bằng script với code app: x = 6 dừng ở
  −20,00; x = 0 qua cổng, leo hết Thiên Bậc lên bục Nội Môn (cao 11).
- `npm run scene:check`: **Không có lỗi**.
- Ảnh: `screens/Canh-cong-bac.png`.
- File: `scene/scene.json`, `screens/Canh-cong-bac.png`.

## 2026-11-11.8 — Núi xa rộng chân, có đỉnh phụ

- Loại: cảnh 3D — **ngoại hình** (núi xa). Không chạm luật.
- Người dùng nhờ phiên VS Code làm thay phiên thiết kế. Code: trường mới `farMountains.layers[].width` / `spurs`
  (mặc định 1 / 0 = hình cũ) — đáp "Cần code" của mục .5.
- Trường đã đổi (cũ → mới): lớp 1 (r 170) width — → **1,8**, spurs — → **1** · lớp 2 (r 240) width **2**, spurs **2** ·
  lớp 3 (r 330) width **2,2**, spurs **2**.
- `npm run scene:check`: **Không có lỗi**. Draw call không đổi (núi xa vẫn 1 lưới).
- Ảnh: `screens/Canh-nui-xa.png` (nhìn từ mép vực nam ra ngoài).
- File: `scene/scene.json`, `screens/Canh-nui-xa.png`.

## 2026-11-11.7 — Hậu Sơn (thác, suối, ao) + Chưởng Môn Điện trên Nội Môn

- Loại: cảnh 3D — **bố cục** (2 bục Hậu Sơn, 2 ao, nhà mới trên bục Nội Môn, khu mới) + **ngoại hình** (thác, suối) ·
  chuỗi (tên nhà, tên khu).
- Người dùng nhờ phiên VS Code làm thay phiên thiết kế. Code: commit `e3a1deb` (B6b — nhà theo độ cao mặt đất, thác / suối).
- Trường đã đổi (cũ → mới):
  - `terrain.plateaus` +2 (không lát, kè dựng đứng blend 1): **đầu thác** x 36…48 z −84…−77 y 15 · **đầm chân thác**
    x 34…50 z −75…−66 y 4.
  - `terrain.waterfalls` (mới): (42; −76) từ y 15 xuống y 4, rộng 3.
  - `terrain.streams` (mới): suối rộng 1,6 qua (42; −66) → (46; −58) → (44; −48) → (50; −38) → (47; −26), chảy về phía
    Diễn Võ Trường.
  - `water` +2: đầm chân thác (42; −71) 8 × 5 · vũng đầu thác (42; −80,5) 4 × 3.
  - `buildings` +1: **Chưởng Môn Điện** `chuong-mon-dien`, kiểu `dien`, (0; −64) 12 × 8, mái vàng `#c9a13b` — trên bục
    Nội Môn y 11, cuối Thiên Bậc. Không có vùng học (chưa có nội dung).
  - `site.areas` +1: **Hậu Sơn 後山** x 32…56 z −88…−60.
- `R-VA-1` / `R-VUNG-1`: Ngoại Môn, tường, vùng học, điểm xuất phát **không đổi** → ví dụ hai luật vẫn đúng. Nhà mới có
  va chạm (như mọi nhà); ao mới chặn đi như ao cũ (`R-VA-1`).
- `npm run scene:check`: **Không có lỗi** (ao, điện, bục đều trên đất phẳng).
- Draw call (Canvas 3D): trên xuống **141** (≤ 150) · Hậu Sơn 26 · Nội Môn 31; ~126k tam giác.
- **Cần code**: núi xa đỉnh rộng chân hơn (từ mục .5). Đề xuất mở cổng tường bắc (mục .6) vẫn chờ người dùng.
- Ảnh: `screens/Canh-tren.png` (chụp lại), `Canh-hau-son.png`, `Canh-chuong-mon-dien.png` (mới).
- File: `scene/scene.json`, ba ảnh trên.

## 2026-11-11.6 — Thiên Bậc + bục Nội Môn, cỏ búi, đá rải, chữ Hán tên khu

- Loại: cảnh 3D — **bố cục** (bục Nội Môn mới, bậc đá, 2 khu mới) + **ngoại hình** (cỏ, đá) · chuỗi (chữ Hán tên nơi / khu).
- Người dùng nhờ phiên VS Code làm thay phiên thiết kế (quy trình `/ui-design canh`). Code bậc / cỏ / đá: commit `67c5b43`.
- Trường đã đổi (cũ → mới):
  - `terrain.plateaus` +1: **bục Nội Môn** x −14…14, z −71…−56, **y 11**, lát gạch, blend 3 (tạc vào sườn chủ phong).
  - `terrain.stairs` (mới): **Thiên Bậc** (0; −24) → (0; −57), rộng 4 — từ ngay ngoài tường bắc Ngoại Môn lên bục Nội
    Môn, cao ≈ 11 m trên 33 m (dốc ≈ 18°, ~61 bậc 0,18 m).
  - `terrain.grass` (mới): 6 búi / 100 m², `#6f8c50` / `#93ad66`. `terrain.rocks` (mới): 4 tảng / 1000 m², `#8d8a84`.
  - `site.han` "文淵宗"; `site.areas[].han`: Sơn Môn 山門 · Ngoại Môn 外門 · Diễn Võ Trường 演武場 · Đệ Tử Cư Xá 弟子居 · Linh
    Dược Viên 靈藥園 · Luyện Đan Phòng 煉丹房; khu mới **Thiên Bậc 天階** x −6…6 z −56…−23, **Nội Môn 內門** x −14…14
    z −71…−56 (cho chip `R-HUD-1` + thẻ tên khu `R-HUD-3` + màn tải `R-MAN-2` của HUD C).
- Lối tới Thiên Bậc: tường bắc Ngoại Môn **vẫn liền** (giữ ví dụ `R-VA-1`) → đi vòng qua cổng tây, men ngoài tường lên
  chân bậc. Đề xuất (cần người dùng quyết + sửa ví dụ `R-VA-1`): mở cổng trăng giữa tường bắc (`walls.gates` bắc, at 0,
  rộng 4) để trục nam – bắc liền Sơn Môn → Ngoại Môn → Thiên Bậc → Nội Môn.
- `npm run scene:check`: **Không có lỗi** (bậc dốc ≤ 35°, không vật nào trên đất dốc). Vùng học không đổi.
- Draw call (Canvas 3D): trên xuống **135** (sau khi HUD C gộp khối thầy) · Thiên Bậc 34; ~124k tam giác.
- **Cần code**: nhà trên bục cao khác 0 (Chưởng Môn Điện / Tàng Kinh Các trên Nội Môn — nhà hiện luôn đặt ở y 0); suối /
  thác Hậu Sơn (B6b); núi xa đỉnh rộng chân hơn (từ mục .5).
- Canvas 3D (phiên bản 10): https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so
- Ảnh: `screens/Canh-tren.png` (chụp lại), `Canh-thien-bac.png` (mới).
- File: `scene/scene.json`, `screens/Canh-tren.png`, `screens/Canh-thien-bac.png`.

## 2026-11-11.5 — Bật địa hình: cao nguyên giữa biển mây, chủ phong, núi xa

- Loại: cảnh 3D — **ngoại hình** (địa hình, núi xa, biển mây, sương) + **bố cục** nhỏ (dời 5 cụm cây rìa cảnh vào
  trong mép vực). Nhà, tường, cổng, ao, giếng, vùng, điểm xuất phát **không đổi** (mọi khu nằm trên bục phẳng y = 0).
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-11-dia-hinh.md`; hồ sơ `docs/tham_khao/dia-hinh-tong-mon.md` (hướng A).
- Người dùng nhờ phiên VS Code làm thay phiên thiết kế (theo đúng quy trình `/ui-design canh`).
- Trường đã đổi (cũ → mới):
  - `fog` near 45 → **60**, far 140 → **260** (thấy chủ phong + mép vực).
  - `terrain` (mới, bật): tâm (0; −5), 300 m, ô 2,5 m; **6 bục lát gạch y 0** phủ đủ 6 khu (Ngoại Môn ±22, Sơn Môn
    x −7…7 z 21…57, Diễn Võ x 26…61 z −16…16, Cư Xá x 26…61 z 20…46, Linh Dược x −63…−26 z −16…21, Luyện Đan x −63…−26
    z −43…−20), blend 5; **6 đỉnh**: chủ phong (0; −82) r 48 cao 42, hai núi phụ (−38; −92) r 30 cao 24 · (42; −88)
    r 32 cao 28, đồi (88; −30) cao 12 · (−92; 28) cao 10 · (70; 72) cao 7; nhiễu cao 1,2 m; mép vực bán kính 105,
    rộng 15, xuống y −30, lượn 8; màu cỏ `#7d9a5a` `#8aa864` `#6f8c50`, đất `#9c8466`, đá `#8d8a84`, đá cao `#a29d93`
    từ y 24; dốc đất 20°, dốc đá 35°.
  - `farMountains` (mới): chân y −40; 3 lớp — r 170 cao 38 `#4f6b66` 7 đỉnh · r 240 cao 62 `#6d8790` 9 đỉnh · r 330
    cao 88 `#93a7b2` 11 đỉnh.
  - `cloudSea` (mới): r 420, y −8, `#f4f1ea`.
  - `trees.groves`: 4 cụm rìa đông / tây (tùng, mai) x ±80/±82 → **±78**, z 10 → **8**, sâu 120 → **80**; cụm tùng phía
    bắc (0; −62) rộng 150 → **130** (cây bám sườn chủ phong, không đặt trên vách vực).
- `npm run scene:check`: **Không có lỗi** (không vật nào nằm trên đất dốc). Vùng `lop-hsk3` (0; −12,2) r 1,8 ·
  `thu-vien` (−12,5; 4) r 1,6 — trong nhà, không đổi.
- Draw call (Canvas 3D, không tính lớp phủ): trên xuống **149** · góc chơi 139 · nhìn về bắc 117 · từ mép vực 11;
  ~114k tam giác. **Sát ngân sách 150** — xem "Cần code".
- Luật: `R-VA-1` ví dụ đúng (bục Ngoại Môn phủ ±22, tường bao không đổi). `R-VA-2` (dốc 35°, mép vực) có hiệu lực
  từ mục này. `R-VUNG-1` không đổi.
- **Cần code**:
  1. Giảm draw call: gộp khối **thầy** (đệ tử dựng ~25 khối, chưa gộp) và gộp chung mái mờ hai nhà nếu được — đợt
     "vào trong nhà" thêm ~45 draw call.
  2. Núi xa: đỉnh rộng chân hơn, có đỉnh phụ (độ rộng đỉnh đang cố định 0,06–0,26 rad trong `farMountains.ts`) — nhìn
     từ mép vực vẫn hơi nhọn như băng.
  3. Kế hoạch B6: bậc đá lên chủ phong (khu 7 Thiên Bậc), suối / thác Hậu Sơn, cỏ búi + đá rải; bục ở độ cao khác 0
     (lối lát dốc theo).
- Canvas 3D (phiên bản 9): https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so
- Ảnh: `screens/Canh-tren.png`, `Canh-ca-san.png` (chụp lại), `Canh-chu-phong.png`, `Canh-mep-vuc.png` (mới).
- File: `scene/scene.json`, `screens/Canh-*.png`.

## 2026-11-11.4 — Vào bên trong kiến trúc: nội thất + nút học nổi, bỏ thẻ mời

- Loại: giao diện · cảnh 3D (**bố cục** — nhà vào được) · luồng/luật (đã đổi ở phiên code) · chuỗi.
- Màn / thành phần: **Trong nhà** (mục mới trong `docs/screen_specs.md`), **nút học nổi trên vật** (thành phần mới);
  HUD C bỏ **thẻ mời** (`HUD-doc`, `HUD-ngang`, `HUD-doc-the-dai` vẽ lại không có thẻ).
- Yêu cầu: người dùng "không muốn lại gần kiến trúc thì hiện bảng vào nghe giảng, mà có thể vào bên trong" — chọn:
  liền mạch (không chuyển cảnh) · chạm bảng / thầy / kệ sách để học · làm trước giảng đường + thư viện.
- Thứ tự: canvas đề xuất → phiên code làm trước (`b3c4cf3`, kế hoạch `docs/tasks/2026-11-11-vao-trong-kien-truc.md`)
  → mục này chốt thiết kế theo đúng code (ảnh chụp từ Canvas 3D bản code đó).
- Artboard (`source/`): mới `NoiThat-mat-bang`, `TrongNha-doc`, `TrongNha-ngang`; sửa `HUD-doc`, `HUD-ngang`,
  `HUD-doc-the-dai` (bỏ thẻ mời + nhãn "tiêu đề thử độ dài"); `canvas.json`.
- Cảnh 3D: **bố cục** — giảng đường, thư viện thành nhà rỗng có cửa giữa (2,4 m · 2 m), nội thất theo mặt bằng. Không
  đổi `scene.json` (nhà vào được suy từ `ZONE_CONTENT[].interior`; `zone.front` / `r` không còn tác dụng với hai nhà
  này). `npm run scene:check`: **Không có lỗi**. Draw call theo phiên code 91–92 (thư viện 81) ≤ 150.
- Luật (đã sửa sổ ở phiên code, chờ xác nhận online): `R-VUNG-1/2/3` (vật học, chạm vật, đứng yên khi học), `R-VA-3`
  (mới, va chạm trong nhà), `R-HUD-1` (chip tên nhà), `R-HUD-2` (mới, mái mờ + camera trong nhà). Thiết kế theo đúng.
- **Sửa mục 2026-11-11.3**: đề xuất luật thẻ tên khu đổi mã `R-HUD-2` → **`R-HUD-3`** (mã `R-HUD-2` đã dùng cho mái mờ);
  thêm "không hiện khi bước vào / ra một nhà"; bỏ điều kiện "đang hiện thẻ mời". Đặc tả HUD bỏ phần thẻ mời. Token thẻ
  mời (`card-title`, `radius.card` cho thẻ mời, `secondary-bg`) vẫn dùng cho thẻ tên khu / để dành — không xoá.
- Chuỗi mới (`l10n/vi.arb`): `lessonActionLearn` "Học chữ", `lessonActionReview` "Ôn chữ", `roomGiangDuong`,
  `roomThuVien`. Chuỗi thẻ mời ("Tùng tùng tùng! Giờ giảng", "Vào nghe giảng", "Để sau", "Thư viện đang mở", "Vào đọc
  sách") đã bỏ khỏi code.
- Phiếu: `2026-11-11-hud-lam-lai.md` (thành phần 6 thẻ mời → nút học).
- **Cần code**: không có thêm. Khi áp HUD C (`/ui-apply`), nút học nổi đổi đúng kiểu ở mục "Trong nhà" nếu đang lệch.
- Ảnh: `screens/NoiThat-giang-duong-doc.png` (585 × 1266), `screens/NoiThat-thu-vien-ngang.png` (844 × 390) — chụp
  Canvas 3D (`?nv=0.8,-11&cam=3.4,5.2,-5.4&tam=-0.4,-13.6` · `?nv=-12.3,5&cam=-9.4,4.6,3.4&tam=-14.8,4.4`).
- File: `source/NoiThat-mat-bang.dc.html`, `source/TrongNha-*.dc.html`, `source/HUD-doc.dc.html`,
  `source/HUD-ngang.dc.html`, `source/HUD-doc-the-dai.dc.html`, `source/canvas.json`, `docs/screen_specs.md`,
  `docs/components.md`, `l10n/vi.arb`, `screens/NoiThat-*.png`.

## 2026-11-11.3 — HUD làm lại: hướng C "ngọc bích · lụa" + thẻ tên khu + màn tải

- Loại: token · chuỗi · giao diện · luồng/luật (đề xuất luật mới).
- Màn / thành phần: toàn bộ HUD (chip tên khu, nút góc nhìn, thẻ mời, nhãn tên, dòng hướng dẫn, joystick, fps) ·
  **thẻ tên khu** (mới) · **màn tải** (mới). Đặc tả: `docs/screen_specs.md` mục "HUD", "Thẻ tên khu", "Màn tải".
- Phiếu đáp ứng: `docs/phieu_thiet_ke/2026-11-11-hud-lam-lai.md` (bước 1: 3 hướng A/B/C → người dùng chọn **C**;
  bước 2: vẽ đủ).
- Artboard (`source/`): `HUD-doc`, `HUD-doc-vao-khu`, `HUD-doc-the-dai`, `HUD-ngang`, `HUD-ngang-vao-khu`,
  `HUD-thanh-phan`, `ManTai-doc`, `ManTai-ngang`. Bản phác `HUD-A-giay-do`, `HUD-B-go-son`, `HUD-C-ngoc-bich` chỉ để
  lưu — **không áp**. `canvas.json` có cả mục `BaiHoc-*` (vẽ trước, chưa chốt — sẽ vẽ lại theo chất liệu C, file
  chưa xuất).
- Token (`tokens/design_tokens.json`):
  - Đổi: `gold` #E0AE4C → **#D4A64A**, `lacquer` #B5352B → **#A8322A** (thống nhất với cảnh), `scene-bg` #141B2C →
    **#E9EEEC**, `fontSize.card-title` 17 → 18, `radius.card` 14 → 16, `shadow.card` → 0 12px 32px rgba(36,50,58,.22).
  - Mới: `slate` #24323A, `jade` #2B5446, `on-jade`, `frost` / `frost-strong` / `frost-weak` / `frost-line` /
    `frost-outline`, `secondary-bg`, `mist` / `mist-far` / `mist-near`; `fontSize.area-han` / `area-name` /
    `loading-han` / `loading-title`; `radius.button` 12; `shadow.hud`, `shadow.primary`; `blur.*`; `layout.hud-inset`.
  - Thôi dùng sau khi áp (ghi chú "HUD cũ"): `ink-2`, `hud-glass`, `gold-line`, `paper-line`, `muted`, `label-text`,
    `online`. `ink`, `board*` giữ cho bảng bài học tới mốc 3.
- Chuỗi mới (`l10n/vi.arb`): `siteHan` 文淵宗, `areaHan*` (外門 山門 演武場 弟子居 靈藥園 煉丹房), `loadingStatus`
  "Đang mở sơn môn… {percent}%"; ghi lại `camNear`, `camYard`, `joyHint` (đã có trong code).
- Chữ Hán: dùng **Noto Serif SC** (không thêm font thư pháp → không cần cắt font).
- Luật bị chạm:
  - `R-HUD-1`, `R-DIEU-1`, `R-VUNG-2`, `R-VUNG-3`, `R-MAN-1`: không đổi — thiết kế theo đúng.
  - **Đề xuất luật mới `R-HUD-2`** (phiên code hỏi người dùng rồi ghi sổ): "Khi nhân vật bước từ ngoài vào một khu,
    hoặc từ khu này sang khu khác, giữa màn hiện thẻ tên khu (chữ Hán + tên Việt) khoảng 2 giây rồi mờ dần; ra khỏi
    mọi khu thì không hiện; đang hiện thẻ mời thì không hiện thẻ tên khu. Thẻ không chặn chạm." Ví dụ: đi từ (0; 30)
    Sơn Môn vào (0; 0) Ngoại Môn → hiện 外門 · Ngoại Môn; đi từ (0; 0) ra (24; 0) ngoài mọi khu → không hiện.
  - **Đề xuất luật mới `R-MAN-2`**: "Mở app thì màn tải che tới khi cảnh 3D hiện khung hình đầu tiên, rồi mờ dần;
    người chơi không điều khiển được trong lúc màn tải còn hiện."
- **Cần code** (phiên code):
  1. Đặc tả cảnh: thêm trường tuỳ chọn `site.areas[].han` (chữ Hán khu) + `site.han` (chữ Hán nơi), mặc định rỗng
     → thẻ tên khu chỉ hiện tên Việt. Phiên thiết kế điền vào `scene.json` sau khi có trường.
  2. Thẻ tên khu: dùng `AreaTracker` có sẵn, phát khi đổi khu.
  3. Màn tải: phần tử che trong lúc dựng cảnh; tiến trình thật hoặc giả tới 90 %.
  4. Ẩn fps khi không ở chế độ gỡ lỗi.
  5. `backdrop-filter` có thể không chạy / nặng trên WebView Android cũ → phát hiện, bỏ blur, giữ nền frost.
- Ảnh: chưa có ảnh (phiên code dùng `source/*.dc.html`).
- File: `source/HUD-*.dc.html`, `source/ManTai-*.dc.html`, `source/canvas.json`, `tokens/design_tokens.json`,
  `docs/screen_specs.md`, `docs/components.md`, `l10n/vi.arb`.

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
