# Tạo ảnh Gemini tự động (`gemini-anh.sh`) — V-20261116-98

Phiên Claude (VS Code hay thiết kế) tự chạy Gemini thay người dùng cho mọi **phiếu ảnh**: bộ ảnh 4 góc cho model Tripo
(`*-anh-*.md`), ảnh concept bối cảnh (`*-concept-*.md`), hình minh hoạ (`design/icons/`). Người dùng chỉ **chọn bản**.

- Thư viện: [`gemini_webapi`](https://github.com/HanaokaYuzu/Gemini-API) 2.1.1 (AGPL-3.0) — **không chính thức**, gọi web
  gemini.google.com bằng cookie tài khoản **Gemini Pro** của người dùng. Người dùng đã chọn và đã biết rủi ro (2026-11-16):
  Google có thể chặn / khoá tài khoản, thư viện hỏng khi Google đổi web. Hỏng → báo người dùng, quay về chạy Gemini tay.
- Python riêng ngoài repo: `C:/ai3d/gemini/venv` (gói ghim: `scripts/gemini-requirements.txt`). **Mỗi máy mới** (sau
  `git pull`): cần Python ≥ 3.10 (script tự tìm `py -3.11` → `py -3` → `python3` → `python`; venv Windows hay macOS / Linux
  đều được) → `bash .claude/skills/ui-design/scripts/gemini-anh.sh cai` → đặt cookie (dưới) → `kiem`. Đổi chỗ để:
  `GEMINI_GOC=<thư mục>`; ép Python: `GEMINI_PY=<đường dẫn python>`.
- Ảnh nháp: `C:/ai3d/gemini/ra/<tên>/<góc>-<n>.png` + `tao.json` (câu lệnh, tham chiếu, bản chọn). Không vào repo.

## Cookie (người dùng làm, một lần — lặp lại khi hết hạn)

1. Chrome → https://gemini.google.com, đăng nhập đúng tài khoản Pro.
2. F12 → **Application** → **Storage → Cookies** → `https://gemini.google.com` (không thấy thì `https://www.google.com`);
   ô lọc gõ `__Secure-1PSID`.
3. Chép **Value** của hai dòng `__Secure-1PSID` và `__Secure-1PSIDTS`.
4. Tạo `C:\ai3d\gemini\cookie.json` (**ngoài repo**):
   `{"__Secure-1PSID": "<giá trị>", "__Secure-1PSIDTS": "<giá trị>"}`
   (file xuất từ tiện ích kiểu Cookie-Editor dạng `[{"name": …, "value": …}]` cũng đọc được; hoặc biến môi trường
   `GEMINI_PSID` / `GEMINI_PSIDTS`; file khác: `GEMINI_COOKIE_FILE`).
5. `bash .claude/skills/ui-design/scripts/gemini-anh.sh kiem` → "Cookie dùng được" + danh sách model.

Thư viện tự làm mới `__Secure-1PSIDTS` và lưu ở `C:/ai3d/gemini/cache/`. Đăng xuất Gemini trên trình duyệt / đổi mật khẩu làm
cookie mất hiệu lực. **Claude không tự đọc cookie trình duyệt, không in, không chép cookie vào repo / chat**; lỗi cookie
(mã thoát 3) → chuyển nguyên hướng dẫn script in ra cho người dùng.

## Khối câu lệnh trong phiếu (chuẩn từ 2026-11-16)

Mục `## Câu lệnh Gemini` trong phiếu, **ngoài** khối ```` ```text ```` "Dán vào canvas" (khối lồng nhau vỡ). Câu lệnh viết
tiếng Anh (Gemini làm ảnh tốt hơn), mỗi góc một khối, đủ ý để tạo **riêng** từng ảnh:

````text
```gemini-cau-hinh
ten: su-phu                 # tên file (mặc định: tên phiếu bỏ ngày + "anh-"/"concept-")
loai: nhan-vat              # nhan-vat | cong-trinh | concept | hinh (mặc định theo tên phiếu: concept-* → concept, còn lại nhan-vat)
tham-chieu: design/models/anh/nhan-vat-truoc.png   # ảnh gửi kèm MỌI góc (giữ chất liệu / tỉ lệ)
mau: truoc                  # góc làm mẫu: tạo trước, bản chọn gửi kèm các góc sau (mặc định góc đầu; "khong" = tắt)
rieng: mat                  # góc chuẩn hoá riêng (cận mặt) — mặc định "mat"
day: 75                     # công trình: đáy vật ở 75 % chiều cao; ngang: 84 (bề ngang lớn nhất 84 %)
nen: #DDDDDD                # màu nền khi chuẩn hoá
```

```gemini chung
<đoạn chung ghép trước mọi góc: nhân vật / vật là gì, kiểu render, màu hex, nền trơn, không chữ, khung 1:1 …>
```

```gemini truoc
FRONT view, straight on, orthographic …
```

```gemini trai
tham-chieu: design/screens/Nha-ta-khoi-trai.png    # (tuỳ) ảnh kèm riêng góc này — dòng đầu khối
mau: truoc                                          # (tuỳ) đổi góc mẫu cho riêng góc này / "khong"
LEFT side view: the character's left side faces the camera, face pointing to the LEFT of the image …
```
````

Script tự thêm sau câu lệnh: câu "ảnh kèm là cùng vật ở góc khác — giữ y thiết kế" (khi có ảnh mẫu) và "Generate exactly ONE
image now…". Hình minh hoạ (`loai: hinh`): mỗi khối là một **mã hình** (`ban-do`, `gieo`…), không gửi ảnh mẫu giữa các hình —
dùng `tham-chieu:` trong cấu hình để giữ phong cách. Phiếu cũ chưa có khối → `doc` / `tao` báo lỗi: soạn thêm mục này từ phần
"Dán vào canvas" (giữ nguyên yêu cầu kỹ thuật).

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `gemini-anh.sh doc <phiếu>` | đọc phiếu, in câu lệnh từng góc (không mạng) |
| `gemini-anh.sh tao <phiếu> [--ban 3] [--goc truoc,trai] [--mau truoc=2] [--thu]` | mỗi góc N bản; góc mẫu tạo trước, góc sau gửi kèm bản `--mau` (hoặc bản đã chọn / bản 1); chạy lại → đánh số tiếp, không ghi đè. `--thu`: chỉ in kế hoạch. `--nghi 20` giây giữa hai lần gọi; `--mo-hinh <tên>` (xem `kiem`) |
| `gemini-anh.sh so <tên>` | trang so sánh góc × bản → `C:/ai3d/gemini/ra/<tên>/so.png` (nhãn `góc=số`) |
| `gemini-anh.sh chot <tên> truoc=2,trai=1,sau=3,phai=lat-trai` | chép + chuẩn hoá vào `design/` (dưới); `lat-<góc>` = lật ngang bản đã chọn của góc kia |
| `gemini-anh.sh sua <tên> <góc> "<lời sửa>" [--tu 2] [--ban 2]` | gửi bản đang chọn (hoặc `--tu`) + lời sửa → bản mới cùng góc |
| `gemini-anh.sh kiem` | thử cookie, in trạng thái tài khoản + model |
| `gemini-anh.sh test` | test không mạng (đọc phiếu, so sánh, chốt + chuẩn hoá ảnh giả) |

Lỗi: mạng / timeout / Gemini trả chữ không ảnh → tự thử lại 4 lần (nghỉ tăng dần); 429 tạm chặn → nghỉ 2, 4, 6 phút; hết lượt
gói (`UsageLimitExceeded`) → dừng, ảnh đã tạo giữ nguyên; cookie → mã 3 + hướng dẫn. Đừng chạy song song hai `tao` cùng
tài khoản (dễ bị chặn); mỗi bộ 4 góc × 3 bản ≈ 12 lần gọi, ~1 phút / lần.

## Chốt — đi đâu, chuẩn hoá gì

| loai | Ra | Chuẩn hoá (Pillow + numpy, như các bộ ảnh tay trước) |
|---|---|---|
| `nhan-vat` | `design/models/anh/<tên>-<góc>.png` | tách nền loang từ mép (xám / trắng trung tính), xoá mảnh nhỏ (sao Gemini), nền trơn `nen`, PNG 1024 vuông, **chung một hệ số thu**: vật cao nhất đỉnh 10 % – đế 90 %, mọi góc đế 90 %, trục theo chân giữa ảnh; góc `rieng` (mat) vừa 80 %, căn giữa |
| `cong-trinh` | `design/models/anh/<tên>-<góc>.png` | như trên nhưng bề ngang lớn nhất `ngang` % (8 → 92 %), đáy `day` % (đỉnh không chạm mép), tâm khung giữa — khớp `xem.py --vua` |
| `concept` | `design/concept/<tên>/<góc>.png` | chỉ đổi sang PNG, giữ khung (sao Gemini nếu có → ghi chú, không vá) |
| `hinh` | `design/icons/nguon/<mã>.png` + `design/icons/xuat/<mã>.webp` (`--256` thêm `@256`) | tách nền → alpha, vật 84 % khung 512, căn giữa; xuất 160 WebP q80. Dòng `design/icons/hinh.json` (mã, nhóm, câu lệnh…) phiên chốt tự thêm |

Sau `chot`: Read lại ảnh trong `design/` (soát cắt mép / nền loang vào vật — tóc bạc, áo trắng sát màu nền: tách lỗi → chỉnh
bằng tay hoặc `sua` cho nền khác màu vật) rồi các bước chốt của `/ui-design` (CHANGELOG, LICENSES, phiếu).
