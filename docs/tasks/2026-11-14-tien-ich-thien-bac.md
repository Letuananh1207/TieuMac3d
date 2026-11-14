# Khu tiện ích hai bên Thiên Bậc
- Yêu cầu: "hãy lên kế hoạch dựng thêm các khu vực tiện ích ở các vùng trống hai bên cầu thang lên trà lâu"
- Việc: V-20261114-30 · Loại: thêm (cảnh trước, tính năng sau) · Cỡ: GĐ1 vừa (chỉ cảnh) · GĐ2 lớn (mỗi khu một kế hoạch con)
- Trạng thái: **chờ duyệt** (kế hoạch, chưa sửa gì) · phụ thuộc **V-26** (quây tường Truyền Tống Đài) phải gộp trước khi làm GĐ1
- Phiếu ý tưởng cho phần tính năng: `docs/y_tuong/2026-11-14-tien-ich-thien-bac.md`

## Phạm vi

**Sẽ sửa (GĐ1, vai thiết kế `/canh`, có duyệt):** `design/scene/scene.json`, gồm `paths`, `terrain.plateaus` (bậc chè),
`terrain.stairs` (bậc phụ lên đồi chè), `water` (ao câu), `buildings` (2 đình `dinh`), `props`, `trees.yard`, `site.areas`
(3 khu mới, tên chỉ tiếng Việt). Ghi `design/CHANGELOG.md` và `design/scene/tong_mon.md` (mục bài trí: mỗi vật có mục đích).

**Sẽ sửa (GĐ1, code nhỏ, chỉ khi duyệt Q3-b):** `web/src/scene/spec.ts` (`PROP_KINDS` thêm `bia`), `web/src/scene/props.ts`
(dựng bia bằng mẫu `bia` của Catalog `kien_truc/danh_muc_dot4.ts`), test kiểu props.

**Cần kiểm tra:** `zones/areaTracker.ts` (thứ tự khu, khu mới không chồng Thiên Bậc), `zones/dailyBoard.ts` (mọi prop
`bang` đều thành bảng Nhiệm vụ hằng ngày, xem Q5), `scripts/check-scene.mjs` (vật đè lối, đè nước), ngân sách
`?view=tren`.

**Không đụng:** Thiên Bậc (bậc chính `(0,-20)→(0,-53)`), Thượng Trấn / Trà lâu, Truyền Tống Đài và Mặc Trì (thuộc V-26),
Kỳ Văn Uyển (V-29), Tàng Thư Các (nhà và tường). Không thêm cầu nối, màn Flutter hay luật ở GĐ1.

## Đo hiện trạng

Cách đo: `npm run scene:check` (toạ độ) và lấy mẫu `terrainHeightFn` (`web/src/scene/terrainHeight.ts`) trên lưới 1–3 m,
đọc đặc tả **sau V-26** (`.claude/worktrees/quay-truyen-tong/design/scene/scene.json`). Độ dốc tính theo đạo hàm, so
ngưỡng đi được 35° (R-VA-2).

Những gì V-26 đổi gần đây: tường bắc Truyền Tống Đài **z −22, x 17 → 42**; tường đông **x 42, z −22 → 25**; đoạn
**(17,−22)→(17,−17)** nối góc Quảng Trường. Tâm đài dời sang **(30, −9)**. Thêm khu Mặc Trì [17,3]→[42,25]. Địa hình
`size` từ 300 xuống 272, nên terrain còn ≈ 37k tam giác (bớt ≈ 8k).

### Bên đông: "Bãi Đông", x 6 → 44, z −52 → −22 (≈ 38 × 30 m)

```
 bắc ↑        x=6      12      18      24      30      36      42  46  50
 z −52   ███████████████████  vách bục Thượng Trấn (y 11 → 7, > 35°)      ≈
 z −50   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   ≈≈   ← suối Hậu Sơn
 z −46   ▒▒▒▒ y 4–5 ▒▒▒▒▒▒▒░░░░░ y 1–3 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·    ≈≈     (46,−58)→(44,−48)
 z −42   ▒▒▒▒ y 2–3 ▒▒▒░░░░░ ·  ·  ·  ·  BẰNG y ≈ 0–1  ·  ·  ·  ·   ·    ≈≈  →(50,−38)
 z −38   ░░░░ y 1 ░░░░ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   ≈≈
 z −34   ·  ·  ·  ·  ·  ·  ·  ·  ·  BẰNG y 0  ·  ·  ·  ·  ·  ·  ·  ·  ·  ≈≈
 z −28   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ≈   →(47,−26) hết
 z −22   ·  ·  ·  · ·╔══════ tường bắc Truyền Tống Đài (V-26) ══════════╗
 z −17   ═══QT═════  ╝ ↑cổ họng x 6–17, z −22…−17 (lối vào duy nhất)    ║ Truyền Tống Đài (30,−9)
         ↑ chân Thiên Bậc (x ±3,2): bậc đi ra bãi được ở z −18 … −25

 ▒ dốc 20–35° (đi được, vài điểm nhiễu > 35° ở x 8–11, z −42)   ░ dốc 10–20°   · bằng < 10°   █ vách > 35°   ≈ suối rộng 2,6 m
```

- **Địa hình**: phẳng (y 0–1) trên chữ L: x 6–44 / z −36…−22 và x 27–44 / z −52…−36, ≈ 900 m². Góc tây bắc
  (x 6–27, z −37…−51) là sườn dâng từ 1 lên 7 m, dốc 10–35°, sát vách bục Thượng Trấn ở z −51.
- **Vách hai bên Thiên Bậc** ở x ±4…5 dốc > 35° từ z ≈ −26 trở lên, nên chỉ rời bậc ra bãi được ở đoạn chân
  (z −18…−25). Muốn ra ngang lưng chừng thì phải làm chiếu nghỉ / bậc phụ (Q2-c).
- **Suối** (`terrain.streams`) chạy từ Hậu Sơn (42,−66) xuống (47,−26): là mép đông của bãi. Phía đông suối dâng lên núi
  (x > 52), không dùng.
- **Phía bắc** bãi nối thẳng lên Hậu Sơn (x 38–45, z −54 → −66, dâng 0 → 4 m, dốc nhẹ), nên bãi là **đường đi bộ có sẵn
  từ chân Thiên Bậc tới thác Hậu Sơn**, nhưng hiện chưa có lối lát nào chỉ đường.
- **Vật có sẵn**: không có. Rừng `tung` không va chạm (0,−62) 130×26 phủ z −75…−49, nên mép bắc có thể có vài cây rải.
- **Lối vào**: hiện chỉ qua "cổ họng" x 6–17, z −22…−17 (giữa tường bắc Quảng Trường và tường bắc Truyền Tống Đài mới).
  Mở thêm được: cổng trên tường bắc Truyền Tống Đài z −22 (Q2-b), bậc phụ từ Thiên Bậc (Q2-c).

### Bên tây: "Túi Tây" + "Dải Bắc Thư Viện" (≈ 210 + 370 m² phẳng)

```
 bắc ↑   x=−51    −45     −39     −33     −27     −21     −15     −9   −6
 z −50   ███▒▒▒ ·  ·  ·  ·  ·  ·  ·  ·  ░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
 z −46   ▒▒ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ░░░░ y 1–4 ▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ vách
 z −42   ·  ·  ·  ·  ·  DẢI BẮC THƯ VIỆN y 0  ·  ·  ·  ░░ y 1–2 ░░░░░░░░│ Thiên
 z −38   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ♣(−19,5;−37)·  ·  ·│ Bậc
 z −34   ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·│
 z −32   ╔════════ tường bắc Tàng Thư Các z −32 ════════════════╗ ·  ·  ·  │
 z −26   ║        Tàng Thư Các (−33,−22) 18×9                   ║ TÚI TÂY │
 z −17   ╚══════════════════════════════════════════════════════╝ y 0  ·  │
                                                                 ══QT═══ cổng bắc QT x ±4,5
```

- **Túi Tây**: x −17…−6, z −36…−17, phẳng y 0, kẹp giữa tường đông Tàng Thư Các (x −17) và vách Thiên Bậc. Đây là
  **ngã ba** trước cổng bắc Quảng Trường, ai lên Trà lâu cũng đi ngang.
- **Dải Bắc Thư Viện**: x −48…−17, z −48…−32, phẳng y 0–1 (phía đông x > −24 dâng 1–6 m về Thượng Trấn). Nối liền Túi
  Tây ở z −36…−32. Có 1 cây tùng (−19,5;−37). Sau lưng nhà Tàng Thư Các (mặt bắc z −26,5) cách tường 5,5 m.
- **Lối vào**: qua Túi Tây (có sẵn). Mở thêm được: cổng hậu trên tường bắc Tàng Thư Các z −32 (x ≈ −33), để từ thư viện
  ra thẳng vườn sau (Q2-d).

## Đề xuất các khu (6 khu, chọn 4 cho GĐ1)

| # | Khu (tên Việt) | Bên | Người chơi làm gì (vòng chơi) | Tính năng | Cỡ | Vật cần dựng | Ước thêm (dc / tam giác) |
|---|---|---|---|---|---|---|---|
| A | **Vườn Bia** | tây, Dải Bắc | GĐ1: đi xem rừng bia khắc bộ thủ. GĐ2: **bia sáng chữ theo bộ đã học** (bộ sưu tập 50 bộ), chạm bia thì mở lại thẻ bộ đó để **ôn** | GĐ1 cảnh; GĐ2 dùng thẻ bộ + tiến độ có sẵn, thêm nút nổi | vừa | 10 bia (`bia` mới từ Catalog, hoặc `da-khac` có sẵn), 1 đình bia `dinh`, 2 `tung`, 2 `den-da`, lối lát | +1–2 / +5–7k |
| B | **Bến Suối** (ao câu + đình nghỉ) | đông, ven suối | GĐ1: đình nghỉ nhìn ao, Ngồi ôn, trò chuyện. GĐ2: **câu cá chữ**: cá mang chữ / pinyin, câu đúng nghĩa thì được Văn tiền (trong trần trò 60/ngày) | GĐ1 cảnh + tính năng có sẵn (Ngồi ôn, chat); GĐ2 trò mới | vừa | ao `water` 6×6, đình `dinh` 4×4, 2 `bo-doan`, 2 `lieu`, `chau-sen`, 2 `den-da`, `bien-go` | +2–3 / +4–6k |
| C | **Đồi Chè** | đông, sườn tây bắc | GĐ1: 3 bậc chè dưới chân Trà lâu, ngắm từ Thiên Bậc. GĐ2: **việc vặt hái chè**: tiểu nhị gọi đơn bằng chữ (绿茶, 花茶…), hái đúng loại đem lên Trà lâu thì được Văn tiền | GĐ1 cảnh; GĐ2 việc vặt mới | vừa | 3 `terrain.plateaus` bậc, 1 `terrain.stairs` phụ, ≈ 18 bụi `bui` màu chè | +0–1 / +2–4k |
| D | **Đình Bố Cáo** | tây, Túi Tây (ngã ba) | GĐ1: bảng ở ngã ba (dùng `bang` nên mở thêm Nhiệm vụ hằng ngày, Q5) + biển chỉ đường. GĐ2: **Trấn báo** (bài đọc ngắn theo cấp mỗi tuần), bảng vinh danh (chờ mạng) | GĐ1 có sẵn; GĐ2 nội dung + màn mới | nhỏ | `bang`, 2 `den-da`, 2 `bien-go`, `bon-hoa` | +0–1 / +1–2k |
| E | Sân Diều | đông, bãi bằng | thả diều chữ dịp Thanh Minh / Trùng Dương (sự kiện mùa) | mới hoàn toàn (diều động, sự kiện) | vừa | cột, diều động | +3–5 / +2k |
| F | Chợ Phiên | tây, Dải Bắc | sạp NPC bán / đổi đồ theo ngày; chỗ tiêu Văn tiền ngoài Tạp hoá | mới (trùng một phần Tạp hoá) | lớn | 4–6 `sap-o` / `leu-vai`, NPC | +3–6 / +6–10k |

Số dc tăng ít vì `mergeSoft` / `mergeStatic` gộp vật tĩnh cùng vật liệu. Mỗi ao (nước shader), cờ / ngỗng (động) và biển
chữ mới mới thêm dc thật. Tam giác mới là mối lo. Số trên là **ước**, nên T0 / T6 đo thật bằng `/canh xem tren`.

### Bộ đề xuất cho GĐ1 (xếp theo giá trị / công sức)

1. **A Vườn Bia** (tây): giá trị học cao nhất, GĐ2 rẻ nhất (dùng lại thẻ bộ + tiến độ), cạnh Tàng Thư Các nên hợp chất.
2. **B Bến Suối** (đông): chỗ nghỉ cộng đồng có nước, dùng ngay được với Ngồi ôn + chat. Là bến cho trò câu cá GĐ2.
3. **C Đồi Chè** (đông): biến sườn dốc xấu thành cảnh đẹp nhất khi nhìn từ Thiên Bậc. Gắn với Trà lâu ở trên.
4. **D Đình Bố Cáo** (tây, nhỏ): đánh dấu ngã ba, chỉ đường hai bên. Rẻ.

E, F để sau (E hợp làm sự kiện mùa; F chờ có thêm đồ để bán, tránh trùng Tạp hoá).

Tổng GĐ1 ước **+3–7 dc, +12–19k tam giác**. Phần bù: V-26 đã bớt ≈ 8k (terrain 272). Nếu vẫn vượt 150k thì giảm rừng
tùng sau Trà lâu 12 → 8 cây (Q6).

## Bố trí GĐ1 (toạ độ đề xuất, chỉnh khi xem Canvas 3D)

```
                    BÊN TÂY                                     │TB│                    BÊN ĐÔNG
 z −48  ♣  [bia][bia][bia]  ┌đình┐  [bia][bia]  ♣             │  │  ≋≋bậc chè 3 (y 4,6)≋≋┆         ·  ·  ↑Hậu Sơn
 z −43     [bia][bia][bia]  │bia │  [bia][bia]                │  │  ≋≋bậc chè 2 (y 2,8)≋≋┆    ┌ao┐ ≈suối
 z −39  ─────── lối lát ─────└────┘────────╮                  │  │  ≋≋bậc chè 1 (y 1,2)≋≋┆ ┌đình┐│  │≈
 z −34           VƯỜN BIA (−46…−26)         ╰──╮  ♣           │  │        bậc phụ ↑ ┆   └────┘└──┘≈  BẾN SUỐI
 z −28  ║════ tường bắc Tàng Thư Các ════╗     │ ĐÌNH BỐ CÁO  │  │  ╭──── lối lát ────╯───────────╯≈
 z −23  ║                                ║   [bảng]  ⌂biển   │  │──╯  ⌂biển "Bến Suối · Đồi Chè"
 z −17  ╚════════════════════════════════╝ ═══ QT ═══════════ cổng bắc ════ QT ═══╗═══ tường bắc TTĐ (V-26) ═══
```

| Vật | Vị trí đề xuất | Ghi chú |
|---|---|---|
| Lối lát đông | `(4,−21)→(20,−26)→(31,−30)→(33,−52)→(39,−58)` rộng 2,4 | qua cổ họng, cách góc tường (17,−22) ≥ 1,2 m; nhánh bắc dẫn tới Hậu Sơn |
| Lối lát tây | `(−4,−21)→(−11,−29)→(−22,−37)→(−44,−39)` rộng 2,4 | vòng qua tùng (−19,5;−37) |
| Ao câu (B) | `water` tâm (41,−42) 6×6 | cách suối (x ≈ 46–48) 2 m bờ đất; không đè lối |
| Thính Tuyền Đình (B) | `dinh` (35,5;−39) 4×4, mặt nhìn ao | tên chỉ tiếng Việt (V-28) |
| Ven ao (B) | 2 `bo-doan` (38,−46), (38,−38,5) nhìn ra ao · 2 `lieu` (43,−36), (44,−47) · `chau-sen` (37,−35) · 2 `den-da` dọc lối | `ngong` không thêm (động, +1 dc), để GĐ2 có cá |
| Bậc chè (C) | `plateaus` pave:false: [8,−41]→[26,−38] y 1,2 · [8,−44,5]→[24,−41,5] y 2,8 · [8,−48]→[22,−45] y 4,6 · blend 0,8 | giữa các bậc là bờ kè dốc (cố ý). Đo lại dốc |
| Bậc phụ (C) | `terrain.stairs` (25,−37)→(23,−48) rộng 1,8 | lên được cả 3 bậc. Không nối vào Thiên Bậc nếu Q2-c chưa duyệt |
| Bụi chè (C) | 18 `trees.yard` kind `bui`, 3 hàng × 6, cách 2,4 m · `trees.bui` đổi sang 2 màu lục chè | cảnh này chưa dùng `bui` nên đổi màu không ảnh hưởng chỗ khác |
| Vườn Bia (A) | 10 bia: hàng z −43 và z −48, x −45, −41, −30, −26 (+ 2 giữa), mặt nhìn nam · đình bia `dinh` (−36,−45) 3,5×3,5 · 2 `tung` (−47,−49), (−24,−49) · 2 `den-da` | bia khắc 10 bộ đầu theo thứ tự Rừng trúc (Q4) |
| Đình Bố Cáo (D) | `bang` (−11,5;−24) mặt nhìn đông (ra ngã ba) · 2 `den-da` · `bien-go` (−8,−21) "Vườn Bia" · `bien-go` (8,−20) "Bến Suối · Đồi Chè" | `bang` = cửa thứ hai mở Nhiệm vụ hằng ngày (Q5) |
| Khu (`site.areas`) | "Vườn Bia" [−48,−50]→[−24,−33] · "Bến Suối" [28,−52]→[46,−30] · "Đồi Chè" [6,−52]→[27,−36] | không có trường `han` (V-28). Không chồng Thiên Bậc [−6,6] |

## Nhiệm vụ GĐ1 (chỉ cảnh)

Làm theo skill `/canh` (vai thiết kế: sửa `design/scene/scene.json`, xem Canvas 3D, chốt, ghi `design/CHANGELOG.md`),
trong worktree riêng. Bắt đầu **sau khi V-26 đã gộp vào main**.

- [ ] 0. **Mốc đo**: rebase lên main có V-26 → `npm run scene:check` → `/canh xem tren` + góc chơi ở chân Thiên Bậc: ghi
  dc / tam giác gốc. (xong khi: có bảng số gốc trong nhật ký việc)
- [ ] 1. **Lối lát hai bên** + 2 biển gỗ chỉ đường (`paths`, `props bien-go`, chữ Việt). (scene.json · `scene:check`
  không báo đè · xong khi: từ chân Thiên Bậc nhìn thấy hai lối rẽ, đi theo lối đông tới Hậu Sơn không kẹt)
- [ ] 2. **Bến Suối** (B): ao, đình, bồ đoàn, liễu, đèn. (scene.json · xong khi: ao không chạm suối / lối, đình vào được
  và Ngồi ôn trong đình chạy, `scene:check` sạch)
- [ ] 3. **Đồi Chè** (C): 3 bục bậc, bậc phụ, 18 bụi chè, màu `trees.bui`. (scene.json · đo lại dốc: lên được bằng bậc phụ,
  bờ kè giữa bậc > 35° là cố ý · xong khi: đứng trên Thiên Bậc nhìn sang thấy 3 bậc chè rõ, nhân vật không kẹt ở mép bậc)
- [ ] 4a. **Vườn Bia** bằng vật có sẵn (Q3-a: `da-khac`), hoặc
- [ ] 4b. (Q3-b, code nhỏ) thêm prop `bia`: `PROP_KINDS` + `props.ts` dựng từ mẫu Catalog `bia` (cỡ S), va chạm hộp, `text`
  khắc chữ (mặt +z). (spec.ts, props.ts · lớp `scene/` · test: `props` dựng được, kích thước khớp Catalog · xong khi:
  `npx tsc --noEmit && npm test` xanh) → rồi đặt 10 bia + đình bia trong scene.json
- [ ] 5. **Đình Bố Cáo** (D): `bang` + đèn + bồn hoa ở Túi Tây. (scene.json · kiểm: đứng gần thì nút "Xem bảng" mở đúng
  Nhiệm vụ hằng ngày (R-NV-3), không phá bảng ở Quảng Trường)
- [ ] 6. **Khu + ngân sách**: 3 `site.areas` mới. Đo lại `?view=tren` và góc chơi. Vượt 150 dc / 150k tam giác thì áp Q6.
  (xong khi: chip tên khu đổi đúng khi đi vào ba khu, số đo ghi trong CHANGELOG)
- [ ] 7. **Chốt**: `design/CHANGELOG.md` (mục mới), `design/scene/tong_mon.md` (bài trí: mỗi vật một mục đích: hoạt động /
  dẫn đường / kể chuyện), ảnh chụp trước / sau. `npm run build` để app nhận cảnh mới.

## GĐ2 — tính năng (phác, mỗi khu một kế hoạch con `/lead`, giao diện mới qua `/ui-apply phieu`)

| Thứ tự | Khu | Tính năng | Giao diện mới (phiếu) | Luật mới (nháp) | Cầu nối |
|---|---|---|---|---|---|
| 1 | Vườn Bia | Bia hiện chữ theo bộ đã học. Chạm bia thì mở thẻ bộ (màn có sẵn) | nút nổi "Xem bia" (kiểu nút nổi có sẵn), bia chưa khắc trông thế nào | R-BIA-1 | có thể không cần: `getProgress` đã có bộ đã học (kiểm) |
| 2 | Bến Suối | Câu cá chữ: ngồi bồ đoàn ven ao → trò câu; cá mang chữ / pinyin, chọn đúng nghĩa → Văn tiền (R-TIEN-3, trần chung 60/ngày) | màn trò câu cá (HUD mới) | R-CAU-1…3 | `earnGame` có sẵn (thêm loại trò) |
| 3 | Đồi Chè | Việc vặt hái chè: đơn trà của tiểu nhị viết chữ, hái đúng loại, đem lên Trà lâu | thẻ đơn trà, giỏ chè trên HUD | R-CHE-1…2 | `earnGame` hoặc sự kiện mới |
| 4 | Đình Bố Cáo | Trấn báo: bài đọc ngắn mỗi tuần theo cấp HSK; bảng vinh danh (chờ giai đoạn mạng) | màn đọc Trấn báo | R-BAO-1 | sự kiện mở bảng mới |
| — | (Bến Suối, Vườn Bia) | Chỗ ngồi ngoài trời theo R-NGOI-1 cho `bo-doan` / `ban-tra` ngoài nhà (hiện chỉ nhà có chỗ ngồi) | không | sửa R-NGOI-1 | không |

### Luật nghiệp vụ nháp (chưa vào sổ; vào `docs/testing/quy_tac.md` khi làm GĐ2, rồi `/dong-bo-quy-tac`)

- **R-BIA-1** (nháp): Vườn Bia có 10 bia, mỗi bia ứng 5 bộ thủ theo thứ tự học ở Rừng trúc (bia 1 = bộ 1–5…). Bia có ≥ 1
  bộ đã học thì khắc những bộ đó (sáng). Chưa học bộ nào của bia thì bia trơn, ghi "Chưa khắc". Đứng cách bia < 1,5 m →
  nút nổi "Xem bia" → danh sách bộ của bia, chạm bộ đã học → thẻ bộ. *Ví dụ*: đã học 7 bộ → bia 1 khắc đủ 5, bia 2 khắc 2,
  bia 3–10 trơn.
- **R-CAU-1** (nháp): ngồi bồ đoàn ven ao Bến Suối → "Câu cá". Mỗi lượt có 1 câu hỏi về bộ đã học (chữ → nghĩa, 3 phương
  án). Đúng thì câu được cá + **+3 Văn tiền**, sai thì cá thoát. Tính chung trần trò **60 / ngày** (R-TIEN-3). Chưa học bộ
  nào → "Học ở Rừng trúc trước".
- **R-CHE-1** (nháp): mỗi ngày tiểu nhị Trà lâu có tối đa 3 đơn chè (chữ Hán + pinyin). Hái đúng loại ở Đồi Chè, đem lên
  Trà lâu → **+5 Văn tiền** / đơn. Sai loại thì tiểu nhị đọc lại tên đúng, không trừ gì.

## Giả định / cần quyết định

**Q1. Chọn khu cho GĐ1**
- a) **A Vườn Bia + D Đình Bố Cáo (tây) · B Bến Suối + C Đồi Chè (đông)**
- b) Như a nhưng bỏ C (đông chỉ có Bến Suối, đỡ việc địa hình)
- c) Đổi tây sang F Chợ Phiên, giữ đông như a
- **Đề xuất a.** Duyệt xong người dùng thấy: hai lối lát rẽ ở chân Thiên Bậc; bên tây có rừng bia + bảng nhiệm vụ ở ngã
  ba; bên đông có đình bên ao cạnh suối và 3 bậc chè xanh trên sườn, nhìn rõ khi leo Thiên Bậc.

**Q2. Lối vào**
- a) Chỉ dùng lối có sẵn: chân Thiên Bậc (cổ họng đông x 6–17, Túi Tây) + lối lát
- b) a + mở **cổng trăng trên tường bắc Truyền Tống Đài** (z −22, x ≈ 30), nối đài ↔ Bến Suối. Đây là tường của V-26:
  làm sau khi V-26 gộp, trong việc này hoặc nhờ V-26
- c) a + **chiếu nghỉ ở lưng Thiên Bậc** (z ≈ −37, y ≈ 5) có bậc phụ ngang sang bậc chè 2. Phải sửa vách bậc chính.
- d) a + **cổng hậu tường bắc Tàng Thư Các** (z −32, x ≈ −33): từ thư viện ra thẳng Vườn Bia
- **Đề xuất a cho GĐ1; c và d làm cuối GĐ1 nếu xem Canvas thấy hợp; b để sau** (đài đã có lối từ Quảng Trường).
  Duyệt a: đi vào hai bên chỉ từ chân Thiên Bậc. Duyệt thêm c: đang leo bậc rẽ ngang được sang đồi chè. Duyệt thêm d: từ
  sau thư viện có cổng trăng nhỏ ra vườn bia.

**Q3. Bia đá ở Vườn Bia**
- a) Dùng `da-khac` có sẵn (đá khắc nằm ngang 2,6 × 1,2 m). Chỉ cảnh, không code
- b) Thêm prop `bia` dựng từ mẫu `bia` đã duyệt trong Catalog (bia đứng trên đế rùa / đế đá). Code nhỏ: 2 file + test
- c) Đợi kế hoạch "dựng lại cảnh bằng mẫu Catalog" (`2026-11-14-kien-truc-chuan-bai-tri.md`) rồi mới làm Vườn Bia
- **Đề xuất b**: bia đứng mới ra "rừng bia", mẫu đã có sẵn, việc nhỏ. Duyệt b: 10 tấm bia đứng xếp 2 hàng quanh một đình
  bia; a: 10 phiến đá nằm (giống vườn đá hơn rừng bia).

**Q4. Chữ trên bia ở GĐ1** (luật V-28: biển / tên chỉ tiếng Việt, chữ Hán chỉ ở nội dung học)
- a) Bia trơn tới GĐ2
- b) Khắc sẵn 10 bộ đầu theo thứ tự Rừng trúc (đây là nội dung học, hợp V-28). GĐ2 đổi sang khắc theo tiến độ
- c) Khắc câu đối / thơ cổ (đẹp, nhưng không phải nội dung đang học)
- **Đề xuất b.** Duyệt xong người dùng thấy: mỗi bia một chữ bộ thủ lớn theo thứ tự `RADICALS` (竹 木 水…). Bảng tên khu "Vườn Bia" bằng tiếng Việt.

**Q5. Bảng ở Đình Bố Cáo**: code hiện coi **mọi** prop `bang` là bảng Nhiệm vụ hằng ngày (`zones/dailyBoard.ts`)
- a) Dùng `bang`, thành cửa thứ hai mở Nhiệm vụ hằng ngày ngay ngã ba lên Trà lâu (tiện, không code)
- b) GĐ1 chỉ đặt biển gỗ chỉ đường, bảng để GĐ2 (Trấn báo, cần kind riêng)
- **Đề xuất a.** Duyệt xong người dùng thấy: ở ngã ba có bảng gỗ, lại gần hiện nút "Xem bảng" như bảng ở Quảng Trường.

**Q6. Ngân sách hình** (trấn đang ≈ 136 dc / ≈ 150k tam giác nhìn từ trên, sát trần)
- a) Làm GĐ1, đo ở T0 / T6. Bù bằng phần V-26 đã bớt (terrain ≈ −8k)
- b) a + giảm rừng tùng sau Trà lâu 12 → 8 cây nếu vẫn vượt
- c) Thêm "ẩn vật nhỏ khi xa > 45 m" (code hiệu năng, kế hoạch riêng)
- **Đề xuất a, có b làm phương án dự phòng.** Duyệt xong người dùng thấy: cảnh có thêm 4 khu mà fps trên máy yếu không
  giảm (số đo ghi trong CHANGELOG).

**Q7. Ngồi ở Bến Suối / Vườn Bia**
- a) GĐ1 chỉ có Ngồi ôn tại chỗ (R-DIEU-7, có sẵn). Bồ đoàn là vật trang trí
- b) Bồ đoàn / bàn trà ngoài trời thành chỗ ngồi thật (nút nổi "Ngồi", R-NGOI-1). Phải sửa sổ quy tắc và code `zones/seats`
- **Đề xuất a ở GĐ1, b vào GĐ2** (cùng trò câu cá). Duyệt a: ngồi ôn trong đình được, nhưng bồ đoàn chưa hiện nút "Ngồi".

## Phụ thuộc

- **V-26 (quây tường Truyền Tống Đài, `.claude/worktrees/quay-truyen-tong`)**: GĐ1 đọc bố cục sau V-26 (tường z −22,
  đài (30,−9), terrain 272). **Bắt đầu GĐ1 sau khi V-26 gộp**, nếu không thì lối lát đông và ngân sách phải đo lại. Q2-b
  đụng tường của V-26.
  *Lưu ý gửi V-26*: biển cổng mới "Mặc Trì · 墨池" và `da-khac` "墨池" trái luật V-28 (biển chỉ tiếng Việt).
- **V-29 (xoay khu vui chơi Kỳ Văn Uyển)**: không chồng (Kỳ Văn Uyển z −11…17, xa hai khu này).
- **V-28 (bỏ chữ Hán ở biển / tên)**: khu mới không có `han`, biển gỗ một dòng Việt.
- GĐ2 Vườn Bia cần danh sách bộ đã học từ `getProgress` (kiểm `docs/bridge.md`). Câu cá / hái chè dùng `earnGame` + trần R-TIEN-3.

## Kiểm tra cuối (GĐ1)

`cd web && npm run scene:check` · `/canh xem tren` (dc / tam giác) · (nếu làm 4b) `dart tool/check.dart --changed` ·
`npx tsc --noEmit && npm test && npm run build` · thử trên trình duyệt: đi hai lối, leo bậc chè, Ngồi ôn trong đình,
bảng Đình Bố Cáo.
