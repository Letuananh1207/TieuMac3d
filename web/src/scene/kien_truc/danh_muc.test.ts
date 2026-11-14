import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CO, DOC, GIONG, MAU, MAI, nganSach } from './danh_muc';
import { cotTheoGian } from './bo_phan';
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

  it('số gian lẻ (trừ ngoại lệ có chủ đích: tàng thư 6 gian, nhà gối sông 2 gian, cửa hàng 2 gian)', () => {
    const ok = new Set(['lau L', 'nha-giang-nam M', 'cua-hang M']);
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

describe('Catalog — mẫu đợt 1 dựng được ở mọi cỡ, mọi giọng', () => {
  const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1 };
  it('mọi mẫu đợt 1 có hàm dựng', () => {
    for (const m of MAU.filter((x) => x.dot === 1)) expect(MAU_DA_DUNG, m.ma).toContain(m.ma);
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
