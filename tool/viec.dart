// Làm nhiều việc song song: mỗi việc một git worktree + nhánh riêng (phiên Claude vào bằng EnterWorktree,
// worktree ở .claude/worktrees/<tên>, nhánh từ main của máy — settings.json worktree.baseRef = "head").
//
//   dart tool/viec.dart chuan-bi   (trong worktree, ngay sau khi vào) nối web/node_modules dùng chung, bật driver gộp
//   dart tool/viec.dart gop        (trong worktree, việc đã commit) rebase lên main → cấp mã L-? → build + kiểm →
//                                  đưa main tiến tới nhánh việc → build lại ở thư mục chính
//   dart tool/viec.dart gop --thu  như gop nhưng dừng trước khi đưa vào main (thử)
//   dart tool/viec.dart don <tên>  (ở thư mục chính) xoá worktree + nhánh đã gộp — khi worktree tạo tay / từ phiên trước;
//                                  phiên đang ở trong worktree thì dùng ExitWorktree "remove" (gói npm dùng chung nằm ở
//                                  .claude/worktrees/node_modules, ngoài mọi worktree, nên xoá worktree không đụng tới)
//   dart tool/viec.dart ds         các việc đang mở (worktree, nhánh, số commit chưa gộp)
//
// Mã lỗi mới trong worktree ghi tạm `L-?1`, `L-?2`… (hai việc song song không lấy trùng số); `gop` cấp số thật
// = lớn nhất trên main + 1… và thay ở mọi file đã đổi.
import 'dart:io';

ProcessResult run(String exe, List<String> args, {String? cwd, bool echo = false}) {
  if (echo) stdout.writeln('\$ $exe ${args.join(' ')}');
  final r = Process.runSync(exe, args, workingDirectory: cwd, runInShell: Platform.isWindows);
  if (echo) {
    stdout.write(r.stdout);
    stderr.write(r.stderr);
  }
  return r;
}

String git(List<String> args, {String? cwd}) {
  final r = run('git', args, cwd: cwd);
  if (r.exitCode != 0) throw StateError('git ${args.join(' ')}: ${r.stderr}');
  return (r.stdout as String).trim();
}

/// Thư mục chính của repo (nơi có .git thật) và thư mục đang đứng.
String mainRoot() => File(git(['rev-parse', '--path-format=absolute', '--git-common-dir'])).parent.path;
String here() => git(['rev-parse', '--show-toplevel']);
bool inWorktree() => _norm(mainRoot()) != _norm(here());
String _norm(String p) => p.replaceAll('\\', '/').toLowerCase().replaceAll(RegExp(r'/$'), '');

Never fail(String msg) {
  stderr.writeln(msg);
  exit(1);
}

void chuanBi() {
  if (!inWorktree()) fail('Đang ở thư mục chính — lệnh này chạy trong worktree (sau EnterWorktree).');
  final under = _norm(here()).startsWith('${_norm(mainRoot())}/.claude/worktrees/');
  if (!under && !Directory('${here()}/web/node_modules').existsSync()) {
    // worktree nằm ngoài .claude/worktrees → không thấy gói dùng chung; cài riêng (không tạo nối — xoá worktree an toàn)
    stdout.writeln('Worktree ngoài .claude/worktrees — cài gói npm riêng (npm ci)…');
    final r = run('npm', ['--prefix', 'web', 'ci', '--no-audit', '--no-fund']);
    stdout.writeln(r.exitCode == 0 ? '  xong' : '  npm ci hỏng: ${r.stderr}');
  }
  // Nối gói npm dùng chung ở .claude/worktrees/node_modules — NGOÀI mọi worktree: Node / npm / npx tìm node_modules
  // ở thư mục cha (…/worktrees/<tên>/web → …/worktrees/node_modules), còn xoá worktree (kể cả tự động khi subagent
  // xong) không bao giờ đi xuyên qua nối mà xoá mất web/node_modules của thư mục chính.
  final link = Directory('${mainRoot()}/.claude/worktrees/node_modules');
  final shared = Directory('${mainRoot()}/web/node_modules');
  if (!link.existsSync() && shared.existsSync()) {
    final r = Platform.isWindows
        ? run('cmd', ['/c', 'mklink', '/J', link.path.replaceAll('/', '\\'), shared.path.replaceAll('/', '\\')])
        : run('ln', ['-s', shared.path, link.path]);
    stdout.writeln(r.exitCode == 0 ? 'Đã nối .claude/worktrees/node_modules → web/node_modules.' : 'Không nối được node_modules: ${r.stderr}');
  }
  // driver "ours" cho file sinh (.gitattributes): khi gộp giữ bản bên mình, sau đó build lại
  git(['config', 'merge.ours.driver', 'true']);
  stdout.writeln('Worktree sẵn sàng: ${here()} (nhánh ${git(['branch', '--show-current'])}).');
  stdout.writeln('App Flutter trong worktree: chạy `cd app && flutter pub get` một lần nếu cần thử app.');
}

/// Số L- lớn nhất trong sổ lỗi của main.
int maxBugId(String root) {
  final f = File('$root/docs/loi.md');
  if (!f.existsSync()) return 0;
  return RegExp(r'L-(\d+)').allMatches(f.readAsStringSync()).map((m) => int.parse(m.group(1)!)).fold(0, (a, b) => a > b ? a : b);
}

/// Thay `L-?1`, `L-?2`… trong các file nhánh đã đổi so với main bằng số thật; trả về số mã đã cấp.
int assignBugIds() {
  final files = git(['diff', '--name-only', 'main...HEAD']).split('\n').where((f) => f.isNotEmpty && File(f).existsSync());
  final tokens = <String>{};
  final re = RegExp(r'L-\?\d+');
  for (final f in files) {
    try {
      tokens.addAll(re.allMatches(File(f).readAsStringSync()).map((m) => m.group(0)!));
    } catch (_) {} // file nhị phân
  }
  if (tokens.isEmpty) return 0;
  var next = maxBugId(here()) + 1;
  final map = {for (final t in (tokens.toList()..sort())) t: 'L-${next++}'};
  for (final f in files) {
    try {
      var s = File(f).readAsStringSync();
      final before = s;
      map.forEach((k, v) => s = s.replaceAll(k, v));
      if (s != before) File(f).writeAsStringSync(s);
    } catch (_) {}
  }
  git(['commit', '-am', 'chore: cấp mã lỗi ${map.values.join(', ')}']);
  map.forEach((k, v) => stdout.writeln('  $k → $v'));
  return map.length;
}

void gop({bool thu = false}) {
  if (!inWorktree()) fail('Đang ở thư mục chính — lệnh này chạy trong worktree của việc.');
  final branch = git(['branch', '--show-current']);
  if (git(['status', '--porcelain']).isNotEmpty) fail('Còn thay đổi chưa commit — commit việc trước rồi mới gộp.');
  final root = mainRoot();

  stdout.writeln('1/5 rebase $branch lên main');
  final rb = run('git', ['rebase', 'main'], echo: true);
  if (rb.exitCode != 0) {
    fail('Xung đột khi rebase. Sửa xung đột (file sinh: lấy bản nào cũng được, bước build sẽ làm lại), '
        '`git add` + `git rebase --continue`, rồi chạy lại `dart tool/viec.dart gop`.');
  }

  stdout.writeln('2/5 cấp mã lỗi tạm L-?');
  final n = assignBugIds();
  if (n == 0) stdout.writeln('  không có mã tạm');

  stdout.writeln('3/5 build + kiểm trong worktree');
  for (final step in [
    ['dart', 'tool/guard.dart'], // lỗi biên dịch Dart / TS + lỗi E
    ['npm', '--prefix', 'web', 'test'],
    ['npm', '--prefix', 'web', 'run', 'build'],
  ]) {
    final r = run(step.first, step.sublist(1));
    if (r.exitCode != 0) {
      stdout.write(r.stdout);
      stderr.write(r.stderr);
      fail('Bước `${step.join(' ')}` hỏng — sửa rồi gộp lại.');
    }
  }
  // file sinh chỉ lệch xuống dòng (LF/CRLF): status báo đổi nhưng không có gì để commit → chỉ commit khi stage có nội dung
  git(['add', '-u']);
  if (run('git', ['diff', '--cached', '--quiet']).exitCode != 0) {
    git(['commit', '-m', 'build: file sinh sau khi gộp main']);
  } else {
    run('git', ['checkout', '--', '.']); // trả các file chỉ lệch xuống dòng về như cũ
  }
  if (thu) {
    stdout.writeln('--thu: dừng trước khi đưa vào main (nhánh $branch đã rebase + build + kiểm xong).');
    return;
  }

  stdout.writeln('4/5 đưa main tiến tới $branch');
  final ff = run('git', ['merge', '--ff-only', branch], cwd: root, echo: true);
  if (ff.exitCode != 0) {
    fail('main ở thư mục chính không tiến được (main vừa có commit mới, hoặc thư mục chính có file sửa dở trùng file '
        'của việc). Chạy lại `dart tool/viec.dart gop`; vẫn hỏng → báo người dùng.');
  }

  stdout.writeln('5/5 build lại ở thư mục chính (app/assets/scene)');
  final b = run('npm', ['--prefix', 'web', 'run', 'build'], cwd: root);
  stdout.writeln(b.exitCode == 0 ? '  xong' : '  build ở thư mục chính hỏng — chạy tay: cd web && npm run build');
  stdout.writeln('Đã gộp $branch vào main. Tiếp: ExitWorktree "remove" (hoặc ở thư mục chính: dart tool/viec.dart don)${here().split(RegExp(r'[\\/]')).last}');
}

/// Gỡ nối node_modules (chỉ gỡ đường nối, không đụng nội dung) rồi xoá worktree + nhánh (nhánh phải đã gộp).
void don(String name) {
  if (inWorktree()) fail('Chạy ở thư mục chính (đang trong worktree thì dùng ExitWorktree "remove").');
  final root = mainRoot();
  final path = '$root/.claude/worktrees/$name';
  if (!Directory(path).existsSync()) fail('Không có worktree $path');
  final branch = git(['branch', '--show-current'], cwd: path);
  final link = Link('$path/web/node_modules');
  final mods = '$path/web/node_modules';
  if (link.existsSync() || Directory(mods).existsSync()) {
    // junction trên Windows: rmdir không /s chỉ gỡ đường nối; Link.delete cho symlink
    // node_modules là thư mục thật (đã npm install riêng) → rmdir không /s từ chối vì không rỗng → dừng, không xoá gì
    late final ProcessResult r;
    if (Platform.isWindows) {
      r = run('cmd', ['/c', 'rmdir', mods.replaceAll('/', '\\')]);
    } else {
      link.deleteSync();
      r = run('true', []);
    }
    if (r.exitCode != 0) fail('Không gỡ được nối node_modules: ${r.stderr} — dừng, không xoá gì.');
  }
  if (!File('$root/web/node_modules/three/package.json').existsSync()) fail('web/node_modules của thư mục chính bất thường — dừng.');
  final merged = git(['branch', '--merged', 'main'], cwd: root).split('\n').map((b) => b.replaceAll(RegExp(r'^[*+ ]+'), '').trim());
  if (!merged.contains(branch)) fail('Nhánh $branch chưa gộp vào main — chưa xoá (gộp trước: dart tool/viec.dart gop).');
  Directory(path).deleteSync(recursive: true);
  git(['worktree', 'prune'], cwd: root);
  git(['branch', '-d', branch], cwd: root);
  stdout.writeln('Đã dọn worktree $name và nhánh $branch.');
}

void ds() {
  final root = mainRoot();
  final out = git(['worktree', 'list', '--porcelain'], cwd: root);
  String? path;
  for (final line in out.split('\n')) {
    if (line.startsWith('worktree ')) path = line.substring(9);
    if (line.startsWith('branch ') && path != null && _norm(path) != _norm(root)) {
      final br = line.substring(7).replaceFirst('refs/heads/', '');
      final ahead = git(['rev-list', '--count', 'main..$br'], cwd: root);
      final dirty = git(['status', '--porcelain'], cwd: path).isEmpty ? '' : ' · có file chưa commit';
      stdout.writeln('$br  ($ahead commit chưa gộp$dirty)  $path');
    }
  }
}

void main(List<String> args) {
  switch (args.isEmpty ? '' : args.first) {
    case 'chuan-bi':
      chuanBi();
    case 'gop':
      gop(thu: args.contains('--thu'));
    case 'don':
      if (args.length < 2) fail('dart tool/viec.dart don <tên worktree>');
      don(args[1]);
    case 'ds':
      ds();
    default:
      stdout.writeln('dart tool/viec.dart chuan-bi | gop [--thu] | don <tên> | ds');
  }
}
