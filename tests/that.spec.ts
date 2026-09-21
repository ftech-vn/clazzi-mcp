import { nhanDienBan } from '../../clazzi-api/src/mcp/loi/ban';
import { chayCongCu } from '../../clazzi-api/src/mcp/loi/cong-cu';
import { dichLoi, goiApi } from '../../clazzi-api/src/mcp/loi/http';
import type { Phien } from '../../clazzi-api/src/mcp/loi/phien';

/**
 * Gọi MẠNG THẬT — và chỉ vào `api-demo.clazzi.vn`.
 *
 * Địa chỉ chốt cứng trong tệp này chứ không đọc biến môi trường: nếu đọc env thì một lần ai đó
 * để `CLAZZI_API_URL=https://api.clazzi.vn` rồi chạy `npx jest` là bộ test nã thẳng vào dữ liệu
 * lớp học của khách trả tiền. Không đáng đánh đổi lấy chút tiện.
 *
 * Bộ test luật của lõi nằm ở `clazzi-api/tests/unit/mcp-*.spec.ts` — cùng kho với lõi. Còn lại ở
 * đây đúng hai việc mà chỉ kho này làm được: gọi ra Internet thật, và chứng minh kho này dùng
 * CHUNG lõi chứ không giữ một bản sao.
 */
const DEMO = 'https://api-demo.clazzi.vn';
const BAN = nhanDienBan(DEMO);
const KHOA_BIA = 'clz_khonghople_khonghoplekhonghoplekhonghople';

const phien = (khoa: string | null): Phien => ({ ban: BAN, khoa });

// Máy chạy test có thể không có mạng; bỏ qua thay vì đỏ giả.
let coMang = true;
beforeAll(async () => {
  try {
    const r = await fetch(`${DEMO}/version`, { signal: AbortSignal.timeout(10_000) });
    coMang = r.ok;
  } catch {
    coMang = false;
  }
  if (!coMang) console.error('Bỏ qua test mạng: không với tới api-demo.clazzi.vn');
});

const neuCoMang = (ten: string, fn: () => Promise<void>) =>
  it(ten, async () => {
    if (!coMang) return;
    await fn();
  });

describe('lõi dùng CHUNG với clazzi-api, không phải bản sao', () => {
  it('kho này không còn tệp lõi nào của riêng mình', async () => {
    const { readdirSync, existsSync } = await import('node:fs');
    const { join, resolve } = await import('node:path');
    const gocKho = resolve(__dirname, '..');

    // Đúng một tệp trong `src/`: bộ nối stdio. Mọi luật công cụ ở kho bên kia.
    expect(readdirSync(join(gocKho, 'src'))).toEqual(['server.ts']);
    expect(existsSync(join(gocKho, 'danh-muc.json'))).toBe(false);

    // Và lõi ấy phải có thật ở kho anh em — thiếu nó thì kho này không chạy được.
    const loi = resolve(gocKho, '..', 'clazzi-api', 'src', 'mcp', 'loi');
    for (const t of ['cong-cu.ts', 'danh-muc.ts', 'danh-muc.json', 'mang.ts', 'phien.ts']) {
      expect({ tep: t, co: existsSync(join(loi, t)) }).toEqual({ tep: t, co: true });
    }
  });

  it('không tệp .ts nào trong kho gọi console.log — stdout là kênh JSON-RPC', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join, resolve } = await import('node:path');
    const goc = resolve(__dirname, '..');

    const pham: string[] = [];
    const di = (thuMuc: string) => {
      for (const t of readdirSync(thuMuc)) {
        if (t === 'node_modules' || t === 'dist' || t === '.git') continue;
        const p = join(thuMuc, t);
        if (statSync(p).isDirectory()) di(p);
        else if (t.endsWith('.ts') && /console\s*\.\s*log\s*\(/.test(readFileSync(p, 'utf8'))) pham.push(p);
      }
    };
    di(goc);
    expect(pham).toEqual([]);
  });
});

describe('tuyến công khai gọi được thật — chứng minh đường HTTP đúng', () => {
  neuCoMang('GET /version qua clazzi_goi', async () => {
    const { text } = await chayCongCu(phien(KHOA_BIA), 'clazzi_goi', { method: 'GET', duongDan: '/version' });
    expect(text).toContain('api-demo.clazzi.vn');
    expect(text).toContain('version');
  });

  /**
   * Khoá SAI khuôn `clz_…` bị máy chủ từ chối NGAY Ở RÌA, kể cả với tuyến công khai — trình một
   * chìa sai thì phải bị báo sai, không nên lờ đi rồi cho qua như không có gì.
   *
   * Điều phải giữ: thông điệp nói rõ là KHOÁ hỏng, để người dùng đi cấp lại khoá chứ không đi dò
   * mạng hay đổi mật khẩu.
   */
  neuCoMang('khoá sai bị từ chối kể cả ở tuyến công khai, và nói rõ là do khoá', async () => {
    for (const d of ['/health', '/setup/status', '/trial/status']) {
      const { text, loi } = await chayCongCu(phien(KHOA_BIA), 'clazzi_goi', { method: 'GET', duongDan: d });
      expect(loi).toBe(true);
      expect(text).toContain('DÙNG THỬ — demo');
      expect(text.toLowerCase()).toContain('khoá');
    }
  });
});

describe('tuyến cần xác thực: khoá bịa ⇒ thông điệp đọc được, không phải lỗi thô', () => {
  neuCoMang('GET /courses với khoá bịa', async () => {
    const { text, loi } = await chayCongCu(phien(KHOA_BIA), 'clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toMatch(/Khoá API|khoá/i);
    expect(text).toContain('api-demo.clazzi.vn');
    // Không được để lộ khoá, kể cả khoá sai.
    expect(text.match(/clz_[A-Za-z0-9_]{4,}/g)).toBeNull();
    // Không được là dấu vết ngăn xếp.
    expect(text).not.toMatch(/at Object\.|node:internal/);
  });

  neuCoMang('không đặt khoá thì dừng ngay ở bước hướng dẫn, không đụng mạng', async () => {
    const { text, loi } = await chayCongCu(phien(null), 'clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toContain('claude mcp add --transport http');
    expect(text).toContain('codex  mcp add');
  });

  neuCoMang('goiApi ném LoiNguoiDung chứ không trả phản hồi lỗi', async () => {
    await expect(goiApi({ phien: phien(KHOA_BIA), method: 'GET', duongDan: '/courses' })).rejects.toThrow(/[Kk]hoá/);
  });
});

describe('dịch gói lỗi — ba hình dạng đo được thật trên demo', () => {
  it('403 "Access is denied" (không gửi thẻ) nói về quyền, không nói hệ thống hỏng', () => {
    const t = dichLoi(BAN, 403, { error: { httpCode: 403, code: '999', message: 'Access is denied for request on GET /courses' } }, 'GET', '/courses');
    expect(t).toContain('không đủ quyền');
    expect(t).toContain('DÙNG THỬ — demo');
  });

  it('500 "invalid token" được hiểu là khoá sai, KHÔNG phải máy chủ sập', () => {
    const t = dichLoi(BAN, 500, { error: { httpCode: 500, code: '999', message: 'invalid token' } }, 'GET', '/courses');
    expect(t).toContain('Khoá API không được bản này chấp nhận');
    expect(t).toContain('khoá của một bản khác');
  });

  it('401 khoá sai bản nói rõ là sai BẢN chứ không phải khoá hỏng', () => {
    const t = dichLoi(BAN, 401, { error: { httpCode: 401, code: '007', message: 'Unauthorized' } }, 'GET', '/courses');
    expect(t).toContain('TỪNG BẢN');
    expect(t).toContain('api-demo.clazzi.vn');
  });

  it('họ mã 230–235 của clazzi-api giữ nguyên văn — thông điệp gốc đã rõ hơn lời ta bọc thêm', () => {
    const t = dichLoi(BAN, 401, { error: { code: '231', message: 'Khoá API này đã bị thu hồi — hãy cấp một khoá mới rồi dán lại vào cấu hình' } }, 'GET', '/courses');
    expect(t).toContain('đã bị thu hồi');
    expect(t).toContain('DÙNG THỬ — demo');
  });

  it('404 nói cả khả năng module đang tắt, không đổ ngay cho "hệ thống hỏng"', () => {
    const t = dichLoi(BAN, 404, '<!DOCTYPE html><pre>Cannot GET /abc</pre>', 'GET', '/abc');
    expect(t).toContain('không có tuyến');
    expect(t).toContain('module chứa tính năng này đang TẮT');
  });
});
