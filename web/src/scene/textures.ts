import * as THREE from 'three';

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** Vẽ texture bằng canvas 2D: không cần file ảnh, nhẹ, chạy offline. */
export function makeCanvasTex(w: number, h: number, draw: Draw, repeat?: [number, number]): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = 4;
  return t;
}

/** Chữ trên biển: Lora cho chữ Việt, "Han Serif" (Noto Serif SC cắt sẵn) cho chữ Hán. */
const SIGN_FONT = 'Lora, "Han Serif", Georgia, serif';

/** Vẽ biển hiệu vào khung `w` × `h` của canvas `g` (gốc 0, 0). Dùng chung cho `signTex` và ảnh biển chung. */
export function drawSign(g: CanvasRenderingContext2D, w: number, h: number, text: string, sub?: string, opts: { paper?: boolean } = {}): void {
  g.fillStyle = '#2a1a10';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e0ae4c';
  g.lineWidth = 10;
  g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = opts.paper ? '#f1e3c2' : '#e0ae4c';
  if (opts.paper) {
    g.fillRect(24, 24, w - 48, h - 48);
    g.fillStyle = '#2a1a10';
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${sub ? 64 : 72}px ${SIGN_FONT}`;
  // maxWidth: chữ dài thì co hẹp lại cho vừa biển, không bị cắt
  g.fillText(text, w / 2, sub ? h * 0.38 : h / 2 + 4, w - 64);
  if (sub) {
    g.font = `700 46px ${SIGN_FONT}`;
    g.fillText(sub, w / 2, h * 0.7, w - 64);
  }
}

/** Cờ dọc (幌子): vải ngà viền son, một chữ Hán lớn giữa, tua dưới. Khung dọc (vd. 160 × 456). */
export function drawBanner(g: CanvasRenderingContext2D, w: number, h: number, text: string): void {
  g.fillStyle = '#efe6d2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#a8322a';
  g.lineWidth = 12;
  g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#2f3236';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(w * 0.62)}px ${SIGN_FONT}`;
  g.fillText(text, w / 2, h * 0.42, w - 24);
}

/** Bảng vinh danh: giấy ngà, dòng tiêu đề + các dòng kẻ (tên người học điền sau — chờ thiết kế). */
export function drawBoard(g: CanvasRenderingContext2D, w: number, h: number, title: string): void {
  g.fillStyle = '#f3e6c8';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a2418';
  g.lineWidth = 10;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#3a2418';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 44px ${SIGN_FONT}`;
  g.fillText(title, w / 2, 48, w - 40);
  g.strokeStyle = '#8d877f';
  g.lineWidth = 3;
  for (let y = 100; y < h - 24; y += 34) {
    g.beginPath();
    g.moveTo(32, y);
    g.lineTo(w - 32, y);
    g.stroke();
  }
}

/** Biển hiệu thành texture riêng (vật cần vật liệu riêng — mái mờ). Cảnh thường dùng `signMesh` (ảnh chung). */
export function signTex(text: string, sub?: string, opts: { paper?: boolean } = {}): THREE.CanvasTexture {
  return makeCanvasTex(512, sub ? 256 : 160, (g, w, h) => drawSign(g, w, h, text, sub, opts));
}

/* ---------- vật liệu lát / tường (2026-11-13: gạch xanh xám 青磚, phiến đá, tường vôi, chân đá xếp) ---------- */

/** Màu `#rrggbb` → [r, g, b] 0..255. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Màu gốc nhân độ sáng `k` (1 = giữ). */
function shade(hex: string, k: number): string {
  const [r, g, b] = rgb(hex).map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return `rgb(${r},${g},${b})`;
}

/** Vân hạt li ti (đá / vôi): chấm sáng tối nhỏ phủ đều. */
function grain(g: CanvasRenderingContext2D, w: number, h: number, n: number, a: number): void {
  for (let i = 0; i < n; i++) {
    g.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${a * Math.random()})` : `rgba(255,255,255,${a * Math.random()})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

/** Một viên có mép vát: mặt viên + sáng mép trên-trái, tối mép dưới-phải. */
function bevelTile(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, face: string, b: number): void {
  g.fillStyle = face;
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.10)';
  g.fillRect(x, y, w, b);
  g.fillRect(x, y, b, h);
  g.fillStyle = 'rgba(0,0,0,0.14)';
  g.fillRect(x, y + h - b, w, b);
  g.fillRect(x + w - b, y, b, h);
}

/** Số mét một lần lặp của texture gạch vuông (8 × 8 viên 0,6 m). */
export const SQUARE_TILE_M = 4.8;

/**
 * Sân lát gạch vuông xanh xám (方磚 / 青磚): viên 0,6 m xếp lưới, mạch vữa sáng mảnh, mép vát, mỗi viên đậm nhạt khác nhau,
 * thỉnh thoảng một viên mòn / sẫm. Một lần lặp = `SQUARE_TILE_M` mét.
 */
export function squareTileTex(color: string): THREE.CanvasTexture {
  const t = makeCanvasTex(
    512,
    512,
    (g) => {
      const n = 8;
      const s = 512 / n;
      g.fillStyle = shade(color, 1.28); // mạch vữa vôi
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          let k = 0.9 + Math.random() * 0.18;
          if (Math.random() < 0.06) k -= 0.12; // viên sẫm / cũ
          bevelTile(g, x * s + 2, y * s + 2, s - 4, s - 4, shade(color, k), 3);
          if (Math.random() < 0.08) {
            // vết mòn loang giữa viên
            g.fillStyle = 'rgba(255,255,255,0.06)';
            g.beginPath();
            g.ellipse(x * s + s / 2, y * s + s / 2, s * 0.3, s * 0.2, Math.random() * 3, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
      grain(g, 512, 512, 2600, 0.08);
    },
    [1, 1],
  );
  t.anisotropy = 8;
  return t;
}

/** Số mét một lần lặp của texture phiến đá lối đi. */
export const SLAB_TILE_M = 2.4;

/** Lối lát phiến đá chữ nhật so le (0,8 × 0,6 m), mép vát, mạch tối, vân hạt. Một lần lặp = `SLAB_TILE_M` mét. */
export function slabTex(color: string): THREE.CanvasTexture {
  const t = makeCanvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = shade(color, 0.62); // mạch
      g.fillRect(0, 0, 256, 256);
      const rows = 4;
      const rh = 256 / rows;
      const cw = 256 / 3;
      for (let y = 0; y < rows; y++) {
        const off = (y % 2) * (cw / 2);
        for (let x = -1; x < 3; x++) {
          const face = shade(color, 0.92 + Math.random() * 0.16);
          bevelTile(g, x * cw + off + 2, y * rh + 2, cw - 4, rh - 4, face, 3);
        }
      }
      grain(g, 256, 256, 1400, 0.1);
    },
    [1, 1],
  );
  t.anisotropy = 8;
  return t;
}

/** Bề ngang một lần lặp của texture vôi (m); chiều dọc trải đúng chiều cao tường (v 0 = chân, 1 = đỉnh). */
export const PLASTER_TILE_M = 6;

/** Tường vôi trắng (粉牆): loang đậm nhạt rất nhẹ, ố xám dần về chân tường, vân hạt. */
export function plasterTex(color: string): THREE.CanvasTexture {
  const t = makeCanvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = color;
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 40; i++) {
        const k = Math.random() < 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.04)';
        g.fillStyle = k;
        g.beginPath();
        g.ellipse(Math.random() * 256, Math.random() * 256, 20 + Math.random() * 50, 10 + Math.random() * 30, Math.random() * 3, 0, Math.PI * 2);
        g.fill();
      }
      const stain = g.createLinearGradient(0, 256, 0, 150); // canvas: y 256 = đáy ảnh = chân tường (v = 0)
      stain.addColorStop(0, 'rgba(70,72,66,0.22)');
      stain.addColorStop(1, 'rgba(70,72,66,0)');
      g.fillStyle = stain;
      g.fillRect(0, 150, 256, 106);
      for (let i = 0; i < 14; i++) {
        // vệt nước chảy mờ từ chân lên
        const x = Math.random() * 256;
        g.fillStyle = 'rgba(60,62,58,0.05)';
        g.fillRect(x, 170 + Math.random() * 40, 3 + Math.random() * 6, 90);
      }
      grain(g, 256, 256, 1600, 0.05);
    },
    [1, 1],
  );
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}

/** Số mét một lần lặp (ngang × dọc) của texture đá xếp chân tường. */
export const ASHLAR_TILE_M: [number, number] = [2, 0.5];

/** Chân tường đá xếp (2 hàng / 0,5 m): khối dài ngắn so le, mạch tối, mép vát. */
export function ashlarTex(color: string): THREE.CanvasTexture {
  const t = makeCanvasTex(
    256,
    64,
    (g) => {
      g.fillStyle = shade(color, 0.6);
      g.fillRect(0, 0, 256, 64);
      for (let y = 0; y < 2; y++) {
        let x = y * -30;
        while (x < 256) {
          const w = 50 + Math.random() * 60;
          bevelTile(g, x + 2, y * 32 + 2, w - 4, 28, shade(color, 0.88 + Math.random() * 0.22), 2);
          x += w;
        }
      }
      grain(g, 256, 64, 600, 0.1);
    },
    [1, 1],
  );
  t.anisotropy = 8;
  return t;
}

/**
 * Trải UV của `BoxGeometry(w, h, d)` theo mét chia cho cỡ một lần lặp (`tu` ngang, `tv` dọc) — viên gạch / đá giữ đúng cỡ
 * dù khối dài ngắn. Mặt trên / dưới dùng `tu` cho cả hai chiều.
 */
export function meterUV(geo: THREE.BoxGeometry, w: number, h: number, d: number, tu: number, tv: number): THREE.BoxGeometry {
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
  // thứ tự mặt của BoxGeometry: +x, −x, +y, −y, +z, −z — mỗi mặt 4 đỉnh
  const size: [number, number][] = [
    [d / tu, h / tv],
    [d / tu, h / tv],
    [w / tu, d / tu],
    [w / tu, d / tu],
    [w / tu, h / tv],
    [w / tu, h / tv],
  ];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * size[f][0], uv.getY(i) * size[f][1]);
    }
  }
  return geo;
}
