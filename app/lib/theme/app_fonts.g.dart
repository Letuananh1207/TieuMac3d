// Sinh bởi web/scripts/fonts-app.mjs — không sửa tay.
// Font đóng gói từ @fontsource (SIL OFL 1.1), đổi sang .ttf; mỗi bảng chữ một họ, chữ thiếu tìm ở họ dự phòng.

/// Họ font của app (token `font.*` trong design/tokens/design_tokens.json).
abstract final class AppFonts {
  /// Chữ Hán (Noto Serif SC 700) — chỉ các chữ có trong nội dung bài và code Flutter.
  static const han = ['HanSerif100', 'HanSerif114', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif70'];

  /// Chữ giao diện (Be Vietnam Pro 500 / 700).
  static const ui = 'BeVietnamPro';
  static const uiFallback = ['BeVietnamProVi', 'BeVietnamProExt', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext', 'HanSerif100', 'HanSerif114', 'HanSerif116', 'HanSerif117', 'HanSerif118', 'HanSerif70'];

  /// Chữ trang trí, pinyin (Lora 700). Nguyên âm pinyin Lora thiếu → Noto Serif SC (`Pinyin*`).
  static const display = 'Lora';
  static const displayFallback = ['LoraExt', 'LoraVi', 'Pinyin119', 'Pinyin98', 'Pinyin99', 'Pinyinlatinext'];
}
