import * as THREE from 'three';
import type { EnvHandles } from './environment';
import { tronMau, tronSo, type PhaNgay } from './ngayDem';
import type { SceneSpec } from './spec';
import type { NightSky } from './troiDem';

/** Áp giờ lên cảnh đã dựng (không dựng lại gì). */
export interface DayNight {
  /** `trongNha` 0…1: mức đứng trong nhà (quyết định 3B — đêm trong nhà sáng vàng ấm), chuyển mượt do bên gọi */
  apply(p: PhaNgay, trongNha: number): void;
  /** tìm vật liệu mới thêm vào cảnh (model `.glb` nạp sau, NPC…) và áp ngay trạng thái hiện tại */
  scan(): void;
}

interface Opts {
  /** quầng đèn giả (`quangDen.ts`) — `null` khi không có (cảnh cũ, mức Thấp) */
  glow: THREE.InstancedMesh | null;
  sky: NightSky | null;
  /** quản lý màu bật (đường màu `chuan`) — màu đích ban đêm đổi về tuyến tính theo đường màu */
  colorManaged: boolean;
}

type Tinted = THREE.MeshBasicMaterial | THREE.PointsMaterial;
const WATER_UNIFORMS = ['uShallow', 'uDeep', 'uFoam', 'uSky'] as const;

/**
 * Ngày đêm trên cảnh (kế hoạch docs/tasks/2026-11-14-ngay-dem.md, NV4 / NV6 / NV7; R-NGAY-2…4). Mọi thứ chỉ đổi số / màu:
 * - trời (vòm / ảnh nền), sương, hemi, nắng → trăng (màu, cường độ, hướng);
 * - vật liệu không chịu sáng (Basic: biển, chữ, model không-sáng, núi xa, mây; shader nước) nhân màu theo `dem.tint`
 *   (`material.userData.ngayDem`: `xa` = núi / mây, `bo` = giữ nguyên — vòm trời, vòng trận, quầng, bàn cờ);
 * - đèn (`userData.lamp`: `den` lòng đèn · `cua` cửa sổ) đổi `emissiveIntensity`; `userData.lampOpacity` (lòng sáng
 *   trong suốt) đổi độ mờ; quầng đèn đổi độ mờ; sao + trăng theo mức đêm.
 * Không đổi define shader → không biên dịch lại. Vật liệu tìm bằng duyệt cảnh (`scan`) — gồm cả bản sao của mái mờ (rooms.ts).
 */
export function createDayNight(scene: THREE.Scene, spec: SceneSpec, env: EnvHandles, opts: Opts): DayNight {
  const dn = spec.dayNight;
  const L = spec.light;
  const seen = new WeakSet<THREE.Material>();
  const tinted: { m: Tinted; base: THREE.Color; far: boolean }[] = [];
  const water: { m: THREE.ShaderMaterial; base: THREE.Color[] }[] = [];
  const lamps: { m: THREE.MeshLambertMaterial; k: number }[] = [];
  const lampFades: { m: THREE.Material; base: number }[] = [];
  const sunPos = new THREE.Vector3(...L.sunPosition);
  const moonPos = new THREE.Vector3(...dn.dem.moon.position).normalize().multiplyScalar(sunPos.length());
  const near = new THREE.Color();
  const far = new THREE.Color();
  const wat = new THREE.Color();
  let den = 0;
  // Màu đích ban đêm dùng để NHÂN / pha (nhân màu vật không chịu sáng, sương): cả hai đường màu đều mã hoá sRGB ở đầu ra,
  // nên số nhân phải là số tuyến tính thì mắt mới thấy đúng mã hex. Đường chuẩn: Color đã tự đổi; đường cũ (ColorManagement
  // tắt — Khởi Nguyên Trấn `colorPipeline: "cu"`, cảnh `cu`): Color giữ số sRGB thô → tự đổi về tuyến tính.
  const lin = (hex: string, out: THREE.Color): THREE.Color => (opts.colorManaged ? out.set(hex) : out.set(hex).convertSRGBToLinear());
  const WHITE = new THREE.Color(1, 1, 1);
  const tmp = new THREE.Color();
  // trộn: trắng (ban ngày) → đích tuyến tính theo k
  const toward = (out: THREE.Color, hex: string, k: number): THREE.Color => out.copy(WHITE).lerp(lin(hex, tmp), k);

  const take = (m: THREE.Material): void => {
    if (seen.has(m)) return;
    seen.add(m);
    const tag = m.userData.ngayDem;
    if (tag === 'bo' || m.blending === THREE.AdditiveBlending) return;
    if (typeof m.userData.lampOpacity === 'number') {
      lampFades.push({ m, base: m.userData.lampOpacity });
      m.opacity = m.userData.lampOpacity * den;
      m.visible = den > 0.01;
      return;
    }
    if (m instanceof THREE.MeshLambertMaterial) {
      if (m.userData.lamp) {
        const k = m.userData.lamp === 'cua' ? dn.dem.windowGlow : dn.dem.lampGlow;
        lamps.push({ m, k });
        m.emissiveIntensity = k * den;
      }
      return;
    }
    if (m instanceof THREE.MeshBasicMaterial || m instanceof THREE.PointsMaterial) {
      const far0 = tag === 'xa';
      tinted.push({ m, base: m.color.clone(), far: far0 });
      m.color.copy(m.color).multiply(far0 ? far : near);
      return;
    }
    if (m instanceof THREE.ShaderMaterial && m.uniforms.uShallow) {
      const base = WATER_UNIFORMS.map((k) => (m.uniforms[k].value as THREE.Color).clone());
      water.push({ m, base });
      WATER_UNIFORMS.forEach((k, i) => (m.uniforms[k].value as THREE.Color).copy(base[i]).multiply(wat));
    }
  };

  const scan = (): void => {
    scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      if (Array.isArray(mat)) mat.forEach(take);
      else take(mat);
    });
  };

  near.set('#ffffff');
  far.set('#ffffff');
  wat.set('#ffffff');
  scan();

  return {
    scan,
    apply(p, trongNha) {
      const k = p.dem;
      const h = p.hoang;
      const n = Math.min(1, Math.max(0, trongNha)) * k; // trong nhà chỉ khác khi trời tối
      // trời + sương: ngày → (nhuộm cam theo `hoang`) → đêm
      const hor = tronMau(tronMau(spec.sky.horizon, dn.hoang.horizon, h), dn.dem.sky.horizon, k);
      const mid = tronMau(tronMau(spec.sky.middle, dn.hoang.middle, h * 0.6), dn.dem.sky.middle, k);
      const top = tronMau(spec.sky.top, dn.dem.sky.top, k);
      env.setSky(top, mid, hor, k);
      env.fog.color.set(tronMau(spec.fog.color, dn.hoang.fog, h * 0.7)).lerp(lin(dn.dem.fog, tmp), k);
      // hemi: đêm xanh dịu; trong nhà ban đêm vàng ấm
      env.hemi.color.set(tronMau(tronMau(L.skyColor, dn.dem.light.skyColor, k), dn.trongNha.skyColor, n));
      env.hemi.groundColor.set(tronMau(tronMau(L.groundColor, dn.dem.light.groundColor, k), dn.trongNha.groundColor, n));
      // hệ số cường độ nhân thẳng (cả hai đường màu chiếu sáng rồi mới mã hoá sRGB → cùng cảm nhận)
      env.hemi.intensity = L.hemiIntensity * Math.PI * tronSo(tronSo(1, dn.dem.light.hemiScale, k), dn.trongNha.hemiScale, n);
      // nắng → trăng: màu, cường độ, hướng
      env.sun.color.set(tronMau(tronMau(L.sunColor, dn.hoang.sunColor, h), dn.dem.light.moonColor, k));
      env.sun.intensity = L.sunIntensity * Math.PI * tronSo(1, dn.dem.light.moonScale, k);
      env.sun.position.copy(sunPos).lerp(moonPos, k);
      // vật không chịu sáng
      toward(near, dn.dem.tint.near, k);
      toward(far, dn.hoang.horizon, h * 0.35).lerp(lin(dn.dem.tint.far, tmp), k);
      toward(wat, dn.dem.tint.water, k);
      for (const t of tinted) t.m.color.copy(t.base).multiply(t.far ? far : near);
      for (const w of water) WATER_UNIFORMS.forEach((u, i) => (w.m.uniforms[u].value as THREE.Color).copy(w.base[i]).multiply(wat));
      // đèn + cửa sổ
      den = p.den;
      for (const l of lamps) l.m.emissiveIntensity = l.k * den;
      for (const f of lampFades) {
        f.m.opacity = f.base * den;
        f.m.visible = den > 0.01;
      }
      if (opts.glow) {
        (opts.glow.material as THREE.MeshBasicMaterial).opacity = den;
        opts.glow.visible = den > 0.01;
      }
      opts.sky?.set(k);
    },
  };
}
