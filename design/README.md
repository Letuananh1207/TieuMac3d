# design/ — thiết kế giao diện Học Xá 3D

Canvas: [Học Xá 3D – giao diện app](https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1) (riêng tư — muốn người khác
xem thì chia sẻ từ menu Share của canvas).

**Thiết kế trước, code sau — chỉ cho phần mới.** Cảnh 3D và HUD đang có theo code (`web/`, `app/`). Màn / thành
phần mới vẽ trên canvas trước, theo phiếu trong `docs/phieu_thiet_ke/`, rồi mới code.

| Thư mục / file | Nội dung | Ai ghi |
|---|---|---|
| `source/` | bản xuất canvas (`canvas.json`, `*.dc.html`) | phiên thiết kế (`/ui-design`) khi chốt |
| `tokens/design_tokens.json` | màu, chữ, khoảng cách, bo góc — mỗi token ghi chỗ định nghĩa trong code | phiên thiết kế |
| `docs/screen_specs.md` | đặc tả từng màn đã vẽ | phiên thiết kế |
| `docs/components.md` | thành phần dùng lại | phiên thiết kế |
| `screens/` | ảnh chụp artboard đã chốt (`<Màn>-doc.png`, `<Màn>-ngang.png`), cảnh (`Canh-*.png`), model (`Model-*.png`) | skill thiết kế |
| `l10n/vi.arb` | chuỗi giao diện mới mà thiết kế đặt ra | phiên thiết kế |
| `scene/` | đặc tả cảnh 3D (`scene.json`, code đọc lúc build) + link Canvas 3D trong `scene/README.md` | `/canh` |
| `models/` | model `.glb` đã làm sạch (`nhan-vat.glb` = nhân vật chính, app tự dùng), `anh/` ảnh đầu vào, `LICENSES.md` | `/tai-nguyen` |
| `CHANGELOG.md` | nhật ký, mỗi lần chốt một mục `<ngày>.<số>` | `/ui-design`, `/canh`, `/tai-nguyen` |

Phiên code (VS Code) **không sửa** thư mục này; nó đọc rồi áp vào code bằng `/ui-apply`, ghi tiến độ ở
`docs/thiet_ke_da_ap.md`.

Khổ vẽ: 390×844 (dọc) và 844×390 (ngang) — app xoay tự do; mọi phần tử bám mép tính cả vùng tai thỏ / thanh
hệ thống. Cảnh 3D không vẽ trên canvas 2D: thiết kế bằng scene/scene.json + Canvas 3D; trên canvas 2D dùng ảnh chụp
app làm nền giữ chỗ.
