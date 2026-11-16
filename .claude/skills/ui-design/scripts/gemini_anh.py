# Tạo ảnh Gemini tự động cho phiếu ảnh (bộ ảnh 4 góc model Tripo, ảnh concept, hình minh hoạ) — V-20261116-98.
#
# Dùng thư viện KHÔNG chính thức gemini_webapi (https://github.com/HanaokaYuzu/Gemini-API, AGPL-3.0) gọi web
# gemini.google.com bằng cookie tài khoản Gemini Pro của người dùng. Rủi ro (người dùng đã biết, 2026-11-16): Google có thể
# chặn / khoá tài khoản, thư viện hỏng khi Google đổi web. Chỉ là công cụ phát triển — không vào app, không vào repo ngoài
# script này. Python riêng: venv C:/ai3d/gemini/venv (gói ghim: gemini-requirements.txt). Gọi qua vỏ gemini-anh.sh.
#
# Lệnh (chi tiết: ../references/gemini.md):
#   doc  <phiếu.md>                                  đọc phiếu, in các khối câu lệnh (không mạng)
#   tao  <phiếu.md> [--ban 3] [--goc a,b] [--mau truoc=2] [--mo-hinh <tên>] [--nghi 20] [--thu]
#   so   <tên>                                       trang so sánh góc × bản → ra/<tên>/so.png
#   chot <tên> truoc=2,trai=1,phai=lat-trai [--repo <gốc repo>]   chép bản chọn vào design/ + chuẩn hoá
#   sua  <tên> <góc> "<lời sửa>" [--tu <n>] [--ban 1]
#   kiem                                             thử cookie, in tài khoản + model
#
# Cookie: C:/ai3d/gemini/cookie.json (hoặc biến GEMINI_PSID / GEMINI_PSIDTS, GEMINI_COOKIE_FILE) — không bao giờ in ra.
import argparse
import asyncio
import json
import os
import random
import re
import shutil
import sys
import time
from datetime import date
from pathlib import Path

GOC_GEMINI = Path(os.environ.get('GEMINI_GOC', 'C:/ai3d/gemini'))
RA = Path(os.environ.get('GEMINI_RA', str(GOC_GEMINI / 'ra')))
COOKIE_FILE = Path(os.environ.get('GEMINI_COOKIE_FILE', str(GOC_GEMINI / 'cookie.json')))
REPO = Path(__file__).resolve().parents[4]
LOAI = ('nhan-vat', 'cong-trinh', 'concept', 'hinh')
NEN_MAC_DINH = '#DDDDDD'

HUONG_DAN_COOKIE = f"""
Chưa có / hết hạn cookie Gemini. Cách lấy (Chrome, tài khoản có gói Gemini Pro):
  1. Mở https://gemini.google.com và đăng nhập đúng tài khoản Pro (thử tạo một câu trả lời cho chắc).
  2. F12 → thẻ Application → Storage → Cookies → https://gemini.google.com
     (không thấy thì chọn https://www.google.com). Ô lọc gõ: __Secure-1PSID
  3. Chép giá trị hai dòng: __Secure-1PSID và __Secure-1PSIDTS (cột Value, chép trọn).
  4. Tạo file {COOKIE_FILE} (ngoài repo — KHÔNG để trong thư mục dự án), nội dung:
       {{"__Secure-1PSID": "<giá trị>", "__Secure-1PSIDTS": "<giá trị>"}}
  5. Chạy lại: bash .claude/skills/ui-design/scripts/gemini-anh.sh kiem
Lưu ý: thư viện tự làm mới __Secure-1PSIDTS (lưu ở {GOC_GEMINI / 'cache'}); lỗi lại sau vài ngày → lấy lại cả hai.
Đăng xuất Gemini trên trình duyệt làm cookie mất hiệu lực. Đừng dán cookie vào chat / commit.
"""


class Loi(Exception):
    """Lỗi báo người dùng (in gọn, không vết)."""


class LoiCookie(Loi):
    pass


# ---------------------------------------------------------------- đọc phiếu

KHOI = re.compile(r'^```gemini(?P<cau_hinh>-cau-hinh)?[ \t]*(?P<ten>[\w-]*)[ \t]*\n(?P<than>.*?)^```[ \t]*$',
                  re.M | re.S)


def _khoa_gia_tri(dong):
    dong = re.split(r'\s#\s', dong + ' ', maxsplit=1)[0]  # chú thích " # …" (giữ được "nen: #DDDDDD")
    m = re.match(r'^([\w-]+)\s*:\s*(.*)$', dong.strip())
    return (m.group(1).lower(), m.group(2).strip()) if m else (None, None)


def _ds(giatri):
    return [x.strip() for x in re.split(r'[,;]', giatri) if x.strip()]


def doc_phieu(duong_dan):
    """Phiếu → {ten, loai, cau_hinh, chung, goc: [{ten, cau_lenh, tham_chieu, mau}]}.

    Khối trong phiếu (ngoài khối ```text "Dán vào canvas"):
      ```gemini-cau-hinh   ten: / loai: nhan-vat|cong-trinh|concept|hinh / tham-chieu: a.png, b.png / mau: <góc> / ...
      ```gemini chung      đoạn chung ghép trước câu lệnh mọi góc (tuỳ)
      ```gemini <góc>      câu lệnh một góc; dòng đầu được phép `tham-chieu: …` và `mau: <góc>|khong`
    """
    p = Path(duong_dan)
    noi_dung = p.read_text(encoding='utf-8').replace('\r\n', '\n')
    cau_hinh, chung, goc = {}, '', []
    for m in KHOI.finditer(noi_dung):
        than = m.group('than').strip('\n')
        if m.group('cau_hinh'):
            for dong in than.splitlines():
                k, v = _khoa_gia_tri(dong)
                if k:
                    cau_hinh[k] = v
            continue
        ten = m.group('ten')
        if not ten:
            raise Loi(f'{p.name}: khối ```gemini thiếu tên góc (vd. ```gemini truoc)')
        if ten == 'chung':
            chung = than.strip()
            continue
        tham_chieu, mau, dong_con = [], None, []
        dau = True
        for dong in than.splitlines():
            k, v = _khoa_gia_tri(dong) if dau else (None, None)
            if k in ('tham-chieu', 'mau'):
                if k == 'tham-chieu':
                    tham_chieu += _ds(v)
                else:
                    mau = v
                continue
            dau = False
            dong_con.append(dong)
        cau = '\n'.join(dong_con).strip()
        if not cau:
            raise Loi(f'{p.name}: khối ```gemini {ten} trống')
        if any(g['ten'] == ten for g in goc):
            raise Loi(f'{p.name}: góc "{ten}" lặp hai khối')
        goc.append({'ten': ten, 'cau_lenh': cau, 'tham_chieu': tham_chieu, 'mau': mau})
    if not goc:
        cu = 'có khối "Dán vào canvas" nhưng ' if '```text' in noi_dung else ''
        raise Loi(f'{p.name}: {cu}chưa có khối câu lệnh ```gemini <góc>``` — phiếu cũ: thêm mục "## Câu lệnh Gemini" '
                  f'theo .claude/skills/ui-design/references/gemini.md rồi chạy lại.')
    stem = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', p.stem)
    loai_doan = 'concept' if stem.startswith('concept-') else ('hinh' if stem.startswith('hinh-') else 'nhan-vat')
    ten = cau_hinh.get('ten') or re.sub(r'^(anh|concept|hinh)-', '', stem)
    loai = cau_hinh.get('loai', loai_doan)
    if loai not in LOAI:
        raise Loi(f'{p.name}: loai "{loai}" không hợp lệ ({" | ".join(LOAI)})')
    if not re.fullmatch(r'[a-z0-9-]+', ten):
        raise Loi(f'{p.name}: tên "{ten}" phải không dấu, chữ thường, nối gạch')
    return {'phieu': str(p), 'ten': ten, 'loai': loai, 'cau_hinh': cau_hinh, 'chung': chung, 'goc': goc}


def cau_lenh_day_du(phieu, g, co_mau):
    phan = [phieu['chung'], g['cau_lenh']] if phieu['chung'] else [g['cau_lenh']]
    if co_mau:
        phan.append(f'The attached image named "{co_mau}" shows the SAME subject from another angle: keep the identical '
                    'design, colours, proportions, scale, framing and rendering style — only the viewing angle changes.')
    phan.append('Generate exactly ONE image now. Do not ask questions. No text, no watermark.')
    return '\n\n'.join(phan)


def tim_file(ten, phieu_dir):
    for goc in (Path(ten), REPO / ten, Path(phieu_dir) / ten):
        if goc.is_file():
            return goc.resolve()
    raise Loi(f'không thấy ảnh tham chiếu: {ten}')


# ---------------------------------------------------------------- trạng thái ra/<tên>/

def thu_muc(ten):
    return RA / ten


def doc_trang_thai(ten):
    f = thu_muc(ten) / 'tao.json'
    if not f.is_file():
        raise Loi(f'chưa có ảnh nháp "{ten}" ({f}) — chạy `tao <phiếu>` trước')
    return json.loads(f.read_text(encoding='utf-8'))


def ghi_trang_thai(tt):
    d = thu_muc(tt['ten'])
    d.mkdir(parents=True, exist_ok=True)
    (d / 'tao.json').write_text(json.dumps(tt, ensure_ascii=False, indent=1), encoding='utf-8')


def ban_cua(tt, goc):
    """Các số bản đã có của một góc (theo file thật trên đĩa)."""
    d = thu_muc(tt['ten'])
    so = []
    for f in d.glob(f'{goc}-*.png'):
        m = re.fullmatch(rf'{re.escape(goc)}-(\d+)', f.stem)
        if m:
            so.append(int(m.group(1)))
    return sorted(so)


def file_ban(tt, goc, n):
    return thu_muc(tt['ten']) / f'{goc}-{n}.png'


# ---------------------------------------------------------------- cookie + gọi Gemini

def doc_cookie():
    psid, ts = os.environ.get('GEMINI_PSID'), os.environ.get('GEMINI_PSIDTS')
    if not psid:
        if not COOKIE_FILE.is_file():
            raise LoiCookie(f'không thấy {COOKIE_FILE}.' + HUONG_DAN_COOKIE)
        try:
            du_lieu = json.loads(COOKIE_FILE.read_text(encoding='utf-8-sig'))
        except (OSError, ValueError):
            raise LoiCookie(f'{COOKIE_FILE} không phải JSON hợp lệ.' + HUONG_DAN_COOKIE) from None
        if isinstance(du_lieu, list):  # xuất từ tiện ích kiểu Cookie-Editor: [{name, value}, …]
            du_lieu = {c.get('name'): c.get('value') for c in du_lieu if isinstance(c, dict)}
        if not isinstance(du_lieu, dict):
            raise LoiCookie(f'{COOKIE_FILE} sai dạng.' + HUONG_DAN_COOKIE)
        psid = du_lieu.get('__Secure-1PSID') or du_lieu.get('psid')
        ts = du_lieu.get('__Secure-1PSIDTS') or du_lieu.get('psidts')
    if not psid or not str(psid).strip():
        raise LoiCookie('thiếu __Secure-1PSID.' + HUONG_DAN_COOKIE)
    return str(psid).strip(), (str(ts).strip() if ts else None)


_BI_MAT = []


def che(chuoi):
    """Xoá mọi giá trị cookie khỏi chuỗi trước khi in."""
    s = str(chuoi)
    for v in _BI_MAT:
        if v and len(v) > 6:
            s = s.replace(v, '***')
    return s


def _cai_log(chi_tiet):
    from loguru import logger
    logger.remove()
    logger.add(lambda m: sys.stderr.write(che(m)), level='DEBUG' if chi_tiet else 'WARNING',
               filter=lambda r: r['extra'].get('name') == 'gemini_webapi', format='gemini_webapi | {level} | {message}')


async def mo_client(chi_tiet=False):
    psid, ts = doc_cookie()
    _BI_MAT[:] = [psid, ts or '']
    os.environ.setdefault('GEMINI_COOKIE_PATH', str(GOC_GEMINI / 'cache'))
    Path(os.environ['GEMINI_COOKIE_PATH']).mkdir(parents=True, exist_ok=True)
    try:
        from gemini_webapi import GeminiClient
        from gemini_webapi.exceptions import AuthError
    except ImportError:
        raise Loi('thiếu gói gemini_webapi — chạy `bash .claude/skills/ui-design/scripts/gemini-anh.sh cai`') from None
    _cai_log(chi_tiet)
    client = GeminiClient(psid, ts)
    try:
        await client.init(timeout=300, auto_close=False, auto_refresh=True)
    except AuthError:
        raise LoiCookie('Gemini từ chối cookie (hết hạn / sai tài khoản).' + HUONG_DAN_COOKIE) from None
    except Exception as e:  # mạng, Google đổi web…
        raise Loi(f'không mở được Gemini: {type(e).__name__}: {che(e)}') from None
    from gemini_webapi.constants import AccountStatus
    trang_thai = getattr(client, 'account_status', AccountStatus.AVAILABLE)
    if trang_thai != AccountStatus.AVAILABLE:
        await client.close()
        ten = getattr(trang_thai, 'name', str(trang_thai))
        if trang_thai == AccountStatus.UNAUTHENTICATED:
            raise LoiCookie(f'Gemini coi phiên là chưa đăng nhập ({ten}) — cookie sai / hết hạn.' + HUONG_DAN_COOKIE)
        raise Loi(f'tài khoản Gemini chưa dùng được: {ten} — {getattr(trang_thai, "description", "")} '
                  '(mở gemini.google.com trên trình duyệt xem có cần chấp nhận điều khoản / bị hạn chế không).')
    return client


async def goi_anh(client, cau_lenh, tep, mo_hinh, ra_file, nghi, thu=4):
    """Một lần tạo ảnh, có thử lại. Trả đường dẫn PNG."""
    from gemini_webapi.exceptions import (AuthError, UsageLimitExceededError, TemporarilyBlockedError,
                                          ModelInvalidError)
    from PIL import Image
    nhac = ''
    for lan in range(1, thu + 1):
        try:
            out = await client.generate_content(cau_lenh + nhac, files=[str(f) for f in tep] or None, model=mo_hinh)
            if not out.images:
                raise _KhongAnh(out.text or '')
            tam = await out.images[0].save(path=str(ra_file.parent), filename=f'_{ra_file.stem}', verbose=False)
            with Image.open(tam) as im:
                im.convert('RGB').save(ra_file)
            if Path(tam) != ra_file:
                Path(tam).unlink(missing_ok=True)
            return ra_file
        except AuthError:
            raise LoiCookie('cookie hết hạn giữa chừng.' + HUONG_DAN_COOKIE) from None
        except UsageLimitExceededError:
            raise Loi('hết lượt tạo ảnh của tài khoản (giới hạn gói) — chờ Google đặt lại lượt rồi chạy tiếp '
                      '(ảnh đã tạo vẫn giữ; `tao` chạy lại chỉ thêm bản mới).') from None
        except ModelInvalidError:
            raise Loi(f'model "{mo_hinh}" không dùng được — xem danh sách: gemini-anh.sh kiem') from None
        except TemporarilyBlockedError:
            cho = 120 * lan
            print(f'  ! Google tạm chặn (429) — nghỉ {cho} s rồi thử lại ({lan}/{thu})', flush=True)
        except _KhongAnh as e:
            cho = nghi * lan
            print(f'  ! Gemini trả chữ, không có ảnh: "{che(e)[:160]}" — thử lại ({lan}/{thu})', flush=True)
            nhac = '\n\nPlease create the image directly now (image generation), exactly as described above.'
        except Exception as e:  # mạng / timeout / lỗi phân tích
            cho = nghi * lan
            print(f'  ! lỗi {type(e).__name__}: {che(e)[:200]} — nghỉ {cho} s, thử lại ({lan}/{thu})', flush=True)
        if lan < thu:
            await asyncio.sleep(cho + random.uniform(0, 5))
    raise Loi(f'không tạo được {ra_file.name} sau {thu} lần')


class _KhongAnh(Exception):
    pass


# ---------------------------------------------------------------- tao / sua / kiem

def _phan_tich_chon(chuoi):
    kq = {}
    for phan in _ds(chuoi or ''):
        if '=' not in phan:
            raise Loi(f'"{phan}" phải dạng <góc>=<số> (vd. truoc=2)')
        k, v = (x.strip() for x in phan.split('=', 1))
        kq[k] = v
    return kq


def ke_hoach_tao(phieu, goc_chon, ban, mau_chon, tt):
    """Danh sách lượt gọi [(góc, số bản, [tệp tham chiếu], tên ảnh mẫu|None)] — không mạng, test được."""
    phieu_dir = Path(phieu['phieu']).parent
    ten_goc = [g['ten'] for g in phieu['goc']]
    for g in goc_chon:
        if g not in ten_goc:
            raise Loi(f'phiếu không có góc "{g}" (có: {", ".join(ten_goc)})')
    goc_mau_chung = phieu['cau_hinh'].get('mau', ten_goc[0])
    chung_tc = _ds(phieu['cau_hinh'].get('tham-chieu', ''))
    luot = []
    for g in phieu['goc']:
        if g['ten'] not in goc_chon:
            continue
        tep = [tim_file(t, phieu_dir) for t in chung_tc + g['tham_chieu']]
        goc_mau = g['mau'] if g['mau'] is not None else goc_mau_chung
        anh_mau = None
        if goc_mau and goc_mau != 'khong' and goc_mau != g['ten'] and phieu['loai'] != 'hinh':
            n = mau_chon.get(goc_mau) or (tt.get('chon', {}).get(goc_mau) if tt else None)
            co = ban_cua(tt, goc_mau) if tt else []
            n = int(n) if n else (co[0] if co else None)
            f = file_ban(tt or {'ten': phieu['ten']}, goc_mau, n) if n else None
            if f and f.is_file():
                tep.append(f)
                anh_mau = f.name
            elif goc_mau in goc_chon:
                anh_mau = f'@{goc_mau}'  # tạo trong cùng lượt — gắn bản 1 của góc mẫu sau khi có
            else:
                print(f'  (chưa có ảnh góc mẫu "{goc_mau}" — góc {g["ten"]} tạo không kèm mẫu)')
        dang_co = ban_cua(tt, g['ten']) if tt else []
        bat_dau = (max(dang_co) if dang_co else 0) + 1
        for n in range(bat_dau, bat_dau + ban):
            luot.append((g, n, tep, anh_mau))
    # góc mẫu tạo trước
    luot.sort(key=lambda x: 0 if x[0]['ten'] == goc_mau_chung else 1)
    return luot


async def lenh_tao(a):
    phieu = doc_phieu(a.phieu)
    tt_cu = None
    try:
        tt_cu = doc_trang_thai(phieu['ten'])
    except Loi:
        pass
    tt = tt_cu or {'ten': phieu['ten'], 'chon': {}, 'lich_su': []}
    tt.update({'phieu': str(Path(a.phieu).resolve()), 'loai': phieu['loai'], 'cau_hinh': phieu['cau_hinh'],
               'goc': [g['ten'] for g in phieu['goc']]})
    goc_chon = _ds(a.goc) if a.goc else [g['ten'] for g in phieu['goc']]
    luot = ke_hoach_tao(phieu, goc_chon, a.ban, _phan_tich_chon(a.mau), tt)
    d = thu_muc(phieu['ten'])
    print(f'Phiếu {Path(a.phieu).name} → "{phieu["ten"]}" ({phieu["loai"]}), {len(luot)} ảnh → {d}')
    if a.thu:
        for g, n, tep, mau in luot:
            print(f'--- {g["ten"]}-{n}  tham chiếu: {[Path(t).name for t in tep] or "-"}  mẫu: {mau or "-"}')
            print(cau_lenh_day_du(phieu, g, mau if mau and not mau.startswith('@') else None))
        return
    d.mkdir(parents=True, exist_ok=True)
    ghi_trang_thai(tt)
    client = await mo_client(a.chi_tiet)
    try:
        for i, (g, n, tep, mau) in enumerate(luot):
            if mau and mau.startswith('@'):  # góc mẫu vừa tạo trong lượt này
                co = ban_cua(tt, mau[1:])
                n_mau = int(_phan_tich_chon(a.mau).get(mau[1:], 0)) or (co[0] if co else None)
                f = file_ban(tt, mau[1:], n_mau) if n_mau else None
                if f and f.is_file():
                    tep, mau = tep + [f], f.name
                else:
                    mau = None
            cau = cau_lenh_day_du(phieu, g, mau)
            ra = file_ban(tt, g['ten'], n)
            print(f'[{i + 1}/{len(luot)}] {ra.name} …', flush=True)
            t0 = time.time()
            await goi_anh(client, cau, tep, a.mo_hinh, ra, a.nghi)
            print(f'  xong ({time.time() - t0:.0f} s)', flush=True)
            tt['lich_su'].append({'anh': ra.name, 'cau_lenh': cau, 'tham_chieu': [str(t) for t in tep],
                                  'mo_hinh': a.mo_hinh, 'luc': time.strftime('%Y-%m-%d %H:%M')})
            ghi_trang_thai(tt)
            if i < len(luot) - 1:
                await asyncio.sleep(a.nghi + random.uniform(0, a.nghi / 2))
    finally:
        await client.close()
    print(f'Xong. Trang so sánh: gemini-anh.sh so {phieu["ten"]}')


async def lenh_sua(a):
    tt = doc_trang_thai(a.ten)
    co = ban_cua(tt, a.goc)
    if not co:
        raise Loi(f'chưa có bản nào của góc "{a.goc}"')
    n = a.tu or tt.get('chon', {}).get(a.goc) or co[-1]
    goc_file = file_ban(tt, a.goc, int(n))
    if not goc_file.is_file():
        raise Loi(f'không có {goc_file}')
    cau = (f'Edit the attached image "{goc_file.name}": {a.loi_sua}\n\nKeep EVERYTHING else identical — same subject, '
           'design, colours, proportions, camera angle, framing, scale, lighting and plain background. '
           'Generate exactly ONE edited image now. No text, no watermark.')
    client = await mo_client(a.chi_tiet)
    try:
        for i in range(a.ban):
            moi = max(ban_cua(tt, a.goc)) + 1
            ra = file_ban(tt, a.goc, moi)
            print(f'[{i + 1}/{a.ban}] {ra.name} (sửa từ {goc_file.name}) …', flush=True)
            await goi_anh(client, cau, [goc_file], a.mo_hinh, ra, a.nghi)
            tt.setdefault('lich_su', []).append({'anh': ra.name, 'sua_tu': goc_file.name, 'cau_lenh': cau,
                                                 'mo_hinh': a.mo_hinh, 'luc': time.strftime('%Y-%m-%d %H:%M')})
            ghi_trang_thai(tt)
            if i < a.ban - 1:
                await asyncio.sleep(a.nghi)
    finally:
        await client.close()
    print(f'Xong. Trang so sánh: gemini-anh.sh so {a.ten}')


async def lenh_kiem(a):
    client = await mo_client(a.chi_tiet)
    try:
        trang_thai = getattr(client, 'account_status', None)
        print(f'Cookie dùng được. Trạng thái tài khoản: {getattr(trang_thai, "name", trang_thai)}')
        for m in client.list_models() or []:
            print(f'  model: {m.model_name}  ({m.display_name})')
    finally:
        await client.close()


# ---------------------------------------------------------------- so sánh

def lenh_so(a):
    from PIL import Image, ImageDraw, ImageFont
    tt = doc_trang_thai(a.ten)
    hang = [(g, ban_cua(tt, g)) for g in tt['goc']]
    hang = [(g, b) for g, b in hang if b]
    if not hang:
        raise Loi(f'"{a.ten}": chưa có ảnh nào')
    o, le, chu = 300, 14, 30
    cot = max(len(b) for _, b in hang)
    W, H = max(le + cot * (o + le), 640), chu + 10 + len(hang) * (o + chu + le)
    trang = Image.new('RGB', (W, H), '#F4F1EA')
    ve = ImageDraw.Draw(trang)
    try:
        font = ImageFont.load_default(size=22)
    except TypeError:
        font = ImageFont.load_default()
    ve.text((le, 8), f'{a.ten}: chot {a.ten} <goc>=<so>,...', fill='#24323A', font=font)
    chon = tt.get('chon', {})
    for r, (g, ds) in enumerate(hang):
        y = chu + 10 + r * (o + chu + le)
        for c, n in enumerate(ds):
            x = le + c * (o + le)
            with Image.open(file_ban(tt, g, n)) as im:
                im = im.convert('RGB')
                im.thumbnail((o, o))
                trang.paste(im, (x + (o - im.width) // 2, y + chu + (o - im.height) // 2))
            dang_chon = str(chon.get(g)) == str(n)
            ve.text((x, y + 2), f'{g}={n}' + ('  (dang chon)' if dang_chon else ''), fill='#2B5446' if dang_chon
                    else '#24323A', font=font)
            ve.rectangle([x - 2, y + chu - 2, x + o + 1, y + chu + o + 1], outline='#2B5446' if dang_chon
                         else '#B9B2A4', width=4 if dang_chon else 1)
    ra = thu_muc(a.ten) / 'so.png'
    trang.save(ra)
    print(ra)
    return ra


# ---------------------------------------------------------------- chuẩn hoá + chốt

def _mau_hex(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mat_na_vat(im, sai=14, lech_trung_tinh=12):
    """RGB → mặt nạ vật (True) bằng loang nền từ mép ảnh; nền = màu trung vị viền. Bỏ mảnh nhỏ (sao Gemini)."""
    import numpy as np
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    h, w, _ = a.shape
    vien = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    nen = np.median(vien, axis=0)
    gan = (np.abs(a - nen).max(axis=2) <= sai)
    if (nen.max() - nen.min()) <= lech_trung_tinh:  # nền xám / trắng: chỉ ăn điểm gần trung tính (giữ tóc bạc có ánh màu)
        gan &= (a.max(axis=2) - a.min(axis=2)) <= lech_trung_tinh + 4
    la_nen = _loang_tu_mep(gan)
    vat = ~la_nen
    return _bo_manh_nho(vat)


def _loang_tu_mep(gan):
    """Điểm `gan` nối được với mép ảnh (loang 4 hướng) — lặp giãn trên numpy cho nhanh."""
    import numpy as np
    nen = np.zeros_like(gan)
    nen[0], nen[-1], nen[:, 0], nen[:, -1] = gan[0], gan[-1], gan[:, 0], gan[:, -1]
    while True:
        truoc = nen
        for _ in range(32):  # giãn nhiều bước rồi mới so (so cả mảng tốn hơn giãn)
            t = nen.copy()
            t[1:] |= nen[:-1]
            t[:-1] |= nen[1:]
            t[:, 1:] |= nen[:, :-1]
            t[:, :-1] |= nen[:, 1:]
            nen = t & gan
        if (nen == truoc).all():
            return nen


def _bo_manh_nho(vat, ti_le=0.03):
    """Giữ thành phần liên thông ≥ ti_le × thành phần lớn nhất (tính trên lưới thu nhỏ 1/4)."""
    import numpy as np
    h, w = vat.shape
    k = 4
    nho = vat[:h - h % k, :w - w % k].reshape(h // k, k, w // k, k).any(axis=(1, 3))
    nhan = np.zeros(nho.shape, dtype=np.int32)
    dien_tich = [0]
    hh, ww = nho.shape
    for y0 in range(hh):
        for x0 in np.nonzero(nho[y0] & (nhan[y0] == 0))[0]:
            if nhan[y0, x0]:
                continue
            so = len(dien_tich)
            nhan[y0, x0] = so
            ngan = [(y0, x0)]
            dt = 0
            while ngan:
                y, x = ngan.pop()
                dt += 1
                for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= yy < hh and 0 <= xx < ww and nho[yy, xx] and not nhan[yy, xx]:
                        nhan[yy, xx] = so
                        ngan.append((yy, xx))
            dien_tich.append(dt)
    if len(dien_tich) <= 1:
        return vat
    lon = max(dien_tich)
    giu = np.array([False] + [d >= lon * ti_le for d in dien_tich[1:]])
    giu_nho = giu[nhan]
    giu_lon = np.zeros_like(vat)
    giu_lon[:h - h % k, :w - w % k] = np.repeat(np.repeat(giu_nho, k, axis=0), k, axis=1)
    return vat & giu_lon


def _khung(mat):
    import numpy as np
    ys, xs = np.nonzero(mat)
    if len(xs) == 0:
        raise Loi('ảnh không có vật (toàn nền?)')
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def _truc_chan(mat, khung):
    """Trục thân theo chân: trung bình x của vật trong 8 % đáy khung."""
    import numpy as np
    x0, y0, x1, y1 = khung
    day = mat[max(y0, y1 - max(2, (y1 - y0) // 12)):y1, x0:x1]
    xs = np.nonzero(day)[1]
    return x0 + (xs.mean() if len(xs) else (x1 - x0) / 2)


def chuan_hoa_bo(anh, loai, cau_hinh):
    """{góc: PIL.Image} → {góc: PIL.Image} theo luật phiếu ảnh 4 góc (skill tai-nguyen):
    nhan-vat: vuông 1024, nền trơn, chung hệ số thu, vật cao nhất đỉnh 10 % – đế 90 %, mọi góc đế 90 %, trục chân giữa.
    cong-trinh: vuông 1024, chung hệ số, bề ngang lớn nhất 84 % (8 → 92 %), đáy ở `day` (mặc định 75 %), tâm khung giữa.
    Góc trong `rieng` (mặc định `mat`, cận mặt) chuẩn hoá riêng: vừa 80 %, căn giữa."""
    from PIL import Image
    import numpy as np
    S = 1024
    nen = _mau_hex(cau_hinh.get('nen', NEN_MAC_DINH))
    rieng = set(_ds(cau_hinh.get('rieng', 'mat')))
    du = {}
    for g, im in anh.items():
        im = im.convert('RGB')
        mat = mat_na_vat(im)
        du[g] = (im, mat, _khung(mat))
    chung = [g for g in du if g not in rieng]
    ra = {}

    def dat(g, he_so, tam_x_goc, day_goc_y, day_dich, tam_dich=S / 2):
        im, mat, (x0, y0, x1, y1) = du[g]
        a = np.asarray(im).copy()
        a[~mat] = nen
        anh_vat = Image.fromarray(a)
        alpha = Image.fromarray((mat * 255).astype(np.uint8))
        w2, h2 = max(1, round(im.width * he_so)), max(1, round(im.height * he_so))
        anh_vat = anh_vat.resize((w2, h2), Image.LANCZOS)
        alpha = alpha.resize((w2, h2), Image.LANCZOS)
        trang = Image.new('RGB', (S, S), nen)
        dx = round(tam_dich - tam_x_goc * he_so)
        dy = round(day_dich - day_goc_y * he_so)
        trang.paste(anh_vat, (dx, dy), alpha)
        return trang

    if chung:
        if loai == 'nhan-vat':
            cao = max(du[g][2][3] - du[g][2][1] for g in chung)
            rong = max(du[g][2][2] - du[g][2][0] for g in chung)
            k = min(0.80 * S / cao, 0.94 * S / rong)
            for g in chung:
                kh = du[g][2]
                ra[g] = dat(g, k, _truc_chan(du[g][1], kh), kh[3], 0.90 * S)
        else:
            ngang = float(cau_hinh.get('ngang', 84)) / 100
            day = float(cau_hinh.get('day', 75)) / 100
            rong = max(du[g][2][2] - du[g][2][0] for g in chung)
            cao = max(du[g][2][3] - du[g][2][1] for g in chung)
            k = min(ngang * S / rong, 0.86 * S / cao)
            day = max(day, 0.05 + cao * k / S)  # vật cao: hạ đáy cho đỉnh không chạm mép trên
            day = min(day, 0.95)
            for g in chung:
                x0, y0, x1, y1 = du[g][2]
                ra[g] = dat(g, k, (x0 + x1) / 2, y1, day * S)
    for g in du:
        if g in rieng:
            x0, y0, x1, y1 = du[g][2]
            k = 0.80 * S / max(x1 - x0, y1 - y0)
            ra[g] = dat(g, k, (x0 + x1) / 2, (y0 + y1) / 2, S / 2)
    return ra


def chuan_hoa_hinh(im, co=512, phu=0.84):
    """Hình minh hoạ: tách nền → RGBA vuông `co`, vật vừa `phu` khung, căn giữa (như design/icons/nguon/)."""
    from PIL import Image, ImageFilter
    import numpy as np
    im = im.convert('RGB')
    mat = mat_na_vat(im)
    x0, y0, x1, y1 = _khung(mat)
    alpha = Image.fromarray((mat * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    rgba = im.copy()
    rgba.putalpha(alpha)
    rgba = rgba.crop((x0, y0, x1, y1))
    k = phu * co / max(rgba.width, rgba.height)
    rgba = rgba.resize((max(1, round(rgba.width * k)), max(1, round(rgba.height * k))), Image.LANCZOS)
    trang = Image.new('RGBA', (co, co), (0, 0, 0, 0))
    trang.paste(rgba, ((co - rgba.width) // 2, (co - rgba.height) // 2), rgba)
    return trang


def lenh_chot(a):
    from PIL import Image, ImageOps
    tt = doc_trang_thai(a.ten)
    repo = Path(a.repo) if a.repo else REPO
    chon = _phan_tich_chon(a.chon)
    if not chon:
        raise Loi('cần ít nhất một <góc>=<số>')
    goc_bo = [g for g in tt['goc'] if g in chon] + [g for g in chon if g not in tt['goc']]
    anh, nguon = {}, {}
    for g in goc_bo:
        v = chon[g]
        lat = v.startswith('lat-')
        goc_lay = v[4:] if lat else g
        n = chon.get(goc_lay) if lat else v
        if lat and goc_lay not in chon:
            raise Loi(f'{g}=lat-{goc_lay}: phải chọn cả {goc_lay}=<số>')
        if not str(n).isdigit():
            raise Loi(f'{g}={v}: cần số bản, hoặc lat-<góc> (lật ngang góc kia)')
        f = file_ban(tt, goc_lay, int(n))
        if not f.is_file():
            raise Loi(f'không có bản {f.name} (xem: gemini-anh.sh so {a.ten})')
        with Image.open(f) as im:
            im = im.convert('RGB')
            anh[g] = ImageOps.mirror(im) if lat else im
        nguon[g] = f'{goc_lay}-{n}' + (' lật ngang' if lat else '')
    loai = tt['loai']
    ra = []
    if loai in ('nhan-vat', 'cong-trinh'):
        dich = repo / 'design/models/anh'
        dich.mkdir(parents=True, exist_ok=True)
        for g, im in chuan_hoa_bo(anh, loai, tt.get('cau_hinh', {})).items():
            f = dich / f'{a.ten}-{g}.png'
            im.save(f, optimize=True)
            ra.append(f)
    elif loai == 'concept':
        dich = repo / 'design/concept' / a.ten
        dich.mkdir(parents=True, exist_ok=True)
        for g, im in anh.items():
            f = dich / f'{g}.png'
            im.save(f, optimize=True)
            ra.append(f)
    else:  # hinh: mỗi "góc" là một mã hình
        for g, im in anh.items():
            nguon_f = repo / 'design/icons/nguon' / f'{g}.png'
            nguon_f.parent.mkdir(parents=True, exist_ok=True)
            goc512 = chuan_hoa_hinh(im)
            goc512.save(nguon_f, optimize=True)
            ra.append(nguon_f)
            for co in [160] + ([256] if a.co256 else []):
                x = repo / 'design/icons/xuat' / (f'{g}.webp' if co == 160 else f'{g}@{co}.webp')
                x.parent.mkdir(parents=True, exist_ok=True)
                goc512.resize((co, co), Image.LANCZOS).save(x, 'WEBP', quality=80, method=6)
                ra.append(x)
    tt['chon'] = {**tt.get('chon', {}), **{g: v for g, v in chon.items()}}
    tt['da_chot'] = {'ngay': date.today().isoformat(), 'nguon': nguon, 'file': [str(f) for f in ra]}
    ghi_trang_thai(tt)
    for f in ra:
        try:
            print(f.relative_to(repo).as_posix())
        except ValueError:
            print(f)
    print(f'Dòng LICENSES gợi ý: Google Gemini (gemini_webapi, gói Pro, tự động — {date.today().isoformat()}); '
          f'bản chọn: {", ".join(f"{g}←{s}" for g, s in nguon.items())}; câu lệnh: {Path(tt["phieu"]).name}')
    return ra


# ---------------------------------------------------------------- vào

def lenh_doc(a):
    p = doc_phieu(a.phieu)
    print(f'tên: {p["ten"]} · loại: {p["loai"]} · cấu hình: {p["cau_hinh"] or "-"}')
    for g in p['goc']:
        print(f'--- {g["ten"]}  tham chiếu: {g["tham_chieu"] or "-"}  mẫu: {g["mau"] or "(mặc định)"}')
        print(cau_lenh_day_du(p, g, None))


def main(argv=None):
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(prog='gemini-anh.sh', description='Tạo ảnh Gemini tự động từ phiếu (V-98).')
    sub = ap.add_subparsers(dest='lenh', required=True)
    s = sub.add_parser('doc')
    s.add_argument('phieu')
    s = sub.add_parser('tao')
    s.add_argument('phieu')
    s.add_argument('--ban', type=int, default=3)
    s.add_argument('--goc')
    s.add_argument('--mau', help='bản góc mẫu dùng làm tham chiếu, vd. truoc=2')
    s.add_argument('--mo-hinh', dest='mo_hinh', default=None, help='tên model (mặc định: model mặc định của tài khoản)')
    s.add_argument('--nghi', type=float, default=20, help='giây nghỉ giữa hai lần gọi')
    s.add_argument('--thu', action='store_true', help='chỉ in kế hoạch + câu lệnh, không gọi mạng')
    s.add_argument('--chi-tiet', dest='chi_tiet', action='store_true')
    s = sub.add_parser('so')
    s.add_argument('ten')
    s = sub.add_parser('chot')
    s.add_argument('ten')
    s.add_argument('chon')
    s.add_argument('--repo')
    s.add_argument('--256', dest='co256', action='store_true', help='hình minh hoạ: thêm bản <mã>@256.webp')
    s = sub.add_parser('sua')
    s.add_argument('ten')
    s.add_argument('goc')
    s.add_argument('loi_sua')
    s.add_argument('--tu', type=int)
    s.add_argument('--ban', type=int, default=1)
    s.add_argument('--mo-hinh', dest='mo_hinh', default=None)
    s.add_argument('--nghi', type=float, default=20)
    s.add_argument('--chi-tiet', dest='chi_tiet', action='store_true')
    s = sub.add_parser('kiem')
    s.add_argument('--chi-tiet', dest='chi_tiet', action='store_true')
    a = ap.parse_args(argv)
    try:
        if a.lenh in ('tao', 'sua', 'kiem'):
            if sys.platform == 'win32':
                asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
            asyncio.run({'tao': lenh_tao, 'sua': lenh_sua, 'kiem': lenh_kiem}[a.lenh](a))
        else:
            {'doc': lenh_doc, 'so': lenh_so, 'chot': lenh_chot}[a.lenh](a)
    except LoiCookie as e:
        print(f'LỖI COOKIE: {che(e)}', file=sys.stderr)
        return 3
    except Loi as e:
        print(f'LỖI: {che(e)}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
