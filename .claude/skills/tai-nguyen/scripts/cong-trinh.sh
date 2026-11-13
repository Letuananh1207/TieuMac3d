#!/usr/bin/env bash
# Luồng công trình / đồ vật từ bộ ảnh 4 góc (2026-11-13, bản anh em của nhan-vat.sh):
#   bash .claude/skills/tai-nguyen/scripts/cong-trinh.sh <tên> <thư mục ra> [--seed 1234,7] [--nhanh] [--min 1]
#        [--tam-giac 20000] [--nuong "<cờ bake.py>"] [--bo-dung] [--dat]
# Vào : design/models/anh/<tên>-{truoc,trai,sau,phai}.png (vật đặt trên đất, nhìn ngang, 4 góc cùng tâm xoay + tỉ lệ).
# Làm : mv_gen.py --day-du → smooth.py (làm mịn NHẸ — cạnh mái / cột phải giữ sắc; trần 20 000 tam giác theo 0003)
#       → bake.py --cong-trinh --jpg (không dò cổ / tóc) → model:clean --loai cong-trinh --khong-sang
#       → xem.py: 4 góc thẳng cạnh ảnh thiết kế → <ra>/<tên>-s<seed>-so.png
# Khác nhan-vat.sh: không chụp trên Canvas 3D (Canvas 3D chỉ nạp .glb làm nhân vật — xương tự gắn sẽ uốn công trình).
# --bo-dung: đã có <ra>/tho/*.glb từ lần trước → bỏ bước dựng hình (chỉ làm mịn / nướng lại).
# --dat  : chỉ một seed → chép vào design/models/<tên>.glb.
set -e
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PY=/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe
SC="$ROOT/.claude/skills/tai-nguyen/scripts"
TEN=$1; OUT=$2; shift 2 || { echo "Cach dung: cong-trinh.sh <ten> <thu muc ra> [--seed 1234,7] [--nhanh] [--dat]"; exit 1; }
SEEDS=1234,7; FULL=--day-du; DAT=0; BK=; MIN=1; TRI=20000; GEN=1
while [ $# -gt 0 ]; do
  case $1 in
    --seed) SEEDS=$2; shift ;;
    --nhanh) FULL= ;;
    --dat) DAT=1 ;;
    --nuong) BK=$2; shift ;;
    --min) MIN=$2; shift ;;
    --tam-giac) TRI=$2; shift ;;
    --bo-dung) GEN=0 ;;
  esac; shift
done
mkdir -p "$OUT"
cd "$ROOT"
for k in truoc trai sau phai; do [ -f "design/models/anh/$TEN-$k.png" ] || { echo "thieu anh design/models/anh/$TEN-$k.png → soan phieu /ui-design"; exit 1; }; done

if [ "$GEN" = 1 ]; then
  echo "== 1. dung hinh ($SEEDS ${FULL:-turbo})"
  $PY -s "$SC/mv_gen.py" design/models/anh "$TEN" "$OUT/tho" $FULL --seed "$SEEDS" 2>&1 | grep -E "^seed|loi|Error" || true
fi
ok=""
for sd in ${SEEDS//,/ }; do
  T="$OUT/$TEN-s$sd"
  raw="$OUT/tho/$TEN-mv${FULL:+full}-s$sd.glb"; [ -f "$raw" ] || { echo "seed $sd: khong co hinh (thu seed khac)"; continue; }
  echo "== seed $sd: 2. lam min · 3. nuong mau · 4. nen"
  $PY -s "$SC/smooth.py" "$raw" "$T-min.glb" --min "$MIN" --tam-giac "$TRI" | tail -1
  $PY -s "$SC/bake.py" "$T-min.glb" design/models/anh "$TEN" "$T-mau.glb" --cong-trinh --jpg $BK 2>&1 | grep -E "Error|->|khop|phu"
  (cd web && npm run -s model:clean -- "$T-mau.glb" --loai cong-trinh --ra "$T-final.glb" --khong-sang 2>&1 | grep -E "Ra:|VUOT|VƯỢT")
  echo "== seed $sd: 5. anh so sanh"
  $PY -s "$SC/xem.py" "$T-mau.glb" design/models/anh "$TEN" "$T-so.png"
  echo "-> $T-final.glb · $T-so.png"
  ok="$ok $sd"
done
n=$(echo $ok | wc -w)
if [ "$DAT" = 1 ] && [ "$n" = 1 ]; then
  cp "$OUT/$TEN-s${ok# }-final.glb" "$ROOT/design/models/$TEN.glb"
  echo "da dat design/models/$TEN.glb (seed${ok}) — nho: LICENSES.md, CHANGELOG"
fi
