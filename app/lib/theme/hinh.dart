import 'package:flutter/widgets.dart';

/// Hình minh hoạ đất sét (thiết kế 2026-11-16.2, V-72) — cùng bản ảnh với HUD web (`assets/scene/hinh/`, chép bởi
/// `cd web && npm run build`). Đường dẫn: hằng `AppHinh` (`app_hinh.g.dart`).
///
/// Giải mã đúng cỡ hiển thị (`cacheWidth`) để không giữ ảnh 160 trong bộ nhớ khi chỉ vẽ 24–52; [off] = trạng thái mờ
/// (xám .6 + 50 %), như CSS `--hinh-off-filter` của web. Ảnh lỗi / chưa build → ô trống cùng cỡ (bố cục không nhảy).
class Hinh extends StatelessWidget {
  const Hinh(this.asset, {super.key, required this.size, this.off = false});

  /// Đường dẫn asset, vd. `AppHinh.banDo`.
  final String asset;
  final double size;
  final bool off;

  /// Ma trận xám 60 % (giữ 40 % màu) — cùng phép `grayscale(.6)` của CSS.
  static const _gray60 = <double>[
    0.4 + 0.6 * 0.2126, 0.6 * 0.7152, 0.6 * 0.0722, 0, 0, //
    0.6 * 0.2126, 0.4 + 0.6 * 0.7152, 0.6 * 0.0722, 0, 0, //
    0.6 * 0.2126, 0.6 * 0.7152, 0.4 + 0.6 * 0.0722, 0, 0, //
    0, 0, 0, 1, 0,
  ];

  @override
  Widget build(BuildContext context) {
    final dpr = MediaQuery.maybeDevicePixelRatioOf(context) ?? 1;
    Widget img = Image.asset(
      asset,
      width: size,
      height: size,
      fit: BoxFit.contain,
      cacheWidth: (size * dpr).ceil(),
      filterQuality: FilterQuality.medium,
      excludeFromSemantics: true,
      errorBuilder: (_, _, _) => SizedBox.square(dimension: size),
    );
    if (off) img = Opacity(opacity: 0.5, child: ColorFiltered(colorFilter: const ColorFilter.matrix(_gray60), child: img));
    return img;
  }
}
