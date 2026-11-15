import { describe, expect, it } from 'vitest';
import { inBag, type HomeState, type PlacedDecor } from './decor';
import { bagLeft, editStep, keyVerb, VERB_ROT, type EditState } from './decorEdit';

const mon = (item: string, x: number, z: number, rot = 0, scene = 'nha-ta'): PlacedDecor => ({ item, scene, x, z, rot });
const start = (home: HomeState): EditState => ({ home, scene: 'nha-ta', held: null });

describe('Máy trạng thái trang trí (R-NHA-2, R-NHA-6)', () => {
  it('R-NHA-2: Mai × 2 trong túi → lấy, đặt (8; 4) → túi 1; lấy, đặt (10; 4) → hai cây, túi 0; lấy nữa → không được', () => {
    let s = start({ items: [], owned: { mai: 2 } });
    let r = editStep(s, { kind: 'take', item: 'mai', spot: { x: 8, z: 4, rot: 0 } });
    expect(bagLeft(r.state, 'mai')).toBe(1); // túi giảm ngay khi lấy
    r = editStep(r.state, { kind: 'place', valid: true });
    expect(r.save).toBe(true);
    expect(inBag(r.state.home, 'mai')).toBe(1);
    r = editStep(r.state, { kind: 'take', item: 'mai', spot: { x: 10, z: 4, rot: 0 } });
    r = editStep(r.state, { kind: 'place', valid: true });
    s = r.state;
    expect(s.home.items).toEqual([mon('mai', 8, 4), mon('mai', 10, 4)]);
    expect(inBag(s.home, 'mai')).toBe(0);
    expect(editStep(s, { kind: 'take', item: 'mai', spot: { x: 0, z: 0, rot: 0 } })).toMatchObject({ refused: 'bagEmpty', save: false });
  });

  it('R-NHA-6: nhấc mai, xoay 45° hai lần, đặt → quay 90°; đặt khi đỏ → không đặt, vẫn cầm', () => {
    const s = start({ items: [mon('mai', 8, 4), mon('mai', 10, 4)], owned: { mai: 2 } });
    let r = editStep(s, { kind: 'lift', index: 0 });
    expect(r.state.home.items).toEqual([mon('mai', 10, 4)]);
    r = editStep(r.state, { kind: 'rotate', delta: 45 });
    r = editStep(r.state, { kind: 'rotate', delta: 45 });
    const red = editStep(r.state, { kind: 'place', valid: false });
    expect(red).toMatchObject({ refused: 'invalid', save: false });
    expect(red.state.held).not.toBeNull();
    r = editStep(r.state, { kind: 'place', valid: true });
    expect(r.save).toBe(true);
    expect(r.state.home.items).toContainEqual(mon('mai', 8, 4, 90));
  });

  it('R-NHA-6: Esc khi cầm món vừa nhấc → về chỗ cũ (không lưu); món vừa lấy → về túi; Esc khi không cầm → thoát', () => {
    const s = start({ items: [mon('mai', 8, 4)], owned: { mai: 2 } });
    let r = editStep(s, { kind: 'lift', index: 0 });
    r = editStep(r.state, { kind: 'move', spot: { x: 0, z: 0, rot: 0 } });
    r = editStep(r.state, { kind: 'cancel' });
    expect(r.state.home.items).toEqual([mon('mai', 8, 4)]);
    expect(r.save).toBe(false);
    r = editStep(r.state, { kind: 'take', item: 'mai', spot: { x: 1, z: 1, rot: 0 } });
    r = editStep(r.state, { kind: 'cancel' });
    expect(r.state.held).toBeNull();
    expect(inBag(r.state.home, 'mai')).toBe(1);
    expect(editStep(r.state, { kind: 'cancel' }).exit).toBe(true);
  });

  it('R-NHA-2: cất món đã đặt → biến khỏi cảnh, túi +1, lưu; cất món vừa lấy → về túi, không lưu', () => {
    const s = start({ items: [mon('mai', 8, 4), mon('mai', 10, 4)], owned: { mai: 2 } });
    let r = editStep(s, { kind: 'lift', index: 1 });
    r = editStep(r.state, { kind: 'store' });
    expect(r).toMatchObject({ save: true, stored: 'mai' });
    expect(r.state.home.items).toEqual([mon('mai', 8, 4)]);
    expect(inBag(r.state.home, 'mai')).toBe(1);
    r = editStep(r.state, { kind: 'take', item: 'mai', spot: { x: 1, z: 1, rot: 0 } });
    r = editStep(r.state, { kind: 'store' });
    expect(r).toMatchObject({ save: false, stored: 'mai' });
    expect(inBag(r.state.home, 'mai')).toBe(1);
  });

  it('R-NHA-6: chọn thẻ khác khi đang cầm → món đang cầm về túi / chỗ cũ rồi cầm món mới', () => {
    const s = start({ items: [mon('mai', 8, 4)], owned: { mai: 1, 'chau-lan': 1 } });
    let r = editStep(s, { kind: 'lift', index: 0 });
    r = editStep(r.state, { kind: 'take', item: 'chau-lan', spot: { x: 2, z: 2, rot: 0 } });
    expect(r.state.home.items).toEqual([mon('mai', 8, 4)]);
    expect(r.state.held?.item).toBe('chau-lan');
  });

  it('R-NHA-2: không nhấc được món của nơi khác (gian trong khi đang ở sân)', () => {
    const s = start({ items: [mon('ke-sach', 0, -3.5, 0, 'nha-ta-trong')], owned: { 'ke-sach': 1 } });
    expect(editStep(s, { kind: 'lift', index: 0 }).refused).toBe('none');
  });

  it('R-NHA-6: phím — Q trái 45°, E phải 45°, R 90°, Enter đặt, Esc huỷ, Delete / Backspace cất; phím khác không', () => {
    expect(['q', 'Q', 'e', 'r', 'Enter', 'Escape', 'Delete', 'Backspace', 'w', ' '].map(keyVerb)).toEqual(['rotL', 'rotL', 'rotR', 'rot90', 'place', 'cancel', 'store', 'store', null, null]);
    expect(VERB_ROT).toEqual({ rotL: 45, rotR: -45, rot90: 90 });
  });
});
