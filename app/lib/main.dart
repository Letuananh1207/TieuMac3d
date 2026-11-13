import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'journey/journey.dart';
import 'journey/progress_store.dart';
import 'lesson/lesson_screen.dart';
import 'scene/scene_event.dart';
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
    // nền sáng (trời ban ngày, màn tải / nền HUD C #E9EEEC) → icon thanh trạng thái màu sẫm
    statusBarIconBrightness: Brightness.dark, // Android: màu icon
    statusBarBrightness: Brightness.light, // iOS: màu nền thanh → icon sẫm
    systemNavigationBarIconBrightness: Brightness.dark,
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

  // tiến độ học (R-HANH-1); không mở được kho → vẫn chạy, chỉ Rừng trúc mở, không lưu
  ProgressStore? progress;
  try {
    progress = await ProgressStore.open();
  } catch (e) {
    debugPrint('Không mở được kho tiến độ: $e');
  }

  runApp(HocXaApp(server: server, startError: startError, progress: progress));
}

class HocXaApp extends StatelessWidget {
  const HocXaApp({super.key, required this.server, this.startError, this.progress});

  final SceneServer server;
  final String? startError;
  final ProgressStore? progress;

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
          ? SceneView(
              url: server.url,
              // trang gửi openLesson → mở màn bài học native; đóng màn → SceneView gửi resume (docs/bridge.md)
              // mở bài lần đầu = đã học chữ đó (R-HANH-1, tạm tới khi có nút "Đã thuộc")
              onOpenLesson: (context, request) {
                progress?.learnChar(request.lesson.han);
                return Navigator.of(context).push(LessonScreen.route(request.lesson));
              },
              onGetProgress: () => progressReply(progress?.progress ?? const Progress()),
            )
          : Scaffold(body: SceneErrorView(detail: startError!)),
    );
  }
}
