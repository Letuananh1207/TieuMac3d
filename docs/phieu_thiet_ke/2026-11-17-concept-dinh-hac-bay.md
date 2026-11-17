# Phiếu: Ảnh concept Đỉnh Hạc Bay (vùng `truong-thanh`, mở HSK 4–6)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2. Quyết định 0006.
- Cảnh hiện tại: nền trống, đặc tả `design/scene/truong-thanh.json` (nền 160 m). Hạc + cưỡi hạc đã có (`2026-11-15-cuoi-hac.md`,
  `2026-11-16-anh-hac.md`) — dùng lại dáng hạc đó.
- Nơi lưu khi chốt: `design/concept/dinh-hac-bay/toan-canh.png`, `cong-trinh.png`, `vao.png`.

## Mục đích
Rừng cột đá cao vút, cầu treo, đàn hạc trắng; người chơi **cưỡi hạc bay qua các vòng** giữa các cột. Học qua trò (từ vựng,
**chờ người dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): chủ đề thời tiết / phương hướng / di chuyển — nghe "往左飞",
"向北" thì bay đúng hướng, chọn vòng theo trời nắng / gió / mưa. Câu chào: "Núi cao chạm mây, đàn hạc trắng đã sẵn sàng chở bạn bay."

Khác **nhà** (đảo nhỏ trên biển mây) và **trấn** (đỉnh núi trong mây): ở đây cột đá mọc từ **thung lũng xanh có sông**, nhìn thấy
đáy; mây chỉ là vài dải mỏng.

## Bố cục (toạ độ m theo `truong-thanh.json`, x đông, z nam)
| Chỗ | Toạ độ | Ghi chú |
|---|---|---|
| Bãi hạc / chỗ xuất hiện | (-1,25; 39) | cao nguyên thấp phía nam, sân đá tròn |
| Cổng nam → Thung Trúc Gió Hát | (0; 49) | đèo đá |
| Cổng tây → Thành Cát Ngủ Quên | (-43; -3) | lối đá đổi dần sang cát |
| Cổng đông → Rừng Nấm Tiên | (43; -3) | lối có vài cây nấm nhỏ báo trước |
| **Tổ Hạc trên Cột Đá** | ≈ (0; -15), cột cao ≈ 40 m | cột cao nhất, giữa khung khi nhìn từ bãi hạc |
| Cột đá phụ | 8–12 cột cao 15–30 m quanh thung | đỉnh có tùng; 2–3 cầu treo nối các đỉnh |
| Lối đi bộ | bậc đá xoắn quanh chân cột chính lên một bệ giữa chừng (≈ 12 m) | bệ có vòng xuất phát cưỡi hạc |
| Sông | uốn dưới đáy thung, tây → đông | thác nhỏ từ một cột |

## Công trình đặc trưng: Tổ Hạc trên Cột Đá
Cột đá vôi bo tròn, khối lớn xếp chồng (low-poly), cao ≈ 40 m, ∅ ≈ 12 m; vài cây tùng bám vách. Đỉnh là **tổ hạc khổng lồ** bện
cành ∅ ≈ 14 m, trong tổ một đình nhỏ mái gỗ; 3–4 con hạc trắng đầu đỏ đậu / bay quanh. Một **cầu treo** gỗ – dây thừng từ bệ giữa
chừng nối sang cột bên cạnh. Màu đá `#CFCBC2` / bóng `#A9A59C`, tùng `#4F7A5A`, cành tổ `#9C7A5B`, hạc trắng `#F7F5F0` đỉnh đỏ `#C8423A`.

## Bảng màu + mùa
Thu trời trong, buổi sáng: trời lam `#8EC3E6`, vài dải mây mỏng trắng; thung lũng lục `#7FA86A`, điểm phong đỏ cam `#D9774A`;
nắng vàng nhẹ, gió lộng (lụa / cờ không chữ bay).

## Phong cách
Như ảnh cảnh hiện có (`design/screens/Canh-truc-lam-b3-dinh.png`, `Canh-truc-lam-b3-bai-hac.png`): low-poly hoạt hình mềm. Cột
đá là khối đa giác thô có góc bo, không chi tiết đá nhỏ. Không chữ Hán, không chữ ở đâu.

## Góc ảnh
1. `toan-canh`: chếch từ trên cao (≈ 40°) từ phía nam: rừng cột, cột chính + tổ, cầu treo, sông, bãi hạc, 3 lối ra.
2. `cong-trinh`: cận đỉnh cột chính + tổ hạc, ¾, ngang tầm tổ; Tiểu Mặc đứng trên mép tổ để so cỡ, một con hạc đậu cạnh.
3. `vao`: từ bãi hạc nhìn bắc, ngang tầm người chơi; một con hạc đang hạ cánh.

## Tiêu chí chốt
- Nhận ra ngay "tổ hạc trên cột đá cao nhất"; cảm giác cao, thoáng, gió — nhưng không giống trấn (đỉnh núi) hay nhà (đảo mây).
- Thấy đường bộ lên bệ giữa chừng. Không chữ.

## Dán vào canvas
```text
PHIẾU CONCEPT: Đỉnh Hạc Bay (vùng truong-thanh) — 2026-11-17
Rừng cột đá vôi bo tròn mọc từ thung lũng xanh có sông, sáng thu trời trong. Bãi hạc nam (-1,25;39); cổng nam (0;49) đi Thung
Trúc, tây (-43;-3) đi Thành Cát, đông (43;-3) đi Rừng Nấm. Công trình: cột chính ≈(0;-15) cao 40 m, đỉnh là tổ hạc bện cành
∅14 m có đình nhỏ, hạc trắng đầu đỏ; bậc đá xoắn lên bệ giữa chừng, cầu treo sang cột bên. 8–12 cột phụ có tùng. Low-poly hoạt
hình mềm, không chữ. 3 ảnh: toan-canh, cong-trinh, vao. Lưu design/concept/dinh-hac-bay/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: dinh-hac-bay
loai: concept
tham-chieu: design/screens/Canh-truc-lam-b3-dinh.png, design/screens/Canh-truc-lam-b3-bai-hac.png
mau: toan-canh
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, light xianxia, cute, friendly — not realistic, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat shading, matte clay-like materials, pastel colours, simple chunky shapes, no harsh shadows. The place: "Peak of Flying Cranes" — a valley full of tall rounded limestone pillars (like soft cartoon karst towers, built from big stacked faceted blocks with rounded corners) rising from a green valley floor with a winding river and a small waterfall; the valley floor is visible, only a few thin wisps of white cloud. Pine trees cling to the pillars and crown their tops; a few red-orange maple trees for an autumn touch. Clear autumn morning: sky blue #8EC3E6, soft golden sunlight, breezy. The landmark: the "Crane Nest on the Stone Pillar" — the tallest pillar in the centre, about 40 m high (about 35 times a child's height) and 12 m wide, topped by a huge woven twig nest about 14 m across with a tiny wooden pavilion inside it; three or four white red-crowned cranes perch on the nest rim or circle around it. Stone steps spiral around the base of this pillar up to a small ledge platform about one third of the way up, from which a wooden rope bridge spans to a neighbouring pillar. Eight to twelve smaller pillars (15–30 m) surround it, two or three linked by rope bridges. Stone #CFCBC2, shadow side #A9A59C, pine #4F7A5A, valley green #7FA86A, maple #D9774A, cranes white #F7F5F0 with red crown #C8423A. No text anywhere: no Chinese characters, no letters, no signs, no flags with writing, no logo, no watermark. Landscape 16:9.
```

```gemini toan-canh
High three-quarter bird's-eye view from the south, about 40 degrees down: the pillar valley with the tallest pillar and its crane nest in the centre, rope bridges, the river below; a round light-stone arrival plaza on a low plateau at the bottom of the frame; paths leaving to the west (toward warm sandy land), to the east and to the south.
```

```gemini cong-trinh
Close view of the top of the tallest pillar: three-quarter view at the height of the nest, the woven twig nest with the tiny pavilion inside, cranes on the rim, pine trees on the pillar edge; a small chibi child in pale blue hanfu stands on the nest rim next to one crane for scale; other pillars and the valley far below.
```

```gemini vao
Player's view: standing on the round arrival plaza in the south at eye level of a small child, looking north into the valley; the tallest pillar with the crane nest rises in the middle distance, other pillars on both sides, one white crane gliding down to land near the plaza.
```
