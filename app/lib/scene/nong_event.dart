/// Sự kiện nông trại Nhà của ta qua cầu nối (docs/bridge.md `getNong`, `nongAct`) — R-NONG-1…8. Luật ở `journey/nong.dart`.
library;

import '../journey/nong.dart';

/// Thao tác `nongAct`: `feed` / `take` (+ `pen`) · `fish` · `sow` / `pick` (+ `vine`) · `sell` (+ `item`, `null` = bán hết).
/// Sai dạng → `null` (trả `bad`).
typedef NongActArgs = ({String act, String? pen, String? vine, String? item});

NongActArgs? nongActArgs(List<dynamic> args) {
  if (args.isEmpty) return null;
  final e = args.first;
  if (e is! Map || e['type'] != 'nongAct') return null;
  final p = e['payload'];
  if (p is! Map) return null;
  final act = p['act'];
  if (act is! String) return null;
  String? s(Object? v) => v is String ? v : null;
  return (act: act, pen: s(p['pen']), vine: s(p['vine']), item: s(p['item']));
}

/// Sự kiện `getNong` (payload rỗng)?
bool isGetNong(List<dynamic> args) => args.isNotEmpty && args.first is Map && (args.first as Map)['type'] == 'getNong';

/// Trả lời `getNong`: nông trại + giờ máy (ms).
Map<String, Object?> nongReply(NongState s, DateTime now) => {'nong': s.toJson(), 'now': now.millisecondsSinceEpoch};

/// Trả lời `nongAct`: được → nông trại mới (+ vườn khi rắc thóc) + số dư + tiền + số cái (+ loại cá); không → lý do + số dư.
Map<String, Object?> nongActReply(NongResult r, int balance) => switch (r) {
      NongDone(:final nong, :final garden, :final amount, :final got, :final item) => {
          'ok': true,
          'nong': nong.toJson(),
          if (garden != null) 'garden': garden.toJson(),
          'balance': balance,
          'amount': amount,
          'got': got,
          if (item != null) 'item': item,
        },
      NongRefused(:final error) => {'ok': false, 'reason': error.wire, 'balance': balance},
    };
