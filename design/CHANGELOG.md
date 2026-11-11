# Nhật ký thiết kế

Mỗi lần chốt một mục, mới nhất ở trên. Mã `<YYYY-MM-DD>.<số>`. Mỗi mục: loại (token · chuỗi · giao diện ·
luồng/luật · dữ liệu), màn / thành phần, phiếu đáp ứng (nếu có), file đổi.

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
