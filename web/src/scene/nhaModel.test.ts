import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';
import { LayeredGround } from '../collision/ground';

// canvas 2D giả (biển vẽ bằng canvas) — như ranhDong.test.ts
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { addHouseModel, waitHouses, HOUSE_WAIT_MS, fitToFrame, houseFrame, houseStandIn, windowGlow, NHA_MODEL_TUNE, HOUSE_STAND_IN } = await import('./nhaModel');
const { nhaOFront } = await import('./kien_truc/nha_o');
const { setLampMode } = await import('./materials');
const { loadScene } = await import('./loadSpec');
const { HOME_OF_PLAYER } = await import('./placeNames');
const { buildWorld } = await import('./world');

const home = loadScene(HOME_OF_PLAYER).spec;
const style = home.buildingStyle;
const nha = home.buildings.find((b) => b.kind === 'nha-o' && b.closed);
if (!nha) throw new Error('nha-ta.json: không có nhà kín nha-o');
const front = nhaOFront(nha, style);
const near = (a: THREE.Vector3, b: THREE.Vector3, tol = 0.01): boolean => a.distanceTo(b) <= tol;

describe('model nhà — khớp khung bản khối (V-88 NV3)', () => {
  const frame = houseFrame(nha, style);

  it('khung = thân + mái khối ∪ bậc đá: chân y 0, rộng ≥ mái chìa, trước tới hết bậc', () => {
    expect(frame.min.y).toBeCloseTo(0, 4);
    expect(frame.max.z).toBeCloseTo(front.stepZ + front.stepRun, 4);
    expect(frame.max.x - frame.min.x).toBeGreaterThan(nha.w + 1);
    expect(frame.max.y).toBeGreaterThan(front.plat + front.h + 1);
  });

  it('model thế (một lưới) co về đúng khung ±1 cm, không lệch dáng', () => {
    const { geometry, material } = houseStandIn(nha, style);
    const fit = fitToFrame(geometry, material, frame);
    const b = new THREE.Box3().setFromObject(fit.mesh);
    expect(near(b.min, frame.min) && near(b.max, frame.max)).toBe(true);
    expect(fit.skew).toBeLessThan(0.01);
    expect(fit.mesh).toBeInstanceOf(THREE.Mesh);
  });

  it('model sai tỉ lệ (cao gấp đôi, lệch tâm) vẫn trùng khung — co riêng từng trục, báo lệch dáng > 15 %', () => {
    const src = new THREE.BoxGeometry(4, 8, 2).translate(10, 3, -5);
    const before = Float32Array.from(src.getAttribute('position').array);
    const fit = fitToFrame(src, new THREE.MeshBasicMaterial(), frame);
    const b = new THREE.Box3().setFromObject(fit.mesh);
    expect(near(b.min, frame.min) && near(b.max, frame.max)).toBe(true);
    expect(fit.skew).toBeGreaterThan(NHA_MODEL_TUNE.skewWarn);
    expect(Float32Array.from(src.getAttribute('position').array)).toEqual(before);
  });

  it('yaw: model mặt tiền nhìn +x quay về +z trước khi co', () => {
    // hộp dài theo z (như nhà nằm ngang) → quay 90° thành dài theo x: co gần đều
    const src = new THREE.BoxGeometry(frame.max.z - frame.min.z, frame.max.y - frame.min.y, frame.max.x - frame.min.x);
    expect(fitToFrame(src, new THREE.MeshBasicMaterial(), frame).skew).toBeGreaterThan(0.15);
    expect(fitToFrame(src, new THREE.MeshBasicMaterial(), frame, { ...NHA_MODEL_TUNE, yaw: Math.PI / 2 }).skew).toBeLessThan(0.01);
  });

  it('tấm sáng: 2 ô đúng chỗ cửa sổ khối, một lưới, nhô trước mặt model, chỉ có khi ngày đêm', () => {
    const { geometry, material } = houseStandIn(nha, style);
    const fit = fitToFrame(geometry, material, frame);
    setLampMode(false);
    expect(windowGlow(fit.mesh, front)).toBeNull();
    setLampMode(true);
    const glow = windowGlow(fit.mesh, front);
    setLampMode(false);
    expect(glow).not.toBeNull();
    const g = glow as THREE.Mesh;
    expect(g.material).toMatchObject({ transparent: true, depthWrite: false, visible: false });
    expect((g.material as THREE.Material).userData.lampOpacity).toBeGreaterThan(0);
    g.geometry.computeBoundingBox();
    const bb = g.geometry.boundingBox as THREE.Box3;
    const [l, r] = front.windows;
    expect(bb.min.x).toBeCloseTo(l.x - l.w / 2, 3);
    expect(bb.max.x).toBeCloseTo(r.x + r.w / 2, 3);
    expect(bb.min.y).toBeCloseTo(l.y - l.h / 2, 3);
    // mặt ngoài giấy song khối ở z = d/2 − 0,11 + 0,04; tấm nhô glowLift trước mặt chạm tia
    expect(bb.max.z).toBeGreaterThan(nha.d / 2 - 0.11);
    expect(bb.max.z).toBeLessThan(nha.d / 2 + 0.1);
  });
});

describe('ghép cảnh — va chạm / mặt đi trùng bản khối (V-88 NV4)', () => {
  const build = (model?: string): { colliders: Colliders; world: ReturnType<typeof buildWorld>; scene: THREE.Scene } => {
    const spec = { ...home, buildings: home.buildings.map((b) => (b === nha && model ? { ...b, model } : b)) };
    const scene = new THREE.Scene();
    const colliders = new Colliders();
    return { colliders, world: buildWorld(scene, colliders, spec), scene };
  };
  const khoi = build();

  it('model thế: cùng hộp / cột va chạm, cùng mặt đi (nền + dốc), không thêm vật cản', async () => {
    const m = build(HOUSE_STAND_IN);
    const reports = await m.world.ready;
    expect(reports).toMatchObject([{ id: nha.id, source: 'the' }]);
    expect(m.colliders.boxes).toEqual(khoi.colliders.boxes);
    expect(m.colliders.circles).toEqual(khoi.colliders.circles);
    for (let x = nha.x - 6; x <= nha.x + 6; x += 0.5)
      for (let z = nha.z - 4; z <= nha.z + 5; z += 0.5) expect(m.world.surface.heightAt(x, z)).toBeCloseTo(khoi.world.surface.heightAt(x, z), 5);
    expect(m.world.surface).toBeInstanceOf(LayeredGround);
  });

  it('model thế: 1 lưới model thêm vào cảnh sau khi gộp, biển + đèn vẫn có (gộp chung cảnh)', async () => {
    const m = build(HOUSE_STAND_IN);
    const named = (s: THREE.Scene, n: string): number => {
      let k = 0;
      s.traverse((o) => void (o.name === n && k++));
      return k;
    };
    expect(named(m.scene, 'nha-model')).toBe(0);
    await m.world.ready;
    expect(named(m.scene, 'nha-model')).toBe(1);
  });

  it('thiếu file → bản khối ngay (ready xong, không có model)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const m = build('khong-co-file');
    expect(await m.world.ready).toEqual([]);
    expect(m.colliders.boxes).toEqual(khoi.colliders.boxes);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('không có model → ready xong ngay, rỗng', async () => {
    expect(await khoi.world.ready).toEqual([]);
  });

  it('addHouseModel thiếu file → null (nơi gọi dựng khối)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(addHouseModel(new THREE.Scene(), new Colliders(), { ...nha, model: 'khong-co' }, style)).toBeNull();
    warn.mockRestore();
  });
});

describe('màn tải chờ model nhà ≤ 2 s (V-88 NV5, Q4)', () => {
  it('hạn 2 s; xong trong hạn → true; treo → false đúng hạn; lỗi → không ném', async () => {
    expect(HOUSE_WAIT_MS).toBe(2000);
    expect(await waitHouses(Promise.resolve([]), 30)).toBe(true);
    expect(await waitHouses(Promise.reject(new Error('x')), 30)).toBe(true);
    const t = performance.now();
    expect(await waitHouses(new Promise(() => {}), 30)).toBe(false);
    expect(performance.now() - t).toBeGreaterThanOrEqual(25);
  });
});
