// Truy vết quy tắc nghiệp vụ ↔ test. Dart thuần, chạy từ gốc repo.
//
//   dart tool/rule_trace.dart                     tóm tắt; quy tắc ok/tk chưa có test → thoát 1
//   dart tool/rule_trace.dart -v                  thêm số test của từng mã
//   dart tool/rule_trace.dart --mark-synced <mã>... | all
//                                                 ghi dấu nội dung hiện tại vào quy_tac_online.json
//                                                 (sau khi chép quy tắc lên tài liệu xác nhận online)
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
  Rule(this.code, this.text, this.example, this.status, this.exempt);
  final String code;
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
  for (final line in f.readAsLinesSync()) {
    final t = line.trim();
    if (!t.startsWith('| R-')) continue;
    final cells = t.substring(1, t.endsWith('|') ? t.length - 1 : t.length).split('|').map((c) => c.trim()).toList();
    if (cells.length < 3 || !codeRe.hasMatch(cells[0])) continue;
    final last = cells.last;
    final status = last.split(RegExp(r'[\s(,·]')).first.toLowerCase();
    rules.add(Rule(cells[0], cells[1], cells.length > 2 ? cells[2] : '', status, last.contains('miễn test')));
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

void main(List<String> args) {
  final rules = readBook();

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
    stdout.writeln('  chép lên tài liệu xác nhận rồi chạy: dart tool/rule_trace.dart --mark-synced ${unsynced.join(' ')}');
  }

  final missing = needTest.where((r) => !counts.containsKey(r.code)).map((r) => r.code).toList();
  if (missing.isNotEmpty) {
    stdout.writeln('THIẾU TEST: ${missing.join(', ')}');
    exit(1);
  }
}
