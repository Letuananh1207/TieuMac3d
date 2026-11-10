import type { Zone } from '../zones/zones';
import { el } from './dom';

/**
 * Thẻ mời khi đứng trong vùng. "Để sau" thì không hiện lại cho tới khi
 * người chơi bước ra khỏi mọi vùng rồi quay lại.
 */
export class EventCard {
  private readonly card = el('card');
  private readonly eyebrow = el('cardEyebrow');
  private readonly title = el('cardTitle');
  private readonly go = el<HTMLButtonElement>('cardGo');
  private shown: Zone | null = null;
  private dismissed: Zone | null = null;

  constructor(onGo: (zone: Zone) => void) {
    el('cardLater').addEventListener('click', () => this.dismiss());
    this.go.addEventListener('click', () => {
      const z = this.shown;
      if (!z) return;
      this.dismiss();
      onGo(z);
    });
  }

  /** Gọi khi người chơi đổi vùng (null = ra ngoài mọi vùng). */
  setZone(z: Zone | null): void {
    if (!z) {
      this.hide();
      this.dismissed = null;
      return;
    }
    if (z === this.dismissed) return;
    this.eyebrow.textContent = z.eyebrow;
    const han = document.createElement('span');
    han.className = 'han';
    han.textContent = z.title.han;
    this.title.replaceChildren(z.title.before, han, z.title.after);
    this.go.textContent = z.go;
    this.shown = z;
    this.card.hidden = false;
  }

  private dismiss(): void {
    this.dismissed = this.shown;
    this.hide();
  }

  private hide(): void {
    this.card.hidden = true;
    this.shown = null;
  }
}
