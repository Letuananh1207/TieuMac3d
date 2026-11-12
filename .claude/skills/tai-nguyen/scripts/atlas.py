# Tấm texture "chiếu từ trước" cho model Hunyuan không có màu: nửa trái = ảnh nhìn trước (cắt sát nhân vật),
# nửa phải = mặt sau (da vùng đầu → màu tóc, để gáy không thành khuôn mặt thứ hai). Dùng với web/scripts/model-paint.mjs.
#   python atlas.py <ảnh> <ra.png> [--nen r,g,b] [--toc r,g,b] [--co 512]
# Ảnh đầu vào: một nhân vật, nền trơn (cùng ảnh đã đưa Hunyuan). Cần Pillow (python thường của máy).
import sys
from PIL import Image, ImageFilter

args = sys.argv[1:]
def opt(name, default):
    return args[args.index('--' + name) + 1] if '--' + name in args else default

src, out = args[0], args[1]
bg = tuple(int(v) for v in opt('nen', '').split(',')) if opt('nen', '') else None
hair = tuple(int(v) for v in opt('toc', '34,34,38').split(','))
size = int(opt('co', '512'))

im = Image.open(src).convert('RGB')
w, h = im.size
px = im.load()
if bg is None:  # màu nền = trung bình 4 góc
    cs = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
    bg = tuple(sum(c[i] for c in cs) // 4 for i in range(3))

def is_bg(c):
    return sum(abs(c[i] - bg[i]) for i in range(3)) < 30

# khung bao nhân vật: chỉ mảng liền với tâm ảnh (bỏ logo / vết mờ ở góc, vd. ngôi sao của Gemini)
from PIL import ImageDraw
solid = Image.new('L', (w, h), 0)
sp = solid.load()
for y in range(h):
    for x in range(w):
        sp[x, y] = 0 if is_bg(px[x, y]) else 255
solid = solid.filter(ImageFilter.MaxFilter(5))  # nối các nét đứt
cx, cy = w // 2, h // 2
while sp[cx, cy] == 0 and cy < h - 1:
    cy += 1
ImageDraw.floodfill(solid, (cx, cy), 128, thresh=0)
box = solid.point(lambda v: 255 if v == 128 else 0).getbbox()
front = im.crop(box)

# lan màu bên trong ra phủ nền + viền ngoài (cạnh hông model lấy màu áo, không lấy nền / nét viền)
fw, fh = front.size
fp = front.load()
mask = Image.new('L', (fw, fh), 0)
mp = mask.load()
for y in range(fh):
    for x in range(fw):
        mp[x, y] = 0 if is_bg(fp[x, y]) else 255
mask = mask.filter(ImageFilter.MinFilter(5))  # bỏ nét viền ngoài
filled = front.copy()
for _ in range(12):
    grown = filled.filter(ImageFilter.MaxFilter(3)) if False else filled.filter(ImageFilter.BoxBlur(2))
    filled = Image.composite(front, grown, mask)
    mask = mask.filter(ImageFilter.MaxFilter(3))
front = filled.resize((size, size), Image.LANCZOS)

# mặt sau: da (cam nhạt) ở nửa trên → tóc; bỏ chi tiết mặt (mắt, miệng) cũng nằm trong vùng da
back = front.copy()
bp = back.load()
head_bottom = int(size * 0.42)
for y in range(head_bottom):
    for x in range(size):
        r, g, b = bp[x, y]
        skin = r > 170 and g > 120 and b > 90 and r > g > b and r - b > 25
        dark_face = r < 120 and g < 100 and b < 100 and 0.15 * size < y < 0.38 * size  # mắt, lông mày
        if skin or dark_face:
            bp[x, y] = hair

atlas = Image.new('RGB', (size * 2, size))
atlas.paste(front, (0, 0))
atlas.paste(back, (size, 0))
atlas.save(out)
print(f'atlas {atlas.size} nen {bg} khung {box} -> {out}')
