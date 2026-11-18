/**
 * Chặn tái phạm V-106 (R-NPC-11): lời mọi NPC xưng hô theo tuổi — không gọi người chơi "đạo hữu", không từ thô / xa cách,
 * không còn tên NPC cũ đã đổi. Gom mọi chuỗi NPC nói (khung thoại, bong bóng, kênh chung, thẻ kết quả, mẹo bảng cách chơi).
 */
import { describe, expect, it } from 'vitest';
import { NPC_LINES } from './chat/npcChatter';
import { GAME_LINES } from './gamePlay';
import { hostLine, LUU_NEED_LINE, LUU_NPCS } from './games/luuThuong';
import { NHUONG_BUOC } from './townNpcs';
import { ALMS_DECLINED, ALMS_SHORT_REPLY, almsGreeting, almsRepeat, almsThanks, khatNhiDialog } from './zones/alms';
import { DIALOGS, type Dialog } from './zones/dialogs';
import { gameGuide } from './zones/gameGuides';
import { cauHoiGio } from './zones/gioVN';
import { librarianDialog } from './zones/library';
import { STUDY_GUIDE } from './zones/studyGuide';
import { TEA_SAY } from './zones/teaService';
import { TIN_DON } from './zones/tinDon';
import { journeyLine } from './zones/tranSu';
import { thiOngDialog, trucOngDialog, vanNhanDialog } from './zones/trucLamThoai';
import { trucLaoDialog } from './zones/trucLao';
import { NO_ALMS } from './zones/walletRules';

const DAY = 20771;

/** Mọi khung thoại NPC, đủ các nhánh trạng thái. */
function allDialogs(): Dialog[] {
  return [
    ...DIALOGS,
    librarianDialog(null, false),
    librarianDialog(null, true),
    librarianDialog('hsk1', false),
    thiOngDialog(),
    vanNhanDialog('tai-nu'),
    vanNhanDialog('tu-tai'),
    trucOngDialog({}),
    trucOngDialog({ mang: 2 }),
    trucLaoDialog({ learned: [], due: [] }),
    trucLaoDialog({ learned: [], due: [] }, true),
    trucLaoDialog({ learned: [], due: ['好'] }, false, []),
    khatNhiDialog(NO_ALMS, DAY, 100),
    khatNhiDialog(NO_ALMS, DAY, 2),
    khatNhiDialog({ lastDay: DAY, count: 10 }, DAY, 100),
  ];
}

/** Mọi câu NPC nói (không gồm lời người chơi chọn). */
function npcLines(): string[] {
  const guides = ['co', 'dau-chu', 'luu-thuong', 'hai-mang', 'dan-cam'].map((k) => gameGuide(k)).filter((g) => g !== null);
  return [
    ...allDialogs().flatMap((d) => d.lines.map((l) => l.text)),
    ...Object.values(NPC_LINES).flat(),
    ...Object.values(GAME_LINES).filter((t) => !t.startsWith('Vâng')),
    hostLine('thang'),
    hostLine('hoa'),
    hostLine('thua'),
    LUU_NEED_LINE,
    NHUONG_BUOC,
    TEA_SAY,
    almsGreeting('chua-cho', 0),
    almsGreeting('chua-cho', 10),
    almsGreeting('da-cho', 1),
    almsThanks(DAY),
    almsRepeat(DAY),
    ALMS_DECLINED,
    ALMS_SHORT_REPLY,
    ...TIN_DON.map((t) => t.text),
    cauHoiGio(Date.UTC(2026, 10, 14, 3, 5)),
    journeyLine({ words: 3, lessons: 1 }, [{ id: 'rung-truc', ten: 'Thung Trúc Gió Hát' }], new Set(['rung-truc'])),
    ...guides.map((g) => g.tip),
    STUDY_GUIDE.tip,
  ];
}

const OLD_NAMES = ['Điển Thư', 'Trận sư', 'Tú Tài', 'Tài Nữ', 'Trúc Ông', 'Tiểu Khất'];
const BANNED = /đạo hữu|ngươi|tiểu tử|lão phu|tại hạ|bần đạo|tiểu nhân|khách quan|tiểu khất|tiểu sinh/i;

describe('Xưng hô NPC theo tuổi (R-NPC-11)', () => {
  it('R-NPC-11: không lời NPC nào gọi người chơi "đạo hữu" hay dùng từ thô / xa cách', () => {
    const lines = npcLines();
    expect(lines.length).toBeGreaterThan(40);
    expect(lines.filter((t) => BANNED.test(t))).toEqual([]);
  });

  it('R-NPC-11: không còn tên NPC cũ trong tên khung thoại, lời thoại, văn nhân Lưu Thương, tiêu đề mẹo', () => {
    const names = [...allDialogs().map((d) => d.name), ...LUU_NPCS.map((n) => n.name)];
    const titles = ['luu-thuong', 'hai-mang'].map((k) => gameGuide(k)?.tipTitle ?? '').concat(STUDY_GUIDE.tipTitle ?? '');
    const all = [...names, ...titles, ...npcLines()].join('\n');
    for (const old of OLD_NAMES) expect(all).not.toContain(old);
  });

  it('R-NPC-11: tên mới đúng chỗ (mã giữ nguyên)', () => {
    const name = (id: string): string | undefined => allDialogs().find((d) => d.npc === id)?.name;
    expect(name('thu-thu')).toBe('Thư cô nương');
    expect(name('tran-su')).toBe('La đại thúc');
    expect(name('tu-tai')).toBe('A Chén');
    expect(name('tai-nu')).toBe('Vần cô nương');
    expect(name('truc-ong')).toBe('Măng bà bà');
    expect(name('khat-nhi')).toBe('Tiểu Líu Lo');
  });

  it('R-NPC-11: bé gọi "thiếu hiệp", già / trung niên gọi "cháu", thanh niên gọi "em"', () => {
    const start = (id: string): string => {
      const d = allDialogs().find((x) => x.npc === id)!;
      return d.lines.find((l) => l.id === d.start)!.text;
    };
    expect(start('tieu-mac')).toContain('Thiếu hiệp');
    expect(start('tieu-nhi')).toContain('Thiếu hiệp');
    expect(start('su-phu')).toContain('Cháu');
    expect(start('go-mo')).toContain('cháu');
    expect(start('quan-su')).toContain('Em');
    expect(trucOngDialog({ mang: 1 }).lines[0].text).toContain('bà mua');
    expect(vanNhanDialog('tu-tai').lines[0].text).toContain('Huynh');
  });
});
