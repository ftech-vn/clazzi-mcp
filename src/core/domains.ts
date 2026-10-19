import { getConfig, type BrandConfig } from '../config';
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
export function allDomains(): Domain[] {
  return getConfig().domains;
}

// Chỉ mục nhóm→mảng, dựng lười và gắn với ĐÚNG cấu hình đã dùng để dựng. `setConfig` đổi cấu
// hình (ví dụ trong test: clazzi → gecko) thì lần tra sau thấy `cauCuaChiMuc` không khớp và dựng
// lại — không cần móc reset thủ công, không có nguy cơ dùng nhầm chỉ mục của thương hiệu cũ.
let index: Map<string, Domain> | null = null;
let indexConfig: BrandConfig | null = null;

function byGroup(): Map<string, Domain> {
  const c = getConfig();
  if (index && indexConfig === c) return index;
  const m = new Map<string, Domain>();
  for (const domain of c.domains) {
    for (const n of domain.groups) {
      const existing = m.get(n);
      // Một nhóm nằm ở hai mảng thì mô tả và thông điệp lỗi sẽ chỉ sai đường; chặn ngay lúc dựng
      // chỉ mục còn hơn để nó thành lỗi mơ hồ lúc chạy.
      if (existing) throw new Error(`Nhóm ${n} bị xếp vào cả ${existing.name} lẫn ${domain.name}`);
      m.set(n, domain);
    }
  }
  index = m;
  indexConfig = c;
  return m;
}

export function domainOfGroup(prefix: string): Domain | undefined {
  return byGroup().get(prefix);
}

export function findDomain(name: string): Domain | undefined {
  return getConfig().domains.find(m => m.name === name);
}
