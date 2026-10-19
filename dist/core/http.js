"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateError = translateError;
exports.callApi = callApi;
const errors_1 = require("./errors");
const session_1 = require("./session");
const TIMEOUT_MS = 30_000;
/** Gói lỗi chuẩn của `clazzi-api`: `{"error":{"httpCode":..,"code":"..","message":".."}}`. */
function readErrorEnvelope(body) {
    if (typeof body !== 'object' || body === null)
        return null;
    const e = body.error;
    if (typeof e !== 'object' || e === null)
        return null;
    const o = e;
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
function translateError(ban, status, body, method, path) {
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
async function callApi({ session, method, path, query, body }) {
    const apiKey = (0, session_1.requireApiKey)(session);
    const baseUrl = (0, session_1.callBaseUrlOf)(session);
    const u = new URL(path.startsWith('/') ? path : `/${path}`, `${baseUrl}/`);
    for (const [k, v] of Object.entries(query ?? {})) {
        if (v !== undefined && v !== null && v !== '')
            u.searchParams.set(k, String(v));
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
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
    }
    catch (e) {
        const reason = e instanceof Error && e.name === 'AbortError' ? `quá ${TIMEOUT_MS / 1000} giây không trả lời` : String(e);
        throw new errors_1.UserError(`Không gọi được ${method} ${u.pathname} tại bản ${session.deployment.name} (${session.deployment.url}): ${reason}`);
    }
    finally {
        clearTimeout(timer);
    }
    const text = await response.text();
    // Thân có thể là HTML (trang lỗi 404 của Express) hoặc rỗng (204 sau khi xoá).
    let data = text;
    try {
        data = text ? JSON.parse(text) : null;
    }
    catch {
        /* giữ nguyên chuỗi thô */
    }
    if (!response.ok)
        throw new errors_1.UserError(translateError(session.deployment, response.status, data, method, u.pathname));
    return { status: response.status, data };
}
//# sourceMappingURL=http.js.map