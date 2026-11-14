import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { TrialStore } from './bridge/browserStore';
import type { MovingNpc } from './player/npc';
import { gioVN } from './scene/ngayDem';
import { DRAFT_GO_MO, DRAFT_KHAT_NHI } from './scene/npcDraft';
import type { NpcSpec } from './scene/spec';
import { GO_MO, malletHeight, NHUONG_BUOC, TownNpcs, type TownNpcsHost } from './townNpcs';
import { giayTrongNgayVN } from './zones/gioVN';

vi.stubGlobal('window', { addEventListener: () => {}, setTimeout: (f: () => void) => (f(), 0), AudioContext: undefined });

function fakeNpc(spec: NpcSpec): MovingNpc {
  const root = new THREE.Object3D();
  root.position.set(spec.x, 0, spec.z);
  return {
    id: spec.id,
    spec,
    root,
    character: { root, facing: new THREE.Object3D(), animate: () => {} },
    motion: { mps: 0, sit: spec.pose === 'ngoi' ? 1 : 0 },
    update: () => {},
    block: { x: spec.x, z: spec.z, r: 0.45 },
  };
}

function host(over: Partial<TownNpcsHost> = {}): TownNpcsHost & { said: string[]; chat: string[]; spentLog: string[] } {
  const said: string[] = [];
  const chat: string[] = [];
  const spentLog: string[] = [];
  return {
    bridge: { giveAlms: async () => null },
    trial: null,
    progress: () => null,
    groundAt: () => 0,
    say: (_id, t) => said.push(t),
    chatSay: (_id, t) => chat.push(t),
    spent: (_a, label, balance) => spentLog.push(`${label} → ${balance}`),
    almsSaved: () => {},
    said,
    chat,
    spentLog,
    ...over,
  };
}

const camera = new THREE.PerspectiveCamera();
const frame = (player: THREE.Vector3, talkingTo: string | null = null) => ({ dt: 0.1, player, camera, talkingTo, covered: false });

describe('Ghép NPC trấn (townNpcs.ts)', () => {
  it('giờ VN của zones/gioVN.ts khớp gioVN của ngày đêm (scene/ngayDem.ts) — một đồng hồ', () => {
    for (const t of [0, Date.UTC(2026, 10, 14, 16, 59, 30), Date.UTC(2026, 10, 15, 3, 7, 1)]) {
      expect(giayTrongNgayVN(t) / 3600).toBeCloseTo(gioVN(t), 9);
    }
  });

  it('R-NPC-7: Lão Canh ở đúng điểm trên vòng theo giờ, vật cản đi theo; thoại → đứng, quay về người chơi', () => {
    const go = fakeNpc(DRAFT_GO_MO);
    const h = host();
    const town = new TownNpcs([go], h, '10:05');
    const far = new THREE.Vector3(200, 0, 200);
    town.update(frame(far));
    const a = go.root.position.clone();
    expect(go.block!.x).toBeCloseTo(a.x, 9);
    expect(go.block!.z).toBeCloseTo(a.z, 9);
    // cùng giờ ép trên "máy khác" → cùng chỗ
    const other = fakeNpc(DRAFT_GO_MO);
    new TownNpcs([other], host(), '10:05').update(frame(far));
    expect(other.root.position.distanceTo(a)).toBeLessThan(0.2);
    // đứng cạnh, đang thoại → không đi, mặt hướng về người chơi
    const me = new THREE.Vector3(a.x + 1.5, 0, a.z);
    town.update(frame(me, GO_MO));
    const b = go.root.position.clone();
    town.update(frame(me, GO_MO));
    expect(go.root.position.distanceTo(b)).toBeLessThan(1e-9);
    expect(go.character.facing.rotation.y).toBeCloseTo(Math.PI / 2, 6);
    expect(go.motion.mps).toBe(0);
  });

  it('R-NPC-7: đứng chắn trước mặt quá 3 s → một lần "Đạo hữu nhường lão một bước nhé." lên kênh', () => {
    const go = fakeNpc(DRAFT_GO_MO);
    let t = Date.UTC(2026, 10, 14, 3, 5); // 10:05 VN; mỗi khung 0,1 s
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => (t += 100));
    const h = host();
    const town = new TownNpcs([go], h);
    town.update(frame(new THREE.Vector3(200, 0, 200)));
    town.update(frame(new THREE.Vector3(200, 0, 200)));
    const yaw = go.character.facing.rotation.y;
    const p = go.root.position;
    const block = new THREE.Vector3(p.x + Math.sin(yaw) * 0.8, 0, p.z + Math.cos(yaw) * 0.8);
    for (let i = 0; i < 40; i++) town.update(frame(block));
    expect(h.chat.filter((m) => m === NHUONG_BUOC)).toHaveLength(1);
    clock.mockRestore();
  });

  it('R-NPC-8: dùi chạm mõ đúng lúc mỗi tiếng gõ, giơ cao giữa hai tiếng', () => {
    expect(malletHeight(7, 1)).toBe(0);
    expect(malletHeight(7, 1.9)).toBe(0);
    expect(malletHeight(7, 1.45)).toBe(1);
  });

  it('R-NPC-6, R-TIEN-8: ví thử 300 → "Cho 5 văn" → 295, nhãn "−5 · Cho Tiểu Khất", Tiểu Khất kể tin; nói lại cùng ngày → đã cho', async () => {
    const kn = fakeNpc(DRAFT_KHAT_NHI);
    const trial = new TrialStore(null);
    const h = host({ trial });
    const town = new TownNpcs([kn], h);
    const d = town.dialog('khat-nhi')!;
    const give = d.lines[0].choices[0];
    expect(give.text).toBe('Cho 5 văn');
    expect(town.handles(give)).toBe(true);
    town.act(give);
    await Promise.resolve();
    expect(trial.wallet.coins).toBe(295);
    expect(h.spentLog).toEqual(['−5 · Cho Tiểu Khất → 295']);
    expect(h.said[0].startsWith('Đa tạ đạo hữu!')).toBe(true);
    expect(town.dialog('khat-nhi')!.lines[0].text.startsWith('Hôm nay đạo hữu cho rồi')).toBe(true);
    expect(town.dialog('tieu-mac')).toBeUndefined();
  });

  it('R-NPC-6: có Flutter, Flutter trả lỗi / bản cũ (null) → không trừ, câu như ví thiếu', async () => {
    const h = host();
    const town = new TownNpcs([fakeNpc(DRAFT_KHAT_NHI)], h);
    town.act({ text: 'Cho 5 văn', next: null, action: 'alms' });
    await new Promise((r) => setTimeout(r, 0));
    expect(h.spentLog).toEqual([]);
    expect(h.said[0]).toContain('Giữ lại mà mua bánh');
  });
});
