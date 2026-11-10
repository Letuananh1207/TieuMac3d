# design/scene/ — đặc tả cảnh 3D

Canvas 3D: https://claude.ai/artifact/TyJxrgsBcj5ryHakv7c1so
Chơi thử (đi lại bằng nhân vật, đúng code game): https://claude.ai/artifact/GXXVj7PRJUsuZRxa8MHp7n — phiên thiết kế
build `web/index.html` ra thư mục tạm (`npx vite build --outDir <tạm>`, không đụng `app/`) rồi đăng lại cùng link.

Tài liệu: `tong_mon.md` (quy hoạch khu), `phong_cach.md` (phong cách Trung Hoa + việc cần code).

`scene.json` mô tả cảnh 3D của học xá: trời, sương, đèn, mặt sân, tường, nhà (vị trí, kích thước, màu, vùng sự
kiện), cây, giếng, điểm xuất phát và camera. File do **phiên thiết kế** (`/ui-design canh …`) ghi; phiên code
không sửa. Code đọc thẳng file này lúc build (`web/src/scene/loadSpec.ts`). Chưa có file thì dùng cảnh mặc
định `DEFAULT_SCENE` trong `web/src/scene/spec.ts`. Khuôn, kiểu và chú thích từng trường cũng nằm ở `spec.ts`.

Kiểm bằng `cd web && npm run scene:check`: phải in "Không có lỗi", kèm toạ độ vùng, nhà và tường để đối chiếu
luật `R-VA-1`, `R-VUNG-1`. Canvas 3D là trang `web/design.html` chạy đúng code app (`npm run build:design` →
`web/dist-design/`). Sửa `scene.json` xong thì build lại và đăng lên link trên.
