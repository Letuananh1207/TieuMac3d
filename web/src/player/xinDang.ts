/**
 * Dáng tay "ngồi xin" của Tiểu Líu Lo (R-NPC-6, mã `khat-nhi`): model Tripo `khat-nhi.glb` **cầm sẵn** bát (tay phải) và gậy (tay trái) —
 * dính vào lưới tay, không có đạo cụ dựng bằng code. Ngồi xếp bằng thì dáng tay ngồi chung (tay đặt lên gối) làm bát giơ
 * ngang vai, gậy chĩa ngang ra trước; dáng này đè tay: bát nâng trước bụng, gậy dựng chéo bên trái, đầu gậy chống đất.
 * Thuần (không three) — góc theo quy ước `dongTac.ts`; `haTay` = góc hạ tay của model (tay buông = `z −haTay` bên trái).
 */
import type { Euler3, Pose } from './dongTac';

/** Số góc (rad) — đo trên Canvas 3D `?dang=go-mo&tam=…` với `khat-nhi.glb` ngồi `scale` 0,8. */
export const XIN = {
  /** tay phải (bát): cánh tay trên hơi ra trước, khép sát thân; cẳng tay gập vừa → bát ngửa trước bụng */
  batVai: -0.2,
  batKhep: 0.05,
  batKhuyu: -0.4,
  batCoTay: 0,
  /** tay trái (gậy): cánh tay dạng ra ngoài, hơi ra trước, cẳng tay gập lên → tay cao ngang ngực; cổ tay bẻ ngược cho gậy
   *  dựng chéo ra trước, đầu gậy chạm đất (tay thấp hơn thì gậy xuyên đất) */
  gayVai: -0.3,
  gayDang: 0.9,
  gayKhuyu: -0.7,
  gayCoTay: 0.6,
} as const;

const mixTo = (e: Euler3, to: Euler3, w: number): void => {
  for (let i = 0; i < 3; i++) e[i] += (to[i] - e[i]) * w;
};

/** Trộn dáng tay ngồi xin vào [pose] (tại chỗ) theo [w] (0 = không đổi, 1 = đè hẳn). */
export function tronXin(pose: Pose, haTay: number, w: number): void {
  if (!(w > 0)) return;
  const j = pose.j;
  mixTo(j.armR, [XIN.batVai, 0, haTay + XIN.batKhep], w);
  mixTo(j.foreR, [XIN.batKhuyu, 0, 0], w);
  mixTo(j.handR, [XIN.batCoTay, 0, 0], w);
  mixTo(j.armL, [XIN.gayVai, 0, -haTay + XIN.gayDang], w);
  mixTo(j.foreL, [XIN.gayKhuyu, 0, 0], w);
  mixTo(j.handL, [XIN.gayCoTay, 0, 0], w);
}
