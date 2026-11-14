# Danh mục bộ asset kiến trúc chuẩn · đã duyệt 2026-11-14 (GĐ 2)

Nguồn: hồ sơ `docs/tham_khao/kien-truc-chuan.md` (đã chọn hướng 2026-11-14) · kế hoạch
`docs/tasks/2026-11-14-kien-truc-chuan-bai-tri.md`. Mọi số dưới đây là **mét trong cảnh**, đã nhân thước đo chung
**K = 1,25** (bỏ `heightScale` riêng từng map). Chi tiết cỡ người (bậc 0,15 · lan can 0,9 · ghế 0,45 · bàn 0,75 · cửa ≥ 2,6)
không nhân. Cảnh **chỉ** dùng mẫu trong danh mục này, ở một trong 3 cỡ — không đặt `w`, `d` tuỳ ý.

## 0. Luật chung

| Mục | Quy định |
|---|---|
| Cấp bậc | C1–C6 (bảng mục 2 hồ sơ). Mỗi map có **trần cấp**; một công trình duy nhất ở trần = mốc lớn. |
| Gian | lẻ (trừ `lau` L 6 gian — tàng thư); gian phụ = 0,8 × gian giữa |
| Cột | cao = 0,8 × gian giữa (nhà nhỏ) · ∅ = cao / 11; son đỏ từ C4 trở lên, gỗ sẫm `#3A2418` ở C5, không cột ở C6 |
| Mái đua | 0,3 × cao cột (C4–C5) · 0,4 × (C1–C3) |
| Mái theo giọng vùng | **Tống** (tông môn, Bồng Lai, Rừng trúc): dốc ≈ 30–34°, góc vểnh mềm · **Thanh** (Tử Cấm Thành, Trường Thành): 27° ở hiên → 42° ở nóc, mái lõm · **Giang Nam** (Giang Nam): dốc ≈ 30°, đầu đao vểnh rất cao 嫩戧發戧 · **Đường** (Tơ lụa): thoải ≈ 25°, vươn xa |
| Nền theo cấp | C1 tu di 3 tầng (rút gọn 6 m) · C2 tu di 1–2 tầng 1,8–2,5 m · C3 đá 1,2 m · C4 0,6 m · C5 0,4 m · C6 không / đất |
| Ngói | vàng `#C9A13B` chỉ Tử Cấm Thành (+ Chưởng Môn Điện nếu dựng) · lục `#2B5446` C2–C4 có chủ đích · xám đen `#4F5A63` còn lại · đen viền lục cho tàng thư |
| Mục đích | mỗi mẫu đặt vào cảnh ghi `purpose`: `hoat-dong` · `dan-duong` · `ke-chuyen` · `nen-xa` (+ một dòng lý do) |
| Ngân sách | tam giác: C1–C2 ≤ 12k · C3 ≤ 8k · C4 ≤ 4k · C5–C6 ≤ 2k. Draw call **không tính theo từng nhà**: khối cùng màu của mọi nhà trong cảnh gộp chung (`merge.ts`) → giữ màu trong bảng màu chung là đủ; Catalog vẫn in số màu mỗi mẫu |
| Model AI | 1 công trình biểu tượng / vùng thay bản khối (mục 6); bản khối vẫn có để dự phòng |

## 1. Nhà (19 mẫu)

Cột "Thay" = kiểu đang dùng trong code / cảnh sẽ chuyển sang mẫu này. "Vào" = đi vào được (sàn, va chạm trong nhà).
Cột "Duyệt" = kết quả xem trên Catalog 3D (mục 7).

| Mã | Tên | Việc dùng | Cấp | S | M | L | Mái | Vào | Thay | Duyệt |
|---|---|---|---|---|---|---|---|---|---|---|
| `dien` | Điện 殿 | thờ, nghi lễ, việc chính của khu | C1–C3 | 3 × 2 gian · 13 × 9 · cột 4 | 5 × 3 · 21 × 12 · cột 4,5 | 7 × 4 · 29 × 15 · cột 5 | C1 vũ điện kép · C2 yết sơn kép · C3 yết sơn đơn; biến thể **vuông toản tiêm** 3 × 3 · 11 × 11 (Trung Hoà) | không | `dien` (Tử Cấm Thành ×5) | **đạt** (2026-11-14) |
| `sanh` | Sảnh 廳堂 | giảng, tiếp khách, nhà chính khu vườn | C3–C4 | 3 gian · 12 × 8 | 5 gian · 19 × 10 | — | yết sơn / ngạnh sơn | có | `giang-duong` | **đạt** (2026-11-14) |
| `lau` | Lầu 樓 2 tầng mặt dài | trà lâu, tửu lâu, tàng thư | C3–C4 | 3 gian · 10,5 × 8 | 5 gian · 17 × 10 | 6 gian · 18 × 9 (tàng thư, hồ trước mặt) | yết sơn, hiên lửng | có (thang ngoài, tầng 2) | `tra-lau`, `lau-sach` | đợt 1 bày bằng hàm cũ — duyệt lại khi chuyển mẫu (GĐ 4–5) |
| `cac` | Các 閣 vuông có ban công vòng 平坐 | ngắm cảnh, thờ, **công trình biểu tượng** | C3–C4 | 1 gian · 6 × 6 · 2 tầng | 3 gian · 11 × 11 · 2 tầng | 3 gian · 13 × 13 · 3 tầng | yết sơn / toản tiêm | tầng 1 | Bồng Lai Các, Nguyệt Tuyền Các, Vọng Giang Lâu (đang dùng `lau-sach`, `nha-nho`, `thap`) | **đạt** (2026-11-14) |
| `thap` | Tháp 塔 | mốc nhìn xa, thờ | C3–C4 | 5 tầng · đáy 5 · cao 18 | 7 tầng · đáy 7 · cao 26 | 9 tầng · đáy 9 · cao 34 | toản tiêm; mặt bằng vuông (Đường) · lục / bát giác (Tống) | không | `thap` | **đạt** (2026-11-14) |
| `dinh` | Đình 亭 | nghỉ chân, ngắm, che giếng / bia | C4 | vuông cạnh 3,75 · cột 3 | lục giác ∅ 5 · cột 3,2 | bát giác ∅ 6,25, hiên kép | toản tiêm / quyển bồng yết sơn; ngói hoặc tranh (Rừng trúc) | có (mở) | `dinh` | **đạt** (2026-11-14) |
| `ta` | Thuỷ tạ 榭 · Hiên 軒 | ngồi bên nước, nghe nhạc | C4 | 1 gian · 5 × 5 | 3 gian · 11 × 6 | — | quyển bồng yết sơn, mặt nước mở, 美人靠 | có | (mới) — thay "Thuỷ các" `nha-nho` | **đạt** (2026-11-14) |
| `phuong` | Thạch phảng 舫 | ngồi bên nước, biểu tượng vườn | C4 | 1 cỡ · 18 × 5, đuôi lầu 2 tầng | — | — | mỗi đoạn một mái | có | (mới) | đợt 2 — chờ duyệt |
| `lang` | Hành lang 廊 | nối nhà, che mưa, dẫn đường | C4–C5 | đoạn thẳng 3,75 · lòng 1,9 · cột 3,1 | lang bồng ven kênh (một dốc, lòng 3, ghế 美人靠 phía nước) | bò núi (bậc theo dốc) | quyển bồng | có | (mới) | đợt 2 — chờ duyệt |
| `nha-giang-nam` | Nhà gối sông · thuỷ các 水閣 | ở, bến nhà, thuyền ghé | C5 | 1 gian · 4,5 × 7 · 2 tầng | 2 gian · 9 × 8 | 3 gian · 12 × 9 + gác chồm nước | ngạnh / huyền sơn, đầu hồi 觀音兜 | không | Nhà ven sông, Thư phòng (`nha-nho`) | **đạt** (2026-11-14) |
| `nha-day` | Dãy nhà 1 tầng (đạo phòng, sương phòng, doanh trại, kho lương) | ở, trọ, chứa | C5 | 3 gian · 12 × 6 | 5 gian · 20 × 6 | 7 gian · 28 × 6 | ngạnh sơn; kho lương nền 0,8 + lỗ thông gió | không | Trúc Xá, Kho lương (`nha-nho`) | **đạt** (2026-11-14) |
| `nha-dat` | Nhà đất nện / gạch mộc | ở, chứa (biên ải) | C6 | 1 ô · 5 × 5 | 2 ô · 10 × 5 | 3 ô quanh sân chữ U · 15 × 15 | mái bằng đất | không | `nha-dat` (props) | đợt 2 — chờ duyệt |
| `cua-hang` | Cửa hàng 下店上宅 | bán (có NPC / trò) | C5 | 1 gian · 4,5 × 7,5 | 2 gian · 9 × 7,5 | 3 gian · 13,5 × 7,5 | ngạnh sơn, 2 tầng, ván cửa tháo | tầng 1 | `cua-hang` | đợt 1 bày bằng hàm cũ — duyệt lại khi chuyển mẫu (GĐ 4–5) |
| `tu-mieu` | Từ / miếu 祠廟 (một viện) | thờ, kể chuyện vùng | C3–C4 | cổng + điện S trong sân · 15 × 20 | + hưởng đường · 20 × 30 | — | yết sơn đơn | sân | Khương Nữ Từ (`nha-nho`) | đợt 2 — chờ duyệt |
| `hi-dai` | Hí đài 戲臺 | biểu diễn, tụ tập | C3 | 1 cỡ · sân khấu 9 × 9, nền 1,5 | — | — | yết sơn | có | `hi-dai` | đợt 1 bày bằng hàm cũ — duyệt lại khi chuyển mẫu (GĐ 4–5) |
| `lau-thanh` | Lầu trên đôn đài 城樓 | cổng chính + mốc | C2–C3 | đôn 12 × 8 cao 5 + lầu 3 gian 1 tầng | đôn 20 × 12 cao 7 + lầu 3 gian 2 tầng (lầu cổng ải) | đôn chữ 凹 + lầu 9 gian (Ngọ Môn) | yết sơn kép / vũ điện kép (L) | không | `quan-thanh`, `ngo-mon`, `cong-quan` (props) | đợt 2 — chờ duyệt |
| `dich-lau` | Địch lâu rỗng 空心敵台 | canh, bắn, trú | C6 (+ chòi C5) | 1 cỡ · 12,5 × 12,5 · cao 14 · chòi 鋪房 trên nóc | — | — | chòi ngạnh sơn | mặt nóc | `dich-lau` (props) | đợt 2 — chờ duyệt |
| `phong-hoa` | Phong hoả đài 烽燧 + đống củi | báo hiệu | C6 | gạch · đáy 7,5 · cao 10 | đất nện · đáy 9 · cao 12 + sân 13 × 11 | — | không | không | `phong-hoa`, `phong-hoa-dat` (props) | đợt 2 — chờ duyệt |
| `leu` | Lều · sạp | trọ tạm, buôn bán | C6 | sạp 2,5 × 1,9 (mái vải / ô) | lều quân 4 × 5 | lều tròn ∅ 6,5 · lều chỉ huy 8 × 10 | vải | không | `leu`, `leu-vai`, `lau-say`, `soai-truong`, `sap-o` | đợt 2 — chờ duyệt |

Riêng `lau-vach` (Cửu Tầng Lâu dựa vách) và các công trình biểu tượng khác → mục 6 (model AI).

## 2. Phần nối (cổng, tường, cầu, nền, lan can, bậc)

| Mã | Tên | Việc dùng | S | M | L | Ghi chú | Thay |
|---|---|---|---|---|---|---|---|
| `bai-phuong` | Bài phường 牌坊 / bài lâu 牌樓 | cổng biểu trưng — mốc dẫn đường | 1 gian 2 trụ · 4,5 × 6 | 3 gian 4 trụ · 15 × 10 | 5 gian 6 trụ · 25 × 14 | có / không mái; **xà thấp nhất ≥ 6 m** (camera, `phong_cach.md`) | `cong-truc`, cổng `gates` |
| `son-mon` | Sơn môn 山門 | cổng chính trên trục, 3 cửa | 3 gian · 13 × 6 | — | — | yết sơn đơn | (mới) |
| `cong-tuong` | Cổng trên tường: `trang` · `lau` (門樓) · `thuy-hoa` (垂花門) | cửa vào sân | trăng ∅ 2,5 (vườn) · thuỳ hoa 3,5 × 4 | trăng ∅ 4 · môn lâu lối 3 | trăng ∅ 6,4 · môn lâu lối 5,8 (tường bao) | đã có `trang`, `lau` (`tuong.ts`) — thêm `thuy-hoa` | `walls.gates[].kind` |
| `tuong` | Tường: `voi` (粉牆 / 院牆 / 雲牆) · `cung` (đỏ) · `thanh` (gạch Minh, đoạ khẩu) · `dat` (đất nện) | chia sân, bao khu, phòng thủ | vôi cao 2,5 · dày 0,35 (chia sân) | vôi 3,5 · 0,5 | vôi 4,5 · 0,5 (bao) · cung 7,5–10 · 1,5 · thành 9 + đoạ 1,8, mặt 6 · đất 5 · 1,5 | lậu song đáy 1,6, ô 1 m; đỉnh 饅頭頂 lợp ngói | `walls`, `wallSegments`, `thanh_luy.ts`, `tho-bich` |
| `cau` | Cầu: `vom` (拱) · `bang` (平 / cửu khúc) · `mai` (廊橋) · `treo` (索) | qua nước / vực — mốc | vòm 1 nhịp 8, rộng 3 · bằng rộng 2,5 · treo ván 1,5 | vòm nhịp 14, rộng 5 · cửu khúc 3 | vòm 3 nhịp 30, rộng 7 · có mái 25 × 6,5 | cầu cung đình rộng theo cấp 10,6 / 7,2 / 5,7; lan can cầu 0,9 | `bridges.ts` |
| `nen` | Nền 台基 · tu di 須彌座 · đôn đài | nâng cấp bậc | thường (theo cấp) | tu di 1 tầng | tu di 3 tầng hình 土 (Tam Đài) | tu di chia 51 phần: 10 · 8 · 7 · 10 · 7 · 9 | `terrain.plateaus` (khi là nền nhà) |
| `lan-can` | Lan can đá trắng · gỗ · 美人靠 | chặn mép nền, cầu, ban công | gỗ cao 0,9 | đá cao 1,1, mô-đun 1,9 | đá chạm + 螭首 (C1–C2) | không nhân K | `fences`, `lanCan.ts` |
| `bac` | Bậc 踏跺 | lên nền | 如意 (3 mặt) | 垂帶 (đá xiên hai bên) | 御路 (phiến rồng giữa) | bậc 0,15 × 0,32, không nhân K | `stairs` |

## 3. Vật sân có việc (11 mẫu)

Chỉ đặt kèm công trình đúng cấp và đúng chỗ như cột "Đặt ở đâu"; không đặt lẻ để lấp chỗ trống.

| Mã | Vật | Cấp tối thiểu của sân | Đặt ở đâu | Cỡ (cảnh) | Thay |
|---|---|---|---|---|---|
| `chieu-bich` | Chiếu bích 照壁 | C4 | trên trục, đối diện cổng | 8 × 4 × 0,8 (S) · 30 × 5 (L — Cửu Long Bích) | (mới) |
| `su-tu` | Sư tử đá / đồng (cặp) | C3 | hai bên cổng; đực trái (đông), cái phải (tây) nhìn từ trong ra | cao 2,5 | `su-tu-dong` |
| `hoa-bieu` | Hoa biểu 華表 (cặp) | C1 | hai bên trục trước cổng cung | cao 12 | (mới) |
| `nhat-quy` | Nhật quỹ + gia lượng (+ rùa, hạc đồng cặp) | C1–C2 | sân nền trước điện chính: nhật quỹ **đông**, gia lượng **tây** | nhật quỹ cao 1,5 | `nhat-quy`, `rua-dong`, `hac-dong` |
| `vac-nuoc` | Vạc nước 銅缸 (cặp) | C2 | hai bên điện chính | cao 1,5 · ∅ 2 | (mới) |
| `dinh-huong` | Đỉnh / lư hương | C3 | giữa sân trước điện chính (đỉnh trước, lư sau) | cao 2,5 | `dinh-dong`, `lo-dan` (lò đan: biến thể) |
| `gieng` | Giếng (+ đình giếng) | C5 | trước bếp / điện phụ, giữa sân trạm | ∅ 1,4 · đình giếng 2,5 | `well` |
| `den-da` | Đèn đá | C4 | dọc lối (cách đều — dẫn đường) hoặc trên trục trước điện | cao 1,9 | `den-da`, `den-truc` |
| `bia` | Bia / đình bia (rùa đội bia ở C1–C2) | C4 | trên trục sau cổng, hoặc cặp đông–tây | cao 2,5–4 | `da-khac` |
| `cot-co` | Cột cờ / phướn (cặp) | C5 | ngoài cổng, chân kẹp đá | cao 12 | `co` (cờ dọc) |
| `cui-bao-hieu` | Đống củi báo hiệu 積薪 | C6 | sát phong hoả đài | 3 × 3 × 2 | (mới) |

Vật nhỏ khác (bàn trà, sạp, bồ đoàn, kệ sách, chum, ngựa, lạc đà, hạc, thuyền…) **không thuộc kiến trúc**: vẫn dùng nhưng
chỉ đặt khi gắn một **hoạt động** (chỗ ngồi có việc, sạp có NPC bán, đoàn buôn đang đi) — ghi trong bản mô tả bài trí GĐ 3.

## 4. Bộ phận dùng chung (code dựng mọi mẫu từ đây)

nền (thường / tu di 1–3) · bậc (3 kiểu) · cột (tròn / vuông; son / mộc) · dải xà + đấu củng (theo cấp) · tường (vôi / gạch /
đất / cung) · cửa bức bàn · lan can (đá / gỗ / 美人靠) · **mái 7 kiểu** (vũ điện, yết sơn, huyền sơn, ngạnh sơn, toản tiêm
4 / 6 / 8, quyển bồng, mái bằng) × hiên đơn / kép × 4 giọng dốc · bờ nóc + si vẫn + thú nóc (theo cấp) · biển (chữ Việt) ·
đèn lồng · ban công 平坐. Đa số đã có rời rạc trong `web/src/scene/kien_truc/` — GĐ 4 gom lại, không viết mới từ đầu.

## 5. Trần cấp + mẫu dùng ở từng map

| Map | Trần · mốc | Mẫu dùng |
|---|---|---|
| Văn Uyên Tông | C3 (C2 khi có Chưởng Môn Điện) · trà lâu trên đỉnh | `lau` M (trà lâu) · `lau` L (Thư viện) · `dinh` · `lang` · `son-mon` · `cong-tuong` · `tuong` vôi · `nen` · `bac` · `den-da` · `dinh-huong` · `bia` |
| Rừng trúc | C4 · thác + Lưu Thương Đình | `dinh` (mái tranh) · `ta` · `nha-day` S (Trúc Xá) · `cau` bằng · `bai-phuong` S (cổng trúc) · `bia` · `den-da` |
| Giang Nam | C4 · Vọng Giang Lâu (`cac` L) | `nha-giang-nam` · `cua-hang` · `lau` S (trà lâu) · `lang` (lang bồng) · `cau` vòm + bằng · `ta` · `dinh` |
| Bồng Lai | C3 · Bồng Lai Các (`cac` M) | `cac` · `dinh` · `thap` S · `cau` treo · `nen` · `bai-phuong` M (cổng 蓬萊) · `dinh-huong` (lò đan) |
| Trường Thành | C3 · lầu cổng ải (`lau-thanh` M) | `tuong` thành · `dich-lau` · `phong-hoa` + `cui-bao-hieu` · `lau-thanh` · `nha-day` (doanh trại, kho lương) · `tu-mieu` S (Khương Nữ Từ) · `leu` · `cot-co` |
| Tơ lụa | C3 · Cửu Tầng Lâu (model AI) | `nha-dat` · `tuong` đất (dịch trạm 1 cổng) · `phong-hoa` đất · `leu` (tròn, sạp) · `cac` S (Nguyệt Tuyền Các) · `bai-phuong` / `lau-thanh` S (Dương Quan) · `gieng` |
| Tử Cấm Thành | C1 · Thái Hoà Điện | `dien` L (C1 Thái Hoà) · `dien` vuông (Trung Hoà) · `dien` M (C2 Bảo Hoà) · `dien` S (Văn Hoa, Võ Anh) · `lau` L (Văn Uyên Các, ngói đen viền lục) · `lau-thanh` L (Ngọ Môn) · `nen` L · `cau` vòm ×5 theo cấp · `tuong` cung · `su-tu` · `nhat-quy` · `vac-nuoc` · `dinh` (Ngự Hoa Viên) |

## 6. Công trình biểu tượng làm model AI (1 / vùng — đề xuất, chờ chọn)

| Map | Đề xuất | Lý do |
|---|---|---|
| Văn Uyên Tông | **chưa làm** (người dùng 2026-11-14) — để sau | ưu tiên vùng có công trình khó dựng |
| Rừng trúc | không cần (thiên nhiên là chính) | — |
| Giang Nam | Vọng Giang Lâu | điểm cao duy nhất của thuỷ trấn |
| Bồng Lai | Bồng Lai Các | cuối trục, trên vách đỏ |
| Trường Thành | Lầu cổng ải | mốc lớn, nhiều chi tiết |
| Tơ lụa | Cửu Tầng Lâu dựa vách | 9 lớp hiên — khối khó dựng đẹp |
| Tử Cấm Thành | Thái Hoà Điện | C1, cần chi tiết nhất |

## 7. Catalog 3D (để duyệt từng mẫu)

Trang riêng chạy đúng code app (như Canvas 3D): lưới các mẫu ở cả 3 cỡ, nhân vật đứng cạnh mỗi mẫu, nhãn mã + cỡ + cấp +
draw call / tam giác; chọn giọng vùng (Tống / Thanh / Giang Nam / Đường) để xem mái đổi dốc. Cần code (GĐ 4) — kế hoạch
riêng qua `/lead`. Duyệt xong mỗi mẫu → ảnh `design/screens/KienTruc-<mã>.png`, đánh dấu "đạt" trong bảng trên.

## Trạng thái

| Phần | Trạng thái |
|---|---|
| Danh mục (bản này) | **đã duyệt** (người dùng 2026-11-14) — số đo có thể chỉnh khi xem Catalog 3D |
| Catalog 3D | https://claude.ai/artifact/VHdbpqKax8q8Ya5fUxeGXc (`?giong=tong|thanh|giang-nam|duong`, `?dot=1|2`, `?ma=<mã>`) · **đợt 1 đạt** (người dùng 2026-11-14 — 8 mẫu dựng mới; `lau`, `cua-hang`, `hi-dai` bày bằng hàm cũ, duyệt lại ở GĐ 4–5) · **đợt 2 đã đăng** (8 mẫu + `leu-chi-huy`) — chờ duyệt |
| Model AI biểu tượng | tông môn: chưa làm; các vùng: theo mục 6, làm sau khi Catalog duyệt mẫu khối tương ứng |
