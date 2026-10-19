import { getConfig } from '../config';
import type { Catalog, Group, CrudAction } from './types';
import { UserError } from './errors';

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
export function loadCatalog(): Catalog {
  return getConfig().catalog;
}

export const ACTION_NAMES: Record<CrudAction, string> = {
  list: 'liet_ke',
  get: 'xem',
  create: 'tao',
  update: 'sua',
  remove: 'xoa',
};

/** Ngược lại: tên việc mô hình gõ → khoá trong `crud`. */
export const ACTION_FROM_NAME: Record<string, CrudAction> = {
  liet_ke: 'list',
  xem: 'get',
  tao: 'create',
  sua: 'update',
  xoa: 'remove',
};

/** Chuẩn hoá `courses`, `/courses`, `/courses/` về `/courses`. */
export function normalizeGroup(raw: string): string {
  const s = raw.trim().replace(/\/+$/, '');
  return s.startsWith('/') ? s : `/${s}`;
}

export function findGroup(raw: string): Group | undefined {
  const k = normalizeGroup(raw);
  return loadCatalog().groups.find(n => n.prefix === k);
}

/** Tên các việc CRUD mà nhóm này THẬT SỰ có. Dùng trong thông điệp từ chối. */
export function availableActions(group: Group): string[] {
  return (Object.keys(ACTION_NAMES) as CrudAction[]).filter(v => group.crud[v]).map(v => ACTION_NAMES[v]);
}

/**
 * Lấy tuyến cho một việc CRUD, hoặc ném lỗi nói rõ nhóm này không hỗ trợ.
 *
 * Đây là hàng rào chính của cả bộ: chỉ 19/69 nhóm có đủ năm việc. Nếu ở đây "đoán" sang một tuyến
 * trông giống giống, mô hình sẽ tin là sửa được rồi ghi vào nhầm bảng. Thà từ chối.
 */
export function routeForAction(group: Group, action: CrudAction): string {
  const t = group.crud[action];
  if (t) return t;
  const co = availableActions(group);
  const otherSamples = group.otherRoutes.slice(0, 8).map(x => `${x.method} ${x.path}`);
  throw new UserError(
    [
      `Đối tượng "${group.prefix}" (${group.name}) KHÔNG hỗ trợ việc "${ACTION_NAMES[action]}" — tuyến đó không tồn tại trong API.`,
      co.length ? `Việc làm được với đối tượng này: ${co.join(', ')}.` : 'Đối tượng này không có việc CRUD nào.',
      otherSamples.length ? `Nó có ${group.otherRoutes.length} tuyến lẻ, gọi bằng clazzi_goi, ví dụ: ${otherSamples.join(' · ')}` : '',
      'Xem đầy đủ bằng clazzi_mo_ta.',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

/** Mọi tuyến của một nhóm, gồm cả năm ô CRUD lẫn tuyến lẻ. */
export function routesOfGroup(group: Group): { method: string; path: string }[] {
  const ra: { method: string; path: string }[] = [];
  for (const v of Object.keys(ACTION_NAMES) as CrudAction[]) {
    const t = group.crud[v];
    if (t) {
      const [method, path] = t.split(' ');
      ra.push({ method, path });
    }
  }
  for (const t of group.otherRoutes) ra.push({ method: t.method, path: t.path });
  return ra;
}

export function allRoutes(): { method: string; path: string; group: string }[] {
  const ra: { method: string; path: string; group: string }[] = [];
  for (const n of loadCatalog().groups) {
    for (const t of routesOfGroup(n)) ra.push({ ...t, group: n.prefix });
  }
  return ra;
}
