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

/** Biển hiệu: nền gỗ viền vàng; `paper` = giấy dó chữ sẫm. Cần nạp xong font Lora trước khi gọi. */
export function signTex(text: string, sub?: string, opts: { paper?: boolean } = {}): THREE.CanvasTexture {
  return makeCanvasTex(512, sub ? 256 : 160, (g, w, h) => {
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
    g.font = `700 ${sub ? 64 : 72}px Lora, Georgia, serif`;
    // maxWidth: chữ dài thì co hẹp lại cho vừa biển, không bị cắt
    g.fillText(text, w / 2, sub ? h * 0.38 : h / 2 + 4, w - 64);
    if (sub) {
      g.font = '700 46px Lora, Georgia, serif';
      g.fillText(sub, w / 2, h * 0.7, w - 64);
    }
  });
}
