# Dựng model từ bộ ảnh nhiều góc bằng Hunyuan3D-2mv (turbo) — không cần máy chủ API.
# Chạy bằng Python của gói Hunyuan (lần đầu tải tencent/Hunyuan3D-2mv về HuggingFaceHub của gói):
#   /c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe -s mv_gen.py <thư mục ảnh> <tên> <ra_thư_mục>
#        [--seed 1234,7] [--octree 384] [--steps 10]
# Ảnh: <tên>-truoc.png (front), -trai.png (left: nhìn từ bên trái nhân vật, mặt quay sang TRÁI ảnh), -sau.png (back),
# -phai.png (right). Thiếu góc nào thì bỏ góc đó. Nền trơn → tự tách nền (rembg của gói).
import os
import sys
import time

R = r'C:\ai3d\Hunyuan3D2_WinPortable'
os.environ.setdefault('HF_HUB_CACHE', R + r'\HuggingFaceHub')
os.environ.setdefault('HY3DGEN_MODELS', R + r'\HuggingFaceHub')
sys.path.insert(0, R + r'\Hunyuan3D-2')

import torch  # noqa: E402
from PIL import Image  # noqa: E402
from hy3dgen.rembg import BackgroundRemover  # noqa: E402
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline  # noqa: E402

args = sys.argv[1:]
def opt(name, default):
    return args[args.index('--' + name) + 1] if '--' + name in args else default

folder, name, out_dir = args[0], args[1], args[2]
seeds = [int(s) for s in opt('seed', '1234').split(',')]
octree = int(opt('octree', '384'))
steps = int(opt('steps', '10'))

views = {'front': 'truoc', 'left': 'trai', 'back': 'sau', 'right': 'phai'}
rembg = BackgroundRemover()
images = {}
for key, suffix in views.items():
    p = os.path.join(folder, f'{name}-{suffix}.png')
    if os.path.exists(p):
        images[key] = rembg(Image.open(p).convert('RGB'))
print('goc:', list(images))

t0 = time.time()
pipe = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
    'tencent/Hunyuan3D-2mv', subfolder='hunyuan3d-dit-v2-mv-turbo', variant='fp16')
pipe.enable_flashvdm()
print(f'nap model {time.time() - t0:.0f} s')
os.makedirs(out_dir, exist_ok=True)
for seed in seeds:
    t1 = time.time()
    try:
        mesh = pipe(image=images, num_inference_steps=steps, octree_resolution=octree, num_chunks=20000,
                    generator=torch.manual_seed(seed), output_type='trimesh')[0]
    except Exception as e:  # FlashVDM đôi khi không thấy bề mặt với một seed → bỏ seed đó
        print(f'seed {seed}: loi {type(e).__name__}: {e}')
        continue
    out = os.path.join(out_dir, f'{name}-mv-s{seed}.glb')
    mesh.export(out)
    print(f'seed {seed}: {len(mesh.faces)} mat, {time.time() - t1:.0f} s -> {out}')
