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

  /// Nền đáp án / phản hồi đúng, mức "Nhớ rõ" (token `answer-right-bg` = rgba(43,84,70,.10), 2026-11-13.25).
  static const answerRightBg = Color(0x1A2B5446);

  /// Nền đáp án / phản hồi sai, mức "Chưa nhớ" (token `answer-wrong-bg` = rgba(168,50,42,.08)).
  static const answerWrongBg = Color(0x14A8322A);

  /// Nền mức "Nhớ một phần" (token `answer-partial-bg` = rgba(212,166,74,.16)).
  static const answerPartialBg = Color(0x29D4A64A);

  /// Tầng kệ gỗ danh mục sách + bóng dưới (token `shelf-wood` #8A5A3A, bóng #6B4429 — 2026-11-13.28).
  static const shelfWood = Color(0xFF8A5A3A);
  static const shelfShadow = Color(0xFF6B4429);

  /// Gỗ trục cuộn (token `scroll-wood` #3A2418) + dải sáng / tối của trục cuộn treo Ngồi ôn (2026-11-14.10).
  static const scrollWood = Color(0xFF3A2418);
  static const scrollWoodLight = Color(0xFF5A3A28);
  static const scrollWoodDark = Color(0xFF2A190F);

  /// Chữ mờ / dòng phụ trên giấy và kính (token `slate-muted` #5E6A70, ≥ 4,5:1 trên `map-paper` — 2026-11-14.12).
  static const slateMuted = Color(0xFF5E6A70);

  /// Đồng xu Văn tiền 文錢 (2026-11-14.12): vành (token `coin-rim`), mặt = [gold], vòng trong #B88F3A, lỗ vuông viền
  /// #8A6A2A lòng ngà #F4F0E6, chữ khắc (token `coin-ink`).
  static const coinRim = Color(0xFFA9802F);
  static const coinRing = Color(0xFFB88F3A);
  static const coinHoleRim = Color(0xFF8A6A2A);
  static const coinHole = Color(0xFFF4F0E6);
  static const coinInk = Color(0xFF5A3E12);

  /// Viên kính ví / nhãn thưởng (rgba(244,247,246,.94)) và viền trắng .95 (2026-11-14.12).
  static const frostLabel = Color(0xF0F4F7F6);
  static const glassEdge = Color(0xF2FFFFFF);

  /// Bóng chip, nút nổi (token `shadow.hud` = 0 4px 14px rgba(36,50,58,.18)).
  static const hudShadow = Color(0x2E24323A);

  /// Lớp tối phủ cảnh khi bảng chọn Ngồi ôn mở (rgba(36,50,58,.16)).
  static const sceneDim = Color(0x2924323A);
}
