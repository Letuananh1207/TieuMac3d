import { describe, expect, it } from 'vitest';
import { TEA_POUR, TEA_SAY, TEA_SPEED, TEA_WAIT, TeaService, type TeaInput, type TeaOutput } from './teaService';

/** Độ dài đường quầy → chỗ đứng rót: 0 = đôn phía cửa bàn giữa tầng 1 (≈ 8 m), 1 = ghế lan can mặt trước tầng 2 (≈ 48 m). */
const LEN: Record<number, number> = { 0: 8, 1: 48, 2: 6 };
const len = (seat: number): number | null => LEN[seat] ?? null;

function run(t: TeaService, secs: number, seated: number | null, extra: Partial<TeaInput> = {}): TeaOutput[] {
  const out: TeaOutput[] = [];
  const dt = 1 / 30;
  for (let k = 0; k < Math.round(secs / dt); k++) out.push(t.step({ dt, seated, length: len, ...extra }));
  return out;
}
const last = (o: TeaOutput[]): TeaOutput => o[o.length - 1];

describe('Tiểu nhị mang trà — máy trạng thái (R-TRA-1)', () => {
  it('R-TRA-1: chưa ai ngồi → đứng ở quầy, nói chuyện được', () => {
    const o = last(run(new TeaService(), 3, null));
    expect(o).toMatchObject({ phase: 'quay', s: 0, served: false, canTalk: true });
  });

  it('R-TRA-1: ngồi đôn tầng 1 → 2 s đứng chờ, rồi nói "Có ngay…" một lần, đi 2,4 m/s, tới nơi rót 2 s → có chén, rồi về quầy', () => {
    const t = new TeaService();
    const wait = run(t, TEA_WAIT - 0.1, 0);
    expect(wait.every((o) => o.phase === 'cho' && o.s === 0 && !o.served)).toBe(true);
    const go = run(t, 0.3, 0);
    expect(go.filter((o) => o.say === TEA_SAY)).toHaveLength(1);
    expect(last(go).phase).toBe('di');
    expect(last(go).canTalk).toBe(false);
    const walk = run(t, LEN[0] / TEA_SPEED - 0.25, 0);
    expect(last(walk).phase).toBe('di');
    expect(last(walk).s).toBeGreaterThan(LEN[0] - 1);
    const at = run(t, 0.2, 0);
    expect(last(at)).toMatchObject({ phase: 'rot', s: LEN[0], served: false });
    const pour = run(t, TEA_POUR + 0.05, 0);
    expect(pour.filter((o) => o.phase === 'rot').every((o) => !o.served)).toBe(true);
    expect(last(pour).served).toBe(true);
    expect(last(pour).phase).toBe('ve');
    const back = run(t, LEN[0] / TEA_SPEED + 0.2, 0);
    expect(last(back)).toMatchObject({ phase: 'quay', s: 0, served: true, canTalk: true });
    // vẫn ngồi đó → không mang lần nữa
    expect(run(t, 5, 0).every((o) => o.phase === 'quay' && o.served)).toBe(true);
  });

  it('R-TRA-1: ghế lan can tầng 2 → đi hết đường dài (≈ 20 s) rồi mới rót', () => {
    const t = new TeaService();
    run(t, TEA_WAIT + 0.05, 1);
    const walk = run(t, LEN[1] / TEA_SPEED - 0.3, 1);
    expect(last(walk).phase).toBe('di');
    expect(LEN[1] / TEA_SPEED).toBeGreaterThan(18);
    expect(LEN[1] / TEA_SPEED).toBeLessThan(22);
    expect(last(run(t, 0.5, 1)).phase).toBe('rot');
    expect(last(run(t, TEA_POUR + 0.05, 1)).served).toBe(true);
  });

  it('R-TRA-1: đứng dậy giữa thang → quay về ngay từ chỗ đang đứng, không có chén', () => {
    const t = new TeaService();
    run(t, TEA_WAIT + 0.05, 1);
    const mid = last(run(t, 10, 1)).s;
    expect(mid).toBeGreaterThan(20);
    const up = run(t, 1, null);
    expect(up[0].phase).toBe('ve');
    expect(up.every((o) => !o.served)).toBe(true);
    expect(last(up).s).toBeLessThan(mid);
    expect(last(up).s).toBeGreaterThan(mid - TEA_SPEED * 1.05);
    expect(last(run(t, mid / TEA_SPEED + 0.2, null))).toMatchObject({ phase: 'quay', s: 0, served: false });
  });

  it('R-TRA-1: đứng dậy lúc đang chờ 2 s → không đi; đứng dậy lúc đang rót → về, không có chén', () => {
    const t = new TeaService();
    run(t, 1, 0);
    expect(last(run(t, 3, null)).phase).toBe('quay');
    run(t, TEA_WAIT + 0.05 + LEN[0] / TEA_SPEED + 0.2, 0);
    expect(last(run(t, 1, 0)).phase).toBe('rot');
    const up = run(t, 0.5, null);
    expect(up.every((o) => !o.served)).toBe(true);
    expect(last(up).phase).toBe('ve');
  });

  it('R-TRA-1: ngồi chỗ khác khi tiểu nhị đang về → về tới quầy rồi mới đi (lại chờ 2 s)', () => {
    const t = new TeaService();
    run(t, TEA_WAIT + 0.05 + 2, 1);
    run(t, 0.2, null); // đứng dậy → về
    const back = run(t, 1, 2); // ngồi đôn khác trong lúc về
    expect(back.every((o) => o.phase === 've')).toBe(true);
    const home = run(t, 2.5, 2); // ≈ 0,8 s nữa về tới quầy, rồi chờ
    const firstCho = home.findIndex((o) => o.phase === 'cho');
    expect(firstCho).toBeGreaterThan(0);
    expect(home[firstCho - 1]).toMatchObject({ phase: 'quay', s: 0 });
    expect(home.slice(firstCho).every((o) => o.phase === 'cho' && o.s === 0)).toBe(true);
    expect(last(run(t, TEA_WAIT, 2)).phase).toBe('di');
  });

  it('R-TRA-1: ngồi lại sau khi có chén → đứng dậy mất chén, ngồi lại mang lần nữa', () => {
    const t = new TeaService();
    run(t, TEA_WAIT + 0.05 + LEN[2] / TEA_SPEED + 0.2 + TEA_POUR + 0.1, 2);
    expect(last(run(t, 0.1, 2)).served).toBe(true);
    expect(run(t, 0.1, null)[0].served).toBe(false);
    run(t, 5, null); // về tới quầy
    const again = run(t, 1, 2);
    expect(again.every((o) => o.phase === 'cho' && !o.served)).toBe(true);
  });

  it('R-TRA-1: đang về mà bị chặn → đứng chờ (không nói)', () => {
    const t = new TeaService();
    run(t, TEA_WAIT + 0.05 + 1, 0);
    run(t, 0.1, null);
    const s0 = last(run(t, 0.1, null)).s;
    const held = run(t, 2, null, { blocked: true });
    expect(held.every((o) => Math.abs(o.s - s0) < 1e-9 && o.phase === 've' && !o.say)).toBe(true);
  });

  it('R-TRA-1: chỗ không có đường (thiếu mốc) → không ai mang, coi như có chén ngay như R-NGOI-1', () => {
    const o = run(new TeaService(), 3, 9);
    expect(o.every((x) => x.phase === 'quay' && x.served)).toBe(true);
  });
});
