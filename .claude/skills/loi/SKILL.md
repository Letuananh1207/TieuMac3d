---
name: loi
description: Sổ lỗi Học Xá 3D (docs/loi.md) — ghi lỗi, tái hiện bằng test đỏ, sửa, chờ thử máy. Dùng khi người dùng gõ /loi, VÀ cả khi người dùng báo lỗi bằng lời thường mà không gõ lệnh ("bị lỗi", "không chạy", "sai", "kẹt", "đơ", "văng", "màn trắng", "nhân vật đi xuyên tường"…).
argument-hint: "[<mô tả lỗi> | sua [L-…] | xong L-… | mo L-…]"
---

# /loi — báo lỗi → test đỏ → sửa → thử máy

Tham số: $ARGUMENTS

| Lệnh | Làm gì |
|---|---|
| `/loi` | Liệt kê lỗi chưa `xong` trong `docs/loi.md`, xếp theo mức độ (chặn dùng → khó chịu → nhỏ) rồi theo mã. Không sửa gì. |
| `/loi <mô tả>` | Ghi lỗi, không sửa. |
| `/loi sua [L-…]` | Sửa lỗi đó; không mã thì lấy lỗi đầu danh sách mở. |
| `/loi xong L-…` | Người dùng thử máy đạt → `xong`, chuyển xuống **Đã xong**. |
| `/loi mo L-…` | Thử máy vẫn lỗi → về `mới`, chuyển lên **Đang mở**, ghi lần thử vào **Lịch sử**. |

Người dùng báo lỗi mà không gõ `/loi` → hỏi một câu "ghi rồi sửa luôn, hay chỉ ghi?", rồi làm tiếp.

## Ghi lỗi

1. **Kiểm trùng** trong `docs/loi.md`: đang mở → thêm vào **Lịch sử** của mục đó; đã `xong` → mở lại (tái phát).
   Không tạo mã mới.
2. **Cần đủ 4 thứ**, thiếu thì hỏi **một lần** (tối đa 3 câu, không đoán): hiện tượng (giữ nguyên văn) · các bước ·
   mong đợi / thực tế · bằng chứng (ảnh, quay màn, log `chrome://inspect`; không có → "chưa có"). Câu hỏi riêng
   của dự án khi liên quan:
   - chạy ở đâu: máy Android thật (hãng, đời, Android mấy) / trình duyệt (`npm run dev`) / máy ảo?
   - bản build mới chưa: đã `npm run build` sau lần sửa web cuối chưa? (app chạy bản trong `app/assets/scene/`)
   - lỗi điều khiển: một ngón hay hai ngón, nửa trái hay nửa phải màn, màn dọc hay ngang?
3. **Tự điền**, không hỏi: **Phần** (theo Bản đồ tính năng trong `.claude/skills/lead/SKILL.md`), **Quy tắc** `R-…`
   liên quan (tra `docs/testing/quy_tac.md`), **Mức độ** + lý do một dòng (nghĩa từng mức ở đầu `docs/loi.md`).
4. Ghi vào **Đang mở** theo mẫu, trạng thái `mới`. Không đọc code sâu, không sửa. Báo: mã, tóm tắt, mức độ.

## Sửa lỗi (trạng thái `đang sửa`, ghi kết quả từng bước vào mục **Sửa**)

1. **Nguyên nhân**: khoanh file bằng `dart .claude/skills/lead/scripts/impact.dart <từ khoá>`, đọc đúng đoạn cần,
   ghi bằng lời thường. Nguyên nhân ở `app/assets/scene/` (bản build cũ) → chạy `cd web && npm run build`, không sửa
   tay. Hành vi đúng có sẵn trong prototype → đối chiếu `reference/hoc-xa-3d.html` (đọc đúng đoạn).
2. **Hành vi đúng** theo quy tắc `R-…`. Quy tắc thiếu / sai, hoặc phải chọn giữa nhiều cách → dừng, trình lựa chọn
   (đề xuất một), chờ người dùng. Đổi hành vi nghiệp vụ → sửa `docs/testing/quy_tac.md` trước → skill
   `/dong-bo-quy-tac` (tự chép lên tài liệu online, không nhờ người dùng).
3. **Tái hiện bằng test đỏ**, tầng rẻ nhất mà đúng với lỗi:

   | Tầng | Có | Khi nào |
   |---|---|---|
   | `flutter_test` trong `app/test/` (test quy tắc ở `app/test/rules/`) | có | lỗi phía Flutter |
   | test TS `web/src/<lớp>/<tên>.test.ts` (`cd web && npm test`, vitest) | có | logic thuần: `collision/`, `zones/zoneTracker.ts`, `player/controller.ts`, `input/orbitCamera.ts` |
   | chụp headless (`references/testing.md` của `hoc-xa-3d-dev`) | có | cảnh dựng sai / không hiện, HUD lệch |
   | thử tay `npm run dev` / máy thật | có | cảm ứng, WebView, hiệu năng |

   Tên test: `'R-VUNG-2 (L-3): …'`, chưa có quy tắc thì `'(L-3): …'`. Test phải đỏ đúng như hiện tượng.
   Không dựng được (cảm ứng thật, GPU, WebView) → ghi lý do, báo rõ **"chưa khoá được bằng test"**.
   Nguyên nhân là thiết kế mới chưa áp (có mục trong `design/CHANGELOG.md` mới hơn `docs/thiet_ke_da_ap.md`) →
   chuyển `/ui-apply`. Cách sửa phải đổi giao diện mà canvas chưa vẽ → soạn phiếu (`/ui-apply phieu`), trạng thái
   lỗi `chờ thiết kế (<phiếu>)`, không dựng tạm.
4. **Sửa code** theo skill `hoc-xa-3d-dev`, nhỏ nhất đủ làm test xanh. Việc lớn (≥ 3 file ngoài phần lỗi, đổi giao
   diện, đổi cầu nối `docs/bridge.md`) → chuyển `/lead`, ghi tên kế hoạch vào mục lỗi.
5. **Kiểm**: `dart tool/check.dart --changed` · web: `cd web && npx tsc --noEmit && npm run build` · app:
   `cd app && flutter analyze && flutter test -r failures-only test/<phần>` · `dart tool/rule_trace.dart`.
6. Trạng thái `chờ thử máy`, hoặc `xong` nếu test kiểm trọn lỗi (không dính thứ chỉ máy thật mới thấy). Ghi
   **Thử máy**: các bước ngắn nhất để xác nhận + thứ cần gửi nếu còn lỗi (ảnh, log `chrome://inspect`).
7. Báo: nguyên nhân, đã sửa gì, test nào khoá, các bước thử máy.

**Làm song song** (CLAUDE.md): `/loi sua` sửa code trong worktree — đầu bước 1 `EnterWorktree` + `dart tool/viec.dart
chuan-bi`; xong bước 6 commit `fix: … (L-…)` trên nhánh việc → `viec.dart gop` → ExitWorktree "keep" → `viec.dart don
<tên>`. Ghi lỗi mới (`/loi <mô tả>`) làm ở thư mục chính; đang trong worktree thì mã tạm `L-?1`. Push chỉ khi được bảo.

## Mẫu một mục lỗi

```markdown
### L-<số> · <tóm tắt một dòng>

- Trạng thái: mới · Mức độ: <mức> (<lý do>) · Phần: <phần> · Quy tắc: <R-… | chưa có>
- Báo: <ngày> — "<nguyên văn người dùng>"
- Các bước: 1. … 2. …
- Mong đợi / thực tế: … / …
- Bằng chứng: <ảnh / log / máy / chưa có>

**Sửa**
- Nguyên nhân: …
- Test: `app/test/…` hoặc `web/src/…` — `'R-… (L-<số>): …'`
- Code: `web/src/…` / `app/lib/…`
- Thử máy: …
- Commit: …

**Lịch sử**
- <ngày>: …
```
