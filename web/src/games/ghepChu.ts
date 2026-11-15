/**
 * Chữ ghép bộ thủ cho Lưu Thương Lệnh (R-LUU-3): mỗi chữ = một bộ thủ của Trúc Lâm (`zones/radicals.ts`) + **phần còn
 * lại** (có sẵn trên khung), kiểu ghép, âm Hán Việt, pinyin, nghĩa. Chữ phồn thể như phần còn lại của app; phần còn lại là
 * một chữ / thành phần có trong font (`npm run fonts:han` báo lỗi nếu thiếu). Ghép theo **hình** (người chơi nhìn mảnh ghép),
 * không theo bộ tra từ điển — vd. 雀 = 小 trên 隹. Dữ liệu thuần — không three, không DOM.
 */

/** Kiểu ghép: trái – phải · trên – dưới · bao (bộ bao lấy phần còn lại: 門, 辶, 走, 广, 疒). */
export type GhepLayout = 'trai-phai' | 'tren-duoi' | 'bao';

export interface GhepChar {
  han: string;
  /** mã bộ thủ (`RADICALS[].id`) */
  radical: string;
  /** phần còn lại hiện sẵn trên khung */
  rest: string;
  layout: GhepLayout;
  /** bộ ở đầu (trái / trên / ngoài) hay cuối (phải / dưới) — `bao` luôn `dau` */
  at: 'dau' | 'cuoi';
  /** âm Hán Việt */
  hv: string;
  pinyin: string;
  meaning: string;
}

type Row = [han: string, rest: string, hv: string, pinyin: string, meaning: string, kind?: 'td' | 'tdc' | 'pc' | 'bao'];

/** `kind`: thiếu = trái – phải bộ bên trái · `pc` bộ bên phải · `td` trên – dưới bộ ở trên · `tdc` bộ ở dưới · `bao`. */
const DATA: Record<string, Row[]> = {
  truc: [['筆', '聿', 'bút', 'bǐ', 'cây bút', 'td'], ['笑', '夭', 'tiếu', 'xiào', 'cười', 'td'], ['答', '合', 'đáp', 'dá', 'trả lời', 'td']],
  moc: [['林', '木', 'lâm', 'lín', 'rừng'], ['松', '公', 'tùng', 'sōng', 'cây tùng'], ['桃', '兆', 'đào', 'táo', 'cây đào']],
  thuy: [['河', '可', 'hà', 'hé', 'sông'], ['海', '每', 'hải', 'hǎi', 'biển'], ['湖', '胡', 'hồ', 'hú', 'hồ nước']],
  son: [['岩', '石', 'nham', 'yán', 'đá núi', 'td'], ['崩', '朋', 'băng', 'bēng', 'lở, sụp', 'td'], ['峽', '夾', 'hiệp', 'xiá', 'hẻm núi']],
  thach: [['砂', '少', 'sa', 'shā', 'cát'], ['破', '皮', 'phá', 'pò', 'vỡ, phá'], ['碑', '卑', 'bi', 'bēi', 'bia đá']],
  nhat: [['明', '月', 'minh', 'míng', 'sáng'], ['晴', '青', 'tình', 'qíng', 'trời quang'], ['時', '寺', 'thời', 'shí', 'giờ, thời gian']],
  nguyet: [['朋', '月', 'bằng', 'péng', 'bạn'], ['期', '其', 'kỳ', 'qī', 'kỳ hẹn', 'pc'], ['朗', '良', 'lãng', 'lǎng', 'sáng sủa', 'pc']],
  vu: [['雪', '彐', 'tuyết', 'xuě', 'tuyết', 'td'], ['雲', '云', 'vân', 'yún', 'mây', 'td'], ['雷', '田', 'lôi', 'léi', 'sấm', 'td']],
  nhan: [['休', '木', 'hưu', 'xiū', 'nghỉ ngơi'], ['住', '主', 'trú', 'zhù', 'ở'], ['他', '也', 'tha', 'tā', 'người ấy']],
  khau: [['吹', '欠', 'xuy', 'chuī', 'thổi'], ['唱', '昌', 'xướng', 'chàng', 'hát'], ['味', '未', 'vị', 'wèi', 'mùi vị']],
  muc: [['眼', '艮', 'nhãn', 'yǎn', 'mắt'], ['睡', '垂', 'thuỵ', 'shuì', 'ngủ'], ['盲', '亡', 'manh', 'máng', 'mù', 'tdc']],
  tam: [['情', '青', 'tình', 'qíng', 'tình cảm'], ['怕', '白', 'phạ', 'pà', 'sợ'], ['慢', '曼', 'mạn', 'màn', 'chậm']],
  thu: [['打', '丁', 'đả', 'dǎ', 'đánh'], ['拍', '白', 'phách', 'pāi', 'vỗ'], ['指', '旨', 'chỉ', 'zhǐ', 'ngón tay, chỉ']],
  hoa: [['燈', '登', 'đăng', 'dēng', 'đèn'], ['炒', '少', 'sao', 'chǎo', 'xào'], ['燒', '堯', 'thiêu', 'shāo', 'đốt']],
  tho: [['地', '也', 'địa', 'dì', 'đất'], ['城', '成', 'thành', 'chéng', 'thành trì'], ['坐', '从', 'toạ', 'zuò', 'ngồi', 'tdc']],
  dien: [['男', '力', 'nam', 'nán', 'con trai', 'td'], ['界', '介', 'giới', 'jiè', 'cõi, ranh giới', 'td'], ['思', '心', 'tư', 'sī', 'nghĩ', 'td']],
  thao: [['花', '化', 'hoa', 'huā', 'hoa', 'td'], ['草', '早', 'thảo', 'cǎo', 'cỏ', 'td'], ['苦', '古', 'khổ', 'kǔ', 'đắng, khổ', 'td']],
  dieu: [['鳴', '口', 'minh', 'míng', 'kêu, hót', 'pc'], ['鴨', '甲', 'áp', 'yā', 'con vịt', 'pc'], ['鵝', '我', 'nga', 'é', 'con ngỗng', 'pc']],
  ngu: [['鮮', '羊', 'tiên', 'xiān', 'tươi'], ['鯉', '里', 'lý', 'lǐ', 'cá chép'], ['鯨', '京', 'kình', 'jīng', 'cá voi']],
  mon: [['間', '日', 'gian', 'jiān', 'khoảng, gian', 'bao'], ['問', '口', 'vấn', 'wèn', 'hỏi', 'bao'], ['閉', '才', 'bế', 'bì', 'đóng', 'bao']],
  nu: [['好', '子', 'hảo', 'hǎo', 'tốt'], ['媽', '馬', 'ma', 'mā', 'mẹ'], ['妹', '未', 'muội', 'mèi', 'em gái']],
  tu: [['孩', '亥', 'hài', 'hái', 'trẻ con'], ['孫', '系', 'tôn', 'sūn', 'cháu'], ['字', '宀', 'tự', 'zì', 'chữ', 'tdc']],
  dai: [['奇', '可', 'kỳ', 'qí', 'lạ', 'td'], ['奔', '卉', 'bôn', 'bēn', 'chạy vội', 'td'], ['奎', '圭', 'khuê', 'kuí', 'sao Khuê', 'td']],
  tieu: [['尖', '大', 'tiêm', 'jiān', 'nhọn', 'td'], ['雀', '隹', 'tước', 'què', 'chim sẻ', 'td']],
  ngon: [['語', '吾', 'ngữ', 'yǔ', 'lời, tiếng'], ['話', '舌', 'thoại', 'huà', 'lời nói'], ['詩', '寺', 'thi', 'shī', 'thơ']],
  mich: [['紅', '工', 'hồng', 'hóng', 'đỏ'], ['紙', '氏', 'chỉ', 'zhǐ', 'giấy'], ['線', '泉', 'tuyến', 'xiàn', 'sợi chỉ']],
  kim: [['銀', '艮', 'ngân', 'yín', 'bạc'], ['鐘', '童', 'chung', 'zhōng', 'chuông'], ['鏡', '竟', 'kính', 'jìng', 'gương']],
  suoc: [['道', '首', 'đạo', 'dào', 'con đường', 'bao'], ['近', '斤', 'cận', 'jìn', 'gần', 'bao'], ['遠', '袁', 'viễn', 'yuǎn', 'xa', 'bao']],
  dao: [['到', '至', 'đáo', 'dào', 'đến', 'pc'], ['刻', '亥', 'khắc', 'kè', 'khắc', 'pc'], ['利', '禾', 'lợi', 'lì', 'lợi, sắc', 'pc']],
  mien: [['家', '豕', 'gia', 'jiā', 'nhà', 'td'], ['安', '女', 'an', 'ān', 'yên', 'td'], ['室', '至', 'thất', 'shì', 'phòng', 'td']],
  boi: [['財', '才', 'tài', 'cái', 'của cải'], ['貨', '化', 'hoá', 'huò', 'hàng hoá', 'tdc'], ['賞', '尚', 'thưởng', 'shǎng', 'thưởng', 'tdc']],
  tuc: [['跑', '包', 'bào', 'pǎo', 'chạy'], ['跳', '兆', 'khiêu', 'tiào', 'nhảy'], ['路', '各', 'lộ', 'lù', 'đường đi']],
  tau: [['起', '己', 'khởi', 'qǐ', 'dậy, bắt đầu', 'bao'], ['趣', '取', 'thú', 'qù', 'thú vị', 'bao'], ['超', '召', 'siêu', 'chāo', 'vượt', 'bao']],
  xa: [['輪', '侖', 'luân', 'lún', 'bánh xe'], ['軟', '欠', 'nhuyễn', 'ruǎn', 'mềm'], ['軌', '九', 'quỹ', 'guǐ', 'đường ray']],
  ma: [['騎', '奇', 'kỵ', 'qí', 'cưỡi'], ['駕', '加', 'giá', 'jià', 'đánh xe', 'tdc'], ['驚', '敬', 'kinh', 'jīng', 'sợ, giật mình', 'tdc']],
  y: [['被', '皮', 'bị', 'bèi', 'chăn'], ['初', '刀', 'sơ', 'chū', 'ban đầu'], ['補', '甫', 'bổ', 'bǔ', 'vá, bù']],
  thi: [['神', '申', 'thần', 'shén', 'thần'], ['福', '畐', 'phúc', 'fú', 'phúc'], ['祖', '且', 'tổ', 'zǔ', 'ông tổ']],
  thuc: [['飯', '反', 'phạn', 'fàn', 'cơm'], ['飲', '欠', 'ẩm', 'yǐn', 'uống'], ['館', '官', 'quán', 'guǎn', 'quán']],
  luc: [['助', '且', 'trợ', 'zhù', 'giúp', 'pc'], ['動', '重', 'động', 'dòng', 'động', 'pc'], ['功', '工', 'công', 'gōng', 'công lao', 'pc']],
  huu: [['取', '耳', 'thủ', 'qǔ', 'lấy', 'pc'], ['叔', '尗', 'thúc', 'shū', 'chú', 'pc']],
  nghiem: [['店', '占', 'điếm', 'diàn', 'tiệm', 'bao'], ['床', '木', 'sàng', 'chuáng', 'giường', 'bao'], ['庭', '廷', 'đình', 'tíng', 'sân', 'bao']],
  xich: [['往', '主', 'vãng', 'wǎng', 'đi tới'], ['很', '艮', 'ngận', 'hěn', 'rất'], ['待', '寺', 'đãi', 'dài', 'đợi']],
  phu: [['陽', '昜', 'dương', 'yáng', 'mặt trời'], ['院', '完', 'viện', 'yuàn', 'viện, sân'], ['階', '皆', 'giai', 'jiē', 'bậc thềm']],
  ngoc: [['球', '求', 'cầu', 'qiú', 'quả cầu'], ['珠', '朱', 'châu', 'zhū', 'ngọc trai'], ['理', '里', 'lý', 'lǐ', 'lý lẽ']],
  khuyen: [['狗', '句', 'cẩu', 'gǒu', 'con chó'], ['狼', '良', 'lang', 'láng', 'chó sói'], ['猴', '侯', 'hầu', 'hóu', 'con khỉ']],
  nach: [['病', '丙', 'bệnh', 'bìng', 'bệnh', 'bao'], ['痛', '甬', 'thống', 'tòng', 'đau', 'bao'], ['疲', '皮', 'bì', 'pí', 'mệt', 'bao']],
  'hoa-lua': [['秋', '火', 'thu', 'qiū', 'mùa thu'], ['種', '重', 'chủng', 'zhǒng', 'giống, trồng'], ['香', '日', 'hương', 'xiāng', 'thơm', 'td']],
  me: [['粉', '分', 'phấn', 'fěn', 'bột'], ['粒', '立', 'lạp', 'lì', 'hạt'], ['糖', '唐', 'đường', 'táng', 'đường ngọt']],
  hiet: [['順', '川', 'thuận', 'shùn', 'thuận', 'pc'], ['頭', '豆', 'đầu', 'tóu', 'cái đầu', 'pc'], ['題', '是', 'đề', 'tí', 'đề, đầu bài', 'pc']],
  bach: [['的', '勺', 'đích', 'dì', 'đích, đúng'], ['泉', '水', 'tuyền', 'quán', 'suối', 'td'], ['皆', '比', 'giai', 'jiē', 'đều', 'tdc']],
};

function toChar(radical: string, [han, rest, hv, pinyin, meaning, kind]: Row): GhepChar {
  const layout: GhepLayout = kind === 'bao' ? 'bao' : kind === 'td' || kind === 'tdc' ? 'tren-duoi' : 'trai-phai';
  const at = kind === 'pc' || kind === 'tdc' ? 'cuoi' : 'dau';
  return { han, radical, rest, layout, at, hv, pinyin, meaning };
}

/** Mọi chữ ghép, theo thứ tự bộ thủ của dữ liệu. */
export const GHEP_CHU: readonly GhepChar[] = Object.entries(DATA).flatMap(([r, rows]) => rows.map((row) => toChar(r, row)));

/** Các chữ ghép của bộ [radicalId]. */
export const ghepOf = (radicalId: string): GhepChar[] => GHEP_CHU.filter((c) => c.radical === radicalId);

/** Bộ [radicalId] ghép với phần còn lại [rest] có thành chữ nào trong dữ liệu không (để loại ô nhiễu cũng đúng). */
export const formsChar = (radicalId: string, rest: string): boolean => GHEP_CHU.some((c) => c.radical === radicalId && c.rest === rest);

/** Dòng sau khi chấm (R-LUU-3): "hà · hé — sông". */
export const ghepDetail = (c: GhepChar): string => `${c.hv} · ${c.pinyin} — ${c.meaning}`;
