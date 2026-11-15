/**
 * Ghép nhạc công gảy đàn cổ tranh trên bục đàn Quảng Trường (V-20261115-61; kế hoạch `docs/tasks/2026-11-15-npc-dan-tranh.md`):
 * R-NPC-9 (ngồi sau đàn, tay gảy, không tương tác) + R-AM-2 (tiếng đàn tự tổng hợp, to dần khi lại gần). Bục + đàn là
 * vật cảnh (`props` kind `buc-dan`); file này chỉ thêm **người + tiếng**, và chỉ khi có model `design/models/cam-nu.glb`
 * — chưa có model thì không người, không tiếng (Canvas 3D `?dang=dan-tranh` dùng model thế để duyệt chỗ).
 * Nhạc công không nằm trong `npcs` của đặc tả → không có nút "Nói chuyện", không bong bóng kênh chung.
 */
import * as THREE from 'three';
import { loadGlbCharacter } from './player/glbCharacter';
import type { Character, CharacterState } from './player/character';
import { NPC_HIDE_DIST, npcModelUrl } from './player/npc';
import { bucDanList, bucDanSeat } from './scene/bucDan';
import type { SceneSpec } from './scene/spec';
import { ZitherSound } from './ui/zitherSound';
import { danNotesBetween, danRamp, danVolume, pluckLift } from './zones/danTranh';
import { moPan } from './zones/moGo';

/** Mã model nhạc công (`design/models/cam-nu.glb`, phiếu ảnh `docs/phieu_thiet_ke/2026-11-15-anh-cam-nu.md`). */
export const CAM_NU = 'cam-nu';

export interface DanTranhFrame {
  dt: number;
  player: THREE.Vector3;
  camera: THREE.Camera;
  /** màn che (bài học / ôn / bảng / Tạp hoá), màn tải, đổi cảnh → tiếng đàn mờ về 0 (R-AM-2) */
  covered: boolean;
}

interface Player {
  character: Character;
  state: CharacterState;
  /** giây kể từ nốt gần nhất (tay phải nhấc theo) */
  since: number;
}

export class DanTranh {
  private level = 0;
  private prevSec: number | null = null;
  private readonly right = new THREE.Vector3();

  private constructor(
    private readonly players: Player[],
    private readonly sound: ZitherSound,
    private readonly now: () => number,
  ) {}

  /**
   * Dựng nhạc công trên mọi bục đàn của đặc tả. Không có bục, hoặc chưa có model (và không có `standIn`) → `null`
   * (cảnh vẫn chạy, không tiếng). `standIn` = hình thế chỉ Canvas 3D dùng: URL model, và / hoặc hàm dựng khối tạm khi không
   * nạp được model (artifact không phục vụ file .glb → đệ tử khối, đứng — khối không có dáng ngồi).
   */
  static async create(
    parent: THREE.Object3D,
    spec: SceneSpec,
    groundAt: (x: number, z: number) => number,
    standIn?: { url?: string; block?: () => Character },
    now: () => number = () => Date.now() / 1000,
  ): Promise<DanTranh | null> {
    const stages = bucDanList(spec.props);
    const url = npcModelUrl(CAM_NU) ?? standIn?.url;
    const block = standIn?.block;
    if (!stages.length || (!url && !block)) return null;
    const players: Player[] = [];
    for (const p of stages) {
      try {
        const character = url ? await loadGlbCharacter(url).catch((e: unknown) => (block ? block() : Promise.reject(e))) : block?.();
        if (!character) continue;
        const seat = bucDanSeat(p, groundAt);
        character.root.position.set(seat.x, seat.y, seat.z);
        character.facing.rotation.y = THREE.MathUtils.degToRad(seat.rotY);
        parent.add(character.root);
        players.push({ character, since: 1, state: { mps: 0, air: false, vy: 0, sit: 1, bow: 0, idle: 0, pluck: 1 } });
      } catch (e) {
        console.warn(`buc-dan: không nạp được nhạc công — ${String(e)}`);
      }
    }
    return players.length ? new DanTranh(players, new ZitherSound(), now) : null;
  }

  /** App xuống nền / tab ẩn → tiếng tắt ngay; trở lại → mở lại. */
  setRunning(on: boolean): void {
    if (on) this.sound.resume();
    else this.sound.suspend();
    this.prevSec = null; // không phát bù nốt lỡ
  }

  /** Mỗi khung: ẩn / hiện + dáng gảy, âm lượng theo nhạc công gần nhất, phát các nốt tới hạn. */
  update(f: DanTranhFrame): void {
    let near: Player | null = null;
    let best = Infinity;
    for (const p of this.players) {
      const at = p.character.root.position;
      const d = Math.hypot(at.x - f.player.x, at.z - f.player.z);
      p.character.root.visible = d < NPC_HIDE_DIST; // như NPC khác (R-NPC-1)
      if (d < best) {
        best = d;
        near = p;
      }
    }
    if (!near) return;
    this.level = danRamp(this.level, f.covered ? 0 : danVolume(best), f.dt);
    const at = near.character.root.position;
    this.right.setFromMatrixColumn(f.camera.matrixWorld, 0);
    this.sound.setLevel(this.level, moPan(this.right.x, this.right.z, at.x - f.player.x, at.z - f.player.z));
    const nowSec = this.now();
    const notes = this.prevSec === null ? [] : danNotesBetween(this.prevSec, nowSec);
    this.prevSec = nowSec;
    for (const n of notes) this.sound.pluck(n.midi, n.vel);
    // tay gảy theo nốt cả khi không nghe (đứng xa vẫn thấy đang đàn)
    for (const p of this.players) {
      p.since = notes.length ? 0 : p.since + f.dt;
      p.state.pluck = pluckLift(p.since);
      if (p.character.root.visible) p.character.animate(f.dt, 0, p.state);
    }
  }
}
