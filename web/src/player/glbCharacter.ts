import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { autoRig, type Rig } from './autoRig';
import { emotePose } from './bieuCamDang';
import { CHAO, diCuDang, diCuMoi, diCuTien, dungLauDang, gayDanDang, goMoDang, NGOI7, NHAY7, NHIN_QUANH, REST, VUON_VAI } from './dang7';
import type { Character, ToolTip } from './character';
import type { DongTac } from './dongTac';
import { mixamoCharacter, type MixamoOpts } from './mixamoCharacter';
import { mixamoRig } from './mixamoRig';
import { createMiMat, type MiMat } from './miMat';
import { createGardenProps, type GardenProps } from './doLamVuon';
import { isWork, PROP_OF, workPose } from './lamVuonDang';
import { RUN_SPEED } from './controller';

/** Chiều cao nhân vật sau khi nạp (m) — bằng đệ tử khối (búi tóc ~2,1 m), thước chuẩn của cảnh. */
export const GLB_HEIGHT = 2.1;

/** Góc hạ tay từ tư thế chữ A xuống buông xuôi (radian, quanh khớp vai) — chung với dáng 7 khớp (`dang7.ts`). */
const ARM_REST = REST;
/** Tay hơi đưa ra trước khi đứng thả lỏng (radian). */
const ARM_FORWARD = 0.12;
/** Bàn tay phải trong toạ độ xương `armR` (tay chữ A chưa hạ — `autoRig` DEFAULT_SHAPE: vai 53 % → tay ~29 % cao). */
const HAND_R = new THREE.Vector3(-0.19, -0.5, 0.04);

/** Model `.glb` đã chuẩn hoá (dùng chung cho nhân vật chính và NPC — `npc.ts`). */
export interface GlbModel {
  gltf: Awaited<ReturnType<GLTFLoader['loadAsync']>>;
  /** cảnh của file, đã co giãn cao `GLB_HEIGHT`, chân y = 0, tâm x/z về gốc */
  model: THREE.Object3D;
  /** gốc đặt vị trí, có bóng giả */
  root: THREE.Group;
  /** con của `root`, xoay theo hướng nhìn */
  body: THREE.Group;
  /** con của `body`, nhún / thở; chưa chứa `model` (nơi gọi tự gắn, có thể qua xương) */
  bob: THREE.Group;
}

/** Nạp file, đổi vật liệu (giữ không-sáng), chuẩn cỡ, dựng khung root → body → bob + bóng giả. */
export async function loadGlbModel(url: string): Promise<GlbModel> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder); // file nén bằng gltfpack (docs/ai3d.md bước 4)
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  model.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    // model "chỉ tạo hình" (Hunyuan3D bước shape) không có pháp tuyến → Lambert ra đen; tự tính
    if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
    const toLambert = (m: THREE.Material): THREE.Material => {
      // model đánh dấu không-sáng (KHR_materials_unlit → MeshBasicMaterial): texture đã nướng sẵn ánh sáng, giữ nguyên
      if (m instanceof THREE.MeshBasicMaterial) return m;
      const src = m as THREE.MeshStandardMaterial;
      const lambert = new THREE.MeshLambertMaterial({
        color: src.color ?? 0xffffff,
        map: src.map ?? null,
        vertexColors: src.vertexColors,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
      });
      m.dispose();
      return lambert;
    };
    o.material = Array.isArray(o.material) ? o.material.map(toLambert) : toLambert(o.material);
  });

  // co giãn về chiều cao chuẩn, chân chạm đất, tâm về gốc
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  if (!(size.y > 0)) throw new Error(`glbCharacter: model rỗng (${url})`);
  const k = GLB_HEIGHT / size.y;
  model.scale.setScalar(k);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x * k, -box.min.y * k, -center.z * k);

  const root = new THREE.Group();
  const body = new THREE.Group(); // xoay theo hướng đi
  const bob = new THREE.Group(); // nhún khi không có clip
  root.add(body);
  body.add(bob);

  // bóng giả như đệ tử khối (không shadow realtime — quy tắc 4)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(0.45, Math.max(size.x, size.z) * k * 0.45), 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);
  return { gltf, model, root, body, bob };
}

/**
 * Nhân vật từ file `.glb` (model AI đã làm sạch — docs/ai3d.md, quyết định 0003), cùng hợp đồng `Character` với đệ tử
 * khối nên `PlayerController` không đổi.
 * - Cỡ: co giãn đều cho cao `GLB_HEIGHT`, chân chạm y = 0, tâm x/z về gốc. Mặt trước model nhìn về +z (như đệ tử khối).
 * - Vật liệu: đổi sang Lambert (quy tắc 4 — rẻ, không cần đèn môi trường), giữ màu / texture / màu đỉnh.
 * - Động tác: xương chuẩn Mixamo → mọi dáng bằng code (`mixamoCharacter.ts`, R-NPC-10, `opts.tinh` / `opts.player`); model có clip tên chứa `idle` / `walk` → `AnimationMixer`, trộn theo tốc độ; không có clip (model AI
 *   thường chưa có xương) → nhún nhẹ + nghiêng khi đi.
 * Lỗi nạp → Promise bị từ chối; nơi gọi dùng đệ tử khối dự phòng.
 */
export async function loadGlbCharacter(
  url: string,
  opts: MixamoOpts = {},
): Promise<Character & ToolTip & { readonly dong?: DongTac; readonly mi?: MiMat | null }> {
  const { gltf, model, root, body, bob } = await loadGlbModel(url);

  // xương chuẩn Mixamo (model Tripo — R-NPC-10): mọi dáng bằng code (`mixamoCharacter.ts`), bỏ qua clip đi kèm file
  const mx = mixamoRig(model);
  // mí mắt (R-MAT-1): dựng ngay lúc nạp, gắn xương Head — trước khi nơi gọi gán lớp / quét vật liệu ngày đêm
  if (mx) return mixamoCharacter({ root, body, bob, model }, mx, opts, createMiMat(model, mx.bone('head')!, url));

  const clip = (name: string): THREE.AnimationClip | undefined =>
    gltf.animations.find((a) => a.name.toLowerCase().includes(name));
  const idleClip = clip('idle');
  const walkClip = clip('walk');
  const mixer = idleClip || walkClip ? new THREE.AnimationMixer(model) : null;
  // không có clip (model AI chưa gắn xương) → tự gắn xương để có động tác đi / đứng lập trình sẵn
  let rig: Rig | null = null;
  if (mixer) bob.add(model);
  else {
    const rigged = autoRig(model, GLB_HEIGHT);
    rig = rigged.rig;
    bob.add(rigged.group);
  }
  const hipY = rig ? rig.hips.position.y : 0;
  // đồ cầm tay làm vườn ở bàn tay phải (R-VUON-13) — chỉ model tự gắn xương; dựng khi cầm lần đầu (NPC không cầm)
  let props: GardenProps | null = null;
  const idle = mixer && idleClip ? mixer.clipAction(idleClip) : null;
  const walk = mixer && walkClip ? mixer.clipAction(walkClip) : null;
  idle?.play();
  walk?.play();

  // cường độ bước, hoà chạy (R-DIEU-5), nhảy (R-DIEU-6), pha bước — dáng đi `dang7.ts` (nhân vật chính Mixamo dùng chung, L-18)
  const di = diCuMoi();
  let time = 0;
  const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
  const ease = (x: number): number => {
    const t = Math.min(1, Math.max(0, x));
    return t * t * (3 - 2 * t);
  };
  return {
    root,
    facing: body,
    toolTip: (out, dir) => props?.tip(out, dir) ?? false,
    animate(dt, speed, state) {
      const mps = state?.mps ?? speed * RUN_SPEED;
      const { move, runB, airB } = diCuTien(di, dt, mps, !!state?.air);
      const sitB = ease(state?.sit ?? 0);
      const bowB = ease(state?.bow ?? 0);
      if (mixer) {
        if (walk) walk.setEffectiveWeight(idle ? move : 1).setEffectiveTimeScale(0.6 + 0.6 * move + 0.6 * runB);
        if (idle) idle.setEffectiveWeight(walk ? 1 - move : 1);
        mixer.update(dt);
        return;
      }
      time += dt;
      // nhịp bước theo tốc độ thật (R-DIEU-5) — `diCuTien`; góc đi / chạy — `diCuDang`
      const d = diCuDang(di);
      const step = d.step;
      bob.position.y = d.lift - NGOI7.drop * sitB;
      bob.rotation.x = d.lean;
      if (!rig) {
        bob.rotation.z = step * 0.03 * move;
        return;
      }
      const still = (1 - move) * (1 - sitB) * (1 - airB);
      // động tác khi đứng lâu (R-DIEU-8): sau 6 s, mỗi 8 s một lần — vươn vai, rồi nhìn quanh
      const { stretch, look } = dungLauDang(state?.idle ?? 0);

      /* ---- chân ---- */
      let lL = d.legL;
      let lR = d.legR;
      lL = mix(lL, NHAY7.legL, airB); // nhảy: gối trước co lên, chân sau duỗi
      lR = mix(lR, NHAY7.legR, airB);
      rig.legL.rotation.x = mix(lL, NGOI7.legs, sitB); // ngồi thiền: hai chân xếp ra trước
      rig.legR.rotation.x = mix(lR, NGOI7.legs, sitB);
      rig.legL.rotation.z = NGOI7.legZ * sitB;
      rig.legR.rotation.z = -NGOI7.legZ * sitB;

      /* ---- tay ---- tay trái ở +x: rotation.z âm = khép vào thân */
      let aLx = -ARM_FORWARD + d.armL + Math.sin(time * 1.3) * 0.04 * still;
      let aRx = -ARM_FORWARD + d.armR + Math.sin(time * 1.3 + 1.7) * 0.04 * still;
      const swayL = d.sway + (Math.sin(time * 2) * 0.5 + 0.5) * 0.03 * still;
      const swayR = d.sway + (Math.sin(time * 2 + 1.1) * 0.5 + 0.5) * 0.03 * still;
      let aLz = -(ARM_REST - swayL);
      let aRz = ARM_REST - swayR;
      // nhảy: tay giang ra giữ thăng bằng
      aLz = mix(aLz, NHAY7.aLz, airB);
      aRz = mix(aRz, NHAY7.aRz, airB);
      // ngồi thiền: tay đặt lên gối
      aLx = mix(aLx, NGOI7.aLx, sitB);
      aRx = mix(aRx, NGOI7.aRx, sitB);
      aLz = mix(aLz, NGOI7.aLz, sitB);
      aRz = mix(aRz, NGOI7.aRz, sitB);
      // chắp tay chào (拱手): hai tay đưa lên trước ngực, khép vào giữa
      aLx = mix(aLx, CHAO.aLx, bowB);
      aRx = mix(aRx, CHAO.aRx, bowB);
      aLz = mix(aLz, CHAO.aLz, bowB);
      aRz = mix(aRz, CHAO.aRz, bowB);
      // vươn vai: hai tay giơ cao
      aLz = mix(aLz, VUON_VAI.aLz, stretch);
      aRz = mix(aRz, VUON_VAI.aRz, stretch);
      // gõ mõ (R-NPC-8, có `strike`): tay trái đưa mõ ra trước ngang ngực, tay phải giơ dùi cao theo `strike` (1 = giơ cao)
      const hit = state?.strike;
      if (hit !== undefined) ({ aLx, aLz, aRx, aRz } = goMoDang(hit));
      // gảy đàn (R-NPC-9, có `pluck`): hai tay đưa ra trước, hạ xuống mặt đàn; tay trái nhấn dây đung đưa chậm (rung
      // tiếng), tay phải nhấc theo `pluck` (0 = vừa gảy)
      const pl = state?.pluck;
      if (pl !== undefined) ({ aLx, aLz, aRx, aRz } = gayDanDang(pl, time));
      // biểu cảm (R-BIEU-2, dáng `bieuCamDang.ts`): trộn đè lên dáng đứng theo trọng số vào / ra
      // làm vườn (R-VUON-13, dáng `lamVuonDang.ts`): trộn cùng cách, biểu cảm đang diễn thì thắng
      const wk = state?.work;
      const wp = !state?.emote && wk ? workPose(wk.id, wk.t, wk.len) : null;
      const em = state?.emote ? emotePose(state.emote.id, state.emote.t, state.emote.len) : wp;
      const ew = em ? em.w * (1 - move) * (1 - airB) : 0;
      if (em && ew > 0) {
        aLx = mix(aLx, em.aLx, ew);
        aRx = mix(aRx, em.aRx, ew);
        aLz = mix(aLz, em.aLz, ew);
        aRz = mix(aRz, em.aRz, ew);
        bob.position.y += em.lift * ew;
        if (em.legs !== undefined) {
          rig.legL.rotation.x = mix(rig.legL.rotation.x, em.legs, ew);
          rig.legR.rotation.x = mix(rig.legR.rotation.x, em.legs, ew);
        }
      }
      rig.armL.rotation.x = aLx;
      rig.armR.rotation.x = aRx;
      rig.armL.rotation.z = aLz;
      rig.armR.rotation.z = aRz;
      const held = wk?.id ?? state?.hold;
      const prop = held && isWork(held) ? PROP_OF[held] : null;
      if (prop && !props) props = createGardenProps(rig.armR, HAND_R);
      if (props) {
        props.show(prop);
        props.pose(rig.armR, (wp?.tilt ?? 0) * ew);
      }

      /* ---- thân, đầu ---- */
      rig.hips.rotation.y = d.hipsY;
      rig.hips.rotation.x = CHAO.hipsX * bowB; // cúi người khi chào
      rig.head.rotation.y = d.headY + look * NHIN_QUANH;
      rig.hips.position.y = hipY + Math.sin(time * 2) * 0.012 * (1 - move) * (1 - airB);
      rig.head.rotation.z = Math.sin(time * 1.1) * 0.05 * still;
      rig.head.rotation.x = Math.sin(time * 0.7) * 0.03 * still + CHAO.headX * bowB + VUON_VAI.headX * stretch + NGOI7.headX * sitB;
      if (em && ew > 0) {
        rig.hips.rotation.x = mix(rig.hips.rotation.x, em.hipsX, ew);
        rig.hips.rotation.y = mix(rig.hips.rotation.y, em.hipsY, ew);
        rig.head.rotation.x = mix(rig.head.rotation.x, em.headX, ew);
        rig.head.rotation.y = mix(rig.head.rotation.y, em.headY, ew);
        rig.head.rotation.z = mix(rig.head.rotation.z, em.headZ, ew);
      }
    },
  };
}
