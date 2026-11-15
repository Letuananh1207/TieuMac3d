/**
 * Dáng 6 động tác làm vườn (R-VUON-13): gieo · tưới · bắt sâu · nhổ cỏ · bón · thu — cùng 7 xương tự gắn và quy ước góc như
 * `bieuCamDang.ts` (tay `x` âm = đưa ra trước / lên; tay trái `z` âm = khép vào thân, tay phải ngược dấu; hông `x` dương = cúi).
 * Thuần (không three): `glbCharacter.ts` / `discipleCharacter.ts` trộn dáng vào theo trọng số `w`, `doLamVuon.ts` dựng đồ cầm
 * tay. Mã việc so bằng chuỗi (lớp player không import zones). Thời lượng + mốc hiệu ứng ở đây — file ghép dùng để chờ diễn
 * xong rồi mới gọi luật, cảnh dùng mốc để thả hạt / nước đúng lúc tay vung.
 */
import type { EmotePose } from './bieuCamDang';

export type WorkId = 'gieo' | 'tuoi' | 'bat' | 'nho' | 'bon' | 'thu';
export const WORK_IDS: readonly WorkId[] = ['gieo', 'tuoi', 'bat', 'nho', 'bon', 'thu'];

/** Thời lượng mỗi động tác (s) — R-VUON-13. */
export const WORK_LEN: Readonly<Record<WorkId, number>> = { gieo: 0.9, tuoi: 1.2, bat: 0.8, nho: 0.8, bon: 0.9, thu: 0.9 };

/** Đồ cầm tay khi diễn / khi đang cầm công cụ (`CharacterState.hold`): túi hạt, bình tưới, ống tre, (tay không), bao phân, giỏ. */
export type PropId = 'tui-hat' | 'binh' | 'ong-tre' | 'bao-phan' | 'gio';
export const PROP_OF: Readonly<Record<WorkId, PropId | null>> = { gieo: 'tui-hat', tuoi: 'binh', bat: 'ong-tre', nho: null, bon: 'bao-phan', thu: 'gio' };

/**
 * Mốc hiệu ứng (giây kể từ lúc bắt đầu diễn): `at` = lúc chính (hạt rơi, sâu nảy, cỏ bật, quả bay); `until` = hiệu ứng kéo dài
 * (tia nước) tới lúc này. Luôn trong (0, len).
 */
export const WORK_FX: Readonly<Record<WorkId, { at: readonly number[]; until?: number }>> = {
  gieo: { at: [0.32, 0.56] },
  tuoi: { at: [0.3], until: 1.0 },
  bat: { at: [0.46] },
  nho: { at: [0.52] },
  bon: { at: [0.34, 0.58] },
  thu: { at: [0.5] },
};

export const isWork = (id: string): id is WorkId => (WORK_IDS as readonly string[]).includes(id);

/** Dáng làm vườn = dáng biểu cảm + độ nghiêng đồ cầm tay `tilt` (0 thẳng … 1 nghiêng hết — miệng bình chúc xuống). */
export interface WorkPose extends EmotePose {
  tilt: number;
}

const REST = 0.4;
const IN = 0.15;
const OUT = 0.2;

const smooth = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Trọng số vào 0,15 s / ra 0,2 s cuối (động tác ngắn — vào nhanh hơn biểu cảm). */
export function workWeight(t: number, len: number): number {
  return smooth(Math.min(1, t / IN, (len - t) / OUT));
}

/** Bao (0 → 1 → 0) quanh mốc `c` rộng `w` giây. */
const bump = (t: number, c: number, w: number): number => Math.max(0, 1 - Math.abs(t - c) / w);

/** Dáng việc `id` ở giây `t` (thời lượng `len`, mặc định `WORK_LEN`). Mã lạ → null. */
export function workPose(id: string, t: number, len = isWork(id) ? WORK_LEN[id] : 1): WorkPose | null {
  if (!isWork(id)) return null;
  const p: WorkPose = { w: workWeight(t, len), aLx: -0.12, aLz: -REST, aRx: -0.12, aRz: REST, hipsX: 0, hipsY: 0, headX: 0, headY: 0, headZ: 0, lift: 0, tilt: 0 };
  const k = Math.min(1, Math.max(0, t / len));
  switch (id) {
    case 'gieo':
    case 'bon': {
      // tay trái ôm túi trước bụng; tay phải vốc rồi vung rắc 2 lần (đúng mốc WORK_FX); cúi vừa, đầu nhìn xuống luống
      const fx = WORK_FX[id].at;
      const sw = Math.max(bump(t, fx[0], 0.16), bump(t, fx[1], 0.16));
      p.aLx = -0.85;
      p.aLz = -(REST + 0.35);
      p.aRx = -0.55 - 0.75 * sw;
      p.aRz = REST + 0.2 - 0.25 * sw;
      p.hipsX = 0.3 * smooth(k * 4);
      p.headX = 0.25;
      p.hipsY = id === 'bon' ? 0.1 * sw : -0.1 * sw;
      break;
    }
    case 'tuoi': {
      // tay phải đưa bình ra trước, nghiêng dần (tia nước từ 0,3 s), lắc nhẹ dọc luống; tay trái đỡ đáy bình
      const pour = smooth((t - 0.15) / 0.2) * smooth((len - 0.1 - t) / 0.2);
      p.aRx = -1.05 + 0.1 * pour;
      p.aRz = REST + 0.3;
      p.aLx = -0.8;
      p.aLz = -(REST + 0.5);
      p.hipsX = 0.12;
      p.hipsY = Math.sin(t * 7) * 0.08 * pour;
      p.headX = 0.3;
      p.tilt = pour;
      break;
    }
    case 'bat': {
      // cúi sâu, tay phải với xuống lá → chộp ở 0,46 s → giơ lên bỏ vào ống tre tay trái
      const reach = smooth(t / 0.4);
      const lift = smooth((t - 0.46) / 0.25);
      p.hipsX = 0.6 * reach * (1 - 0.6 * lift);
      p.aRx = -0.75 * reach - 0.85 * lift;
      p.aRz = REST + 0.15 + 0.3 * lift;
      p.aLx = -0.9;
      p.aLz = -(REST + 0.3);
      p.headX = 0.35 * reach;
      break;
    }
    case 'nho': {
      // cúi sâu, hai tay nắm bụi cỏ, giật mạnh lên ở 0,52 s (thân bật ngửa nhẹ)
      const reach = smooth(t / 0.4);
      const pull = smooth((t - 0.46) / 0.14);
      p.hipsX = 0.7 * reach - 0.85 * pull;
      p.aLx = -0.7 * reach - 0.5 * pull;
      p.aRx = -0.7 * reach - 0.5 * pull;
      p.aLz = -(REST + 0.25);
      p.aRz = REST + 0.25;
      p.headX = 0.3 * reach - 0.4 * pull;
      p.lift = 0.04 * bump(t, 0.56, 0.12);
      break;
    }
    case 'thu': {
      // cúi hái bằng hai tay, rồi giơ giỏ lên cao khoe (quả bay lên từ 0,5 s)
      const reach = smooth(t / 0.35);
      const up = smooth((t - 0.45) / 0.25);
      p.hipsX = 0.5 * reach * (1 - up);
      p.aLx = -0.9 * reach - 1.2 * up;
      p.aRx = -0.9 * reach - 1.2 * up;
      p.aLz = -(REST + 0.35);
      p.aRz = REST + 0.35;
      p.headX = 0.3 * reach * (1 - up) - 0.2 * up;
      p.lift = 0.05 * bump(t, 0.7, 0.15);
      break;
    }
  }
  return p;
}
