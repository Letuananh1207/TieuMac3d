/// Sự kiện Tàng Thư Các qua cầu nối (docs/bridge.md `openLibrary`, `openBook`) — R-SACH-1…4. Dữ liệu sách do trang giữ
/// (`web/src/zones/books.ts`); Flutter hiện danh mục, sổ từ, ghi cuốn đang mượn + trang đang đọc.
library;

/// Một cuốn trong danh mục (6 cuốn theo thứ tự cấp).
class BookEntry {
  const BookEntry({required this.id, required this.title, required this.subtitle, required this.words, required this.ready, this.planned = 0});

  /// `hsk1` … `hsk6`
  final String id;

  /// "HSK 1"
  final String title;

  /// "Nhập môn"
  final String subtitle;

  /// số từ đã soạn · số từ dự kiến (khi chưa soạn)
  final int words;
  final int planned;

  /// đã soạn xong → mượn được
  final bool ready;

  /// Cấp 1…6 (từ mã `hskN`); không đọc được → 0.
  int get level => int.tryParse(id.replaceAll(RegExp(r'\D'), '')) ?? 0;
}

/// JS nhờ mở danh mục sách (chọn "Mượn sách" với thủ thư — R-SACH-1).
class OpenLibraryRequest {
  const OpenLibraryRequest({required this.books, this.borrowed});

  final List<BookEntry> books;

  /// mã cuốn đang mượn; `null` = không mượn
  final String? borrowed;

  static OpenLibraryRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openLibrary');
    final list = p?['books'];
    if (p == null || list is! List) return null;
    final books = [for (final b in list) ?_book(b)];
    if (books.isEmpty) return null;
    final borrowed = p['borrowed'];
    return OpenLibraryRequest(books: books, borrowed: borrowed is String && borrowed.isNotEmpty ? borrowed : null);
  }
}

/// Câu ví dụ của một từ.
class WordExample {
  const WordExample({required this.han, required this.pinyin, required this.meaning});

  final String han;
  final String pinyin;
  final String meaning;
}

/// Một trang sổ từ.
class BookWord {
  const BookWord({required this.han, required this.pinyin, required this.meaning, this.example});

  final String han;
  final String pinyin;
  final String meaning;
  final WordExample? example;
}

/// JS nhờ mở sổ từ cuốn đang mượn (nút "Đọc sách" — R-SACH-3).
class OpenBookRequest {
  const OpenBookRequest({required this.id, required this.title, required this.subtitle, required this.words});

  final String id;
  final String title;
  final String subtitle;
  final List<BookWord> words;

  static OpenBookRequest? parse(List<dynamic> args) {
    final p = _payload(args, 'openBook');
    final b = p?['book'];
    final list = p?['words'];
    if (b is! Map || list is! List) return null;
    final id = b['id'], title = b['title'], subtitle = b['subtitle'];
    if (id is! String || title is! String) return null;
    final words = <BookWord>[];
    for (final w in list) {
      if (w is! Map || w['han'] is! String || w['pinyin'] is! String || w['meaning'] is! String) continue;
      final ex = w['example'];
      words.add(BookWord(
        han: w['han'] as String,
        pinyin: w['pinyin'] as String,
        meaning: w['meaning'] as String,
        example: ex is Map && ex['han'] is String && ex['pinyin'] is String && ex['meaning'] is String
            ? WordExample(han: ex['han'] as String, pinyin: ex['pinyin'] as String, meaning: ex['meaning'] as String)
            : null,
      ));
    }
    if (words.isEmpty) return null;
    return OpenBookRequest(id: id, title: title, subtitle: subtitle is String ? subtitle : '', words: words);
  }
}

BookEntry? _book(Object? b) {
  if (b is! Map) return null;
  final id = b['id'], title = b['title'], subtitle = b['subtitle'], words = b['words'], ready = b['ready'], planned = b['planned'];
  if (id is! String || title is! String || subtitle is! String) return null;
  return BookEntry(
    id: id,
    title: title,
    subtitle: subtitle,
    words: words is num ? words.toInt() : 0,
    planned: planned is num ? planned.toInt() : 0,
    ready: ready == true,
  );
}

Map<dynamic, dynamic>? _payload(List<dynamic> args, String type) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != type) return null;
  final p = e['payload'];
  return p is Map ? p : null;
}
