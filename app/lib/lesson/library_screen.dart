import 'package:flutter/material.dart';

import '../scene/library_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'book_cover.dart';
import 'screen_parts.dart';

/// Danh mục sách Tàng Thư Các (native) — R-SACH-1, R-SACH-4. Thiết kế: design/docs/screen_specs.md "Danh mục sách Tàng Thư
/// Các" (artboard `DanhMuc-doc`, `-doc-xac-nhan`, `-doc-dang-giu`, `-ngang`). Kệ gỗ 2 tầng × 3 cuốn; chạm cuốn đã soạn →
/// thẻ xác nhận "Mượn" ([onBorrow] ghi mượn → đóng, trả `true`); đang giữ cuốn khác → chỉ xem. Đóng: "Đóng" / quay lại.
class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key, required this.request, required this.onBorrow});

  final OpenLibraryRequest request;
  final Future<bool> Function(String id) onBorrow;

  static Route<bool> route(OpenLibraryRequest request, Future<bool> Function(String id) onBorrow) =>
      fadeRoute(LibraryScreen(request: request, onBorrow: onBorrow));

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  BookEntry? _picked;
  String? _notice;

  String? get _holding => widget.request.borrowed;

  BookEntry? _byId(String? id) => widget.request.books.where((b) => b.id == id).firstOrNull;

  void _tap(BookEntry b) {
    setState(() {
      _notice = null;
      if (!b.ready) {
        _picked = null;
        _notice = '${b.title} đang biên soạn — chưa mượn được.'; // libDrafting
      } else if (_holding == null) {
        _picked = b;
      }
    });
  }

  Future<void> _borrow(BookEntry b) async {
    final nav = Navigator.of(context);
    final ok = await widget.onBorrow(b.id);
    nav.pop(ok);
  }

  @override
  Widget build(BuildContext context) {
    void close() => Navigator.of(context).pop(false);
    return ScreenFrame(builder: (context, landscape) {
      final picked = _picked;
      final confirm = picked == null ? null : _Confirm(book: picked, onCancel: () => setState(() => _picked = null), onBorrow: () => _borrow(picked));
      final closeBtn = SecondaryButton(label: 'Đóng', icon: Icons.close, height: landscape ? 48 : 52, onPressed: close); // libClose
      final card = SilkCard(
        padding: landscape ? const EdgeInsets.symmetric(horizontal: 16, vertical: 14) : const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _title(landscape),
            SizedBox(height: landscape ? 12 : 18),
            if (_holding != null) ...[_HoldingNote(title: _byId(_holding)?.title ?? ''), const SizedBox(height: 14)],
            if (_notice != null) ...[
              Text(_notice!, textAlign: TextAlign.center, style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, color: AppColors.lacquer)),
              const SizedBox(height: 10),
            ],
            if (landscape)
              _Shelf(books: widget.request.books, width: 72, picked: _picked, holding: _holding, onTap: _tap)
            else ...[
              _Shelf(books: widget.request.books.take(3).toList(), width: 96, picked: _picked, holding: _holding, onTap: _tap),
              const SizedBox(height: 22),
              _Shelf(books: widget.request.books.skip(3).toList(), width: 96, picked: _picked, holding: _holding, onTap: _tap),
            ],
          ],
        ),
      );
      if (landscape) {
        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: card),
            const SizedBox(width: 14),
            SizedBox(
              width: 190,
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [closeBtn, const Spacer(), ?confirm]),
            ),
          ],
        );
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Eyebrow('Tàng Thư Các · quầy mượn sách'), // libEyebrow
          const SizedBox(height: 14),
          Expanded(child: card),
          const SizedBox(height: 14),
          confirm ?? closeBtn,
        ],
      );
    });
  }

  Widget _title(bool landscape) {
    final han = Text('藏書閣', style: hanText.copyWith(fontSize: AppTextSize.libTitle, letterSpacing: AppTextSize.libTitle * .1));
    final name = Text('Sổ từ HSK', style: uiText.copyWith(fontSize: AppTextSize.body, fontWeight: FontWeight.w700)); // libTitle
    const sub = 'Mỗi lần mượn một cuốn · mang theo đi khắp nơi'; // libSubtitle
    if (landscape) {
      return Row(children: [han, const SizedBox(width: 12), name, const SizedBox(width: 10), Expanded(child: Text(sub, style: uiText.copyWith(fontSize: AppTextSize.small)))]);
    }
    return Column(children: [han, const SizedBox(height: 2), name, const SizedBox(height: 2), Text(sub, textAlign: TextAlign.center, style: uiText.copyWith(fontSize: AppTextSize.small))]);
  }
}

/// Một tầng kệ: các cuốn đứng trên thanh gỗ `shelf-wood` cao 10, bóng dưới.
class _Shelf extends StatelessWidget {
  const _Shelf({required this.books, required this.width, required this.picked, required this.holding, required this.onTap});

  final List<BookEntry> books;
  final double width;
  final BookEntry? picked;
  final String? holding;
  final void Function(BookEntry) onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 0, 4, 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [for (final b in books) Flexible(child: _Book(book: b, width: width, picked: picked?.id == b.id, holding: holding, onTap: () => onTap(b)))],
          ),
        ),
        Container(
          height: 10,
          decoration: BoxDecoration(
            color: AppColors.shelfWood,
            borderRadius: BorderRadius.circular(2),
            boxShadow: [
              const BoxShadow(color: AppColors.shelfShadow, offset: Offset(0, 4)),
              BoxShadow(color: AppColors.slate.withValues(alpha: .2), offset: const Offset(0, 8), blurRadius: 10),
            ],
          ),
        ),
      ],
    );
  }
}

class _Book extends StatelessWidget {
  const _Book({required this.book, required this.width, required this.picked, required this.holding, required this.onTap});

  final BookEntry book;
  final double width;
  final bool picked;
  final String? holding;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final mine = holding == book.id;
    final viewOnly = holding != null && !mine && book.ready; // đang giữ cuốn khác → chỉ xem (R-SACH-4)
    final label = book.ready ? '${book.title} ${book.subtitle}, ${book.words} từ' : '${book.title} ${book.subtitle}, đang biên soạn';
    return Semantics(
      button: true,
      selected: picked,
      label: mine ? '$label, đang mượn' : label,
      child: ExcludeSemantics(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: Opacity(
            opacity: viewOnly ? .55 : 1,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.topCenter,
                  children: [
                    BookCover(book: book, width: width, selected: picked),
                    if (mine) const Positioned(top: -11, child: BorrowedTag()),
                  ],
                ),
                const SizedBox(height: 6),
                Text(book.subtitle, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700)),
                Text(
                  book.ready ? '${book.words} từ' : 'Đang biên soạn', // libWords / libDrafting
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: book.ready ? FontWeight.w500 : FontWeight.w700, color: book.ready ? AppColors.slate : AppColors.lacquer),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Lời nhắc khi đang giữ cuốn khác (nền vàng 14 %, viền vàng, biểu tượng i) — R-SACH-4.
class _HoldingNote extends StatelessWidget {
  const _HoldingNote({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.gold.withValues(alpha: .14),
          border: Border.all(color: AppColors.gold),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline, size: 18, color: AppColors.slate),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Đang giữ «$title». Trả cuốn đang giữ trước đã — nói với thủ thư "Trả sách".', // libHolding
                style: uiText.copyWith(fontSize: AppTextSize.small, height: 1.45),
              ),
            ),
          ],
        ),
      );
}

/// Thẻ xác nhận đáy: bìa mini + "Mượn «HSK 2 · Sơ cấp»?" + "Chọn cuốn khác" / "Mượn".
class _Confirm extends StatelessWidget {
  const _Confirm({required this.book, required this.onCancel, required this.onBorrow});

  final BookEntry book;
  final VoidCallback onCancel;
  final VoidCallback onBorrow;

  @override
  Widget build(BuildContext context) {
    final landscape = MediaQuery.of(context).size.width > MediaQuery.of(context).size.height;
    final buttons = [
      SecondaryButton(label: 'Chọn cuốn khác', onPressed: onCancel), // libPickOther
      PrimaryButton(label: 'Mượn', icon: Icons.menu_book, onPressed: onBorrow), // libBorrow
    ];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.frostStrong,
        border: Border.all(color: AppColors.frostOutline),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: AppColors.cardShadow, offset: Offset(0, -6), blurRadius: 24)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              BookCover(book: book, width: 44),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Mượn «${book.title} · ${book.subtitle}»?', style: uiText.copyWith(fontSize: landscape ? AppTextSize.detail : AppTextSize.task, fontWeight: FontWeight.w700)), // libConfirm
                    const SizedBox(height: 2),
                    Text('${book.words} từ · chữ giản thể 简体 · không hạn trả', style: uiText.copyWith(fontSize: landscape ? AppTextSize.caption : AppTextSize.small)), // libConfirmSub
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (landscape)
            ...[buttons[1], const SizedBox(height: 8), buttons[0]]
          else
            Row(children: [buttons[0], const SizedBox(width: 10), Expanded(child: buttons[1])]),
        ],
      ),
    );
  }
}
