/**
 * Kiểm ô trang trí nhà của ta (R-NHA-2) với phần còn lại của cảnh: trùng mã, quá sát nhau, ô trong nhà / ngoài nhà,
 * đè vòng trận, đè điểm xuất phát. Thuần dữ liệu (không three, không DOM) — gọi từ `specCheck.ts`.
 */
import { DECOR_SLOT_GAP, type BuildingSpec, type DecorSlotSpec, type SceneSpec } from './spec';

/** Ô có nằm trong chân nhà `b` (hình chữ nhật thẳng trục, đổi rộng ↔ sâu khi xoay 90 / 270) không. */
export function insideBuilding(b: BuildingSpec, x: number, z: number, margin = 0): boolean {
  const [w, d] = (b.rotY ?? 0) % 180 !== 0 ? [b.d, b.w] : [b.w, b.d];
  return Math.abs(x - b.x) <= w / 2 - margin && Math.abs(z - b.z) <= d / 2 - margin;
}

/** Danh sách lỗi (rỗng = đúng). Chỉ báo, không sửa. */
export function checkDecorSlots(s: SceneSpec): string[] {
  const out: string[] = [];
  const slots = s.decorSlots;
  const seen = new Set<string>();
  const name = (t: DecorSlotSpec): string => `decorSlots "${t.id}"`;
  slots.forEach((t, i) => {
    if (!t.id) out.push(`decorSlots[${i}]: thiếu id`);
    else if (seen.has(t.id)) out.push(`${name(t)} bị trùng`);
    seen.add(t.id);
    for (const u of slots.slice(i + 1)) {
      const gap = Math.hypot(t.x - u.x, t.z - u.z);
      if (gap < DECOR_SLOT_GAP) out.push(`${name(t)} và "${u.id}": cách ${gap.toFixed(1)} m — tối thiểu ${DECOR_SLOT_GAP} m`);
    }
    const home = s.buildings.find((b) => insideBuilding(b, t.x, t.z));
    if (t.kind === 'trong') {
      // vật trong nhà cao tới 1,8 m (kệ, bình phong): chừa 0,8 m tới tường
      if (!s.buildings.some((b) => insideBuilding(b, t.x, t.z, 0.8))) out.push(`${name(t)}: ô "trong" phải nằm trong một nhà, cách tường ≥ 0,8 m`);
    } else if (home) {
      out.push(`${name(t)}: ô "${t.kind}" nằm trong nhà "${home.id}" — dùng kind "trong" hoặc dời ra ngoài`);
    }
    const tp = s.teleport;
    if (tp.enabled && Math.hypot(t.x - tp.center[0], t.z - tp.center[1]) < tp.ringRadius + 1.5) {
      out.push(`${name(t)}: đè vòng trận — cách tâm vòng ≥ ${tp.ringRadius + 1.5} m`);
    }
    const [px, pz] = s.player.start;
    if (Math.hypot(t.x - px, t.z - pz) < 1.5) out.push(`${name(t)}: đè điểm xuất phát (player.start) — cách ≥ 1,5 m`);
  });
  return out;
}
