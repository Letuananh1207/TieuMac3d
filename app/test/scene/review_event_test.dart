import 'package:flutter_test/flutter_test.dart';
import 'package:hoc_xa_3d/scene/review_event.dart';
import 'package:hoc_xa_3d/scene/word_event.dart';

Map<String, Object?> _word(String han, {String bai = 'bai-01'}) => {
      'id': han,
      'han': han,
      'pinyin': 'nǐ',
      'thanh': [3],
      'meaning': 'bạn',
      'example': {'han': '你好！', 'pinyin': 'Nǐ hǎo!', 'meaning': 'Xin chào!'},
      'cap': 1,
      'bai': bai,
      'am': false,
      'amCau': false,
    };

Map<String, Object?> _item(String han) => {
      'word': _word(han),
      'questions': [
        {'kind': 'chu-nghia', 'options': ['bạn', 'tôi', 'tốt', 'trà'], 'answer': 0},
        {'kind': 'nghia-chu', 'options': ['我', han, '好', '茶'], 'answer': 1},
      ],
    };

void main() {
  test('openReview: từ + 2 câu theo dạng (R-ON-2, R-TU-2); mục sai dạng bỏ qua; rỗng → null', () {
    final r = OpenReviewRequest.parse([
      {'type': 'openReview', 'payload': {'items': [_item('你'), {'word': {'id': 1}}], 'region': 'Trúc Lâm'}},
    ]);
    expect(r!.items, hasLength(1));
    expect(r.items.single.word.han, '你');
    expect(r.items.single.word.tones, [3]);
    expect(r.items.single.word.example.meaning, 'Xin chào!');
    final qs = r.items.single.questions;
    expect(qs.map((q) => q.kind), ['chu-nghia', 'nghia-chu']);
    expect(qs[1].optionsHan, isTrue);
    expect(qs[0].isPinyin, isFalse);
    expect(r.region, 'Trúc Lâm');
    expect(OpenReviewRequest.parse([{'type': 'openReview', 'payload': {'items': []}}]), isNull);
    expect(OpenReviewRequest.parse([{'type': 'openDaily', 'payload': {'items': [_item('你')]}}]), isNull);
  });

  test('openDaily: kèm câu đố từ đến hạn; payload rỗng vẫn mở được bảng', () {
    final d = OpenDailyRequest.parse([
      {'type': 'openDaily', 'payload': {'review': [_item('好')]}},
    ]);
    expect(d!.review.single.word.id, '好');
    final empty = OpenDailyRequest.parse([{'type': 'openDaily', 'payload': {}}]);
    expect(empty!.review, isEmpty);
  });

  test('R-ON-8: openLearned — từ đã học + bài (mã, tên); từ sai dạng bỏ qua', () {
    final l = OpenLearnedRequest.parse([
      {
        'type': 'openLearned',
        'payload': {
          'words': [_word('你'), {'id': 1}],
          'lessons': [{'id': 'bai-01', 'title': 'Chào hỏi'}, {'id': 2}],
          'region': 'Khởi Nguyên Trấn',
        },
      },
    ]);
    expect(l!.words.map((w) => w.id), ['你']);
    expect(l.lessons.single, (id: 'bai-01', title: 'Chào hỏi'));
    expect(l.region, 'Khởi Nguyên Trấn');
    expect(OpenLearnedRequest.parse([{'type': 'openLearned', 'payload': {}}]), isNull);
  });

  test('R-HANH-3: openWordLesson — bài + từ theo trang; không có từ → null', () {
    final w = OpenWordLessonRequest.parse([
      {
        'type': 'openWordLesson',
        'payload': {
          'lesson': {'id': 'bai-01', 'title': 'Chào hỏi', 'index': 1, 'total': 50},
          'words': [_word('你'), _word('我')],
          'learned': false,
          'region': 'Trúc Lâm',
        },
      },
    ]);
    expect(w!.lessonId, 'bai-01');
    expect(w.title, 'Chào hỏi');
    expect(w.total, 50);
    expect(w.words.map((x) => x.han), ['你', '我']);
    expect(w.learned, isFalse);
    expect(
      OpenWordLessonRequest.parse([
        {'type': 'openWordLesson', 'payload': {'lesson': {'id': 'bai-01', 'title': 'x'}, 'words': []}},
      ]),
      isNull,
    );
  });
}
