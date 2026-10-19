"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = exports.UserError = void 0;
/**
 * Lỗi "người dùng sửa được" — cấu hình sai, gọi sai nhóm, gõ sai đường dẫn.
 *
 * Tách khỏi lỗi lập trình vì hai thứ này phải hiện ra khác nhau: lỗi cấu hình thì in nguyên
 * thông điệp đã soạn sẵn (có hướng dẫn sửa), còn lỗi lập trình thì không được nuốt.
 */
class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserError';
    }
}
exports.UserError = UserError;
class ConfigError extends UserError {
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
//# sourceMappingURL=errors.js.map