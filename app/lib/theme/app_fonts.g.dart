// Sinh bởi web/scripts/fonts-app.mjs — không sửa tay.
// Font đóng gói từ @fontsource (SIL OFL 1.1), đổi sang .ttf; mỗi bảng chữ một họ, chữ thiếu tìm ở họ dự phòng.

/// Họ font của app (token `font.*` trong design/tokens/design_tokens.json).
abstract final class AppFonts {
  /// Chữ Hán (Noto Serif SC 700) — chỉ các chữ có trong nội dung bài và code Flutter.
  static const han = ['HanSerif100', 'HanSerif101', 'HanSerif102', 'HanSerif103', 'HanSerif104', 'HanSerif105', 'HanSerif107', 'HanSerif108', 'HanSerif109', 'HanSerif110', 'HanSerif111', 'HanSerif112', 'HanSerif113', 'HanSerif114', 'HanSerif115', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif119', 'HanSerif23', 'HanSerif24', 'HanSerif25', 'HanSerif26', 'HanSerif27', 'HanSerif30', 'HanSerif31', 'HanSerif33', 'HanSerif34', 'HanSerif35', 'HanSerif36', 'HanSerif37', 'HanSerif38', 'HanSerif42', 'HanSerif46', 'HanSerif48', 'HanSerif49', 'HanSerif50', 'HanSerif53', 'HanSerif55', 'HanSerif56', 'HanSerif59', 'HanSerif61', 'HanSerif62', 'HanSerif68', 'HanSerif70', 'HanSerif71', 'HanSerif73', 'HanSerif74', 'HanSerif82', 'HanSerif84'];

  /// Chữ giao diện (Be Vietnam Pro 500 / 700).
  static const ui = 'BeVietnamPro';
  static const uiFallback = ['BeVietnamProVi', 'BeVietnamProExt', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext', 'HanSerif100', 'HanSerif101', 'HanSerif102', 'HanSerif103', 'HanSerif104', 'HanSerif105', 'HanSerif107', 'HanSerif108', 'HanSerif109', 'HanSerif110', 'HanSerif111', 'HanSerif112', 'HanSerif113', 'HanSerif114', 'HanSerif115', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif119', 'HanSerif23', 'HanSerif24', 'HanSerif25', 'HanSerif26', 'HanSerif27', 'HanSerif30', 'HanSerif31', 'HanSerif33', 'HanSerif34', 'HanSerif35', 'HanSerif36', 'HanSerif37', 'HanSerif38', 'HanSerif42', 'HanSerif46', 'HanSerif48', 'HanSerif49', 'HanSerif50', 'HanSerif53', 'HanSerif55', 'HanSerif56', 'HanSerif59', 'HanSerif61', 'HanSerif62', 'HanSerif68', 'HanSerif70', 'HanSerif71', 'HanSerif73', 'HanSerif74', 'HanSerif82', 'HanSerif84'];

  /// Chữ trang trí, pinyin (Lora 700). Nguyên âm pinyin Lora thiếu → Noto Serif SC (`Pinyin*`).
  static const display = 'Lora';
  static const displayFallback = ['LoraExt', 'LoraVi', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext'];
}
