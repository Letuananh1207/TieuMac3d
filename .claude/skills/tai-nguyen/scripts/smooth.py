# Làm mịn + giảm tam giác giữ dáng cho model Hunyuan (thay bước simplify của model:clean khi cần mặt mịn).
# Chạy bằng Python của gói Hunyuan (có pymeshlab, trimesh):
#   /c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe -s smooth.py <vào.glb> <ra.glb> [--tam-giac 16000]
#        [--min 6] [--giu-manh 0.002]
# 1) bỏ mảnh vụn trôi nổi (< giu-manh × số mặt), 2) Taubin làm mịn (không teo dáng như Laplace thường),
# 3) giảm tam giác quadric edge collapse (giữ dáng, giữ đường viền), 4) Taubin nhẹ lần hai, 5) xuất glb.
import sys
import tempfile
import os
import pymeshlab
import trimesh

args = sys.argv[1:]
def opt(name, default):
    return args[args.index('--' + name) + 1] if '--' + name in args else default

src, out = args[0], args[1]
target = int(opt('tam-giac', '16000'))
steps = int(opt('min', '6'))
keep = float(opt('giu-manh', '0.002'))

scene = trimesh.load(src, force='scene')
mesh = trimesh.util.concatenate([g for g in scene.dump() if isinstance(g, trimesh.Trimesh)])
tmp = tempfile.mkdtemp()
ply_in = os.path.join(tmp, 'in.ply')
ply_out = os.path.join(tmp, 'out.ply')
mesh.export(ply_in)

ms = pymeshlab.MeshSet()
ms.load_new_mesh(ply_in)
f0 = ms.current_mesh().face_number()
ms.meshing_remove_duplicate_vertices()
ms.meshing_remove_connected_component_by_face_number(mincomponentsize=max(30, int(f0 * keep)))
ms.apply_coord_taubin_smoothing(stepsmoothnum=steps * 2, lambda_=0.5, mu=-0.53)
ms.meshing_decimation_quadric_edge_collapse(
    targetfacenum=target, qualitythr=0.5, preserveboundary=True, preservenormal=True,
    preservetopology=True, optimalplacement=True, planarquadric=True, autoclean=True)
ms.apply_coord_taubin_smoothing(stepsmoothnum=steps, lambda_=0.5, mu=-0.53)
ms.save_current_mesh(ply_out, save_vertex_normal=False)
f1 = ms.current_mesh().face_number()

res = trimesh.load(ply_out, force='mesh')
res.export(out)
print(f'smooth: {f0} -> {f1} tam giac -> {out}')
