import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'journey/journey.dart';
import 'journey/progress_store.dart';
import 'lesson/book_screen.dart';
import 'lesson/daily_screen.dart';
import 'lesson/lesson_screen.dart';
import 'lesson/library_screen.dart';
import 'lesson/radical_screen.dart';
import 'lesson/review_screen.dart';
import 'scene/review_event.dart';
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

  // tiến độ học (R-HANH-1); không mở được kho → vẫn chạy, không lưu
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
      title: 'Tiểu Mặc 3D',
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
              // thẻ học bộ thủ: "Đã lĩnh hội" → ghi bộ thủ đã học; "Xuất định" → đóng + đứng dậy (R-HANH-3)
              onOpenRadical: (context, request) => Navigator.of(context).push(
                RadicalScreen.route(request, () async {
                  await progress?.learnRadical(request.radical.id);
                }),
              ),
              onGetProgress: () {
                final store = progress;
                if (store == null) return progressReply(const Progress());
                store.checkDaily(); // sang ngày mới mà không có gì phải làm → ngày đó vẫn được tính (R-NV-2)
                return progressReply(
                  store.progress,
                  due: store.dueRadicals,
                  daily: store.daily,
                  streak: store.streak,
                  book: store.borrowedBook,
                );
              },
              // Tàng Thư Các: cuốn sổ từ đang mượn giữ qua tắt app (R-SACH-1, R-SACH-2, R-SACH-4)
              onBorrowBook: (id) async => await progress?.borrowBook(id) ?? false,
              onReturnBook: () async => await progress?.returnBook() ?? false,
              // nhà của ta: vật ở từng ô giữ qua tắt app (R-NHA-2, R-NHA-3)
              onGetHome: progress == null ? null : () => homeReply(progress!.homePlaced),
              onSetDecor: (slot, item) async => await progress?.placeDecor(slot, item) ?? false,
              // ôn câu đố + bảng nhiệm vụ 日課榜 (R-ON-5, R-NV-3); không có kho tiến độ → trang tự lo (thẻ bộ mới / Tiểu Mặc)
              onOpenReview: progress == null
                  ? null
                  : (context, request) => Navigator.of(context).push(_reviewRoute(progress!, request.items)),
              onOpenDaily: progress == null
                  ? null
                  : (context, request) => Navigator.of(context).push(DailyScreen.route(
                        request,
                        () => DailyView.of(progress!),
                        (items) => Navigator.of(context).push(_reviewRoute(progress!, items)),
                      )),
              // Tàng Thư Các: danh mục (chọn → ghi mượn) và sổ từ (mở ở trang đã nhớ, đóng → ghi trang) — R-SACH-1, R-SACH-3
              onOpenLibrary: progress == null
                  ? null
                  : (context, request) => Navigator.of(context).push(LibraryScreen.route(request, progress!.borrowBook)),
              onOpenBook: progress == null
                  ? null
                  : (context, request) => Navigator.of(context).push(BookScreen.route(
                        request,
                        progress!.bookPage(request.id),
                        (page) => progress!.setBookPage(request.id, page, request.words.length),
                      )),
            )
          : Scaffold(body: SceneErrorView(detail: startError!)),
    );
  }
}

/// Màn ôn: chấm từng bộ vào lịch ôn (R-ON-2), trả số ngày tới lần ôn kế cho câu "ôn lại sau n ngày".
Route<void> _reviewRoute(ProgressStore store, List<ReviewItem> items) => ReviewScreen.route(
      items,
      (id, correct) async => await store.reviewRadical(id, correct) ? store.cards[id]?.interval : null,
      daily: () => store.daily,
    );
