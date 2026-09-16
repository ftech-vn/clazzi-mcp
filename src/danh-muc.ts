import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DanhMuc, Nhom, TenViec } from './kieu.js';
import { LoiNguoiDung } from './loi.js';

/**
 * Nạp `danh-muc.json` — ảnh chụp mã nguồn `clazzi-api` do `scripts/quet-api.ts` sinh ra.
 *
 * Đọc bằng `readFileSync` chứ không `import ... from '.json'`: tệp nằm ở gốc kho, ngoài `rootDir`
 * của bản dựng, nên nhập tĩnh thì `tsc` không cho. Đọc lúc chạy cũng có cái lợi là sửa danh mục
 * xong chỉ cần khởi động lại máy chủ, không phải dựng lại.
 */
/**
 * Danh mục dùng cho bản đang trỏ tới.
 *
 * Mặc định `danh-muc.json` (mã nguồn `clazzi-api`). Khai `CLAZZI_DANH_MUC` để dùng danh mục của
 * bản KHÁC — ví dụ `danh-muc.gecko.json` sinh từ kho `otm-system/server-api`.
 *
 * Vì sao phải tách theo bản chứ không dùng chung một danh mục: các bản là NHÁNH ĐÃ TRÔI XA nhau.
 * Đo 16/09/2026: clazzi 511 tuyến / 70 nhóm, gecko 434 / 59 — gecko thiếu hẳn 11 nhóm
 * (`/zoom`, `/student-documents`, `/site`, `/api-keys`…). Dùng danh mục của clazzi cho gecko là
 * hứa hàng chục tuyến máy chủ đó không có, và mô hình gọi vào nhận 404 rồi tưởng hệ thống hỏng.
 *
 * Danh sách công cụ sinh TỪ danh mục, nên đổi danh mục là bảng công cụ tự co lại đúng bằng
 * những gì bản đó thật sự có.
 */
const TEN_DANH_MUC = (process.env.CLAZZI_DANH_MUC ?? 'danh-muc.json').trim();
const DUONG_DAN = fileURLToPath(new URL(`../${TEN_DANH_MUC}`, import.meta.url));

let daNap: DanhMuc | null = null;

export function napDanhMuc(): DanhMuc {
  if (!daNap) daNap = JSON.parse(readFileSync(DUONG_DAN, 'utf8')) as DanhMuc;
  return daNap;
}

export const TEN_VIEC: Record<TenViec, string> = {
  lietKe: 'liet_ke',
  xem: 'xem',
  tao: 'tao',
  sua: 'sua',
  xoa: 'xoa',
};

/** Ngược lại: tên việc mô hình gõ → khoá trong `crud`. */
export const VIEC_TU_TEN: Record<string, TenViec> = {
  liet_ke: 'lietKe',
  xem: 'xem',
  tao: 'tao',
  sua: 'sua',
  xoa: 'xoa',
};

/** Chuẩn hoá `courses`, `/courses`, `/courses/` về `/courses`. */
export function chuanHoaNhom(tho: string): string {
  const s = tho.trim().replace(/\/+$/, '');
  return s.startsWith('/') ? s : `/${s}`;
}

export function timNhom(tho: string): Nhom | undefined {
  const k = chuanHoaNhom(tho);
  return napDanhMuc().nhom.find((n) => n.tienTo === k);
}

/** Tên các việc CRUD mà nhóm này THẬT SỰ có. Dùng trong thông điệp từ chối. */
export function vieclamDuoc(nhom: Nhom): string[] {
  return (Object.keys(TEN_VIEC) as TenViec[]).filter((v) => nhom.crud[v]).map((v) => TEN_VIEC[v]);
}

/**
 * Lấy tuyến cho một việc CRUD, hoặc ném lỗi nói rõ nhóm này không hỗ trợ.
 *
 * Đây là hàng rào chính của cả bộ: chỉ 19/69 nhóm có đủ năm việc. Nếu ở đây "đoán" sang một tuyến
 * trông giống giống, mô hình sẽ tin là sửa được rồi ghi vào nhầm bảng. Thà từ chối.
 */
export function tuyenCuaViec(nhom: Nhom, viec: TenViec): string {
  const t = nhom.crud[viec];
  if (t) return t;
  const co = vieclamDuoc(nhom);
  const leLoi = nhom.tuyenKhac.slice(0, 8).map((x) => `${x.method} ${x.path}`);
  throw new LoiNguoiDung(
    [
      `Đối tượng "${nhom.tienTo}" (${nhom.ten}) KHÔNG hỗ trợ việc "${TEN_VIEC[viec]}" — tuyến đó không tồn tại trong API.`,
      co.length ? `Việc làm được với đối tượng này: ${co.join(', ')}.` : 'Đối tượng này không có việc CRUD nào.',
      leLoi.length ? `Nó có ${nhom.tuyenKhac.length} tuyến lẻ, gọi bằng clazzi_goi, ví dụ: ${leLoi.join(' · ')}` : '',
      'Xem đầy đủ bằng clazzi_mo_ta.',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

/** Mọi tuyến của một nhóm, gồm cả năm ô CRUD lẫn tuyến lẻ. */
export function moiTuyenCuaNhom(nhom: Nhom): { method: string; path: string }[] {
  const ra: { method: string; path: string }[] = [];
  for (const v of Object.keys(TEN_VIEC) as TenViec[]) {
    const t = nhom.crud[v];
    if (t) {
      const [method, path] = t.split(' ');
      ra.push({ method: method!, path: path! });
    }
  }
  for (const t of nhom.tuyenKhac) ra.push({ method: t.method, path: t.path });
  return ra;
}

export function moiTuyen(): { method: string; path: string; nhom: string }[] {
  const ra: { method: string; path: string; nhom: string }[] = [];
  for (const n of napDanhMuc().nhom) {
    for (const t of moiTuyenCuaNhom(n)) ra.push({ ...t, nhom: n.tienTo });
  }
  return ra;
}
