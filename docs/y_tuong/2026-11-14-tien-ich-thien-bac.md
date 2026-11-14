# Tiện ích hai bên Thiên Bậc: Vườn Bia · Câu cá chữ · Hái chè · Trấn báo
- Ngày: 2026-11-14 · Hệ thống (khung 摩尔庄园): trò chơi nhỏ + việc vặt + bộ sưu tập + bản tin
- Trạng thái: nháp, chờ chọn (cùng kế hoạch `docs/tasks/2026-11-14-tien-ich-thien-bac.md`, phần GĐ2)

## Một câu
Dựng bốn khu ở hai bãi trống cạnh Thiên Bậc. GĐ1 chỉ có cảnh. GĐ2 mỗi khu có một việc nhỏ hằng ngày, việc nào cũng dính
chữ: xem bia khắc bộ đã học, câu cá chữ, hái chè theo đơn chữ, đọc Trấn báo.

## Lấy cảm hứng từ
- 摩尔庄园: mỗi trò nhỏ đặt ở một chỗ riêng trong thế giới; việc vặt "làm bao nhiêu được bấy nhiêu"; bản tin của thế giới
  (`.claude/skills/y-tuong/references/mole.md` §2–3).
- Animal Crossing (kiến thức chung): câu cá + bảo tàng sưu tập (hiện vật đầy dần theo tiến độ), nên Vườn Bia là
  "bảo tàng bộ thủ".
- Văn hoá thật: Bia Lâm 碑林 Tây An (rừng bia cạnh văn miếu); 釣臺 điếu đài của Khương Thái Công; đồi chè bậc thang
  dưới trà lâu núi (Vũ Di, Long Tỉnh).

## Chữ Hán đi vào đâu
| Khu | Chữ đi vào |
|---|---|
| Vườn Bia | 50 bộ thủ khắc dần lên 10 bia theo tiến độ (R-HANH-3). Chạm bia mở lại thẻ bộ, coi như **ôn thêm một lần** ngoài lịch |
| Câu cá chữ | mỗi con cá mang một bộ / chữ đã học. Câu = trả lời chữ → nghĩa (dạng câu đố R-ON-2), lặp lại bộ cũ |
| Hái chè | đơn trà viết chữ thật (绿茶 · 红茶 · 花茶 · 白茶…), từ ăn uống HSK 1–2. Đem lên Trà lâu thì tiểu nhị đọc lại |
| Trấn báo | bài đọc 3–5 câu mỗi tuần theo cấp HSK, chuyện của trấn và các vùng |

## Vòng chơi
- **Mỗi lần mở app**: đi lên Trà lâu thì qua ngã ba (Đình Bố Cáo có bảng nhiệm vụ). Rẽ trái xem bia vừa khắc thêm, rẽ
  phải câu vài con cá (trần trò chung 60 Văn tiền / ngày, R-TIEN-3) hoặc nhận 1–3 đơn chè.
- **Mỗi tuần**: Trấn báo số mới. Bia khắc thêm khi học thêm 5 bộ (một mục tiêu nhìn thấy được).
- Không phạt khi nghỉ: cá vẫn đó, đơn chè hôm qua bỏ thì thôi, bia không mất chữ.

## Chấm điểm (`references/khung.md` §2)
| Ý tưởng | Học chữ ×2 | Quay lại | Hợp thế giới | Giai đoạn | Chi phí | An toàn | Tổng |
|---|---|---|---|---|---|---|---|
| Vườn Bia sưu tập | 3 → 6 | 2 | 3 | 3 | 2 (thẻ bộ + tiến độ có sẵn) | 3 | **19** |
| Trấn báo | 3 → 6 | 2 | 3 | 3 | 1 (soạn bài mỗi tuần + màn đọc) | 3 | **18** |
| Hái chè (việc vặt) | 2 → 4 | 3 | 3 | 3 | 1 (việc vặt mới + HUD) | 3 | **17** |
| Câu cá chữ | 2 → 4 | 2 | 3 | 3 | 1 (trò mới + cá động + HUD) | 3 | **16** |
| Sân Diều (sự kiện mùa) | 1 → 2 | 2 | 3 | 3 | 1 | 3 | 14 |
| Chợ Phiên | 1 → 2 | 2 | 3 | 3 | 1 | 3 | 14 |

**Khuyên**: Vườn Bia làm trước (điểm cao nhất, rẻ nhất). Tiếp theo là Hái chè (nhịp ngày, gắn Trà lâu), rồi Câu cá.
Trấn báo cần người soạn bài đều đặn nên để khi có kho bài đọc.

## Đặt ở đâu
Xem sơ đồ trong kế hoạch: Vườn Bia ở sau Tàng Thư Các (x −46…−26, z −48…−35). Đình Bố Cáo ở ngã ba trước cổng bắc Quảng
Trường. Bến Suối bên ao cạnh suối Hậu Sơn (x 33–44, z −48…−35). Đồi Chè trên sườn tây bắc bãi đông (x 8–26, z −48…−38).

## Cần gì
- **Luật** (nháp trong kế hoạch): R-BIA-1, R-CAU-1…3, R-CHE-1…2, R-BAO-1. Sửa R-NGOI-1 nếu bồ đoàn ngoài trời thành chỗ ngồi.
- **Giao diện mới** (`/ui-apply phieu`): nút nổi "Xem bia" + danh sách bộ của bia; màn câu cá; thẻ đơn chè + giỏ chè;
  màn đọc Trấn báo.
- **Cảnh**: GĐ1 của kế hoạch (`/canh`); cá bơi (vật động mới) cho ao.
- **Dữ liệu**: chia 50 bộ thành 10 bia; 6–8 loại chè (chữ, pinyin, nghĩa); kho bài Trấn báo.
- **Cầu nối**: `getProgress.radicals` có sẵn (Vườn Bia). `earnGame` thêm loại trò câu cá / đơn chè, nên sửa `docs/bridge.md` trước.
- **Chờ giai đoạn mạng**: bảng vinh danh người thật, câu cá thi với bạn.

## Bước kế
1. Duyệt kế hoạch `docs/tasks/2026-11-14-tien-ich-thien-bac.md` (Q1–Q7) → `/canh` làm GĐ1.
2. `/lead Vườn Bia sưu tập bộ thủ (phiếu docs/y_tuong/2026-11-14-tien-ich-thien-bac.md)` + `/ui-apply phieu nút Xem bia`.
3. Sau đó `/y-tuong soat` Hái chè và Câu cá trước khi lập kế hoạch con.
