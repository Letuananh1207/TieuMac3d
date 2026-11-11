import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Character } from './character';

/** Chiều cao nhân vật sau khi nạp (m) — bằng đệ tử khối (búi tóc ~2,1 m), thước chuẩn của cảnh. */
export const GLB_HEIGHT = 2.1;

/**
 * Nhân vật từ file `.glb` (model AI đã làm sạch — docs/ai3d.md, quyết định 0003), cùng hợp đồng `Character` với đệ tử
 * khối nên `PlayerController` không đổi.
 * - Cỡ: co giãn đều cho cao `GLB_HEIGHT`, chân chạm y = 0, tâm x/z về gốc. Mặt trước model nhìn về +z (như đệ tử khối).
 * - Vật liệu: đổi sang Lambert (quy tắc 4 — rẻ, không cần đèn môi trường), giữ màu / texture / màu đỉnh.
 * - Động tác: model có clip tên chứa `idle` / `walk` → `AnimationMixer`, trộn theo tốc độ; không có clip (model AI
 *   thường chưa có xương) → nhún nhẹ + nghiêng khi đi.
 * Lỗi nạp → Promise bị từ chối; nơi gọi dùng đệ tử khối dự phòng.
 */
export async function loadGlbCharacter(url: string): Promise<Character> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder); // file nén bằng gltfpack (docs/ai3d.md bước 4)
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  model.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    // model "chỉ tạo hình" (Hunyuan3D bước shape) không có pháp tuyến → Lambert ra đen; tự tính
    if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
    const toLambert = (m: THREE.Material): THREE.Material => {
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
  bob.add(model);

  // bóng giả như đệ tử khối (không shadow realtime — quy tắc 4)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(0.45, Math.max(size.x, size.z) * k * 0.45), 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  const clip = (name: string): THREE.AnimationClip | undefined =>
    gltf.animations.find((a) => a.name.toLowerCase().includes(name));
  const idleClip = clip('idle');
  const walkClip = clip('walk');
  const mixer = idleClip || walkClip ? new THREE.AnimationMixer(model) : null;
  const idle = mixer && idleClip ? mixer.clipAction(idleClip) : null;
  const walk = mixer && walkClip ? mixer.clipAction(walkClip) : null;
  idle?.play();
  walk?.play();

  let move = 0; // 0..1, mượt theo tốc độ
  let walkT = 0;
  return {
    root,
    facing: body,
    animate(dt, speed) {
      move += (speed - move) * Math.min(1, dt * 8);
      if (mixer) {
        if (walk) walk.setEffectiveWeight(idle ? move : 1).setEffectiveTimeScale(0.6 + 0.6 * move);
        if (idle) idle.setEffectiveWeight(walk ? 1 - move : 1);
        mixer.update(dt);
        return;
      }
      // không có clip: nhún theo bước + nghiêng nhẹ về trước khi đi
      if (speed > 0.05) walkT += dt * 10 * speed;
      else walkT *= 0.85;
      bob.position.y = Math.abs(Math.sin(walkT)) * 0.06;
      bob.rotation.x = 0.06 * move;
      bob.rotation.z = Math.sin(walkT) * 0.03 * move;
    },
  };
}
