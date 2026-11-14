import * as THREE from 'three';
import type { GroundY } from './terrainHeight';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { lambert } from './materials';
import type { SIDES, WaterSpec } from './spec';

/**
 * Ao / hồ: mặt nước phẳng sát mặt sân + bờ đá. Không đi xuống được: ao tròn = vật cản tròn bán kính r,
 * ao chữ nhật = hộp (quay bội 90 thì đổi rộng ↔ sâu). `sunk` > 0: mặt nước thấp hơn mặt đất (kênh có kè đá Giang Nam) —
 * bờ thành kè đá dựng đứng từ mặt nước lên mép.
 */
/** Độ cao bờ quanh ao / kênh: cao nhất trong 4 điểm cách mép 1,5 m. */
function bankY(p: WaterSpec, groundY: GroundY): number {
  const hw = (p.r ?? (p.w ?? 0) / 2) + 1.5;
  const hd = (p.r ?? (p.d ?? 0) / 2) + 1.5;
  return Math.max(groundY(p.x + hw, p.z), groundY(p.x - hw, p.z), groundY(p.x, p.z + hd), groundY(p.x, p.z - hd));
}

/** Hình lưỡi liềm trong mặt xy: đường tròn ngoài R tâm gốc trừ đường tròn trong 0,85 R lệch +0,45 R theo y. */
const IN_K = 0.85;
const IN_C = 0.45;
function crescentShape(R: number): THREE.Shape {
  const yi = (IN_C * IN_C - IN_K * IN_K + 1) / (2 * IN_C); // giao điểm (tỉ lệ R)
  const xi = Math.sqrt(1 - yi * yi);
  const a1 = Math.atan2(yi, xi);
  const s = new THREE.Shape();
  s.absarc(0, 0, R, a1, Math.PI - a1, true); // vòng ngoài qua đáy
  const b0 = Math.atan2(yi - IN_C, -xi);
  const b1 = Math.atan2(yi - IN_C, xi) + Math.PI * 2;
  s.absarc(0, IN_C * R, IN_K * R, b0, b1, false); // vòng trong qua đáy, quay về điểm đầu
  return s;
}

/** Vòng va chạm dọc thân lưỡi liềm (toạ độ cục bộ x, z sau khi nằm ngang): tâm giữa bờ ngoài và bờ trong. */
export function crescentCircles(R: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (0.18 + 0.64 * (i / 10)) + Math.PI; // nửa dưới (y âm)
    const ox = Math.cos(a) * R;
    const oy = Math.sin(a) * R;
    // bờ trong trên cùng tia từ gốc: |t·(cos,sin) − (0, c)| = k  →  t² − 2tc·sin + c² − k² = 0
    const c = IN_C * R;
    const k = IN_K * R;
    const sn = Math.sin(a);
    const disc = c * c * sn * sn - (c * c - k * k);
    const t = disc > 0 ? c * sn + Math.sqrt(disc) : 0;
    const ix = Math.cos(a) * t;
    const iy = Math.sin(a) * t;
    const th = Math.hypot(ox - ix, oy - iy);
    if (th < 0.6) continue;
    // mặt xy → nằm ngang: y → −z
    out.push([(ox + ix) / 2, -(oy + iy) / 2, th / 2 + 0.3]);
  }
  return out;
}

export function addWater(scene: THREE.Scene, colliders: Colliders, list: WaterSpec[], style: Style, groundY: GroundY = () => 0): void {
  if (list.length === 0) return;
  const waterMat = new THREE.MeshBasicMaterial({ color: style.water });
  const rimMat = lambert(style.stone);
  for (const p of list) {
    const sunk = p.sunk ?? 0;
    const g = new THREE.Group();
    // kênh có kè: lòng kênh là bục thấp trong địa hình → lấy độ cao bờ (ngoài mép 1,5 m) làm gốc, không lấy tâm
    const base = sunk > 0 ? bankY(p, groundY) : groundY(p.x, p.z);
    g.position.set(p.x, base, p.z);
    if (p.r !== undefined && p.shape === 'trang') {
      g.rotation.y = ((p.rotY ?? 0) * Math.PI) / 180;
      const surface = new THREE.Mesh(new THREE.ShapeGeometry(crescentShape(p.r), 24).rotateX(-Math.PI / 2), waterMat);
      surface.position.y = 0.06;
      g.add(surface);
      for (const [cx, cz, r] of crescentCircles(p.r)) {
        const rot = g.rotation.y;
        const wx = p.x + cx * Math.cos(rot) + cz * Math.sin(rot);
        const wz = p.z - cx * Math.sin(rot) + cz * Math.cos(rot);
        colliders.addCircle(wx, wz, r);
      }
    } else if (p.r !== undefined) {
      const surface = new THREE.Mesh(new THREE.CircleGeometry(p.r, 32), waterMat);
      surface.rotation.x = -Math.PI / 2;
      surface.position.y = 0.06 - sunk;
      g.add(surface);
      if (sunk > 0) {
        const wall = new THREE.Mesh(new THREE.CylinderGeometry(p.r, p.r, sunk, 32, 1, true), lambert(style.stone, { side: THREE.BackSide }));
        wall.position.y = -sunk / 2;
        g.add(wall);
      }
      const rim = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.28, 5, 32), rimMat);
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.1;
      g.add(rim);
      colliders.addCircle(p.x, p.z, p.r);
    } else if (p.w !== undefined && p.d !== undefined) {
      const rot = p.rotY ?? 0;
      g.rotation.y = (rot * Math.PI) / 180;
      const surface = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.d), waterMat);
      surface.rotation.x = -Math.PI / 2;
      surface.position.y = 0.06 - sunk;
      g.add(surface);
      // bờ dày 0,5 nằm giữa mép; kè (sunk) dày 1,2 lấn vào lòng nước 0,9 — che dải đất dốc của lưới địa hình (ô 1 m)
      const t = sunk > 0 ? 1.2 : 0.5;
      const k = sunk > 0 ? 0.3 : 0; // tâm bờ lùi vào trong bao nhiêu
      const edges: [string, number, number, number, number][] = [
        ['bac', 0, -p.d / 2 + k, p.w + t, t],
        ['nam', 0, p.d / 2 - k, p.w + t, t],
        ['tay', -p.w / 2 + k, 0, t, p.d + t],
        ['dong', p.w / 2 - k, 0, t, p.d + t],
      ];
      for (const [side, x, z, w, d] of edges) {
        if (p.open?.includes(side as (typeof SIDES)[number])) continue;
        // kè: từ dưới mặt nước lên cao 0,15 trên mặt đất
        const h = 0.3 + sunk;
        const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rimMat);
        e.position.set(x, 0.3 - h / 2, z);
        g.add(e);
      }
      if (rot % 180 !== 0) colliders.add(p.x, p.z, p.d, p.w);
      else colliders.add(p.x, p.z, p.w, p.d);
    }
    scene.add(g);
  }
}
