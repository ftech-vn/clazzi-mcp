"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyDeployment = identifyDeployment;
exports.currentDeployment = currentDeployment;
const config_1 = require("../config");
function identifyDeployment(rawUrl) {
    const c = (0, config_1.getConfig)();
    const url = (rawUrl?.trim() || c.defaultBaseUrl).replace(/\/+$/, '');
    let host;
    try {
        host = new URL(url).host;
    }
    catch {
        // Địa chỉ hỏng vẫn phải trả về một Ban đọc được, để thông điệp lỗi còn nói được "đang trỏ đâu".
        return { name: `KHÔNG RÕ — địa chỉ không hợp lệ (${url})`, url, isProduction: true };
    }
    const known = c.knownHosts[host];
    // Bản lạ mặc định coi như HỆ THẬT: đoán sai theo hướng thận trọng thì chỉ thừa một lời cảnh
    // báo; đoán sai theo hướng kia thì mất dữ liệu.
    return known ? { name: known.name, url, isProduction: known.isProduction } : { name: `KHÔNG RÕ — ${host}`, url, isProduction: true };
}
function currentDeployment() {
    return identifyDeployment(process.env[(0, config_1.getConfig)().urlEnvVar]);
}
//# sourceMappingURL=deployment.js.map