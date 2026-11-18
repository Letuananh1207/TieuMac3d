/**
 * Hình phẳng sản phẩm nông trại (R-NONG-7/8): trứng gà, 3 loại cá, sữa bò, bầu, dưa leo, cỏ khô — cùng khung và cách vẽ với
 * hình cây vườn (`cropArt.ts`, khung `-24 -44 48 48`), dùng ở bảng kho, túi đồ, tấm báo, nút nổi. Vẽ cùng kiểu (elip + chữ
 * nhật) vì chưa có artboard riêng — dựng bằng `createElementNS` qua `svgIcon`.
 */
import type { NongItem } from '../zones/nong';
import { cropOf, type CropId } from '../zones/vuon';
import { cropPicture, shapeNode, type CropShape } from './cropArt';
import { svgIcon } from './decorIcons';

const fish = (body: string, fin: string): CropShape[] => [
  { e: [-2, -18, 14, 7.5, -12], fill: body, stroke: fin },
  { e: [15, -22, 5, 7, -40], fill: fin },
  { e: [-3, -24, 5, 2.5, -20], fill: fin },
  { c: [-11, -16.5, 1.8], fill: '#2a2420' },
];

export const NONG_ART: Readonly<Record<NongItem, readonly CropShape[]>> = {
  trung: [
    { e: [-6, -12, 8, 10.5, -8], fill: '#F6EBD6', stroke: '#D9C9A8' },
    { e: [7, -11, 7.5, 9.5, 10], fill: '#E9C9A0', stroke: '#C9A47A' },
    { e: [0, -4, 14, 3, 0], fill: '#D8B860' },
  ],
  'ca-diec': fish('#9AA6A0', '#6E7A74'),
  'ca-chep': fish('#D9A05A', '#B0703A'),
  'ca-vang': fish('#F2C53D', '#E08A2A'),
  sua: [
    { r: [-8, -30, 16, 26], fill: '#F7F4EC' },
    { r: [-5, -36, 10, 7], fill: '#E6E0D2' },
    { r: [-9, -18, 18, 6], fill: '#7FA0C8' },
    { r: [-6, -38, 12, 3], fill: '#B07A52' },
  ],
  bau: [
    { e: [0, -11, 11, 10, 0], fill: '#A9C46A', stroke: '#7E9A48' },
    { e: [0, -27, 6.5, 7.5, 0], fill: '#A9C46A', stroke: '#7E9A48' },
    { r: [-1, -38, 2, 5], fill: '#6F8A3E' },
  ],
  'dua-leo': [
    { e: [0, -18, 5.5, 17, 25], fill: '#5F8F3E', stroke: '#456E2C' },
    { e: [2, -18, 1.6, 12, 25], fill: '#7FB069' },
    { c: [-7, -33, 2.2], fill: '#F2C53D' },
  ],
  'co-kho': [
    { e: [0, -8, 15, 7, 0], fill: '#E0BF6A', stroke: '#B8964E' },
    { l: [-10, -10, -4, -26], stroke: '#C9A44E', w: 2 },
    { l: [-2, -10, 2, -28], stroke: '#C9A44E', w: 2 },
    { l: [6, -10, 10, -24], stroke: '#C9A44E', w: 2 },
    { r: [-12, -10, 24, 3], fill: '#9A7A3E' },
  ],
};

export const isNongItem = (id: string): id is NongItem => id in NONG_ART;

/** Hình một vật trong kho: nông sản vườn hoặc sản phẩm nông trại. */
export function itemPicture(id: CropId | NongItem, size: number): SVGElement {
  if (isNongItem(id)) return svgIcon(NONG_ART[id].map(shapeNode), size, '-24 -44 48 48');
  return cropOf(id) ? cropPicture(id, size) : svgIcon([], size);
}
