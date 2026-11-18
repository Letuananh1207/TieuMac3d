# Bố cục nhà + vườn trên đảo nhà riêng (家園 · 庄園 · 菜地 · 動線)
- Ngày: 2026-11-18 · Khu: Nhà của ta (`design/scene/nha-ta.json`) · Việc: V-20261118-82 (mở rộng) · Trạng thái: nháp — đã chuyển
  phiếu ảnh concept `docs/phieu_thiet_ke/2026-11-18-concept-nha-vuon-bo-cuc.md` (chờ ảnh + người dùng chọn).
- Người dùng (sau khi xem ảnh 3 phương án "vườn dễ vào"): "Tôi nghĩ cũng nên đổi vị trí nhà và vườn tôi nghĩ nên tham khảo của
  các game như 摩尔 hay animal crossing,.." → không chỉ dời vườn: **bố cục lại cả đảo** (nhà, vườn, chỗ xuất hiện, lối, khu
  trang trí tự do, thùng thu mua, chỗ về trấn).
- Kế thừa: `vuon-de-vao.md` (7 nguyên tắc vườn — vẫn đúng, dùng lại), `nha-rieng-game.md` (ranh giới đảo, 背山面水, hậu cảnh
  cao ở mép sau), `vuon-mole.md` (vòng công cụ). Chỉ học **bố cục và nhịp đi lại**, không chép hình / tên.

## Một câu
Nhà riêng được yêu thích có **một trục đón**: xuất hiện → thấy ngay cái mình chăm hằng ngày (ruộng chín lấp lánh) và nhà ở cuối
tầm nhìn; nhà, ruộng, thùng bán **gom thành một cụm trong ~15 m**, phần đất còn lại để **trống có chủ đích** cho người chơi bày
— không phải nhà một góc, ruộng một góc, giữa là bãi cỏ phải băng qua.

## 1. Hiện trạng (đặc tả `nha-ta.json`, đi bộ 3,2 m/s)
| Thứ | Chỗ | Ghi chú |
|---|---|---|
| Đảo | tâm (0; −2), mép vực r ≈ 27 m (wobble 1,5); nền phẳng x −23 … 17, z −18 … 13 + thềm đông x 13,5 … 23, z −6 … 6 | đi được ≈ 1 700 m²; đồi trúc sau z < −17 (đỉnh (−6; −25) cao 8, (9; −24) cao 5) |
| Bến mây + về trấn | x −3 … 3, z 13 … 23, lan can gỗ; vòng "Khởi Nguyên Trấn" (0; 21) | lối ra đi bộ duy nhất |
| Chỗ xuất hiện | cưỡi hạc (0; 6,5) nhìn bắc · đi bộ (0; 10) | camera gần: lùi 4,2 m, chúc 0,32 rad |
| Nhà chính | 10,5 × 6, tâm (−15; −8) nhìn nam, sát mép tây; vòng cửa (−15; −3,4) | đi lối trục rồi rẽ tây: 7,9 + 15 + 2 ≈ **24,9 m · 7,8 s · 1 rẽ** |
| Vườn rau | rào kín x 3,5 … 16,5, z −16 … −3, 1 cổng tây z −9,5; 12 luống 1,6 m bước 2,6 | luống gần **21,1 m**, xa **25,1 m** (2 rẽ + quay lui) |
| Thùng thu mua | (2,4; −7,6) ngoài cổng | 14,3 m |
| Chỗ trang trí | `decorArea` cả đảo trừ lối, luống, cửa | thực tế: bãi cỏ giữa nhà và lối trục + mép nam |

Vấn đề bố cục (không chỉ rào): nhà và vườn **ở hai mép đối nhau** (cách nhau ~24 m), chỗ xuất hiện ở giữa phía nam, **mỗi việc
hằng ngày là một chuyến đi riêng** (về nhà → vườn 21 m → thùng → nhà 25 m). Ảnh đầu tiên lúc về: lối đá dài + bãi cỏ trống.

## 2. Các game làm thế nào
| Game | Chỗ xuất hiện | Nhà so với chỗ xuất hiện | Ruộng / vườn so với nhà | Lối · rào | Chỗ trang trí | Nguồn · độ tin |
|---|---|---|---|---|---|---|
| **摩尔庄园 手游 (2021)** — 家园 / 农庄 | vào nông trang của mình từ thế giới chung (cửa / bản đồ) | nhà nhỏ (小屋) là một vật trong nông trang, vào trong là cảnh riêng | ruộng **ngay quanh nhà**, cùng một mảnh đất; ruộng mở rộng dần theo cấp | rào (栅栏) và gạch lát (地砖) là **đồ người chơi mua ở tiệm đồ gỗ rồi tự đặt** — rào là trang trí / viền | mọi chỗ trong nông trang, có "家装设计" lưu nhiều phương án | [moegirl], [xiaomi 家具], [xiaomi 地砖], [taptap] · trung bình (không có bản đồ đo; vị trí "ruộng quanh nhà" là quan sát chung) |
| **摩尔庄园 网页版 (2008)** | vào "家园" là cả màn 2D | nhà là màn riêng (trang trí phòng) | nông trang / mục trường là màn riêng cạnh nhà — chạm cây mở vòng thao tác | không đi bộ tới ô | phòng trong nhà | [moegirl], [baidu zhidao] (xem `vuon-de-vao.md`) · thấp về bố cục |
| **Animal Crossing: New Horizons** | sân bay cố định ở mép **nam** đảo; Resident Services giữa đảo (12 × 10 ô, không dời được) | **người chơi tự chọn chỗ** đặt lều (cần ô trống 5 × 4), dời nhà sau bằng tiền; nhiều người đặt nhà ở nửa sau đảo, khu công cộng nửa trước | không có ruộng sẵn; hoa / cây ăn quả trồng **tự do quanh nhà**; hộp thư ngay trước cửa | lối tự vẽ, rào là đồ tự đặt (bản cũ có rào sẵn quanh lô nhà — bỏ ở NH) | sân trước là "phòng khách ngoài trời" — chừa chỗ trước nhà cho bậc + đồ | [nookipedia house], [nookipedia town], [essentiallysports], [belltree] · cao về số ô; thấp về "nhà nửa sau" (ý kiến người chơi) |
| **Stardew Valley** (Standard Farm) | xe buýt / cổng **đông** của trang trại | nhà ở góc trên trái của trang trại | đầu game: một ít củ cải gieo sẵn **ngay dưới / cạnh nhà**; thùng giao hàng **sát bên phải cửa nhà** | không rào sẵn quanh ruộng; người chơi khuyên đặt ruộng sát nhà + thùng để đỡ đi | phần đất còn lại cực rộng, tự dọn | [sdv fandom], [progameguides], [exitlag] · trung bình (wiki chính 403; vị trí thùng từ wiki fandom) |
| **Hay Day** | màn hình mở ra ở góc nhìn đầu | nhà ở mép trên | lời khuyên người chơi: **ruộng đặt ở phần trên trang trại để thấy ngay khi vào**, công trình xếp sau ruộng; thứ hay chạm (ong, sóc) nằm trong "góc nhìn đầu" | rào chỉ trang trí | kéo thả mọi thứ | [gamepur hd], [homestyler] · trung bình (lời khuyên cộng đồng) |
| **Palia** | ô nhà riêng (housing plot) | nhà đặt tự do trên ô (Harvest House ≈ 11 × 11 m) | ruộng, máy, đồ tự đặt cùng ô | — | 3 000 món / ô; mở thêm ô đất bằng giấy phép | [palia wiki], [techraptor] · trung bình |

> Không bài nào đo bằng mét; số dưới là quy đổi của mình cho đảo ∅ ≈ 54 m, đi bộ 3,2 m/s. Nguồn tiếng Trung về bản đồ nông
> trang 摩尔 手游 rất ít (tìm 5 lượt, chỉ thấy bài về đồ / rào / gạch) → điều rút ra từ 摩尔 ghi "quan sát chung, chưa kiểm chứng".

### Điều chung rút ra
1. **Trục đón từ một mép**: ACNH sân bay mép nam, Stardew cổng đông, nhà ta Bến mây nam — giữ Bến mây (đúng truyện "xuống núi
   vào biển mây"), đổi thứ nằm trên trục.
2. **Nhà, ruộng, thùng là một cụm**: Stardew thùng sát cửa + ruộng sát nhà; 摩尔 ruộng quanh nhà; ACNH hộp thư trước cửa.
3. **Cái chăm hằng ngày trong góc nhìn đầu** (Hay Day): luống chín lấp lánh thấy ngay khi về.
4. **Nhà ở cuối tầm nhìn, dựa lưng vào thứ cao** (ACNH nhà nửa sau; tứ hợp viện chính phòng bắc nhìn nam; 背山面水 —
   `nha-rieng-game.md`): nhà là điểm nhấn, không đứng chắn trước mặt lúc xuất hiện.
5. **Rào / lối là đồ người chơi**, cảnh dựng sẵn chỉ cần viền thấp, không hộp kín (摩尔 栅栏 mua ở tiệm, ACNH rào tự đặt).
6. **Đất trống có chủ đích, liền mảng**: ACNH / Palia / 摩尔 cho bày khắp nơi, nhưng chỗ đẹp nhất để bày là **một mảng lớn liền
   nhau nhìn thấy từ trục đón** + sân trước nhà (ACNH "chừa chỗ trước nhà").

## 3. Nguyên tắc có số đo (cho đảo hiện tại)
| # | Nguyên tắc | Số đích | Hiện |
|---|---|---|---|
| N1 | Luống gần nhất từ chỗ xuất hiện | ≤ 6 m (≤ 2 s), 0 rào chắn | 21,1 m |
| N2 | Luống xa nhất | ≤ 14 m (≤ 4,5 s) | 25,1 m |
| N3 | Cửa nhà (vòng sáng) từ chỗ xuất hiện theo lối | ≤ 16 m (≤ 5 s), ≤ 1 rẽ | 24,9 m |
| N4 | Cụm nhà – vườn – thùng: luống xa nhất tới cửa nhà / tới thùng | ≤ 16 m / ≤ 10 m | 31 m / 13 m |
| N5 | Góc nhìn đầu (camera gần 4,2 m, chúc 0,32 rad, FOV 55, nhìn bắc) | thấy ≥ 4 luống + mặt tiền nhà; không vật cao > 1,5 m trong 8 m trước mặt | thấy lối + bãi cỏ; vườn xa bên phải |
| N6 | Đất trang trí liền mảng lớn nhất (ngoài lối, luống, cửa) | ≥ 250 m², thấy từ trục đón | các mảnh vụn quanh lối |
| N7 | Không rào chắn quanh vườn; viền luống ≤ 0,35 m không va chạm; lối ≥ 2,4 m, lối giữa luống ≥ 1 m | — | rào 0,6 m kín, cổng 1,6 m |
| N8 | Nhà dựa lưng đồi / mép đảo, nhìn nam (giữ hướng model `nha-ta` và ánh sáng mặt trời tây nam) | lưng nhà cách chân đồi ≤ 4 m | lưng nhà ở mép tây |
| N9 | Giữ Bến mây, chỗ xuất hiện (0; 6,5) / (0; 10), vòng về trấn (0; 21) | không đổi | — |

## 4. Ba bố cục (chỉ phác — đo lại trên Canvas 3D khi dựng)
Chung cả ba: Bến mây, chỗ xuất hiện, vòng về trấn giữ nguyên (N9); 12 luống 1,6 m bước 2,6 m, không rào, viền đá cuội thấp; chạm
luống ở đâu cũng mở vòng công cụ (bỏ "đứng trong rào"); không thêm vòng trận ở nhà (R-NHA-1). Quãng đi đo từ (0; 6,5), 3,2 m/s.

### A — "Trục giữa": nhà cuối trục, ruộng hai bên lối (kiểu sân nhà nông 前院菜畦 + 摩尔 ruộng quanh nhà) — **khuyên**
```
 z
-20  ^^^^^^^^^^^^^^^ đồi trúc ^^^^^^^^^^^^^^^
-14            [=====  NHÀ  =====]            nhà tâm (0; −11,5), 10,5 × 6, nhìn nam
 -8      ......[ sân trước lát đá ]......     sân x −7 … 7, z −8,5 … −5,5; vòng cửa (0; −7,9)
 -3  cỏ   [o][o] ‖ [o][o]    cỏ             luống: x ±3,4 / ±6,0 · z 2,6 / 0 / −2,6
  0  trang [o][o] ‖ [o][o]  trang
  3  trí   [o][o] ‖ [o][o]   trí             thùng (2,3; 5,0) mép lối
  6  TÂY        T ‖ □                ĐÔNG      T = xuất hiện (0; 6,5)
 13           ===‖=== Bến mây
     x: −22 ………… −8   −6 … 6   8 ………… 22
```
- Quãng đi: luống gần (±3,4; 2,6) **5,2 m · 1,6 s** · luống xa (±6; −2,6) **10,9 m · 3,4 s** · cửa nhà **14,4 m · 4,5 s · 0 rẽ** ·
  thùng 2,5 m. Luống xa → cửa 7,6 m.
- Trang trí: hai cánh cỏ tây x −22 … −8 (≈ 330 m²) và đông x 8 … 22 + thềm đông (≈ 350 m²), sân trước nhà 14 × 3.
- Ưu: mọi thứ trên **một trục thẳng**, 0 rẽ; ảnh đầu tiên = luống hai bên + nhà cuối lối (đẹp, "về nhà"); nhà dựa đồi trúc
  (背山). Nhược: đối xứng hơi trang trọng; vườn chia đôi bởi lối; nhà che bớt đồi trúc; cánh trang trí tách hai bên.

### B — "Cụm tây": nhà + vườn trước cửa ở nửa tây, nửa đông để trống (kiểu Stardew nhà–ruộng–thùng một cụm + ACNH đất tự do)
```
 z
-20  ^^^^^^^^^^^^^ đồi trúc ^^^^^^^^^^^^^
 -6   [==== NHÀ ====]                            nhà tâm (−9; −4), nhìn nam, vòng cửa (−9; −0,4)
 -0,4 ======lối======‖                             lối nhánh z −0,4 từ trục sang cửa
  2   [o][o][o][o]  □‖        ĐẤT TRỐNG             thùng (−2,2; 1,4)
  5   [o][o][o][o]   ‖      TRANG TRÍ               luống: x −4,4 / −7,0 / −9,6 / −12,2 · z 2,4 / 5,0 / 7,6
  7,6 [o][o][o][o]   T      (≈ 520 m²)              T = (0; 6,5)
 13               ===‖=== Bến mây
     x: −14 …… −3   0     3 …………………… 22
```
- Quãng đi: luống gần (−4,4; 7,6) **4,5 m · 1,4 s** · luống xa (−12,2; 2,4) **12,9 m · 4,0 s** · cửa nhà theo lối 6,9 + 9 =
  **15,9 m · 5,0 s · 1 rẽ** (thẳng 11,5 m) · thùng 5,6 m. Luống xa → cửa 4,3 m (cụm chặt nhất).
- Trang trí: **một mảng liền** nửa đông x 2 … 22, z −16 … 12 + thềm đông (≈ 520 m²) — chỗ sau này đặt ao, đình ngắm mây.
- Ưu: cụm chặt nhất (N4), đất trang trí lớn nhất (N6). Nhược: lúc mới cài nửa đông **trống trơn** ngay bên phải ảnh đầu tiên
  (trông cụt một bên tới khi người chơi bày); nhà không ở cuối trục (nhìn chéo).

### C — "Vườn đón khách": vườn giữa đảo ngay trước chỗ xuất hiện, lối xuyên giữa vườn, nhà tây bắc sau vườn (kiểu Hay Day "ruộng trong góc nhìn đầu" + 摩尔 "vào là đứng trong nông trang")
```
 z
-20  ^^^^^^^^^^^^^^^ đồi trúc ^^^^^^^^^^^^^^^
-12   [==== NHÀ ====]                                nhà tâm (−8; −9), nhìn nam, vòng cửa (−8; −5,4)
 -5,4 =======lối=====‖                                lối nhánh z −5,4 từ trục sang cửa
 -3        [o][o] ‖ [o][o]        TRANG TRÍ           luống: x ±2,0 / ±4,6 · z 2,0 / −0,6 / −3,2
  0        [o][o] ‖ [o][o]        ĐÔNG                (một khối vuông 11 × 8 m, trục đi xuyên giữa)
  2        [o][o] ‖ [o][o] □       + thềm đông         thùng (6,2; 3,0) góc đông nam vườn
  6   TRANG TRÍ TÂY  T                                T = (0; 6,5)
 13             ===‖=== Bến mây
```
- Quãng đi: luống gần (±2; 2) **4,9 m · 1,5 s** · luống xa (±4,6; −3,2) **10,7 m · 3,3 s** · cửa nhà 11,9 + 8 = **19,9 m · 6,2 s
  · 1 rẽ** (thẳng 14,3 m) · thùng 7,0 m.
- Trang trí: tây nam x −22 … −6, z −2 … 12 (≈ 220 m²) + đông x 8 … 22 + thềm (≈ 350 m²).
- Ưu: vườn là **quảng trường giữa đảo**, về là đứng trước ruộng; nhà lệch trục nên đồi trúc giữa vẫn lộ. Nhược: cửa nhà xa nhất
  (vượt N3 4 m); phải đi xuyên vườn mỗi lần vào nhà; vườn giữa chia cắt đất trang trí.

### So nhanh
| | Luống gần / xa | Cửa nhà | Rẽ tới cửa | Mảng trang trí lớn nhất | Ảnh đầu tiên |
|---|---|---|---|---|---|
| Hiện | 21,1 / 25,1 m | 24,9 m | 1 | vụn | lối + cỏ trống |
| **A** | **5,2 / 10,9** | **14,4** | **0** | ~350 m² ×2 | luống 2 bên + nhà cuối lối |
| B | 4,5 / 12,9 | 15,9 | 1 | **~520 m²** | luống trái + nhà trái, phải trống |
| C | 4,9 / 10,7 | 19,9 | 1 | ~350 m² | vườn chiếm giữa, nhà lệch |

**Khuyên A**: đạt mọi đích N1–N8, ngắn nhất tới cửa (0 rẽ), ảnh "về nhà" rõ nhất (đúng ý người dùng "nhà và vườn" cùng một chỗ,
kiểu 摩尔 ruộng quanh nhà). Nếu người dùng muốn **nhiều đất bày đồ liền một mảng** → B. C khi muốn vườn là nhân vật chính của đảo.

## 5. Luật sẽ phải đổi (sau khi chốt ảnh)
- **R-NHA-1** — chỗ cửa nhà (vòng sáng nhỏ, ví dụ "đi theo lối nhánh tây tới nhà chính"), chỗ ra từ gian trong `(−15; −2,6)` →
  trước cửa mới; câu "(nhà chính bên trái, Vườn rau bên phải — V-68)" → hướng nhìn mới (A: nhà trước mặt, vườn hai bên).
- **R-NHA-5** — cả đoạn bố cục: nhà chính (tâm, hướng), sân trước, lối trục "tới ngang cổng Vườn rau", lối nhánh, "rào tre thấp
  chặn như lan can", ví dụ "(−6; −12) bãi cỏ giữa nhà chính và lối trục", "nhà chính bên trái".
- **R-NHA-7** — vùng cấm: "lối lát trục … lên cổng Vườn rau", "lối qua cổng vườn", "nhà / rào", "không làm mất đường đi … tới cổng
  vườn" → lối mới, luống, thùng; ví dụ "Hàng bàn trà quây kín cổng vườn", "Chậu lan trong rào vườn".
- **R-NHA-3** — không đổi chữ, nhưng ghi ví dụ dời bố cục: món đặt cũ nay đè nhà / luống / lối mới → dời ≤ 1,5 m hoặc về túi.
- **R-VUON-1** — vị trí vườn, bỏ rào + cổng, thùng "ngoài rào cạnh cổng" → chỗ mới; ví dụ "đi theo lối nhánh qua cổng vườn".
- **R-VUON-2** — bỏ "đứng trong rào" (chạm luống thấy trên màn ≤ 25 m), "ra khỏi rào" đóng vòng → "đi xa vườn > N m".
- **R-VUON-7** — thùng thu mua "cạnh cổng vườn" → chỗ mới.
- **R-VUON-8** — thứ tự mở ô "hàng nam trước rồi hàng bắc" → theo bố cục mới (A: gần lối trước, ra ngoài sau; 6 ô mở sẵn = hai
  cột sát lối).
- Kiểm thêm: R-HANH-2 / 5 / 7 nhắc (0; 6,5) — chỗ xuất hiện không đổi, chỉ soát câu tả hướng nhìn.
- Code / test chịu ảnh hưởng (V-82 sau khi chốt): `nha-ta.json` (buildings, paths, floors, garden, decorArea.keepOut, portals
  `nha-ta-trong` area + arrive, site.areas), `scene/vuonLayout.ts` (`fenceSegments`, kiểm cổng), `gardenWork.inFence`, test
  `zones/vuonVong*.test.ts`, minimap đảo; `nha-ta-trong` arrive về sân.

## 6. Ngân sách
Bỏ rào vườn (−1 … −2 draw call), lối lát nằm trong địa hình, nhà giữ model `nha-ta` — dự kiến **không tăng** draw call (chưa đo).

## Nguồn
- [moegirl] 摩尔庄园 — https://mzh.moegirl.org.cn/%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD — mỗi người một nông trang riêng, trang trí
- [taptap] 摩尔庄园 手游 — https://www.taptap.io/kr/app/170078 — "每位小摩尔都能拥有一块属于自己的农庄…养花种菜、喂养动物"
- [xiaomi 家具] 如何简单获得好看的家具装饰 — https://game.xiaomi.com/viewpoint/1359077112_1635904375643_13 — 栅栏和地砖 mua ở tiệm đồ gỗ
- [xiaomi 地砖] 让公共建筑飞天的小技巧 — https://game.xiaomi.com/viewpoint/1359077112_1637117586471_13 — đặt đồ trên gạch lát trong 家园
- [baidu zhidao] 摩尔庄园怎么种菜 — https://zhidao.baidu.com/question/441015532.html — bản web: chạm cây → vòng thao tác
- [nookipedia house] Player house — https://nookipedia.com/wiki/Player_house — lều "location of the player's choosing", ô trống 5 × 4,
  lều 4 × 4 → nhà 6 × 6; hộp thư trước cửa; rào tự đặt
- [nookipedia town] Town — https://nookipedia.com/wiki/Town — bản đồ NH 7 × 6 acre (16 × 16 ô / acre); sân bay + Resident
  Services không dời được
- [essentiallysports] How to place your housing kit — https://essentiallysports.com/animal-crossing-new-horizons-how-to-place-your-housing-kit-perfectly-esports-news — chừa chỗ trước nhà cho bậc / đồ; ý kiến khu công cộng nửa trước, nhà nửa sau
- [belltree] What part of the map do you usually place your home? — https://belltreeforums.com/threads/what-part-of-the-map-do-you-usually-place-your-home.631316 — ý kiến người chơi
- [sdv fandom] The Farm — https://stardewvalley.fandom.com/wiki/The_Farm — thùng giao hàng "to the right of the farmhouse"
- [progameguides] Best Stardew Valley Farm Layout Ideas — https://progameguides.com/stardew-valley/best-stardew-valley-farm-layout-ideas/
- [exitlag] Stardew Valley Farm Layout — https://www.exitlag.com/blog/stardew-valley-farm-layout/
- [gamepur hd] Best farm layouts in Hay Day — https://gamepur.com/?p=130040 (đọc qua đoạn trích tìm kiếm; trang 403) — "fields … in the upper
  area of the farm to have them in view immediately upon entering"; ong / sóc "in the starting viewing angle"
- [homestyler] Hay Day farm design layouts — https://www.homestyler.com/article/trending/hay-day-farm-design-layouts-ideas-for-a-farm-that-works-31-10 — chia khu + lối trước khi trang trí
- [palia wiki] Housing Plot — https://palia.wiki.gg/wiki/Housing_Plot/es — ô nhà, mở ô đất bằng giấy phép, 3 000 món
- [techraptor] Palia building guide — https://techraptor.net/gaming/guides/palia-building-guide
- Không đọc được: stardewvalleywiki.com The Farm (403), gamepur (403). Không tìm thấy bản đồ nông trang 摩尔 手游 có số đo.
