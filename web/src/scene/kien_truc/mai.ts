/**
 * Mái kiểu Trung Hoa, low-poly: hiên váy (chóp cụt), mái chái, mái hai mái, nóc có hai đầu cong (si vẫn), đầu đao
 * vểnh ở góc. Mọi hàm thêm khối vào nhóm `g` của nhà; toạ độ theo hệ của nhà (mặt trước nhìn +z).
 */
import * as THREE from 'three';
import { lambert } from '../materials';
import { frustum, prism } from './hinh';

/** Vật liệu mái hai mặt: nhìn từ dưới hiên lên vẫn thấy mái đặc, không thủng. */
export function roofMat(color: string): THREE.MeshLambertMaterial {
  return lambert(color, { side: THREE.DoubleSide });
}

const tipGeo = new THREE.ConeGeometry(0.18, 1.2, 5);

/** Đầu đao: mũi nhọn ở 4 góc hiên (nửa rộng `hw`, nửa sâu `hd`), ngả ra ngoài, chĩa lên. */
export function cornerTips(g: THREE.Group, y: number, hw: number, hd: number, color: string, size = 1): void {
  const mat = lambert(color);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const tip = new THREE.Mesh(tipGeo, mat);
      tip.scale.setScalar(size);
      tip.position.set(sx * hw, y + 0.3 * size, sz * hd);
      tip.rotation.order = 'YXZ';
      tip.rotation.y = Math.atan2(sx, sz);
      tip.rotation.x = 0.9;
      g.add(tip);
    }
  }
}

/** Hiên váy: chóp cụt từ đáy `bw` × `bd` (mép hiên, ở `y`) lên đỉnh `tw` × `td`, cao `h`. */
export function skirt(g: THREE.Group, y: number, bw: number, bd: number, tw: number, td: number, h: number, color: string): void {
  const m = new THREE.Mesh(frustum(bw, bd, tw, td, h), roofMat(color));
  m.position.y = y;
  g.add(m);
}

/** Bờ nóc dài `len` ở độ cao `y`, hai đầu có sừng cong (si vẫn) vểnh lên. */
export function ridge(g: THREE.Group, y: number, len: number, color: string, horns = true): void {
  const mat = lambert(color);
  const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.28, 0.32), mat);
  r.position.y = y;
  g.add(r);
  if (!horns) return;
  for (const s of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.3), mat);
    horn.position.set(s * (len / 2 - 0.05), y + 0.32, 0);
    horn.rotation.z = -s * 0.45; // vểnh ra ngoài
    g.add(horn);
  }
}

/**
 * Mái chái một tầng (giảng đường, hiên dưới của điện): hiên vươn `over` mỗi bên, cao `h`; nóc dài = rộng − sâu.
 * `tips` = đầu đao ở 4 góc.
 */
export function hipRoof(
  g: THREE.Group,
  o: { y: number; w: number; d: number; over: number; h: number; color: string; ridgeColor: string; tips?: boolean },
): void {
  const bw = o.w + 2 * o.over;
  const bd = o.d + 2 * o.over;
  const top = Math.max(0.6, bw - bd);
  skirt(g, o.y, bw, bd, top, 0, o.h, o.color);
  ridge(g, o.y + o.h, top + 0.6, o.ridgeColor);
  if (o.tips !== false) cornerTips(g, o.y, bw / 2 - 0.1, bd / 2 - 0.1, o.ridgeColor);
}

/**
 * Mái yết sơn (hip-and-gable): hiên váy thấp vươn `over`, trên là mái hai mái có đầu hồi tam giác,
 * bờ nóc sẫm hai đầu cong. Tổng cao ≈ `h`.
 */
export function gableHipRoof(
  g: THREE.Group,
  o: { y: number; w: number; d: number; over: number; h: number; color: string; ridgeColor: string },
): void {
  const bw = o.w + 2 * o.over;
  const bd = o.d + 2 * o.over;
  const skirtH = o.h * 0.35;
  // váy dốc thoải tới mép thân, rồi mái hai mái phủ lên trên
  skirt(g, o.y, bw, bd, o.w + 0.4, o.d * 0.7, skirtH, o.color);
  const top = new THREE.Mesh(prism(o.w + 0.6, o.d * 0.7 + 0.6, o.h - skirtH), roofMat(o.color));
  top.position.y = o.y + skirtH - 0.05;
  g.add(top);
  ridge(g, o.y + o.h - 0.05, o.w + 1, o.ridgeColor);
  cornerTips(g, o.y, bw / 2 - 0.1, bd / 2 - 0.1, o.ridgeColor);
}

/** Mái hai mái (nhà nhỏ): nóc thẳng, hai đầu hơi vểnh. */
export function gableRoof(
  g: THREE.Group,
  o: { y: number; w: number; d: number; over: number; h: number; color: string; ridgeColor: string },
): void {
  const m = new THREE.Mesh(prism(o.w + 2 * o.over, o.d + 2 * o.over, o.h), roofMat(o.color));
  m.position.y = o.y;
  g.add(m);
  ridge(g, o.y + o.h, o.w + 2 * o.over + 0.2, o.ridgeColor);
}
