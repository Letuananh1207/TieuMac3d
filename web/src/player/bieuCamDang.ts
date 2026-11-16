/**
 * Dáng 8 biểu cảm (R-BIEU-1/2) bằng 7 xương tự gắn (`autoRig.ts`: hông, đầu, hai tay, hai chân — không khuỷu tay: tay cử
 * động cả cánh, kiểu chibi). Thuần (không three) — `glbCharacter.ts` trộn vào dáng đứng theo trọng số `w`.
 * Quy ước góc như `glbCharacter.ts`: tay `x` âm = đưa ra trước / lên; tay trái `z` âm = khép vào thân (tay phải ngược dấu),
 * `z` trái dương = giơ ngang lên cao; đầu `x` âm = ngửa lên; hông `x` dương = cúi người.
 * Mã lấy ở `zones/bieuCam.ts` (lớp player không import zones — so bằng chuỗi). Chắp tay dùng Chào có sẵn; Ngồi nghỉ dùng
 * dáng ngồi (`state.sit`) — hai mã này không có dáng riêng ở đây.
 */

export interface EmotePose {
  /** 0 → 1: trọng số trộn (vào 0,25 s, ra 0,3 s cuối) */
  w: number;
  aLx: number;
  aLz: number;
  aRx: number;
  aRz: number;
  hipsX: number;
  hipsY: number;
  headX: number;
  headY: number;
  headZ: number;
  /** nâng cả thân (m) — Nhảy mừng bật nhẹ tại chỗ (chỉ dáng, không phải nhảy) */
  lift: number;
  /** chân co (radian, x âm = gối ra trước); undefined = giữ dáng chân */
  legs?: number;
  /** khuỷu trái / phải (x âm = gập cẳng tay lên) — chỉ xương có khuỷu (Mixamo, `dang7.ts`); `autoRig` / đệ tử khối bỏ qua */
  eL?: number;
  eR?: number;
  /** vai x khi có khuỷu (thay `aLx` / `aRx`); thiếu = dùng `aLx` / `aRx` */
  aLxE?: number;
  aRxE?: number;
}

/** Tay buông xuôi (như `ARM_REST` của `glbCharacter.ts`). */
const REST = 0.4;
const IN = 0.25;
const OUT = 0.3;

const smooth = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Trọng số vào / ra theo giây `t` trên thời lượng `len` (giữ: chỉ vào). */
export function emoteWeight(t: number, len: number): number {
  const fadeIn = t / IN;
  const fadeOut = Number.isFinite(len) ? (len - t) / OUT : 1;
  return smooth(Math.min(1, fadeIn, fadeOut));
}

const base = (): Omit<EmotePose, 'w'> => ({ aLx: -0.12, aLz: -REST, aRx: -0.12, aRz: REST, hipsX: 0, hipsY: 0, headX: 0, headY: 0, headZ: 0, lift: 0 });

/** Dáng biểu cảm `id` ở giây `t` (thời lượng `len`). Mã không có dáng riêng → null (nhân vật đứng / ngồi thường). */
export function emotePose(id: string, t: number, len: number): EmotePose | null {
  const p = base();
  const k = Number.isFinite(len) && len > 0 ? Math.min(1, t / len) : 0;
  const TAU = Math.PI * 2;
  switch (id) {
    case 'vay-tay': {
      // tay phải giơ cao, lắc qua lại 3 nhịp; đầu nghiêng nhẹ
      p.aRz = -2.25 + Math.sin(TAU * 3 * k) * 0.3;
      p.aRx = -0.25;
      p.headZ = 0.12;
      p.headY = -0.1;
      p.eR = -0.35;
      break;
    }
    case 'cui-chao': {
      // hai tay xuôi khép trước bụng, hông gập sâu ≈ 45°: 0,6 s cúi · giữ 0,6 s · 0,6 s đứng lên
      const d = t < 0.6 ? smooth(t / 0.6) : t < 1.2 ? 1 : smooth((len - 0.2 - t) / 0.6);
      p.aLx = -0.35 - 0.25 * d;
      p.aRx = -0.35 - 0.25 * d;
      p.aLz = -(REST + 0.3);
      p.aRz = REST + 0.3;
      p.hipsX = 0.55 * d;
      p.headX = 0.2 * d;
      p.eL = -0.25;
      p.eR = -0.25;
      break;
    }
    case 'vo-tay': {
      // hai tay đưa ra trước, khép – mở 4 nhịp
      const open = 0.5 + 0.5 * Math.cos(TAU * 4 * k);
      p.aLx = -1.2;
      p.aRx = -1.2;
      p.aLz = -(REST + 0.45 - 0.35 * open);
      p.aRz = REST + 0.45 - 0.35 * open;
      p.headX = -0.06;
      p.aLxE = -0.95;
      p.aRxE = -0.95;
      p.eL = -0.5;
      p.eR = -0.5;
      break;
    }
    case 'cuoi': {
      // đầu ngửa nhẹ, thân rung nhịp nhanh, tay ôm bụng
      const shake = Math.sin(t * 22);
      p.aLx = -0.6;
      p.aRx = -0.6;
      p.aLz = -(REST + 0.45);
      p.aRz = REST + 0.45;
      p.headX = -0.25 + shake * 0.04;
      p.hipsX = -0.06 + shake * 0.03;
      p.lift = Math.abs(shake) * 0.025;
      p.aLxE = -0.3;
      p.aRxE = -0.3;
      p.eL = -1.0;
      p.eR = -1.0;
      break;
    }
    case 'nhay-mung': {
      // hai tay giơ chữ V, bật nhẹ tại chỗ 2 lần (gốc hình lên ≤ 0,25 m)
      const hop = Math.sin(Math.PI * ((k * 2) % 1));
      p.aLz = 1.95;
      p.aRz = -1.95;
      p.aLx = -0.25;
      p.aRx = -0.25;
      p.headX = -0.15;
      p.lift = 0.25 * hop;
      p.legs = -0.45 * hop;
      p.eL = -0.2;
      p.eR = -0.2;
      break;
    }
    case 'suy-nghi': {
      // tay phải đưa lên cằm, tay trái vắt ngang bụng, đầu nghiêng, thân lắc chậm
      p.aRx = -1.85;
      p.aRz = REST + 0.6;
      p.aLx = -0.5;
      p.aLz = -(REST + 0.42);
      p.headZ = 0.18;
      p.headX = 0.08;
      p.hipsY = Math.sin(t * 1.6) * 0.08;
      // Mixamo: cánh tay trên ra trước vừa, cẳng tay gập lên chống cằm; tay trái gập vắt bụng
      p.aRxE = -0.75;
      p.eR = -1.9;
      p.aLxE = -0.3;
      p.eL = -1.1;
      break;
    }
    default:
      return null;
  }
  return { w: emoteWeight(t, len), ...p };
}
