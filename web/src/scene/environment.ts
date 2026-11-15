import * as THREE from 'three';
import { lambert } from './materials';
import { isSoft } from './look';
import { addSkyDome } from './skyDome';
import type { SceneSpec } from './spec';
import { makeCanvasTex, SQUARE_TILE_M, squareTileTex } from './textures';

/** Tay cầm môi trường để đổi theo giờ (ngày đêm — `apGio.ts`) mà không dựng lại. */
export interface EnvHandles {
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  fog: THREE.Fog;
  /** vẽ lại trời 3 màu (cảnh cũ: ảnh nền gradient; cảnh mềm: vòm trời); `night` 0…1 làm mờ quầng nắng */
  setSky(top: string, middle: string, horizon: string, night?: number): void;
}

/** Trời, sương mù, đèn. Mặt đất dựng riêng: phẳng (`addFlatGround`) hoặc địa hình (`terrain.ts`). */
export function addEnvironment(scene: THREE.Scene, spec: SceneSpec, far = 200): EnvHandles {
  const { sky, fog, light } = spec;
  let setSky: EnvHandles['setSky'];
  // cảnh mềm: vòm trời màu theo đỉnh + quầng nắng (skyDome.ts) — nền chỉ là màu chân trời cho khe hở
  if (isSoft(spec.look)) {
    const bg = new THREE.Color(sky.horizon);
    scene.background = bg;
    const dome = addSkyDome(scene, spec, far * 0.8);
    setSky = (t, m, h, night = 0) => {
      bg.set(h);
      dome.recolor(t, m, h, night);
    };
  } else {
    const c = { top: sky.top, middle: sky.middle, horizon: sky.horizon };
    const tex = makeCanvasTex(16, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, c.top);
      gr.addColorStop(0.55, c.middle);
      gr.addColorStop(1, c.horizon);
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    });
    scene.background = tex;
    // vẽ lại ảnh nền 16 × 256 (< 1 ms) rồi tải lên GPU
    setSky = (t, m, h) => {
      Object.assign(c, { top: t, middle: m, horizon: h });
      const g = (tex.image as HTMLCanvasElement).getContext('2d');
      if (!g) return;
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, t);
      gr.addColorStop(0.55, m);
      gr.addColorStop(1, h);
      g.fillStyle = gr;
      g.fillRect(0, 0, 16, 256);
      tex.needsUpdate = true;
    };
  }
  // Sương mù che chỗ cảnh kết thúc, nên không phải dựng gì ở xa (núi xa tự pha màu, không chịu sương).
  const fogObj = new THREE.Fog(fog.color, fog.near, fog.far);
  scene.fog = fogObj;

  // ×π: đổi đơn vị ánh sáng từ r128 sang three hiện tại (xem renderer.ts).
  const hemi = new THREE.HemisphereLight(light.skyColor, light.groundColor, light.hemiIntensity * Math.PI);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(light.sunColor, light.sunIntensity * Math.PI);
  sun.position.set(...light.sunPosition);
  scene.add(sun);
  return { hemi, sun, fog: fogObj, setSky };
}

/** Texture gạch lát sân (một ô ảnh = 8 × 4 viên). `repeat` thiếu = lặp theo UV của lưới. */
/** Số mét một lần lặp của texture sân theo kiểu gạch (`gach`: 8 m như cũ). */
export const paveTileM = (gs: SceneSpec['ground']): number => (gs.pattern === 'vuong' ? SQUARE_TILE_M : 8);

export function brickTexture(gs: SceneSpec['ground'], repeat?: [number, number]): THREE.CanvasTexture {
  const v = gs.variation ?? 0.18;
  if (gs.pattern === 'vuong') {
    const t = squareTileTex(gs.color, v);
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }
  const r = v / 0.18; // độ chênh giữa các viên so với cũ (V-44)
  return makeCanvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = gs.color;
      g.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 4; x++) {
          const off = (y % 2) * 32;
          const l = 47 + (Math.random() - 0.5) * 14 * r;
          g.fillStyle = `hsl(${gs.brickHue},${24 + (Math.random() - 0.5) * 8 * r}%,${l * 0.7}%)`;
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
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(gs.size, gs.size), lambert(0xffffff, { map: brickTexture(gs, gs.pattern === 'vuong' ? [gs.size / SQUARE_TILE_M, gs.size / SQUARE_TILE_M] : [24, 24]) }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  return ground;
}
