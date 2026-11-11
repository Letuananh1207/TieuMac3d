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

## VUNG — vùng sự kiện và thẻ mời

Code: [web/src/zones/](../../web/src/zones/), [web/src/ui/eventCard.ts](../../web/src/ui/eventCard.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-VUNG-1 | Nhân vật đứng cách tâm vùng **nhỏ hơn** bán kính thì hiện thẻ mời của vùng đó; ra ngoài thì thẻ ẩn. | Vùng lớp HSK 3 tâm (0; −6,4), bán kính 2,6: đứng ở (0; −4,0) (cách 2,4) → hiện "Vào nghe giảng"; đứng ở (0; −3,7) (cách 2,7) → không hiện. | chờ | ok |
| R-VUNG-2 | Bấm "Để sau" thì thẻ ẩn và không hiện lại khi còn đứng trong vùng đó; ra khỏi vùng rồi quay lại thì hiện lại. | Ở vùng thư viện bấm "Để sau", đi vòng trong vùng → không hiện; bước ra ngoài 1 bước rồi quay vào → hiện lại. | chờ | ok |
| R-VUNG-3 | Bấm nút chính trên thẻ thì mở bài học của vùng; khi bài học đang mở, nhân vật đứng yên (joystick, phím, điểm chạm đều không có tác dụng); đóng bài học thì thẻ không hiện lại cho tới khi ra khỏi vùng. | Ở vùng lớp HSK 3 bấm "Vào nghe giảng" → bài chữ 快; giữ joystick → không đi; bấm "Ra sân" → đi lại được, thẻ không hiện. | chờ | ok |

## DIEU — điều khiển

Code: [web/src/input/](../../web/src/input/), [web/src/player/controller.ts](../../web/src/player/controller.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-DIEU-1 | Ngón tay chạm vào 45% bên trái màn hình thì thành joystick (mỗi lúc một joystick); chạm chỗ khác thì kéo để xoay camera, hai ngón thì chụm để zoom. Chuột không dùng joystick. | Màn rộng 400 px: chạm x = 170 → joystick; chạm x = 190 → xoay camera. | chờ | ok |
| R-DIEU-2 | Chạm ngắn (lệch dưới 8 px, nhả trong 300 ms) ở vùng xoay thì nhân vật đi tới điểm đó trên sân; dùng joystick thì bỏ điểm đến; bị vật cản chặn thì dừng. | Chạm 200 ms lệch 5 px → đi tới đó; giữ 400 ms → chỉ xoay, không đi; đi tới điểm sau giếng → chạm giếng thì dừng. | chờ | ok |

## VA — va chạm

Code: [web/src/collision/colliders.ts](../../web/src/collision/colliders.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-VA-1 | Nhân vật (bán kính 0,5) không đi xuyên tường, nhà, cột cổng, giếng, ao / hồ, vật trang trí có va chạm (đài tỉ thí, giá binh khí, lò đan…) và cây có va chạm (cây trong sân, cụm cây); đi qua được khe cổng trên tường. Cây vòng ngoài tường, lối lát đá, đảo nổi, mây không có va chạm. | Mặt trong tường bắc ở z = −20,5 → đi thẳng lên bắc thì dừng ở z = −20,0. Tường nam có khe cổng tâm x = 0 rộng 4: đi thẳng xuống nam ở x = 0 thì qua được; ở x = 3 thì dừng ở z = 20,0. | chờ | ok |
| R-VA-2 | Khi cảnh có địa hình: nhân vật đi trên mặt đất, lên xuống theo độ cao. Không bước được vào mặt đất dốc hơn 35° (cả lên lẫn xuống), như gặp tường; vì vậy không đi ra khỏi mép cao nguyên (vực xuống biển mây). Đang đứng trên mặt dốc hơn 35° thì chỉ đi xuống được. | Kè đá cao 1,5 m trong bề ngang 1 m (dốc ≈ 56°) → dừng ở chân kè. Sườn đồi dốc 30° → đi lên được, nhân vật cao dần theo mặt đất. Đi tới mép vực → dừng ở mép. | đúng | ok |

## HUD — chữ trên màn

Code: [web/src/zones/areaTracker.ts](../../web/src/zones/areaTracker.ts), [web/src/ui/hud.ts](../../web/src/ui/hud.ts)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-HUD-1 | Chip góc trên trái hiện "<tên nơi> · <tên khu>" khi nhân vật đứng trong một khu (hình chữ nhật đặt trong đặc tả cảnh); đứng ngoài mọi khu thì chỉ hiện "<tên nơi>". Hai khu chồng nhau thì lấy khu khai báo trước. Đổi chữ ngay khi bước qua ranh giới. | Tên nơi "Văn Uyên Tông", khu "Diễn Võ Trường" x 27…60, z −15…15: đứng ở (43; 0) → "Văn Uyên Tông · Diễn Võ Trường"; đứng ở (24; 0) (giữa hai tường, ngoài mọi khu) → "Văn Uyên Tông". Chưa đặt khu nào: "Học xá · Sân chính" như cũ. | chờ | ok |

## MAN — màn hình

Code: [app/lib/main.dart](../../app/lib/main.dart), [app/lib/scene/](../../app/lib/scene/), [web/src/style.css](../../web/src/style.css)

| Mã | Quy tắc | Ví dụ | Xác nhận | App |
|---|---|---|---|---|
| R-MAN-1 | App xoay tự do theo máy (dọc và ngang). Cảnh 3D phủ kín màn hình, kể cả dưới tai thỏ và thanh hệ thống; chữ và nút của HUD luôn nằm ngoài vùng bị che. | Máy có tai thỏ xoay ngang, tai thỏ bên trái rộng 40 px → chip "Học xá · Sân chính" cách mép trái ít nhất 40 px; cảnh vẫn vẽ tới sát mép. | đúng | ok · miễn test (chỉ kiểm được trên máy thật) |
