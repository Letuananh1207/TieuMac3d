/**
 * Tiểu nhị mang trà tới chỗ ngồi ở trà lâu (R-TRA-1) — máy trạng thái thuần (không three, không DOM). Đi theo **việc**, không
 * theo đồng hồ: `quay` (đứng sau quầy) → `cho` (khách vừa ngồi: chờ 2 s) → `di` (cầm ấm, đi theo đường tới chỗ đứng rót) →
 * `rot` (rót 2 s) → `ve` (đi ngược đường cũ) → `quay`. `s` = quãng (m) dọc đường quầy → chỗ đứng rót của chỗ đang phục vụ;
 * đường do nơi gọi dựng (`scene/teaPath.ts`), ở đây chỉ cần độ dài. File ghép (`tieuNhi.ts`) đặt NPC theo `s`.
 */

export type TeaPhase = 'quay' | 'cho' | 'di' | 'rot' | 've';

/** Khách ngồi xong bao lâu thì tiểu nhị rời quầy (s). */
export const TEA_WAIT = 2;
/** Rót trà bao lâu (s). */
export const TEA_POUR = 2;
/** Tốc độ đi (m/s) — QĐ1 người dùng 2026-11-16. */
export const TEA_SPEED = 2.4;
/** Câu nói trên kênh chung lúc rời quầy (QĐ1). */
export const TEA_SAY = 'Có ngay, thiếu hiệp đợi chút!';

export interface TeaInput {
  dt: number;
  /** chỗ người chơi đang ngồi trong trà lâu (chỉ số chỗ), không ngồi / ngồi chỗ khác ngoài trà lâu → `null` */
  seated: number | null;
  /** độ dài đường quầy → chỗ đứng rót của chỗ `seat` (m); không có đường → `null` (không ai mang, cầm chén ngay) */
  length(seat: number): number | null;
  /** đang về mà người chơi chắn trước mặt (`isBlocking`) → đứng chờ */
  blocked?: boolean;
}

export interface TeaOutput {
  phase: TeaPhase;
  /** chỗ ngồi của đường đang đi (đi / rót / về); ở quầy → `null` */
  route: number | null;
  /** quãng dọc đường (m): 0 = ở quầy */
  s: number;
  /** giây đã ở pha hiện tại (chờ, rót) */
  t: number;
  /** người đang ngồi đã có chén trà (rót xong lần ngồi này) */
  served: boolean;
  /** đứng ở quầy → có nút "Nói chuyện", nhìn người chơi / gật (R-NPC-3, R-NPC-10) */
  canTalk: boolean;
  /** đúng khung này nói câu này lên kênh chung */
  say?: string;
}

export class TeaService {
  private phase: TeaPhase = 'quay';
  private route: number | null = null;
  private s = 0;
  private t = 0;
  /** chỗ ngồi khung trước (để biết vừa ngồi / vừa đứng dậy) */
  private prev: number | null = null;
  /** lần ngồi hiện tại chưa được mang trà */
  private pending = false;
  private served = false;

  step(inp: TeaInput): TeaOutput {
    let say: string | undefined;
    if (inp.seated !== this.prev) {
      if (this.prev !== null) this.standUp();
      if (inp.seated !== null) {
        const path = inp.length(inp.seated) !== null;
        this.pending = path; // mỗi lần ngồi một lần mang
        this.served = !path; // không có đường → cầm chén ngay như R-NGOI-1
      }
      this.prev = inp.seated;
    }
    switch (this.phase) {
      case 'quay':
        if (this.pending && inp.seated !== null) {
          this.phase = 'cho';
          this.route = inp.seated;
          this.t = 0;
        }
        break;
      case 'cho':
        this.t += inp.dt;
        if (this.t >= TEA_WAIT) {
          this.phase = 'di';
          this.s = 0;
          this.t = 0;
          say = TEA_SAY;
        }
        break;
      case 'di': {
        const len = this.route === null ? null : inp.length(this.route);
        if (len === null) {
          this.phase = 've';
          break;
        }
        this.s = Math.min(len, this.s + TEA_SPEED * inp.dt);
        if (this.s >= len) {
          this.phase = 'rot';
          this.t = 0;
        }
        break;
      }
      case 'rot':
        this.t += inp.dt;
        if (this.t >= TEA_POUR) {
          this.served = true;
          this.pending = false;
          this.phase = 've';
          this.t = 0;
        }
        break;
      case 've':
        if (!inp.blocked) this.s = Math.max(0, this.s - TEA_SPEED * inp.dt);
        if (this.s <= 0) {
          this.phase = 'quay';
          this.route = null;
        }
        break;
    }
    const atCounter = this.phase === 'quay' || this.phase === 'cho';
    return { phase: this.phase, route: atCounter ? null : this.route, s: this.s, t: this.t, served: this.served, canTalk: atCounter, ...(say ? { say } : {}) };
  }

  /** Đứng dậy: mất chén; đang chờ → thôi; đang đi / rót → quay về từ chỗ đang đứng. */
  private standUp(): void {
    this.served = false;
    this.pending = false;
    if (this.phase === 'cho') {
      this.phase = 'quay';
      this.route = null;
    } else if (this.phase === 'di' || this.phase === 'rot') this.phase = 've';
  }
}
