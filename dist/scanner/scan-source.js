"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupOfPath = groupOfPath;
exports.findControllerFiles = findControllerFiles;
exports.readModuleManifests = readModuleManifests;
exports.scanFile = scanFile;
exports.classifyCrud = classifyCrud;
exports.scanRepo = scanRepo;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
/**
 * Quét `clazzi-api` bằng biểu thức chính quy chứ không dựng cây cú pháp TypeScript.
 *
 * Vì sao: `routing-controllers` khai tuyến bằng decorator theo một khuôn rất hẹp — một dòng
 * `@Get('/x')` rồi tới tên handler. Đọc bằng regex là đủ và không kéo theo `typescript` như phụ
 * thuộc lúc chạy. Bù lại phải chấp nhận một luật: **mọi decorator tuyến phải nằm trên đúng một
 * dòng**. Nếu sau này `clazzi-api` xuống dòng giữa `@Get(` và đối số, con số tuyến sẽ tụt và
 * test đối chiếu sẽ đỏ — đó là chủ ý, đỏ còn hơn quét thiếu mà không ai biết.
 */
const HTTP_METHODS = ['Get', 'Post', 'Put', 'Delete', 'Patch'];
const RE_CONTROLLER = /@(?:Json)?Controller\(\s*(['"`])(.*?)\1\s*\)/;
const RE_ROUTE = new RegExp(`@(${HTTP_METHODS.join('|')})\\(\\s*(?:(['"\`])(.*?)\\2)?\\s*\\)`);
const RE_AUTHORIZED = /@Authorized\(\s*([\s\S]*?)\s*\)\s*$/;
const RE_HANDLER = /^\s*(?:public\s+|private\s+|protected\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/;
const RE_QUERY_PARAM = /@QueryParam\(\s*['"`](.*?)['"`]/g;
const RE_BODY_DTO = /@Body\([^)]*\)\s*\w+\s*:\s*([A-Za-z_$][\w$]*)/;
/** Ghép tiền tố controller với đường dẫn của decorator, giữ nguyên dấu `/` cuối nếu có. */
function joinPath(prefix, suffix) {
    const raw = `${prefix}${suffix}`.replace(/\/{2,}/g, '/');
    return raw === '' ? '/' : raw;
}
/** Nhóm = đoạn đầu tiên của đường dẫn. `/crm/customers/` và `/crm/tasks/` cùng về `/crm`. */
function groupOfPath(path) {
    const segments = path.split('/').filter(Boolean);
    return segments.length === 0 ? '/' : `/${segments[0]}`;
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
function isSingleIdPath(path, prefix) {
    if (!path.startsWith(`${prefix}/`))
        return false;
    return path.slice(prefix.length + 1).replace(/\/$/, '') === ':id';
}
/** Đúng tiền tố, không thêm đoạn nào (chấp nhận cả `/courses` và `/courses/`). */
function isRootPath(path, prefix) {
    return path === prefix || path === `${prefix}/`;
}
/** Đọc mọi tệp `.controller.ts` trong một thư mục (không đệ quy — cây nguồn phẳng một tầng). */
function listControllers(dir) {
    if (!(0, node_fs_1.existsSync)(dir))
        return [];
    return (0, node_fs_1.readdirSync)(dir)
        .filter(f => f.endsWith('.controller.ts'))
        .sort()
        .map(f => (0, node_path_1.join)(dir, f));
}
function findControllerFiles(root) {
    const files = listControllers((0, node_path_1.join)(root, 'src', 'controllers'));
    const modulesDir = (0, node_path_1.join)(root, 'src', 'modules');
    if ((0, node_fs_1.existsSync)(modulesDir)) {
        for (const m of (0, node_fs_1.readdirSync)(modulesDir).sort()) {
            files.push(...listControllers((0, node_path_1.join)(modulesDir, m, 'controllers')));
        }
    }
    return files;
}
/**
 * Bản kê module: ánh xạ tiền tố tuyến → mã module. Đọc từ `src/modules/<ten>/manifest.ts`
 * (`{ prefix, module }`). Vẫn đọc khuôn cũ `ban-ke.ts` (`{ tienTo, module }`) cho các kho chưa đổi
 * tên sang tiếng Anh — clazzi-api đổi ngày 13/10/2026.
 * Thứ tự khai báo có ý nghĩa: nhóm `/crm` gom bảy controller mang bốn mã module khác nhau, và ta
 * lấy mã của mục ĐẦU TIÊN — cùng luật mà `CHUC-NANG-VA-API.md` đã dùng (`/crm` → `CUSTM`).
 */
function readModuleManifests(root) {
    const out = [];
    const modulesDir = (0, node_path_1.join)(root, 'src', 'modules');
    if (!(0, node_fs_1.existsSync)(modulesDir))
        return out;
    for (const m of (0, node_fs_1.readdirSync)(modulesDir).sort()) {
        const file = [(0, node_path_1.join)(modulesDir, m, 'manifest.ts'), (0, node_path_1.join)(modulesDir, m, 'ban-ke.ts')].find(t => (0, node_fs_1.existsSync)(t));
        if (!file)
            continue;
        const content = (0, node_fs_1.readFileSync)(file, 'utf8');
        const re = /(?:prefix|tienTo):\s*['"`](.*?)['"`]\s*,\s*module:\s*['"`](.*?)['"`]/g;
        let k;
        while ((k = re.exec(content)) !== null)
            out.push({ prefix: k[1], module: k[2] });
    }
    return out;
}
/**
 * Mã module của một nhóm. So khớp theo BIÊN ĐOẠN chứ không phải `startsWith` thuần: nhóm
 * `/support` mà so bằng `startsWith` sẽ nuốt luôn mục `/support-comments` của bản kê và gán
 * nhầm mã cho một nhóm khác.
 */
function moduleOfGroup(prefix, manifests) {
    const match = manifests.find(b => b.prefix === prefix || b.prefix.startsWith(`${prefix}/`));
    return match ? match.module : 'lõi';
}
/** Quét một tệp controller ra danh sách tuyến. */
function scanFile(filePath) {
    const lines = (0, node_fs_1.readFileSync)(filePath, 'utf8').split('\n');
    const mController = lines.map(d => d.match(RE_CONTROLLER)).find(Boolean);
    if (!mController)
        return [];
    const prefix = mController[2];
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const mRoute = lines[i].match(RE_ROUTE);
        if (!mRoute)
            continue;
        const method = mRoute[1].toUpperCase();
        const path = joinPath(prefix, mRoute[3] ?? '');
        // Quét xuống tìm tên handler; gom decorator xen giữa (`@Authorized`, `@OpenAPI`…) trên đường đi.
        let authorized = null;
        let handler = '';
        const queryParams = [];
        let bodyDto = null;
        for (let j = i + 1; j < lines.length; j++) {
            const d = lines[j];
            const mAuth = d.match(RE_AUTHORIZED);
            if (mAuth) {
                authorized = mAuth[1].trim();
                continue;
            }
            if (/^\s*@/.test(d) || d.trim() === '')
                continue;
            const mH = d.match(RE_HANDLER);
            if (!mH)
                break;
            handler = mH[1];
            // Chữ ký handler có thể trải nhiều dòng; đọc tới dấu `)` cân bằng ở cột thấp nhất.
            let signature = '';
            for (let k = j; k < lines.length; k++) {
                signature += `${lines[k]}\n`;
                if (/^\s{0,4}\)/.test(lines[k]) || /\)\s*(?::[^{]*)?\{\s*$/.test(lines[k]))
                    break;
            }
            let q;
            RE_QUERY_PARAM.lastIndex = 0;
            while ((q = RE_QUERY_PARAM.exec(signature)) !== null)
                queryParams.push(q[1]);
            bodyDto = signature.match(RE_BODY_DTO)?.[1] ?? null;
            break;
        }
        out.push({ method, path, handler, authorized, queryParams, bodyDto });
    }
    return out;
}
/** Xếp các tuyến của một nhóm vào năm ô CRUD; ô nào không có tuyến thật thì để `null`. */
function classifyCrud(prefix, routes) {
    const crud = { list: null, get: null, create: null, update: null, remove: null };
    const used = new Set();
    const assign = (o, t) => {
        if (!t || crud[o])
            return;
        crud[o] = `${t.method} ${t.path}`;
        used.add(t);
    };
    assign('list', routes.find(t => t.method === 'GET' && isRootPath(t.path, prefix)));
    assign('get', routes.find(t => t.method === 'GET' && isSingleIdPath(t.path, prefix)));
    assign('create', routes.find(t => t.method === 'POST' && isRootPath(t.path, prefix)));
    assign('update', routes.find(t => t.method === 'PUT' && isSingleIdPath(t.path, prefix)));
    assign('remove', routes.find(t => t.method === 'DELETE' && isSingleIdPath(t.path, prefix)));
    return { crud, rest: routes.filter(t => !used.has(t)) };
}
/**
 * @param groupNames Bảng tiền tố→tên tiếng Việt của thương hiệu. Tên không suy ra được từ mã
 *   nguồn (controller chỉ có tiền tố tiếng Anh), nên phải truyền vào — mỗi thương hiệu một bảng.
 *   Nhóm chưa có tên thì hiển thị luôn tiền tố, không vỡ.
 */
function scanRepo(repoRoot, groupNames = {}) {
    const manifests = readModuleManifests(repoRoot);
    const allRoutes = [];
    for (const file of findControllerFiles(repoRoot))
        allRoutes.push(...scanFile(file));
    const byGroup = new Map();
    for (const t of allRoutes) {
        const k = groupOfPath(t.path);
        const list = byGroup.get(k);
        if (list)
            list.push(t);
        else
            byGroup.set(k, [t]);
    }
    const groups = [...byGroup.keys()].sort().map(prefix => {
        // Khoá lấy từ chính `byGroup.keys()` nên chắc chắn có; `?? []` ở đây là để kiểu học được
        // điều đó, không phải vì trường hợp rỗng có thật.
        const routes = (byGroup.get(prefix) ?? []).slice().sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
        const { crud, rest } = classifyCrud(prefix, routes);
        return {
            prefix,
            // Tên tiếng Việt không suy ra được từ mã nguồn; bảng tra nằm ở `group-names.ts`.
            name: groupNames[prefix] ?? prefix,
            module: moduleOfGroup(prefix, manifests),
            crud,
            otherRoutes: rest,
        };
    });
    return { scannedAt: new Date().toISOString(), routeCount: allRoutes.length, groupCount: groups.length, groups };
}
//# sourceMappingURL=scan-source.js.map