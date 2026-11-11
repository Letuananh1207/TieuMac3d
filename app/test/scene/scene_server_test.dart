import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/scene_server.dart';

void main() {
  test('(L-1): trên web nạp cảnh thẳng từ asset cùng nguồn, không dùng máy chủ localhost', () {
    final url = sceneUrl(web: true, base: Uri.parse('https://hocxa.example/app/'), port: 8080);
    expect(url.toString(), 'https://hocxa.example/app/assets/assets/scene/index.html');
    expect(url.host, isNot('localhost'));
  });

  test('(L-1): trên web chạy ở gốc (flutter run -d chrome)', () {
    final url = sceneUrl(web: true, base: Uri.parse('http://localhost:53000/'), port: 8080);
    expect(url.toString(), 'http://localhost:53000/assets/assets/scene/index.html');
  });

  test('Android / iOS: qua máy chủ nội bộ cổng 8080', () {
    final url = sceneUrl(web: false, base: Uri.parse('file:///'), port: 8080);
    expect(url.toString(), 'http://localhost:8080/index.html');
  });
}
