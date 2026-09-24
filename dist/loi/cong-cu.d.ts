import { type Phien } from './phien';
/**
 * Lớp công cụ. CỐ Ý không nhập gì từ `@modelcontextprotocol/sdk`, và cố ý không nhập gì từ phần
 * còn lại của `clazzi-api` (không mô hình, không dịch vụ, không TypeORM).
 *
 * Nhờ vậy toàn bộ luật nghiệp vụ — từ chối việc không tồn tại, chặn đường dẫn ngoài danh mục,
 * ẩn khoá, gắn tên bản — kiểm được bằng test gọi hàm thẳng, và CÙNG MỘT tệp này phục vụ cả hai
 * đường: tuyến HTTP `/mcp` trong `clazzi-api`, và máy chủ stdio ở kho `clazzi-mcp`. Chỉ có một
 * bản định nghĩa 27 công cụ trên đời, nên hai đường không thể trôi khỏi nhau.
 */
export interface DinhNghiaCongCu {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
/**
 * Bộ lọc nhóm lúc khai công cụ.
 *
 * `moduleDangBat` là hàm hỏi cờ module của BẢN TRIỂN KHAI. Đường HTTP truyền vào hàm đọc đúng
 * `ModuleFlagsService` mà `module-gate` dùng — một nguồn sự thật, không phải hai. Đường stdio để
 * trống: tiến trình đó không nối cơ sở dữ liệu nên không hỏi được cờ, và khi ấy công cụ vẫn hiện
 * ra nhưng gọi vào sẽ nhận đúng lỗi 404 mà cổng module trả về.
 *
 * NHẮC CHO NGƯỜI SỬA SAU: lọc ở đây là chuyện HIỂN THỊ, không phải chuyện chặn. Chặn nằm ở
 * `module-gate` và chỉ ở đó. Đừng bao giờ đảo ngược: bỏ lọc này thì cùng lắm mô hình thấy một
 * công cụ gọi vào là 404; bỏ cổng module thì khách chưa mua vẫn dùng được cả một mảng tính năng.
 */
export interface LocKhaiCongCu {
    moduleDangBat?: (maModule: string) => boolean;
}
export declare function dinhNghiaCongCu(loc?: LocKhaiCongCu): DinhNghiaCongCu[];
/**
 * Điểm vào duy nhất cho mọi công cụ. Trả về chuỗi đã đóng gói (có tên bản, đã ẩn khoá) — kể cả
 * khi lỗi: lỗi ném ra khỏi đây thì client MCP hiện một thông báo trơ không nói rõ bản nào.
 */
export declare function chayCongCu(phien: Phien, ten: string, thamSo: Record<string, unknown>): Promise<{
    text: string;
    loi: boolean;
}>;
//# sourceMappingURL=cong-cu.d.ts.map