import { el } from './dom';

/** Trạng thái cụm nút mỗi khung (R-DIEU-6/7). */
export interface ActionState {
  /** ẩn cả cụm: bài học, màn tải, bản đồ, hội thoại */
  hidden: boolean;
  /** đang bay (không đứng trên đất) */
  air: boolean;
  sitting: boolean;
  bowing: boolean;
  /** vùng có bài học bộ thủ còn bộ chưa học → số bộ còn lại (nút "Tu luyện" + chấm đếm — R-DIEU-7); khác → `null` */
  cultivate: number | null;
}

/**
 * Cụm nút hành động góc dưới phải (thiết kế 2026-11-13.9 "Nút hành động"): Nhảy (68, ngọc lục), Chào và Thiền (52, kính).
 * Mờ khi không dùng được: Nhảy lúc ngồi / đang bay; Chào lúc ngồi / đang bay; Thiền lúc đang bay. Đang thiền / chào → sáng.
 */
export class ActionButtons {
  private readonly root = el('actions');
  private readonly jump = el<HTMLButtonElement>('actJump');
  private readonly bow = el<HTMLButtonElement>('actBow');
  private readonly sit = el<HTMLButtonElement>('actSit');
  private readonly sitLabel = el('actSitLabel');
  private readonly sitBadge = el('actSitBadge');
  /** chữ trong vòng joystick khi chưa chạm */
  private readonly joyHint = el('joyGhost').querySelector('span');
  private last = '';

  constructor(on: { jump(): void; bow(): void; sit(): void }) {
    // pointerdown: phản hồi ngay (nhảy cần nhạy); nút nằm trên canvas nên chạm nút không thành kéo xoay camera
    const bind = (b: HTMLButtonElement, f: () => void): void =>
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!b.classList.contains('off')) f();
      });
    bind(this.jump, on.jump);
    bind(this.bow, on.bow);
    bind(this.sit, on.sit);
  }

  update(s: ActionState): void {
    const key = `${s.hidden}${s.air}${s.sitting}${s.bowing}${s.cultivate}`;
    if (key === this.last) return; // chỉ đụng DOM khi đổi
    this.last = key;
    this.root.hidden = s.hidden;
    this.jump.classList.toggle('off', s.air || s.sitting);
    this.bow.classList.toggle('off', s.air || s.sitting);
    this.sit.classList.toggle('off', s.air);
    this.bow.classList.toggle('on', s.bowing);
    this.sit.classList.toggle('on', s.sitting);
    this.sit.setAttribute('aria-pressed', String(s.sitting));
    // R-DIEU-7 (thiết kế 2026-11-13.19): vùng còn bộ chưa học → "Tu luyện" + chấm đếm; đang ngồi ẩn chấm
    const n = s.cultivate;
    this.sitLabel.textContent = n !== null ? (s.sitting ? 'Đang tu luyện' : 'Tu luyện') : s.sitting ? 'Đang thiền' : 'Thiền';
    this.sitBadge.hidden = n === null || s.sitting;
    this.sitBadge.textContent = n === null ? '' : n >= 100 ? '99+' : String(n);
    this.sit.setAttribute('aria-label', n !== null && !s.sitting ? `Tu luyện, còn ${n} bộ thủ chưa học` : 'Ngồi thiền');
    if (this.joyHint) this.joyHint.textContent = s.sitting ? 'kéo để đứng dậy' : 'kéo để đi';
  }
}
