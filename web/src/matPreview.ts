/**
 * Canvas 3D `?dang=mat` — duyệt mí mắt (R-MAT-1, R-MAT-2, kế hoạch docs/tasks/2026-11-16-chop-mat.md NV7). Chỉ trang thiết kế.
 * Một hàng nhân vật xương chuẩn nhìn thẳng camera, chớp như app. Tham số:
 * - `&nv=nhan-vat,thu-thu,…` (mặc định nhan-vat, thu-thu, tieu-mac, quan-su);
 * - `&mi=<trên>[,<dưới>]` — giữ mí ở độ khép đó (0 mở · 0,5 giữa chớp · 1 khép · 0,22,0,78 cười ^^) để chụp;
 * - `&bc=<mã biểu cảm>[&t=<giây>]` — diễn biểu cảm (`ngoi-nghi` + `t=20` = ngủ gật, đầu gục); thiếu `t` thì chạy;
 * - `&goc=nghieng|gat|ca` — đầu quay + nghiêng / gật thêm (mí phải bám mắt); `&xa` — camera lùi xa 9 m; `&kc=<m>` — camera cách hàng.
 * Ngày đêm: `&gio=21` như mọi trang. Tự chạy vòng khung riêng (thêm vào `designPreview.ts` một dòng).
 */
import * as THREE from 'three';
import { loadGlbCharacter } from './player/glbCharacter';
import type { CharacterState } from './player/character';
import { npcModelUrl } from './player/npc';
import type { SceneSpec } from './scene/spec';
import { emoteById } from './zones/bieuCam';

type V3 = [number, number, number];
const MAC_DINH = ['nhan-vat', 'thu-thu', 'tieu-mac', 'quan-su'];
/** khoảng cách giữa hai nhân vật trong hàng (m) */
const CACH = 1.25;
/** độ cao mắt để camera nhìn (m) */
const MAT_Y = 1.68;
/** ngồi xếp bằng (Ngồi nghỉ): mắt thấp hơn chừng này (m) */
const NGOI_THAP = 0.55;

export async function addMatPreview(
  scene: THREE.Scene,
  spec: SceneSpec,
  params: URLSearchParams,
  groundAt: (x: number, z: number) => number,
  view: (pos: V3, target: V3) => void,
): Promise<{ lines: string[] } | null> {
  if (params.get('dang') !== 'mat') return null;
  const ids = (params.get('nv') ?? MAC_DINH.join(',')).split(',').filter((id) => npcModelUrl(id));
  const lines: string[] = [];
  const x0 = spec.player.start[0] + 6;
  const z0 = spec.player.start[1] - 6;
  const y0 = Number.isFinite(groundAt(x0, z0)) ? groundAt(x0, z0) : 0;
  const chars = await Promise.all(ids.map((id, i) => loadGlbCharacter(npcModelUrl(id)!, { seed: 1.3 + i * 2.71, player: id === 'nhan-vat' })));
  chars.forEach((c, i) => {
    c.root.position.set(x0 + (i - (ids.length - 1) / 2) * CACH, y0, z0);
    scene.add(c.root);
    lines.push(`mat: ${ids[i]} — ${c.mi ? 'có mí (chớp)' : 'KHÔNG chớp (chưa dò mắt / tắt — design/models/mat.json)'}`);
  });
  const em = emoteById(params.get('bc') ?? '');
  const xa = params.has('xa');
  const span = Math.max(1, ids.length) * CACH;
  const yMat = y0 + MAT_Y - (em?.sits ? NGOI_THAP : 0);
  view([x0, yMat + (xa ? 1.2 : 0.05), z0 + (xa ? 9 : Number(params.get('kc')) || 0.5 + span * 0.7)], [x0, yMat - (xa ? 0.5 : 0.02), z0]);

  const mi = (params.get('mi') ?? '').split(',').map(Number);
  const giuMi = params.has('mi') && Number.isFinite(mi[0]);
  const tGiu = Number(params.get('t'));
  const giuT = params.has('t') && Number.isFinite(tGiu);
  const goc = params.get('goc');
  const heads = chars.map((c) => {
    let h: THREE.Object3D | undefined;
    c.root.traverse((o) => {
      if (!h && (o as THREE.Bone).isBone && /Head$/.test(o.name)) h = o;
    });
    return h;
  });
  const state: CharacterState = { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0 };
  let t = giuT ? tGiu : 0;
  const clock = new THREE.Clock();
  const tick = (): void => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!giuT) t += dt;
    state.emote = em && !em.asBow ? { id: em.id, t: em.sits ? t : t % (em.seconds + 0.8), len: em.seconds } : undefined;
    state.sit = em?.sits ? 1 : 0;
    state.bow = em?.asBow ? 1 : 0;
    chars.forEach((c, i) => {
      c.animate(giuT ? 1 / 60 : dt, 0, state);
      if (giuMi) c.mi?.dat(mi[0], Number.isFinite(mi[1]) ? mi[1] : 0);
      const h = heads[i];
      if (h && (goc === 'nghieng' || goc === 'ca')) {
        h.rotateY(0.45);
        h.rotateZ(0.22);
      }
      if (h && (goc === 'gat' || goc === 'ca')) h.rotateX(0.35);
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return { lines };
}
