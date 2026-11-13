import 'package:flutter/material.dart';

import '../scene/library_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';

/// Bìa sổ từ HSK (danh mục sách, thẻ xác nhận, nút "Đọc sách" — thiết kế 2026-11-13.28): số cấp chữ Hán, "HSK n", "简体",
/// gáy tối bên trái, khung chỉ vàng mảnh.

const _levelHan = ['', '一', '二', '三', '四', '五', '六'];

/// Màu bìa theo cấp — cuốn đã soạn: HSK 1 ngọc, HSK 2 chàm; cuốn soạn sau lấy tiếp từ token, mỗi cuốn một màu.
const _coverColors = [AppColors.jade, AppColors.slate, AppColors.lacquer, AppColors.shelfWood, AppColors.shelfShadow, AppColors.jade];

/// Chữ Hán của cấp (一 … 六).
String levelHan(int level) => level > 0 && level < _levelHan.length ? _levelHan[level] : '';

/// Màu bìa của cuốn cấp [level].
Color coverColor(int level) => _coverColors[(level - 1).clamp(0, _coverColors.length - 1)];

class BookCover extends StatelessWidget {
  const BookCover({super.key, required this.book, this.width = 96, this.selected = false});

  final BookEntry book;
  final double width;

  /// đang chọn → viền vàng 3 cách 3
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final h = width * 4 / 3;
    final small = width < 60;
    final ready = book.ready;
    final fg = ready ? AppColors.onJade : AppColors.slate.withValues(alpha: .6);
    final cover = Container(
      width: width,
      height: h,
      decoration: BoxDecoration(
        color: ready ? coverColor(book.level) : AppColors.onJade.withValues(alpha: .5),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(4),
          bottomLeft: Radius.circular(4),
          topRight: Radius.circular(8),
          bottomRight: Radius.circular(8),
        ),
        border: ready ? null : Border.all(color: AppColors.slate.withValues(alpha: .35), width: 1.5),
        boxShadow: ready ? const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, 6), blurRadius: 12)] : null,
      ),
      child: Stack(
        children: [
          // gáy tối 6 px bên trái
          if (ready)
            Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: small ? 4 : 6,
              child: ColoredBox(color: Colors.black.withValues(alpha: .18)),
            ),
          // khung chỉ vàng trong bìa
          if (ready && !small)
            Positioned(
              left: 12,
              right: 8,
              top: 8,
              bottom: 8,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.gold.withValues(alpha: .7)),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(levelHan(book.level), style: hanText.copyWith(fontSize: width * .35, height: 1, color: fg)),
                SizedBox(height: small ? 2 : 4),
                Text(book.title, style: uiText.copyWith(fontSize: small ? AppTextSize.tiny : (ready ? AppTextSize.small : AppTextSize.caption), fontWeight: FontWeight.w700, color: fg)),
              ],
            ),
          ),
          if (ready && !small)
            Positioned(
              right: 12,
              bottom: 11,
              child: Opacity(
                opacity: .85,
                child: Text('简体', style: hanText.copyWith(fontSize: AppTextSize.tiny, color: AppColors.onJade)),
              ),
            ),
        ],
      ),
    );
    if (!selected) return cover;
    return DecoratedBox(
      position: DecorationPosition.foreground,
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.gold, width: 3, strokeAlign: 6 / 3),
        borderRadius: BorderRadius.circular(10),
      ),
      child: cover,
    );
  }
}

/// Viên vàng "Đang mượn" chồng mép trên bìa.
class BorrowedTag extends StatelessWidget {
  const BorrowedTag({super.key});

  @override
  Widget build(BuildContext context) => Container(
        height: 22,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        alignment: Alignment.center,
        decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(999)),
        child: Text('Đang mượn', style: uiText.copyWith(fontSize: AppTextSize.eyebrow, fontWeight: FontWeight.w700)), // libBorrowed
      );
}
