import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from './collision/colliders';
import { GardenWork } from './gardenWork';
import type { Character } from './player/character';
import { PlayerController } from './player/controller';
import { loadScene } from './scene/loadSpec';
import { addGarden } from './scene/vuonLuong';
import { freshGarden } from './zones/vuon';

/**
 * Chạm luống ở vườn không rào (R-VUON-2, V-82): trong vườn → vòng mở ngay; ngoài vườn mà ≤ 25 m → nhân vật tự đi tới mép luống rồi
 * vòng mở; joystick giữa đường → huỷ; đi ra khỏi vườn → vòng đóng.
 */
const spec = loadScene('nha-ta').spec;

function setup(x: number, z: number): { work: GardenWork; player: PlayerController } {
  const colliders = new Colliders();
  const garden = addGarden(new THREE.Scene(), colliders, spec.garden, spec.look);
  const root = new THREE.Object3D();
  const facing = new THREE.Object3D();
  root.add(facing);
  const character = { root, facing, animate: () => {} } as unknown as Character;
  const player = new PlayerController(character, colliders);
  player.position.set(x, 0, z);
  const work = new GardenWork({
    garden,
    player,
    character,
    spec: spec.garden,
    sound: null,
    state: () => freshGarden(),
    now: () => 0,
    speed: () => 1,
    act: async () => null,
    harvested: () => {},
    float: () => {},
    reason: () => {},
    unlock: () => {},
  });
  return { work, player };
}

/** Chạy [seconds] giây: nhân vật + vòng vườn; [input] = joystick. */
function run(s: { work: GardenWork; player: PlayerController }, seconds: number, input = { x: 0, y: 0 }): void {
  for (let i = 0; i < seconds * 60; i++) {
    s.player.update(1 / 60, input, 0, false);
    s.work.update(1 / 60, s.player.position, false, []);
  }
}

const plot = (id: string) => spec.garden.plots.find((p) => p.id === id)!;

describe('chạm luống ở vườn không rào (R-VUON-2, V-82)', () => {
  it('R-VUON-2: đứng trên lối trục giữa vườn chạm luống 1 → vòng mở ngay, không đi', () => {
    const s = setup(0, 1);
    run(s, 0.1);
    expect(s.work.picks).toBe(true);
    expect(s.work.tapAt(plot('o-1'))).toBe(true);
    expect(s.work.ring()?.plot).toBe('o-1');
    expect(s.player.moveTarget).toBeNull();
  });

  it('R-VUON-2: ở chỗ xuất hiện (0; 6,5) chạm luống 11 (−6; −2,6) → tự đi tới mép luống rồi vòng mở', () => {
    const s = setup(0, 6.5);
    run(s, 0.1);
    expect(s.work.inFence).toBe(false);
    expect(s.work.tapAt(plot('o-11'))).toBe(true);
    expect(s.work.ring()).toBeNull(); // chưa mở — đang đi
    run(s, 6);
    expect(s.work.ring()?.plot).toBe('o-11');
    expect(Math.hypot(s.player.position.x + 6, s.player.position.z + 2.6)).toBeLessThan(1.6);
  });

  it('R-VUON-2: chạm luống rồi kéo joystick giữa đường → dừng, vòng không mở', () => {
    const s = setup(0, -7);
    run(s, 0.1);
    s.work.tapAt(plot('o-2'));
    run(s, 0.4);
    run(s, 0.3, { x: 1, y: 0 });
    run(s, 5);
    expect(s.work.ring()).toBeNull();
  });

  it('R-VUON-2: cách luống > 25 m → chạm không mở vòng (đi như thường); vòng đang mở, đi ra khỏi vườn → đóng', () => {
    const far = setup(20, -12);
    run(far, 0.1);
    expect(far.work.tapAt(plot('o-11'))).toBe(false);
    expect(far.player.moveTarget).toBeNull();
    const s = setup(0, 1);
    run(s, 0.1);
    s.work.tapAt(plot('o-1'));
    expect(s.work.ring()).not.toBeNull();
    s.player.moveTarget = new THREE.Vector3(0, 0, -7); // chạm sân trước nhà → đi ra khỏi vườn
    run(s, 4);
    expect(s.work.ring()).toBeNull();
  });
});
