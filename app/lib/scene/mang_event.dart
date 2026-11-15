/// Sự kiện măng Trúc Lâm qua cầu nối (docs/bridge.md `getMang`, `mangAct`) — R-MANG-1…5. Luật ở `journey/mang.dart`.
library;

import '../journey/mang.dart';

/// Thao tác `mangAct`: `pick` (+ `id`, `right`) · `sell` (+ `kind`, `null` = bán hết). Sai dạng → `null` (trả `bad`).
typedef MangActArgs = ({String act, String? id, String? kind, bool right});

MangActArgs? mangActArgs(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'mangAct') return null;
  final p = e['payload'];
  if (p is! Map) return null;
  final act = p['act'], id = p['id'], kind = p['kind'];
  if (act is! String) return null;
  return (act: act, id: id is String ? id : null, kind: kind is String ? kind : null, right: p['right'] == true);
}

/// Sự kiện `getMang` (payload rỗng)?
bool isGetMang(List<dynamic> args) => args.isNotEmpty && args.first is Map && (args.first as Map)['type'] == 'getMang';

/// Trả lời `getMang`: măng + giờ máy (ms).
Map<String, Object?> mangReply(MangState s, DateTime now) => {'mang': s.toJson(), 'now': now.millisecondsSinceEpoch};

/// Trả lời `mangAct`: được → măng mới + số dư + tiền + số cái; không → lý do + số dư.
Map<String, Object?> mangActReply(MangResult r, int balance) => switch (r) {
      MangDone(:final mang, :final amount, :final got) => {'ok': true, 'mang': mang.toJson(), 'balance': balance, 'amount': amount, 'got': got},
      MangRefused(:final error) => {'ok': false, 'reason': error.wire, 'balance': balance},
    };
