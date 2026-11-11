import * as THREE from 'three';
import type { Style } from './kien_truc/chi_tiet';
import { markDynamic } from './merge';
import type { Updater } from './props';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { makeCanvasTex } from './textures';

/** Tốc độ chảy (ô ảnh / giây): thác nhanh, suối chậm. */
const FALL_SPEED = 1.4;
const STREAM_SPEED = 0.25;

/** Vân nước: các vệt sáng dọc trên nền trắng (nhân với màu vật liệu). Lặp được theo cả hai chiều. */
function streakTex(dense: boolean): THREE.CanvasTexture {
  return makeCanvasTex(
    64,
    128,
    (g, w, h) => {
      g.fillStyle = '#d8e4ea';
      g.fillRect(0, 0, w, h);
      let seed = dense ? 7 : 3;
      const rnd = (): number => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < (dense ? 26 : 10); i++) {
        g.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.5})`;
        const x = rnd() * w;
        const y = rnd() * h;
        g.fillRect(x, y, dense ? 2 + rnd() * 3 : 6 + rnd() * 10, dense ? 20 + rnd() * 50 : 2 + rnd() * 2);
      }
    },
    [1, 1],
  );
}

/**
 * Thác (`terrain.waterfalls`): dải nước dựng đứng, vân chảy xuống, bọt trắng ở chân.
 * Suối (`terrain.streams`): dải nước bám mặt đất qua các điểm, vân chảy theo dòng. Không va chạm.
 * Trả về hàm cập nhật (dịch vân nước mỗi khung).
 */
export function addWaterways(scene: THREE.Scene, t: SceneSpec['terrain'], style: Style, groundY: GroundY): Updater {
  const moving: { tex: THREE.Texture; speed: number }[] = [];

  for (const f of t.waterfalls) {
    const h = Math.max(0.5, f.top - f.bottom);
    const tex = streakTex(true);
    tex.repeat.set(Math.max(1, f.width / 1.5), h / 3);
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(f.width, h),
      new THREE.MeshBasicMaterial({ color: '#e8f1f4', map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    );
    const g = new THREE.Group();
    g.position.set(f.x, 0, f.z);
    g.rotation.y = ((f.rotY ?? 0) * Math.PI) / 180;
    sheet.position.y = f.bottom + h / 2;
    g.add(sheet);
    const foam = new THREE.Mesh(
      new THREE.CircleGeometry(f.width * 0.75, 20),
      new THREE.MeshBasicMaterial({ color: '#f4f8f9', transparent: true, opacity: 0.85 }),
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(0, f.bottom + 0.08, 0.4);
    g.add(foam);
    markDynamic(g);
    scene.add(g);
    moving.push({ tex, speed: FALL_SPEED });
  }

  for (const s of t.streams) {
    // dày điểm mỗi ~1,5 m để dải bám theo mặt đất
    const pts: [number, number][] = [];
    for (let i = 0; i < s.points.length - 1; i++) {
      const [ax, az] = s.points[i];
      const [bx, bz] = s.points[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.5));
      for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
    }
    pts.push(s.points[s.points.length - 1]);
    const pos: number[] = [];
    const uv: number[] = [];
    let along = 0;
    pts.forEach(([x, z], i) => {
      const [nx, nz] = pts[Math.min(i + 1, pts.length - 1)];
      const [px, pz] = pts[Math.max(i - 1, 0)];
      const dx = nx - px;
      const dz = nz - pz;
      const len = Math.hypot(dx, dz) || 1;
      const ox = (dz / len) * (s.width / 2);
      const oz = (-dx / len) * (s.width / 2);
      if (i > 0) along += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]);
      for (const side of [-1, 1]) {
        const ex = x + side * ox;
        const ez = z + side * oz;
        pos.push(ex, groundY(ex, ez) + 0.06, ez);
        uv.push(side < 0 ? 0 : s.width / 2, along / 3);
      }
    });
    const idx: number[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const tex = streakTex(false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: style.water, map: tex, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    markDynamic(mesh);
    scene.add(mesh);
    moving.push({ tex, speed: STREAM_SPEED });
  }

  return (dt) => {
    for (const m of moving) m.tex.offset.y = (m.tex.offset.y + m.speed * dt) % 1;
  };
}
