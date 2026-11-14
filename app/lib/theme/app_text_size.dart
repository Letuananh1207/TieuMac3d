/// Cỡ chữ (px logic) theo token `fontSize.*` trong design/tokens/design_tokens.json.
abstract final class AppTextSize {
  static const eyebrow = 11.0;
  static const detail = 14.0;
  static const body = 15.0;
  static const cardTitle = 18.0;
  static const accent = 22.0;
  static const hanHero = 140.0;

  /// thẻ bộ thủ (thiết kế 2026-11-13.9 "Thẻ học bộ thủ"): bộ thủ lớn · dạng đủ · chữ ví dụ · chú thích ô hình
  static const radicalHero = 120.0;
  static const radicalFull = 56.0;
  static const hanExample = 20.0;
  static const caption = 12.0;

  /// bảng nhiệm vụ + màn ôn (thiết kế 2026-11-13.25): tiêu đề 日課榜 / số chuỗi · bộ thủ câu đố · dòng phụ · câu hỏi
  static const dailyTitle = 40.0;
  static const reviewHero = 110.0;
  static const reviewHeroLandscape = 96.0;
  static const small = 13.0;
  static const task = 16.0;
  static const question = 17.0;
  static const countLarge = 28.0;

  /// triện son 畢 trên bảng nhiệm vụ: chữ · chữ "xong"
  static const seal = 30.0;
  static const sealCaption = 9.0;

  /// chữ nhỏ nhất: "简体" trên bìa sách, "HSK n" bìa mini (2026-11-13.28)
  static const tiny = 9.0;

  /// tiêu đề 藏書閣 danh mục sách (2026-11-13.28)
  static const libTitle = 30.0;

  /// sổ từ (2026-11-13.28): từ 1–2 chữ · 3–4 chữ · hai phần / dài · pinyin · nghĩa · câu ví dụ Hán
  static const wordShort = 104.0;
  static const wordMid = 64.0;
  static const wordLong = 52.0;
  static const pinyinLarge = 26.0;
  static const meaning = 20.0;
  static const exampleHan = 24.0;

  /// Ngồi ôn + Bộ đã học (2026-11-14.10): ấn son 溫故 · tiêu đề ngang "Bộ đã học" · chữ ô bộ đã học (dọc / ngang)
  static const studySeal = 15.0;
  static const titleCompact = 19.0;
  static const learnedHan = 40.0;
  static const learnedHanLandscape = 30.0;
}

/// Kích thước cố định theo token `size.*` (design_tokens.json).
abstract final class AppSize {
  /// chiều cao tối thiểu phương án câu đố (token `option-row` 58; ngang 50) — 2026-11-13.25
  static const optionRow = 58.0;
  static const optionRowLandscape = 50.0;
}
