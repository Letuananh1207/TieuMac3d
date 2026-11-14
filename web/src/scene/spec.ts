/**
 * Đặc tả cảnh: mọi thứ phiên thiết kế quyết (vị trí, kích thước, màu, đèn, camera).
 * Nguồn: `design/scene/scene.json` (đọc ở `loadSpec.ts`, kiểm ở `specCheck.ts`); thiếu file / thiếu trường →
 * `DEFAULT_SCENE` = cảnh gốc. File này thuần dữ liệu (không three, không DOM) để `vite.config.ts` import được.
 * Màu "#rrggbb"; góc `rotY` tính bằng độ (vật có va chạm: bội 90); `pitch` camera radian; toạ độ [x, z] mét.
 */

export type XZ = [number, number];

export const BUILDING_KINDS = ['giang-duong', 'dien', 'thap', 'nha-nho', 'dinh', 'hi-dai', 'tra-lau', 'lau-sach', 'cua-hang'] as const;
/** Hàng bày trong cửa hàng (`cua-hang`): bút mực · vải · bùa giấy · thuốc · thùng gỗ. */
export const GOODS_KINDS = ['but', 'vai', 'bua', 'thuoc', 'thung'] as const;
export const ROOF_KINDS = ['chop', 'cong'] as const;
export const SIDES = ['bac', 'nam', 'dong', 'tay'] as const;
/** NPC có model: `design/models/<mã>.glb` (tạo bằng /tai-nguyen). Thêm NPC mới = thêm mã ở đây + đặt file model. */
export const NPC_IDS = ['tieu-mac', 'su-phu', 'thu-thu'] as const;
/** Bàn chơi ở khu giao lưu (R-GIAO-1): `co` = Ngũ Tử Kỳ (R-CO-1), `dau-chu` = Đấu chữ (R-DAU-1). */
export const GAME_KINDS = ['co', 'dau-chu'] as const;
export const PROP_KINDS = [
  'luong-thuoc',
  'lo-dan',
  'da-thai-ho',
  'den-da',
  'dinh-dong',
  /** nhật quỹ 日晷: bệ đá tu-di 1,4 × 1,4 m, mặt quỹ nghiêng ngửa về bắc (−z) khắc 12 giờ, kim đồng */
  'nhat-quy',
  /** bồn hoa đá lục giác; `text` chọn cây tứ quân tử: 梅 mai · 蘭 lan · 竹 trúc · 菊 cúc */
  'bon-hoa',
  'sap-o',
  'ban-tra',
  'co',
  'bang',
  /** hạc đồng đứng trên bệ đá (cung điện) */
  'hac-dong',
  /** rùa đồng trên bệ đá */
  'rua-dong',
  /** lạc đà hai bướu đứng nghỉ, cúi đầu chậm */
  'lac-da',
  /** cửa hang trong vách đá + tấm bích hoạ (hoa văn tự vẽ) — không vào được; mặt nhìn +z */
  'hang',
  /** Rừng trúc (2026-11-14): cổng trúc mái tranh (lòng 3,5 m, mặt +z) */
  'cong-truc',
  /** giá phơi thẻ trúc 2,4 × 1,8 m, 4 hàng thẻ treo */
  'gia-the',
  /** bó trúc chẻ dựng nghiêng */
  'bo-truc',
  /** đèn trúc: khung trúc + giấy tự sáng, cao 1,4 m */
  'den-truc',
  /** đá khắc ngang 2,6 × 1,2 m, `text` chữ khắc (mặt +z) */
  'da-khac',
  /** ngỗng trắng bơi vòng quanh (x, z), bán kính 1,5 × scale; không va chạm */
  'ngong',
  /** chỗ ngồi văn nhân: đá phẳng + bồ đoàn rơm + án nhỏ (mặt nhìn +z) */
  'bo-doan',
  /** Giang Nam: bậc xuống nước 河埠頭 (đặt ở mép kè, mặt +z nhìn ra nước, bậc đi xuống phía +z) — chỉ để nhìn */
  'ben-nuoc',
  /** giàn đèn đố 燈棚: khung gỗ 3 m + 2 hàng đèn giấy trắng */
  'gian-den',
  /** chồng vò rượu */
  'vo-ruou',
  /** chậu sen 荷花缸 */
  'chau-sen',
  /** sào tre phơi áo (dài 3 m dọc x cục bộ) */
  'sao-ao',
  /** mèo nằm */
  'meo',
  /** chó ngồi */
  'cho',
  /** Bồng Lai: pháp bảo Bát Tiên trên bệ, `text` một trong `PHAP_BAO` */
  'phap-bao',
  /** lâu thuyền Từ Phúc dài 12 m (dọc z) — thường đặt ngoài mép đảo với `y` */
  'lau-thuyen',
  /** đầu cự ngao đá nhô dưới mép đảo (dùng `y`); không va chạm */
  'cu-ngao',
  /** hạc trắng đứng */
  'hac',
  /** hươu trắng cúi gặm */
  'huou',
  /** Trường Thành: địch lâu vuông 9 × 9, cao 13 m */
  'dich-lau',
  /** cổng quan thành: đài gạch 14 × 10 cao 8 m, cửa vòm xuyên dọc z, lầu cổng; `text` biển */
  'quan-thanh',
  /** phong hoả đài: tháp gạch cao 8 m có khói */
  'phong-hoa',
  /** lều lính 4 × 4 */
  'leu',
  /** soái trướng 8 × 6 mở mặt trước + bàn sa bàn */
  'soai-truong',
  /** lửa trại + 6 đôn */
  'lua-trai',
  /** ngựa đứng cúi gặm */
  'ngua',
  /** tường đề thơ 7 × 3 m, `text` câu thơ */
  'tho-bich',
  /** Tử Cấm Thành: tấm đá ngự lộ chạm rồng (dốc 11 m, đầu −z cao 2,7 — khớp Tam Đài); không đi được */
  'ngu-lo',
  /** Ngọ Môn chữ 凹: hai cánh tường son nhô về +z 16 m ở x ±15 + lầu mái vàng — đặt giữa mép tường nam */
  'ngo-mon',
  /** sư tử đồng trên bệ */
  'su-tu-dong',
  /** khảo án thi Đình */
  'khao-an',
  /** giá sách Tứ Khố bìa bốn màu */
  'gia-sach',
  /** Con đường tơ lụa: đoạn vách Mạc Cao 20 × 16 m, 3 tầng cửa hang + sạn đạo (mặt +z) */
  'vach-hang',
  /** Cửu Tầng Lâu áp vách: rộng 11, sâu 3, cao 21 m */
  'lau-vach',
  /** nhà đất nện mái bằng 8 × 6 */
  'nha-dat',
  /** lều vải chợ 3 × 3 + hàng */
  'leu-vai',
  /** cụm lau sậy */
  'lau-say',
  /** cổng quan đất nện (Dương Quan), như `quan-thanh` — `text` biển */
  'cong-quan',
  /** phong hoả đài đất nện */
  'phong-hoa-dat',
] as const;
/** tám pháp bảo Bát Tiên (ám Bát Tiên): hồ lô · quạt · ngọc bản · sáo · sen · giỏ hoa · kiếm · ống phách */
export const PHAP_BAO: readonly string[] = ['葫', '扇', '板', '笛', '荷', '籃', '劍', '鼓'];
/** kiểu cầu: `vom` cầu vòm đá lưng gù · `da` cầu đá phẳng lan can cẩm thạch · `treo` cầu treo ván gỗ dây võng */
/** `tau` = cầu tàu ra mây: đầu −z (cục bộ) trên đất, đầu kia hẫng trên trụ — chỉ đầu −z cần đất phẳng */
export const BRIDGE_KINDS = ['vom', 'da', 'treo', 'tau'] as const;
/** cây trong bồn hoa (`bon-hoa`, prop `text`): tứ quân tử — mai (đông) · lan (xuân) · trúc (hạ) · cúc (thu) */
export const FLOWER_POTS: readonly string[] = ['梅', '蘭', '竹', '菊'];
export const TREE_KINDS = ['tan', 'truc', 'tung', 'lieu', 'mai', 'truc-mao', 'dao', 'bui'] as const;
export const WALL_STYLES = ['gach', 'voi', 'dat'] as const;
/** Kiểu cổng trên tường vôi: `trang` = cổng trăng (月洞門, mặc định) · `lau` = cổng mái ngói (門樓): cửa chữ nhật,
 *  khung gỗ, mái ngói nhỏ nhô ra hai mặt tường, biển gỗ dưới mái. */
export const GATE_KINDS = ['trang', 'lau', 'thanh'] as const;
/** Kiểu gạch lát sân: `gach` = gạch chữ nhật nâu như cũ, `vuong` = gạch vuông xanh xám 0,6 m (方磚, 2026-11-13). */
export const PAVE_PATTERNS = ['gach', 'vuong'] as const;

export interface BuildingSpec {
  /** mã nhà, duy nhất */
  id: string;
  x: number;
  z: number;
  /** rộng (trục x trước khi xoay) */
  w: number;
  /** sâu (trục z trước khi xoay); mặt trước (cửa, biển) nhìn về +z */
  d: number;
  /** 0 · 90 · 180 · 270 độ — va chạm là hộp thẳng trục nên chỉ quay được bội 90 */
  rotY?: number;
  title: string;
  /** bảng giấy nhỏ cạnh cửa: [dòng 1, dòng 2] */
  notice?: [string, string];
  roofColor: string;
  /** vùng sự kiện trước cửa: tâm cách tâm nhà `front` đơn vị theo hướng mặt trước, bán kính `r` */
  zone?: { id: string; front: number; r: number };
  /** kiểu nhà: giảng đường (mặc định) · điện lớn mái hai tầng · tháp nhiều tầng · nhà nhỏ đệ tử */
  kind?: (typeof BUILDING_KINDS)[number];
  /** mái chóp (mặc định) · mái cong đầu đao */
  roof?: (typeof ROOF_KINDS)[number];
  /** số tầng của tháp (2–9, mặc định 5) */
  floors?: number;
  /** đình: số cột / cạnh mái chóp (4 hoặc 6, mặc định 4) */
  sides?: number;
  /** màu bờ nóc + viền mép mái (thiếu = `buildingStyle.ridge`); Tàng Thư Các: lục */
  trim?: string;
  /** màu cột (thiếu = `buildingStyle.pillar` son); Tàng Thư Các: lục */
  pillarColor?: string;
  /** cửa hàng: một chữ Hán trên cờ dọc treo cần (vd. "筆") */
  sign?: string;
  /** cửa hàng: hàng bày trên quầy, kệ */
  goods?: (typeof GOODS_KINDS)[number];
}

export interface CameraView {
  dist: number;
  /** góc ngẩng, radian */
  pitch: number;
}

/**
 * Chữ biển trên cổng, theo hướng **mặt cổng nhìn ra** (vd. cổng nam: `nam` = mặt nhìn về phía Sơn Môn). Thường ghi tên
 * khu người đi qua sẽ bước vào. Thiếu / rỗng = mặt đó không có biển.
 */
export type GateSigns = Partial<Record<(typeof SIDES)[number], string>>;

/** Kiểu + biển của một cổng tường (tường vôi `voi`; tường gạch `gach` chỉ chừa khe trơn). */
export interface WallGateLook {
  /** mặc định `trang` */
  kind?: (typeof GATE_KINDS)[number];
  signs?: GateSigns;
}

/** Khe cổng trên vòng tường: cạnh, tâm khe dọc theo cạnh (x với bắc/nam, z với đông/tây), rộng. */
export interface WallGate extends WallGateLook {
  side: (typeof SIDES)[number];
  at: number;
  width: number;
}

/** Cổng trên một đoạn tường thêm: tâm khe theo trục của đoạn (x nếu đoạn chạy theo x, z nếu theo z), rộng. */
export interface SegmentGate extends WallGateLook {
  at: number;
  width: number;
}

/** Dây đèn lồng đỏ giăng giữa hai cột gỗ ở `from` / `to` (góc tự do), võng xuống ở giữa — kiểu dáng chung ở `lanternStyle`. */
export interface LanternString {
  from: XZ;
  to: XZ;
}

/** Vật treo dọc dây đèn: đèn lồng · dải tua rua. */
export const HANG_KINDS = ['den', 'tua'] as const;

/** Đoạn lan can gỗ thấp, thẳng trục (from / to cùng x hoặc cùng z). */
export interface FenceSpec {
  from: XZ;
  to: XZ;
}

/** Đoạn tường thêm, thẳng trục (from / to cùng x hoặc cùng z), màu như tường bao; dày / cao mặc định như tường bao. */
export interface WallSegment {
  from: XZ;
  to: XZ;
  height?: number;
  thickness?: number;
  /** tường gạch bám địa hình (Trường Thành): chia khúc ~2 m, mỗi khúc đặt theo mặt đất, đỉnh răng cưa. Cần `terrain`. */
  follow?: boolean;
  /** một cổng trên đoạn (cần nhiều cổng → chia thành nhiều đoạn) */
  gate?: SegmentGate;
}

/** Lối lát đá: dải nền từ `from` tới `to`, góc tự do, không va chạm. */
export interface PathSpec {
  from: XZ;
  to: XZ;
  width: number;
  color?: string;
}

/** Cổng sơn môn: mái, hai cột, bảng hiệu; mặt trước nhìn +z trước khi quay. Va chạm chỉ ở hai cột. */
export interface GateSpec {
  id: string;
  x: number;
  z: number;
  rotY?: number;
  /** khoảng trống giữa hai cột */
  width: number;
  title: string;
  /** biển chữ Hán giữa cổng (vd. "起源鎮"); thiếu thì biển ghi `title` */
  hanTitle?: string;
  /** màu ba mái nhỏ (ngói lưu ly lục); thiếu thì `buildingStyle.eave` */
  roofColor?: string;
  /**
   * model AI `design/models/<model>.glb` (vd. "cong-son-mon", `/tai-nguyen`) thay cổng khối: co cho bề ngang bằng cổng
   * khối cùng `width`, biển chữ dán lên biển trống của model. Thiếu trường / thiếu file / nạp lỗi → cổng khối như cũ.
   */
  model?: string;
  /** hệ số cỡ model so với bề ngang cổng khối (mặc định 1) — L-5: 0,75 */
  modelScale?: number;
}

/** Một khu có tên (hình chữ nhật từ góc `from` tới góc `to`) (dữ liệu; thẻ tên khu khi bước vào đã bỏ — R-HUD-3). */
export interface AreaSpec {
  name: string;
  /** chữ Hán của khu, vd. "外門" (dữ liệu — thẻ tên khu đã bỏ, R-HUD-3) */
  han?: string;
  from: XZ;
  to: XZ;
}

/** Ao / hồ: tròn (`r`) hoặc chữ nhật (`w` × `d`); không đi xuống được. */
export interface WaterSpec {
  x: number;
  z: number;
  r?: number;
  w?: number;
  d?: number;
  rotY?: number;
  /** mặt nước thấp hơn mặt đất bao nhiêu m (kênh có kè đá — Giang Nam); 0 = sát mặt sân như cũ */
  sunk?: number;
  /** `trang` = hồ lưỡi liềm (Nguyệt Nha Tuyền) bán kính ngoài `r`, bụng phình về +z (cục bộ), hai mũi nhọn; quay `rotY` */
  shape?: 'trang';
  /** ao chữ nhật: cạnh không xây bờ (nối liền ao khác — ngã ba kênh): bac (−z) · nam (+z) · dong (+x) · tay (−x) */
  open?: (typeof SIDES)[number][];
}

/**
 * Cầu (R-VA-1): mặt cầu thẳng trục dọc z cục bộ, dài `length`, rộng `width`, tâm (x, z); `rotY` 0 · 90 · 180 · 270.
 * Đi được trên mặt cầu (vòm: lên dốc tới giữa cầu cao `rise` rồi xuống); lan can hai bên chặn. Nước dưới cầu: đặt
 * hai ao hai bên chừa khe đúng chỗ cầu — cầu tự vẽ mặt nước trong khe (`water: true`).
 */
export interface BridgeSpec {
  kind: (typeof BRIDGE_KINDS)[number];
  x: number;
  z: number;
  rotY?: number;
  length: number;
  width: number;
  /** vòm: độ cao giữa cầu so với hai đầu (mặc định 18 % dài) · đá: 0,3 · treo: 0 */
  rise?: number;
  /** vẽ mặt nước dưới cầu (khe giữa hai ao) */
  water?: boolean;
  /** mặt nước thấp hơn hai đầu cầu bao nhiêu m (khớp `water[].sunk`) */
  sunk?: number;
  /** cầu đá phẳng (`da`): `vuong` = lòng cầu rỗng lỗ vuông (cầu Vĩnh An), không thì thân đặc */
  arch?: 'vuong';
}

/** Hiên lang bồng 廊棚: mái một dốc trên cột gỗ dọc mép nước, ghế tựa 美人靠 phía nước, đèn lồng. Thẳng trục. */
export interface GallerySpec {
  from: XZ;
  to: XZ;
  /** bề rộng (m), mặc định 3 */
  width?: number;
  /** phía nước so với đường from→to: +1 = phía + trục còn lại (vd. +z khi chạy theo x), −1 = phía − */
  waterSide: number;
}

/** Đàn hạc bay vòng quanh (x, z) ở độ cao `y`, bán kính `radius`; không va chạm. */
export interface FlockSpec {
  x: number;
  z: number;
  y: number;
  radius: number;
  count: number;
  /** m/s dọc vòng bay */
  speed?: number;
}

/** Độ cao giữa cầu so với hai đầu khi không ghi `rise`. */
export function bridgeRise(kind: BridgeSpec['kind'], length: number): number {
  return kind === 'vom' ? 0.18 * length : kind === 'da' ? 0.3 : 0;
}

/** Mương khúc thuỷ (曲水): đường cong mềm qua các điểm, thành đá hai bên, nước chảy; `cups` chén sơn trôi dọc mương. */
export interface ChannelSpec {
  points: XZ[];
  /** lòng mương (m), mặc định 0,6 */
  width?: number;
  /** số chén trôi (0 = không) */
  cups?: number;
  /** m/s */
  speed?: number;
}

/**
 * Đoạn tường đi được (Trường Thành, R-VA-1): thẳng trục, cao `height`, mặt rộng `width` (mặc định 5); đoạ khẩu phía
 * `outSide` (+1 = phía + trục còn lại), vũ tường phía kia. `ramps`: mã đạo men mặt trong — đầu trên chạm mặt tường tại
 * toạ độ dọc `at`, đi xuống theo `dir` (+1 / −1 dọc trục) dài `length` (mặc định 12), rộng `width` (mặc định 3).
 */
export interface RampartSpec {
  from: XZ;
  to: XZ;
  height: number;
  width?: number;
  outSide: number;
  ramps?: { at: number; dir: number; length?: number; width?: number }[];
}

/** Đoàn lạc đà đi qua lại dọc `path` (ping-pong): `count` con nối nhau cách `spacing` m; không va chạm. */
export interface CaravanSpec {
  path: XZ[];
  count?: number;
  spacing?: number;
  speed?: number;
}

/** Thành ảo 海市蜃樓: cụm lầu thành nhạt màu nổi trên mây, mờ hiện rồi tan theo chu kỳ (giây). */
export interface MirageSpec {
  x: number;
  y: number;
  z: number;
  width: number;
  rotY?: number;
  period?: number;
}

/** Thuyền ô bồng trôi qua lại dọc `path` (các điểm trên mặt nước); không va chạm. */
export interface BoatSpec {
  path: XZ[];
  /** m/s */
  speed?: number;
  /** màu mui (mui đen tre đan) */
  canopy?: string;
  /** mặt nước thấp hơn mặt đất (khớp `water[].sunk`) */
  sunk?: number;
  /** neo yên ở điểm đầu, mũi nhìn về điểm thứ hai (chỉ dập dềnh) */
  moored?: boolean;
  /** thuyền hàng: chở rổ rau quả, vò, bao trà */
  cargo?: boolean;
}

export interface PropSpec {
  kind: (typeof PROP_KINDS)[number];
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  /** cờ dọc (`co`): một chữ Hán; bảng vinh danh (`bang`): dòng tiêu đề; bồn hoa (`bon-hoa`): 梅 · 蘭 · 竹 · 菊 */
  text?: string;
  /** độ cao gốc tuyệt đối (m) — vật ngoài mép đảo / trên mây; thiếu = mặt đất tại (x, z) */
  y?: number;
}

/** NPC đứng tại chỗ (R-NPC-1): mặt trước nhìn về +z khi `rotY` = 0; `rotY` độ, tuỳ ý (không cần bội 90 — không có
 *  hộp va chạm vuông, chỉ vòng tròn). */
export interface NpcSpec {
  id: (typeof NPC_IDS)[number];
  x: number;
  z: number;
  rotY?: number;
}

/**
 * Bàn chơi (R-GIAO-1): bàn đá thấp tâm (x, z); ghế người chơi phía +z (ngồi nhìn về −z khi `rotY` = 0), NPC `npc` đứng
 * phía −z nhìn về người chơi. NPC bàn là bản riêng (không nói chuyện — R-NPC-2 chỉ cho `npcs`). `rotY` độ, bội 90.
 */
export interface GameTableSpec {
  id: string;
  kind: (typeof GAME_KINDS)[number];
  x: number;
  z: number;
  rotY?: number;
  npc: (typeof NPC_IDS)[number];
  /** bàn dài: số chỗ chơi dọc trục x cục bộ (1–4, mặc định 1 = bàn vuông như cũ), mỗi chỗ cách nhau `GAME_SLOT` m;
   *  bàn dài có hai ghế đối diện mỗi chỗ */
  boards?: number;
  /** NPC đứng sau bàn (mặc định `true`); `false` = NPC chỉ nói qua khung thoại (R-GIAO-1) */
  npcStand?: boolean;
  /** biển gỗ đứng ghi tên trò (R-GIAO-2); không có → không biển */
  sign?: GameSignSpec;
}

/** Biển tên trò chơi (R-GIAO-2): toạ độ cảnh, mặt chữ nhìn về +z khi `rotY` = 0 (độ, bội 90). */
export interface GameSignSpec {
  x: number;
  z: number;
  rotY?: number;
  /** tên chữ Hán (dòng trên biển, vd. "五子棋"); rỗng = biển chỉ ghi `name` (tông môn 2026-11-13: biển chữ Việt) */
  han: string;
  /** tên tiếng Việt, vd. "Cờ caro" — cũng là nhãn nút "Cách chơi" */
  name: string;
}

/** Khoảng cách tâm hai chỗ chơi liền nhau trên bàn dài (m). L-8: 2,2 → 2,5 — bàn ghế ×1,3 nhưng dọc bàn chỉ ×1,14
 *  vì biển tên ở x −29,5 (scene.json) sẽ chạm đầu bàn. */
export const GAME_SLOT = 2.5;

/** Cụm cây rải ngẫu nhiên (theo `trees.seed`) trong hình chữ nhật tâm (x, z). */
export interface GroveSpec {
  kind: (typeof TREE_KINDS)[number];
  x: number;
  z: number;
  w: number;
  d: number;
  count: number;
  /** có va chạm không (mặc định có) */
  collide?: boolean;
}

export interface TreePlace {
  x: number;
  z: number;
  scale: number;
  kind?: (typeof TREE_KINDS)[number];
}

/** Bục phẳng (khu): đất trong hình chữ nhật `from`–`to` ép phẳng ở độ cao `y`; `pave` = lát gạch như sân. */
export interface PlateauSpec {
  from: XZ;
  to: XZ;
  y: number;
  pave?: boolean;
  /** khoảng chuyển (m) từ mép bục ra đất tự nhiên; thiếu thì `terrain.blend`. Nhỏ (≤ 1) = kè đá dựng đứng */
  blend?: number;
  /** lan can đá trắng quanh mép bục (Tam Đài), tự chừa chỗ bậc đá */
  rail?: boolean;
}

/** Đỉnh núi / đồi cộng vào địa hình: cao `h` ở tâm, thoải dần tới bán kính `r`. */
/** Cồn cát lưỡi liềm (`terrain.dunes`, Con đường tơ lụa): sống lưng sắc dài `len`, cao `h`, bề ngang `width`. */
export interface DuneSpec {
  x: number;
  z: number;
  len: number;
  h: number;
  rotY?: number;
  width?: number;
}

export interface PeakSpec {
  x: number;
  z: number;
  r: number;
  h: number;
}

/**
 * Bậc đá thẳng từ `from` lên `to`, rộng `width`: đất dọc bậc ép thành dốc đều giữa độ cao tự nhiên hai đầu (bục ở
 * đầu nào thì lấy độ cao bục), mỗi bậc cao ≈ 0,18 m. Dốc trung bình phải ≤ 35° (R-VA-2) — `scene:check` báo nếu quá.
 */
export interface StairSpec {
  from: XZ;
  to: XZ;
  width: number;
}

/** Thác: dải nước dựng đứng rộng `width` tại (x, z), đỉnh ở độ cao `top`, chân ở `bottom`; mặt nước quay `rotY` độ (0 = nhìn +z). */
export interface WaterfallSpec {
  x: number;
  z: number;
  top: number;
  bottom: number;
  width: number;
  rotY?: number;
}

/** Suối: dải nước uốn theo mặt đất qua các điểm `points`, rộng `width`; không va chạm (cạn, lội qua được). */
export interface StreamSpec {
  points: XZ[];
  width: number;
}

/** Một lớp núi xa (chỉ ngắm, không sương): vòng răng cưa bán kính `radius` quanh tâm địa hình. */
export interface MountainLayer {
  radius: number;
  /** đỉnh cao nhất của lớp (so với y = 0) */
  height: number;
  color: string;
  /** số đỉnh nhô quanh vòng */
  peaks: number;
  /** hệ số bề ngang đỉnh (1 = như cũ; 2 = đỉnh rộng chân gấp đôi, sườn thoải hơn) */
  width?: number;
  /** số đỉnh phụ mỗi bên đỉnh chính (thấp hơn, nằm trên sườn); 0 = không */
  spurs?: number;
}

/**
 * Vòng trận truyền tống (R-HANH-2): một vòng bán kính `ringRadius` tâm `center`. Tông môn: nằm giữa sân đá tròn bán
 * kính `radius` (Truyền Tống Đài); cảnh vùng: `radius` 0 = chỉ có vòng (bệ đá nhỏ).
 */
export interface TeleportSpec {
  enabled: boolean;
  center: XZ;
  radius: number;
  ringRadius: number;
  /** sân đá, viền + phù hiệu, vòng khi tắt, vòng sáng (ngọc lục), chấm vàng / hạt sáng */
  colors: { floor: string; rim: string; dim: string; lit: string; spark: string };
  /** đài tròn nhiều tầng dưới vòng (`tiers` 0 = sân / bệ phẳng như cũ) — xem `DaisSpec` */
  dais: DaisSpec;
}

/**
 * Đài tròn kiểu đàn tế: `tiers` tầng trụ tròn, mỗi tầng cao `tierHeight`, rộng ra `tierWidth` so với tầng trên (tầng
 * trên cùng ôm vòng trận: bán kính `ringRadius + 0,9`); lan can đá quanh mép mỗi tầng, chừa 4 lối bậc rộng `stairWidth`
 * theo 4 hướng chính; `pillars` trụ đá khắc phù văn trên tầng dưới cùng, xen giữa các lối bậc, phù văn sáng theo độ nạp.
 */
export interface DaisSpec {
  tiers: number;
  tierHeight: number;
  tierWidth: number;
  stairWidth: number;
  pillars: number;
  /** đá tầng + bậc, lan can (đá trắng), thân trụ */
  colors: { stone: string; rail: string; pillar: string };
}

export interface SceneSpec {
  /** tên nơi + các khu (màn tải; thẻ tên khu đã bỏ — R-HUD-3); khu khai báo trước thắng khi chồng nhau */
  /** `han`: chữ Hán tên nơi trên màn tải (R-MAN-2), rỗng = chỉ tên Việt */
  site: { name: string; han: string; areas: AreaSpec[] };
  /** trời: dải màu từ đỉnh xuống chân trời (điểm giữa ở 55%) */
  sky: { top: string; middle: string; horizon: string };
  fog: { color: string; near: number; far: number };
  light: {
    skyColor: string;
    groundColor: string;
    hemiIntensity: number;
    sunColor: string;
    sunIntensity: number;
    sunPosition: [number, number, number];
  };
  /** `pattern`: kiểu gạch lát (`PAVE_PATTERNS`); `vuong` lấy `color` làm màu viên gạch, bỏ qua `brickHue`. */
  ground: { size: number; color: string; brickHue: number; pattern: (typeof PAVE_PATTERNS)[number] };
  /**
   * Địa hình cao thấp (`enabled: false` = mặt sân phẳng `ground` như cũ). Đất tự nhiên = nhiễu nhẹ + các đỉnh;
   * bục khu và lối lát đá được ép phẳng; ngoài bán kính `edge.radius` (tính từ `center`) đất đổ xuống vực.
   * Màu theo độ dốc từng tam giác: < `slopeDirt`° cỏ · < `slopeRock`° đất · còn lại đá (đá sáng khi cao hơn `highFrom`).
   */
  terrain: {
    enabled: boolean;
    center: XZ;
    /** cạnh vùng lưới (m) và cạnh một ô (m) */
    size: number;
    cell: number;
    plateaus: PlateauSpec[];
    peaks: PeakSpec[];
    /** cồn cát sống lưng sắc (không có = như cũ) */
    dunes: DuneSpec[];
    noise: { seed: number; amp: number; scale: number };
    /** mép cao nguyên: `wobble` = độ lượn của mép (m) cho đỡ tròn đều */
    edge: { radius: number; width: number; y: number; wobble: number };
    /** khoảng chuyển mặc định từ mép bục / lối lát ra đất tự nhiên (m) */
    blend: number;
    colors: { grass: [string, string, string]; dirt: string; rock: string; highRock: string; highFrom: number };
    slopeDirt: number;
    slopeRock: number;
    /** bậc đá lên núi (Thiên Bậc…) */
    stairs: StairSpec[];
    /** cỏ búi trên đất cỏ (dốc < 25°, ngoài bục lát / lối / bậc): `density` búi trên 100 m², 0 = tắt; 2 màu xen kẽ */
    grass: { density: number; colors: [string, string] };
    /** đá rải: `density` tảng trên 1000 m², 0 = tắt; nhiều hơn trên sườn dốc */
    rocks: { density: number; color: string };
    /** thác nước (Hậu Sơn…) */
    waterfalls: WaterfallSpec[];
    /** suối chảy theo mặt đất */
    streams: StreamSpec[];
  };
  /** núi xa nhiều lớp quanh tâm địa hình, chân ở `base`; rỗng = không có */
  farMountains: { layers: MountainLayer[]; base: number };
  /** biển mây phẳng dưới mép cao nguyên; `radius` 0 = tắt */
  cloudSea: { radius: number; y: number; color: string };
  /** tường bao: nằm ở ±half; `gates` = khe chừa lối đi; `enabled: false` = không có tường bao (cảnh vùng) */
  walls: {
    enabled: boolean;
    half: number;
    height: number;
    /** dày (m) — tường bao và mặc định cho đoạn tường thêm */
    thickness: number;
    color: string;
    brickHue: number;
    capColor: string;
    gates: WallGate[];
    /** `gach` = vân gạch (cũ) · `voi` = tường vôi trơn, chân đá, mái ngói, khe cổng thành cổng trăng */
    style: (typeof WALL_STYLES)[number];
    /** tường vôi: cửa sổ hoa cách nhau bao nhiêu mét (0 = không có) */
    windows: number;
    /** tường gạch: độ bão hoà màu gạch (%) — 40 như cũ; thấp = gạch xám (Trường Thành) */
    brickSat: number;
  };
  wallSegments: WallSegment[];
  paths: PathSpec[];
  /** màu chung (từng nhà chỉ đổi màu mái); `water` mặt ao, `stone` bờ đá / chân cổng / đài, `path` lối lát,
   *  `bronze` lò đan / chóp tháp, `herb` cây thuốc, `smoke` khói lò */
  buildingStyle: {
    base: string;
    floor: string;
    wall: string;
    pillar: string;
    ridge: string;
    eave: string;
    lantern: string;
    stone: string;
    water: string;
    path: string;
    /** mặt lối lát: `phien` phiến đá màu `path` (cảnh gốc) · `san` cùng gạch với sân lát (`ground`), mạch gạch liền */
    pathLook: 'phien' | 'san';
    bronze: string;
    herb: string;
    smoke: string;
    /** xà lam, vàng kim (biển, chấm xà), gỗ sẫm (khung, chân cửa) */
    beamBlue: string;
    gold: string;
    timber: string;
    /** vải / giấy dầu: ô sạp chợ (2026-11-13.13) */
    cloth: string;
    /** hệ số chiều cao kiến trúc (nền, cột, tường thân, cửa, mái, tầng tháp, cổng sơn môn), 0,5–3; 1 = cỡ gốc.
     *  Thứ cỡ người (bậc, lan can, biển, đèn lồng, đồ đạc) giữ nguyên. */
    heightScale: number;
  };
  buildings: BuildingSpec[];
  gates: GateSpec[];
  water: WaterSpec[];
  /** cầu đi qua nước / vực (cảnh vùng) */
  bridges: BridgeSpec[];
  /** đàn hạc bay, thuyền trôi — chỉ để nhìn */
  flocks: FlockSpec[];
  boats: BoatSpec[];
  /** mương khúc thuỷ (Rừng trúc) */
  channels: ChannelSpec[];
  /** hiên lang bồng ven nước (Giang Nam) */
  galleries: GallerySpec[];
  /** thành ảo trên biển mây (Bồng Lai) */
  mirages: MirageSpec[];
  /** đoạn tường đi được (Trường Thành) */
  ramparts: RampartSpec[];
  /** đoàn lạc đà (Con đường tơ lụa) */
  caravans: CaravanSpec[];
  props: PropSpec[];
  trees: {
    trunk: string;
    leaves: [string, string, string];
    /** thân và lá trúc */
    bamboo: [string, string];
    /** trúc mao (Rừng trúc): thân xanh, thân già vàng, lá */
    mao: [string, string, string];
    /** liễu: tán, dải rủ */
    willow: [string, string];
    /** mai: cành, hoa đậm, hoa nhạt */
    plum: [string, string, string];
    /** đào tiên (Bồng Lai, `dao`): thân, hoa, quả */
    peach: [string, string, string];
    /** bụi lá thu (`bui`, Trường Thành): hai màu lá xen */
    autumn: [string, string];
    /** lan (bồn hoa 蘭): lá, hoa */
    orchid: [string, string];
    /** cúc (bồn hoa 菊): lá, hoa */
    mum: [string, string];
    /** cây lẻ, có va chạm */
    yard: TreePlace[];
    groves: GroveSpec[];
    /** vòng cây ngoài tường, chỉ trang trí */
    ring: { count: number; radius: number; spread: number; scaleMin: number; scaleMax: number };
    /** hạt giống ngẫu nhiên: cùng số → cây giống hệt nhau trên Canvas 3D và trong app */
    seed: number;
  };
  /** `enabled: false` = không có giếng (cảnh vùng) */
  well: { enabled: boolean; x: number; z: number; stone: string; water: string };
  /**
   * Bài học của vùng (R-HANH-3): `radicals` = ngồi thiền ở đây là tu luyện bộ thủ (Rừng trúc). Bài học là lớp riêng của
   * người học — cảnh không đặt vật học theo tiến độ (R-VUNG-1). Mặc định tắt (tông môn: ngồi thiền chỉ là ngồi).
   */
  lessons: { radicals: boolean };
  /** vòng trận truyền tống (R-HANH-2): tông môn = Truyền Tống Đài; vùng = vòng về / đi tiếp; `player.start` ngoài vòng */
  teleport: TeleportSpec;
  /** đảo đá lơ lửng (chỉ ngắm) + mây trôi quanh tâm cảnh ở độ cao `height` */
  floating: {
    islands: { x: number; y: number; z: number; scale: number }[];
    clouds: { count: number; height: number; radius: number; speed: number; color: string };
  };
  player: { start: XZ };
  /** nhân vật không điều khiển (R-NPC-1) */
  npcs: NpcSpec[];
  /** bàn chơi khu giao lưu (R-GIAO-1) */
  gameTables: GameTableSpec[];
  /** dây đèn lồng giăng trên sân (vd. khu giao lưu) — chỉ ngắm, cột hai đầu có va chạm */
  lanternStrings: LanternString[];
  /** dây đèn lồng: `height` đỉnh cột / chỗ buộc dây, `sag` độ võng giữa dây, `spacing` khoảng hai đèn (m);
   *  màu dây, thân đèn, chóp + tua (`trim`), cột gỗ */
  lanternStyle: {
    height: number;
    sag: number;
    spacing: number;
    rope: string;
    lantern: string;
    trim: string;
    pole: string;
    /** vật treo dọc dây: `den` = đèn lồng (như cũ) · `tua` = dải tua rua dài `drop` m, cứ `lanternEvery` dải xen 1 đèn (0 = không đèn) */
    hang: (typeof HANG_KINDS)[number];
    drop: number;
    lanternEvery: number;
  };
  /** lan can gỗ thấp quây sân (thẳng trục như `wallSegments`), có va chạm — kiểu dáng ở `fenceStyle` */
  fences: FenceSpec[];
  /** lan can: cao, khoảng hai trụ (m), màu thân (sơn son), màu chóp trụ */
  fenceStyle: { height: number; postEvery: number; color: string; cap: string };
  /** `seated`: khi ngồi vào án thư / bàn trà (R-NGOI-1) — camera lùi ra, chúc xuống thấy cả bàn */
  camera: { fov: number; minDist: number; maxDist: number; near: CameraView; far: CameraView; seated: CameraView };
}

export const DEFAULT_SCENE: SceneSpec = {
  // chưa đặt khu nào
  site: { name: 'Học xá · Sân chính', han: '', areas: [] },
  sky: { top: '#0f1730', middle: '#33476e', horizon: '#8a7a86' },
  fog: { color: '#2c3a58', near: 28, far: 70 },
  light: {
    skyColor: '#bcc8ff',
    groundColor: '#4a3326',
    hemiIntensity: 0.75,
    sunColor: '#ffd8a8',
    sunIntensity: 0.85,
    sunPosition: [-12, 20, 8],
  },
  ground: { size: 90, color: '#5b3f37', brickHue: 10, pattern: 'gach' },
  // tắt: cảnh gốc phẳng. Giá trị dưới là gợi ý cho hướng "cao nguyên giữa biển mây" (docs/tham_khao/dia-hinh-tong-mon.md)
  terrain: {
    enabled: false,
    center: [0, 0],
    size: 300,
    cell: 2.5,
    plateaus: [],
    peaks: [],
    dunes: [],
    noise: { seed: 3, amp: 1.2, scale: 30 },
    edge: { radius: 110, width: 18, y: -30, wobble: 8 },
    blend: 6,
    colors: { grass: ['#7d9a5a', '#8aa864', '#6f8c50'], dirt: '#9c8466', rock: '#8d8a84', highRock: '#b9b6ae', highFrom: 20 },
    slopeDirt: 20,
    slopeRock: 35,
    stairs: [],
    grass: { density: 0, colors: ['#6f8c50', '#93ad66'] },
    rocks: { density: 0, color: '#8d8a84' },
    waterfalls: [],
    streams: [],
  },
  farMountains: { layers: [], base: -40 },
  cloudSea: { radius: 0, y: -10, color: '#f4f1ea' },
  walls: { enabled: true, half: 21, height: 2.6, thickness: 1, color: '#4a2b24', brickHue: 8, capColor: '#6e2f26', gates: [], style: 'gach', windows: 0, brickSat: 40 },
  wallSegments: [],
  paths: [],
  buildingStyle: {
    base: '#77706a',
    floor: '#8a5a3c',
    wall: '#e9dcc0',
    pillar: '#3a2418',
    ridge: '#4a2a20',
    eave: '#3a2418',
    lantern: '#ff6a3d',
    stone: '#8d877f',
    water: '#2b4a6a',
    path: '#7d726a',
    pathLook: 'phien',
    bronze: '#8a6a3a',
    herb: '#5f9a48',
    smoke: '#d8d4cc',
    beamBlue: '#3f5fa0',
    gold: '#d4a64a',
    timber: '#3a2418',
    cloth: '#c9803a',
    heightScale: 1,
  },
  buildings: [
    {
      id: 'giang-duong',
      x: 0,
      z: -11,
      w: 13,
      d: 7,
      title: 'Lớp HSK 3',
      notice: ['Buổi tối', 'chữ 快'],
      roofColor: '#8a3b2c',
      zone: { id: 'lop-hsk3', front: 4.6, r: 2.6 },
    },
    {
      id: 'thu-vien',
      x: -12.5,
      z: 4,
      w: 7,
      d: 6,
      rotY: 90,
      title: 'Thư viện',
      roofColor: '#5f3a2a',
      zone: { id: 'thu-vien', front: 3.9, r: 2.4 },
    },
  ],
  gates: [],
  water: [],
  bridges: [],
  flocks: [],
  boats: [],
  channels: [],
  galleries: [],
  mirages: [],
  ramparts: [],
  caravans: [],
  props: [],
  trees: {
    trunk: '#4a3222',
    leaves: ['#2f4a2c', '#37552f', '#26402a'],
    bamboo: ['#7d9a4a', '#4f7a35'],
    mao: ['#6f8f3c', '#a99f5a', '#4f7a35'],
    willow: ['#8fb35e', '#a6c470'],
    plum: ['#3a2418', '#e88aa4', '#f2b8c6'],
    peach: ['#4a3428', '#f2b8c6', '#f49a7a'],
    autumn: ['#b8462a', '#d8a03a'],
    orchid: ['#3f6a34', '#efe6c4'],
    mum: ['#4f7a35', '#e8b23a'],
    yard: [
      { x: 14, z: -14, scale: 1.2 },
      { x: 15, z: 12, scale: 1.1 },
      { x: -15, z: 15, scale: 1.3 },
      { x: 8, z: 8, scale: 0.9 },
      { x: -6, z: 12, scale: 1 },
    ],
    groves: [],
    ring: { count: 26, radius: 25, spread: 6, scaleMin: 1.6, scaleMax: 2.4 },
    seed: 7,
  },
  well: { enabled: true, x: 6, z: 2, stone: '#6c6660', water: '#2b4a6a' },
  lessons: { radicals: false },
  // tắt: đặc tả tông môn / vùng bật (mục 2026-11-13.6, đổi kiểu một vòng 2026-11-13); giá trị dưới = Truyền Tống Đài khu 3
  teleport: {
    enabled: false,
    center: [44, 0],
    radius: 13,
    ringRadius: 4,
    colors: { floor: '#b9b4a8', rim: '#8d877f', dim: '#7f8a84', lit: '#4fd1a5', spark: '#f2c45a' },
    // 0 tầng = sân / bệ phẳng (cảnh cũ không đổi)
    dais: {
      tiers: 0,
      tierHeight: 0.5,
      tierWidth: 1.4,
      stairWidth: 2.4,
      pillars: 4,
      colors: { stone: '#c9c3b6', rail: '#ece8de', pillar: '#8d877f' },
    },
  },
  floating: {
    islands: [],
    clouds: { count: 0, height: 26, radius: 60, speed: 0.6, color: '#d9dce8' },
  },
  player: { start: [0, 6] },
  npcs: [], // cảnh mặc định chưa có NPC
  gameTables: [],
  lanternStrings: [],
  lanternStyle: {
    height: 4.6,
    sag: 0.8,
    spacing: 1.5,
    rope: '#9e2a20',
    lantern: '#d8382a',
    trim: '#e0ae4c',
    pole: '#5a3a28',
    hang: 'den',
    drop: 1.4,
    lanternEvery: 0,
  },
  fences: [],
  fenceStyle: { height: 1.0, postEvery: 1.6, color: '#9e2a20', cap: '#e0ae4c' },
  camera: {
    fov: 55,
    minDist: 5,
    maxDist: 22,
    near: { dist: 9, pitch: 0.42 },
    far: { dist: 17, pitch: 0.75 },
    seated: { dist: 5.5, pitch: 0.44 },
  },
};

/* ---------------- suy ra từ đặc tả ---------------- */

/** Vị trí một vùng sự kiện, tính từ nhà nó neo vào. Trùng hình với `zones/ZoneAnchor`. */
export interface ZoneAnchor {
  id: string;
  x: number;
  z: number;
  r: number;
}

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;

/** Điểm (dx, dz) trong hệ của vật, quay `rotDeg` độ quanh trục đứng (như three: +z của vật → +x khi quay 90). */
export function rotateXZ(dx: number, dz: number, rotDeg: number): XZ {
  const a = (rotDeg * Math.PI) / 180;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return [round6(dx * c + dz * s), round6(-dx * s + dz * c)];
}

/* ---------------- nhà vào được (nội thất) ---------------- */

/** Kiểu nội thất: lớp học (bảng đen, bục, thầy, án thư) · thư viện (kệ sách, án đọc). Nội dung bài quyết kiểu. */
export const INTERIOR_KINDS = ['lop-hoc', 'thu-vien'] as const;
export type InteriorKind = (typeof INTERIOR_KINDS)[number];

/** Điểm học trong nhà (hệ toạ độ nhà, mặt trước +z) + bán kính — theo mặt bằng canvas `NoiThat-mat-bang`. */
export function interiorSpot(b: Pick<BuildingSpec, 'd'>, kind: InteriorKind): { dx: number; dz: number; r: number } {
  // lớp học: cách bảng đen (sát tường sau, mặt trong ở −(d − 0,8)/2) 2 m về phía cửa; thư viện: án đọc giữa phòng
  return kind === 'lop-hoc' ? { dx: 0, dz: round6(-(b.d - 0.8) / 2 + 1.9), r: 1.8 } : { dx: 0, dz: 0, r: 1.6 };
}

/**
 * Nhà nào thành nhà vào được: kiểu giảng đường (thân rỗng được) có `zone` mà nội dung bài cho một kiểu nội thất.
 * Trả về mã vùng → kiểu nội thất. Dùng chung cho dựng cảnh và `scene:check`.
 */
export function roomKinds(buildings: BuildingSpec[], interiors: Record<string, { kind: InteriorKind }>): Record<string, InteriorKind> {
  const out: Record<string, InteriorKind> = {};
  for (const b of buildings) {
    const use = b.zone ? interiors[b.zone.id] : undefined;
    if (use && (b.kind ?? 'giang-duong') === 'giang-duong' && b.zone) out[b.zone.id] = use.kind;
  }
  return out;
}

/**
 * Tâm vùng = tâm nhà + `front` theo hướng mặt trước (+z của nhà, quay `rotY`). Nhà có nội thất (`interiors[zone.id]`)
 * → vùng là điểm học trong nhà (R-VUNG-1), bỏ qua `front` / `r` của đặc tả.
 */
export function zoneAnchors(buildings: BuildingSpec[], interiors: Record<string, InteriorKind> = {}): ZoneAnchor[] {
  return buildings.flatMap((b) => {
    if (!b.zone) return [];
    const kind = interiors[b.zone.id];
    const spot = kind ? interiorSpot(b, kind) : { dx: 0, dz: b.zone.front, r: b.zone.r };
    const [dx, dz] = rotateXZ(spot.dx, spot.dz, b.rotY ?? 0);
    return [{ id: b.zone.id, x: round6(b.x + dx), z: round6(b.z + dz), r: spot.r }];
  });
}
