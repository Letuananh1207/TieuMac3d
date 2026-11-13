# Phong cách 3D Trung Hoa · từ mục 2026-11-11.1

Bản mẫu: `source/PhongCach-KienTruc.dc.html`, `source/PhongCach-CayNhanVat.dc.html` (canvas, hàng "Cảnh 3D: phong
cách Trung Hoa"). Mặt đứng chính diện, tỉ lệ 1 m = 20 px ở artboard kiến trúc.

**Hướng đã chọn:** miễn phí, không mua / tải gói model ngoài. Phiên code **dựng lại bằng hình khối trong code**
theo các bản mẫu: low-poly, màu phẳng (vật liệu Lambert), không texture ảnh, không shadow; cả cảnh vẫn ≤ 150 draw
call (gộp khối tĩnh, instancing cho cây). Lý do: gói CC0 gần như không có nhà / nhân vật kiểu Trung Hoa; tự dựng
giữ một phong cách đồng nhất, nhẹ cho điện thoại, chạy offline.

Tinh thần: 粉牆黛瓦 · 朱柱青檐 — tường vôi, ngói xám đen, cột son, xà vẽ xanh lục – lam (thanh lục thái hoạ), nền
đá trắng có lan can, đầu đao cong.

## Trạng thái

- 2026-11-11.1: bản mẫu + bảng màu; "Cần code" bên dưới.
- **2026-11-11.2: phiên code đã dựng xong mọi mục "Cần code"; đã bật trong `scene.json`** — tường vôi + cổng trăng,
  cổng 文淵宗, tùng / liễu / mai, đá Thái Hồ, đèn đá, đỉnh đồng, Văn Tháp, nhân vật đệ tử, tên khu (HUD). Ảnh:
  `screens/Canh-tren.png`, `Canh-ca-san.png`, `Canh-giang-duong.png`.
- Chỉnh khi bật: ngói lưu ly lục `#3E6B5A` → **`#2B5446`** (dưới nắng chiều trông nhạt như bạc hà); lá liễu đậm hơn.

### Còn khác bản mẫu (Cần code, không gấp)

1. **Liễu** trông như "con sứa": dải rủ thẳng, dày, đều quanh tán vòm. Muốn: dải mảnh hơn, cong nhẹ, dài ngắn so le,
   tán bớt tròn đều.
2. **Đảo nổi** là hình nón ngược trơn. Muốn: mặt trên phẳng có cỏ, vài cây tùng nhỏ, đá lởm chởm phía dưới, có
   thể một đình nhỏ trên đảo lớn nhất.
3. **Khe giữa các đoạn tường khu** (`wallSegments`) vẫn là khe thường, chưa thành cổng trăng như khe tường bao.

## Bảng màu cảnh (đã áp vào `scene.json`)

| Vai trò | Màu | Trường |
|---|---|---|
| Ngói xám đen (đa số nhà, đỉnh tường) | `#4F5A63` | `buildings[].roofColor`, `walls.capColor` |
| Ngói lưu ly lục (giảng đường, cổng, Dược các) | `#3E6B5A` | `roofColor` |
| Ô giấy dầu (sạp phố chợ, ô trà lâu) — mục 2026-11-13.13 | `#C9803A` | cần code (`sap-o`) |
| Ngói vàng — để dành Chưởng Môn Điện (đợt 2) | `#C9A13B` | — |
| Cột son | `#A8322A` | `buildingStyle.pillar` |
| Tường vôi | `#E8E1D2` | `buildingStyle.wall` (tường bao: cần code, xem dưới) |
| Đá trắng nền | `#D9D4C7` | `buildingStyle.base` |
| Xà lục / xà lam | `#2F6F73` / `#3F5FA0` | `buildingStyle.eave` (lục); lam: cần code |
| Vàng kim (biển, chấm xà) | `#D4A64A` | — |
| Gỗ sẫm | `#3A2418` | — |
| Lá tùng | `#2F5A3A` · `#3F6E45` · `#4A7A4A` | `trees.leaves` |
| Hoa mai | `#F2B8C6` · `#E88AA4` | — (cần code) |
| Trời | đỉnh `#5D86B5` · giữa `#A8C0D6` · chân trời `#F0D9B0`; sương `#C3CBD4` 45–140; nắng `#FFE2B8` 0,95 từ tây | `sky`, `fog`, `light` |

## Cần code (theo thứ tự nên làm)

Mỗi thứ thêm vào `SceneSpec` có mặc định giữ cảnh cũ (quy tắc 8). Kích thước dưới đây theo bản mẫu.

1. **Điện lớn (`kind: dien`) theo bản mẫu.** Nền đá trắng cao 1 m, bậc giữa rộng 4 m; lan can đá trụ thấp quanh
   mép nền. Cột son tròn cao 3,6 m cách 2,5 m. Cửa bức bàn (khối màu vôi + dải gỗ nâu chân cửa). Dải xà lục + vạch
   lam + chấm vàng kim. **Mái hiên kép**: hiên dưới rộng hơn thân 3,5 m mỗi bên, 4 góc vểnh lên (đầu đao); thân trên
   ngắn; mái trên yết sơn, bờ nóc sẫm, hai đầu nóc cong. Biển hiệu giữa hai tầng mái; đèn lồng đỏ ở góc hiên.
   Giảng đường cũ (`giang-duong`) dùng cùng ngôn ngữ (một tầng mái, đầu đao).
2. **Nhà nhỏ (`nha-nho`)**: một tầng, mái hai mái nóc thẳng vểnh nhẹ hai đầu, khung gỗ sẫm lộ, tường vôi, cửa gỗ
   giữa, hai cửa sổ tròn (khối tròn sẫm + chữ thập), nền đá 0,5 m.
3. **Tháp (`thap`)**: thân bát giác (6–8 cạnh), mỗi tầng hẹp 0,4 m/bên, vành hiên cong mỗi tầng, chóp nhọn + cột
   đồng hồ lô 2 bầu.
4. **Cổng sơn môn 3 gian 4 trụ**: gian giữa = `width`, hai gian bên 3,5 m, gian giữa cao hơn; ba mái nhỏ ngói lưu ly
   lục; biển chữ Hán (văn bản `title`) giữa; chân trụ đá. **Xà thấp nhất ≥ 6 m** để camera không lọt sau biển khi
   đi qua (lỗi thấy khi chơi thử). Va chạm: 4 trụ. Có thể thêm trường `hanTitle` (vd. "文淵宗") cho biển chữ Hán.
5. **Tường vôi mái ngói + cổng trăng**: tường bao và `wallSegments` dùng tường vôi trắng trơn (không vân gạch) +
   chân đá xám + mái ngói nhỏ trên đỉnh; màu tường đặt được riêng (hiện vân gạch luôn tối, không ra trắng được).
   Mỗi khe cổng thành **cổng trăng**: vòm tròn viền đá, đường kính = bề rộng khe. Cửa sổ hoa (lậu song) rải dọc tường.
6. **Cây mới** (`trees.yard[].kind`, `groves[].kind`): `tung` (thân cong, lá thành các "đám mây" dẹt xếp tầng, mặt
   trên sáng hơn) — thay `tan` làm cây chính; `lieu` (tán vòm + dải lá rủ đung đưa nhẹ) — quanh ao; `mai` (cành gãy
   khúc sẫm, không lá, chùm hoa hồng). Giữ `truc`.
7. **Đồ trang trí mới** (`props.kind`): `da-thai-ho` (khối đá xám có lỗ), `den-da` (đèn đá, ô sáng vàng ấm),
   `dinh-dong` (đỉnh đồng ba chân, khói hương như lò đan). Có va chạm.
8. **Nhân vật đệ tử** (thay gấu khối, qua hợp đồng `Character`, không sửa `PlayerController`): chibi đầu ≈ 1/2,5
   chiều cao; tóc búi + trâm vàng + dải tóc lam bay; đạo bào cổ giao lĩnh (vạt phải đè trái) màu `#DCE8EE`, viền /
   đai `#3F5FA0`, tay áo rộng rủ, ngọc bội lục. Không xương: thân nhún khi đi, tay áo + dải tóc đung đưa, quay theo
   hướng đi. Nhãn tên giữ nguyên.
9. **Hiệu năng**: đo lại 3 góc (`?view=tren`, `ca-san`, góc chơi) ≤ 150 draw call sau khi thay hình.

Nếu một mục làm được nhưng trông khác bản mẫu nhiều, ghi lại để phiên thiết kế chỉnh bản mẫu.
