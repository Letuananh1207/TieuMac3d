// Sinh bởi web/scripts/hinh.mjs từ design/icons/hinh.json — không sửa tay (`cd web && npm run hinh`).
// Ảnh dùng chung với scene web: `npm run build` chép vào app/assets/scene/hinh/.

/// Đường dẫn asset hình minh hoạ (WebP alpha, cỡ 160). Dùng qua widget `Hinh` (app/lib/theme/hinh.dart).
abstract final class AppHinh {
  static const dir = 'assets/scene/hinh';
  /// Bản đồ (đợt 1)
  static const banDo = 'assets/scene/hinh/ban-do.webp';
  /// Về nhà (đợt 1)
  static const veNha = 'assets/scene/hinh/ve-nha.webp';
  /// Biểu cảm (đợt 1)
  static const bieuCam = 'assets/scene/hinh/bieu-cam.webp';
  /// Túi đồ (đợt 1)
  static const tuiDo = 'assets/scene/hinh/tui-do.webp';
  /// Nhiệm vụ (đợt 1)
  static const nhiemVu = 'assets/scene/hinh/nhiem-vu.webp';
  /// Nhảy (đợt 1)
  static const nhay = 'assets/scene/hinh/nhay.webp';
  /// Nhảy (đợt 1)
  static const nhayNut = 'assets/scene/hinh/nhay-nut.webp';
  /// Chào (đợt 1)
  static const chao = 'assets/scene/hinh/chao.webp';
  /// Chào (đợt 1)
  static const chaoNut = 'assets/scene/hinh/chao-nut.webp';
  /// Ngồi ôn (đợt 1)
  static const ngoiOn = 'assets/scene/hinh/ngoi-on.webp';
  /// Ngồi ôn (đợt 1)
  static const ngoiOnNut = 'assets/scene/hinh/ngoi-on-nut.webp';
  /// Trò chuyện (đợt 1)
  static const troChuyen = 'assets/scene/hinh/tro-chuyen.webp';
  /// Trang trí (đợt 1)
  static const trangTri = 'assets/scene/hinh/trang-tri.webp';
  /// Đọc sách (đợt 1)
  static const docSach = 'assets/scene/hinh/doc-sach.webp';
  /// Đọc sách (đợt 1)
  static const docSachNut = 'assets/scene/hinh/doc-sach-nut.webp';
}
