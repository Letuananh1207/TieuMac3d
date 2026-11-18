# Vườn dễ vào — vị trí ruộng, rào, lối đi ở game nông trại được yêu thích (菜园 · 篱笆 · 动线)
- Ngày: 2026-11-18 · Khu: Nhà của ta — Vườn rau · Việc: V-20261118-82 · Trạng thái: nháp — đã chuyển phiếu ảnh concept
  `docs/phieu_thiet_ke/2026-11-18-concept-vuon-de-vao.md` (chờ người dùng tạo ảnh + chọn phương án).
- Yêu cầu (người dùng): "vị trí của vườn và xung quanh vườn đang có hàng rào khó đi vào … khó chịu và mệt mỗi lần vào vườn …
  nghiên cứu 摩尔 hoặc các game khác được yêu thích."
- Chỉ học **bố cục và nhịp đi lại**, không chép hình / tên. Đọc kèm: `vuon-mole.md` (vòng làm vườn), `nha-rieng-game.md`
  (bố cục nhà riêng), luật R-VUON-1, R-VUON-2, R-NHA-1, R-NHA-5.

## Một câu
Ở các game nông trại được yêu thích, **ruộng của mình là thứ đầu tiên thấy và chạm được ngay** khi về nhà: ruộng sát chỗ
xuất hiện / sát nhà, không có rào chắn giữa người chơi và ruộng, chạm ô ruộng ở đâu cũng được — còn vườn mình hiện nằm sau
một vòng rào kín chỉ có **một cổng ở phía xa**, phải đi quá rồi vòng lại.

## 1. Hiện trạng đo trên đặc tả (`design/scene/nha-ta.json`, tốc độ `controller.ts`)
Đi bộ 3,2 m/s (joystick dưới 85 %), chạy 7 m/s. Chỗ xuất phát (0; 6,5) nhìn bắc. Rào x 3,5 … 16,5, z −16 … −3, **một cổng**
cạnh tây tâm z −9,5 rộng 1,6 m; cạnh nam rào (z −3) là cạnh gần chỗ xuất phát nhất (9,5 m) nhưng **kín**.

| Đích | Đường ngắn nhất qua cổng | Đi bộ | Chạy | Nếu không rào (thẳng) | Đi vòng thêm |
|---|---|---|---|---|---|
| Luống gần nhất theo mắt — o-7 (6,1; −5,6), hàng nam | 16,4 m tới cổng + 4,7 m = **21,1 m** | 6,6 s | 3,0 s | 13,6 m · 4,3 s | **+7,5 m (+55 %)** |
| Luống gần cổng — o-4 (6,1; −8,2) | 16,4 + 2,9 = **19,3 m** | 6,0 s | 2,8 s | 15,9 m | +3,4 m |
| Luống xa nhất — o-12 (11,3; −13,4) | 16,4 + 8,7 = **25,1 m** | 7,8 s | 3,6 s | 22,9 m | +2,2 m |
| Theo lối lát (trục → rẽ đông z −9,5 → cổng) | 16 + 3,5 + 8,7 = 28,2 m | 8,8 s | 4,0 s | — | **2 lần rẽ** + 1 lần quay lui về nam |

Ma sát thật lớn hơn số đo:
- **Đi quá rồi quay lại**: cổng ở z −9,5, hàng luống gần người nhất ở z −5,6 → phải đi bắc vượt 4 m rồi quay mặt về nam.
- **Khe cổng 1,6 m** (vừa đủ người — kiểm `gateWidth ≥ 1,2`) giữa rào cao 0,6 m: joystick lệch chút là cọ rào, trượt dọc rào.
- **Chạm để đi không tìm đường** (`input/tapToMove.ts` — tia chạm mặt đất, đi thẳng): chạm luống từ ngoài rào → nhân vật
  đi thẳng vào rào và đứng kẹt. Vòng công cụ chỉ mở **khi đứng trong rào** (`gardenWork.inFence`, R-VUON-2) → chạm luống
  từ ngoài **không có phản hồi gì**.
- Vào nhà (cách 1 — cưỡi hạc / nút Về nhà) và đi bộ (cách 2 — đứng ở (0; 10)) đều xuất hiện phía nam, còn cổng quay về tây
  giữa vườn → không lần nào "vào thẳng".

## 2. Các game làm thế nào
| Game | Ruộng ở đâu so với chỗ xuất hiện | Rào | Cách làm lên ô | Nguồn |
|---|---|---|---|---|
| **摩尔庄园 手游 (2021)** | Mỗi người một **农庄** riêng: bước vào là đang đứng trong nông trang, ruộng ngay quanh nhà | Có **栅栏** ở mép ruộng (người chơi đứng sát góc rào để đặt đồ) — rào là **viền**, không phải hộp kín có một cổng | Cầm nông cụ, chạm / làm lên ô (vuon-mole.md) | [xiaomi 栅栏], [moegirl], [9game] |
| **摩尔庄园 网页版 (2008)** | Nông trang là một màn riêng, vào là thấy cả ruộng trên một màn hình | Không cần đi tới ô — màn 2D, chạm cây là mở vòng thao tác | Chạm cây → vòng 杀虫 / 浇水 / 施肥 | [baidu zhidao] |
| **Hay Day** | Ruộng nằm giữa trang trại nhìn từ trên, không có nhân vật phải đi | Không rào quanh ruộng (rào chỉ quanh chuồng thú / mép đất) | Chạm một ô → **kéo liềm / hạt lướt qua cả nhóm ô** | [App Store], [gamezebo], [supercheats] |
| **Stardew Valley** | Người chơi để vùng trồng **sát nhà + thùng bán** để đỡ đi lại | Rào để giữ thú / chắn cỏ dại, **không bắt buộc** quanh ruộng | Đứng cạnh ô, dùng dụng cụ | [progameguides], [forum stardew], [exitlag] |
| **Harvest Moon: A Wonderful Life** | Có **một ruộng ngay cạnh nhà** (đất xấu nhưng gần), ruộng tốt ở xa hơn | — | Đứng cạnh ô | [ranchstory] |
| **Animal Crossing: New Horizons** | Đảo nhỏ, hoa / cây trồng thả tự do quanh nhà, lối đi tự vẽ | Rào là **đồ trang trí người chơi tự đặt** (làm "ranh giới"), không có rào sẵn | Đứng cạnh, dùng dụng cụ | [nookipedia fence] |

> Độ tin: không có bài nào đo khoảng cách bằng mét; số dưới là quy đổi của mình từ nhận xét chung (thời gian đi, số lần rẽ).
> Nguồn tiếng Trung về vị trí ruộng 摩尔 ít — nhận định "vào là đứng trong nông trang" là quan sát chung, ghi là chưa kiểm chứng.

## 3. Nguyên tắc rút ra (có số, cho Nhà của ta)
1. **Ruộng trong 5 giây đi bộ** từ chỗ xuất hiện: luống gần nhất ≤ 6 m (≤ 2 s), luống xa nhất ≤ 16 m (≤ 5 s ở 3,2 m/s).
   Hiện: 19–25 m, 6–8 s. (Stardew / Harvest Moon: ruộng sát nhà; 摩尔: vào là trong nông trang.)
2. **Không rào chắn giữa người và ruộng.** Rào chỉ ở **mép ngoài** (mép đảo / phía xa) hoặc là **viền thấp ≤ 0,35 m không
   va chạm**. Nếu giữ rào chặn: mỗi cạnh nhìn về phía người tới có lối, khe ≥ 2,4 m (= bề rộng lối trục), ≥ 3 lối. (Hay Day,
   Animal Crossing: rào là trang trí; 摩尔: rào là viền.)
3. **Tới ruộng ≤ 1 lần rẽ, không đi quá rồi quay lui**; lối lát rộng 2,4 m dẫn thẳng vào **giữa** dãy luống.
4. **Chạm luống ở đâu cũng được** (thấy trên màn là chạm được, tầm ≤ 25 m như hàng dấu R-VUON-2): vòng công cụ mở ngay, chọn
   ô → nhân vật **tự đi tới** (đã có R-VUON-13) — bỏ điều kiện "đứng trong rào". (Hay Day, 摩尔 web: chạm thẳng ô.)
5. **Ruộng nằm trong khung hình lúc xuất hiện**: từ (0; 6,5) nhìn bắc, camera gần (4,2 m) — dãy luống chiếm ≥ 1/3 khung,
   không bị nhà / cây che. Về nhà là thấy cây chín lấp lánh ngay.
6. **Thùng thu mua trên đường đi**, cách luống xa nhất ≤ 8 m, không phải vào lại cổng. (Stardew: thùng bán sát ruộng.)
7. **Lối giữa các luống ≥ 1 m** (hiện 2,6 − 1,6 ≈ 1 m + luống không chặn) — giữ; chạm luống gần đâu đi đó, không kẹt.

## 4. Phương án (đưa vào phiếu ảnh concept — chờ ảnh + người dùng chọn)
Số ước theo toạ độ dự kiến; đo lại trên Canvas 3D khi dựng.
| PA | Mô tả | Luống gần / xa | Rẽ | Ưu | Nhược |
|---|---|---|---|---|---|
| **A — Bỏ rào, giữ chỗ** | Vườn giữ 3,5 … 16,5 × −16 … −3; rào thành viền tre thấp 0,3 m không va chạm có khe 4 phía (hoặc bỏ hẳn); lối lát mới từ trục ở z −1,4 rẽ đông vào giữa vườn (x 9,7) rồi bắc tới z −14 | 13,6 m · 4,3 s / 22,9 m · 7,2 s | 1 | sửa ít nhất, giữ quy hoạch V-68, chỗ trống đông giữ nguyên | luống xa vẫn 7 s; vườn vẫn "xa" khỏi chỗ xuất hiện |
| **B — Vườn sát chỗ xuất hiện** | Dời 12 luống ra **ngay đông lối trục, cạnh chỗ xuất phát**: cột x 4,5 / 7,1 / 9,7, hàng z 6 / 3,4 / 0,8 / −1,8; không rào (viền đá thấp + rào gỗ chỉ ở mép đảo phía nam); thùng thu mua (2,4; 2) sát lối trục | 4,5 m · 1,4 s / 12,8 m · 4,0 s | 0 | vào nhà là thấy + chạm ngay; ngắn nhất | chỗ đất trống cũ (giữa đảo) bỏ không; vườn đứng chắn tầm nhìn bến → nhà chính bớt thoáng |
| **C — Luống hai bên lối chính, mở bốn phía** | Lối lát đông–tây mới từ trục ở z −1,4 tới x 13; 6 luống mỗi bên lối (bắc: z −3,8 / −6,4; nam: z 1,0 / 3,6; cột x 5 / 7,6 / 10,2); không rào, góc vườn có 4 cọc tre + giàn bầu thấp làm "cổng" trang trí không chặn; thùng cuối lối (13; −1,4) | 5,9 m · 1,8 s / 16,3 m · 5,1 s | 1 | đi dọc một lối là chạm mọi luống; vẫn có hình "khu vườn"; chừa đất bắc | lối nhánh đông mới + đổi bố cục V-68 nhiều nhất |
Cả ba: bỏ điều kiện "trong rào" của vòng công cụ (nguyên tắc 4). Ngân sách: bỏ / hạ rào bớt hình, lối lát nằm trong địa hình —
dự kiến không tăng draw call (chưa đo — chưa dựng).

**Khuyên: B** (chạm đúng than phiền "mệt mỗi lần vào vườn": 0 rẽ, ≤ 4 s) **+ nguyên tắc 4**. Nếu người dùng muốn giữ sân
đến thoáng → C. A là bản tối thiểu nếu chỉ muốn sửa nhanh.

## 5. Luật sẽ phải đổi (khi đã chọn)
- Mọi PA: **R-VUON-2** — "đứng trong rào Vườn rau, chạm một luống" → "chạm một luống (thấy trên màn, ≤ 25 m)"; "ra khỏi
  rào" đóng vòng → "đi xa khỏi vườn > N m"; test `zones/vuonVong*.test.ts`, `gardenWork.inFence`.
- **R-VUON-1** — vị trí + "rào và thùng chặn" (A: rào không chặn; B, C: không rào, vị trí mới); ví dụ "đi theo lối nhánh qua cổng".
- **R-NHA-5** — bố cục (lối trục "tới ngang cổng Vườn rau", "rào tre thấp chặn như lan can, cổng vườn giữa cạnh tây"); B / C: vị
  trí vườn, lối nhánh mới; ví dụ đi bộ có rào.
- **R-NHA-1** — B: "nhà chính bên trái, Vườn rau bên phải" vẫn đúng nhưng vườn ngay cạnh chỗ xuất phát (ghi rõ).
- Code kiểm: `scene/vuonLayout.ts` (`fenceSegments`, kiểm cổng / "điểm xuất phát trong rào"), `decorArea.keepOut` của nhà.

## Nguồn
- [xiaomi 栅栏] 摩尔庄园手游 巧妙利用这个BUG… — https://game.xiaomi.com/viewpoint/1359077112_1636596224127_13 — ruộng nhà hàng xóm có 栅栏 ở mép, đứng ở góc rào
- [moegirl] 摩尔庄园 — https://mzh.moegirl.org.cn/%E6%91%A9%E5%B0%94%E5%BA%84%E5%9B%AD — mỗi người một nông trang riêng
- [9game] 摩尔庄园手游种田攻略 — https://www.9game.cn/moerzhuangyuan1/5186839.html — làm ruộng bằng nông cụ lên ô (xem vuon-mole.md)
- [baidu zhidao] 摩尔庄园怎么种菜 — https://zhidao.baidu.com/question/441015532.html — bản web: chạm cây → vòng thao tác
- [App Store] Hay Day — https://apps.apple.com/app/id506627515 — "tap-and-drag controls … scything through fields"
- [gamezebo] Hay Day walkthrough — https://www.gamezebo.com/walkthroughs/hay-day-walkthrough/ — kéo hạt / liềm qua cả nhóm ô
- [supercheats] Hay Day harvesting — https://www.supercheats.com/hay-day/walkthrough/harvesting — chạm ô chưa chín → hiện thời gian còn lại
- [progameguides] 13 Best Stardew Valley Farm Layout Ideas — https://progameguides.com/stardew-valley/best-stardew-valley-farm-layout-ideas/ — ruộng gần nhà / thùng bán đỡ đi lại
- [forum stardew] Hill-top farm tips — https://forums.stardewvalley.net/threads/looking-for-hill-top-farm-tips.53245/latest — vùng trồng giới hạn sát nhà
- [exitlag] Stardew Valley Farm Layout — https://www.exitlag.com/blog/stardew-valley-farm-layout/ — rào chủ yếu để giữ thú
- [ranchstory] Your Farm (HM: A Wonderful Life) — https://ranchstory.miraheze.org/wiki/Your_Farm_(Harvest_Moon:_A_Wonderful_Life) — một ruộng ngay cạnh nhà
- [nookipedia fence] Fence — https://www.nookipedia.com/wiki/Fence — rào là đồ đặt "để tạo ranh giới"
- Không đọc được: Stardew wiki Farm Maps (403), Hay Day fandom Fields (402).
