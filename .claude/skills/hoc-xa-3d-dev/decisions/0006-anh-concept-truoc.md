# 0006 — Ảnh concept Gemini chốt trước, rồi mới dựng bối cảnh / kiến trúc

Ngày: 2026-11-16 · Trạng thái: đã chốt (người dùng) · Bổ sung 0002 (thiết kế cảnh 3D), 0003 (tài sản AI)

## Quyết định

Từ 2026-11-16, việc **mới hoặc đổi lớn** về bối cảnh / kiến trúc phải có **ảnh concept tạo bằng Gemini, người dùng chốt**,
trước khi sửa đặc tả cảnh, code dựng cảnh hay làm model:

| Bắt buộc ảnh trước | Được miễn |
|---|---|
| map / vùng mới · khu mới trong map · công trình / kiến trúc mới (nhà, điện, cổng, cầu, đài…) · đổi dáng / phong cách một khu hay một công trình | dời vị trí, chỉnh cỡ / màu nhỏ, đặt / dời NPC, thêm vật lặp có sẵn (cây, đèn, đá), sửa lỗi cảnh |

## Luồng

1. Phiên nhận việc (`/canh`, `/lead`, `/task`, `/khao-cuu` khi đề xuất khu mới) **dừng trước khi dựng**: khảo cứu nếu cần
   (`/khao-cuu`), soạn **phiếu ảnh concept** `docs/phieu_thiet_ke/<ngày>-concept-<tên>.md` (trạng thái `chờ thiết kế`) gồm:
   các góc cần (toàn cảnh từ trên cao chếch · góc người chơi đi vào · từng công trình mới — mặt tiền + chếch ¾; công trình sẽ
   làm model Tripo thì thêm bộ 4 góc theo `/tai-nguyen`), bố cục / kích thước gần đúng (lấy từ đặc tả cảnh hoặc phác hoạ chữ),
   bảng màu, phong cách (`design/scene/phong_cach.md`, hồ sơ `docs/tham_khao/`), câu lệnh Gemini soạn sẵn, điều cấm
   (không chữ Hán trên biển — R-HUD-4; không watermark). In khối "Dán vào canvas".
2. Người dùng chạy Gemini ở `/ui-design` (Claude không tự tạo ảnh), chọn / sửa tới khi ưng → **chốt**: ảnh vào
   `design/concept/<tên>/*.png` + mục `design/CHANGELOG.md` (loại: concept) + trạng thái phiếu `đã chốt`.
3. Khi ảnh đã chốt mới dựng: `/canh` sửa đặc tả theo ảnh (chụp Canvas 3D cạnh ảnh concept để so), cần code → kế hoạch `/lead`
   (ghi đường dẫn ảnh concept trong kế hoạch), công trình nổi bật → model Tripo (`/tai-nguyen`).
4. Kế hoạch / việc đang chờ ảnh: trạng thái `chờ thiết kế (concept <tên>)`; phần không phụ thuộc hình (luật, dữ liệu) làm trước được.

## Vì sao

Người dùng muốn thấy và duyệt hình dáng trước khi tốn công dựng (2026-11-16): sửa trên ảnh rẻ hơn sửa đặc tả / code / model;
ảnh concept cũng là đầu vào chung cho Tripo và cho so sánh khi dựng.
