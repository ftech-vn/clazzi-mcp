import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { datCauHinh } from '../src/cau-hinh';
import { GECKO } from '../src/bo-noi/du-lieu/gecko';
import { dinhNghiaCongCu, chayCongCu } from '../src/loi/cong-cu';
import { napDanhMuc } from '../src/loi/danh-muc';
import { mangCuaNhom } from '../src/loi/mang';
import { nhanDienBan } from '../src/loi/ban';
import { quetKho } from '../src/quet/quet-nguon';
import type { Phien } from '../src/loi/phien';

/**
 * Thương hiệu GECKO trên CÙNG một lõi — chứng minh việc tiêm cấu hình thật sự đổi tiền tố, danh
 * mục, tên bản; không phải clazzi đội lốt. Đây là lý do cả bộ tồn tại: một lõi, nhiều thương hiệu.
 */
datCauHinh(GECKO);
const MANG = GECKO.mang;
const phien = (khoa: string | null = null): Phien => ({ ban: nhanDienBan('https://otm-api.f-tech.vn'), khoa });

describe('công cụ gecko mang tiền tố gecko_, không phải clazzi_', () => {
  const cc = dinhNghiaCongCu();

  it('có 3 công cụ meta tiền tố gecko_', () => {
    expect(cc.map(c => c.name)).toEqual(expect.arrayContaining(['gecko_trang_thai', 'gecko_mo_ta', 'gecko_goi']));
    expect(cc.map(c => c.name).filter(n => n.startsWith('clazzi_'))).toEqual([]);
  });

  it('mọi mảng gecko phủ trong danh mục gecko', () => {
    const dm = napDanhMuc();
    expect(dm.nhom.filter(n => !mangCuaNhom(n.tienTo)).map(n => n.tienTo)).toEqual([]);
    const coThat = new Set(dm.nhom.map(n => n.tienTo));
    expect(MANG.flatMap(m => m.nhom).filter(n => !coThat.has(n))).toEqual([]);
  });

  it('thiếu khoá thì hướng dẫn dùng đúng tên máy chủ gecko và biến GECKO_API_KEY', async () => {
    const dm = napDanhMuc();
    const mangCoCrud = MANG.find(m => m.nhom.some(t => dm.nhom.find(n => n.tienTo === t)?.crud.lietKe));
    const nhomCoCrud = mangCoCrud?.nhom.find(t => dm.nhom.find(n => n.tienTo === t)?.crud.lietKe);
    const { text, loi } = await chayCongCu(phien(), String(mangCoCrud?.ten), { doiTuong: nhomCoCrud, viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toContain('claude mcp add --transport http gecko https://otm-api.f-tech.vn/mcp');
    expect(text).toContain('GECKO_API_KEY');
  });
});

const GOC_GECKO = resolve(__dirname, '../../../gecko/server-api');
const coNguon = existsSync(resolve(GOC_GECKO, 'src/controllers'));

describe('danh mục gecko đóng gói khớp mã nguồn otm-api', () => {
  (coNguon ? it : it.skip)('số tuyến/nhóm khớp bản quét tươi', () => {
    const tuoi = quetKho(GOC_GECKO, GECKO.tenNhom);
    const daLuu = napDanhMuc();
    expect({ soTuyen: tuoi.soTuyen, soNhom: tuoi.soNhom }).toEqual({ soTuyen: daLuu.soTuyen, soNhom: daLuu.soNhom });
    expect(tuoi.nhom.map(n => n.tienTo)).toEqual(daLuu.nhom.map(n => n.tienTo));
  });
});
