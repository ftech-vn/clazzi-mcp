import type { CauHinhThuongHieu } from '../../cau-hinh';
import type { DanhMuc } from '../../loi/kieu';
import danhMuc from './gecko/danh-muc.json';
import { MANG } from './gecko/mang';
import { TEN_NHOM } from './gecko/ten-nhom';

/**
 * Cấu hình thương hiệu GECKO (OTM / F-Tech).
 *
 * Khác clazzi ở đúng những chỗ thương hiệu phải khác: tiền tố tên công cụ (`gecko_*`), biến môi
 * trường (`GECKO_API_*`), bảng bản đã biết, và danh mục riêng — gecko là NHÁNH ĐÃ TRÔI, thiếu
 * hơn chục nhóm so với clazzi (`/zoom`, `/student-documents`, `/site`, `/api-keys`…). Dùng danh
 * mục clazzi cho gecko là hứa hàng chục tuyến máy chủ này không có.
 *
 * Khoá gecko vẫn theo khuôn `clz_` (dùng chung hạ tầng khoá với clazzi), nên `tienToKhoa` giữ nguyên.
 */
export const GECKO: CauHinhThuongHieu = {
  tienTo: 'gecko',
  bienUrl: 'GECKO_API_URL',
  bienKhoa: 'GECKO_API_KEY',
  tienToKhoa: 'clz_',
  diaChiMacDinh: 'https://otm-api.f-tech.vn',
  daBiet: {
    'otm-api.f-tech.vn': { ten: 'HỆ THẬT — OTM / F-Tech (khách trả tiền)', laHeThat: true },
  },
  mang: MANG,
  tenNhom: TEN_NHOM,
  danhMuc: danhMuc as unknown as DanhMuc,
};
