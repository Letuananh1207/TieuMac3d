import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { GAME_LINES, GamePlay, type SeatablePlayer } from './gamePlay';
import { BLACK, WHITE } from './games/gomoku';
import type { BoardPoint, GameTable } from './scene/gameTable';
import type { GameTableSpec } from './scene/spec';

/** Chỗ chơi giả: ghi lại trạng thái cảnh nhận được (không cần canvas / WebGL). Ghế 0 phía +z (nhìn bắc), ghế 1 phía −z. */
function fakeSlot(spec: GameTableSpec, x = spec.x, stand = true) {
  const state = {
    stones: new Uint8Array(169) as ArrayLike<number>,
    glow: [] as readonly BoardPoint[],
    card: null as string | null,
    cardSeat: -1,
  };
  const table: GameTable = {
    spec,
    seats: [
      { x, y: 0, z: spec.z + 1.1, rotY: Math.PI },
      { x, y: 0, z: spec.z - 1.1, rotY: 0 },
    ],
    npcSpot: stand ? { x, z: spec.z - 1.25, rotY: 0 } : null,
    center: new THREE.Vector3(x, 0.42, spec.z),
    angle: 0,
    top: new THREE.Mesh(),
    pointAt: () => null,
    setStones: (c) => (state.stones = Array.from(c)),
    highlight: (p) => (state.glow = p),
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

function host(player: SeatablePlayer, said: { npc: string; text: string; close: () => void }[], learned: string[] = [], faced: number[] = []) {
  return {
    scene: new THREE.Scene(),
    colliders: new Colliders(),
    player,
    face: (r: number) => faced.push(r),
    groundAt: () => 0,
    say: (npc: string, text: string, close: () => void) => said.push({ npc, text, close }),
    learned: () => new Set(learned),
  };
}

function setup(px: number, pz: number, learned: string[] = []) {
  const co = fakeTable({ id: 'ban-co', kind: 'co', x: -22, z: 34, npc: 'tieu-mac' });
  const dau = fakeTable({ id: 'ban-dau-chu', kind: 'dau-chu', x: -22, z: 46, npc: 'su-phu' });
  const player = fakePlayer(px, pz);
  const said: { npc: string; text: string; close: () => void }[] = [];
  const game = new GamePlay([co.table, dau.table], {
    scene: new THREE.Scene(),
    colliders: new Colliders(),
    player,
    face: () => {},
    groundAt: () => 0,
    say: (npc, text, close) => said.push({ npc, text, close }),
    learned: () => new Set(learned),
  });
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
    expect([player.position.x, player.position.z]).toEqual([-22, 35.1]);
    expect(game.active).toBe(true);
    expect(game.gomoku?.turn).toBe(BLACK);
  });

  it('R-GIAO-1: cách ghế 2,9 m → không phải bàn (Ngồi là ngồi thiền như cũ)', () => {
    const { game, player } = setup(-22, 38);
    expect(game.trySit()).toBe(false);
    expect(player.isSitting).toBe(false);
    expect(game.active).toBe(false);
  });

  it('R-GIAO-1: đặt 3 quân rồi đứng dậy → ván bỏ, bàn trống', () => {
    const { game, player, co } = setup(-22, 36);
    game.trySit();
    for (const x of [2, 6, 10]) {
      expect(game.playAt({ x, y: 2 })).toBe(true);
      npcThink(game);
    }
    expect(Array.from(co.state.stones).filter((c) => c !== 0)).toHaveLength(6);
    player.toggleSit(); // kéo cần điều khiển → đứng dậy (R-DIEU-7)
    game.update(0.016);
    expect(game.active).toBe(false);
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

  it('R-CO-3: người thắng → quân thắng sáng, Tiểu Mặc nói, đóng thoại → ván mới', () => {
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
    expect(last(said)).toMatchObject({ npc: 'tieu-mac', text: GAME_LINES.coThua });
    expect(game.playAt({ x: 0, y: 12 })).toBe(false); // đang nói — không nhận chạm
    last(said)?.close();
    expect(game.gomoku?.moves).toBe(0);
    expect(game.gomoku?.result).toBeNull();
    expect(game.playAt({ x: 6, y: 6 })).toBe(true); // người lại đi trước
    expect(player.isSitting).toBe(true);
  });

  it('R-CO-3: NPC thắng → "Ha, lần này đệ thắng rồi!"', () => {
    const { game, said } = setup(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    for (const y of [2, 3, 4, 5]) g.cells[y * 13 + 10] = WHITE;
    g.moves = 4;
    game.playAt({ x: 0, y: 0 }); // người đi chỗ không liên quan
    npcThink(game);
    expect(g.result?.winner).toBe(WHITE);
    expect(last(said)?.text).toBe(GAME_LINES.coThang);
  });
});

describe('Khu giao lưu — Đấu chữ', () => {
  it('R-DAU-1: chưa học bộ nào → Mặc Ông bảo tới Rừng trúc, không có ván', () => {
    const { game, said, dau } = setup(-22, 48);
    expect(game.trySit()).toBe(true);
    expect(last(said)).toMatchObject({ npc: 'su-phu', text: GAME_LINES.dauChuaHoc });
    expect(dau.state.card).toBeNull();
    expect(game.gomoku).toBeNull();
  });
});

/** Bàn cờ dài tâm (−34; 4), 3 chỗ ở x −36,2 / −34 / −31,8, không NPC đứng (ví dụ R-GIAO-1). */
function setupLong(px: number, pz: number) {
  const spec: GameTableSpec = { id: 'ban-co', kind: 'co', x: -34, z: 4, npc: 'tieu-mac', boards: 3, npcStand: false };
  const slots = [-36.2, -34, -31.8].map((x) => fakeSlot(spec, x, false));
  const player = fakePlayer(px, pz);
  const said: { npc: string; text: string; close: () => void }[] = [];
  const faced: number[] = [];
  const game = new GamePlay(
    slots.map((s) => s.table),
    host(player, said, [], faced),
  );
  return { game, player, slots, said, faced };
}

describe('Khu giao lưu — bàn dài nhiều ghế', () => {
  it('R-GIAO-1: đứng ở (−36,2; 6) bấm Ngồi → ngồi (−36,2; 5,1) nhìn bắc, ván ở chỗ x −36,2', () => {
    const { game, player, slots, faced } = setupLong(-36.2, 6);
    expect(game.trySit()).toBe(true);
    expect([player.position.x, player.position.z]).toEqual([-36.2, 5.1]);
    expect(last(faced)).toBe(Math.PI);
    game.playAt({ x: 6, y: 6 });
    expect(Array.from(slots[0].state.stones).filter((c) => c !== 0)).toHaveLength(1);
    expect(Array.from(slots[1].state.stones).every((c) => c === 0)).toBe(true);
  });

  it('R-GIAO-1: đứng ở (−34; 1,5) → ngồi ghế phía bắc (−34; 2,9), nhìn nam, camera từ phía bắc', () => {
    const { game, player, faced } = setupLong(-34, 1.5);
    expect(game.trySit()).toBe(true);
    expect([player.position.x, player.position.z]).toEqual([-34, 2.9]);
    expect(last(faced)).toBe(0);
    const cam = new THREE.PerspectiveCamera(55, 0.5);
    expect(game.placeCamera(cam)).toBe(true);
    expect(cam.position.z).toBeLessThan(4); // sau lưng người ngồi phía bắc
  });

  it('R-GIAO-1: cách ghế gần nhất 2,4 m → không phải bàn (ngồi thiền)', () => {
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
    expect(player.position.z).toBeCloseTo(9.9);
    expect(game.seatIndex).toBe(1);
  });
});

describe('Khu giao lưu — vào bàn bằng nút nổi', () => {
  it('R-NGOI-1 / R-GIAO-1: bấm "Vào bàn" cho ghế phía bắc chỗ x −34 → ngồi (−34; 2,9), ván bắt đầu ở chỗ đó', () => {
    const { game, player, slots, faced } = setupLong(-34, 1.5);
    const spots = game.seatSpots();
    expect(spots).toHaveLength(6);
    const spot = spots.find((s) => s.x === -34 && s.z === 2.9)!;
    expect(spot.kind).toBe('ban-choi');
    expect(game.sitAt(spot)).toBe(true);
    expect([player.position.x, player.position.z]).toEqual([-34, 2.9]);
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
