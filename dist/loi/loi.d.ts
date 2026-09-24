/**
 * Lỗi "người dùng sửa được" — cấu hình sai, gọi sai nhóm, gõ sai đường dẫn.
 *
 * Tách khỏi lỗi lập trình vì hai thứ này phải hiện ra khác nhau: lỗi cấu hình thì in nguyên
 * thông điệp đã soạn sẵn (có hướng dẫn sửa), còn lỗi lập trình thì không được nuốt.
 */
export declare class LoiNguoiDung extends Error {
    constructor(message: string);
}
export declare class LoiCauHinh extends LoiNguoiDung {
    constructor(message: string);
}
//# sourceMappingURL=loi.d.ts.map