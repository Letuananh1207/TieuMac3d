import * as THREE from 'three';
import type { GroundY } from './terrainHeight';
import { lambert } from './materials';
import { brickTexture, paveTileM } from './environment';
import type { PathSpec, SceneSpec } from './spec';
import { SLAB_TILE_M, slabTex } from './textures';

/**
 * Lối lát đá: dải hơi nổi trên mặt sân (không đè hình nhau), không va chạm. Có địa hình: lưới bám theo độ cao mặt đất
 * (`groundY`) từng mét — lên xuống bục, gờ, dốc theo đất (L-3).
 * `pave` (đặc tả `buildingStyle.pathLook: "san"`): mặt lối là gạch của sân lát, UV theo toạ độ cảnh như sân
 * (`terrain.ts` `addPaving`) → lối chạy trên sân không lộ mạch lệch; bỏ qua màu `path` / `color` từng lối.
 */
export function addPaths(
  scene: THREE.Scene,
  paths: PathSpec[],
  defaultColor: string,
  groundY: GroundY = () => 0,
  pave?: SceneSpec['ground'],
): void {
  const base = new Map<string, THREE.CanvasTexture>();
  const paveTex = pave ? brickTexture(pave) : null;
  const paveTile = pave ? paveTileM(pave) : 1;
  paths.forEach((p, i) => {
    const color = p.color ?? defaultColor;
    let tex = paveTex ?? base.get(color);
    if (!tex) {
      tex = slabTex(color); // phiến đá so le, mép vát (2026-11-13)
      base.set(color, tex);
    }
    const [x1, z1] = p.from;
    const [x2, z2] = p.to;
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.01) return;
    const mat = lambert(0xffffff, { map: tex, polygonOffset: true, polygonOffsetFactor: -1 - i * 0.01 });
    // lưới bám mặt đất (L-3): chia theo chiều dài ≤ 1 m, 3 điểm theo bề ngang, mỗi điểm lấy độ cao mặt đất. Trước đây một
    // tứ giác nội suy thẳng giữa hai đầu → mặt đất ở giữa cao hơn (bục, gờ, nhiễu) là lối chìm mất. UV theo mét (1 lần lặp = SLAB_TILE_M)
    const lift = 0.03 + i * 0.001;
    const dx = (x2 - x1) / len;
    const dz = (z2 - z1) / len;
    const nx = dz; // vuông góc với hướng lối
    const nz = -dx;
    const segs = Math.max(1, Math.ceil(len));
    const across = 2;
    const pos: number[] = [];
    const uv: number[] = [];
    for (let a = 0; a <= segs; a++) {
      const t = (a / segs) * len;
      for (let b = 0; b <= across; b++) {
        const o = (b / across - 0.5) * p.width;
        const x = x1 + dx * t + nx * o;
        const z = z1 + dz * t + nz * o;
        pos.push(x, groundY(x, z) + lift, z);
        if (pave) uv.push(x / paveTile, -z / paveTile);
        else uv.push(((b / across) * p.width) / SLAB_TILE_M, t / SLAB_TILE_M);
      }
    }
    const idx: number[] = [];
    const w = across + 1;
    for (let a = 0; a < segs; a++) {
      for (let b = 0; b < across; b++) {
        const q = a * w + b;
        idx.push(q, q + w, q + 1, q + 1, q + w, q + w + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    if (geo.getAttribute('normal').getY(0) < 0) {
      // mặt luôn hướng lên: đảo chiều mọi tam giác
      for (let k = 0; k < idx.length; k += 3) [idx[k + 1], idx[k + 2]] = [idx[k + 2], idx[k + 1]];
      geo.setIndex(idx);
      geo.computeVertexNormals();
    }
    scene.add(new THREE.Mesh(geo, mat));
  });
}
