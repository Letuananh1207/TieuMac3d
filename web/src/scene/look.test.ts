import { describe, expect, it } from 'vitest';
import { checkLook, DEFAULT_LOOK, isColorManaged, isSoft, withLookParam } from './look';
import { resolveSceneSpec } from './specCheck';

describe('look — kiểu nhìn cảnh (kế hoạch canh-dep NV5)', () => {
  it('mặc định là kiểu cũ: file không có `look` → cảnh không đổi', () => {
    const { spec, problems } = resolveSceneSpec({});
    expect(spec.look.style).toBe('cu');
    expect(isSoft(spec.look)).toBe(false);
    expect(problems).toEqual([]);
  });

  it('bật mềm, trường thiếu lấy mặc định; trường sai báo lỗi và giữ mặc định', () => {
    const { spec, problems } = resolveSceneSpec({ look: { style: 'mem', wrap: 0.3, aoTint: 'tim', flowers: { density: 40 } } });
    expect(isSoft(spec.look)).toBe(true);
    expect(spec.look.wrap).toBe(0.3);
    expect(spec.look.aoTint).toBe(DEFAULT_LOOK.aoTint);
    expect(problems.some((p) => p.startsWith('look.aoTint'))).toBe(true);
    expect(problems.some((p) => p.startsWith('look.flowers.density'))).toBe(true);
  });

  it('kiểm khoảng: kiểu lạ, số ngoài 0…1, số âm', () => {
    expect(checkLook({ ...DEFAULT_LOOK, style: 'la' as 'cu' })).toHaveLength(1);
    expect(checkLook({ ...DEFAULT_LOOK, wrap: 1.5, vignette: -0.1, wind: -1 })).toHaveLength(3);
    expect(checkLook(DEFAULT_LOOK)).toEqual([]);
  });

  it('đường màu: mặc định chuẩn cho cảnh mềm; `cu` tắt quản lý màu; cảnh cũ luôn tắt; giá trị lạ báo lỗi (V-20261114-25)', () => {
    expect(DEFAULT_LOOK.colorPipeline).toBe('chuan');
    expect(isColorManaged(DEFAULT_LOOK)).toBe(false);
    expect(isColorManaged({ ...DEFAULT_LOOK, style: 'mem' })).toBe(true);
    expect(isColorManaged({ ...DEFAULT_LOOK, style: 'mem', colorPipeline: 'cu' })).toBe(false);
    const { spec, problems } = resolveSceneSpec({ look: { style: 'mem', colorPipeline: 'la' } });
    expect(problems.some((p) => p.startsWith('look.colorPipeline'))).toBe(true);
    expect(isSoft(spec.look)).toBe(true);
  });

  it('?look=cu ép kiểu cũ (không sửa đặc tả gốc); tham số khác giữ nguyên', () => {
    const spec = { look: { ...DEFAULT_LOOK, style: 'mem' as const } };
    const old = withLookParam(spec, 'cu');
    expect(old.look.style).toBe('cu');
    expect(spec.look.style).toBe('mem');
    expect(withLookParam(spec, null)).toBe(spec);
    expect(withLookParam(spec, 'mem')).toBe(spec);
  });
});
