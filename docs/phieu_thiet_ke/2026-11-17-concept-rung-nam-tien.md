# Phiếu: Ảnh concept Rừng Nấm Tiên (vùng `tu-cam-thanh`, mở HSK 2)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2. Quyết định 0006.
- Cảnh hiện tại: nền trống, đặc tả `design/scene/tu-cam-thanh.json` (nền 260 m — rộng nhất; có thể thu nhỏ khi dựng).
- Nên `/khao-cuu` trước khi dựng: đỉnh luyện đan (丹爐 / 鼎) — dáng ba chân hai quai; linh chi trong tranh tiên.
- Nơi lưu khi chốt: `design/concept/rung-nam-tien/toan-canh.png`, `cong-trinh.png`, `vao.png`.

## Mục đích
Rừng kỳ ảo có nấm cao hơn nhà, thảo dược, khói thơm. Hoạt động: hái thảo dược và **nấu thuốc theo đơn**. Học qua trò (từ
vựng, **chờ người dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): chủ đề thực vật / thuốc / cơ thể — nghe tên nguyên liệu
hay chỗ đau của NPC (pinyin + nghĩa), chọn đúng vật bỏ vào lò. Câu chào: "Nấm cao hơn cả nhà, khói thơm bay từ lò thuốc tiên…
ai đang nấu gì thế?"

## Bố cục (toạ độ m theo `tu-cam-thanh.json`, x đông, z nam)
| Chỗ | Toạ độ | Ghi chú |
|---|---|---|
| Bãi hạc / chỗ xuất hiện | (-1,25; 70) | phía nam |
| Cổng nam → Chợ Đêm Đèn Hoa | (0; 81) | lối đất có viền nấm nhỏ |
| Cổng tây → Đỉnh Hạc Bay | (-63; 54) | lối lên dốc đá |
| **Lò Thuốc Tiên** trên Nấm Mẹ | ≈ (0; 20) | thấy từ bãi hạc nhìn bắc |
| Vườn thảo dược | quanh chân Nấm Mẹ, 3–4 luống tròn | mỗi luống một loại cây / nguyên liệu |
| Nhà nấm | 3–4 nấm vừa (cao 5–7 m) có cửa tròn, cửa sổ tròn | nhà NPC (bà Thuốc, thỏ…) |
| Suối nhỏ | uốn từ tây bắc xuống đông nam | cầu ván qua suối |

## Công trình đặc trưng: Lò Thuốc Tiên trên Nấm Mẹ
- **Nấm Mẹ**: thân trắng kem to ∅ ≈ 5 m, mũ nấm phẳng ∅ ≈ 22 m cao ≈ 10 m, mũ hồng có đốm kem. Lối lên: bậc gỗ xoắn quanh
  thân, có lan can dây.
- **Lò**: đỉnh đồng ba chân hai quai, thân tròn ∅ ≈ 5 m cao ≈ 6 m (cả chân), nắp mái nhỏ có núm; đồng vàng nâu `#B08A4E` gỉ
  xanh ngọc nhạt `#7FB7A4` ở mép; lửa nhỏ dưới bụng lò; khói tím nhạt cuộn thành 2–3 cụm mây tròn (khối, không hạt).
- Quanh lò trên mũ nấm: 4–5 hũ sứ đựng nguyên liệu (không chữ — chỉ màu / hình dáng), một bàn đá nhỏ.

## Bảng màu + giờ
Cuối hạ, chiều muộn, ánh nắng hồng chéo; sương tím nhạt `#CDBDE6` dưới tán; mũ nấm hồng `#E7A3A8`, cam đào `#F2B48A`,
kem `#F6EBD9`; rêu lục `#8FB07A`; thảo dược lục tươi `#6FAE6A`; đất nâu ấm `#9C7A5B`. Huyền ảo nhưng dịu, không neon.

## Phong cách
Như ảnh cảnh hiện có (`design/screens/Canh-truc-lam-b3-dinh.png`, `Canh-truc-lam-b3-bai-hac.png`): low-poly hoạt hình mềm. Nấm
phải là khối tròn ít mặt (cầu dẹt, trụ), dựng được bằng khối. Không chữ Hán, không chữ trên hũ / biển.

## Góc ảnh
1. `toan-canh`: chếch từ trên cao (≈ 45°) từ phía nam: rừng nấm, Nấm Mẹ + lò ở giữa, vườn thuốc, suối, 2 lối ra.
2. `cong-trinh`: cận lò trên mũ nấm, ¾, hơi từ trên; Tiểu Mặc đứng bên lò để so cỡ.
3. `vao`: từ bãi hạc nhìn bắc, ngang tầm người chơi.

## Tiêu chí chốt
- Nhận ra ngay "lò luyện thuốc trên cây nấm khổng lồ"; không giống chuông, không giống nồi hiện đại.
- Khác hẳn trấn / Thung Trúc về màu (tím hồng, không xanh lục là chủ đạo). Không chữ.

## Dán vào canvas
```text
PHIẾU CONCEPT: Rừng Nấm Tiên (vùng tu-cam-thanh) — 2026-11-17
Rừng nấm khổng lồ kỳ ảo, chiều cuối hạ hồng tím. Bãi hạc nam (-1,25;70), cổng nam (0;81) đi Chợ Đêm, cổng tây (-63;54) đi
Đỉnh Hạc Bay. Công trình: Nấm Mẹ ≈(0;20) mũ phẳng hồng đốm kem ∅22 m cao 10 m, bậc gỗ xoắn quanh thân; trên mũ là Lò Thuốc
Tiên: đỉnh đồng ba chân hai quai cao 6 m, khói tím cuộn thành cụm mây. Quanh chân: vườn thảo dược, nhà nấm cửa tròn, suối nhỏ.
Low-poly hoạt hình mềm, không chữ. 3 ảnh: toan-canh, cong-trinh, vao. Lưu design/concept/rung-nam-tien/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: rung-nam-tien
loai: concept
tham-chieu: design/screens/Canh-truc-lam-b3-dinh.png, design/screens/Canh-truc-lam-b3-bai-hac.png
mau: toan-canh
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, light xianxia, cute, friendly — not realistic, not modern, not spooky). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat shading, matte clay-like materials, pastel colours, simple rounded chunky shapes, no harsh shadows. The place: "Fairy Mushroom Forest" — a magical forest of giant mushrooms taller than houses, late summer, late afternoon with warm pink slanting sunlight and a soft lilac haze under the caps. Mushrooms are simple low-poly shapes: cream-white stems, flat or domed caps in rose pink, peach and cream with cream spots. A few medium mushrooms (5–7 m) are little houses with round wooden doors and round windows. Mossy green ground, a small winding stream with plank bridges, round beds of fresh green herbs. The landmark: the "Fairy Elixir Cauldron" — in the middle of the forest stands the Mother Mushroom, a huge mushroom with a thick cream stem and a wide FLAT rose-pink cap about 22 m across and 10 m high, with a wooden spiral staircase with rope railing winding up its stem; on top of the flat cap sits a big ancient Chinese bronze ding cauldron with three legs and two upright handles and a small domed lid, about 6 m tall, golden-brown bronze with pale jade-green patina at the edges, a small fire glowing beneath it, puffing soft lilac smoke that rolls up into two or three round cloud puffs. Around the cauldron a few porcelain jars and a small stone table. Colours: rose #E7A3A8, peach #F2B48A, cream #F6EBD9, moss #8FB07A, lilac haze #CDBDE6, bronze #B08A4E. No text anywhere: no Chinese characters, no letters on jars or signs, no logo, no watermark. Landscape 16:9.
```

```gemini toan-canh
High three-quarter bird's-eye view from the south, about 45 degrees down: the whole mushroom forest clearing with the Mother Mushroom and its cauldron in the centre, herb beds around its foot, mushroom houses, the stream, a dirt path entering from the bottom of the frame (south) and another path climbing out to the left (west) toward rocky slopes; a round light-stone arrival plaza near the bottom.
```

```gemini cong-trinh
Close view on top of the Mother Mushroom: three-quarter view from slightly above, the bronze three-legged cauldron with its lilac smoke puffs, the jars and the stone table on the flat pink cap, the top of the spiral staircase; a small chibi child in pale blue hanfu stands beside the cauldron for scale; other mushroom caps and pink sky behind.
```

```gemini vao
Player's view: standing on the round arrival plaza in the south at eye level of a small child, looking north along a dirt path lined with small mushrooms; the Mother Mushroom with the smoking cauldron on top rises in the middle distance, giant mushrooms on both sides.
```
