import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { GAME_LINES, GamePlay, type SeatablePlayer } from './gamePlay';
import { BLACK, WHITE } from './games/gomoku';
import { SEAT_Z, tableSlots, type BoardPoint, type GameTable } from './scene/gameTable';
import type { GameResult } from './ui/gameView';
import type { GameTableSpec } from './scene/spec';

/** Chỗ chơi giả: ghi lại trạng thái cảnh nhận được (không cần canvas / WebGL). Ghế 0 phía +z (nhìn bắc), ghế 1 phía −z. */
function fakeSlot(spec: GameTableSpec, x = spec.x, stand = true) {
  const state = {
    stones: new Uint8Array(169) as ArrayLike<number>,
    glow: [] as readonly BoardPoint[],
    card: null as string | null,
    cardSeat: -1,
    mark: null as BoardPoint | null,
  };
  const table: GameTable = {
    spec,
    seats: [
      { x, y: 0, z: spec.z + SEAT_Z, rotY: Math.PI },
      { x, y: 0, z: spec.z - SEAT_Z, rotY: 0 },
    ],
    npcSpot: stand ? { x, z: spec.z - 1.25, rotY: 0 } : null,
    center: new THREE.Vector3(x, 0.42, spec.z),
    angle: 0,
    top: new THREE.Mesh(),
    pointAt: () => null,
    setStones: (c) => (state.stones = Array.from(c)),
    highlight: (p) => (state.glow = p),
    mark: (p) => (state.mark = p),
    showCard: (t, seat = 0) => {
      state.card = t;
      state.cardSeat = seat;
    },
  };
  return { table, state };
}
const fakeTable = (spec: GameTableSpec) => fakeSlot(spec);

function fakePlayer(x: number, z: number): SeatablePlayer & { sitting: boolean } {
  const p = {
    position: new THREE.Vector3(x, 0, z),
    sitting: false,
    moveTarget: null as THREE.Vector3 | null,
    get isSitting() {
      return p.sitting;
    },
    toggleSit() {
      p.sitting = !p.sitting;
    },
  };
  return p;
}

type Said = { npc: string; text: string; close: () => void; choice?: string };

function host(player: SeatablePlayer, said: Said[], learned: string[] = [], faced: number[] = []) {
  return {
    scene: new THREE.Scene(),
    colliders: new Colliders(),
    player,
    face: (r: number) => faced.push(r),
    groundAt: () => 0,
    say: (npc: string, text: string, close: () => void, choice?: string) => said.push({ npc, text, close, choice }),
    learned: () => new Set(learned),
  };
}

function setup(px: number, pz: number, learned: string[] = []) {
  const co = fakeTable({ id: 'ban-co', kind: 'co', x: -22, z: 34, npc: 'tieu-mac' });
  const dau = fakeTable({ id: 'ban-dau-chu', kind: 'dau-chu', x: -22, z: 46, npc: 'su-phu' });
  const player = fakePlayer(px, pz);
  const said: Said[] = [];
  const game = new GamePlay([co.table, dau.table], host(player, said, learned));
  return { game, player, co, dau, said };
}

const last = <T>(a: T[]): T | undefined => a[a.length - 1];

/** Chạy NPC tới khi xong nước (≤ 1 giây nghĩ). */
const npcThink = (game: GamePlay): void => {
  for (let i = 0; i < 30; i++) game.update(0.05);
};

describe('Khu giao lưu — ngồi vào bàn', () => {
  it('R-GIAO-1: đứng cách ghế dưới 1,5 m bấm Ngồi → ngồi vào ghế, ván cờ bắt đầu', () => {
    const { game, player } = setup(-22, 36);
    expect(game.trySit()).toBe(true);
    expect(player.isSitting).toBe(true);
    expect(player.position.x).toBe(-22);
    expect(player.position.z).toBeCloseTo(34 + SEAT_Z, 9);
    expect(game.active).toBe(true);
    expect(game.gomoku?.turn).toBe(BLACK);
  });

  it('R-GIAO-1: cách ghế 2,9 m → không phải bàn (Ngồi là ngồi thiền như cũ)', () => {
    const { game, player } = setup(-22, 38);
    expect(game.trySit()).toBe(false);
    expect(player.isSitting).toBe(false);
    expect(game.active).toBe(false);
  });

  it('R-GIAO-1: đặt 3 quân rồi bấm "Rời bàn" → đứng dậy, ván bỏ, bàn trống', () => {
    const { game, player, co } = setup(-22, 36);
    game.trySit();
    for (const x of [2, 6, 10]) {
      expect(game.playAt({ x, y: 2 })).toBe(true);
      npcThink(game);
    }
    expect(Array.from(co.state.stones).filter((c) => c !== 0)).toHaveLength(6);
    game.stand();
    expect(player.isSitting).toBe(false);
    expect(game.active).toBe(false);
    expect(game.view()).toBeNull();
    expect(Array.from(co.state.stones).every((c) => c === 0)).toBe(true);
  });
});

describe('Khu giao lưu — Ngũ Tử Kỳ', () => {
  it('R-CO-1: chạm lúc NPC đang nghĩ / ô đã có quân → không có gì', () => {
    const { game } = setup(-22, 36);
    game.trySit();
    game.playAt({ x: 6, y: 6 });
    expect(game.playAt({ x: 7, y: 7 })).toBe(false); // NPC đang nghĩ
    npcThink(game);
    expect(game.gomoku?.moves).toBe(2);
    expect(game.playAt({ x: 6, y: 6 })).toBe(false); // đã có quân
  });

  it('R-CO-2: NPC đáp sau 0,5–1 giây', () => {
    const { game } = setup(-22, 36);
    game.trySit();
    game.playAt({ x: 6, y: 6 });
    game.update(0.45);
    expect(game.gomoku?.moves).toBe(1);
    for (let i = 0; i < 12; i++) game.update(0.05);
    expect(game.gomoku?.moves).toBe(2);
    expect(game.gomoku?.turn).toBe(BLACK);
  });

  it('R-CO-3: lượt người / NPC đang nghĩ trên viên lượt; nước vừa đi có chấm son', () => {
    const { game, co } = setup(-22, 36);
    game.trySit();
    expect(game.view()).toMatchObject({ kind: 'co', turn: 'you', you: 0, npcWins: 0, result: null });
    game.playAt({ x: 6, y: 6 });
    expect(co.state.mark).toEqual({ x: 6, y: 6 });
    expect(game.view()).toMatchObject({ turn: 'npc' });
    npcThink(game);
    expect(game.view()).toMatchObject({ turn: 'you' });
    expect(co.state.mark).not.toEqual({ x: 6, y: 6 }); // chấm son chuyển sang nước NPC
  });

  it('R-CO-3: người thắng → quân thắng sáng, thẻ "Thắng · 1 : 0" + lời Tiểu Mặc; "Ván mới" → bàn trống, tỉ số giữ', () => {
    const { game, player, co, said } = setup(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    // dựng sẵn 4 quân đen liền, chỗ thứ 5 trống, tới lượt người
    for (const x of [3, 4, 5, 6]) g.cells[7 * 13 + x] = BLACK;
    g.cells[0] = WHITE;
    g.moves = 5;
    expect(game.playAt({ x: 7, y: 7 })).toBe(true);
    expect(g.result?.winner).toBe(BLACK);
    expect(co.state.glow).toHaveLength(5);
    expect(said).toHaveLength(0); // không còn khung thoại
    expect(game.view()).toMatchObject({ turn: 'het', you: 1, npcWins: 0, result: { outcome: 'thang', you: 1, npc: 0, line: GAME_LINES.coThua } });
    expect(game.playAt({ x: 0, y: 12 })).toBe(false); // thẻ kết quả đang hiện — không nhận chạm
    game.newRound();
    expect(game.gomoku?.moves).toBe(0);
    expect(game.gomoku?.result).toBeNull();
    expect(game.view()).toMatchObject({ turn: 'you', you: 1, npcWins: 0, result: null });
    expect(game.playAt({ x: 6, y: 6 })).toBe(true); // người lại đi trước
    expect(player.isSitting).toBe(true);
  });

  it('R-CO-3: NPC thắng → thẻ "Thua" + "Ha, lần này đệ thắng rồi!"; rời bàn rồi ngồi lại → 0 : 0', () => {
    const { game } = setup(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    for (const y of [2, 3, 4, 5]) g.cells[y * 13 + 10] = WHITE;
    g.moves = 4;
    game.playAt({ x: 0, y: 0 }); // người đi chỗ không liên quan
    npcThink(game);
    expect(g.result?.winner).toBe(WHITE);
    expect(game.view()).toMatchObject({ result: { outcome: 'thua', you: 0, npc: 1, line: GAME_LINES.coThang } });
    game.stand();
    game.trySit();
    expect(game.view()).toMatchObject({ you: 0, npcWins: 0, result: null });
  });
});

describe('Khu giao lưu — Đấu chữ', () => {
  it('R-DAU-1: chưa học bộ nào → Mặc Ông bảo tới Rừng trúc, lựa chọn "Vâng, con đi đây (rời bàn)" → đứng dậy', () => {
    const { game, said, dau, player } = setup(-22, 48);
    expect(game.trySit()).toBe(true);
    expect(last(said)).toMatchObject({ npc: 'su-phu', text: GAME_LINES.dauChuaHoc, choice: 'Vâng, con đi đây (rời bàn)' });
    expect(dau.state.card).toBeNull();
    expect(game.gomoku).toBeNull();
    expect(game.view()).toBeNull(); // không thẻ điểm, không ô nghĩa
    last(said)?.close();
    expect(player.isSitting).toBe(false);
    expect(game.active).toBe(false);
  });

  it('R-DAU-2: đã học → thẻ bộ thủ trên bàn, "Câu 1 / 10", 4 nghĩa "âm — nghĩa"; chạm là chọn, chấm ~1 s rồi câu 2 Mặc Ông nghĩ', () => {
    const { game, dau } = setup(-22, 48, ['moc', 'truc', 'thuy']);
    expect(game.trySit()).toBe(true);
    const v = game.view();
    if (v?.kind !== 'dau-chu') throw new Error('không phải Đấu chữ');
    expect(v).toMatchObject({ step: 0, total: 10, answerer: 'you', phase: 'hoi', marks: [], you: 0, npcScore: 0 });
    expect(dau.state.card).toBe(v.form);
    expect(v.options).toHaveLength(4);
    for (const o of v.options) expect(o).toMatch(/ — /);
    const right = v.options.findIndex((o) => o.endsWith(v.detail.split(' — ')[1]));
    expect(game.pick(right)).toBe(true);
    const c = game.view();
    expect(c).toMatchObject({ phase: 'cham', marks: [true], you: 1, scored: 'you', toast: { right: true, text: 'Đúng rồi! +1 điểm' } });
    if (c?.kind === 'dau-chu') expect(c.optionMarks[right]).toBe('dung');
    expect(game.pick(0)).toBe(false); // đang chấm
    game.update(1.05);
    expect(game.view()).toMatchObject({ step: 1, answerer: 'npc', phase: 'nghi' });
    expect(game.pick(0)).toBe(false); // lượt Mặc Ông
  });

  it('R-DAU-2: hết 10 câu → thẻ kết quả với điểm ván; "Ván mới" → câu 1 lại', () => {
    const { game } = setup(-22, 48, ['moc', 'truc', 'thuy']);
    game.trySit();
    for (let k = 0; k < 400 && !game.view()?.result; k++) {
      const v = game.view();
      if (v?.kind === 'dau-chu' && v.phase === 'hoi') game.pick(0);
      game.update(0.1);
    }
    const v = game.view();
    if (v?.kind !== 'dau-chu' || !v.result) throw new Error('chưa hết ván');
    expect(v.marks).toHaveLength(10);
    expect(v.result.you).toBe(v.you);
    expect(v.result.npc).toBe(v.npcScore);
    const want = v.you > v.npcScore ? GAME_LINES.dauThua : v.you < v.npcScore ? GAME_LINES.dauThang : GAME_LINES.dauHoa;
    expect(v.result.line).toBe(want);
    game.newRound();
    expect(game.view()).toMatchObject({ step: 0, phase: 'hoi', marks: [], result: null });
  });
});

/** Bàn cờ dài tâm (−34; 4), 3 chỗ ở x −36,5 / −34 / −31,5, không NPC đứng (ví dụ R-GIAO-1). */
function setupLong(px: number, pz: number) {
  const spec: GameTableSpec = { id: 'ban-co', kind: 'co', x: -34, z: 4, npc: 'tieu-mac', boards: 3, npcStand: false };
  const slots = tableSlots(spec).map((s) => fakeSlot(spec, s.x, false));
  const player = fakePlayer(px, pz);
  const said: Said[] = [];
  const faced: number[] = [];
  const game = new GamePlay(
    slots.map((s) => s.table),
    host(player, said, [], faced),
  );
  return { game, player, slots, said, faced };
}

describe('Khu giao lưu — bàn dài nhiều ghế', () => {
  it('R-GIAO-1: đứng ở (−36,5; 6,5) bấm Ngồi → ngồi (−36,5; 5,4) nhìn bắc, ván ở chỗ x −36,5', () => {
    const { game, player, slots, faced } = setupLong(-36.5, 6.5);
    expect(game.trySit()).toBe(true);
    expect(player.position.x).toBeCloseTo(-36.5, 9);
    expect(player.position.z).toBeCloseTo(5.4, 9);
    expect(last(faced)).toBe(Math.PI);
    game.playAt({ x: 6, y: 6 });
    expect(Array.from(slots[0].state.stones).filter((c) => c !== 0)).toHaveLength(1);
    expect(Array.from(slots[1].state.stones).every((c) => c === 0)).toBe(true);
  });

  it('R-GIAO-1: đứng ở (−34; 1,5) → ngồi ghế phía bắc (−34; 2,6), nhìn nam, camera từ phía bắc', () => {
    const { game, player, faced } = setupLong(-34, 1.5);
    expect(game.trySit()).toBe(true);
    expect(player.position.x).toBeCloseTo(-34, 9);
    expect(player.position.z).toBeCloseTo(2.6, 9);
    expect(last(faced)).toBe(0);
    const cam = new THREE.PerspectiveCamera(55, 0.5);
    expect(game.placeCamera(cam)).toBe(true);
    expect(cam.position.z).toBeLessThan(4); // sau lưng người ngồi phía bắc
  });

  it('R-GIAO-1: cách ghế gần nhất 2,1 m → không phải bàn (ngồi thiền)', () => {
    const { game, player } = setupLong(-34, 7.5);
    expect(game.trySit()).toBe(false);
    expect(player.isSitting).toBe(false);
  });

  it('R-GIAO-1: không có NPC đứng cạnh bàn dài', async () => {
    const { game } = setupLong(-34, 6);
    expect(await game.placeNpcs()).toEqual([]);
  });

  it('R-GIAO-1: ngồi ghế phía bắc bàn Đấu chữ → thẻ quay về ghế đó', () => {
    const spec: GameTableSpec = { id: 'ban-dau-chu', kind: 'dau-chu', x: -34, z: 11, npc: 'su-phu', boards: 3, npcStand: false };
    const slot = fakeSlot(spec, -34, false);
    const player = fakePlayer(-34, 8.8);
    const game = new GamePlay([slot.table], host(player, [], ['木']));
    expect(game.trySit()).toBe(true);
    expect(player.position.z).toBeCloseTo(11 - SEAT_Z);
    expect(game.seatIndex).toBe(1);
  });
});

describe('Khu giao lưu — vào bàn bằng nút nổi', () => {
  it('R-NGOI-1 / R-GIAO-1: bấm "Vào bàn" cho ghế phía bắc chỗ x −34 → ngồi (−34; 2,6), ván bắt đầu ở chỗ đó', () => {
    const { game, player, slots, faced } = setupLong(-34, 1.5);
    const spots = game.seatSpots();
    expect(spots).toHaveLength(6);
    const spot = spots.find((s) => Math.abs(s.x + 34) < 1e-9 && Math.abs(s.z - 2.6) < 1e-9)!;
    expect(spot.kind).toBe('ban-choi');
    expect(game.sitAt(spot)).toBe(true);
    expect(player.position.x).toBeCloseTo(-34, 9);
    expect(player.position.z).toBeCloseTo(2.6, 9);
    expect(last(faced)).toBe(0);
    expect(game.playAt({ x: 6, y: 6 })).toBe(true);
    expect(Array.from(slots[1].state.stones).filter((c) => c !== 0)).toHaveLength(1);
  });

  it('R-NGOI-1: đang ngồi → không vào bàn khác', () => {
    const { game } = setupLong(-34, 1.5);
    const [a, b] = game.seatSpots();
    expect(game.sitAt(a)).toBe(true);
    expect(game.sitAt(b)).toBe(false);
  });
});

describe('Văn tiền khi ngồi bàn (R-TIEN-3, quyết định 4)', () => {
  function setupEarn(px: number, pz: number, learned: string[] = []) {
    const co = fakeTable({ id: 'ban-co', kind: 'co', x: -22, z: 34, npc: 'tieu-mac' });
    const dau = fakeTable({ id: 'ban-dau-chu', kind: 'dau-chu', x: -22, z: 46, npc: 'su-phu' });
    const player = fakePlayer(px, pz);
    const ended: { game: string; outcome: string; result: GameResult }[] = [];
    const game = new GamePlay([co.table, dau.table], {
      ...host(player, [], learned),
      ended: (g, outcome, result) => ended.push({ game: g, outcome, result }),
    });
    return { game, ended };
  }

  it('R-TIEN-3: thắng ván cờ → báo một lần (co, thang); thẻ kết quả ghi "+3 Văn tiền" khi Flutter trả lời', () => {
    const { game, ended } = setupEarn(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    for (const x of [3, 4, 5, 6]) g.cells[7 * 13 + x] = BLACK;
    g.cells[0] = WHITE;
    g.moves = 5;
    game.playAt({ x: 7, y: 7 });
    expect(ended).toHaveLength(1);
    expect(ended[0]).toMatchObject({ game: 'co', outcome: 'thang' });
    expect(game.setReward(ended[0].result, '+3 Văn tiền')).toBe(true);
    expect(game.view()).toMatchObject({ result: { outcome: 'thang', reward: '+3 Văn tiền' } });
  });

  it('R-TIEN-3: không thưởng (đủ trần) → thẻ không có dòng; trả lời đến sau "Ván mới" / "Rời bàn" → bỏ', () => {
    const { game, ended } = setupEarn(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    for (const x of [3, 4, 5, 6]) g.cells[7 * 13 + x] = BLACK;
    g.moves = 4;
    game.playAt({ x: 7, y: 7 });
    expect(game.setReward(ended[0].result, null)).toBe(false);
    expect(game.view()?.result?.reward).toBeUndefined();
    game.newRound();
    expect(game.setReward(ended[0].result, '+3 Văn tiền')).toBe(false);
    game.stand();
    expect(game.setReward(ended[0].result, '+3 Văn tiền')).toBe(false);
  });

  it('R-TIEN-3: hết 10 câu Đấu chữ → báo (dau-chu, kết quả ván); rời bàn giữa ván → không báo', () => {
    const { game, ended } = setupEarn(-22, 48, ['moc', 'truc', 'thuy']);
    game.trySit();
    game.pick(0);
    game.stand(); // rời giữa ván
    expect(ended).toHaveLength(0);
    game.trySit();
    for (let k = 0; k < 400 && !game.view()?.result; k++) {
      const v = game.view();
      if (v?.kind === 'dau-chu' && v.phase === 'hoi') game.pick(0);
      game.update(0.1);
    }
    expect(ended).toHaveLength(1);
    expect(ended[0].game).toBe('dau-chu');
    expect(ended[0].outcome).toBe(game.view()?.result?.outcome);
  });
});
