/**
 * Vòng trận truyền tống (R-HANH-2), suy từ đặc tả. Thuần (không three, không DOM): dùng chung cho cảnh
 * (`truyenTong.ts`), kiểm đặc tả (`specCheck.ts`) và `main.ts`.
 */
import type { TeleportSpec, XZ } from './spec';

/** Ở trong vòng bấy nhiêu giây thì truyền tống (vòng sáng dần trong lúc đó). */
export const CHARGE_SECONDS = 1.2;

/** Bước vào vòng khi tâm nhân vật cách tâm vòng dưới bấy nhiêu mét (R-HANH-2: 0,8 × bán kính — 3,2 m với vòng 4 m). */
export function ringTrigger(tp: Pick<TeleportSpec, 'ringRadius'>): number {
  return tp.ringRadius * 0.8;
}

/** Chỗ đứng khi về tông môn: phía tây vòng, ngoài vòng 2,5 m, nhìn về đông (rotY radian, 0 = nhìn +z). */
export function arrivalSpot(tp: Pick<TeleportSpec, 'center' | 'ringRadius'>): { at: XZ; rotY: number } {
  return { at: [tp.center[0] - tp.ringRadius - 1.5, tp.center[1]], rotY: Math.PI / 2 };
}
