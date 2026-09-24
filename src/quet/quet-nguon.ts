import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Crud, DanhMuc, Nhom, Tuyen } from '../loi/kieu';

/**
 * Quét `clazzi-api` bằng biểu thức chính quy chứ không dựng cây cú pháp TypeScript.
 *
 * Vì sao: `routing-controllers` khai tuyến bằng decorator theo một khuôn rất hẹp — một dòng
 * `@Get('/x')` rồi tới tên handler. Đọc bằng regex là đủ và không kéo theo `typescript` như phụ
 * thuộc lúc chạy. Bù lại phải chấp nhận một luật: **mọi decorator tuyến phải nằm trên đúng một
 * dòng**. Nếu sau này `clazzi-api` xuống dòng giữa `@Get(` và đối số, con số tuyến sẽ tụt và
 * test đối chiếu sẽ đỏ — đó là chủ ý, đỏ còn hơn quét thiếu mà không ai biết.
 */

const PHUONG_THUC = ['Get', 'Post', 'Put', 'Delete', 'Patch'] as const;

const RE_CONTROLLER = /@(?:Json)?Controller\(\s*(['"`])(.*?)\1\s*\)/;
const RE_TUYEN = new RegExp(`@(${PHUONG_THUC.join('|')})\\(\\s*(?:(['"\`])(.*?)\\2)?\\s*\\)`);
const RE_AUTHORIZED = /@Authorized\(\s*([\s\S]*?)\s*\)\s*$/;
const RE_HANDLER = /^\s*(?:public\s+|private\s+|protected\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/;
const RE_QUERY_PARAM = /@QueryParam\(\s*['"`](.*?)['"`]/g;
const RE_BODY_DTO = /@Body\([^)]*\)\s*\w+\s*:\s*([A-Za-z_$][\w$]*)/;

/** Ghép tiền tố controller với đường dẫn của decorator, giữ nguyên dấu `/` cuối nếu có. */
function ghepDuongDan(tienTo: string, duoi: string): string {
  const raw = `${tienTo}${duoi}`.replace(/\/{2,}/g, '/');
  return raw === '' ? '/' : raw;
}

/** Nhóm = đoạn đầu tiên của đường dẫn. `/crm/customers/` và `/crm/tasks/` cùng về `/crm`. */
export function nhomCuaDuongDan(path: string): string {
  const doan = path.split('/').filter(Boolean);
  return doan.length === 0 ? '/' : `/${doan[0]}`;
}

/**
 * Đúng một đoạn nữa sau tiền tố, và đoạn đó phải là ĐÚNG `:id`.
 *
 * Vì sao chỉ nhận `:id` chứ không nhận mọi `:tênGìĐó`: `/class-lessons` có
 * `PUT /class-lessons/:classSessionId` → `createOrUpdate`. Về hình dạng thì nó y hệt một tuyến
 * "sửa theo id", nhưng khoá nó nhận là id của BUỔI HỌC, không phải id của bản ghi class-lesson
 * (tuyến `GET`/`DELETE` của nhóm này mới dùng `:id`). Nếu xếp nó vào ô `sua`, thì
 * `clazzi_sua('/class-lessons', id)` sẽ đem id bản ghi nhét vào chỗ chờ id buổi học và ghi đè
 * nhầm hàng — hỏng dữ liệu, mà không có lỗi nào nổ ra. `/orders` cũng vậy với `:orderCode`.
 * Những tuyến đó vẫn còn nguyên trong `tuyenKhac`, gọi qua `clazzi_goi` khi thật sự cần.
 */
function laMotThamSo(path: string, tienTo: string): boolean {
  if (!path.startsWith(`${tienTo}/`)) return false;
  return path.slice(tienTo.length + 1).replace(/\/$/, '') === ':id';
}

/** Đúng tiền tố, không thêm đoạn nào (chấp nhận cả `/courses` và `/courses/`). */
function laGoc(path: string, tienTo: string): boolean {
  return path === tienTo || path === `${tienTo}/`;
}

/** Đọc mọi tệp `.controller.ts` trong một thư mục (không đệ quy — cây nguồn phẳng một tầng). */
function liet(thuMuc: string): string[] {
  if (!existsSync(thuMuc)) return [];
  return readdirSync(thuMuc)
    .filter(f => f.endsWith('.controller.ts'))
    .sort()
    .map(f => join(thuMuc, f));
}

export function timTepController(goc: string): string[] {
  const tep = liet(join(goc, 'src', 'controllers'));
  const thuMucModule = join(goc, 'src', 'modules');
  if (existsSync(thuMucModule)) {
    for (const m of readdirSync(thuMucModule).sort()) {
      tep.push(...liet(join(thuMucModule, m, 'controllers')));
    }
  }
  return tep;
}

/**
 * Bản kê module: ánh xạ tiền tố tuyến → mã module. Đọc từ `src/modules/<ten>/ban-ke.ts`.
 * Thứ tự khai báo có ý nghĩa: nhóm `/crm` gom bảy controller mang bốn mã module khác nhau, và ta
 * lấy mã của mục ĐẦU TIÊN — cùng luật mà `CHUC-NANG-VA-API.md` đã dùng (`/crm` → `CUSTM`).
 */
export function docBanKeModule(goc: string): { tienTo: string; module: string }[] {
  const ra: { tienTo: string; module: string }[] = [];
  const thuMucModule = join(goc, 'src', 'modules');
  if (!existsSync(thuMucModule)) return ra;
  for (const m of readdirSync(thuMucModule).sort()) {
    const tep = join(thuMucModule, m, 'ban-ke.ts');
    if (!existsSync(tep)) continue;
    const noiDung = readFileSync(tep, 'utf8');
    const re = /tienTo:\s*['"`](.*?)['"`]\s*,\s*module:\s*['"`](.*?)['"`]/g;
    let k: RegExpExecArray | null;
    while ((k = re.exec(noiDung)) !== null) ra.push({ tienTo: k[1], module: k[2] });
  }
  return ra;
}

/**
 * Mã module của một nhóm. So khớp theo BIÊN ĐOẠN chứ không phải `startsWith` thuần: nhóm
 * `/support` mà so bằng `startsWith` sẽ nuốt luôn mục `/support-comments` của bản kê và gán
 * nhầm mã cho một nhóm khác.
 */
function moduleCuaNhom(tienTo: string, banKe: { tienTo: string; module: string }[]): string {
  const khop = banKe.find(b => b.tienTo === tienTo || b.tienTo.startsWith(`${tienTo}/`));
  return khop ? khop.module : 'lõi';
}

/** Quét một tệp controller ra danh sách tuyến. */
export function quetTep(duongDanTep: string): Tuyen[] {
  const dong = readFileSync(duongDanTep, 'utf8').split('\n');
  const mController = dong.map(d => d.match(RE_CONTROLLER)).find(Boolean);
  if (!mController) return [];
  const tienTo = mController[2];

  const ra: Tuyen[] = [];
  for (let i = 0; i < dong.length; i++) {
    const mTuyen = dong[i].match(RE_TUYEN);
    if (!mTuyen) continue;
    const method = mTuyen[1].toUpperCase() as Tuyen['method'];
    const path = ghepDuongDan(tienTo, mTuyen[3] ?? '');

    // Quét xuống tìm tên handler; gom decorator xen giữa (`@Authorized`, `@OpenAPI`…) trên đường đi.
    let quyen: string | null = null;
    let handler = '';
    const thamSoTruyVan: string[] = [];
    let than: string | null = null;
    for (let j = i + 1; j < dong.length; j++) {
      const d = dong[j];
      const mAuth = d.match(RE_AUTHORIZED);
      if (mAuth) {
        quyen = mAuth[1].trim();
        continue;
      }
      if (/^\s*@/.test(d) || d.trim() === '') continue;
      const mH = d.match(RE_HANDLER);
      if (!mH) break;
      handler = mH[1];
      // Chữ ký handler có thể trải nhiều dòng; đọc tới dấu `)` cân bằng ở cột thấp nhất.
      let chuKy = '';
      for (let k = j; k < dong.length; k++) {
        chuKy += `${dong[k]}\n`;
        if (/^\s{0,4}\)/.test(dong[k]) || /\)\s*(?::[^{]*)?\{\s*$/.test(dong[k])) break;
      }
      let q: RegExpExecArray | null;
      RE_QUERY_PARAM.lastIndex = 0;
      while ((q = RE_QUERY_PARAM.exec(chuKy)) !== null) thamSoTruyVan.push(q[1]);
      than = chuKy.match(RE_BODY_DTO)?.[1] ?? null;
      break;
    }
    ra.push({ method, path, handler, quyen, thamSoTruyVan, than });
  }
  return ra;
}

/** Xếp các tuyến của một nhóm vào năm ô CRUD; ô nào không có tuyến thật thì để `null`. */
export function xepCrud(tienTo: string, tuyen: Tuyen[]): { crud: Crud; con: Tuyen[] } {
  const crud: Crud = { lietKe: null, xem: null, tao: null, sua: null, xoa: null };
  const daDung = new Set<Tuyen>();
  const gan = (o: keyof Crud, t: Tuyen | undefined) => {
    if (!t || crud[o]) return;
    crud[o] = `${t.method} ${t.path}`;
    daDung.add(t);
  };
  gan(
    'lietKe',
    tuyen.find(t => t.method === 'GET' && laGoc(t.path, tienTo)),
  );
  gan(
    'xem',
    tuyen.find(t => t.method === 'GET' && laMotThamSo(t.path, tienTo)),
  );
  gan(
    'tao',
    tuyen.find(t => t.method === 'POST' && laGoc(t.path, tienTo)),
  );
  gan(
    'sua',
    tuyen.find(t => t.method === 'PUT' && laMotThamSo(t.path, tienTo)),
  );
  gan(
    'xoa',
    tuyen.find(t => t.method === 'DELETE' && laMotThamSo(t.path, tienTo)),
  );
  return { crud, con: tuyen.filter(t => !daDung.has(t)) };
}

/**
 * @param tenNhom Bảng tiền tố→tên tiếng Việt của thương hiệu. Tên không suy ra được từ mã
 *   nguồn (controller chỉ có tiền tố tiếng Anh), nên phải truyền vào — mỗi thương hiệu một bảng.
 *   Nhóm chưa có tên thì hiển thị luôn tiền tố, không vỡ.
 */
export function quetKho(gocClazziApi: string, tenNhom: Record<string, string> = {}): DanhMuc {
  const banKe = docBanKeModule(gocClazziApi);
  const moiTuyen: Tuyen[] = [];
  for (const tep of timTepController(gocClazziApi)) moiTuyen.push(...quetTep(tep));

  const theoNhom = new Map<string, Tuyen[]>();
  for (const t of moiTuyen) {
    const k = nhomCuaDuongDan(t.path);
    const ds = theoNhom.get(k);
    if (ds) ds.push(t);
    else theoNhom.set(k, [t]);
  }

  const nhom: Nhom[] = [...theoNhom.keys()].sort().map(tienTo => {
    // Khoá lấy từ chính `theoNhom.keys()` nên chắc chắn có; `?? []` ở đây là để kiểu học được
    // điều đó, không phải vì trường hợp rỗng có thật.
    const tuyen = (theoNhom.get(tienTo) ?? []).slice().sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
    const { crud, con } = xepCrud(tienTo, tuyen);
    return {
      tienTo,
      // Tên tiếng Việt không suy ra được từ mã nguồn; bảng tra nằm ở `ten-nhom.ts`.
      ten: tenNhom[tienTo] ?? tienTo,
      module: moduleCuaNhom(tienTo, banKe),
      crud,
      tuyenKhac: con,
    };
  });

  return { quetLuc: new Date().toISOString(), soTuyen: moiTuyen.length, soNhom: nhom.length, nhom };
}
