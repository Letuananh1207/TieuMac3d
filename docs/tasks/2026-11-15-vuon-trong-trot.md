# Vườn trồng trọt ở Nhà của ta (V-20261114-52)
- Yêu cầu: "ở nhà của tôi hãy tạo ra chỗ vườn có thể trồng trọt được, tham khảo 摩尔"
- Đã chốt với người dùng: **trồng thuần, không gắn học chữ** · **6 ô đất, mở thêm dần tới 12 bằng Văn tiền** · **cây lớn theo
  giờ thật, vài giờ** (30 phút – 8 giờ, tắt app vẫn lớn).
- Loại: thêm tính năng (luật + dữ liệu + cảnh 3D + HUD + cầu nối + Flutter) · Cỡ: lớn · Trạng thái: chờ thiết kế (NV1–9 xong trên nhánh `viec/vuon`, NV10 chờ phiếu)
- Xây trên V-48 (đảo trên biển mây, khung rỗng — CHANGELOG 2026-11-15.15) và V-51 (đã gộp: bỏ cổng đứng (0; 11,5)).
- Phiếu HUD: `docs/phieu_thiet_ke/2026-11-15-vuon-trong-trot.md` (chờ thiết kế).

## Thuật ngữ game (một dòng mỗi từ)
- **Vòng chơi (core loop)**: chuỗi việc người chơi lặp lại — ở đây gieo → (tưới) → chờ → thu → bán → gieo tiếp.
- **Nguồn tiền / chỗ tiêu (faucet / sink)**: chỗ sinh Văn tiền (học, trò chơi, bán nông sản) và chỗ tiêu (đồ trang trí, hạt, mở ô).
  Cân bằng để học vẫn là nguồn chính.
- **Hẹn giờ thật (appointment mechanic)**: cây chín sau vài giờ thật → lý do mở app lại trong ngày, kiểu 摩尔庄园 / Stardew.

## 1. Vòng chơi (học từ 摩尔庄园, dịch sang Học Xá)
摩尔庄园 (bản web 2008 và bản di động 2021): mua hạt ở cửa hàng → gieo vào ô đất của nhà → tưới, bắt sâu, nhổ cỏ (giúp lớn /
tăng thu) → cây qua vài giai đoạn theo giờ thật (vài giờ, có loại ~20 giờ) → thu hoạch vào kho → bán cho NPC (花婶) lấy 摩尔豆, giữ
một ít làm đơn hàng / nấu ăn → mở rộng đất, sau có máy tưới tự động. Bạn bè tưới / bắt sâu hộ (chờ giai đoạn mạng).
Bài học lấy: **vòng ngắn, dễ hiểu, "làm bao nhiêu được bấy nhiêu"**, không phạt nặng. Bài học bỏ: cây chết / bị trộm (trẻ buồn),
nhiệm vụ nặng (bản 2021 bị chê).

Vòng chơi đề xuất (tất cả ở trong nhà, không phải đi trấn):
1. **Đến vườn**: vườn rau phía đông đảo, 12 luống đất (6 mở sẵn, 6 đất hoang có cọc gỗ).
2. **Gieo**: đứng cạnh luống trống → nút nổi **"Gieo"** → bảng chọn hạt (8 loại, giá hạt, thời gian, giá bán) → chọn → trừ tiền hạt
   ngay (mua tại chỗ, không có túi hạt tồn) → luống có ụ đất + hạt.
3. **Tưới (không bắt buộc)**: mỗi cây có **2 lượt tưới** — lượt 1 mở ngay khi gieo, lượt 2 mở từ nửa thời gian lớn. Mỗi lượt tưới
   +1 sản lượng. Không tưới vẫn chín, chỉ thu ít hơn. **Cây không bao giờ chết, héo hay hỏng.** Luống "khát" hiện giọt nước nhỏ.
4. **Lớn theo giờ thật**: 4 dáng 3D — *vừa gieo* (0–10 %) · *mầm* (10–50 %) · *đang lớn* (50–100 %) · *chín* (≥ 100 %). Tắt app
   vẫn lớn (tính từ giờ gieo đã lưu).
5. **Thu**: luống chín → nút **"Thu"** → 2–4 nông sản vào **kho**, luống trống lại. Chín để bao lâu cũng không hỏng.
6. **Bán**: **thùng thu mua** cạnh cổng vườn → nút "Bán" → bảng kho (mỗi loại × giá) → bán từng loại / "Bán hết". Trần **60 Văn
   tiền / ngày** (giờ VN) như trò chơi (R-TIEN-3); phần vượt ở lại kho, mai bán tiếp. Kho không hỏng.
7. **Mở ô**: chạm luống hoang → **"Mở ô"** → hộp xác nhận giá → luống dùng được ngay. Ô 7 → 12 theo thứ tự, giá tăng dần.
8. **Báo chín**: vào Nhà của ta mà có luống chín → tấm báo "Vườn rau: n luống đã chín". (Báo ngoài app: Q3.)

Không gắn học chữ (đã chốt). Vì sao vẫn đáng làm: là lý do mở app nhiều lần trong ngày; mỗi lần vào thấy bảng nhiệm vụ / ôn đến
hạn ở nút sẵn có. Sau này nông sản có thể dùng cho linh thú / nấu ăn / đơn hàng NPC (ghi để sau, không làm).

## 2. Cây khởi đầu (8 loại) + kinh tế
Sản lượng: **2 cơ bản + 1 mỗi lượt tưới → 2…4**. Mọi cây **không lỗ** kể cả không tưới (2 × giá bán ≥ giá hạt).

| Mã | Tên (chỉ tiếng Việt — R-HUD-4) | Thời gian | Hạt | Bán / cái | Lãi không tưới (2) | Lãi tưới đủ (4) | Lãi / giờ / ô (tưới đủ) | Dáng chín (3D) |
|---|---|---|---|---|---|---|---|---|
| `cai` | Cải ngọt | 30 phút | 4 | 3 | +2 | +8 | 16 | cây lá xoè 5–6 lá lục |
| `cu-cai` | Củ cải | 1 giờ | 6 | 4 | +2 | +10 | 10 | chùm lá + đầu củ trắng nhô |
| `dau` | Đậu xanh | 2 giờ | 8 | 5 | +2 | +12 | 6 | cọc tre + dây leo, quả dài |
| `lua` | Lúa | 3 giờ | 10 | 6 | +2 | +14 | 4,7 | khóm lúa vàng trĩu bông |
| `bi` | Bí đỏ | 4 giờ | 12 | 7 | +2 | +16 | 4 | quả cam dẹt + lá to |
| `cuc` | Hoa cúc | 5 giờ | 14 | 8 | +2 | +18 | 3,6 | bụi cúc vàng |
| `dua` | Dưa hấu | 6 giờ | 16 | 9 | +2 | +20 | 3,3 | quả xanh sọc nằm trên lá |
| `tra` | Trà | 8 giờ | 20 | 11 | +2 | +24 | 3 | bụi chè xén nhỏ, búp non |

Lý do: cây ngắn lãi / giờ cao (thưởng người ghé thường xuyên, cải 30 phút dạy vòng chơi ngay buổi đầu); cây dài lãi / lượt cao
(gieo trước khi ngủ / đi học, kiểu 摩尔). Sen bỏ — cần ao (đã có vật trang trí Ao sen).

**Mở ô** (theo thứ tự ô 7 → 12): **50 · 80 · 120 · 160 · 200 · 250** (tổng 860).

**Cân bằng với thu nhập hiện có** (R-TIEN-2/3): người học đều ≈ 30 (3 bộ mới) + 10–20 (ôn) + 20 (nhiệm vụ ngày) ≈ 60–70 / ngày,
+ trò chơi ≤ 60. Vườn: 6 ô × 1–2 lượt / ngày × 8–24 ≈ 50–200 nông sản-tiền / ngày, nhưng **bán tối đa 60 / ngày** → vườn ngang
trò chơi, học vẫn là nguồn lớn nhất khi cộng thưởng chuỗi. Mở đủ 12 ô ≈ 2–3 tuần chơi vườn + học (chỗ tiêu dài hạn, cạnh 13 vật
trang trí 30–200). Trần làm cho thêm ô chủ yếu là để "kho đầy, đẹp vườn" — chấp nhận, vì mục tiêu là giữ người chơi, không phải
máy in tiền. Nếu người dùng muốn bỏ trần → hạ giá bán ~30 % (ghi ở Giả định G4).

## 3. Chỗ vườn trên đảo
Đảo (V-48): tâm (0; −2), mép vực r 27 (wobble 1,5 → đất phẳng chắc tới r ≈ 25); bục chính x −17 … 17, z −18 … 13; sân trong
x −9,5 … 9,5, z −15 … −1; lối trục x 0 từ z 13 → −7,4; xuất phát (0; 6,5). Ô trang trí vườn: `vuon-4` (13; −11), `vuon-5`
(13; −4), `vuon-6` (11; 4) ở đông, đối xứng ở tây; cụm tùng mép đông (20; −10) 4 × 8 (z −14 … −6).

**Đề xuất: "Vườn rau" ở bãi cỏ phía đông**, giữa `vuon-5` và `vuon-6`, nhìn thấy từ chỗ xuất phát (bên phải trục khi nhìn về nhà).

```
 z            x 13        15   16.2   18.6   21.0  22.4
 -6  tùng ……………………… (grove z −14…−6)
 -5               ┌─ rào tre 0,6 m ───────────────┐
 -3.6  [vuon-5]   │  [10]   [11]   [12]   ← hoang  │
 -1.2  (13;−4)    │  [ 1]   [ 2]   [ 3]   ← mở    │
  0   ══ lối ════ ▯ cổng vườn (khe 1,6)           │
  1.2             │  [ 4]   [ 5]   [ 6]   ← mở    │
  3.6  [vuon-6]   │  [ 7]   [ 8]   [ 9]   ← hoang  │
  5   (11;4)      └───────────────────────────────┘
       giỏ hạt (14,2; −1,4) · thùng thu mua (14,2; 1,4) — hai bên cổng, bên ngoài rào
```

| Phần | Giá trị đề xuất (tinh chỉnh khi `/canh`) |
|---|---|
| 12 luống | 1,6 × 1,6 m, cao 0,2 m, tâm cách 2,4 m (lối giữa 0,8 m); cột x **16,2 · 18,6 · 21,0**; hàng z **−3,6 · −1,2 · 1,2 · 3,6** |
| Ô mở sẵn (1–6) | hai hàng giữa z −1,2 / 1,2 (gần cổng vườn nhất). Mở thêm: 7–9 hàng z 3,6 (phía nam, gần camera), rồi 10–12 hàng z −3,6 |
| Rào tre thấp 0,6 m | khung x 15 … 22,4, z −5 … 5; khe cổng vườn ở mép tây z −0,8 … 0,8 (không cánh cửa) |
| Lối nhánh | (1,2; 0) → (15; 0) rộng 1,4 (đi giữa `vuon-5` z −4 và `vuon-6` z 4 — cách mỗi ô ≥ 3,3 m) |
| Bục phẳng | thêm `terrain.plateaus` x 13,5 … 23, z −6 … 6, y 0, `pave: false` (bục chính chỉ tới x 17, blend 4 → mép đông hơi dốc) |
| Nền | `terrain.floors` đất nâu ấm `#B98A6A` trong rào (khác cỏ — "mỗi khu một nền", bài học V-42/44); luống đất xới `#8A6648` |
| Khu (chip, bản đồ vùng) | `site.areas` thêm **"Vườn rau"** x 15 … 22,4, z −5 … 5 (khu nhỏ đứng trước "Vườn") |
| Khoảng cách kiểm | góc xa nhất (22,4; 5) cách tâm đảo r ≈ 23,5 < 25 ✓ · rào bắc z −5 cách cụm tùng 1 m (nếu chật: `/canh` lùi cụm tùng về z −15 … −7) · rào tây x 15 cách `vuon-5` 2 m ✓ |

Phương án khác (không khuyên): tây (đối xứng, x −22,4 … −15) — cạnh khu ngắm mây trống của V-48, nhưng chỗ xuất phát nhìn bắc
thì cả hai bên như nhau; đông khớp nhãn "Vườn ở phía đông" đã có trong `screen_specs.md` mục Nhà của ta. Sau sân trong (đồi sau)
— dốc, bị nhà che camera. Không chọn.

Luống **không chặn người đi** (thấp 0,2 m, như vật trang trí nhỏ R-NHA-2) — không bao giờ kẹt giữa luống. Rào tre, giỏ hạt, thùng
thu mua **chặn**. Không đụng 12 ô trang trí, không dời ô nào.

## 4. Lưu trữ + giờ thật + cầu nối
**Luật thuần** (một bản Dart là gốc, một bản TS chép — như `wallet.dart` ↔ `walletRules.ts`, test hai phía cùng ví dụ sổ):

```
Plot   = { crop: 'cai' | … | null, plantedAt: int (ms epoch UTC), watered: 0..2 }
Garden = { open: 6..12, plots: { 'o-1': Plot, … 'o-12' }, barn: { 'cai': 3, … }, sellDay: int (vnDay), soldToday: int }
stage(plot, now)       → 'trong' | 'vua-gieo' | 'mam' | 'lon' | 'chin'   (elapsed = max(0, now − plantedAt))
canWater(plot, now)    → watered == 0 ‖ (watered == 1 && elapsed ≥ T/2), và chưa chín
yieldOf(plot)          = 2 + watered
remaining(plot, now)   → ms còn tới chín (nhãn "còn 1 giờ 20 phút")
sell(garden, crop, n, today) → bán tối đa min(n, kho, ⌊(60 − soldToday') / giá⌋); sang ngày VN mới → soldToday' = 0
openPlot(garden, coins) → giá ô kế; thiếu → 'short'; đủ 12 → 'full'
```
- Giờ: thời gian lớn tính bằng **mili giây thực** (không phụ thuộc múi giờ). Chỉ trần bán theo **ngày giờ VN** (`vnDay` sẵn có ở
  `wallet.dart`, R-TIEN-8 / R-NGAY-1). Giờ máy quay lùi trước lúc gieo → coi như vừa gieo (không âm). Chỉnh giờ máy tới trước để
  "ăn gian" → chấp nhận (chơi một mình, như R-NGAY-1 "máy sai giờ thì thấy sai pha").
- **Flutter là gốc** (`progress_store.dart`, khoá `vuon.state` JSON): mọi thao tác đổi tiền (gieo, bán, mở ô) Flutter tính + ghi
  ngay như `giveAlms`. Trang chỉ **vẽ** giai đoạn từ dữ liệu + `Date.now()` bằng bản TS.
- **Không Flutter** (R-TIEN-7): vườn nằm trong ví thử `browserStore.ts` (`localStorage`), luật TS; `?tien=xoa` xoá cả vườn;
  **`?vuon=60`** (mới) — cây lớn nhanh 60 × (30 phút → 30 giây) để thử trên trình duyệt / Canvas 3D. Ví thử mới: vườn 6 ô trống,
  kho rỗng.

**Cầu nối mới** (ghi `docs/bridge.md` **trước**, hai phía cùng lúc):

| Tên | Chiều | Gửi | Nhận |
|---|---|---|---|
| `getGarden` | JS → Flutter | `{}` | `{open: 6, plots: {'o-1': {crop: 'cai', plantedAt: 1763190000000, watered: 1}, 'o-2': {crop: null}…}, barn: {cai: 3}, soldToday: 24, now: 1763191800000}` · khác (`null`, lỗi, Flutter cũ) = vườn mới (6 ô trống) chỉ xem, thao tác bị từ chối · không Flutter → ví thử |
| `gardenAct` | JS → Flutter | `{act: 'sow', plot: 'o-1', crop: 'cai'}` · `{act: 'water', plot}` · `{act: 'harvest', plot}` · `{act: 'sell', crop: 'cai' \| null (= bán hết), count?}` · `{act: 'open'}` | `{ok: true, garden: {…như getGarden}, balance: 132, amount: −4 \| +18 \| 0, got?: 3}` · `{ok: false, reason: 'short' \| 'busy' \| 'not-ripe' \| 'dry' \| 'cap' \| 'full' \| 'locked', balance}` |

Vì sao **một** `gardenAct` thay vì 5 tên: một chỗ xử lý ở hai phía, luôn trả cả vườn → trang không phải tự tính lại sau thao
tác (ít lệch). Bảng cây (giá, thời gian) ở **Dart là gốc**, TS chép + test so hai bảng bằng ví dụ sổ (như R-TIEN-4 hiện tại để giá
ở `decor.ts` gửi qua `openShop` — ở đây ngược lại vì Flutter phải tự kiểm tiền khi gieo / bán).

## 5. 3D: luống + cây theo giai đoạn
**Khuyên: dựng bằng code** (khối low-poly + màu đỉnh, `softMaterial`, gộp) trong `web/src/scene/`:
- `vuonLuong.ts` — 12 luống đất (hộp bo + 3 rãnh màu đỉnh), **InstancedMesh** 1 draw call; luống hoang = cỏ dại búi + cọc gỗ
  (cùng InstancedMesh khác) 1 draw call; rào tre + giỏ hạt + thùng thu mua gộp tĩnh 1 draw call.
- `cayTrong.ts` — 8 cây × 3 dáng (vừa gieo dùng chung ụ đất + 3 hạt): công thức nhỏ từ hình cơ bản (lá = quả trám dẹt, quả = cầu
  dẹt / elip, bông lúa = chùm que), ≤ 250 tam giác / cây, màu đỉnh có bóng nướng chân. Mọi cây đang hiện **gộp thành 1 hình**
  (`mergeSoft`), dựng lại chỉ khi một luống đổi dáng (vài lần / giờ) → 1 draw call. Lá lay nhẹ theo gió sẵn có (`look.wind`).
- Giọt nước "khát" + dấu "chín" (lấp lánh nhỏ) = DOM bám luống (thuộc phiếu HUD), không thêm mesh.
- Vì sao code thay vì gói CC0: dáng cây trồng theo giai đoạn đúng kiểu ta cần không có sẵn ở Tiny Treats / KayKit (đã khảo
  `docs/tham_khao/assets-free-thuc-vat.md`); **Kenney Nature Kit** có `crops_*Stage*` (CC0, 76–564 tam giác) nhưng góc cạnh,
  chỉ vài loại (ngô, tre, lá) — làm dự phòng (Q4).

**Ngân sách** (cảnh nhà đang 48 draw call nhìn trên / 38 / 33, ~34k tam giác): **+4 draw call** (luống, đất hoang, rào + thùng +
giỏ, cây gộp), **≤ +6k tam giác** (12 cây × ≤ 250 + luống 12 × 60 + rào ~1,5k) → ≈ 52 / 150, ≈ 40k / 150k. Không đèn mới, không
shadow, không shader mới (quy tắc 4). Đo fps trước / sau trên Canvas 3D + Android.

## Phạm vi
**Sẽ sửa**
- `docs/testing/quy_tac.md` — mục mới **VUON** (R-VUON-1 … 8) + chạm R-NHA-2/5, R-TIEN-1/5/7, R-BANDO-2 (xem §6).
- `docs/bridge.md` — `getGarden`, `gardenAct`.
- `app/lib/journey/garden.dart` (mới) — bảng cây + luật thuần; `app/lib/journey/progress_store.dart` — lưu `vuon.state`,
  `gardenAct`; `app/lib/scene/scene_view.dart` (hoặc chỗ đăng ký handler cầu nối hiện có) — 2 handler.
- `web/src/zones/vuon.ts` (mới) — bảng cây + luật (chép Dart) + chữ hiển thị (thời gian còn lại, nhãn); `web/src/zones/walletRules.ts`
  — ví thử có `garden`; `web/src/bridge/flutterBridge.ts` — 2 lệnh; `web/src/bridge/browserStore.ts` — lưu vườn thử, `?tien=xoa`.
- `web/src/scene/spec.ts` + `loadSpec.ts` + `specCheck.ts` — trường mới `garden` (mặc định `null` → cảnh cũ không đổi, quy tắc 8);
  `web/scripts/check-scene.mjs` (in toạ độ luống, kiểm không đè `decorSlots` / lối / mép đảo).
- `web/src/scene/vuonLuong.ts`, `web/src/scene/cayTrong.ts` (mới) — 3D.
- `web/src/homeGarden.ts` (mới, file ghép gốc như `homeDecor.ts`) — nạp, dựng, đổi dáng theo giờ, luống gần nhất, gọi HUD.
- `web/src/ui/` — HUD vườn (**chờ thiết kế**), `web/src/main.ts` — vài dòng tạo `HomeGarden` khi cảnh có `garden`.
- `web/src/designPreview.ts` — Canvas 3D `?dang=vuon` bày 8 cây × 4 dáng để duyệt hình.
- `design/scene/nha-ta.json` — khối `garden` + bục + nền + lối + khu "Vườn rau" (**vai thiết kế `/canh`**, duyệt ảnh rồi chốt).
- `.claude/skills/lead/SKILL.md` — thêm dòng Bản đồ tính năng "vườn rau, trồng trọt, gieo, tưới, thu hoạch, kho nông sản".
- Test: `app/test/rules/vuon_test.dart` (mới), `web/src/zones/vuon.test.ts` (mới), `browserStore.test.ts`, `areaMapScenes.test.ts`.

**Cần kiểm tra**: `homeDecor.ts` + `ui/decorHud.ts` (nút "Trang trí" và nút nổi vườn không đè nhau; đang trang trí thì ẩn nút
vườn), `ui/wallet.ts` + `walletRoom.ts` (nhãn trừ / cộng mới), `zones/areaMap*.ts` (khu mới trên bản đồ vùng nhà),
`scene/decorSlots.ts` (kiểm chồng chỗ), `townNpcs.ts` không liên quan, `reward_overlay.dart` (nhãn bán), `app/lib/lesson/wallet_chip.dart`
(thẻ "Văn tiền kiếm từ đâu").

**Không đụng**: `PlayerController`, va chạm nhân vật (luống không chặn), 13 vật trang trí + giá, Tạp hoá (Q1-A), cầu nối
`getHome` / `setDecor` / `openShop`, cảnh trấn `scene.json`, vùng hành trình, bài học / ôn.

## Giả định (không hỏi — người dùng sửa được khi duyệt)
- G1. Tưới = +sản lượng, không làm nhanh; không tưới không sao; cây không chết / héo / hỏng (theo "nhẹ nhàng").
- G2. Không có sâu / cỏ dại ở bản này (摩尔 có — để đợt 2, khi muốn thêm một việc nhỏ mỗi lượt ghé; cần ngẫu nhiên có hạt giống
  cố định theo luống + giờ gieo để hai phía trùng).
- G3. Mua hạt = trả tiền lúc gieo; không có "túi hạt" tồn kho (ít một màn).
- G4. Trần bán 60 / ngày giờ VN (như trò chơi). Bỏ trần → hạ giá bán ~30 %.
- G5. Tất cả 8 cây mở từ đầu (không cấp độ nông dân — tránh thêm hệ thống).
- G6. Nông sản chỉ để bán ở bản này; kho giữ để sau dùng cho linh thú / nấu ăn / đơn NPC.
- G7. Chưa có mạng: không tưới hộ bạn, không trộm rau (摩尔) — chờ giai đoạn mạng.
- G8. Chỉ người chơi thấy vườn mình (R-NHA-3).

## Cần người dùng quyết (tối đa 4)
**Q1. Mua hạt + bán nông sản ở đâu?**
- **A (khuyên)** — ngay ở vườn: chọn hạt lúc gieo (trả tiền tại chỗ); bán ở **thùng thu mua** cạnh cổng vườn. *Vì sao*: vòng chơi
  khép trong nhà, mỗi lần ghé 1–2 phút; trẻ không phải đi trấn mỗi lượt; thùng thu mua là vật 3D có công dụng (như Stardew).
- B — như 摩尔: mua hạt + bán ở Tạp hoá trấn. Thêm lý do ra trấn (gặp NPC, bảng nhiệm vụ), nhưng mỗi vòng thêm 2 chặng đi + màn
  Flutter Tạp hoá phải thêm tab Hạt / Thu mua.
- C — mua hạt ở Tạp hoá, bán ở thùng tại vườn (lai).

**Q2. Chỗ vườn**
- **A (khuyên)** — bãi cỏ đông x 15 … 22,4, z −5 … 5 (bảng §3). *Vì sao*: không đè ô trang trí nào, thấy từ chỗ xuất phát, khớp
  "vườn phía đông" đã có trong thiết kế; vẫn để trống trục giữa + phía tây (nhà "rỗng" như người dùng muốn).
- B — bãi tây (đối xứng). Như A nhưng cạnh chỗ ngắm mây.

**Q3. Báo cây chín khi đang tắt app?**
- **A (khuyên)** — chưa: chỉ báo trong app (vào nhà → tấm báo; luống chín lấp lánh). *Vì sao*: không thêm gói mới, không xin quyền
  thông báo (trẻ em + cha mẹ dè dặt), không cần sửa Android / iOS.
- B — thông báo trên máy (gói `flutter_local_notifications`, hẹn giờ khi gieo: "Cải ngọt đã chín"). Kéo người chơi quay lại mạnh
  hơn, nhưng thêm gói, xin quyền, cấu hình Android 13+ / iOS, và phải có công tắc tắt.

**Q4. Hình cây**
- **A (khuyên)** — dựng bằng code (§5). *Vì sao*: đúng phong cách mềm hiện có, 8 cây × 4 dáng tự do, không giấy phép, rất nhẹ.
- B — Kenney Nature Kit `crops_*Stage*` (CC0, dựng sẵn) — nhanh hơn cho 3–4 loại, góc cạnh lệch phong cách, thiếu bí / dưa / cúc.
- C — Hunyuan3D (`/tai-nguyen`) từng cây — đẹp nhất nhưng 8 × 3 model, nặng, chậm.

## 6. Luật mới + luật chạm (đề xuất nguyên văn — ghi sổ ở NV1)
| Mã | Luật | Ví dụ |
|---|---|---|
| R-VUON-1 | **Vườn rau**: ở Nhà của ta có khu "Vườn rau" (bãi cỏ phía đông đảo, rào tre thấp, cổng vườn mở về lối nhánh từ trục) với **12 luống đất** xếp 3 cột × 4 hàng. Mới cài app **6 luống mở** (hai hàng giữa), 6 luống còn lại là đất hoang có cọc gỗ. Luống không chặn người đi; rào, giỏ hạt, thùng thu mua chặn. Chỉ ở Nhà của ta mới trồng được. Vườn là của riêng người chơi trên máy này (như R-NHA-3). | Mới cài, vào nhà, đi theo lối nhánh qua cổng vườn → 6 luống trống + 6 luống hoang. Đi ngang qua luống → không bị chặn. |
| R-VUON-2 | **Nút nổi ở luống**: đứng cách tâm một luống **dưới 1,6 m** → nút nổi trên luống gần nhất theo trạng thái: trống → "Gieo"; đang lớn và tưới được → "Tưới"; chín → "Thu"; hoang → "Mở ô"; đang lớn không tưới được → không nút, chỉ nhãn nhỏ "{cây} · còn {thời gian}". Ra xa từ 1,6 m → ẩn. Cùng lúc trong tầm nút khác (Trang trí ở ô, thùng thu mua) → chỉ hiện nút của vật gần hơn. Đang trang trí / bản đồ / thoại / ngồi → không nút vườn. Bảng mở → nhân vật đứng yên. | Đứng cách luống 1 trống 1,2 m → "Gieo"; lùi 1,7 m → ẩn. Luống 2 Cải ngọt gieo 10 phút trước, đã tưới 1 lượt → nhãn "Cải ngọt · còn 20 phút". |
| R-VUON-3 | **Gieo**: "Gieo" → bảng chọn hạt 8 loại (tên, thời gian, giá hạt, giá bán / cái): Cải ngọt 30 phút · 4 · 3 — Củ cải 1 giờ · 6 · 4 — Đậu xanh 2 giờ · 8 · 5 — Lúa 3 giờ · 10 · 6 — Bí đỏ 4 giờ · 12 · 7 — Hoa cúc 5 giờ · 14 · 8 — Dưa hấu 6 giờ · 16 · 9 — Trà 8 giờ · 20 · 11. Chạm hạt đủ tiền → trừ giá hạt ngay, luống có cây, giờ gieo = lúc đó; ví HUD "−{giá} · Hạt {cây}". Thiếu tiền → thẻ mờ "Còn thiếu n", không gieo. Không có túi hạt: mua lúc gieo. | Có 10, gieo Cải ngọt → còn 6, ví "−4 · Hạt Cải ngọt". Có 7, chọn Đậu xanh (8) → "Còn thiếu 1". |
| R-VUON-4 | **Lớn theo giờ thật**: cây lớn theo thời gian thật kể từ lúc gieo, **cả khi tắt app**; 4 dáng: vừa gieo (dưới 10 % thời gian) · mầm (10 – dưới 50 %) · đang lớn (50 – dưới 100 %) · chín (từ 100 %). Cây không bao giờ chết, héo hay hỏng; chín để bao lâu cũng giữ. Giờ máy lùi về trước lúc gieo → coi như vừa gieo. Thử trên trình duyệt: `?vuon=60` → lớn nhanh 60 lần. | Lúa (3 giờ) gieo 8:00 → 8:17 mầm, 9:30 đang lớn, 11:00 chín; tắt app 8:05, mở lại 12:00 → thấy chín. `?vuon=60`: Cải ngọt chín sau 30 giây. |
| R-VUON-5 | **Tưới**: mỗi cây có **2 lượt tưới**; lượt 1 tưới được ngay sau khi gieo, lượt 2 tưới được từ nửa thời gian lớn; cây đã chín thì không tưới nữa. Luống tưới được hiện giọt nước nhỏ. Mỗi lượt tưới **+1 sản lượng**; không tưới cây vẫn lớn đúng giờ. Tưới không tốn tiền, không làm cây lớn nhanh hơn. | Cải ngọt gieo 9:00: tưới 9:01 (lượt 1); 9:10 không có "Tưới" (chưa tới 9:15); 9:20 tưới (lượt 2); 9:30 chín, thu 4. Chỉ tưới lượt 1 → thu 3. Không tưới → thu 2. |
| R-VUON-6 | **Thu hoạch**: luống chín → "Thu" → **2 + số lượt đã tưới** (2 … 4) nông sản vào **kho**, luống trống lại; tấm báo "+{n} {cây} vào kho". Kho giữ qua tắt app, không hỏng, không giới hạn. Vào Nhà của ta lúc có luống chín → tấm báo "Vườn rau: {n} luống đã chín". | Thu Bí đỏ tưới 2 lượt → "+4 Bí đỏ vào kho", luống trống. Mở app 3 ngày sau → 6 luống chín vẫn còn, vào nhà → "Vườn rau: 6 luống đã chín". |
| R-VUON-7 | **Bán**: đứng cách **thùng thu mua** (cạnh cổng vườn) dưới 2,5 m → nút "Bán" → bảng kho: mỗi loại số cái × giá / cái, nút "Bán" từng loại + "Bán hết". Bán → cộng Văn tiền ngay, ví HUD "+{n} · Bán nông sản". Mỗi **ngày giờ VN (GMT+7)** bán được tối đa **60 Văn tiền**; bán vượt → chỉ bán số cái vừa trần (không bán lẻ nửa cái), phần còn lại giữ trong kho, nhãn "Hôm nay thu mua đã đủ"; 0 giờ giờ VN → bán lại được. Kho trống → "Kho trống — thu hoạch rồi mang tới đây". | Kho 4 Trà (11) + 3 Cải (3), hôm nay đã bán 20: "Bán hết" → Trà 3 cái (33, còn 7 trần) + Cải 2 cái (6) = +39 → đã bán 59; kho còn 1 Trà, 1 Cải; "Hôm nay thu mua đã đủ" khi phần trần còn lại nhỏ hơn giá rẻ nhất trong kho. |
| R-VUON-8 | **Mở ô**: chạm "Mở ô" ở luống hoang → hộp xác nhận (đang có / giá / còn lại) → mở **ô kế tiếp theo thứ tự** (ô 7 → 12, hàng nam trước rồi hàng bắc) giá **50 · 80 · 120 · 160 · 200 · 250**; trừ ngay, luống thành trống dùng được ngay; ví HUD "−{giá} · Mở ô đất". Thiếu → "Còn thiếu n". Đủ 12 → không còn luống hoang. Chạm luống hoang nào cũng mở ô kế tiếp (không chọn ô). | Có 6 ô, có 70 → mở ô 7 (50) → còn 20; ô 8 cần 80 → "Còn thiếu 60". |

**Luật chạm (sửa nhỏ)**
- R-NHA-5 — thêm khu "Vườn rau" vào mô tả bố cục (bãi cỏ đông, rào tre thấp chặn như lan can).
- R-NHA-2 — câu cuối: "Luống vườn rau không phải ô trang trí (R-VUON-1)."
- R-NHA-3 / R-TIEN-7 — kho thử trình duyệt gồm cả vườn; `?tien=xoa` xoá cả vườn; ví thử mới: 6 luống trống, kho rỗng.
- R-TIEN-1 — thẻ "Văn tiền kiếm từ đâu" thêm dòng "Bán nông sản ở Vườn rau (tối đa 60 / ngày)".
- R-TIEN-5 — nhãn mới "−4 · Hạt Cải ngọt", "+39 · Bán nông sản", "−50 · Mở ô đất" (khoản trừ không xu bay, như R-TIEN-8).
- R-BANDO-2 — bản đồ vùng Nhà của ta có khu "Vườn rau".

## Nhiệm vụ
Phần **làm được trước thiết kế**: NV1–9 (luật, cầu nối, lưu, 3D, ghép không HUD, Canvas 3D `?dang=vuon`). Phần **chờ thiết kế**: NV10.
Q1–Q4 phải chốt trước NV1.

- [x] 1. **Sổ quy tắc** (`docs/testing/quy_tac.md` · nghiệp vụ): mục VUON R-VUON-1…8 + luật chạm như §6 (đã sửa theo Q1–Q4) →
      `/dong-bo-quy-tac` (tự chép online). Xong khi `dart tool/rule_trace.dart --pending` không còn R-VUON chờ.
- [x] 2. **Cầu nối** (`docs/bridge.md` · cầu nối): `getGarden`, `gardenAct` đúng dạng §4. Xong khi hai phía đọc chung một bảng.
- [x] 3. **Luật Dart** (`app/lib/journey/garden.dart` mới · Flutter thuần): bảng 8 cây, giá mở ô, `stage`, `canWater`, `yieldOf`,
      `remaining`, `sow` / `water` / `harvest` / `sell` (trần 60 theo `vnDay`) / `openPlot`, trả lỗi `short | busy | not-ripe | dry |
      cap | full | locked`. Test `app/test/rules/vuon_test.dart` — mỗi ví dụ sổ một test (gắn mã luật cho `rule_trace`). Xong khi
      `flutter test test/rules/vuon_test.dart` xanh.
- [x] 4. **Lưu Flutter + handler** (`progress_store.dart` khoá `vuon.state` JSON, thiếu / hỏng → vườn mới; handler `getGarden` /
      `gardenAct` ở chỗ đăng ký cầu nối hiện có `app/lib/scene/`): ghi ngay mỗi thao tác, trả `garden` + `balance`. Test lưu / mở lại
      (R-VUON-6 "3 ngày sau"). Xong khi `flutter analyze && flutter test -r failures-only test/rules test/scene` xanh.
- [x] 5. **Luật TS + ví thử** (`web/src/zones/vuon.ts` mới · zones; `walletRules.ts`, `bridge/browserStore.ts`, `bridge/flutterBridge.ts`):
      chép luật Dart, chữ hiển thị ("còn 1 giờ 20 phút"), `?vuon=<hệ số>`, vườn trong ví thử + `?tien=xoa`. Test `vuon.test.ts`
      cùng ví dụ sổ như NV3. Xong khi `npm test` xanh.
- [x] 6. **Trường đặc tả** (`scene/spec.ts`, `loadSpec.ts`, `specCheck.ts`, `scripts/check-scene.mjs` · scene/spec): `garden: { plots:
      [{id, x, z}], size, bin: {x, z}, seeds: {x, z}, fence: {from, to, gap}, open: 6 } | null` (mặc định `null`). Kiểm: luống trên đất
      phẳng, không chồng `decorSlots` / lối / mép đảo, đủ 12 mã `o-1…o-12`. Xong khi `npm run scene:check` in toạ độ luống, cảnh cũ không đổi.
- [x] 7. **3D** (`scene/vuonLuong.ts`, `scene/cayTrong.ts` mới · scene): luống + đất hoang (InstancedMesh), rào + giỏ + thùng (gộp tĩnh,
      collider), 8 cây × 4 dáng gộp 1 hình dựng lại khi đổi dáng; `designPreview.ts` `?dang=vuon` bày hết dáng. Đo draw call /
      tam giác trước / sau ở `?vung=nha-ta&view=tren`. Xong khi ≤ +4 draw call, ≤ +6k tam giác, người dùng duyệt ảnh 8 cây.
- [x] 8. **Bố cục vườn** (`design/scene/nha-ta.json` · vai thiết kế `/canh`): khối `garden` + bục + nền + lối nhánh + khu "Vườn rau"
      theo §3; `scene:check`, `build:design`, chụp 3 góc (trên xuống, từ chỗ xuất phát, trong vườn), duyệt rồi chốt CHANGELOG.
- [x] 9. **Ghép** (`web/src/homeGarden.ts` mới + vài dòng `main.ts` · ghép): nạp `getGarden` / ví thử, dựng, mỗi 5 s kiểm đổi dáng,
      tìm luống gần nhất (R-VUON-2) — **chưa có nút** (chờ NV10); Canvas 3D / `npm run dev` thấy cây lớn bằng `?vuon=60`. Xong khi
      `npx tsc --noEmit && npm test && npm run build` xanh, cảnh trấn / vùng không đổi.
- [x] 10. **HUD vườn** — thiết kế 2026-11-15.29 đã áp (V-20261115-62, `docs/thiet_ke_da_ap.md`): nút nổi Gieo / Tưới / Thu / Mở ô + nhãn
      thời gian, giọt khát / lấp lánh chín, bảng chọn hạt, nút "Bán" + bảng kho, hộp xác nhận mở ô, tấm báo chín / thu; chuỗi mới
      `design/l10n/vi.arb`. Áp bằng `/ui-apply` khi thiết kế về (`web/src/ui/garden*.ts` + CSS). Test vitest luật chạm nút (gần hơn
      thắng, ẩn khi trang trí). Xong khi thử dọc + ngang + safe area đủ trạng thái phiếu.
- [ ] 11. **Bản đồ tính năng + kiểm cuối**: thêm dòng vào `.claude/skills/lead/SKILL.md`; đo fps Android trước / sau; build.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run scene:check && npm run build · cd app &&
flutter analyze · flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart

## Nguồn (摩尔庄园 — chỉ học cơ chế)
- 233乐园 — 摩尔庄园怎么赚钱 (bán cho 花婶, chọn cây theo lãi, cây ~20 giờ) — https://www.233leyuan.com/post-detail/1986535173405388279
- 233乐园 — 摩尔庄园怎么大量赚摩尔豆 — https://www.233leyuan.com/post-detail/1969780103088017819
- Xiaomi Game — 摩尔庄园手游 农夫职业全面介绍 (kinh nghiệm thu hoạch, trần ngày) — https://game.xiaomi.com/viewpoint/1359077112_1635909862400_13
- Xiaomi Game — 摩尔庄园手游 邻居庄园 (tưới / bắt sâu hộ bạn) — https://game.xiaomi.com/viewpoint/1359077112_1636538592063_13
- Hồ sơ dự án: `.claude/skills/y-tuong/references/mole.md` §2–4, `docs/tham_khao/nha-rieng-game.md`, `docs/tham_khao/assets-free-thuc-vat.md`


## Người dùng chốt (2026-11-15)
- Q1: **mua hạt ở Tạp hoá (trấn), bán nông sản ở vườn** (thùng thu mua) → cần **túi hạt** (kho hạt đã mua) thay cho trừ tiền lúc gieo;
  Tạp hoá thêm mục hạt giống; bảng chọn hạt lúc gieo chỉ hiện hạt đang có (hết hạt → gợi ý mua ở Tạp hoá). Sửa phiếu theo.
- Q2 (trần bán): **60 Văn tiền / ngày** giờ VN, phần vượt giữ trong kho.
- Q3/Q4 hình + chỗ: **gói Kenney CC0 (`crops_*`)** cho cây, **bãi đông**; cây thiếu trong gói (bí / dưa / cúc…) thì dựng khối trong code hoặc thay
  cây khác có trong gói — chọn an toàn, ghi lại; ghi `design/models/LICENSES.md`.
- Thông báo khi tắt app: **không báo**. Sâu / cỏ dại: đợt sau.

## Đã làm (2026-11-15, phiên con V-52 — chưa gộp)
- NV1: mục VUON R-VUON-1…9 (thêm **R-VUON-9 mua hạt ở Tạp hoá** theo Q1; R-VUON-3 viết lại thành gieo từ túi hạt) + chạm R-NHA-2/5,
  R-TIEN-1/4/5/7, R-BANDO-2. Xác nhận `chờ`. **Chưa đồng bộ online** (theo lời giao — phiên chính chạy `/dong-bo-quy-tac`).
  Sửa ví dụ R-VUON-4: "8:17 mầm" sai (10 % của 3 giờ = 18 phút) → "8:15 vừa gieo, 8:20 mầm".
- NV2: `getGarden` / `gardenAct` (thêm `act: 'buy'`, lý do `no-seed`, `empty`, `bad`) ở `docs/bridge.md`.
- NV3–4: `app/lib/journey/garden.dart`, `progress_store.dart` (`vuon.state`, `gardenAct`, `buySeed`), `app/lib/scene/garden_event.dart`,
  handler ở `scene_view.dart` + `main.dart`; Tạp hoá Flutter thêm tab "Hạt giống" (`SlotKind.hat`, thẻ + hộp xác nhận có sẵn).
  Test `app/test/rules/vuon_test.dart` (18).
- NV5: `web/src/zones/vuon.ts` + `vuon.test.ts`, ví thử có `garden`, `?vuon=<hệ số>` (chỉ chế độ thử), Tạp hoá web thêm hạt
  (`shopView.ts` `SEED_ITEMS`).
- NV6: trường `garden` (`enabled: false` mặc định) + `scene/vuonLayout.ts` (kiểm) + `scene:check` in toạ độ luống.
- NV7: `scene/vuonLuong.ts` (luống + đất hoang + rào/thùng/nền đất, 3 draw call), `scene/cayTrong.ts` (cây gộp 1 draw call) — hình
  **Kenney Nature Kit** (13 glb, `design/models/thuc-vat/vuon/`, `LICENSES.md`); `npm run model:thuc-vat` thêm `--mau` (màu vật liệu →
  màu đỉnh). Canvas 3D `?dang=vuon-rau` (`?dang=vuon` đã là dáng vươn vai). Test `scene/vuonLuong.test.ts`.
- NV8: `nha-ta.json` khối `garden` + bục (13,5 … 23; −6 … 6) + lối nhánh (1,2; 0) → (15; 0) + khu "Vườn rau". Bỏ `terrain.floors`
  cho vườn (floor luôn lát gạch) → tấm nền đất nện trong rào dựng ở `vuonLuong.ts` (`colors.ground`).
- NV9: `web/src/homeGarden.ts` + vài dòng `main.ts`; chưa có nút — tạm `?debug` phím G / B.

Quyết định an toàn (không hỏi):
- Gói Kenney không có đậu xanh → đổi cây thành **Ngô** (`ngo`, giữ giá / thời gian). Cải ngọt = lá `crops_leafs*`, Trà = bụi
  `plant_bush*`, Hoa cúc = `flower_yellowB`; `crops_wheatStageA` (720 tam giác) bỏ.
- Mới cài túi có **3 hạt Cải ngọt** (app thật bắt đầu 0 Văn tiền — để học được vòng chơi ngay).
- Mua hạt 1 hạt / lần (dùng thẻ Tạp hoá sẵn có); chọn số lượng → phiếu.
