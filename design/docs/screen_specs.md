# Đặc tả màn

Mỗi màn đã vẽ trên canvas một mục `## <Màn>` — `/ui-apply` chỉ đọc đúng mục của màn đang áp. Màn chưa có ở đây
thì vẫn theo code (`/ui-apply kiem` bỏ qua).

Mẫu một mục:

```markdown
## <Màn> · artboard `<Tên>.dc.html` · từ mục <mã CHANGELOG>

- Mục đích: …
- Mở khi / đóng khi: … (luật `R-…`)
- Bố cục dọc 390×844: … · ngang 844×390: …
- Trạng thái đã vẽ: bình thường · …
- Số đo: lề, khoảng cách, cỡ chữ (theo token)
- Chuỗi: khoá → chữ
- Ảnh: `screens/<Màn>-doc.png`, `screens/<Màn>-ngang.png`
```

## HUD (lớp nổi trên cảnh 3D) · artboard `HUD-doc.dc.html`, `HUD-ngang.dc.html` · từ mục 2026-11-11.3

- Mục đích: chữ và nút nổi trên cảnh khi chơi. **Một chất liệu cho cả bộ — hướng C "ngọc bích · lụa"**: kính mờ
  trắng sương (`frost*`) + blur, viền trong 1 px `frost-line`, viền ngoài 1 px `frost-outline`; chữ `slate`, nhấn
  `jade`; hoạ tiết duy nhất là chấm vàng `gold` (5–6 px). Thay toàn bộ HUD cũ (chip kính tối, thẻ gỗ, nhãn vàng).
- Artboard: `HUD-doc` (Ngoại Môn, thẻ mời, lần đầu có hướng dẫn) · `HUD-doc-vao-khu` (thẻ tên khu, joystick đang
  giữ) · `HUD-doc-the-dai` (tiêu đề thẻ 2 dòng, tên khu dài nhất, "cả sân") · `HUD-ngang` (tai thỏ trái) ·
  `HUD-ngang-vao-khu` (tai thỏ phải) · `HUD-thanh-phan` (mọi thành phần trên nền trời sáng `#A9C8E8` và tường vôi
  `#EEE9DF`). `HUD-A/B/C-*` chỉ là bản phác 3 hướng — không áp.
- Bố cục dọc 390×844 (safe trên 47, dưới 34):
  - Chip tên khu: trái 16, trên safe + 12; cao 36, pill, padding 0 14 0 12, chấm vàng 6 px + chữ 13/700 `slate`,
    phần " · <khu>" màu `jade`; không xuống dòng (tên dài nhất "Văn Uyên Tông · Linh Dược Viên" vẫn một dòng).
  - Nút góc nhìn: phải 16, trên safe + 8; cao 44, pill, padding 0 16, chữ 13/700.
  - Thẻ mời: trái/phải 16, trên safe + 68 (ngay dưới hàng chip); padding 18, `radius.card` 16, `frost-strong`,
    `shadow.card`, gap 10. Eyebrow: vạch 18×1 `jade` + chữ 11/700 hoa giãn .12em `jade` + chấm vàng 5 px. Tiêu đề
    Lora 18/700 line-height 1.35 `slate`, chữ Hán Noto Serif SC 24 `jade` (hạ 2 px); xuống dòng tự nhiên, không
    cắt. Hàng nút gap 10: nút chính co giãn, cao 48, `radius.button` 12, nền `jade`, chữ trắng 15/700,
    `shadow.primary`; nút phụ "Để sau" cao 48, padding 0 18, nền `secondary-bg`, viền 1 px rgba(36,50,58,.22).
  - Nhãn tên trên đầu nhân vật: cao 24, pill, padding 0 10, `frost` .88, chấm vàng 4 px + chữ 12/700 `slate`.
  - Dòng hướng dẫn lần đầu: trái/phải 24, dưới 186 (trên vùng joystick); padding 10 14, radius 12, `frost` .84,
    chữ 13 line-height 1.5 giữa.
  - Joystick gợi ý (chưa chạm): tròn 110, trái 36, dưới safe + 28; nền `frost-weak`, núm 40 `jade` 85 %, chữ
    "kéo để đi" 12/700. Đang giữ: vòng 120 hiện **ở chỗ ngón chạm** (tâm vòng = điểm chạm), nền .38, chấm tâm 6 px,
    núm 48 `jade` đặc + viền trắng, lệch theo hướng kéo (tối đa tới mép vòng).
  - fps: chỉ chế độ gỡ lỗi; góc dưới phải (phải 16, dưới safe + 12), mono 11, nền `frost` .8, radius 6.
- Bố cục ngang 844×390 (safe trái = phải 47, dưới 21; tai thỏ có thể ở bên nào cũng được → lề hai bên bằng nhau):
  - Chip: trái safe + 12, trên 12. Nút góc nhìn: phải safe + 12, trên 8.
  - Thẻ mời: **nửa phải**, phải safe + 12, trên 64, rộng 300, padding 16, gap 8; tiêu đề 17, chữ Hán 22; nút cao 44.
    Không che nhân vật (nhân vật ở giữa màn).
  - Dòng hướng dẫn: giữa dưới, rộng 420, dưới safe + 12, padding 8 14.
  - Joystick gợi ý: tròn 100 (núm 36), trái safe + 28, dưới safe + 12.
- Trạng thái đã vẽ: trong khu · ngoài mọi khu (chip chỉ "Văn Uyên Tông") · tên khu dài nhất · thẻ mời tiêu đề 1 dòng
  / 2 dòng · góc nhìn gần / cả sân · joystick gợi ý / đang giữ · lần đầu (có dòng hướng dẫn) · gỡ lỗi (fps).
- Tương phản: `slate` trên `frost` ≥ 9 : 1 cả trên trời sáng lẫn tường vôi (frost .82 đủ đặc, **không phụ thuộc blur**
  — WebView không hỗ trợ `backdrop-filter` thì bỏ blur, giữ nền). Trắng trên `jade` 8,4 : 1. Nút chạm ≥ 44.
- Chuỗi: có sẵn trong code (`index.html`, `zones.ts`); thêm vào `l10n/vi.arb`: `camNear`, `camYard`, `joyHint`.
- Luật: `R-DIEU-1` (joystick 45 % trái, hiện ở chỗ chạm), `R-VUNG-2`, `R-VUNG-3` (thẻ mời), `R-HUD-1` (chip),
  `R-MAN-1` (safe area).
- Ảnh: chưa có ảnh — dùng `source/HUD-*.dc.html`.

## Thẻ tên khu (mới) · artboard `HUD-doc-vao-khu.dc.html`, `HUD-ngang-vao-khu.dc.html` · từ mục 2026-11-11.3

- Mục đích: "nghi thức" chuyển cảnh — bước vào khu mới thì hiện tên khu lớn bằng chữ Hán + tiếng Việt.
- Mở khi: nhân vật bước qua ranh giới **vào** một khu khác khu trước đó (cùng lúc chip đổi chữ, `R-HUD-1`). Mờ vào
  0,25 s, giữ ~2 s, mờ ra 0,4 s. Ra khỏi mọi khu: không hiện. Đang hiện mà vào khu khác: thay chữ, đếm lại 2 s.
  Không chặn chạm (pointer-events: none). Đang hiện thẻ mời thì không hiện thẻ tên khu.
  → **đề xuất luật mới `R-HUD-2`** (CHANGELOG).
- Bố cục dọc: giữa ngang, trên 168 (giữa chip và nhân vật); rộng 240, padding 16 20 14, `radius.card`, `frost-strong`
  .80, blur 14, `shadow.card` (.2). Chữ Hán Noto Serif SC 700 52 (`area-han`), giãn .14em, `jade`; dưới là vạch
  160 px: hai đường 1 px rgba(36,50,58,.3) + chấm vàng 5 px giữa; tên Việt Lora 700 20 `slate`.
- Bố cục ngang: giữa ngang, trên 22; rộng 210; chữ Hán 40, vạch 140, tên 18.
- Chuỗi: `areaHan*` + `area*` trong `l10n/vi.arb` (cần trường trong đặc tả cảnh — "Cần code").
- Ảnh: chưa có ảnh.

## Màn tải (mới) · artboard `ManTai-doc.dc.html`, `ManTai-ngang.dc.html` · từ mục 2026-11-11.3

- Mục đích: che lúc mở app, trước khi cảnh 3D hiện (dựng cảnh vài giây).
- Mở khi: app khởi động. Đóng khi: cảnh vẽ khung hình đầu tiên → mờ ra 0,4 s. Không có nút. → **đề xuất `R-MAN-2`**.
- Bố cục dọc: nền `mist`; đáy là 3 lớp núi phẳng (`mist-far`, `mist-near`, mây `#F4F7F6`) cao 300 — SVG, không ảnh.
  Khối giữa, trên 270: 文淵宗 Noto Serif SC 700 56 giãn .16em `jade` · vạch 180 (hai đường + chấm vàng) · "Văn Uyên
  Tông" Lora 700 24 `slate` · cách 48 · thanh tiến trình rộng 200 cao 2 (nền rgba(36,50,58,.15), phần đã tải
  `jade`, đầu là chấm vàng 8 px có quầng .25) · dòng 13/500 "Đang mở sơn môn… 62%".
- Bố cục ngang: núi cao 170; khối giữa trên 70; chữ Hán 48, tên 22, cách thanh 22.
- Tiến trình: theo tiến độ dựng cảnh thật nếu có; không có thì chạy giả tới 90 % rồi chờ khung hình đầu.
- Chuỗi: `siteHan`, `siteName`, `loadingStatus`.
- Ảnh: chưa có ảnh.
