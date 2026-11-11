import * as THREE from 'three';
import type { GroundY } from './terrainHeight';
import { lambert } from './materials';
import type { PathSpec } from './spec';
import { makeCanvasTex } from './textures';

/** Ô đá lát (texture 1 × 1 m), tô theo màu gốc: viền mạch tối, đá sáng tối ngẫu nhiên. */
function stoneTex(color: string): THREE.CanvasTexture {
  return makeCanvasTex(
    128,
    128,
    (g) => {
      g.fillStyle = color;
      g.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const shade = (Math.random() - 0.5) * 0.12; // đá sáng tối khác nhau một chút
          g.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`;
          g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        }
      }
      g.strokeStyle = 'rgba(0,0,0,0.22)'; // mạch vữa mảnh
      g.lineWidth = 2;
      g.strokeRect(1, 1, 126, 126);
      g.beginPath();
      g.moveTo(64, 0);
      g.lineTo(64, 128);
      g.moveTo(0, 64);
      g.lineTo(128, 64);
      g.stroke();
    },
    [1, 1],
  );
}

/**
 * Lối lát đá: dải hơi nổi trên mặt sân (không đè hình nhau), không va chạm. Có địa hình: hai đầu đặt theo độ cao mặt đất
 * (`groundY`), dải nghiêng đều giữa hai bục cao thấp khác nhau.
 */
export function addPaths(scene: THREE.Scene, paths: PathSpec[], defaultColor: string, groundY: GroundY = () => 0): void {
  const base = new Map<string, THREE.CanvasTexture>();
  paths.forEach((p, i) => {
    const color = p.color ?? defaultColor;
    let tex = base.get(color);
    if (!tex) {
      tex = stoneTex(color);
      base.set(color, tex);
    }
    const [x1, z1] = p.from;
    const [x2, z2] = p.to;
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.01) return;
    const mat = lambert(0xffffff, { map: tex, polygonOffset: true, polygonOffsetFactor: -1 - i * 0.01 });
    // tứ giác: hai mép dọc theo from → to, cao theo mặt đất hai đầu; UV theo mét (1 ô ảnh = 1,2 m)
    const lift = 0.02 + i * 0.001;
    const ya = groundY(x1, z1) + lift;
    const yb = groundY(x2, z2) + lift;
    const px = ((z2 - z1) / len) * (p.width / 2); // vuông góc với hướng lối
    const pz = (-(x2 - x1) / len) * (p.width / 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([x1 - px, ya, z1 - pz, x1 + px, ya, z1 + pz, x2 + px, yb, z2 + pz, x2 - px, yb, z2 - pz], 3));
    const u = p.width / 1.2;
    const v = len / 1.2;
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, v], 2));
    geo.setIndex([0, 2, 1, 0, 3, 2]);
    geo.computeVertexNormals();
    if (geo.getAttribute('normal').getY(0) < 0) geo.setIndex([0, 1, 2, 0, 2, 3]); // mặt luôn hướng lên
    geo.computeVertexNormals();
    scene.add(new THREE.Mesh(geo, mat));
  });
}
