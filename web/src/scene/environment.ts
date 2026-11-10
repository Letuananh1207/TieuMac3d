import * as THREE from 'three';
import { lambert } from './materials';
import { makeCanvasTex } from './textures';

/** Trời chạng vạng, sương mù, đèn và mặt sân gạch. Trả về mặt sân để dò điểm chạm (tap-to-move). */
export function addEnvironment(scene: THREE.Scene): THREE.Mesh {
  scene.background = makeCanvasTex(16, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#0f1730');
    gr.addColorStop(0.55, '#33476e');
    gr.addColorStop(1, '#8a7a86');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  // Sương mù che chỗ cảnh kết thúc, nên không phải dựng gì ở xa.
  scene.fog = new THREE.Fog(0x2c3a58, 28, 70);

  // ×π: đổi đơn vị ánh sáng từ r128 sang three hiện tại (xem renderer.ts).
  scene.add(new THREE.HemisphereLight(0xbcc8ff, 0x4a3326, 0.75 * Math.PI));
  const sun = new THREE.DirectionalLight(0xffd8a8, 0.85 * Math.PI);
  sun.position.set(-12, 20, 8);
  scene.add(sun);

  const groundTex = makeCanvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = '#5b3f37';
      g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 4; x++) {
          const off = (y % 2) * 32;
          const l = 40 + Math.random() * 14;
          g.fillStyle = `hsl(10,${20 + Math.random() * 8}%,${l * 0.7}%)`;
          g.fillRect(x * 64 + off - 64 + 2, y * 32 + 2, 60, 28);
          g.fillRect(x * 64 + off + 2, y * 32 + 2, 60, 28);
        }
      }
    },
    [24, 24],
  );
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), lambert(0xffffff, { map: groundTex }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  return ground;
}
