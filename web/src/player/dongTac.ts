/**
 * Động tác bằng code cho nhân vật có xương chuẩn (model Tripo, xương Mixamo — R-NPC-10). Thuần (không three): mỗi khung
 * tính góc từng khớp; `mixamoRig.ts` áp lên xương.
 *
 * Quy ước góc (radian, quanh trục của nhân vật: mặt trước +z, trên +y, trái +x — như `glbCharacter.ts` / `autoRig.ts`):
 * - tay / chân `x` âm = đưa ra trước; thân / đầu `x` dương = cúi về trước;
 * - `y` dương = xoay về phía trái nhân vật (+x);
 * - tay trái `z` âm = khép vào thân (tay phải ngược dấu); thân `z` dương = nghiêng sang phải nhân vật.
 * Góc khớp con tính trong khung của khớp cha đã xoay (như cây xương thật).
 */

/** Các khớp động tác điều khiển (tên trung tính, `mixamoRig.ts` đổi sang tên xương Mixamo). */
export const JOINTS = [
  'hips', 'spine', 'chest', 'upperChest', 'neck', 'head',
  'armL', 'armR', 'foreL', 'foreR', 'handL', 'handR',
  'upLegL', 'upLegR', 'legL', 'legR', 'footL', 'footR',
] as const;
export type Joint = (typeof JOINTS)[number];
export type Euler3 = [number, number, number];

/** Dáng một khung: góc từng khớp + độ nâng cả thân (m, trước khi co giãn theo `scale` của NPC). */
export interface Pose {
  readonly j: Record<Joint, Euler3>;
  lift: number;
}

/** Tham số "tính cách" dáng — chỉnh trên Canvas 3D `?dang=dong-tac` rồi chốt vào `TINH`. */
export interface Tinh {
  /** nhịp bước: rad/s cho mỗi m/s tốc độ (chu kỳ 2π = 2 bước) */
  nhip: number;
  /** biên độ đùi khi đi (rad) */
  buoc: number;
  /** gối co khi chân đưa lên (rad) */
  goi: number;
  /** vung tay từ vai (rad) */
  vungTay: number;
  /** khuỷu theo sau tay (0 … 1 — phần biên độ vung của cẳng tay, trễ nhịp) */
  khuyuTre: number;
  /** khuỷu cong sẵn (rad) */
  khuyuCong: number;
  /** nhún hông khi đi (m) */
  nhun: number;
  /** hông xoay theo bước (rad) */
  xoayHong: number;
  /** vai xoay ngược hông (rad) */
  xoayVai: number;
  /** đổ người về trước khi đi hết tốc (rad) */
  doNguoi: number;
  /** nghiêng vào khúc rẽ (rad cho mỗi rad/s tốc độ quay) */
  nghiengRe: number;
  /** đà: tốc độ bám theo bước (1/s — nhỏ = có đà, bắt đầu / dừng chậm) */
  da: number;
  /** thở (rad ở ngực) */
  tho: number;
  /** nhịp thở (rad/s) */
  nhipTho: number;
  /** dồn trọng tâm khi đứng (rad nghiêng hông) */
  donTam: number;
  /** nhìn quanh khi đứng (rad đầu) */
  nhinQuanh: number;
  /** tay hạ từ tư thế chữ A của model (rad) */
  haTay: number;
  /** tay hơi đưa ra trước khi đứng (rad) */
  tayTruoc: number;
  /** lưng còng (rad, người già) */
  cong: number;
}

/** 4 tính cách mẫu (R-NPC-10). Bộ số chốt từ phòng thử động tác (`?dang=dong-tac`). */
export const TINH = {
  'diem-tinh': {
    nhip: 2.6, buoc: 0.42, goi: 0.55, vungTay: 0.22, khuyuTre: 0.45, khuyuCong: 0.18, nhun: 0.025, xoayHong: 0.08,
    xoayVai: 0.1, doNguoi: 0.05, nghiengRe: 0.05, da: 3.5, tho: 0.025, nhipTho: 1.6, donTam: 0.035, nhinQuanh: 0.22,
    haTay: 0.48, tayTruoc: 0.08, cong: 0,
  },
  'hoat-bat': {
    nhip: 3.1, buoc: 0.55, goi: 0.75, vungTay: 0.42, khuyuTre: 0.6, khuyuCong: 0.28, nhun: 0.05, xoayHong: 0.12,
    xoayVai: 0.16, doNguoi: 0.08, nghiengRe: 0.09, da: 6, tho: 0.03, nhipTho: 2.2, donTam: 0.05, nhinQuanh: 0.35,
    haTay: 0.45, tayTruoc: 0.1, cong: 0,
  },
  gia: {
    nhip: 2.3, buoc: 0.3, goi: 0.4, vungTay: 0.12, khuyuTre: 0.3, khuyuCong: 0.32, nhun: 0.018, xoayHong: 0.06,
    xoayVai: 0.07, doNguoi: 0.06, nghiengRe: 0.04, da: 2.5, tho: 0.03, nhipTho: 1.4, donTam: 0.03, nhinQuanh: 0.18,
    haTay: 0.46, tayTruoc: 0.14, cong: 0.18,
  },
  nghiem: {
    nhip: 2.5, buoc: 0.4, goi: 0.5, vungTay: 0.16, khuyuTre: 0.35, khuyuCong: 0.14, nhun: 0.02, xoayHong: 0.06,
    xoayVai: 0.07, doNguoi: 0.03, nghiengRe: 0.04, da: 3.5, tho: 0.02, nhipTho: 1.5, donTam: 0.025, nhinQuanh: 0.14,
    haTay: 0.5, tayTruoc: 0.04, cong: 0,
  },
} satisfies Record<string, Tinh>;
export type TinhId = keyof typeof TINH;
export const TINH_IDS = Object.keys(TINH) as TinhId[];

/** R-NPC-10: tầm nhìn người chơi (m), góc quay tối đa (rad), thời gian một lần gật (s). */
export const LOOK_DIST = 4;
export const LOOK_MAX = (70 * Math.PI) / 180;
export const NOD_TIME = 0.6;

/**
 * R-NPC-10: góc quay đầu (rad, `y` dương = về phía trái NPC) để nhìn người chơi ở (px, pz); NPC ở (x, z) mặt trước theo
 * `rotY` (0 = +z). Ngoài 4 m, hoặc người chơi ở nửa sau (không đang thoại) → `null` (quay về hướng gốc). Kẹp ±70°.
 */
export function lookYaw(x: number, z: number, rotY: number, px: number, pz: number, talking = false): number | null {
  const dx = px - x;
  const dz = pz - z;
  if (!talking && Math.hypot(dx, dz) >= LOOK_DIST) return null;
  const s = Math.sin(rotY);
  const c = Math.cos(rotY);
  const lz = dx * s + dz * c; // phía trước
  const lx = dx * c - dz * s; // phía trái
  if (!talking && lz <= 0) return null;
  if (Math.abs(lx) < 1e-9 && Math.abs(lz) < 1e-9) return 0;
  return Math.max(-LOOK_MAX, Math.min(LOOK_MAX, Math.atan2(lx, lz)));
}

/** Đầu vào mỗi khung. */
export interface DongTacInput {
  /** tốc độ thật (m/s) */
  mps: number;
  /** tốc độ quay hướng (rad/s, dương = rẽ trái) */
  turn?: number;
  /** góc nhìn người chơi (`lookYaw`), `null` = không nhìn */
  look?: number | null;
  /** đang bay (nhảy — R-DIEU-6) */
  air?: boolean;
  /** 0 → 1: ngồi xếp bằng (R-DIEU-7, NPC ngồi R-NPC-6 / R-NPC-9) — nơi gọi làm mượt */
  sit?: number;
  /** ngồi hạ thân bao nhiêu (m, trước co giãn NPC) — đáy hông chạm mặt ngồi; thiếu = `SIT_DROP` */
  sitDrop?: number;
  /** nơi gọi tự dựng dáng bước (nhân vật chính — dáng đi cũ `tronDiCu` của `dang7.ts`, L-18): tắt mọi phần theo bước (đùi,
   *  gối, vung tay, nhún, xoay hông / vai, đổ người, nghiêng khi rẽ); đứng / thở / nhảy / ngồi / khuỷu giữ nguyên */
  tuDi?: boolean;
}

/**
 * Hằng dáng chạy (R-DIEU-5) — hoà dần từ đi bộ hết tốc (3,2 m/s) tới chạy hết tốc (7 m/s), cộng thêm vào số của `Tinh`
 * (không thêm trường vào `Tinh` — bộ số đi / đứng đang chỉnh trên phòng thử).
 */
export const CHAY = {
  /** tốc độ bắt đầu / hết hoà chạy (m/s) = WALK_SPEED / RUN_SPEED (controller.ts) */
  tu: 3.2,
  toi: 7,
  /** cộng thêm biên độ đùi, gối co, vung tay (rad) */
  buoc: 0.3,
  goi: 0.8,
  vungTay: 0.4,
  /** khuỷu gập khi chạy hết tốc (rad, thay `khuyuCong`) */
  khuyu: 1.2,
  /** đổ người thêm (rad) */
  doNguoi: 0.2,
  /** nhún thêm (m) */
  nhun: 0.05,
  /** nhịp bước chậm lại (phần) — bước dài ra thay vì đạp nhanh */
  nhipGiam: 0.4,
};

/** Dáng nhảy (R-DIEU-6): gối trước co lên, chân sau duỗi ra sau, tay giang giữ thăng bằng. */
export const NHAY = { dui: -0.8, goi: 1.3, duiSau: 0.35, goiSau: 0.5, giangTay: 0.55, khuyu: 0.5 };

/** Ngồi xếp bằng: hạ thân mặc định (m — như dáng 7 khớp cũ). */
export const SIT_DROP = 0.3;
/** Ngồi xếp bằng: đùi ra trước + dạng + xoay, gối gập vào giữa, tay đặt lên gối, thân hơi cúi. */
export const NGOI = { dui: -1.4, dang: 0.75, xoayDui: 0.35, goi: 2.3, tayTruoc: 0.55, tayKhep: 0.05, khuyu: 0.75, cui: 0.1, dau: 0.12 };

const WALK_REF = 3.2; // = WALK_SPEED (controller.ts) — m/s ứng với bước đủ biên độ
const NPC_WALK = 1.1; // tốc độ đi thường của NPC (R-NPC-7) — dưới mức này biên độ giảm dần

/** Bộ động tác của một nhân vật (giữ nhịp, đà, lần nhìn quanh…). `seed` lệch nhịp giữa các NPC. */
export class DongTac {
  readonly pose: Pose;
  private phase = 0;
  private move = 0;
  private time: number;
  private yaw = 0;
  private turnS = 0;
  private shift = 0;
  private shiftTo = 0;
  private nextShift: number;
  private nod = -1;
  private rnd: number;
  private runB = 0;
  private airB = 0;

  constructor(
    public tinh: Tinh,
    seed = 0,
  ) {
    this.time = seed * 7.31;
    this.rnd = (Math.abs(Math.floor(seed * 9973)) % 2147483646) + 1;
    this.nextShift = 4 + this.random() * 6;
    const j = {} as Record<Joint, Euler3>;
    for (const k of JOINTS) j[k] = [0, 0, 0];
    this.pose = { j, lift: 0 };
  }

  /** gật nhẹ một lần (R-NPC-10 — mở khung / sang câu mới) */
  nodOnce(): void {
    this.nod = 0;
  }

  /** pha bước hiện tại (rad) — cho test / phòng thử */
  get stepPhase(): number {
    return this.phase;
  }

  /** cường độ bước 0…1 (mượt theo `da`) */
  get moving(): number {
    return this.move;
  }

  /** 0…1: hoà dáng chạy (mượt) */
  get running(): number {
    return this.runB;
  }

  /** 0…1: dáng nhảy (mượt) */
  get airborne(): number {
    return this.airB;
  }

  update(dt: number, input: DongTacInput): Pose {
    const t = this.tinh;
    const mps = Math.max(0, input.mps);
    this.time += dt;
    // đà: cường độ bước bám theo tốc độ với hằng thời gian 1 / da (R-NPC-10: bắt đầu / dừng không bật tắt)
    const target = mps > 0.05 ? Math.min(1, 0.55 + 0.45 * Math.min(1, mps / NPC_WALK) * Math.min(1, 0.6 + mps / WALK_REF)) : 0;
    this.move += (target - this.move) * Math.min(1, dt * t.da);
    const m = this.move;
    // chạy (R-DIEU-5) / nhảy (R-DIEU-6): hoà mượt; ngồi: nơi gọi đã làm mượt
    const runT = Math.min(1, Math.max(0, (mps - CHAY.tu) / (CHAY.toi - CHAY.tu)));
    this.runB += (runT - this.runB) * Math.min(1, dt * 6);
    this.airB += ((input.air ? 1 : 0) - this.airB) * Math.min(1, dt * 14);
    const rb = this.runB;
    const ab = this.airB;
    const sb = smooth(input.sit ?? 0);
    // nhịp bước theo tốc độ thật; dừng thì pha trôi nốt về bước gần nhất (chân khép) thay vì giật; bay thì chân đứng nhịp
    const rate = t.nhip * (1 - CHAY.nhipGiam * rb) * (1 - ab);
    if (mps > 0.05) this.phase += dt * rate * Math.max(mps, 0.9);
    else if (m > 0.01) this.phase += dt * rate * 0.9 * m;
    this.turnS += ((input.turn ?? 0) - this.turnS) * Math.min(1, dt * 6);

    const s = Math.sin(this.phase);
    const c = Math.cos(this.phase);
    const still = (1 - m) * (1 - ab) * (1 - sb);
    const mw = input.tuDi ? 0 : m; // phần theo bước
    const j = this.pose.j;

    /* ---- đứng: thở, dồn trọng tâm, nhìn quanh ---- */
    const br = Math.sin(this.time * t.nhipTho);
    if (this.time > this.nextShift) {
      const r = this.random();
      this.shiftTo = r < 0.35 ? -1 : r < 0.7 ? 1 : 0;
      this.nextShift = this.time + 5 + this.random() * 7;
    }
    this.shift += (this.shiftTo * still - this.shift) * Math.min(1, dt * 0.9);
    const sh = this.shift * t.donTam;
    const around = Math.sin(this.time * 0.31) * Math.sin(this.time * 0.13 + 0.7) * t.nhinQuanh * still;

    /* ---- nhìn người chơi (mượt), chia đầu 50 % · cổ 30 % · ngực 20 % ---- */
    const want = input.look ?? null;
    this.yaw += ((want ?? 0) - this.yaw) * Math.min(1, dt * (want === null ? 1.8 : 3.2));
    const lookW = want === null ? Math.min(1, Math.abs(this.yaw) / 0.2) : 1;
    const yaw = this.yaw + around * (1 - lookW);

    /* ---- gật ---- */
    let nod = 0;
    if (this.nod >= 0) {
      this.nod += dt;
      nod = this.nod < NOD_TIME ? Math.sin((Math.PI * this.nod) / NOD_TIME) * 0.22 : 0;
      if (this.nod >= NOD_TIME) this.nod = -1;
    }

    /* ---- thân ---- */
    const lean = (t.doNguoi * Math.min(1.6, Math.max(0.6, mps / NPC_WALK)) + CHAY.doNguoi * rb) * mw;
    const roll = -t.nghiengRe * this.turnS * mw;
    set(j.hips, 0, t.xoayHong * mw * s, roll + sh + 0.02 * mw * s);
    set(j.spine, lean * 0.5 + t.cong * 0.4 - t.tho * 0.3 * br * still, -t.xoayVai * mw * s * 0.4, -sh * 0.6);
    set(j.chest, lean * 0.3 + t.cong * 0.4 - t.tho * 0.5 * br * still, -t.xoayVai * mw * s * 0.6 + yaw * 0.2, -sh * 0.5);
    set(j.upperChest, lean * 0.2 + t.cong * 0.2 - t.tho * br * still, 0, 0);
    set(j.neck, -lean * 0.4 - t.cong * 0.5 + nod * 0.4, yaw * 0.3, sh * 0.4);
    set(j.head, -lean * 0.3 - t.cong * 0.3 + nod * 0.6 + Math.sin(this.time * 0.5) * 0.02 * still, yaw * 0.5 + t.xoayVai * mw * s * 0.3, sh * 0.3 + Math.sin(this.time * 1.1) * 0.025 * still);

    /* ---- tay: vung từ vai, khuỷu trễ nhịp; chạy: vung mạnh, khuỷu gập ---- */
    const swing = (t.vungTay + CHAY.vungTay * rb) * mw * (1 - ab);
    const breathArm = t.tho * 0.6 * br * still;
    const lagS = Math.sin(this.phase - 0.7);
    const bent = t.khuyuCong + (CHAY.khuyu - t.khuyuCong) * rb * m;
    const lagK = t.khuyuTre * (1 - rb);
    set(j.armL, -t.tayTruoc - swing * s, 0, -(t.haTay - breathArm - 0.04 * mw));
    set(j.armR, -t.tayTruoc + swing * s, 0, t.haTay - breathArm - 0.04 * mw);
    set(j.foreL, -bent - swing * lagK * Math.max(0, -lagS) * 1.4, 0, 0);
    set(j.foreR, -bent - swing * lagK * Math.max(0, lagS) * 1.4, 0, 0);
    set(j.handL, -0.05 - 0.08 * mw * Math.max(0, -lagS), 0, 0);
    set(j.handR, -0.05 - 0.08 * mw * Math.max(0, lagS), 0, 0);

    /* ---- chân: đùi theo pha, gối co khi đưa lên, bàn chân giữ bằng; chạy: bước dài, gối co cao ---- */
    const amp = (t.buoc + CHAY.buoc * rb) * mw;
    const knee = (t.goi + CHAY.goi * rb) * mw;
    const thighL = s * amp;
    const thighR = -s * amp;
    const kneeL = knee * Math.max(0, -c);
    const kneeR = knee * Math.max(0, c);
    set(j.upLegL, thighL - sh * 0.3, 0, -sh * 0.4);
    set(j.upLegR, thighR - sh * 0.3, 0, -sh * 0.4);
    set(j.legL, kneeL + Math.max(0, sh) * 0.15, 0, 0);
    set(j.legR, kneeR + Math.max(0, -sh) * 0.15, 0, 0);
    set(j.footL, -(thighL + kneeL) * 0.6, 0, 0);
    set(j.footR, -(thighR + kneeR) * 0.6, 0, 0);

    // nhún: cao nhất khi chân qua thẳng đứng — 2 lần mỗi chu kỳ; hạ nhẹ khi gối co lúc dồn trọng tâm
    this.pose.lift = (t.nhun + CHAY.nhun * rb) * mw * (Math.abs(c) - 0.64) * (1 - ab) - Math.abs(sh) * 0.15 + t.tho * 0.15 * br * still;
    if (ab > 0) this.jump(ab);
    if (sb > 0) this.sit(sb, input.sitDrop ?? SIT_DROP);
    return this.pose;
  }

  /** nhảy (R-DIEU-6): gối trước co lên, chân sau duỗi, tay giang — trộn theo `w` */
  private jump(w: number): void {
    const j = this.pose.j;
    const t = this.tinh;
    mixTo(j.upLegL, [NHAY.dui, 0, 0], w);
    mixTo(j.legL, [NHAY.goi, 0, 0], w);
    mixTo(j.footL, [-(NHAY.dui + NHAY.goi) * 0.5, 0, 0], w);
    mixTo(j.upLegR, [NHAY.duiSau, 0, 0], w);
    mixTo(j.legR, [NHAY.goiSau, 0, 0], w);
    mixTo(j.footR, [0.2, 0, 0], w);
    mixTo(j.armL, [-t.tayTruoc, 0, -t.haTay + NHAY.giangTay], w);
    mixTo(j.armR, [-t.tayTruoc, 0, t.haTay - NHAY.giangTay], w);
    mixTo(j.foreL, [-NHAY.khuyu, 0, 0], w);
    mixTo(j.foreR, [-NHAY.khuyu, 0, 0], w);
  }

  /** ngồi xếp bằng: đùi ra trước + dạng, gối gập vào giữa, tay đặt lên gối; hạ thân `drop` — trộn theo `w` */
  private sit(w: number, drop: number): void {
    const j = this.pose.j;
    const t = this.tinh;
    mixTo(j.upLegL, [NGOI.dui, NGOI.xoayDui, NGOI.dang], w);
    mixTo(j.upLegR, [NGOI.dui, -NGOI.xoayDui, -NGOI.dang], w);
    mixTo(j.legL, [NGOI.goi, 0, 0], w);
    mixTo(j.legR, [NGOI.goi, 0, 0], w);
    mixTo(j.footL, [0, 0, 0], w);
    mixTo(j.footR, [0, 0, 0], w);
    mixTo(j.hips, [0, 0, 0], w);
    j.spine[0] += NGOI.cui * w;
    j.head[0] += NGOI.dau * w;
    mixTo(j.armL, [-NGOI.tayTruoc, 0, -t.haTay - NGOI.tayKhep], w);
    mixTo(j.armR, [-NGOI.tayTruoc, 0, t.haTay + NGOI.tayKhep], w);
    mixTo(j.foreL, [-NGOI.khuyu, 0, 0], w);
    mixTo(j.foreR, [-NGOI.khuyu, 0, 0], w);
    this.pose.lift -= drop * w;
  }

  /** Số giả ngẫu nhiên 0…1 có hạt giống (Park–Miller) — hai NPC cùng hạt giống cùng nhịp. */
  private random(): number {
    this.rnd = (this.rnd * 16807) % 2147483647;
    return (this.rnd - 1) / 2147483646;
  }
}

function smooth(x: number): number {
  const v = Math.min(1, Math.max(0, x));
  return v * v * (3 - 2 * v);
}

/** trộn góc khớp [e] về [to] theo trọng số [w] (tại chỗ) */
function mixTo(e: Euler3, to: Euler3, w: number): void {
  for (let i = 0; i < 3; i++) e[i] += (to[i] - e[i]) * w;
}

function set(e: Euler3, x: number, y: number, z: number): void {
  e[0] = x;
  e[1] = y;
  e[2] = z;
}
