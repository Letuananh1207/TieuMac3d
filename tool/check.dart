// Kiểm quy tắc của bộ chuẩn code (.claude/skills/hoc-xa-3d-dev). Dart thuần, chạy từ gốc repo.
//
//   dart tool/check.dart              quét toàn bộ web/ và app/lib/
//   dart tool/check.dart --changed    chỉ file đổi so với HEAD (kể cả file mới chưa track)
//   --summary   chỉ in số đếm theo quy tắc
//   --report    luôn thoát 0
//   --max=N     số chỗ in tối đa mỗi quy tắc (mặc định 20)
//
// Quy tắc (E = lỗi, thoát 1 · W = cảnh báo):
//   E-LOP    web/src: import sai lớp theo bảng phụ thuộc (decisions/0001-kien-truc.md)
//   E-CDN    web/: nạp mã / style / font từ http(s) — app phải chạy offline
//   E-BONG   web/src: bật shadow realtime (castShadow / receiveShadow / shadowMap.enabled = true)
//   W-LOPMOI web/src: thư mục mới chưa có trong bảng phụ thuộc
//   W-ANY    web/src: dùng kiểu any
//   W-HTML   web/src: gán innerHTML / outerHTML / insertAdjacentHTML (dùng textContent + createElement)
//   W-MAU    app/lib: Color(0x…) viết thẳng ngoài file màu (*color*.dart, theme/)
//   W-COCHU  app/lib: fontSize: <số> viết thẳng
//   W-DAI    file quá 400 dòng
//
// Đổi bảng phụ thuộc: sửa LAYERS dưới đây và decisions/0001-kien-truc.md cùng lúc.
import 'dart:io';

/// Thư mục cấp 1 trong web/src → các thư mục / gói được phép import.
/// 'three' = gói three và three/examples/... File ở gốc web/src (main.ts) được import mọi thứ.
const layers = <String, Set<String>>{
  'collision': {},
  'zones': {'collision'},
  'games': {'zones'},
  'scene': {'collision', 'three'},
  'player': {'collision', 'scene', 'three'},
  'input': {'player', 'three'},
  'ui': {'zones', 'three'},
  'bridge': {'zones'},
};

const descriptions = <String, String>{
  'E-LOP': 'import sai lớp (xem bảng trong decisions/0001-kien-truc.md)',
  'E-CDN': 'nạp tài nguyên từ http(s) — app chạy offline, đóng gói qua npm',
  'E-BONG': 'bật shadow realtime — dùng bóng giả (đĩa mờ dưới chân)',
  'W-LOPMOI': 'thư mục mới chưa có trong bảng phụ thuộc — thêm vào LAYERS + decisions/0001',
  'W-ANY': 'dùng kiểu any',
  'W-HTML': 'gán HTML thô — dùng textContent + createElement',
  'W-MAU': 'Color(0x…) viết thẳng ngoài file màu',
  'W-COCHU': 'fontSize viết bằng số',
  'W-DAI': 'file quá 400 dòng — cân nhắc tách',
};

class Hit {
  Hit(this.rule, this.path, this.line, this.text);
  final String rule;
  final String path;
  final int line;
  final String text;
}

final _importRe = RegExp(r'''(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]''');
final _cdnHtmlRe = RegExp(r'''(?:src|href)\s*=\s*["']\s*(?:https?:)?//''', caseSensitive: false);
final _cdnCssRe = RegExp(r'''@import\s+(?:url\()?\s*['"]?\s*https?://''', caseSensitive: false);
final _shadowRe = RegExp(r'(?:castShadow|receiveShadow|shadowMap\.enabled)\s*=\s*true');
final _anyRe = RegExp(r'(?::\s*any\b|\bas\s+any\b|<any>|any\[\])');
final _htmlRe = RegExp(r'(?:\.innerHTML\s*[+]?=|\.outerHTML\s*=|insertAdjacentHTML\s*\()');
final _colorRe = RegExp(r'\bColor\(\s*0x');
final _fontSizeRe = RegExp(r'\bfontSize\s*:\s*\d');

bool isGenerated(String p) =>
    p.endsWith('.g.dart') ||
    p.endsWith('.freezed.dart') ||
    p.endsWith('.gr.dart') ||
    p.contains('app_localizations') ||
    p.endsWith('firebase_options.dart') ||
    p.contains('/node_modules/') ||
    p.startsWith('web/dist/') ||
    p.startsWith('app/assets/scene/');

bool inScope(String p) {
  if (isGenerated(p)) return false;
  if (p.startsWith('web/src/') && (p.endsWith('.ts') || p.endsWith('.css'))) return true;
  if (p == 'web/index.html') return true;
  if (p.startsWith('app/lib/') && p.endsWith('.dart')) return true;
  return false;
}

List<String> allFiles() {
  final out = <String>[];
  for (final root in ['web/src', 'app/lib']) {
    final dir = Directory(root);
    if (!dir.existsSync()) continue;
    for (final e in dir.listSync(recursive: true)) {
      if (e is File) out.add(e.path.replaceAll('\\', '/'));
    }
  }
  if (File('web/index.html').existsSync()) out.add('web/index.html');
  return out.where(inScope).toList()..sort();
}

List<String> changedFiles() {
  String git(List<String> args) {
    final r = Process.runSync('git', args, runInShell: true, stdoutEncoding: SystemEncoding());
    return r.exitCode == 0 ? r.stdout as String : '';
  }

  final names = {
    ...git(['diff', '--name-only', 'HEAD']).split('\n'),
    ...git(['ls-files', '--others', '--exclude-standard']).split('\n'),
  }.map((s) => s.trim()).where((s) => s.isNotEmpty);
  return names.where((p) => inScope(p) && File(p).existsSync()).toList()..sort();
}

/// Thư mục cấp 1 trong web/src của một đường dẫn đã chuẩn hoá; '' nếu nằm ở gốc.
String layerOf(String path) {
  final rest = path.substring('web/src/'.length);
  final i = rest.indexOf('/');
  return i < 0 ? '' : rest.substring(0, i);
}

String normalize(String path) {
  final parts = <String>[];
  for (final s in path.split('/')) {
    if (s == '..') {
      if (parts.isNotEmpty) parts.removeLast();
    } else if (s != '.' && s.isNotEmpty) {
      parts.add(s);
    }
  }
  return parts.join('/');
}

void scanFile(String path, List<Hit> hits) {
  final lines = File(path).readAsLinesSync();
  void hit(String rule, int i) => hits.add(Hit(rule, path, i + 1, lines[i].trim()));

  if (lines.length > 400) hits.add(Hit('W-DAI', path, lines.length, '${lines.length} dòng'));

  if (path == 'web/index.html' || path.endsWith('.css')) {
    for (var i = 0; i < lines.length; i++) {
      if (_cdnHtmlRe.hasMatch(lines[i]) || _cdnCssRe.hasMatch(lines[i])) hit('E-CDN', i);
    }
    return;
  }

  if (path.endsWith('.ts')) {
    final from = layerOf(path);
    final allowed = layers[from];
    if (from.isNotEmpty && allowed == null) {
      hits.add(Hit('W-LOPMOI', path, 1, 'web/src/$from/'));
    }
    final dir = path.substring(0, path.lastIndexOf('/'));
    for (var i = 0; i < lines.length; i++) {
      final l = lines[i];
      final trimmed = l.trimLeft();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      for (final m in _importRe.allMatches(l)) {
        final spec = m.group(1)!;
        if (spec.startsWith('http:') || spec.startsWith('https:') || spec.startsWith('//')) {
          hit('E-CDN', i);
          continue;
        }
        if (from.isEmpty || allowed == null || spec.endsWith('.css')) continue;
        String? target;
        if (spec == 'three' || spec.startsWith('three/')) {
          target = 'three';
        } else if (spec.startsWith('.')) {
          final resolved = normalize('$dir/$spec');
          if (resolved.startsWith('web/src/')) {
            final t = layerOf(resolved);
            target = t.isEmpty ? '(gốc web/src)' : t;
          }
        }
        if (target != null && target != from && !allowed.contains(target)) hit('E-LOP', i);
      }
      if (_shadowRe.hasMatch(l)) hit('E-BONG', i);
      if (_anyRe.hasMatch(l)) hit('W-ANY', i);
      if (_htmlRe.hasMatch(l)) hit('W-HTML', i);
    }
    return;
  }

  if (path.endsWith('.dart')) {
    final colorFile = path.contains('color') || path.contains('/theme/');
    for (var i = 0; i < lines.length; i++) {
      final l = lines[i];
      if (l.trimLeft().startsWith('//')) continue;
      if (!colorFile && _colorRe.hasMatch(l)) hit('W-MAU', i);
      if (_fontSizeRe.hasMatch(l)) hit('W-COCHU', i);
    }
  }
}

void main(List<String> args) {
  final changed = args.contains('--changed');
  final summary = args.contains('--summary');
  final report = args.contains('--report');
  var max = 20;
  for (final a in args) {
    if (a.startsWith('--max=')) max = int.tryParse(a.substring(6)) ?? 20;
  }

  final files = changed ? changedFiles() : allFiles();
  final hits = <Hit>[];
  for (final f in files) {
    scanFile(f, hits);
  }

  final byRule = <String, List<Hit>>{};
  for (final h in hits) {
    byRule.putIfAbsent(h.rule, () => []).add(h);
  }
  final rules = byRule.keys.toList()
    ..sort((a, b) {
      final ea = a.startsWith('E-') ? 0 : 1;
      final eb = b.startsWith('E-') ? 0 : 1;
      return ea != eb ? ea - eb : a.compareTo(b);
    });

  final out = StringBuffer();
  for (final r in rules) {
    final list = byRule[r]!;
    if (summary) {
      out.writeln('$r  ${list.length}  ${descriptions[r]}');
      continue;
    }
    out.writeln('$r  ${descriptions[r]}');
    for (final h in list.take(max)) {
      final text = h.text.length > 100 ? '${h.text.substring(0, 100)}…' : h.text;
      out.writeln('  ${h.path}:${h.line}  $text');
    }
    if (list.length > max) out.writeln('  … và ${list.length - max} chỗ nữa');
  }
  if (out.isNotEmpty) stdout.write(out);

  final hasError = rules.any((r) => r.startsWith('E-'));
  exit(hasError && !report ? 1 : 0);
}
