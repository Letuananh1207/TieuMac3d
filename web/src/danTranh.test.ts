import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CAM_NU, DanTranh } from './danTranh';
import { npcModelUrl } from './player/npc';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { NPC_IDS } from './scene/spec';
import { pluckSamples } from './ui/zitherSound';

vi.stubGlobal('window', { addEventListener: () => {}, AudioContext: undefined });

describe('Nhạc công bục đàn', () => {
  it('R-NPC-9: mã `cam-nu` có trong NPC_IDS và có model design/models/cam-nu.glb (Tripo, 2026-11-16)', () => {
    expect(NPC_IDS).toContain(CAM_NU);
    expect(npcModelUrl(CAM_NU)).toBeDefined();
  });
  it('R-NPC-9: cảnh không có bục đàn → không người, không tiếng', async () => {
    const spec = loadScene(HOME_SCENE).spec;
    const scene = new THREE.Scene();
    const d = await DanTranh.create(scene, { ...spec, props: spec.props.filter((p) => p.kind !== 'buc-dan') }, () => 0);
    expect(d).toBeNull();
    expect(scene.children).toHaveLength(0);
  });
});

describe('Tiếng dây gảy tự tổng hợp (Karplus–Strong)', () => {
  it('R-AM-2: tự sinh (không file), đỉnh ≈ 1, tắt dần, cuối nốt về 0, lần nào cũng như nhau', () => {
    const a = pluckSamples(293.66, 22050, 2.2, 7);
    expect(a.length).toBe(Math.round(22050 * 2.2));
    const peak = (from: number, to: number): number => {
      let m = 0;
      for (let i = from; i < to; i++) m = Math.max(m, Math.abs(a[i]));
      return m;
    };
    expect(peak(0, 2205)).toBeCloseTo(1, 6);
    expect(peak(22050, 24255)).toBeLessThan(0.5); // 1 s sau: nhỏ hẳn
    expect(a[a.length - 1]).toBe(0);
    expect(pluckSamples(293.66, 22050, 2.2, 7)).toEqual(a);
  });
});
