import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CO, DOC, GIONG, MAU, MAI, mau, nganSach, ngoi } from './danh_muc';
import { cotTheoGian, rangCua } from './bo_phan';
import { mergeStatic } from '../merge';
import { hinhMai } from './mai_giong';
import { DEFAULT_SCENE } from '../spec';
import { dungMau, MAU_DA_DUNG } from './mau_nha';

// biển vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

const deg = (r: number): number => (r * 180) / Math.PI;

describe('bộ asset chuẩn — bảng mẫu (danh_muc.md)', () => {
  it('mỗi mẫu có ít nhất một cỡ; cỡ S < M < L theo bề rộng và số gian không giảm', () => {
    for (const m of MAU) {
      const cs = CO.map((c) => m.co[c]).filter((c) => c !== undefined);
      expect(cs.length, m.ma).toBeGreaterThan(0);
      for (let i = 1; i < cs.length; i++) {
        expect(cs[i]!.w, `${m.ma} rộng`).toBeGreaterThanOrEqual(cs[i - 1]!.w);
        expect(cs[i]!.gian, `${m.ma} gian`).toBeGreaterThanOrEqual(cs[i - 1]!.gian);
      }
    }
  });

  it('số gian lẻ (trừ ngoại lệ có chủ đích: tàng thư 6 gian, nhà gối sông / cửa hàng / nhà đất 2 gian)', () => {
    const ok = new Set(['lau L', 'nha-giang-nam M', 'cua-hang M', 'nha-dat M']);
    for (const m of MAU) for (const c of CO) {
      const s = m.co[c];
      if (s && !ok.has(`${m.ma} ${c}`)) expect(s.gian % 2, `${m.ma} ${c}`).toBe(1);
    }
  });

  it('cấp của mỗi cỡ nằm trong khoảng cấp cho phép của mẫu', () => {
    for (const m of MAU) for (const c of CO) {
      const s = m.co[c];
      if (s) {
        expect(s.cap, `${m.ma} ${c}`).toBeGreaterThanOrEqual(m.cap[0]);
        expect(s.cap, `${m.ma} ${c}`).toBeLessThanOrEqual(m.cap[1]);
      }
    }
  });

  it('gian phụ = 0,8 × gian giữa', () => {
    const xs = cotTheoGian(21, 5);
    const widths = xs.slice(1).map((x, i) => x - xs[i]);
    expect(widths[1] / widths[2]).toBeCloseTo(0.8, 6);
    expect(widths.reduce((a, b) => a + b, 0)).toBeCloseTo(21, 6);
  });

  it('ngân sách giảm theo cấp', () => {
    expect(nganSach(1).drawCalls).toBeGreaterThan(nganSach(5).drawCalls);
  });
});

describe('mái chuẩn — độ dốc theo giọng vùng', () => {
  const base = { kieu: 'yet-son' as const, w: 12, d: 8, over: 1.2 };
  it('mỗi giọng: đoạn dưới dốc `hien`, đoạn trên dốc `noc` đúng bảng', () => {
    for (const giong of GIONG) {
      const h = hinhMai({ ...base, giong });
      expect(deg(Math.atan(h.h1 / h.r1))).toBeCloseTo(DOC[giong].hien, 6);
      expect(deg(Math.atan(h.h2 / h.r2))).toBeCloseTo(DOC[giong].noc, 6);
    }
  });

  it('Thanh lõm rõ (nóc dốc hơn hiên ≥ 10°), Tống gần thẳng (≤ 5°), Đường thoải nhất', () => {
    expect(DOC.thanh.noc - DOC.thanh.hien).toBeGreaterThanOrEqual(10);
    expect(DOC.tong.noc - DOC.tong.hien).toBeLessThanOrEqual(5);
    for (const g of GIONG) expect(DOC.duong.noc).toBeLessThanOrEqual(DOC[g].noc);
  });

  it('Giang Nam đầu đao vểnh cao nhất', () => {
    for (const g of GIONG) expect(DOC['giang-nam'].vinh).toBeGreaterThanOrEqual(DOC[g].vinh);
  });

  it('dựng được đủ 7 kiểu mái', () => {
    expect(MAI.length).toBe(7);
  });
});

describe('Catalog — mẫu đợt 1–2 dựng được ở mọi cỡ, mọi giọng', () => {
  const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
  it('mọi mẫu đợt 1, đợt 2 có hàm dựng', () => {
    for (const m of MAU.filter((x) => x.dot <= 2)) expect(MAU_DA_DUNG, m.ma).toContain(m.ma);
  });
  it('mỗi cỡ × giọng ra một nhóm có khối, mái đúng chiều (đỉnh cao hơn chân)', () => {
    for (const m of MAU) for (const c of CO) {
      if (!m.co[c]) continue;
      for (const giong of GIONG) {
        const g = dungMau(m.ma, c, giong, style);
        expect(g, `${m.ma} ${c} ${giong}`).not.toBeNull();
        const b = new THREE.Box3().setFromObject(g!);
        expect(b.max.y, `${m.ma} ${c} ${giong}`).toBeGreaterThan(2.5);
        expect(b.max.x - b.min.x, `${m.ma} ${c} rộng`).toBeGreaterThanOrEqual(m.co[c]!.w * 0.9);
      }
    }
  });
});

// mẫu vào được dùng hàm dựng có sẵn (trà lâu, cửa hàng, hí đài) — quét ở zfightRegions.test.ts theo cảnh thật
describe('(L-10) Catalog — mẫu dựng mới không có mặt trùng nhau gây chớp', async () => {
  const { scanZFight } = await import('../zfightScan');
  const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
  for (const m of MAU.filter((x) => !x.vao)) for (const c of CO) {
    if (!m.co[c]) continue;
    it(`(L-10): ${m.ma} ${c} (giọng Tống)`, () => {
      const g = dungMau(m.ma, c, 'tong', style)!;
      const hits = scanZFight(g);
      if (hits.length) console.log(`${m.ma} ${c}: ${hits.length}\n` + hits.slice(0, 20).map((h) => `  ${h.at.join(';')}  ${h.a}  ×  ${h.b}`).join('\n'));
      expect(hits.length).toBe(0);
    });
  }
});

describe('đợt 2 — số đo, ngân sách, bộ phận', () => {
  const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
  const dung = (ma: string, co: 'S' | 'M' | 'L'): THREE.Group => dungMau(ma, co, 'tong', style)!;
  const cao = (g: THREE.Object3D): number => new THREE.Box3().setFromObject(g).max.y;

  it('đủ 8 mẫu đợt 2 của danh mục (+ biến thể lều chỉ huy)', () => {
    const ma = MAU.filter((m) => m.dot === 2).map((m) => m.ma);
    for (const x of ['lang', 'phuong', 'nha-dat', 'tu-mieu', 'lau-thanh', 'dich-lau', 'phong-hoa', 'leu']) expect(ma).toContain(x);
  });

  it('ngân sách tam giác theo cấp (gộp cùng màu như Catalog)', () => {
    for (const m of MAU.filter((x) => x.dot === 2)) for (const c of CO) {
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

  it('ngói: vàng chỉ C1 (hoặc C2 giọng Thanh), C4 trở xuống luôn xám', () => {
    expect(ngoi(1, 'tong')).toBe('#C9A13B');
    expect(ngoi(2, 'thanh')).toBe('#C9A13B');
    expect(ngoi(2, 'tong')).not.toBe('#C9A13B');
    for (const g of GIONG) for (const cap of [4, 5, 6] as const) expect(ngoi(cap, g)).toBe('#4F5A63');
  });

  it('lầu thành: lầu đứng trên đôn — đỉnh cao hơn đôn + cột, đôn đúng danh mục (5 / 7 m)', () => {
    const m = mau('lau-thanh')!;
    expect([m.co.S!.don, m.co.M!.don]).toEqual([5, 7]);
    for (const c of ['S', 'M', 'L'] as const) expect(cao(dung('lau-thanh', c)), c).toBeGreaterThan(m.co[c]!.don! + m.co[c]!.cot + 2);
  });

  it('hành lang bò núi: mỗi gian cao hơn gian trước 0,6 m', () => {
    const tops = dung('lang', 'L').children.filter((o) => o instanceof THREE.Group).map(cao);
    expect(tops.length).toBe(mau('lang')!.co.L!.gian);
    for (let i = 1; i < tops.length; i++) expect(tops[i] - tops[i - 1]).toBeCloseTo(0.6, 5);
  });

  it('địch lâu cao 14 m tới đỉnh răng cưa (+ chòi trên nóc); phong hoả đài cao đúng danh mục', () => {
    expect(cao(dung('dich-lau', 'M'))).toBeGreaterThan(14 + 2.6);
    for (const [c, h] of [['S', 10], ['M', 12]] as const) {
      const y = cao(dung('phong-hoa', c));
      expect(y, c).toBeGreaterThan(h);
      expect(y, c).toBeLessThan(h + 2); // chỉ lò khói / gờ trên nóc
    }
  });

  it('răng cưa nằm trong mép (lùi `inset`), không chìa ra ngoài thân', () => {
    const g = new THREE.Group();
    rangCua(g, 12, 8, 5, '#6a6e69', 0.05);
    const b = new THREE.Box3().setFromObject(g);
    expect(b.max.x).toBeCloseTo(6 - 0.05, 5);
    expect(b.max.z).toBeCloseTo(4 - 0.05, 5);
    expect(b.min.y).toBeCloseTo(5, 5);
  });
});
