/// Tiến độ học của hành trình (R-HANH-1). Vùng **không khoá** theo tiến độ: mọi vùng đã dựng cảnh đều đi được
/// (trang 3D tự biết vùng nào có cảnh). Ở đây chỉ còn chữ, bộ thủ đã học — dùng cho tu luyện (R-HANH-3), ôn, nhiệm vụ.
library;

/// Tên hiển thị của các vùng theo mã cảnh (R-HANH-1, V-50). Nguồn là `ten` trong `design/scene/ban-do/ban-do.json`
/// (test `region_names_test.dart` so khớp); mã cảnh không đổi. Chuỗi giao diện nêu tên vùng thì lấy ở đây.
const regionNames = <String, String>{
  'rung-truc': 'Trúc Lâm',
  'giang-nam': 'Yên Vũ Lâu',
  'bong-lai': 'Bồng Lai Đảo',
  'truong-thanh': 'Nhạn Môn Quan',
  'tu-cam-thanh': 'Tử Cấm Thành',
  'to-lua': 'Đôn Hoàng Lộ',
};

/// Vùng học bộ thủ (vùng đầu, R-HANH-3) — mặc định của `region` khi trang không gửi.
const firstRegion = 'Trúc Lâm';

/// Số bộ thủ bài học của Rừng trúc (≈ 50 bộ thủ thường gặp — docs/tham_khao/rung-truc.md); bảng nhiệm vụ dùng để
/// biết đã học hết bộ mới chưa (R-NV-1).
const rungTrucRadicalCount = 50;

/// Tiến độ học: các chữ, bộ thủ đã học (mỗi thứ tính một lần).
class Progress {
  const Progress({this.chars = const {}, this.radicals = const {}});

  final Set<String> chars;
  final Set<String> radicals;
}
