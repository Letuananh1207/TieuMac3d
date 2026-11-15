// Kiểm bảng hình minh hoạ (design/icons/hinh.json + design/icons/xuat/) — phần thuần của scripts/hinh.mjs, test bằng vitest.
// Quy cách (kế hoạch docs/tasks/2026-11-15-hinh-minh-hoa.md): WebP vuông, cỡ đầu tiên trong `co` là `<mã>.webp`, cỡ khác
// `<mã>@<cỡ>.webp`; ≤ 16 KB (160) / ≤ 32 KB (256); tổng ≤ 1,5 MB (giữ app nhẹ, giải mã nhanh trên điện thoại tầm trung).

/** Trần dung lượng một file theo cỡ (byte); cỡ khác → trần của cỡ lớn hơn gần nhất. */
export const NGAN_SACH = { 160: 16 * 1024, 256: 32 * 1024 };
/** Trần tổng mọi hình. */
export const TONG_TOI_DA = 1.5 * 1024 * 1024;

const MA = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Trần của một cỡ. */
export function nganSach(co) {
  const muc = Object.keys(NGAN_SACH).map(Number).sort((a, b) => a - b);
  const k = muc.find((m) => co <= m) ?? muc[muc.length - 1];
  return NGAN_SACH[k];
}

/** Tên file của một mã ở một cỡ (`coChinh` = cỡ đầu trong bảng). */
export function tenFile(ma, co, coChinh) {
  return co === coChinh ? `${ma}.webp` : `${ma}@${co}.webp`;
}

/** Rộng × cao của ảnh WebP (đọc đầu file: VP8X / VP8 / VP8L); không phải WebP → null. */
export function coWebp(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kieu = buf.toString('ascii', 12, 16);
  if (kieu === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (kieu === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  if (kieu === 'VP8L') {
    const b = buf.readUInt32LE(21);
    return { w: 1 + (b & 0x3fff), h: 1 + ((b >>> 14) & 0x3fff) };
  }
  return null;
}

/**
 * Kiểm bảng: `bang` = nội dung hinh.json, `files` = Map tên file trong xuat/ → Buffer.
 * Trả `loi` (chặn build), `canh` (chỉ báo), `chep` (file cần chép), `tong` (byte).
 */
export function kiemHinh(bang, files) {
  const loi = [];
  const canh = [];
  const chep = [];
  const thay = new Set();
  let tong = 0;
  const hinh = Array.isArray(bang?.hinh) ? bang.hinh : [];
  if (!hinh.length) loi.push('hinh.json: không có mục "hinh"');
  for (const m of hinh) {
    const ma = m?.ma;
    if (typeof ma !== 'string' || !MA.test(ma)) {
      loi.push(`mã không hợp lệ: ${JSON.stringify(ma)} (chữ thường không dấu, số, gạch nối)`);
      continue;
    }
    if (thay.has(`#${ma}`)) {
      loi.push(`${ma}: trùng mã`);
      continue;
    }
    thay.add(`#${ma}`);
    if (!Number.isInteger(m.dot) || m.dot < 1) loi.push(`${ma}: thiếu "dot" (đợt 1, 2, 3…)`);
    const co = Array.isArray(m.co) && m.co.length ? m.co : null;
    if (!co) {
      loi.push(`${ma}: thiếu "co"`);
      continue;
    }
    for (const c of co) {
      const ten = tenFile(ma, c, co[0]);
      thay.add(ten);
      const buf = files.get(ten);
      if (!buf) {
        loi.push(`${ma}: thiếu file xuat/${ten}`);
        continue;
      }
      const kt = coWebp(buf);
      if (!kt) loi.push(`${ten}: không phải WebP`);
      else if (kt.w !== c || kt.h !== c) loi.push(`${ten}: cỡ ${kt.w}×${kt.h}, cần ${c}×${c}`);
      const tran = nganSach(c);
      if (buf.length > tran) loi.push(`${ten}: ${(buf.length / 1024).toFixed(1)} KB > ${tran / 1024} KB`);
      tong += buf.length;
      chep.push({ ten, ma, co: c });
    }
  }
  if (tong > TONG_TOI_DA) loi.push(`tổng ${(tong / 1024).toFixed(0)} KB > ${TONG_TOI_DA / 1024} KB`);
  for (const ten of files.keys()) if (!thay.has(ten)) canh.push(`xuat/${ten} không có trong hinh.json — bỏ qua`);
  return { loi, canh, chep, tong };
}

/** `ban-do` → `banDo` (tên hằng Dart). */
export function tenDart(ma) {
  return ma.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
