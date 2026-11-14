/// Tiến độ học của hành trình (R-HANH-1). Vùng **không khoá** theo tiến độ: mọi vùng đã dựng cảnh đều đi được
/// (trang 3D tự biết vùng nào có cảnh). Ở đây chỉ còn chữ, bộ thủ đã học — dùng cho tu luyện (R-HANH-3), ôn, nhiệm vụ.
library;

/// Số bộ thủ bài học của Rừng trúc (≈ 50 bộ thủ thường gặp — docs/tham_khao/rung-truc.md); bảng nhiệm vụ dùng để
/// biết đã học hết bộ mới chưa (R-NV-1).
const rungTrucRadicalCount = 50;

/// Tiến độ học: các chữ, bộ thủ đã học (mỗi thứ tính một lần).
class Progress {
  const Progress({this.chars = const {}, this.radicals = const {}});

  final Set<String> chars;
  final Set<String> radicals;
}
