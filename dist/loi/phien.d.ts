import type { Ban } from './ban';
/**
 * Một PHIÊN gọi công cụ: đang nói chuyện với bản nào, và mang khoá nào.
 *
 * Trước đây khoá đọc thẳng từ `process.env.CLAZZI_API_KEY` ở tầng sâu nhất. Điều đó đúng với
 * máy chủ stdio — mỗi tiến trình phục vụ đúng một người — nhưng SAI hoàn toàn với đường HTTP:
 * một tiến trình `clazzi-api` phục vụ mọi khách cùng lúc, mỗi lượt gọi mang khoá riêng. Đọc từ
 * biến môi trường ở đó thì hoặc là không có khoá nào, hoặc tệ hơn nhiều: khoá của người này
 * dùng cho lượt gọi của người kia.
 *
 * Nên khoá đi theo THAM SỐ, xuyên suốt từ điểm vào tới lúc gọi HTTP. Không có trạng thái toàn
 * cục nào giữ khoá, nên không có đường nào để hai phiên lẫn vào nhau.
 */
export interface Phien {
    /** Bản triển khai đang nói chuyện — dùng để HIỂN THỊ, đi kèm mọi kết quả. */
    ban: Ban;
    /** Chuỗi khoá thô. `null` nghĩa là chưa dán khoá — chỉ gọi được tuyến công khai. */
    khoa: string | null;
    /**
     * Địa chỉ gốc THẬT SỰ dùng để gọi. Bỏ trống thì dùng `ban.diaChi`.
     *
     * Tách khỏi `ban.diaChi` vì đường HTTP trong máy chủ gọi vòng về `http://127.0.0.1:4000` —
     * địa chỉ đó đúng để gọi nhưng vô nghĩa với người đọc, và nếu đem nó đi hiển thị thì mọi kết
     * quả đều mang tên "KHÔNG RÕ — 127.0.0.1", đúng lúc người dùng cần biết mình đang sửa vào bản
     * nào nhất.
     */
    diaChiGoi?: string;
    /**
     * Tiêu đề HTTP chuyển tiếp thêm cho mỗi lượt gọi, ví dụ `centerId`.
     *
     * CHỈ dùng cho tiêu đề chọn phạm vi, TUYỆT ĐỐI không nhét `Authorization` vào đây: khoá đi
     * theo `khoa`, và `goiApi` đặt `Authorization` sau cùng để không ai ghi đè được nó.
     */
    tieuDeThem?: Record<string, string>;
}
/** Địa chỉ dùng để gọi thật. */
export declare function diaChiGoiCua(phien: Phien): string;
/** Phiên của máy chủ stdio: một tiến trình, một người, đọc từ biến môi trường của thương hiệu. */
export declare function phienTuMoiTruong(): Phien;
/**
 * Phần nhận diện khoá: 12 ký tự prefix, cố ý công khai (hợp đồng §3.1) — đủ để người dùng đối
 * chiếu "khoá tôi dán vào demo có đúng là khoá của demo không", không đủ để dùng.
 *
 * Trả về KHÔNG kèm chữ `clz_`. Bộ ẩn khoá ở `ket-qua.ts` quét mọi chuỗi `clz_…` và xoá sạch —
 * đúng như thế là tốt, đừng nới nó ra để lọt cái prefix này; nới một lần là mở đường cho khoá
 * thật lọt theo. Bỏ tiền tố đi thì hai luật cùng đúng, không phải đánh đổi.
 */
export declare function dauKhoa(phien: Phien): string | null;
/**
 * Lấy khoá để gắn vào lượt gọi, hoặc ném lỗi có hướng dẫn dán khoá vào đâu.
 *
 * Đây là CHỖ DUY NHẤT trong lõi biết khoá đến từ đâu. Tám công cụ chỉ biết "phiên có khoá",
 * không biết nguồn — giữ ranh giới đó nên thêm được đường HTTP mà không sờ vào công cụ nào.
 */
export declare function khoaBatBuoc(phien: Phien): string;
//# sourceMappingURL=phien.d.ts.map