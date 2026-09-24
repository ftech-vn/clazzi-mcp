"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xoaKhoa = xoaKhoa;
exports.dongBan = dongBan;
exports.ketQua = ketQua;
exports.ketQuaLoi = ketQuaLoi;
const cau_hinh_1 = require("../cau-hinh");
/**
 * Đóng gói mọi kết quả công cụ.
 *
 * Hai việc, cả hai đều là hàng rào an toàn chứ không phải trang trí:
 *
 * 1. **Luôn ghi tên bản.** Nhiều bản thật đang chạy cùng một mã nguồn và trả lời giống hệt nhau;
 *    không có gì trong phản hồi cho biết đang nói chuyện với bản nào. Nếu kết quả không tự khai,
 *    mô hình sẽ tường thuật lại cho người dùng mà không ai biết vừa sửa vào đâu.
 * 2. **Xoá khoá khỏi chuỗi trả về.** Khoá không có lý do gì để xuất hiện trong kết quả, nhưng nó
 *    có thể lọt ra qua đường vòng — máy chủ dội lại tiêu đề trong thông điệp lỗi chẳng hạn.
 *    Chặn ở đúng một chỗ cuối cùng thì không phụ thuộc vào việc nhớ cẩn thận ở 27 chỗ khác.
 */
function xoaKhoa(chuoi, khoa) {
    // Khuôn khoá: `<tienToKhoa><prefix>_<bí mật>`, ví dụ `clz_...`. Dựng regex từ tiền tố của
    // thương hiệu đang cấu hình — bản khoá khuôn khác cũng ẩn đúng, không phải ghim cứng `clz_`.
    const tt = (0, cau_hinh_1.cauHinh)().tienToKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`${tt}[A-Za-z0-9_]{4,}`, 'g');
    let ra = chuoi.replace(re, '<khoá đã ẩn>');
    // Khoá không theo khuôn (bản triển khai cũ, hoặc người dùng dán nhầm thẻ JWT) vẫn phải ẩn.
    if (khoa && khoa.length >= 8)
        ra = ra.split(khoa).join('<khoá đã ẩn>');
    return ra;
}
function dongBan(ban) {
    const canh = ban.laHeThat ? ' ⚠ DỮ LIỆU THẬT' : '';
    return `[bản: ${ban.ten} · ${ban.diaChi}${canh}]`;
}
/** Kết quả thành công: một dòng nhận diện bản, rồi thân JSON. */
function ketQua(phien, than) {
    const json = typeof than === 'string' ? than : JSON.stringify(than, null, 2);
    return xoaKhoa(`${dongBan(phien.ban)}\n${json}`, phien.khoa);
}
/** Kết quả lỗi. Vẫn phải mang tên bản: lỗi "không tìm thấy" ở bản nào là hai chuyện khác nhau. */
function ketQuaLoi(phien, thongDiep) {
    return xoaKhoa(`${dongBan(phien.ban)}\nLỖI: ${thongDiep}`, phien.khoa);
}
//# sourceMappingURL=ket-qua.js.map