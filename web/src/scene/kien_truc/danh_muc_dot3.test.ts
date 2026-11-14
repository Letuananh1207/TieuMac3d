import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CO, MAU, mau, nganSach, type Co } from './danh_muc';
import { mergeStatic } from '../merge';
import { DEFAULT_SCENE } from '../spec';
import { dungMau } from './mau_nha';
import { longBaiPhuong, lauSongDay } from './mau_noi';
import { cuuKhuc, guCau, nhipCau } from './mau_cau';
import { BAC, khoiTho, lopTuDi, soBac, TU_DI_51 } from './mau_nen';
import { moonRadius } from './tuong';

// biển, vôi tường vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });

const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
const dung = (ma: string, co: Co): THREE.Group => dungMau(ma, co, 'tong', style)!;
const bb = (g: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(g);
const co = (ma: string, c: Co) => mau(ma)!.co[c]!;

describe('đợt 3 — phần nối (danh_muc.md mục 2)', () => {
  it('đủ mã phần nối của danh mục (kiểu tách hàng: cong-*, tuong-*, cau-*)', () => {
    const ma = MAU.filter((m) => m.dot === 3).map((m) => m.ma);
    for (const x of ['bai-phuong', 'son-mon', 'cong-trang', 'cong-lau', 'cong-thuy-hoa', 'tuong-voi', 'tuong-cung', 'tuong-thanh', 'tuong-dat', 'cau-vom', 'cau-bang', 'cau-mai', 'cau-treo', 'nen', 'lan-can', 'bac']) expect(ma).toContain(x);
    for (const m of MAU.filter((x) => x.dot === 3)) expect(m.nhom, m.ma).toBe('noi');
  });

  it('ngân sách tam giác theo cấp (gộp cùng màu như Catalog)', () => {
    for (const m of MAU.filter((x) => x.dot === 3)) for (const c of CO) {
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

  it('bài phường: xà thấp nhất ≥ 6 m (camera), gian giữa cao nhất; M cao ≈ 10, L ≈ 14', () => {
    for (const c of ['S', 'M', 'L'] as const) {
      const long = longBaiPhuong(co('bai-phuong', c));
      expect(Math.min(...long), c).toBeGreaterThanOrEqual(6);
      expect(long[(long.length - 1) / 2], c).toBe(Math.max(...long));
    }
    for (const [c, h] of [['M', 10], ['L', 14]] as const) expect(bb(dung('bai-phuong', c)).max.y, c).toBeCloseTo(h, -0.5);
    expect(bb(dung('bai-phuong', 'L')).max.x - bb(dung('bai-phuong', 'L')).min.x).toBeGreaterThanOrEqual(25);
  });

  it('cổng trăng: tường mẫu đủ cao để vòm đúng ∅ danh mục (2,5 / 4 / 6,4)', () => {
    for (const [c, dia] of [['S', 2.5], ['M', 4], ['L', 6.4]] as const) {
      const s = co('cong-trang', c);
      expect(s.w).toBe(dia);
      expect(2 * moonRadius(s.w, s.cot), c).toBeCloseTo(dia, 6);
    }
  });

  it('tường: cao thân đúng danh mục; thành 9 m + đoạ khẩu 1,8 m, mặt rộng 6; lậu song đáy 1,6 (tường ≥ 3,5)', () => {
    for (const [c, h] of [['S', 2.5], ['M', 3.5], ['L', 4.5]] as const) {
      expect(co('tuong-voi', c).cot).toBe(h);
      expect(bb(dung('tuong-voi', c)).max.y, c).toBeCloseTo(h + 0.5, 3); // + mái ngói đỉnh tường 0,5
    }
    expect(lauSongDay(3.5, 1)).toBe(1.6);
    expect(lauSongDay(4.5, 1)).toBe(1.6);
    expect(lauSongDay(2.5, 0.7)).toBeLessThanOrEqual(2.5 - 0.7 - 0.4);
    const thanh = co('tuong-thanh', 'L');
    expect([thanh.cot, thanh.d]).toEqual([9, 6]);
    const top = bb(dung('tuong-thanh', 'L')).max.y;
    expect(top - thanh.cot - 0.125).toBeCloseTo(1.8, 5); // mặt lát 0,125 trên thân
    expect(co('tuong-cung', 'L').cot).toBeGreaterThanOrEqual(7.5);
    expect(co('tuong-cung', 'L').cot).toBeLessThanOrEqual(10);
    expect([co('tuong-dat', 'L').cot, co('tuong-dat', 'L').d]).toEqual([5, 1.5]);
  });

  it('cầu vòm: nhịp đúng danh mục (8 · 14 · 3 nhịp ≤ 30 m), rộng 3 / 5 / 7, đỉnh vòm dưới mặt cầu', () => {
    expect(nhipCau(co('cau-vom', 'S'))).toEqual([8]);
    expect(nhipCau(co('cau-vom', 'M'))).toEqual([14]);
    const L = nhipCau(co('cau-vom', 'L'));
    expect(L.length).toBe(3);
    expect(L.reduce((a, b) => a + b, 0) + 2 * 1.2).toBeLessThanOrEqual(co('cau-vom', 'L').w);
    expect(['S', 'M', 'L'].map((c) => co('cau-vom', c as Co).d)).toEqual([3, 5, 7]);
    for (const c of ['S', 'M', 'L'] as const) {
      const s = co('cau-vom', c);
      expect(bb(dung('cau-vom', c)).max.y, c).toBeCloseTo(0.3 + guCau(s) + 0.85 + (s.cap <= 2 ? 0.3 : 0), 3);
      // nhịp lớn nhất ≤ dài cầu (vòm nằm trong thân)
      expect(Math.max(...nhipCau(s))).toBeLessThan(s.w);
    }
  });

  it('cửu khúc: 9 đoạn, mỗi đoạn vuông góc đoạn trước, phủ đủ bề ngang', () => {
    const pts = cuuKhuc(20);
    expect(pts.length - 1).toBe(9);
    for (let i = 2; i < pts.length; i++) {
      const u = [pts[i - 1][0] - pts[i - 2][0], pts[i - 1][1] - pts[i - 2][1]];
      const v = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
      expect(u[0] * v[0] + u[1] * v[1]).toBeCloseTo(0, 9);
    }
    expect(pts[pts.length - 1][0] - pts[0][0]).toBeCloseTo(20, 9);
  });

  it('tu di 須彌座: 6 lớp theo 51 phần 10 · 8 · 7 · 10 · 7 · 9', () => {
    expect([...TU_DI_51]).toEqual([10, 8, 7, 10, 7, 9]);
    expect(TU_DI_51.reduce((a, b) => a + b, 0)).toBe(51);
    const hs = lopTuDi(2);
    expect(hs.reduce((a, b) => a + b, 0)).toBeCloseTo(2, 9);
    expect(hs[0] / hs[1]).toBeCloseTo(10 / 8, 9);
  });

  it('Tam Đài chữ 土: ba khối liền nhau mọi tầng, tầng trên lùi đủ chỗ cho bậc 御路, cao 6 m', () => {
    const L = co('nen', 'L');
    for (let t = 0; t < 3; t++) {
      const k = khoiTho(t, L.d);
      expect(k.eo.z1).toBeCloseTo(k.truoc.z0, 9);
      expect(k.eo.z0).toBeCloseTo(k.sau.z1, 9);
      expect(k.eo.hw).toBeLessThan(k.sau.hw);
      expect(k.sau.hw).toBeLessThan(k.truoc.hw);
      if (t > 0) expect(khoiTho(t - 1, L.d).truoc.z1 - k.truoc.z1).toBeGreaterThanOrEqual(soBac(L.cot / 3).n * BAC.sau);
    }
    const b = bb(dung('nen', 'L'));
    expect(b.max.z - b.min.z).toBeGreaterThanOrEqual(L.d);
    // lan can đá 1,1 + mũ trụ 0,25 trên mặt tầng trên cùng
    expect(b.max.y).toBeCloseTo(L.cot + 1.1 + 0.25, 3);
  });

  it('bậc 0,15 × 0,32 (không nhân K) cho mọi cỡ nền bày', () => {
    for (const c of ['S', 'M', 'L'] as const) {
      const { rise } = soBac(co('bac', c).cot);
      expect(Math.abs(rise - 0.15), c).toBeLessThanOrEqual(0.005);
    }
    for (const h of [0.6, 1.2, 1.95, 2]) expect(Math.abs(soBac(h).rise - BAC.cao)).toBeLessThan(0.01);
    expect(BAC.sau).toBe(0.32);
  });

  it('lan can: gỗ cao 0,9, đá 1,1 (mô-đun 1,9) trên mặt nền mẫu', () => {
    expect(bb(dung('lan-can', 'S')).max.y).toBeCloseTo(0.6 + 0.9 + 0.08, 5);
    expect(bb(dung('lan-can', 'M')).max.y).toBeCloseTo(1.2 + 1.1 + 0.25, 5);
    expect(bb(dung('lan-can', 'L')).max.y).toBeCloseTo(2 + 1.1 + 0.25, 5);
    expect(co('lan-can', 'M').w / 1.9).toBeCloseTo(5, 9);
  });
});
