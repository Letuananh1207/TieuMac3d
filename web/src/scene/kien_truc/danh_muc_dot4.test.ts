import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CO, MAU, mau, nganSach, type Co } from './danh_muc';
import { mergeStatic } from '../merge';
import { DEFAULT_SCENE } from '../spec';
import { dungMau } from './mau_nha';
import { lopCui } from './mau_vat';
import { DEN_CACH, GIENG, NHAT_QUY, VAC } from './mau_vat_2';

// biển, vôi tường vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });

const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
const dung = (ma: string, co: Co): THREE.Group => dungMau(ma, co, 'tong', style)!;
const bb = (g: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(g);
const co = (ma: string, c: Co) => mau(ma)!.co[c]!;
/** Nhóm con (mỗi vật của một cặp / một hàng là một nhóm). */
const vat = (g: THREE.Group): THREE.Group[] => g.children.filter((o): o is THREE.Group => o instanceof THREE.Group);

describe('đợt 4 — vật sân (danh_muc.md mục 3)', () => {
  it('đủ 11 vật sân của danh mục, nhóm `vat`', () => {
    const ma = MAU.filter((m) => m.dot === 4).map((m) => m.ma);
    expect(ma.length).toBe(11);
    for (const x of ['chieu-bich', 'su-tu', 'hoa-bieu', 'nhat-quy', 'vac-nuoc', 'dinh-huong', 'gieng', 'den-da', 'bia', 'cot-co', 'cui-bao-hieu']) expect(ma).toContain(x);
    for (const m of MAU.filter((x) => x.dot === 4)) expect(m.nhom, m.ma).toBe('vat');
  });

  it('cấp tối thiểu của sân đúng danh mục (cấp thấp nhất cho phép)', () => {
    const toiThieu: Record<string, number> = { 'chieu-bich': 4, 'su-tu': 3, 'hoa-bieu': 1, 'nhat-quy': 2, 'vac-nuoc': 2, 'dinh-huong': 3, gieng: 5, 'den-da': 4, bia: 4, 'cot-co': 5, 'cui-bao-hieu': 6 };
    for (const [ma, cap] of Object.entries(toiThieu)) expect(mau(ma)!.cap[1], ma).toBe(cap);
  });

  it('ngân sách tam giác theo cấp (gộp cùng màu như Catalog)', () => {
    for (const m of MAU.filter((x) => x.dot === 4)) for (const c of CO) {
      const s = m.co[c];
      if (!s) continue;
      const g = dung(m.ma, c);
      mergeStatic(g, new Set());
      let tris = 0;
      g.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const geo = o.geometry as THREE.BufferGeometry;
        tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
      });
      expect(tris, `${m.ma} ${c}`).toBeLessThanOrEqual(nganSach(s.cap).tris);
    }
  });

  it('chiều cao đúng danh mục: chiếu bích 4 / 5, sư tử 2,5, hoa biểu 12, đỉnh 2,5, đèn đá 1,9, bia 2,5 / 4, cột cờ 12, củi 2', () => {
    const cases: [string, Co, number, number][] = [
      ['chieu-bich', 'S', 4, 0.1],
      ['chieu-bich', 'L', 5, 0.1],
      ['su-tu', 'M', 2.5, 0.1],
      ['hoa-bieu', 'L', 12, 0.05],
      ['dinh-huong', 'S', 2.5, 0.05],
      ['den-da', 'S', 1.9, 0.01],
      ['bia', 'S', 2.5, 0.01],
      ['bia', 'M', 4, 0.01],
      ['cot-co', 'M', 12, 0.01],
      ['cui-bao-hieu', 'S', 2, 0.03],
    ];
    for (const [ma, c, h, tol] of cases) expect(Math.abs(bb(dung(ma, c)).max.y - h), `${ma} ${c}`).toBeLessThanOrEqual(tol);
    // nhật quỹ cao ≈ 1,5: tâm đĩa + nửa đĩa nghiêng
    expect(NHAT_QUY.tam + NHAT_QUY.r * Math.sin((NHAT_QUY.nghieng * Math.PI) / 180)).toBeCloseTo(1.5, 1);
  });

  it('chiếu bích: S 8 × 0,8, L Cửu Long Bích 30 m · 9 rồng', () => {
    const S = bb(dung('chieu-bich', 'S'));
    expect(S.max.x - S.min.x).toBeGreaterThanOrEqual(8);
    expect(co('chieu-bich', 'S').d).toBe(0.8);
    expect(co('chieu-bich', 'L').w).toBe(30);
    const rong = dung('chieu-bich', 'L').children.filter((o) => o instanceof THREE.Mesh && o.geometry.type === 'TubeGeometry');
    expect(rong.length).toBe(9);
  });

  it('vật đi cặp: hai vật đối xứng qua trục (sư tử, hoa biểu, vạc nước, cột cờ)', () => {
    for (const [ma, c] of [['su-tu', 'M'], ['hoa-bieu', 'L'], ['vac-nuoc', 'M'], ['cot-co', 'M']] as const) {
      const xs = vat(dung(ma, c)).map((o) => o.position.x);
      expect(xs.length, ma).toBe(2);
      expect(xs[0] + xs[1], ma).toBeCloseTo(0, 9);
      expect(Math.abs(xs[0]), ma).toBeGreaterThan(1);
    }
  });

  it('sư tử: đực (có tú cầu) phía đông (+x), cái phía tây — nhìn từ trong ra', () => {
    const [dong, tay] = vat(dung('su-tu', 'M'));
    expect(dong.position.x).toBeGreaterThan(0);
    expect(tay.position.x).toBeLessThan(0);
    // đực: bệ + 4 khối thân + 2 chân + tú cầu; cái: sư tử con 2 khối thay tú cầu
    expect(tay.children.length).toBe(dong.children.length + 1);
  });

  it('nhật quỹ phía đông, gia lượng phía tây; M thêm rùa + hạc mỗi thứ một cặp', () => {
    const S = vat(dung('nhat-quy', 'S'));
    expect(S.length).toBe(2);
    expect(S[0].position.x).toBeGreaterThan(0); // nhật quỹ dựng trước, phía đông
    const M = vat(dung('nhat-quy', 'M'));
    expect(M.length).toBe(6);
  });

  it('vạc nước cao 1,5, bụng ∅ 2 (trên bệ 0,3)', () => {
    expect(VAC.cao).toBe(co('vac-nuoc', 'M').cot);
    expect(2 * VAC.bung).toBe(2);
    expect(bb(dung('vac-nuoc', 'M')).max.y).toBeCloseTo(VAC.be + VAC.cao, 1);
  });

  it('đỉnh trước, lư sau trên trục (M)', () => {
    const [dinh, lu] = vat(dung('dinh-huong', 'M'));
    expect(dinh.position.z).toBeGreaterThan(lu.position.z);
    expect(dinh.position.x).toBe(0);
  });

  it('giếng ∅ 1,4, mặt nước dưới miệng; đình giếng cột 2,5', () => {
    expect(2 * GIENG.r).toBeCloseTo(1.4, 9);
    expect(GIENG.nuoc).toBeLessThan(GIENG.mieng);
    expect(bb(dung('gieng', 'M')).max.y).toBeGreaterThan(0.1 + co('gieng', 'M').cot + 0.25);
  });

  it('đèn đá M: 3 đèn cách đều 6 m dọc lối', () => {
    const xs = vat(dung('den-da', 'M')).map((o) => o.position.x);
    expect(xs.length).toBe(3);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeCloseTo(DEN_CACH, 9);
  });

  it('đống củi 3 × 3 × 2: các lớp xếp chéo, búi lau trên nóc', () => {
    expect(lopCui(2)).toBeGreaterThanOrEqual(4);
    const b = bb(dung('cui-bao-hieu', 'S'));
    expect(b.max.x - b.min.x).toBeCloseTo(3, 1);
    expect(b.max.z - b.min.z).toBeCloseTo(3, 1);
  });

  it('bia L: đình bia có rùa đội bia bên trong, rộng đủ 6,25', () => {
    const b = bb(dung('bia', 'L'));
    expect(b.max.x - b.min.x).toBeGreaterThanOrEqual(6.25);
    expect(b.max.y).toBeGreaterThan(co('bia', 'L').cot + 1);
  });
});
