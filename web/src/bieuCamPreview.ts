/**
 * Canvas 3D `?dang=bieu-cam` (R-BIEU-2, kế hoạch docs/tasks/2026-11-15-thanh-cong-cu.md NV5) — duyệt dáng 8 biểu cảm:
 * - `&bc=<mã>` (`vay-tay`, `cui-chao`, …, `zones/bieuCam.ts`): diễn lặp một biểu cảm; không có → lần lượt cả 8;
 * - `&t=<giây>`: đứng yên ở giây đó của biểu cảm (chụp ảnh headless — thời gian ảo của Chrome trôi không đều).
 * Chắp tay = Chào (`bow`), Ngồi nghỉ = dáng ngồi (`sit`) — như trong app.
 */
import type { CharacterState } from './player/character';
import { BOW_TIME } from './player/controller';
import { EMOTES, emoteById, type Emote } from './zones/bieuCam';

/** nghỉ giữa hai lần diễn (s) */
const GAP = 0.6;
/** Ngồi nghỉ trong bản xem lần lượt: ngồi bấy nhiêu giây rồi sang cái sau */
const HOLD_SHOW = 2.5;

export interface EmotePreview {
  /** biểu cảm đang diễn (hiện tên ở bảng) */
  readonly current: Emote;
  /** đặt dáng vào `state` cho khung này */
  apply(dt: number, state: CharacterState): void;
}

export function emotePreview(params: URLSearchParams): EmotePreview | null {
  if (params.get('dang') !== 'bieu-cam') return null;
  const one = emoteById(params.get('bc') ?? '');
  const list = one ? [one] : EMOTES;
  const freeze = Number(params.get('t'));
  const frozen = params.has('t') && Number.isFinite(freeze);
  let i = 0;
  let t = frozen ? freeze : 0;
  const len = (e: Emote): number => (Number.isFinite(e.seconds) ? e.seconds : HOLD_SHOW);
  return {
    get current() {
      return list[i];
    },
    apply(dt, state) {
      if (!frozen) t += dt;
      if (!frozen && t > len(list[i]) + GAP) {
        t = 0;
        i = (i + 1) % list.length;
      }
      const e = list[i];
      const on = t <= len(e);
      state.emote = on && !e.asBow && !e.sits ? { id: e.id, t, len: e.seconds } : undefined;
      state.sit = e.sits && on ? 1 : 0;
      // Chắp tay: dáng chào 0 → 1 → 0 như `PlayerController` (BOW_TIME)
      state.bow = e.asBow && on ? Math.max(0, Math.min(1, t / 0.3, (BOW_TIME - t) / 0.3)) : 0;
    },
  };
}
