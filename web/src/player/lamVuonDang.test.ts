import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import type { Character, CharacterState } from './character';
import { PlayerController } from './controller';
import { PROP_OF, propFor, ROT, ROT_LEN, WORK_FX, WORK_IDS, WORK_LEN, workPose, workWeight } from './lamVuonDang';

function rig(): { player: PlayerController; facing: THREE.Group; last: () => CharacterState | undefined } {
  const root = new THREE.Group();
  const facing = new THREE.Group();
  root.add(facing);
  let last: CharacterState | undefined;
  const ch: Character = { root, facing, animate: (_dt, _s, st) => void (last = st && { ...st, work: st.work && { ...st.work } }) };
  return { player: new PlayerController(ch, new Colliders()), facing, last: () => last };
}
const still = { x: 0, y: 0 };
const run = (p: PlayerController, seconds: number, input = still): void => {
  for (let t = 0; t < seconds - 1e-9; t += 1 / 60) p.update(1 / 60, input, 0, false);
};

describe('R-VUON-13: dáng làm vườn', () => {
  it('R-VUON-13: thời lượng gieo 0,9 · tưới 1,2 · bắt sâu 0,8 · nhổ 0,8 · bón 0,9 · thu 0,9 giây', () => {
    expect(WORK_LEN).toEqual({ gieo: 0.9, tuoi: 1.2, bat: 0.8, nho: 0.8, bon: 0.9, thu: 0.9 });
  });

  it('R-VUON-13: mốc hiệu ứng nằm trong thời lượng; tưới có tia nước kéo dài', () => {
    for (const id of WORK_IDS) for (const t of [...WORK_FX[id].at, WORK_FX[id].until ?? 0.1]) expect(t > 0 && t < WORK_LEN[id]).toBe(true);
    expect(WORK_FX.tuoi.until).toBeGreaterThan(WORK_FX.tuoi.at[0]);
  });

  it('R-VUON-13: vào – ra mượt, giữa động tác trọng số 1; đầu / cuối 0', () => {
    expect(workWeight(0, 0.9)).toBe(0);
    expect(workWeight(0.45, 0.9)).toBe(1);
    expect(workWeight(0.9, 0.9)).toBe(0);
  });

  it('R-VUON-13: cúi người khi gieo / bắt sâu / nhổ / thu; tưới nghiêng bình giữa lúc rót', () => {
    expect(workPose('gieo', 0.45)!.hipsX).toBeGreaterThan(0.2);
    expect(workPose('bat', 0.4)!.hipsX).toBeGreaterThan(0.4);
    expect(workPose('nho', 0.4)!.hipsX).toBeGreaterThan(0.4);
    expect(workPose('thu', 0.3)!.hipsX).toBeGreaterThan(0.3);
    expect(workPose('tuoi', 0.6)!.tilt).toBeGreaterThan(0.9);
    expect(workPose('tuoi', 0.05)!.tilt).toBeLessThan(0.1);
    // gieo: tay phải vung ra trước đúng mốc rắc hạt
    expect(workPose('gieo', WORK_FX.gieo.at[0])!.aRx).toBeLessThan(workPose('gieo', 0.15)!.aRx - 0.5);
    // thu: cuối động tác giơ giỏ lên cao
    expect(workPose('thu', 0.8)!.aRx).toBeLessThan(-1.5);
    expect(workPose('mua', 0.3)).toBeNull();
  });

  it('R-VUON-13: đồ cầm tay — bình tưới khi tưới, giỏ khi thu, tay không khi nhổ cỏ', () => {
    expect(PROP_OF.tuoi).toBe('binh');
    expect(PROP_OF.thu).toBe('gio');
    expect(PROP_OF.nho).toBeNull();
  });
});

describe('R-TRA-1: tiểu nhị rót trà (động tác `rot`, mượn dáng tưới)', () => {
  it('R-TRA-1: rót 2 giây — giữa động tác nghiêng ấm, đầu / cuối thẳng; cầm ấm trà', () => {
    expect(ROT_LEN).toBe(2);
    expect(workPose(ROT, 1)!.tilt).toBeGreaterThan(0.5);
    expect(workPose(ROT, 0.05)!.tilt).toBeLessThan(0.1);
    expect(workPose(ROT, ROT_LEN - 0.02)!.tilt).toBeLessThan(0.1);
    expect(workPose(ROT, 1)!.w).toBe(1);
    expect(workPose(ROT, 1)!.aRx).toBeLessThan(-0.6); // tay phải đưa ấm ra trước
    expect(propFor(ROT)).toBe('am-tra');
    expect(propFor('tuoi')).toBe('binh');
    expect(propFor('mua')).toBeNull();
  });

  it('R-TRA-1: rót không lẫn vào 6 việc vườn (vòng công cụ, Canvas 3D vườn)', () => {
    expect(WORK_IDS).toEqual(['gieo', 'tuoi', 'bat', 'nho', 'bon', 'thu']);
  });
});

describe('R-VUON-13: tự đi tới luống rồi diễn', () => {
  it('R-VUON-13: đi tới điểm, quay mặt về luống, gọi onArrive một lần', () => {
    const { player, facing } = rig();
    let arrived = 0;
    let cancelled = 0;
    player.walkTo(3, 0, 3, 2, () => arrived++, () => cancelled++);
    run(player, 3);
    expect(arrived).toBe(1);
    expect(cancelled).toBe(0);
    expect(Math.hypot(player.position.x - 3, player.position.z)).toBeLessThan(0.3);
    // mặt quay về điểm luống (3; 2) từ chỗ đứng
    const want = Math.atan2(3 - player.position.x, 2 - player.position.z);
    const dr = facing.rotation.y - want;
    expect(Math.abs(Math.atan2(Math.sin(dr), Math.cos(dr)))).toBeLessThan(0.02);
  });

  it('R-VUON-13: đẩy joystick khi đang tự đi → huỷ (onCancel), không tới', () => {
    const { player } = rig();
    let arrived = 0;
    let cancelled = 0;
    player.walkTo(5, 0, 5, 1, () => arrived++, () => cancelled++);
    run(player, 0.2);
    run(player, 0.1, { x: 0, y: -1 });
    run(player, 2);
    expect(cancelled).toBe(1);
    expect(arrived).toBe(0);
    expect(player.autoWalking).toBe(false);
  });

  it('R-VUON-13: trong lúc diễn không đi; joystick → diễn nốt (onDone) và báo huỷ hàng đợi một lần', () => {
    const { player, last } = rig();
    let done = 0;
    let cancelled = 0;
    player.work('tuoi', WORK_LEN.tuoi, () => done++, () => cancelled++);
    run(player, 0.3);
    expect(last()?.work?.id).toBe('tuoi');
    run(player, 0.5, { x: 1, y: 0 });
    expect(player.position.x).toBe(0);
    expect(cancelled).toBe(1);
    run(player, 0.5);
    expect(done).toBe(1);
    expect(player.working).toBe(false);
    // xong rồi thì joystick đi bình thường
    run(player, 0.3, { x: 1, y: 0 });
    expect(player.position.x).toBeGreaterThan(0.1);
  });
});
