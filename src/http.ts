import type { Ban } from './ban.js';
import { layTheXacThuc } from './the.js';
import { LoiNguoiDung } from './loi.js';

/**
 * Lớp gọi HTTP tới một bản CLAZZI, kèm việc dịch lỗi sang tiếng người.
 *
 * Phần dịch lỗi quan trọng hơn phần gọi: `clazzi-api` trả về vài hình dạng lỗi khác nhau và
 * không hình dạng nào tự giải thích. Để nguyên thì mô hình đọc "500 invalid token" rồi kết luận
 * hệ thống hỏng và đi thử lung tung — trong khi thật ra chỉ là khoá sai.
 */

export interface KetQuaGoi {
  status: number;
  duLieu: unknown;
}

const HAN_CHO_MS = 30_000;

/** Gói lỗi chuẩn của `clazzi-api`: `{"error":{"httpCode":..,"code":"..","message":".."}}`. */
function docGoiLoi(than: unknown): { code?: string; message?: string } | null {
  if (typeof than !== 'object' || than === null) return null;
  const e = (than as Record<string, unknown>).error;
  if (typeof e !== 'object' || e === null) return null;
  const o = e as Record<string, unknown>;
  return { code: typeof o.code === 'string' ? o.code : undefined, message: typeof o.message === 'string' ? o.message : undefined };
}

/**
 * Dịch một phản hồi lỗi thành thông điệp hành động được.
 *
 * Ba ca đo được thật trên `api-demo.clazzi.vn`, không phải suy đoán:
 *  - không gửi thẻ  → **403** code 999 "Access is denied for request on ..."
 *  - thẻ/khoá hỏng  → **500** code 999 "invalid token"  (đúng vậy, 500 chứ không phải 401)
 *  - đường dẫn lạ   → **404** và thân là HTML của Express, không phải JSON
 * Nên KHÔNG được chỉ nhìn mã HTTP: phải nhìn cả `message`.
 */
export function dichLoi(ban: Ban, status: number, than: unknown, method: string, duongDan: string): string {
  const goi = docGoiLoi(than);
  const loiNhan = goi?.message ?? '';
  const duoi = `(${method} ${duongDan} · bản: ${ban.ten} · ${ban.diaChi})`;

  /**
   * `clazzi-api` đã soạn sẵn thông điệp tiếng Việt rất rõ cho họ mã 230–235 (khoá hỏng, bị thu
   * hồi, hết hạn, khoá không được cấp khoá…). Bọc thêm lời của ta vào chỉ làm loãng — trả thẳng.
   */
  if (goi?.code && /^23[0-5]$/.test(goi.code)) {
    return `${loiNhan} ${duoi}`;
  }

  const khoaHong = /invalid token|jwt|token/i.test(loiNhan);
  if (status === 401 || khoaHong) {
    return [
      `Khoá API không được bản này chấp nhận ${duoi}.`,
      'Khoá cấp theo TỪNG BẢN — rất có thể đây là khoá của một bản khác, chứ không phải khoá hỏng.',
      `Kiểm tra CLAZZI_API_KEY trong khối "env" có đúng là khoá của ${ban.diaChi} không.`,
      'Khoá cũng có thể đã bị thu hồi hoặc hết hạn; khi đó phải cấp lại bằng POST /api-keys từ một phiên đăng nhập thật.',
      loiNhan ? `Máy chủ nói: ${loiNhan}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (status === 403) {
    return [
      `Tài khoản của khoá này không đủ quyền cho ${duoi}.`,
      'Khoá API không bao giờ nới thêm quyền — nó chỉ là cách khác để chứng minh mình là tài khoản đó.',
      'Muốn làm được việc này thì phải sửa chức danh của tài khoản, không phải đổi khoá.',
      loiNhan ? `Máy chủ nói: ${loiNhan}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (status === 404) {
    return `Bản này không có tuyến ${method} ${duongDan} ${duoi}.\nDanh mục được quét từ mã nguồn, nên có thể bản đang trỏ chạy phiên bản khác. Chạy lại scripts/quet-api.ts để đồng bộ.`;
  }

  if (status === 422 || status === 400) {
    return `Dữ liệu gửi lên không hợp lệ ${duoi}.\n${loiNhan || JSON.stringify(than)}`;
  }

  return `Máy chủ trả lỗi ${status} ${duoi}.\n${loiNhan || (typeof than === 'string' ? than.slice(0, 500) : JSON.stringify(than))}`;
}

export interface ThamSoGoi {
  ban: Ban;
  method: string;
  duongDan: string;
  thamSo?: Record<string, unknown>;
  than?: unknown;
}

export async function goiApi({ ban, method, duongDan, thamSo, than }: ThamSoGoi): Promise<KetQuaGoi> {
  const khoa = await layTheXacThuc(ban);

  const u = new URL(duongDan.startsWith('/') ? duongDan : `/${duongDan}`, `${ban.diaChi}/`);
  for (const [k, v] of Object.entries(thamSo ?? {})) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }

  const dau = new AbortController();
  const hen = setTimeout(() => dau.abort(), HAN_CHO_MS);
  let phanHoi: Response;
  try {
    phanHoi = await fetch(u, {
      method,
      headers: {
        Authorization: `Bearer ${khoa}`,
        Accept: 'application/json',
        ...(than === undefined ? {} : { 'Content-Type': 'application/json' }),
        // `clazzi-api` lọc theo cơ sở qua tiêu đề này. Không đặt thì máy chủ tự suy ra phạm vi
        // từ tài khoản — đó mới là mặc định an toàn, nên biến môi trường là TUỲ CHỌN.
        ...(process.env.CLAZZI_CENTER_ID ? { centerId: process.env.CLAZZI_CENTER_ID } : {}),
      },
      body: than === undefined ? undefined : JSON.stringify(than),
      signal: dau.signal,
    });
  } catch (e) {
    const ly = e instanceof Error && e.name === 'AbortError' ? `quá ${HAN_CHO_MS / 1000} giây không trả lời` : String(e);
    throw new LoiNguoiDung(`Không gọi được ${method} ${u.pathname} tại bản ${ban.ten} (${ban.diaChi}): ${ly}`);
  } finally {
    clearTimeout(hen);
  }

  const chu = await phanHoi.text();
  // Thân có thể là HTML (trang lỗi 404 của Express) hoặc rỗng (204 sau khi xoá).
  let duLieu: unknown = chu;
  try {
    duLieu = chu ? JSON.parse(chu) : null;
  } catch {
    /* giữ nguyên chuỗi thô */
  }

  if (!phanHoi.ok) throw new LoiNguoiDung(dichLoi(ban, phanHoi.status, duLieu, method, u.pathname));
  return { status: phanHoi.status, duLieu };
}
