/**
 * Canvas 3D — 3 trò nhỏ Trúc Lâm (V-66 B4), cùng code dựng như app (`scene/mangLam.ts`, `scene/muaPhun.ts`,
 * `scene/channels.ts` chén lệnh, `scene/daiDa.ts` đệm đàn): cảnh có `miniGames` → luôn có đệm sau đá đàn; măng của hôm nay
 * theo giờ VN (`?gio=` như app). `?dang=hai-mang` = cả 14 măng đã nhú · `&mua` = đang mưa phùn (mức đồ hoạ thường) ·
 * `?dang=luu-thuong` = chén lệnh đứng trước đệm người chơi gần nhất đá khắc. Chỉ trang thiết kế dùng, không vào app.
 */
import type * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { testClock } from './miniGames';
import { stopPoint } from './scene/channels';
import { addCushion } from './scene/daiDa';
import { addMangLam, mangSpotOk } from './scene/mangLam';
import { addMuaPhun } from './scene/muaPhun';
import { miniGame, type SceneSpec } from './scene/spec';
import type { World } from './scene/world';
import { camSeatAt } from './games/danCam';
import { mangOfDay, rainAt, wavesOpen } from './zones/mang';

export interface TrucLamPreview {
  lines: string[];
  update(dt: number, eye: THREE.Vector3): void;
}

export function addTrucLamPreview(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, world: World, params: URLSearchParams): TrucLamPreview | null {
  if (!spec.miniGames.length) return null;
  const ground = (x: number, z: number): number => world.surface.heightAt(x, z);
  const lines: string[] = [];
  const dang = params.get('dang');
  const dan = miniGame(spec.miniGames, 'dan-cam');
  if (dan && spec.props[dan.prop]) {
    const s = camSeatAt(spec.props[dan.prop], dan.seat);
    addCushion(scene, s.x, ground(s.x, s.z), s.z);
    lines.push(`Đàn cầm: chỗ ngồi (${s.x.toFixed(1)}; ${s.z.toFixed(1)}) sau đá — nút "Ngồi đàn" 1,2 m (R-CAM-1)`);
  }
  const luu = miniGame(spec.miniGames, 'luu-thuong');
  const path = luu ? world.channels.paths[luu.channel] : undefined;
  if (luu && path && dang === 'luu-thuong') {
    const seat = spec.seats[luu.seats[0]];
    const stop = stopPoint(path, seat);
    world.channels.command(luu.channel)?.place(stop.t);
    lines.push(`Lưu Thương: chén lệnh dừng trước đệm ${luu.seats[0]} (cách ${stop.dist.toFixed(2)} m); văn nhân ở đệm ${luu.npcs.map((n) => `${n.seat} ${n.id}`).join(' · ')}`);
  }
  const mang = miniGame(spec.miniGames, 'hai-mang');
  if (!mang) return { lines, update: () => {} };
  const now = testClock(params)();
  const day = Math.floor((now + 7 * 3_600_000) / 86_400_000);
  const sec = ((now + 7 * 3_600_000) % 86_400_000) / 1000;
  const spots = mangOfDay(day, mang.areas, mangSpotOk(spec, colliders, ground), mang.gap ?? 3);
  const open = dang === 'hai-mang' ? 2 : wavesOpen(sec);
  const lam = addMangLam(scene, ground);
  lam.set(spots.filter((s) => s.wave < open).map((s) => ({ x: s.x, z: s.z, big: s.big, k: 1 })));
  const raining = (dang === 'hai-mang' && params.has('mua')) || rainAt(sec);
  const rain = raining ? addMuaPhun(scene) : null;
  lines.push(`Hái măng: ngày ${day}, ${spots.filter((s) => s.wave < open).length} măng đã nhú${raining ? ' · đang mưa phùn' : ''} — ${spots.slice(0, 3).map((s) => `(${s.x.toFixed(1)}; ${s.z.toFixed(1)})`).join(' ')} …`);
  return { lines, update: (dt, eye) => rain?.update(dt, 1, eye) };
}
