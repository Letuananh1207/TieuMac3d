import 'package:flutter/painting.dart';

/// Đoạn JS đặt biến CSS `--inset-top/right/bottom/left` (đơn vị px) trên `<html>`.
///
/// Vì sao: WebView Android thường trả `env(safe-area-inset-*)` = 0 dù app vẽ tràn dưới tai thỏ / thanh hệ thống.
/// Flutter biết chính xác vùng bị che (`MediaQuery.viewPadding`), nên đẩy sang; CSS lấy max(env(), biến này).
/// Hợp đồng ghi ở docs/bridge.md.
String safeAreaScript(EdgeInsets padding) {
  String px(double v) => '${v.isFinite && v > 0 ? v.toStringAsFixed(1) : '0'}px';
  return '(function(s){'
      "s.setProperty('--inset-top','${px(padding.top)}');"
      "s.setProperty('--inset-right','${px(padding.right)}');"
      "s.setProperty('--inset-bottom','${px(padding.bottom)}');"
      "s.setProperty('--inset-left','${px(padding.left)}');"
      '})(document.documentElement.style);';
}
