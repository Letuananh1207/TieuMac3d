import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// L-25: lúc mở game / đổi map (đổi map = tải lại trang) thấy HTML trần — chữ HUD không kiểu ("kéo để đi", "Nhảy Space"),
// nút trống, núi SVG xám to — rồi mới tới màn tải. `style.css` do main.ts nạp: `npm run dev` chèn CSS bằng JS sau khi
// tải xong cả cây module (hàng trăm ms – vài giây), bản build có <link> nhưng vẫn là file ngoài. Màn tải phải che kín từ
// khung hình đầu (R-MAN-2) → khối CSS nội tuyến trong <head> của index.html, chỉ áp tới khi CSS chính vào (`html.css-san`).
const WEB = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(WEB, 'index.html'), 'utf8');
const head = html.slice(0, html.indexOf('</head>'));
const inline = (head.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
const mist = readFileSync(join(WEB, 'src/style.css'), 'utf8').match(/--mist:(#[0-9a-f]{6})/i)?.[1] ?? '?';
/** khai báo của luật có `sel` trong danh sách bộ chọn (khối nội tuyến đã bỏ chú thích + khoảng trắng) */
const rule = (sel: string): string =>
  inline.match(new RegExp(`(?:^|[},])${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,[^{}]*)?\\{([^}]*)\\}`))?.[1] ?? '';

describe('màn tải che kín từ khung hình đầu, trước khi CSS chính vào (R-MAN-2, L-25)', () => {
  it('R-MAN-2 (L-25): <head> có khối CSS nội tuyến, đứng trước mọi <script type=module> / <link>', () => {
    const at = head.indexOf('<style>');
    expect(at).toBeGreaterThan(0);
    for (const m of ['<script type="module"', '<link']) if (head.includes(m)) expect(at).toBeLessThan(head.indexOf(m));
  });

  it('R-MAN-2 (L-25): trước `html.css-san`: màn tải cố định phủ kín màn nền sương, núi SVG bám đáy cao cố định', () => {
    const ld = rule('html:not(.css-san)#loading');
    expect(ld).toContain('position:fixed');
    expect(ld).toContain('inset:0');
    expect(ld.toLowerCase()).toContain(`background:${mist.toLowerCase()}`);
    const svg = rule('html:not(.css-san)#loadingsvg');
    expect(svg).toContain('position:absolute');
    expect(svg).toMatch(/height:\d+px/);
    expect(rule('html:not(.css-san)body').toLowerCase()).toContain(`background:${mist.toLowerCase()}`);
  });

  it('R-MAN-2 (L-25): trước `html.css-san`: mọi phần HUD (con của body ngoài màn tải / màn mây) ẩn', () => {
    expect(rule('html:not(.css-san)body>:not(#loading):not(#crane)')).toContain('visibility:hidden');
    // cưỡi hạc (R-HANH-5): màn mây thay màn tải → che kín, chữ chưa kiểu ẩn
    expect(rule('html.hac:not(.css-san)#crane')).toContain('position:fixed');
    expect(rule('html.hac:not(.css-san)#loading')).toContain('display:none');
  });

  it('R-MAN-2 (L-25): main.ts gắn `css-san` sau khi nạp style.css (import chạy trước thân module)', () => {
    const main = readFileSync(join(WEB, 'src/main.ts'), 'utf8');
    expect(main).toMatch(/import '\.\/style\.css';/);
    expect(main).toMatch(/document\.documentElement\.classList\.add\('css-san'\)/);
  });
});
