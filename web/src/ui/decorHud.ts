/**
 * HUD trang trí Nhà của ta (thiết kế 2026-11-14.13 `NhaTa-doc*`, `NhaTa-ngang*`): nút "Trang trí" (cạnh Trò chuyện),
 * chế độ trang trí (viên nhắc trên trái, nút "Xong", nút tròn nổi trên từng ô có huy hiệu loại ô). Bảng danh mục ở
 * `decorPanel.ts`. DOM dựng bằng `createElement`; luật ở `zones/decorMode.ts`, ghép ở `homeDecor.ts`.
 */
import * as THREE from 'three';
import './decor.css';
import type { DecorSlotKind } from '../zones/decor';
import { SLOT_LABEL } from '../zones/decorMode';
import { ICON_CHECK, ICON_DECOR, ICON_PEN, ICON_PLUS, ICON_SLOT, STROKE, svgIcon } from './decorIcons';

export interface PinSlot {
  id: string;
  kind: DecorSlotKind;
}

export interface DecorHudHandlers {
  open(): void;
  done(): void;
  pick(slotId: string): void;
}

interface Pin {
  slot: PinSlot;
  btn: HTMLButtonElement;
  face: string;
}

export class DecorHud {
  private readonly btnWrap = document.createElement('div');
  private readonly hint = document.createElement('div');
  private readonly hintText = document.createElement('span');
  private readonly doneBtn = document.createElement('button');
  private readonly pinLayer = document.createElement('div');
  private readonly pins: Pin[] = [];
  private readonly v = new THREE.Vector3();

  constructor(slots: readonly PinSlot[], on: DecorHudHandlers) {
    // nút "Trang trí"
    this.btnWrap.id = 'decorBtn';
    this.btnWrap.hidden = true;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Trang trí');
    btn.append(svgIcon(ICON_DECOR, 24, undefined, { ...STROKE, 'stroke-width': '2' }));
    btn.addEventListener('click', () => on.open());
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = 'Trang trí';
    this.btnWrap.append(btn, lbl);

    // viên nhắc + "Xong"
    this.hint.id = 'decorHint';
    this.hint.setAttribute('role', 'status');
    this.hint.hidden = true;
    const ring = document.createElement('span');
    ring.className = 'ring';
    ring.append(svgIcon(ICON_PEN, 14, undefined, { ...STROKE, 'stroke-width': '2.4' }));
    this.hint.append(ring, this.hintText);
    this.doneBtn.id = 'decorDone';
    this.doneBtn.type = 'button';
    this.doneBtn.hidden = true;
    this.doneBtn.append(svgIcon(ICON_CHECK, 16, undefined, { ...STROKE, 'stroke-width': '3' }), 'Xong');
    this.doneBtn.addEventListener('click', () => on.done());

    // nút tròn trên từng ô
    this.pinLayer.id = 'decorPins';
    this.pinLayer.hidden = true;
    for (const slot of slots) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dp-pin';
      b.addEventListener('click', () => on.pick(slot.id));
      this.pins.push({ slot, btn: b, face: '' });
      this.pinLayer.append(b);
    }
    document.body.append(this.btnWrap, this.pinLayer, this.hint, this.doneBtn);
  }

  /** Nút "Trang trí": chỉ khi đi lại ở nhà (ẩn khi bản đồ / thoại / ngồi / màn Flutter). */
  setButton(show: boolean): void {
    if (this.btnWrap.hidden === show) this.btnWrap.hidden = !show;
  }

  /** Bật / tắt chế độ trang trí: ẩn cụm điều khiển (CSS `body.decorating`), hiện viên nhắc, "Xong", nút ô. */
  setMode(on: boolean): void {
    document.body.classList.toggle('decorating', on);
    this.hint.hidden = !on;
    this.doneBtn.hidden = !on;
    this.pinLayer.hidden = !on;
  }

  /** Viên nhắc: "Chạm một ô để đặt vật" / tên loại ô đang chọn. */
  setHint(text: string): void {
    this.hintText.textContent = text;
  }

  /**
   * Mỗi khung (chế độ trang trí): nút tròn bám điểm neo của ô (`anchor`, toạ độ cảnh); `filled` = ô có vật → biểu tượng
   * loại ô, trống → "+"; ô đang chọn nền `jade`. Ra sau camera → giấu.
   */
  follow(camera: THREE.Camera, anchor: (slotId: string) => THREE.Vector3 | null, filled: (slotId: string) => boolean, selected: string | null): void {
    if (this.pinLayer.hidden) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const p of this.pins) {
      const a = anchor(p.slot.id);
      if (!a) continue;
      this.v.copy(a).project(camera);
      const off = this.v.z > 1 || Math.abs(this.v.x) > 1.1 || Math.abs(this.v.y) > 1.1;
      p.btn.style.visibility = off ? 'hidden' : 'visible';
      if (off) continue;
      // nút nổi cách nền ~40 px (ô trống) / trên đỉnh vật (điểm neo đã cộng chiều cao vật)
      p.btn.style.left = `${((this.v.x + 1) / 2) * w}px`;
      p.btn.style.top = `${((1 - this.v.y) / 2) * h - 40}px`;
      const full = filled(p.slot.id);
      const face = `${full ? 'co' : 'trong'}|${p.slot.id === selected ? 'chon' : ''}`;
      if (face === p.face) continue;
      p.face = face;
      p.btn.classList.toggle('sel', p.slot.id === selected);
      p.btn.setAttribute('aria-label', full ? SLOT_LABEL[p.slot.kind].name : `${SLOT_LABEL[p.slot.kind].name}, trống`);
      const badge = document.createElement('span');
      badge.className = 'kind';
      badge.setAttribute('aria-hidden', 'true');
      badge.append(svgIcon(ICON_SLOT[p.slot.kind], 12, undefined, { ...STROKE, 'stroke-width': '2' }));
      const main = full
        ? svgIcon(ICON_SLOT[p.slot.kind], 18, undefined, { ...STROKE, 'stroke-width': '2' })
        : svgIcon(ICON_PLUS, 18, undefined, { ...STROKE, 'stroke-width': '2.6' });
      p.btn.replaceChildren(main, badge);
    }
  }
}
