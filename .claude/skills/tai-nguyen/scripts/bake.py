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
    ys, xs = np.nonzero(m)
    bbox = (xs.min() / w, (xs.max() + 1) / w, ys.min() / h, (ys.max() + 1) / h)  # khung nhân vật trong ảnh (0..1)
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
    return np.asarray(filled).astype(np.float32), bbox, m > 0

VIEWS = {  # tên: (hướng về máy, hàm u, độ sâu: lớn = gần máy)
    'truoc': (np.array([0, 0, 1.0]), lambda P: 0.5 + (P[:, 0] - fx) * s, lambda P: P[:, 2]),
    'trai': (np.array([1.0, 0, 0]), lambda P: 0.5 - (P[:, 2] - fz) * s, lambda P: P[:, 0]),
    'sau': (np.array([0, 0, -1.0]), lambda P: 0.5 - (P[:, 0] - fx) * s, lambda P: -P[:, 2]),
    'phai': (np.array([-1.0, 0, 0]), lambda P: 0.5 + (P[:, 2] - fz) * s, lambda P: -P[:, 0]),
}
vmap = lambda P: 0.1 + 0.8 * (maxY - P[:, 1]) / H
imgs = {}
boxes = {}
masks = {}
for k in VIEWS:
    p = os.path.join(folder, f'{name}-{k}.png')
    imgs[k], boxes[k], masks[k] = fill_edges(Image.open(p).convert('RGB'))
IH, IW = imgs['truoc'].shape[:2]


def img_head(m):
    # cổ = hàng hẹp nhất trong dải 22–45 % chiều cao nhân vật (từ đỉnh); khung đầu = phần trên cổ
    rows = np.flatnonzero(m.any(1))
    r0, r1 = rows[0], rows[-1]
    best, neck = 1e9, r0
    for r in range(int(r0 + 0.22 * (r1 - r0)), int(r0 + 0.45 * (r1 - r0))):
        xs = np.flatnonzero(m[r])
        if len(xs) and xs[-1] - xs[0] < best:
            best, neck = xs[-1] - xs[0], r
    xs = np.flatnonzero(m[r0:neck + 1].any(0))
    nx = np.flatnonzero(m[neck])
    mid = (nx[0] + nx[-1] + 1) / 2 / m.shape[1]  # trục giữa đầu = giữa cổ
    return xs[0] / m.shape[1], (xs[-1] + 1) / m.shape[1], r0 / m.shape[0], neck / m.shape[0], mid


def model_head(u0, v0):
    vmin, vmax = v0.min(), v0.max()
    lo, hi = vmin + 0.22 * (vmax - vmin), vmin + 0.45 * (vmax - vmin)
    best, neck = 1e9, lo
    for c in np.linspace(lo, hi, 50):
        sel = np.abs(v0 - c) < (hi - lo) / 50
        if sel.sum() > 3 and np.ptp(u0[sel]) < best:
            best, neck = np.ptp(u0[sel]), c
    hd = v0 < neck
    nb = np.abs(v0 - neck) < (hi - lo) / 50
    mid = (u0[nb].min() + u0[nb].max()) / 2
    return u0[hd].min(), u0[hd].max(), vmin, neck, mid

# khớp khung từng góc: khung bao model chiếu theo góc đó ↦ khung nhân vật thật trong ảnh (model Hunyuan có tỉ lệ hơi
# khác giả định đỉnh 10 % / đế 90 % / trục giữa → lệch vài % làm chân tóc, tai, mép viền đặt sai chỗ = vệt lem)
_raw = {k: (VIEWS[k][1], vmap) for k in VIEWS}
FIT = {}
for k, (fu0, fv0) in _raw.items():
    u0, v0 = fu0(V), fv0(V)
    a0, a1, b0, b1 = boxes[k]
    FIT[k] = (u0.min(), u0.max(), v0.min(), v0.max(), a0, a1, b0, b1)
    print(f'khop {k}: model u {u0.min():.3f}-{u0.max():.3f} v {v0.min():.3f}-{v0.max():.3f} | anh u {a0:.3f}-{a1:.3f} v {b0:.3f}-{b1:.3f}')
# khớp riêng vùng đầu: khung cả người ở ảnh trước do hai tay dang quyết định bề ngang → đầu lệch ngang vài %, đúng chỗ
# thái dương / chân tóc thành mảng da lấn tóc. Đầu (trên cổ) khớp khung đầu ↔ khung đầu, thân khớp cả người, chuyển mượt quanh cổ.
HEAD = {}
for k, (fu0, fv0) in _raw.items():
    mh = model_head(fu0(V), fv0(V))
    ih = img_head(masks[k])
    HEAD[k] = (mh, ih)
    print(f'dau {k}: model u {mh[0]:.3f}|{mh[4]:.3f}|{mh[1]:.3f} v {mh[2]:.3f}-{mh[3]:.3f} | anh u {ih[0]:.3f}|{ih[4]:.3f}|{ih[1]:.3f} v {ih[2]:.3f}-{ih[3]:.3f}')


def _blend(k, P):
    v0 = vmap(P)
    neck = HEAD[k][0][3]
    t = np.clip((v0 - (neck - 0.015)) / 0.03, 0, 1)  # 0 = đầu, 1 = thân
    return v0, t * t * (3 - 2 * t)


def fit_u(k):
    fu0 = _raw[k][0]
    um, uM, _, _, a0, a1, _, _ = FIT[k]
    (hu0, hu1, _, _, hc), (ha0, ha1, _, _, ac) = HEAD[k]
    def f(P):
        u0 = fu0(P)
        body = a0 + (u0 - um) / (uM - um) * (a1 - a0)
        # đầu: hai nửa khớp riêng quanh trục giữa (model không đối xứng tuyệt đối)
        head = np.where(u0 < hc, ha0 + (u0 - hu0) / (hc - hu0) * (ac - ha0), ac + (u0 - hc) / (hu1 - hc) * (ha1 - ac))
        _, t = _blend(k, P)
        return head * (1 - t) + body * t
    return f


def fit_v(k):
    _, _, vm_, vM, _, _, b0, b1 = FIT[k]
    (_, _, hv0, hv1, _), (_, _, hb0, hb1, _) = HEAD[k]
    def f(P):
        v0, t = _blend(k, P)
        body = b0 + (v0 - vm_) / (vM - vm_) * (b1 - b0)
        head = hb0 + (v0 - hv0) / (hv1 - hv0) * (hb1 - hb0)
        return head * (1 - t) + body * t
    return f
VIEWS = {k: (d, fit_u(k), fd, fit_v(k)) for k, (d, fu, fd) in VIEWS.items()}
neck_y = maxY - (HEAD['truoc'][0][3] - 0.1) / 0.8 * H  # độ cao cổ (model) từ góc trước

# chân tóc trán (ảnh trước, dải giữa mặt): hàng đầu tiên từ đỉnh đầu xuống có màu da. Trên đầu, điểm cao hơn hàng này
# mà mang màu da (do ảnh trước / bên chiếu trượt ở mép đầu — tóc model mỏng hơn ảnh) → đổi thành màu tóc (2026-11-12.10)
def is_skin(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    return (0.299 * r + 0.587 * g + 0.114 * b > 110) & (r - b > 20) & (b > 0.55 * r)
_ih = HEAD['truoc'][1]
_fi = imgs['truoc']
_cols = slice(int((_ih[4] - 0.02) * IW), int((_ih[4] + 0.02) * IW))
hair_v = _ih[3]
for r in range(int(_ih[2] * IH), int(_ih[3] * IH)):
    if is_skin(_fi[r, _cols]).mean() > 0.6:
        hair_v = r / IH + float(opt('chan-toc', '0'))
        break
_hp = _fi[int(_ih[2] * IH):int(hair_v * IH), int(_ih[0] * IW):int(_ih[1] * IW)].reshape(-1, 3)
_hl = _hp @ np.array([0.299, 0.587, 0.114])
HAIR = np.median(_hp[_hl < 70], 0) if (_hl < 70).any() else np.array([40, 40, 45.0])
print(f'chan toc anh truoc v {hair_v:.3f}, mau toc', HAIR.astype(int))


def bo_toc_mai(k):
    """Ảnh bên: tẩy vệt tóc mai (phần tóc MẢNH nối khối tóc, thấp hơn chân tóc trán) → màu da xung quanh. Mắt / lông mày là
    mảng tối riêng không nối tóc → giữ. Người dùng 2026-11-12: "phần màu đen ở mai đáng ra không có"."""
    from scipy import ndimage as nd
    im = imgs[k]
    _, _, top, neck, _ = HEAD[k][1]
    r0, r1 = int(top * IH), int(neck * IH)
    reg = im[r0:r1]
    lum = reg @ np.array([0.299, 0.587, 0.114])
    hair = (lum < 90) & masks[k][r0:r1]
    rad = max(3, int(0.012 * IW))  # vệt tóc mai rộng < 2·rad điểm ảnh
    yy, xx = np.mgrid[-rad:rad + 1, -rad:rad + 1]
    body = nd.binary_opening(hair, structure=(xx ** 2 + yy ** 2) <= rad * rad)
    thin = hair & ~body
    lab, n = nd.label(thin)
    near_body = nd.binary_dilation(body, iterations=2)
    rows = np.arange(r0, r1)[:, None] / IH
    low = np.broadcast_to(rows > hair_v + 0.02, thin.shape)  # dưới chân tóc hẳn: không lẹm tóc thái dương
    kill = np.zeros_like(thin)
    for j in range(1, n + 1):
        c = lab == j
        if (c & near_body).any() and (c & low).sum() > 0.5 * c.sum() and c.sum() > rad * rad:
            kill |= c
    kill = nd.binary_dilation(kill, iterations=2) & masks[k][r0:r1] & ~body
    skin = is_skin(reg) & ~kill
    # tô: lấy màu da gần nhất (biến đổi khoảng cách)
    _, (iy, ix) = nd.distance_transform_edt(~skin, return_indices=True)
    reg[kill] = reg[iy[kill], ix[kill]]
    print(f'bo toc mai {k}: {int(kill.sum())} diem anh')
    return kill

if '--giu-toc-mai' not in args:
    _kill = {k: bo_toc_mai(k) for k in ('trai', 'phai')}
    if '--xem-toc-mai' in args:
        for k in ('trai', 'phai'):
            Image.fromarray(imgs[k].clip(0, 255).astype(np.uint8)).save(os.path.splitext(out)[0] + f'-{k}.png')

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
for k, (_, fu, fd, fv) in VIEWS.items():
    buf = np.full((DB, DB), -np.inf)
    U = fu(V) * DB
    W_ = fv(V) * DB
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
face = np.zeros((TS, TS), bool)  # vùng mặt (đầu, quay về trước) — giữ ảnh gốc khi ép màu
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
    cols, wts = [], []
    for k, (dirv, fu, fd, fv) in VIEWS.items():
        w = np.clip(Nn @ dirv, 0, 1) ** MU
        if k == 'truoc':  # đầu: ảnh trước nhìn quá xiên (mép tóc sát mặt) chiếu trượt sang bên đầu thành vệt cong đen
            w = w * np.where(P[:, 1] > neck_y, np.clip((Nn[:, 2] - 0.3) / 0.2, 0, 1), 1)
        u = fu(P)
        v = fv(P)
        di = np.clip((v * DB).astype(int), 0, DB - 1)
        dj = np.clip((u * DB).astype(int), 0, DB - 1)
        vis = fd(P) >= depth[k][di, dj] - eps
        w = w * vis
        ii = np.clip((v * IH).astype(int), 0, IH - 1)
        jj = np.clip((u * IW).astype(int), 0, IW - 1)
        c = imgs[k][ii, jj]
        acc += w[:, None] * c
        wsum += w
        cols.append(c)
        wts.append(w)
    # điểm không ảnh nào thấy rõ (dưới nách, hõm, chỉ thấy rất xiên) → để trống, lát nữa loang màu từ vùng áo bên cạnh
    # trong cùng mảnh UV (trước đây lấy đại ảnh gần nhất không kiểm che khuất → dính màu tay áo / nền)
    seen = wsum >= 0.02
    col = acc / np.maximum(wsum, 1e-6)[:, None]
    # các ảnh bất đồng mạnh (một ảnh là da, ảnh kia là tóc — chân tóc / thái dương lệch vị trí) → không trộn (trộn ra màu
    # lai nhạt), lấy ảnh nhìn thẳng vào điểm nhất
    Cs = np.stack(cols, 1)
    Ws = np.stack(wts, 1)
    best = Ws.argmax(1)
    cbest = Cs[np.arange(len(P)), best]
    strong = Ws > 0.25 * Ws.max(1, keepdims=True)
    diff = (np.abs(Cs - cbest[:, None, :]).sum(-1) * strong).max(1)
    split = diff > float(opt('bat-dong', '90'))
    # vùng đầu (trên cổ): bất đồng ở chân tóc / thái dương → lấy màu TỐI nhất trong các ảnh mạnh (tóc). Lệch vị trí vài mm
    # là đổi hẳn da ↔ tóc; tóc nhích vào trong trông như tóc mai, còn da lấn vào tóc trông như hói.
    lum = Cs @ np.array([0.299, 0.587, 0.114])
    darkest = Cs[np.arange(len(P)), np.where(strong, lum, 1e9).argmin(1)]
    head_pt = P[:, 1] > neck_y
    # trên đầu chỉ cắt cứng khi bất đồng về LOẠI (ảnh này tóc, ảnh kia da). Da – da chỉ lệch sáng tối (ánh sáng mỗi ảnh
    # khác nhau) → trộn mượt; cắt cứng ở đó thành đường ranh chéo qua má khi nhìn 3/4
    dark_any = (np.where(strong, lum, 1e9) < 90).any(1)
    light_any = (np.where(strong, lum, -1) >= 90).any(1)
    head_split = head_pt & dark_any & light_any
    body_split = split & ~head_pt
    col[head_split] = darkest[head_split]
    col[body_split] = cbest[body_split]
    if '--khong-chan-toc' not in args:
        vf = VIEWS['truoc'][3](P)
        # bỏ tóc mai: dưới chân tóc, ảnh trước thấy da (và thấy được điểm này) → chỉ trộn các ảnh có màu da; vệt tóc mai
        # trước tai trong ảnh bên không vẽ lên má (người dùng 2026-11-12: "phần màu đen ở mai đáng ra không có")
        sk = is_skin(Cs)
        cheek = head_pt & (vf >= hair_v) & (Ws[:, 0] > 0) & sk[:, 0] & ~is_skin(col)
        ws = Ws * sk
        col[cheek] = (ws[cheek, :, None] * Cs[cheek]).sum(1) / np.maximum(ws[cheek].sum(1), 1e-6)[:, None]
        above = head_pt & (vf < hair_v) & is_skin(col)
        dk = (darkest @ np.array([0.299, 0.587, 0.114])) < 90
        col[above] = np.where(dk[above, None], darkest[above], HAIR)
    sub = tex[y0:y0 + inside.shape[0], x0:x0 + inside.shape[1]]
    hit = np.zeros_like(inside)
    hit[inside] = seen
    sub[hit] = col[seen]
    cov[y0:y0 + inside.shape[0], x0:x0 + inside.shape[1]] |= hit
    fmask = np.zeros_like(inside)
    fmask[inside] = (P[:, 1] > minY + 0.62 * H) & (Nn[:, 2] > 0.15)
    face[y0:y0 + inside.shape[0], x0:x0 + inside.shape[1]] |= fmask
print('nuong xong, phu', round(cov.mean() * 100), '% texture')

# ---------- ép bảng màu (bỏ bóng / vệt sáng sẵn trong ảnh → màu phẳng sạch kiểu đồ chơi) ----------
def ycc(a, lw=0.45):
    y = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    return np.stack([y * lw, a[..., 2] - y, a[..., 0] - y], -1)  # độ sáng nhẹ ký → bóng đổ không đổi màu

auto_k = int(opt('tu-bang', '0'))
pal = None
if palette_arg:
    pal = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in palette_arg.split(',')], np.float32)
elif auto_k:
    # --tu-bang N: gom N màu chủ đạo từ chính bộ ảnh (điểm nhân vật, bỏ nền) bằng k-means — sáng / tối cùng màu về một cụm
    pix = []
    for k in VIEWS:
        a = imgs[k].reshape(-1, 3)
        pix.append(a[np.abs(a - a[0]).sum(1) > 40][::7])
    pix = np.concatenate(pix)
    feat = ycc(pix, 0.35)
    rng = np.random.default_rng(1)
    cent = feat[rng.choice(len(feat), auto_k, replace=False)]
    for _ in range(25):
        lab = np.argmin(((feat[:, None, :] - cent[None]) ** 2).sum(-1), 1)
        cent = np.array([feat[lab == j].mean(0) if (lab == j).any() else cent[j] for j in range(auto_k)])
    # màu đại diện = phần SÁNG của cụm (phân vị 60–80 % độ sáng): trung vị dính bóng đổ → áo xám, tóc xám, trông bẩn
    def lit(c):
        lum = c @ np.array([0.299, 0.587, 0.114])
        lo, hi = np.percentile(lum, 60), np.percentile(lum, 80)
        sel = c[(lum >= lo) & (lum <= hi)]
        return sel.mean(0) if len(sel) else c.mean(0)
    pal = np.array([lit(pix[lab == j]) if (lab == j).any() else [0, 0, 0] for j in range(auto_k)], np.float32)
    print('bang mau tu dong:', ' '.join('#%02x%02x%02x' % tuple(int(c) for c in p) for p in pal))
if pal is not None:
    snap = cov & ~face if '--giu-mat' in args or auto_k else cov  # mặt giữ ảnh gốc (mắt, lông mày, má)
    lw = float(opt('do-sang', '0.35'))  # trọng số độ sáng khi so màu: cao hơn để tách màu cùng tông khác độ đậm (đai / viền)
    t = ycc(tex[snap], lw)
    d2 = ((t[:, None, :] - ycc(pal, lw)[None]) ** 2).sum(-1)
    near = np.argmin(d2, axis=1)
    # màu lệch xa mọi màu trong bảng (ngọc xanh, trâm vàng, miệng) → giữ nguyên, không ép
    far = d2[np.arange(len(near)), near] > float(opt('xa', '900'))
    idx_snap = np.flatnonzero(snap)
    keep_far = np.zeros(cov.shape, bool)
    keep_far.flat[idx_snap[far]] = True
    snap = snap & ~keep_far
    near = near[~far]
    flat = tex.copy()
    flat[snap] = pal[near]
    img = Image.fromarray(flat.clip(0, 255).astype(np.uint8)).filter(ImageFilter.ModeFilter(3))
    flat = np.asarray(img).astype(np.float32)
    tex[snap] = flat[snap]
    print('ep', len(pal), 'mau,', int(snap.sum()), 'diem; giu mat', int((cov & face).sum()), 'diem')

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
