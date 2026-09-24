import type { Mang } from './kieu';
/**
 * LOGIC tra cứu MẢNG → NHÓM. DỮ LIỆU (mảng `MANG` cụ thể của từng thương hiệu) không còn ở đây
 * nữa — nó nằm trong cấu hình (`CauHinhThuongHieu.mang`, xem `src/bo-noi/du-lieu`). Tệp này chỉ
 * giữ phần dùng chung: dựng chỉ mục tra nhanh và bắt lỗi một nhóm bị xếp vào hai mảng.
 *
 * Có test đối chiếu bản đồ này với danh mục và bắt buộc MỌI nhóm phải thuộc ĐÚNG MỘT mảng: thêm
 * nhóm mới ở máy chủ, quét lại, mà quên xếp vào mảng ⇒ test đỏ ngay. Không có hàng rào đó thì
 * tuyến mới lặng lẽ không công cụ nào gọi tới được.
 */
export type { Mang } from './kieu';
/** Trả về mảng MANG của thương hiệu đang cấu hình. */
export declare function moiMang(): Mang[];
export declare function mangCuaNhom(tienTo: string): Mang | undefined;
export declare function timMang(ten: string): Mang | undefined;
//# sourceMappingURL=mang.d.ts.map