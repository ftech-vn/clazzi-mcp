"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allDomains = allDomains;
exports.domainOfGroup = domainOfGroup;
exports.findDomain = findDomain;
const config_1 = require("../config");
/** Trả về mảng MANG của thương hiệu đang cấu hình. */
function allDomains() {
    return (0, config_1.getConfig)().domains;
}
// Chỉ mục nhóm→mảng, dựng lười và gắn với ĐÚNG cấu hình đã dùng để dựng. `setConfig` đổi cấu
// hình (ví dụ trong test: clazzi → gecko) thì lần tra sau thấy `cauCuaChiMuc` không khớp và dựng
// lại — không cần móc reset thủ công, không có nguy cơ dùng nhầm chỉ mục của thương hiệu cũ.
let index = null;
let indexConfig = null;
function byGroup() {
    const c = (0, config_1.getConfig)();
    if (index && indexConfig === c)
        return index;
    const m = new Map();
    for (const domain of c.domains) {
        for (const n of domain.groups) {
            const existing = m.get(n);
            // Một nhóm nằm ở hai mảng thì mô tả và thông điệp lỗi sẽ chỉ sai đường; chặn ngay lúc dựng
            // chỉ mục còn hơn để nó thành lỗi mơ hồ lúc chạy.
            if (existing)
                throw new Error(`Nhóm ${n} bị xếp vào cả ${existing.name} lẫn ${domain.name}`);
            m.set(n, domain);
        }
    }
    index = m;
    indexConfig = c;
    return m;
}
function domainOfGroup(prefix) {
    return byGroup().get(prefix);
}
function findDomain(name) {
    return (0, config_1.getConfig)().domains.find(m => m.name === name);
}
//# sourceMappingURL=domains.js.map