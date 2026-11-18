import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';
import { addPlasterWalls } from './kien_truc/tuong';
import { arrivalFor, checkPortals, portalRect } from './portals';
import { DEFAULT_SCENE, type PortalSpec } from './spec';
import { resolveSceneSpec } from './specCheck';
import { addPortalMarkers, markerRadius } from './vongCong';
import townRaw from '../../../design/scene/scene.json';
import rungRaw from '../../../design/scene/rung-truc.json';

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

  it('R-HANH-4 (V-81): đứng trong vùng cổng → chữ nổi ẩn (nút "Về nhà" thay); bước ra → chữ hiện lại', () => {
    const scene = new THREE.Scene();
    const tick = addPortalMarkers(scene, [HOME], DEFAULT_SCENE.teleport.colors, () => 0);
    const sprite = scene.children.find((o) => o instanceof THREE.Sprite)!;
    tick(0.1, { x: 0, z: 48 });
    expect(sprite.visible).toBe(true);
    tick(0.1, { x: 0, z: 54 });
    expect(sprite.visible).toBe(false);
    tick(0.1, { x: 0, z: 48 });
    expect(sprite.visible).toBe(true);
  });

  it('R-HANH-4: cổng không nhãn (cảnh cũ) → không dựng gì, cổng chỉ là vùng chạm', () => {
    const scene = new THREE.Scene();
    addPortalMarkers(scene, [{ ...HOME, label: undefined }], DEFAULT_SCENE.teleport.colors);
    expect(scene.children).toEqual([]);
  });

  it('R-HANH-4: cửa nhà chính ↔ gian trong (`marker: false`, V-68) → không vòng sáng, không chữ nổi', () => {
    const scene = new THREE.Scene();
    addPortalMarkers(scene, [{ ...HOME, scene: 'nha-ta-trong', label: 'Vào nhà', marker: false }], DEFAULT_SCENE.teleport.colors);
    expect(scene.children).toEqual([]);
  });

  it('R-NHA-1 (V-96): cửa nhà chính có `ring` → vòng sáng nhỏ bán kính `ring` (nhỏ hơn vòng cổng), không chữ nổi', () => {
    const scene = new THREE.Scene();
    const door: PortalSpec = { scene: 'nha-ta-trong', area: { from: [-15.75, -4.15], to: [-14.25, -2.65] }, arrive: { at: [-15, -2.6], rotY: 0 }, label: 'Vào nhà', marker: false, via: 'nut', ring: 0.75 };
    const tick = addPortalMarkers(scene, [door], DEFAULT_SCENE.teleport.colors, () => 0);
    expect(scene.children.some((o) => o instanceof THREE.Sprite)).toBe(false);
    const disc = scene.children.find((o) => o instanceof THREE.Mesh && o.geometry.type === 'PlaneGeometry') as THREE.Mesh;
    expect(disc.position.x).toBeCloseTo(-15, 6);
    expect(disc.position.z).toBeCloseTo(-3.4, 6);
    expect((disc.geometry as THREE.PlaneGeometry).parameters.width).toBeCloseTo(1.5);
    expect(0.75).toBeLessThan(markerRadius(HOME));
    tick(0.5);
    expect(scene.children.length).toBe(3); // đĩa + màn sáng + hạt
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
  it('R-HANH-2: mặc định tắt (cảnh vùng xuất hiện ở chỗ xuất phát của vùng); Khởi Nguyên Trấn bật, xuất phát (0; 48) ngay trong cổng', () => {
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

describe('cặp cổng trấn ↔ Thung Trúc Gió Hát (V-57)', () => {
  const town = resolveSceneSpec(townRaw).spec;
  const rung = resolveSceneSpec(rungRaw).spec;
  it('R-HANH-4: vòng "Thung Trúc Gió Hát" cuối trục đông – tây (41,2; 4) nối cuối lối lát, ↔ vòng "Khởi Nguyên Trấn" đầu lối tây Thung Trúc Gió Hát (V-66)', () => {
    const toRung = town.portals.find((p) => p.scene === 'rung-truc')!;
    expect(toRung.label).toBe('Thung Trúc Gió Hát');
    expect(markerRadius(toRung)).toBeCloseTo(1.2);
    const r = portalRect(toRung);
    expect((r.minX + r.maxX) / 2).toBeCloseTo(41.2);
    expect((r.minZ + r.maxZ) / 2).toBeCloseTo(4);
    // vòng nối ngay cuối lối lát (trục rộng 5 m tới x 39,7 — không kéo lối: lối lát san phẳng sườn núi, mở lối ra ngoài
    // hàng trúc — ranhDong.test.ts), trong khe hàng trúc mép đông (z 0 … 8), không chứa cây nào
    const axis = town.paths.find((p) => p.from[1] === 4 && p.to[1] === 4 && p.width === 5)!;
    expect(r.minX - axis.to[0]).toBeGreaterThanOrEqual(0);
    expect(r.minX - axis.to[0]).toBeLessThan(0.5);
    expect(r.maxX).toBeLessThanOrEqual(42.4);
    for (const t of town.trees.yard) expect(t.x >= r.minX - 1 && t.x <= r.maxX + 1 && t.z >= r.minZ - 1 && t.z <= r.maxZ + 1).toBe(false);
    const back = rung.portals.find((p) => p.scene === 'tong-mon')!;
    expect(back.label).toBe('Khởi Nguyên Trấn');
    expect(checkPortals(town)).toEqual([]);
    expect(checkPortals(rung)).toEqual([]);
  });

  it('R-HANH-4: từ Thung Trúc Gió Hát đi bộ về → đứng (38,6; 4) trước vòng, nhìn tây vào trấn (không phải cổng trấn dù `arriveAtStart`); từ trấn sang → đứng (−44,5; 4) trên lối tây cạnh vòng về, nhìn đông vào lối trúc (V-66)', () => {
    expect(arrivalFor(town.portals, 'rung-truc')).toEqual({ at: [38.6, 4], rotY: (3 * Math.PI) / 2 });
    expect(arrivalFor(rung.portals, 'tong-mon')).toEqual({ at: [-44.5, 4], rotY: Math.PI / 2 });
    // Trúc Lâm không còn vòng trận (V-65); V-66: vòng về trấn ở đầu lối tây (mép tây), xa sân đá trống bãi hạc
    expect(rung.teleport.enabled).toBe(false);
    expect(Math.hypot(-44.5 - rung.stoneYard.center[0], 4 - rung.stoneYard.center[1])).toBeGreaterThan(rung.stoneYard.radius);
  });
});
