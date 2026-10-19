import type { Domain } from './types';
/**
 * LOGIC tra cứu MẢNG → NHÓM. DỮ LIỆU (mảng `DOMAINS` cụ thể của từng thương hiệu) không còn ở đây
 * nữa — nó nằm trong cấu hình (`BrandConfig.mang`, xem `src/stdio/data`). Tệp này chỉ
 * giữ phần dùng chung: dựng chỉ mục tra nhanh và bắt lỗi một nhóm bị xếp vào hai mảng.
 *
 * Có test đối chiếu bản đồ này với danh mục và bắt buộc MỌI nhóm phải thuộc ĐÚNG MỘT mảng: thêm
 * nhóm mới ở máy chủ, quét lại, mà quên xếp vào mảng ⇒ test đỏ ngay. Không có hàng rào đó thì
 * tuyến mới lặng lẽ không công cụ nào gọi tới được.
 */
export type { Domain as Mang } from './types';
/** Trả về mảng MANG của thương hiệu đang cấu hình. */
export declare function allDomains(): Domain[];
export declare function domainOfGroup(prefix: string): Domain | undefined;
export declare function findDomain(name: string): Domain | undefined;
//# sourceMappingURL=domains.d.ts.map