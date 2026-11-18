// Sinh bởi web/scripts/fonts-app.mjs — không sửa tay.
// Font đóng gói từ @fontsource (SIL OFL 1.1), đổi sang .ttf; mỗi bảng chữ một họ, chữ thiếu tìm ở họ dự phòng.

/// Họ font của app (token `font.*` trong design/tokens/design_tokens.json).
abstract final class AppFonts {
  /// Chữ Hán (Noto Serif SC 700) — chỉ các chữ có trong nội dung bài và code Flutter.
  static const han = ['HanSerif100', 'HanSerif104', 'HanSerif105', 'HanSerif107', 'HanSerif108', 'HanSerif109', 'HanSerif110', 'HanSerif111', 'HanSerif112', 'HanSerif113', 'HanSerif114', 'HanSerif115', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif119', 'HanSerif24', 'HanSerif27', 'HanSerif30', 'HanSerif35', 'HanSerif36', 'HanSerif53', 'HanSerif61', 'HanSerif70', 'HanSerif83'];

  /// Chữ giao diện (Be Vietnam Pro 500 / 700).
  static const ui = 'BeVietnamPro';
  static const uiFallback = ['BeVietnamProVi', 'BeVietnamProExt', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext', 'HanSerif100', 'HanSerif104', 'HanSerif105', 'HanSerif107', 'HanSerif108', 'HanSerif109', 'HanSerif110', 'HanSerif111', 'HanSerif112', 'HanSerif113', 'HanSerif114', 'HanSerif115', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif119', 'HanSerif24', 'HanSerif27', 'HanSerif30', 'HanSerif35', 'HanSerif36', 'HanSerif53', 'HanSerif61', 'HanSerif70', 'HanSerif83'];

  /// Chữ trang trí, pinyin (Lora 700). Nguyên âm pinyin Lora thiếu → Noto Serif SC (`Pinyin*`).
  static const display = 'Lora';
  static const displayFallback = ['LoraExt', 'LoraVi', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext'];
}
