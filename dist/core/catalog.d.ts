import type { Catalog, Group, CrudAction } from './types';
/**
 * Danh mục = ảnh chụp mã nguồn máy chủ, do scanner (`scanner/scan-source.ts`) sinh ra lúc build.
 *
 * Nó KHÔNG còn được nhập tĩnh hay đọc tệp ở tầng lõi nữa: lõi này dùng chung cho nhiều thương
 * hiệu (clazzi, gecko, …) mà mỗi thương hiệu một danh mục khác nhau. Danh mục là DỮ LIỆU của
 * cấu hình (`BrandConfig.danhMuc`), do bộ nối/host nạp rồi truyền vào qua `setConfig`.
 * Việc "nạp từ đâu" (tệp `.json` nào, đọc lúc build hay đọc theo biến môi trường) là chuyện của
 * host — xem `src/stdio/data` và `scripts/generate-catalog.ts`.
 *
 * Vì sao phải tách theo bản: các bản là NHÁNH ĐÃ TRÔI XA nhau — đo 24/09/2026, clazzi 520 tuyến
 * / 71 nhóm, gecko 434 / 59, gecko thiếu hẳn hơn chục nhóm (`/zoom`, `/student-documents`,
 * `/site`, `/api-keys`…). Dùng danh mục của clazzi cho gecko là hứa hàng chục tuyến máy chủ đó
 * không có, và mô hình gọi vào nhận 404 rồi tưởng hệ thống hỏng.
 *
 * Danh sách công cụ sinh TỪ danh mục, nên đổi danh mục là bảng công cụ tự co lại đúng bằng những
 * gì bản đó thật sự có.
 */
export declare function loadCatalog(): Catalog;
export declare const ACTION_NAMES: Record<CrudAction, string>;
/** Ngược lại: tên việc mô hình gõ → khoá trong `crud`. */
export declare const ACTION_FROM_NAME: Record<string, CrudAction>;
/** Chuẩn hoá `courses`, `/courses`, `/courses/` về `/courses`. */
export declare function normalizeGroup(raw: string): string;
export declare function findGroup(raw: string): Group | undefined;
/** Tên các việc CRUD mà nhóm này THẬT SỰ có. Dùng trong thông điệp từ chối. */
export declare function availableActions(group: Group): string[];
/**
 * Lấy tuyến cho một việc CRUD, hoặc ném lỗi nói rõ nhóm này không hỗ trợ.
 *
 * Đây là hàng rào chính của cả bộ: chỉ 19/69 nhóm có đủ năm việc. Nếu ở đây "đoán" sang một tuyến
 * trông giống giống, mô hình sẽ tin là sửa được rồi ghi vào nhầm bảng. Thà từ chối.
 */
export declare function routeForAction(group: Group, action: CrudAction): string;
/** Mọi tuyến của một nhóm, gồm cả năm ô CRUD lẫn tuyến lẻ. */
export declare function routesOfGroup(group: Group): {
    method: string;
    path: string;
}[];
export declare function allRoutes(): {
    method: string;
    path: string;
    group: string;
}[];
//# sourceMappingURL=catalog.d.ts.map