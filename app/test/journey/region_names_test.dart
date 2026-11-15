import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/journey/journey.dart';

/// Tên vùng phía Flutter khớp bản đồ truyền tống — một nguồn là `design/scene/ban-do/ban-do.json` (R-HANH-1, V-50).
void main() {
  final map = jsonDecode(File('../design/scene/ban-do/ban-do.json').readAsStringSync()) as Map<String, dynamic>;
  final places = {
    for (final p in (map['noi'] as List).cast<Map<String, dynamic>>()) p['id'] as String: p['ten'] as String,
  };

  test('R-HANH-1: regionNames trùng ten của ban-do.json cùng mã, đủ 6 vùng', () {
    expect(regionNames.length, 6);
    for (final e in regionNames.entries) {
      expect(places[e.key], e.value, reason: 'vùng ${e.key}');
    }
  });

  test('R-HANH-1: vùng học bộ thủ (mặc định region) là tên của rung-truc', () {
    expect(firstRegion, places['rung-truc']);
    expect(firstRegion, regionNames['rung-truc']);
  });
}
