/**
 * TẠM — lớp phủ của hoạt cảnh cưỡi hạc (R-HANH-5) cho **chế độ thử** (`?hac`), chưa có thiết kế: màn mây (mây trắng phủ
 * màn) + lớp chữ khi bay (tên nơi đến, tiến độ, "Chạm để bỏ qua" / "Sắp tới nơi…") + lớp bắt chạm bỏ qua. Thay bằng thiết
 * kế theo phiếu docs/phieu_thiet_ke/2026-11-15-cuoi-hac.md (`/ui-apply`), không đưa vào app trước đó (`CRANE_IN_APP`).
 * Dựng bằng `createElement` + style trực tiếp (không CSS riêng — bỏ cả file khi áp thiết kế). Chữ chỉ tiếng Việt (R-HUD-4).
 */
import type { CraneHint } from '../zones/cuoiHac';

const HINT: Record<CraneHint, string> = { boQua: 'Chạm để bỏ qua', sapToi: 'Sắp tới nơi…' };

export class CraneHud {
  private readonly root = document.createElement('div');
  private readonly veilEl = document.createElement('div');
  private readonly text = document.createElement('div');
  private readonly name = document.createElement('div');
  private readonly sub = document.createElement('div');
  private readonly bar = document.createElement('div');
  private readonly fill = document.createElement('div');
  private readonly hintEl = document.createElement('div');
  private onTap: () => void = () => {};

  /** `night` → mây xám chàm thay cho trắng */
  constructor(night = false) {
    Object.assign(this.root.style, { position: 'fixed', inset: '0', zIndex: '50', pointerEvents: 'none' });
    Object.assign(this.veilEl.style, { position: 'absolute', inset: '0', background: night ? '#3a4658' : '#f4f7f6', opacity: '0' });
    Object.assign(this.text.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: 'calc(env(safe-area-inset-top) + 28px)',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      color: night ? '#eef2f4' : '#24323a',
      textShadow: night ? '0 1px 3px rgba(0,0,0,.5)' : '0 1px 3px rgba(255,255,255,.8)',
      fontFamily: 'var(--ui, sans-serif)',
    });
    Object.assign(this.name.style, { fontFamily: 'var(--display, serif)', fontWeight: '700', fontSize: '22px' });
    Object.assign(this.sub.style, { fontSize: '13px', opacity: '.8' });
    this.sub.textContent = 'Đang cưỡi hạc tới…';
    Object.assign(this.bar.style, { width: '120px', height: '2px', background: 'rgba(36,50,58,.18)', borderRadius: '2px', marginTop: '4px' });
    Object.assign(this.fill.style, { height: '2px', width: '0', background: 'var(--jade, #3f7d6e)', borderRadius: '2px' });
    Object.assign(this.hintEl.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      bottom: 'calc(env(safe-area-inset-bottom) + 26px)',
      textAlign: 'center',
      fontSize: '13px',
      color: night ? '#eef2f4' : '#24323a',
      opacity: '.75',
      display: 'none',
    });
    this.bar.append(this.fill);
    this.text.append(this.name, this.sub, this.bar);
    this.root.append(this.veilEl, this.text, this.hintEl);
    this.root.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onTap();
    });
    document.body.append(this.root);
  }

  /** bắt chạm cả màn (chặn điều khiển) trong hoạt cảnh; `null` = thả */
  capture(onTap: (() => void) | null): void {
    this.onTap = onTap ?? (() => {});
    this.root.style.pointerEvents = onTap ? 'auto' : 'none';
  }

  /** mây phủ màn 0…1 */
  veil(k: number): void {
    this.veilEl.style.opacity = String(Math.min(1, Math.max(0, k)));
  }

  /** lớp chữ khi bay; `place` null = ẩn */
  flying(place: string | null, progress = 0, hint: CraneHint = 'boQua'): void {
    this.text.style.display = place ? 'flex' : 'none';
    this.hintEl.style.display = place ? 'block' : 'none';
    if (!place) return;
    this.name.textContent = place;
    this.fill.style.width = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`;
    this.hintEl.textContent = HINT[hint];
  }

  /** gợi ý dưới màn khi cất / hạ cánh (không có lớp chữ) */
  hint(h: CraneHint | null): void {
    this.hintEl.style.display = h ? 'block' : 'none';
    if (h) this.hintEl.textContent = HINT[h];
  }

  remove(): void {
    this.root.remove();
  }
}
