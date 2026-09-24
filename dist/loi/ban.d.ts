/**
 * "Bản" = một bản triển khai đang chạy.
 *
 * Đây là chỗ dễ gây hoạ nhất của cả bộ: nhiều bản thật đang chạy, dùng CHUNG một mã nguồn, chung
 * một hình dạng dữ liệu, và trả lời giống hệt nhau. Không có gì trong phản hồi API cho biết ta
 * đang nói chuyện với bản nào. Nên tên bản phải do PHÍA NÀY gắn vào, từ địa chỉ, và phải đi kèm
 * MỌI kết quả — nếu không, một lệnh xoá gõ nhầm bản là xoá vào lớp học của khách trả tiền.
 *
 * Bảng host→tên và địa chỉ mặc định KHÔNG còn ghim ở đây: chúng khác nhau theo thương hiệu nên
 * nằm trong cấu hình (`CauHinhThuongHieu.daBiet`, `.diaChiMacDinh`).
 */
export interface Ban {
    ten: string;
    diaChi: string;
    /** Có phải dữ liệu thật của khách trả tiền không. Dùng để cảnh báo, không để chặn. */
    laHeThat: boolean;
}
export declare function nhanDienBan(diaChiTho?: string): Ban;
export declare function banHienTai(): Ban;
//# sourceMappingURL=ban.d.ts.map