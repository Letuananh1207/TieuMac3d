#!/usr/bin/env bash
# Vỏ gọi gemini_anh.py bằng Python riêng (venv ngoài repo) — tạo ảnh Gemini tự động từ phiếu (V-20261116-98).
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh cai                      # tạo venv + cài gói ghim (một lần)
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh kiem                     # thử cookie
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh tao <phiếu.md> [--ban 3] [--goc truoc,trai] [--mau truoc=2] [--thu]
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh so <tên>
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh chot <tên> truoc=2,trai=1,sau=3,phai=lat-trai
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh sua <tên> <góc> "<lời sửa>" [--tu 2]
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh test                     # test không mạng
# Hướng dẫn + dạng khối câu lệnh trong phiếu: .claude/skills/ui-design/references/gemini.md
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOC="${GEMINI_GOC:-/c/ai3d/gemini}"
# venv Windows (Scripts/python.exe) hoặc macOS / Linux (bin/python) — chạy được ở mọi máy của dự án.
if [ -n "${GEMINI_PY:-}" ]; then PY="$GEMINI_PY"
elif [ -x "$GOC/venv/Scripts/python.exe" ] || [ ! -d "$GOC/venv/bin" ] && [ "${OS:-}" = "Windows_NT" ]; then
  PY="$GOC/venv/Scripts/python.exe"
else PY="$GOC/venv/bin/python"; fi
export PYTHONIOENCODING=utf-8 PYTHONUTF8=1 PYTHONDONTWRITEBYTECODE=1

# Python ≥ 3.10 có trên máy: py -3.11 → py -3 → python3 → python.
tim_python() {
  local c
  for c in "py -3.11" "py -3" "python3" "python"; do
    if $c -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' >/dev/null 2>&1; then echo "$c"; return 0; fi
  done
  echo "Không tìm thấy Python ≥ 3.10 — cài Python 3.11+ rồi chạy lại." >&2; return 1
}

if [ "${1:-}" = "cai" ]; then
  mkdir -p "$GOC"
  if [ ! -x "$PY" ]; then BASE="$(tim_python)"; $BASE -m venv "$GOC/venv"; fi
  "$PY" -m pip install -q --upgrade pip
  "$PY" -m pip install -q -r "$HERE/gemini-requirements.txt"
  "$PY" -m pip list 2>/dev/null | grep -i -E "gemini|pillow|numpy"
  echo "Xong. Đặt cookie: $GOC/cookie.json (xem references/gemini.md), rồi: gemini-anh.sh kiem"
  exit 0
fi
if [ ! -x "$PY" ]; then
  echo "Chưa có Python riêng ($PY). Chạy: bash .claude/skills/ui-design/scripts/gemini-anh.sh cai" >&2
  exit 2
fi
if [ "${1:-}" = "test" ]; then
  shift
  exec "$PY" -m pytest -q -p no:cacheprovider "$HERE/test_gemini_anh.py" "$@"
fi
exec "$PY" "$HERE/gemini_anh.py" "$@"
