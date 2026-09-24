"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dichLoi = dichLoi;
exports.goiApi = goiApi;
const loi_1 = require("./loi");
const phien_1 = require("./phien");
const HAN_CHO_MS = 30_000;
/** Gói lỗi chuẩn của `clazzi-api`: `{"error":{"httpCode":..,"code":"..","message":".."}}`. */
function docGoiLoi(than) {
    if (typeof than !== 'object' || than === null)
        return null;
    const e = than.error;
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
function dichLoi(ban, status, than, method, duongDan) {
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
            `Kiểm tra khoá đang dùng có đúng là khoá của ${ban.diaChi} không.`,
            'Khoá cũng có thể đã bị thu hồi hoặc hết hạn; khi đó phải cấp lại ở màn Cài đặt → Khoá API.',
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
            `Bản này không có tuyến ${method} ${duongDan} ${duoi}.`,
            'Hai khả năng: (1) module chứa tính năng này đang TẮT ở bản triển khai của bạn — hỏi người',
            'quản trị để bật hoặc mua thêm; (2) bản đang trỏ chạy phiên bản khác với danh mục.',
        ].join('\n');
    }
    if (status === 422 || status === 400) {
        return `Dữ liệu gửi lên không hợp lệ ${duoi}.\n${loiNhan || JSON.stringify(than)}`;
    }
    return `Máy chủ trả lỗi ${status} ${duoi}.\n${loiNhan || (typeof than === 'string' ? than.slice(0, 500) : JSON.stringify(than))}`;
}
async function goiApi({ phien, method, duongDan, thamSo, than }) {
    const khoa = (0, phien_1.khoaBatBuoc)(phien);
    const goc = (0, phien_1.diaChiGoiCua)(phien);
    const u = new URL(duongDan.startsWith('/') ? duongDan : `/${duongDan}`, `${goc}/`);
    for (const [k, v] of Object.entries(thamSo ?? {})) {
        if (v !== undefined && v !== null && v !== '')
            u.searchParams.set(k, String(v));
    }
    const dau = new AbortController();
    const hen = setTimeout(() => dau.abort(), HAN_CHO_MS);
    let phanHoi;
    try {
        phanHoi = await fetch(u, {
            method,
            headers: {
                // Tiêu đề chuyển tiếp (ví dụ `centerId`) đặt TRƯỚC — để `Authorization` bên dưới luôn
                // thắng. Người gọi không được phép đổi danh tính bằng cách nhét tiêu đề vào đây.
                ...(phien.tieuDeThem ?? {}),
                Authorization: `Bearer ${khoa}`,
                Accept: 'application/json',
                ...(than === undefined ? {} : { 'Content-Type': 'application/json' }),
            },
            body: than === undefined ? undefined : JSON.stringify(than),
            signal: dau.signal,
        });
    }
    catch (e) {
        const ly = e instanceof Error && e.name === 'AbortError' ? `quá ${HAN_CHO_MS / 1000} giây không trả lời` : String(e);
        throw new loi_1.LoiNguoiDung(`Không gọi được ${method} ${u.pathname} tại bản ${phien.ban.ten} (${phien.ban.diaChi}): ${ly}`);
    }
    finally {
        clearTimeout(hen);
    }
    const chu = await phanHoi.text();
    // Thân có thể là HTML (trang lỗi 404 của Express) hoặc rỗng (204 sau khi xoá).
    let duLieu = chu;
    try {
        duLieu = chu ? JSON.parse(chu) : null;
    }
    catch {
        /* giữ nguyên chuỗi thô */
    }
    if (!phanHoi.ok)
        throw new loi_1.LoiNguoiDung(dichLoi(phien.ban, phanHoi.status, duLieu, method, u.pathname));
    return { status: phanHoi.status, duLieu };
}
//# sourceMappingURL=http.js.map