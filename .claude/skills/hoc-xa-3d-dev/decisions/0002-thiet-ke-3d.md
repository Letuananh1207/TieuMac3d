# 0002 — Thiết kế cảnh 3D ngoài code: đặc tả cảnh + Canvas 3D (+ .glb sau)

Ngày: 2026-11-10 · Trạng thái: đã chốt (người dùng chọn) · Kế hoạch: `docs/tasks/2026-11-10-thiet-ke-3d.md`

## Bối cảnh

Giao diện chính của app là cảnh 3D, nhưng canvas thiết kế (`/ui-design`) chỉ vẽ được giao diện 2D phẳng. Người
dùng muốn thiết kế cả bối cảnh (bố cục, kích thước, màu, ánh sáng, camera) lẫn nhân vật mà không phải sửa code.

## Quyết định

1. **Đặc tả cảnh** `design/scene/scene.json` (phiên thiết kế ghi). Code **đọc thẳng file này lúc build**
   (`import.meta.glob` trong `web/src/scene/spec.ts`); thiếu file thì dùng `DEFAULT_SCENE` = cảnh hiện tại.
   Trường sai kiểu / thiếu → dùng giá trị mặc định của trường đó và ghi vào `problems` (in ra console, hiện trên
   Canvas 3D), không làm sập cảnh.
2. **Canvas 3D** = chính code `web/` chạy ở trang `web/design.html` (`src/designPreview.ts`), build bằng
   `npm run build:design` ra `web/dist-design/`, phiên thiết kế đăng lên artifact. Không viết bản three.js riêng
   cho canvas → canvas và app không lệch nhau. Bản này không chép sang app.
3. **Vùng sự kiện neo theo nhà**: nhà trong spec có `zone: { id, front, r }`; `scene/` tính toạ độ vùng
   (`ZoneAnchor`), `zones/placeZones` ghép với nội dung bài học (`ZONE_CONTENT`, vẫn ở code). Dời nhà thì vùng đi theo.
4. **`/ui-apply` là cửa kiểm** trước khi build cho app: đổi bố cục (nhà, tường, cây trong sân, giếng, vùng) chạm
   luật R-VA-1 / R-VUNG-1 → theo quy trình sửa sổ quy tắc; chỉ đổi màu / ánh sáng / camera → áp luôn.
5. **Model .glb** (mốc 3D-b, sau mốc 3): `GLTFLoader` của `three/examples/jsm` (cùng gói, offline, không thêm thư
   viện), model CC0 trong `design/models/`. Nhân vật giữ gấu khối (`blockCharacter`) tới khi có model gấu riêng;
   `.glb` trước mắt cho vật trang trí.

## Lý do

- Dữ liệu (JSON) thay vì vẽ tay: canvas HTML không dựng được cảnh 3D; số đo trong JSON là thứ code dùng trực tiếp.
- Đọc thẳng thay vì chép: một nguồn sự thật, không quên chép; rủi ro "thiết kế đẩy lên là app đổi" được chặn ở
  `/ui-apply` (phiên code mới chạy `npm run build` cho app).
- Đặc tả chỉ chứa thứ thiết kế quyết (vị trí, kích thước, màu, đèn, camera). Hình dạng chi tiết (cột, mái, đèn
  lồng) vẫn trong code; muốn kiểu vật mới thì phiếu → code thêm kiểu → spec dùng.

## Hệ quả

- `web/vite.config.ts` cho phép đọc `../design/` (`server.fs.allow`) và có thêm đầu vào `design.html`.
- Thông số camera (`OrbitSettings`) do `main.ts` truyền từ spec vào `input/OrbitCamera` (input không import scene).
- Hằng điều khiển trong `input/` (`JOYSTICK_ZONE`, chạm ngắn) **không** đưa vào spec — đó là luật R-DIEU.

## Tông môn — đợt 1 (2026-11-11, thiết kế 2026-11-10.3)

Đặc tả thêm vật cho cảnh nhiều khu trên mặt phẳng: khe cổng / đoạn tường, lối lát đá, kiểu nhà (`dien`, `thap`,
`nha-nho`, mái `cong`), cổng sơn môn, ao, vật trang trí, cụm cây + trúc, đảo nổi + mây. Mọi trường mới mặc định rỗng
→ `scene.json` cũ vẫn đúng, cảnh không đổi. Để giữ ≤ 150 draw call: gộp khối đứng yên cùng vật liệu sau khi dựng
(`scene/merge.ts`). Mái giảng đường giữ dáng prototype (xiên hình thoi khi nhìn từ trên, `legacy`); kiểu nhà mới mái
thẳng với tường. Đợt 2 (sau mốc 3): địa hình bục phẳng theo khu + bậc đá, thác.

## Phong cách Trung Hoa (2026-11-11, thiết kế 2026-11-11.1)

Hướng thiết kế chọn: không gói model ngoài, **dựng lại bằng khối trong code** theo bản mẫu. Kiến trúc tách ra
`scene/kien_truc/`; mái prototype (xiên hình thoi) bỏ — giảng đường dùng mái yết sơn như các điện. Tường `voi` + cổng
trăng; cây tùng / liễu / mai; đồ trang trí mới. Nhân vật: **đệ tử chibi** (người dùng chọn đổi, gấu khối giữ làm dự
phòng) qua `Character`, màu để trong file nhân vật. Chip HUD theo khu (đặc tả `site`, luật R-HUD-1). Cảnh mẫu đủ
kiểu mới 67–90 draw call. Mục 3D-b (.glb) chỉ còn ý nghĩa nếu sau này muốn model ngoài.
