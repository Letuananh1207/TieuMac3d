import 'dart:async';

import 'package:flutter/material.dart';

import '../journey/wallet.dart';
import '../scene/garden_event.dart' show seedCrop;
import '../scene/shop_event.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_size.dart';
import 'screen_parts.dart';
import 'shop_confirm.dart';
import 'shop_parts.dart';
import 'wallet_chip.dart';

/// Tạp hoá — cửa hàng đồ trang trí Nhà của ta (native) — R-TIEN-4. Thiết kế: design/docs/screen_specs.md "Tạp hoá 雜貨" +
/// "Trang trí tự do" (2026-11-15.42, artboard `CuaHang-theo-cai-*`): đồ trang trí **theo cái** — thẻ "Trong túi: n · Đang đặt: m"
/// ([owned] số cái, [placed] số đang đặt), nút luôn "Mua", mỗi lần 1 cái. Danh mục + giá do trang gửi (`openShop`); mua qua
/// [onBuy] (kho trừ ví + số cái + 1 — `ProgressStore.buyDecor`). Đóng: "Đóng" / quay lại → về cảnh.
/// Hạt giống Vườn rau (R-VUON-9, thiết kế 2026-11-15.29 `CuaHang-hat-*`): [seeds] loại `SlotKind.hat` (tab "Hạt giống" cuối
/// hàng), thẻ "Trong túi: n" theo [bag], hộp xác nhận chọn × 1 · × 5 · × 10, mua nhiều lần qua [onBuySeed].
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key, required this.items, required this.balance, required this.owned, this.placed = const {}, required this.onBuy, this.seeds = const [], this.bag = const {}, this.onBuySeed});

  final List<ShopItem> items;
  final int balance;
  /// số cái sở hữu mỗi vật (đang đặt + trong túi — R-NHA-4)
  final Map<String, int> owned;

  /// số cái đang đặt ở nhà mỗi vật
  final Map<String, int> placed;
  final Future<BuyResult> Function(ShopItem item) onBuy;
  final List<ShopItem> seeds;

  /// túi hạt lúc mở (mã cây → số hạt)
  final Map<String, int> bag;
  final Future<BuyResult> Function(ShopItem item, int count)? onBuySeed;

  static Route<void> route({
    required List<ShopItem> items,
    required int balance,
    required Map<String, int> owned,
    Map<String, int> placed = const {},
    required Future<BuyResult> Function(ShopItem item) onBuy,
    List<ShopItem> seeds = const [],
    Map<String, int> bag = const {},
    Future<BuyResult> Function(ShopItem item, int count)? onBuySeed,
  }) =>
      fadeRoute(ShopScreen(items: items, balance: balance, owned: owned, placed: placed, onBuy: onBuy, seeds: seeds, bag: bag, onBuySeed: onBuySeed));

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  late int _balance = widget.balance;
  late final Map<String, int> _owned = {...widget.owned};
  late final Map<String, int> _bag = {...widget.bag};

  /// tab đang chọn; `null` = Tất cả
  SlotKind? _tab;
  ShopItem? _picked;

  /// số hạt đang chọn trong hộp xác nhận (R-VUON-9)
  int _count = 1;
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

  /// hạt chỉ hiện khi có cách mua
  List<ShopItem> get _all => [...widget.items, if (widget.onBuySeed != null) ...widget.seeds];

  ItemState _state(ShopItem i) => _balance < i.price ? ItemState.short : ItemState.buy;

  /// số cái đang đặt / trong túi của vật trang trí (trong túi = sở hữu − đang đặt, không âm)
  int _placedOf(ShopItem i) => widget.placed[i.id] ?? 0;
  int _inBagOf(ShopItem i) => ((_owned[i.id] ?? 0) - _placedOf(i)).clamp(0, 1 << 30);

  /// không đủ tiền cho vật trang trí rẻ nhất → dải gợi ý cách kiếm
  bool get _poor => widget.items.isNotEmpty && widget.items.every((i) => _balance < i.price);

  Future<void> _buy(ShopItem item) async {
    if (_buying) return;
    setState(() => _buying = true);
    final buySeed = widget.onBuySeed;
    final crop = seedCrop(item);
    final count = crop != null ? _count : 1;
    final r = crop != null && buySeed != null ? await buySeed(item, count) : await widget.onBuy(item);
    if (!mounted) return;
    setState(() {
      _buying = false;
      _picked = null;
      _count = 1;
      if (r is Bought) {
        _balance = r.balance;
        if (crop == null) {
          _owned
            ..clear()
            ..addAll(r.owned);
        }
        if (crop != null) _bag[crop] = (_bag[crop] ?? 0) + count;
        _bought = item;
        _delta = -item.price * count;
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
          Row(children: [Expanded(child: _tabs(landscape)), if (landscape) closeBtn]),
          if (_tab == SlotKind.hat) ...[
            const SizedBox(height: 8),
            Text(
              'Hạt vào túi hạt · gieo ở Vườn rau · mua × 1 · × 5 · × 10, mua được nhiều lần', // shopSeedSub (sửa theo R-VUON-9)
              style: uiText.copyWith(fontSize: AppTextSize.caption, color: AppColors.slateMuted),
            ),
          ],
          if (_tab != SlotKind.hat && _poor) ...[
            const SizedBox(height: 12),
            const ShopBanner.poor(),
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
            Positioned(left: 0, right: 0, bottom: landscape ? 0 : 66, child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 520), child: BoughtToast(item: bought, inBag: seedCrop(bought) == null ? _inBagOf(bought) : 0)))),
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
                  child: ShopConfirm(
                    item: picked,
                    balance: _balance,
                    count: _count,
                    inBag: seedCrop(picked) != null ? _bag[seedCrop(picked)] ?? 0 : _inBagOf(picked),
                    placed: _placedOf(picked),
                    onCount: (k) => setState(() => _count = k),
                    onCancel: () => setState(() => _picked = null),
                    onBuy: () => _buy(picked),
                  ),
                ),
              ),
            ),
          ],
        ],
      );
    });
  }

  /// Ấn son chữ Việt "Tạp hoá" + "Tạp hoá" Lora 22 (ngang 19) + dòng phụ; ví bên phải. Không chữ Hán (R-HUD-4) — ấn theo
  /// artboard `CuaHang-hat-*` (2026-11-15.29).
  Widget _header(bool landscape) {
    final seeds = widget.onBuySeed != null && widget.seeds.isNotEmpty;
    final sealText = uiText.copyWith(fontSize: AppTextSize.sealCaption, fontWeight: FontWeight.w700, color: AppColors.onJade, height: 1.05);
    return Row(
      children: [
        ExcludeSemantics(
          child: Container(
            width: landscape ? 26 : 30,
            height: landscape ? 28 : 32,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(color: AppColors.lacquer, borderRadius: BorderRadius.circular(5)),
            alignment: Alignment.center,
            child: Text('Tạp\nhoá', textAlign: TextAlign.center, style: sealText),
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                header: true,
                child: Text('Tạp hoá', style: displayText.copyWith(color: AppColors.slate, fontSize: landscape ? AppTextSize.titleCompact : AppTextSize.accent)), // shopName
              ),
              Text(
                seeds ? 'Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ · hạt giống cho Vườn rau' : 'Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ', // shopSubtitle
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

  Widget _tabs(bool landscape) {
    // dọc: đệm tab 9 để vừa 5 tab (2026-11-15.29); ngang như cũ 12
    final pad = !landscape && widget.onBuySeed != null && widget.seeds.isNotEmpty ? 9.0 : 12.0;
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
              padding: EdgeInsets.symmetric(horizontal: pad),
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
      child: Row(children: [tab('Tất cả', null), for (final k in SlotKind.values) if (_all.any((i) => i.slot == k)) tab(k.label, k)]), // shopTabAll, slot*
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
                    if (_all.any((i) => i.slot == k)) ...[
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
                          for (final i in _all.where((i) => i.slot == k))
                            SizedBox(
                              width: w,
                              child: ShopCard(
                                item: i,
                                state: _state(i),
                                short: i.price - _balance,
                                picked: _picked?.id == i.id,
                                landscape: landscape,
                                inBag: i.slot == SlotKind.hat ? (_bag[seedCrop(i)] ?? 0) : _inBagOf(i),
                                placed: i.slot == SlotKind.hat ? null : _placedOf(i),
                                onBuy: () => setState(() {
                                  _picked = i;
                                  _count = 1;
                                }),
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
