import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { datCauHinh } from '../src/cau-hinh';
import { CLAZZI } from '../src/bo-noi/du-lieu/clazzi';
import { napDanhMuc } from '../src/loi/danh-muc';
import { mangCuaNhom } from '../src/loi/mang';
import { quetKho } from '../src/quet/quet-nguon';

datCauHinh(CLAZZI);
const MANG = CLAZZI.mang;
const VN = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

/**
 * Danh mục đóng gói là ẢNH CHỤP mã nguồn `clazzi-api`. Sinh lại bằng scanner rồi đối chiếu: quét
 * thêm một tuyến ở clazzi-api mà quên chạy `pnpm sinh:clazzi` là đỏ ngay. Bỏ qua khi không có kho
 * anh em nằm cạnh (máy CI không mở cả hai kho) — không đỏ giả.
 */
const GOC_CLAZZI_API = resolve(__dirname, '../../clazzi-api');
const coNguon = existsSync(resolve(GOC_CLAZZI_API, 'src/controllers'));

describe('danh mục đóng gói khớp mã nguồn clazzi-api', () => {
  (coNguon ? it : it.skip)('số tuyến/nhóm và từng nhóm khớp bản quét tươi', () => {
    const tuoi = quetKho(GOC_CLAZZI_API, CLAZZI.tenNhom);
    const daLuu = napDanhMuc();
    expect({ soTuyen: tuoi.soTuyen, soNhom: tuoi.soNhom }).toEqual({ soTuyen: daLuu.soTuyen, soNhom: daLuu.soNhom });
    expect(tuoi.nhom.map(n => n.tienTo)).toEqual(daLuu.nhom.map(n => n.tienTo));
    for (const n of tuoi.nhom) {
      const cu = daLuu.nhom.find(x => x.tienTo === n.tienTo);
      expect({ tienTo: n.tienTo, module: n.module, crud: n.crud }).toEqual({ tienTo: cu?.tienTo, module: cu?.module, crud: cu?.crud });
    }
  });
});

describe('danh mục có hình dạng đúng', () => {
  const dm = napDanhMuc();

  /**
   * Con số 19 là lý do tồn tại của cả thiết kế: nếu API đồng nhất thì đã phơi CRUD cho mọi nhóm,
   * và đã không cần công cụ cửa thoát lẫn danh mục. Nó trôi đi là phải đọc lại thiết kế.
   */
  it('đúng 19 nhóm có đủ năm việc CRUD', () => {
    expect(dm.nhom.filter(n => Object.values(n.crud).every(Boolean))).toHaveLength(19);
  });

  it('/class-users chỉ có liệt kê — ca thử thật của hợp đồng', () => {
    const n = dm.nhom.find(x => x.tienTo === '/class-users');
    expect(n?.crud).toEqual({ lietKe: 'GET /class-users/', xem: null, tao: null, sua: null, xoa: null });
  });

  it('ô CRUD nào có giá trị thì đúng khuôn "METHOD /duong/dan"', () => {
    for (const n of dm.nhom) {
      for (const [viec, t] of Object.entries(n.crud)) {
        if (t === null) continue;
        expect(`${n.tienTo} ${viec} ${t}`).toMatch(/ (GET|POST|PUT|DELETE|PATCH) \//);
      }
    }
  });

  it('có mốc thời gian quét hợp lệ', () => {
    expect(Number.isNaN(Date.parse(dm.quetLuc))).toBe(false);
  });
});

/**
 * Hàng rào chống mã chết: thêm nhóm tuyến mới mà quên xếp vào một mảng nghiệp vụ ⇒ không công cụ
 * nào gọi tới được. Đây chính là cái đã xảy ra với `/reports`.
 */
describe('bản đồ mảng nghiệp vụ ↔ danh mục', () => {
  const dm = napDanhMuc();

  it('mọi nhóm trong danh mục thuộc đúng một mảng', () => {
    expect(dm.nhom.filter(n => !mangCuaNhom(n.tienTo)).map(n => n.tienTo)).toEqual([]);
  });

  it('mọi nhóm mà mảng nhắc tới đều có thật trong danh mục', () => {
    const coThat = new Set(dm.nhom.map(n => n.tienTo));
    expect(MANG.flatMap(m => m.nhom).filter(n => !coThat.has(n))).toEqual([]);
  });

  it('không nhóm nào bị xếp vào hai mảng', () => {
    const tatCa = MANG.flatMap(m => m.nhom);
    expect(tatCa).toHaveLength(new Set(tatCa).size);
  });

  it('đúng 24 mảng như hợp đồng §4, phủ trọn danh mục', () => {
    expect(MANG).toHaveLength(24);
    expect(MANG.flatMap(m => m.nhom)).toHaveLength(dm.soNhom);
    const soTuyen = dm.nhom.reduce((s, n) => s + Object.values(n.crud).filter(Boolean).length + n.tuyenKhac.length, 0);
    expect(soTuyen).toBe(dm.soTuyen);
  });

  it('mảng nào cũng có tên bắt đầu bằng clazzi_ và mô tả tiếng Việt', () => {
    for (const m of MANG) {
      expect(m.ten).toMatch(/^clazzi_[a-z_]+$/);
      expect(m.moTa.length).toBeGreaterThan(20);
      expect(m.moTa).toMatch(VN);
    }
  });
});
