/**
 * Canvas 3D `?dang=go-mo` (V-20261114-31 NV10): xem **bản thử** Tiểu Khất + Lão Canh trước khi có model — đặt hai NPC của
 * `scene/npcDraft.ts` (chưa có trong đặc tả) bằng model thế `nhan-vat.glb`, vẽ đường vòng B + số thứ tự điểm, chạy đúng
 * `townNpcs.ts` như app (đi theo đồng hồ, dừng đầu giờ gõ mõ + rao). Chỉ trang thiết kế dùng, không vào app.
 * Thêm: `&gio=08:59:50` ép giờ bắt đầu · `&theo` camera bám Lão Canh.
 * NPC đã có trong đặc tả (vd. Lão Canh từ 2026-11-16) thì không thêm bản thử mà lái chính NPC đó — kể cả không có
 * `?dang=go-mo` (như app: `&gio`, `&theo` dùng được ở mọi trang); đường vẽ + toạ độ điểm vẫn chỉ ở `?dang=go-mo`.
 */
import * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { placeNpcs, type Npc } from './player/npc';
import { playerModelUrl } from './player/playerCharacter';
import { DRAFT_TOWN_NPCS } from './scene/npcDraft';
import type { SceneSpec } from './scene/spec';
import { GO_MO, TownNpcs } from './townNpcs';
import { KHAT_NHI } from './zones/alms';
import { routeLength } from './scene/routeCheck';

export interface TownPreview {
  update(dt: number, camera: THREE.Camera, listener: THREE.Vector3): void;
  /** Lão Canh (để camera bám); chưa dựng được → `null` */
  readonly walker: Npc | null;
  /** dòng mô tả cho bảng: toạ độ điểm, dài vòng, lỗi nạp */
  readonly lines: string[];
}

const n = (v: number): string => String(+v.toFixed(2)).replace('.', ',');

/** `?dang=go-mo` → dựng bản thử (NPC đặc tả chưa có); đặc tả có NPC của `townNpcs.ts` → lái NPC đó; không có gì → `null`. */
export async function addTownPreview(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec,
  groundAt: (x: number, z: number) => number,
  params: URLSearchParams,
  /** NPC đặc tả đã dựng (designPreview — `placeNpcs(spec.npcs)`); đi / ngồi thì `TownNpcs` lái, cử động do trang gọi */
  placed: readonly Npc[] = [],
): Promise<TownPreview | null> {
  const show = params.get('dang') === 'go-mo';
  const fromSpec = placed.filter((p) => p.id === GO_MO || p.id === KHAT_NHI);
  if (!show && !fromSpec.length) return null;
  const drafts = show ? DRAFT_TOWN_NPCS.filter((d) => !spec.npcs.some((p) => p.id === d.id)) : [];
  const { npcs, problems } = await placeNpcs(scene, colliders, drafts, groundAt, playerModelUrl(params.get('nhan-vat')));
  const lines = [...problems];
  const go = show ? (spec.npcs.find((p) => p.id === GO_MO) ?? drafts.find((d) => d.id === GO_MO)) : undefined;
  if (go?.route) {
    const nguon = drafts.includes(go) ? 'bản thử' : 'đặc tả';
    addRouteLine(scene, go.route, groundAt);
    lines.push(`Vòng B (${nguon}): ${go.route.length} điểm, dài ${n(routeLength(go.route, groundAt))} m, ${n(go.speed ?? 1.1)} m/s`);
    go.route.forEach(([x, z], i) => lines.push(`  ${i}: (${n(x)}; ${n(z)})`));
  }
  const toast = makeToast();
  const town = new TownNpcs(
    [...fromSpec, ...npcs],
    {
      bridge: { giveAlms: async () => null },
      trial: null,
      progress: () => null,
      groundAt,
      say: (id, text) => toast(`${id === GO_MO ? 'Lão Canh' : 'Tiểu Khất'}: ${text}`),
      chatSay: (id, text) => toast(`[kênh] ${id === GO_MO ? 'Lão Canh' : 'Tiểu Khất'}: ${text}`),
      spent: () => {},
      almsSaved: () => {},
    },
    params.get('gio'),
  );
  const walker = [...fromSpec, ...npcs].find((x) => x.id === GO_MO) ?? null;
  return {
    walker,
    lines,
    update(dt, camera, listener) {
      town.update({ dt, player: listener, camera, talkingTo: null, covered: false });
      for (const x of npcs) x.update(dt); // bản thử; NPC đặc tả do trang cập nhật
    },
  };
}

/** Đường vòng: dây vàng sát đất + số thứ tự mỗi điểm (chỉ để xem trên Canvas 3D). */
function addRouteLine(scene: THREE.Scene, route: readonly (readonly [number, number])[], groundAt: (x: number, z: number) => number): void {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= route.length; i++) {
    const [ax, az] = route[i % route.length];
    const [bx, bz] = route[(i + 1) % route.length];
    const steps = i === route.length ? 0 : Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
    for (let k = 0; k < Math.max(1, steps); k++) {
      const x = ax + ((bx - ax) * k) / Math.max(1, steps);
      const z = az + ((bz - az) * k) / Math.max(1, steps);
      pts.push(new THREE.Vector3(x, groundAt(x, z) + 0.12, z));
    }
  }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf2b630 }));
  scene.add(line);
  route.forEach(([x, z], i) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) return;
    g.fillStyle = '#7a2b1c';
    g.beginPath();
    g.arc(32, 32, 28, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff6e0';
    g.font = 'bold 30px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(i), 32, 34);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
    s.scale.setScalar(0.9);
    s.position.set(x, groundAt(x, z) + 1.2, z);
    scene.add(s);
  });
}

/** Dòng chữ nổi góc dưới (thoại / rao của bản thử), tự mờ sau 6 s. */
function makeToast(): (text: string) => void {
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);max-width:90vw;display:flex;flex-direction:column;gap:6px;pointer-events:none;z-index:50';
  document.body.append(box);
  return (text) => {
    const row = document.createElement('div');
    row.textContent = text;
    row.style.cssText = 'background:rgba(30,20,10,.82);color:#fff6e0;padding:6px 12px;border-radius:8px;font:14px sans-serif';
    box.append(row);
    window.setTimeout(() => row.remove(), 6000);
  };
}
