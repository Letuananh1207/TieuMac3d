import { describe, expect, it } from 'vitest';
import { DIALOGS } from '../zones/dialogs';
import { LIBRARIAN } from '../zones/library';
import { npcFace, pickFace } from './npcFace';

const urls = {
  '../../../design/models/anh/su-phu-chan-dung.png': '/a/su-phu-chan-dung.png',
  '../../../design/models/anh/su-phu-mat.png': '/a/su-phu-mat.png',
  '../../../design/models/anh/lao-gia-chan-dung.png': '/a/lao-gia-chan-dung.png',
  '../../../design/models/anh/tieu-su-phu-mat.png': '/a/tieu-su-phu-mat.png',
};

describe('ảnh mặt NPC', () => {
  it('R-NPC-2: ảnh cận mặt bên trái khung thoại — có ảnh mặt thì dùng ảnh mặt', () => {
    expect(pickFace('su-phu', urls)).toEqual({ url: '/a/su-phu-mat.png', kind: 'mat' });
  });

  it('R-NPC-2: không có ảnh mặt thì dùng chân dung, không có nữa thì không ảnh', () => {
    expect(pickFace('lao-gia', urls)).toEqual({ url: '/a/lao-gia-chan-dung.png', kind: 'chan-dung' });
    expect(pickFace('vo-danh', urls)).toBeUndefined();
  });

  it('R-NPC-2: mọi NPC có hội thoại đều có ảnh cận mặt trong bản build', () => {
    // Lão Canh chờ model + ảnh mặt (V-31 NV14, kế hoạch docs/tasks/2026-11-14-npc-khat-nhi-go-mo.md) — chưa vào cảnh app
    const waiting = new Set(['go-mo']);
    for (const npc of [...DIALOGS.map((d) => d.npc), LIBRARIAN]) if (!waiting.has(npc)) expect(npcFace(npc)?.kind, npc).toBe('mat');
  });
});
