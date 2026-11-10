// Chốt chặn gộp, dùng cho hook Stop của Claude và git pre-commit. Dart thuần, chạy từ gốc repo.
//
//   dart tool/guard.dart stop          hook Stop: đọc JSON từ stdin; có lỗi → stderr + thoát 2
//   dart tool/guard.dart pre-commit    git pre-commit: có lỗi → thoát 1
//   dart tool/guard.dart               in báo cáo (thoát 1 nếu có lỗi)
//
// Chỉ chặn lỗi, chỉ xét file đổi so với HEAD:
//   1. khối E-… của `dart tool/check.dart --changed`
//   2. dòng `error` của `dart analyze` trên các file .dart đã đổi trong app/
//   3. lỗi TypeScript (`tsc --noEmit`) khi có file đổi trong web/
// Không có lỗi thì không in gì.
import 'dart:convert';
import 'dart:io';

ProcessResult run(String exe, List<String> args, {String? cwd}) => Process.runSync(
      exe,
      args,
      workingDirectory: cwd,
      runInShell: true,
      stdoutEncoding: utf8,
      stderrEncoding: utf8,
    );

List<String> changedFiles() {
  final names = <String>{};
  for (final args in [
    ['diff', '--name-only', 'HEAD'],
    ['ls-files', '--others', '--exclude-standard'],
  ]) {
    final r = run('git', args);
    if (r.exitCode == 0) names.addAll((r.stdout as String).split('\n').map((s) => s.trim()));
  }
  names.remove('');
  return names.where((p) => File(p).existsSync()).toList()..sort();
}

/// Tách một dòng `dart analyze --format=machine`: `|` ngăn cột, `\|` và `\\` là ký tự đã escape.
List<String> splitMachine(String line) {
  final fields = <String>[];
  final cur = StringBuffer();
  for (var i = 0; i < line.length; i++) {
    final c = line[i];
    if (c == '\\' && i + 1 < line.length) {
      cur.write(line[++i]);
    } else if (c == '|') {
      fields.add(cur.toString());
      cur.clear();
    } else {
      cur.write(c);
    }
  }
  fields.add(cur.toString());
  return fields;
}

/// Giữ các khối bắt đầu bằng dòng tiêu đề `E-…` trong đầu ra của check.dart.
String errorBlocks(String out) {
  final buf = StringBuffer();
  var keep = false;
  for (final line in const LineSplitter().convert(out)) {
    if (line.isNotEmpty && !line.startsWith(' ')) keep = line.startsWith('E-');
    if (keep) buf.writeln(line);
  }
  return buf.toString();
}

String collectErrors() {
  final report = StringBuffer();
  final changed = changedFiles();

  // 1. quy tắc bộ chuẩn
  final check = run('dart', ['tool/check.dart', '--changed', '--report']);
  final e = errorBlocks(check.stdout as String);
  if (e.isNotEmpty) report.write(e);

  // 2. Dart: lỗi biên dịch ở file vừa đổi
  final dartFiles = changed
      .where((p) => p.startsWith('app/') && p.endsWith('.dart') && !p.endsWith('.g.dart'))
      .map((p) => p.substring('app/'.length))
      .toList();
  if (dartFiles.isNotEmpty) {
    // --format=machine: SEVERITY|TYPE|CODE|đường dẫn tuyệt đối|dòng|cột|độ dài|thông báo
    final r = run('dart', ['analyze', '--no-fatal-warnings', '--format=machine', ...dartFiles], cwd: 'app');
    final root = Directory.current.path.replaceAll('\\', '/');
    final errs = const LineSplitter()
        .convert('${r.stdout}\n${r.stderr}')
        .where((l) => l.startsWith('ERROR|'))
        .map((l) {
      final f = splitMachine(l);
      if (f.length < 8) return '  $l';
      var path = f[3].replaceAll('\\', '/');
      if (path.toLowerCase().startsWith('${root.toLowerCase()}/')) path = path.substring(root.length + 1);
      return '  $path:${f[4]}:${f[5]}  ${f[7]} (${f[2].toLowerCase()})';
    });
    if (errs.isNotEmpty) report.writeln('dart analyze (app/)\n${errs.join('\n')}');
  }

  // 3. TypeScript: kiểm kiểu cả dự án web khi có file web đổi
  final webTouched = changed.any((p) =>
      p.startsWith('web/') &&
      (p.endsWith('.ts') || p.endsWith('tsconfig.json') || p.endsWith('package.json')));
  if (webTouched) {
    final tsc = 'node_modules/typescript/bin/tsc';
    if (!File('web/$tsc').existsSync()) {
      report.writeln('tsc (web/)\n  chưa cài node_modules — chạy `cd web && npm install` rồi kiểm lại');
    } else {
      final r = run('node', [tsc, '--noEmit', '--pretty', 'false'], cwd: 'web');
      final errs = const LineSplitter()
          .convert(r.stdout as String)
          .where((l) => l.contains('error TS'))
          .map((l) => '  web/${l.trim()}');
      if (errs.isNotEmpty) report.writeln('tsc (web/)\n${errs.join('\n')}');
    }
  }
  return report.toString();
}

/// Sổ quy tắc đổi mà chưa chép lên tài liệu xác nhận online → dòng nhắc; không thì ''.
String unsyncedRules() {
  final st = run('git', ['status', '--porcelain', '--', 'docs/testing/quy_tac.md']);
  if ((st.stdout as String).trim().isEmpty) return '';
  final r = run('dart', ['tool/rule_trace.dart']);
  return const LineSplitter()
      .convert(r.stdout as String)
      .where((l) => l.startsWith('Chưa đồng bộ online'))
      .join('\n');
}

Future<void> main(List<String> args) async {
  final mode = args.isEmpty ? '' : args.first;

  if (mode == 'stop') {
    var active = false;
    try {
      final input = await stdin.transform(utf8.decoder).join();
      if (input.trim().isNotEmpty) {
        final json = jsonDecode(input);
        active = json is Map && json['stop_hook_active'] == true;
      }
    } catch (_) {}

    final errors = collectErrors();
    if (errors.isNotEmpty) {
      if (active) {
        stdout.writeln(jsonEncode({
          'systemMessage': 'Chốt chặn vẫn thấy lỗi biên dịch / lỗi quy tắc E sau một lần sửa. '
              'Chạy `dart tool/guard.dart` để xem.',
        }));
        exit(0);
      }
      stderr.write(errors);
      stderr.writeln('Sửa các lỗi trên rồi mới báo xong.');
      exit(2);
    }
    if (!active) {
      final unsynced = unsyncedRules();
      if (unsynced.isNotEmpty) {
        stderr.writeln(unsynced);
        stderr.writeln('Chép các quy tắc này lên tài liệu xác nhận online rồi chạy '
            '`dart tool/rule_trace.dart --mark-synced <mã>`, hoặc báo người dùng vì sao chưa.');
        exit(2);
      }
    }
    exit(0);
  }

  final errors = collectErrors();
  if (errors.isEmpty) exit(0);
  stdout.write(errors);
  if (mode == 'pre-commit') {
    stdout.writeln('Commit bị chặn. Sửa lỗi trên, hoặc bỏ qua tạm: git commit --no-verify');
  }
  exit(1);
}
