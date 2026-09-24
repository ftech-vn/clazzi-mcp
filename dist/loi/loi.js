"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoiCauHinh = exports.LoiNguoiDung = void 0;
/**
 * Lỗi "người dùng sửa được" — cấu hình sai, gọi sai nhóm, gõ sai đường dẫn.
 *
 * Tách khỏi lỗi lập trình vì hai thứ này phải hiện ra khác nhau: lỗi cấu hình thì in nguyên
 * thông điệp đã soạn sẵn (có hướng dẫn sửa), còn lỗi lập trình thì không được nuốt.
 */
class LoiNguoiDung extends Error {
    constructor(message) {
        super(message);
        this.name = 'LoiNguoiDung';
    }
}
exports.LoiNguoiDung = LoiNguoiDung;
class LoiCauHinh extends LoiNguoiDung {
    constructor(message) {
        super(message);
        this.name = 'LoiCauHinh';
    }
}
exports.LoiCauHinh = LoiCauHinh;
//# sourceMappingURL=loi.js.map