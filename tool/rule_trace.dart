// Truy vết quy tắc nghiệp vụ ↔ test. Dart thuần, chạy từ gốc repo.
//
//   dart tool/rule_trace.dart                     tóm tắt; quy tắc ok/tk chưa có test → thoát 1
//   dart tool/rule_trace.dart -v                  thêm số test của từng mã
//   dart tool/rule_trace.dart --mark-synced <mã>... | all
//                                                 ghi dấu nội dung hiện tại vào quy_tac_online.json
//                                                 (sau khi chép quy tắc lên tài liệu xác nhận online)
//   dart tool/rule_trace.dart --pending           quy tắc chờ đồng bộ: MỚI / ĐỔI / XOÁ, nhóm, dòng bảng để chép
//                                                 (skill /dong-bo-quy-tac đọc đầu ra này rồi tự ghi lên tài liệu)
//
// Sổ: docs/testing/quy_tac.md, dòng bảng `| R-… | Quy tắc | Ví dụ | Xác nhận | App |`.
// Test: mã R-[A-Z]+-\d+ trong app/test, app/integration_test (*_test.dart) và web/ (*.test.ts).
// Dấu nội dung: FNV-1a 32 bit trên "Quy tắc + Ví dụ" đã gộp khoảng trắng (đổi Xác nhận / App không tính).
import 'dart:convert';
import 'dart:io';

const bookPath = 'docs/testing/quy_tac.md';
const onlinePath = 'docs/testing/quy_tac_online.json';
final codeRe = RegExp(r'R-[A-Z]+-\d+');

class Rule {
  Rule(this.code, this.text, this.example, this.status, this.exempt, this.group);
  final String code;
  /// tiêu đề nhóm trong sổ, vd. "CHAT — trò chuyện kênh chung"
  final String group;
  final String text;
  final String example;
  final String status;
  final bool exempt;
  String get fingerprint => fnv1a('${squash(text)} ${squash(example)}');
}

String squash(String s) => s.trim().replaceAll(RegExp(r'\s+'), ' ');

String fnv1a(String s) {
  var h = 0x811c9dc5;
  for (final b in utf8.encode(s)) {
    h ^= b;
    h = (h * 0x01000193) & 0xffffffff;
  }
  return h.toRadixString(16).padLeft(8, '0');
}

List<Rule> readBook() {
  final f = File(bookPath);
  if (!f.existsSync()) {
    stderr.writeln('Không thấy $bookPath');
    exit(2);
  }
  final rules = <Rule>[];
  var group = '';
  for (final line in f.readAsLinesSync()) {
    final t = line.trim();
    if (t.startsWith('## ')) group = t.substring(3).trim();
    if (!t.startsWith('| R-')) continue;
    final cells = t.substring(1, t.endsWith('|') ? t.length - 1 : t.length).split('|').map((c) => c.trim()).toList();
    if (cells.length < 3 || !codeRe.hasMatch(cells[0])) continue;
    final last = cells.last;
    final status = last.split(RegExp(r'[\s(,·]')).first.toLowerCase();
    rules.add(Rule(cells[0], cells[1], cells.length > 2 ? cells[2] : '', status, last.contains('miễn test'), group));
  }
  return rules;
}

/// mã → số lần xuất hiện trong file test
Map<String, int> scanTests() {
  final counts = <String, int>{};
  final roots = ['app/test', 'app/integration_test', 'web/src', 'web/test'];
  for (final root in roots) {
    final dir = Directory(root);
    if (!dir.existsSync()) continue;
    for (final e in dir.listSync(recursive: true)) {
      if (e is! File) continue;
      final p = e.path.replaceAll('\\', '/');
      if (p.contains('/node_modules/')) continue;
      if (!p.endsWith('_test.dart') && !p.endsWith('.test.ts')) continue;
      for (final m in codeRe.allMatches(e.readAsStringSync())) {
        counts.update(m.group(0)!, (v) => v + 1, ifAbsent: () => 1);
      }
    }
  }
  return counts;
}

Map<String, dynamic> readOnline() {
  final f = File(onlinePath);
  if (!f.existsSync()) return {'doc': '', 'rules': <String, dynamic>{}};
  try {
    final j = jsonDecode(f.readAsStringSync());
    if (j is Map<String, dynamic>) return j;
  } catch (_) {}
  return {'doc': '', 'rules': <String, dynamic>{}};
}

void markSynced(List<Rule> rules, List<String> codes) {
  final online = readOnline();
  final old = Map<String, dynamic>.from(online['rules'] as Map? ?? {});
  final byCode = {for (final r in rules) r.code: r};
  final targets = codes.contains('all') ? byCode.keys.toSet() : codes.toSet();
  final unknown = targets.where((c) => !byCode.containsKey(c)).toList();
  if (unknown.isNotEmpty) {
    stderr.writeln('Mã không có trong sổ: ${unknown.join(', ')}');
    exit(2);
  }
  // giữ thứ tự sổ, bỏ mã đã xoá khỏi sổ
  final next = <String, String>{};
  for (final r in rules) {
    if (targets.contains(r.code)) {
      next[r.code] = r.fingerprint;
    } else if (old[r.code] is String) {
      next[r.code] = old[r.code] as String;
    }
  }
  final out = {'doc': online['doc'] ?? '', 'rules': next};
  File(onlinePath).writeAsStringSync('${const JsonEncoder.withIndent('  ').convert(out)}\n');
  stdout.writeln('Đã đánh dấu đồng bộ online: ${targets.length} quy tắc.');
}

/// Quy tắc chờ đồng bộ, theo nhóm: MỚI (chưa có trên tài liệu) · ĐỔI (nội dung khác lần chép trước) · XOÁ (bỏ khỏi sổ).
void printPending(List<Rule> rules) {
  final synced = Map<String, dynamic>.from(readOnline()['rules'] as Map? ?? {});
  final todo = rules.where((r) => synced[r.code] != r.fingerprint).toList();
  final gone = synced.keys.where((c) => !rules.any((r) => r.code == c)).toList();
  if (todo.isEmpty && gone.isEmpty) {
    stdout.writeln('Không có quy tắc chờ đồng bộ.');
    return;
  }
  stdout.writeln('Tài liệu: ${readOnline()['doc']}');
  String? last;
  for (final r in todo) {
    if (r.group != last) {
      stdout.writeln('\n## ${r.group}');
      last = r.group;
    }
    final kind = synced.containsKey(r.code) ? 'ĐỔI (đưa ô Xác nhận về Chờ)' : 'MỚI';
    stdout.writeln('- ${r.code} · $kind');
    stdout.writeln('  | ${r.code} | ${r.text} | ${r.example} |');
  }
  if (gone.isNotEmpty) stdout.writeln('\nXOÁ (không còn trong sổ — xoá hàng trên tài liệu): ${gone.join(', ')}');
  stdout.writeln('\nChép xong: dart tool/rule_trace.dart --mark-synced ${todo.map((r) => r.code).join(' ')}${gone.isEmpty ? '' : ' (+ --forget ${gone.join(' ')})'}');
}

/// Bỏ mã đã xoá khỏi sổ ra khỏi quy_tac_online.json (sau khi xoá hàng trên tài liệu).
void forget(List<String> codes) {
  final online = readOnline();
  final rules = Map<String, dynamic>.from(online['rules'] as Map? ?? {})..removeWhere((k, _) => codes.contains(k));
  File(onlinePath).writeAsStringSync('${const JsonEncoder.withIndent('  ').convert({'doc': online['doc'] ?? '', 'rules': rules})}\n');
  stdout.writeln('Đã bỏ khỏi danh sách đồng bộ: ${codes.join(', ')}');
}

void main(List<String> args) {
  final rules = readBook();
  if (args.contains('--pending')) {
    printPending(rules);
    return;
  }
  final fi = args.indexOf('--forget');
  if (fi >= 0) {
    forget(args.sublist(fi + 1).where((a) => !a.startsWith('-')).toList());
    return;
  }

  final mi = args.indexOf('--mark-synced');
  if (mi >= 0) {
    final codes = args.sublist(mi + 1).where((a) => !a.startsWith('-')).toList();
    if (codes.isEmpty) {
      stderr.writeln('Thiếu mã: --mark-synced <R-…>... | all');
      exit(2);
    }
    markSynced(rules, codes);
    return;
  }

  final verbose = args.contains('-v');
  final counts = scanTests();
  final byStatus = <String, int>{};
  for (final r in rules) {
    byStatus.update(r.status, (v) => v + 1, ifAbsent: () => 1);
  }
  final needTest = rules.where((r) => (r.status == 'ok' || r.status == 'tk') && !r.exempt).toList();
  final tested = needTest.where((r) => counts.containsKey(r.code)).length;
  final statusText = byStatus.entries.map((e) => '${e.key} ${e.value}').join(' · ');
  stdout.writeln('Quy tắc: ${rules.length} ($statusText) · ok/tk có test: $tested/${needTest.length}');

  final pending = rules.where((r) => r.status == 'sửa').map((r) => r.code).toList();
  if (pending.isNotEmpty) stdout.writeln('Đang chờ sửa code: ${pending.join(', ')}');

  final known = rules.map((r) => r.code).toSet();
  final stray = counts.keys.where((c) => !known.contains(c)).toList()..sort();
  if (stray.isNotEmpty) stdout.writeln('Mã có trong test nhưng không có trong sổ: ${stray.join(', ')}');

  if (verbose) {
    for (final r in rules) {
      stdout.writeln('  ${r.code.padRight(12)} ${r.status.padRight(5)} ${counts[r.code] ?? 0} test');
    }
  }

  final online = readOnline();
  final synced = Map<String, dynamic>.from(online['rules'] as Map? ?? {});
  final unsynced = rules.where((r) => synced[r.code] != r.fingerprint).map((r) => r.code).toList();
  if (unsynced.isNotEmpty) {
    stdout.writeln('Chưa đồng bộ online ($onlinePath): ${unsynced.join(', ')}');
    stdout.writeln('  đồng bộ tự động: skill /dong-bo-quy-tac (dart tool/rule_trace.dart --pending để xem)');
  }

  final missing = needTest.where((r) => !counts.containsKey(r.code)).map((r) => r.code).toList();
  if (missing.isNotEmpty) {
    stdout.writeln('THIẾU TEST: ${missing.join(', ')}');
    exit(1);
  }
}
