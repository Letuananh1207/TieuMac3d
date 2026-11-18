/// Tiến độ học của hành trình (R-HANH-1). Vùng **không khoá** theo tiến độ: mọi vùng đã dựng cảnh đều đi được
/// (trang 3D tự biết vùng nào có cảnh). Ở đây chỉ còn bài / từ đã học — dùng cho tu luyện (R-HANH-3), ôn, nhiệm vụ.
library;

/// Tên hiển thị của các vùng theo mã cảnh (R-HANH-1, V-50). Nguồn là `ten` trong `design/scene/ban-do/ban-do.json`
/// (test `region_names_test.dart` so khớp); mã cảnh không đổi. Chuỗi giao diện nêu tên vùng thì lấy ở đây.
const regionNames = <String, String>{
  'rung-truc': 'Thung Trúc Gió Hát',
  'giang-nam': 'Chợ Đêm Đèn Hoa',
  'bong-lai': 'Cung Ngọc Đáy Biển',
  'truong-thanh': 'Đỉnh Hạc Bay',
  'tu-cam-thanh': 'Rừng Nấm Tiên',
  'to-lua': 'Thành Cát Ngủ Quên',
};

/// Vùng học bài từ (vùng đầu, R-HANH-3) — mặc định của `region` khi trang không gửi.
const firstRegion = 'Thung Trúc Gió Hát';

/// Giáo trình từ vựng (R-TU-1): số bài + số từ — khớp `BAI_HOC` / `TONG_TU` của `web/src/zones/tuVung/` (test
/// `tu_vung_test.dart` đọc `bai.ts` so số bài). Bảng nhiệm vụ dùng để biết đã học hết bài chưa (R-NV-1).
const tuVungLessonCount = 50;
const tuVungWordCount = 304;

/// Tiến độ học (R-TU-1): các bài đã học và các từ của chúng (mỗi thứ một lần). Tiến độ bộ thủ cũ không đọc (R-TU-5).
class Progress {
  const Progress({this.lessons = const [], this.words = const []});

  /// mã bài theo thứ tự đã học
  final List<String> lessons;

  /// mã từ theo thứ tự đã học
  final List<String> words;
}
