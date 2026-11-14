import { describe, expect, it } from 'vitest';
import { CUON_GAN, CUON_GIAY_H, CUON_GIAY_W, CUON_XA, fitScroll } from './scene/cuonSachNhip';
import { fingertip, scrollPose, SHOULDER_L, SHOULDER_R, type V3 } from './scene/tayNgoiDang';
import { cuonLayout } from './zones/cuonMuc';

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

describe('R-ON-8: cuộn sách trước mắt — giữa màn, dài hơn (V-43)', () => {
  it('R-ON-8: màn dọc 390×844 — giấy ~80 % bề ngang, giữa màn, trong tầm tay', () => {
    const f = frame(390, 844);
    const p = paperNdc(f);
    expect(p.x).toBeCloseTo(0.8, 2);
    expect(p.y).toBeLessThan(0.84);
    expect(f.dist).toBeGreaterThanOrEqual(CUON_GAN);
    expect(f.dist).toBeLessThanOrEqual(CUON_XA);
  });

  it('R-ON-8: màn ngang 844×390 — giấy ~84 % chiều cao (cũ ~60 %), giữa màn theo bề ngang, chữ cách mép trên / dưới', () => {
    const f = frame(844, 390);
    const p = paperNdc(f);
    expect(p.y).toBeCloseTo(0.84, 2);
    expect(p.y * 390).toBeGreaterThan(320); // nửa trên + nửa dưới: giấy ≥ 320 / 390 px
    expect((1 - p.y) * 195).toBeGreaterThan(21); // mép giấy cách mép màn > vạch home (21 px)
    expect(p.x).toBeLessThan(0.5);
    expect(f.dist).toBeGreaterThanOrEqual(CUON_GAN);
    expect(f.dist).toBeLessThanOrEqual(CUON_XA);
  });

  for (const [name, w, h] of SCREENS) {
    it(`R-ON-8: ${name} — "Đứng dậy" và mục ≥ 44 px chạm; giấy trong màn`, () => {
      const f = frame(w, h);
      const p = paperNdc(f);
      const l = cuonLayout(w > h);
      const pxPerDesign = (p.x * w) / l.w; // px màn / px giấy (giấy quay thẳng về mắt)
      expect(l.stand.h * pxPerDesign).toBeGreaterThanOrEqual(44);
      expect(Math.min(...l.rows.map((r) => r.h)) * pxPerDesign).toBeGreaterThanOrEqual(44);
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
});
