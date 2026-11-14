/**
 * Bia khắc thơ / danh ngôn (Vườn Bia, Khởi Nguyên Trấn — kế hoạch `docs/tasks/2026-11-14-tien-ich-thien-bac.md`).
 * Thân bia lấy đúng mẫu `bia` của bộ kiến trúc chuẩn (`kien_truc/mau_vat_2.ts`): `bia` = cỡ S (bia đứng trên đế đá),
 * `bia-rua` = cỡ M (rùa đội bia). Mặt trước khắc chữ Hán + phiên âm pinyin dưới từng câu + nghĩa tiếng Việt + nguồn;
 * mặt sau ghi phiên âm Hán Việt. Mọi mặt chữ chung một tờ ảnh `bia` (`signAtlas.ts`) → cả vườn thêm 1 draw call.
 * Chữ Hán trên bia là nội dung học (ngoại lệ của luật "biển / tên chỉ tiếng Việt"), luôn kèm phiên âm + nghĩa Việt.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { mau } from './kien_truc/danh_muc';
import { BUILD_VAT_2, O_CHU_BIA } from './kien_truc/mau_vat_2';
import { signMesh } from './signAtlas';
import type { PropCollide } from './vat_truc';

/** Phóng mẫu Catalog cho vừa một đoạn thơ đọc được: bia đứng S 2,5 m → 4 m; rùa đội bia M 4 m → 5 m. */
export const BIA_SCALE = { bia: 1.6, 'bia-rua': 1.25 } as const;

/**
 * Thân bia của từng cỡ trong mẫu (khớp `thanBia` / `biaBo` / `ruaBia` ở `mau_vat_2.ts`): rộng `w`, dày `t`, chân thân
 * `y0`, cao thân `h` (tới chân đầu bia nửa tròn), đế [rộng, sâu] để làm va chạm.
 */
const THAN = {
  bia: { w: 1.2, t: 0.35, y0: 0.5, h: 1.4, de: [1.6, 0.9] },
  'bia-rua': { w: 1.4, t: 0.45, y0: 1.3, h: 2.0, de: [2.8, 4.4] },
} as const;

/** Ô chữ trên mặt bia so với thân: rộng / cao (phủ kín ô khắc của mẫu). */
const MAT_W = 0.74;
const MAT_H = 0.84;
/** Cao một mặt chữ (px) trên tờ ảnh riêng `bia` (2048 × 1024); rộng theo tỉ lệ mặt — 18 mặt = 3 hàng. */
const PX_H = 320;
/** Hai hàm vẽ mặt bia tính cỡ chữ cho mặt cao 400 đơn vị; ô thật nhỏ hơn thì thu cả hình. */
const VE_H = 400;

const FONT = 'Lora, "Han Serif", Georgia, serif';
const HAN_FONT = '"Han Serif", serif';
/** Pinyin (ǎ ǐ ǒ ǔ ǚ): Lora không có các chữ này (trình duyệt ghép dấu rời, lệch) → dùng serif của máy (Android: Noto Serif). */
const PINYIN_FONT = '"Noto Serif", "Times New Roman", serif';
const INK = '#24323a';
const STONE = '#e3ddcf';
const NOTE = '#4d5257';

/** Nội dung một bia: các câu chữ Hán (mỗi câu một dòng) + pinyin từng câu, nghĩa Việt, phiên âm Hán Việt, nguồn. */
export interface BiaText {
  han: string[];
  pinyin: string[];
  nghia: string;
  hanViet: string;
  nguon: string;
}

/**
 * `text` của prop: "<Hán>|<pinyin>|<nghĩa Việt>|<Hán Việt>|<nguồn>", câu trong phần Hán / pinyin cách nhau bằng "/".
 * Thiếu phần nào thì phần đó rỗng; số dòng pinyin lấy theo số câu Hán.
 */
export function parseBiaText(text: string | undefined): BiaText {
  const [han = '', pinyin = '', nghia = '', hanViet = '', nguon = ''] = (text ?? '').split('|').map((s) => s.trim());
  const lines = (s: string): string[] => (s ? s.split('/').map((x) => x.trim()) : []);
  const h = lines(han);
  const p = lines(pinyin);
  return { han: h, pinyin: h.map((_, i) => p[i] ?? ''), nghia, hanViet, nguon };
}

/** Ngắt `text` thành các dòng vừa `max` px với font đang đặt trên `g`. */
function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && g.measureText(next).width > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

/** Nền đá + khung khắc hai đường. */
function stone(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(36, 50, 58, 0.55)';
  g.lineWidth = 3;
  g.strokeRect(8, 8, w - 16, h - 16);
  g.lineWidth = 1;
  g.strokeRect(14, 14, w - 28, h - 28);
}

/** Mặt trước: chữ Hán to (mỗi câu một dòng, pinyin nhỏ ngay dưới), gạch ngang, nghĩa Việt, nguồn ở chân. */
export function drawBiaTruoc(g: CanvasRenderingContext2D, w: number, h: number, t: BiaText): void {
  stone(g, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const inner = w - 44;
  const longest = Math.max(1, ...t.han.map((l) => [...l].length));
  // cỡ chữ Hán vừa câu dài nhất; nhiều câu thì nhỏ lại cho đủ chỗ phần nghĩa
  const han = Math.min(46, Math.floor(inner / longest), Math.floor((h * 0.56) / Math.max(1, t.han.length) - 18));
  const py = Math.max(12, Math.min(16, Math.round(han * 0.38)));
  let y = 30 + han / 2;
  t.han.forEach((line, i) => {
    g.fillStyle = INK;
    g.font = `700 ${han}px ${HAN_FONT}`;
    g.fillText(line, w / 2, y, inner);
    y += han / 2 + py * 0.9;
    g.fillStyle = NOTE;
    g.font = `700 ${py}px ${PINYIN_FONT}`;
    g.fillText(t.pinyin[i], w / 2, y, inner);
    y += py * 0.7 + han / 2 + 8;
  });
  y += 2 - han / 2;
  g.strokeStyle = 'rgba(36, 50, 58, 0.45)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(w * 0.3, y);
  g.lineTo(w * 0.7, y);
  g.stroke();
  g.fillStyle = INK;
  g.font = `700 15px ${FONT}`;
  const lines = wrap(g, t.nghia, inner);
  y += 14;
  for (const l of lines) {
    g.fillText(l, w / 2, y, inner);
    y += 19;
  }
  g.fillStyle = NOTE;
  g.font = `700 12px ${FONT}`;
  g.fillText(t.nguon, w / 2, h - 26, inner);
}

/** Mặt sau: "Phiên âm Hán Việt" + lời đọc Hán Việt + nguồn. */
export function drawBiaSau(g: CanvasRenderingContext2D, w: number, h: number, t: BiaText): void {
  stone(g, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const inner = w - 48;
  g.fillStyle = NOTE;
  g.font = `700 13px ${FONT}`;
  g.fillText('Phiên âm Hán Việt', w / 2, 40, inner);
  g.fillStyle = INK;
  g.font = `700 19px ${FONT}`;
  const lines = wrap(g, t.hanViet, inner);
  let y = h / 2 - ((lines.length - 1) * 26) / 2;
  for (const l of lines) {
    g.fillText(l, w / 2, y, inner);
    y += 26;
  }
  g.fillStyle = NOTE;
  g.font = `700 12px ${FONT}`;
  g.fillText(t.nguon, w / 2, h - 30, inner);
}

/** Dựng bia `kind` (`bia` | `bia-rua`) vào `g` (gốc ở chân, mặt chữ nhìn +z); kiểu khác → null. */
export function biaProp(kind: string, g: THREE.Group, style: Style, text: string | undefined): PropCollide | null {
  if (kind !== 'bia' && kind !== 'bia-rua') return null;
  const k = BIA_SCALE[kind];
  const m = mau('bia');
  const c = m?.co[kind === 'bia' ? 'S' : 'M'];
  const body = new THREE.Group();
  body.scale.setScalar(k);
  if (m && c) BUILD_VAT_2.bia(body, m, c, 'tong', style);
  // ô chữ giả của mẫu nằm dưới mặt chữ thật — bỏ cho đỡ tam giác
  const gia: THREE.Object3D[] = [];
  body.traverse((o) => {
    if (o.name === O_CHU_BIA) gia.push(o);
  });
  for (const o of gia) o.removeFromParent();
  g.add(body);
  const s = THAN[kind];
  const t = parseBiaText(text);
  const fw = s.w * MAT_W * k;
  const fh = s.h * MAT_H * k;
  const cy = (s.y0 + s.h * 0.52) * k;
  for (const side of [1, -1] as const) {
    const draw = side > 0 ? drawBiaTruoc : drawBiaSau;
    const ve = (cx: CanvasRenderingContext2D, pw: number, ph: number): void => {
      const f = ph / VE_H;
      cx.scale(f, f);
      draw(cx, pw / f, VE_H, t);
    };
    const face = signMesh(fw, fh, Math.round((PX_H * fw) / fh), PX_H, ve, 'bia');
    face.position.set(0, cy, side * (s.t / 2 + 0.04) * k);
    if (side < 0) face.rotation.y = Math.PI;
    g.add(face);
  }
  return { box: [s.de[0] * k, s.de[1] * k] };
}
