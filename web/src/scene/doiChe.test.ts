import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { addTeaGarden, mistSheets } from './doiChe';
import { butterfliesOut, checkTea, insideTea, mistLevel, TEA_OVERLAP, teaBox, teaSegments } from './luongCheLayout';
import { windChunk } from './materials';
import { DEFAULT_MOC } from './ngayDem';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';
import { mistGeometry } from './suongSom';

const KNT = resolveSceneSpec(JSON.parse(readFileSync(new URL('../../../design/scene/scene.json', import.meta.url), 'utf8'))).spec;
const st = DEFAULT_SCENE.teaStyle;

describe('luống chè Đồi Chè (V-46)', () => {
  it('cảnh mặc định không có luống (giữ cảnh cũ); Khởi Nguyên Trấn: 12 luống, 3 bậc × 2 hàng × 2 nửa, không còn bụi ở Đồi Chè', () => {
    expect(DEFAULT_SCENE.teaRows).toEqual([]);
    expect(KNT.teaRows).toHaveLength(12);
    const zs = new Set(KNT.teaRows.map((r) => r.from[1]));
    expect(zs.size).toBe(6);
    const inHill = KNT.trees.yard.filter((t) => t.x > 9 && t.x < 29 && t.z > -52 && t.z < -36);
    expect(inHill).toEqual([]);
    // mỗi luống ≤ một đoạn mẫu → 12 instance = 12 × 122 tam giác
    expect(KNT.teaRows.flatMap((r) => teaSegments(r, KNT.teaStyle))).toHaveLength(12);
  });

  it('chia đoạn: phủ đúng from → to, chồng mép TEA_OVERLAP, không đoạn nào dài quá segment', () => {
    const segs = teaSegments({ from: [0, 5], to: [14, 5] }, st);
    expect(segs).toHaveLength(3);
    for (const s of segs) expect(s.length).toBeLessThanOrEqual(st.segment);
    expect(segs[0].x - segs[0].length / 2).toBeCloseTo(0);
    expect(segs[2].x + segs[2].length / 2).toBeCloseTo(14);
    expect(segs[0].x + segs[0].length / 2 - (segs[1].x - segs[1].length / 2)).toBeCloseTo(TEA_OVERLAP);
    const alongZ = teaSegments({ from: [3, 0], to: [3, -5] }, st);
    expect(alongZ).toHaveLength(1);
    expect(alongZ[0]).toMatchObject({ x: 3, z: -2.5, alongX: false });
    expect(teaBox({ from: [3, 0], to: [3, -5], width: 1 }, st)).toEqual({ x: 3, z: -2.5, w: 1, d: 5 });
  });

  it('cỏ / hoa / đá không mọc trong luống (nới 0,2 m), rãnh giữa luống bậc dưới vẫn có', () => {
    expect(insideTea(KNT.teaRows, KNT.teaStyle, 14, -37.25, 0.2)).toBe(true);
    expect(insideTea(KNT.teaRows, KNT.teaStyle, 14, -38.25, 0.2)).toBe(false);
    expect(insideTea(KNT.teaRows, KNT.teaStyle, 18.1, -43, 0.2)).toBe(false); // lối cắt ngang giữa bậc
  });

  it('R-VA-1: luống chặn như hàng rào thấp (không che camera); rãnh bậc dưới, lối cắt ngang giữa và hai đầu luống đi được', () => {
    const c = new Colliders();
    addTeaGarden(new THREE.Scene(), c, KNT, undefined, 1);
    expect(c.boxes).toHaveLength(12);
    expect(c.boxes.every((b) => b.h === 0)).toBe(true);
    // đứng trong rãnh bậc 1 (z −38,25) đi lên bắc → dừng trước luống thứ hai (mép z −38,825)
    const p = { x: 14, z: -38.6 };
    c.resolve(p, 0.5);
    expect(p.z).toBeCloseTo(-38.325, 2);
    // lối cắt ngang x 17,5 … 18,7 và đầu luống tây (x 11) / đông (x 25,5): không vật cản
    for (const [x, z] of [[18.1, -37.25], [18.1, -43.25], [18.1, -47.5], [11, -47.5], [25.5, -43.25]]) {
      const q = { x, z };
      c.resolve(q, 0.5);
      expect(q).toEqual({ x, z });
    }
  });

  it('gió luống: pha theo toạ độ thế giới của đỉnh (đoạn nối không lệch pha)', () => {
    expect(windChunk({ amp: 0.024, tip: 0.8, world: true })).toContain('modelMatrix * instanceMatrix * vec4(position, 1.0)');
    expect(windChunk({ amp: 0.024, tip: 0.8 })).not.toContain('vec4(position, 1.0)');
  });

  it('kiểm đặc tả: luống cao quá hông bị báo', () => {
    expect(checkTea({ teaRows: KNT.teaRows, teaStyle: KNT.teaStyle })).toEqual([]);
    expect(checkTea({ teaRows: [{ from: [0, 0], to: [4, 0], height: 1.6 }], teaStyle: st }).join()).toContain('teaRows[0].height');
    expect(checkTea({ teaRows: [], teaStyle: { ...st, height: 9 } })).toEqual([]);
  });
});

describe('bướm + sương sớm Đồi Chè (V-46)', () => {
  it('R-NGAY-6: bướm bay ban ngày 6:30–17:00, không có lúc bình minh / hoàng hôn / đêm', () => {
    expect(butterfliesOut(12, DEFAULT_MOC)).toBe(true);
    expect(butterfliesOut(6.5, DEFAULT_MOC)).toBe(true);
    expect(butterfliesOut(16.9, DEFAULT_MOC)).toBe(true);
    for (const g of [5.5, 17, 21, 0, 3]) expect(butterfliesOut(g, DEFAULT_MOC)).toBe(false);
  });

  it('R-NGAY-6: sương sớm chỉ 5–9 giờ: dày dần 5–6, đặc nhất 6–7, tan dần tới 9', () => {
    const m = { from: 5, to: 9 };
    for (const g of [4.9, 9, 9.5, 12, 18, 23]) expect(mistLevel(g, m)).toBe(0);
    expect(mistLevel(5.5, m)).toBeGreaterThan(0);
    expect(mistLevel(5.5, m)).toBeLessThan(1);
    expect(mistLevel(6.5, m)).toBe(1);
    expect(mistLevel(7, m)).toBe(1);
    expect(mistLevel(8, m)).toBeGreaterThan(0);
    expect(mistLevel(8, m)).toBeLessThan(mistLevel(7.5, m));
  });

  it('R-NGAY-6: theo giờ — 7 giờ có sương lẫn bướm; 12 giờ bướm, không sương; 21 giờ không bướm, không sương', () => {
    const scene = new THREE.Scene();
    const g = addTeaGarden(scene, new Colliders(), KNT, undefined, 1)!;
    const { butterflies, mist } = g.parts;
    expect(butterflies?.count).toBe(KNT.teaStyle.butterflies * 2);
    g.hour(7);
    expect(mist?.visible).toBe(true);
    expect(butterflies?.visible).toBe(true);
    g.hour(12);
    expect(mist?.visible).toBe(false);
    expect(butterflies?.visible).toBe(true);
    g.hour(21);
    expect(mist?.visible).toBe(false);
    expect(butterflies?.visible).toBe(false);
    g.update(0.5); // chạy được khi ẩn
  });

  it('R-HIEU-1: mức Thấp (detail 0,5) chỉ có luống — không bướm, không sương', () => {
    const scene = new THREE.Scene();
    const g = addTeaGarden(scene, new Colliders(), KNT, undefined, 0.5)!;
    expect(g.parts.butterflies).toBeNull();
    expect(g.parts.mist).toBeNull();
    expect(g.parts.rows.count).toBe(12);
    expect(scene.children).toHaveLength(1);
  });

  it('ngân sách: sương 3 tấm (mỗi bậc một), mép trong suốt; mỗi bướm 4 tam giác', () => {
    const sheets = mistSheets(KNT.teaRows.flatMap((r) => teaSegments(r, KNT.teaStyle)).map((s, i) => ({ ...s, y: [0.9, 0.9, 2.7, 2.7, 4.5, 4.5][Math.floor(i / 2)] })));
    expect(sheets).toHaveLength(3);
    const geo = mistGeometry();
    expect(geo.index!.count / 3).toBeLessThanOrEqual(24);
    const a = geo.getAttribute('color');
    expect(a.itemSize).toBe(4);
    expect(a.getW(0)).toBe(0);
    const g = addTeaGarden(new THREE.Scene(), new Colliders(), KNT, undefined, 1)!;
    expect(g.parts.butterflies!.geometry.index!.count / 3).toBe(2); // 2 tam giác / cánh, 2 cánh / con
  });
});
