import type { Crud, DanhMuc, Tuyen } from '../loi/kieu';
/** Nhóm = đoạn đầu tiên của đường dẫn. `/crm/customers/` và `/crm/tasks/` cùng về `/crm`. */
export declare function nhomCuaDuongDan(path: string): string;
export declare function timTepController(goc: string): string[];
/**
 * Bản kê module: ánh xạ tiền tố tuyến → mã module. Đọc từ `src/modules/<ten>/ban-ke.ts`.
 * Thứ tự khai báo có ý nghĩa: nhóm `/crm` gom bảy controller mang bốn mã module khác nhau, và ta
 * lấy mã của mục ĐẦU TIÊN — cùng luật mà `CHUC-NANG-VA-API.md` đã dùng (`/crm` → `CUSTM`).
 */
export declare function docBanKeModule(goc: string): {
    tienTo: string;
    module: string;
}[];
/** Quét một tệp controller ra danh sách tuyến. */
export declare function quetTep(duongDanTep: string): Tuyen[];
/** Xếp các tuyến của một nhóm vào năm ô CRUD; ô nào không có tuyến thật thì để `null`. */
export declare function xepCrud(tienTo: string, tuyen: Tuyen[]): {
    crud: Crud;
    con: Tuyen[];
};
/**
 * @param tenNhom Bảng tiền tố→tên tiếng Việt của thương hiệu. Tên không suy ra được từ mã
 *   nguồn (controller chỉ có tiền tố tiếng Anh), nên phải truyền vào — mỗi thương hiệu một bảng.
 *   Nhóm chưa có tên thì hiển thị luôn tiền tố, không vỡ.
 */
export declare function quetKho(gocClazziApi: string, tenNhom?: Record<string, string>): DanhMuc;
//# sourceMappingURL=quet-nguon.d.ts.map