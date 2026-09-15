import { napDanhMuc } from '../src/danh-muc.js';
import { MANG, mangCuaNhom } from '../src/mang.js';

/**
 * Hàng rào mà hợp đồng §4 gọi là bắt buộc: thêm nhóm mới ở `clazzi-api`, quét lại, mà quên xếp
 * vào mảng ⇒ đỏ ở đây. Không có nó thì tuyến mới lặng lẽ không công cụ nào gọi tới được và sẽ
 * chẳng ai phát hiện ra.
 */
describe('bản đồ mảng nghiệp vụ ↔ danh mục', () => {
  const dm = napDanhMuc();

  it('mọi nhóm trong danh mục thuộc đúng một mảng', () => {
    const chuaXep = dm.nhom.filter((n) => !mangCuaNhom(n.tienTo)).map((n) => n.tienTo);
    expect(chuaXep).toEqual([]);
  });

  it('mọi nhóm mà mảng nhắc tới đều có thật trong danh mục', () => {
    const coThat = new Set(dm.nhom.map((n) => n.tienTo));
    const ma = MANG.flatMap((m) => m.nhom).filter((n) => !coThat.has(n));
    expect(ma).toEqual([]);
  });

  it('không nhóm nào bị xếp vào hai mảng', () => {
    const tatCa = MANG.flatMap((m) => m.nhom);
    expect(tatCa).toHaveLength(new Set(tatCa).size);
  });

  it('đúng 24 mảng như hợp đồng §4, phủ trọn danh mục', () => {
    expect(MANG).toHaveLength(24);
    // Số nhóm bám theo danh mục chứ không chốt cứng: `clazzi-api` mọc thêm nhóm là chuyện thường,
    // điều phải giữ là KHÔNG nhóm nào rơi ra ngoài — đã kiểm ở phép thử đầu tiên.
    expect(MANG.flatMap((m) => m.nhom)).toHaveLength(dm.soNhom);
    const soTuyen = dm.nhom.reduce((s, n) => s + Object.values(n.crud).filter(Boolean).length + n.tuyenKhac.length, 0);
    expect(soTuyen).toBe(dm.soTuyen);
  });

  it('mảng nào cũng có tên bắt đầu bằng clazzi_ và mô tả tiếng Việt', () => {
    for (const m of MANG) {
      expect(m.ten).toMatch(/^clazzi_[a-z_]+$/);
      expect(m.moTa.length).toBeGreaterThan(20);
      // Mô tả phải là tiếng Việt thật, không phải tên tuyến dán vào.
      expect(m.moTa).toMatch(/[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
    }
  });
});
