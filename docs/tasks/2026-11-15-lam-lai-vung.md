# V-66 — Làm lại các vùng ngoài Khởi Nguyên Trấn

Yêu cầu (người dùng 2026-11-15): "các kiến trúc và cách bài trí ở các map ngoài Khởi Nguyên Trấn tôi đang rất không hài
lòng vì nó xấu lộn xộn, nên hãy xóa hết các kiến trúc và bắt đầu nghiên cứu từ đầu; trước khi xây hãy xây địa hình và
xác định phạm vi, sau khi ưng rồi chuyển qua quyết định dần kiến trúc, rồi đến xây dựng các mini game ở map".
Đã chọn: **xoá ngay trong app**; xoá kiến trúc + vật; **giữ** cổng đi bộ (vòng sáng nối vùng V-59, `portals`) và bãi hạc
đáp (`stoneYard`, chỗ xuất phát); thử vùng **Trúc Lâm** trước ở các bước sau.

## Lộ trình

| Bước | Việc | Duyệt |
|---|---|---|
| **B0** | Xoá kiến trúc + vật ở 6 cảnh vùng (việc này) | — |
| B1 | Nghiên cứu lại phong cách từng vùng → `docs/tham_khao/` (`/khao-cuu`, việc song song) | người dùng đọc hồ sơ |
| B2 | Địa hình + phạm vi **Trúc Lâm** (`/canh`): mép đất, đồi, suối / thác / ao, chỗ đi được, cổng + bãi hạc nằm đâu | duyệt ảnh trên + góc chơi |
| B3 | Kiến trúc Trúc Lâm **dần từng phần** (một công trình / một khu mỗi lần), cây trồng lại sau cùng | duyệt từng phần |
| B4 | Mini game ở Trúc Lâm (`/y-tuong` → `/lead`) | duyệt kế hoạch |
| B5 | Nhân cách làm B2–B4 ra 5 vùng còn lại (Yên Vũ Lâu, Bồng Lai Đảo, Nhạn Môn Quan, Tử Cấm Thành, Đôn Hoàng Lộ) | từng vùng |

## B0 — xoá (cách làm)

1. 6 file `design/scene/{rung-truc,giang-nam,bong-lai,truong-thanh,tu-cam-thanh,to-lua}.json`: rỗng hoá (khai rõ `[]`
   để không rơi về mặc định của trấn) `buildings`, `gates`, `wallSegments`, `paths`, `bridges`, `boats`, `channels`,
   `galleries`, `mirages`, `ramparts`, `caravans`, `props`, `npcs`, `gameTables`, `decorSlots`, `lanternStrings`, `fences`,
   `teaRows`; `walls` / `well` tắt; cây (`yard`, `groves`, `ring.count`) = 0; `terrain.stairs` = []; nước chỉ giữ ao / suối
   tròn, hình trăng (bỏ kênh, hào chữ nhật); bỏ nền trũng lòng kênh (Yên Vũ Lâu) và nền bậc Tam Đài (Tử Cấm Thành); nền
   lát → đất; `site.areas` = [] (tên khu theo công trình cũ).
2. Giữ: địa hình (đồi, đỉnh, đụn cát, thác, suối, cỏ, đá), trời / sáng / sương / ngày đêm, núi xa, đảo nổi + đàn hạc bay
   (Bồng Lai), `portals`, `stoneYard`, `player.start`, `lessons.radicals`, camera.
3. Lối lát: **bỏ hết** (cả đoạn bãi hạc ↔ cổng) — nền các vùng đi được khắp, B2 làm lại địa hình sẽ vẽ lối mới.
4. Luật: R-VUNG-1, R-VUNG-2 (ví dụ), R-VA-1, R-HANH-4, R-BANDO-2 viết lại theo trạng thái "vùng chỉ có địa hình + cổng +
   bãi hạc". Test `capCong.test.ts`: "cuối lối lát" chỉ kiểm khi vùng có lối.
5. Code dựng kiến trúc **giữ nguyên** (B3 dùng lại hoặc bỏ sau).

## Ghi chú cho các bước sau

- Đặc tả vùng thiếu khoá nào thì lấy mặc định của trấn (`DEFAULT_SCENE`) — mặc định `buildings` có nhà → luôn khai `[]`.
- Cổng đi bộ phải trên nền phẳng (`scene:check`); đổi địa hình B2 thì giữ vòng + chỗ đứng hoặc dời cả cặp (R-HANH-4,
  `capCong.test.ts` bảng `NEW`).
- Học bộ thủ mới ở Trúc Lâm (R-HANH-3) không gắn vật trong cảnh: Ngồi ôn ở đâu cũng được, chỉ cần `lessons.radicals`.
