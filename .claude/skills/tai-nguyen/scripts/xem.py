# Xem model .glb ở TƯ THẾ GỐC (không gắn xương, không ánh sáng — đúng màu texture không-sáng), chiếu thẳng 4 góc
# cạnh ảnh thiết kế. Dùng cho NPC / tài nguyên chưa có chỗ trong app, hoặc tách lỗi màu khỏi lỗi xương:
#   python.exe -s xem.py <model.glb> <thư mục ảnh> <tên> <ra.png> [--co 420]
# (Python của gói Hunyuan: trimesh. Model đọc được cả file đã nén meshopt? — không: dùng bản trước model:clean.)
import sys
import numpy as np
import trimesh
from PIL import Image

args = sys.argv[1:]
src, folder, name, out = args[:4]
S = int(args[args.index('--co') + 1]) if '--co' in args else 420

m = trimesh.load(src, force='mesh')
V, F = np.asarray(m.vertices), np.asarray(m.faces)
UV = np.asarray(m.visual.uv)
tex = np.asarray(m.visual.material.baseColorTexture.convert('RGB')).astype(np.uint8)
TH, TW = tex.shape[:2]
minY, maxY = V[:, 1].min(), V[:, 1].max()
H = maxY - minY
foot = V[V[:, 1] < minY + 0.08 * H]
fx, fz = foot[:, 0].mean(), foot[:, 2].mean()
s = 0.8 / H
views = {  # như bake.py: u ngang ảnh, độ sâu lớn = gần máy
    'truoc': (lambda P: 0.5 + (P[:, 0] - fx) * s, lambda P: P[:, 2]),
    'trai': (lambda P: 0.5 - (P[:, 2] - fz) * s, lambda P: P[:, 0]),
    'sau': (lambda P: 0.5 - (P[:, 0] - fx) * s, lambda P: -P[:, 2]),
    'phai': (lambda P: 0.5 + (P[:, 2] - fz) * s, lambda P: -P[:, 0]),
}
row = Image.new('RGB', (S * 4, S * 2), (221, 221, 221))
for col, (k, (fu, fd)) in enumerate(views.items()):
    img = np.full((S, S, 3), 221, np.uint8)
    zb = np.full((S, S), -np.inf)
    U = fu(V) * S
    W = (0.1 + 0.8 * (maxY - V[:, 1]) / H) * S
    D = fd(V)
    for f in F:
        x, y = U[f], W[f]
        x0, x1 = int(max(0, np.floor(x.min()))), int(min(S - 1, np.ceil(x.max())))
        y0, y1 = int(max(0, np.floor(y.min()))), int(min(S - 1, np.ceil(y.max())))
        if x1 < x0 or y1 < y0:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        d = (y[1] - y[2]) * (x[0] - x[2]) + (x[2] - x[1]) * (y[0] - y[2])
        if abs(d) < 1e-12:
            continue
        l0 = ((y[1] - y[2]) * (xs - x[2]) + (x[2] - x[1]) * (ys - y[2])) / d
        l1 = ((y[2] - y[0]) * (xs - x[2]) + (x[0] - x[2]) * (ys - y[2])) / d
        l2 = 1 - l0 - l1
        ins = (l0 >= 0) & (l1 >= 0) & (l2 >= 0)
        z = l0 * D[f[0]] + l1 * D[f[1]] + l2 * D[f[2]]
        sub = zb[y0:y1 + 1, x0:x1 + 1]
        win = ins & (z > sub)
        if not win.any():
            continue
        sub[win] = z[win]
        uv = l0[..., None] * UV[f[0]] + l1[..., None] * UV[f[1]] + l2[..., None] * UV[f[2]]
        ti = np.clip(((1 - uv[..., 1]) * TH).astype(int), 0, TH - 1)
        tj = np.clip((uv[..., 0] * TW).astype(int), 0, TW - 1)
        img[y0:y1 + 1, x0:x1 + 1][win] = tex[ti[win], tj[win]]
    row.paste(Image.open(f'{folder}/{name}-{k}.png').convert('RGB').resize((S, S)), (col * S, 0))
    row.paste(Image.fromarray(img), (col * S, S))
row.save(out)
print('->', out)
