import { describe, expect, it } from 'vitest';
import { HOME_HERE_TEXT, TOOL_NAMES, TOOL_ORDER, toolAria, toolForKey, toolStep, toolbarView, type ToolContext } from './thanhCongCu';

const base: ToolContext = {
  loading: false,
  crane: false,
  covered: false,
  travelMap: false,
  areaMap: false,
  talking: false,
  gameTable: false,
  decorating: false,
  garden: false,
  chatTyping: false,
  panel: null,
  sitting: false,
  air: false,
  atHome: false,
  tasksLeft: null,
};
const at = (o: Partial<ToolContext>): ToolContext => ({ ...base, ...o });

describe('thanh công cụ (R-THANH-1)', () => {
  it('R-THANH-1: 5 nút theo thứ tự, tên tiếng Việt; ở Thung Trúc Gió Hát còn 2 việc → hiện, Nhiệm vụ chấm 2', () => {
    expect(TOOL_ORDER.map((id) => TOOL_NAMES[id])).toEqual(['Bản đồ', 'Về nhà', 'Biểu cảm', 'Túi đồ', 'Nhiệm vụ']);
    for (const id of TOOL_ORDER) expect(TOOL_NAMES[id]).not.toMatch(/\p{Script=Han}/u); // R-HUD-4
    const v = toolbarView(at({ tasksLeft: 2 }));
    expect(v.visible).toBe(true);
    expect(v.badge).toBe(2);
    expect(Object.values(v.on).every(Boolean)).toBe(true);
    expect(toolbarView(at({ tasksLeft: 0 })).badge).toBe(0);
    expect(toolbarView(at({ tasksLeft: null })).badge).toBe(0);
  });

  it('R-THANH-1: ẩn khi màn tải, hạc, màn phủ, bản đồ, thoại, bàn chơi, trang trí, vườn, ô nhập — đóng là hiện lại', () => {
    const hides: (keyof ToolContext)[] = ['loading', 'crane', 'covered', 'travelMap', 'areaMap', 'talking', 'gameTable', 'decorating', 'garden', 'chatTyping'];
    for (const k of hides) {
      const v = toolbarView(at({ [k]: true }));
      expect(v.visible, k).toBe(false);
      expect(Object.values(v.on).some(Boolean), k).toBe(false);
      expect(toolStep('banDo', at({ [k]: true })), k).toBe('none');
    }
    // nói chuyện với Tiểu Mặc → ẩn; đóng khung → hiện lại
    expect(toolbarView(at({ talking: true })).visible).toBe(false);
    expect(toolbarView(at({ talking: false })).visible).toBe(true);
    // bản máy tính: ô nhập nằm trên thanh → đang gõ thanh vẫn hiện
    expect(toolbarView(at({ chatTyping: true, chatDocked: true })).visible).toBe(true);
    expect(toolbarView(at({ chatTyping: false, chatDocked: true })).visible).toBe(true);
    // đang ngồi / đang nhảy → thanh vẫn hiện
    expect(toolbarView(at({ sitting: true })).visible).toBe(true);
    expect(toolbarView(at({ air: true })).visible).toBe(true);
  });

  it('R-THANH-1: Túi đồ mở → thanh ẩn (tấm che); bảng Biểu cảm mở → thanh hiện, nút Biểu cảm "đang mở"', () => {
    expect(toolbarView(at({ panel: 'tuiDo' })).visible).toBe(false);
    const emo = toolbarView(at({ panel: 'bieuCam' }));
    expect(emo.visible).toBe(true);
    expect(emo.active).toBe('bieuCam');
    expect(toolbarView(base).active).toBeNull();
    // bị ẩn vì việc khác → không nút nào "đang mở"
    expect(toolbarView(at({ panel: 'bieuCam', talking: true })).active).toBeNull();
  });

  it('R-THANH-1: trợ năng Nhiệm vụ "còn n việc"; xong hết → chỉ tên', () => {
    expect(toolAria('nhiemVu', 2)).toBe('Nhiệm vụ, còn 2 việc');
    expect(toolAria('nhiemVu', 0)).toBe('Nhiệm vụ');
    expect(toolAria('tuiDo', 2)).toBe('Túi đồ');
  });

  it('R-THANH-1: phím M H G B J (quy ước PC: Map, Home, Gesture, Bag, Journal)', () => {
    expect(['m', 'H', 'g', 'B', 'j'].map(toolForKey)).toEqual(['banDo', 'veNha', 'bieuCam', 'tuiDo', 'nhiemVu']);
    expect(['t', 'i', 'n'].map(toolForKey)).toEqual([null, null, null]); // T / I cũ bỏ; N là bản đồ lớn (R-BANDO-5)
  });
});

describe('chạm nút khi đang làm việc khác (R-THANH-2)', () => {
  it('R-THANH-2: đang ngồi → Bản đồ / Về nhà / Túi đồ / Nhiệm vụ đứng dậy rồi làm; Biểu cảm mờ', () => {
    const sit = at({ sitting: true });
    for (const id of ['banDo', 'veNha', 'tuiDo', 'nhiemVu'] as const) expect(toolStep(id, sit)).toBe('standThen');
    expect(toolbarView(sit).on.bieuCam).toBe(false);
    expect(toolStep('bieuCam', sit)).toBe('none');
  });

  it('R-THANH-2: đang nhảy → nút vẫn sáng, chạm thì làm khi chạm đất; Biểu cảm mờ (R-BIEU-1)', () => {
    const air = at({ air: true });
    expect(toolbarView(air).on.banDo).toBe(true);
    expect(toolStep('banDo', air)).toBe('afterLand');
    expect(toolStep('nhiemVu', air)).toBe('afterLand');
    expect(toolbarView(air).on.bieuCam).toBe(false);
  });

  it('R-THANH-2: đứng / đi → làm luôn', () => {
    for (const id of TOOL_ORDER) expect(toolStep(id, base)).toBe('now');
  });
});

describe('Về nhà một chạm (R-HANH-7)', () => {
  it('R-HANH-7: ngoài nhà → đi ngay; ở nhà → nút mờ, chạm → thẻ "Bạn đang ở Nhà của ta"', () => {
    expect(toolStep('veNha', base)).toBe('now');
    const home = at({ atHome: true });
    expect(toolbarView(home).on.veNha).toBe(false);
    expect(toolStep('veNha', home)).toBe('homeHere');
    expect(toolStep('veNha', at({ atHome: true, sitting: true }))).toBe('homeHere'); // ngồi ở nhà: không phải đứng dậy
    expect(HOME_HERE_TEXT).toBe('Bạn đang ở Nhà của ta');
    // các nút khác ở nhà vẫn sáng
    expect(toolbarView(home).on.banDo).toBe(true);
  });
});
