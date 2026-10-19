import type { Crud, Catalog, Route } from '../core/types';
/** Nhóm = đoạn đầu tiên của đường dẫn. `/crm/customers/` và `/crm/tasks/` cùng về `/crm`. */
export declare function groupOfPath(path: string): string;
export declare function findControllerFiles(root: string): string[];
/**
 * Bản kê module: ánh xạ tiền tố tuyến → mã module. Đọc từ `src/modules/<ten>/manifest.ts`
 * (`{ prefix, module }`). Vẫn đọc khuôn cũ `ban-ke.ts` (`{ tienTo, module }`) cho các kho chưa đổi
 * tên sang tiếng Anh — clazzi-api đổi ngày 13/10/2026.
 * Thứ tự khai báo có ý nghĩa: nhóm `/crm` gom bảy controller mang bốn mã module khác nhau, và ta
 * lấy mã của mục ĐẦU TIÊN — cùng luật mà `CHUC-NANG-VA-API.md` đã dùng (`/crm` → `CUSTM`).
 */
export declare function readModuleManifests(root: string): {
    prefix: string;
    module: string;
}[];
/** Quét một tệp controller ra danh sách tuyến. */
export declare function scanFile(filePath: string): Route[];
/** Xếp các tuyến của một nhóm vào năm ô CRUD; ô nào không có tuyến thật thì để `null`. */
export declare function classifyCrud(prefix: string, routes: Route[]): {
    crud: Crud;
    rest: Route[];
};
/**
 * @param groupNames Bảng tiền tố→tên tiếng Việt của thương hiệu. Tên không suy ra được từ mã
 *   nguồn (controller chỉ có tiền tố tiếng Anh), nên phải truyền vào — mỗi thương hiệu một bảng.
 *   Nhóm chưa có tên thì hiển thị luôn tiền tố, không vỡ.
 */
export declare function scanRepo(repoRoot: string, groupNames?: Record<string, string>): Catalog;
//# sourceMappingURL=scan-source.d.ts.map