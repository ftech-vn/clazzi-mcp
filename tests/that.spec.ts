import { datCauHinh } from '../src/cau-hinh';
import { CLAZZI } from '../src/bo-noi/du-lieu/clazzi';
import { nhanDienBan } from '../src/loi/ban';
import { chayCongCu } from '../src/loi/cong-cu';
import { dichLoi, goiApi } from '../src/loi/http';
import type { Phien } from '../src/loi/phien';

datCauHinh(CLAZZI);

/**
 * Gọi MẠNG THẬT — và chỉ vào `api-demo.clazzi.vn`.
 *
 * Địa chỉ chốt cứng trong tệp này chứ không đọc biến môi trường: nếu đọc env thì một lần ai đó
 * để `CLAZZI_API_URL=https://api.clazzi.vn` rồi chạy `npx jest` là bộ test nã thẳng vào dữ liệu
 * lớp học của khách trả tiền. Không đáng đánh đổi lấy chút tiện.
 */
const DEMO = 'https://api-demo.clazzi.vn';
const BAN = nhanDienBan(DEMO);
const KHOA_BIA = 'clz_khonghople_khonghoplekhonghoplekhonghople';

const phien = (khoa: string | null): Phien => ({ ban: BAN, khoa });

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

describe('bộ nối stdio dùng GÓI trong kho này, không phải bản sao kho anh em', () => {
  it('lõi nằm trong src/ của chính kho này', async () => {
    const { existsSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const goc = resolve(__dirname, '..');
    for (const t of ['src/index.ts', 'src/loi/cong-cu.ts', 'src/quet/quet-nguon.ts', 'src/cau-hinh.ts']) {
      expect({ tep: t, co: existsSync(resolve(goc, t)) }).toEqual({ tep: t, co: true });
    }
  });

  it('bộ nối nhập lõi từ gói (../index), KHÔNG còn nhập từ ../../clazzi-api', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '..', 'src', 'bo-noi', 'server.ts'), 'utf8');
    expect(src).toContain("from '../index'");
    // Không còn IMPORT lõi từ kho anh em (chú thích được nhắc tên clazzi-api là chuyện khác).
    expect(src).not.toMatch(/from ['"][^'"]*clazzi-api/);
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
        else if (t.endsWith('.ts')) {
          // Bỏ chú thích khối và chú thích dòng trước khi soi: ta chặn LỆNH console.log thật,
          // không chặn ví dụ trong tài liệu (nen-tang.ts cố ý nhắc `node -e 'console.log...'`).
          const ma = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
          if (/console\s*\.\s*log\s*\(/.test(ma)) pham.push(p);
        }
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
    expect(text.match(/clz_[A-Za-z0-9_]{4,}/g)).toBeNull();
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
  it('403 "Access is denied" nói về quyền, không nói hệ thống hỏng', () => {
    const t = dichLoi(BAN, 403, { error: { httpCode: 403, code: '999', message: 'Access is denied for request on GET /courses' } }, 'GET', '/courses');
    expect(t).toContain('không đủ quyền');
    expect(t).toContain('DÙNG THỬ — demo');
  });

  it('500 "invalid token" được hiểu là khoá sai, KHÔNG phải máy chủ sập', () => {
    const t = dichLoi(BAN, 500, { error: { httpCode: 500, code: '999', message: 'invalid token' } }, 'GET', '/courses');
    expect(t).toContain('Khoá API không được bản này chấp nhận');
    expect(t).toContain('khoá của một bản khác');
  });

  it('họ mã 230–235 giữ nguyên văn', () => {
    const t = dichLoi(BAN, 401, { error: { code: '231', message: 'Khoá API này đã bị thu hồi — hãy cấp một khoá mới rồi dán lại vào cấu hình' } }, 'GET', '/courses');
    expect(t).toContain('đã bị thu hồi');
    expect(t).toContain('DÙNG THỬ — demo');
  });

  it('404 nói cả khả năng module đang tắt', () => {
    const t = dichLoi(BAN, 404, '<!DOCTYPE html><pre>Cannot GET /abc</pre>', 'GET', '/abc');
    expect(t).toContain('không có tuyến');
    expect(t).toContain('module chứa tính năng này đang TẮT');
  });
});
