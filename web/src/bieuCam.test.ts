import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { EMOTES, emoteBubbleLook, emoteByDigit, emoteById } from './zones/bieuCam';
import { emotePose, emoteWeight } from './player/bieuCamDang';
import type { Character, CharacterState } from './player/character';
import { BOW_TIME, PlayerController } from './player/controller';

/** nhân vật giả: chỉ ghi lại trạng thái khung cuối */
function rig(): { player: PlayerController; last: () => CharacterState | undefined } {
  const root = new THREE.Group();
  const facing = new THREE.Group();
  root.add(facing);
  let last: CharacterState | undefined;
  const ch: Character = { root, facing, animate: (_dt, _s, st) => void (last = st && { ...st, emote: st.emote && { ...st.emote } }) };
  return { player: new PlayerController(ch, new Colliders()), last: () => last };
}
const still = { x: 0, y: 0 };
const run = (p: PlayerController, seconds: number, input = still): void => {
  for (let t = 0; t < seconds - 1e-9; t += 1 / 60) p.update(1 / 60, input, 0, false);
};
const play = (p: PlayerController, id: string): boolean => {
  const e = emoteById(id);
  if (!e) throw new Error(id);
  return p.emote(e.id, e.seconds, e.sits);
};

describe('dáng biểu cảm (bieuCamDang)', () => {
  it('R-BIEU-2: mỗi biểu cảm có dáng (trừ Chắp tay = Chào, Ngồi nghỉ = dáng ngồi); vào / ra mượt; Nhảy mừng chỉ nâng ≤ 0,25 m', () => {
    for (const e of EMOTES) {
      const pose = emotePose(e.id, 0.8, e.seconds);
      if (e.asBow || e.sits) expect(pose, e.id).toBeNull();
      else expect(pose?.w, e.id).toBe(1);
    }
    expect(emoteWeight(0, 1.8)).toBe(0);
    expect(emoteWeight(1.8, 1.8)).toBe(0);
    expect(emoteWeight(0.9, 1.8)).toBe(1);
    let top = 0;
    for (let t = 0; t <= 1.6; t += 0.01) top = Math.max(top, emotePose('nhay-mung', t, 1.6)?.lift ?? 0);
    expect(top).toBeGreaterThan(0.2);
    expect(top).toBeLessThanOrEqual(0.25);
    expect(emotePose('khong-co', 1, 2)).toBeNull();
  });
});

describe('biểu cảm (R-BIEU-2)', () => {
  it('R-BIEU-2: 8 biểu cảm, tên tiếng Việt, thời lượng; Chắp tay = Chào; Ngồi nghỉ giữ', () => {
    expect(EMOTES.map((e) => e.name)).toEqual(['Vẫy tay', 'Chắp tay', 'Cúi chào', 'Vỗ tay', 'Cười', 'Nhảy mừng', 'Suy nghĩ', 'Ngồi nghỉ']);
    expect(EMOTES.map((e) => e.seconds)).toEqual([1.8, 1.6, 2, 1.6, 1.8, 1.6, 2.5, Infinity]);
    expect(emoteById('chap-tay')?.asBow).toBe(true);
    expect(emoteById('chap-tay')?.seconds).toBe(BOW_TIME);
    expect(EMOTES.filter((e) => e.sits).map((e) => e.id)).toEqual(['ngoi-nghi']);
    for (const e of EMOTES) expect(e.name).not.toMatch(/\p{Script=Han}/u); // R-HUD-4
    expect(emoteByDigit(1)?.id).toBe('vay-tay');
    expect(emoteByDigit(8)?.id).toBe('ngoi-nghi');
    expect(emoteByDigit(9)).toBeNull();
    expect(emoteByDigit(0)).toBeNull();
  });

  it('R-BIEU-2: diễn một lần theo thời lượng rồi về dáng đứng', () => {
    const { player, last } = rig();
    expect(play(player, 'suy-nghi')).toBe(true);
    run(player, 2.4);
    expect(last()?.emote?.id).toBe('suy-nghi');
    run(player, 0.2);
    expect(last()?.emote).toBeUndefined();
    expect(player.emoting).toBe(false);
  });

  it('R-BIEU-2: chọn Suy nghĩ, giây thứ 1 kéo joystick → thôi ngay, đi', () => {
    const { player, last } = rig();
    play(player, 'suy-nghi');
    run(player, 1);
    run(player, 1 / 60, { x: 0, y: -1 });
    expect(last()?.emote).toBeUndefined();
    expect(last()?.mps).toBeGreaterThan(0);
  });

  it('R-BIEU-2: Ngồi nghỉ → ngồi xếp bằng, 10 s sau vẫn ngồi, không tính là Ngồi ôn; kéo joystick → đứng dậy đi', () => {
    const { player, last } = rig();
    play(player, 'ngoi-nghi');
    run(player, 10);
    expect(last()?.emote?.id).toBe('ngoi-nghi');
    expect(last()?.sit).toBeGreaterThan(0.95);
    expect(player.isSitting).toBe(false); // không cuộn sách, không học (R-ON-8)
    run(player, 1 / 60, { x: 0, y: -1 });
    expect(player.emoting).toBe(false);
    run(player, 1);
    expect(last()?.sit).toBeLessThan(0.05);
  });

  it('R-BIEU-2: đang Vỗ tay chọn Cười → đổi ngay; nhảy / Chào / Ngồi ôn → thôi', () => {
    const { player, last } = rig();
    play(player, 'vo-tay');
    run(player, 0.5);
    play(player, 'cuoi');
    run(player, 1 / 60);
    expect(last()?.emote?.id).toBe('cuoi');
    expect(last()?.emote?.t).toBeLessThan(0.1);
    player.jump();
    expect(player.emoting).toBe(false);
    run(player, 1);
    play(player, 'vay-tay');
    player.bow();
    expect(player.emoting).toBe(false);
    expect(player.isBowing).toBe(true);
    run(player, 2);
    play(player, 'vay-tay');
    player.toggleSit();
    expect(player.emoting).toBe(false);
    expect(player.isSitting).toBe(true);
  });

  it('R-BIEU-2: đang ngồi / đang nhảy → không diễn; sau biểu cảm đếm đứng lâu lại từ 0 (R-DIEU-8)', () => {
    const { player, last } = rig();
    player.toggleSit();
    expect(play(player, 'vay-tay')).toBe(false);
    player.toggleSit();
    player.jump();
    expect(play(player, 'vay-tay')).toBe(false);
    run(player, 3);
    expect(last()?.idle).toBeGreaterThan(1);
    play(player, 'cuoi');
    run(player, 1);
    expect(last()?.idle).toBe(0);
    run(player, 1.5);
    expect(last()?.idle).toBeLessThan(1);
  });
});

describe('bong bóng hình (R-BIEU-1/3)', () => {
  it('R-BIEU-3: chỉ 5 biểu cảm có bóng — Chắp tay, Cúi chào, Ngồi nghỉ chỉ diễn', () => {
    expect(EMOTES.filter((e) => e.bubble).map((e) => e.id)).toEqual(['vay-tay', 'vo-tay', 'cuoi', 'nhay-mung', 'suy-nghi']);
  });

  it('R-BIEU-1: phóng 90 → 100 % trong 0,15 s, giữ tới 2,5 s, mờ 0,4 s rồi tắt', () => {
    expect(emoteBubbleLook(0, false)).toEqual({ opacity: 1, scale: 0.9 });
    expect(emoteBubbleLook(0.15, false)?.scale).toBeCloseTo(1);
    expect(emoteBubbleLook(2.5, false)?.opacity).toBe(1);
    expect(emoteBubbleLook(2.7, false)?.opacity).toBeCloseTo(0.5);
    expect(emoteBubbleLook(2.9, false)).toBeNull();
    expect(emoteBubbleLook(-1, false)).toBeNull();
  });

  it('R-BIEU-3: giảm chuyển động → hiện / tắt không phóng to', () => {
    expect(emoteBubbleLook(0, true)?.scale).toBe(1);
    expect(emoteBubbleLook(2.7, true)?.scale).toBe(1);
  });
});
