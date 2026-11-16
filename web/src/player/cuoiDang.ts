/**
 * Dáng ngồi cưỡi hạc (R-HANH-5, kế hoạch docs/tasks/2026-11-16-ngoi-cuoi-hac.md): hai chân dạng hai bên thân hạc, đùi ôm
 * hông hạc, gối gập, cẳng chân thả xuống áp vào sườn; hai tay đưa ra trước đặt trên cổ / lưng hạc. Hông theo lưng hạc
 * (`pitch` của thân hạc), thân trên bù lại gần thẳng đứng. Đè lên dáng ngồi xếp bằng của `dongTac.ts`.
 * Thuần (không three) — góc theo quy ước `dongTac.ts`; `haTay` = góc hạ tay của model (tay buông = `z −haTay` bên trái).
 */
import type { Euler3, Pose } from './dongTac';

/** Số góc (rad) — chỉnh trên Canvas 3D `?dang=hac` (hạc model, `crane.scale` 1,25, nhân vật chính). */
export const CUOI = {
  /** đùi ra trước (âm) + dạng ra ngoài: ôm qua lưng tròn của hạc, đầu gối tì lên hông hạc */
  dui: -0.25,
  dang: 1.35,
  /** gối gập (dương = cẳng chân về sau) → cẳng chân thả xuống áp sườn */
  goi: 0.3,
  /** cẳng chân khép lại vào sườn (quanh trục dọc đùi đã dạng, rad — trái âm) */
  kepSuon: 0.9,
  /** bàn chân duỗi theo sườn */
  ban: 0.35,
  /** tay đưa ra trước (âm), khép vào giữa, khuỷu gập vừa → bàn tay đặt trên lưng / gốc cổ hạc */
  tayTruoc: 0.85,
  tayKhep: -0.15,
  khuyu: 0.35,
  coTay: 0.15,
  /** thân trên hơi đổ về trước (tay vươn tới cổ) */
  cui: 0.2,
  /** hông hạ thêm so với ngồi bệt (m, trước co giãn NPC) — háng ngồi sâu trên lưng, không bị đùi dạng đẩy lên */
  ha: 0.16,
} as const;

/** Dáng cưỡi cho nhân vật 7 xương (`autoRig` — chân một xương, không gối): chân dạng chếch xuống hai bên, tay ra trước. */
export const CUOI7 = { legs: -0.35, legZ: 0.75, aX: -1.05, aZ: 0.12 } as const;

const mixTo = (e: Euler3, to: Euler3, w: number): void => {
  for (let i = 0; i < 3; i++) e[i] += (to[i] - e[i]) * w;
};

/**
 * Trộn dáng cưỡi vào [pose] (tại chỗ) theo [w] (0 = không đổi, 1 = đè hẳn). [pitch] = góc thân hạc (rad, quy ước `Crane`:
 * âm = mũi ngẩng): hông nghiêng theo lưng, cột sống bù ngược để thân trên gần thẳng đứng.
 */
export function tronCuoi(pose: Pose, haTay: number, w: number, pitch = 0): void {
  if (!(w > 0)) return;
  const j = pose.j;
  mixTo(j.hips, [pitch, 0, 0], w);
  mixTo(j.upLegL, [CUOI.dui, 0, CUOI.dang], w);
  mixTo(j.upLegR, [CUOI.dui, 0, -CUOI.dang], w);
  mixTo(j.legL, [CUOI.goi, 0, -CUOI.kepSuon], w);
  mixTo(j.legR, [CUOI.goi, 0, CUOI.kepSuon], w);
  mixTo(j.footL, [CUOI.ban, 0, 0], w);
  mixTo(j.footR, [CUOI.ban, 0, 0], w);
  // hông theo lưng → cột sống bù lại (thân trên gần thẳng đứng), thêm chút đổ trước
  j.spine[0] += (CUOI.cui - pitch) * w;
  mixTo(j.armL, [-CUOI.tayTruoc, 0, -haTay - CUOI.tayKhep], w);
  mixTo(j.armR, [-CUOI.tayTruoc, 0, haTay + CUOI.tayKhep], w);
  mixTo(j.foreL, [-CUOI.khuyu, 0, 0], w);
  mixTo(j.foreR, [-CUOI.khuyu, 0, 0], w);
  mixTo(j.handL, [CUOI.coTay, 0, 0], w);
  mixTo(j.handR, [CUOI.coTay, 0, 0], w);
  pose.lift -= CUOI.ha * w;
}
