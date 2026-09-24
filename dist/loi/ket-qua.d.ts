import type { Ban } from './ban';
import type { Phien } from './phien';
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
export declare function xoaKhoa(chuoi: string, khoa: string | null): string;
export declare function dongBan(ban: Ban): string;
/** Kết quả thành công: một dòng nhận diện bản, rồi thân JSON. */
export declare function ketQua(phien: Phien, than: unknown): string;
/** Kết quả lỗi. Vẫn phải mang tên bản: lỗi "không tìm thấy" ở bản nào là hai chuyện khác nhau. */
export declare function ketQuaLoi(phien: Phien, thongDiep: string): string;
//# sourceMappingURL=ket-qua.d.ts.map