import 'package:flutter/painting.dart';

/// Màu dùng trong phần Flutter. Lấy từ bảng màu của scene web (web/src/style.css) để hai bên liền mạch.
abstract final class AppColors {
  /// Nền trang web (`body`, màn tải trong style.css — token `scene-bg`) — hiện trong lúc cảnh 3D chưa tải xong.
  static const sceneBackground = Color(0xFFE9EEEC);

  /// Nền màn báo lỗi tải cảnh — giữ nền tối cũ cho chữ `paper` (màn này chưa có thiết kế).
  static const errorBackground = Color(0xFF141B2C);

  /// Chữ giấy dó (`--paper`).
  static const paper = Color(0xFFF3E6C8);

  /// Đỏ sơn mài (`lacquer`) — pinyin trên màn bài học.
  static const lacquer = Color(0xFFA8322A);

  /// Ngọc bích (`jade`) — nút chính, chữ Hán lớn, nhãn.
  static const jade = Color(0xFF2B5446);

  /// Chữ trên nền ngọc (`on-jade`).
  static const onJade = Color(0xFFFFFFFF);

  /// Chữ sẫm chính (`slate`).
  static const slate = Color(0xFF24323A);

  /// Vàng (`gold`) — chỉ chấm trang trí, không dùng cho chữ trên nền sáng (tương phản thấp).
  static const gold = Color(0xFFD4A64A);

  /// Tấm "lụa" (`frost-strong` = rgba(244,247,246,.86)) và viền (`frost-outline` = rgba(36,50,58,.16)).
  static const frostStrong = Color(0xDBF4F7F6);
  static const frostOutline = Color(0x2924323A);

  /// Hai lớp núi mờ (`mist-far`, `mist-near`).
  static const mistFar = Color(0xFFD3DDDA);
  static const mistNear = Color(0xFFBFCFCB);

  /// Bóng thẻ (`shadow.card` = 0 12px 32px rgba(36,50,58,.22)) và bóng nút chính (rgba(43,84,70,.3)).
  static const cardShadow = Color(0x3824323A);
  static const primaryShadow = Color(0x4D2B5446);

  /// Vạch kẻ trên thẻ (rgba(36,50,58,.2)).
  static const divider = Color(0x3324323A);

  /// giấy bản đồ / ô "Từ hình đến chữ" (token map-paper, 2026-11-13.9)
  static const mapPaper = Color(0xFFF2EADA);
}
