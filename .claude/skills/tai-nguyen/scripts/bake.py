# "Nướng" texture cho model từ bộ ảnh 4 góc (thay chiếu thô của model:paint --4goc).
# Chạy bằng Python của gói Hunyuan (numpy, trimesh, xatlas, PIL):
#   /c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe -s bake.py <mịn.glb> <thư mục ảnh> <tên> <ra.glb>
#        [--co 1024] [--bang-mau "#f6d3bd,#202026,..."] [--mu 4]
# 1) xatlas trải UV riêng cho model; 2) mỗi điểm texture: vị trí + pháp tuyến 3D → chiếu sang 4 ảnh (trước +z, trái +x,
#    sau −z, phải −x; ảnh chuẩn hoá đỉnh 10 %, đế 90 %, trục thân giữa — phiếu 2026-11-12-anh-nhan-vat-3d);
# 3) trộn màu các ảnh theo trọng số max(0, n·hướng)^mu, bỏ ảnh mà điểm bị che (bộ đệm độ sâu từng góc);
# 4) --bang-mau: ép mỗi điểm về màu gần nhất trong bảng (bỏ bóng đổ / vệt sáng sẵn trong ảnh render) + lọc mode;
# 5) lan màu ra rãnh giữa các mảnh UV; xuất glb (pháp tuyến mịn từ lưới gốc).
import os
import sys
import numpy as np
import trimesh
import xatlas
from PIL import Image, ImageChops, ImageFilter

args = sys.argv[1:]
def opt(name, default):
    return args[args.index('--' + name) + 1] if '--' + name in args else default

src, folder, name, out = args[0], args[1], args[2], args[3]
TS = int(opt('co', '1024'))
MU = float(opt('mu', '4'))
palette_arg = opt('bang-mau', '')

mesh = trimesh.load(src, force='mesh')
mesh.merge_vertices()
V = mesh.vertices.astype(np.float64)
F = mesh.faces
N = mesh.vertex_normals.astype(np.float64)
minY, maxY = V[:, 1].min(), V[:, 1].max()
H = maxY - minY
feet = V[V[:, 1] < minY + 0.08 * H]
fx, fz = feet[:, 0].mean(), feet[:, 2].mean()
s = 0.8 / H

# ---------- ảnh 4 góc (nền đã lan màu bên trong ra để mép không ăn nền) ----------
def fill_edges(im):
    w, h = im.size
    a = np.asarray(im).astype(np.int32)
    corners = np.array([a[2, 2], a[2, w - 3], a[h - 3, 2], a[h - 3, w - 3]]).mean(0)
    m = (np.abs(a - corners).sum(-1) >= 26).astype(np.uint8) * 255
    mask = Image.fromarray(m).filter(ImageFilter.MinFilter(7))
    filled = Image.composite(im, Image.new('RGB', (w, h)), mask)
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)]
    for step in range(48):
        st = 1 + step // 6
        for dx, dy in dirs:
            shifted = ImageChops.offset(filled, dx * st, dy * st)
            smask = ImageChops.offset(mask, dx * st, dy * st)
            take = ImageChops.subtract(smask, mask)
            filled = Image.composite(shifted, filled, take)
            mask = ImageChops.lighter(mask, take)
    return np.asarray(filled).astype(np.float32)

VIEWS = {  # tên: (hướng về máy, hàm u, độ sâu: lớn = gần máy)
    'truoc': (np.array([0, 0, 1.0]), lambda P: 0.5 + (P[:, 0] - fx) * s, lambda P: P[:, 2]),
    'trai': (np.array([1.0, 0, 0]), lambda P: 0.5 - (P[:, 2] - fz) * s, lambda P: P[:, 0]),
    'sau': (np.array([0, 0, -1.0]), lambda P: 0.5 - (P[:, 0] - fx) * s, lambda P: -P[:, 2]),
    'phai': (np.array([-1.0, 0, 0]), lambda P: 0.5 + (P[:, 2] - fz) * s, lambda P: -P[:, 0]),
}
vmap = lambda P: 0.1 + 0.8 * (maxY - P[:, 1]) / H
imgs = {}
for k in VIEWS:
    p = os.path.join(folder, f'{name}-{k}.png')
    imgs[k] = fill_edges(Image.open(p).convert('RGB'))
IH, IW = imgs['truoc'].shape[:2]

# ---------- bộ đệm độ sâu từng góc (che khuất) ----------
DB = 512
def raster(tri2d, values, size, buf, mode):
    """Vẽ tam giác (toạ độ pixel) vào buf; mode 'max' giữ giá trị lớn nhất (độ sâu gần máy)."""
    (x0, y0), (x1, y1), (x2, y2) = tri2d
    xmin, xmax = int(max(0, np.floor(min(x0, x1, x2)))), int(min(size - 1, np.ceil(max(x0, x1, x2))))
    ymin, ymax = int(max(0, np.floor(min(y0, y1, y2)))), int(min(size - 1, np.ceil(max(y0, y1, y2))))
    if xmax < xmin or ymax < ymin:
        return None
    xs, ys = np.meshgrid(np.arange(xmin, xmax + 1) + 0.5, np.arange(ymin, ymax + 1) + 0.5)
    d = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
    if abs(d) < 1e-12:
        return None
    l0 = ((y1 - y2) * (xs - x2) + (x2 - x1) * (ys - y2)) / d
    l1 = ((y2 - y0) * (xs - x2) + (x0 - x2) * (ys - y2)) / d
    l2 = 1 - l0 - l1
    inside = (l0 >= -1e-4) & (l1 >= -1e-4) & (l2 >= -1e-4)
    if not inside.any():
        return None
    if mode == 'max':
        val = l0 * values[0] + l1 * values[1] + l2 * values[2]
        sub = buf[ymin:ymax + 1, xmin:xmax + 1]
        np.maximum(sub, np.where(inside, val, -np.inf), out=sub)
        return None
    return ymin, xmin, inside, l0, l1, l2

depth = {}
for k, (_, fu, fd) in VIEWS.items():
    buf = np.full((DB, DB), -np.inf)
    U = fu(V) * DB
    W_ = vmap(V) * DB
    D = fd(V)
    for f in F:
        raster([(U[f[0]], W_[f[0]]), (U[f[1]], W_[f[1]]), (U[f[2]], W_[f[2]])], D[f], DB, buf, 'max')
    depth[k] = buf
print('do sau 4 goc xong')

# ---------- UV riêng (xatlas) + nướng ----------
vm, idx, uvs = xatlas.parametrize(V.astype(np.float32), F.astype(np.uint32))
V2, N2 = V[vm], N[vm]
tex = np.zeros((TS, TS, 3), np.float32)
cov = np.zeros((TS, TS), bool)
eps = 0.012 * H
for f in idx:
    t = [(uvs[i][0] * TS, (1 - uvs[i][1]) * TS) for i in f]
    r = raster(t, None, TS, None, 'bary')
    if r is None:
        continue
    y0, x0, inside, l0, l1, l2 = r
    P = (l0[..., None] * V2[f[0]] + l1[..., None] * V2[f[1]] + l2[..., None] * V2[f[2]])[inside]
    Nn = (l0[..., None] * N2[f[0]] + l1[..., None] * N2[f[1]] + l2[..., None] * N2[f[2]])[inside]
    Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-9
    acc = np.zeros((len(P), 3), np.float32)
    wsum = np.zeros(len(P), np.float32)
    for k, (dirv, fu, fd) in VIEWS.items():
        w = np.clip(Nn @ dirv, 0, 1) ** MU
        u = fu(P)
        v = vmap(P)
        di = np.clip((v * DB).astype(int), 0, DB - 1)
        dj = np.clip((u * DB).astype(int), 0, DB - 1)
        vis = fd(P) >= depth[k][di, dj] - eps
        w = w * vis
        ii = np.clip((v * IH).astype(int), 0, IH - 1)
        jj = np.clip((u * IW).astype(int), 0, IW - 1)
        acc += w[:, None] * imgs[k][ii, jj]
        wsum += w
    # điểm không ảnh nào thấy rõ (dưới nách, hõm, chỉ thấy rất xiên) → để trống, lát nữa loang màu từ vùng áo bên cạnh
    # trong cùng mảnh UV (trước đây lấy đại ảnh gần nhất không kiểm che khuất → dính màu tay áo / nền)
    seen = wsum >= 0.02
    col = acc / np.maximum(wsum, 1e-6)[:, None]
    sub = tex[y0:y0 + inside.shape[0], x0:x0 + inside.shape[1]]
    hit = np.zeros_like(inside)
    hit[inside] = seen
    sub[hit] = col[seen]
    cov[y0:y0 + inside.shape[0], x0:x0 + inside.shape[1]] |= hit
print('nuong xong, phu', round(cov.mean() * 100), '% texture')

# ---------- ép bảng màu (bỏ bóng / vệt sáng sẵn trong ảnh) ----------
if palette_arg:
    pal = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in palette_arg.split(',')], np.float32)
    def ycc(a):
        y = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
        return np.stack([y * 0.45, a[..., 2] - y, a[..., 0] - y], -1)  # độ sáng nhẹ ký → bóng đổ không đổi màu
    t = ycc(tex[cov])
    p = ycc(pal)
    nearest = np.argmin(((t[:, None, :] - p[None, :, :]) ** 2).sum(-1), axis=1)
    tex[cov] = pal[nearest]
    img = Image.fromarray(tex.clip(0, 255).astype(np.uint8)).filter(ImageFilter.ModeFilter(5))
    tex = np.asarray(img).astype(np.float32)
    print('ep', len(pal), 'mau')

# ---------- lan màu ra rãnh UV ----------
img = Image.fromarray(tex.clip(0, 255).astype(np.uint8))
mask = Image.fromarray((cov * 255).astype(np.uint8))
dirs = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)]
for step in range(40):  # đủ lấp vùng dưới nách (vài chục điểm ảnh) + rãnh giữa các mảnh UV
    for dx, dy in dirs:
        shifted = ImageChops.offset(img, dx, dy)
        smask = ImageChops.offset(mask, dx, dy)
        take = ImageChops.subtract(smask, mask)
        img = Image.composite(shifted, img, take)
        mask = ImageChops.lighter(mask, take)

if '--jpg' in args:  # texture JPEG (nhẹ hơn PNG ~5 lần); trimesh giữ JPEG khi ảnh vào là JPEG
    import io as _io
    buf = _io.BytesIO()
    img.save(buf, 'JPEG', quality=92)
    buf.seek(0)
    img = Image.open(buf)
    img.load()
mat = trimesh.visual.material.PBRMaterial(baseColorTexture=img, metallicFactor=0.0, roughnessFactor=1.0)
outm = trimesh.Trimesh(vertices=V2, faces=idx, vertex_normals=N2,
                       visual=trimesh.visual.TextureVisuals(uv=uvs, material=mat), process=False)
outm.export(out)
img.save(os.path.splitext(out)[0] + '-tex.png')
print('->', out, len(idx), 'tam giac')
