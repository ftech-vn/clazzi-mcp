import { chayCongCu, dinhNghiaCongCu } from '../src/cong-cu.js';
import { MANG } from '../src/mang.js';
import { napDanhMuc } from '../src/danh-muc.js';

/**
 * Các phép thử ở đây KHÔNG chạm mạng: chúng dừng lại trước lúc gọi HTTP, vì thứ cần kiểm là hàng
 * rào — từ chối việc không tồn tại, từ chối đường dẫn ngoài danh mục. Gọi mạng thật nằm ở
 * `that.spec.ts`.
 */

beforeEach(() => {
  process.env.CLAZZI_API_URL = 'https://api-demo.clazzi.vn';
  delete process.env.CLAZZI_API_KEY;
});

describe('bảng công cụ tự mô tả hệ thống', () => {
  const cc = dinhNghiaCongCu();

  it('đúng 24 công cụ nghiệp vụ + 3 phụ trợ = 27', () => {
    expect(cc).toHaveLength(27);
    expect(cc.filter((c) => MANG.some((m) => m.ten === c.name))).toHaveLength(24);
    expect(cc.map((c) => c.name)).toEqual(expect.arrayContaining(['clazzi_trang_thai', 'clazzi_mo_ta', 'clazzi_goi']));
  });

  it('KHÔNG có công cụ đăng nhập — xác thực đi bằng khoá trong env', () => {
    expect(cc.map((c) => c.name)).not.toContain('clazzi_dang_nhap');
    for (const c of cc) {
      const chuoi = JSON.stringify(c).toLowerCase();
      expect(chuoi).not.toMatch(/password|mat_khau|matkhau/);
    }
  });

  it('mọi mô tả công cụ viết tiếng Việt', () => {
    for (const c of cc) {
      expect(c.description.length).toBeGreaterThan(20);
      expect(c.description).toMatch(/[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
    }
  });

  /** Yêu cầu cứng của hợp đồng: enum thật trong lược đồ, để mô hình đọc là biết ngay. */
  it('doiTuong là enum thật, và mô tả enum nói rõ việc nào làm được', () => {
    for (const m of MANG) {
      const c = cc.find((x) => x.name === m.ten)!;
      const props = (c.inputSchema as any).properties;
      expect(props.doiTuong.enum).toEqual(m.nhom);
      expect(props.viec.enum).toEqual(['liet_ke', 'xem', 'tao', 'sua', 'xoa']);
      expect((c.inputSchema as any).required).toEqual(['doiTuong', 'viec']);
      for (const n of m.nhom) expect(props.doiTuong.description).toContain(n);
    }
  });

  it('mô tả enum của /class-users nói rõ chỉ liet_ke', () => {
    const c = cc.find((x) => x.name === 'clazzi_lop_hoc')!;
    const d = (c.inputSchema as any).properties.doiTuong.description as string;
    expect(d).toContain('/class-users — Học viên trong lớp (liet_ke');
    expect(d).not.toContain('/class-users — Học viên trong lớp (liet_ke, xem');
  });
});

describe('năm việc CRUD từ chối đúng khi đối tượng không hỗ trợ', () => {
  // `/class-users` chỉ có liệt kê — ca thử thật mà hợp đồng chỉ đích danh.
  for (const viec of ['xem', 'tao', 'sua', 'xoa']) {
    it(`/class-users từ chối "${viec}" và nói rõ việc nào làm được`, async () => {
      const { text, loi } = await chayCongCu('clazzi_lop_hoc', { doiTuong: '/class-users', viec, id: 'x', duLieu: { a: 1 } });
      expect(loi).toBe(true);
      expect(text).toContain('KHÔNG hỗ trợ việc');
      expect(text).toContain(viec);
      expect(text).toContain('Việc làm được với đối tượng này: liet_ke');
      // Không được lặng lẽ đổi sang tuyến khác: tuyệt đối không có dấu hiệu đã gọi mạng.
      expect(text).not.toContain('"ketQua"');
    });
  }

  it('/class-users vẫn cho liet_ke đi tiếp (dừng ở bước thiếu khoá, không phải bước từ chối việc)', async () => {
    const { text } = await chayCongCu('clazzi_lop_hoc', { doiTuong: '/class-users', viec: 'liet_ke' });
    expect(text).not.toContain('KHÔNG hỗ trợ việc');
    expect(text).toContain('CLAZZI_API_KEY');
  });

  it('mọi nhóm thiếu việc nào thì công cụ từ chối đúng việc ấy — quét cả danh mục', async () => {
    const viecTen: Record<string, string> = { lietKe: 'liet_ke', xem: 'xem', tao: 'tao', sua: 'sua', xoa: 'xoa' };
    for (const n of napDanhMuc().nhom) {
      const m = MANG.find((x) => x.nhom.includes(n.tienTo))!;
      for (const [k, ten] of Object.entries(viecTen)) {
        if ((n.crud as any)[k]) continue;
        const { loi, text } = await chayCongCu(m.ten, { doiTuong: n.tienTo, viec: ten, id: 'x', duLieu: { a: 1 } });
        expect(loi).toBe(true);
        expect(text).toContain('KHÔNG hỗ trợ việc');
      }
    }
  });

  it('gọi chéo mảng bị chặn', async () => {
    const { text, loi } = await chayCongCu('clazzi_crm', { doiTuong: '/users', viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toContain('không thuộc clazzi_crm');
    expect(text).toContain('clazzi_hoc_vien');
  });

  it('xem/sua/xoa thiếu id thì từ chối trước khi gọi mạng', async () => {
    for (const viec of ['xem', 'sua', 'xoa']) {
      const { text, loi } = await chayCongCu('clazzi_khoa_hoc', { doiTuong: '/courses', viec, duLieu: { a: 1 } });
      expect(loi).toBe(true);
      expect(text).toContain('cần "id"');
    }
  });
});

describe('clazzi_goi chỉ đi được trong danh mục', () => {
  it('từ chối đường dẫn không có trong danh mục, kèm gợi ý', async () => {
    // Ba đoạn: không tuyến nào của `/courses` sâu tới vậy, nên không có mẫu nào khớp.
    const { text, loi } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: '/courses/abc/xuat-khau/tat-ca' });
    expect(loi).toBe(true);
    expect(text).toContain('KHÔNG có trong danh mục');
    expect(text).toContain('/courses');
  });

  it('từ chối tuyến bịa hoàn toàn', async () => {
    const { text, loi } = await chayCongCu('clazzi_goi', { method: 'DELETE', duongDan: '/xoa-sach-du-lieu' });
    expect(loi).toBe(true);
    expect(text).toContain('KHÔNG có trong danh mục');
  });

  it('từ chối đúng method sai — đường dẫn có thật nhưng không nhận method đó', async () => {
    const { text, loi } = await chayCongCu('clazzi_goi', { method: 'DELETE', duongDan: '/version' });
    expect(loi).toBe(true);
    expect(text).toContain('chỉ nhận: GET');
  });

  it('chấp nhận tuyến lẻ có thật và thay được tham số đường dẫn', async () => {
    // Đi tới bước gọi mạng (dừng vì thiếu khoá) chứng tỏ đã qua được hàng rào danh mục.
    const { text } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: '/holidays/year/2026' });
    expect(text).not.toContain('KHÔNG có trong danh mục');
    expect(text).toContain('CLAZZI_API_KEY');
  });

  /**
   * Ghi lại cho rõ, đây KHÔNG phải lỗ hổng: `GET /users/export` đi lọt vì `GET /users/:id` là
   * tuyến có thật và `routing-controllers` cũng sẽ định tuyến y như vậy. Hàng rào chặn tuyến
   * KHÔNG TỒN TẠI, chứ không chặn được việc truyền một id vô nghĩa — cái đó máy chủ trả lời.
   */
  it('mẫu :id nhận mọi đoạn đơn, và báo đúng mẫu chữ khi có tuyến chữ trùng', async () => {
    const { text } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: '/users/export' });
    expect(text).not.toContain('KHÔNG có trong danh mục');
    expect(text).toContain('CLAZZI_API_KEY');
  });

  it('không cho gọi tuyến ngoài danh mục bằng mẹo dấu / cuối hay chuỗi truy vấn', async () => {
    for (const d of ['/khong-co-that/', '/khong-co-that?a=1']) {
      const { loi } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: d });
      expect(loi).toBe(true);
    }
  });
});

describe('clazzi_mo_ta', () => {
  it('liệt kê tuyến lẻ của /users để mô hình biết đường dùng clazzi_goi', async () => {
    const { text } = await chayCongCu('clazzi_mo_ta', { doiTuong: '/users' });
    expect(text).toContain('GET /users/export');
    expect(text).toContain('POST /users/import');
    expect(text).toContain('clazzi_hoc_vien');
  });

  it('ghi rõ "KHÔNG CÓ" cho việc mà đối tượng không hỗ trợ', async () => {
    const { text } = await chayCongCu('clazzi_mo_ta', { doiTuong: '/class-users' });
    expect(text).toContain('KHÔNG CÓ — đừng gọi việc này');
  });

  it('/auth không có việc CRUD nào, nhưng 14 tuyến lẻ phải hiện ra', async () => {
    const { text } = await chayCongCu('clazzi_mo_ta', { doiTuong: '/auth' });
    expect(text).toContain('POST /auth/staff/login');
  });
});
