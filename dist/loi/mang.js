"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moiMang = moiMang;
exports.mangCuaNhom = mangCuaNhom;
exports.timMang = timMang;
const cau_hinh_1 = require("../cau-hinh");
/** Trả về mảng MANG của thương hiệu đang cấu hình. */
function moiMang() {
    return (0, cau_hinh_1.cauHinh)().mang;
}
// Chỉ mục nhóm→mảng, dựng lười và gắn với ĐÚNG cấu hình đã dùng để dựng. `datCauHinh` đổi cấu
// hình (ví dụ trong test: clazzi → gecko) thì lần tra sau thấy `cauCuaChiMuc` không khớp và dựng
// lại — không cần móc reset thủ công, không có nguy cơ dùng nhầm chỉ mục của thương hiệu cũ.
let chiMuc = null;
let cauCuaChiMuc = null;
function theoNhom() {
    const c = (0, cau_hinh_1.cauHinh)();
    if (chiMuc && cauCuaChiMuc === c)
        return chiMuc;
    const m = new Map();
    for (const mang of c.mang) {
        for (const n of mang.nhom) {
            const da = m.get(n);
            // Một nhóm nằm ở hai mảng thì mô tả và thông điệp lỗi sẽ chỉ sai đường; chặn ngay lúc dựng
            // chỉ mục còn hơn để nó thành lỗi mơ hồ lúc chạy.
            if (da)
                throw new Error(`Nhóm ${n} bị xếp vào cả ${da.ten} lẫn ${mang.ten}`);
            m.set(n, mang);
        }
    }
    chiMuc = m;
    cauCuaChiMuc = c;
    return m;
}
function mangCuaNhom(tienTo) {
    return theoNhom().get(tienTo);
}
function timMang(ten) {
    return (0, cau_hinh_1.cauHinh)().mang.find(m => m.ten === ten);
}
//# sourceMappingURL=mang.js.map