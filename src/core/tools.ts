import { normalizeGroup, allRoutes, routesOfGroup, loadCatalog, ACTION_NAMES, findGroup, routeForAction, ACTION_FROM_NAME, availableActions } from './catalog';
import { callApi } from './http';
import { formatResult, formatError } from './result';
import type { Group, CrudAction } from './types';
import { UserError } from './errors';
import { allDomains, domainOfGroup, findDomain } from './domains';
import { keyPrefixOf, type Session } from './session';
import { getConfig } from '../config';

/**
 * Tên ba công cụ meta, ghép từ tiền tố thương hiệu (`clazzi_goi`, `gecko_goi`, …). Đọc cấu hình
 * mỗi lần gọi thay vì hằng module: cùng một lõi phục vụ nhiều thương hiệu, và test đổi cấu hình
 * giữa các `describe`. Ba tên này phải KHỚP giữa lúc khai (`defineTools`) và lúc định tuyến
 * (`runTool`) — dùng chung một hàm là cách chắc chúng không lệch.
 */
const callToolName = (): string => `${getConfig().prefix}_goi`;
const describeToolName = (): string => `${getConfig().prefix}_mo_ta`;
const statusToolName = (): string => `${getConfig().prefix}_trang_thai`;

/**
 * Lớp công cụ. CỐ Ý không nhập gì từ `@modelcontextprotocol/sdk`, và cố ý không nhập gì từ phần
 * còn lại của `clazzi-api` (không mô hình, không dịch vụ, không TypeORM).
 *
 * Nhờ vậy toàn bộ luật nghiệp vụ — từ chối việc không tồn tại, chặn đường dẫn ngoài danh mục,
 * ẩn khoá, gắn tên bản — kiểm được bằng test gọi hàm thẳng, và CÙNG MỘT tệp này phục vụ cả hai
 * đường: tuyến HTTP `/mcp` trong `clazzi-api`, và máy chủ stdio ở kho `clazzi-mcp`. Chỉ có một
 * bản định nghĩa 27 công cụ trên đời, nên hai đường không thể trôi khỏi nhau.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const ACTION_ENUM = ['liet_ke', 'xem', 'tao', 'sua', 'xoa'] as const;

/** Mô tả một nhóm trong phần mô tả enum: tên tiếng Việt + đúng những việc nó làm được. */
function describeGroupLine(n: Group): string {
  const available = availableActions(n);
  const actions = available.length ? available.join(', ') : 'không có việc CRUD nào';
  const extra = n.otherRoutes.length ? `, ${n.otherRoutes.length} tuyến lẻ qua ${callToolName()}` : '';
  return `${n.prefix} — ${n.name} (${actions}${extra})`;
}

function requireGroup(prefix: string): Group {
  const n = findGroup(prefix);
  if (!n) {
    const near = loadCatalog()
      .groups.map(x => x.prefix)
      .filter(x => x.includes(normalizeGroup(prefix).replace(/^\//, '').slice(0, 4)))
      .slice(0, 5);
    throw new UserError(`Không có đối tượng "${prefix}" trong danh mục.${near.length ? ` Gần đúng: ${near.join(', ')}` : ''}`);
  }
  return n;
}

/** Lược đồ tham số dùng chung cho 24 công cụ nghiệp vụ. */
function domainToolSchema(domainGroups: Group[]): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      doiTuong: {
        type: 'string',
        enum: domainGroups.map(n => n.prefix),
        description: `Đối tượng cần thao tác. Trong ngoặc là những việc đối tượng đó THẬT SỰ làm được — xin một việc không có trong ngoặc sẽ bị từ chối chứ không đoán sang tuyến khác:\n${domainGroups
          .map(n => `• ${describeGroupLine(n)}`)
          .join('\n')}`,
      },
      viec: {
        type: 'string',
        enum: [...ACTION_ENUM],
        description: 'liet_ke = lấy danh sách · xem = lấy một bản ghi theo id · tao = thêm mới · sua = sửa theo id · xoa = xoá theo id.',
      },
      id: { type: 'string', description: 'Định danh bản ghi. Bắt buộc với xem / sua / xoa.' },
      duLieu: {
        type: 'object',
        description: `Thân dữ liệu cho tao / sua. Dùng ${describeToolName()} để biết đối tượng chờ những trường nào.`,
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
 * `isModuleEnabled` là hàm hỏi cờ module của BẢN TRIỂN KHAI. Đường HTTP truyền vào hàm đọc đúng
 * `ModuleFlagsService` mà `module-gate` dùng — một nguồn sự thật, không phải hai. Đường stdio để
 * trống: tiến trình đó không nối cơ sở dữ liệu nên không hỏi được cờ, và khi ấy công cụ vẫn hiện
 * ra nhưng gọi vào sẽ nhận đúng lỗi 404 mà cổng module trả về.
 *
 * NHẮC CHO NGƯỜI SỬA SAU: lọc ở đây là chuyện HIỂN THỊ, không phải chuyện chặn. Chặn nằm ở
 * `module-gate` và chỉ ở đó. Đừng bao giờ đảo ngược: bỏ lọc này thì cùng lắm mô hình thấy một
 * công cụ gọi vào là 404; bỏ cổng module thì khách chưa mua vẫn dùng được cả một mảng tính năng.
 */
export interface ToolListFilter {
  isModuleEnabled?: (maModule: string) => boolean;
}

export function defineTools(filter: ToolListFilter = {}): ToolDefinition[] {
  const tools: ToolDefinition[] = [];
  const isEnabled = filter.isModuleEnabled;

  for (const m of allDomains()) {
    /**
     * Chỉ giữ nhóm THẬT SỰ có trong danh mục của bản đang trỏ tới.
     *
     * Các bản là nhánh đã trôi xa nhau: gecko (434 tuyến / 59 nhóm) thiếu hẳn 11 nhóm so với
     * clazzi (511 / 70). Trước đây chỗ này gọi `requireGroup` nên gặp nhóm thiếu là NÉM LỖI và
     * máy chủ MCP không khai nổi công cụ nào — bảng công cụ trống trơn, không ai hiểu vì sao.
     *
     * Mảng rỗng hoàn toàn thì BỎ HẲN công cụ đó. Khai một công cụ không thao tác được gì là mời
     * mô hình gọi vào rồi nhận lỗi — tệ hơn là không khai.
     */
    const groups = m.groups
      .map(findGroup)
      .filter((n): n is Group => n !== undefined)
      // `module === 'lõi'` nghĩa là nhóm không thuộc công tắc nào, luôn bật.
      .filter(n => n.module === 'lõi' || !isEnabled || isEnabled(n.module));
    if (groups.length === 0) continue;
    const routeCount = groups.reduce((s, n) => s + routesOfGroup(n).length, 0);
    tools.push({
      name: m.name,
      description: `${m.description}\nĐối tượng: ${groups.map(n => n.prefix).join(' ')} — ${routeCount} tuyến API.`,
      inputSchema: domainToolSchema(groups),
    });
  }

  tools.push({
    name: statusToolName(),
    description:
      'Đang trỏ vào bản triển khai nào, khoá API có dùng được không, và khoá đó là của tài khoản nào (tên, chức danh). Gọi cái này trước khi làm bất cứ việc gì ghi dữ liệu.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  });

  tools.push({
    name: describeToolName(),
    description:
      'Mô tả đầy đủ một đối tượng: module, năm việc CRUD làm được hay không, và TOÀN BỘ tuyến lẻ kèm tham số cùng quyền cần có. Dùng khi cần một việc không nằm trong năm việc CRUD.',
    inputSchema: {
      type: 'object',
      properties: {
        doiTuong: {
          type: 'string',
          description: 'Tiền tố nhóm, ví dụ "/users", "/crm", "/class-users".',
          enum: loadCatalog().groups.map(n => n.prefix),
        },
      },
      required: ['doiTuong'],
      additionalProperties: false,
    },
  });

  tools.push({
    name: callToolName(),
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

  return tools;
}

/* ------------------------------------------------------------------ chạy */

interface DomainToolArgs {
  doiTuong?: string;
  viec?: string;
  id?: string;
  duLieu?: Record<string, unknown>;
  tim?: string;
  sapXep?: string;
  trang?: number;
  moiTrang?: number;
}

async function runDomainTool(session: Session, domainName: string, args: DomainToolArgs): Promise<string> {
  const domain = findDomain(domainName);
  /* istanbul ignore next */ if (!domain) throw new UserError(`Không có công cụ "${domainName}".`);
  if (!args.doiTuong) throw new UserError(`Thiếu "doiTuong". Mảng ${domain.name} có: ${domain.groups.join(', ')}.`);

  const group = requireGroup(args.doiTuong);
  // Chặn gọi chéo mảng: `clazzi_crm` mà xin `/users` thì lược đồ enum đã sai, và nếu cứ cho qua
  // thì bảng công cụ không còn phản ánh đúng hệ thống nữa.
  if (domainOfGroup(group.prefix)?.name !== domain.name) {
    throw new UserError(`Đối tượng ${group.prefix} không thuộc ${domain.name} mà thuộc ${domainOfGroup(group.prefix)?.name}. Gọi đúng công cụ đó.`);
  }

  const action: CrudAction | undefined = args.viec ? ACTION_FROM_NAME[args.viec] : undefined;
  if (!action) throw new UserError(`Thiếu hoặc sai "viec". Nhận một trong: ${ACTION_ENUM.join(', ')}.`);

  // Ném lỗi nói rõ nếu nhóm không có việc này — hàng rào chính, đừng bọc lại.
  const route = routeForAction(group, action);
  const [method, pattern] = route.split(' ');

  if ((action === 'get' || action === 'update' || action === 'remove') && !args.id) {
    throw new UserError(`Việc "${ACTION_NAMES[action]}" cần "id" (tuyến ${route}).`);
  }
  if ((action === 'create' || action === 'update') && (!args.duLieu || Object.keys(args.duLieu).length === 0)) {
    throw new UserError(`Việc "${ACTION_NAMES[action]}" cần "duLieu" không rỗng. Xem ${describeToolName()} ${group.prefix} để biết các trường.`);
  }

  const path = pattern.replace(':id', encodeURIComponent(args.id ?? ''));
  const query = action === 'list' ? { search: args.tim, order: args.sapXep, page: args.trang, limit: args.moiTrang } : undefined;
  const body = action === 'create' || action === 'update' ? args.duLieu : undefined;

  const res = await callApi({ session, method, path, query, body });
  return formatResult(session, { doiTuong: group.prefix, viec: ACTION_NAMES[action], tuyen: `${method} ${path}`, ketQua: res.data });
}

async function runStatus(session: Session): Promise<string> {
  const catalog = loadCatalog();
  const common = {
    ban: { ten: session.deployment.name, diaChi: session.deployment.url, laHeThat: session.deployment.isProduction },
    danhMuc: { quetLuc: catalog.scannedAt, soTuyen: catalog.routeCount, soNhom: catalog.groupCount, soCongCu: allDomains().length + 3 },
    khoa: session.apiKey
      ? { daDat: true, nhanDang: keyPrefixOf(session), ghiChu: '12 ký tự prefix, đủ để đối chiếu khoá nào, không đủ để dùng' }
      : { daDat: false },
  };

  if (!session.apiKey) {
    return formatResult(session, { ...common, ketNoi: 'Chưa có khoá API nên chưa kiểm được. Xem hướng dẫn khi gọi bất kỳ công cụ nghiệp vụ nào.' });
  }

  // `/staffs/profile` là tuyến "tôi là ai" của nhân sự. Nếu khoá thuộc tài khoản học viên thì
  // tuyến đó 403, nên thử tiếp `/users/profile` trước khi kết luận là khoá hỏng.
  for (const path of ['/staffs/profile', '/users/profile']) {
    try {
      const res = await callApi({ session, method: 'GET', path });
      return formatResult(session, { ...common, ketNoi: 'OK', taiKhoanTheo: path, taiKhoan: res.data });
    } catch (e) {
      if (path === '/users/profile') {
        /**
         * Vẫn trả đủ `chung`. Đây là công cụ CHẨN ĐOÁN: lúc khoá hỏng mới là lúc người dùng cần
         * biết mình đang trỏ bản nào và đã dán khoá có prefix gì — nuốt mất phần đó thì họ không
         * còn cách nào tự đối chiếu xem có dán nhầm khoá của bản khác không.
         */
        return formatResult(session, {
          ...common,
          ketNoi: 'HỎNG — khoá đã đặt nhưng không xác định được tài khoản',
          chiTiet: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }
  /* istanbul ignore next */ return formatResult(session, common);
}

function runDescribe(session: Session, groupPrefix: string): string {
  const group = requireGroup(groupPrefix);
  const domain = domainOfGroup(group.prefix);
  return formatResult(session, {
    doiTuong: group.prefix,
    ten: group.name,
    module: group.module,
    congCu: domain?.name,
    crud: Object.fromEntries((Object.keys(ACTION_NAMES) as CrudAction[]).map(v => [ACTION_NAMES[v], group.crud[v] ?? 'KHÔNG CÓ — đừng gọi việc này'])),
    // Tuyến lẻ phải hiện ra đầy đủ: đây là cách duy nhất mô hình biết `clazzi_goi` gọi được gì.
    tuyenLe: group.otherRoutes.map(t => ({
      goi: `${t.method} ${t.path}`,
      handler: t.handler,
      quyen: t.authorized === null ? 'công khai' : t.authorized === '' ? 'bất kỳ tài khoản đã xác thực' : t.authorized,
      thamSoTruyVan: t.queryParams.length ? t.queryParams : undefined,
      than: t.bodyDto ?? undefined,
    })),
    ghiChu: `Tuyến lẻ gọi bằng ${callToolName()}. Ô crud ghi "KHÔNG CÓ" nghĩa là tuyến đó không tồn tại trong API.`,
  });
}

/** Đổi `/courses/:id` thành biểu thức khớp `/courses/abc-123`. */
function patternToRegExp(pattern: string): RegExp {
  const than = pattern
    .replace(/\/$/, '')
    .split('/')
    .map(d => (d.startsWith(':') ? '[^/]+' : d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${than}/?$`);
}

/** Điểm giống nhau thô giữa hai đường dẫn, để gợi ý khi gõ sai. */
function similarity(a: string, b: string): number {
  const setA = new Set(a.split(/[/-]/).filter(Boolean));
  const partsB = b.split(/[/-]/).filter(Boolean);
  return partsB.filter(x => setA.has(x)).length;
}

async function runCall(session: Session, args: { method?: string; duongDan?: string; than?: unknown; thamSo?: Record<string, unknown> }): Promise<string> {
  const method = (args.method ?? '').toUpperCase();
  const path = (args.duongDan ?? '').split('?')[0] ?? '';
  if (!method || !path) throw new UserError(`${callToolName()} cần cả "method" lẫn "duongDan".`);

  const all = allRoutes();
  const clean = path.replace(/\/$/, '');
  const matches = all.filter(t => t.method === method && patternToRegExp(t.path).test(clean));
  /**
   * Tuyến chữ cố định thắng tuyến có tham số. `GET /users/export` khớp CẢ `GET /users/:id` lẫn
   * `GET /users/export`; `routing-controllers` chạy theo thứ tự khai báo nên tuyến chữ mới là cái
   * thật sự chạy. Báo sai mẫu khớp thì mô hình tưởng vừa đọc một bản ghi tên "export".
   */
  const match = matches.find(t => !t.path.includes(':')) ?? matches[0];

  if (!match) {
    // Không có hàng rào này thì `clazzi_goi` thành một `curl` vạn năng và danh mục thành vô nghĩa.
    const suggestions = all
      .map(t => ({ t, d: similarity(path, t.path) }))
      .filter(x => x.d > 0)
      .sort((a, b) => b.d - a.d)
      .slice(0, 6)
      .map(x => `${x.t.method} ${x.t.path}`);
    const sameRouteOtherMethods = all.filter(t => patternToRegExp(t.path).test(path.replace(/\/$/, ''))).map(t => t.method);
    throw new UserError(
      [
        `Tuyến ${method} ${path} KHÔNG có trong danh mục nên bị từ chối (danh mục quét từ mã nguồn clazzi-api, ${all.length} tuyến).`,
        sameRouteOtherMethods.length ? `Đường dẫn này chỉ nhận: ${[...new Set(sameRouteOtherMethods)].join(', ')}.` : '',
        suggestions.length ? `Có thể bạn muốn:\n${suggestions.map(g => `  ${g}`).join('\n')}` : `Dùng ${describeToolName()} để xem tuyến của một đối tượng.`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  const res = await callApi({ session, method, path, query: args.thamSo, body: args.than });
  return formatResult(session, { tuyen: `${method} ${path}`, khopMau: `${match.method} ${match.path}`, nhom: match.group, ketQua: res.data });
}

/**
 * Điểm vào duy nhất cho mọi công cụ. Trả về chuỗi đã đóng gói (có tên bản, đã ẩn khoá) — kể cả
 * khi lỗi: lỗi ném ra khỏi đây thì client MCP hiện một thông báo trơ không nói rõ bản nào.
 */
export async function runTool(session: Session, name: string, args: Record<string, unknown>): Promise<{ text: string; isError: boolean }> {
  try {
    if (name === statusToolName()) return { text: await runStatus(session), isError: false };
    if (name === describeToolName()) return { text: runDescribe(session, String(args.doiTuong ?? '')), isError: false };
    if (name === callToolName()) return { text: await runCall(session, args as never), isError: false };
    if (findDomain(name)) return { text: await runDomainTool(session, name, args as DomainToolArgs), isError: false };
    throw new UserError(`Không có công cụ "${name}".`);
  } catch (e) {
    if (e instanceof UserError) return { text: formatError(session, e.message), isError: true };
    // Lỗi lập trình: vẫn gắn tên bản, nhưng để nguyên thông điệp để còn gỡ được.
    return { text: formatError(session, `Lỗi không lường trước: ${e instanceof Error ? e.message : String(e)}`), isError: true };
  }
}
