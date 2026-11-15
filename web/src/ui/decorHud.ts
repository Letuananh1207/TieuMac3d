/**
 * HUD trang trí tự do Nhà của ta (thiết kế 2026-11-15.42 `TrangTriTuDo-*`; nút "Trang trí" từ 2026-11-14.13): nút "Trang trí", chế
 * độ trang trí — viên nhắc trên trái, hàng nút cầm món **dưới món** (điện thoại: Xoay · Đặt · Cất · Huỷ), dải phím
 * (máy tính), viên lý do đỏ trên món, tấm báo. Túi đồ trang trí ở `decorPanel.ts`. DOM dựng bằng `createElement`; luật ở
 * `zones/decorEdit.ts` + `zones/decorPlace.ts`, ghép ở `homeDecor.ts`.
 */
import * as THREE from 'three';
import './decor.css';
import { ICON_BAG, ICON_BAN, ICON_CHECK, ICON_MOVE, ICON_PEN, ICON_ROTATE, ICON_X, STROKE, svgIcon } from './decorIcons';
import { hinhImg } from './hinh';

export interface DecorHudHandlers {
  open(): void;
  rotate(): void;
  place(): void;
  store(): void;
  cancel(): void;
}

/** Tấm báo hiện 3 s. */
const TOAST_MS = 3000;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Bản máy tính (chuột + bàn phím — `body.ban-may`, R-DIEU-1). */
export function isDesktop(): boolean {
  return document.body.classList.contains('ban-may');
}

/** Phím nổi trong dải phím (`decorKeys`). */
function keycap(k: string): HTMLElement {
  return h('kbd', 'dk-key', k);
}

export class DecorHud {
  private readonly btnWrap = h('div');
  private readonly hint = h('div');
  private readonly hintRing = h('span', 'ring');
  private readonly hintText = h('span');
  private readonly row = h('div');
  private readonly placeBtn = h('button', 'dc-place');
  private readonly keys = h('div');
  private readonly clickKey = h('span', 'dk-click');
  private readonly reason = h('div');
  private readonly reasonText = h('span');
  private readonly toastEl = h('div');
  private toastTimer = 0;
  private holding = false;
  private readonly v = new THREE.Vector3();

  constructor(on: DecorHudHandlers) {
    // nút "Trang trí"
    this.btnWrap.id = 'decorBtn';
    this.btnWrap.hidden = true;
    const btn = h('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Trang trí'); // decorButton
    btn.append(hinhImg('trang-tri', 50)); // hình minh hoạ 50 nhô 8 (2026-11-16.2)
    btn.addEventListener('click', () => on.open());
    this.btnWrap.append(btn, h('span', 'lbl', 'Trang trí'));

    // viên nhắc ("Xong" = nút tròn trên dải kho — decorPanel.ts, V-75)
    this.hint.id = 'decorHint';
    this.hint.setAttribute('role', 'status');
    this.hint.hidden = true;
    this.hint.append(this.hintRing, this.hintText);

    // hàng nút cầm món (điện thoại): Xoay · Đặt · Cất · Huỷ
    this.row.id = 'decorCarry';
    this.row.hidden = true;
    const round = (cls: string, icon: SVGElement, label: string, f: () => void): HTMLElement => {
      const wrap = h('div', `dc-act ${cls}`);
      const b = h('button');
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.append(icon);
      b.addEventListener('click', f);
      wrap.append(b, h('span', 'lbl', label));
      return wrap;
    };
    this.placeBtn.type = 'button';
    this.placeBtn.append(svgIcon(ICON_CHECK, 22, undefined, { ...STROKE, 'stroke-width': '3' }), 'Đặt'); // decorPlace
    this.placeBtn.addEventListener('click', () => on.place());
    this.row.append(
      round('rot', svgIcon(ICON_ROTATE, 22, undefined, { ...STROKE, 'stroke-width': '2.2' }), 'Xoay', () => on.rotate()), // decorRotate
      this.placeBtn,
      round('store', svgIcon(ICON_BAG, 22, undefined, { ...STROKE, 'stroke-width': '2.2' }), 'Cất', () => on.store()), // decorStore
      round('cancel', svgIcon(ICON_X, 22, undefined, { ...STROKE, 'stroke-width': '2.4' }), 'Huỷ', () => on.cancel()), // decorCancel
    );

    // dải phím (máy tính) — decorKeys
    this.keys.id = 'decorKeys';
    this.keys.hidden = true;
    this.clickKey.append(keycap('Click'), ' đặt');
    this.keys.append(
      keycap('Q'), keycap('E'), h('span', '', ' xoay 45°'),
      keycap('R'), h('span', '', ' 90°'),
      this.clickKey,
      keycap('Esc'), h('span', '', ' huỷ'),
      keycap('Delete'), h('span', '', ' cất'),
      h('span', 'dk-cam', '· kéo nền trống: xoay camera'),
    );

    // viên lý do đỏ trên món
    this.reason.id = 'decorReason';
    this.reason.hidden = true;
    this.reason.setAttribute('role', 'status');
    this.reason.append(svgIcon(ICON_BAN, 16, undefined, { ...STROKE, 'stroke-width': '2.4' }), this.reasonText);

    this.toastEl.id = 'decorToast';
    this.toastEl.setAttribute('role', 'status');
    this.toastEl.hidden = true;
    document.body.append(this.btnWrap, this.hint, this.row, this.keys, this.reason, this.toastEl);
  }

  /** Nút "Trang trí": chỉ khi đi lại ở nhà (ẩn khi bản đồ / thoại / ngồi / màn Flutter). */
  setButton(show: boolean): void {
    if (this.btnWrap.hidden === show) this.btnWrap.hidden = !show;
  }

  /** Bật / tắt chế độ trang trí: ẩn cụm điều khiển, thanh công cụ, bản đồ nhỏ (CSS `body.decorating` + thanh công cụ tự ẩn). */
  setMode(on: boolean): void {
    document.body.classList.toggle('decorating', on);
    this.hint.hidden = !on;
    if (!on) {
      this.setHolding(null);
      this.toastEl.hidden = true;
    }
  }

  /** Viên nhắc (`decorHint*`): bút khi chưa cầm, mũi tên bốn hướng khi cầm. */
  setHint(text: string, holding: boolean): void {
    this.hintText.textContent = text;
    this.hintRing.replaceChildren(svgIcon(holding ? ICON_MOVE : ICON_PEN, 14, undefined, { ...STROKE, 'stroke-width': '2.4' }));
  }

  /**
   * Đang cầm: `{ok, reason}` (đỏ → viên lý do + nút Đặt kính nét đứt / "Click đặt" mờ) · `null` = không cầm. Điện thoại: hàng nút; máy
   * tính: dải phím (thiết kế `TrangTriTuDo-cam-*`).
   */
  setHolding(v: { ok: boolean; reason: string | null } | null): void {
    this.holding = !!v;
    const desk = isDesktop();
    this.row.hidden = !v || desk;
    this.keys.hidden = !v || !desk;
    this.reason.hidden = !v || v.ok;
    if (!v) return;
    this.placeBtn.classList.toggle('bad', !v.ok);
    this.placeBtn.setAttribute('aria-disabled', String(!v.ok));
    this.clickKey.classList.toggle('bad', !v.ok);
    this.reasonText.textContent = v.reason ?? '';
  }

  /**
   * Mỗi khung khi cầm: hàng nút neo **dưới** khung chân (cách 24 px, đẩy vào trong mép màn), viên lý do **trên** đỉnh món (cách 12 px).
   * [foot] = điểm mép gần camera của chân món, [top] = đỉnh món (toạ độ cảnh).
   */
  follow(camera: THREE.Camera, foot: THREE.Vector3, top: THREE.Vector3): void {
    if (!this.holding) return;
    const w = window.innerWidth;
    const hgt = window.innerHeight;
    const toScreen = (p: THREE.Vector3): { x: number; y: number; off: boolean } => {
      this.v.copy(p).project(camera);
      return { x: ((this.v.x + 1) / 2) * w, y: ((1 - this.v.y) / 2) * hgt, off: this.v.z > 1 };
    };
    if (!this.row.hidden) {
      const f = toScreen(foot);
      const rw = this.row.offsetWidth || 300;
      const rh = this.row.offsetHeight || 80;
      const x = Math.min(w - rw / 2 - 16, Math.max(rw / 2 + 16, f.x));
      const y = Math.min(hgt - rh - 110, Math.max(80, f.y + 24));
      this.row.style.left = `${x}px`;
      this.row.style.top = `${y}px`;
    }
    if (!this.reason.hidden) {
      const t = toScreen(top);
      this.reason.style.visibility = t.off ? 'hidden' : 'visible';
      this.reason.style.left = `${t.x}px`;
      this.reason.style.top = `${t.y - 12}px`;
    }
  }

  /** Tấm báo `slate` 3 s (`decorStored`, `decorCantPlace`, `decorBuyAtShopDetail`, gợi ý phím lần đầu). */
  toast(title: string, sub?: string, bold?: string): void {
    const txt = h('span');
    if (bold && title.includes(bold)) {
      const [a, b] = title.split(bold);
      txt.append(a ?? '', h('b', '', bold), b ?? '');
    } else txt.append(h('b', '', title));
    if (sub) txt.append(h('span', 'sub', sub));
    this.toastEl.replaceChildren(txt);
    this.toastEl.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toastEl.hidden = true), TOAST_MS);
  }
}
