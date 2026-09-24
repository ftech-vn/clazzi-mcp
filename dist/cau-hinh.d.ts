import type { DanhMuc, Mang } from './loi/kieu';
/**
 * CẤU HÌNH THƯƠNG HIỆU — thứ tách một bản triển khai này khỏi bản kia.
 *
 * ── Vì sao là một singleton đặt-MỘT-LẦN, không phải tham số truyền xuyên suốt ────────────────
 * Có hai trục biến thiên trong hệ này, và chúng ở hai tầng khác nhau:
 *
 *   • DANH TÍNH người gọi (khoá API) đổi theo TỪNG LƯỢT GỌI — một `clazzi-api` phục vụ mọi khách
 *     cùng lúc. Cái đó đi theo `Phien`, tham số, không bao giờ là toàn cục. (Xem `loi/phien.ts`.)
 *
 *   • THƯƠNG HIỆU (tiền tố tên công cụ, danh mục tuyến, bảng bản đã biết, tên biến môi trường)
 *     đổi theo TỪNG TIẾN TRÌNH — một tiến trình `clazzi-api` chỉ phục vụ đúng một bản (`clazzi`),
 *     một tiến trình `otm-api` chỉ phục vụ `gecko`. Không có tiến trình nào vừa là clazzi vừa là
 *     gecko. Nên thương hiệu là hằng của cả đời tiến trình — đặt một lần lúc khởi động là đúng
 *     mô hình, và tránh phải luồn `cfg` qua chữ ký của 27 công cụ.
 *
 * Trước đây các hằng này ghim thẳng trong mã lõi (`clazzi_`, `CLAZZI_API_KEY`, bảng `DA_BIET`…),
 * nên clazzi và gecko phải giữ HAI BẢN CHÉP của cả lõi rồi trôi khỏi nhau. Kéo hết phần khác
 * nhau vào đây thì lõi chỉ còn một bản trên đời; mỗi host chỉ mang theo bảng cấu hình của mình.
 */
export interface CauHinhThuongHieu {
    /**
     * Tiền tố định danh, ví dụ `clazzi` / `gecko` / `knb` / `peptalk`.
     *
     * Suy ra: tên máy chủ MCP, tên ba công cụ meta (`<tienTo>_trang_thai`, `_mo_ta`, `_goi`), và
     * xuất hiện trong thông điệp lỗi. KHÔNG được để trống — bảng công cụ sẽ mất tên.
     */
    tienTo: string;
    /** Tên biến môi trường chứa ĐỊA CHỈ bản (đường stdio đọc từ đây). Ví dụ `CLAZZI_API_URL`. */
    bienUrl: string;
    /** Tên biến môi trường chứa KHOÁ API (đường stdio đọc từ đây). Ví dụ `CLAZZI_API_KEY`. */
    bienKhoa: string;
    /**
     * Tiền tố khuôn khoá, ví dụ `clz_`. Dùng cho bộ ẩn khoá và phần nhận diện khoá.
     *
     * clazzi và gecko dùng CHUNG `clz_`; tách ra đây để bản sau (khoá khuôn khác) không phải sửa
     * lõi — và để bộ ẩn khoá của bản này không vô tình bỏ sót khoá khuôn khác.
     */
    tienToKhoa: string;
    /** Địa chỉ mặc định khi thiếu biến môi trường — cố ý trỏ vào chỗ hỏng được (demo), không phải hệ thật. */
    diaChiMacDinh: string;
    /**
     * Bảng host → tên bản + có phải hệ thật không. Nhiều bản chạy chung mã nguồn và trả lời giống
     * hệt nhau; bảng này là cách phía MCP GẮN TÊN cho từng bản để mọi kết quả tự khai mình thuộc đâu.
     * Host lạ (không có trong bảng) mặc định coi là HỆ THẬT — đoán sai theo hướng thận trọng.
     */
    daBiet: Record<string, {
        ten: string;
        laHeThat: boolean;
    }>;
    /** Bản đồ MẢNG nghiệp vụ → nhóm tuyến. Mỗi phần tử là một công cụ MCP. Xem `loi/kieu.ts`. */
    mang: Mang[];
    /** Tên tiếng Việt của từng nhóm (tiền tố → tên). Dùng cho scanner và phần mô tả. */
    tenNhom: Record<string, string>;
    /** Danh mục = ảnh chụp mã nguồn máy chủ, do scanner sinh ra. Bảng công cụ co theo danh mục này. */
    danhMuc: DanhMuc;
}
/**
 * Đặt cấu hình thương hiệu cho cả tiến trình. Gọi ĐÚNG MỘT LẦN, sớm nhất có thể — trước khi dựng
 * máy chủ MCP hay gọi bất kỳ công cụ nào. Gọi lại (ví dụ trong test) làm mới mọi chỉ mục dẫn xuất.
 */
export declare function datCauHinh(c: CauHinhThuongHieu): void;
/** Cấu hình hiện hành. Ném lỗi rõ ràng nếu quên `datCauHinh` — thà chết sớm còn hơn khai công cụ trống. */
export declare function cauHinh(): CauHinhThuongHieu;
/** Chỉ dùng trong test: quên cấu hình để lượt sau bắt buộc đặt lại. */
export declare function quenCauHinh(): void;
//# sourceMappingURL=cau-hinh.d.ts.map