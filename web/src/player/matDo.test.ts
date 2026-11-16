import { describe, expect, it } from 'vitest';
import { apChinh, chupMat, doMat, MAT_CHINH, type AnhMat } from './matDo';
import { luoiMi, MAT_LUOI, VONG } from './matLuoi';

const DA: [number, number, number] = [235, 197, 178];
const TOC: [number, number, number] = [30, 28, 30];
const MAT: [number, number, number] = [60, 35, 30];
const MAY: [number, number, number] = [40, 30, 28];

/**
 * Ảnh mặt giả 200²: đầu tròn tóc đen, mặt da; hai lông mày (`mayDam`: đậm, rộng — điểm cặp cao hơn mắt), hai mắt elip đứng, miệng
 * giữa. Vị trí 3D = (x, −y, 0) / 100, pháp tuyến +z.
 */
function anhGia(opts: { mayDam?: boolean } = {}): AnhMat {
  const w = 200;
  const h = 200;
  const img: AnhMat = {
    w, h, x0: 0, y1: 0, s: 100,
    rgb: new Float32Array(w * h * 3),
    z: new Float32Array(w * h).fill(-Infinity),
    p: new Float32Array(w * h * 3),
    n: new Float32Array(w * h * 3),
    uv: new Float32Array(w * h * 2),
  };
  const trong = (x: number, y: number, cx: number, cy: number, rx: number, ry: number): boolean => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!trong(x, y, 100, 100, 95, 95)) continue;
      const k = y * w + x;
      img.z[k] = 0;
      img.p.set([x / 100, -y / 100, 0], k * 3);
      img.n.set([0, 0, 1], k * 3);
      let c = DA;
      if (y < 70 || (trong(x, y, 100, 100, 95, 95) && !trong(x, y, 100, 125, 80, 80))) c = TOC; // tóc trên + hai bên
      const [rx, ry] = opts.mayDam ? [5, 8] : [7, 10];
      if (trong(x, y, 65, 112, rx, ry) || trong(x, y, 135, 112, rx, ry)) c = MAT;
      const [mx, my] = opts.mayDam ? [20, 5.5] : [12, 3.2];
      if (trong(x, y, 65, 92, mx, my) || trong(x, y, 135, 92, mx, my)) c = MAY;
      if (trong(x, y, 100, 150, 9, 2.5)) c = [200, 110, 110];
      img.rgb.set(c, k * 3);
    }
  return img;
}

describe('Dò mắt trên model (R-MAT-1)', () => {
  it('R-MAT-1: chọn cặp mắt đối xứng, không chọn lông mày (kể cả lông mày đậm, rộng), không chọn miệng / tóc', () => {
    for (const mayDam of [false, true]) {
      const kq = doMat(anhGia({ mayDam }), 1);
      expect(kq.loi).toBeUndefined();
      const [a, b] = kq.mat!;
      expect(a.cx).toBeCloseTo(65.5, 0);
      expect(b.cx).toBeCloseTo(135.5, 0);
      expect(a.cy).toBeCloseTo(112.5, 0);
      expect(a.ry).toBeGreaterThan(a.rx); // mắt đứng, không phải nét mày ngang
      expect(a.may).toBeGreaterThan(92); // mép dưới lông mày nằm trên mắt
      expect(a.may).toBeLessThan(102);
      expect(kq.da).toEqual(DA);
    }
  });

  it('R-MAT-1: mặt không có cặp mắt (chỉ da) → không dò được, có lý do', () => {
    const img = anhGia();
    for (let k = 0; k < img.w * img.h; k++) if (img.z[k] > -Infinity && img.p[k * 3 + 1] < -0.75) img.rgb.set(DA, k * 3);
    for (let k = 0; k < img.w * img.h; k++) {
      const y = Math.floor(k / img.w);
      if (img.z[k] > -Infinity && y > 85 && y < 125) img.rgb.set(DA, k * 3);
    }
    const kq = doMat(img, 1);
    expect(kq.mat).toBeNull();
    expect(kq.loi).toBeTruthy();
  });

  it('R-MAT-1: lưới mí ôm mặt — đủ điểm, đẩy ra trước mặt, màu quanh mắt là da, viền mi tối', () => {
    const img = anhGia();
    const [e] = doMat(img, 1).mat!;
    const m = luoiMi(img, e, DA, (p) => p)!;
    expect(m.g.length).toBe(MAT_LUOI * MAT_LUOI * 3);
    for (let i = 2; i < m.g.length; i += 3) expect(m.g[i]).toBeGreaterThan(0); // pháp tuyến +z → nhô ra trước
    expect(m.vong).toHaveLength(VONG);
    for (const c of m.vong) expect(c).toBe('#ebc5b2'); // = DA
    expect(parseInt(m.mi.slice(1, 3), 16)).toBeLessThan(100);
    // elip nằm trong khung lưới; mép trên lưới không lên quá lông mày
    expect(m.e[0]).toBeGreaterThan(0.4);
    expect(m.e[0]).toBeLessThan(0.6);
    expect(-m.g[1] * 100).toBeGreaterThanOrEqual(e.may - 0.6);
  });

  it('R-MAT-1: chỉnh tay MAT_CHINH dời / co giãn elip; model mắt vẽ sẵn nhắm (^^) tắt chớp', () => {
    const e = { cx: 10, cy: 20, rx: 4, ry: 2, may: 15 };
    expect(apChinh(e, undefined)).toBe(e);
    expect(apChinh(e, { dx: 0.5, dy: -1, kx: 1.5, ky: 2 })).toEqual({ cx: 12, cy: 18, rx: 6, ry: 4, may: 15 });
    expect(MAT_CHINH['su-phu']?.tat).toBeTruthy();
    expect(MAT_CHINH['go-mo']?.tat).toBeTruthy();
  });

  it('R-MAT-1: ảnh mặt trước dựng từ lưới đầu + texture — chỉ tam giác thuộc đầu, quay ra trước, màu theo UV', () => {
    // hình vuông 1 × 1 nhìn +z (đầu) + một tam giác quay lưng (bỏ) + một tam giác không thuộc đầu (bỏ)
    const pos = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0.5, 1, 1, 0.5, 1, 0, 0.5, 5, 5, 1];
    const uv = [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const tex = { w: 2, h: 2, data: [255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255] }; // trên đỏ, dưới xanh
    const img = chupMat({ pos, uv, index: [0, 1, 2, 0, 2, 3, 4, 5, 6, 0, 1, 7], dau: [1, 1, 1, 1, 1, 1, 1, 0] }, tex, 20);
    let co = 0;
    for (let k = 0; k < img.w * img.h; k++) if (img.z[k] > -Infinity) co++;
    expect(co).toBeGreaterThan(300); // phủ gần hết ảnh (hình vuông)
    for (let k = 0; k < img.w * img.h; k++) if (img.z[k] > -Infinity) expect(img.z[k]).toBe(0); // tam giác quay lưng (z 0,5) bị bỏ
    const top = (Math.floor(img.h * 0.2) * img.w + 10) * 3;
    const bot = (Math.floor(img.h * 0.8) * img.w + 10) * 3;
    expect(img.rgb[top]).toBeGreaterThan(img.rgb[top + 2]); // y cao (ảnh trên) ↔ v = 0 → đỏ
    expect(img.rgb[bot + 2]).toBeGreaterThan(img.rgb[bot]);
  });
});
