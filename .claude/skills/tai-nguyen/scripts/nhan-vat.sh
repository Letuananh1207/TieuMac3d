#!/usr/bin/env bash
# Luồng chuẩn tạo nhân vật từ bộ ảnh 4 góc (chốt 2026-11-12.12) — một lệnh từ ảnh tới .glb + ảnh so sánh:
#   bash .claude/skills/tai-nguyen/scripts/nhan-vat.sh <tên> <thư mục ra> [--seed 1234,7] [--nhanh] [--dat]
# Vào : design/models/anh/<tên>-{truoc,trai,sau,phai}.png (chuẩn hoá theo phiếu 2026-11-12-anh-nhan-vat-3d).
# Làm : mv_gen.py --day-du (Hunyuan3D-2mv đầy đủ, ~7 phút / seed) → smooth.py --min 2 → bake.py --jpg
#       → model:clean --khong-sang  (mỗi seed một bản <ra>/<tên>-s<seed>-final.glb)
#       → chụp trên Canvas 3D: 4 góc thẳng cạnh ảnh thiết kế + 6 góc cận → <ra>/<tên>-s<seed>-so.png, -6goc.png
# --nhanh: bản turbo (~30 s / seed) để thử ảnh trước khi chạy thật.
# --dat  : chỉ một seed → chép bản đó vào design/models/<tên>.glb (không có thì design/models/ giữ nguyên).
# Chụp mượn chỗ nhan-vat.glb (Canvas 3D chỉ nạp file đó) rồi trả lại bản cũ.
set -e
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PY=/c/ai3d/Hunyuan3D2_WinPortable/python_standalone/python.exe
SC="$ROOT/.claude/skills/tai-nguyen/scripts"
TEN=$1; OUT=$2; shift 2 || { echo "Cach dung: nhan-vat.sh <ten> <thu muc ra> [--seed 1234,7] [--nhanh] [--dat]"; exit 1; }
SEEDS=1234,7; FULL=--day-du; DAT=0
while [ $# -gt 0 ]; do
  case $1 in
    --seed) SEEDS=$2; shift ;;
    --nhanh) FULL= ;;
    --dat) DAT=1 ;;
  esac; shift
done
mkdir -p "$OUT"
cd "$ROOT"
for k in truoc trai sau phai; do [ -f "design/models/anh/$TEN-$k.png" ] || { echo "thieu anh design/models/anh/$TEN-$k.png → soan phieu /ui-design"; exit 1; }; done

echo "== 1. dung hinh ($SEEDS ${FULL:-turbo})"
$PY -s "$SC/mv_gen.py" design/models/anh "$TEN" "$OUT/tho" $FULL --seed "$SEEDS" 2>&1 | grep -E "^seed|loi|Error" || true

GLB="$ROOT/design/models/nhan-vat.glb"; BAK="$OUT/.nhan-vat-goc.glb"; cp "$GLB" "$BAK"
trap 'cp "$BAK" "$GLB"' EXIT
C="/c/Program Files/Google/Chrome/Application/chrome.exe"
F="--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --virtual-time-budget=2500 --window-size=420,420"
U="http://localhost:4174/design.html?chup&nhan-vat=glb&nv=0,80"
ok=""
for sd in ${SEEDS//,/ }; do
  T="$OUT/$TEN-s$sd"
  raw="$OUT/tho/$TEN-mv${FULL:+full}-s$sd.glb"; [ -f "$raw" ] || raw=
  [ -n "$raw" ] || { echo "seed $sd: khong co hinh (loi FlashVDM? thu seed khac)"; continue; }
  echo "== seed $sd: 2. lam min · 3. nuong mau · 4. nen"
  $PY -s "$SC/smooth.py" "$raw" "$T-min.glb" --min 2 | tail -1
  $PY -s "$SC/bake.py" "$T-min.glb" design/models/anh "$TEN" "$T-mau.glb" --jpg 2>&1 | grep -E "Error|->"
  (cd web && npm run -s model:clean -- "$T-mau.glb" --ra "$T-final.glb" --khong-sang 2>&1 | grep -E "Ra:|VUOT|VƯỢT")
  echo "== seed $sd: 5. chup so sanh"
  cp "$T-final.glb" "$GLB"
  (cd web && npm run -s build:design >/dev/null 2>&1)
  (cd web && npx vite preview --outDir dist-design --port 4174 --strictPort >/dev/null 2>&1 &)
  for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:4174/design.html && break; sleep 1; done
  i=1; for c in 0,1.2,83.6 3.6,1.2,80 0,1.2,76.4 -3.6,1.2,80; do "$C" $F --screenshot="$T-t$i.png" "$U&cam=$c&tam=0,80" 2>/dev/null; i=$((i+1)); done
  i=1; for c in 0.2,2.0,81.9 1.6,2.0,81.3 -1.6,2.0,81.3 -2.0,2.0,80.6 2.0,2.0,80.6 0,1.15,83.6; do "$C" $F --screenshot="$T-c$i.png" "$U&cam=$c&tam=0,80" 2>/dev/null; i=$((i+1)); done
  powershell -NoProfile -Command "\$p=(Get-NetTCPConnection -LocalPort 4174 -State Listen -EA SilentlyContinue).OwningProcess|Select -Unique; if(\$p){Stop-Process -Id \$p -Confirm:\$false}"
  python - "$T" "$TEN" <<'EOF'
import sys
from PIL import Image
T, ten = sys.argv[1], sys.argv[2]
W = Image.new('RGB', (1680, 840), 'white')
for i, k in enumerate(['truoc', 'trai', 'sau', 'phai']):
    W.paste(Image.open(f'design/models/anh/{ten}-{k}.png').convert('RGB').resize((420, 420)), (i * 420, 0))
    W.paste(Image.open(f'{T}-t{i + 1}.png'), (i * 420, 420))
W.save(f'{T}-so.png')
W = Image.new('RGB', (1260, 840), 'white')
for i in range(6):
    W.paste(Image.open(f'{T}-c{i + 1}.png'), ((i % 3) * 420, (i // 3) * 420))
W.save(f'{T}-6goc.png')
EOF
  echo "-> $T-final.glb · $T-so.png · $T-6goc.png"
  ok="$ok $sd"
done
n=$(echo $ok | wc -w)
if [ "$DAT" = 1 ] && [ "$n" = 1 ]; then
  trap - EXIT
  cp "$OUT/$TEN-s${ok# }-final.glb" "$ROOT/design/models/$TEN.glb"
  [ "$TEN" = nhan-vat ] || cp "$BAK" "$GLB"
  echo "da dat design/models/$TEN.glb (seed${ok}) — nho: LICENSES.md, CHANGELOG, cd web && npm run build"
fi
