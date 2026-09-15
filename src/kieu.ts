/** Kiểu dữ liệu dùng chung cho danh mục và các công cụ. */

/** Một tuyến HTTP có thật trong mã nguồn `clazzi-api`. */
export interface Tuyen {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Đường dẫn đầy đủ, giữ nguyên như ghép từ decorator (kể cả dấu `/` cuối). */
  path: string;
  handler: string;
  /**
   * Nội dung trong `@Authorized(...)`. Chuỗi rỗng nghĩa là `@Authorized()` — bất kỳ thẻ hợp lệ
   * nào cũng qua; `null` nghĩa là tuyến công khai, không có `@Authorized` nào cả.
   */
  quyen: string | null;
  /** Tên các `@QueryParam('...')` của handler. */
  thamSoTruyVan: string[];
  /** Tên lớp DTO của `@Body(...)`, nếu đọc được. Dùng để gợi ý hình dạng `duLieu`. */
  than: string | null;
}

/** Năm việc CRUD. Giá trị `null` nghĩa là tuyến đó KHÔNG tồn tại — không được đoán. */
export interface Crud {
  lietKe: string | null;
  xem: string | null;
  tao: string | null;
  sua: string | null;
  xoa: string | null;
}

export interface Nhom {
  /** Tiền tố nhóm = đoạn đầu tiên của đường dẫn, ví dụ `/courses`, `/crm`. */
  tienTo: string;
  ten: string;
  /** Mã module (`CUSTM`, `POSTS`, ...) hoặc `'lõi'` nếu nằm ngoài mọi bản kê module. */
  module: string;
  crud: Crud;
  /** Mọi tuyến không phải một trong năm việc CRUD. */
  tuyenKhac: Tuyen[];
}

export interface DanhMuc {
  quetLuc: string;
  soTuyen: number;
  soNhom: number;
  nhom: Nhom[];
}

export type TenViec = keyof Crud;
