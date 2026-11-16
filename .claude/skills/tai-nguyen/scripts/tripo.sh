#!/usr/bin/env bash
# Luồng Tripo (chốt 2026-11-16): file GLB người dùng xuất từ Tripo (Retopo Triangle ~16k + Rig humanoid, clip idle/walk)
# → bỏ texture pháp tuyến / nhám, ảnh màu 1024 → model:clean --khong-sang (nén meshopt, giữ xương + clip) → ảnh so thiết kế.
#   bash .claude/skills/tai-nguyen/scripts/tripo.sh <tên> [<file Tripo.glb>] [--ra <thư mục>] [--dat]
# Mặc định file vào: C:/ai3d/tripo/<tên>-lowpoly.glb. --dat: chép bản nén vào design/models/<tên>.glb.
set -e
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PY=/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe
SC="$ROOT/.claude/skills/tai-nguyen/scripts"
TEN=$1; shift || { echo "Cach dung: tripo.sh <ten> [<file.glb>] [--ra <thu muc>] [--dat]"; exit 1; }
IN=/c/ai3d/tripo/$TEN-lowpoly.glb; OUT=/c/ai3d/tripo/ra; DAT=0
while [ $# -gt 0 ]; do
  case $1 in
    --ra) OUT=$2; shift ;;
    --dat) DAT=1 ;;
    *) IN=$1 ;;
  esac; shift
done
[ -f "$IN" ] || { echo "khong thay $IN"; exit 1; }
mkdir -p "$OUT"
INW=$(cygpath -m "$IN"); OUTW=$(cygpath -m "$OUT")
cd "$ROOT/web"
echo "== 1. texture mau 1024, bo phap tuyen / nham"
IN="$INW" RA="$OUTW/$TEN-tex.glb" node --input-type=module -e "
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import sharp from 'sharp';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(process.env.IN);
const r = doc.getRoot();
for (const m of r.listMaterials()) {
  m.setNormalTexture(null); m.setMetallicRoughnessTexture(null);
  const t = m.getBaseColorTexture();
  if (t) { t.setImage(await sharp(Buffer.from(t.getImage())).resize(1024, 1024).jpeg({ quality: 88 }).toBuffer()); t.setMimeType('image/jpeg'); }
}
await doc.transform(prune());
await io.write(process.env.RA, doc);
console.log('xuong', r.listSkins().length, '· clip', r.listAnimations().map((a) => a.getName()).join(', ') || 'khong');
" 2>&1 | grep -v '^prune'
echo "== 2. nen (model:clean --khong-sang)"
npm run -s model:clean -- "$OUTW/$TEN-tex.glb" --ra "$OUTW/$TEN-final.glb" --khong-sang 2>&1 | grep -vE '^prune|^Nhớ'
echo "== 3. anh so thiet ke (tu the goc)"
cd "$ROOT"
$PY -s "$SC/xem.py" "$OUTW/$TEN-tex.glb" design/models/anh "$TEN" "$OUTW/$TEN-so.png" 2>&1 | tail -1
if [ $DAT = 1 ]; then cp "$OUT/$TEN-final.glb" "design/models/$TEN.glb"; echo "-> design/models/$TEN.glb"; fi
