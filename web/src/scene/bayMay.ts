/**
 * Cảnh bay biển mây của hoạt cảnh cưỡi hạc (R-HANH-5, khúc 3): một `THREE.Scene` riêng, nhẹ, dựng từ đặc tả **nơi đến**
 * (trời, sương, đèn, núi xa) + mặt biển mây + mây phồng (bỏ ở mức Thấp) + hạc; màu theo giờ (ngày đêm — `apGio.ts`, áp một
 * lần). Hạc lượn vòng rộng quanh tâm cảnh nên núi xa trôi chậm, mây phồng lướt qua. Chạy cùng renderer với cảnh thật
 * trong lúc cảnh thật dựng ngầm; xong thì `dispose()`.
 * Ngân sách: trời 1 + núi xa 1–2 + biển mây 1 + mây phồng 1 + sao / trăng 0–2 + hạc 3 + nhân vật ≈ 12 draw call.
 */
import * as THREE from 'three';
import { createDayNight } from './apGio';
import { addEnvironment } from './environment';
import { addFarMountains, viewDistance } from './farMountains';
import { Crane } from './hac';
import { flightCamera, type V3 } from './hacDuong';
import { viewLayers } from './layers';
import { dayNightTag } from './materials';
import { phaNgay } from './ngayDem';
import { seededRandom } from './random';
import { puffGeometry } from './sky';
import type { SceneSpec } from './spec';
import { addNightSky } from './troiDem';

/** Độ cao bay so với mặt cảnh (m) — núi xa (chân −20…−40, đỉnh 24…88 m) nhô lên khỏi biển mây. */
export const FLY_Y = 6;
/** Mặt biển mây thấp hơn hạc bấy nhiêu mét. */
const SEA_BELOW = 11;
/** Bán kính vòng lượn quanh tâm cảnh (m) và tốc độ bay (m/s). */
const LOOP_R = 46;
const FLY_SPEED = 13;
/** Mây phồng: trên mặt biển · ngang tầm bay (lướt qua camera) */
const SEA_PUFFS = 46;
const NEAR_PUFFS = 10;

export interface FlightScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly crane: Crane;
  /** vị trí chỗ ngồi + hướng bay — để đặt nhân vật (bên gọi đặt, không thêm vào cảnh này lúc áp giờ) */
  readonly seat: THREE.Vector3;
  heading: number;
  update(dt: number, aspect: number): void;
  dispose(): void;
}

/**
 * `detail` < 1 (mức Thấp — R-HIEU-1): không mây phồng, núi xa không dải sương. `gio`: giờ VN (0–24) để áp màu ngày đêm.
 * `colorManaged`: theo `look` của cảnh nơi đến (như `createStage`).
 */
export function buildFlight(spec: SceneSpec, detail: number, gio: number, colorManaged: boolean): FlightScene {
  const scene = new THREE.Scene();
  const far = viewDistance(spec);
  const camera = new THREE.PerspectiveCamera(spec.camera.fov, 1, 0.3, far);
  viewLayers(camera, false); // thân nhân vật ở lớp riêng (scene/layers.ts) — camera ngôi 3 thấy
  const env = addEnvironment(scene, spec, far);
  addFarMountains(scene, spec, detail);
  const [cx, cz] = spec.terrain.center;
  const seaY = FLY_Y - SEA_BELOW;
  const seaColor = spec.cloudSea.radius > 0 ? spec.cloudSea.color : spec.floating.clouds.color;
  const owned: { dispose(): void }[] = [];
  const sea = new THREE.Mesh(new THREE.CircleGeometry(far, 48), dayNightTag(new THREE.MeshBasicMaterial({ color: seaColor, fog: false }), 'xa'));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(cx, seaY, cz);
  scene.add(sea);
  owned.push(sea.geometry, sea.material);
  if (detail >= 1) {
    const puffs = new THREE.InstancedMesh(
      puffGeometry(seaColor, spec.look.cloudBelly),
      dayNightTag(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }), 'xa'),
      SEA_PUFFS + NEAR_PUFFS,
    );
    const rand = seededRandom(spec.trees.seed * 13 + 7);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < SEA_PUFFS + NEAR_PUFFS; i++) {
      const nearBand = i >= SEA_PUFFS;
      const a = rand() * Math.PI * 2;
      const r = nearBand ? LOOP_R + (rand() < 0.5 ? -1 : 1) * (9 + rand() * 8) : 12 + rand() * 120;
      const y = nearBand ? FLY_Y - 3 + rand() * 5 : seaY + 0.3;
      const s = nearBand ? 1.4 + rand() * 1.4 : 3 + rand() * 5;
      q.setFromAxisAngle(up, rand() * Math.PI);
      m.compose(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r), q, new THREE.Vector3(s * 1.4, s * (nearBand ? 0.8 : 0.45), s));
      puffs.setMatrixAt(i, m);
    }
    puffs.frustumCulled = false;
    scene.add(puffs);
    owned.push(puffs.geometry, puffs.material as THREE.Material);
  }
  const dn = spec.dayNight;
  if (dn.enabled) {
    // áp giờ một lần, TRƯỚC khi thêm hạc / nhân vật: vật liệu nhân vật dùng chung với cảnh thật — không được nhân màu đêm hai lần
    const sky = addNightSky(scene, dn, far * 0.72, detail >= 1);
    createDayNight(scene, spec, env, { glow: null, sky, colorManaged }).apply(phaNgay(gio, dn.moc), 0);
  }
  const crane = new Crane(spec.crane);
  crane.fold = 0;
  scene.add(crane.root);
  const seat = new THREE.Vector3();
  let a = Math.PI * 0.5;
  let t = 0;
  const look = new THREE.Vector3();
  const flight: FlightScene = {
    scene,
    camera,
    crane,
    seat,
    heading: 0,
    update(dt, aspect) {
      t += dt;
      a += (dt * FLY_SPEED) / LOOP_R;
      // bay ngược chiều kim đồng hồ nhìn từ trên: tiếp tuyến (−sin a, cos a)
      const x = cx + Math.cos(a) * LOOP_R;
      const z = cz + Math.sin(a) * LOOP_R;
      const bob = Math.sin(t * 1.6) * 0.35;
      flight.heading = Math.atan2(-Math.sin(a), Math.cos(a));
      crane.root.position.set(x, FLY_Y + bob, z);
      crane.root.rotation.set(0, flight.heading, 0);
      crane.root.rotateZ(-0.12); // nghiêng nhẹ vào trong vòng lượn
      crane.update(dt, 0.55, 3.2, 0.3);
      crane.seatWorld(seat);
      const cam = flightCamera([x, FLY_Y + bob, z] as V3, flight.heading, Math.sin(t * 3.2));
      camera.position.set(...cam.pos);
      camera.lookAt(look.set(...cam.look));
      if (Math.abs(camera.aspect - aspect) > 1e-3) {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      }
    },
    dispose() {
      crane.dispose();
      for (const o of owned) o.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          for (const mat of Array.isArray(o.material) ? o.material : [o.material]) mat.dispose();
        }
      });
      scene.clear();
    },
  };
  flight.update(0, 1);
  return flight;
}
