import { chayCongCu } from '../src/cong-cu.js';
import { dichLoi, goiApi } from '../src/http.js';
import { nhanDienBan } from '../src/ban.js';

/**
 * Gọi MẠNG THẬT — và chỉ vào `api-demo.clazzi.vn`.
 *
 * Địa chỉ chốt cứng trong tệp này chứ không đọc biến môi trường: nếu đọc env thì một lần ai đó
 * để `CLAZZI_API_URL=https://api.clazzi.vn` rồi chạy `npx jest` là bộ test nã thẳng vào dữ liệu
 * lớp học của khách trả tiền. Không đáng đánh đổi lấy chút tiện.
 */
const DEMO = 'https://api-demo.clazzi.vn';
const BAN = nhanDienBan(DEMO);

beforeEach(() => {
  process.env.CLAZZI_API_URL = DEMO;
});

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

describe('tuyến công khai gọi được thật — chứng minh đường HTTP đúng', () => {
  neuCoMang('GET /version qua clazzi_goi', async () => {
    process.env.CLAZZI_API_KEY = 'clz_khonghople_khonghoplekhonghoplekhonghople';
    const { text } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: '/version' });
    expect(text).toContain('api-demo.clazzi.vn');
    expect(text).toContain('version');
  });

  /**
   * Khoá SAI khuôn `clz_…` bị máy chủ từ chối NGAY Ở RÌA, kể cả với tuyến công khai.
   *
   * Hai test này trước đây mong `loi === false`: hồi đó middleware đổi khoá chưa triển khai, nên
   * chuỗi `clz_…` chỉ là một vé JWT hỏng bị bỏ qua và `/health` vẫn trả 200. Từ 15/09/2026
   * middleware đã lên, và nó NHẬN RA đó là khoá rồi từ chối — hành vi đúng hơn: trình một chìa
   * sai thì phải bị báo sai, không nên lờ đi rồi cho qua như không có gì.
   *
   * Điều còn phải giữ: thông điệp phải nói rõ là KHOÁ hỏng, để người dùng đi cấp lại khoá chứ
   * không đi dò mạng hay đổi mật khẩu.
   */
  neuCoMang('khoá sai bị từ chối kể cả ở tuyến công khai, và nói rõ là do khoá', async () => {
    for (const d of ['/health', '/setup/status', '/trial/status']) {
      process.env.CLAZZI_API_KEY = 'clz_khonghople_khonghoplekhonghoplekhonghople';
      const { text, loi } = await chayCongCu('clazzi_goi', { method: 'GET', duongDan: d });
      expect(loi).toBe(true);
      expect(text).toContain('DÙNG THỬ — demo');
      expect(text.toLowerCase()).toContain('khoá');
    }
  });

  neuCoMang('bốn tuyến công khai đó đều có trong danh mục', async () => {
    // Chỉ kiểm DANH MỤC có tuyến hay không, không kiểm gọi được hay không: gọi được còn phụ
    // thuộc khoá, mà khoá thì không phải việc của danh mục.
    for (const d of ['/health', '/version', '/setup/status', '/trial/status']) {
      const { text } = await chayCongCu('clazzi_mo_ta', { doiTuong: d.split('/').slice(0, 2).join('/') });
      expect(text).toContain(d.split('/')[1]!);
    }
  });
});

describe('tuyến cần xác thực: khoá bịa ⇒ thông điệp đọc được, không phải lỗi thô', () => {
  neuCoMang('GET /courses với khoá bịa', async () => {
    process.env.CLAZZI_API_KEY = 'clz_khonghople_khonghoplekhonghoplekhonghople';
    const { text, loi } = await chayCongCu('clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(loi).toBe(true);
    // Phải nói được thành lời, và phải nhắc chuyện khoá theo từng bản.
    expect(text).toMatch(/Khoá API|khoá/i);
    expect(text).toContain('api-demo.clazzi.vn');
    // Không được để lộ khoá, kể cả khoá sai.
    expect(text.match(/clz_[A-Za-z0-9_]{4,}/g)).toBeNull();
    // Không được là dấu vết ngăn xếp.
    expect(text).not.toMatch(/at Object\.|node:internal/);
  });

  neuCoMang('không đặt khoá thì dừng ngay ở bước hướng dẫn, không đụng mạng', async () => {
    delete process.env.CLAZZI_API_KEY;
    const { text, loi } = await chayCongCu('clazzi_khoa_hoc', { doiTuong: '/courses', viec: 'liet_ke' });
    expect(loi).toBe(true);
    expect(text).toContain('"env"');
  });

  neuCoMang('goiApi ném LoiNguoiDung chứ không trả phản hồi lỗi', async () => {
    process.env.CLAZZI_API_KEY = 'clz_khonghople_khonghoplekhonghoplekhonghople';
    await expect(goiApi({ ban: BAN, method: 'GET', duongDan: '/courses' })).rejects.toThrow(/[Kk]hoá/);
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

  it('404 thân HTML (Express) không làm vỡ bộ đọc lỗi', () => {
    const t = dichLoi(BAN, 404, '<!DOCTYPE html><pre>Cannot GET /abc</pre>', 'GET', '/abc');
    expect(t).toContain('không có tuyến');
    expect(t).toContain('quet-api.ts');
  });
});
