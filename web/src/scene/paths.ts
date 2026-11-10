import * as THREE from 'three';
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

/** Lối lát đá: dải phẳng hơi nổi trên mặt sân (không đè hình nhau), không va chạm. */
export function addPaths(scene: THREE.Scene, paths: PathSpec[], defaultColor: string): void {
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
    const t = tex.clone();
    t.repeat.set(p.width / 1.2, len / 1.2);
    const mat = lambert(0xffffff, { map: t, polygonOffset: true, polygonOffsetFactor: -1 - i * 0.01 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(p.width, len), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.atan2(x2 - x1, z2 - z1); // trục dài của mặt phẳng (y cục bộ) quay về hướng from → to
    m.position.set((x1 + x2) / 2, 0.02 + i * 0.001, (z1 + z2) / 2);
    scene.add(m);
  });
}
