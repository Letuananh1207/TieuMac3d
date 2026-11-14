import { el } from './dom';

/** Trạng thái cụm nút mỗi khung (R-DIEU-6/7). */
export interface ActionState {
  /** ẩn cả cụm: bài học, màn tải, bản đồ, hội thoại */
  hidden: boolean;
  /** đang bay (không đứng trên đất) */
  air: boolean;
  sitting: boolean;
  bowing: boolean;
  /** chấm son nút "Ngồi ôn" (R-DIEU-7): `due` = số bộ đến hạn, `new` = số bộ chưa học (vùng có bài học); `null` = không chấm */
  badge: { n: number; kind: 'due' | 'new' } | null;
}

/** Chữ nút "Ngồi ôn" theo trạng thái (R-DIEU-7, thiết kế 2026-11-14.10 — chuỗi `actionSit*`). Thuần. */
export function sitButtonText(
  sitting: boolean,
  badge: ActionState['badge'],
): { label: string; aria: string; badge: string | null } {
  if (sitting) return { label: 'Đang ôn', aria: 'Đang ôn, bấm để đứng dậy', badge: null };
  if (!badge) return { label: 'Ngồi ôn', aria: 'Ngồi ôn', badge: null };
  const aria = badge.kind === 'due' ? `Ngồi ôn, còn ${badge.n} bộ đến hạn` : `Ngồi ôn, còn ${badge.n} bộ chưa học`;
  return { label: 'Ngồi ôn', aria, badge: badge.n >= 100 ? '99+' : String(badge.n) };
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
    const key = `${s.hidden}${s.air}${s.sitting}${s.bowing}${s.badge?.kind}${s.badge?.n}`;
    if (key === this.last) return; // chỉ đụng DOM khi đổi
    this.last = key;
    this.root.hidden = s.hidden;
    this.jump.classList.toggle('off', s.air || s.sitting);
    this.bow.classList.toggle('off', s.air || s.sitting);
    this.sit.classList.toggle('off', s.air);
    this.bow.classList.toggle('on', s.bowing);
    this.sit.classList.toggle('on', s.sitting);
    this.sit.setAttribute('aria-pressed', String(s.sitting));
    // R-DIEU-7 (thiết kế 2026-11-14.10): "Ngồi ôn" / "Đang ôn"; chấm son bộ đến hạn hoặc bộ chưa học; đang ngồi ẩn chấm
    const t = sitButtonText(s.sitting, s.badge);
    this.sitLabel.textContent = t.label;
    this.sitBadge.hidden = t.badge === null;
    this.sitBadge.textContent = t.badge ?? '';
    this.sit.setAttribute('aria-label', t.aria);
    if (this.joyHint) this.joyHint.textContent = s.sitting ? 'kéo để đứng dậy' : 'kéo để đi';
  }
}
