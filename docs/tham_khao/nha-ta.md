# Ngôi nhà "Nhà của ta" — bên ngoài (正房 · 民居三開間)
- Ngày: 2026-11-16 · Khu: Nhà của ta (`design/scene/nha-ta.json`, building `chinh-phong`, `kind: "nha-o"`) · Việc: V-20261116-88
- Trạng thái: đã chọn hướng (Claude, một bước) · đã chuyển phiếu ảnh (`docs/phieu_thiet_ke/2026-11-16-anh-nha-ta.md`)
- Người dùng đã chốt: **chỉ bên ngoài**, **giữ dáng nhà hiện tại, đẹp hơn** (cùng bố cục, kích thước, vị trí cửa); model
  Tripo (Generate, không Rig) thay khối code; vào nhà vẫn bằng cổng của code (R-NHA-1).
- Hồ sơ liên quan: `nha-rieng-game.md` (bố cục đảo nhà, quy chế C5), `kien-truc-chuan.md` (thang C1–C6, nhà dân ≤ 3 gian),
  `cong-trinh-noi-bat.md` (cách làm ảnh 4 góc công trình cho AI).

## Một câu
Ngôi nhà chính 正房 (chính phòng — nhà trên của một khu nhà ở, mặt nhìn ra sân) của người chơi: nhà dân 3 gian một tầng,
mái hai mái ngói xám, tường vôi, khung gỗ sẫm, hiên trước 4 cột, cửa gỗ gian giữa. Cảm giác: **ấm, gọn, "nhà mình"** —
thấp hơn mọi điện của tông môn, không cột son, không vàng; đẹp nhờ chi tiết mộc (ngói ống, cửa ô, bậc đá) chứ không nhờ to.

## Hiện trạng (bản khối, chụp 2026-11-16 Canvas 3D `?vung=nha-ta`)
Ảnh: `design/screens/Nha-ta-khoi-{truoc,trai,sau,phai,cheo}.png` (camera ngang tầm 2,2 m, cách tâm 14–15 m, fov 55° — có phối
cảnh nên đầu hồi trông hơi xiên; thật ra mái **hai mái thẳng**, hồi tam giác). Trái / phải theo quy ước nhân vật: `trai` = hồi bên trái của chính
ngôi nhà (phía +x, mặt trước quay sang trái ảnh); `cheo` = ¾ trước – phải người xem, camera cao 6 m.

| Bộ phận | Số đo (m, hệ cảnh) | Ghi chú code (`web/src/scene/kien_truc/nha_o.ts`) |
|---|---|---|
| Tâm nhà · hướng | (−15; −8) · mặt trước nhìn **+z** (nam, ra sân trước + lối đi) | `rotY` không đặt |
| Nền đá | 10,8 × 6,3, cao 0,30, `#8C8A84` | `PLAT` |
| Thân (tường) | rộng 10,5 × sâu 6,0, tường cao 2,6 trên nền (đỉnh tường y = 2,9), dày 0,22 | `h = 2,6 × heightScale` |
| Gian | 3 gian đều 3,5 m (gian giữa = cửa) | `door = w / 3` |
| Cửa chính (gian giữa) | khung rộng 3,5; cửa cao 2,3 (từ mặt nền); hai cánh bức bàn 1,05 m hai bên + ô cửa tối giữa 1,4 m lùi 0,6 | `closed: true`; cổng vào nhà: vùng x −16,2…−13,8, z −5,6…−4,6 |
| Cửa sổ hai gian bên | song giấy 3,2 × 1,2 (cao 0,9 → 2,1 trên nền), 3 song đứng; chân tường 0,9 | `PAPER #EFE4C8` |
| Hiên trước | 4 cột ∅ 0,30 cao 2,6 tại x = ±5,25 · ±1,75, cách mặt tường 0,2; xà hiên 0,26 | cột `#3A3430` |
| Mái | hai mái 11,7 × 7,8 (chìa 0,6 ra hồi và trước / sau), cao 1,5 (chân y = 2,9 → nóc y = 4,4); bờ nóc 11,9 × 0,28 + 2 sừng vểnh 0,75 | `gableRoof` — `#3B3F44`, nóc `#2F3236` |
| Tổng cao | ≈ 4,4 nóc, ≈ 5,0 đỉnh sừng | |
| Biển · đèn | biển "Nhà của ta" 1,54 × 0,5 trên cửa (y ≈ 2,35); 2 đèn lồng trên hai cột giữa | biển + đèn **giữ bằng code** |
| Bậc | không có bậc hình — chỉ dốc va chạm 3,5 × 0,8 trước gian giữa (0,3 → 0) | `frontRamp` |

Tỉ lệ nội bộ cho ảnh: **rộng : sâu : cao nóc ≈ 11,7 : 7,8 : 4,4** (mái) · thân 10,5 : 6 : 2,9 · mái ≈ 1/3 tổng cao.

## Đặc điểm nhận diện (thiếu là "không ra chất")
1. **Mái hai mái ngói âm dương** (仰合瓦 — ngói ngửa + ngói úp xếp hàng dọc dốc) xám than, **thò hồi** (懸山 huyền sơn — mái chìa ra
   ngoài tường hồi, đúng như khối đang có), bờ nóc thẳng đậm, hai đầu nóc vểnh nhẹ. Mái chiếm ≈ 1/3 cao nhà, mép hiên dày.
2. **3 gian, cửa giữa** — số gian lẻ, đối xứng; gian giữa là cửa gỗ, hai gian bên là cửa sổ ô (槛窗 hạm song — cửa sổ trên
   chân tường) dán giấy.
3. **Khung gỗ sẫm lộ trên tường vôi**: cột, xà, đố ngang chia mặt tường thành ô — kiểu "tường trắng khung gỗ" thay cho mặt
   vôi trơn của khối hiện tại.
4. **Hiên trước có 4 cột gỗ** trên **chân tảng đá** (柱礎 trụ sở — khối đá kê chân cột), xà hiên ngang.
5. **Nền đá thấp + bậc đá** (台基 đài cơ + 踏跺 đạp đoá — bậc lên thềm) trước gian giữa — nhà dân nền chỉ ≈ 0,3 m (`kien-truc-chuan.md` C5).
6. **Cửa chính gỗ hai cánh, đóng, khung rõ**: khung cửa (門框), ngạch dưới (門檻), hai chốt đầu cửa (門簪 môn trâm) trên đố —
   chi tiết "nhà dân" dễ nhận nhất ở tầm camera.

## Quy chế · cấp bậc
C5 — nhà dân (`kien-truc-chuan.md`): ≤ 3 gian (luật Minh), mái 懸山 / 硬山 ngói xám, **không cột son, không ngói lưu ly, không
đấu củng, không xà vẽ màu**; nền 0,3 m. Đời Thanh, quan dưới lục phẩm và dân thường chỉ được mái huyền sơn / ngạnh sơn cho
nhà chính (Architectura Sinica). Nhà của ta thấp hơn và mộc hơn mọi nhà trong Khởi Nguyên Trấn — đúng vai "nhà riêng".

## Màu
| Vai trò | Hex | Có trong bảng? | Nguồn / lý do |
|---|---|---|---|
| Tường vôi | `#F1EEE6` | có (`nha-ta.json` `buildingStyle.wall`) | giữ |
| Ngói | `#3B3F44` (mặt ngói), bóng rãnh `#2F3236` | có (`roofColor`, `ridge`) | giữ |
| Bờ nóc · mép hiên | `#2F3236` · `#33363A` | có (`ridge`, `eave`) | |
| Cột · xà · khung gỗ | `#3A3430` | có (`pillar`, `timber`) | gỗ sẫm, C5 không son |
| Cánh cửa · song cửa (gỗ ấm hơn khung) | `#5A4636`, nẹp `#7A5E44` | có (`fenceStyle` cùng cảnh) | tách cửa khỏi khung, ấm hơn |
| Giấy dán cửa sổ | `#EFE4C8` | có (`nha_o.ts PAPER`) | |
| Nền đá · bậc · chân tảng | `#8C8A84` (mặt), `#A8A194` (mặt bậc sáng hơn) | có (`base`, `path`) | |

## Hướng — đã chọn: A (Claude, một bước)
- **A — Nhà dân 3 gian huyền sơn "khung gỗ tường vôi"** (chọn): giữ nguyên khối (mái thò hồi, nền 0,3, hiên 4 cột, cửa giữa), chỉ
  thêm chất: ngói âm dương, khung gỗ chia ô tường, cửa sổ ô giấy, cửa gỗ có môn trâm, chân tảng, 2 bậc đá. Khớp `phong_cach.md`
  (粉牆黛瓦 tường vôi ngói đen), khớp C5, khớp yêu cầu "giữ dáng".
- B — Ngạnh sơn 硬山 kiểu Bắc (tường hồi gạch xây lên tới mái, có 墀頭 trì đầu): bỏ vì đổi đường viền mái (hồi không còn thò) — lệch ảnh khối.
- C — Nhà Giang Nam đầu hồi 觀音兜 / mã đầu tường 馬頭牆: bỏ vì đổi hẳn bóng dáng, hợp vùng Giang Nam hơn nhà riêng trên đảo mây.

## Dựng low-poly (model Tripo)
| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ghi chú |
|---|---|---|---|
| Thân + mái + nền + bậc + cột + cửa | giữ | **một model** ≤ 20 000 tam giác, 1 vật liệu nướng (texture 2K) | thay ~30 khối code |
| Ngói âm dương | giữ dạng **gờ nổi nông** liền mái | không ống ngói rời | |
| Song cửa sổ, ô cửa | **khắc nổi** trên mặt phẳng | không lỗ thủng | |
| Biển tên · đèn lồng | **bỏ khỏi model** | code giữ (biển chữ Việt + đèn sáng đêm R-NGAY-3) | model để chỗ trống trên cửa |
| Va chạm · cổng vào nhà | bỏ khỏi model | code giữ hộp tường, vòng cột, dốc trước | |

## Sai thường gặp cần tránh
- Mái cong quá đà, đầu đao vểnh cao kiểu điện / chùa → nhà dân C5 mái **gần thẳng**, chỉ hai đầu nóc vểnh nhẹ.
- Cột son, ngói lưu ly, xà vẽ màu, đấu củng → sai cấp bậc (C4 trở lên mới có).
- Cột mảnh rời xa thân, lan can lưới thưa, đuôi mái nhọn mảnh → Tripo dựng gãy / dính.
- Cửa sổ / cửa thủng xuyên thấy trong nhà → lưới vỡ; phải là mặt kín có khắc.
- Chữ trên biển / câu đối (R-HUD-4) — model không có chữ.
- Mái cong lõm giữa nóc (ra Hàn) hoặc mái dốc đứng (ra Nhật / Âu).

## Đưa vào cảnh
- Đặc tả: `buildings[chinh-phong].model` (cần code — chưa có cho nhà, `/tai-nguyen` mục "Đưa công trình vào cảnh"; việc khác lo).
- Model tâm đáy ở (0; 0; 0), mặt trước nhìn +z, scale theo w 10,5 × d 6 của đặc tả.

## Nguồn
- Architectura Sinica — yìngshān 硬山 (ngạnh sơn vs huyền sơn; quy chế Thanh: dân chỉ dùng huyền sơn / ngạnh sơn) — https://www.architecturasinica.org/keyword/k000147
- China Highlights — Chinese roofs (thứ bậc mái, mái hai mái là bậc thấp) — https://www.chinahighlights.com/travelguide/architecture/roofs.htm
- Architecture in ancient China — https://raider.pressbooks.pub/chineseculture/chapter/1-architecture-in-ancient-china/ — tường không chịu lực, khung gỗ
- Chinese Roof Types 屋顶形制 — https://chinese-architecture-jycsd.pages.dev/elements/roof-types.html — hình mái hai mái
- Shimu — Chinese carved wooden panels (隔扇 / 槛窗: ô lưới trên, bản đặc dưới) — https://www.shimu.co.uk/blogs/news/chinese-carved-wooden-panels
- Hồ sơ trong dự án: `kien-truc-chuan.md` (C5, nguồn [3] luật Minh), `nha-rieng-game.md` (Siheyuan: chính phòng bắc nhìn nam).
- Ghi chú: số đo nhà lấy từ code + đặc tả (không phải ngoài đời); chi tiết 門簪, 柱礎, 仰合瓦 là quy ước nhà dân Bắc – Trung
  Hoa phổ biến (suy luận từ hiểu biết chung, chưa có trang riêng có số đo).
