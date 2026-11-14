import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cursorValue } from './cursor';

// đọc thẳng file (vitest bỏ nội dung khi import .css, kể cả ?raw)
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

describe('Con trỏ chuột', () => {
  it('(L-9): style.css không trỏ con trỏ tới file ảnh riêng (phải tải → có lúc rơi về chuột máy)', () => {
    expect(css).not.toMatch(/cursor\s*:\s*url\(\s*["']?(?!data:)/);
    expect(css).toMatch(/cursor:var\(--cur,default\)!important/);
    expect(css).toMatch(/cursor:var\(--cur-btn,pointer\)!important/);
  });

  it('(L-9): con trỏ là data URI nhúng sẵn, giữ điểm nhấn và dự phòng', () => {
    const v = cursorValue('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M4 3v20"/></svg>\n', 5, 4, 'default');
    expect(v.startsWith('url("data:image/svg+xml,%3Csvg')).toBe(true);
    expect(v.endsWith('") 5 4, default')).toBe(true);
    expect(v).not.toContain('"/>'); // dấu " trong SVG đã mã hoá, không cắt ngang url("…")
  });
});
