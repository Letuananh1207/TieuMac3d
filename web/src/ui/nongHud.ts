/**
 * Nút nổi nông trại (R-NONG-1…6) — dùng lại nút nổi "Bán" của vườn (thiết kế 2026-11-15.29, `nong.css`): một viên neo trên
 * công trình gần nhất ("Rắc thóc", "Nhặt trứng", "Câu cá · còn 3 / 5", "Giật cần!", "Cho cỏ", "Lấy sữa", "Gieo bầu", "Hái
 * dưa leo"); trạng thái chờ ("Gà đã no · mai có trứng", "Bầu · còn 1 giờ") là viên kính không bấm. Máy tính: phím E (nơi
 * ghép gọi `press`). Không biết luật — `nongTrai.ts` đưa dữ liệu. DOM dựng bằng createElement.
 */
import * as THREE from 'three';
import './nong.css';
import type { NongItem } from '../zones/nong';
import type { CropId } from '../zones/vuon';
import { h } from './chatText';
import { itemPicture } from './nongArt';

export interface FarmButtonView {
  /** chữ chính (đậm) */
  label: string;
  /** chữ phụ trong viên nhỏ (vd. "còn 3 / 5") hoặc sau dấu · ở trạng thái chờ */
  sub?: string;
  /** hình vật phẩm 28 */
  item?: CropId | NongItem;
  /** trạng thái chờ: viên kính, không bấm */
  off?: boolean;
  /** "Giật cần!" — viền vàng */
  hot?: boolean;
  /** điểm neo trong cảnh */
  at: THREE.Vector3;
}

export class NongHud {
  private readonly wrap = h('div');
  private readonly btn = h('button');
  private readonly at = new THREE.Vector3();
  private readonly v = new THREE.Vector3();
  private key = '';

  constructor(onPress: () => void) {
    this.wrap.id = 'farmBtn';
    this.wrap.hidden = true;
    this.btn.type = 'button';
    // pointerdown: "Giật cần!" cần nhạy (như nút Nhảy)
    this.btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.wrap.classList.contains('off')) onPress();
    });
    const tip = h('div', 'tip');
    tip.setAttribute('aria-hidden', 'true');
    this.wrap.append(this.btn, tip);
    document.body.append(this.wrap);
  }

  set(v: FarmButtonView | null): void {
    this.wrap.hidden = !v;
    if (!v) return;
    this.at.copy(v.at);
    const k = `${v.label}|${v.sub}|${v.item}|${v.off}|${v.hot}`;
    if (k === this.key) return;
    this.key = k;
    this.wrap.classList.toggle('off', !!v.off);
    this.wrap.classList.toggle('hot', !!v.hot);
    const kids: (Node | string)[] = [];
    if (v.item) kids.push(itemPicture(v.item, 28));
    if (v.off) {
      kids.push(h('b', '', v.label));
      if (v.sub) kids.push(` · ${v.sub}`);
    } else {
      kids.push(v.label);
      if (v.sub) kids.push(h('span', 'sub', v.sub));
    }
    this.btn.replaceChildren(...kids);
    this.btn.setAttribute('aria-label', v.sub ? `${v.label}, ${v.sub}` : v.label);
  }

  /** Mỗi khung: viên bám điểm neo; ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    if (this.wrap.hidden) return;
    const p = this.v.copy(this.at).project(camera);
    this.wrap.style.visibility = p.z > 1 ? 'hidden' : 'visible';
    const w = window.innerWidth;
    const hh = window.innerHeight;
    this.wrap.style.left = `${Math.min(w - 110, Math.max(110, ((p.x + 1) / 2) * w))}px`;
    this.wrap.style.top = `${Math.min(hh - 140, Math.max(120, ((1 - p.y) / 2) * hh))}px`;
  }
}
