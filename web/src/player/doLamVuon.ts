/**
 * Đồ cầm tay làm vườn (R-VUON-13) dựng bằng code — khối đơn giản, sau thay hình (phiếu V-72): bình tưới, túi hạt, ống tre, bao
 * phân, giỏ. Mỗi món một lưới gộp màu đỉnh, cùng một vật liệu Lambert; chỉ món đang cầm hiện → **+1 draw call** khi làm vườn,
 * 0 khi không cầm. Gắn vào tay phải (xương `armR` của `autoRig`, tay áo đệ tử khối, hoặc xương bàn tay `RightHand` của Mixamo) ở
 * chỗ bàn tay; mỗi khung `pose()` xoay ngược lại góc tay để đồ đứng thẳng theo thân, rồi nghiêng theo `tilt` (bình chúc miệng).
 * `tip()` = miệng bình (tia nước).
 * - Mặc định (`autoRig` / đệ tử khối): bỏ góc của chính xương tay (`arm.quaternion`) — đồ đứng thẳng theo hông.
 * - `upright` (xương bất kỳ, nằm sâu trong cây xương, có thể co giãn riêng): đồ đứng thẳng theo vật mốc (thân nhân vật) — tính từ
 *   hướng thế giới của xương cha và vật mốc; cỡ bù co giãn của xương để đồ luôn cỡ `PROP_SCALE` theo vật mốc.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { painted } from '../scene/cayTrong';
import type { PropId } from './lamVuonDang';

/** Bình nghiêng hết (`tilt` = 1) bao nhiêu radian — miệng bình chúc xuống. */
const POUR_ANGLE = 0.9;
/** Phóng đồ cầm tay so với số đo thật (nhân vật chibi tay to, đồ thật trông bé quá). */
export const PROP_SCALE = 1.6;

const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, shade = 0.25): THREE.BufferGeometry =>
  painted(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c, shade);
const cyl = (r0: number, r1: number, h: number, c: string, seg = 8, shade = 0.25): THREE.BufferGeometry => painted(new THREE.CylinderGeometry(r0, r1, h, seg), c, shade);

function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  return mergeGeometries(parts) ?? parts[0];
}

/** Bình tưới đồng: thân trụ dưới tay, quai trên, vòi chéo ra trước (+z), sen ở đầu vòi. Gốc = chỗ tay nắm quai. */
function canGeometry(): { geo: THREE.BufferGeometry; tip: THREE.Vector3; dir: THREE.Vector3 } {
  const brass = '#b98a46';
  const body = cyl(0.1, 0.11, 0.18, brass).translate(0, -0.16, 0);
  const lid = cyl(0.07, 0.1, 0.03, '#c99b56', 8, 0).translate(0, -0.055, 0);
  const handle = painted(new THREE.TorusGeometry(0.06, 0.012, 4, 10, Math.PI).rotateY(Math.PI / 2).translate(0, -0.04, 0), '#8a6230');
  const dir = new THREE.Vector3(0, 0.55, 1).normalize();
  const spout = cyl(0.014, 0.022, 0.24, brass, 6, 0).rotateX(Math.atan2(dir.z, dir.y)).translate(0, -0.18 + dir.y * 0.12, 0.09 + dir.z * 0.12);
  const tip = new THREE.Vector3(0, -0.18 + dir.y * 0.25, 0.09 + dir.z * 0.25);
  const rose = cyl(0.035, 0.02, 0.03, '#d4ad6a', 6, 0).rotateX(Math.atan2(dir.z, dir.y)).translate(tip.x, tip.y, tip.z);
  return { geo: merged([body, lid, handle, spout, rose]), tip, dir };
}

const PROPS: Record<Exclude<PropId, 'binh'>, () => THREE.BufferGeometry> = {
  // túi vải buộc dây, miệng hé hạt vàng
  'tui-hat': () => merged([cyl(0.07, 0.09, 0.14, '#c9b48a').translate(0, -0.09, 0.02), cyl(0.05, 0.05, 0.02, '#e6c34f', 6, 0).translate(0, -0.015, 0.02), box(0.11, 0.015, 0.015, 0, -0.03, 0.02, '#7a5230', 0)]),
  // ống tre có đốt, nắp lá
  'ong-tre': () => merged([cyl(0.04, 0.04, 0.24, '#93a85a', 7).translate(0, -0.1, 0.02), cyl(0.045, 0.045, 0.02, '#6f8441', 7, 0).translate(0, -0.06, 0.02), cyl(0.045, 0.04, 0.03, '#5f8a3e', 7, 0).translate(0, 0.03, 0.02)]),
  // bao gai nâu buộc túm, hạt phân sẫm
  'bao-phan': () => merged([painted(new THREE.SphereGeometry(0.1, 8, 6).scale(1, 1.1, 0.8).translate(0, -0.13, 0.03), '#a07a4e', 0.3), cyl(0.03, 0.05, 0.05, '#8c6a42', 6, 0).translate(0, -0.02, 0.03), cyl(0.04, 0.04, 0.01, '#4e3a2a', 6, 0).translate(0, 0.005, 0.03)]),
  // giỏ tre đan: lòng giỏ + vành + quai cong
  gio: () =>
    merged([
      cyl(0.15, 0.1, 0.12, '#c8a464', 10).translate(0, -0.2, 0.04),
      painted(new THREE.TorusGeometry(0.15, 0.015, 4, 12).rotateX(Math.PI / 2).translate(0, -0.14, 0.04), '#a8844a', 0),
      painted(new THREE.TorusGeometry(0.14, 0.012, 4, 10, Math.PI).translate(0, -0.14, 0.04), '#a8844a', 0),
    ]),
};

export interface GardenProps {
  /** gắn vào tay (con của xương / tay áo); [hand] = chỗ bàn tay trong toạ độ của tay */
  readonly holder: THREE.Group;
  /** món đang hiện; `null` = tay không */
  show(id: PropId | null): void;
  /** mỗi khung sau khi đặt góc tay: xoay ngược [arm] cho đồ đứng thẳng theo thân, rồi nghiêng [tilt] (0…1) */
  pose(arm: THREE.Object3D, tilt: number): void;
  /** miệng bình (toạ độ thế giới) + hướng tia; không cầm bình → false */
  tip(out: THREE.Vector3, dir?: THREE.Vector3): boolean;
}

export function createGardenProps(parent: THREE.Object3D, hand: THREE.Vector3, opts: { upright?: THREE.Object3D } = {}): GardenProps {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const holder = new THREE.Group();
  holder.position.copy(hand);
  holder.scale.setScalar(PROP_SCALE);
  parent.add(holder);
  const can = canGeometry();
  const meshes = new Map<PropId, THREE.Mesh>();
  const add = (id: PropId, g: THREE.BufferGeometry): void => {
    const m = new THREE.Mesh(g, mat);
    m.visible = false;
    m.frustumCulled = false; // con của xương — khối bao không theo tay
    holder.add(m);
    meshes.set(id, m);
  };
  add('binh', can.geo);
  for (const [id, make] of Object.entries(PROPS)) add(id as PropId, make());
  let shown: PropId | null = null;
  const tipLocal = new THREE.Object3D();
  tipLocal.position.copy(can.tip);
  meshes.get('binh')!.add(tipLocal);
  const tiltQ = new THREE.Quaternion();
  const xAxis = new THREE.Vector3(1, 0, 0);
  const q = new THREE.Quaternion();
  const qRef = new THREE.Quaternion();
  const sRef = new THREE.Vector3();
  const sPar = new THREE.Vector3();
  const ref = opts.upright;
  return {
    holder,
    show(id) {
      if (id === shown) return;
      if (shown) meshes.get(shown)!.visible = false;
      shown = id;
      if (id) meshes.get(id)!.visible = true;
    },
    pose(arm, tilt) {
      // đồ đứng thẳng theo thân: bỏ góc tay; bình chúc miệng ra trước (+z xuống dưới) theo tilt
      tiltQ.setFromAxisAngle(xAxis, POUR_ANGLE * Math.min(1, Math.max(0, tilt)));
      if (!ref) {
        holder.quaternion.copy(q.copy(arm.quaternion).invert()).multiply(tiltQ);
        return;
      }
      // hướng thế giới: cha⁻¹ · mốc · nghiêng; cỡ: PROP_SCALE theo mốc, chia co giãn của xương cha
      parent.updateWorldMatrix(true, false);
      parent.getWorldQuaternion(q).invert();
      ref.getWorldQuaternion(qRef);
      holder.quaternion.copy(q).multiply(qRef).multiply(tiltQ);
      ref.getWorldScale(sRef);
      parent.getWorldScale(sPar);
      holder.scale.set((PROP_SCALE * sRef.x) / sPar.x, (PROP_SCALE * sRef.y) / sPar.y, (PROP_SCALE * sRef.z) / sPar.z);
    },
    tip(out, dir) {
      if (shown !== 'binh') return false;
      tipLocal.getWorldPosition(out);
      if (dir) {
        const m = meshes.get('binh')!;
        dir.copy(can.dir).transformDirection(m.matrixWorld);
      }
      return true;
    },
  };
}
