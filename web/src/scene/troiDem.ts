import * as THREE from 'three';
import { markDynamic } from './merge';
import type { DayNightSpec } from './ngayDem';
import { seededRandom } from './random';
import { makeCanvasTex } from './textures';

/** Trời đêm: hiện / ẩn theo mức đêm (0 = ẩn hẳn, không vẽ). */
export interface NightSky {
  set(dem: number): void;
}

/**
 * Sao + trăng (kế hoạch docs/tasks/2026-11-14-ngay-dem.md, NV5; R-NGAY-4): sao = một `Points` (cỡ cố định theo điểm ảnh,
 * không chịu sương) rải trên nửa vòm trời; trăng = một tấm luôn quay về camera, ảnh canvas đĩa tròn + quầng nhạt. Cả hai
 * đi theo camera (như vòm trời) nên không bao giờ bị tầm nhìn xa cắt; trong suốt + không ghi độ sâu → vẽ sau khối đặc, bị
 * nhà / núi che đúng. 2 draw call khi đêm, 0 khi ngày. `stars` false (mức Thấp — R-NGAY-4) = không sao, chỉ trăng.
 */
export function addNightSky(scene: THREE.Scene, dn: DayNightSpec, radius: number, stars: boolean): NightSky {
  const parts: { obj: THREE.Object3D; mat: THREE.Material & { opacity: number }; base: number }[] = [];
  const follow = (o: THREE.Object3D, place: (cam: THREE.Camera) => void): void => {
    o.frustumCulled = false;
    o.renderOrder = -9;
    o.onBeforeRender = (_r, _s, camera) => {
      place(camera);
      o.updateMatrixWorld();
    };
    o.visible = false;
    markDynamic(o);
    scene.add(o);
  };
  const s = dn.dem.stars;
  if (stars && s.count > 0) {
    const rnd = seededRandom(20261114);
    const pos = new Float32Array(s.count * 3);
    const col = new Float32Array(s.count * 3);
    const c = new THREE.Color(s.color);
    const d = new THREE.Vector3();
    for (let i = 0; i < s.count; i++) {
      // hướng đều trên nửa cầu trên, chừa dải sát chân trời (núi xa, sương)
      const y = 0.12 + rnd() * 0.88;
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(1 - y * y);
      d.set(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(radius);
      pos.set([d.x, d.y, d.z], i * 3);
      const b = 0.45 + 0.55 * rnd() * rnd(); // phần lớn sao mờ, ít sao sáng
      col.set([c.r * b, c.g * b, c.b * b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: s.size, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, opacity: 0 });
    mat.userData.ngayDem = 'bo';
    const pts = new THREE.Points(geo, mat);
    follow(pts, (cam) => pts.position.copy(cam.position));
    parts.push({ obj: pts, mat, base: 1 });
  }
  const m = dn.dem.moon;
  if (m.size > 0) {
    const tex = makeCanvasTex(128, 128, (g, w, h) => {
      const cx = w / 2;
      const halo = g.createRadialGradient(cx, h / 2, w * 0.2, cx, h / 2, w / 2);
      halo.addColorStop(0, 'rgba(255,255,255,0.35)');
      halo.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = halo;
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(cx, h / 2, w * 0.2, 0, Math.PI * 2);
      g.fill();
      // vài vết sẫm trên mặt trăng
      g.fillStyle = 'rgba(200,196,180,0.55)';
      for (const [x, y, r] of [[-0.05, -0.04, 0.05], [0.06, 0.05, 0.035], [0.02, -0.08, 0.025]] as const) {
        g.beginPath();
        g.arc(cx + x * w, h / 2 + y * h, r * w, 0, Math.PI * 2);
        g.fill();
      }
    });
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: m.color, transparent: true, depthWrite: false, fog: false, opacity: 0 });
    mat.userData.ngayDem = 'bo';
    // đĩa trăng chiếm 40 % cạnh ảnh → tấm to gấp 2,5 đường kính góc
    const disc = 2 * radius * Math.tan(((m.size / 2) * Math.PI) / 180);
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(disc * 2.5, disc * 2.5), mat);
    const dir = new THREE.Vector3(...m.position).normalize().multiplyScalar(radius);
    follow(moon, (cam) => {
      moon.position.copy(cam.position).add(dir);
      moon.quaternion.copy(cam.quaternion);
    });
    parts.push({ obj: moon, mat, base: 1 });
  }
  return {
    set(dem) {
      for (const p of parts) {
        p.obj.visible = dem > 0.01;
        p.mat.opacity = p.base * dem;
      }
    },
  };
}
