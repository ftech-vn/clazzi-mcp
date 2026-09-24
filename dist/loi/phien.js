"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diaChiGoiCua = diaChiGoiCua;
exports.phienTuMoiTruong = phienTuMoiTruong;
exports.dauKhoa = dauKhoa;
exports.khoaBatBuoc = khoaBatBuoc;
const cau_hinh_1 = require("../cau-hinh");
const ban_1 = require("./ban");
const loi_1 = require("./loi");
/** Địa chỉ dùng để gọi thật. */
function diaChiGoiCua(phien) {
    return (phien.diaChiGoi ?? phien.ban.diaChi).replace(/\/+$/, '');
}
/** Phiên của máy chủ stdio: một tiến trình, một người, đọc từ biến môi trường của thương hiệu. */
function phienTuMoiTruong() {
    const c = (0, cau_hinh_1.cauHinh)();
    return { ban: (0, ban_1.nhanDienBan)(process.env[c.bienUrl]), khoa: process.env[c.bienKhoa]?.trim() || null };
}
/**
 * Phần nhận diện khoá: 12 ký tự prefix, cố ý công khai (hợp đồng §3.1) — đủ để người dùng đối
 * chiếu "khoá tôi dán vào demo có đúng là khoá của demo không", không đủ để dùng.
 *
 * Trả về KHÔNG kèm chữ `clz_`. Bộ ẩn khoá ở `ket-qua.ts` quét mọi chuỗi `clz_…` và xoá sạch —
 * đúng như thế là tốt, đừng nới nó ra để lọt cái prefix này; nới một lần là mở đường cho khoá
 * thật lọt theo. Bỏ tiền tố đi thì hai luật cùng đúng, không phải đánh đổi.
 */
function dauKhoa(phien) {
    if (!phien.khoa)
        return null;
    const tt = (0, cau_hinh_1.cauHinh)().tienToKhoa;
    const re = new RegExp(`^${tt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([A-Za-z0-9]{1,12})_`);
    const m = phien.khoa.match(re);
    return m ? m[1] : `(khoá không theo khuôn ${tt}<prefix>_<bí mật>)`;
}
/**
 * Lấy khoá để gắn vào lượt gọi, hoặc ném lỗi có hướng dẫn dán khoá vào đâu.
 *
 * Đây là CHỖ DUY NHẤT trong lõi biết khoá đến từ đâu. Tám công cụ chỉ biết "phiên có khoá",
 * không biết nguồn — giữ ranh giới đó nên thêm được đường HTTP mà không sờ vào công cụ nào.
 */
function khoaBatBuoc(phien) {
    if (!phien.khoa)
        throw new loi_1.LoiCauHinh(thieuKhoa(phien));
    return phien.khoa;
}
function thieuKhoa(phien) {
    const { ban } = phien;
    const c = (0, cau_hinh_1.cauHinh)();
    const vd = `${c.tienToKhoa}...`;
    return [
        `Chưa có khoá API nên không gọi được ${ban.diaChi} (${ban.ten}).`,
        '',
        'Cách nhanh nhất — cắm qua HTTP, không cài gì cả:',
        '',
        `  claude mcp add --transport http ${c.tienTo} ${ban.diaChi}/mcp --header "Authorization: Bearer ${vd}"`,
        `  codex  mcp add ${c.tienTo} --url ${ban.diaChi}/mcp --bearer-token-env-var ${c.bienKhoa}`,
        '',
        'Nếu đang chạy bản stdio (người trong đội), khoá dán vào khối "env" của cấu hình MCP:',
        `  "env": {"${c.bienUrl}": "${ban.diaChi}", "${c.bienKhoa}": "${vd}"}`,
        '',
        'Khoá cấp theo TỪNG BẢN: khoá của demo không dùng được ở hệ thật và ngược lại.',
        'Lấy khoá ở màn Cài đặt → Khoá API, hoặc POST /api-keys từ một phiên đăng nhập thật;',
        'khoá chỉ hiện đầy đủ đúng một lần.',
    ].join('\n');
}
//# sourceMappingURL=phien.js.map