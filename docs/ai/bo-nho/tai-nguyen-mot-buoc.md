---
name: tai-nguyen-mot-buoc
description: "Người dùng muốn tạo nhân vật / tài nguyên chỉ bằng một câu mong muốn — Claude tự khảo cứu, tự chọn hướng, tự đẩy phiếu sang /ui-design"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9576f1bd-d5b2-435f-b31d-c986662fde64
  modified: 2026-11-12T10:16:33.370Z
---

Khi người dùng nêu mong muốn một nhân vật / tài nguyên 3D mới, không bắt họ tự chạy /khao-cuu, chọn hướng, chép phiếu.
Claude tự: khảo cứu → chọn hướng hợp phong cách → soạn phiếu ảnh 4 góc → commit + push lên main cho /ui-design.

**Why:** người dùng thấy luồng nhiều bước cũ "rất phiền" (2026-11-12).
**How to apply:** dùng `/tai-nguyen <mong muốn>` (mục "Một bước" trong skill tai-nguyen). Vẫn để người dùng chọn seed model cuối cùng.
