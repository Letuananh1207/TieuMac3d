/**
 * Canvas 3D `?dang=tieu-nhi&cho=<0…29>` (V-20261116-105 NV10): ngồi sẵn chỗ thứ `cho` trong trà lâu (thứ tự chỗ ngồi của nhà:
 * 0–11 đôn tầng 1, 12–29 tầng 2) và chạy đúng `tieuNhi.ts` như app — tiểu nhị chờ 2 s, cầm ấm đi tới, rót, về; nhìn từ mắt (chén
 * chỉ có sau khi rót). `&t=<giây>` tua trước bấy nhiêu giây (chụp đúng lúc) · `&dung` dừng ở đó (tiểu nhị đứng yên — chụp headless
 * chạy chậm) · `&nhin=<độ>` quay đầu nhìn sang (dương = phải) · `&ngoai` nhìn từ ngoài (camera tự do, `&cam=…&tam=…`).
 * Dòng mô tả: tầng, góc chỗ đứng rót, dài đường. Chỉ trang thiết kế dùng, không vào app.
 */
import type { Colliders } from './collision/colliders';
import type { Npc } from './player/npc';
import type { Seat } from './scene/seat';
import type { World } from './scene/world';
import { TieuNhi } from './tieuNhi';
import { makeToast } from './townPreview';
import { TEA_SPEED } from './zones/teaService';

export interface TieuNhiPreview {
  /** chỗ người chơi ngồi */
  readonly seat: Seat;
  readonly lines: string[];
  /** mỗi khung: tiểu nhị đi; `setTea` + hướng nhìn cho góc nhìn từ mắt (nếu có) */
  update(dt: number, ngoi: { setTea(served: boolean | null): void; readonly look: { yaw: number } } | null): void;
}

const n = (v: number): string => String(+v.toFixed(1)).replace('.', ',');

export function addTieuNhiPreview(params: URLSearchParams, world: Pick<World, 'rooms' | 'seats' | 'surface'>, npcs: readonly Npc[], colliders: Colliders): TieuNhiPreview | null {
  if (params.get('dang') !== 'tieu-nhi') return null;
  const seats = world.seats.filter((s) => s.serve);
  if (seats.length === 0) return null;
  const want = Math.round(Number(params.get('cho') ?? 0));
  const seat = seats[Number.isFinite(want) ? Math.min(seats.length - 1, Math.max(0, want)) : 0];
  const toast = makeToast();
  const tn = TieuNhi.create(npcs, world.rooms.flatMap((r) => (r.service ? [r.service] : [])), {
    heightAt: (x, z, y) => world.surface.heightAt(x, z, y),
    colliders,
    chatSay: (_id, text) => toast(`[kênh] Tiểu nhị: ${text}`),
  });
  const lines: string[] = [];
  if (!tn) lines.push('Tiểu nhị: không dựng được (thiếu model design/models/tieu-nhi.glb) — ngồi là cầm chén ngay (R-TRA-1)');
  else {
    tn.sit(seat);
    const i = seat.serve!.i;
    const st = tn.stops.seats[i];
    const len = tn.pathLength(i);
    lines.push(`Tiểu nhị: chỗ ${i} (tầng ${st?.floor ?? '?'}), đứng rót góc ${st ? Math.round(st.angle) : '?'}°, đường ${len ? `${n(len)} m ≈ ${n(len / TEA_SPEED)} s` : 'không có'}`);
    const t0 = Number(params.get('t') ?? 0);
    for (let k = 0; Number.isFinite(t0) && k < Math.round(t0 * 30); k++) {
      tn.update(1 / 30, [seat.x, seat.z]);
      tn.npc.update(1 / 30);
    }
  }
  const freeze = params.has('dung');
  const nhin = (Number(params.get('nhin') ?? 0) * Math.PI) / 180;
  return {
    seat,
    lines,
    update(dt, ngoi) {
      if (!tn) return;
      if (!freeze) tn.update(dt, [seat.x, seat.z]);
      ngoi?.setTea(tn.tea);
      if (ngoi && nhin) ngoi.look.yaw = -nhin; // kéo sang phải = yaw âm (EyeLook); ngoiMat tự kẹp trong giới hạn nhìn quanh
    },
  };
}
