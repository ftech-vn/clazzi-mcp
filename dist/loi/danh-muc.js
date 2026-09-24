"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIEC_TU_TEN = exports.TEN_VIEC = void 0;
exports.napDanhMuc = napDanhMuc;
exports.chuanHoaNhom = chuanHoaNhom;
exports.timNhom = timNhom;
exports.vieclamDuoc = vieclamDuoc;
exports.tuyenCuaViec = tuyenCuaViec;
exports.moiTuyenCuaNhom = moiTuyenCuaNhom;
exports.moiTuyen = moiTuyen;
const cau_hinh_1 = require("../cau-hinh");
const loi_1 = require("./loi");
/**
 * Danh mục = ảnh chụp mã nguồn máy chủ, do scanner (`quet/quet-nguon.ts`) sinh ra lúc build.
 *
 * Nó KHÔNG còn được nhập tĩnh hay đọc tệp ở tầng lõi nữa: lõi này dùng chung cho nhiều thương
 * hiệu (clazzi, gecko, …) mà mỗi thương hiệu một danh mục khác nhau. Danh mục là DỮ LIỆU của
 * cấu hình (`CauHinhThuongHieu.danhMuc`), do bộ nối/host nạp rồi truyền vào qua `datCauHinh`.
 * Việc "nạp từ đâu" (tệp `.json` nào, đọc lúc build hay đọc theo biến môi trường) là chuyện của
 * host — xem `src/bo-noi/du-lieu` và `scripts/sinh-danh-muc.ts`.
 *
 * Vì sao phải tách theo bản: các bản là NHÁNH ĐÃ TRÔI XA nhau — đo 24/09/2026, clazzi 520 tuyến
 * / 71 nhóm, gecko 434 / 59, gecko thiếu hẳn hơn chục nhóm (`/zoom`, `/student-documents`,
 * `/site`, `/api-keys`…). Dùng danh mục của clazzi cho gecko là hứa hàng chục tuyến máy chủ đó
 * không có, và mô hình gọi vào nhận 404 rồi tưởng hệ thống hỏng.
 *
 * Danh sách công cụ sinh TỪ danh mục, nên đổi danh mục là bảng công cụ tự co lại đúng bằng những
 * gì bản đó thật sự có.
 */
function napDanhMuc() {
    return (0, cau_hinh_1.cauHinh)().danhMuc;
}
exports.TEN_VIEC = {
    lietKe: 'liet_ke',
    xem: 'xem',
    tao: 'tao',
    sua: 'sua',
    xoa: 'xoa',
};
/** Ngược lại: tên việc mô hình gõ → khoá trong `crud`. */
exports.VIEC_TU_TEN = {
    liet_ke: 'lietKe',
    xem: 'xem',
    tao: 'tao',
    sua: 'sua',
    xoa: 'xoa',
};
/** Chuẩn hoá `courses`, `/courses`, `/courses/` về `/courses`. */
function chuanHoaNhom(tho) {
    const s = tho.trim().replace(/\/+$/, '');
    return s.startsWith('/') ? s : `/${s}`;
}
function timNhom(tho) {
    const k = chuanHoaNhom(tho);
    return napDanhMuc().nhom.find(n => n.tienTo === k);
}
/** Tên các việc CRUD mà nhóm này THẬT SỰ có. Dùng trong thông điệp từ chối. */
function vieclamDuoc(nhom) {
    return Object.keys(exports.TEN_VIEC).filter(v => nhom.crud[v]).map(v => exports.TEN_VIEC[v]);
}
/**
 * Lấy tuyến cho một việc CRUD, hoặc ném lỗi nói rõ nhóm này không hỗ trợ.
 *
 * Đây là hàng rào chính của cả bộ: chỉ 19/69 nhóm có đủ năm việc. Nếu ở đây "đoán" sang một tuyến
 * trông giống giống, mô hình sẽ tin là sửa được rồi ghi vào nhầm bảng. Thà từ chối.
 */
function tuyenCuaViec(nhom, viec) {
    const t = nhom.crud[viec];
    if (t)
        return t;
    const co = vieclamDuoc(nhom);
    const leLoi = nhom.tuyenKhac.slice(0, 8).map(x => `${x.method} ${x.path}`);
    throw new loi_1.LoiNguoiDung([
        `Đối tượng "${nhom.tienTo}" (${nhom.ten}) KHÔNG hỗ trợ việc "${exports.TEN_VIEC[viec]}" — tuyến đó không tồn tại trong API.`,
        co.length ? `Việc làm được với đối tượng này: ${co.join(', ')}.` : 'Đối tượng này không có việc CRUD nào.',
        leLoi.length ? `Nó có ${nhom.tuyenKhac.length} tuyến lẻ, gọi bằng clazzi_goi, ví dụ: ${leLoi.join(' · ')}` : '',
        'Xem đầy đủ bằng clazzi_mo_ta.',
    ]
        .filter(Boolean)
        .join('\n'));
}
/** Mọi tuyến của một nhóm, gồm cả năm ô CRUD lẫn tuyến lẻ. */
function moiTuyenCuaNhom(nhom) {
    const ra = [];
    for (const v of Object.keys(exports.TEN_VIEC)) {
        const t = nhom.crud[v];
        if (t) {
            const [method, path] = t.split(' ');
            ra.push({ method, path });
        }
    }
    for (const t of nhom.tuyenKhac)
        ra.push({ method: t.method, path: t.path });
    return ra;
}
function moiTuyen() {
    const ra = [];
    for (const n of napDanhMuc().nhom) {
        for (const t of moiTuyenCuaNhom(n))
            ra.push({ ...t, nhom: n.tienTo });
    }
    return ra;
}
//# sourceMappingURL=danh-muc.js.map