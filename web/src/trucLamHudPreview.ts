/**
 * Canvas 3D — HUD 3 trò nhỏ Trúc Lâm (thiết kế 2026-11-16.13) dựng bằng đúng lớp HUD của app (`ui/luuHud.ts`, `ui/mangHud.ts`,
 * `ui/danCamHud.ts`, `ui/bagPanel.ts`) với dữ liệu mẫu như artboard, để chụp so thiết kế. Chỉ trang thiết kế dùng, không vào app.
 * `?dang=luu-thuong&hud=luot|troi|dung|sai|npc|npc-xong|ket-qua|ket-qua-hoa` · `?dang=hai-mang&hud=nut|nut-to|the|the-dung|the-sai|ban|ban-xong|tui|tui-trong`
 * · `?dang=dan-cam&hud=chon|bai|tu-do|theo-bai|ket-qua` · `&may` = bản máy tính (phím chữ nổi).
 */
import type * as THREE from 'three';
import './ui/toolbar.css';
import { BagPanel } from './ui/bagPanel';
import { DanCamHud, type DanNote } from './ui/danCamHud';
import { LuuHud, type LuuCardView, type LuuSeatView, type LuuView } from './ui/luuHud';
import { MangHud } from './ui/mangHud';
import { bagView } from './zones/tuiDo';

const SEATS = (turn: string, me: number, gained = ''): LuuSeatView[] =>
  [
    { npc: null, name: 'Đạo hữu', score: me },
    { npc: 'thi-ong', name: 'Thi Ông', score: 2 },
    { npc: 'tu-tai', name: 'Tú Tài', score: 1 },
    { npc: 'tai-nu', name: 'Tài Nữ', score: 1 },
  ].map((s) => ({ ...s, turn: (s.npc ?? 'nguoi') === turn, gained: (s.npc ?? 'nguoi') === gained }));

const DOTS = (six: LuuView['dots'][number]['state'], seventh: LuuView['dots'][number]['state'] = 'cho'): LuuView['dots'] => [
  { mine: false, state: 'dung' },
  { mine: true, state: 'dung' },
  { mine: false, state: 'sai' },
  { mine: true, state: 'dung' },
  { mine: false, state: 'dung' },
  { mine: true, state: six },
  { mine: false, state: seventh },
  { mine: false, state: 'cho' },
];

const HA: Omit<LuuCardView, 'mine' | 'full' | 'left' | 'tiles'> = { han: '河', rest: '可', layout: 'trai-phai', at: 'dau', hv: 'hà', pinyin: 'hé', meaning: 'sông', total: 20 };
const HA_TILES = (s: ('thuong' | 'dung' | 'sai' | 'mo')[]): LuuCardView['tiles'] =>
  [
    ['氵', 'thuỷ'],
    ['火', 'hoả'],
    ['女', 'nữ'],
    ['竹', 'trúc'],
  ].map(([form, hv], i) => ({ form, hv, state: s[i] }));

function luuView(hud: string): LuuView {
  const base = { turn: 6, total: 8 };
  if (hud === 'troi') return { ...base, dots: DOTS('dang'), seats: SEATS('nguoi', 2), status: { kind: 'troi' }, card: null, result: null };
  if (hud === 'dung')
    return { ...base, dots: DOTS('dung'), seats: SEATS('nguoi', 3, 'nguoi'), status: { kind: 'dung' }, card: { ...HA, mine: true, full: true, left: null, tiles: HA_TILES(['dung', 'mo', 'mo', 'mo']) }, result: null };
  if (hud === 'sai')
    return { ...base, dots: DOTS('sai'), seats: SEATS('nguoi', 2), status: { kind: 'phat' }, card: { ...HA, mine: true, full: true, left: null, tiles: HA_TILES(['dung', 'sai', 'mo', 'mo']) }, result: null };
  const hoa: LuuCardView = {
    han: '花',
    rest: '化',
    layout: 'tren-duoi',
    at: 'dau',
    hv: 'hoa',
    pinyin: 'huā',
    meaning: 'hoa',
    total: 20,
    mine: false,
    who: { npc: 'tu-tai', name: 'Tú Tài' },
    full: hud === 'npc-xong',
    left: null,
    tiles: [
      ['宀', 'miên'],
      ['艹', 'thảo'],
      ['雨', 'vũ'],
      ['竹', 'trúc'],
    ].map(([form, hv], i) => ({ form, hv, state: hud === 'npc-xong' ? (i === 1 ? 'dung' : 'mo') : 'thuong', ...(hud === 'npc-xong' && i === 1 ? { npcPick: 'tu-tai' } : {}) })),
  };
  if (hud === 'npc') return { ...base, turn: 7, dots: DOTS('dung', 'dang'), seats: SEATS('tu-tai', 3), status: { kind: 'nghi', npc: 'tu-tai', name: 'Tú Tài' }, card: hoa, result: null };
  if (hud === 'npc-xong') return { ...base, turn: 7, dots: DOTS('dung', 'dung'), seats: SEATS('tu-tai', 3, 'tu-tai'), status: { kind: 'npc', name: 'Tú Tài', right: true }, card: hoa, result: null };
  if (hud.startsWith('ket-qua')) {
    const tie = hud === 'ket-qua-hoa';
    return {
      turn: 8,
      total: 8,
      dots: DOTS('dung', 'dung').map((d) => (d.state === 'cho' ? { ...d, state: 'dung' } : d)),
      seats: SEATS('', 4),
      status: null,
      card: null,
      result: {
        title: tie ? 'Đồng hạng nhất' : 'Hạng nhất',
        seal: !tie,
        points: 4,
        rows: [
          { rank: 1, npc: null, name: 'Đạo hữu', score: 4, me: true },
          { rank: tie ? 1 : 2, npc: 'thi-ong', name: 'Thi Ông', score: tie ? 4 : 3 },
          { rank: 3, npc: 'tu-tai', name: 'Tú Tài', score: 2 },
          { rank: 3, npc: 'tai-nu', name: 'Tài Nữ', score: 2 },
        ].map((r) => ({ me: false, ...r })),
        line: tie ? 'Ngang tài ngang sức, cạn chén nào!' : 'Hay! Chén này xin kính đạo hữu.',
        reward: tie ? 5 : 8,
      },
    };
  }
  // lượt mình (mặc định): 14 giây
  return { ...base, dots: DOTS('dang'), seats: SEATS('nguoi', 2), status: null, card: { ...HA, mine: true, full: false, left: 14, tiles: HA_TILES(['thuong', 'thuong', 'thuong', 'thuong']) }, result: null };
}

export function addTrucLamHudPreview(params: URLSearchParams, camera: THREE.Camera, groundAt: (x: number, z: number) => number): string | null {
  const hud = params.get('hud');
  const dang = params.get('dang');
  if (!hud) return null;
  if (params.has('may')) document.body.classList.add('ban-may');
  const nop = (): void => {};
  if (dang === 'luu-thuong') {
    document.body.classList.add('mini-play');
    new LuuHud({ leave: nop, newRound: nop, pick: nop }).render(luuView(hud));
    return `HUD Lưu Thương: ${hud}`;
  }
  if (dang === 'hai-mang') {
    const m = new MangHud({ pick: nop, answer: nop, sell: nop, closeSell: nop });
    const [x, z] = (params.get('mang') ?? '').split(',').map(Number);
    if (hud.startsWith('nut') && Number.isFinite(x) && Number.isFinite(z)) {
      const big = hud === 'nut-to';
      m.setPick({ x, y: groundAt(x, z) + (big ? 1 : 0.55), z, big });
      const loop = (): void => {
        m.follow(camera);
        requestAnimationFrame(loop);
      };
      loop();
      m.setChip('Măng hôm nay · đã hái 5 / 14');
    } else if (hud.startsWith('the')) {
      document.body.classList.add('mini-quiz');
      const picked = hud === 'the-dung' ? 0 : hud === 'the-sai' ? 1 : null;
      m.quiz({
        han: '朋友',
        options: [
          { meaning: 'bạn bè', hv: '' },
          { meaning: 'thầy giáo, cô giáo', hv: '' },
          { meaning: 'tên', hv: '' },
          { meaning: 'trường học', hv: '' },
        ],
        picked,
        answer: 0,
        ...(picked === null ? {} : { verdict: picked === 0 ? 'Đúng! péngyou — ×2, được 2 Măng to' : 'Chưa đúng — 朋友 péngyou · bạn bè. Vẫn được 1 Măng to' }),
      });
      m.setChip('Măng hôm nay · đã hái 5 / 14');
    } else if (hud.startsWith('ban')) {
      document.body.classList.add('mini-play');
      const done = hud === 'ban-xong';
      m.sell({
        rows: [
          { kind: 'mang', name: 'Măng', n: done ? 0 : 5, price: 3, sold: done },
          { kind: 'mang-to', name: 'Măng to', n: done ? 0 : 1, price: 8, sold: done },
        ],
        all: done ? 0 : 23,
      });
    } else if (hud.startsWith('tui')) {
      const bag = new BagPanel(nop, nop);
      bag.render(bagView({ garden: null, home: null, book: null, coins: 1280, forest: hud === 'tui-trong' ? {} : { mang: 5, 'mang-to': 1 } }));
      bag.showTab('lam', hud === 'tui-trong' ? null : 'mang-to');
      bag.show(true);
      bag.showTab('lam', hud === 'tui-trong' ? null : 'mang-to');
    }
    return `HUD Hái măng: ${hud}`;
  }
  if (dang === 'dan-cam') {
    document.body.classList.add('mini-play');
    const d = new DanCamHud({ free: nop, songs: nop, stand: nop, back: nop, song: nop, pluck: nop, lane: nop, pause: nop, again: nop });
    if (hud === 'chon') d.render({ mode: 'chon' });
    else if (hud === 'bai')
      d.render({
        mode: 'bai',
        songs: [
          { id: 'suoi-truc', name: 'Suối trúc', len: '0:45', best: 'Thanh nhã', rewarded: true },
          { id: 'mua-mang', name: 'Mưa măng', len: '0:52', rewarded: false },
          { id: 'trang-tren-go', name: 'Trăng trên gò', len: '1:00', best: 'Tri âm', rewarded: false },
        ],
      });
    else if (hud === 'tu-do') {
      d.render({ mode: 'tudo' });
      d.glow(1, 2);
    } else if (hud === 'theo-bai') {
      d.render({ mode: 'theo', name: 'Suối trúc', hay: 9, duoc: 2, progress: 0.4, paused: false });
      const notes: DanNote[] = [
        { lane: 1, k: 0.22, mark: undefined },
        { lane: 3, k: 0.52, mark: undefined },
        { lane: 0, k: 0.77, mark: undefined },
        { lane: 4, k: 0.95, mark: null },
      ];
      d.frame(notes);
      d.judge(2, 'hay');
      window.setInterval(() => d.judge(2, 'hay'), 450); // giữ chữ "Hay" để chụp
    } else
      d.render({ mode: 'ketqua', name: 'Suối trúc', rank: 'Tri âm', pct: 92, hay: 21, duoc: 3, miss: 1, reward: { kind: 'coins', n: 5 } });
    return `HUD Đàn cầm: ${hud}`;
  }
  return null;
}
