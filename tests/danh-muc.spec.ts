import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { quetKho } from '../src/quet-nguon.js';
import { napDanhMuc } from '../src/danh-muc.js';
import type { DanhMuc } from '../src/kieu.js';

const GOC_API = fileURLToPath(new URL('../../clazzi-api', import.meta.url));

/**
 * Danh mục là ảnh chụp mã nguồn `clazzi-api`. Ảnh cũ mà mã đã đổi thì mọi công cụ đều hứa sai —
 * nên phải quét lại thật và so, chứ không so với một con số chép tay.
 */
describe('danh mục khớp mã nguồn clazzi-api', () => {
  const coNguon = existsSync(`${GOC_API}/src/controllers`);
  const moTa = coNguon ? describe : describe.skip;

  moTa('quét lại từ nguồn', () => {
    let tuoi: DanhMuc;
    const daLuu = napDanhMuc();

    beforeAll(() => {
      tuoi = quetKho(GOC_API);
    });

    it('số tuyến không lệch', () => {
      expect(tuoi.soTuyen).toBe(daLuu.soTuyen);
    });

    it('số nhóm không lệch', () => {
      expect(tuoi.soNhom).toBe(daLuu.soNhom);
    });

    it('từng nhóm khớp tiền tố, module và năm ô CRUD', () => {
      expect(tuoi.nhom.map((n) => n.tienTo)).toEqual(daLuu.nhom.map((n) => n.tienTo));
      for (const n of tuoi.nhom) {
        const cu = daLuu.nhom.find((x) => x.tienTo === n.tienTo)!;
        expect({ tienTo: n.tienTo, module: n.module, crud: n.crud }).toEqual({ tienTo: cu.tienTo, module: cu.module, crud: cu.crud });
      }
    });
  });

  /**
   * Hợp đồng đo được 508 tuyến / 69 nhóm ngày 15/09/2026. Trong lúc dựng bộ này, `clazzi-api`
   * thêm nhóm `/api-keys` (3 tuyến) — chính phần khoá API mà hợp đồng §3.2 mô tả. Nên con số
   * đúng bây giờ là 511/70.
   *
   * KHÔNG chốt cứng con số ở đây: chốt cứng thì mỗi lần API mọc thêm tuyến là phải sửa test, và
   * người sửa sẽ sửa con số cho hết đỏ mà không nhìn xem có gì tuột mất. Hàng rào thật là phép so
   * "danh mục đã commit == quét lại từ nguồn" ở trên. Ở đây chỉ chặn chiều ĐI LÙI: mọi nhóm hợp
   * đồng từng đo được phải còn nguyên.
   */
  it('không nhóm nào của bản kiểm kê 69 nhóm bị mất', () => {
    const dm = napDanhMuc();
    const dangCo = new Set(dm.nhom.map((n) => n.tienTo));
    const mat = NHOM_HOP_DONG.filter((n) => !dangCo.has(n));
    expect(mat).toEqual([]);
    expect(NHOM_HOP_DONG).toHaveLength(69);
    expect(dm.soNhom).toBeGreaterThanOrEqual(69);
    expect(dm.soTuyen).toBeGreaterThanOrEqual(508);
  });

  /**
   * Con số 19 là lý do tồn tại của cả thiết kế: nếu API đồng nhất thì đã phơi CRUD cho mọi nhóm,
   * và đã không cần `clazzi_goi` lẫn danh mục. Nó trôi đi là phải đọc lại thiết kế, không phải
   * sửa con số cho hết đỏ.
   */
  it('đúng 19 nhóm có đủ năm việc CRUD', () => {
    const du = napDanhMuc().nhom.filter((n) => Object.values(n.crud).every(Boolean));
    expect(du).toHaveLength(19);
  });

  it('ô CRUD nào có giá trị thì phải là một tuyến có thật, đúng khuôn "METHOD /duong/dan"', () => {
    for (const n of napDanhMuc().nhom) {
      for (const [viec, t] of Object.entries(n.crud)) {
        if (t === null) continue;
        expect(`${n.tienTo} ${viec} ${t}`).toMatch(/ (GET|POST|PUT|DELETE|PATCH) \//);
      }
    }
  });

  it('/class-users chỉ có liệt kê — ca thử thật của hợp đồng', () => {
    const n = napDanhMuc().nhom.find((x) => x.tienTo === '/class-users')!;
    expect(n.crud.lietKe).toBe('GET /class-users/');
    expect(n.crud.xem).toBeNull();
    expect(n.crud.tao).toBeNull();
    expect(n.crud.sua).toBeNull();
    expect(n.crud.xoa).toBeNull();
  });

  it('danh-muc.json đã commit là JSON hợp lệ và có mốc thời gian quét', () => {
    const tho = JSON.parse(readFileSync(fileURLToPath(new URL('../danh-muc.json', import.meta.url)), 'utf8'));
    expect(typeof tho.quetLuc).toBe('string');
    expect(Number.isNaN(Date.parse(tho.quetLuc))).toBe(false);
  });
});

/**
 * 69 nhóm mà `CHUC-NANG-VA-API.md` kiểm kê ngày 15/09/2026. Chép cứng vào đây làm mốc: nếu một
 * nhóm biến mất khỏi `clazzi-api` thì công cụ tương ứng im lặng mất việc, và chỉ danh sách này
 * mới phát hiện ra.
 */
const NHOM_HOP_DONG = [
  '/absence-request-comments', '/absence-requests', '/accounts', '/app-configs', '/attendance-sheet',
  '/auth', '/catalog', '/centers', '/class-lessons', '/class-sessions', '/class-shifts',
  '/class-teachers', '/class-users', '/classes', '/classrooms', '/config', '/contracts', '/courses',
  '/crm', '/dashboard', '/districts', '/document-reminders', '/document-types', '/exercise-comments',
  '/files', '/functions', '/health', '/holidays', '/lessons', '/makeup', '/modules', '/notifications',
  '/orders', '/parents', '/payment-appointment', '/permissions', '/post-attachments', '/post-comments',
  '/post-reaction', '/posts', '/provinces', '/receipts', '/reservations', '/role-modules', '/roles',
  '/schedule', '/session-exercise-attachments', '/session-exercise-report',
  '/session-exercise-report-attachments', '/session-exercises', '/session-packages', '/session-review',
  '/session-review-criteria', '/session-times', '/settings', '/setup', '/site', '/staffs',
  '/student-documents', '/support', '/support-comments', '/trial', '/user-preparations',
  '/user-sessions', '/users', '/version', '/wards', '/zalo', '/zoom',
];
