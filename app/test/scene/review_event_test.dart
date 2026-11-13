import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';

Map<String, Object?> _radical(String id, String form) =>
    {'id': id, 'form': form, 'name': 'trúc', 'meaning': 'tre', 'pinyin': 'zhú', 'strokes': 6, 'examples': []};

Map<String, Object?> _item(String id, String form) => {
      'radical': _radical(id, form),
      'questions': [
        {'ask': 'pinyin', 'options': ['zhú', 'mù', 'shān'], 'answer': 0},
        {'ask': 'meaning', 'options': ['mộc — cây', 'trúc — tre', 'sơn — núi'], 'answer': 1},
      ],
    };

void main() {
  test('openReview: đọc bộ + 2 câu (docs/bridge.md)', () {
    final r = OpenReviewRequest.parse([
      {'type': 'openReview', 'payload': {'items': [_item('truc', '竹')], 'region': 'Rừng trúc'}},
    ]);
    expect(r, isNotNull);
    expect(r!.items.single.radical.form, '竹');
    expect(r.items.single.questions.map((q) => q.ask), ['pinyin', 'meaning']);
    expect(r.items.single.questions[1].answer, 1);
  });

  test('openReview: không có bộ hợp lệ / sai loại → null (trang mở thẻ bộ mới như cũ)', () {
    expect(OpenReviewRequest.parse([{'type': 'openReview', 'payload': {'items': []}}]), isNull);
    expect(OpenReviewRequest.parse([{'type': 'openDaily', 'payload': {'items': [_item('truc', '竹')]}}]), isNull);
    // đáp án ngoài khoảng → câu bị bỏ, bộ không còn câu nào → bỏ
    final bad = _item('truc', '竹')..['questions'] = [{'ask': 'pinyin', 'options': ['a'], 'answer': 3}];
    expect(OpenReviewRequest.parse([{'type': 'openReview', 'payload': {'items': [bad]}}]), isNull);
  });

  test('openDaily: kèm câu đố bộ đến hạn + chữ từng bộ; payload rỗng vẫn mở được bảng', () {
    final d = OpenDailyRequest.parse([
      {'type': 'openDaily', 'payload': {'review': [_item('moc', '木')], 'forms': {'moc': '木', 'truc': '竹'}}},
    ]);
    expect(d!.review.single.radical.id, 'moc');
    expect(d.forms['truc'], '竹');
    final empty = OpenDailyRequest.parse([{'type': 'openDaily', 'payload': {}}]);
    expect(empty!.review, isEmpty);
  });

  Map<String, Object?> studyPayload() => {
        'items': [
          {'id': 'review', 'enabled': true, 'reason': null, 'count': 1},
          {'id': 'learn', 'enabled': false, 'reason': 'learnInRegion', 'count': 0},
          {'id': 'learned', 'enabled': true, 'reason': null, 'count': 2},
        ],
        'highlight': 'review',
        'review': [_item('truc', '竹')],
        'next': null,
        'learned': [_radical('truc', '竹'), _radical('moc', '木')],
        'region': 'Văn Uyên Tông',
      };

  test('R-ON-8: openStudy đọc 3 mục, mục nổi bật, câu đố đến hạn, bộ đã học (docs/bridge.md)', () {
    final s = OpenStudyRequest.parse([{'type': 'openStudy', 'payload': studyPayload()}]);
    expect(s, isNotNull);
    expect(s!.items.map((i) => i.id), ['review', 'learn', 'learned']);
    expect(s.item('learn').enabled, isFalse);
    expect(s.item('learn').reason, 'learnInRegion');
    expect(s.item('review').count, 1);
    expect(s.highlight, 'review');
    expect(s.review.single.radical.id, 'truc');
    expect(s.next, isNull);
    expect(s.learned.map((r) => r.form), ['竹', '木']);
    expect(s.region, 'Văn Uyên Tông');
  });

  test('R-ON-8: openStudy thiếu mục / sai loại → null (trang tự mở lượt ôn / thẻ bộ mới)', () {
    final p = studyPayload()..['items'] = [{'id': 'review', 'enabled': true, 'reason': null, 'count': 1}];
    expect(OpenStudyRequest.parse([{'type': 'openStudy', 'payload': p}]), isNull);
    expect(OpenStudyRequest.parse([{'type': 'openReview', 'payload': studyPayload()}]), isNull);
    final withNext = studyPayload()..['next'] = _radical('son', '山');
    expect(OpenStudyRequest.parse([{'type': 'openStudy', 'payload': withNext}])!.next!.form, '山');
  });
}
