import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'journey/home.dart' show placedCounts;
import 'journey/journey.dart';
import 'journey/progress_store.dart';
import 'lesson/book_screen.dart';
import 'lesson/daily_screen.dart';
import 'lesson/lesson_screen.dart';
import 'lesson/library_screen.dart';
import 'lesson/radical_screen.dart';
import 'lesson/review_screen.dart';
import 'lesson/reward_overlay.dart';
import 'lesson/shop_screen.dart';
import 'lesson/study_board.dart';
import 'lesson/learned_screen.dart';
import 'scene/garden_event.dart';
import 'scene/review_event.dart';
import 'scene/scene_event.dart';
import 'scene/scene_server.dart';
import 'scene/scene_view.dart';
import 'scene/shop_event.dart';
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
              // lần đầu "Đã lĩnh hội" → +10 Văn tiền, hiệu ứng trên lớp phủ (R-TIEN-2, R-TIEN-5)
              onOpenRadical: (context, request) => Navigator.of(context).push(
                RadicalScreen.route(
                  request,
                  () async {
                    await progress?.learnRadical(request.radical.id, char: request.radical.form);
                  },
                  rewards: progress == null ? null : _rewards(progress!),
                ),
              ),
              onGetProgress: () {
                final store = progress;
                if (store == null) return progressReply(const Progress());
                // sang ngày mới mà không có gì phải làm → ngày đó vẫn được tính (R-NV-2); khoản thưởng phát sinh ở đây không
                // chạy hiệu ứng (trang chỉ đổi số ví) → bỏ khỏi hàng
                store.checkDaily().then((_) => store.takeRewards());
                return progressReply(
                  store.progress,
                  due: store.dueRadicals,
                  daily: store.daily,
                  streak: store.streak,
                  book: store.borrowedBook,
                  coins: store.coins,
                  gameCoinsToday: store.gameCoinsToday,
                  alms: store.alms,
                );
              },
              // Tàng Thư Các: cuốn sổ từ đang mượn giữ qua tắt app (R-SACH-1, R-SACH-2, R-SACH-4)
              onBorrowBook: (id) async => await progress?.borrowBook(id) ?? false,
              onReturnBook: () async => await progress?.returnBook() ?? false,
              // nhà của ta: món đang đặt + số cái mỗi vật, giữ qua tắt app (R-NHA-2…4); ô cũ chỉ gửi khi chưa chuyển (V-69)
              onGetHome: progress == null
                  ? null
                  : () => homeReply(
                        items: progress!.homeItems,
                        owned: progress!.ownedDecor,
                        placed: progress!.hasHomeItems ? null : progress!.homePlaced,
                      ),
              // Văn tiền: hết ván ở bàn chơi → thưởng theo trần ngày (R-TIEN-3); Tạp hoá: mua → trừ ví + sở hữu (R-TIEN-4)
              onEarnGame: progress == null
                  ? null
                  : (game, outcome) async => earnGameReply(await progress!.earnGame(game, outcome)),
              // Tiểu Khất: cho 5 văn, mỗi ngày giờ VN một lần (R-TIEN-8)
              onGiveAlms: progress == null ? null : () async => giveAlmsReply(await progress!.giveAlms()),
              onOpenShop: progress == null
                  ? null
                  : (context, request) => Navigator.of(context).push(ShopScreen.route(
                        items: request.items,
                        balance: progress!.coins,
                        owned: progress!.ownedDecor,
                        placed: placedCounts(progress!.homeItems),
                        onBuy: (i) => progress!.buyDecor(i.id, i.price),
                        // hạt giống Vườn rau (R-VUON-9) — bảng cây một nguồn ở garden.dart
                        seeds: seedShopItems(),
                        bag: progress!.garden.seeds,
                        onBuySeed: (i, count) => progress!.buySeed(seedCrop(i) ?? '', count: count),
                      )),
              // vườn rau: gieo / tưới / thu / bán / mở ô, giữ qua tắt app (R-VUON-1…9)
              onGetGarden: progress == null ? null : () => gardenReply(progress!.garden, progress!.now),
              onGardenAct: progress == null
                  ? null
                  : (a) async {
                      final r = await progress!.gardenAct(a.act, plot: a.plot, crop: a.crop, count: a.count);
                      return gardenActReply(r, progress!.coins);
                    },
              onSetHome: (items) async => await progress?.setHomeItems(items) ?? false,
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
                        rewards: _rewards(progress!),
                      )),
              // cuộn sách Ngồi ôn (R-ON-8, thiết kế 2026-11-14.21): mục in trên cuộn 3D ở trang; "Ôn" → openReview,
              // "Học bộ mới" → openRadical, "Xem bộ đã học" → màn Bộ đã học (chạm một bộ → thẻ "Đã học"), đóng → resume.
              // Bảng chọn Flutter `StudyScreen` (openStudy) thôi dùng — xoá sau khi thử máy.
              onOpenLearned: progress == null
                  ? null
                  : (context, request) async {
                      final nav = Navigator.of(context);
                      final p = StudyProgress.of(progress!);
                      final picked = await nav.push(LearnedScreen.route(learnedEntries(request.learned, p.cards, p.today)));
                      if (picked == null) return;
                      await nav.push(RadicalScreen.route(
                        OpenRadicalRequest(radical: picked, learned: true, region: request.region),
                        () async {
                          await progress!.learnRadical(picked.id, char: picked.form);
                        },
                        rewards: _rewards(progress!),
                      ));
                    },
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

/// Màn ôn: chấm từng bộ vào lịch ôn (R-ON-2), trả số ngày tới lần ôn kế cho câu "ôn lại sau n ngày"; thưởng +5 / +2
/// (R-TIEN-2) chạy hiệu ứng ngay trên màn ôn.
Route<void> _reviewRoute(ProgressStore store, List<ReviewItem> items) => ReviewScreen.route(
      items,
      (id, correct) async {
        final form = items.where((i) => i.radical.id == id).firstOrNull?.radical.form;
        return await store.reviewRadical(id, correct, char: form) ? store.cards[id]?.interval : null;
      },
      daily: () => store.daily,
      rewards: _rewards(store),
    );

/// Khoản thưởng vừa cộng + số dư cho hiệu ứng nhận tiền trên màn Flutter (R-TIEN-5).
RewardFeed _rewards(ProgressStore store) => () => (rewards: store.takeRewards(), balance: store.coins);

