# Đổi mục tiêu: học từ vựng tiếng Trung (V-20261117-80)
- Yêu cầu: "mục tiêu của tôi đã thay đổi không phải học hán tự mà là học từ vựng tiếng trung" — người dùng chọn
  (2026-11-17): mỗi từ cần **nghe + nói** (âm, thanh điệu), **nghĩa tiếng Việt**, **pinyin**, **nhận mặt chữ Hán**
  (không tập viết); nguồn **HSK, bắt đầu HSK 1–2**; mọi phần học bộ thủ / chữ **chuyển hết sang từ vựng** — giữ trò,
  giữ hệ ôn, đổi nội dung.
- Loại: sửa hành vi + dữ liệu + giao diện (đổi trục sản phẩm) · Cỡ: **lớn** (≈ 28 nhiệm vụ, 6 giai đoạn) ·
  Trạng thái: **đã duyệt 2026-11-17**, đang làm (xem "Tiến độ" cuối file)
- Ràng buộc: offline (âm phát âm đóng gói hoặc tổng hợp offline), không backend, R-HUD-4 (chữ Hán chỉ ở nội dung học),
  thế giới mới bộ 2 đang chờ concept (phiếu ý tưởng `docs/y_tuong/2026-11-17-the-gioi-moi.md`, nhánh `viec/ten-map-moly`:
  mỗi vùng một chủ đề từ).

## 1. Kiểm kê — chỗ đang học Hán tự / bộ thủ → đổi thành gì

Dò bằng `impact.dart radicals lessons ghepChu review progress_store charDuel` (23 file khởi đầu, 35 tầng 1–2, 34 test)
+ grep "bộ thủ|radical" (≈ 50 file ngoài test).

| # | Chỗ | Hiện tại | Đổi thành |
|---|---|---|---|
| 1 | Dữ liệu bộ thủ `web/src/zones/radicals.ts` (326 dòng) | 50 bộ thủ Trúc Lâm (phồn thể), Hán Việt, pinyin, nghĩa, 3 chữ ví dụ, nét SVG "Từ hình đến chữ" | **Bỏ** sau khi chuyển xong (gđ 6). Thay bằng dữ liệu từ `zones/tuVung/` (từ + bài) |
| 2 | Sổ từ HSK `web/src/zones/sach/{hsk1,hsk2,word}.ts` | 303 từ HSK 2.0 cấp 1 (151) + 2 (152), **đã soạn** nghĩa Việt + câu ví dụ (giản thể), chỉ để đọc ở Tàng Thư Các | **Thành nguồn dữ liệu chung** của cả hệ học: thêm mã từ, thanh điệu từng âm tiết, chủ đề / bài, có âm hay không. Sổ Tàng Thư Các đọc cùng nguồn |
| 3 | Bài học chữ cũ `zones/zones.ts` `ZONE_CONTENT` (rỗng), `ui/learnButton.ts`, `ui/lessonBoard.ts`, cầu nối `openLesson`, `app/lib/lesson/lesson_screen.dart`, `Progress.chars` | Thẻ "Học chữ 快" ở nhà (đã bỏ khỏi trấn — R-VUNG-1), còn code + bảng HTML dự phòng | **Xoá** phần chết (gđ 6); bảng HTML dự phòng (không Flutter) dựng lại cho thẻ từ |
| 4 | Học bộ mới: thầy Trúc Lão `zones/trucLao.ts`, `trucLao.ts`, `main.ts`; R-HANH-3, R-HANH-8 | "Học bộ mới — bộ <tên>" → `openRadical` bộ chưa học đầu tiên trong 50 bộ | **"Học bài mới — <chủ đề>"** → mở **bài từ** (≈ 6 từ cùng chủ đề) chưa học đầu tiên theo giáo trình; "Ôn từ đến hạn (n)" |
| 5 | Thẻ học bộ thủ Flutter `app/lib/lesson/radical_screen.dart` (371), `svg_strokes.dart`; thiết kế "Thẻ học bộ thủ" | Bộ thủ to, dạng đủ, "Từ hình đến chữ", "Chữ có bộ này", nút "Đã lĩnh hội" | **Màn bài từ** (mới, **chờ thiết kế**): lần lượt từng từ — chữ to, pinyin có dấu thanh, nghĩa, **nút loa**, câu ví dụ + loa, "Nói theo" → cuối bài câu đố nhanh → "Đã lĩnh hội" |
| 6 | Hệ ôn Flutter `app/lib/journey/review.dart` (SRS 1·3·7·14·30·60·120, 180 đã thuộc) | Lịch theo mã bộ thủ, 2 câu / bộ | **Giữ nguyên thuật toán** (đã chung theo mã). Đổi khoá lưu sang từ, 2 câu / từ lấy từ các dạng câu hỏi mới |
| 7 | Câu đố ôn `web/src/zones/review.ts`; màn ôn `app/lib/lesson/review_{screen,parts,session}.dart`, `scene/review_event.dart`; R-ON-2 | Pinyin → Nghĩa, 3 phương án, nhiễu từ 50 bộ | **5 dạng câu** (mục 2.3), chọn theo bậc; nhiễu từ HSK 1–2. Dạng có chữ dùng được khung màn ôn hiện có; dạng **nghe** cần nút loa (chờ thiết kế) |
| 8 | Tiến độ `app/lib/journey/progress_store.dart` (`hanh-trinh.bo-thu`, `on-tap.lich`, `hanh-trinh.chu`), `journey.dart` (`rungTrucRadicalCount = 50`) | Bộ đã học + lịch ôn bộ thủ | Khoá mới `tu-vung.da-hoc`, `tu-vung.lich`, `tu-vung.bai`; khoá cũ **cất, không đọc** (quyết định 4) |
| 9 | Cầu nối `docs/bridge.md`, `web/src/bridge/flutterBridge.ts`, `app/lib/scene/scene_event.dart`: `openRadical`, `openReview`, `openDaily.forms`, `openLearned`, `getProgress.radicals/due/chars`, `openStudy` (đã thôi dùng) | Dạng dữ liệu bộ thủ | `openWordLesson {lesson, words, learned}`, `openReview {items: [{word, questions}]}`, `openDaily.words`, `openLearned {words}`, `getProgress.words/due/lessons`; **xoá** `openRadical`, `openStudy`, `openLesson` |
| 10 | Nhiệm vụ hằng ngày `app/lib/journey/daily.dart`, `lesson/daily_{screen,parts}.dart`, `zones/dailyBoard.ts`; R-NV-1/3 | Lĩnh hội 3 bộ mới / ngày; Ôn hết bộ đến hạn | **Lĩnh hội: 1 bài mới** (≈ 6 từ); Ôn: hết từ đến hạn. Chữ trên bảng đổi "bộ" → "từ / bài" |
| 11 | Cuộn Tĩnh toạ `zones/{studyMenu,cuonMuc}.ts`, `ui/cuonMucPaint.ts`, `lesson/learned_screen.dart`; R-ON-8 | Ô "Bộ đã học" (n / 50 bộ) → màn Bộ đã học → mở lại thẻ bộ | Ô **"Từ đã học"** (n / 303 từ) → danh sách từ đã học (theo bài), chạm → nghe + xem lại từ. Màn danh sách **chờ thiết kế** (đổi nội dung màn "Bộ đã học") |
| 12 | Đấu chữ `games/{charDuel,duelRound}.ts`, `gamePlay.ts`; R-DAU-1/2 | 10 câu bộ thủ đã học → 4 nghĩa ("mộc — cây") | 10 câu **từ đã học** → 4 nghĩa (hiện chữ; đáp xong hiện pinyin + phát âm). Biến thể "nghe chọn chữ" sau khi có nút loa. Tên "Đấu chữ" giữ |
| 13 | Lưu Thương Lệnh `games/{ghepChu,luuThuong,luuThuongRound}.ts`, `luuThuong.ts`, `ui/luuHud.ts`; R-LUU-1/3/5 | Ghép **bộ thủ** + phần còn lại thành chữ (phồn thể) | **Ghép từ**: hiện một chữ của từ 2 âm tiết đã học + ô trống + nghĩa + pinyin cả từ; 4 ô chữ (1 đúng + 3 nhiễu, không ô nào ghép thành từ HSK khác). Khung ghép trái – phải của HUD dùng lại; `ghepChu.ts` thay bằng `ghepTu.ts` |
| 14 | Măng chữ `zones/mang.ts` ↔ `app/lib/journey/mang.dart`, `haiMang.ts`, `ui/mangHud.ts`; R-MANG-4 | Măng to khắc bộ thủ đã học, "Bộ này nghĩa là gì?" | Măng to khắc **một từ đã học**, "Từ này nghĩa là gì?" (+ phát âm khi hiện đáp án). Măng to khắc mờ: từ 1–2 chữ ưu tiên |
| 15 | Thưởng `app/lib/journey/wallet.dart` ↔ `zones/walletRules.ts`; R-TIEN-2; thẻ xu `lesson/coin.dart` | +10 / bộ mới; ôn bộ +5 / +2; mặt sau xu khắc bộ vừa học | +10 / **bài** mới; ôn **+1 / từ** đúng 2/2 (tối đa 20 / ngày — số chờ chốt trong luật); xu khắc **chữ đầu** của từ vừa học / ôn |
| 16 | Tàng Thư Các `zones/{books,library}.ts`, `lesson/{book_screen,library_screen}.dart`; R-SACH-1…4 | Sổ từ 6 cuốn HSK, mỗi trang một từ, chỉ đọc | Giữ; **thêm nút loa** (từ + câu ví dụ) và dấu "đã học" trên trang (chờ thiết kế phần nút) |
| 17 | Thoại NPC: `zones/dialogs.ts` (Mặc Ông, Tiểu Mặc), `tranSu.ts` (R-NPC-5), `tinDon.ts`, `studyGuide.ts` (Khu tự học), `trucLamThoai.ts`, `gameGuides.ts` (cách chơi Đấu chữ / Lưu Thương / Hái măng) | Nhắc "bộ thủ", "học đủ bộ thủ thì … mở" (câu cũ sai từ khi bỏ khoá vùng) | Viết lại theo từ vựng: "học bài từ", "n từ đã học"; bỏ câu khoá vùng cũ |
| 18 | Đặc tả cảnh `scene/spec.ts` `lessons: { radicals }`, NPC `truc-lao` chú thích | Cờ "vùng có bài học bộ thủ" | Đổi thành `lessons: { words: boolean }` (mặc định giữ: chỉ Trúc Lâm bật). Thế giới mới: thêm `lessons.topics` (chủ đề của vùng) — chờ concept |
| 19 | Font: `scripts/subset-han.mjs` (quét `web/src/**/*.ts`), `fonts-app.mjs` | Cắt Noto Serif SC theo chữ trong code | Không đổi cách làm; chữ giản thể của 303 từ + câu ví dụ đã có trong sổ (đã được cắt). Theo dõi cỡ font sau khi xoá bộ thủ phồn thể |
| 20 | Thiết kế `design/docs/screen_specs.md`: Thẻ học bộ thủ, Màn ôn, Bộ đã học, Đấu chữ, Lưu Thương, Cách chơi, Ngồi ôn / Cuộn | Theo bộ thủ | Phiếu thiết kế mới `docs/phieu_thiet_ke/2026-11-17-hoc-tu-vung.md` (màn bài từ, nút loa, dạng câu nghe, nói theo, Từ đã học, loa ở sổ từ) |
| 21 | Mô tả sản phẩm: `CLAUDE.md`, skill `y-tuong` (mô tả "học chữ Hán"), skill `lead` Bản đồ tính năng (dòng "bài học (dữ liệu chữ Hán)", "cuộn… Bộ đã học"), `docs/tham_khao/rung-truc.md` "Bộ thủ trong cảnh" | "học chữ Hán", "bộ thủ" | Sửa mô tả (nháp ở mục 6); hồ sơ khảo cứu giữ làm tham khảo |
| 22 | Không đổi | Vườn Bia (bia khắc thơ — nội dung học, chữ Hán), Ngũ Tử Kỳ, vườn rau, đàn cầm, trà lâu, chat, bản đồ | — |

## 2. Thiết kế học từ vựng

### 2.1 Đơn vị học: **từ**
```ts
interface Tu {
  id: string;        // = chữ giản thể ('朋友'); trùng chữ khác âm (về sau, HSK 3+) thêm hậu tố '#2'
  han: string;       // giản thể (chuẩn thi HSK) — khác bộ thủ cũ (phồn thể)
  pinyin: string;    // dấu thanh, thanh gốc ('bú kèqi' giữ như sổ)
  thanh: number[];   // thanh từng âm tiết 1–4, 0 = nhẹ — sinh tự động từ pinyin, máy kiểm khớp số chữ
  meaning: string;   // nghĩa Việt
  example: { han; pinyin; meaning };
  cap: 1 | 2;        // HSK
  bai: string;       // mã bài
  am: boolean;       // có file âm từ (âm câu ví dụ: am.cau)
}
```
Số liệu sổ hiện có: 303 từ, không trùng chữ; 155 từ 1 chữ, 134 từ 2 chữ, 14 từ 3–5 chữ; 350 chữ khác nhau.

### 2.2 Bài học: nhóm 6 từ theo chủ đề
- 303 từ → **≈ 50 bài × 6 từ** (trùng số 50 bộ cũ — bảng nhiệm vụ, cuộn "n / tổng" giữ nhịp). Thứ tự: HSK 1 trước,
  trong cấp theo chủ đề dễ dùng: chào hỏi · số đếm · người & gia đình · thời gian · ăn uống · mua bán · nơi chốn &
  phương hướng · thời tiết · động từ hằng ngày · tính từ … (bảng bài soạn ở nhiệm vụ 3, người dùng duyệt).
- Mỗi bài gắn **chủ đề tiếng Việt** (tên bài hiện trên lựa chọn của thầy — không chữ Hán, R-HUD-4) để sau này phân về
  vùng thế giới mới: chợ đêm = mua bán / số / lượng từ; rừng nấm = thực vật / cơ thể; đáy biển = động vật / màu; đỉnh hạc
  = thời tiết / phương hướng; thành cát = đồ vật / nghề; Thung Trúc Gió Hát = luyện thanh điệu (HSK 1–2 không có đủ từ
  động vật biển / thực vật — các vùng đó sẽ cần từ HSK 3+ hoặc "từ chủ đề" ngoài HSK, ghi ở quyết định sau).
- Học một bài (màn bài từ): mỗi từ một trang **nghe → nhìn → nói theo** (loa tự phát 1 lần khi lật tới; chữ to, pinyin
  tô màu theo thanh, nghĩa, câu ví dụ có loa; nút "Nói theo": phát mẫu → 2 giây chờ người nói → phát lại mẫu) → cuối bài
  **6 câu nhanh** (mỗi từ 1 câu dạng a / b, không chấm lịch) → "Đã lĩnh hội" → cả 6 từ vào lịch ôn (bậc 1, hạn mai).

### 2.3 Dạng câu hỏi (3–4 phương án, chạm chọn như hiện tại)
| Mã | Câu | Thấy | Chọn | Luyện |
|---|---|---|---|---|
| a `chu-nghia` | Từ này nghĩa là gì? | chữ (không pinyin) | 4 nghĩa | mặt chữ + nghĩa |
| b `nghe-nghia` | Nghe — nghĩa là gì? | nút loa (tự phát) | 4 nghĩa | nghe |
| c `chu-pinyin` | Từ này đọc thế nào? | chữ | 4 pinyin — nhiễu **cùng âm khác thanh** trước (mā/má/mǎ/mà), rồi âm gần | thanh điệu |
| d `nghia-chu` | Chữ nào là "<nghĩa>"? | nghĩa Việt | 4 chữ | nhận mặt chữ |
| e `nghe-chu` | Nghe — chữ nào? | loa | 4 chữ | nghe + mặt chữ |
| f `noi-theo` | Nói theo | chữ + pinyin + loa | tự chấm "Giống rồi" / "Chưa giống" | nói — **không tính vào chấm lịch** |

- Ôn một từ = **2 câu** (giữ luật chấm R-ON-2: 2/2 lên bậc, 1/2 lùi, 0/2 về bậc 1): bậc 1–2 → {a, b}; bậc 3–4 → {c, d};
  bậc 5+ → {e, c}. Luôn có ít nhất 1 câu nghe khi máy có âm. Nhiễu: cùng cấp HSK, ưu tiên từ đã học, không trùng nghĩa
  (từ đồng nghĩa trong sổ như 爸爸 / 父亲 không cùng là phương án).
- **Nhận giọng nói offline**: không khả thi ổn định — Web Speech Recognition không có trong WebView (cả Android lẫn iOS
  WKWebView), `speech_to_text` của Flutter dùng dịch vụ máy (Android cần gói ngôn ngữ, nhiều máy gửi lên mạng) và không chấm
  thanh điệu. → dạng f "nghe và lặp lại, tự chấm" (quyết định 3). Hướng nâng cấp: dò cao độ giọng bằng micro (thuật toán
  YIN / tự tương quan, chạy offline) vẽ **đường thanh điệu** cạnh đường mẫu — gđ sau, cần quyền micro.

### 2.4 Lịch ôn
`ReviewCard` / `dueOrder` / `grade` của `review.dart` dùng lại nguyên (bậc 1·3·7·14·30·60·120, đã thuộc 180). Đổi: mã =
mã từ; thứ tự hỏi khi cùng bậc + cùng trễ → theo thứ tự giáo trình; số từ đến hạn có thể lớn (6 từ / ngày × 7 bậc) →
**một lượt ôn tối đa 20 từ**, còn lại để lượt sau trong ngày (luật mới R-ON-4, việc "Ôn tập" của bảng nhiệm vụ tính xong
khi hết từ đến hạn hoặc đã ôn 20 từ hôm nay — chốt trong sổ luật).

### 2.5 Tiến độ cũ (bộ thủ đã học)
Quyết định 4 — đề xuất **cất**: khoá `hanh-trinh.bo-thu`, `on-tap.lich`, `hanh-trinh.chu` để nguyên trong máy, không đọc
nữa; Văn tiền, nhà, vườn, chuỗi ngày giữ nguyên. Lịch ôn từ bắt đầu trống.

### 2.6 Nguồn dữ liệu HSK 1–2
| Bộ | Số từ | Có sẵn | Ghi chú |
|---|---|---|---|
| **HSK 2.0 cấp 1–2** (đề xuất) | 150 + 150 (sổ: 303) | **Đã soạn** nghĩa Việt + câu ví dụ (`zones/sach/hsk{1,2}.ts`) | Kỳ thi HSK 2.0 vẫn dùng song song; vừa cỡ cho bản thử, làm ngay được |
| HSK 3.0 cấp 1–2 (chuẩn GF 0025-2021) | 500 + 772 = 1272 | Phải soạn thêm ≈ 970 từ (nghĩa, câu, âm) | Chuẩn mới, hợp lâu dài; mã từ = chữ nên nối thêm sau không vỡ tiến độ |

Giấy phép: danh sách từ HSK là dữ kiện chuẩn thi công khai (sổ đã ghi "tự soạn, không chép giáo trình"). Nghĩa Việt + câu
ví dụ tự soạn → của dự án. **Không chép** từ điển có giấy phép chia-sẻ-như-nhau (CC-CEDICT CC BY-SA) vào dữ liệu; chỉ
dùng **để đối chiếu pinyin** trong công cụ kiểm (không phát hành). Kiểm pinyin: script so số âm tiết ↔ số chữ, dấu thanh
hợp lệ, cảnh báo chữ đa âm (了, 的, 地, 得, 行, 还, 长, 觉…).

## 3. Âm thanh phát âm — phương án + dung lượng

**Tìm hiểu khả năng TTS của máy:**
- **Android WebView không có `speechSynthesis`** (Web Speech API chỉ có ở Chrome, không có trong System WebView — kể cả
  Chromium 138); app Android chạy cảnh trong WebView → không dùng được.
- iOS WKWebView có `speechSynthesis`, giọng zh-CN có sẵn trong máy, chạy offline — nhưng chỉ một nửa nền tảng.
- `flutter_tts` (TTS của hệ điều hành): iOS offline tốt; Android phụ thuộc máy (Samsung / Xiaomi / Google TTS — giọng
  Trung có khi chưa tải, có máy gọi mạng) → **không bảo đảm offline**; giọng khác nhau giữa máy, từ đơn âm tiết hay sai thanh.

**Phương án (quyết định 2):**
| | Cách | Dung lượng | Chất lượng / rủi ro |
|---|---|---|---|
| **A (đề xuất)** | **File âm đóng gói sẵn**, sinh một lần trên máy người dùng bằng TTS mã nguồn mở chạy offline (ứng viên: Kokoro-82M giọng zh, MeloTTS-ZH, CosyVoice — giấy phép Apache-2.0 / MIT, **kiểm lại bản model lúc làm**), người dùng nghe duyệt từng từ (trang nghe thử), từ sai thanh thì sinh lại / ghép âm tiết | Từ: 303 × ~1 s, MP3 mono 32 kbps (~4–5 KB) ≈ **1,5 MB**; câu ví dụ 303 × ~2,5 s ≈ **3 MB** → tổng **≈ 4,5 MB** (HSK 3.0 cấp 1–2 sau này ≈ 6 MB từ + 12 MB câu) | Giống nhau mọi máy, offline chắc chắn, phát cả trong WebView (thẻ `<audio>` qua localhost server) lẫn màn Flutter (cùng file). Rủi ro: TTS đọc từ đơn sai thanh / đa âm → bước duyệt tai |
| B | TTS của máy (`flutter_tts`; iOS WebView `speechSynthesis`) | 0 MB | Android không bảo đảm offline; WebView Android không có — trò trong cảnh 3D (Đấu chữ, Lưu Thương, măng) phải gọi qua cầu nối |
| C | TTS mây trả phí (Azure / Google), sinh **một lần** lúc làm, đóng gói như A | như A | Giọng tốt nhất, chi phí nhỏ (vài trăm từ); cần tài khoản + đọc điều khoản dùng âm sinh ra (thường cho phép); app vẫn offline |

- Định dạng **MP3** (phát được trên Android WebView, iOS WKWebView, Flutter web, `audioplayers`); đặt nguồn duyệt ở
  `design/am/tu-vung/<mã>.mp3` (+ `LICENSES.md`), build chép sang `web/public/am/` → `app/assets/scene/am/` (file sinh).
  Màn Flutter phát cùng file trong `assets/scene/am/` (không chép đôi). Gói Flutter đề xuất: `audioplayers` (ghim bản) —
  vì sao: phát asset ngắn đơn giản, hỗ trợ Android / iOS / web, không cần phiên dịch vụ nền như `just_audio`.
- Bản người thật (Wikimedia Commons, Tatoeba): giấy phép lẫn lộn (CC BY-SA, mỗi file một người đọc), thiếu nhiều từ →
  không chọn.

## 4. Giai đoạn + nhiệm vụ

Trạng thái mỗi nhiệm vụ: **[làm ngay]** sau khi duyệt · **[chờ quyết định n]** · **[chờ thiết kế]** (phiếu
`2026-11-17-hoc-tu-vung`) · **[chờ concept]** (thế giới mới).

### Gđ 0 — Quyết định + luật
- [x] 1. Người dùng chốt 4 quyết định (mục 5). [làm ngay]
- [x] 2. Sửa sổ `docs/testing/quy_tac.md` theo danh sách luật (mục 4b), thêm họ **R-TU-*** → `/dong-bo-quy-tac` (subagent
  gửi ops JSON kèm ifRev). (docs · xong khi `rule_trace --pending` rỗng) [chờ quyết định 1–4]

### Gđ 1 — Dữ liệu (web/src/zones, thuần, vitest)
- [x] 3. `zones/tuVung/` (thư mục mới → bảng phụ thuộc decisions/0001 + `LAYERS` trong `tool/check.dart`): `tu.ts` (kiểu
  `Tu`, sinh từ `sach/hsk*.ts` — một nguồn), `thanh.ts` (pinyin → thanh từng âm tiết), `bai.ts` (≈ 50 bài × 6 từ, chủ đề
  Việt). Test: mọi từ thuộc đúng 1 bài, số âm tiết khớp số chữ (trừ 儿化 ghi rõ), không trùng mã. [chờ quyết định 1]
- [x] 4. Công cụ kiểm `web/scripts/check-tu.mjs` (`npm run tu:check`, gọi trong build): pinyin hợp lệ, cảnh báo đa âm,
  thiếu âm. [làm ngay sau 3]
- [x] 5. Câu hỏi `zones/tuVung/cauHoi.ts` (thay `zones/review.ts`): 5 dạng a–e, chọn dạng theo bậc, nhiễu (cùng âm khác
  thanh cho dạng c). Test bằng rng cố định. [chờ quyết định 1]

### Gđ 2 — Âm thanh
- [ ] 6. Script sinh âm `.claude/skills/tai-nguyen/scripts/am-tu.sh` (hoặc skill mới `/am`) chạy TTS trên máy người dùng →
  `design/am/tu-vung/` + `LICENSES.md`; trang nghe duyệt (Canvas 3D `?dang=am-tu`: danh sách từ, loa, đánh dấu sai).
  [chờ quyết định 2]
- [ ] 7. `npm run am` chép âm → `web/public/am/` (file sinh, thêm vào bảng CLAUDE.md); `web/src/ui/amTu.ts` phát âm trong
  trang (một `<audio>` dùng lại, mở khoá âm ở lần chạm đầu như `moSound.ts`); `app/lib/lesson/am_tu.dart` (`audioplayers`
  ghim bản). Luật R-AM-5 (phát âm từ). Đo cỡ app trước / sau. [chờ quyết định 2]

### Gđ 3 — Hệ học / ôn (Flutter + cầu nối)
- [x] 8. `docs/bridge.md`: `openWordLesson`, `openReview` (items `{word, questions}`), `openDaily.words`, `openLearned
  {words}`, `getProgress.words/lessons/due`; đánh dấu thôi dùng `openRadical`, `openStudy`, `openLesson`. Hai phía cùng
  lúc: `web/src/bridge/flutterBridge.ts`, `app/lib/scene/{scene_event,review_event}.dart`. [chờ quyết định 1]
- [x] 9. `progress_store.dart` + `journey.dart`: khoá `tu-vung.*`, `learnLesson(bài, từ)`, `reviewWord`, `dueWords` (trần
  20 / lượt), tổng số từ thay `rungTrucRadicalCount`; khoá cũ cất. Test `app/test/rules/{on_tap,hanh_trinh}_test.dart`.
  [chờ quyết định 1, 4]
- [x] 10. `daily.dart` + `zones/dailyBoard.ts`: Lĩnh hội = 1 bài / ngày; Ôn tập = hết từ đến hạn / đủ 20. Test
  `nhiem_vu_test.dart`, `dailyBoard.test.ts`. [chờ quyết định 1]
- [x] 11. Thưởng `wallet.dart` ↔ `walletRules.ts` (R-TIEN-2 mới). Test `tien_test.dart`, `walletRules.test.ts`. [chờ 2 luật]
- [x] 12. Thầy Trúc Lão `zones/trucLao.ts` + `trucLao.ts` + `main.ts`: "Học bài mới — <chủ đề>", "Ôn từ đến hạn (n)";
  `spec.ts` `lessons.words`. Test `trucLao.test.ts`. [chờ quyết định 1]

### Gđ 4 — Màn Flutter (bài học, ôn)
- [x] 13. Màn ôn: thay bộ thủ bằng từ cho dạng **a, c, d** (khung "Màn ôn câu đố" hiện có đủ — chữ to, câu hỏi, 3–4 phương
  án; chữ phương án dạng d là chữ Hán thay nghĩa). `review_{screen,parts,session}.dart`. Test `review_screen_test.dart`.
  [làm ngay sau 8–9]
- [x] 14. Soạn phiếu `docs/phieu_thiet_ke/2026-11-17-hoc-tu-vung.md` bằng `/ui-apply phieu`: màn bài từ (trang từ + câu
  nhanh cuối bài, dọc / ngang), nút loa (trạng thái: chờ, đang phát, không có âm), dạng câu nghe b / e, "Nói theo", màn
  "Từ đã học" (thay "Bộ đã học"), loa trên sổ từ, ô "Từ đã học" trên cuộn, pinyin tô màu thanh (token màu 4 thanh).
  [làm ngay]
- [ ] 15. Màn bài từ `app/lib/lesson/word_lesson_screen.dart` (thay `radical_screen.dart`). [chờ thiết kế]
- [ ] 16. Dạng câu nghe b / e + nút loa trong màn ôn. [chờ thiết kế, chờ quyết định 2]
- [ ] 17. "Nói theo" (dạng f) trong màn bài từ. [chờ thiết kế, chờ quyết định 3]
- [ ] 18. Màn "Từ đã học" (`learned_screen.dart`) + ô cuộn `zones/cuonMuc.ts` / `studyMenu.ts` / `ui/cuonMucPaint.ts`.
  [chờ thiết kế]
- [ ] 19. Sổ từ Tàng Thư Các: nút loa + dấu đã học (`book_screen.dart`). [chờ thiết kế, chờ quyết định 2]
- [ ] 20. Bảng HTML dự phòng (không Flutter — `npm run dev`): thẻ từ tối giản + màn ôn dạng a/c/d, thay `lessonBoard.ts`.
  [làm ngay sau 13]

### Gđ 5 — Các trò + thoại
- [x] 21. Đấu chữ `games/{charDuel,duelRound}.ts`, `gamePlay.ts`: từ đã học → 4 nghĩa; phát âm khi lộ đáp án (khi có âm).
  Test `charDuel.test.ts`, `duelRound.test.ts`. HUD hiện có đủ (ô nghĩa dài hơn — kiểm 360 px). [chờ quyết định 1]
- [x] 22. Lưu Thương ghép từ `games/ghepTu.ts` (thay `ghepChu.ts`), `luuThuong*.ts`, `ui/luuHud.ts` (chỉ đổi nội dung ô:
  chữ thay bộ, nhãn pinyin thay Hán Việt); điều kiện vào tiệc ≥ 6 từ 2 chữ đã học. Test `ghepTu.test.ts`,
  `luuThuong*.test.ts`. [chờ quyết định 1]
- [x] 23. Măng chữ `zones/mang.ts` ↔ `mang.dart`, `ui/mangHud.ts`, `scene/mangLam.ts` (khắc từ). Test `mang.test.ts`,
  `mang_test.dart`. [chờ quyết định 1]
- [x] 24. Thoại + cách chơi: `zones/{dialogs,tranSu,tinDon,studyGuide,trucLamThoai,gameGuides}.ts`. Test có sẵn của từng
  file. [làm ngay sau 2]

### Gđ 6 — Dọn + tài liệu
- [ ] 25. Xoá: `zones/radicals.ts`, `games/ghepChu.ts`, `zones/review.ts`, `radical_screen.dart`, `svg_strokes.dart`,
  `study_board.dart`, `study_screen.dart`, `study_parts.dart`, `lesson_screen.dart`, `ui/learnButton.ts`, `zones/zones.ts`
  phần `Lesson`, `Progress.chars`, sự kiện `openRadical` `openStudy` `openLesson` + test của chúng; chuỗi `radical*`
  `study*` trong `app_strings`. Kiểm cỡ font Hán sau khi bỏ chữ phồn thể. [sau 15, 18]
- [ ] 26. `CLAUDE.md` (mục 6), mô tả skill `y-tuong`, Bản đồ tính năng của `lead` (dòng bài học, cuộn, Lưu Thương, Tàng Thư
  Các), `docs/thiet_ke_da_ap.md`. [cuối]
- [ ] 27. Thế giới mới: bài theo chủ đề vùng (`lessons.topics` trong đặc tả vùng), mỗi vùng một người dạy; Thung Trúc Gió
  Hát = trò luyện thanh điệu (nghe chọn thanh 1–4). [chờ concept]
- [ ] 28. (Gđ sau, tuỳ chọn) Đường thanh điệu từ micro. [chờ quyết định 3]

**Đếm:** 28 nhiệm vụ — làm ngay sau duyệt: 1, 14 (+ 4, 13, 20, 24 ngay khi việc trước xong); chờ quyết định: 2, 3, 5–12,
21–23; chờ thiết kế: 15–19; chờ concept: 27; dọn / tài liệu: 25–26; tuỳ chọn: 28.

### 4b. Luật cần đổi (sổ `docs/testing/quy_tac.md`)
| Mã | Hướng |
|---|---|
| R-VUNG-1, R-VUNG-2, R-VUNG-3 | "bộ thủ mới / đã học" → "bài từ mới / từ đã học"; ví dụ "Học bài mới — Chào hỏi" |
| R-HUD-4 | Nội dung học ghi lại: thẻ / bài từ, màn ôn, Đấu chữ (từ + nghĩa), Lưu Thương (chữ ghép từ), măng chữ, sổ từ, xu khắc chữ đầu từ |
| R-HANH-1 | "chữ, bộ thủ đã học" → "từ đã học"; bỏ câu "một chữ tính là đã học từ lần đầu mở bài" (openLesson bỏ) |
| R-HANH-3 | Viết lại: học **bài** (≈ 6 từ, theo giáo trình) — trang từ → câu nhanh → "Đã lĩnh hội" → cả bài vào lịch ôn |
| R-HANH-8 | Lựa chọn thầy: "Học bài mới — <chủ đề>" · "Ôn từ đến hạn (n)" · hết giáo trình → thầy nói đã học hết |
| R-NV-1, R-NV-3 | Lĩnh hội = 1 bài / ngày; Ôn tập = hết từ đến hạn hoặc đủ 20 từ; chữ trên bảng |
| R-ON-1…5 | Lịch theo **từ**; R-ON-2 dạng câu theo bậc (mục 2.3), 3–4 phương án; R-ON-4 trần 20 từ / lượt, thứ tự theo giáo trình |
| R-ON-8, R-DIEU-7 | Ô "Bộ đã học" → "Từ đã học" (n / 303 từ) |
| R-DAU-1, R-DAU-2, R-GIAO-2 | Từ đã học → 4 nghĩa; viên báo "Chưa đúng — <pinyin> · <nghĩa>"; chưa học từ nào → lời Mặc Ông mới; bảng cách chơi |
| R-LUU-1, R-LUU-3, R-LUU-5 | Ghép từ 2 chữ; điều kiện ≥ 6 từ 2 chữ đã học; lời từ chối |
| R-MANG-4 | Măng to khắc từ đã học; "Từ này nghĩa là gì?" |
| R-SACH-3 | Thêm loa từ + câu ví dụ, dấu "đã học" |
| R-TIEN-2 | +10 / bài mới; ôn +1 / từ đúng 2/2 (tối đa 20 / ngày); xu khắc chữ đầu |
| R-NPC-5 | Trận sư nói "n từ đã học" |
| R-AM-5 (mới) | Phát âm từ: tự phát khi lật trang / câu nghe, loa phát lại, không âm → loa mờ; âm từ không phát chồng |
| R-TU-1…4 (mới) | Đơn vị từ + bài; dạng câu; "nói theo" tự chấm không vào lịch; nguồn + kiểm pinyin |

### Phạm vi (tóm theo lead)
**Sẽ sửa**: các file ở bảng kiểm kê 1–18 (web `zones/`, `games/`, `ui/`, ghép `trucLao.ts` `gamePlay.ts` `luuThuong.ts`
`haiMang.ts` `main.ts` vài dòng; Flutter `journey/`, `lesson/`, `scene/`), `docs/bridge.md`, sổ luật, CLAUDE.md.
**Cần kiểm tra**: `ngoiMat.ts` (cuộn), `libraryDesk.ts`, `ui/bagPanel.ts` (ngăn Lâm sản — măng to), `townNpcs.ts`,
`walletRoom.ts`, `trucLamHudPreview.ts` / `trucLamPreview.ts` / `designPreview.ts` (dữ liệu mẫu bộ thủ), font
`subset-han` / `fonts-app`. **Không đụng**: cảnh 3D (trừ khắc măng), vườn, nhà, chat, bản đồ, hạc, Ngũ Tử Kỳ, đàn cầm.

Ước lượng: dữ liệu + luật ≈ 1 phiên; âm ≈ 1 phiên + thời gian người dùng nghe duyệt (303 từ ~ 30 phút); hệ học / ôn +
cầu nối ≈ 1–2 phiên; trò ≈ 1 phiên (3 việc song song được: 21, 22, 23); màn Flutter sau thiết kế ≈ 1–2 phiên; dọn ≈ 0,5.
Hiệu năng: không thêm mesh / đèn; cỡ app +≈ 4,5 MB (âm), font có thể nhỏ đi.

## 5. Điểm cần người dùng quyết định

1. **Bộ từ** — (A) **HSK 2.0 cấp 1–2, 303 từ, đã soạn sẵn** nghĩa Việt + câu ví dụ; (B) HSK 3.0 cấp 1–2, 1272 từ (chuẩn
   mới, phải soạn thêm ≈ 970 từ); (C) A trước, nối HSK 3.0 sau. **Đề xuất C** (làm ngay được, mã từ = chữ nên nối thêm
   không mất tiến độ).
2. **Âm thanh** — (A) **file MP3 đóng gói, sinh bằng TTS mã nguồn mở chạy trên máy anh/chị, nghe duyệt** (~4,5 MB);
   (B) TTS của máy (0 MB, Android không chắc offline, WebView Android không có); (C) TTS mây trả phí sinh một lần rồi đóng
   gói. **Đề xuất A** (C nếu giọng mã nguồn mở nghe chưa đạt).
3. **Phần "nói"** — (A) **nghe và lặp lại, tự chấm** (không micro); (B) ghi âm giọng mình rồi nghe so với mẫu (cần quyền
   micro, không chấm); (C) dò cao độ từ micro vẽ đường thanh điệu so với mẫu (chấm gần đúng thanh). **Đề xuất A ngay,
   C ở giai đoạn sau** (nhận dạng giọng nói offline không đáng tin — bỏ).
4. **Tiến độ bộ thủ cũ** — (A) **cất**, bắt đầu học từ từ đầu (Văn tiền, nhà, vườn, chuỗi ngày giữ); (B) quy bộ trùng
   với từ HSK (水, 人, 月, 山, 日, 雨…) thành từ đã học; (C) quy số bộ đã học ra Văn tiền. **Đề xuất A** (app đang thử
   nghiệm, ánh xạ bộ ↔ từ không khớp nghĩa học).

Giả định (không hỏi, ghi lại): nội dung học dùng **giản thể** (chuẩn thi HSK; chữ phồn thể chỉ còn ở bia thơ / trang trí
có sẵn); tới khi thế giới mới chốt, **Trúc Lão dạy toàn bộ giáo trình** theo thứ tự; tên "Đấu chữ", "Lưu Thương Lệnh",
"Măng chữ" giữ.

## 6. Nháp sửa mô tả sản phẩm trong CLAUDE.md (chưa áp)

> App mobile thử nghiệm: một thế giới cổ trang low-poly 3D (kiểu 摩尔庄园) để **học từ vựng tiếng Trung** (HSK, bắt đầu
> HSK 1–2): mỗi từ người học **nghe + nói theo** (âm, thanh điệu), biết **nghĩa tiếng Việt**, **pinyin** và **nhận mặt
> chữ Hán** (không tập viết). Người chơi đi trong trấn / các vùng, học bài từ với thầy, ôn theo lịch, chơi trò ôn từ
> (Đấu chữ, Lưu Thương, măng chữ). Âm phát âm đóng gói sẵn (offline).

Kèm: dòng 9 "Quy tắc khi viết code" — "chữ Hán chỉ ở nội dung học (bài từ, ôn, Đấu chữ, sổ từ)"; bảng "File sinh" thêm
`web/public/am/**` (`npm run am`); "Nguồn sự thật" thêm `design/am/tu-vung/` (âm đã duyệt).

## Kiểm tra cuối
dart tool/check.dart --changed · cd web && npx tsc --noEmit && npm test && npm run build · cd app && flutter analyze ·
flutter test -r failures-only test/rules test/lesson test/journey · dart tool/rule_trace.dart · thử máy Android tầm trung:
phát âm trong WebView + màn Flutter khi tắt mạng.

## Tiến độ (2026-11-17, phiên làm việc)

- Xong: gđ 0 (luật R-TU-1…5, R-AM-5 + 39 luật đổi, đã đồng bộ online), NV14 (phiếu `docs/phieu_thiet_ke/2026-11-17-hoc-tu-vung.md`),
  gđ 1 (`web/src/zones/tuVung/` + `npm run tu:check` trong build, `npm run tu:am-list`), gđ 3 (cầu nối `openWordLesson`,
  `getProgress.lessons/words/dueSteps`, khoá `tu-vung.*`, nhiệm vụ 1 bài + trần 20, thưởng +10 / bài, +1 / từ ≤ 20 / ngày,
  Trúc Lão), NV13 (màn ôn dạng a / c / d bằng khung cũ), gđ 5 (Đấu chữ, Lưu Thương ghép từ `games/ghepTu.ts`, măng chữ, thoại).
- Đã dọn sớm (phần của NV25): `zones/radicals.ts`, `zones/review.ts`, `games/ghepChu.ts`, `radical_screen.dart`, `svg_strokes.dart`,
  `study_board/screen/parts.dart`, sự kiện `openRadical`, `openStudy` (+ test). Còn: `openLesson` / `LearnButton` / `lesson_screen.dart`.
- **Thực tế 304 từ** (HSK 1 có 152 từ — sổ có 女儿), không phải 303; luật / phiếu đã sửa.
- Tạm (chờ thiết kế, phiếu NV14): `word_lesson_screen.dart` dùng khung thẻ bộ thủ cũ (lật từng từ + "Đã lĩnh hội", chưa câu nhanh,
  loa, Nói theo); màn Từ đã học dùng khung Bộ đã học; câu nghe b / e chưa có giao diện (không phát sinh khi chưa có âm).
- Gđ 2 chỉ chuẩn bị: quy cách file + tên tệp mã điểm (`zones/tuVung/am.ts`), danh sách đọc `npm run tu:am-list` (608 dòng: từ + câu),
  `web/src/ui/amTu.ts` (phát khi có âm, im khi chưa có — gắn ở Đấu chữ / măng chữ). Phía Flutter chưa có (cần gói `audioplayers` —
  hỏi người dùng khi làm gđ 2).
- Giữ khoá đặc tả `lessons.radicals` (đặc tả `design/scene/*.json` chưa đổi — đổi tên khi /canh chốt thế giới mới).
