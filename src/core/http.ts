import type { Deployment } from './deployment';
import { UserError } from './errors';
import { callBaseUrlOf, requireApiKey, type Session } from './session';

/**
 * Lớp gọi HTTP tới một bản CLAZZI, kèm việc dịch lỗi sang tiếng người.
 *
 * Phần dịch lỗi quan trọng hơn phần gọi: `clazzi-api` trả về vài hình dạng lỗi khác nhau và
 * không hình dạng nào tự giải thích. Để nguyên thì mô hình đọc "500 invalid token" rồi kết luận
 * hệ thống hỏng và đi thử lung tung — trong khi thật ra chỉ là khoá sai.
 *
 * MỘT ĐƯỜNG DUY NHẤT, KỂ CẢ KHI CHẠY TRONG CHÍNH MÁY CHỦ. Khi lõi này phục vụ tuyến `/mcp` của
 * `clazzi-api`, nó vẫn gọi HTTP thật — về `127.0.0.1` của chính tiến trình đó. Nghe thừa, nhưng
 * đó chính là điểm mấu chốt: lượt gọi đi lại từ đầu qua `apiKeyAuth` → `demoReadOnly` →
 * `moduleGate` → `authorizationChecker`/`currentUserChecker` → phép kiểm phạm vi lớp và trung
 * tâm. Không có một dòng nào đi tắt, nên không có cách nào để MCP nới thêm quyền hay lọt qua
 * công tắc module — nó KHÔNG phải một đường song song, nó là đúng lượt gọi mà khách tự gọi.
 */

export interface CallResult {
  status: number;
  data: unknown;
}

const TIMEOUT_MS = 30_000;

/** Gói lỗi chuẩn của `clazzi-api`: `{"error":{"httpCode":..,"code":"..","message":".."}}`. */
function readErrorEnvelope(body: unknown): { code?: string; message?: string } | null {
  if (typeof body !== 'object' || body === null) return null;
  const e = (body as Record<string, unknown>).error;
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
export function translateError(ban: Deployment, status: number, body: unknown, method: string, path: string): string {
  const envelope = readErrorEnvelope(body);
  const serverMessage = envelope?.message ?? '';
  const context = `(${method} ${path} · bản: ${ban.name} · ${ban.url})`;

  /**
   * `clazzi-api` đã soạn sẵn thông điệp tiếng Việt rất rõ cho họ mã 230–235 (khoá hỏng, bị thu
   * hồi, hết hạn, khoá không được cấp khoá…). Bọc thêm lời của ta vào chỉ làm loãng — trả thẳng.
   */
  if (envelope?.code && /^23[0-5]$/.test(envelope.code)) {
    return `${serverMessage} ${context}`;
  }

  const looksLikeBadKey = /invalid token|jwt|token/i.test(serverMessage);
  if (status === 401 || looksLikeBadKey) {
    return [
      `Khoá API không được bản này chấp nhận ${context}.`,
      'Khoá cấp theo TỪNG BẢN — rất có thể đây là khoá của một bản khác, chứ không phải khoá hỏng.',
      `Kiểm tra khoá đang dùng có đúng là khoá của ${ban.url} không.`,
      'Khoá cũng có thể đã bị thu hồi hoặc hết hạn; khi đó phải cấp lại ở màn Cài đặt → Khoá API.',
      serverMessage ? `Máy chủ nói: ${serverMessage}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (status === 403) {
    return [
      `Tài khoản của khoá này không đủ quyền cho ${context}.`,
      'Khoá API không bao giờ nới thêm quyền — nó chỉ là cách khác để chứng minh mình là tài khoản đó.',
      'Muốn làm được việc này thì phải sửa chức danh của tài khoản, không phải đổi khoá.',
      serverMessage ? `Máy chủ nói: ${serverMessage}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * 404 có HAI nguyên nhân rất khác nhau và người dùng phải phân biệt được:
   *  - tuyến không tồn tại ở bản này (danh mục lệch phiên bản), hoặc
   *  - **module sở hữu tuyến đó đang TẮT** — `module-gate` cố ý trả 404 chứ không 403, để người
   *    ngoài không biết tính năng có tồn tại hay không.
   * Nói cả hai khả năng ra: bảo khách "hệ thống hỏng" trong khi thật ra họ chưa mua CRM là cách
   * chắc chắn nhất để mất một cuộc gọi bán hàng.
   */
  if (status === 404) {
    return [
      `Bản này không có tuyến ${method} ${path} ${context}.`,
      'Hai khả năng: (1) module chứa tính năng này đang TẮT ở bản triển khai của bạn — hỏi người',
      'quản trị để bật hoặc mua thêm; (2) bản đang trỏ chạy phiên bản khác với danh mục.',
    ].join('\n');
  }

  if (status === 422 || status === 400) {
    return `Dữ liệu gửi lên không hợp lệ ${context}.\n${serverMessage || JSON.stringify(body)}`;
  }

  return `Máy chủ trả lỗi ${status} ${context}.\n${serverMessage || (typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body))}`;
}

export interface CallParams {
  session: Session;
  method: string;
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
}

export async function callApi({ session, method, path, query, body }: CallParams): Promise<CallResult> {
  const apiKey = requireApiKey(session);
  const baseUrl = callBaseUrlOf(session);

  const u = new URL(path.startsWith('/') ? path : `/${path}`, `${baseUrl}/`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(u, {
      method,
      headers: {
        // Tiêu đề chuyển tiếp (ví dụ `centerId`) đặt TRƯỚC — để `Authorization` bên dưới luôn
        // thắng. Người gọi không được phép đổi danh tính bằng cách nhét tiêu đề vào đây.
        ...(session.extraHeaders ?? {}),
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    const reason = e instanceof Error && e.name === 'AbortError' ? `quá ${TIMEOUT_MS / 1000} giây không trả lời` : String(e);
    throw new UserError(`Không gọi được ${method} ${u.pathname} tại bản ${session.deployment.name} (${session.deployment.url}): ${reason}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  // Thân có thể là HTML (trang lỗi 404 của Express) hoặc rỗng (204 sau khi xoá).
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* giữ nguyên chuỗi thô */
  }

  if (!response.ok) throw new UserError(translateError(session.deployment, response.status, data, method, u.pathname));
  return { status: response.status, data };
}
