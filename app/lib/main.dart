import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'scene/scene_server.dart';
import 'scene/scene_view.dart';
import 'theme/app_colors.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Vẽ tràn viền (dưới thanh trạng thái, thanh điều hướng, tai thỏ); trang web tự chừa safe area.
  // Xoay tự do: không gọi setPreferredOrientations.
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    systemNavigationBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light, // nền cảnh tối
    statusBarBrightness: Brightness.dark, // iOS
  ));

  // Bản debug trên Android: cho chrome://inspect soi WebView.
  // (trên web chạy bằng Chrome Android, defaultTargetPlatform vẫn là android → phải loại web ra)
  if (kDebugMode && !kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }

  final server = SceneServer();
  String? startError;
  try {
    await server.start();
  } catch (e) {
    startError = 'Không mở được máy chủ nội bộ ở cổng ${server.port}: $e';
  }

  runApp(HocXaApp(server: server, startError: startError));
}

class HocXaApp extends StatelessWidget {
  const HocXaApp({super.key, required this.server, this.startError});

  final SceneServer server;
  final String? startError;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Học Xá 3D',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.lacquer, brightness: Brightness.dark),
        scaffoldBackgroundColor: AppColors.sceneBackground,
      ),
      home: startError == null
          ? SceneView(url: server.url)
          : Scaffold(body: SceneErrorView(detail: startError!)),
    );
  }
}
