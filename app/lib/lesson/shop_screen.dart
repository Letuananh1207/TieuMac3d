import 'dart:async';

import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../scene/shop_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';
import 'shop_confirm.dart';
import 'shop_parts.dart';
import 'wallet_chip.dart';

/// Tạp hoá 雜貨 — cửa hàng đồ trang trí Nhà của ta (native) — R-TIEN-4. Thiết kế: design/docs/screen_specs.md "Tạp hoá 雜貨"
/// (artboard `CuaHang-doc`, `-doc-ngheo`, `-doc-xac-nhan`, `-doc-vua-mua`, `-doc-het`, `-ngang`). Danh mục + giá do trang
/// gửi (`openShop`); mua qua [onBuy] (kho trừ ví + ghi sở hữu — `ProgressStore.buyDecor`). Đóng: "Đóng" / quay lại → về cảnh.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key, required this.items, required this.balance, required this.owned, required this.onBuy});

  final List<ShopItem> items;
  final int balance;
  final List<String> owned;
  final Future<BuyResult> Function(ShopItem item) onBuy;

  static Route<void> route({
    required List<ShopItem> items,
    required int balance,
    required List<String> owned,
    required Future<BuyResult> Function(ShopItem item) onBuy,
  }) =>
      fadeRoute(ShopScreen(items: items, balance: balance, owned: owned, onBuy: onBuy));

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  late int _balance = widget.balance;
  late final Set<String> _owned = {...widget.owned};

  /// tab đang chọn; `null` = Tất cả
  SlotKind? _tab;
  ShopItem? _picked;
  ShopItem? _bought;
  int _delta = 0;
  bool _buying = false;
  Timer? _boughtTimer, _deltaTimer;

  @override
  void dispose() {
    _boughtTimer?.cancel();
    _deltaTimer?.cancel();
    super.dispose();
  }

  ItemState _state(ShopItem i) =>
      _owned.contains(i.id) ? ItemState.owned : (_balance < i.price ? ItemState.short : ItemState.buy);

  List<ShopItem> get _unowned => [for (final i in widget.items) if (!_owned.contains(i.id)) i];

  bool get _allBought => _unowned.isEmpty;

  /// không đủ tiền cho vật rẻ nhất còn thiếu → dải gợi ý cách kiếm
  bool get _poor => !_allBought && _unowned.every((i) => _balance < i.price);

  Future<void> _buy(ShopItem item) async {
    if (_buying) return;
    setState(() => _buying = true);
    final r = await widget.onBuy(item);
    if (!mounted) return;
    setState(() {
      _buying = false;
      _picked = null;
      if (r is Bought) {
        _balance = r.balance;
        _owned
          ..clear()
          ..addAll(r.owned);
        _bought = item;
        _delta = -item.price;
      }
    });
    if (r is! Bought) return;
    _boughtTimer?.cancel();
    _boughtTimer = Timer(const Duration(seconds: 3), () => mounted ? setState(() => _bought = null) : null);
    _deltaTimer?.cancel();
    _deltaTimer = Timer(const Duration(milliseconds: 1500), () => mounted ? setState(() => _delta = 0) : null);
  }

  @override
  Widget build(BuildContext context) {
    void close() => Navigator.of(context).pop();
    return ScreenFrame(builder: (context, landscape) {
      final picked = _picked;
      final bought = _bought;
      final closeBtn = SecondaryButton(label: 'Đóng', icon: Icons.close, height: landscape ? 30 : 52, wide: !landscape, onPressed: close); // shopClose
      final body = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _header(landscape),
          SizedBox(height: landscape ? 8 : 12),
          Row(children: [Expanded(child: _tabs()), if (landscape) closeBtn]),
          if (_allBought || _poor) ...[
            const SizedBox(height: 12),
            _allBought ? const ShopBanner.allBought() : const ShopBanner.poor(),
          ],
          SizedBox(height: landscape ? 8 : 12),
          Expanded(child: _grid(landscape)),
          if (!landscape) ...[const SizedBox(height: 12), closeBtn],
        ],
      );
      return Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(child: body),
          if (bought != null)
            Positioned(left: 0, right: 0, bottom: landscape ? 0 : 66, child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 520), child: BoughtToast(item: bought)))),
          if (picked != null) ...[
            // cảnh tối 28 % phủ cả màn (thoát lề an toàn của khung)
            Positioned(
              left: -100,
              right: -100,
              top: -200,
              bottom: -100,
              child: GestureDetector(onTap: () => setState(() => _picked = null), child: ColoredBox(color: AppColors.slate.withValues(alpha: .28))),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 520),
                  child: ShopConfirm(item: picked, balance: _balance, onCancel: () => setState(() => _picked = null), onBuy: () => _buy(picked)),
                ),
              ),
            ),
          ],
        ],
      );
    });
  }

  /// Ấn son 雜貨 (chữ dọc 15, nền `lacquer`, bo 4) + "Tạp hoá" Lora 22 (ngang 19) + dòng phụ; ví bên phải.
  Widget _header(bool landscape) {
    final seal = Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 6),
      decoration: BoxDecoration(color: AppColors.lacquer, borderRadius: BorderRadius.circular(4)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final c in '雜貨'.split(''))
            Text(c, style: hanText.copyWith(fontSize: AppTextSize.studySeal, color: AppColors.onJade, height: 1.15)),
        ],
      ),
    );
    return Row(
      children: [
        ExcludeSemantics(child: seal),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                header: true,
                child: Text('Tạp hoá', style: displayText.copyWith(color: AppColors.slate, fontSize: landscape ? AppTextSize.titleCompact : AppTextSize.accent)), // shopName
              ),
              Text(
                'Đồ trang trí Nhà của ta · mua một lần, đặt được nhiều ô', // shopSubtitle
                maxLines: landscape ? 1 : 2,
                overflow: TextOverflow.ellipsis,
                style: uiText.copyWith(fontSize: AppTextSize.caption, color: AppColors.slateMuted),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        // vừa mua → viền + viên "−n" son dưới ví 1,5 s (R-TIEN-4)
        WalletChip(balance: _balance, delta: _delta),
      ],
    );
  }

  Widget _tabs() {
    Widget tab(String label, SlotKind? kind) {
      final on = _tab == kind;
      return Padding(
        padding: const EdgeInsets.only(right: 6),
        child: Semantics(
          selected: on,
          button: true,
          child: GestureDetector(
            onTap: () => setState(() => _tab = kind),
            child: Container(
              height: 34,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              alignment: Alignment.center,
              decoration: ShapeDecoration(
                color: on ? AppColors.slate : AppColors.onJade.withValues(alpha: .6),
                shape: StadiumBorder(side: on ? BorderSide.none : BorderSide(color: AppColors.slate.withValues(alpha: .2))),
              ),
              child: Text(label, style: uiText.copyWith(fontSize: AppTextSize.small, fontWeight: FontWeight.w700, color: on ? AppColors.onJade : AppColors.slate)),
            ),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children: [tab('Tất cả', null), for (final k in SlotKind.values) tab(k.label, k)]), // shopTabAll, slot*
    );
  }

  Widget _grid(bool landscape) {
    final kinds = _tab == null ? SlotKind.values : [_tab!];
    return Stack(
      children: [
        Positioned.fill(
          child: LayoutBuilder(builder: (context, box) {
            final cols = landscape ? 5 : 3;
            final w = (box.maxWidth - 8 * (cols - 1)) / cols;
            return SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 40, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final k in kinds)
                    if (widget.items.any((i) => i.slot == k)) ...[
                      if (_tab == null) ...[
                        Text(
                          k.label.toUpperCase(),
                          style: uiText.copyWith(fontSize: AppTextSize.caption, fontWeight: FontWeight.w700, color: AppColors.slateMuted, letterSpacing: AppTextSize.caption * .08),
                        ),
                        const SizedBox(height: 6),
                      ],
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final i in widget.items.where((i) => i.slot == k))
                            SizedBox(
                              width: w,
                              child: ShopCard(
                                item: i,
                                state: _state(i),
                                short: i.price - _balance,
                                picked: _picked?.id == i.id,
                                landscape: landscape,
                                onBuy: () => setState(() => _picked = i),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                ],
              ),
            );
          }),
        ),
        // mờ đáy 40
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 40,
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [AppColors.sceneBackground.withValues(alpha: 0), AppColors.sceneBackground],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
