import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SOFT_LOOK_TRY } from './bake';
import { lambert, softMaterial, wrapLambertChunk } from './materials';
import { cloneMaterial, markDynamic, markOwnMaterials, mergeSoft, mergeStatic, mergeVertexColors } from './merge';

describe('softMaterial — wrap lighting (kế hoạch canh-dep NV3)', () => {
  it('thay dòng sáng nắng của Lambert bằng wrap; wrap 0 giữ dạng saturate(dot)', () => {
    const chunk = wrapLambertChunk(0.5);
    expect(chunk).toContain('+ 0.500 ) / 1.500');
    expect(chunk).not.toContain('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );');
    expect(wrapLambertChunk(0)).toContain('+ 0.000 ) / 1.000');
  });

  it('onBeforeCompile chèn đoạn đã sửa vào shader; khoá chương trình theo wrap', () => {
    const m = softMaterial(0.5);
    const shader = { fragmentShader: 'a\n#include <lights_lambert_pars_fragment>\nb' } as unknown as THREE.WebGLProgramParametersWithUniforms;
    m.onBeforeCompile(shader, {} as THREE.WebGLRenderer);
    expect(shader.fragmentShader).toContain('/ 1.500');
    expect(shader.fragmentShader).not.toContain('#include <lights_lambert_pars_fragment>');
    expect(m.vertexColors).toBe(true);
    expect(m.customProgramCacheKey()).not.toBe(softMaterial(0.25).customProgramCacheKey());
  });
});

describe('mergeSoft', () => {
  const box = (color: string, x: number, extra?: THREE.MeshLambertMaterialParameters): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), lambert(color, extra));
    m.position.set(x, 1, 0);
    return m;
  };

  it('hai khối khác màu → một khối vật liệu mềm, mang màu đỉnh của từng khối', () => {
    const root = new THREE.Group();
    root.add(box('#ff0000', 0), box('#0000ff', 3));
    expect(mergeSoft(root, new Set(), SOFT_LOOK_TRY)).toBe(1);
    expect(root.children).toHaveLength(1);
    const mesh = root.children[0] as THREE.Mesh;
    expect((mesh.material as THREE.Material).userData.soft).toBe(true);
    const col = mesh.geometry.getAttribute('color');
    let red = 0;
    let blue = 0;
    for (let i = 0; i < col.count; i++) {
      if (col.getX(i) > col.getZ(i)) red++;
      else blue++;
    }
    expect(red).toBeGreaterThan(0);
    expect(blue).toBeGreaterThan(0);
  });

  it('mặt vẽ khác nhau gộp riêng; ảnh, trong suốt, vật chuyển động, `keep` để nguyên', () => {
    const root = new THREE.Group();
    const kept = box('#888888', 9);
    const moving = box('#888888', 12);
    markDynamic(moving);
    root.add(
      box('#aa0000', 0),
      box('#00aa00', 2),
      box('#aa0000', 4, { side: THREE.DoubleSide }),
      box('#aa0000', 6, { side: THREE.DoubleSide }),
      box('#aa0000', 8, { transparent: true, opacity: 0.5 }),
      kept,
      moving,
    );
    expect(mergeSoft(root, new Set([kept]), SOFT_LOOK_TRY)).toBe(2);
    const soft = root.children.filter((o) => ((o as THREE.Mesh).material as THREE.Material).userData.soft);
    expect(soft.map((o) => ((o as THREE.Mesh).material as THREE.Material).side).sort()).toEqual([THREE.FrontSide, THREE.DoubleSide].sort());
    expect(root.children).toContain(kept);
    expect(root.children).toContain(moving);
  });

  it('mergeStatic sau đó không gộp lại khối mềm (giữ màu đỉnh)', () => {
    const root = new THREE.Group();
    root.add(box('#ff0000', 0), box('#0000ff', 3));
    mergeSoft(root, new Set(), SOFT_LOOK_TRY);
    const baked = root.children[0] as THREE.Mesh;
    const soft = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), softMaterial(0.5));
    root.add(soft);
    expect(mergeStatic(root, new Set())).toBe(0);
    expect(root.children).toEqual([baked, soft]);
    expect(baked.geometry.getAttribute('color')).toBeDefined();
  });

  it('không gọi mergeSoft thì mergeStatic như cũ (cảnh hiện tại không đổi)', () => {
    const root = new THREE.Group();
    root.add(box('#ff0000', 0), box('#ff0000', 3));
    expect(mergeStatic(root, new Set())).toBe(1);
    expect(((root.children[0] as THREE.Mesh).material as THREE.Material).userData.soft).toBeUndefined();
  });
});

describe('nhà vào được cảnh mềm (NV10)', () => {
  const roofBox = (y: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), lambert('#808080'));
    m.position.y = y;
    return m;
  };

  it('mergeVertexColors có look: nướng bóng (mặt dưới mái tối hơn mặt trên) + vật liệu mềm', () => {
    const g = new THREE.Group();
    g.add(roofBox(6), roofBox(8));
    mergeVertexColors(g, SOFT_LOOK_TRY);
    const mesh = g.children[0] as THREE.Mesh;
    expect((mesh.material as THREE.Material).userData.soft).toBe(true);
    const nrm = mesh.geometry.getAttribute('normal');
    const col = mesh.geometry.getAttribute('color');
    let up = 0;
    let down = 1;
    for (let i = 0; i < col.count; i++) {
      if (nrm.getY(i) > 0.9) up = Math.max(up, col.getX(i));
      if (nrm.getY(i) < -0.9) down = Math.min(down, col.getX(i));
    }
    expect(down).toBeLessThan(up);
  });

  it('không look: như cũ (màu phẳng, Lambert thường)', () => {
    const g = new THREE.Group();
    g.add(roofBox(6), roofBox(8));
    mergeVertexColors(g);
    expect(((g.children[0] as THREE.Mesh).material as THREE.Material).userData.soft).toBeUndefined();
  });

  it('cloneMaterial giữ móc shader của vật liệu mềm (mờ mái R-HUD-2 vẫn là vật liệu mềm)', () => {
    const m = softMaterial(0.5);
    const c = cloneMaterial(m);
    expect(c).not.toBe(m);
    expect(c.onBeforeCompile).toBe(m.onBeforeCompile);
    expect(c.customProgramCacheKey()).toBe(m.customProgramCacheKey());
  });

  it('nhóm tự quản vật liệu (mờ dần) không bị mergeSoft kéo ra', () => {
    const root = new THREE.Group();
    const fade = new THREE.Group();
    markOwnMaterials(fade);
    fade.add(roofBox(6));
    root.add(fade, roofBox(0), roofBox(2));
    mergeSoft(root, new Set(), SOFT_LOOK_TRY);
    expect(fade.children).toHaveLength(1);
  });
});
