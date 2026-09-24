"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datCauHinh = datCauHinh;
exports.cauHinh = cauHinh;
exports.quenCauHinh = quenCauHinh;
let HIEN_TAI = null;
/**
 * Đặt cấu hình thương hiệu cho cả tiến trình. Gọi ĐÚNG MỘT LẦN, sớm nhất có thể — trước khi dựng
 * máy chủ MCP hay gọi bất kỳ công cụ nào. Gọi lại (ví dụ trong test) làm mới mọi chỉ mục dẫn xuất.
 */
function datCauHinh(c) {
    HIEN_TAI = c;
}
/** Cấu hình hiện hành. Ném lỗi rõ ràng nếu quên `datCauHinh` — thà chết sớm còn hơn khai công cụ trống. */
function cauHinh() {
    if (!HIEN_TAI) {
        throw new Error('Chưa gọi datCauHinh(...): gói lõi MCP cần một CauHinhThuongHieu trước khi dùng. Xem src/bo-noi/du-lieu.');
    }
    return HIEN_TAI;
}
/** Chỉ dùng trong test: quên cấu hình để lượt sau bắt buộc đặt lại. */
function quenCauHinh() {
    HIEN_TAI = null;
}
//# sourceMappingURL=cau-hinh.js.map