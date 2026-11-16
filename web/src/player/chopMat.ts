/**
 * Lịch chớp mắt + mắt theo biểu cảm (R-MAT-1, R-MAT-2 — kế hoạch docs/tasks/2026-11-16-chop-mat.md). Thuần (không three) —
 * test `chopMat.test.ts`. Kết quả là độ khép mí trên / mí dưới (0…1) cho `miMat.ts`.
 */
import { emoteWeight } from './bieuCamDang';

/** Một lần chớp (s): khép · giữ · mở ≈ 0,15 s; cách nhau 3–6 s; 20 % là chớp đôi (nghỉ 0,12 s giữa hai lần). */
export const CHOP = { khep: 0.05, giu: 0.03, mo: 0.07, cachMin: 3, cachMax: 6, doi: 0.2, nghiDoi: 0.12 };
/** Chớp chậm (lim dim — Suy nghĩ, gảy đàn): thời lượng một lần chớp nhân chừng này. */
export const CHAM = 2.5;
/** Mắt đang khép (mí trên, hay tổng hai mí) từ mức này → không chớp. */
export const KHONG_CHOP = 0.8;
/** Hằng mượt khi đổi biểu cảm mắt (1/s) — hết biểu cảm mở mắt mượt, không bật. */
const MUOT = 7;

/** Tư thế mắt mong muốn: mí trên khép, mí dưới đẩy lên (híp cong), chớp chậm. */
export interface MucMat {
  tren: number;
  duoi: number;
  cham?: boolean;
}

export const MO: MucMat = { tren: 0, duoi: 0 };

/** Đồ thị một lần chớp theo giây `t` (0 → 1 → 0). */
export function doChop(t: number): number {
  const { khep, giu, mo } = CHOP;
  if (t <= 0) return 0;
  if (t < khep) return t / khep;
  if (t < khep + giu) return 1;
  if (t < khep + giu + mo) return 1 - (t - khep - giu) / mo;
  return 0;
}
const CHOP_LEN = CHOP.khep + CHOP.giu + CHOP.mo;

/** Mí của một nhân vật theo thời gian: lịch chớp ngẫu nhiên có hạt giống (hai nhân vật khác hạt không chớp cùng nhịp). */
export class ChopMat {
  private rnd: number;
  private cho: number;
  /** giây trong lần chớp đang diễn; < 0 = không chớp */
  private t = -1;
  private conDoi = false;
  private nghi = 0;
  private tren = 0;
  private duoi = 0;
  /** độ khép thêm do chớp lúc này (0…1) — cho test */
  chop = 0;

  constructor(seed = 0) {
    this.rnd = (Math.abs(Math.floor(seed * 7919 + 17)) % 2147483646) + 1;
    this.cho = 0.4 + this.random() * CHOP.cachMax; // lần đầu lệch hẳn nhau giữa các nhân vật
  }

  private random(): number {
    this.rnd = (this.rnd * 16807) % 2147483647;
    return (this.rnd - 1) / 2147483646;
  }

  /** chớp ngay (NPC gật khi thoại — R-MAT-1) */
  chopNgay(): void {
    if (this.t < 0) this.t = 0;
  }

  /** Mỗi khung: tiến lịch chớp, trộn mượt về tư thế mắt `dich`. Trả về độ khép mí trên / mí dưới. */
  update(dt: number, dich: MucMat = MO): { tren: number; duoi: number } {
    const k = 1 - Math.exp(-dt * MUOT);
    this.tren += (dich.tren - this.tren) * k;
    this.duoi += (dich.duoi - this.duoi) * k;
    const khep = Math.max(this.tren, this.tren + this.duoi);
    const nhip = dich.cham ? CHAM : 1;
    if (this.nghi > 0) {
      // nghỉ giữa hai lần của chớp đôi
      this.nghi -= dt / nhip;
      if (this.nghi <= 0) this.t = 0;
    } else if (this.t < 0) {
      this.cho -= dt;
      if (this.cho <= 0) {
        if (khep >= KHONG_CHOP) this.cho = CHOP.cachMin * 0.5; // đang nhắm / híp: không chớp, thử lại sau
        else {
          this.t = 0;
          this.conDoi = this.random() < CHOP.doi;
          this.cho = CHOP.cachMin + this.random() * (CHOP.cachMax - CHOP.cachMin);
        }
      }
    }
    this.chop = 0;
    if (this.t >= 0) {
      this.t += dt / nhip;
      this.chop = khep >= KHONG_CHOP ? 0 : doChop(this.t);
      if (this.t >= CHOP_LEN) {
        this.t = -1;
        // chớp đôi: lần hai sau một quãng nghỉ ngắn
        if (this.conDoi) {
          this.conDoi = false;
          this.nghi = CHOP.nghiDoi;
        }
      }
    }
    const mo = 1 - this.tren - this.duoi;
    return { tren: this.tren + Math.max(0, mo) * this.chop, duoi: this.duoi };
  }
}

/** Trạng thái để suy ra mắt theo biểu cảm (phần của `CharacterState` + dáng đứng lâu). */
export interface TrangThaiMat {
  emote?: { id: string; t: number; len: number };
  /** 0…1 chắp tay chào (đã làm mượt) */
  bow?: number;
  /** 0…1 vươn vai (R-DIEU-8) */
  stretch?: number;
  /** đang gảy đàn (Cầm Nương — R-NPC-9) */
  pluck?: number;
}

/** Ngồi nghỉ (R-MAT-2): từ giây này lim dim, từ giây này ngủ gật. */
export const LIM_DIM_S = 6;
export const NGU_GAT_S = 15;
/** Ngủ gật: mỗi chu kỳ (s) choàng mở mắt ngẩng lên một lần, kéo dài (s). */
const CHOANG = { chuKy: 13, luc: 8, dai: 1.6 };
/** Ngủ gật: đầu gục (rad) + biên độ nhịp thở. */
export const GUC = { goc: 0.16, tho: 0.05 };

const smooth = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * Mắt theo biểu cảm (R-MAT-2) + đầu gục khi ngủ gật. `nhipTho` = tần số thở (rad/s, `Tinh.nhipTho`).
 * Cười, Nhảy mừng: híp cong ^^ · Vỗ tay: híp nhẹ · Suy nghĩ: lim dim, chớp chậm · Cúi chào / Chắp tay / vươn vai: nhắm
 * theo độ cúi / vươn · Ngồi nghỉ ≥ 6 s lim dim, ≥ 15 s nhắm + gục đầu theo nhịp thở, thỉnh thoảng choàng mở · gảy đàn:
 * lim dim, chớp chậm · Vẫy tay: chớp thường.
 */
export function mucBieuCam(s: TrangThaiMat, nhipTho = 1.6): MucMat & { guc: number } {
  let tren = 0;
  let duoi = 0;
  let cham = false;
  let guc = 0;
  const em = s.emote;
  if (em) {
    const w = emoteWeight(em.t, em.len);
    switch (em.id) {
      case 'cuoi':
      case 'nhay-mung':
        tren = 0.22 * w;
        duoi = 0.78 * w;
        break;
      case 'vo-tay':
        tren = 0.3 * w;
        duoi = 0.32 * w;
        break;
      case 'suy-nghi':
        tren = 0.5 * w;
        cham = true;
        break;
      case 'cui-chao': {
        // nhắm theo độ cúi: như dáng `bieuCamDang.ts` (0,6 s cúi · giữ · 0,6 s đứng lên)
        const t = em.t;
        const d = t < 0.6 ? smooth(t / 0.6) : t < 1.2 ? 1 : smooth((em.len - 0.2 - t) / 0.6);
        tren = 0.85 * d * w;
        break;
      }
      case 'ngoi-nghi': {
        const lim = smooth((em.t - LIM_DIM_S) / 1.5);
        const ngu = smooth((em.t - NGU_GAT_S) / 2);
        const c = (em.t - NGU_GAT_S - 2) % CHOANG.chuKy;
        const choang = em.t > NGU_GAT_S + 2 && c > CHOANG.luc && c < CHOANG.luc + CHOANG.dai ? Math.sin((Math.PI * (c - CHOANG.luc)) / CHOANG.dai) : 0;
        tren = (0.55 * lim + 0.45 * ngu) * (1 - 0.85 * choang);
        guc = ngu * (GUC.goc + GUC.tho * Math.sin(em.t * nhipTho)) * (1 - choang);
        cham = true;
        break;
      }
      default:
        break;
    }
  }
  if (s.bow) tren = Math.max(tren, 0.8 * s.bow);
  if (s.stretch) tren = Math.max(tren, 0.9 * s.stretch);
  if (s.pluck !== undefined) {
    tren = Math.max(tren, 0.5);
    cham = true;
  }
  return { tren, duoi, cham, guc };
}
