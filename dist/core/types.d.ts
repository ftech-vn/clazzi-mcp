/** Kiểu dữ liệu dùng chung cho danh mục và các công cụ. */
/** Một tuyến HTTP có thật trong mã nguồn `clazzi-api`. */
export interface Route {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    /** Đường dẫn đầy đủ, giữ nguyên như ghép từ decorator (kể cả dấu `/` cuối). */
    path: string;
    handler: string;
    /**
     * Nội dung trong `@Authorized(...)`. Chuỗi rỗng nghĩa là `@Authorized()` — bất kỳ thẻ hợp lệ
     * nào cũng qua; `null` nghĩa là tuyến công khai, không có `@Authorized` nào cả.
     */
    authorized: string | null;
    /** Tên các `@QueryParam('...')` của handler. */
    queryParams: string[];
    /** Tên lớp DTO của `@Body(...)`, nếu đọc được. Dùng để gợi ý hình dạng `duLieu`. */
    bodyDto: string | null;
}
/** Năm việc CRUD. Giá trị `null` nghĩa là tuyến đó KHÔNG tồn tại — không được đoán. */
export interface Crud {
    list: string | null;
    get: string | null;
    create: string | null;
    update: string | null;
    remove: string | null;
}
export interface Group {
    /** Tiền tố nhóm = đoạn đầu tiên của đường dẫn, ví dụ `/courses`, `/crm`. */
    prefix: string;
    name: string;
    /** Mã module (`CUSTM`, `POSTS`, ...) hoặc `'lõi'` nếu nằm ngoài mọi bản kê module. */
    module: string;
    crud: Crud;
    /** Mọi tuyến không phải một trong năm việc CRUD. */
    otherRoutes: Route[];
}
export interface Catalog {
    scannedAt: string;
    routeCount: number;
    groupCount: number;
    groups: Group[];
}
export type CrudAction = keyof Crud;
/**
 * Một MẢNG nghiệp vụ = một công cụ MCP gom nhiều nhóm tuyến lại.
 *
 * Trước đây kiểu này nằm trong `domains.ts` cạnh dữ liệu; kéo lên đây (tệp thuần kiểu, không phụ
 * thuộc gì) để `config.ts` tham chiếu được mà không tạo vòng import với phần logic của `domains.ts`.
 */
export interface Domain {
    /** Tên công cụ MCP đầy đủ, ví dụ `clazzi_hoc_vien`. Tiền tố khớp `BrandConfig.tienTo`. */
    name: string;
    /** Mô tả công cụ — mô hình đọc cái này để chọn công cụ, nên phải nói đúng việc nghiệp vụ. */
    description: string;
    /** Các tiền tố nhóm thuộc mảng, theo đúng `tienTo` trong danh mục. */
    groups: string[];
}
//# sourceMappingURL=types.d.ts.map