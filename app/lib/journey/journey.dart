/// Hành trình nhiều vùng (R-HANH-1): các vùng "du học" theo cấp và mốc mở khoá.
/// Thiết kế: design/scene/hanh_trinh.md (mục 2026-11-13.6). Trang 3D chỉ nhận danh sách vùng đã mở
/// (`getProgress`, docs/bridge.md) — mốc nằm ở đây để tiến độ và luật mở cùng một chỗ, test được bằng Dart.
library;

/// Số bộ thủ của Rừng trúc phải học xong để mở Giang Nam (≈ 50 bộ thủ thường gặp — docs/tham_khao/rung-truc.md).
/// Danh sách bộ thủ thật có ở đợt 2 (bia bộ thủ); tới lúc đó chưa ai đạt mốc này.
const rungTrucRadicalCount = 50;

/// Một vùng trên Truyền Tống Đài. Mã trùng `teleport.regions` trong đặc tả cảnh và tên file `design/scene/<mã>.json`.
class Region {
  const Region(this.id, {this.minChars = 0, this.needsRadicals = false});

  final String id;

  /// số chữ đã học tối thiểu (≥)
  final int minChars;

  /// mở khi đã học đủ bộ thủ của Rừng trúc (Giang Nam)
  final bool needsRadicals;
}

/// Thứ tự = thứ tự cột trận trên đài (trái → phải khi đứng ở lối tây nhìn sang đông).
const regions = [
  Region('rung-truc'),
  Region('giang-nam', needsRadicals: true),
  Region('bong-lai', minChars: 300),
  Region('truong-thanh', minChars: 900),
  Region('tu-cam-thanh', minChars: 1800),
  Region('to-lua', minChars: 3000),
];

/// Tiến độ học: các chữ, bộ thủ đã học (mỗi thứ tính một lần).
class Progress {
  const Progress({this.chars = const {}, this.radicals = const {}});

  final Set<String> chars;
  final Set<String> radicals;

  /// Mốc của các vùng còn khoá (bản đồ ghi "Cần … chữ"): `{mã: {'chars': n}}` hoặc `{mã: {'radicals': n}}`.
  Map<String, Map<String, int>> get needs => {
        for (final r in regions)
          if (!openRegions.contains(r.id))
            r.id: r.needsRadicals ? {'radicals': rungTrucRadicalCount} : {'chars': r.minChars},
      };

  /// Mã các vùng đã mở, theo thứ tự [regions].
  List<String> get openRegions => [
        for (final r in regions)
          if (chars.length >= r.minChars && (!r.needsRadicals || radicals.length >= rungTrucRadicalCount)) r.id,
      ];
}
