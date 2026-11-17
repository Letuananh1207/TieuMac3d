/**
 * Giáo trình từ vựng (R-TU-1): 50 bài × 6–7 từ cùng chủ đề — 25 bài HSK 1 rồi 25 bài HSK 2. Tên bài chỉ tiếng Việt
 * (hiện trên lựa chọn của thầy — R-HUD-4). Mỗi từ của sổ HSK (`zones/sach/hsk{1,2}.ts`) thuộc đúng 1 bài — test
 * `bai.test.ts` + `npm run tu:check`. Thứ tự bài = thứ tự học; trong bài = thứ tự trang của màn bài từ.
 * Về sau (thế giới mới) mỗi bài gắn chủ đề vùng (`lessons.topics` trong đặc tả cảnh) — chờ concept.
 */

export interface BaiHoc {
  /** mã bài, `bai-01` … `bai-50` */
  id: string;
  /** chủ đề tiếng Việt */
  ten: string;
  cap: 1 | 2;
  /** mã từ (= chữ giản thể) theo thứ tự trang */
  tu: readonly string[];
}

const B = (cap: 1 | 2, ten: string, tu: string): Omit<BaiHoc, 'id'> => ({ cap, ten, tu: tu.split(' ') });

const RAW: Omit<BaiHoc, 'id'>[] = [
  B(1, 'Chào hỏi', '你 我 好 谢谢 再见 不客气'),
  B(1, 'Lễ phép', '对不起 没关系 请 喂 叫 名字'),
  B(1, 'Số đếm 1–6', '一 二 三 四 五 六'),
  B(1, 'Số đếm 7–10', '七 八 九 十 几 多少'),
  B(1, 'Người quanh ta', '他 她 我们 人 朋友 谁'),
  B(1, 'Gia đình', '爸爸 妈妈 儿子 女儿 家 先生 小姐'),
  B(1, 'Trường lớp', '老师 学生 同学 学校 学习 汉语'),
  B(1, 'Đọc, viết, nghe, nói', '字 书 写 读 说 听'),
  B(1, 'Ngày tháng', '今天 明天 昨天 年 月 号'),
  B(1, 'Giờ giấc', '星期 点 分钟 现在 时候 岁'),
  B(1, 'Một ngày', '上午 中午 下午 睡觉 工作 回'),
  B(1, 'Ăn uống', '吃 喝 米饭 菜 茶 水'),
  B(1, 'Mua bán', '买 钱 块 商店 东西 本'),
  B(1, 'Hoa quả, nhà hàng', '水果 苹果 杯子 饭店 个 些'),
  B(1, 'Nơi chốn', '北京 中国 哪儿 这儿 那儿 住'),
  B(1, 'Phương hướng', '上 下 里 前面 后面 在'),
  B(1, 'Đi lại', '去 来 坐 出租车 飞机 开'),
  B(1, 'Đồ trong nhà', '桌子 椅子 电脑 电视 衣服 电影'),
  B(1, 'Thời tiết', '天气 冷 热 下雨 太 很'),
  B(1, 'Lớn nhỏ, nhiều ít', '大 小 多 少 漂亮 高兴'),
  B(1, 'Việc hằng ngày', '看 看见 做 打电话 认识 喜欢'),
  B(1, 'Muốn và có thể', '想 会 能 爱 有 没有'),
  B(1, 'Câu hỏi', '什么 哪 怎么 怎么样 吗 呢'),
  B(1, 'Từ nối, trợ từ', '的 了 和 都 是 不'),
  B(1, 'Con vật, bệnh viện', '狗 猫 医生 医院 这 那 一点儿'),
  B(2, 'Gia đình (2)', '哥哥 姐姐 弟弟 妹妹 丈夫 妻子'),
  B(2, 'Xưng hô', '您 大家 孩子 男 女 它'),
  B(2, 'Làm quen, sinh nhật', '姓 介绍 欢迎 生日 快乐 送'),
  B(2, 'Số lớn, thứ tự', '零 两 百 千 第一 次'),
  B(2, 'Đơn vị, lượng từ', '件 公斤 小时 每 一下 再'),
  B(2, 'Thời gian (2)', '早上 晚上 去年 日 时间 已经'),
  B(2, 'Nhịp sống', '起床 上班 休息 忙 累 等'),
  B(2, 'Món ăn (2)', '鸡蛋 面条 羊肉 鱼 牛奶 咖啡'),
  B(2, 'Nhà hàng, khách sạn', '服务员 宾馆 房间 门 西瓜 好吃'),
  B(2, 'Mua sắm (2)', '卖 贵 便宜 手表 手机 给'),
  B(2, 'Màu sắc, áo quần', '颜色 白 黑 红 新 长 穿'),
  B(2, 'Trời đất', '晴 阴 雪 非常 最 真'),
  B(2, 'Đi xa', '公共汽车 船 机场 票 旅游 路'),
  B(2, 'Trái phải', '左边 右边 旁边 外 往 离'),
  B(2, 'Xa gần, ra vào', '远 近 从 到 进 出'),
  B(2, 'Thể thao', '运动 跑步 游泳 打篮球 踢足球 身体'),
  B(2, 'Vui chơi', '唱歌 跳舞 玩 笑 一起 走'),
  B(2, 'Sức khoẻ', '生病 药 眼睛 高 快 慢'),
  B(2, 'Lớp học (2)', '教室 课 考试 题 铅笔 开始'),
  B(2, 'Hỏi và đáp', '问 回答 问题 告诉 懂 知道'),
  B(2, 'Đúng sai, suy nghĩ', '对 错 意思 觉得 希望 可能'),
  B(2, 'Công việc', '公司 事情 报纸 帮助 找 洗 准备'),
  B(2, 'Khuyên bảo', '别 让 要 可以 吧 完'),
  B(2, 'Vì sao, tuy vậy', '因为…所以 虽然…但是 为什么 比 还 也'),
  B(2, 'Trợ từ (2)', '得 着 过 正在 就 说话'),
];

export const BAI_HOC: readonly BaiHoc[] = RAW.map((b, i) => ({ ...b, id: `bai-${String(i + 1).padStart(2, '0')}` }));
