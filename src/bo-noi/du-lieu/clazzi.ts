import type { CauHinhThuongHieu } from '../../cau-hinh';
import type { DanhMuc } from '../../loi/kieu';
import danhMuc from './clazzi/danh-muc.json';
import { MANG } from './clazzi/mang';
import { TEN_NHOM } from './clazzi/ten-nhom';

/**
 * Cấu hình thương hiệu CLAZZI (bản gốc + demo + các khách clazzi).
 *
 * `danh-muc.json` sinh lúc build từ mã nguồn `clazzi-api` (xem `scripts/sinh-danh-muc.ts`), nên
 * mọi API mới của clazzi tự có mặt trong MCP. Bảng `daBiet` là chỗ phía MCP GẮN TÊN cho từng bản:
 * nhiều bản chạy chung mã nguồn, không có tên thì một lệnh xoá gõ nhầm bản là xoá vào khách khác.
 */
export const CLAZZI: CauHinhThuongHieu = {
  tienTo: 'clazzi',
  bienUrl: 'CLAZZI_API_URL',
  bienKhoa: 'CLAZZI_API_KEY',
  tienToKhoa: 'clz_',
  // Cố ý là DEMO: gõ thiếu biến môi trường thì trỏ vào chỗ hỏng được, không phải hệ thật.
  diaChiMacDinh: 'https://api-demo.clazzi.vn',
  daBiet: {
    'api.clazzi.vn': { ten: 'HỆ THẬT — CLAZZI (khách trả tiền)', laHeThat: true },
    'api-demo.clazzi.vn': { ten: 'DÙNG THỬ — demo', laHeThat: false },
    'api.tiengtrungbackinh.com': { ten: 'HỆ THẬT — Tiếng Trung Bắc Kinh (khách trả tiền)', laHeThat: true },
    'api-sunshine.clazzi.vn': { ten: 'HỆ THẬT — Sunshine (khách trả tiền)', laHeThat: true },
    // Bản của gecko: nếu ai đó trỏ stdio của clazzi vào đây thì ít ra tên bản vẫn đúng.
    'otm-api.f-tech.vn': { ten: 'HỆ THẬT — gecko / OTM (khách trả tiền)', laHeThat: true },
  },
  mang: MANG,
  tenNhom: TEN_NHOM,
  danhMuc: danhMuc as unknown as DanhMuc,
};
