import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { GAME_LINES, GamePlay, type SeatablePlayer } from './gamePlay';
import { BLACK, WHITE } from './games/gomoku';
import type { BoardPoint, GameTable } from './scene/gameTable';
import type { GameTableSpec } from './scene/spec';

/** Bàn giả: ghi lại trạng thái cảnh nhận được (không cần canvas / WebGL). */
function fakeTable(spec: GameTableSpec) {
  const state = { stones: new Uint8Array(169) as ArrayLike<number>, glow: [] as readonly BoardPoint[], card: null as string | null };
  const table: GameTable = {
    spec,
    seat: { x: spec.x, y: 0, z: spec.z + 1.1, rotY: Math.PI },
    npcSpot: { x: spec.x, z: spec.z - 1.25, rotY: 0 },
    center: new THREE.Vector3(spec.x, 0.42, spec.z),
    angle: 0,
    top: new THREE.Mesh(),
    pointAt: () => null,
    setStones: (c) => (state.stones = Array.from(c)),
    highlight: (p) => (state.glow = p),
    showCard: (t) => (state.card = t),
  };
  return { table, state };
}

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
const npcThink = (game: GamePlay, player: SeatablePlayer): void => {
  for (let i = 0; i < 30; i++) game.update(0.05, player.position);
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
      npcThink(game, player);
    }
    expect(Array.from(co.state.stones).filter((c) => c !== 0)).toHaveLength(6);
    player.toggleSit(); // kéo cần điều khiển → đứng dậy (R-DIEU-7)
    game.update(0.016, player.position);
    expect(game.active).toBe(false);
    expect(Array.from(co.state.stones).every((c) => c === 0)).toBe(true);
  });
});

describe('Khu giao lưu — Ngũ Tử Kỳ', () => {
  it('R-CO-1: chạm lúc NPC đang nghĩ / ô đã có quân → không có gì', () => {
    const { game, player } = setup(-22, 36);
    game.trySit();
    game.playAt({ x: 6, y: 6 });
    expect(game.playAt({ x: 7, y: 7 })).toBe(false); // NPC đang nghĩ
    npcThink(game, player);
    expect(game.gomoku?.moves).toBe(2);
    expect(game.playAt({ x: 6, y: 6 })).toBe(false); // đã có quân
  });

  it('R-CO-2: NPC đáp sau 0,5–1 giây', () => {
    const { game, player } = setup(-22, 36);
    game.trySit();
    game.playAt({ x: 6, y: 6 });
    game.update(0.45, player.position);
    expect(game.gomoku?.moves).toBe(1);
    for (let i = 0; i < 12; i++) game.update(0.05, player.position);
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
    const { game, player, said } = setup(-22, 36);
    game.trySit();
    const g = game.gomoku!;
    for (const y of [2, 3, 4, 5]) g.cells[y * 13 + 10] = WHITE;
    g.moves = 4;
    game.playAt({ x: 0, y: 0 }); // người đi chỗ không liên quan
    npcThink(game, player);
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
