# Nhật ký thiết kế

Mỗi lần chốt một mục, mới nhất ở trên. Mã `<YYYY-MM-DD>.<số>`. Mỗi mục: loại (token · chuỗi · giao diện ·
luồng/luật · dữ liệu), màn / thành phần, phiếu đáp ứng (nếu có), file đổi.

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
