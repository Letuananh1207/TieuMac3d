# Nhà của ta làm lại — tiểu động thiên trên mây (V-20261114-48)
- Yêu cầu: "cấu trúc nhà cũng đang rất xấu, tôi không muốn người dùng ra được khỏi phạm vi nhà, và cảm giác đang rất chật và
  phân bố rất xấu, tường, cảnh vật… nói chung tệ — hãy tham khảo các game khác làm như nào rồi làm"
- Loại: sửa hành vi (phạm vi đi được) + bố cục cảnh · Cỡ: vừa · Trạng thái: chờ duyệt
- Hồ sơ khảo cứu: `docs/tham_khao/nha-rieng-game.md` (hiện trạng có ảnh, 6 game, tứ hợp viện, Võng Sư Viên, số đo).
- Xây trên **V-47** (bỏ vòng trận khỏi nhà: đi bản đồ tới nhà → đứng ở `player.start` trong cổng nam). Kế hoạch này giả định
  `teleport.enabled: false` + `player.arriveAtStart: true` trong `nha-ta.json`. V-47 chưa gộp thì đợi gộp rồi mới bắt đầu.

## Hiện trạng — vì sao xấu (ảnh `…/scratchpad/nha-lam-lai/01…08.png`, chi tiết trong hồ sơ)
1. **Ra được ngoài**: ngoài tường là nền gạch vô tận (`terrain` tắt, `ground.size` 90); vùng cổng về trấn chỉ x −4 … 4 → bước lệch
   là đi vòng quanh tường (`07-ngoai-tuong`).
2. **Chật**: hộp tường 2,8 m + tường ngăn 2,2 m quanh camera (`05-vuon`, `08-cuoi-vuon`) — camera chỉ thấy tường.
3. **Phân bố**: nhà dính tường sau, một sân lát trống to, một hộp vườn trống; 2 cây; không nước, không chỗ ngồi, không điểm nhìn.
4. **Một chất nền** gạch rêu cho cả trong lẫn ngoài; trúc mao mọc trên gạch.

## Hướng đề xuất (bài học từ game khác → cách làm)
| Bài học | Từ đâu | Áp vào nhà |
|---|---|---|
| Ranh giới bằng địa hình có lý do, không tường bao | Serenitea Pot (đảo nổi / đỉnh núi trên mây), AC (biển), Stardew (vách + rừng) | Nhà là **một đảo nhỏ trên biển mây** — mép vực chặn (R-VA-2 đã có, như Bồng Lai) |
| Một lối vào / ra có khung, chỗ tới nhìn về nhà | Stardew (khe rừng), AC (bến), tứ hợp viện (cổng + ảnh bích) | **Cổng lầu** ở nam + **chiếu nghỉ "Bến mây"** ở mép nam là lối ra duy nhất; chỗ tới đứng trong cổng nhìn trục về nhà |
| Nhà dựa núi nhìn nước (背山面水), điểm nhấn trên trục | Serenitea (dinh trên chỗ cao), tứ hợp viện (chính phòng bắc) | Nhà chính bắc, **đồi sau + trúc mao** làm nền; **ao sen** phía đông nam nhà |
| Vài phòng ngoài trời khác chất, dày mép thoáng giữa | Võng Sư Viên (ao 334 m² làm tâm), AC (sân trước khoe đồ) | Sân trong lát đá · sân cỏ trước · vườn ao · đình ngắm mây — mỗi khu một nền |
| Quanh camera thấp, cao ở hậu cảnh; nhìn ra xa để đỡ chật | Sky, Serenitea | Không tường cao quanh lối; lan can 0,8 m; mây + núi xa nhìn thấy từ mọi chỗ |

## Bố cục mới (mặt bằng; x đông +, z nam +; nhà mặt nhìn +z)
Đảo: `terrain.center` (0; −2), mép `edge.radius` 28 (wobble 2) → vành đảo ≈ x −28 … 28, z −30 … 26 (∅ ≈ 56 m). Phần đi được
≈ 1 700 m² (gấp ~2 lần sân trong tường cũ 832 m², nhưng **không còn ngoài tường**).

```
 z
-30  ~~~~~~~~~~~~~~~~~~~ mép vực / biển mây ~~~~~~~~~~~~~~~~~~~~~
-26        ▲▲▲ ĐỒI SAU (đỉnh (−4;−26) r12 h9 · (10;−25) r8 h6) — trúc mao, dốc > 35° chặn ▲▲▲
-17   tùng ┌──────────── SÂN TRONG (lát đá) x −9…9, z −17…−1 ─────────────┐   tùng
           │ [t1]        [t2]        [t3]   ← 3 ô trong nhà                 │
-14        │ ║   ┌──────── CHÍNH PHÒNG nha-o (0;−11) 10,5×6 ────────┐   ║ │      VƯỜN AO
           │ ║   └─────────────────── thềm z −7,2 ──────────────────┘   ║ │  [v1](11;−11,5)  [v2](16,5;−11,5)
-8         │ ║ hành                     │                         hành ║ │       ╭── AO SEN ──╮
           │ ║ lang        [s1]         │ lối       [s2]           lang ║ │       │ (14;−7) r3,2│ [v3](18,2;−5)
-4         │ ║ x−8   (−4,5;−4,5)        │ trục   (4,5;−4,5)         x 8 ║ │       ╰────────────╯
-1         └─╨──── lan can gỗ 0,8 ─────┤ ├───── lan can gỗ 0,8 ─────╨──┘ ═══ lối vườn z 0,5 → x 17 ══
            mai                         │                                             [v4](16,5;3)
 2   ┌ ĐÌNH NGẮM MÂY ┐                 │ lối trục rộng 2,4
     │ dinh 6 cạnh   │══ lối z 6 ═════ │
 6   │ (−15;6) ∅4,5  │     [v5](−6,5;6)│(0;10,5)     [v6](6,5;6)
lan  └───────────────┘                 │ ★ chỗ tới / xuất phát, nhìn bắc
can  [s3](−16;10,5) bàn trà ngắm mây   │
đá   ░░ bụi ░░░░░░░░░░ tường 2,8 ══[CỔNG LẦU z 13]══ tường 2,8 ░░░░░░░░░░ bụi ░░
x−19.5                                 ┃ chiếu nghỉ "Bến mây" x −4…4, z 14,5…24, lan can đá hai bên
22-25                              ( ◎ vòng sáng "Khởi Nguyên Trấn" ) → về trấn
26   ~~~~~~~~~~~~~~~~~~~ mép vực / biển mây ~~~~~~~~~~~~~~~~~~~~~
```

### Trường `nha-ta.json` (giá trị đề xuất — tinh chỉnh khi `/canh`)
| Phần | Trường | Giá trị |
|---|---|---|
| Đảo | `terrain` | `enabled: true`, `center: [0, -2]`, `size: 96`, `cell: 1.5`, `edge: { radius: 28, width: 10, y: -30, wobble: 2 }`, `noise.amp` nhỏ (≈ 0,4), `grass.density` 4, `rocks.density` 3, `colors` cỏ hướng A Xuân ấm `#8DBF5A · #A6CC66 · #79AD52`, đất vách `#B98A6A` |
| Bục phẳng | `terrain.plateaus` | chính: x −19 … 19, z −17 … 14,5, `y` 0, `pave: false`, `blend` 3 · Bến mây: x −4 … 4, z 14,5 … 24, `pave: true`, `blend` 1 |
| Đồi sau | `terrain.peaks` | (−4; −26) r 12 h 9 · (10; −25) r 8 h 6 |
| Chất nền | `terrain.floors` | sân trong x −9 … 9, z −17 … −1, `#C9C1B0` (không chồng nền khác) |
| Mây, núi | `cloudSea` · `farMountains` · `fog` | `radius` 220, `y` −14; núi xa giữ 2 lớp (màu pastel hướng A); `fog.far` 75 → 110 |
| Bỏ | `wallSegments` (5 đoạn cũ), `ground` gạch vô tận, `teleport` (V-47) | thay bằng mục dưới |
| Cổng | `wallSegments` | một đoạn (−6; 13) → (6; 13) cao 2,8, `gate: { at: 0, width: 2.8, kind: "lau", signs: { nam: "Nhà của ta", bac: "Khởi Nguyên Trấn" } }` |
| Lan can | `fences` | gỗ: (−9; −1) → (−1,5; −1), (1,5; −1) → (9; −1), (−9; −3) → (−9; −1) · đá (Bến mây + chỗ ngắm): (−4; 14,5) → (−4; 24), (4; 14,5) → (4; 24), (−19,5; 1) → (−19,5; 12) |
| Hành lang | `galleries` | (−8; −13) → (−8; −3) và (8; −13) → (8; −3), `width` 2,2 (cần thử — xem NV2) |
| Nhà | `buildings` | `chinh-phong` `nha-o` (0; −11) 10,5 × 6 (chỉ dời z −8 → −11) · `dinh-ngam-may` `dinh` 6 cạnh (−15; 6) 4,5 × 4,5 |
| Ao | `water` | tròn (14; −7) r 3,2 |
| Lối | `paths` | trục (0; 23) → (0; −7,2) rộng 2,4 · vườn (1,2; 0,5) → (17; 0,5) rộng 1,4 · đình (−1,2; 6) → (−12,8; 6) rộng 1,4 |
| Cây | `trees.yard` | tùng (−13; −12), tùng (13,5; −15), mai (−12,5; −3), liễu (10; −3) (cạnh ao), trúc (−18; −6) |
| | `trees.groves` | trúc mao đồi sau (2; −24) 34 × 6 ×16 không va chạm · tùng mép tây bắc (−21; −12) 5 × 8 ×4 · tùng mép đông bắc (21; −13) 4 × 6 ×3 · bụi `bui` hai bên cổng (−12,5; 13) 13 × 1,2 ×9 và (12,5; 13) 13 × 1,2 ×9 có va chạm |
| Khu (chip) | `site.areas` | Chính phòng (nhà) · Sân trong (−9 … 9, −17 … −1) · Vườn ao (9 … 28, −30 … 6) · Đình ngắm mây (−28 … −9, 0 … 13) · Bến mây (−6 … 6, 13 … 27) · Sân cỏ (cả đảo — khu còn lại); thứ tự theo `areaTracker` (khu nhỏ trước) |
| Ra / vào | `portals` | → `tong-mon`: vùng (−1,8; 22) … (1,8; 25), `arrive: { at: [0, 10.5], rotY: 180 }`, `label: "Khởi Nguyên Trấn"` |
| Xuất phát | `player` | `start: [0, 10.5]`, `arriveAtStart: true` (V-47) |
| Camera | `camera` | giữ; `far.dist` 16 đủ thấy cả trục từ chỗ tới |

### 12 ô trang trí — **giữ 12 mã, dời toạ độ** (vật người chơi đã đặt đi theo ô sang chỗ mới, R-NHA-3 không mất gì)
| Mã | Loại | Cũ | Mới | Ở đâu |
|---|---|---|---|---|
| trong-1 / 2 / 3 | trong | (−3,2; −9,8) · (0; −10) · (3,2; −9,8) | (−3,2; −12,8) · (0; −13) · (3,2; −12,8) | trong nhà, sát tường sau (cùng khoảng cách 1–1,2 m như cũ) |
| san-1 / san-2 | san | (−3,5; −2) · (3,5; −2,6) | (−4,5; −4,5) · (4,5; −4,5) | sân trong, hai bên thềm |
| san-3 | san | (−7; 3,5) | (−16; 10,5) | cạnh đình ngắm mây, nhìn ra mây (chỗ đặt bàn trà) |
| vuon-1…4 | vuon | (9; −11) · (13; −11) · (11; −7) · (14; −4) | (11; −11,5) · (16,5; −11,5) · (18,2; −5) · (16,5; 3) | quây quanh ao sen |
| vuon-5 / 6 | vuon | (10,5; 4) · (14; 8) | (−6,5; 6) · (6,5; 6) | sân cỏ trước, hai bên trục — "cây đối" đón người về |

### Ngân sách (đo ở `?view=tren`, góc chơi tại chỗ tới, trong nhà)
Ước: đảo + cỏ + đá 3–5 · mây + núi 3 · nhà 8 · đình 3 · hành lang 4–6 · cổng + tường 4 · lan can 2 · ao 2 · cây 6–8 · lối 1 →
**≈ 60–80 draw call, ≤ 40k tam giác** chưa vật; đủ 12 ô + dấu ô ≤ +20 → **≤ 100** (trần 150k tam giác / 150 draw call). Bản cũ
55 (trên xuống). Không thêm đèn, không shadow; nếu vượt 100 → bớt cỏ búi / cây mép trước.

## Phạm vi
**Sẽ sửa**
- `design/scene/nha-ta.json` — bố cục mới ở trên (qua `/canh`, phiên này làm thay vai thiết kế, duyệt trên Canvas 3D rồi mới chốt).
- `docs/testing/quy_tac.md` — R-NHA-1 (toạ độ tới / ra mới), **R-NHA-5 mới** (phạm vi nhà), R-HANH-4 (ví dụ chỗ tới ở nhà).
- `design/CHANGELOG.md` + `design/screens/Canh-nha-ta*.png` (bước chốt `/canh`).
- `docs/screen_specs.md` mục "Nhà của ta" — ghi vị trí ô mới (mục 2026-11-14.16 nói vị trí ô / camera lấy theo cảnh) — qua `/ui-apply`.
- Test: `web/src/areaMapScenes.test.ts` (đất nhà thành đảo, nhãn khu mới), test mới R-NHA-5 (đi về mọi hướng không ra khỏi đảo).

**Cần kiểm tra** (có thể phát sinh code nhỏ — NV2 trả lời)
- `web/src/scene/specCheck.ts` (`flat` cho `decorSlots` khi có `terrain`; `galleries` không có nước), `scene/decorSlots.ts`.
- `web/src/homeDecor.ts` + `scene/decorLayer.ts` `slotFloorY` (truyền `groundY` của địa hình).
- `web/src/scene/galleries` (hành lang không giáp nước có dựng được, có kéo camera R-DIEU-4 không).
- `web/src/zones/areaMap*.ts` (bản đồ nhỏ vẽ mép đảo cho cảnh nhà — như Bồng Lai), `scene/portals.ts` (cặp cổng trấn ↔ nhà).
- `web/src/designPreview.ts` (Canvas 3D `?vung=nha-ta` với địa hình).

**Không đụng**: `scene.json` trấn (cổng "Về nhà" giữ nguyên — chỗ tới ở nhà nằm trong `nha-ta.json`); danh mục 13 vật, giá,
HUD trang trí, cầu nối `getHome` / `setDecor`, lưu nhà (mã ô giữ nguyên); `nha_o.ts` (nhà giữ kích thước).

## Giả định / cần quyết định
**Q1. Khép phạm vi nhà bằng gì?**
- **A (khuyên)** — đảo nhỏ trên biển mây, mép vực chặn; lan can đá chỉ ở chỗ ngắm + Bến mây. *Vì sao*: ranh giới tự nhiên ai nhìn
  cũng hiểu (như Serenitea Pot), không tường quanh camera, khớp truyện "từ trấn đi xuống núi vào biển mây là tới nhà", engine đã có
  sẵn (Bồng Lai).
- B — thung lũng kín: đồi dốc + rừng trúc dày bao quanh, không thấy mây (kín đáo hơn, nhưng không nhìn ra xa → dễ lại thấy chật).
- C — giữ hộp tường, hạ 1,5 m, chặn ngoài cổng bằng vật cản (rẻ nhất, vẫn là "hộp tường").

**Q2. Sân trong khép bằng gì?**
- **A (khuyên)** — hai hành lang có mái (đông, tây) + lan can gỗ thấp phía nam, khe giữa ở trục. *Vì sao*: ra dáng tứ hợp viện
  (chính phòng + hành lang quây sân) mà quanh camera chỉ cao 0,8 m.
- B — tường hoa 2,2 m có cổng trăng + lậu song (đúng tiểu viện Giang Nam hơn, nhưng camera lại kéo sát như bây giờ).
- C — chỉ lan can thấp, không hành lang (thoáng nhất, kém "chất nhà").

**Q3. 12 ô trang trí**
- **A (khuyên)** — giữ 12 mã, dời toạ độ theo bảng trên. *Vì sao*: người chơi không mất vật đã đặt (R-NHA-3), không đổi cầu nối /
  dữ liệu; thêm ô để đợt sau khi có đặt tự do.
- B — giữ 12 + thêm 4 ô mới (ven đình, ven ao, hai bên cổng): nhà đầy hơn, +≤ 8 draw call, sửa test ô.

**Q4. Điểm nhấn phụ** (ngoài ao sen + đình ngắm mây)
- **A (khuyên)** — thêm suối nhỏ từ đồi sau chảy vào ao (`terrain.streams`, +1 draw call) và một đàn hạc bay vòng xa (`flocks`,
  +3). *Vì sao*: có chuyển động + tiếng "tiên cảnh" mà rẻ; nhà không còn tĩnh như ảnh.
- B — không thêm, giữ tối giản cho đo fps.

Giả định khác (không cần hỏi): tên khu chip như bảng `site.areas`; cổng nam vẫn tên "Nhà của ta"; ngày đêm giữ (`dayNight`).

## Nhiệm vụ
- [ ] 1. **Sổ quy tắc** (`docs/testing/quy_tac.md` · nghiệp vụ): R-NHA-1 — tới từ trấn / bản đồ → đứng (0; 10,5) trong cổng lầu,
      nhìn bắc về nhà; ra: đi qua cổng (z 13) xuống chiếu nghỉ Bến mây, bước vào vòng sáng "Khởi Nguyên Trấn" (x −1,8 … 1,8,
      z 22 … 25) → về trấn. **R-NHA-5 (mới) Phạm vi nhà**: nhà là một đảo nhỏ trên biển mây; đi về mọi hướng đều dừng ở mép vực
      (R-VA-2), đồi sau hoặc lan can — không có cách nào ra ngoài đảo; chỉ rời nhà qua vòng sáng ở Bến mây (hoặc bản đồ ở Truyền
      Tống Đài — không ở nhà). Ví dụ: từ (0; 0) đi thẳng tây → dừng trước x ≈ −26; đi thẳng bắc qua sân trong → sau nhà leo đồi rồi
      dừng (dốc > 35°) trước z −30; trên Bến mây đi ngang ra x 5 → lan can đá chặn ở x ≈ 3,5. R-HANH-4: ví dụ "(0; 10)" → "(0; 10,5)".
      → `/dong-bo-quy-tac`. Xong khi người dùng xác nhận trên tài liệu online.
- [ ] 2. **Thử khả năng đặc tả** (bản nháp `nha-ta.json` trong worktree, chưa chốt · scene/spec): bật `terrain` đảo + bục + 12 ô
      dời + `galleries` không nước + `fences` + `dinh`; `npm run scene:check`; Canvas 3D đi thử: (a) mép vực chặn đủ 8 hướng kể cả
      chỗ `wobble`; (b) ô trang trí qua kiểm `flat` và vật đứng đúng mặt đất (`slotFloorY` + `groundY`); (c) hành lang dựng được
      không cần nước, camera có bị kéo (R-DIEU-4); (d) bản đồ nhỏ vẽ mép đảo. Xong khi có danh sách "chạy sẵn" / "cần code".
- [ ] 3. **Code nhỏ nếu NV2 thấy thiếu** (scene · chỉ khi cần): vd. `galleries` cho phép `waterSide: 0` (ghế hai phía), kiểm
      `flat` dùng mặt đất địa hình, `homeDecor` truyền `groundY`. Mỗi trường mới có mặc định giữ cảnh cũ (CLAUDE.md quy tắc 8).
      Test vitest kèm. Xong khi `npx tsc --noEmit && npm test` xanh.
- [ ] 4. **Dựng bố cục** `design/scene/nha-ta.json` theo mặt bằng + Q1–Q4 (`/canh`): `scene:check` "Không có lỗi", `build:design`,
      đăng Canvas 3D, chụp 6 góc (trên xuống, cả đảo, chỗ tới, sân trong, vườn ao, đình ngắm mây) + đo draw call / tam giác → người
      dùng **đi thử trên Canvas 3D** và duyệt. Xong khi người dùng duyệt.
- [ ] 5. **Test** (web): test R-NHA-5 dùng đặc tả thật `nha-ta.json` + `canStep` / heightfield — từ 8 điểm trong đảo đi thẳng 8
      hướng 60 m → vị trí cuối luôn cách tâm (0; −2) < 28 m và không lọt ra ngoài trừ qua vùng cổng; cập nhật
      `areaMapScenes.test.ts` (đất nhà = đảo, nhãn khu mới, không còn biểu tượng vòng trận); `decorSlots.test.ts` / `portals.test.ts`
      nếu dùng toạ độ cũ. Dart `app/test/rules/nha_test.dart` không đổi (mã ô giữ). Xong khi `npm test` xanh, `rule_trace` thấy R-NHA-5.
- [ ] 6. **Chốt thiết kế** (`/canh chot`): mục `design/CHANGELOG.md` (bố cục, trường đổi cũ → mới, luật chạm, draw call), ảnh
      `design/screens/Canh-nha-ta*.png` (ghi đè ảnh cũ); `docs/screen_specs.md` "Nhà của ta" — vị trí ô mới (`/ui-apply`).
- [ ] 7. **Build + thử máy**: `npm run build`; trên điện thoại: từ trấn đi "Về nhà" → đứng trong cổng nhìn về nhà; chạy quanh mép
      đảo mọi phía không ra được; vật đã đặt trước đây hiện ở chỗ ô mới; ra Bến mây về trấn; fps ≥ 30 (Android tầm trung).

Làm được ngay sau khi duyệt + V-47 gộp: 1, 2 (song song). 3 đợi 2. 4 đợi 2 (+3 nếu có). 5 đợi 4. 6–7 cuối.

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npm run scene:check && npx tsc --noEmit && npm test && npm run build ·
cd app && flutter analyze && flutter test -r failures-only test/rules test/scene · dart tool/rule_trace.dart


## Người dùng chốt (2026-11-15)
- Q1: **đảo nhỏ trên biển mây** (mép vực chặn, lối ra duy nhất bến mây phía nam).
- Q2: **hai hành lang + lan can thấp**.
- Q3 + Q4: "tôi muốn **rỗng**, chưa cần thêm gì cả vì sau này người dùng có đồ rồi mới trang trí thêm giống game 摩尔" → **không** thêm suối, hạc, ao sen trang trí, đình, cây đối… chỉ dựng khung: đảo + nhà chính + sân trong (hành lang + lan can) + nền / cỏ + ít cây nền ở đồi sau / mép đảo để đỡ trơ; giữ 12 ô trang trí (giữ mã, dời toạ độ) để người chơi tự đặt đồ.
