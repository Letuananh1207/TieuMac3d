# Sổ quy tắc nghiệp vụ — Học Xá 3D

Nguồn sự thật cho test. Mỗi test ghi mã quy tắc nó kiểm ở đầu tên test, ví dụ
`test('R-VUNG-2: bấm Để sau → thẻ không hiện lại khi còn trong vùng', …)`.
**Đổi hành vi: sửa sổ này trước, rồi test, rồi code.**

- Cột **Xác nhận**: `chờ` · `đúng` · `sai: <đúng phải là gì>`. Quy tắc Claude rút từ code luôn bắt đầu `chờ`.
- Cột **App**: `ok` (code đã đúng) · `sửa` (code phải đổi theo quy tắc; test viết trước, đỏ tới khi sửa xong).
  Có thể thêm `miễn test (lý do)`.
- Máy kiểm: `dart tool/rule_trace.dart` (thiếu test cho quy tắc `ok` → thoát 1; `-v` in số test từng mã).

## Cách xác nhận

Tài liệu online: [Xác nhận quy tắc nghiệp vụ Học Xá 3D](https://claude.ai/artifact/UF5NiGq5yVL1imQWFeMgh6) — mỗi quy tắc một ô chọn Chờ / Đúng / Sai, Sai thì comment đúng phải là gì.

- **Xử lý xác nhận quy tắc** = đọc lựa chọn + comment trên tài liệu, chép vào cột Xác nhận ở đây.
  Quy tắc `sai` → sửa quy tắc, App thành `sửa`, viết test đỏ trước rồi sửa code.
- Sửa / thêm quy tắc trong sổ → chép lên tài liệu (nội dung đổi thì đưa ô Xác nhận về Chờ) →
  `dart tool/rule_trace.dart --mark-synced <mã>`. Quên thì `rule_trace` in "Chưa đồng bộ online" và hook Stop nhắc.

## VUNG — bài học trong nhà

Code: [web/src/zones/](../../web/src/zones/), [web/src/ui/](../../web/src/ui/), [web/src/scene/kien_truc/](../../web/src/scene/kien_truc/)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-VUNG-1 | Mỗi bài học gắn với một vật trong nhà (bảng đen ở giảng đường, án đọc ở thư viện), có một điểm học. Nhân vật đứng cách điểm học **nhỏ hơn** bán kính thì hiện nút học nổi trên vật ("Học chữ 快", "Ôn chữ 書"); ra ngoài thì nút ẩn. Ngoài sân không có thẻ mời. | Giảng đường: điểm học (0; −14,3), bán kính 1,8 (trước bục giảng, cách bảng đen ~1,6 m). Đứng ở (0; −12,7) (cách 1,6) → hiện "Học chữ 快"; đứng ở (0; −12,3) (cách 2,0) → không hiện. | chờ | ok |
| R-VUNG-2 | Khi nhân vật đang ở trong một nhà, chạm vào vật học của nhà đó (giảng đường: bảng đen, thầy; thư viện: án đọc, kệ sách) thì mở bài học của nhà dù không đứng trong vùng. Chạm chỗ khác vẫn như cũ (chạm mặt đất thì đi tới đó). | Đứng ở cửa giảng đường (0; −5,8), chạm vào bảng đen → mở bài chữ 快. Đứng ngoài sân chạm vào mái giảng đường → không mở bài. | chờ | ok |
| R-VUNG-3 | Mở bài học (bằng nút hoặc chạm vật) thì nhân vật đứng yên (joystick, phím, điểm chạm đều không có tác dụng) tới khi đóng bài; đóng xong nếu vẫn đứng trong vùng thì nút học vẫn hiện. | Bấm "Học chữ 快" → bài chữ 快; giữ joystick → không đi; bấm "Ra sân" → đi lại được, nút vẫn hiện tới khi ra khỏi vùng. | chờ | ok |

## DIEU — điều khiển

Code: [web/src/input/](../../web/src/input/), [web/src/player/controller.ts](../../web/src/player/controller.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-DIEU-1 | Ngón tay chạm vào 45% bên trái màn hình thì thành joystick (mỗi lúc một joystick); chạm chỗ khác thì kéo để xoay camera, hai ngón thì chụm để zoom. Chuột không dùng joystick. | Màn rộng 400 px: chạm x = 170 → joystick; chạm x = 190 → xoay camera. | chờ | ok |
| R-DIEU-2 | Chạm ngắn vào mặt sân không làm nhân vật đi — nhân vật chỉ đi bằng joystick hoặc bàn phím. Chạm ngắn (lệch dưới 8 px, nhả trong 300 ms) chỉ dùng để chạm vật học trong nhà (R-VUNG-2); kéo thì xoay camera. | Chạm 200 ms lệch 5 px vào sân → nhân vật đứng yên; giữ 400 ms kéo → xoay camera; trong giảng đường chạm bảng đen → mở bài chữ 快. | chờ | ok |
| R-DIEU-3 | Nhân vật đang đi (joystick hoặc phím) thì camera tự xoay dần ra sau lưng theo hướng đi, đi càng nhanh quay càng nhanh, mượt không giật; góc ngẩng / cúi cũng dần về góc chuẩn. Không tự xoay khi: đang kéo xoay camera hoặc mới thả tay chưa tới 1,5 giây; hướng đi lệch hướng nhìn của camera từ 120° trở lên (đi về phía camera); nhân vật đứng yên. | Camera nhìn về bắc, đi về phía đông (giữ phím D) → trong lúc đi camera quay dần ra sau lưng, nhìn về đông. Kéo camera nhìn sang tây rồi đi ngay → 1,5 giây đầu camera giữ hướng tây, sau đó mới xoay. Đi thẳng xuống, về phía camera → camera không quay vòng. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay / chụp) |
| R-DIEU-4 | Tường hoặc nhà chắn giữa đầu nhân vật và camera (chỗ chắn thấp hơn đỉnh tường) thì camera kéo lại gần, đứng trước vật chắn, trong khoảng 0,1 giây; hết bị chắn thì lùi về khoảng cách cũ từ từ (khoảng 1 giây). Cây, đèn đá, luống thuốc và vật nhỏ khác không làm camera kéo lại. | Đứng ở (0; 18) sát tường nam Ngoại Môn, xoay camera ra phía nam (camera ở ngoài tường) → camera dịch vào trong tường, vẫn thấy nhân vật; đi ra giữa sân (0; 0) → camera lùi về 6 m. Đứng sau một cây tùng → camera không kéo lại. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay / chụp) |
| R-DIEU-5 | Tốc độ theo độ đẩy joystick: đẩy nhẹ thì đi bộ, nhanh dần tới 3,2 m/s; đẩy gần hết cỡ (từ 85 % bán kính) thì chạy, tới 7 m/s, dáng chạy (người đổ về trước, vung tay chân mạnh). Bàn phím: mũi tên / WASD là chạy, giữ Shift là đi bộ. | Đẩy joystick nửa bán kính → đi ~1,9 m/s; đẩy hết → chạy 7 m/s. Giữ Shift + W → đi bộ. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng mô phỏng / thử tay) |
| R-DIEU-6 | Nhảy (nút **Nhảy** tròn ngọc lục ở góc dưới phải; phím Space): nhân vật bật lên cao khoảng 0,85 m rồi rơi xuống theo trọng lực (khoảng 0,6 giây), vẫn đi / chạy được khi đang bay. Chỉ nhảy được khi đang đứng trên đất, không ngồi, không mở bài học. Nhảy không vượt qua tường, nhà hay vật cản (va chạm như khi đi). Nút Nhảy mờ (bấm không có tác dụng) khi đang ngồi hoặc không đứng trên đất. **Cụm nút hành động** (Nhảy · Chào · Thiền) ẩn khi đang mở bài học, màn tải, bản đồ truyền tống hoặc đang hội thoại. | Đứng yên bấm Space → bật lên rồi đáp xuống chỗ cũ sau ~0,6 s; chạy tới bấm Space → nhảy xa ~4 m theo hướng chạy; bấm Space liên tục khi đang bay → không nhảy thêm. Đang ngồi thiền → nút Nhảy mờ; mở bản đồ truyền tống → cả cụm nút ẩn. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng mô phỏng / thử tay) |
| R-DIEU-7 | Ngồi thiền (nút **Thiền**; phím C): nhân vật ngồi xếp bằng tại chỗ; bấm lại hoặc điều khiển đi (joystick, phím) thì đứng dậy rồi đi. Chào (nút **Chào**; phím F): chắp tay chào kiểu cổ trang (拱手) khoảng 1,6 giây; đi thì thôi chào. Đang bay không ngồi / chào được. Đang thiền: nút Thiền sáng (nền ngọc lục, viền vàng), nhãn "Đang thiền". Đang bay: nút Chào và Thiền mờ. | Bấm C → ngồi thiền; giữ joystick → đứng dậy, đi. Bấm F → chắp tay cúi chào rồi về dáng đứng. Bấm nút Thiền → ngồi, nút đổi "Đang thiền"; bấm lại → đứng dậy. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay / chụp) |
| R-DIEU-8 | Đứng yên (không ngồi, không chào) quá 6 giây thì nhân vật tự làm một động tác nhỏ (vươn vai hoặc nhìn quanh), khoảng 8 giây một lần; điều khiển đi thì thôi ngay. | Thả joystick, chờ 6 giây → nhân vật vươn vai; chờ tiếp ~8 giây → nhìn quanh. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay) |

## VA — va chạm

Code: [web/src/collision/colliders.ts](../../web/src/collision/colliders.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-VA-1 | Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cột cổng, giếng, ao / hồ, vật trang trí có va chạm (lò đan…) và cây có va chạm (cây trong sân, cụm cây); đi qua được khe cổng trên tường. Cây vòng ngoài tường, lối lát đá, đảo nổi, mây không có va chạm. | Mặt trong tường bắc ở z = −20,5 → đi thẳng lên bắc ở x = 16 thì dừng ở z = −20,0. Tường nam và tường bắc đều có khe cổng tâm x = 0 rộng 6,4, cổng trăng vừa tường cao 4,5 m (lối đi 3,9 m): đi thẳng xuống nam ở x = 0 thì qua được, ở x = 3 thì dừng ở z = 20,0; đi thẳng lên bắc ở x = 0 thì qua cổng bắc ra chân Thiên Bậc. | chờ | ok |
| R-VA-2 | Khi cảnh có địa hình: nhân vật đi trên mặt đất, lên xuống theo độ cao. Không bước được vào mặt đất dốc hơn 35° (cả lên lẫn xuống), như gặp tường; vì vậy không đi ra khỏi mép cao nguyên (vực xuống biển mây). Đang đứng trên mặt dốc hơn 35° thì chỉ đi xuống được. | Kè đá cao 1,5 m trong bề ngang 1 m (dốc ≈ 56°) → dừng ở chân kè. Sườn đồi dốc 30° → đi lên được, nhân vật cao dần theo mặt đất. Đi tới mép vực → dừng ở mép. | đúng | ok |
| R-VA-3 | Nhà vào được (giảng đường, thư viện): tường và cột chặn nhân vật, đi qua cửa được; bảng đen, bục giảng, án thư, kệ sách, án đọc và thầy có va chạm. | Giảng đường (0; −11), nền cao 0,96 m (hệ số chiều cao 1,6): 5 bậc rộng 4 m và cửa giữa (tường trước ở z ≈ −5,8). Đi thẳng lên bắc ở x = 0 → lên bậc, qua cửa vào trong theo lối giữa hai dãy án thư, dừng trước bục giảng ở z ≈ −14,3; ở x = 3 → lan can nền chặn, dừng ở z = −3,9. | chờ | ok |

## NPC — nhân vật không điều khiển

Code: [web/src/player/npc.ts](../../web/src/player/npc.ts), [web/src/main.ts](../../web/src/main.ts); vị trí: `npcs` trong đặc tả cảnh

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-NPC-1 | NPC đứng tại chỗ theo đặc tả cảnh (vị trí + hướng), thở nhẹ; có va chạm tròn bán kính 0,45 (nhân vật không đi xuyên). Người chơi cách NPC **dưới** 4 m thì NPC từ từ quay mặt về phía người chơi (tối đa 3 rad/s); cách từ 4 m trở lên thì từ từ quay về hướng gốc. Thiếu file model của NPC → bỏ qua NPC đó, cảnh vẫn chạy. | Tiểu Mặc ở (4,5; 15) trong sân Ngoại Môn, sau cổng trăng nam, nhìn về nam (+z): người chơi qua cổng ở (0; 20) (cách 6,7) → giữ hướng gốc; đi tới (2; 15) (cách 2,5) → Tiểu Mặc quay sang nhìn người chơi; đi thẳng vào Tiểu Mặc theo z = 15 → dừng ở x ≈ 3,55 (cách tâm 0,95). | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng chụp headless) |
| R-NPC-2 | Người chơi đứng cách NPC **dưới** 2,5 m (không mở bài học, không ngồi thiền) thì hiện nút "Nói chuyện" gần NPC; ra xa từ 2,5 m trở lên thì ẩn. Bấm nút → khung thoại ở đáy màn: tên NPC, lời thoại **chạy dần** (chạm khung thì hiện hết), 1–3 lựa chọn hiện khi lời đã hiện hết; chọn một lựa chọn → lời tiếp theo; câu nào cũng có lựa chọn "Tạm biệt" (đóng khung thoại). Đang thoại: nhân vật đứng yên (joystick, phím không có tác dụng), NPC nhìn người chơi; đóng xong đi lại được. Lời thoại theo dữ liệu hội thoại của NPC. | Đứng ở (2,5; 15), cách Tiểu Mặc 2,0 → hiện "Nói chuyện"; bấm → "Đạo hữu mới đến Văn Uyên Tông à? …" với 3 lựa chọn; chọn "Tiểu Mặc đứng đây làm gì?" → lời tiếp; chọn "Tạm biệt" → đóng, đi lại được. Đứng ở (1; 15), cách 3,5 → không có nút. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng mô phỏng DialogRunner + thử tay) |

## HUD — chữ trên màn

Code: [web/src/zones/areaTracker.ts](../../web/src/zones/areaTracker.ts), [web/src/ui/hud.ts](../../web/src/ui/hud.ts), [web/src/ui/areaBanner.ts](../../web/src/ui/areaBanner.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-HUD-1 | Chip góc trên trái hiện "<tên nơi> · <tên khu>" khi nhân vật đứng trong một khu (hình chữ nhật đặt trong đặc tả cảnh); đứng ngoài mọi khu thì chỉ hiện "<tên nơi>". Hai khu chồng nhau thì lấy khu khai báo trước. Đứng trên nền một nhà vào được thì hiện "<tên nơi> · <tên nhà>" (ưu tiên hơn tên khu). Đổi chữ ngay khi bước qua ranh giới. | Tên nơi "Văn Uyên Tông", khu "Truyền Tống Đài" x 21…54, z −15…15: đứng ở (50; 10) → "Văn Uyên Tông · Truyền Tống Đài"; đứng ở (15; 30) (ngoài tường, ngoài mọi khu) → "Văn Uyên Tông". Đứng trong giảng đường (0; −11) → "Văn Uyên Tông · Giảng đường". Chưa đặt khu nào: "Học xá · Sân chính" như cũ. | chờ | ok |
| R-HUD-2 | Bước lên nền một nhà vào được thì mái và tường trước của nhà đó mờ còn 15 % trong 0,3 giây; bước ra thì hiện lại. Trong nhà, camera cách nhân vật tối đa 6 m và không nằm sau tường. | Đi qua cửa giảng đường vào trong → mái mờ, thấy bảng đen; zoom ra hết cỡ → camera dừng ở 6 m. Ra khỏi cửa → mái hiện lại. | chờ | ok |
| R-HUD-3 | Khi nhân vật bước từ ngoài vào một khu, hoặc từ khu này sang khu khác, giữa màn hiện thẻ tên khu (chữ Hán + tên Việt; khu chưa có chữ Hán thì chỉ tên Việt): hiện dần 0,25 giây, giữ khoảng 2 giây rồi mờ dần 0,4 giây. Ra khỏi mọi khu thì không hiện. Bước vào / ra một nhà vào được thì không hiện (chỉ chip đổi chữ). Đang hiện mà vào khu khác thì thay chữ và đếm lại 2 giây. Lúc mở app, khu nơi nhân vật xuất phát không hiện thẻ. Thẻ không chặn chạm. | Đi từ (0; 30) Sơn Môn vào (0; 0) Ngoại Môn → hiện 外門 · Ngoại Môn; đi từ (0; 0) ra (15; 30) ngoài mọi khu → không hiện; từ sân Ngoại Môn đi vào giảng đường (0; −11) rồi ra lại → không hiện. | chờ | ok |

## HANH — hành trình nhiều vùng

Code: [app/lib/journey/](../../app/lib/journey/) (mốc mở, tiến độ), [web/src/scene/truyenTong.ts](../../web/src/scene/truyenTong.ts), [web/src/main.ts](../../web/src/main.ts); vị trí: `teleport`, `homeRing` trong đặc tả cảnh

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-HANH-1 | Có 6 vùng du học. Vùng **mở** khi số chữ đã học **≥** mốc của vùng: Rừng trúc từ đầu; Giang Nam khi đã học đủ bộ thủ của Rừng trúc; Bồng Lai 300; Trường Thành 900; Tử Cấm Thành 1 800; Con đường tơ lụa 3 000. Một chữ tính là đã học từ lần **đầu** mở bài của chữ đó (tạm, tới khi màn bài học có nút "Đã thuộc"); mở lại không tính thêm. Tiến độ giữ qua những lần mở app sau. Chỉ đi được tới vùng đã mở **và** đã dựng cảnh. | Mới cài app → chỉ Rừng trúc mở. Đã học 299 chữ → Bồng Lai chưa mở; học thêm một chữ (300) → Bồng Lai mở (nhưng chưa đi được vì chưa có cảnh Bồng Lai). Mở bài 快 hai lần → vẫn tính 1 chữ. | chờ | ok |
| R-HANH-2 | Truyền Tống Đài và mỗi vùng có một vòng trận (bán kính 4 m). Bước **từ ngoài vào** vòng (tâm nhân vật cách tâm vòng **dưới** 3,2 m) thì vòng sáng dần, cột sáng bốc lên; ở trong vòng đủ **1,2 giây** thì **bản đồ truyền tống** mở. Ra khỏi vòng trước 1,2 giây → huỷ. Lúc xuất hiện hay đang đứng sẵn trong vòng thì không tính; phải ra rồi vào lại. Bản đồ mở: nhân vật đứng yên (joystick ẩn, phím không tác dụng, kéo màn không xoay camera). Chạm nơi **đã mở và có cảnh** → màn tải (R-MAN-2) → sang nơi đó (Văn Uyên Tông = về tông môn). Chạm nơi **khoá** hoặc **sắp mở** → không truyền tống, hiện thẻ yêu cầu khoảng 3 giây (ẩn sớm khi chạm chỗ khác). Chạm nơi **đang ở** → không có gì. Bấm "Đóng bản đồ" hoặc nút quay lại của máy → bản đồ cuộn lại, đi lại được; bản đồ chỉ mở lại khi ra khỏi vòng rồi vào lại. Xuất hiện ngoài vòng: ở vùng tại chỗ xuất phát của vùng; về tông môn thì đứng phía tây vòng, nhìn về đông. | Vòng ở đài tâm (38; 0). Đi từ (30; 0) sang đông tới (35; 0) (cách 3) → vòng sáng dần; đứng đó 1,2 giây → bản đồ mở. Đã học 128 chữ, chạm Bồng Lai → thẻ "蓬萊 Bồng Lai — cần 300 chữ · Bạn đã học 128 chữ." 3 giây; chạm Rừng trúc → màn tải "竹林 · Rừng trúc". Bấm "Đóng bản đồ" rồi đứng yên trong vòng → bản đồ không mở lại. Ở Rừng trúc vào vòng (0; 39), chạm Văn Uyên Tông → về đứng ở (32,5; 0) nhìn về đông. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng kịch bản esbuild + đi thử trên trình duyệt) |

## MAN — màn hình

Code: [app/lib/main.dart](../../app/lib/main.dart), [app/lib/scene/](../../app/lib/scene/), [web/src/style.css](../../web/src/style.css), [web/src/ui/loadingScreen.ts](../../web/src/ui/loadingScreen.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-MAN-1 | App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống; chữ và nút của HUD luôn nằm ngoài vùng bị che. | Máy có tai thỏ xoay ngang, tai thỏ bên trái rộng 40 px → chip "Học xá · Sân chính" cách mép trái ít nhất 40 px; cảnh vẫn vẽ tới sát mép. | đúng | ok · miễn test (chỉ kiểm được trên máy thật) |
| R-MAN-2 | Mở app, hoặc đổi vùng (R-HANH-2), thì màn tải (tên nơi + chữ Hán + thanh tiến trình) che kín màn hình tới khi cảnh 3D vẽ xong khung hình đầu tiên, rồi mờ dần 0,4 giây. Người chơi không điều khiển được trong lúc màn tải còn hiện. Không có tiến độ thật thì thanh chạy tới 90 % rồi chờ khung hình đầu. | Mở app → thấy "Văn Uyên Tông", "Đang mở sơn môn… 62%"; kéo joystick lúc đó → nhân vật không đi; cảnh hiện → màn tải mờ đi, kéo được. Bước vào vòng trận Rừng trúc → màn tải "竹林 · Rừng trúc" hiện ngay, cảnh Rừng trúc vẽ xong thì mờ đi. | chờ | ok |
