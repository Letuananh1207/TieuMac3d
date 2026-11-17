# Phiếu: Ảnh concept Chợ Đêm Đèn Hoa (vùng `giang-nam`, mở HSK 1)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2. Quyết định 0006.
- Cảnh hiện tại: nền trống (đã xoá kiến trúc V-66 B0), đặc tả `design/scene/giang-nam.json` (nền 160 m).
- Nên `/khao-cuu` trước khi dựng (không cần trước ảnh): "đèn thụ" 灯树 hội Nguyên tiêu thời Đường, chợ đêm thời Tống.
- Nơi lưu khi chốt: `design/concept/cho-dem-den-hoa/toan-canh.png`, `cong-trinh.png`, `vao.png`.

## Mục đích
Một khu chợ bên sông lúc tối hội: đèn lồng khắp nơi, sạp hàng, thuyền đèn. Người chơi đến để **đoán đố đèn** và **bán hàng cho
khách NPC** (trả Văn tiền). Học qua trò (từ vựng, **chờ người dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): chủ đề mua
bán / số đếm / lượng từ / đồ ăn — nghe khách gọi "两碗面", hiểu nghĩa, đưa đúng món và số lượng; đố đèn là câu đố từ. Câu chào: "Đèn hoa đã thắp sáng bờ sông. Chợ đêm mở cửa rồi!"

## Bố cục (toạ độ m theo `giang-nam.json`, x đông, z nam)
| Chỗ | Toạ độ | Ghi chú |
|---|---|---|
| Bãi hạc / chỗ xuất hiện | (-1,25; 39) | phía nam; từ đây nhìn bắc thấy Cây Đèn ở giữa |
| Cổng tây → Thung Trúc Gió Hát | (-30; -2) | lối đá vào phố |
| Cổng bắc đông → Rừng Nấm Tiên | (25; -24) | qua cầu vòm đá trên sông |
| Bến đông → Cung Ngọc Đáy Biển | (30; -14) | bến thuyền gỗ, thuyền nhỏ đậu sẵn |
| Sông | chảy tây → đông quanh z ≈ -8, rộng ≈ 8 m, ra bến đông | bờ kè đá, bậc xuống nước |
| **Cây Đèn Trăm Tầng** | quảng trường bờ nam, ≈ (0; 8), sân ∅ ≈ 20 m | công trình đặc trưng |
| Dãy sạp hàng | hai bờ sông, mái vải che, 6–10 sạp | 1 sạp lớn của người chơi gần cây đèn |
| Dây đèn đố | giăng ngang sông và quanh quảng trường | đèn treo có tua, KHÔNG chữ (câu đố hiện ở HUD) |

## Công trình đặc trưng: Cây Đèn Trăm Tầng
Cột son giữa cao ≈ 15 m, quanh cột 7 tầng vòng đèn lồng tròn, tầng dưới rộng ≈ 10 m, nhỏ dần lên trên → bóng dáng một cái cây /
cây thông bằng đèn; đỉnh một đèn hoa sen lớn. Đế đá bát giác hai bậc có lan can thấp. Đèn tự sáng (nướng màu, không đèn thật).
Màu: son `#B8432F`, vàng đèn `#FFC27A`, giấy đèn `#F6D9A6`, đá `#A8A194`.

## Bảng màu + giờ
Trời chạng vạng sang tối: lam đậm `#26304A` → tím than `#3A3352` ở chân trời, vài sao; mặt sông phản chiếu vệt vàng; tường vôi
`#E9E2D4`, ngói xám than `#3B3F44`, mái vải sạp đỏ / vàng / chàm. Ấm, vui, đông vui nhưng không chói.

## Phong cách
Như ảnh cảnh hiện có (`design/screens/Canh-mem-quang-truong.png`, `Canh-truc-lam-b3-dinh.png`): low-poly hoạt hình mềm, màu
phấn, vật liệu mờ. Ban đêm vẫn đọc rõ khối (không tối đen). Không chữ Hán, không chữ trên biển / đèn / sạp.

## Góc ảnh
1. `toan-canh`: chếch từ trên cao (≈ 45°) từ phía nam, thấy cả sông, cầu, bến, cây đèn, sạp.
2. `cong-trinh`: cận Cây Đèn Trăm Tầng, ¾, hơi từ dưới lên, Tiểu Mặc đứng ở đế để so cỡ.
3. `vao`: từ bãi hạc nhìn bắc, ngang tầm người chơi.

## Tiêu chí chốt
- Nhìn là biết "chợ đêm có cây đèn khổng lồ"; cây đèn là thứ sáng và cao nhất cảnh.
- Thấy được 3 lối ra (tây, cầu bắc đông, bến đông). Không chữ ở đâu cả.
- Khối đủ đơn giản để dựng low-poly (sạp, nhà là hộp + mái; đèn là cầu / trụ).

## Dán vào canvas
```text
PHIẾU CONCEPT: Chợ Đêm Đèn Hoa (vùng giang-nam) — 2026-11-17
Chợ bên sông lúc tối hội. Sông chảy tây→đông (z≈-8) ra bến thuyền đông (30;-14, đi Cung Ngọc Đáy Biển); cổng tây (-30;-2, đi
Thung Trúc); cầu vòm đá bắc đông (25;-24, đi Rừng Nấm Tiên); bãi hạc nam (-1,25;39). Công trình: Cây Đèn Trăm Tầng ở quảng
trường bờ nam ≈(0;8): cột son 15 m, 7 tầng vòng đèn lồng nhỏ dần thành dáng cây, đỉnh đèn sen. Sạp hàng mái vải hai bờ, dây
đèn đố (không chữ). Trời lam đậm, đèn vàng ấm. Low-poly hoạt hình mềm, không chữ.
3 ảnh: toan-canh, cong-trinh, vao. Lưu design/concept/cho-dem-den-hoa/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: cho-dem-den-hoa
loai: concept
tham-chieu: design/screens/Canh-mem-quang-truong.png, design/screens/Canh-truc-lam-b3-dinh.png
mau: toan-canh
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, light xianxia, cute, friendly — not realistic, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat shading, matte clay-like materials, pastel colours, simple chunky shapes, no harsh shadows. The place: "Night Market of Flower Lanterns" — a small ancient-Chinese riverside market town in the early evening of a lantern festival. A calm river about 8 m wide flows from west to east across the scene, with stone embankments and steps down to the water, ending at a small wooden boat pier on the east side with little lantern boats moored. A stone arch bridge crosses the river to a road going north-east. White-washed walls with dark grey tiled roofs; along both banks, rows of small market stalls with red, yellow and indigo cloth awnings. Strings of round glowing paper lanterns with tassels hang across the river and around the square. On the south bank, a round stone square holds the landmark: the "Hundred-Tier Lantern Tree" — a 15 m vermilion central pole surrounded by seven rings of glowing round lanterns, the lowest ring about 10 m wide, each ring smaller upward so the whole thing has the silhouette of a tree made of light, topped by a large lotus-shaped lantern, on a two-step octagonal stone base with a low railing. It is the tallest and brightest thing in the scene. Sky deep evening blue fading to violet at the horizon with a few stars; warm golden lantern glow reflected on the water; forms still clearly readable, not pitch dark. No text anywhere: no Chinese characters, no letters on lanterns, stalls or signs, no logo, no watermark. Landscape 16:9.
```

```gemini toan-canh
High three-quarter bird's-eye view from the south, about 45 degrees down, showing the whole market: the river, the arch bridge, the boat pier on the east, the stalls on both banks and the Lantern Tree square in the middle; a round light-stone arrival plaza at the bottom of the frame.
```

```gemini cong-trinh
Close view of the Hundred-Tier Lantern Tree: three-quarter view from slightly below, the whole tree from base to lotus lantern in frame, a small chibi child in pale blue hanfu standing at the base for scale, a few stalls and the river softly behind.
```

```gemini vao
Player's view: standing on the round arrival plaza in the south at eye level of a small child, looking north along a stone-paved street; the glowing Lantern Tree rises at the end of the street in the middle distance, stalls on both sides, lantern strings overhead.
```
