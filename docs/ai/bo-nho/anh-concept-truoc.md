---
name: anh-concept-truoc
description: Bối cảnh / kiến trúc mới hoặc đổi lớn phải có ảnh concept Gemini người dùng chốt trước rồi mới dựng
metadata:
  node_type: memory
  type: feedback
  originSessionId: 36732645-b2a3-45a5-a639-ef312b52f140
  modified: 2026-11-16T09:16:22.861Z
---

Từ 2026-11-16: map / vùng mới, khu mới, công trình / kiến trúc mới, đổi dáng một khu → soạn phiếu ảnh concept (câu lệnh Gemini sẵn) → người dùng tạo ảnh ở /ui-design và chốt (`design/concept/<tên>/`) → lúc đó mới sửa đặc tả / code / làm model. Việc nhỏ (dời, chỉnh cỡ / màu, đặt NPC, sửa lỗi) được miễn.

**Why:** người dùng muốn thấy và duyệt hình dáng trước khi tốn công dựng; ảnh concept cũng làm đầu vào cho model Tripo.

**How to apply:** ghi trong CLAUDE.md, decisions/0006-anh-concept-truoc.md, skill /canh (bước 0), /lead (cờ cảnh báo), /ui-design. Khi giao subagent việc cảnh / kiến trúc mới, nhắc cổng này. Liên quan [[tai-nguyen-mot-buoc]], [[canvas-thiet-ke]].
