/**
 * Vẽ mặt bằng bản đồ vùng lên Canvas 2D (thiết kế 2026-11-14.20, mục "Nét vẽ"): biển mây, đất giấy, khu (chỉ bản đồ lớn),
 * nước, lối lát, chân nhà, tường chừa khe cổng. Một bộ nét cho cả hai bản đồ; độ dày nét theo px màn (không phóng theo
 * tỉ lệ). Vẽ một lần lúc vào cảnh / mở bản đồ lớn — không mỗi khung. Biểu tượng, chữ, mũi tên: `areaMapIcons.ts`.
 */
import type { AreaMap, MapShape } from '../zones/areaMap';
import { MAP_PAPER } from './areaMapIcons';

const ink = (a: number): string => `rgba(58,48,36,${a})`;
const CLOUD = '#dce3e2';
const WATER = '#bfd5d1';
const WATER_LINE = '#6f9590';
const JADE = '#2b5446';
const AREA_FILL = ['rgba(212,166,74,.06)', 'rgba(43,84,70,.05)'];

export interface PaintOptions {
  /** px màn / m */
  scale: number;
  /** điểm ảnh thật / px màn */
  dpr: number;
  /** bản đồ lớn: thêm khu, tường dày 2,6 */
  big: boolean;
  /** nhà đang đứng trong → tô `jade` (R-BANDO-4) */
  here: string | null;
}

type Ctx = CanvasRenderingContext2D;
type Of<K extends MapShape['kind']> = Extract<MapShape, { kind: K }>;

/** Cỡ tấm bản đồ (px màn) ở tỉ lệ `scale`. */
export function mapSize(map: AreaMap, scale: number): { w: number; h: number } {
  const b = map.bounds;
  return { w: (b.maxX - b.minX) * scale, h: (b.maxZ - b.minZ) * scale };
}

function rectPath(c: Ctx, s: { x: number; z: number; w: number; d: number }): void {
  c.beginPath();
  c.rect(s.x - s.w / 2, s.z - s.d / 2, s.w, s.d);
}

/**
 * Vẽ cả mặt bằng vào `canvas` (đổi cỡ canvas cho vừa). Toạ độ trong canvas: gốc ở góc tây bắc của `map.bounds`, bắc lên
 * trên — như `toMap` của `zones/areaMapView.ts`.
 */
export function paintAreaMap(canvas: HTMLCanvasElement, map: AreaMap, o: PaintOptions): void {
  const { w, h } = mapSize(map, o.scale);
  canvas.width = Math.max(1, Math.round(w * o.dpr));
  canvas.height = Math.max(1, Math.round(h * o.dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d');
  if (!c) return;
  const k = o.scale * o.dpr;
  const px = (v: number): number => v / o.scale; // nét theo px màn
  c.setTransform(k, 0, 0, k, -map.bounds.minX * k, -map.bounds.minZ * k);
  c.fillStyle = CLOUD;
  c.fillRect(map.bounds.minX, map.bounds.minZ, w / o.scale, h / o.scale);
  const of = <K extends MapShape['kind']>(kind: K): Of<K>[] => map.shapes.filter((s): s is Of<K> => s.kind === kind);

  // đất: giấy + mép mực .18
  const land = of('dat');
  c.fillStyle = MAP_PAPER;
  for (const s of land) c.fillRect(s.x - s.w / 2, s.z - s.d / 2, s.w, s.d);
  c.strokeStyle = ink(0.18);
  c.lineWidth = px(1);
  for (const s of land) {
    rectPath(c, s);
    c.stroke();
  }
  // khu (bản đồ lớn): tô xen kẽ vàng / ngọc + viền nét đứt 4 · 3
  if (o.big) {
    c.setLineDash([px(4), px(3)]);
    c.strokeStyle = ink(0.28);
    c.lineWidth = px(1);
    for (const s of of('khu')) {
      rectPath(c, s);
      c.fillStyle = AREA_FILL[s.index % 2] ?? AREA_FILL[0]!;
      c.fill();
      c.stroke();
    }
    c.setLineDash([]);
  }
  // nước
  c.fillStyle = WATER;
  c.strokeStyle = WATER_LINE;
  c.lineWidth = px(1.2);
  for (const s of map.shapes) {
    if (s.kind === 'nuoc') {
      c.beginPath();
      c.arc(s.x, s.z, s.r, 0, Math.PI * 2);
    } else if (s.kind === 'nuoc-vuong') {
      c.save();
      c.translate(s.x, s.z);
      c.rotate(-s.rot);
      c.beginPath();
      c.roundRect(-s.w / 2, -s.d / 2, s.w, s.d, Math.min(s.w, s.d) * 0.3);
      c.restore();
    } else continue;
    c.fill();
    c.stroke();
  }
  // lối lát + cầu: vạch mực .13 đúng bề rộng, đầu vuông
  c.strokeStyle = ink(0.13);
  c.lineCap = 'square';
  for (const s of of('loi')) {
    c.lineWidth = s.width;
    c.beginPath();
    c.moveTo(s.from[0], s.from[1]);
    c.lineTo(s.to[0], s.to[1]);
    c.stroke();
  }
  c.fillStyle = ink(0.13);
  for (const s of of('cau')) {
    c.save();
    c.translate(s.x, s.z);
    c.rotate(-s.rot);
    c.fillRect(-s.w / 2, -s.d / 2, s.w, s.d);
    c.restore();
  }
  // chân nhà: mực .2 viền .7 1,4; nhà đang ở: ngọc 55 % viền ngọc 2
  for (const s of of('nha')) {
    const here = s.id === o.here;
    rectPath(c, s);
    c.fillStyle = here ? 'rgba(43,84,70,.55)' : ink(0.2);
    c.fill();
    c.strokeStyle = here ? JADE : ink(0.7);
    c.lineWidth = px(here ? 2 : 1.4);
    c.stroke();
  }
  // tường: mực .8, 2 px (nhỏ) / 2,6 px (lớn), đầu tròn
  c.strokeStyle = ink(0.8);
  c.lineWidth = px(o.big ? 2.6 : 2);
  c.lineCap = 'round';
  for (const s of of('tuong')) {
    c.beginPath();
    c.moveTo(s.from[0], s.from[1]);
    c.lineTo(s.to[0], s.to[1]);
    c.stroke();
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
