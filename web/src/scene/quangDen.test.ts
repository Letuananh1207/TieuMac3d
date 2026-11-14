import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOK } from './look';
import { isGlowing, lampMaterial, setLampGlow } from './materials';
import { addLanternGlow } from './quangDen';
import { DEFAULT_SCENE } from './spec';

// ảnh quầng vẽ bằng canvas 2D: Node không có — canvas giả
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'createRadialGradient' ? () => ({ addColorStop: () => undefined }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

describe('quầng sáng đèn (kế hoạch canh-dep NV12)', () => {
  it('mỗi đèn một quầng, 1 draw call; quay theo camera trước khi vẽ', () => {
    const scene = new THREE.Scene();
    const spots = [new THREE.Vector3(0, 2, 0), new THREE.Vector3(5, 1.5, 3)];
    const glow = addLanternGlow(scene, spots, DEFAULT_LOOK);
    expect(glow?.count).toBe(2);
    expect(scene.children).toContain(glow);
    const cam = new THREE.PerspectiveCamera();
    cam.quaternion.setFromEuler(new THREE.Euler(0, 1, 0));
    glow?.onBeforeRender({} as THREE.WebGLRenderer, scene, cam, glow.geometry, glow.material as THREE.Material, null as unknown as THREE.Group);
    const m = new THREE.Matrix4();
    glow?.getMatrixAt(1, m);
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    m.decompose(p, q, new THREE.Vector3());
    expect(p.distanceTo(spots[1])).toBeLessThan(1e-6);
    expect(q.angleTo(cam.quaternion)).toBeLessThan(1e-6);
  });

  it('không đèn hoặc cỡ 0 → không thêm gì', () => {
    const scene = new THREE.Scene();
    expect(addLanternGlow(scene, [], DEFAULT_LOOK)).toBeNull();
    expect(addLanternGlow(scene, [new THREE.Vector3()], { ...DEFAULT_LOOK, lanternGlow: { color: '#ffffff', size: 0 } })).toBeNull();
    expect(scene.children).toHaveLength(0);
  });
});

describe('đèn ban ngày không phát sáng (V-20261114-27)', () => {
  it('đặc tả mặc định: light.lampGlow = 0 → không quầng; đèn sáng thì quầng mờ theo độ sáng', () => {
    expect(DEFAULT_SCENE.light.lampGlow).toBe(0);
    const scene = new THREE.Scene();
    expect(addLanternGlow(scene, [new THREE.Vector3()], DEFAULT_LOOK, DEFAULT_SCENE.light.lampGlow)).toBeNull();
    const half = addLanternGlow(scene, [new THREE.Vector3()], DEFAULT_LOOK, 0.5);
    expect((half?.material as THREE.MeshBasicMaterial).opacity).toBeCloseTo(0.5);
  });

  it('lòng đèn: tắt = Lambert thường (gộp chung), bật = tự phát sáng màu của nó', () => {
    setLampGlow(0);
    const off = lampMaterial('#f06a4a');
    expect(isGlowing(off)).toBe(false);
    setLampGlow(1);
    const on = lampMaterial('#f06a4a');
    expect(isGlowing(on)).toBe(true);
    expect(on.emissive.getHexString()).toBe(on.color.getHexString());
    setLampGlow(0);
  });
});
