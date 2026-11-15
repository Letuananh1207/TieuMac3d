/**
 * Kiểm `miniGames` của đặc tả cảnh (trò nhỏ Trúc Lâm — V-66 B4): đọc từng mục theo loại (`parseMiniGame`, dùng trong
 * `specCheck.ts`), rồi kiểm chéo với cảnh (`checkMiniGames`): mương / đệm / đá tồn tại, văn nhân ngồi đúng đệm, người mua có
 * trong `npcs`, vùng măng trong `bounds`. Chữ Hán trên biển / tên đã có kiểm chung (R-HUD-4). Thuần.
 */
import { MINI_GAME_KINDS, NPC_IDS, type MiniGameSpec, type SceneSpec, type XZ } from './spec';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isXZ = (v: unknown): v is XZ => Array.isArray(v) && v.length === 2 && num(v[0]) && num(v[1]);
const isIndex = (v: unknown): v is number => num(v) && Number.isInteger(v) && v >= 0;
const npcId = (v: unknown): boolean => typeof v === 'string' && (NPC_IDS as readonly string[]).includes(v);

const FIELDS: Record<MiniGameSpec['kind'], string[]> = {
  'luu-thuong': ['kind', 'channel', 'seats', 'npcs', 'host', 'guide'],
  'hai-mang': ['kind', 'areas', 'gap', 'buyer', 'guide'],
  'dan-cam': ['kind', 'prop', 'seat', 'guide'],
};

/** Một mục `miniGames[i]`; sai → bỏ cả mục (ghi lý do vào [out]). */
export function parseMiniGame(raw: unknown, path: string, out: string[]): Obj | null {
  if (!isObj(raw)) {
    out.push(`${path}: cần một object — bỏ`);
    return null;
  }
  const kind = raw.kind as MiniGameSpec['kind'];
  if (!(MINI_GAME_KINDS as readonly string[]).includes(kind as string)) {
    out.push(`${path}.kind: chỉ ${MINI_GAME_KINDS.join(' · ')} — bỏ`);
    return null;
  }
  for (const k of Object.keys(raw)) if (!FIELDS[kind].includes(k)) out.push(`${path}.${k}: trường lạ, bỏ qua`);
  const bad: string[] = [];
  if (raw.guide !== undefined && !isXZ(raw.guide)) bad.push(`${path}.guide: cần [x, z]`);
  if (kind === 'luu-thuong') {
    if (!isIndex(raw.channel)) bad.push(`${path}.channel: cần chỉ số mương`);
    if (!Array.isArray(raw.seats) || !raw.seats.length || !raw.seats.every(isIndex)) bad.push(`${path}.seats: cần mảng chỉ số đệm`);
    const npcs = raw.npcs;
    if (!Array.isArray(npcs) || !npcs.length || !npcs.every((n) => isObj(n) && npcId(n.id) && isIndex(n.seat))) bad.push(`${path}.npcs: cần [{id, seat}]`);
    if (!npcId(raw.host)) bad.push(`${path}.host: mã NPC`);
  } else if (kind === 'hai-mang') {
    const areas = raw.areas;
    if (!Array.isArray(areas) || !areas.length || !areas.every((a) => isObj(a) && isXZ(a.from) && isXZ(a.to))) bad.push(`${path}.areas: cần [{from, to}]`);
    if (raw.gap !== undefined && !(num(raw.gap) && raw.gap > 0)) bad.push(`${path}.gap: phải > 0`);
    if (!npcId(raw.buyer)) bad.push(`${path}.buyer: mã NPC`);
  } else {
    if (!isIndex(raw.prop)) bad.push(`${path}.prop: cần chỉ số vật`);
    const s = raw.seat;
    if (!isObj(s) || !num(s.dx) || !num(s.dz) || (s.rotY !== undefined && !num(s.rotY))) bad.push(`${path}.seat: cần {dx, dz, rotY?}`);
  }
  if (bad.length) {
    out.push(...bad, `${path}: bỏ phần tử này`);
    return null;
  }
  const res: Obj = {};
  for (const k of FIELDS[kind]) if (raw[k] !== undefined) res[k] = raw[k];
  return res;
}

/** Văn nhân ngồi cách tâm đệm của mình xa hơn chừng này (m) → báo. */
const SEAT_SNAP = 0.6;

/** Kiểm chéo `miniGames` với phần còn lại của cảnh. */
export function checkMiniGames(s: SceneSpec): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  s.miniGames.forEach((m, i) => {
    const at = `miniGames[${i}] (${m.kind})`;
    if (seen.has(m.kind)) out.push(`${at}: mỗi cảnh một trò mỗi loại`);
    seen.add(m.kind);
    if (m.kind === 'luu-thuong') {
      if (!s.channels[m.channel]) out.push(`${at}: không có channels[${m.channel}]`);
      for (const k of m.seats) if (!s.seats[k]) out.push(`${at}: không có seats[${k}]`);
      for (const n of m.npcs) {
        const seat = s.seats[n.seat];
        const npc = s.npcs.find((x) => x.id === n.id);
        if (!seat) out.push(`${at}: văn nhân "${n.id}" ngồi seats[${n.seat}] không có`);
        else if (!npc) out.push(`${at}: văn nhân "${n.id}" chưa có trong npcs`);
        else if (Math.hypot(npc.x - seat.x, npc.z - seat.z) > SEAT_SNAP) out.push(`${at}: "${n.id}" cách đệm ${n.seat} quá ${SEAT_SNAP} m`);
        if (m.seats.includes(n.seat)) out.push(`${at}: đệm ${n.seat} vừa của văn nhân vừa cho người chơi`);
      }
      if (!m.npcs.some((n) => n.id === m.host)) out.push(`${at}: chủ tiệc "${m.host}" không trong npcs của trò`);
    } else if (m.kind === 'hai-mang') {
      if (!s.npcs.some((n) => n.id === m.buyer)) out.push(`${at}: người mua "${m.buyer}" chưa có trong npcs`);
      if (s.bounds.enabled) {
        const [x0, z0] = s.bounds.from;
        const [x1, z1] = s.bounds.to;
        m.areas.forEach((a, k) => {
          for (const [x, z] of [a.from, a.to]) {
            if (x < Math.min(x0, x1) || x > Math.max(x0, x1) || z < Math.min(z0, z1) || z > Math.max(z0, z1)) out.push(`${at}.areas[${k}]: ra ngoài bounds`);
          }
        });
      }
    } else {
      const p = s.props[m.prop];
      if (!p || p.kind !== 'dan-cam') out.push(`${at}: props[${m.prop}] phải là tảng đá "dan-cam"`);
      if (Math.hypot(m.seat.dx, m.seat.dz) > 2.5) out.push(`${at}: chỗ ngồi xa đá quá 2,5 m`);
    }
  });
  return out;
}
