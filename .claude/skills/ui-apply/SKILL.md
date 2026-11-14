---
name: ui-apply
description: Áp thiết kế từ canvas (đã chốt vào design/) vào code Học Xá 3D, kiểm màn có lệch thiết kế không, và soạn phiếu yêu cầu thiết kế cho giao diện chưa có. Dùng khi người dùng gõ /ui-apply, VÀ khi nói thường "thiết kế vừa cập nhật", "áp thiết kế mới", "màn này lệch thiết kế", "cần vẽ màn …".
argument-hint: "[tiep | <mã mục> | kiem <Màn> | phieu <yêu cầu>]"
---

# /ui-apply — áp thiết kế vào code (phiên VS Code)

Tham số: $ARGUMENTS

| Lệnh | Làm gì |
|---|---|
| `/ui-apply` | Lấy bản mới → chia loại các mục chưa áp → kế hoạch → làm. Không có mục mới thì liệt kê phiếu đang chờ. |
| `/ui-apply tiep` | Làm tiếp từ mục sau tiến độ (phiên trước dừng giữa chừng). |
| `/ui-apply <mã>` | Chỉ áp một mục, vd. `/ui-apply 2026-11-12.1`. |
| `/ui-apply kiem <Màn>` | So màn trong code với thiết kế — chỉ báo, không sửa. Màn chưa có trong `design/docs/screen_specs.md` → báo "chưa có trên canvas, theo code". |
| `/ui-apply phieu <yêu cầu>` | Soạn phiếu yêu cầu thiết kế, không sửa code. |

## Vai

Hai vai: **thiết kế** (`/ui-design` giao diện 2D trên canvas, `/canh` cảnh 3D trong `scene.json`, `/tai-nguyen` model
`.glb`) ghi `design/`; `/ui-apply` (VS Code) **chỉ đọc** `design/` và sửa code. Không sửa `design/` hay canvas trong
lúc `/ui-apply` — cần đổi thiết kế thì chuyển sang skill thiết kế tương ứng.

## Đường dẫn

| Thứ | Ở đâu |
|---|---|
| canvas | https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1 |
| nhật ký thiết kế (mục `## <mã> — …`) | `design/CHANGELOG.md` |
| tiến độ (mục cuối đã áp) | `docs/thiet_ke_da_ap.md` → `appliedVersion` |
| đặc tả màn / thành phần | `design/docs/screen_specs.md` (đọc đúng mục `## <Màn>`), `design/docs/components.md` |
| token | `design/tokens/design_tokens.json` (mỗi token có `code` = chỗ trong code) |
| ảnh màn | `design/screens/<Màn>-doc.png`, `-ngang.png` |
| bản canvas (HTML, số đo chính xác) | `design/source/<Tên>.dc.html` |
| đặc tả cảnh 3D (code đọc thẳng lúc build) | `design/scene/scene.json` → `web/src/scene/spec.ts`, `loadSpec.ts` |
| chuỗi mới | `design/l10n/vi.arb` |
| phiếu | `docs/phieu_thiet_ke/<ngày>-<tên>.md` |
| code giao diện | web: `web/index.html`, `web/src/style.css`, `web/src/ui/`; Flutter: `app/lib/` (màn), `app/lib/theme/app_colors.dart` (màu) |

## Quy trình

1. **Lấy bản mới.** `git status` sạch phần code → `git pull`. Mục cần làm = mục trong `design/CHANGELOG.md` mới hơn
   `appliedVersion`. Xem file đổi thật: `git log --oneline -- design/` và `git show --stat <commit>`.
2. **Chia loại** từng mục: token / chuỗi · giao diện · luồng/luật · dữ liệu · cảnh 3D. Khoanh file bằng
   `dart .claude/skills/lead/scripts/impact.dart <tên màn / thành phần>`.
   - token: tìm theo `code` trong `design_tokens.json`, đổi đúng chỗ đó (CSS biến ở `:root` / `AppColors`).
   - chuỗi: chữ viết thẳng trong `web/index.html`, `web/src/ui/`, `web/src/zones/zones.ts`, widget Flutter (chưa có l10n).
   - cảnh 3D: **không chép, không sửa số trong code** — code đọc thẳng `design/scene/scene.json`. Việc của phiên
     này là cửa kiểm: `cd web && npm run scene:check` (lỗi → gửi lại thiết kế, không build) rồi so với mục
     CHANGELOG. **Ngoại hình** (màu, ánh sáng, sương, trời, camera, cây ngoài tường) → `npm run build` luôn.
     **Bố cục** (nhà, tường, cây trong sân, giếng, vùng, điểm xuất phát) → coi như luồng/luật: đối chiếu ví dụ của
     `R-VA-1`, `R-VUNG-1` với toạ độ `scene:check` in ra; ví dụ sai số → sửa sổ theo bước 3. Mục "Cần code" (kiểu
     vật / trường đặc tả mới) → kế hoạch `/lead`: thêm trường vào `SceneSpec` + `DEFAULT_SCENE` (giữ cảnh cũ),
     dựng trong `web/src/scene/`, rồi mới build. Vùng mới cần nội dung bài học → thêm vào `ZONE_CONTENT`.
   - model `.glb` mới trong `design/models/` (từ `/tai-nguyen`): nhân vật `nhan-vat.glb` → `npm run build` là đủ;
     công trình → kế hoạch `/lead` (chưa có code đặt vào cảnh).
3. **Đối chiếu sổ quy tắc** `docs/testing/quy_tac.md` với mục luồng/luật: khớp → làm; thiết kế đổi luật chưa có
   trong sổ → hỏi người dùng, chốt thì sửa sổ trước → skill `/dong-bo-quy-tac` (tự chép lên tài liệu online)
   → test đỏ → code. Thiết kế **trái** luật đã
   chốt → không làm theo thiết kế; ghi vào `docs/testing/gui_thiet_ke_<ngày>.md` (mã luật, thiết kế vẽ gì, luật nói
   gì), cột App của luật ghi `tk`.
4. **Đối chiếu sổ lỗi** `docs/loi.md`: mục chạm màn có lỗi đang mở → báo cùng kế hoạch. Áp xong sinh lỗi mới → `/loi`.
5. **Duyệt.** Chỉ token / chuỗi, hoặc giao diện nhỏ (≤ 2 file, không màn mới) → làm luôn. Có luồng/luật, dữ liệu, màn
   mới, trái luật → trình bảng `mã · loại · file · cần quyết định`, chờ duyệt. Mục lớn → kế hoạch `docs/tasks/` như `/lead`.
6. **Áp từng mục** trong worktree (CLAUDE.md "Làm song song": `EnterWorktree` + `dart tool/viec.dart chuan-bi`; xong →
   commit, `viec.dart gop`, ExitWorktree "keep", `viec.dart don <tên>`), cũ → mới: đọc đúng mục đặc tả + ảnh + artboard của màn (không đọc cả file), sửa theo skill
   `hoc-xa-3d-dev`, kiểm cả màn dọc lẫn ngang và safe area. Nguồn thiết kế mâu thuẫn nhau → tin nguồn gần code
   nhất (`source/*.dc.html` / số đo > ảnh), ghi vào báo cáo. Kiểm: `dart tool/check.dart --changed`,
   `cd web && npx tsc --noEmit && npm run build`, `cd app && flutter analyze && flutter test -r failures-only test/<phần>`.
   **Ghi tiến độ ngay** (`appliedVersion: <mã>`), rồi mới sang mục kế.
   Mục đáp đúng một phiếu → phiếu `đã áp (<mã>)`, mở lại kế hoạch `/lead` hoặc lỗi `/loi` đang đợi phiếu đó.
7. **Báo**: mục đã áp, mục gửi lại thiết kế, việc chờ quyết định, danh sách màn cần **xem trên máy** (dọc + ngang)
   để so với ảnh.

## Thiết kế trước, code sau

Giao diện **mới** mà canvas chưa có → **không dựng tạm trong code**. Soạn phiếu
`docs/phieu_thiet_ke/<YYYY-MM-DD>-<ten-khong-dau>.md`:

```markdown
# Phiếu: <màn / thành phần>
- Trạng thái: chờ thiết kế   (→ đã áp (<mã>) · bỏ (<lý do>))
- Đợi bởi: <kế hoạch docs/tasks/… | L-… | không>

## Dán vào canvas
<khối dưới, chép nguyên sang phiên thiết kế>
```

Khối **"Dán vào canvas"**: màn / widget · cần gì (mục đích, mở khi / đóng khi) · các trạng thái phải vẽ (luôn có
dọc 390×844 + ngang 844×390; rỗng / dài / lỗi nếu có) · luật `R-…` phải theo (chép nguyên văn) · chuỗi có sẵn /
chuỗi mới cần đặt · thứ dùng lại được (`design/docs/components.md`, token) · gợi ý (không bắt buộc) · app đang có gì
(đường dẫn + mô tả ngắn). Phiếu nói **cần gì**, không vẽ hộ. Báo lại nguyên khối đó trong một khối code để người
dùng chép sang phiên thiết kế. Phần việc không dính giao diện → hỏi làm trước hay đợi.
