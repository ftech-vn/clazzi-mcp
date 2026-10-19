"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callBaseUrlOf = callBaseUrlOf;
exports.sessionFromEnv = sessionFromEnv;
exports.keyPrefixOf = keyPrefixOf;
exports.requireApiKey = requireApiKey;
const config_1 = require("../config");
const deployment_1 = require("./deployment");
const errors_1 = require("./errors");
/** Địa chỉ dùng để gọi thật. */
function callBaseUrlOf(session) {
    return (session.callBaseUrl ?? session.deployment.url).replace(/\/+$/, '');
}
/** Phiên của máy chủ stdio: một tiến trình, một người, đọc từ biến môi trường của thương hiệu. */
function sessionFromEnv() {
    const c = (0, config_1.getConfig)();
    return { deployment: (0, deployment_1.identifyDeployment)(process.env[c.urlEnvVar]), apiKey: process.env[c.keyEnvVar]?.trim() || null };
}
/**
 * Phần nhận diện khoá: 12 ký tự prefix, cố ý công khai (hợp đồng §3.1) — đủ để người dùng đối
 * chiếu "khoá tôi dán vào demo có đúng là khoá của demo không", không đủ để dùng.
 *
 * Trả về KHÔNG kèm chữ `clz_`. Bộ ẩn khoá ở `result.ts` quét mọi chuỗi `clz_…` và xoá sạch —
 * đúng như thế là tốt, đừng nới nó ra để lọt cái prefix này; nới một lần là mở đường cho khoá
 * thật lọt theo. Bỏ tiền tố đi thì hai luật cùng đúng, không phải đánh đổi.
 */
function keyPrefixOf(session) {
    if (!session.apiKey)
        return null;
    const tt = (0, config_1.getConfig)().keyPrefix;
    const re = new RegExp(`^${tt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([A-Za-z0-9]{1,12})_`);
    const m = session.apiKey.match(re);
    return m ? m[1] : `(khoá không theo khuôn ${tt}<prefix>_<bí mật>)`;
}
/**
 * Lấy khoá để gắn vào lượt gọi, hoặc ném lỗi có hướng dẫn dán khoá vào đâu.
 *
 * Đây là CHỖ DUY NHẤT trong lõi biết khoá đến từ đâu. Tám công cụ chỉ biết "phiên có khoá",
 * không biết nguồn — giữ ranh giới đó nên thêm được đường HTTP mà không sờ vào công cụ nào.
 */
function requireApiKey(session) {
    if (!session.apiKey)
        throw new errors_1.ConfigError(missingKeyMessage(session));
    return session.apiKey;
}
function missingKeyMessage(session) {
    const { deployment } = session;
    const c = (0, config_1.getConfig)();
    const example = `${c.keyPrefix}...`;
    return [
        `Chưa có khoá API nên không gọi được ${deployment.url} (${deployment.name}).`,
        '',
        'Cách nhanh nhất — cắm qua HTTP, không cài gì cả:',
        '',
        `  claude mcp add --transport http ${c.prefix} ${deployment.url}/mcp --header "Authorization: Bearer ${example}"`,
        `  codex  mcp add ${c.prefix} --url ${deployment.url}/mcp --bearer-token-env-var ${c.keyEnvVar}`,
        '',
        'Nếu đang chạy bản stdio (người trong đội), khoá dán vào khối "env" của cấu hình MCP:',
        `  "env": {"${c.urlEnvVar}": "${deployment.url}", "${c.keyEnvVar}": "${example}"}`,
        '',
        'Khoá cấp theo TỪNG BẢN: khoá của demo không dùng được ở hệ thật và ngược lại.',
        'Lấy khoá ở màn Cài đặt → Khoá API, hoặc POST /api-keys từ một phiên đăng nhập thật;',
        'khoá chỉ hiện đầy đủ đúng một lần.',
    ].join('\n');
}
//# sourceMappingURL=session.js.map