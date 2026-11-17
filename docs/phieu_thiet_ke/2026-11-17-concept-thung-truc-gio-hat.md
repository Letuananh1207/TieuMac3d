# Phiếu: Ảnh concept Thung Trúc Gió Hát — thêm Tháp Sáo Trúc (vùng `rung-truc`)

- Trạng thái: chờ thiết kế
- Việc: V-20261117-79. Phiếu ý tưởng: `docs/y_tuong/2026-11-17-the-gioi-moi.md` §2, §4. Quyết định 0006.
- Phạm vi: **chỉ thêm một công trình** vào cảnh đã có. Địa hình thung suối, rừng trúc, Vọng Trúc Đình (-31; -30), Trúc Lư
  (-35; 24,5), Khúc Thuỷ Đài (chân thác), 3 trò, bãi hạc, cổng giữ nguyên.
- Ảnh hiện tại (đính kèm Gemini): `design/screens/Canh-truc-lam-b3-bai-hac.png` (từ bãi hạc nhìn lên bắc),
  `design/screens/Canh-truc-lam-b3-dinh.png`. Sơ đồ toạ độ: `design/screens/Canh-truc-lam-b2-tren.png` (có nhãn, không gửi Gemini).
- Nơi lưu khi chốt: `design/concept/thung-truc-gio-hat/vao.png`, `cong-trinh.png`.

## Mục đích
Duyệt dáng **Tháp Sáo Trúc**: công trình đặc trưng của vùng, nhìn từ bãi hạc là thấy, đứng giữa thung như Lâu Đài Moor đứng
giữa Moly. Gắn trò mới "Trúc hát" ở chân tháp: nghe một từ, gõ đúng ống theo thanh điệu (pinyin). Học qua trò (từ vựng,
**chờ người dùng chốt hướng học mới** — mục tiêu đổi 2026-11-17): phát âm, thanh điệu, từ chào hỏi / thiên nhiên đầu tiên.

## Công trình + vị trí
- Đặt **giữa Bãi Giữa Ø26 (0; 0)**: ngã tư của lối bắc (lên đèo, Đỉnh Hạc Bay), lối tây (trấn), quan đạo đông (Chợ Đêm Đèn Hoa),
  lối nam (bãi hạc z 39). Từ bãi hạc nhìn thẳng bắc là thấy tháp ở giữa khung, sau nó là bậc đá lên đèo.
- Dáng: bó **ống trúc to** (∅ 0,6–1,2 m) cao thấp khác nhau như ống sáo / đàn ống, ống cao nhất ≈ 14 m; buộc bằng 3 vòng dây
  thừng; mỗi ống có vài lỗ sáo; đỉnh vài dải lụa màu bay theo gió (không chữ). Đế đá tròn thấp ∅ ≈ 8 m, 2 bậc.
- Quanh đế: **5 cọc ống trúc thấp** (≈ 1,2 m) xếp vòng cung phía nam, mỗi cọc buộc một nơ màu khác (ứng 4 thanh + thanh nhẹ) —
  chỗ chơi "Trúc hát". Bãi Giữa còn chừa lối đi quanh tháp ≥ 4 m.
- Màu: trúc vàng lục `#C9C27A` / `#A8B26A`, đốt đậm `#7E8A4E`, dây `#B89C6A`, đá đế `#BDB7AA`, nơ `#E07A5F #F2C14E #6FA8DC #8BC48A #C3A3E0`.
- Ngân sách: một khối gộp, ≤ ~4k tam giác; không vật trong suốt.

## Phong cách
Đúng như ảnh cảnh hiện có: low-poly hoạt hình mềm, mặt phẳng tam giác, màu phấn, trời lam xám nhạt, sương xa. Không chữ Hán,
không chữ trên biển / lụa / cọc.

## Góc ảnh
1. `vao`: y khung `Canh-truc-lam-b3-bai-hac.png` (từ bãi hạc nhìn bắc, Tiểu Mặc ở trước), chỉ thêm tháp giữa thung.
2. `cong-trinh`: cận tháp, chếch ¾ từ tây nam, hơi từ trên (≈ 25°), thấy rõ đế, 5 cọc, dải lụa; Tiểu Mặc đứng cạnh để so cỡ.

## Tiêu chí chốt
- Nhận ra ngay "tháp làm bằng ống trúc biết hát"; không giống chùa / tháp gạch.
- Cảnh quanh tháp vẫn là thung trúc hiện có (đình trên gò trái, bậc đá, thác bên phải), không vẽ lại cả vùng.
- Cao đủ nổi giữa rừng trúc nhưng không che kín bậc đá lên đèo. Không chữ.

## Dán vào canvas
```text
PHIẾU CONCEPT: Thung Trúc Gió Hát (vùng rung-truc) — thêm Tháp Sáo Trúc (2026-11-17)
Giữ nguyên cảnh Trúc Lâm hiện có (ảnh design/screens/Canh-truc-lam-b3-bai-hac.png, -b3-dinh.png). Thêm một tháp ở tâm Bãi
Giữa Ø26 (0;0): bó ống trúc to cao thấp như đàn ống, cao nhất ≈14 m, 3 vòng dây thừng, lỗ sáo, dải lụa màu ở đỉnh; đế đá tròn
∅8 m; 5 cọc ống trúc thấp có nơ màu xếp cung phía nam (trò Trúc hát). Low-poly hoạt hình mềm, không chữ.
2 ảnh: vao (y góc bãi hạc), cong-trinh (¾ tây nam, ≈25°). Lưu design/concept/thung-truc-gio-hat/.
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: thung-truc-gio-hat
loai: concept
tham-chieu: design/screens/Canh-truc-lam-b3-bai-hac.png, design/screens/Canh-truc-lam-b3-dinh.png
mau: vao
```

```gemini chung
Concept art for a cozy children's mobile game about learning Chinese vocabulary (gentle ancient-Chinese fairy-tale world, cute, friendly — not realistic, not modern). Rendering style: EXACTLY like the attached in-game screenshots — soft low-poly 3D, faceted flat-shaded terrain, matte clay-like materials, pastel colours, pale grey-blue sky, soft distant haze, no harsh shadows. Keep the existing bamboo valley as it is (bamboo groves, the small hexagonal wooden pavilion on the rocky mound to the left, the long stone stairway up to the pass in the north, the waterfall on the right, the stone-paved path). ADD ONE new landmark: the "Singing Bamboo Tower" in the centre of the round clearing where the paths cross — a tall bundle of very thick bamboo tubes of different heights standing together like giant panpipes / an organ, the tallest about 14 m (about 12 times the child's height), bound by three thick rope rings, each tube with a few round flute holes, a few colourful silk ribbons (coral, yellow, sky blue, green, lilac) fluttering from the top; light yellow-green bamboo with darker nodes. It stands on a low round grey stone base with two steps. In front of it, on the south side, five short bamboo-tube posts in an arc, each tied with a bow of a different ribbon colour. No text anywhere: no Chinese characters, no letters, no signs, no logo, no watermark. Landscape 16:9.
```

```gemini vao
Same camera as the first attached screenshot: standing on the round light arrival plaza in the south, looking north along the brick path, the small chibi child in pale blue hanfu seen from behind in the foreground. The Singing Bamboo Tower now stands in the middle distance at the centre of the valley, on the path, clearly the focal point, with the stairway to the pass still visible behind and slightly to the right of it.
```

```gemini cong-trinh
Closer view of the Singing Bamboo Tower: three-quarter view from the south-west, camera slightly above (about 25 degrees down), the whole tower, its stone base, the five ribbon posts and the clearing around it in frame; the same small chibi child in pale blue hanfu stands next to the posts for scale; bamboo groves and soft hills behind.
```
