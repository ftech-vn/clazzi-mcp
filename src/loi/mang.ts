import { cauHinh, type CauHinhThuongHieu } from '../cau-hinh';
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
export function moiMang(): Mang[] {
  return cauHinh().mang;
}

// Chỉ mục nhóm→mảng, dựng lười và gắn với ĐÚNG cấu hình đã dùng để dựng. `datCauHinh` đổi cấu
// hình (ví dụ trong test: clazzi → gecko) thì lần tra sau thấy `cauCuaChiMuc` không khớp và dựng
// lại — không cần móc reset thủ công, không có nguy cơ dùng nhầm chỉ mục của thương hiệu cũ.
let chiMuc: Map<string, Mang> | null = null;
let cauCuaChiMuc: CauHinhThuongHieu | null = null;

function theoNhom(): Map<string, Mang> {
  const c = cauHinh();
  if (chiMuc && cauCuaChiMuc === c) return chiMuc;
  const m = new Map<string, Mang>();
  for (const mang of c.mang) {
    for (const n of mang.nhom) {
      const da = m.get(n);
      // Một nhóm nằm ở hai mảng thì mô tả và thông điệp lỗi sẽ chỉ sai đường; chặn ngay lúc dựng
      // chỉ mục còn hơn để nó thành lỗi mơ hồ lúc chạy.
      if (da) throw new Error(`Nhóm ${n} bị xếp vào cả ${da.ten} lẫn ${mang.ten}`);
      m.set(n, mang);
    }
  }
  chiMuc = m;
  cauCuaChiMuc = c;
  return m;
}

export function mangCuaNhom(tienTo: string): Mang | undefined {
  return theoNhom().get(tienTo);
}

export function timMang(ten: string): Mang | undefined {
  return cauHinh().mang.find(m => m.ten === ten);
}
