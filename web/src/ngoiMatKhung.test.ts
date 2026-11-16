import { describe, expect, it } from 'vitest';
import { CUON_GAN, CUON_GIAY_H, CUON_GIAY_W, CUON_XA, fitScroll } from './scene/cuonSachNhip';
import { fingertip, reach, scrollPose, SHOULDER_L, SHOULDER_R, type V3 } from './scene/tayNgoiDang';
import { cuonHand, cuonLayout, cuonView } from './zones/cuonMuc';
import { scrollMenu } from './zones/studyMenu';

const HALF_W = CUON_GIAY_W / 2;
const HALF_H = CUON_GIAY_H / 2;
const DEG = Math.PI / 180;
/** như app (`input/eyeCamera.ts` eyeFov): FOV dọc 55°, màn dọc nới cho đủ 40° ngang; cúi nhìn cuộn −35° (scene/spec.ts firstPerson) */
const fovOf = (aspect: number): number => Math.max(55, (2 * Math.atan(Math.tan(20 * DEG) / aspect)) / DEG);
const PITCH = -35 * DEG;
/** trục ngoài mép giấy khi mở hết (cuonSach.ts: GIAY_W / 2 + TRUC_R × 0,7) */
const ROD_X = HALF_W + 0.015 * 0.7;

interface Frame {
  aspect: number;
  fov: number;
  dist: number;
  tv: number;
  th: number;
}
const frame = (w: number, h: number): Frame => {
  const aspect = w / h;
  const fov = fovOf(aspect);
  const tv = Math.tan((fov * DEG) / 2);
  return { aspect, fov, dist: fitScroll(fov, aspect, HALF_W, HALF_H), tv, th: tv * aspect };
};
/** phần màn (−1..1) giấy chiếm: nửa ngang, nửa dọc — tâm giấy luôn giữa màn */
const paperNdc = (f: Frame): { x: number; y: number } => ({ x: HALF_W / (f.th * f.dist), y: HALF_H / (f.tv * f.dist) });
/** điểm thân (mắt = gốc, x phải, y lên, z trước) → màn (−1..1) khi cúi `PITCH` */
const project = (f: Frame, p: V3): { x: number; y: number; depth: number } => {
  const depth = p[1] * Math.sin(PITCH) + p[2] * Math.cos(PITCH);
  const up = p[1] * Math.cos(PITCH) - p[2] * Math.sin(PITCH);
  return { x: p[0] / (depth * f.th), y: up / (depth * f.tv), depth };
};

const SCREENS: [string, number, number][] = [
  ['dọc 390×844', 390, 844],
  ['dọc 360×640', 360, 640],
  ['ngang 844×390', 844, 390],
  ['ngang 2379×1321', 2379, 1321],
  ['ngang 640×360', 640, 360],
];

describe('R-ON-8: cuộn Tĩnh toạ trước mắt — giấy trải ngang 0,48 × 0,27 giữa màn (thiết kế 2026-11-16.12)', () => {
  it('R-ON-8: màn dọc 390×844 — giấy ~90 % bề ngang (~352 px), giữa màn, trong tầm tay', () => {
    const f = frame(390, 844);
    const p = paperNdc(f);
    expect(p.x).toBeCloseTo(0.9, 2);
    expect(p.x * 390).toBeCloseTo(352, -1);
    expect(p.y).toBeLessThan(0.3);
    expect(f.dist).toBeGreaterThanOrEqual(CUON_GAN);
    expect(f.dist).toBeLessThanOrEqual(CUON_XA);
  });

  it('R-ON-8: màn ngang 844×390 — giấy ~67 % chiều cao (~261 × 464 px), giữa màn, hai tay + cảnh hai bên', () => {
    const f = frame(844, 390);
    const p = paperNdc(f);
    expect(p.y).toBeCloseTo(0.67, 2);
    expect(p.y * 390).toBeCloseTo(261, -1);
    expect(p.x * 844).toBeCloseTo(464, -1);
    expect(p.x).toBeLessThan(0.6);
    expect(f.dist).toBeGreaterThanOrEqual(CUON_GAN);
    expect(f.dist).toBeLessThanOrEqual(CUON_XA);
  });

  for (const [name, w, h] of SCREENS) {
    it(`R-ON-8: ${name} — vùng chạm "Đứng dậy" ≥ 44 px, ô ≥ 70 × 90 px; giấy trong màn`, () => {
      const f = frame(w, h);
      const p = paperNdc(f);
      const l = cuonLayout(w > h);
      const pxPerDesign = (p.x * w) / l.w; // px màn / px giấy (giấy quay thẳng về mắt)
      expect(Math.min(l.standHit.w, l.standHit.h) * pxPerDesign).toBeGreaterThanOrEqual(44);
      for (const t of l.tiles) {
        expect(t.w * pxPerDesign).toBeGreaterThanOrEqual(70);
        expect(t.h * pxPerDesign).toBeGreaterThanOrEqual(89.5); // 360 × 640: 98 × 0,92 ≈ 90
      }
      expect(p.x).toBeLessThan(1);
      expect(p.y).toBeLessThan(1);
    });

    it(`R-ON-8: ${name} — hai tay giữ hai trục cân đối, đứng yên không đè vùng chữ`, () => {
      const f = frame(w, h);
      const p = paperNdc(f);
      const l = cuonLayout(w > h);
      const center: V3 = [0, Math.sin(PITCH) * f.dist, Math.cos(PITCH) * f.dist];
      const pose = scrollPose(center, [1, 0, 0], ROD_X);
      // cân đối: tay trái / phải đối xứng qua giữa
      expect(pose.left.pos[0]).toBeCloseTo(-pose.right.pos[0], 6);
      // vùng chữ: trong lề giấy
      const textX = p.x * (1 - (2 * l.pad.side) / l.w);
      const textY = p.y * (1 - (l.pad.top + l.pad.bottom) / l.h);
      for (const [hand, shoulder] of [
        [pose.left, SHOULDER_L],
        [pose.right, SHOULDER_R],
      ] as const) {
        const wrist = hand.pos;
        const tip = fingertip(wrist, shoulder); // đầu ba ngón / ngón trỏ duỗi theo cẳng tay
        const pts: V3[] = [wrist, tip];
        // ống tay áo: từ cổ tay lùi về vai
        for (let k = 0.1; k <= 1; k += 0.1) pts.push([wrist[0] + (shoulder[0] - wrist[0]) * k, wrist[1] + (shoulder[1] - wrist[1]) * k, wrist[2] + (shoulder[2] - wrist[2]) * k]);
        for (const q of pts) {
          const s = project(f, q);
          if (s.depth < 0.1) continue; // sau mặt cắt gần — không vẽ
          const inText = Math.abs(s.x) < textX && Math.abs(s.y) < textY;
          expect(inText, `${name}: điểm tay (${q.map((v) => v.toFixed(3)).join(', ')}) đè vùng chữ`).toBe(false);
        }
      }
    });
  }

  it('R-ON-8: chạm ô → ngón trỏ tay gần ô chạm đúng ô (ô 1–2 tay trái, ô 3–4 tay phải), tay kia vẫn giữ trục', () => {
    const f = frame(390, 844);
    const l = cuonLayout(false);
    const v = cuonView(scrollMenu({ book: { title: 'HSK 1', subtitle: 'Nhập môn' }, learned: ['a'], tasksLeft: 1 }), 'x', null);
    expect(v.tiles.map((t) => cuonHand(v, t.id === 'soon' ? 'daily' : t.id))).toEqual(['left', 'left', 'right', 'right']);
    expect(cuonHand(v, 'stand')).toBe('right');
    const center: V3 = [0, Math.sin(PITCH) * f.dist, Math.cos(PITCH) * f.dist];
    const base = scrollPose(center, [1, 0, 0], ROD_X);
    const k = (2 * HALF_W) / l.w; // m / px giấy
    const tileAt = (i: number): V3 => {
      const b = l.tiles[i]!;
      return [center[0] + (b.x + b.w / 2 - l.w / 2) * k, center[1], center[2]];
    };
    const left = reach(base, tileAt(0), 1, false, 'left');
    const tipL = fingertip(left.left.pos, SHOULDER_L);
    expect(Math.hypot(tipL[0] - tileAt(0)[0], tipL[1] - tileAt(0)[1], tipL[2] - tileAt(0)[2])).toBeLessThan(1e-6);
    expect(left.right).toEqual(base.right);
    const right = reach(base, tileAt(2), 1, false, 'right');
    expect(right.left).toEqual(base.left);
    expect(right.right.point).toBe(1);
  });
});
