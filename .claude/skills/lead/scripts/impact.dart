// Dò ảnh hưởng: file nào dùng (trực tiếp / gián tiếp) các file khớp từ khoá. Dart thuần, chạy từ gốc repo.
//
//   dart .claude/skills/lead/scripts/impact.dart <từ khoá|đoạn đường dẫn>... [--depth N]
//
// Quét: app/lib, app/test (Dart: import/export/part, cả package:<gói>/ lẫn tương đối)
//       web/src (TS: import/export … from, import('…'), tương đối).
// Điểm khởi đầu = file có đường dẫn chứa từ khoá (không phân biệt hoa thường).
// Có đồ thị tri thức (.ua/knowledge-graph.json, .understand-anything/*.json) thì khớp thêm theo tên/tag node.
import 'dart:convert';
import 'dart:io';

final _dartImport = RegExp(r'''^\s*(?:import|export|part)\s+['"]([^'"]+)['"]''', multiLine: true);
final _tsImport = RegExp(r'''(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]''');

bool generated(String p) =>
    p.endsWith('.g.dart') || p.endsWith('.freezed.dart') || p.contains('app_localizations') || p.contains('/node_modules/');

bool isTest(String p) => p.endsWith('_test.dart') || p.endsWith('.test.ts');

String norm(String path) {
  final out = <String>[];
  for (final s in path.split('/')) {
    if (s == '..') {
      if (out.isNotEmpty) out.removeLast();
    } else if (s != '.' && s.isNotEmpty) {
      out.add(s);
    }
  }
  return out.join('/');
}

String packageName() {
  final f = File('app/pubspec.yaml');
  if (!f.existsSync()) return '';
  final m = RegExp(r'^name:\s*(\S+)', multiLine: true).firstMatch(f.readAsStringSync());
  return m?.group(1) ?? '';
}

List<String> collect() {
  final out = <String>[];
  for (final root in ['app/lib', 'app/test', 'app/integration_test', 'web/src']) {
    final d = Directory(root);
    if (!d.existsSync()) continue;
    for (final e in d.listSync(recursive: true)) {
      if (e is! File) continue;
      final p = e.path.replaceAll('\\', '/');
      if (generated(p)) continue;
      if (p.endsWith('.dart') || (p.endsWith('.ts') && !p.endsWith('.d.ts'))) out.add(p);
    }
  }
  return out..sort();
}

/// file → các file nó import (đã phân giải trong repo)
Map<String, Set<String>> edges(List<String> files, String pkg) {
  final set = files.toSet();
  final out = <String, Set<String>>{};
  for (final f in files) {
    final dir = f.substring(0, f.lastIndexOf('/'));
    final src = File(f).readAsStringSync();
    final deps = <String>{};
    if (f.endsWith('.dart')) {
      for (final m in _dartImport.allMatches(src)) {
        final u = m.group(1)!;
        String? t;
        if (pkg.isNotEmpty && u.startsWith('package:$pkg/')) {
          t = 'app/lib/${u.substring('package:$pkg/'.length)}';
        } else if (!u.contains(':')) {
          t = norm('$dir/$u');
        }
        if (t != null && set.contains(t)) deps.add(t);
      }
    } else {
      for (final m in _tsImport.allMatches(src)) {
        final u = m.group(1)!;
        if (!u.startsWith('.')) continue;
        final base = norm('$dir/$u');
        for (final c in [base, '$base.ts', '$base/index.ts']) {
          if (set.contains(c)) {
            deps.add(c);
            break;
          }
        }
      }
    }
    out[f] = deps;
  }
  return out;
}

/// Khớp thêm từ đồ thị tri thức nếu có (tên / tag / mô tả node → filePath).
Set<String> fromKnowledgeGraph(List<String> keys, Set<String> files) {
  final found = <String>{};
  final candidates = <File>[File('.ua/knowledge-graph.json')];
  final dir = Directory('.understand-anything');
  if (dir.existsSync()) {
    candidates.addAll(dir.listSync(recursive: true).whereType<File>().where((f) => f.path.endsWith('.json')));
  }
  for (final f in candidates) {
    if (!f.existsSync()) continue;
    try {
      final j = jsonDecode(f.readAsStringSync());
      final nodes = j is Map ? (j['nodes'] as List? ?? const []) : const [];
      for (final n in nodes) {
        if (n is! Map) continue;
        final path = (n['filePath'] ?? n['file'] ?? n['path'])?.toString().replaceAll('\\', '/');
        if (path == null) continue;
        final hay = '${n['name'] ?? ''} ${(n['tags'] as List?)?.join(' ') ?? ''}'.toLowerCase();
        if (keys.any(hay.contains)) {
          final hit = files.where((p) => p.endsWith(path) || path.endsWith(p));
          found.addAll(hit);
        }
      }
    } catch (_) {}
  }
  return found;
}

void main(List<String> args) {
  var depth = 2;
  final keys = <String>[];
  for (var i = 0; i < args.length; i++) {
    if (args[i] == '--depth' && i + 1 < args.length) {
      depth = int.tryParse(args[++i]) ?? 2;
    } else if (args[i].startsWith('--depth=')) {
      depth = int.tryParse(args[i].substring(8)) ?? 2;
    } else {
      keys.add(args[i].toLowerCase().replaceAll('\\', '/'));
    }
  }
  if (keys.isEmpty) {
    stderr.writeln('Dùng: dart .claude/skills/lead/scripts/impact.dart <từ khoá>... [--depth N]');
    exit(2);
  }

  final files = collect();
  final graph = edges(files, packageName());
  final reverse = <String, Set<String>>{};
  graph.forEach((from, tos) {
    for (final t in tos) {
      reverse.putIfAbsent(t, () => {}).add(from);
    }
  });

  final start = files.where((p) => keys.any((k) => p.toLowerCase().contains(k))).toSet()
    ..addAll(fromKnowledgeGraph(keys, files.toSet()));
  if (start.isEmpty) {
    stdout.writeln('Không có file nào khớp: ${keys.join(', ')}');
    exit(0);
  }

  final seen = {...start};
  final levels = <List<String>>[];
  var frontier = start;
  for (var d = 0; d < depth; d++) {
    final next = <String>{};
    for (final f in frontier) {
      for (final u in reverse[f] ?? const <String>{}) {
        if (seen.add(u)) next.add(u);
      }
    }
    if (next.isEmpty) break;
    levels.add(next.toList()..sort());
    frontier = next;
  }

  final startList = start.where((p) => !isTest(p)).toList()..sort();
  stdout.writeln('Khởi đầu (${startList.length}):');
  for (final p in startList) {
    stdout.writeln('  $p');
  }
  for (var i = 0; i < levels.length; i++) {
    final list = levels[i].where((p) => !isTest(p)).toList();
    if (list.isEmpty) continue;
    stdout.writeln('Dùng chúng — tầng ${i + 1} (${list.length}):');
    for (final p in list) {
      stdout.writeln('  $p');
    }
  }
  final tests = seen.where(isTest).toList()..sort();
  stdout.writeln('Test liên quan (${tests.length}):');
  for (final p in tests) {
    stdout.writeln('  $p');
  }
}
