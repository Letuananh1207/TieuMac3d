/**
 * 50 bộ thủ của Rừng trúc (R-HANH-3; hồ sơ `docs/tham_khao/rung-truc.md` "Bộ thủ trong cảnh"), xếp theo thứ tự học —
 * tu luyện (ngồi thiền) mở bộ chưa học đầu tiên. Chữ phồn thể như phần còn lại của app (文淵, 書). Dữ liệu thuần — gửi sang màn Flutter qua `openRadical`
 * (docs/bridge.md).
 *
 * `evolution` ("Từ hình đến chữ", thiết kế 2026-11-13.9): nét SVG trong khung 0 0 100 100 — ô 1 hình vẽ, ô 2 chữ triện
 * (vẽ tay, gần đúng tinh thần); ô 3 là chữ khải (font). Chỉ có ở bộ tượng hình rõ; bộ khác bỏ dải này.
 */
export interface RadicalExample {
  han: string;
  pinyin: string;
  meaning: string;
}

export interface Radical {
  /** mã ASCII theo âm Hán Việt — tiến độ (Flutter) dùng mã này */
  id: string;
  /** dạng hiện to trên thẻ học (vd. 氵) */
  form: string;
  /** dạng đủ khi khác `form` (vd. 水) */
  full?: string;
  /** âm Hán Việt (vd. "thuỷ") */
  name: string;
  /** nghĩa (vd. "nước") */
  meaning: string;
  pinyin: string;
  /** số nét của `form` */
  strokes: number;
  /** số nét của dạng đủ `full` (khi có) */
  fullStrokes?: number;
  examples: RadicalExample[];
  evolution?: { hinh: string[]; trien: string[] };
}

const ex = (han: string, pinyin: string, meaning: string): RadicalExample => ({ han, pinyin, meaning });

export const RADICALS: Radical[] = [
  {
    id: 'truc', form: '竹', name: 'trúc', meaning: 'tre, trúc', pinyin: 'zhú', strokes: 6,
    examples: [ex('筆', 'bǐ', 'bút'), ex('第', 'dì', 'thứ'), ex('等', 'děng', 'đợi')],
    evolution: {
      hinh: ['M30 90 L30 20', 'M70 90 L70 20', 'M30 20 L15 35', 'M30 20 L42 32', 'M70 20 L55 35', 'M70 20 L85 32'],
      trien: ['M30 15 L20 45', 'M30 25 L45 25', 'M70 15 L60 45', 'M70 25 L85 25', 'M35 30 L35 90', 'M75 30 L75 90'],
    },
  },
  {
    id: 'moc', form: '木', name: 'mộc', meaning: 'cây', pinyin: 'mù', strokes: 4,
    examples: [ex('林', 'lín', 'rừng'), ex('樹', 'shù', 'cây'), ex('桌', 'zhuō', 'bàn')],
    evolution: {
      hinh: ['M50 10 L50 90', 'M50 30 L28 15', 'M50 30 L72 15', 'M50 65 L28 88', 'M50 65 L72 88'],
      trien: ['M50 10 L50 90', 'M25 35 Q50 25 75 35', 'M50 40 L28 80', 'M50 40 L72 80'],
    },
  },
  {
    id: 'thuy', form: '氵', full: '水', name: 'thuỷ', meaning: 'nước', pinyin: 'shuǐ', strokes: 3, fullStrokes: 4,
    examples: [ex('河', 'hé', 'sông'), ex('海', 'hǎi', 'biển'), ex('江', 'jiāng', 'sông lớn')],
    evolution: {
      hinh: ['M50 10 C40 35 60 60 50 90', 'M30 25 Q25 35 30 45', 'M70 25 Q75 35 70 45', 'M30 60 Q25 70 30 80', 'M70 60 Q75 70 70 80'],
      trien: ['M50 10 C42 40 58 60 50 90', 'M32 25 C28 40 36 50 30 62', 'M68 25 C72 40 64 50 70 62'],
    },
  },
  {
    id: 'son', form: '山', name: 'sơn', meaning: 'núi', pinyin: 'shān', strokes: 3,
    examples: [ex('島', 'dǎo', 'đảo'), ex('岸', 'àn', 'bờ'), ex('峰', 'fēng', 'đỉnh núi')],
    evolution: {
      hinh: ['M10 85 L30 45 L45 70 L50 20 L60 65 L72 40 L90 85 Z'],
      trien: ['M20 40 L20 85 L80 85 L80 40', 'M50 15 L50 85'],
    },
  },
  {
    id: 'thach', form: '石', name: 'thạch', meaning: 'đá', pinyin: 'shí', strokes: 5,
    examples: [ex('碗', 'wǎn', 'bát'), ex('破', 'pò', 'vỡ'), ex('研', 'yán', 'nghiên cứu')],
    evolution: {
      hinh: ['M20 20 L80 20', 'M45 20 L25 60', 'M35 55 Q55 45 75 58 Q78 80 55 85 Q35 85 35 55 Z'],
      trien: ['M20 20 L80 20', 'M50 20 L25 70', 'M40 55 L75 55 L75 85 L40 85 Z'],
    },
  },
  {
    id: 'nhat', form: '日', name: 'nhật', meaning: 'mặt trời, ngày', pinyin: 'rì', strokes: 4,
    examples: [ex('明', 'míng', 'sáng'), ex('早', 'zǎo', 'sớm'), ex('時', 'shí', 'giờ')],
    evolution: {
      hinh: ['M50 15 a35 35 0 1 0 0.1 0', 'M50 46 a4 4 0 1 0 0.1 0'],
      trien: ['M28 15 Q50 10 72 15 L72 85 L28 85 Z', 'M30 50 L70 50'],
    },
  },
  {
    id: 'nguyet', form: '月', name: 'nguyệt', meaning: 'trăng, tháng', pinyin: 'yuè', strokes: 4,
    examples: [ex('朋', 'péng', 'bạn'), ex('服', 'fú', 'áo'), ex('期', 'qī', 'kỳ')],
    evolution: {
      hinh: ['M60 12 Q25 50 60 88 Q40 50 60 12 Z'],
      trien: ['M40 12 L70 12 L70 88', 'M40 12 Q35 60 30 88', 'M45 40 L68 40', 'M45 60 L68 60'],
    },
  },
  {
    id: 'vu', form: '雨', name: 'vũ', meaning: 'mưa', pinyin: 'yǔ', strokes: 8,
    examples: [ex('雪', 'xuě', 'tuyết'), ex('雲', 'yún', 'mây'), ex('電', 'diàn', 'điện')],
    evolution: {
      hinh: ['M15 20 L85 20', 'M20 35 Q50 25 80 35', 'M30 50 L28 60', 'M50 55 L48 65', 'M70 50 L68 60', 'M30 72 L28 82', 'M70 72 L68 82'],
      trien: ['M15 15 L85 15', 'M20 30 L20 90', 'M80 30 L80 90', 'M20 30 L80 30', 'M50 15 L50 70', 'M32 45 L36 50', 'M32 65 L36 70', 'M64 45 L68 50', 'M64 65 L68 70'],
    },
  },
  {
    id: 'nhan', form: '亻', full: '人', name: 'nhân', meaning: 'người', pinyin: 'rén', strokes: 2, fullStrokes: 2,
    examples: [ex('你', 'nǐ', 'bạn'), ex('他', 'tā', 'anh ấy'), ex('休', 'xiū', 'nghỉ')],
    evolution: {
      hinh: ['M50 10 a8 8 0 1 0 0.1 0', 'M50 26 L50 55', 'M50 34 L30 50', 'M50 55 L32 90', 'M50 55 L68 90'],
      trien: ['M55 12 C50 40 40 65 25 90', 'M52 45 C60 60 68 75 78 90'],
    },
  },
  {
    id: 'khau', form: '口', name: 'khẩu', meaning: 'miệng', pinyin: 'kǒu', strokes: 3,
    examples: [ex('吃', 'chī', 'ăn'), ex('喝', 'hē', 'uống'), ex('叫', 'jiào', 'gọi')],
    evolution: {
      hinh: ['M25 30 Q50 20 75 30 Q80 55 70 75 Q50 85 30 75 Q20 55 25 30 Z'],
      trien: ['M28 30 L72 30 L72 75 L28 75 Z'],
    },
  },
  {
    id: 'muc', form: '目', name: 'mục', meaning: 'mắt', pinyin: 'mù', strokes: 5,
    examples: [ex('看', 'kàn', 'nhìn'), ex('眼', 'yǎn', 'mắt'), ex('睡', 'shuì', 'ngủ')],
    evolution: {
      hinh: ['M10 50 Q50 15 90 50 Q50 85 10 50 Z', 'M50 38 a12 12 0 1 0 0.1 0'],
      trien: ['M30 10 L70 10 L70 90 L30 90 Z', 'M30 37 L70 37', 'M30 63 L70 63'],
    },
  },
  {
    id: 'tam', form: '忄', full: '心', name: 'tâm', meaning: 'tim, lòng', pinyin: 'xīn', strokes: 3, fullStrokes: 4,
    examples: [ex('想', 'xiǎng', 'nghĩ'), ex('快', 'kuài', 'nhanh; vui'), ex('忙', 'máng', 'bận')],
    evolution: {
      hinh: ['M50 85 Q15 55 25 30 Q40 15 50 35 Q60 15 75 30 Q85 55 50 85 Z'],
      trien: ['M30 40 Q30 80 60 80 Q75 78 75 60', 'M50 25 L55 40', 'M75 35 L82 45', 'M22 50 L28 60'],
    },
  },
  {
    id: 'thu', form: '扌', full: '手', name: 'thủ', meaning: 'tay', pinyin: 'shǒu', strokes: 3, fullStrokes: 4,
    examples: [ex('打', 'dǎ', 'đánh'), ex('拿', 'ná', 'cầm'), ex('找', 'zhǎo', 'tìm')],
  },
  {
    id: 'hoa', form: '火', name: 'hoả', meaning: 'lửa', pinyin: 'huǒ', strokes: 4,
    examples: [ex('燈', 'dēng', 'đèn'), ex('熱', 'rè', 'nóng'), ex('點', 'diǎn', 'điểm')],
    evolution: {
      hinh: ['M50 10 Q35 40 40 60 Q30 50 25 40 Q15 75 50 90 Q85 75 75 40 Q70 50 60 60 Q65 40 50 10 Z'],
      trien: ['M50 10 L50 50 L25 90', 'M50 50 L75 90', 'M25 35 L35 50', 'M75 35 L65 50'],
    },
  },
  {
    id: 'tho', form: '土', name: 'thổ', meaning: 'đất', pinyin: 'tǔ', strokes: 3,
    examples: [ex('地', 'dì', 'đất'), ex('在', 'zài', 'ở'), ex('城', 'chéng', 'thành')],
  },
  {
    id: 'dien', form: '田', name: 'điền', meaning: 'ruộng', pinyin: 'tián', strokes: 5,
    examples: [ex('男', 'nán', 'nam'), ex('界', 'jiè', 'giới'), ex('留', 'liú', 'ở lại')],
    evolution: {
      hinh: ['M15 20 L85 20 L85 80 L15 80 Z', 'M50 20 L50 80', 'M15 50 L85 50'],
      trien: ['M18 18 Q50 12 82 18 Q88 50 82 82 Q50 88 18 82 Q12 50 18 18 Z', 'M50 15 L50 85', 'M15 50 L85 50'],
    },
  },
  {
    id: 'thao', form: '艹', full: '艸', name: 'thảo', meaning: 'cỏ', pinyin: 'cǎo', strokes: 3, fullStrokes: 6,
    examples: [ex('花', 'huā', 'hoa'), ex('茶', 'chá', 'trà'), ex('草', 'cǎo', 'cỏ')],
  },
  {
    id: 'dieu', form: '鳥', name: 'điểu', meaning: 'chim', pinyin: 'niǎo', strokes: 11,
    examples: [ex('鴨', 'yā', 'vịt'), ex('鵝', 'é', 'ngỗng'), ex('鳴', 'míng', 'hót, kêu')],
    evolution: {
      hinh: ['M30 30 Q45 15 60 30 Q80 40 85 60 Q60 75 35 65 Q25 50 30 30 Z', 'M30 30 L15 35 L30 38', 'M40 27 a3 3 0 1 0 0.1 0', 'M50 65 L48 85', 'M60 65 L62 85'],
      trien: ['M45 10 L35 25', 'M30 25 L70 25 L70 60 L30 60 Z', 'M30 42 L70 42', 'M30 60 Q50 80 75 70', 'M35 75 L35 85', 'M50 75 L50 88', 'M65 75 L65 85'],
    },
  },
  {
    id: 'ngu', form: '魚', name: 'ngư', meaning: 'cá', pinyin: 'yú', strokes: 11,
    examples: [ex('鮮', 'xiān', 'tươi'), ex('鯉', 'lǐ', 'cá chép'), ex('鯨', 'jīng', 'cá voi')],
    evolution: {
      hinh: ['M15 50 Q40 25 70 50 Q40 75 15 50 Z', 'M70 50 L88 35 L88 65 Z', 'M30 44 a3 3 0 1 0 0.1 0'],
      trien: ['M45 10 L35 25', 'M30 25 L70 25 L70 60 L30 60 Z', 'M30 42 L70 42', 'M50 25 L50 60', 'M30 75 L35 85', 'M50 75 L50 88', 'M70 75 L65 85'],
    },
  },
  {
    id: 'mon', form: '門', name: 'môn', meaning: 'cửa', pinyin: 'mén', strokes: 8,
    examples: [ex('開', 'kāi', 'mở'), ex('問', 'wèn', 'hỏi'), ex('間', 'jiān', 'gian')],
    evolution: {
      hinh: ['M15 15 L15 90', 'M85 15 L85 90', 'M15 15 L42 15 L42 60 L15 60', 'M85 15 L58 15 L58 60 L85 60'],
      trien: ['M15 10 L15 90', 'M85 10 L85 90', 'M15 20 L42 20 L42 50', 'M85 20 L58 20 L58 50'],
    },
  },
  {
    id: 'nu', form: '女', name: 'nữ', meaning: 'con gái', pinyin: 'nǚ', strokes: 3,
    examples: [ex('好', 'hǎo', 'tốt'), ex('媽', 'mā', 'mẹ'), ex('姐', 'jiě', 'chị')],
    evolution: {
      hinh: ['M50 15 a8 8 0 1 0 0.1 0', 'M50 31 Q35 55 45 70 L30 88', 'M45 70 L65 88', 'M30 50 Q50 40 70 52'],
      trien: ['M45 10 Q30 50 60 85', 'M65 15 Q60 55 25 85', 'M15 45 L85 45'],
    },
  },
  {
    id: 'tu', form: '子', name: 'tử', meaning: 'con, đứa trẻ', pinyin: 'zǐ', strokes: 3,
    examples: [ex('學', 'xué', 'học'), ex('孩', 'hái', 'trẻ con'), ex('孫', 'sūn', 'cháu')],
    evolution: {
      hinh: ['M50 10 a12 12 0 1 0 0.1 0', 'M50 34 L50 85 Q50 92 42 88', 'M25 45 L75 45'],
      trien: ['M30 15 L70 15 Q60 30 50 35', 'M50 35 L50 85 Q48 92 38 85', 'M20 50 L80 50'],
    },
  },
  {
    id: 'dai', form: '大', name: 'đại', meaning: 'lớn', pinyin: 'dà', strokes: 3,
    examples: [ex('天', 'tiān', 'trời'), ex('太', 'tài', 'quá'), ex('夫', 'fū', 'chồng')],
  },
  {
    id: 'tieu', form: '小', name: 'tiểu', meaning: 'nhỏ', pinyin: 'xiǎo', strokes: 3,
    examples: [ex('少', 'shǎo', 'ít'), ex('尖', 'jiān', 'nhọn'), ex('尚', 'shàng', 'còn, vẫn')],
  },
  {
    id: 'ngon', form: '言', name: 'ngôn', meaning: 'lời nói', pinyin: 'yán', strokes: 7,
    examples: [ex('說', 'shuō', 'nói'), ex('語', 'yǔ', 'ngôn ngữ'), ex('話', 'huà', 'lời nói')],
  },
  {
    id: 'mich', form: '糸', name: 'mịch', meaning: 'sợi tơ', pinyin: 'mì', strokes: 6,
    examples: [ex('紅', 'hóng', 'đỏ'), ex('給', 'gěi', 'cho'), ex('紙', 'zhǐ', 'giấy')],
  },
  {
    id: 'kim', form: '金', name: 'kim', meaning: 'vàng, kim loại', pinyin: 'jīn', strokes: 8,
    examples: [ex('錢', 'qián', 'tiền'), ex('鐘', 'zhōng', 'chuông, đồng hồ'), ex('銀', 'yín', 'bạc')],
  },
  {
    id: 'suoc', form: '辶', full: '辵', name: 'sước', meaning: 'bước đi', pinyin: 'chuò', strokes: 3, fullStrokes: 7,
    examples: [ex('這', 'zhè', 'này'), ex('道', 'dào', 'đường'), ex('近', 'jìn', 'gần')],
  },
  {
    id: 'dao', form: '刂', full: '刀', name: 'đao', meaning: 'dao', pinyin: 'dāo', strokes: 2, fullStrokes: 2,
    examples: [ex('到', 'dào', 'đến'), ex('別', 'bié', 'khác'), ex('前', 'qián', 'trước')],
  },
  {
    id: 'mien', form: '宀', name: 'miên', meaning: 'mái nhà', pinyin: 'mián', strokes: 3,
    examples: [ex('家', 'jiā', 'nhà'), ex('字', 'zì', 'chữ'), ex('安', 'ān', 'yên')],
  },
  {
    id: 'boi', form: '貝', name: 'bối', meaning: 'vỏ sò, tiền', pinyin: 'bèi', strokes: 7,
    examples: [ex('買', 'mǎi', 'mua'), ex('賣', 'mài', 'bán'), ex('貴', 'guì', 'đắt')],
  },
  {
    id: 'tuc', form: '足', name: 'túc', meaning: 'chân', pinyin: 'zú', strokes: 7,
    examples: [ex('跑', 'pǎo', 'chạy'), ex('路', 'lù', 'đường'), ex('跳', 'tiào', 'nhảy')],
  },
  {
    id: 'tau', form: '走', name: 'tẩu', meaning: 'chạy, đi', pinyin: 'zǒu', strokes: 7,
    examples: [ex('起', 'qǐ', 'dậy'), ex('越', 'yuè', 'vượt'), ex('趣', 'qù', 'thú vị')],
  },
  {
    id: 'xa', form: '車', name: 'xa', meaning: 'xe', pinyin: 'chē', strokes: 7,
    examples: [ex('輕', 'qīng', 'nhẹ'), ex('轉', 'zhuǎn', 'chuyển'), ex('輛', 'liàng', 'chiếc (xe)')],
  },
  {
    id: 'ma', form: '馬', name: 'mã', meaning: 'ngựa', pinyin: 'mǎ', strokes: 10,
    examples: [ex('騎', 'qí', 'cưỡi'), ex('驗', 'yàn', 'kiểm tra'), ex('驚', 'jīng', 'kinh ngạc')],
  },
  {
    id: 'y', form: '衤', full: '衣', name: 'y', meaning: 'áo', pinyin: 'yī', strokes: 5, fullStrokes: 6,
    examples: [ex('裙', 'qún', 'váy'), ex('被', 'bèi', 'chăn; bị'), ex('褲', 'kù', 'quần')],
  },
  {
    id: 'thi', form: '礻', full: '示', name: 'thị', meaning: 'thần, bày tỏ', pinyin: 'shì', strokes: 4, fullStrokes: 5,
    examples: [ex('祝', 'zhù', 'chúc'), ex('福', 'fú', 'phúc'), ex('禮', 'lǐ', 'lễ')],
  },
  {
    id: 'thuc', form: '食', name: 'thực', meaning: 'ăn', pinyin: 'shí', strokes: 9,
    examples: [ex('飯', 'fàn', 'cơm'), ex('餓', 'è', 'đói'), ex('館', 'guǎn', 'quán')],
  },
  {
    id: 'luc', form: '力', name: 'lực', meaning: 'sức', pinyin: 'lì', strokes: 2,
    examples: [ex('動', 'dòng', 'động'), ex('助', 'zhù', 'giúp'), ex('加', 'jiā', 'thêm')],
  },
  {
    id: 'huu', form: '又', name: 'hựu', meaning: 'lại; bàn tay', pinyin: 'yòu', strokes: 2,
    examples: [ex('友', 'yǒu', 'bạn'), ex('取', 'qǔ', 'lấy'), ex('受', 'shòu', 'nhận')],
  },
  {
    id: 'nghiem', form: '广', name: 'nghiễm', meaning: 'mái hiên', pinyin: 'yǎn', strokes: 3,
    examples: [ex('店', 'diàn', 'cửa hàng'), ex('床', 'chuáng', 'giường'), ex('座', 'zuò', 'chỗ ngồi')],
  },
  {
    id: 'xich', form: '彳', name: 'xích', meaning: 'bước chân', pinyin: 'chì', strokes: 3,
    examples: [ex('很', 'hěn', 'rất'), ex('往', 'wǎng', 'hướng tới'), ex('得', 'dé', 'được')],
  },
  {
    id: 'phu', form: '阝', full: '阜', name: 'phụ', meaning: 'gò đất', pinyin: 'fù', strokes: 2, fullStrokes: 8,
    examples: [ex('院', 'yuàn', 'viện'), ex('陽', 'yáng', 'mặt trời'), ex('除', 'chú', 'trừ')],
  },
  {
    id: 'ngoc', form: '王', full: '玉', name: 'ngọc', meaning: 'ngọc', pinyin: 'yù', strokes: 4, fullStrokes: 5,
    examples: [ex('玩', 'wán', 'chơi'), ex('球', 'qiú', 'quả bóng'), ex('現', 'xiàn', 'hiện')],
  },
  {
    id: 'khuyen', form: '犭', full: '犬', name: 'khuyển', meaning: 'chó', pinyin: 'quǎn', strokes: 3, fullStrokes: 4,
    examples: [ex('狗', 'gǒu', 'chó'), ex('狼', 'láng', 'sói'), ex('獅', 'shī', 'sư tử')],
  },
  {
    id: 'nach', form: '疒', name: 'nạch', meaning: 'bệnh', pinyin: 'nè', strokes: 5,
    examples: [ex('病', 'bìng', 'bệnh'), ex('疼', 'téng', 'đau'), ex('瘦', 'shòu', 'gầy')],
  },
  {
    id: 'hoa-lua', form: '禾', name: 'hoà', meaning: 'lúa', pinyin: 'hé', strokes: 5,
    examples: [ex('秋', 'qiū', 'mùa thu'), ex('種', 'zhǒng', 'loại; trồng'), ex('科', 'kē', 'khoa')],
  },
  {
    id: 'me', form: '米', name: 'mễ', meaning: 'gạo', pinyin: 'mǐ', strokes: 6,
    examples: [ex('粉', 'fěn', 'bột'), ex('糖', 'táng', 'đường (ngọt)'), ex('精', 'jīng', 'tinh')],
  },
  {
    id: 'hiet', form: '頁', name: 'hiệt', meaning: 'đầu', pinyin: 'yè', strokes: 9,
    examples: [ex('題', 'tí', 'đề'), ex('顏', 'yán', 'màu; mặt'), ex('頭', 'tóu', 'đầu')],
  },
  {
    id: 'bach', form: '白', name: 'bạch', meaning: 'trắng', pinyin: 'bái', strokes: 5,
    examples: [ex('百', 'bǎi', 'trăm'), ex('的', 'de', 'của'), ex('皇', 'huáng', 'hoàng')],
  },
];

/** Lỗi dữ liệu: mã trùng, thiếu ví dụ. `scene:check` / mô phỏng gọi. */
export function checkRadicals(list: readonly Radical[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const r of list) {
    if (seen.has(r.id)) out.push(`bộ thủ "${r.id}" trùng mã`);
    seen.add(r.id);
    if (r.examples.length < 2 || r.examples.length > 3) out.push(`bộ thủ "${r.id}": cần 2–3 chữ ví dụ`);
  }
  return out;
}
