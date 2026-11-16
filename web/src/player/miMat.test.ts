import { readFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { MatModel, MatMot } from './matLuoi';
import { createMiMat, mauVong, miUv, timMat, tuyenTinh } from './miMat';

const NU = 9;
/** Lưới bề mặt phẳng z = 0,1 trên ô [x0, x0 + 0,2] × [0, 0,2] (khung xương đầu), y giảm theo hàng. */
const mot = (x0: number): MatMot => ({
  g: Array.from({ length: NU * NU }, (_, k) => [x0 + ((k % NU) / (NU - 1)) * 0.2, 0.2 - (Math.floor(k / NU) / (NU - 1)) * 0.2, 0.1]).flat(),
  e: [0.5, 0.5, 0.4, 0.4],
  vong: Array.from({ length: 16 }, () => '#ebc5b2'),
  mi: '#3c231e',
});
const DATA: Record<string, MatModel> = { 'nhan-vat': { dinh: 3, nu: NU, nv: NU, mat: [mot(-0.3), mot(0.1)] } };

/** Model giả: xương Head + lưới da 3 đỉnh, vật liệu không-sáng có texture. */
function modelGia(dinh = 3): { model: THREE.Group; head: THREE.Bone } {
  const model = new THREE.Group();
  const head = new THREE.Bone();
  head.name = 'mixamorigHead';
  head.position.set(0, 1.6, 0);
  model.add(head);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dinh * 3), 3));
  const skin = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.Texture() }));
  model.add(skin);
  return { model, head };
}

describe('Mí mắt gắn xương đầu (R-MAT-1)', () => {
  it('R-MAT-1: mí gắn xương Head, lúc mở ẩn (không thêm draw call), khép thì hiện; theo đầu khi quay / gật', () => {
    const { model, head } = modelGia();
    const mi = createMiMat(model, head, '/assets/nhan-vat-Ab12Cd34.glb', DATA)!;
    expect(mi).not.toBeNull();
    expect(mi.mesh.parent).toBe(head);
    expect(mi.mesh.visible).toBe(false);
    const mat = mi.mesh.material as THREE.MeshBasicMaterial;
    expect(mat).toBeInstanceOf(THREE.MeshBasicMaterial); // không-sáng như mặt → apGio nhuộm đêm như mặt
    expect(mat.map).toBeNull();
    expect(mat.vertexColors).toBe(true);
    expect(mat.polygonOffset).toBe(true);
    expect(mi.mesh.geometry.index!.count / 3).toBeLessThanOrEqual(160); // ~150 tam giác hai mắt
    mi.dat(1, 0);
    expect(mi.mesh.visible).toBe(true);
    const pos = mi.mesh.geometry.getAttribute('position');
    const p0 = new THREE.Vector3().fromBufferAttribute(pos, 10);
    expect(p0.z).toBeCloseTo(0.1, 5); // nằm trên lưới bề mặt
    // đầu quay 90°: điểm mí quay theo (toạ độ thế giới đổi, toạ độ trong xương đầu giữ nguyên)
    model.updateMatrixWorld(true);
    const w1 = p0.clone().applyMatrix4(mi.mesh.matrixWorld);
    head.rotation.y = Math.PI / 2;
    model.updateMatrixWorld(true);
    const w2 = p0.clone().applyMatrix4(mi.mesh.matrixWorld);
    expect(w2.distanceTo(w1)).toBeGreaterThan(0.05);
    expect(w2.x).toBeCloseTo(0.1, 5); // z 0,1 quay thành x 0,1
    mi.dat(0, 0);
    expect(mi.mesh.visible).toBe(false);
  });

  it('R-MAT-1: số đỉnh lệch (model đã thay, chưa dò lại) / không có số đo → không chớp (null, không lỗi)', () => {
    const { model, head } = modelGia(4);
    expect(createMiMat(model, head, '/x/nhan-vat.glb', DATA)).toBeNull();
    const b = modelGia();
    expect(createMiMat(b.model, b.head, '/x/nhan-vat.glb', {})).toBeNull();
    expect(timMat({ a: { ...DATA['nhan-vat'] }, 'nhan-vat': DATA['nhan-vat'] }, '/assets/nhan-vat-x1.glb', 3)).toBe(DATA['nhan-vat']);
  });

  it('R-MAT-1: khép dần — mép mí trên đi xuống, viền mi tối ở mép, khép hẳn phủ tới đáy elip; híp cong: mí dưới đẩy lên', () => {
    const e: MatMot['e'] = [0.5, 0.5, 0.4, 0.4];
    const giua = 3; // cột giữa
    const mep = (a: number): number => miUv(e, giua, 5, a, 0)[1];
    expect(mep(0)).toBeCloseTo(0.5 - 0.4 * 1.12, 5);
    expect(mep(0.5)).toBeGreaterThan(mep(0.2));
    expect(mep(1)).toBeCloseTo(0.5 + 0.4 * 1.08, 5);
    expect(miUv(e, giua, 4, 1, 0)[1]).toBeLessThan(mep(1)); // viền mi có bề dày
    // híp cong: mí dưới (hàng 6) lên sát mép mí trên; tổng hai mí không quá 1
    const [, duoiV] = miUv(e, giua, 6, 0.22, 0.78);
    expect(duoiV).toBeCloseTo(miUv(e, giua, 5, 0.22, 0.78)[1], 5);
    expect(miUv(e, giua, 6, 0.6, 0.9)[1]).toBeGreaterThanOrEqual(miUv(e, giua, 5, 0.6, 0.9)[1]);
  });

  it('R-MAT-1: màu mí = màu da quanh mắt (đổi sRGB → tuyến tính), nội suy theo hướng', () => {
    const c = tuyenTinh('#ffffff');
    expect(c).toEqual([1, 1, 1]);
    expect(tuyenTinh('#808080')[0]).toBeCloseTo(0.2158, 3);
    const vong = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]];
    expect(mauVong(vong, [0.5, 0.5, 0.4, 0.4], 0.9, 0.5)).toEqual([1, 0, 0]); // bên phải = hướng 0
    expect(mauVong(vong, [0.5, 0.5, 0.4, 0.4], 0.5, 0.9)[1]).toBeCloseTo(1, 5); // phía dưới = hướng 1
  });
});

describe('Số đo mắt design/models/mat.json (R-MAT-1)', () => {
  it('R-MAT-1: mỗi mục khớp số đỉnh model hiện tại (thay model mà quên `npm run model:mat` → đỏ)', async () => {
    const url = new URL('../../../design/models/', import.meta.url);
    const data = JSON.parse(readFileSync(new URL('mat.json', url), 'utf8')) as Record<string, MatModel | string>;
    await MeshoptDecoder.ready;
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
    const ten = Object.keys(data).filter((k) => typeof data[k] === 'object');
    expect(ten.length).toBeGreaterThanOrEqual(5);
    for (const k of ten) {
      const doc = await io.read(decodeURIComponent(new URL(`${k}.glb`, url).pathname).replace(/^\/([A-Z]:)/, '$1'));
      const n = doc.getRoot().listMeshes()[0].listPrimitives()[0].getAttribute('POSITION')!.getCount();
      expect(`${k}: ${n}`).toBe(`${k}: ${(data[k] as MatModel).dinh}`);
      expect((data[k] as MatModel).mat).toHaveLength(2);
    }
  }, 30000);
});
