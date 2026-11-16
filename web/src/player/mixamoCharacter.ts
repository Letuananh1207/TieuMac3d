/**
 * Nhân vật `.glb` có xương chuẩn Mixamo (model Tripo — R-NPC-10): mọi dáng bằng code trên 18 khớp. Nền đi / đứng / chạy /
 * nhảy / ngồi từ `dongTac.ts`; các dáng riêng viết theo 7 khớp (chào, đứng lâu, biểu cảm, làm vườn, gõ mõ, gảy đàn —
 * `dang7.ts`, `bieuCamDang.ts`, `lamVuonDang.ts`) trộn đè bằng `tronDang7`, cùng thứ tự / trọng số như nhánh `autoRig` của
 * `glbCharacter.ts`. Nhân vật chính (`opts.player`) đi / chạy bằng dáng đi cũ (`diCuDang`, L-18). Đồ cầm tay làm vườn gắn vào xương `RightHand` ở điểm nắm (R-VUON-13).
 */
import type * as THREE from 'three';
import { emotePose } from './bieuCamDang';
import type { Character, ToolTip } from './character';
import { RUN_SPEED } from './controller';
import { CHAO, diCuDang, diCuMoi, diCuTien, dungLauDang, gayDanDang, goMoDang, NHIN_QUANH, REST, tronDang7, tronDiCu, VUON_VAI } from './dang7';
import { createGardenProps, type GardenProps } from './doLamVuon';
import { DongTac, TINH, type Tinh, type TinhId } from './dongTac';
import { isWork, PROP_OF, workPose } from './lamVuonDang';
import type { MixamoRig } from './mixamoRig';

/** Tay buông của nhân vật chính = góc chữ A đo từ xương trừ chừng này (rad) — tay sát thân nhưng không xuyên áo. */
const ARM_DOWN_GAP = 0.06;
/** Ngồi: tâm khớp háng cách mặt ngồi bấy nhiêu (m, khung model) — đáy hông chạm mặt ngồi như dáng 7 khớp cũ. */
const SIT_SEAT = 0.13;

export interface MixamoOpts {
  /** tính cách dáng (NPC — R-NPC-10); thiếu = `diem-tinh` */
  tinh?: TinhId;
  seed?: number;
  /** nhân vật người chơi (Q1 2026-11-16): `hoat-bat`, tắt nhìn quanh liên tục (R-DIEU-8 là lúc duy nhất nhìn quanh), tay
   *  buông đo từ xương; dáng đi / chạy là dáng cũ của nhánh `autoRig` (L-18 — `tronDiCu` của `dang7.ts`) */
  player?: boolean;
}

/** Bộ số dáng của nhân vật: người chơi theo Q1 (không đổi bảng `TINH`), NPC theo `tinh`. */
export function tinhFor(opts: MixamoOpts, aPose: number): Tinh {
  if (!opts.player) return TINH[opts.tinh ?? 'diem-tinh'];
  return { ...TINH['hoat-bat'], nhinQuanh: 0, haTay: Math.max(0, aPose - ARM_DOWN_GAP) };
}

/** Độ hạ thân khi ngồi (m): tâm khớp háng xuống còn `SIT_SEAT` trên mặt ngồi. */
export const sitDropFor = (hipY: number): number => Math.max(0, hipY - SIT_SEAT);

const ease = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export function mixamoCharacter(
  parts: { root: THREE.Group; body: THREE.Group; bob: THREE.Group; model: THREE.Object3D },
  mx: MixamoRig,
  opts: MixamoOpts,
): Character & ToolTip & { readonly dong: DongTac } {
  const { root, body, bob, model } = parts;
  bob.add(model);
  const dong = new DongTac(tinhFor(opts, mx.aPose), opts.seed ?? 0);
  const sitDrop = sitDropFor(mx.hipY);
  const hand = mx.bone('handR') ?? mx.bone('foreR');
  let props: GardenProps | null = null;
  let lastYaw = body.rotation.y;
  let time = 0;
  // nhân vật chính: dáng đi cũ (L-18) — trạng thái riêng, `dongTac` chỉ dựng dáng đứng / nhảy / ngồi
  const di = opts.player ? diCuMoi() : null;
  return {
    root,
    facing: body,
    dong,
    toolTip: (out, dir) => props?.tip(out, dir) ?? false,
    animate(dt, speed, state) {
      time += dt;
      const mps = state?.mps ?? speed * RUN_SPEED;
      let dy = body.rotation.y - lastYaw;
      lastYaw = body.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy)); // quay qua ±π không thành vòng
      const pose = dong.update(dt, { mps, turn: dt > 0 ? dy / dt : 0, air: state?.air, sit: state?.sit, sitDrop, tuDi: !!di });
      const cal = { off: dong.tinh.haTay - REST };
      let move = dong.moving;
      let airB = dong.airborne;
      if (di) {
        diCuTien(di, dt, mps, !!state?.air);
        const d = diCuDang(di);
        tronDiCu(pose, di, d, ease(state?.sit ?? 0));
        bob.rotation.x = d.lean;
        ({ move, airB } = di);
      }
      // chắp tay chào (R-DIEU-8 cũ / Chắp tay R-BIEU-1)
      tronDang7(pose, CHAO, ease(state?.bow ?? 0), cal);
      // đứng lâu (R-DIEU-8): vươn vai, rồi nhìn quanh
      const { stretch, look } = dungLauDang(state?.idle ?? 0);
      tronDang7(pose, VUON_VAI, stretch, cal);
      pose.j.neck[1] += look * NHIN_QUANH * 0.4;
      pose.j.head[1] += look * NHIN_QUANH * 0.6;
      // gõ mõ (R-NPC-8) / gảy đàn (R-NPC-9): đè hẳn dáng tay
      if (state?.strike !== undefined) tronDang7(pose, goMoDang(state.strike), 1, cal);
      if (state?.pluck !== undefined) tronDang7(pose, gayDanDang(state.pluck, time), 1, cal);
      // biểu cảm (R-BIEU-2) / làm vườn (R-VUON-13): biểu cảm đang diễn thì thắng
      const wk = state?.work;
      const wp = !state?.emote && wk ? workPose(wk.id, wk.t, wk.len) : null;
      const em = state?.emote ? emotePose(state.emote.id, state.emote.t, state.emote.len) : wp;
      const ew = em ? em.w * (1 - move) * (1 - airB) : 0;
      if (em) tronDang7(pose, em, ew, cal);
      mx.apply(pose);
      bob.position.y = pose.lift;
      // đồ cầm tay ở bàn tay phải (R-VUON-13): dựng khi cầm lần đầu
      const held = wk?.id ?? state?.hold;
      const prop = held && isWork(held) ? PROP_OF[held] : null;
      if (prop && !props && hand) props = createGardenProps(hand, mx.gripR, { upright: body });
      if (props && hand) {
        props.show(prop);
        props.pose(hand, (wp?.tilt ?? 0) * ew);
      }
    },
  };
}
