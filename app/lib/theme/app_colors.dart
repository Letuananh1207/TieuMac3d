import 'package:flutter/painting.dart';

/// Màu dùng trong phần Flutter. Lấy từ bảng màu của scene web (web/src/style.css) để hai bên liền mạch.
abstract final class AppColors {
  /// Nền trang web (`body` trong style.css) — hiện trong lúc cảnh 3D chưa tải xong, tránh chớp trắng.
  static const sceneBackground = Color(0xFF141B2C);

  /// Chữ giấy dó (`--paper`).
  static const paper = Color(0xFFF3E6C8);

  /// Đỏ sơn mài cho nút chính (`--lacquer`).
  static const lacquer = Color(0xFFB5352B);
}
