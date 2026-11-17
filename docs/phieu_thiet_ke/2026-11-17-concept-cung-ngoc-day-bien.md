# Phiếu: Ảnh concept Cung Ngọc Đáy Biển (vùng `bong-lai`, mở HSK 3)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2, §3. Quyết định 0006.
- Cảnh hiện tại: nền trống, đặc tả `design/scene/bong-lai.json` (nền 160 m).
- Nên `/khao-cuu` trước khi dựng: long cung (龍宮) trong truyện / tranh cổ, ốc xà cừ, san hô trong đồ trang trí cổ.
- Nơi lưu khi chốt: `design/concept/cung-ngoc-day-bien/toan-canh.png`, `cong-trinh.png`, `vao.png`.

## Mục đích
Một vùng dưới đáy biển: cung điện vỏ ốc, san hô, cá. Hoạt động: **đưa cá về đúng hang** và **nhặt ngọc trai**. Học qua trò
(từ vựng, **chờ người dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): chủ đề động vật biển / màu sắc — nghe "红色" thì dẫn
cá về hang đỏ, gọi đúng tên con vật; mỗi viên ngọc trai là một từ đến hạn ôn. Câu chào: "Hít một hơi thật sâu nào. Cung ngọc dưới biển đang chờ bạn!"

## Bố cục (toạ độ m theo `bong-lai.json`, x đông, z nam)
| Chỗ | Toạ độ | Ghi chú |
|---|---|---|
| Chỗ xuất hiện | (-1,25; 39) | sân cát trắng tròn, có **vòm bong bóng** lớn trên đầu khi tới |
| Cổng tây nam → Chợ Đêm Đèn Hoa | (-9; 42) | "cửa lặn": cột san hô hai bên, dây bong bóng bay lên mặt nước (lối về bến thuyền) |
| **Cung Vỏ Sò** | ≈ (0; -10), trên nền san hô cao ≈ 2 m | thấy từ chỗ xuất hiện nhìn bắc |
| Lối đi | cát trắng viền đá cuội, từ nam lên cung | hai bên rong biển, san hô |
| Hang cá | 4–5 hang đá / hốc san hô quanh sân trước cung | trò "đưa cá về nhà"; mỗi hang một màu |
| Bãi ngọc trai | vỏ trai mở rải rác trên cát | trò ôn |

Điểm cần quyết sau (không thuộc phiếu ảnh): hạc có "đáp" xuống đáy biển không, hay vùng này tới bằng bong bóng từ bến thuyền
(chạm luật cưỡi hạc) — ghi cho `/lead`.

## Công trình đặc trưng: Cung Vỏ Sò
Vỏ ốc xà cừ xoắn khổng lồ nằm nghiêng (dài ≈ 24 m, cao ≈ 14 m), miệng ốc là cửa vòm lớn có rèm rong; trên lưng ốc mọc 3–5 chóp
san hô như mái đao; hai bên cửa hai cột san hô đỏ hồng; nền là bậc san hô / đá hồng. Xà cừ: kem `#F4E9DC` ánh hồng `#F2C6C2`
và tím nhạt `#D8C7E8` (vẽ bằng **dải màu**, không phản chiếu). Vài "đèn ngọc" tròn trắng sáng nhẹ quanh cửa.

## Bảng màu + "thời tiết"
Không mùa. Nước xanh ngọc: gần `#5FB7B0`, xa đặc dần sang `#2E7F8C`; cát trắng `#EFE6D2`; san hô hồng `#F08A7E`, cam `#F4A261`,
tím `#B58BD6`; rong lục `#5E9C6A`. Vệt nắng xiên từ trên xuống (vài dải sáng nhạt), bong bóng nhỏ.

## Ghi chú kỹ thuật (đọc trước khi tạo ảnh và trước khi dựng)
Quy tắc 4 CLAUDE.md / quyết định 0005: **không hậu kỳ toàn màn, không shadow realtime**. Ảnh concept phải là thứ dựng được:
- "Dưới nước" giả bằng: **sương dày màu nước** (fog gần, ~15–70 m) + **trời = màu nước** (vòm trời tông xanh ngọc, sáng hơn ở
  trên) + **màu đỉnh** (vật xa nhạt xanh, chân vật tối hơn do bóng nướng).
- Vệt nắng: vài khối nón / dải trong suốt cộng sáng, đặt cố định (đếm draw call). Bong bóng, cá: ít, instancing.
- Gợn sáng (caustics) trên cát: **chỉ** nếu làm trong shader nước / nền ở `web/src/scene/` và đo fps đạt (Android tầm trung ≥ 30);
  mặc định **không**, concept không được dựa vào nó.
- Không mặt nước lấp lánh trên đầu, không méo hình, không bokeh, không làm mờ chiều sâu (đều là hậu kỳ).
- Rong / san hô lay: dùng chung kiểu lay cỏ đã có.
Câu lệnh Gemini dưới đây đã ghi rõ để ảnh không vẽ hiệu ứng không dựng được.

## Phong cách
Như ảnh cảnh hiện có (`design/screens/Canh-truc-lam-b3-dinh.png`, `Canh-nha-ta-dao.png`): low-poly hoạt hình mềm, màu phấn.
Không chữ Hán, không chữ ở đâu.

## Góc ảnh
1. `toan-canh`: chếch từ trên cao (≈ 45°) từ phía nam: sân xuất hiện, lối cát, hang cá, cung vỏ sò, cửa lặn tây nam.
2. `cong-trinh`: cận Cung Vỏ Sò, ¾ từ đông nam, ngang thấp; Tiểu Mặc đứng ở bậc cửa để so cỡ.
3. `vao`: từ chỗ xuất hiện nhìn bắc, ngang tầm người chơi.

## Tiêu chí chốt
- Nhận ra ngay "cung điện vỏ ốc dưới đáy biển"; có chút dáng cổ trang (mái đao bằng san hô, cột hai bên cửa).
- Cảm giác dưới nước đến từ màu + sương + vệt nắng, không từ hiệu ứng hậu kỳ. Không chữ.

## Dán vào canvas
```text
PHIẾU CONCEPT: Cung Ngọc Đáy Biển (vùng bong-lai) — 2026-11-17
Đáy biển xanh ngọc. Chỗ xuất hiện nam (-1,25;39) sân cát tròn; cửa lặn tây nam (-9;42, về Chợ Đêm) giữa hai cột san hô. Công
trình: Cung Vỏ Sò ≈(0;-10): vỏ ốc xà cừ xoắn khổng lồ dài 24 m cao 14 m, miệng ốc là cửa vòm, 3–5 chóp san hô như mái đao, nền
bậc san hô. Quanh sân: 4–5 hang cá, vỏ trai có ngọc. Nước = sương xanh ngọc + màu đỉnh + vài vệt nắng (KHÔNG hậu kỳ, không
caustics, không bokeh). Low-poly hoạt hình mềm, không chữ. 3 ảnh: toan-canh, cong-trinh, vao. Lưu design/concept/cung-ngoc-day-bien/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: cung-ngoc-day-bien
loai: concept
tham-chieu: design/screens/Canh-truc-lam-b3-dinh.png, design/screens/Canh-nha-ta-dao.png
mau: toan-canh
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, light xianxia, cute, friendly — not realistic, not scary, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat shading, matte clay-like materials, pastel colours, simple chunky shapes. The place: "Jade Palace under the Sea" — a calm sunny seabed. The underwater feeling must come ONLY from colour and haze: the whole scene is tinted soft turquoise, distant things fade smoothly into a thick even turquoise haze (light #5FB7B0 near, deeper #2E7F8C far), the "sky" is the same water colour, a bit brighter toward the top; a few soft slanted pale sunbeams come down from above; a few small round bubbles. Do NOT draw: sparkling caustic light patterns, a rippling water surface overhead, depth-of-field blur, bokeh, lens distortion or glow bloom. White sand floor #EFE6D2 with pebble-edged sandy paths, low-poly coral clumps in pink #F08A7E, orange #F4A261 and violet #B58BD6, green kelp ribbons, rounded rocks with small caves, open clam shells holding pearls, a few small schools of simple cute fish. The landmark: the "Seashell Palace" — a giant spiral conch / nautilus shell lying on its side on a raised coral platform, about 24 m long and 14 m high, its mother-of-pearl surface painted in soft bands of cream #F4E9DC, pink #F2C6C2 and lilac #D8C7E8 (matte, no mirror reflections); the shell's opening is a large arched doorway with a curtain of seaweed; three to five coral spires on its back curve up like the upturned eaves of an ancient Chinese roof; two red-pink coral columns flank the doorway; coral steps lead up; a few round softly glowing white pearl lamps around the door. No text anywhere: no Chinese characters, no letters, no signs, no logo, no watermark. Landscape 16:9.
```

```gemini toan-canh
High three-quarter bird's-eye view from the south, about 45 degrees down: a round white-sand arrival plaza at the bottom of the frame, a sandy path lined with coral and kelp leading north to the Seashell Palace on its coral platform; four or five little rock caves around the open sand court in front of the palace; at the lower-left (south-west) an exit gate made of two tall coral pillars with a stream of bubbles rising up.
```

```gemini cong-trinh
Close view of the Seashell Palace: three-quarter view from the south-east, low camera, the whole shell, its coral spires, coral columns, steps and pearl lamps in frame; a small chibi child in pale blue hanfu inside a thin clear air bubble stands on the steps for scale.
```

```gemini vao
Player's view: standing on the round sand plaza in the south at eye level of a small child, looking north along the sandy path; the Seashell Palace in the middle distance softly fading in the turquoise haze, coral and kelp on both sides, a few sunbeams.
```
