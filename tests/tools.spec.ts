import { setConfig } from '../src/config';
import { CLAZZI } from '../src/stdio/data/clazzi';
import { identifyDeployment } from '../src/core/deployment';
import { runTool, defineTools } from '../src/core/tools';
import { loadCatalog } from '../src/core/catalog';
import { redactKey } from '../src/core/result';
import type { Session } from '../src/core/session';

// Đặt cấu hình thương hiệu TRƯỚC mọi describe (Jest chạy thân describe lúc nạp module). Mỗi tệp
// test là một hộp cát module riêng, nên singleton cấu hình cô lập giữa các tệp.
setConfig(CLAZZI);
const DOMAINS = CLAZZI.domains;

/**
 * Luật của LÕI công cụ — không chạm mạng.
 *
 * Mọi phép thử ở đây dừng lại TRƯỚC lúc gọi HTTP, vì thứ cần kiểm là hàng rào: từ chối việc
 * không tồn tại, từ chối đường dẫn ngoài danh mục, không để khoá lọt ra. Phần đi hết một lượt
 * gọi thật nằm ở `mcp-http.spec.ts`.
 */

const API_KEY = 'clz_abcdefghijkl_0123456789abcdef0123456789abcdef';
const DEMO = 'https://api-demo.clazzi.vn';

const session = (apiKey: string | null = null, url = DEMO): Session => ({ deployment: identifyDeployment(url), apiKey: apiKey });

describe('bảng công cụ tự mô tả hệ thống', () => {
  const cc = defineTools();

  it('đúng 24 công cụ nghiệp vụ + 3 phụ trợ = 27', () => {
    expect(cc).toHaveLength(27);
    expect(cc.filter(c => DOMAINS.some(m => m.name === c.name))).toHaveLength(24);
    expect(cc.map(c => c.name)).toEqual(expect.arrayContaining(['clazzi_trang_thai', 'clazzi_mo_ta', 'clazzi_goi']));
  });

  it('KHÔNG có công cụ đăng nhập — xác thực đi bằng khoá API', () => {
    expect(cc.map(c => c.name)).not.toContain('clazzi_dang_nhap');
    for (const c of cc) expect(JSON.stringify(c).toLowerCase()).not.toMatch(/password|mat_khau|matkhau/);
  });

  it('mọi mô tả công cụ viết tiếng Việt', () => {
    for (const c of cc) {
      expect(c.description.length).toBeGreaterThan(20);
      expect(c.description).toMatch(/[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
    }
  });

  it('doiTuong là enum thật, và mô tả enum nói rõ việc nào làm được', () => {
    for (const m of DOMAINS) {
      const c = cc.find(x => x.name === m.name);
      const schema = c?.inputSchema as { properties: Record<string, { enum?: string[]; description?: string }>; required: string[] };
      expect(schema.properties.doiTuong.enum).toEqual(m.groups);
      expect(schema.properties.viec.enum).toEqual(['liet_ke', 'xem', 'tao', 'sua', 'xoa']);
      expect(schema.required).toEqual(['doiTuong', 'viec']);
      for (const n of m.groups) expect(schema.properties.doiTuong.description).toContain(n);
    }
  });

  it('lược đồ công cụ không có trường nào nhận khoá hay mật khẩu', () => {
    for (const c of defineTools()) {
      const props = Object.keys((c.inputSchema as { properties?: object }).properties ?? {})
        .join(',')
        .toLowerCase();
      expect(props).not.toMatch(/key|khoa|token|password/);
    }
  });
});

/**
 * Bộ lọc theo cờ module. Đây là chuyện HIỂN THỊ — việc chặn nằm ở `module-gate`, và
 * `mcp-http.spec.ts` chứng minh phần chặn đó bằng một lượt gọi thật.
 */
describe('công cụ của module đang tắt không được khai ra', () => {
  it('tắt CUSTM thì clazzi_crm biến mất khỏi bảng công cụ', () => {
    const allNames = defineTools().map(c => c.name);
    expect(allNames).toContain('clazzi_crm');

    const missing = defineTools({ isModuleEnabled: ma => ma !== 'CUSTM' }).map(c => c.name);
    expect(missing).not.toContain('clazzi_crm');
    // Và chỉ mất đúng nó — tắt một module không được làm sập cả bảng.
    expect(allNames.filter(x => x !== 'clazzi_crm')).toEqual(missing);
  });

  it('tắt REPRT chỉ cắt /reports khỏi clazzi_bao_cao, /dashboard là lõi nên ở lại', () => {
    const c = defineTools({ isModuleEnabled: ma => ma !== 'REPRT' }).find(x => x.name === 'clazzi_bao_cao');
    const enums = (c?.inputSchema as { properties: Record<string, { enum?: string[] }> }).properties.doiTuong.enum;
    expect(enums).toEqual(['/dashboard']);
  });

  it('tắt HẾT module thì các công cụ lõi vẫn còn — hệ thống không bao giờ trống trơn', () => {
    const names = defineTools({ isModuleEnabled: () => false }).map(c => c.name);
    expect(names).toEqual(expect.arrayContaining(['clazzi_hoc_vien', 'clazzi_lop_hoc', 'clazzi_he_thong', 'clazzi_trang_thai']));
    expect(names).not.toContain('clazzi_crm');
    expect(names).not.toContain('clazzi_lop_online');
  });
});

describe('năm việc CRUD từ chối đúng khi đối tượng không hỗ trợ', () => {
  for (const action of ['xem', 'tao', 'sua', 'xoa']) {
    it(`/class-users từ chối "${action}" và nói rõ việc nào làm được`, async () => {
      const { text, isError } = await runTool(session(), 'clazzi_lop_hoc', { doiTuong: '/class-users', viec: action, id: 'x', duLieu: { a: 1 } });
      expect(isError).toBe(true);
      expect(text).toContain('KHÔNG hỗ trợ việc');
      expect(text).toContain('Việc làm được với đối tượng này: liet_ke');
      // Không được lặng lẽ đổi sang tuyến khác: tuyệt đối không có dấu hiệu đã gọi mạng.
      expect(text).not.toContain('"ketQua"');
    });
  }

  it('mọi nhóm thiếu việc nào thì công cụ từ chối đúng việc ấy — quét cả danh mục', async () => {
    const actionNames: Record<string, string> = { list: 'liet_ke', get: 'xem', create: 'tao', update: 'sua', remove: 'xoa' };
    for (const n of loadCatalog().groups) {
      const m = DOMAINS.find(x => x.groups.includes(n.prefix));
      for (const [k, name] of Object.entries(actionNames)) {
        if ((n.crud as unknown as Record<string, string | null>)[k]) continue;
        const { isError, text } = await runTool(session(), String(m?.name), { doiTuong: n.prefix, viec: name, id: 'x', duLieu: { a: 1 } });
        expect(isError).toBe(true);
        expect(text).toContain('KHÔNG hỗ trợ việc');
      }
    }
  });

  it('gọi chéo mảng bị chặn', async () => {
    const { text, isError } = await runTool(session(), 'clazzi_crm', { doiTuong: '/users', viec: 'liet_ke' });
    expect(isError).toBe(true);
    expect(text).toContain('không thuộc clazzi_crm');
    expect(text).toContain('clazzi_hoc_vien');
  });

  it('xem/sua/xoa thiếu id thì từ chối trước khi gọi mạng', async () => {
    for (const action of ['xem', 'sua', 'xoa']) {
      const { text, isError } = await runTool(session(), 'clazzi_khoa_hoc', { doiTuong: '/courses', viec: action, duLieu: { a: 1 } });
      expect(isError).toBe(true);
      expect(text).toContain('cần "id"');
    }
  });
});

describe('clazzi_goi chỉ đi được trong danh mục', () => {
  it('từ chối đường dẫn không có trong danh mục, kèm gợi ý', async () => {
    const { text, isError } = await runTool(session(), 'clazzi_goi', { method: 'GET', duongDan: '/courses/abc/xuat-khau/tat-ca' });
    expect(isError).toBe(true);
    expect(text).toContain('KHÔNG có trong danh mục');
    expect(text).toContain('/courses');
  });

  it('từ chối tuyến bịa hoàn toàn', async () => {
    const { isError, text } = await runTool(session(), 'clazzi_goi', { method: 'DELETE', duongDan: '/xoa-sach-du-lieu' });
    expect(isError).toBe(true);
    expect(text).toContain('KHÔNG có trong danh mục');
  });

  it('từ chối đúng method sai — đường dẫn có thật nhưng không nhận method đó', async () => {
    const { text, isError } = await runTool(session(), 'clazzi_goi', { method: 'DELETE', duongDan: '/version' });
    expect(isError).toBe(true);
    expect(text).toContain('chỉ nhận: GET');
  });

  it('không lách được bằng dấu / cuối hay chuỗi truy vấn', async () => {
    for (const d of ['/khong-co-that/', '/khong-co-that?a=1']) {
      expect((await runTool(session(), 'clazzi_goi', { method: 'GET', duongDan: d })).isError).toBe(true);
    }
  });

  it('chấp nhận tuyến lẻ có thật — đi tới tận bước thiếu khoá', async () => {
    const { text } = await runTool(session(), 'clazzi_goi', { method: 'GET', duongDan: '/holidays/year/2026' });
    expect(text).not.toContain('KHÔNG có trong danh mục');
    expect(text).toContain('Chưa có khoá API');
  });
});

describe('clazzi_mo_ta', () => {
  it('liệt kê tuyến lẻ của /users để mô hình biết đường dùng clazzi_goi', async () => {
    const { text } = await runTool(session(), 'clazzi_mo_ta', { doiTuong: '/users' });
    expect(text).toContain('GET /users/export');
    expect(text).toContain('clazzi_hoc_vien');
  });

  it('ghi rõ "KHÔNG CÓ" cho việc mà đối tượng không hỗ trợ', async () => {
    const { text } = await runTool(session(), 'clazzi_mo_ta', { doiTuong: '/class-users' });
    expect(text).toContain('KHÔNG CÓ — đừng gọi việc này');
  });
});

/**
 * Khoá lọt vào kết quả công cụ là nó nằm vĩnh viễn trong nhật ký hội thoại, và thu hồi khoá xong
 * thì bản ghi vẫn còn. Nên quét chuỗi trả về THẬT, không tin vào "chắc là không in ra đâu".
 */
describe('khoá không bao giờ lọt ra kết quả công cụ', () => {
  const cases: [string, Record<string, unknown>][] = [
    ['clazzi_trang_thai', {}],
    ['clazzi_mo_ta', { doiTuong: '/users' }],
    ['clazzi_mo_ta', { doiTuong: '/khong-co-that' }],
    ['clazzi_goi', { method: 'GET', duongDan: '/khong-co-that' }],
    ['clazzi_lop_hoc', { doiTuong: '/class-users', viec: 'xoa', id: 'x' }],
    ['clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' }],
    ['khong_co_cong_cu_nay', {}],
  ];

  for (const [name, args] of cases) {
    it(`${name} ${JSON.stringify(args)} — không lộ khoá`, async () => {
      const { text } = await runTool({ deployment: identifyDeployment(DEMO), apiKey: API_KEY, callBaseUrl: 'http://127.0.0.1:1' }, name, args);
      expect(text).not.toContain(API_KEY);
      expect(text).not.toContain('0123456789abcdef');
      expect(text.match(/clz_[A-Za-z0-9_]{4,}/g)).toBeNull();
    });
  }

  it('bộ ẩn khoá xoá cả khoá không theo khuôn clz_ (ví dụ dán nhầm thẻ JWT)', () => {
    expect(redactKey('thẻ là eyJhbGciOiJIUzI1NiJ9.abcdef.ghijkl xong', 'eyJhbGciOiJIUzI1NiJ9.abcdef.ghijkl')).toBe('thẻ là <khoá đã ẩn> xong');
  });

  it('clazzi_trang_thai chỉ hiện 12 ký tự prefix, không hiện phần bí mật', async () => {
    const { text } = await runTool({ deployment: identifyDeployment(DEMO), apiKey: API_KEY, callBaseUrl: 'http://127.0.0.1:1' }, 'clazzi_trang_thai', {});
    expect(text).toContain('abcdefghijkl');
    expect(text).not.toContain('0123456789abcdef');
    // Vẫn báo đủ bản + prefix kể cả khi khoá bị từ chối — đây là công cụ CHẨN ĐOÁN.
    expect(text).toContain('DÙNG THỬ — demo');
    expect(text).toContain('soTuyen');
  });
});

describe('thiếu khoá thì hướng dẫn, không phải lỗi thô', () => {
  it('nói rõ hai lệnh cắm và nhắc khoá theo từng bản', async () => {
    const { text, isError } = await runTool(session(), 'clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(isError).toBe(true);
    expect(text).toContain('claude mcp add --transport http clazzi https://api-demo.clazzi.vn/mcp');
    expect(text).toContain('codex  mcp add clazzi --url https://api-demo.clazzi.vn/mcp');
    expect(text).toContain('TỪNG BẢN');
    expect(text).not.toContain('undefined');
    expect(text).not.toMatch(/TypeError|at Object\./);
  });
});

describe('mọi kết quả ghi rõ đang trỏ bản nào', () => {
  const cases: [string, Record<string, unknown>][] = [
    ['clazzi_mo_ta', { doiTuong: '/courses' }],
    ['clazzi_goi', { method: 'GET', duongDan: '/khong-co-that' }],
    ['clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' }],
    ['khong_co_cong_cu_nay', {}],
  ];

  for (const [name, args] of cases) {
    it(`${name} — kết quả mang tên bản`, async () => {
      const { text } = await runTool(session(), name, args);
      expect(text).toContain('[bản: ');
      expect(text).toContain('DÙNG THỬ — demo');
      expect(text).toContain(DEMO);
    });
  }

  it('bản hệ thật bị gắn cảnh báo DỮ LIỆU THẬT', async () => {
    const { text } = await runTool(session(null, 'https://api.clazzi.vn'), 'clazzi_mo_ta', { doiTuong: '/courses' });
    expect(text).toContain('HỆ THẬT');
    expect(text).toContain('⚠ DỮ LIỆU THẬT');
  });

  it('bản lạ coi như hệ thật — đoán nhầm hướng thận trọng thì chỉ thừa một cảnh báo', () => {
    expect(identifyDeployment('https://api.khach-moi.vn').isProduction).toBe(true);
  });
});
