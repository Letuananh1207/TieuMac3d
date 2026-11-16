# Test không mạng cho gemini_anh.py: đọc phiếu, kế hoạch tạo, cookie, trang so sánh, chốt + chuẩn hoá (ảnh giả).
#   bash .claude/skills/ui-design/scripts/gemini-anh.sh test
import importlib
import json
import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))

PHIEU = '''# Phiếu: thử

## Dán vào canvas

```text
không phải khối gemini
```

## Câu lệnh Gemini

```gemini-cau-hinh
ten: con-meo      # tên file
loai: nhan-vat
tham-chieu: mau.png
nen: #D5D9DD   # nền
```

```gemini chung
Chibi cat, soft vinyl toy.
```

```gemini truoc
Front view.
```

```gemini trai
tham-chieu: phu.png   # riêng góc trái
Left profile.
```

```gemini mat
mau: khong
Close-up face.
```
'''


@pytest.fixture
def g(tmp_path, monkeypatch):
    monkeypatch.setenv('GEMINI_RA', str(tmp_path / 'ra'))
    monkeypatch.setenv('GEMINI_COOKIE_FILE', str(tmp_path / 'khong-co.json'))
    monkeypatch.delenv('GEMINI_PSID', raising=False)
    monkeypatch.delenv('GEMINI_PSIDTS', raising=False)
    import gemini_anh
    return importlib.reload(gemini_anh)


def _phieu(tmp_path, ten='2026-11-16-anh-con-meo.md', noi_dung=PHIEU):
    p = tmp_path / ten
    p.write_text(noi_dung, encoding='utf-8')
    for f in ('mau.png', 'phu.png'):
        Image.new('RGB', (8, 8), 'white').save(tmp_path / f)
    return p


def _anh_gia(duong, cao=600, rong=260, lech=0, sao=True, nen=(221, 221, 221)):
    """Hình người giả (khối màu) trên nền xám, có 'sao Gemini' nhỏ ở góc phải dưới."""
    im = Image.new('RGB', (1024, 1024), nen)
    v = ImageDraw.Draw(im)
    x = 512 + lech
    v.rectangle([x - rong // 2, 200, x + rong // 2, 200 + cao], fill=(60, 90, 160))
    v.ellipse([x - 90, 120, x + 90, 300], fill=(240, 200, 180))
    if sao:
        v.polygon([(960, 950), (968, 970), (990, 975), (968, 982), (960, 1000), (952, 982), (930, 975), (952, 970)],
                  fill=(250, 250, 250))
    duong.parent.mkdir(parents=True, exist_ok=True)
    im.save(duong)


def test_doc_phieu(g, tmp_path):
    p = g.doc_phieu(_phieu(tmp_path))
    assert p['ten'] == 'con-meo' and p['loai'] == 'nhan-vat'
    assert p['cau_hinh']['tham-chieu'] == 'mau.png' and p['cau_hinh']['nen'] == '#D5D9DD'
    assert [x['ten'] for x in p['goc']] == ['truoc', 'trai', 'mat']
    assert p['goc'][1]['tham_chieu'] == ['phu.png'] and p['goc'][1]['cau_lenh'] == 'Left profile.'
    assert p['goc'][2]['mau'] == 'khong'
    assert p['chung'] == 'Chibi cat, soft vinyl toy.'
    cau = g.cau_lenh_day_du(p, p['goc'][0], 'truoc-1.png')
    assert cau.startswith('Chibi cat') and 'Front view.' in cau and 'truoc-1.png' in cau


def test_doc_phieu_mac_dinh_theo_ten_file(g, tmp_path):
    p = g.doc_phieu(_phieu(tmp_path, '2026-11-16-concept-ho-sen.md', '```gemini toan-canh\nA lotus pond.\n```\n'))
    assert (p['ten'], p['loai']) == ('ho-sen', 'concept')


def test_phieu_cu_khong_co_khoi(g, tmp_path):
    with pytest.raises(g.Loi, match='chưa có khối câu lệnh'):
        g.doc_phieu(_phieu(tmp_path, noi_dung='## Dán vào canvas\n\n```text\nabc\n```\n'))


def test_phieu_loi_ten_goc_lap(g, tmp_path):
    with pytest.raises(g.Loi, match='lặp'):
        g.doc_phieu(_phieu(tmp_path, noi_dung='```gemini truoc\na\n```\n```gemini truoc\nb\n```\n'))


def test_ke_hoach_tao(g, tmp_path):
    p = g.doc_phieu(_phieu(tmp_path))
    luot = g.ke_hoach_tao(p, ['truoc', 'trai', 'mat'], 2, {}, {'ten': 'con-meo', 'chon': {}})
    assert [(x[0]['ten'], x[1]) for x in luot] == [('truoc', 1), ('truoc', 2), ('trai', 1), ('trai', 2),
                                                   ('mat', 1), ('mat', 2)]
    trai = luot[2]
    assert [f.name for f in trai[2]] == ['mau.png', 'phu.png'] and trai[3] == '@truoc'
    assert luot[4][3] is None  # mau: khong
    # góc mẫu đã có ảnh → gắn đúng bản chọn; bản mới đánh số tiếp
    d = tmp_path / 'ra' / 'con-meo'
    for n in (1, 2):
        _anh_gia(d / f'truoc-{n}.png')
    _anh_gia(d / 'trai-1.png')
    luot = g.ke_hoach_tao(p, ['trai'], 1, {'truoc': '2'}, {'ten': 'con-meo', 'chon': {}})
    assert luot[0][1] == 2 and luot[0][3] == 'truoc-2.png' and luot[0][2][-1].name == 'truoc-2.png'
    with pytest.raises(g.Loi, match='không có góc'):
        g.ke_hoach_tao(p, ['sau'], 1, {}, None)


def test_cookie_thieu_bao_ro(g, tmp_path, capsys):
    with pytest.raises(g.LoiCookie) as e:
        g.doc_cookie()
    assert '__Secure-1PSIDTS' in str(e.value) and 'F12' in str(e.value)
    # qua main: mã thoát 3, không vết Python
    p = _phieu(tmp_path)
    assert g.main(['kiem']) == 3
    assert 'LỖI COOKIE' in capsys.readouterr().err
    assert p.exists()


def test_cookie_doc_file_va_che(g, tmp_path, monkeypatch):
    f = tmp_path / 'cookie.json'
    f.write_text(json.dumps([{'name': '__Secure-1PSID', 'value': 'g.a000PSIDBIMAT'},
                             {'name': '__Secure-1PSIDTS', 'value': 'sidts-BIMATTS'}]), encoding='utf-8')
    monkeypatch.setattr(g, 'COOKIE_FILE', f)
    psid, ts = g.doc_cookie()
    assert (psid, ts) == ('g.a000PSIDBIMAT', 'sidts-BIMATTS')
    g._BI_MAT[:] = [psid, ts]
    assert g.che(f'lỗi .cached_cookies_{psid}.json {ts}') == 'lỗi .cached_cookies_***.json ***'


def _tao_trang_thai(g, tmp_path, loai, goc, ban=2, cau_hinh=None):
    d = tmp_path / 'ra' / 'thu'
    tt = {'ten': 'thu', 'loai': loai, 'goc': goc, 'chon': {}, 'phieu': str(tmp_path / 'p.md'),
          'cau_hinh': cau_hinh or {}}
    for gg in goc:
        for n in range(1, ban + 1):
            _anh_gia(d / f'{gg}-{n}.png', cao=500 + 60 * n, lech=40 * n)
    g.ghi_trang_thai(tt)
    return d


def test_so_sanh(g, tmp_path):
    d = _tao_trang_thai(g, tmp_path, 'nhan-vat', ['truoc', 'trai'], ban=3)
    ra = g.main(['so', 'thu'])
    assert ra == 0 and (d / 'so.png').is_file()
    with Image.open(d / 'so.png') as im:
        assert im.width > 3 * 300 and im.height > 2 * 300


def test_chot_nhan_vat_chuan_hoa(g, tmp_path):
    _tao_trang_thai(g, tmp_path, 'nhan-vat', ['truoc', 'trai', 'sau', 'phai'])
    repo = tmp_path / 'repo'
    assert g.main(['chot', 'thu', 'truoc=2,trai=1,sau=1,phai=lat-trai', '--repo', str(repo)]) == 0
    d = repo / 'design/models/anh'
    cao = {}
    for gg in ('truoc', 'trai', 'sau', 'phai'):
        with Image.open(d / f'thu-{gg}.png') as im:
            assert im.size == (1024, 1024) and im.mode == 'RGB'
            a = np.asarray(im).astype(int)
        assert tuple(a[5, 5]) == (221, 221, 221)
        assert tuple(a[975, 960]) == (221, 221, 221)  # sao Gemini đã xoá (có thể dời chỗ — kiểm cả góc)
        vat = np.abs(a - 221).max(axis=2) > 20
        ys, xs = np.nonzero(vat)
        assert abs(ys.max() + 1 - 0.9 * 1024) <= 3  # đế 90 %
        assert abs((xs.min() + xs.max()) / 2 - 512) <= 4  # trục giữa
        cao[gg] = ys.max() - ys.min()
    # bản cao nhất (truoc=2: thân 620) đỉnh ở 10 %; chung hệ số → trai (thân 560) thấp hơn
    with Image.open(d / 'thu-truoc.png') as im:
        a = np.asarray(im).astype(int)
    ys = np.nonzero(np.abs(a - 221).max(axis=2) > 20)[0]
    assert abs(ys.min() - 0.1 * 1024) <= 3
    assert cao['truoc'] > cao['trai'] and cao['phai'] == cao['trai']
    tt = json.loads((tmp_path / 'ra/thu/tao.json').read_text(encoding='utf-8'))
    assert tt['chon']['truoc'] == '2' and tt['da_chot']['nguon']['phai'] == 'trai-1 lật ngang'


def test_chot_cong_trinh_khung_ngang(g, tmp_path):
    _tao_trang_thai(g, tmp_path, 'cong-trinh', ['truoc', 'trai'], ban=1)
    repo = tmp_path / 'repo'
    assert g.main(['chot', 'thu', 'truoc=1,trai=1', '--repo', str(repo)]) == 0
    with Image.open(repo / 'design/models/anh/thu-truoc.png') as im:
        a = np.asarray(im).astype(int)
    ys, xs = np.nonzero(np.abs(a - 221).max(axis=2) > 20)
    # vật giả cao hơn rộng → hệ số theo chiều cao (86 %), đáy hạ cho đỉnh ≥ 5 %
    assert ys.min() >= 0.04 * 1024 and ys.max() < 0.96 * 1024


def test_chot_concept_va_hinh(g, tmp_path):
    _tao_trang_thai(g, tmp_path, 'concept', ['toan-canh'], ban=1)
    repo = tmp_path / 'repo'
    assert g.main(['chot', 'thu', 'toan-canh=1', '--repo', str(repo)]) == 0
    assert (repo / 'design/concept/thu/toan-canh.png').is_file()

    _tao_trang_thai(g, tmp_path, 'hinh', ['ban-do'], ban=1)
    assert g.main(['chot', 'thu', 'ban-do=1', '--repo', str(repo), '--256']) == 0
    with Image.open(repo / 'design/icons/nguon/ban-do.png') as im:
        assert im.size == (512, 512) and im.mode == 'RGBA'
        alpha = np.asarray(im)[:, :, 3]
    assert alpha[0, 0] == 0 and alpha[256, 256] == 255
    ys, xs = np.nonzero(alpha > 128)
    assert abs(max(ys.max() - ys.min(), xs.max() - xs.min()) - 0.84 * 512) <= 6
    assert (repo / 'design/icons/xuat/ban-do.webp').is_file() and (repo / 'design/icons/xuat/ban-do@256.webp').is_file()


def test_chot_loi_ro(g, tmp_path, capsys):
    _tao_trang_thai(g, tmp_path, 'nhan-vat', ['truoc'], ban=1)
    assert g.main(['chot', 'thu', 'truoc=5', '--repo', str(tmp_path / 'r')]) == 2
    assert g.main(['chot', 'thu', 'phai=lat-trai', '--repo', str(tmp_path / 'r')]) == 2
    err = capsys.readouterr().err
    assert 'truoc-5.png' in err and 'phải chọn cả trai' in err


def test_tao_thu_khong_mang(g, tmp_path, capsys):
    p = _phieu(tmp_path)
    assert g.main(['tao', str(p), '--ban', '1', '--thu']) == 0
    out = capsys.readouterr().out
    assert 'truoc-1' in out and 'Left profile.' in out and not (tmp_path / 'ra' / 'con-meo' / 'tao.json').exists()
