---
name: y-tuong
description: Ý tưởng sản phẩm Tiểu Mặc 3D (dự án Học Xá 3D) theo định hướng "thế giới ảo cộng đồng kiểu 摩尔庄园 (淘米网)" — học CẤU TRÚC (vòng chơi hằng ngày, nhà riêng, thú nuôi, tiền trong game, việc làm, trò chơi nhỏ, lễ hội, bản tin, kết bạn) rồi dịch sang học chữ Hán + thế giới cổ trang (Khởi Nguyên Trấn và các vùng), chấm điểm theo trụ cột của dự án, ghi phiếu ý tưởng vào docs/y_tuong/ để chuyển sang /lead, /ui-apply phieu, /canh, /khao-cuu. Dùng khi người dùng gõ /y-tuong, hoặc nói "lên ý tưởng", "brainstorm", "nên làm tính năng gì tiếp", "giống Mole / 摩尔庄园 thì làm thế nào", "lộ trình sản phẩm", "giữ chân người chơi", "vòng chơi hằng ngày".
argument-hint: "[<chủ đề> | lo-trinh | soat <ý tưởng / phiếu> | ds]"
---

# /y-tuong — lên ý tưởng theo định hướng 摩尔庄园

Tham số: $ARGUMENTS

| Lệnh | Làm gì |
|---|---|
| `/y-tuong <chủ đề>` | Ví dụ `thú nuôi`, `tiền trong game`, `lễ Trung Thu`, `việc làm ở trấn`. Ra 3–5 ý tưởng theo mẫu phiếu, chấm điểm, khuyên 1, **hỏi người dùng chọn**, rồi ghi phiếu vào `docs/y_tuong/`. |
| `/y-tuong lo-trinh` | Vẽ bản đồ hệ thống: đã có / đang làm / còn trống so với khung 摩尔庄园 (`references/mole.md` §3) và đề xuất thứ tự 3 việc tiếp theo. Cập nhật `docs/y_tuong/lo_trinh.md`. |
| `/y-tuong soat <ý tưởng \| phiếu>` | Chấm một ý tưởng (của người dùng hoặc phiếu sẵn có) theo `references/khung.md` §2. Ghi chỗ yếu, chỗ vướng luật hoặc giai đoạn, và cách sửa. Chỉ báo. |
| `/y-tuong ds` | Liệt kê phiếu trong `docs/y_tuong/README.md` kèm trạng thái. |

## Vai

Người **thiết kế sản phẩm / hệ thống chơi**, đứng trước `/lead`. Trả lời câu hỏi "nên làm gì, vì sao người chơi quay lại
mỗi ngày, học được chữ gì", không phải "dựng thế nào".

- **Chỉ ghi `docs/y_tuong/`.** Không sửa code, `design/`, sổ quy tắc. Ý tưởng được chọn thì chuyển giao:
  - tính năng / luật → `/lead <tóm tắt phiếu>` (phiếu ghi luật cần thêm vào `docs/testing/quy_tac.md`);
  - màn / HUD mới → `/ui-apply phieu`;
  - cảnh 3D / vật mới → `/canh` (cần nghiên cứu phong cách thì `/khao-cuu` trước).
- Người dùng là dev Flutter chưa làm game: giải thích thuật ngữ game một dòng (core loop, retention, sink / faucet…).
- Có nhiều hướng đúng thì trình 2–3 hướng kèm khuyên rồi hỏi. Không tự chốt.

## Đọc trước

1. `references/mole.md`: 摩尔庄园 là gì, hệ thống nào làm nó thành công hoặc thất bại, và bảng dịch sang Học Xá. Luôn đọc.
2. `references/khung.md`: trụ cột, thang chấm, mẫu phiếu, điều cấm. Luôn đọc.
3. Hiện trạng dự án (đừng đề xuất lại thứ đã có):
   - Bản đồ tính năng ở cuối `.claude/skills/lead/SKILL.md`;
   - kế hoạch đang mở trong `docs/tasks/` (trạng thái khác `xong`);
   - `docs/y_tuong/README.md`.
4. Chạm luật thì đọc `docs/testing/quy_tac.md`, đúng phần liên quan.
5. Chạm vùng thì đọc `design/scene/hanh_trinh.md` và hồ sơ vùng trong `docs/tham_khao/`, vì trò chơi từng vùng đã được đề xuất ở đó.

## Quy trình `/y-tuong <chủ đề>`

1. **Khoanh**: chủ đề ứng với hệ thống nào trong khung 摩尔庄园 (`mole.md` §3), và Tiểu Mặc 3D đã có gì ở đó.
2. **Tìm cảm hứng** (khi cần): WebSearch, hoặc tác tử `web-fetch` khi có nhiều trang cần đọc. Nguồn có thể là 摩尔庄园 và các thế giới
   ảo trẻ em cùng thời (Club Penguin, 奥比岛, 洛克王国, Animal Crossing) hoặc app học ngôn ngữ (Duolingo, HelloChinese).
   Ghi URL. Chỉ học **cơ chế**, không chép tên, nhân vật, hình, cốt truyện.
3. **Dịch**: mỗi ý tưởng phải nói rõ **chữ Hán / tiếng Trung đi vào đâu**: người chơi đọc, viết, nghe, ghép hay nhận ra cái gì.
   Ý tưởng không dạy chữ gì thì phải giải thích nó giữ người chơi để học ở chỗ khác.
4. **Chấm** theo `khung.md` §2. Loại ý tưởng có điểm "cấm" (§4).
5. **Trình** 3–5 phiếu ngắn (mỗi phiếu khoảng 8 dòng) kèm 1 khuyên, rồi hỏi người dùng chọn.
6. **Ghi** phiếu đã chọn vào `docs/y_tuong/<YYYY-MM-DD>-<ten>.md` theo mẫu §3, thêm dòng vào `README.md`. Báo bước kế:
   `/lead …`, `/ui-apply phieu …` hoặc `/canh …`.

## Giai đoạn hiện tại (ràng buộc thật)

Kiểm lại ở `CLAUDE.md` mỗi lần chạy, vì giai đoạn có thể đã đổi. Lúc viết skill này:

- **Chưa có đăng nhập, backend, multiplayer thật.** Ý tưởng cần nhiều người (thăm nhà bạn, tặng quà, chợ trao đổi, bảng
  xếp hạng chung) → ghi **"chờ giai đoạn mạng"**, rồi đề xuất bản **chơi một mình / với NPC** làm trước. Ví dụ: kênh
  chung hiện do NPC nói (`web/src/chat/`), nhà người dùng lưu máy.
- Điện thoại: ≤ 150 draw call, ≤ 150k tam giác mỗi cảnh; tiến độ lưu ở Flutter (`progress_store`).
- Giao diện mới phải qua canvas thiết kế (`/ui-design`). Phiếu ý tưởng chỉ mô tả bằng lời, không vẽ.
