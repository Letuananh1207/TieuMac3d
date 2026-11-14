import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { O_CHU_BIA } from './kien_truc/mau_vat_2';
import { HOME_SCENE, loadScene } from './loadSpec';
import { resetSignAtlas } from './signAtlas';
import { DEFAULT_SCENE } from './spec';
import { BIA_SCALE, biaProp, parseBiaText } from './vat_bia';

// chữ bia vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });

const style = DEFAULT_SCENE.buildingStyle;
const TEXT = '三人行/必有我師焉|sān rén xíng/bì yǒu wǒ shī yān|Ba người cùng đi.|Tam nhân hành|Luận Ngữ';

describe('bia Vườn Bia (V-20261114-30)', () => {
  it('đọc text "Hán|pinyin|nghĩa|Hán Việt|nguồn", câu cách bằng "/"; pinyin theo số câu Hán', () => {
    expect(parseBiaText(TEXT)).toEqual({
      han: ['三人行', '必有我師焉'],
      pinyin: ['sān rén xíng', 'bì yǒu wǒ shī yān'],
      nghia: 'Ba người cùng đi.',
      hanViet: 'Tam nhân hành',
      nguon: 'Luận Ngữ',
    });
    expect(parseBiaText('學而|xué').pinyin).toEqual(['xué']);
    expect(parseBiaText(undefined)).toEqual({ han: [], pinyin: [], nghia: '', hanViet: '', nguon: '' });
  });

  it('bia đứng = mẫu Catalog S × 1,6 (cao 4 m), rùa đội bia = M × 1,25 (cao 5 m); va chạm theo đế', () => {
    for (const [kind, h, box] of [['bia', 4, [2.56, 1.44]], ['bia-rua', 5, [3.5, 5.5]]] as const) {
      resetSignAtlas();
      const g = new THREE.Group();
      const c = biaProp(kind, g, style, TEXT)!;
      expect(c.box![0]).toBeCloseTo(box[0], 6);
      expect(c.box![1]).toBeCloseTo(box[1], 6);
      const bb = new THREE.Box3().setFromObject(g);
      expect(bb.max.y).toBeCloseTo(h, 1);
      expect(BIA_SCALE[kind]).toBeGreaterThan(1);
    }
  });

  it('hai mặt chữ (trước nhìn +z, sau nhìn −z) phủ lên thân; ô chữ giả của mẫu đã bỏ', () => {
    resetSignAtlas();
    const g = new THREE.Group();
    biaProp('bia', g, style, TEXT);
    const faces = g.children.filter((o): o is THREE.Mesh => o instanceof THREE.Mesh && o.geometry instanceof THREE.PlaneGeometry);
    expect(faces.map((f) => Math.sign(f.position.z)).sort()).toEqual([-1, 1]);
    // thân bia mẫu S dày 0,35 (× 1,6) → mặt chữ nằm ngoài mặt thân, sát đó
    for (const f of faces) expect(Math.abs(f.position.z)).toBeGreaterThan((0.35 / 2) * BIA_SCALE.bia);
    for (const f of faces) expect(Math.abs(f.position.z)).toBeLessThan((0.35 / 2 + 0.1) * BIA_SCALE.bia);
    let gia = 0;
    g.traverse((o) => (gia += o.name === O_CHU_BIA ? 1 : 0));
    expect(gia).toBe(0);
  });

  it('kiểu khác → null (props.ts thử bộ dựng kế)', () => {
    expect(biaProp('den-da', new THREE.Group(), style, '')).toBeNull();
  });

  it('cảnh thật: Vườn Bia có 1 rùa đội bia + 8 bia, mỗi bia đủ chữ Hán, pinyin, nghĩa Việt, Hán Việt, nguồn', () => {
    const props = loadScene(HOME_SCENE).spec.props.filter((p) => p.kind === 'bia' || p.kind === 'bia-rua');
    expect(props.filter((p) => p.kind === 'bia-rua').length).toBe(1);
    expect(props.filter((p) => p.kind === 'bia').length).toBe(8);
    for (const p of props) {
      const t = parseBiaText(p.text);
      expect(t.han.length, p.text).toBeGreaterThan(0);
      expect(t.pinyin.every((x) => x.length > 0), p.text).toBe(true);
      expect(t.pinyin.map((x) => x.split(' ').length), p.text).toEqual(t.han.map((x) => [...x].length));
      for (const x of [t.nghia, t.hanViet, t.nguon]) expect(x.length, p.text).toBeGreaterThan(0);
    }
  });
});
