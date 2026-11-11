import * as THREE from 'three';
import { lambert } from './materials';
import type { SceneSpec } from './spec';
import { makeCanvasTex } from './textures';

/** Trời, sương mù, đèn. Mặt đất dựng riêng: phẳng (`addFlatGround`) hoặc địa hình (`terrain.ts`). */
export function addEnvironment(scene: THREE.Scene, spec: SceneSpec): void {
  const { sky, fog, light } = spec;
  scene.background = makeCanvasTex(16, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, sky.top);
    gr.addColorStop(0.55, sky.middle);
    gr.addColorStop(1, sky.horizon);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  // Sương mù che chỗ cảnh kết thúc, nên không phải dựng gì ở xa (núi xa tự pha màu, không chịu sương).
  scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);

  // ×π: đổi đơn vị ánh sáng từ r128 sang three hiện tại (xem renderer.ts).
  scene.add(new THREE.HemisphereLight(light.skyColor, light.groundColor, light.hemiIntensity * Math.PI));
  const sun = new THREE.DirectionalLight(light.sunColor, light.sunIntensity * Math.PI);
  sun.position.set(...light.sunPosition);
  scene.add(sun);
}

/** Texture gạch lát sân (một ô ảnh = 8 × 4 viên). `repeat` thiếu = lặp theo UV của lưới. */
export function brickTexture(gs: SceneSpec['ground'], repeat?: [number, number]): THREE.CanvasTexture {
  return makeCanvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = gs.color;
      g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 4; x++) {
          const off = (y % 2) * 32;
          const l = 40 + Math.random() * 14;
          g.fillStyle = `hsl(${gs.brickHue},${20 + Math.random() * 8}%,${l * 0.7}%)`;
          g.fillRect(x * 64 + off - 64 + 2, y * 32 + 2, 60, 28);
          g.fillRect(x * 64 + off + 2, y * 32 + 2, 60, 28);
        }
      }
    },
    repeat ?? [1, 1],
  );
}

/** Mặt sân gạch phẳng cạnh `ground.size` (cảnh không bật địa hình). Trả về mặt sân để dò điểm chạm. */
export function addFlatGround(scene: THREE.Scene, gs: SceneSpec['ground']): THREE.Mesh {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(gs.size, gs.size), lambert(0xffffff, { map: brickTexture(gs, [24, 24]) }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  return ground;
}
