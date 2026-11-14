import * as THREE from 'three';
import type { Dialog, DialogLine } from '../zones/dialogs';
import { el } from './dom';
import { npcFace } from './npcFace';

// chân dung NPC: design/models/anh/<mã>-chan-dung.png (Vite chép vào bản build, chạy offline)
const portraits = import.meta.glob('../../../design/models/anh/*-chan-dung.png', { eager: true, query: '?url', import: 'default' });
export function portraitOf(npc: string): string | undefined {
  const hit = Object.entries(portraits).find(([p]) => p.endsWith(`/${npc}-chan-dung.png`));
  return hit?.[1] as string | undefined;
}

/** Nút "Nói chuyện" bám trên đầu NPC (R-NPC-2) — kiểu nút học nổi, kèm bảng tên. */
export class TalkButton {
  private readonly root = el('talk');
  private readonly name = el('talkName');
  private readonly han = el('talkHan');
  private readonly v = new THREE.Vector3();
  private dialog: Dialog | null = null;

  constructor(onTalk: (d: Dialog) => void) {
    el('talkBtn').addEventListener('click', () => {
      if (this.dialog) onTalk(this.dialog);
    });
  }

  /** NPC trong tầm nói chuyện (null = không có / đang bận → ẩn). */
  set(d: Dialog | null): void {
    if (d && d !== this.dialog) {
      this.name.textContent = d.name;
      this.han.textContent = d.han ?? '';
    }
    this.dialog = d;
    this.root.hidden = !d;
  }

  /** Mỗi khung: đặt nút trên đầu NPC (`anchor`, toạ độ cảnh) theo camera; điểm ra sau camera thì giấu. */
  follow(anchor: THREE.Vector3 | undefined, camera: THREE.Camera): void {
    if (this.root.hidden || !anchor) return;
    this.v.copy(anchor).project(camera);
    this.root.style.visibility = this.v.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.root.style.left = `${Math.min(w - 90, Math.max(90, ((this.v.x + 1) / 2) * w))}px`;
    this.root.style.top = `${Math.min(h - 120, Math.max(130, ((1 - this.v.y) / 2) * h))}px`;
  }
}

/**
 * Khung thoại đáy màn (R-NPC-2): ảnh cận mặt NPC bên trái + bảng tên, lời thoại hiện hết ngay cùng các lựa chọn;
 * "Tạm biệt" luôn cuối. Không giữ luồng hội thoại — `onChoose(i)` trả câu tiếp (null = đóng).
 */
export class DialogBox {
  private readonly root = el('dialog');
  private readonly text = el('dlgText');
  private readonly end = el('dlgEnd');
  private readonly choices = el('dlgChoices');

  constructor(
    private readonly onChoose: (i: number) => DialogLine | null,
    private readonly onClose: () => void,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(d: Dialog, first: DialogLine): void {
    el('dlgName').textContent = d.name;
    el('dlgHan').textContent = d.han ?? '';
    const img = el<HTMLImageElement>('dlgFace');
    const face = npcFace(d.npc);
    el('dlgFaceBox').hidden = !face;
    img.classList.toggle('mat', face?.kind === 'mat');
    if (face) img.src = face.url;
    this.root.hidden = false;
    document.body.classList.add('talking');
    this.show(first);
  }

  close(): void {
    if (this.root.hidden) return;
    this.root.hidden = true;
    document.body.classList.remove('talking');
    this.onClose();
  }

  /** Lời thoại hiện hết ngay cùng các lựa chọn (R-NPC-2 — không chạy chữ dần). */
  private show(line: DialogLine): void {
    this.text.textContent = line.text;
    this.end.hidden = false;
    this.choices.replaceChildren(
      ...line.choices.map((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        const bye = c.next === null;
        if (bye) b.className = 'bye';
        const mark = document.createElement('span');
        mark.className = bye ? 'x' : 'dot';
        mark.setAttribute('aria-hidden', 'true');
        if (bye) mark.textContent = '×';
        const t = document.createElement('span');
        t.textContent = c.text;
        b.append(mark, t);
        b.addEventListener('click', () => {
          const next = this.onChoose(i);
          if (next) this.show(next);
          else this.close();
        });
        return b;
      }),
    );
  }
}
