import type { DanhMuc, Nhom, TenViec } from './kieu';
/**
 * Danh mục = ảnh chụp mã nguồn máy chủ, do scanner (`quet/quet-nguon.ts`) sinh ra lúc build.
 *
 * Nó KHÔNG còn được nhập tĩnh hay đọc tệp ở tầng lõi nữa: lõi này dùng chung cho nhiều thương
 * hiệu (clazzi, gecko, …) mà mỗi thương hiệu một danh mục khác nhau. Danh mục là DỮ LIỆU của
 * cấu hình (`CauHinhThuongHieu.danhMuc`), do bộ nối/host nạp rồi truyền vào qua `datCauHinh`.
 * Việc "nạp từ đâu" (tệp `.json` nào, đọc lúc build hay đọc theo biến môi trường) là chuyện của
 * host — xem `src/bo-noi/du-lieu` và `scripts/sinh-danh-muc.ts`.
 *
 * Vì sao phải tách theo bản: các bản là NHÁNH ĐÃ TRÔI XA nhau — đo 24/09/2026, clazzi 520 tuyến
 * / 71 nhóm, gecko 434 / 59, gecko thiếu hẳn hơn chục nhóm (`/zoom`, `/student-documents`,
 * `/site`, `/api-keys`…). Dùng danh mục của clazzi cho gecko là hứa hàng chục tuyến máy chủ đó
 * không có, và mô hình gọi vào nhận 404 rồi tưởng hệ thống hỏng.
 *
 * Danh sách công cụ sinh TỪ danh mục, nên đổi danh mục là bảng công cụ tự co lại đúng bằng những
 * gì bản đó thật sự có.
 */
export declare function napDanhMuc(): DanhMuc;
export declare const TEN_VIEC: Record<TenViec, string>;
/** Ngược lại: tên việc mô hình gõ → khoá trong `crud`. */
export declare const VIEC_TU_TEN: Record<string, TenViec>;
/** Chuẩn hoá `courses`, `/courses`, `/courses/` về `/courses`. */
export declare function chuanHoaNhom(tho: string): string;
export declare function timNhom(tho: string): Nhom | undefined;
/** Tên các việc CRUD mà nhóm này THẬT SỰ có. Dùng trong thông điệp từ chối. */
export declare function vieclamDuoc(nhom: Nhom): string[];
/**
 * Lấy tuyến cho một việc CRUD, hoặc ném lỗi nói rõ nhóm này không hỗ trợ.
 *
 * Đây là hàng rào chính của cả bộ: chỉ 19/69 nhóm có đủ năm việc. Nếu ở đây "đoán" sang một tuyến
 * trông giống giống, mô hình sẽ tin là sửa được rồi ghi vào nhầm bảng. Thà từ chối.
 */
export declare function tuyenCuaViec(nhom: Nhom, viec: TenViec): string;
/** Mọi tuyến của một nhóm, gồm cả năm ô CRUD lẫn tuyến lẻ. */
export declare function moiTuyenCuaNhom(nhom: Nhom): {
    method: string;
    path: string;
}[];
export declare function moiTuyen(): {
    method: string;
    path: string;
    nhom: string;
}[];
//# sourceMappingURL=danh-muc.d.ts.map