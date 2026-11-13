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
| R-DIEU-2 | Chạm ngắn (lệch dưới 8 px, nhả trong 300 ms) ở vùng xoay thì nhân vật đi tới điểm đó trên sân; dùng joystick thì bỏ điểm đến; bị vật cản chặn thì dừng. | Chạm 200 ms lệch 5 px → đi tới đó; giữ 400 ms → chỉ xoay, không đi; đi tới điểm sau giếng → chạm giếng thì dừng. | chờ | ok |
| R-DIEU-3 | Nhân vật đang đi (joystick, phím hoặc chạm để đi) thì camera tự xoay dần ra sau lưng theo hướng đi, đi càng nhanh quay càng nhanh, mượt không giật. Không tự xoay khi: đang kéo xoay camera hoặc mới thả tay chưa tới 1,5 giây; hướng đi lệch hướng nhìn của camera từ 120° trở lên (đi về phía camera); nhân vật đứng yên. | Camera nhìn về bắc, chạm một điểm phía đông để đi tới → trong lúc đi camera quay dần ra sau lưng, nhìn về đông. Kéo camera nhìn sang tây rồi đi ngay → 1,5 giây đầu camera giữ hướng tây, sau đó mới xoay. Đi thẳng xuống, về phía camera → camera không quay vòng. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay / chụp) |
| R-DIEU-4 | Tường hoặc nhà chắn giữa đầu nhân vật và camera (chỗ chắn thấp hơn đỉnh tường) thì camera kéo lại gần, đứng trước vật chắn, trong khoảng 0,1 giây; hết bị chắn thì lùi về khoảng cách cũ từ từ (khoảng 1 giây). Cây, đèn đá, luống thuốc và vật nhỏ khác không làm camera kéo lại. | Đứng ở (0; 18) sát tường nam Ngoại Môn, xoay camera ra phía nam (camera ở ngoài tường) → camera dịch vào trong tường, vẫn thấy nhân vật; đi ra giữa sân (0; 0) → camera lùi về 6 m. Đứng sau một cây tùng → camera không kéo lại. | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng thử tay / chụp) |

## VA — va chạm

Code: [web/src/collision/colliders.ts](../../web/src/collision/colliders.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-VA-1 | Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cột cổng, giếng, ao / hồ, vật trang trí có va chạm (đài tỉ thí, giá binh khí, lò đan…) và cây có va chạm (cây trong sân, cụm cây); đi qua được khe cổng trên tường. Cây vòng ngoài tường, lối lát đá, đảo nổi, mây không có va chạm. | Mặt trong tường bắc ở z = −20,5 → đi thẳng lên bắc ở x = 16 thì dừng ở z = −20,0. Tường nam và tường bắc đều có khe cổng tâm x = 0 rộng 6,4, cổng trăng vừa tường cao 4,5 m (lối đi 3,9 m): đi thẳng xuống nam ở x = 0 thì qua được, ở x = 3 thì dừng ở z = 20,0; đi thẳng lên bắc ở x = 0 thì qua cổng bắc ra chân Thiên Bậc. | chờ | ok |
| R-VA-2 | Khi cảnh có địa hình: nhân vật đi trên mặt đất, lên xuống theo độ cao. Không bước được vào mặt đất dốc hơn 35° (cả lên lẫn xuống), như gặp tường; vì vậy không đi ra khỏi mép cao nguyên (vực xuống biển mây). Đang đứng trên mặt dốc hơn 35° thì chỉ đi xuống được. | Kè đá cao 1,5 m trong bề ngang 1 m (dốc ≈ 56°) → dừng ở chân kè. Sườn đồi dốc 30° → đi lên được, nhân vật cao dần theo mặt đất. Đi tới mép vực → dừng ở mép. | đúng | ok |
| R-VA-3 | Nhà vào được (giảng đường, thư viện): tường và cột chặn nhân vật, đi qua cửa được; bảng đen, bục giảng, án thư, kệ sách, án đọc và thầy có va chạm. | Giảng đường (0; −11), nền cao 0,96 m (hệ số chiều cao 1,6): 5 bậc rộng 4 m và cửa giữa (tường trước ở z ≈ −5,8). Đi thẳng lên bắc ở x = 0 → lên bậc, qua cửa vào trong theo lối giữa hai dãy án thư, dừng trước bục giảng ở z ≈ −14,3; ở x = 3 → lan can nền chặn, dừng ở z = −3,9. | chờ | ok |

## NPC — nhân vật không điều khiển

Code: [web/src/player/npc.ts](../../web/src/player/npc.ts), [web/src/main.ts](../../web/src/main.ts); vị trí: `npcs` trong đặc tả cảnh

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-NPC-1 | NPC đứng tại chỗ theo đặc tả cảnh (vị trí + hướng), thở nhẹ; có va chạm tròn bán kính 0,45 (nhân vật không đi xuyên). Người chơi cách NPC **dưới** 4 m thì NPC từ từ quay mặt về phía người chơi (tối đa 3 rad/s); cách từ 4 m trở lên thì từ từ quay về hướng gốc. Thiếu file model của NPC → bỏ qua NPC đó, cảnh vẫn chạy. | Tiểu Mặc ở (3,5; 46,25) nhìn về nam (+z): người chơi ở (0; 50) (cách 5,1) → giữ hướng gốc; đi tới (1; 46,25) (cách 2,5) → Tiểu Mặc quay sang nhìn người chơi; đi thẳng vào Tiểu Mặc theo z = 46,25 → dừng ở x ≈ 2,55 (cách tâm 0,95). | chờ | ok · miễn test (chưa có trình chạy test TS — kiểm bằng chụp headless) |

## HUD — chữ trên màn

Code: [web/src/zones/areaTracker.ts](../../web/src/zones/areaTracker.ts), [web/src/ui/hud.ts](../../web/src/ui/hud.ts), [web/src/ui/areaBanner.ts](../../web/src/ui/areaBanner.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-HUD-1 | Chip góc trên trái hiện "<tên nơi> · <tên khu>" khi nhân vật đứng trong một khu (hình chữ nhật đặt trong đặc tả cảnh); đứng ngoài mọi khu thì chỉ hiện "<tên nơi>". Hai khu chồng nhau thì lấy khu khai báo trước. Đứng trên nền một nhà vào được thì hiện "<tên nơi> · <tên nhà>" (ưu tiên hơn tên khu). Đổi chữ ngay khi bước qua ranh giới. | Tên nơi "Văn Uyên Tông", khu "Diễn Võ Trường" x 27…60, z −15…15: đứng ở (57; 0) → "Văn Uyên Tông · Diễn Võ Trường"; đứng ở (24; 0) (giữa hai tường, ngoài mọi khu) → "Văn Uyên Tông". Đứng trong giảng đường (0; −11) → "Văn Uyên Tông · Giảng đường". Chưa đặt khu nào: "Học xá · Sân chính" như cũ. | chờ | ok |
| R-HUD-2 | Bước lên nền một nhà vào được thì mái và tường trước của nhà đó mờ còn 15 % trong 0,3 giây; bước ra thì hiện lại. Trong nhà, camera cách nhân vật tối đa 6 m và không nằm sau tường. | Đi qua cửa giảng đường vào trong → mái mờ, thấy bảng đen; zoom ra hết cỡ → camera dừng ở 6 m. Ra khỏi cửa → mái hiện lại. | chờ | ok |
| R-HUD-3 | Khi nhân vật bước từ ngoài vào một khu, hoặc từ khu này sang khu khác, giữa màn hiện thẻ tên khu (chữ Hán + tên Việt; khu chưa có chữ Hán thì chỉ tên Việt): hiện dần 0,25 giây, giữ khoảng 2 giây rồi mờ dần 0,4 giây. Ra khỏi mọi khu thì không hiện. Bước vào / ra một nhà vào được thì không hiện (chỉ chip đổi chữ). Đang hiện mà vào khu khác thì thay chữ và đếm lại 2 giây. Lúc mở app, khu nơi nhân vật xuất phát không hiện thẻ. Thẻ không chặn chạm. | Đi từ (0; 30) Sơn Môn vào (0; 0) Ngoại Môn → hiện 外門 · Ngoại Môn; đi từ (0; 0) ra (24; 0) ngoài mọi khu → không hiện; từ sân Ngoại Môn đi vào giảng đường (0; −11) rồi ra lại → không hiện. | chờ | ok |

## MAN — màn hình

Code: [app/lib/main.dart](../../app/lib/main.dart), [app/lib/scene/](../../app/lib/scene/), [web/src/style.css](../../web/src/style.css), [web/src/ui/loadingScreen.ts](../../web/src/ui/loadingScreen.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-MAN-1 | App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống; chữ và nút của HUD luôn nằm ngoài vùng bị che. | Máy có tai thỏ xoay ngang, tai thỏ bên trái rộng 40 px → chip "Học xá · Sân chính" cách mép trái ít nhất 40 px; cảnh vẫn vẽ tới sát mép. | đúng | ok · miễn test (chỉ kiểm được trên máy thật) |
| R-MAN-2 | Mở app thì màn tải (tên tông môn + thanh tiến trình) che kín màn hình tới khi cảnh 3D vẽ xong khung hình đầu tiên, rồi mờ dần 0,4 giây. Người chơi không điều khiển được trong lúc màn tải còn hiện. Không có tiến độ thật thì thanh chạy tới 90 % rồi chờ khung hình đầu. | Mở app → thấy "Văn Uyên Tông", "Đang mở sơn môn… 62%"; kéo joystick lúc đó → nhân vật không đi; cảnh hiện → màn tải mờ đi, kéo được. | chờ | ok |
