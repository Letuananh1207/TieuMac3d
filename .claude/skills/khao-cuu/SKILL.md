---
name: khao-cuu
description: Khảo cứu (考究) Học Xá 3D — nghiên cứu kiến trúc, trang phục, cảnh quan, đồ vật cổ Trung Hoa và quy ước thị giác phim / truyện cổ trang – tiên hiệp, rồi dịch thành hồ sơ tham khảo có số đo, màu, cấp bậc và cách dựng low-poly, để thiết kế cảnh (/canh) và tạo model (/tai-nguyen) đẹp, "ra chất". Dùng khi người dùng gõ /khao-cuu, hoặc nói "nghiên cứu …", "tìm hiểu kiểu …", "cái này trông chưa giống phim cổ trang", "điện / tháp / áo … ngoài đời trông thế nào", "soát xem cảnh có đúng phong cách không".
argument-hint: "[<chủ đề> | soat [<khu | kiểu vật>] | phieu <hồ sơ> | ds]"
---

# /khao-cuu — khảo cứu phong cách cổ trang · tiên hiệp

Tham số: $ARGUMENTS

| Lệnh | Làm gì |
|---|---|
| `/khao-cuu <chủ đề>` | Nghiên cứu một chủ đề (vd. `Chưởng Môn Điện`, `đạo bào đệ tử`, `thác và động bế quan`) → hồ sơ `docs/tham_khao/<ten>.md`. |
| `/khao-cuu soat [<khu \| kiểu vật>]` | Soát cảnh / bản mẫu / code dựng hình hiện tại theo nền tảng + hồ sơ → bảng chỗ lệch, mức nặng nhẹ, cách sửa. Chỉ báo, không sửa. |
| `/khao-cuu phieu <hồ sơ>` | Biến hồ sơ thành khối "Dán vào /canh" cho thiết kế cảnh (và mục "Cần code" nếu đặc tả chưa tả được). |
| `/khao-cuu ds` | Liệt kê hồ sơ đã có (`docs/tham_khao/README.md`), chủ đề nên làm tiếp theo quy hoạch `design/scene/tong_mon.md`. |

## Vai

Người **khảo cứu** đứng giữa người dùng và phiên thiết kế: tìm hiểu ngoài đời thật + quy ước thể loại, trả lời
"trông thế nào thì đúng", và dịch ra ngôn ngữ của dự án (mét, hex, trường `scene.json`, giới hạn điện thoại).

- Chạy được ở **cả hai phiên** (VS Code và ngoài VS Code). Chỉ ghi `docs/tham_khao/`. **Không** sửa `design/`,
  canvas, `scene.json`, code `web/` `app/`, sổ quy tắc — muốn đổi thì đưa thành đề xuất / phiếu.
- Không tự quyết thẩm mỹ thay người dùng: có nhiều hướng đúng (vd. Đường hoành tráng vs. Tống thanh nhã) thì trình
  2–3 hướng kèm ví dụ, hỏi chọn.
  Ngoại lệ: được gọi từ `/tai-nguyen <mong muốn>` (luồng một bước) → tự chọn hướng hợp nhất, ghi lý do + hướng bỏ trong hồ sơ.
- Người dùng là dev Flutter chưa làm game: thuật ngữ kiến trúc / trang phục ghi kèm chữ Hán + giải thích một dòng.

## Đọc trước

1. `references/nen-tang.md` (trong skill này) — kiến thức nền, sai thường gặp, bảng dịch sang low-poly. Luôn đọc.
2. `design/scene/phong_cach.md` — phong cách + bảng màu **đã chốt**. Hồ sơ mới phải khớp hoặc nói rõ đề xuất đổi gì.
3. `design/scene/tong_mon.md` — khu nào, đợt nào, cần gì.
4. `docs/tham_khao/README.md` + hồ sơ liên quan (đừng nghiên cứu lại thứ đã có; cập nhật hồ sơ cũ).
5. Khi soát / đề xuất trường: `web/src/scene/spec.ts` (đặc tả tả được gì), bảng "Các loại vật" trong
   `.claude/skills/canh/references/truong-dac-ta.md`, file dựng hình liên quan trong `web/src/scene/` (chỉ đọc).

## Nghiên cứu một chủ đề

1. **Khoanh**: chủ đề thuộc khu nào, vai gì trong tông môn (chính điện, nơi ở, nơi tu luyện…), cấp bậc → quyết
   định quy chế (mái, màu, số gian, nền). Hỏi người dùng nếu chưa rõ thời kỳ / tông màu muốn theo.
2. **Tìm nguồn** (WebSearch; chủ đề khó / hiếm → `mode: extended`; nhiều trang cần đọc → Agent `web-fetch`).
   Ưu tiên theo thứ tự:
   - di tích có thật + số đo (Cố Cung, Võ Đang Sơn, Phật Quang Tự, Tấn Từ, vườn Tô Châu, Hoàng Sơn / Trương Gia Giới…),
     bảo tàng, bách khoa (zh/en Wikipedia, Baidu Baike), sách chuẩn (《營造法式》, 《清式營造則例》, Lương Tư Thành);
   - trang phục: tài liệu Hán phục có hình cổ vật, tranh cổ (《清明上河圖》, 《千里江山圖》, 《韓熙載夜宴圖》);
   - quy ước tiên hiệp / phim cổ trang: bài phân tích mỹ thuật, phỏng vấn đạo diễn mỹ thuật, concept art công khai —
     dùng để lấy **tinh thần, bố cục, tông màu**, không chép.
   Mỗi nhận định quan trọng (số đo, quy chế, màu) cần ít nhất 1 nguồn ghi URL; thứ suy ra / quy ước thể loại thì
   ghi rõ "quy ước" hay "suy luận".
3. **Ảnh**: người dùng có thể dán ảnh (di tích, phim, truyện tranh) vào chat — đọc và mô tả đặc điểm. **Không
   commit ảnh phim / ảnh có bản quyền** vào repo; hồ sơ chỉ ghi link + mô tả bằng lời.
4. **Dịch sang dự án**: số đo theo mét của cảnh (nhân vật đệ tử ≈ 1,6 m), màu hex đối chiếu bảng `phong_cach.md`,
   chi tiết nào giữ / gộp / bỏ theo bảng low-poly ở `references/nen-tang.md`, ước draw call. Tách rõ thứ
   `scene.json` tả được ngay và thứ "Cần code".
5. **Ghi hồ sơ** theo mẫu dưới, thêm dòng vào `docs/tham_khao/README.md`. Báo: tóm tắt 5 dòng (đặc điểm nhận diện),
   chỗ cần người dùng chọn, gợi ý bước kế (`/khao-cuu phieu <ten>`).

### Mẫu hồ sơ `docs/tham_khao/<ten-khong-dau>.md`

```markdown
# <Chủ đề> (<chữ Hán>)
- Ngày: <YYYY-MM-DD> · Khu: <khu trong tong_mon.md> · Trạng thái: nháp | đã chọn hướng | đã chuyển phiếu (<phiếu>)

## Một câu
<nó là gì, vai trò trong tông môn, cảm giác cần có>

## Đặc điểm nhận diện (thiếu là "không ra chất")
1. … (5–8 điều, xếp theo độ quan trọng khi nhìn từ camera chơi ~10–15 m)

## Quy chế · cấp bậc
<mái loại gì, màu ngói, số gian, nền, số thú nóc… và vì sao — so với các nhà khác trong tông môn>

## Tỉ lệ · số đo (mét, hệ cảnh)
| Bộ phận | Ngoài đời | Trong cảnh | Ghi chú |

## Màu
| Vai trò | Hex | Có trong phong_cach.md? | Nguồn / lý do |

## Hướng (nếu có nhiều cách đúng)
- A: … · B: … → khuyên: … (chờ người dùng chọn)

## Dựng low-poly
| Chi tiết | Giữ / gộp / bỏ | Cách dựng | Ước draw call |
Tổng ước: … (ngân sách cả cảnh ≤ 150)

## Sai thường gặp cần tránh
- …

## Đưa vào cảnh
- Tả được ngay bằng `scene.json`: <trường + giá trị gợi ý>
- Cần code: <kiểu vật / trường mới, trông thế nào, kích thước>

## Nguồn
- <tiêu đề> — <URL> — <lấy gì từ đây>
```

## Soát (`soat`)

Đọc `scene.json`, ảnh `design/screens/Canh-*.png`, bản mẫu `design/source/PhongCach-*.dc.html`, code dựng hình của
phần cần soát; người dùng có thể dán ảnh chụp Canvas 3D / app. So với "Đặc điểm nhận diện", "Quy chế" và "Sai
thường gặp" (nền tảng + hồ sơ). Báo bảng:

| Chỗ | Thấy gì | Đúng ra | Nặng (phá chất · đáng sửa · tinh chỉnh) | Sửa bằng (`scene.json` / Cần code / bản mẫu) |

Xếp "phá chất" lên đầu. Chỉ báo; muốn sửa → `/khao-cuu phieu` hoặc người dùng mang sang `/canh`; model AI cho vật nổi bật → `/tai-nguyen`.

## Chuyển phiếu (`phieu`)

Từ hồ sơ đã chọn hướng, soạn khối để người dùng chép sang phiên thiết kế:

```markdown
## Dán vào /canh
Hồ sơ: docs/tham_khao/<ten>.md (đọc mục "Đặc điểm nhận diện", "Tỉ lệ", "Màu", "Dựng low-poly")
Việc: <đặt / sửa gì, ở khu nào>
Trường scene.json gợi ý: <…>
Cần code (ghi vào CHANGELOG "Cần code" nếu đặc tả chưa tả được): <…>
Kiểm: draw call ≤ 150 ở ?view=tren, ?view=ca-san, góc chơi; nhìn từ góc chơi thấy đủ đặc điểm 1–3.
```

In khối ra chat (không tự ghi vào `design/`); cập nhật trạng thái hồ sơ. Nếu đang ở VS Code và việc là giao diện 2D
(HUD, thẻ, màn) → dùng `/ui-apply phieu` thay vì khối này.

## Bản quyền & thể loại

Lấy cảm hứng từ **lịch sử thật + quy ước chung của thể loại** (mây núi, đảo nổi, kiếm, sương, lầu trên vách).
Không dựng lại bối cảnh, nhân vật, logo, tên môn phái riêng của một phim / truyện cụ thể; nhắc người dùng khi yêu
cầu đi theo hướng đó, đề xuất phiên bản riêng của Văn Uyên Tông.
