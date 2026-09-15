import { chayCongCu, dinhNghiaCongCu } from '../src/cong-cu.js';
import { nhanDienBan, banHienTai, DIA_CHI_MAC_DINH } from '../src/ban.js';
import { xoaKhoa } from '../src/ket-qua.js';
import { MANG } from '../src/mang.js';

const KHOA = 'clz_abcdefghijkl_0123456789abcdef0123456789abcdef';

beforeEach(() => {
  process.env.CLAZZI_API_URL = 'https://api-demo.clazzi.vn';
  delete process.env.CLAZZI_API_KEY;
});
afterEach(() => {
  delete process.env.CLAZZI_API_KEY;
});

describe('khoá không bao giờ lọt ra kết quả công cụ', () => {
  /**
   * Quét chuỗi trả về thật, không tin vào việc "chắc là không in ra đâu". Khoá nằm trong kết quả
   * công cụ là nó nằm vĩnh viễn trong nhật ký hội thoại, và thu hồi khoá xong thì bản ghi vẫn còn.
   */
  const goi: [string, Record<string, unknown>][] = [
    ['clazzi_trang_thai', {}],
    ['clazzi_mo_ta', { doiTuong: '/users' }],
    ['clazzi_mo_ta', { doiTuong: '/khong-co-that' }],
    ['clazzi_goi', { method: 'GET', duongDan: '/khong-co-that' }],
    ['clazzi_goi', { method: 'GET', duongDan: '/version' }],
    ['clazzi_lop_hoc', { doiTuong: '/class-users', viec: 'xoa', id: 'x' }],
    ['clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' }],
    ['clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'tao', duLieu: { name: 'x' } }],
    ['clazzi_he_thong', { doiTuong: '/api-keys', viec: 'liet_ke' }],
    ['khong_co_cong_cu_nay', {}],
  ];

  for (const [ten, ts] of goi) {
    it(`${ten} ${JSON.stringify(ts)} — không lộ khoá`, async () => {
      process.env.CLAZZI_API_KEY = KHOA;
      const { text } = await chayCongCu(ten, ts);
      expect(text).not.toContain(KHOA);
      expect(text).not.toContain('0123456789abcdef');
      // Quét cả tiền tố: bất kỳ chuỗi nào bắt đầu bằng `clz_` cũng phải đã bị ẩn.
      const conSot = text.match(/clz_[A-Za-z0-9_]{4,}/g);
      expect(conSot).toBeNull();
    });
  }

  it('bộ ẩn khoá xoá cả khoá không theo khuôn clz_ (ví dụ dán nhầm thẻ JWT)', () => {
    process.env.CLAZZI_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.abcdef.ghijkl';
    expect(xoaKhoa('thẻ là eyJhbGciOiJIUzI1NiJ9.abcdef.ghijkl xong')).toBe('thẻ là <khoá đã ẩn> xong');
  });

  it('lược đồ công cụ không chứa trường nhận khoá hay mật khẩu', () => {
    for (const c of dinhNghiaCongCu()) {
      const props = Object.keys(((c.inputSchema as any).properties ?? {}) as object).join(',').toLowerCase();
      expect(props).not.toMatch(/key|khoa|token|password/);
    }
  });

  it('clazzi_trang_thai chỉ hiện 12 ký tự prefix, không hiện phần bí mật', async () => {
    process.env.CLAZZI_API_KEY = KHOA;
    const { text } = await chayCongCu('clazzi_trang_thai', {});
    expect(text).toContain('abcdefghijkl');
    expect(text).not.toContain('0123456789abcdef');
    expect(text).not.toContain(KHOA);
    expect(text.match(/clz_[A-Za-z0-9_]{4,}/g)).toBeNull();
  });

  it('vẫn báo đủ bản + prefix ngay cả khi khoá bị từ chối — đây là công cụ chẩn đoán', async () => {
    process.env.CLAZZI_API_KEY = KHOA;
    const { text } = await chayCongCu('clazzi_trang_thai', {});
    expect(text).toContain('DÙNG THỬ — demo');
    expect(text).toContain('abcdefghijkl');
    expect(text).toContain('soTuyen');
  });
});

describe('thiếu CLAZZI_API_KEY thì hướng dẫn, không phải lỗi thô', () => {
  it('nói rõ dán khoá vào khối env nào, kèm ví dụ cấu hình', async () => {
    const { text, loi } = await chayCongCu('clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toContain('CLAZZI_API_KEY');
    expect(text).toContain('"env"');
    expect(text).toContain('mcpServers');
    expect(text).toContain('claude mcp add clazzi');
    // Phải nhắc khoá theo từng bản, nếu không người dùng sẽ dán khoá hệ thật vào demo.
    expect(text).toContain('TỪNG BẢN');
    // Không được là lỗi thô của Node.
    expect(text).not.toContain('undefined');
    expect(text).not.toMatch(/TypeError|at Object\./);
  });

  it('thông điệp nhắc đúng địa chỉ bản đang trỏ', async () => {
    process.env.CLAZZI_API_URL = 'https://api-demo.clazzi.vn';
    const { text } = await chayCongCu('clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(text).toContain('https://api-demo.clazzi.vn');
  });
});

describe('mọi kết quả ghi rõ đang trỏ bản nào', () => {
  const goi: [string, Record<string, unknown>][] = [
    ['clazzi_trang_thai', {}],
    ['clazzi_mo_ta', { doiTuong: '/courses' }],
    ['clazzi_goi', { method: 'GET', duongDan: '/khong-co-that' }],
    ['clazzi_lop_hoc', { doiTuong: '/class-users', viec: 'sua', id: 'x', duLieu: { a: 1 } }],
    ['clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' }],
    ['khong_co_cong_cu_nay', {}],
  ];

  for (const [ten, ts] of goi) {
    it(`${ten} — kết quả mang tên bản`, async () => {
      const { text } = await chayCongCu(ten, ts);
      expect(text).toContain('[bản: ');
      expect(text).toContain('DÙNG THỬ — demo');
      expect(text).toContain('https://api-demo.clazzi.vn');
    });
  }

  it('bản hệ thật bị gắn cảnh báo DỮ LIỆU THẬT', async () => {
    process.env.CLAZZI_API_URL = 'https://api.clazzi.vn';
    const { text } = await chayCongCu('clazzi_mo_ta', { doiTuong: '/courses' });
    expect(text).toContain('HỆ THẬT');
    expect(text).toContain('⚠ DỮ LIỆU THẬT');
  });
});

describe('nhận diện bản triển khai', () => {
  it('mặc định là demo khi thiếu CLAZZI_API_URL', () => {
    delete process.env.CLAZZI_API_URL;
    const b = banHienTai();
    expect(b.diaChi).toBe(DIA_CHI_MAC_DINH);
    expect(b.laHeThat).toBe(false);
  });

  it('gọi đúng tên ba bản thật đang chạy', () => {
    expect(nhanDienBan('https://api.clazzi.vn').laHeThat).toBe(true);
    expect(nhanDienBan('https://api-demo.clazzi.vn').laHeThat).toBe(false);
    expect(nhanDienBan('https://api.tiengtrungbackinh.com').laHeThat).toBe(true);
    expect(nhanDienBan('https://api.tiengtrungbackinh.com').ten).toContain('Tiếng Trung Bắc Kinh');
  });

  it('bản lạ coi như hệ thật — đoán nhầm hướng thận trọng thì chỉ thừa một cảnh báo', () => {
    expect(nhanDienBan('https://api.khach-moi.vn').laHeThat).toBe(true);
  });

  it('dấu / thừa ở cuối không tạo ra bản khác', () => {
    expect(nhanDienBan('https://api-demo.clazzi.vn/').diaChi).toBe('https://api-demo.clazzi.vn');
  });
});

describe('cây mã nguồn không có console.log', () => {
  /**
   * stdout là kênh JSON-RPC của MCP qua stdio. Một dòng `console.log` lạc vào đó là client không
   * phân tích được gói tin và phiên chết ngay — kiểu hỏng rất khó lần ra từ phía người dùng.
   * ESLint đã chặn, nhưng test này chặn cả trường hợp ai đó thêm `eslint-disable`.
   */
  it('không tệp .ts nào gọi console.log', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const goc = fileURLToPath(new URL('..', import.meta.url));

    const pham: string[] = [];
    const di = (thuMuc: string) => {
      for (const t of readdirSync(thuMuc)) {
        if (t === 'node_modules' || t === 'dist' || t === '.git') continue;
        const p = join(thuMuc, t);
        if (statSync(p).isDirectory()) di(p);
        else if (t.endsWith('.ts')) {
          const noi = readFileSync(p, 'utf8');
          // `eslint.config.mjs` được phép nhắc tên luật trong bình luận.
          if (/console\s*\.\s*log\s*\(/.test(noi)) pham.push(p);
        }
      }
    };
    di(goc);
    expect(pham).toEqual([]);
  });

  it('mọi mảng trong bảng công cụ đều có công cụ tương ứng', () => {
    const ten = dinhNghiaCongCu().map((c) => c.name);
    for (const m of MANG) expect(ten).toContain(m.ten);
  });
});
