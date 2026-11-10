import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/safe_area_script.dart';

void main() {
  test('đặt đủ 4 biến --inset-* theo px', () {
    final js = safeAreaScript(const EdgeInsets.fromLTRB(44, 24, 0, 21.5));
    expect(js, contains("'--inset-top','24.0px'"));
    expect(js, contains("'--inset-right','0px'"));
    expect(js, contains("'--inset-bottom','21.5px'"));
    expect(js, contains("'--inset-left','44.0px'"));
    expect(js, contains('document.documentElement.style'));
  });

  test('giá trị âm hoặc vô hạn thành 0px', () {
    final js = safeAreaScript(const EdgeInsets.fromLTRB(-3, double.infinity, 0, 0));
    expect(js, contains("'--inset-left','0px'"));
    expect(js, contains("'--inset-top','0px'"));
  });
}
