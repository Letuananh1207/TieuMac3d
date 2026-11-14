import * as THREE from 'three';
import { bubbleLook, bubbleVisible, type Bubble } from '../chat/bubbleTimer';
import type { Speaker } from '../chat/chatMessage';
import { fillChatText, h } from './chatText';

/** Người nói đang có trong cảnh: điểm neo (toạ độ cảnh) + khoảng hở trên điểm neo (px, vd. chừa nhãn tên). */
export interface BubbleAnchor {
  speaker: Speaker;
  at: THREE.Vector3;
  liftPx: number;
}

interface Slot {
  wrap: HTMLDivElement;
  box: HTMLDivElement;
  stem: HTMLDivElement;
  text: string;
}

/** Khoảng hở giữa hai bong bóng chồng nhau (thiết kế 2026-11-14.9). */
const GAP = 6;

/**
 * Bong bóng thoại trên đầu (R-CHAT-2) — thiết kế 2026-11-14.9 "Trò chuyện kênh chung".
 * Neo theo đầu như nút học nổi; ba kiểu: mình (viền ngọc), người khác (kính), NPC (giấy viền vàng).
 * Hai bong bóng chồng nhau → bong bóng cũ hơn đẩy lên, nối xuống điểm neo bằng vạch + chấm.
 */
export class ChatBubbles {
  private readonly root = h('div');
  private readonly slots = new Map<string, Slot>();
  private readonly v = new THREE.Vector3();
  private readonly camPos = new THREE.Vector3();

  constructor(parent: HTMLElement) {
    this.root.id = 'chatBubbles';
    parent.append(this.root);
  }

  /** Mỗi khung. `bubbles` = bong bóng còn sống; `anchors` theo mã người nói; `hidden` = đang bận (bài học, thoại…). */
  update(bubbles: readonly Bubble[], anchors: ReadonlyMap<string, BubbleAnchor>, camera: THREE.Camera, now: number, hidden: boolean): void {
    const shown = new Set<string>();
    const placed: { x: number; y: number; w: number; hgt: number; id: string; until: number }[] = [];
    if (!hidden) {
      camera.getWorldPosition(this.camPos);
      for (const b of bubbles) {
        const a = anchors.get(b.speakerId);
        if (!a) continue;
        this.v.copy(a.at).project(camera);
        if (!bubbleVisible(a.at.distanceTo(this.camPos), this.v.z < 1)) continue;
        const slot = this.slot(b, a.speaker);
        const look = bubbleLook(b, now);
        slot.wrap.style.opacity = String(look.opacity);
        slot.box.style.transform = `scale(${look.scale})`;
        const x = ((this.v.x + 1) / 2) * window.innerWidth;
        const y = ((1 - this.v.y) / 2) * window.innerHeight - a.liftPx;
        // đo hộp chữ (không tính vạch nối — vạch dài theo khung trước); +6 = đuôi
        placed.push({ x, y, w: slot.box.offsetWidth, hgt: slot.box.offsetHeight + 6, id: b.speakerId, until: b.until });
        shown.add(b.speakerId);
      }
    }
    // mới trước: bong bóng mới giữ chỗ neo, cũ hơn bị đẩy lên khi chồng
    placed.sort((p, q) => q.until - p.until);
    const done: { l: number; r: number; t: number; b: number }[] = [];
    for (const p of placed) {
      const slot = this.slots.get(p.id)!;
      let bottom = p.y;
      const l = p.x - p.w / 2;
      const r = p.x + p.w / 2;
      for (let moved = true; moved; ) {
        moved = false;
        for (const d of done) {
          if (l < d.r && r > d.l && bottom - p.hgt < d.b && bottom > d.t) {
            bottom = d.t - GAP;
            moved = true;
          }
        }
      }
      done.push({ l, r, t: bottom - p.hgt, b: bottom });
      const lift = p.y - bottom;
      slot.wrap.classList.toggle('lifted', lift > 0);
      slot.stem.style.height = `${lift}px`;
      slot.wrap.style.left = `${p.x}px`;
      slot.wrap.style.top = `${p.y}px`;
    }
    for (const [id, slot] of this.slots) {
      if (shown.has(id)) continue;
      slot.wrap.remove();
      this.slots.delete(id);
    }
  }

  private slot(b: Bubble, speaker: Speaker): Slot {
    let s = this.slots.get(b.speakerId);
    if (!s) {
      const wrap = h('div', `cb cb-${speaker.kind}`);
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-label', `${speaker.kind === 'player' ? 'Ta' : speaker.name} nói`);
      const box = h('div', 'cb-box');
      const tail = h('div', 'cb-tail');
      tail.setAttribute('aria-hidden', 'true');
      const stem = h('div', 'cb-stem');
      stem.setAttribute('aria-hidden', 'true');
      wrap.append(box, tail, stem);
      this.root.append(wrap);
      s = { wrap, box, stem, text: '' };
      this.slots.set(b.speakerId, s);
    }
    if (s.text !== b.text) {
      s.text = b.text;
      fillChatText(s.box, b.text);
    }
    return s;
  }
}
