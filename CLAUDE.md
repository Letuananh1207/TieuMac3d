# Học Xá 3D (TieuMac3d)

App mobile thử nghiệm: một "học xá" low-poly 3D, người dùng điều khiển một nhân vật đi trong sân, đến gần lớp
học thì hiện thẻ mời vào học chữ Hán. Giao diện **tiếng Việt**; trả lời người dùng bằng tiếng Việt. Người dùng là
dev Flutter chưa làm game: mỗi khi chọn thư viện / cách làm, giải thích ngắn vì sao; chỗ cần quyết định thì hỏi.

- `web/` — scene 3D: three.js + TypeScript + Vite, build ra file tĩnh, **chạy offline (không CDN)**.
- `app/` — Flutter (Android, iOS, **web**), hiển thị scene bằng WebView (`flutter_inappwebview`; Android / iOS qua
  `InAppLocalhostServer`, web nạp thẳng asset — `app/lib/scene/scene_server.dart`). Không làm bản desktop.
- Làm theo mốc; xong mốc nào báo người dùng rồi mới sang mốc sau. Không multiplayer / đăng nhập / backend.

## Nguồn sự thật ngoài code

| File | Dùng cho |
|---|---|
| `reference/hoc-xa-3d.html` | prototype gốc: hành vi điều khiển, cảnh, giao diện. Chỉ đọc, không sửa. |
| `docs/bridge.md` | tên + dạng mọi thứ trao đổi Flutter ↔ JS; hai phía dùng đúng tên ở đây |
| `design/` | thiết kế đã chốt từ canvas (đặc tả, token, ảnh, nhật ký) — phiên VS Code chỉ đọc |
| `design/scene/scene.json` | đặc tả cảnh 3D (bố cục, kích thước, màu, đèn, camera) — code đọc thẳng lúc build; chưa có → mặc định `web/src/scene/spec.ts` |

## Thiết kế trước, code sau (chỉ phần mới)

- Hai vai: **thiết kế** ghi `design/` — `/ui-design` giao diện 2D trên
  [canvas](https://claude.ai/artifact/RXpWru4i7zZtbRBdQPGhD1) (thường ngoài VS Code), `/canh` cảnh 3D, `/tai-nguyen` model
  `.glb` bằng Hunyuan3D; **code** (VS Code, `/lead` `/loi` `/ui-apply`) sửa code, không sửa `design/` trong lúc làm code.
  Người dùng có thể nhờ phiên VS Code làm thay việc thiết kế — vẫn theo đúng skill thiết kế, cho duyệt rồi mới áp.
- HUD đang có theo code + prototype. Giao diện **mới** chưa có trên canvas → không dựng tạm: soạn phiếu
  bằng `/ui-apply phieu <yêu cầu>`, việc đó chờ thiết kế.
- Cảnh 3D thiết kế bằng đặc tả `design/scene/scene.json` + **Canvas 3D** (`/canh …`, trang `web/design.html` chạy đúng
  code app). Quyết định: `decisions/0002-thiet-ke-3d.md`.
- Model 3D bằng AI (nhân vật, 1–2 công trình nổi bật): `/tai-nguyen` — luồng chuẩn: bộ ảnh 4 góc từ `/ui-design` →
  `bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh <tên> <thư mục ra>` (Hunyuan3D-2mv đầy đủ chạy trên máy người dùng
  → làm mịn → nướng màu từ ảnh → nén, không-sáng → ảnh so thiết kế), đặt `design/models/`. Quyết định: `decisions/0003-tai-san-ai.md`.
- Khi thiết kế được cập nhật (mục mới trong `design/CHANGELOG.md`): `/ui-apply`.
- Phong cách cổ trang / tiên hiệp: `/khao-cuu <chủ đề>` nghiên cứu → hồ sơ `docs/tham_khao/` (tham khảo, chưa chốt)
  → `/canh`, `/tai-nguyen` đọc khi dựng. `/khao-cuu soat` soát cảnh. Skill này chỉ ghi `docs/tham_khao/`.

## File sinh tự động — không sửa tay, sẽ bị ghi đè

| File | Tạo lại bằng |
|---|---|
| `app/assets/scene/**` | `cd web && npm run build` |
| `web/dist/**` | `cd web && npm run build` |
| `web/dist-design/**` (Canvas 3D, không vào app) | `cd web && npm run build:design` |
| `web/src/fonts/**` (chữ Hán cắt từ Noto Serif SC) | `cd web && npm run fonts:han` (dev / build tự chạy) |
| `app/assets/fonts/**`, `app/lib/theme/app_fonts.g.dart`, khối `fonts:` trong `app/pubspec.yaml` | `cd web && npm run fonts:app` (build tự chạy) |

## Lệnh thường dùng

```sh
cd web && npm run dev          # thử scene trên trình duyệt / điện thoại cùng Wi-Fi
cd web && npm run build        # kiểm kiểu + kiểm đặc tả cảnh + build + chép sang app/assets/scene/
cd web && npm run scene:check  # kiểm design/scene/scene.json, in toạ độ nhà / vùng / tường
cd web && npm run build:design # Canvas 3D → web/dist-design/ (đăng artifact — /canh)
bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh <tên> <ra> [--seed 1234,7] [--nhanh] [--dat]  # ảnh 4 góc → model
cd web && npm run model:clean -- <file.glb> [--loai nhan-vat|cong-trinh] [--ten <tên>]  # model AI → design/models/
cd web && npm run model:paint -- <model.glb> <atlas.png> [--ra <file.glb>]  # tô màu model trắng bằng chiếu ảnh
cd web && npx tsc --noEmit     # chỉ kiểm kiểu TS
cd web && npm test             # test TS (vitest) — luật trò chơi web/src/games/, gamePlay
cd app && flutter run          # chạy app (build web trước); trình duyệt: flutter run -d chrome
cd app && flutter analyze && flutter test
dart tool/check.dart --changed # quy tắc bộ chuẩn trên file vừa đổi (--summary: đếm)
dart tool/guard.dart           # chốt chặn: lỗi biên dịch Dart/TS + lỗi E
dart tool/rule_trace.dart      # quy tắc nghiệp vụ ↔ test
dart tool/rule_trace.dart --pending           # quy tắc chờ đồng bộ online (skill /dong-bo-quy-tac tự chép)
```

## Quy tắc khi viết code

Đọc skill **`hoc-xa-3d-dev`** trước khi viết / sửa / review code trong `web/`, `app/`, `tool/`. Quy tắc cứng:

1. Phụ thuộc giữa các thư mục `web/src/` theo bảng ở `.claude/skills/hoc-xa-3d-dev/decisions/0001-kien-truc.md`;
   ghép lớp chỉ ở `main.ts`. Máy kiểm (`E-LOP`).
2. Không nạp gì từ mạng: gói npm và font đóng gói (`@fontsource`), không CDN / Google Fonts.
3. Phiên bản gói npm ghim cố định (`npm install --save-exact`).
4. Không shadow realtime; pixelRatio tối đa 1,5; vật liệu Lambert.
5. Nhân vật qua hợp đồng `Character`; di chuyển ở `PlayerController` — đổi nhân vật không sửa controller.
6. DOM dựng bằng `textContent` / `createElement`, không `innerHTML`; bám mép dùng `env(safe-area-inset-*)`.
7. Sửa web xong thì `npm run build` để app nhận bản mới.
8. Vị trí, kích thước, màu, đèn, camera của cảnh lấy từ `SceneSpec` (`web/src/scene/spec.ts`), không viết số mới
   thẳng trong code dựng cảnh; thêm trường thì thêm cả giá trị mặc định giữ nguyên cảnh cũ.

## Quy tắc nghiệp vụ

Sổ: `docs/testing/quy_tac.md` (xác nhận trên tài liệu online — link trong sổ). Đổi hành vi: sửa sổ trước →
`/dong-bo-quy-tac` (Claude **tự** chép lên tài liệu online — không nhờ người dùng) → test → code.

## Làm việc

- **Cửa nhận việc chung: `/task <một hay nhiều việc>`** — tự tách việc, gọi đúng skill bên dưới, chạy song song (mỗi
  việc một worktree), gộp về main, theo dõi tới xong; sổ việc `docs/viec/so_viec.md`. `/task` trống = làm tiếp việc dở.
- Yêu cầu tính năng / mốc mới: `/lead <yêu cầu>`.
- Báo lỗi: `/loi <mô tả>` ghi vào `docs/loi.md`; `/loi sua [L-…]` để sửa. Người dùng báo lỗi trong chat mà không
  gõ `/loi` thì vẫn ghi vào sổ.
- Thiết kế: `/ui-design` (giao diện 2D) · `/canh` (cảnh 3D) · `/tai-nguyen` (model AI) · `/khao-cuu` (phong cách).
- Ý tưởng sản phẩm (định hướng thế giới ảo kiểu 摩尔庄园): `/y-tuong <chủ đề>` → phiếu `docs/y_tuong/` → chọn → `/lead`.
- Trợ giúp: `/guide` — có những lệnh gì, dùng lệnh nào để làm gì.

## Làm song song (nhiều phiên cùng lúc) — mỗi việc một worktree

Người dùng hay chạy nhiều phiên Claude cùng lúc. Việc **sửa file** (`/lead`, `/loi sua`, `/ui-apply`, `/canh` khi sửa
code, sửa lỗi lớn) làm trong **worktree riêng**, không sửa thẳng thư mục chính:

1. Đầu việc: công cụ `EnterWorktree` (`name` = tên việc không dấu, vd. `tro-chuyen`) → nhánh mới từ `main` của máy
   (`worktree.baseRef: head`), thư mục `.claude/worktrees/<tên>` → chạy `dart tool/viec.dart chuan-bi` (gói npm dùng chung qua
   `.claude/worktrees/node_modules` — ngoài mọi worktree, xoá worktree không đụng tới).
2. Trong việc: commit trên nhánh việc thoải mái (chỉ trong máy, không push). Lỗi mới ghi mã tạm `L-?1`, `L-?2`…
   (không tự lấy số — việc khác có thể đang lấy). Thử trên trình duyệt: `npm run dev` **trong worktree**.
3. Xong việc (kiểm đạt): commit hết → `dart tool/viec.dart gop` (rebase lên main, cấp số `L-`, build + kiểm, đưa main
   tiến tới) → `ExitWorktree` "remove". Xung đột khi rebase: tự sửa; nhật ký chỉ-thêm
   (`docs/loi.md`, `design/CHANGELOG.md`, `docs/thiet_ke_da_ap.md`) git tự gộp; file sinh (font) lấy bên nào cũng được.
4. Việc chỉ đọc / hỏi đáp / ghi sổ lỗi không sửa code: làm ở thư mục chính, không cần worktree.
- Gộp vào `main` của máy là bước bình thường cuối việc (không cần hỏi); **push** lên GitHub vẫn chỉ khi người dùng bảo.
- Xem các việc đang mở: `dart tool/viec.dart ds`. Công cụ (`tool/`, skill, `.gitattributes`) phải nằm trên `main` đã
  commit thì worktree mới có.
- **Giao nhiều việc một lúc** ("làm song song A, B, C", "sửa hết các lỗi đang mở"): phiên chính là người điều phối —
  mỗi việc một subagent (`Agent`, `isolation: "worktree"`, chạy nền), lời giao gồm: việc gì, file / kế hoạch / mục lỗi
  liên quan, "commit trên nhánh của mình, không gộp, không hỏi người dùng — chỗ cần quyết định thì dừng và ghi vào báo
  cáo". Chỉ giao việc **đã rõ** (kế hoạch đã duyệt, lỗi đã ghi đủ, phiếu thiết kế đã chốt); việc cần hỏi / duyệt thì
  phiên chính hỏi trước. Subagent xong → phiên chính lần lượt `viec.dart gop` từng nhánh (trong worktree đó), báo kết
  quả gộp + việc còn chờ quyết định. Tối đa ~4 việc cùng lúc (máy build / test nặng). Nhiều việc lớn hơn → đề xuất
  Workflow, chỉ chạy khi người dùng đồng ý.
- Tính năng mới ghép vào cảnh qua **file ghép riêng** ở gốc `web/src/` (như `gamePlay.ts`, `chatRoom.ts`), `main.ts` chỉ
  thêm vài dòng gọi — hai việc song song ít đụng cùng đoạn `main.ts`.
