"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = setConfig;
exports.getConfig = getConfig;
exports.resetConfig = resetConfig;
let current = null;
/**
 * Đặt cấu hình thương hiệu cho cả tiến trình. Gọi ĐÚNG MỘT LẦN, sớm nhất có thể — trước khi dựng
 * máy chủ MCP hay gọi bất kỳ công cụ nào. Gọi lại (ví dụ trong test) làm mới mọi chỉ mục dẫn xuất.
 */
function setConfig(c) {
    current = c;
}
/** Cấu hình hiện hành. Ném lỗi rõ ràng nếu quên `setConfig` — thà chết sớm còn hơn khai công cụ trống. */
function getConfig() {
    if (!current) {
        throw new Error('Chưa gọi setConfig(...): gói lõi MCP cần một BrandConfig trước khi dùng. Xem src/stdio/data.');
    }
    return current;
}
/** Chỉ dùng trong test: quên cấu hình để lượt sau bắt buộc đặt lại. */
function resetConfig() {
    current = null;
}
//# sourceMappingURL=config.js.map