# Tấm texture 4 góc (2 × 2) cho `model:paint --4goc`: trên-trái = trước, trên-phải = trái, dưới-trái = sau, dưới-phải =
# phải. Bộ ảnh phải chuẩn hoá như phiếu 2026-11-12-anh-nhan-vat-3d: vuông, nền trơn, đỉnh 10 %, đế 90 %, trục thân giữa
# ảnh, cùng tỉ lệ (chiếu thẳng). Mỗi ảnh: bỏ 3 px mép nhân vật + lan màu bên trong ra phủ nền (mép model không ăn nền).
#   python atlas4.py <thư mục ảnh> <tên> <ra.png> [--co 512] [--mat]
# --mat: dán ảnh <tên>-mat.png (cận đầu) đè lên vùng đầu ảnh trước cho mặt sắc nét (khớp theo khung bao đầu).
import os
import sys
from PIL import Image, ImageChops, ImageFilter

args = sys.argv[1:]
def opt(name, default):
    return args[args.index('--' + name) + 1] if '--' + name in args else default

folder, name, out = args[0], args[1], args[2]
size = int(opt('co', '512'))


def fill_edges(im):
    w, h = im.size
    px = im.load()
    c = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
    bg = tuple(sum(v[i] for v in c) // 4 for i in range(3))
    mask = Image.new('L', (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            mp[x, y] = 0 if sum(abs(p[i] - bg[i]) for i in range(3)) < 26 else 255
    mask = mask.filter(ImageFilter.MinFilter(7))
    filled = Image.composite(im, Image.new('RGB', (w, h)), mask)
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)]
    for step in range(48):
        s = 1 + step // 6
        for dx, dy in dirs:
            shifted = ImageChops.offset(filled, dx * s, dy * s)
            smask = ImageChops.offset(mask, dx * s, dy * s)
            take = ImageChops.subtract(smask, mask)
            filled = Image.composite(shifted, filled, take)
            mask = ImageChops.lighter(mask, take)
    return filled


atlas = Image.new('RGB', (size * 2, size * 2), (221, 221, 221))
order = [('truoc', 0, 0), ('trai', 1, 0), ('sau', 0, 1), ('phai', 1, 1)]
for suffix, cx, cy in order:
    p = os.path.join(folder, f'{name}-{suffix}.png')
    if not os.path.exists(p):
        print('thieu', p)
        continue
    im = Image.open(p).convert('RGB')
    if suffix == 'truoc' and '--mat' in args:
        print('--mat: chua lam (can khop khung dau) — bo qua')
    im = fill_edges(im).resize((size, size), Image.LANCZOS)
    atlas.paste(im, (cx * size, cy * size))
atlas.save(out)
print(f'atlas4 {atlas.size} -> {out}')
