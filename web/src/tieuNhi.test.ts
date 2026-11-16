import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from './collision/colliders';
import { LayeredGround } from './collision/ground';
import type { MovingNpc } from './player/npc';
import { traLau, traLauLayout } from './scene/kien_truc/tra_lau';
import { addWalkIn } from './scene/rooms';
import { DEFAULT_SCENE, type BuildingSpec, type NpcSpec } from './scene/spec';
import { TIEU_NHI, TieuNhi } from './tieuNhi';
import { TEA_SAY } from './zones/teaService';

// biển hiệu vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => {}) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1.6 };
const b: BuildingSpec = { id: 'pham-minh-cac', kind: 'tra-lau', x: 37, z: -36, w: 19.2, d: 11.2, title: 'Trà lâu', roofColor: '#2b5446', rotY: 270 };
const SPEC: NpcSpec = { id: TIEU_NHI, x: 42.1, z: -36, rotY: 270 };
const { plat, yf } = traLauLayout(b, style);

function setup() {
  const colliders = new Colliders();
  const room = addWalkIn(new THREE.Scene(), colliders, b, style, traLau);
  const ground = new LayeredGround(null, room.pads);
  const root = new THREE.Object3D();
  root.position.set(SPEC.x, ground.heightAt(SPEC.x, SPEC.z), SPEC.z);
  const npc: MovingNpc = {
    id: TIEU_NHI,
    spec: SPEC,
    root,
    character: { root, facing: new THREE.Object3D(), animate: () => {} },
    motion: { mps: 0, sit: 0 },
    update: () => {},
  };
  npc.block = colliders.addCircle(SPEC.x, SPEC.z, 0.45);
  const chat: string[] = [];
  const t = TieuNhi.create([npc], [room.service!], { heightAt: (x, z, y) => ground.heightAt(x, z, y), colliders, chatSay: (_id, s) => chat.push(s) })!;
  return { t, npc, colliders, chat, seats: room.seats!, ground };
}

const FAR: [number, number] = [0, 0];
function run(t: TieuNhi, secs: number, player: [number, number] = FAR): void {
  for (let k = 0; k < Math.round(secs * 30); k++) t.update(1 / 30, player);
}
const blocked = (c: Colliders, n: MovingNpc): boolean => !!n.block && c.circles.includes(n.block);

describe('Ghép tiểu nhị mang trà (tieuNhi.ts — R-TRA-1)', () => {
  it('R-TRA-1: ngồi đôn tầng 1 → 2 s đứng quầy (có vật cản) → cầm ấm, nói "Có ngay…", rời quầy, gỡ vật cản', () => {
    const { t, npc, colliders, chat, seats } = setup();
    expect(t.canTalk).toBe(true);
    const i = seats.findIndex((s) => s.y < yf - 1);
    t.sit(seats[i]);
    run(t, 1.9);
    expect(npc.root.position.x).toBeCloseTo(SPEC.x, 6);
    expect(npc.root.position.z).toBeCloseTo(SPEC.z, 6);
    expect(blocked(colliders, npc)).toBe(true);
    expect(t.tea).toBe(false);
    run(t, 0.6);
    expect(chat).toEqual([TEA_SAY]);
    expect(npc.motion.hold).toBe('rot');
    expect(npc.motion.mps).toBeGreaterThan(2);
    expect(blocked(colliders, npc)).toBe(false);
    expect(t.canTalk).toBe(false);
    expect(Math.hypot(npc.root.position.x - SPEC.x, npc.root.position.z - SPEC.z)).toBeGreaterThan(0.5);
  });

  it('R-TRA-1: tới chỗ đứng rót → quay về chỗ ngồi, rót 2 s → có chén; về quầy → vật cản gắn lại, nhìn ra cửa, nói chuyện được', () => {
    const { t, npc, colliders, seats } = setup();
    const i = seats.findIndex((s) => s.y < yf - 1);
    t.sit(seats[i]);
    const stand = t.stops.seats[i]!;
    let k = 0;
    while (npc.motion.work === undefined && k++ < 30 * 20) run(t, 1 / 30);
    expect(npc.root.position.x).toBeCloseTo(stand.stand[0], 4);
    expect(npc.root.position.z).toBeCloseTo(stand.stand[1], 4);
    expect(npc.root.position.y).toBeCloseTo(plat, 5);
    expect(npc.motion.mps).toBe(0);
    expect(t.tea).toBe(false);
    run(t, 1.5);
    const dYaw = npc.character.facing.rotation.y - stand.face;
    expect(Math.abs(Math.atan2(Math.sin(dYaw), Math.cos(dYaw)))).toBeLessThan(0.05); // quay về chỗ ngồi
    run(t, 0.6);
    expect(t.tea).toBe(true);
    expect(npc.motion.work).toBeUndefined();
    run(t, 15);
    expect(npc.root.position.x).toBeCloseTo(SPEC.x, 6);
    expect(blocked(colliders, npc)).toBe(true);
    expect(t.canTalk).toBe(true);
    expect(npc.motion.hold).toBeUndefined();
    run(t, 1);
    expect(npc.character.facing.rotation.y).toBeCloseTo(((270 - 360) * Math.PI) / 180, 3); // nhìn tây (ra cửa)
    expect(t.tea).toBe(true);
    t.stand();
    expect(t.tea).toBeNull();
  });

  it('R-TRA-1: chỗ tầng 2 → lên thang tới đúng tầng 2; đứng dậy giữa thang → quay xuống về quầy, không có chén', () => {
    const { t, npc, colliders, seats } = setup();
    const i = seats.findIndex((s) => s.hold === 'lan-can');
    t.sit(seats[i]);
    let top = 0;
    for (let k = 0; k < 30 * 40 && npc.motion.work === undefined; k++) {
      run(t, 1 / 30);
      top = Math.max(top, npc.root.position.y);
    }
    expect(top).toBeCloseTo(yf, 5);
    expect(npc.root.position.y).toBeCloseTo(yf, 5);
    // lần ngồi khác: đứng dậy khi đang trên thang
    run(t, 2.1);
    t.stand();
    run(t, 30);
    t.sit(seats[i]);
    let mid = false;
    for (let k = 0; k < 30 * 40 && !mid; k++) {
      run(t, 1 / 30);
      const y = npc.root.position.y;
      mid = y > 1.5 && y < yf - 1;
    }
    expect(mid).toBe(true);
    t.stand();
    run(t, 0.5);
    expect(npc.root.position.y).toBeLessThan(yf - 1);
    run(t, 30);
    expect(npc.root.position.x).toBeCloseTo(SPEC.x, 6);
    expect(npc.root.position.y).toBeCloseTo(plat, 5);
    expect(blocked(colliders, npc)).toBe(true);
  });

  it('R-TRA-1: chỗ ngồi ngoài trà lâu → tiểu nhị không đi, chén như cũ (null)', () => {
    const { t, npc } = setup();
    t.sit({});
    run(t, 5);
    expect(npc.root.position.x).toBeCloseTo(SPEC.x, 6);
    expect(t.tea).toBeNull();
  });

  it('R-TRA-1: đang về mà người chơi đứng chắn ngay trước mặt → đứng chờ', () => {
    const { t, npc, seats } = setup();
    const i = seats.findIndex((s) => s.y < yf - 1);
    t.sit(seats[i]);
    run(t, 4);
    t.stand();
    run(t, 0.5);
    const p = npc.root.position.clone();
    const yaw = npc.character.facing.rotation.y;
    const before: [number, number] = [p.x + Math.sin(yaw) * 0.8, p.z + Math.cos(yaw) * 0.8];
    run(t, 1, before);
    expect(npc.root.position.distanceTo(p)).toBeLessThan(0.1);
    expect(npc.motion.mps).toBe(0);
  });
});
