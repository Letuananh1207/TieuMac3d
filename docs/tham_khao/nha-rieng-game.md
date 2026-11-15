# Nhà / sân riêng của người chơi trong game (家園 · 庭院 · 洞天)
- Ngày: 2026-11-15 · Khu: Nhà của ta (`design/scene/nha-ta.json`) · Trạng thái: nháp — chờ người dùng chọn hướng (kế hoạch
  `docs/tasks/2026-11-15-nha-cua-ta-lam-lai.md`)
- Việc: V-20261114-48. Người dùng: "cấu trúc nhà rất xấu, không muốn người dùng ra được khỏi phạm vi nhà, chật, phân bố xấu
  — tham khảo các game khác làm như nào rồi làm".

## Một câu
Nhà riêng là **một mảnh đất nhỏ có ranh giới tự nhiên** (vách, nước, mây, rừng) — không phải hộp tường; ở giữa có một ngôi
nhà làm điểm nhấn, quanh đó vài "phòng ngoài trời" khác chất (sân lát sát nhà, vườn cỏ có nước, góc ngắm cảnh), một lối vào /
ra duy nhất, và chỗ trang trí nằm đúng chỗ camera nhìn thấy.

## Hiện trạng (chụp 2026-11-15, Canvas 3D `?vung=nha-ta`, bản trên `main` trước V-47)
Ảnh: `C:/Users/admin/AppData/Local/Temp/claude/651327167d39025b/51df7f0c-c8dd-448d-8a23-6df66204bf24/scratchpad/nha-lam-lai/`
(`01-tren`, `02-ca-san`, `03-cong-nam`, `04-san-truoc-tay`, `05-vuon`, `06-tren-thap`, `07-ngoai-tuong`, `08-cuoi-vuon`;
`09-tham-chieu-bong-lai-mep-vuc` = cảnh Bồng Lai làm mẫu ranh giới đảo).

| Chỗ | Thấy gì | Vì sao xấu |
|---|---|---|
| Cả cảnh (`06`, `07`) | Hộp tường vôi 32 × 26 m cao 2,8 m giữa một **mặt sàn gạch vô tận** (`ground.size` 90, `terrain` tắt), trúc mao trồng thẳng trên gạch | Không có "đất": trong tường và ngoài tường cùng một nền gạch rêu → không thấy đâu là nhà, đâu là ngoài. Trúc mọc trên gạch trông giả |
| Ra ngoài được (`07`) | Cổng nam mở ra nền gạch; vùng cổng về trấn chỉ rộng x −4 … 4 → bước lệch sang bên là đi vòng quanh tường thoải mái | Đúng lời người dùng: ra được khỏi phạm vi nhà |
| Chật (`05`, `08`) | Tường 2,8 m (cao hơn nhân vật 1,6 m gần gấp đôi) + tường ngăn 2,2 m cắt đôi sân; camera 4–6 m sau lưng thấy toàn tường | Tường cao gần camera = cảm giác hành lang / nhà kho. R-DIEU-4 kéo camera sát vào khi tường chắn → càng tù |
| Phân bố (`01`, `02`) | Nhà 10,5 × 6 dính tường sau; sân trước rộng trống (vòng trận ∅ 8 chiếm góc tây — V-47 bỏ); vườn đông là hộp trống 9,5 × 26 m; chỉ 2 cây trong sân | Không có lớp không gian: một sân lát lớn trơn + một hộp trống. Không có nước, không có chỗ ngồi, không điểm nhìn |
| Chất nền | Mọi chỗ cùng gạch vuông rêu `#7d8466` | Không phân biệt sân / vườn / lối (bài học V-42 "mỗi khu một chất nền" chưa áp vào nhà) |
| Cổng (`03`) | Từ chỗ tới nhìn thẳng vào mái cổng + biển to che nửa màn | Ảnh đầu tiên khi về nhà là một mảng xám |
| Ô trang trí | 3 ô trong nhà sát tường sau, 6 ô vườn rải trong hộp trống, 3 ô sân ngẫu nhiên | Vật đặt vào không "ăn" với gì — không có lối, nước, chỗ ngồi để tựa vào |

## Đặc điểm nhận diện (thiếu là "không ra chất" nhà riêng)
1. **Ranh giới tự nhiên, có lý do trong truyện**, nhìn thấy từ xa: vực + biển mây, nước, vách núi, rừng dày. Không tường bao bốn
   phía; tường vô hình chỉ là cách cuối.
2. **Một lối vào / ra** rõ ràng, có "khung" (cổng, bậc, bến) — và **chỗ xuất hiện nhìn thẳng về nhà** (ảnh đầu tiên được bố cục).
3. **Nhà là điểm nhấn trên trục**: dựa lưng vào thứ cao (đồi, rừng), mặt nhìn ra khoảng mở / nước (背山面水 bối sơn diện thuỷ).
4. **Vài "phòng ngoài trời" khác chất**: sân lát nhỏ sát nhà (đồ sân, bàn trà) · vườn cỏ mềm có ao · góc ngắm cảnh có đình /
   lan can ở mép. Mỗi khu một chất nền.
5. **Lấp đầy có chủ đích, chừa khoảng trống có chủ đích**: dày ở mép (cây, đá, bụi che mép đất), thoáng ở giữa (đường đi, sân).
6. **Chỗ trang trí bám theo cấu trúc** (cạnh lối, quanh ao, hai bên thềm, trong đình) — đặt gì vào cũng thành bố cục.
7. **Thấp, mở quanh camera**: vật cao chỉ ở hậu cảnh (đồi, rừng, nhà); quanh lối đi chỉ lan can, bụi, tường hoa ≤ 1,5 m.

## Các game làm thế nào
| Game | Bố cục nhà / sân | Ranh giới | Vào / ra | Bài học cho mình |
|---|---|---|---|---|
| **Genshin — Serenitea Pot 塵歌壺** (động thiên trong ấm) | Mỗi "Realm Layout" là một khối đất có sẵn địa hình + một dinh thự (mansion) đặt sẵn trên chỗ cao; người chơi đặt đồ tự do trên mặt đất. *Floating Abode*: chuỗi đá nổi trên mây nối nhau; *Emerald Peak*: đỉnh núi cao, mảng đất phụ nối bằng cầu treo; *Sublime Spicewood*: cây lớn + biển mây | **Mép đảo / vách + biển mây** bao quanh; ngoại vi gần như không chi tiết, cây và cảnh để sát mép | Vào bằng ấm (vật mang theo), xuất hiện ở bãi trước dinh, rời bằng chính ấm | Mẫu gần nhất với cổ trang – tiên hiệp: **nhà riêng = một tiểu động thiên trên mây**. Ranh giới là mép đất, thứ người chơi hiểu ngay là "không đi được" |
| **Animal Crossing: New Horizons** | Nhà chỉ là một ô đất 6×6 → 8×8 → 10×6 ô (Nookipedia); sân tự do quanh nhà, hàng rào đặt đâu cũng được; hộp thư trước cửa, bụi cây trang trí hai bên khi nhà chưa nở; đèn ngoài tự sáng khi tối | Cả đảo khép bằng **biển + bãi cát + vách đá**; trong đảo chia khu bằng sông, vách bậc | Một sân bay / bến (cầu tàu) duy nhất | Quy mô thân mật: nhà chiếm ít đất, sân trước là chỗ khoe đồ. Đồ trang trí sát nhà, dọc lối. Đèn trước cửa sáng theo giờ (mình đã có ngày đêm) |
| **Stardew Valley** | Trang trại là một khoảng đất rộng, nhà ở góc trên, quanh nhà có hòm thư, bãi trống để xây | **Vách đá + rừng dày + nước** ở mép bản đồ; người chơi không thấy "tường" | Vài lối ra ở mép (bến xe, rừng, núi sau) — mỗi lối là một **khe trong rừng / vách** | Mép bản đồ = dày cây + vách, khe ra vào là chỗ thưa cây có lối mòn. Nhà dựa vào mép sau |
| **摩尔庄园 / Mole's World** (tham khảo cấu trúc dự án) | Mỗi người một **trang trại riêng** (农庄): nhà nhỏ + ruộng + chỗ đặt đồ; trang trí nhà bằng đồ mua; thăm nhà bạn, "hàng xóm" (邻居庄园) | Mảnh đất có mép rõ, ngoài là cảnh nền (cây, nước), không ra được | Từ thế giới chung đi vào bằng cửa / bản đồ | Nhà gắn với vòng chơi hằng ngày (chăm, trang trí, khoe). Bố cục trước sau nhà phải chừa chỗ cho thăm nhà về sau |
| **Sky: Children of the Light — Home / Aviary**; **Hello Kitty Island Adventure**; **Ooblets** (quan sát chung, không có số đo) | Không gian riêng nhỏ, nhìn ra cảnh lớn (mây, biển) | Mây / nước / vách; Ooblets dùng hàng rào gỗ + cây dày | Một cổng / cửa | Cảnh xa đẹp làm cho chỗ nhỏ không thấy chật: **nhìn ra được xa** quan trọng hơn rộng thật |
| Game cổ trang Trung Quốc có nhà riêng (逆水寒 庄园, 梦幻西游 庭院 — chỉ tìm thấy bài chơi, không có số đo) | Dinh thự + sân vườn trong khung núi sông; người chơi hay làm "中式山水": nhà + hoa cỏ + ao cạn hoà vào nhau | Núi, nước bao quanh mảnh đất | Cổng chính | Người chơi Trung Quốc kỳ vọng **sơn thuỷ quanh nhà**, không phải sân gạch |

### Kiến trúc thật để lấy "chất"
- **Tứ hợp viện 四合院** (Wikipedia Siheyuan): cổng ở góc đông nam, có ảnh bích 影壁 ngay sau cổng che tầm nhìn; **chính phòng
  正房 ở bắc nhìn nam**, sương phòng 廂房 đông tây đối nhau, hành lang có mái nối các nhà; tường sau (tây bắc) cao hơn để chắn gió.
  → bài học: nhà chính ở bắc nhìn nam, hai bên có hành lang / nhà phụ quây sân, cổng không nhìn thẳng vào nhà.
- **Vườn Giang Nam — Võng Sư Viên 網師園** (Wikipedia): cả vườn + nhà ≈ 5 400 m²; **ao Thải Hà 彩霞池 chỉ 334 m²** là tâm vườn;
  nhà nhỏ đặt sát nước, nhà lớn lùi sau hàng cây → ao trông rộng hơn; nội viện 667 m². → bài học: một vườn đẹp chỉ cần vài trăm m²
  và **một mặt nước ở tâm**; nhà lớn lùi lại, đồ nhỏ sát nước.
- Hồ sơ đã có: `kien-truc-chuan.md` (nhà dân C5 ≤ 3 gian, mái 懸山 / 硬山 ngói xám, không cột son; hành lang `lang` lòng
  1,2–1,5 m, cột 2,5 m; 垂花門 rộng 2,5–3,3 m), `giang-nam.md` (lậu song 漏窗 trên tường ngăn).

## Quy chế · cấp bậc
Nhà của người chơi = **C5** (nhà dân): 3 gian, mái hai dốc ngói xám, cột gỗ sẫm (không son đỏ — hiện `nha-o` có cột / đèn lồng đỏ
ở hiên, giữ được vì là đèn lồng, nhưng cột nên là `timber`). Cổng nhà: cổng lầu 門樓 nhỏ (lối 2,2–2,8 m), không bài phường 牌坊
(bài phường là C2–C3, quá trang trọng cho nhà riêng).

## Tỉ lệ · số đo (mét, hệ cảnh — nhân vật 1,6 m, đi 3,2 m/s, chạy 7 m/s)
| Bộ phận | Game / ngoài đời | Hiện tại | Đề xuất | Ghi chú |
|---|---|---|---|---|
| Cả phạm vi đi được | AC: nhà là một góc của đảo; Serenitea: một khối đất vài chục m | 32 × 26 trong tường (832 m²) + nền gạch vô tận ngoài | **đảo ∅ ≈ 52–56 m** (mép `edge.radius` 28 quanh (0; −2)); phần đi được ≈ 1 600–1 800 m² | chạy ngang đảo ≈ 7 s, đi bộ ≈ 15 s — đủ "đi dạo", không mỏi |
| Sân trong (nội viện) | Tứ hợp viện nhỏ Bắc Kinh: sân ~ 10–15 m mỗi cạnh (suy luận từ mặt bằng thường gặp) | sân trước 22,5 × 26 trống | **18 × 16 m** lát đá, hai bên hành lang | đủ 3 ô sân + lối giữa, không trống |
| Nhà chính | dân ≤ 3 gian, gian 3–3,3 m | 10,5 × 6 | giữ **10,5 × 6** (3 gian 3,5 m) | giữ nguyên `nha-o`, giữ 3 ô `trong` |
| Ao | Võng Sư Viên 334 m² (vườn 5 400 m²) ≈ 6 % | không có | **∅ 6–7 m (~30–40 m²)** ở vườn đông | 6 ô vườn quây quanh ao |
| Tường / lan can quanh lối | — | 2,8 m bao + 2,2 m ngăn | **không tường bao**; lan can gỗ / đá **0,8 m**; tường ngắn hai bên cổng **2,8 m** (chỉ ở cổng) | lan can không kéo camera (R-DIEU-4) |
| Hậu cảnh cao | dựa núi | trúc mao 12–18 m mọc trên gạch | **đồi sau cao 8–10 m** + trúc mao trên đồi, mép đảo cây thấp | 背山面水 |
| Chiếu nghỉ cổng ra | — | vùng chạm 8 × 3,5 ngoài cổng | chiếu nghỉ 8 × 8 m lát đá ở mép nam, lan can đá hai bên | khớp "lối xuống núi" ở trấn (R-HANH-4) |

## Màu
| Vai trò | Hex | Có trong `phong_cach.md`? | Nguồn / lý do |
|---|---|---|---|
| Cỏ đảo (3 sắc) | `#8DBF5A` · `#A6CC66` · `#79AD52` | có (hướng A Xuân ấm, `canh-hoat-hinh-mem.md`) | khớp Khởi Nguyên Trấn — nhà là "cùng một thế giới" |
| Sân lát nội viện | `#C9C1B0` (đá nhạt ấm) | gần `stone` của trấn sau V-42/V-44 | sáng hơn cỏ → sân đọc rõ từ trên |
| Vách đảo | đất `#B98A6A` / đá `#A99A8C` | có (Bồng Lai dùng đất đỏ nâu) | mép đảo đọc như "đất nổi trên mây" |
| Tường vôi / ngói | `#F1EEE6` / `#3B3F44` | có | giữ |
| Biển mây | `#F4F1EA` | có | giữ |

## Hướng (cách khép phạm vi — chờ người dùng chọn)
- **A — Tiểu động thiên trên mây** (như Serenitea Pot *Floating Abode* / *Emerald Peak*; mình có sẵn mép vực + biển mây như
  Bồng Lai, ảnh `09`): nhà nằm trên một mỏm đảo, mép đổ xuống biển mây, nhân vật dừng ở mép (R-VA-2 đã có). Khớp truyện:
  ở trấn đi **xuống núi vào biển mây** thì tới nhà. Khuyên.
- **B — Thung lũng kín** (như Stardew): đảo vẫn phẳng nhưng bao bằng đồi dốc > 35° + rừng trúc dày, không thấy mây. Kín đáo hơn,
  nhưng không nhìn ra xa → dễ thấy chật lại; tốn cây hơn.
- **C — Giữ hộp tường, chữa cháy**: hạ tường 1,5 m, thêm bụi. Rẻ nhất nhưng vẫn là "hộp tường", vẫn phải chặn ngoài cổng bằng
  vật cản vô hình. Không khuyên.

## Dựng low-poly
| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ước draw call |
|---|---|---|---|
| Đảo + vách + cỏ búi + đá rải | mới | `terrain` (edge, plateaus, peaks, grass, rocks, floors) | 3–5 |
| Biển mây + núi xa | giữ / bật | `cloudSea`, `farMountains` | 3 |
| Nhà chính `nha-o` | giữ | như cũ | ~8 |
| Hành lang hai bên sân | mới | `galleries` (cần thử không có nước) hoặc `fences` + cây | 4–6 |
| Đình ngắm mây | mới | `buildings` `dinh` 6 cạnh | 3 |
| Ao + bờ | mới | `water` tròn | 1–2 |
| Lan can gỗ / đá | mới | `fences` | 1–2 |
| Cổng lầu + 2 đoạn tường ngắn | thay | `wallSegments` + `gate.kind: lau` | 4 |
| Cây (tùng, liễu, mai, bụi, trúc mao đồi sau) | thay | `trees.yard`, `trees.groves` | 6–8 |
| Bỏ: tường bao 4 phía, tường ngăn, vòng trận (V-47), nền gạch vô tận | bỏ | — | −15 |
Tổng ước (chưa vật trang trí): **≈ 60–80**; đủ 12 ô + dấu ô ≤ +20 → **≤ 100** (ngân sách 150).

## Sai thường gặp cần tránh
- Lấy tường bao làm ranh giới (đang mắc). Tường chỉ dùng **ở cổng** và quanh sân trong, thấp.
- Đảo tròn đều như cái đĩa: cần `wobble` mép + đồi sau lệch tâm + cây dày ở mép sau, thưa ở mép trước (chỗ ngắm).
- Rải đồ đều khắp: phải dày ở mép, thoáng ở trục giữa; ô trang trí bám lối / ao / thềm.
- Trúc mao 12–18 m sát lối đi → che camera và làm thấy chật; chỉ để ở đồi sau / mép xa.
- Cổng nhìn thẳng vào nhà khi đứng sát cổng → chỗ xuất hiện phải lùi vào trong cổng, camera nhìn về nhà (không nhìn mái cổng).
- Biến nhà thành bản sao Bồng Lai: đảo nhà nhỏ hơn hẳn (∅ ~55 m so với Bồng Lai ~120 m), không đá đỏ cao, không tháp; tông ấm
  gia đình (đèn lồng, bàn trà, ao sen).

## Đưa vào cảnh
- Tả được ngay bằng `nha-ta.json`: `terrain` (`enabled`, `center`, `size`, `cell`, `plateaus`, `peaks`, `edge`, `grass`, `rocks`,
  `floors`, `colors`), `cloudSea`, `farMountains`, `fences` (`go` / `da`), `galleries`, `buildings` (`nha-o`, `dinh`), `water`,
  `wallSegments` + `gate`, `trees`, `paths`, `site.areas`, `portals`, `player`, `decorSlots`.
- Cần kiểm (có thể cần code nhỏ): `galleries` dùng ở chỗ không có nước; `decorSlots` trên `terrain` (`specCheck` "flat");
  minimap đảo cho cảnh nhà (`areaMapScenes.test.ts`); hành lang có kéo camera không (R-DIEU-4).

## Nguồn
- Nookipedia — Player house (ACNH: ô nhà 4×4 lều → 6×6 → 8×8 → 10×6, hàng rào đặt tự do, hộp thư, đèn ngoài tự sáng) —
  https://nookipedia.com/wiki/Player_house
- HyperX — Genshin Impact Realm Layouts guide (Floating Abode, Emerald Peak, Cool Isle) —
  https://blog.hyperx.com/article/11670/genshin-impact-realm-layouts-guide-floating-abode-emerald-peak-cool-isle
- Game Rant — Genshin realm layout select — https://gamerant.com/genshin-impact-realm-layout-select/
- Into the Blue Sky — All Serenitea Pot realms (ngoại vi ít chi tiết, cây sát mép) — https://intothebluesky.com/2021/05/06/all-serenitea-pot-realms/
- Stardew Valley Wiki — Farm Maps (không đọc được — 403; lấy hiểu biết chung: vách + rừng + nước bao, lối ra ở mép) —
  https://stardewvalleywiki.com/Farm_Maps
- Moegirl — 摩尔庄园 (mỗi người một nông trang riêng, trang trí, hàng xóm) — https://mzh.moegirl.org.cn/%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD
- Xiaomi Game — 摩尔庄园手游 邻居庄园 — https://game.xiaomi.com/viewpoint/1359077112_1636538592063_13
- 游民星空 — 逆水寒 庄园 地形编辑 (sơn thuỷ quanh nhà) — https://www.gamersky.com/handbook/201809/1096809.shtml
- Wikipedia — Invisible wall (tường vô hình là cách cuối, phá nhập vai) — https://en.wikipedia.org/wiki/Invisible_wall
- Unity Discussions — Believable level borders (núi, vách, rừng dày, nước làm biên) — https://discussions.unity.com/t/believable-level-borders/588480
- Wayline — Invisible walls in open-world design — https://www.wayline.io/blog/invisible-walls-guiding-freedom-open-world-games
- Wikipedia — Siheyuan (cổng đông nam, ảnh bích, chính phòng bắc nhìn nam, sương phòng, hành lang) — https://en.wikipedia.org/wiki/Siheyuan
- Wikipedia — Master of the Nets Garden (5 400 m², ao 334 m², nội viện 667 m², nhà lớn lùi sau cây) —
  https://en.wikipedia.org/wiki/Master_of_the_Nets_Garden
- Ghi chú: nhiều trang về Serenitea Pot / 摩尔庄园 không có số đo; các nhận định về bố cục ghi là **quan sát chung / quy ước
  thể loại**, số đo trong bảng "Đề xuất" là **suy luận** cho dự án.
