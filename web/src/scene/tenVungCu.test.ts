import { readdirSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * Chặn tái phạm V-107 (R-HANH-1): bộ tên "thế giới bộ 2" thay 6 tên vùng cũ — không chuỗi hiển thị nào còn tên cũ.
 * Quét chuỗi (không quét comment) trong mã web, mọi giá trị chữ của đặc tả cảnh (trừ khoá `$…` ghi chú), tên trên bản đồ
 * truyền tống và trang vẽ bản đồ.
 */
const OLD = ['Trúc Lâm', 'Yên Vũ Lâu', 'Bồng Lai Đảo', 'Nhạn Môn Quan', 'Tử Cấm Thành', 'Đôn Hoàng Lộ'];
const NEW: Record<string, string> = {
  'rung-truc': 'Thung Trúc Gió Hát',
  'giang-nam': 'Chợ Đêm Đèn Hoa',
  'tu-cam-thanh': 'Rừng Nấm Tiên',
  'bong-lai': 'Cung Ngọc Đáy Biển',
  'truong-thanh': 'Đỉnh Hạc Bay',
  'to-lua': 'Thành Cát Ngủ Quên',
};

const SRC = new URL('../', import.meta.url);
const DESIGN = new URL('../../../design/scene/', import.meta.url);
// danh mục kiểu kiến trúc (trang dev catalog.html, không vào game) nhắc công trình thật ("bao cung (Tử Cấm Thành)")
const SKIP = /(\.test\.ts$|^fonts\/|^scene\/kien_truc\/danh_muc[^/]*\.ts$)/;

/** File .ts (đường dẫn tương đối `web/src/`) — thư mục trong `web/src` không có dấu chấm. */
function tsFiles(rel = ''): string[] {
  return readdirSync(new URL(rel, SRC)).flatMap((name) => {
    const p = rel + name;
    if (!name.includes('.')) return tsFiles(`${p}/`);
    return name.endsWith('.ts') && !SKIP.test(p) ? [p] : [];
  });
}

/** Mọi chuỗi trong một file TS (string, template) — comment không tính. */
function stringsOf(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false);
  const out: string[] = [];
  const walk = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateLiteralToken(n)) out.push(n.text);
    ts.forEachChild(n, walk);
  };
  walk(sf);
  return out;
}

/** Mọi giá trị chữ của một JSON, bỏ nhánh có khoá bắt đầu `$` (ghi chú thiết kế). */
function jsonStrings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(jsonStrings);
  if (v && typeof v === 'object') {
    return Object.entries(v).flatMap(([k, x]) => (k.startsWith('$') ? [] : jsonStrings(x)));
  }
  return [];
}

const hits = (s: string): string[] => OLD.filter((o) => s.includes(o));

describe('tên vùng thế giới bộ 2 (R-HANH-1, V-107)', () => {
  it('R-HANH-1: không chuỗi nào trong web/src còn tên vùng cũ', () => {
    const files = tsFiles();
    expect(files.length).toBeGreaterThan(100);
    expect(stringsOf('x.ts', "// Trúc Lâm\nconst a = 'Đi Trúc Lâm';").flatMap(hits)).toEqual(['Trúc Lâm']); // comment bỏ qua
    const bad = files.flatMap((f) => {
      const text = readFileSync(new URL(f, SRC), 'utf8');
      if (hits(text).length === 0) return []; // chỉ phân tích file có nhắc tên cũ (nhanh)
      return stringsOf(f, text)
        .filter((s) => hits(s).length > 0)
        .map((s) => `${f}: "${s}"`);
    });
    expect(bad).toEqual([]);
  });

  it('R-HANH-1: đặc tả cảnh (tên khu, nhãn cổng, biển, thoại) không còn tên vùng cũ', () => {
    const files = readdirSync(DESIGN).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThanOrEqual(8);
    const bad = files.flatMap((f) =>
      jsonStrings(JSON.parse(readFileSync(new URL(f, DESIGN), 'utf8')))
        .filter((s) => hits(s).length > 0)
        .map((s) => `${f}: "${s}"`),
    );
    expect(bad).toEqual([]);
  });

  it('R-HANH-1: bản đồ truyền tống + trang vẽ bản đồ ghi đúng 6 tên mới', () => {
    const map = JSON.parse(readFileSync(new URL('ban-do/ban-do.json', DESIGN), 'utf8')) as { noi: { id: string; ten: string }[] };
    for (const [id, ten] of Object.entries(NEW)) expect(map.noi.find((p) => p.id === id)?.ten, id).toBe(ten);
    const page = readFileSync(new URL('ban-do/ve-ban-do.html', DESIGN), 'utf8');
    const names = [...page.matchAll(/name: '([^']+)'/g)].map((m) => m[1]);
    for (const ten of Object.values(NEW)) expect(names).toContain(ten);
    expect(names.flatMap(hits)).toEqual([]);
  });
});
