---
name: ke-hoach-5-moc
description: Học Xá 3D làm theo 5 mốc (khung → WebView → cầu nối → hiệu năng → model glb); xong mốc nào báo rồi mới sang mốc sau
metadata:
  node_type: memory
  type: project
  originSessionId: c88465f5-67a1-42f4-a14e-0a4d0453d047
  modified: 2026-11-10T10:12:36.379Z
---

Người dùng (dev Flutter, chưa làm game) giao 5 mốc, xong mốc nào báo rồi chờ mới sang mốc sau:
1. Khung web/ (Three.js+TS+Vite) + app/ (Flutter) — xong 2026-11-10, commit 051231e nhánh feat/moc-1-khung.
2. Scene chạy trong flutter_inappwebview qua InAppLocalhostServer trên Android; tắt zoom/scroll; safe area.
3. Cầu nối: JS gửi {type:'openLesson'} → màn bài học Flutter native; quay lại gửi {type:'resume'}; tạm dừng render khi bị che. Tên sự kiện định nghĩa chung ở docs/bridge.md.
4. Hiệu năng: pixelRatio ≤ 1.5, không shadow realtime, InstancedMesh cho cây, < 100 draw call, overlay debug bật từ Flutter, dừng render khi app background.
5. GLTFLoader (+Draco/Meshopt), thay nhân vật bằng .glb có idle/walk (AnimationMixer), giữ khối hình làm fallback.

**Why:** người dùng muốn duyệt từng bước vì chưa quen làm game; mỗi lựa chọn thư viện phải giải thích ngắn vì sao.
**How to apply:** màn hình: người dùng chọn **xoay tự do** (dọc + ngang) ngày 2026-11-10 — HUD phải dùng được ở cả hai chiều. Gặp chỗ cần quyết định thì hỏi, không đoán. Không thêm multiplayer/đăng nhập/backend.
