import { chuanHoaNhom, moiTuyen, moiTuyenCuaNhom, napDanhMuc, TEN_VIEC, timNhom, tuyenCuaViec, VIEC_TU_TEN, vieclamDuoc } from './danh-muc';
import { goiApi } from './http';
import { ketQua, ketQuaLoi } from './ket-qua';
import type { Nhom, TenViec } from './kieu';
import { LoiNguoiDung } from './loi';
import { moiMang, mangCuaNhom, timMang } from './mang';
import { dauKhoa, type Phien } from './phien';
import { cauHinh } from '../cau-hinh';

/**
 * Tên ba công cụ meta, ghép từ tiền tố thương hiệu (`clazzi_goi`, `gecko_goi`, …). Đọc cấu hình
 * mỗi lần gọi thay vì hằng module: cùng một lõi phục vụ nhiều thương hiệu, và test đổi cấu hình
 * giữa các `describe`. Ba tên này phải KHỚP giữa lúc khai (`dinhNghiaCongCu`) và lúc định tuyến
 * (`chayCongCu`) — dùng chung một hàm là cách chắc chúng không lệch.
 */
const tenGoi = (): string => `${cauHinh().tienTo}_goi`;
const tenMoTa = (): string => `${cauHinh().tienTo}_mo_ta`;
const tenTrangThai = (): string => `${cauHinh().tienTo}_trang_thai`;

/**
 * Lớp công cụ. CỐ Ý không nhập gì từ `@modelcontextprotocol/sdk`, và cố ý không nhập gì từ phần
 * còn lại của `clazzi-api` (không mô hình, không dịch vụ, không TypeORM).
 *
 * Nhờ vậy toàn bộ luật nghiệp vụ — từ chối việc không tồn tại, chặn đường dẫn ngoài danh mục,
 * ẩn khoá, gắn tên bản — kiểm được bằng test gọi hàm thẳng, và CÙNG MỘT tệp này phục vụ cả hai
 * đường: tuyến HTTP `/mcp` trong `clazzi-api`, và máy chủ stdio ở kho `clazzi-mcp`. Chỉ có một
 * bản định nghĩa 27 công cụ trên đời, nên hai đường không thể trôi khỏi nhau.
 */

export interface DinhNghiaCongCu {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const VIEC_ENUM = ['liet_ke', 'xem', 'tao', 'sua', 'xoa'] as const;

/** Mô tả một nhóm trong phần mô tả enum: tên tiếng Việt + đúng những việc nó làm được. */
function dongDoiTuong(n: Nhom): string {
  const co = vieclamDuoc(n);
  const viec = co.length ? co.join(', ') : 'không có việc CRUD nào';
  const le = n.tuyenKhac.length ? `, ${n.tuyenKhac.length} tuyến lẻ qua ${tenGoi()}` : '';
  return `${n.tienTo} — ${n.ten} (${viec}${le})`;
}

function nhomBatBuoc(tienTo: string): Nhom {
  const n = timNhom(tienTo);
  if (!n) {
    const gan = napDanhMuc()
      .nhom.map(x => x.tienTo)
      .filter(x => x.includes(chuanHoaNhom(tienTo).replace(/^\//, '').slice(0, 4)))
      .slice(0, 5);
    throw new LoiNguoiDung(`Không có đối tượng "${tienTo}" trong danh mục.${gan.length ? ` Gần đúng: ${gan.join(', ')}` : ''}`);
  }
  return n;
}

/** Lược đồ tham số dùng chung cho 24 công cụ nghiệp vụ. */
function luocDoNghiepVu(nhomCuaMang: Nhom[]): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      doiTuong: {
        type: 'string',
        enum: nhomCuaMang.map(n => n.tienTo),
        description: `Đối tượng cần thao tác. Trong ngoặc là những việc đối tượng đó THẬT SỰ làm được — xin một việc không có trong ngoặc sẽ bị từ chối chứ không đoán sang tuyến khác:\n${nhomCuaMang
          .map(n => `• ${dongDoiTuong(n)}`)
          .join('\n')}`,
      },
      viec: {
        type: 'string',
        enum: [...VIEC_ENUM],
        description: 'liet_ke = lấy danh sách · xem = lấy một bản ghi theo id · tao = thêm mới · sua = sửa theo id · xoa = xoá theo id.',
      },
      id: { type: 'string', description: 'Định danh bản ghi. Bắt buộc với xem / sua / xoa.' },
      duLieu: {
        type: 'object',
        description: `Thân dữ liệu cho tao / sua. Dùng ${tenMoTa()} để biết đối tượng chờ những trường nào.`,
        additionalProperties: true,
      },
      tim: { type: 'string', description: 'Chuỗi tìm kiếm, chỉ dùng với liet_ke.' },
      sapXep: { type: 'string', description: 'Sắp xếp, ví dụ "createdAt:DESC". Chỉ dùng với liet_ke.' },
      trang: { type: 'number', description: 'Trang, đếm từ 1. Chỉ dùng với liet_ke.' },
      moiTrang: { type: 'number', description: 'Số bản ghi mỗi trang. Chỉ dùng với liet_ke.' },
    },
    required: ['doiTuong', 'viec'],
    additionalProperties: false,
  };
}

/**
 * Bộ lọc nhóm lúc khai công cụ.
 *
 * `moduleDangBat` là hàm hỏi cờ module của BẢN TRIỂN KHAI. Đường HTTP truyền vào hàm đọc đúng
 * `ModuleFlagsService` mà `module-gate` dùng — một nguồn sự thật, không phải hai. Đường stdio để
 * trống: tiến trình đó không nối cơ sở dữ liệu nên không hỏi được cờ, và khi ấy công cụ vẫn hiện
 * ra nhưng gọi vào sẽ nhận đúng lỗi 404 mà cổng module trả về.
 *
 * NHẮC CHO NGƯỜI SỬA SAU: lọc ở đây là chuyện HIỂN THỊ, không phải chuyện chặn. Chặn nằm ở
 * `module-gate` và chỉ ở đó. Đừng bao giờ đảo ngược: bỏ lọc này thì cùng lắm mô hình thấy một
 * công cụ gọi vào là 404; bỏ cổng module thì khách chưa mua vẫn dùng được cả một mảng tính năng.
 */
export interface LocKhaiCongCu {
  moduleDangBat?: (maModule: string) => boolean;
}

export function dinhNghiaCongCu(loc: LocKhaiCongCu = {}): DinhNghiaCongCu[] {
  const ra: DinhNghiaCongCu[] = [];
  const bat = loc.moduleDangBat;

  for (const m of moiMang()) {
    /**
     * Chỉ giữ nhóm THẬT SỰ có trong danh mục của bản đang trỏ tới.
     *
     * Các bản là nhánh đã trôi xa nhau: gecko (434 tuyến / 59 nhóm) thiếu hẳn 11 nhóm so với
     * clazzi (511 / 70). Trước đây chỗ này gọi `nhomBatBuoc` nên gặp nhóm thiếu là NÉM LỖI và
     * máy chủ MCP không khai nổi công cụ nào — bảng công cụ trống trơn, không ai hiểu vì sao.
     *
     * Mảng rỗng hoàn toàn thì BỎ HẲN công cụ đó. Khai một công cụ không thao tác được gì là mời
     * mô hình gọi vào rồi nhận lỗi — tệ hơn là không khai.
     */
    const nhom = m.nhom
      .map(timNhom)
      .filter((n): n is Nhom => n !== undefined)
      // `module === 'lõi'` nghĩa là nhóm không thuộc công tắc nào, luôn bật.
      .filter(n => n.module === 'lõi' || !bat || bat(n.module));
    if (nhom.length === 0) continue;
    const soTuyen = nhom.reduce((s, n) => s + moiTuyenCuaNhom(n).length, 0);
    ra.push({
      name: m.ten,
      description: `${m.moTa}\nĐối tượng: ${nhom.map(n => n.tienTo).join(' ')} — ${soTuyen} tuyến API.`,
      inputSchema: luocDoNghiepVu(nhom),
    });
  }

  ra.push({
    name: tenTrangThai(),
    description:
      'Đang trỏ vào bản triển khai nào, khoá API có dùng được không, và khoá đó là của tài khoản nào (tên, chức danh). Gọi cái này trước khi làm bất cứ việc gì ghi dữ liệu.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  });

  ra.push({
    name: tenMoTa(),
    description:
      'Mô tả đầy đủ một đối tượng: module, năm việc CRUD làm được hay không, và TOÀN BỘ tuyến lẻ kèm tham số cùng quyền cần có. Dùng khi cần một việc không nằm trong năm việc CRUD.',
    inputSchema: {
      type: 'object',
      properties: {
        doiTuong: {
          type: 'string',
          description: 'Tiền tố nhóm, ví dụ "/users", "/crm", "/class-users".',
          enum: napDanhMuc().nhom.map(n => n.tienTo),
        },
      },
      required: ['doiTuong'],
      additionalProperties: false,
    },
  });

  ra.push({
    name: tenGoi(),
    description:
      'Cửa thoát cho các tuyến lẻ không theo khuôn CRUD (ví dụ GET /users/export, POST /crm/customers/import, POST /auth/staff/login). CHỈ gọi được tuyến có thật trong danh mục — đường dẫn lạ sẽ bị từ chối kèm gợi ý.',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        duongDan: {
          type: 'string',
          description: 'Đường dẫn thật, đã thay tham số, ví dụ "/users/export" hoặc "/classes/abc-123/students".',
        },
        than: { type: 'object', description: 'Thân JSON cho POST/PUT/PATCH.', additionalProperties: true },
        thamSo: { type: 'object', description: 'Tham số truy vấn.', additionalProperties: true },
      },
      required: ['method', 'duongDan'],
      additionalProperties: false,
    },
  });

  return ra;
}

/* ------------------------------------------------------------------ chạy */

interface ThamSoNghiepVu {
  doiTuong?: string;
  viec?: string;
  id?: string;
  duLieu?: Record<string, unknown>;
  tim?: string;
  sapXep?: string;
  trang?: number;
  moiTrang?: number;
}

async function chayNghiepVu(phien: Phien, tenMang: string, ts: ThamSoNghiepVu): Promise<string> {
  const mang = timMang(tenMang);
  /* istanbul ignore next */ if (!mang) throw new LoiNguoiDung(`Không có công cụ "${tenMang}".`);
  if (!ts.doiTuong) throw new LoiNguoiDung(`Thiếu "doiTuong". Mảng ${mang.ten} có: ${mang.nhom.join(', ')}.`);

  const nhom = nhomBatBuoc(ts.doiTuong);
  // Chặn gọi chéo mảng: `clazzi_crm` mà xin `/users` thì lược đồ enum đã sai, và nếu cứ cho qua
  // thì bảng công cụ không còn phản ánh đúng hệ thống nữa.
  if (mangCuaNhom(nhom.tienTo)?.ten !== mang.ten) {
    throw new LoiNguoiDung(`Đối tượng ${nhom.tienTo} không thuộc ${mang.ten} mà thuộc ${mangCuaNhom(nhom.tienTo)?.ten}. Gọi đúng công cụ đó.`);
  }

  const viec: TenViec | undefined = ts.viec ? VIEC_TU_TEN[ts.viec] : undefined;
  if (!viec) throw new LoiNguoiDung(`Thiếu hoặc sai "viec". Nhận một trong: ${VIEC_ENUM.join(', ')}.`);

  // Ném lỗi nói rõ nếu nhóm không có việc này — hàng rào chính, đừng bọc lại.
  const tuyen = tuyenCuaViec(nhom, viec);
  const [method, mau] = tuyen.split(' ');

  if ((viec === 'xem' || viec === 'sua' || viec === 'xoa') && !ts.id) {
    throw new LoiNguoiDung(`Việc "${TEN_VIEC[viec]}" cần "id" (tuyến ${tuyen}).`);
  }
  if ((viec === 'tao' || viec === 'sua') && (!ts.duLieu || Object.keys(ts.duLieu).length === 0)) {
    throw new LoiNguoiDung(`Việc "${TEN_VIEC[viec]}" cần "duLieu" không rỗng. Xem ${tenMoTa()} ${nhom.tienTo} để biết các trường.`);
  }

  const duongDan = mau.replace(':id', encodeURIComponent(ts.id ?? ''));
  const thamSo = viec === 'lietKe' ? { search: ts.tim, order: ts.sapXep, page: ts.trang, limit: ts.moiTrang } : undefined;
  const than = viec === 'tao' || viec === 'sua' ? ts.duLieu : undefined;

  const kq = await goiApi({ phien, method, duongDan, thamSo, than });
  return ketQua(phien, { doiTuong: nhom.tienTo, viec: TEN_VIEC[viec], tuyen: `${method} ${duongDan}`, ketQua: kq.duLieu });
}

async function chayTrangThai(phien: Phien): Promise<string> {
  const dm = napDanhMuc();
  const chung = {
    ban: { ten: phien.ban.ten, diaChi: phien.ban.diaChi, laHeThat: phien.ban.laHeThat },
    danhMuc: { quetLuc: dm.quetLuc, soTuyen: dm.soTuyen, soNhom: dm.soNhom, soCongCu: moiMang().length + 3 },
    khoa: phien.khoa
      ? { daDat: true, nhanDang: dauKhoa(phien), ghiChu: '12 ký tự prefix, đủ để đối chiếu khoá nào, không đủ để dùng' }
      : { daDat: false },
  };

  if (!phien.khoa) {
    return ketQua(phien, { ...chung, ketNoi: 'Chưa có khoá API nên chưa kiểm được. Xem hướng dẫn khi gọi bất kỳ công cụ nghiệp vụ nào.' });
  }

  // `/staffs/profile` là tuyến "tôi là ai" của nhân sự. Nếu khoá thuộc tài khoản học viên thì
  // tuyến đó 403, nên thử tiếp `/users/profile` trước khi kết luận là khoá hỏng.
  for (const duongDan of ['/staffs/profile', '/users/profile']) {
    try {
      const kq = await goiApi({ phien, method: 'GET', duongDan });
      return ketQua(phien, { ...chung, ketNoi: 'OK', taiKhoanTheo: duongDan, taiKhoan: kq.duLieu });
    } catch (e) {
      if (duongDan === '/users/profile') {
        /**
         * Vẫn trả đủ `chung`. Đây là công cụ CHẨN ĐOÁN: lúc khoá hỏng mới là lúc người dùng cần
         * biết mình đang trỏ bản nào và đã dán khoá có prefix gì — nuốt mất phần đó thì họ không
         * còn cách nào tự đối chiếu xem có dán nhầm khoá của bản khác không.
         */
        return ketQua(phien, {
          ...chung,
          ketNoi: 'HỎNG — khoá đã đặt nhưng không xác định được tài khoản',
          chiTiet: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }
  /* istanbul ignore next */ return ketQua(phien, chung);
}

function chayMoTa(phien: Phien, doiTuong: string): string {
  const nhom = nhomBatBuoc(doiTuong);
  const mang = mangCuaNhom(nhom.tienTo);
  return ketQua(phien, {
    doiTuong: nhom.tienTo,
    ten: nhom.ten,
    module: nhom.module,
    congCu: mang?.ten,
    crud: Object.fromEntries((Object.keys(TEN_VIEC) as TenViec[]).map(v => [TEN_VIEC[v], nhom.crud[v] ?? 'KHÔNG CÓ — đừng gọi việc này'])),
    // Tuyến lẻ phải hiện ra đầy đủ: đây là cách duy nhất mô hình biết `clazzi_goi` gọi được gì.
    tuyenLe: nhom.tuyenKhac.map(t => ({
      goi: `${t.method} ${t.path}`,
      handler: t.handler,
      quyen: t.quyen === null ? 'công khai' : t.quyen === '' ? 'bất kỳ tài khoản đã xác thực' : t.quyen,
      thamSoTruyVan: t.thamSoTruyVan.length ? t.thamSoTruyVan : undefined,
      than: t.than ?? undefined,
    })),
    ghiChu: `Tuyến lẻ gọi bằng ${tenGoi()}. Ô crud ghi "KHÔNG CÓ" nghĩa là tuyến đó không tồn tại trong API.`,
  });
}

/** Đổi `/courses/:id` thành biểu thức khớp `/courses/abc-123`. */
function thanhBieuThuc(mau: string): RegExp {
  const than = mau
    .replace(/\/$/, '')
    .split('/')
    .map(d => (d.startsWith(':') ? '[^/]+' : d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${than}/?$`);
}

/** Điểm giống nhau thô giữa hai đường dẫn, để gợi ý khi gõ sai. */
function doGiong(a: string, b: string): number {
  const ta = new Set(a.split(/[/-]/).filter(Boolean));
  const tb = b.split(/[/-]/).filter(Boolean);
  return tb.filter(x => ta.has(x)).length;
}

async function chayGoi(phien: Phien, ts: { method?: string; duongDan?: string; than?: unknown; thamSo?: Record<string, unknown> }): Promise<string> {
  const method = (ts.method ?? '').toUpperCase();
  const duongDan = (ts.duongDan ?? '').split('?')[0] ?? '';
  if (!method || !duongDan) throw new LoiNguoiDung(`${tenGoi()} cần cả "method" lẫn "duongDan".`);

  const tatCa = moiTuyen();
  const sach = duongDan.replace(/\/$/, '');
  const hop = tatCa.filter(t => t.method === method && thanhBieuThuc(t.path).test(sach));
  /**
   * Tuyến chữ cố định thắng tuyến có tham số. `GET /users/export` khớp CẢ `GET /users/:id` lẫn
   * `GET /users/export`; `routing-controllers` chạy theo thứ tự khai báo nên tuyến chữ mới là cái
   * thật sự chạy. Báo sai mẫu khớp thì mô hình tưởng vừa đọc một bản ghi tên "export".
   */
  const khop = hop.find(t => !t.path.includes(':')) ?? hop[0];

  if (!khop) {
    // Không có hàng rào này thì `clazzi_goi` thành một `curl` vạn năng và danh mục thành vô nghĩa.
    const goiY = tatCa
      .map(t => ({ t, d: doGiong(duongDan, t.path) }))
      .filter(x => x.d > 0)
      .sort((a, b) => b.d - a.d)
      .slice(0, 6)
      .map(x => `${x.t.method} ${x.t.path}`);
    const cungDuongKhacMethod = tatCa.filter(t => thanhBieuThuc(t.path).test(duongDan.replace(/\/$/, ''))).map(t => t.method);
    throw new LoiNguoiDung(
      [
        `Tuyến ${method} ${duongDan} KHÔNG có trong danh mục nên bị từ chối (danh mục quét từ mã nguồn clazzi-api, ${tatCa.length} tuyến).`,
        cungDuongKhacMethod.length ? `Đường dẫn này chỉ nhận: ${[...new Set(cungDuongKhacMethod)].join(', ')}.` : '',
        goiY.length ? `Có thể bạn muốn:\n${goiY.map(g => `  ${g}`).join('\n')}` : `Dùng ${tenMoTa()} để xem tuyến của một đối tượng.`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  const kq = await goiApi({ phien, method, duongDan, thamSo: ts.thamSo, than: ts.than });
  return ketQua(phien, { tuyen: `${method} ${duongDan}`, khopMau: `${khop.method} ${khop.path}`, nhom: khop.nhom, ketQua: kq.duLieu });
}

/**
 * Điểm vào duy nhất cho mọi công cụ. Trả về chuỗi đã đóng gói (có tên bản, đã ẩn khoá) — kể cả
 * khi lỗi: lỗi ném ra khỏi đây thì client MCP hiện một thông báo trơ không nói rõ bản nào.
 */
export async function chayCongCu(phien: Phien, ten: string, thamSo: Record<string, unknown>): Promise<{ text: string; loi: boolean }> {
  try {
    if (ten === tenTrangThai()) return { text: await chayTrangThai(phien), loi: false };
    if (ten === tenMoTa()) return { text: chayMoTa(phien, String(thamSo.doiTuong ?? '')), loi: false };
    if (ten === tenGoi()) return { text: await chayGoi(phien, thamSo as never), loi: false };
    if (timMang(ten)) return { text: await chayNghiepVu(phien, ten, thamSo as ThamSoNghiepVu), loi: false };
    throw new LoiNguoiDung(`Không có công cụ "${ten}".`);
  } catch (e) {
    if (e instanceof LoiNguoiDung) return { text: ketQuaLoi(phien, e.message), loi: true };
    // Lỗi lập trình: vẫn gắn tên bản, nhưng để nguyên thông điệp để còn gỡ được.
    return { text: ketQuaLoi(phien, `Lỗi không lường trước: ${e instanceof Error ? e.message : String(e)}`), loi: true };
  }
}
