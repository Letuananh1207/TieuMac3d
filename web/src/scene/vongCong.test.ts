import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';
import { addPlasterWalls } from './kien_truc/tuong';
import { DEFAULT_SCENE, type PortalSpec } from './spec';
import { resolveSceneSpec } from './specCheck';
import { addPortalMarkers, markerRadius } from './vongCong';
import townRaw from '../../../design/scene/scene.json';

// nhãn / đĩa vẽ bằng canvas 2D: Node không có — canvas giả, mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

const HOME: PortalSpec = { scene: 'nha-ta', area: { from: [-1.8, 52.8], to: [1.8, 55.2] }, arrive: { at: [0, 48], rotY: 180 }, label: 'Về nhà' };

describe('vòng cổng "Về nhà" (V-39)', () => {
  it('R-HANH-4: cổng có nhãn → vòng sáng nhỏ ở tâm vùng chạm (≤ 1,2 m, nhỏ hơn vòng trận 4 m) + nhãn nổi phía trên', () => {
    expect(markerRadius(HOME)).toBe(1.2);
    expect(markerRadius({ area: { from: [0, 0], to: [1.6, 3] } })).toBeCloseTo(0.8);
    const scene = new THREE.Scene();
    const tick = addPortalMarkers(scene, [HOME], DEFAULT_SCENE.teleport.colors, () => 0);
    const sprite = scene.children.find((o) => o instanceof THREE.Sprite)!;
    expect(sprite.position.x).toBe(0);
    expect(sprite.position.z).toBe(54);
    expect(sprite.position.y).toBeGreaterThan(2);
    const disc = scene.children.find((o) => o instanceof THREE.Mesh && o.geometry.type === 'PlaneGeometry') as THREE.Mesh;
    expect(disc.position.z).toBe(54);
    tick(0.5); // thở sáng, hạt bay — không lỗi
    expect(scene.children.length).toBe(4);
  });

  it('R-HANH-4: cổng không nhãn (cảnh cũ) → không dựng gì, cổng chỉ là vùng chạm', () => {
    const scene = new THREE.Scene();
    addPortalMarkers(scene, [{ ...HOME, label: undefined }], DEFAULT_SCENE.teleport.colors);
    expect(scene.children).toEqual([]);
  });

  it('R-HUD-4: nhãn cổng dài quá 20 ký tự → scene:check báo; nhãn có chữ Hán → báo', () => {
    const long = resolveSceneSpec({ portals: [{ ...HOME, label: 'Về nhà của ta ở dưới chân núi' }] }).problems.join('\n');
    expect(long).toContain('portals[0].label');
    const han = resolveSceneSpec({ portals: [{ ...HOME, label: '歸家' }] }).problems.join('\n');
    expect(han).toContain('R-HUD-4');
  });
});

describe('cổng mái ngói bỏ mái (`roof: false`, V-39)', () => {
  const topOf = (roof?: boolean): number => {
    const scene = new THREE.Scene();
    const walls = { ...DEFAULT_SCENE.walls, enabled: true, style: 'voi' as const, gates: [{ side: 'nam' as const, at: 0, width: 9.6, kind: 'lau' as const, clearHeight: 4, roof }] };
    addPlasterWalls(scene, new Colliders(), walls, [], DEFAULT_SCENE.buildingStyle);
    // chỉ phần quanh cổng nam (|x| < 6, z ≈ half)
    const box = new THREE.Box3();
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const b = new THREE.Box3().setFromObject(m);
      const c = b.getCenter(new THREE.Vector3());
      if (Math.abs(c.x) < 6 && Math.abs(c.z - walls.half) < 2) box.union(b);
    });
    return box.max.y;
  };

  it('R-VA-1: cổng nam bỏ mái ngói → đỉnh cổng thấp hơn (chỉ chụp mái tường nhỏ), lối đi giữ nguyên; thiếu `roof` = có mái như cũ', () => {
    const withRoof = topOf();
    expect(topOf(true)).toBeCloseTo(withRoof);
    expect(topOf(false)).toBeLessThan(withRoof - 0.3);
  });

  it('R-VA-1: `roof: false` chỉ dùng với cổng mái ngói `lau`', () => {
    const { problems } = resolveSceneSpec({ walls: { gates: [{ side: 'nam', at: 0, width: 6.4, kind: 'trang', roof: false }] } });
    expect(problems.join('\n')).toContain('roof: chỉ dùng với kind "lau"');
  });
});

describe('chỗ xuất phát luôn ở cổng trấn (`player.arriveAtStart`, V-39)', () => {
  it('R-HANH-2: mặc định tắt (cảnh vùng giữ chỗ xuất hiện cạnh vòng trận); Khởi Nguyên Trấn bật, xuất phát (0; 48) ngay trong cổng', () => {
    expect(DEFAULT_SCENE.player.arriveAtStart).toBe(false);
    expect(resolveSceneSpec({ player: { start: [1, 2] } }).spec.player.arriveAtStart).toBe(false);
    const town = resolveSceneSpec(townRaw).spec;
    expect(town.player).toEqual({ start: [0, 48], arriveAtStart: true });
    const gate = town.gates.find((g) => g.id === 'cong-xuong-nui')!;
    expect([gate.z, gate.height]).toEqual([51, 8]);
    // về từ Nhà ta cũng đứng ở cổng, nhìn bắc vào trấn; vòng "Về nhà" ngoài cổng
    expect(town.portals[0]).toMatchObject({ arrive: { at: [0, 48], rotY: 180 }, label: 'Về nhà' });
  });
});
