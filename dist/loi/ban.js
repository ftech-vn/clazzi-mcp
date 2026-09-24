"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nhanDienBan = nhanDienBan;
exports.banHienTai = banHienTai;
const cau_hinh_1 = require("../cau-hinh");
function nhanDienBan(diaChiTho) {
    const c = (0, cau_hinh_1.cauHinh)();
    const diaChi = (diaChiTho?.trim() || c.diaChiMacDinh).replace(/\/+$/, '');
    let host;
    try {
        host = new URL(diaChi).host;
    }
    catch {
        // Địa chỉ hỏng vẫn phải trả về một Ban đọc được, để thông điệp lỗi còn nói được "đang trỏ đâu".
        return { ten: `KHÔNG RÕ — địa chỉ không hợp lệ (${diaChi})`, diaChi, laHeThat: true };
    }
    const biet = c.daBiet[host];
    // Bản lạ mặc định coi như HỆ THẬT: đoán sai theo hướng thận trọng thì chỉ thừa một lời cảnh
    // báo; đoán sai theo hướng kia thì mất dữ liệu.
    return biet ? { ten: biet.ten, diaChi, laHeThat: biet.laHeThat } : { ten: `KHÔNG RÕ — ${host}`, diaChi, laHeThat: true };
}
function banHienTai() {
    return nhanDienBan(process.env[(0, cau_hinh_1.cauHinh)().bienUrl]);
}
//# sourceMappingURL=ban.js.map