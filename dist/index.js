"use strict";
/**
 * GÓI LÕI MCP CỦA CLAZZI — điểm vào công khai.
 *
 * ── Bất biến quan trọng nhất của gói này: KHÔNG nhập `@modelcontextprotocol/sdk` ở bất cứ đâu ──
 * Toàn bộ luật nghiệp vụ (khai công cụ, chạy công cụ, dịch lỗi, ẩn khoá, gắn tên bản, quét mã
 * nguồn) là thuần TypeScript, không phụ thuộc SDK. Nhờ vậy:
 *   1. Bề mặt `.d.ts` của gói KHÔNG tham chiếu kiểu nào của SDK → biên dịch được trên TypeScript
 *      4.6 (knb / peptalk), dù `.d.ts` của SDK đòi TS ≥4.9.
 *   2. Kiểm được bằng test gọi hàm thẳng, không cần dựng transport.
 * SDK chỉ xuất hiện ở TẦNG NỐI (adapter) của mỗi host — tuyến `/mcp` trong máy chủ, hoặc bộ nối
 * stdio ở `src/stdio` — nơi SDK nằm ở `peerDependencies`. Đừng kéo SDK vào cây `src/core`,`src/scanner`.
 *
 * Cách dùng: host gọi `setConfig(cfg)` MỘT LẦN lúc khởi động, sau đó `defineTools()` /
 * `runTool()` phục vụ giao thức. Xem `src/stdio/server.ts` làm mẫu.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readModuleManifests = exports.classifyCrud = exports.findControllerFiles = exports.scanFile = exports.scanRepo = exports.ConfigError = exports.UserError = exports.deploymentLine = exports.redactKey = exports.formatError = exports.formatResult = exports.translateError = exports.callApi = exports.currentDeployment = exports.identifyDeployment = exports.requireApiKey = exports.keyPrefixOf = exports.callBaseUrlOf = exports.sessionFromEnv = exports.findDomain = exports.domainOfGroup = exports.allDomains = exports.ACTION_FROM_NAME = exports.ACTION_NAMES = exports.routesOfGroup = exports.allRoutes = exports.routeForAction = exports.availableActions = exports.findGroup = exports.normalizeGroup = exports.loadCatalog = exports.runTool = exports.defineTools = exports.patchCrypto = exports.resetConfig = exports.getConfig = exports.setConfig = void 0;
var config_1 = require("./config");
Object.defineProperty(exports, "setConfig", { enumerable: true, get: function () { return config_1.setConfig; } });
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return config_1.getConfig; } });
Object.defineProperty(exports, "resetConfig", { enumerable: true, get: function () { return config_1.resetConfig; } });
// Vá crypto cho Node 18 — host gọi trước khi dựng transport của SDK. Xem `platform.ts`.
var platform_1 = require("./platform");
Object.defineProperty(exports, "patchCrypto", { enumerable: true, get: function () { return platform_1.patchCrypto; } });
// Lõi công cụ: khai + chạy.
var tools_1 = require("./core/tools");
Object.defineProperty(exports, "defineTools", { enumerable: true, get: function () { return tools_1.defineTools; } });
Object.defineProperty(exports, "runTool", { enumerable: true, get: function () { return tools_1.runTool; } });
// Danh mục + tra cứu tuyến.
var catalog_1 = require("./core/catalog");
Object.defineProperty(exports, "loadCatalog", { enumerable: true, get: function () { return catalog_1.loadCatalog; } });
Object.defineProperty(exports, "normalizeGroup", { enumerable: true, get: function () { return catalog_1.normalizeGroup; } });
Object.defineProperty(exports, "findGroup", { enumerable: true, get: function () { return catalog_1.findGroup; } });
Object.defineProperty(exports, "availableActions", { enumerable: true, get: function () { return catalog_1.availableActions; } });
Object.defineProperty(exports, "routeForAction", { enumerable: true, get: function () { return catalog_1.routeForAction; } });
Object.defineProperty(exports, "allRoutes", { enumerable: true, get: function () { return catalog_1.allRoutes; } });
Object.defineProperty(exports, "routesOfGroup", { enumerable: true, get: function () { return catalog_1.routesOfGroup; } });
Object.defineProperty(exports, "ACTION_NAMES", { enumerable: true, get: function () { return catalog_1.ACTION_NAMES; } });
Object.defineProperty(exports, "ACTION_FROM_NAME", { enumerable: true, get: function () { return catalog_1.ACTION_FROM_NAME; } });
// Mảng nghiệp vụ.
var domains_1 = require("./core/domains");
Object.defineProperty(exports, "allDomains", { enumerable: true, get: function () { return domains_1.allDomains; } });
Object.defineProperty(exports, "domainOfGroup", { enumerable: true, get: function () { return domains_1.domainOfGroup; } });
Object.defineProperty(exports, "findDomain", { enumerable: true, get: function () { return domains_1.findDomain; } });
// Phiên + khoá.
var session_1 = require("./core/session");
Object.defineProperty(exports, "sessionFromEnv", { enumerable: true, get: function () { return session_1.sessionFromEnv; } });
Object.defineProperty(exports, "callBaseUrlOf", { enumerable: true, get: function () { return session_1.callBaseUrlOf; } });
Object.defineProperty(exports, "keyPrefixOf", { enumerable: true, get: function () { return session_1.keyPrefixOf; } });
Object.defineProperty(exports, "requireApiKey", { enumerable: true, get: function () { return session_1.requireApiKey; } });
// Bản triển khai.
var deployment_1 = require("./core/deployment");
Object.defineProperty(exports, "identifyDeployment", { enumerable: true, get: function () { return deployment_1.identifyDeployment; } });
Object.defineProperty(exports, "currentDeployment", { enumerable: true, get: function () { return deployment_1.currentDeployment; } });
// Gọi HTTP + dịch lỗi.
var http_1 = require("./core/http");
Object.defineProperty(exports, "callApi", { enumerable: true, get: function () { return http_1.callApi; } });
Object.defineProperty(exports, "translateError", { enumerable: true, get: function () { return http_1.translateError; } });
// Đóng gói kết quả (gắn tên bản, ẩn khoá).
var result_1 = require("./core/result");
Object.defineProperty(exports, "formatResult", { enumerable: true, get: function () { return result_1.formatResult; } });
Object.defineProperty(exports, "formatError", { enumerable: true, get: function () { return result_1.formatError; } });
Object.defineProperty(exports, "redactKey", { enumerable: true, get: function () { return result_1.redactKey; } });
Object.defineProperty(exports, "deploymentLine", { enumerable: true, get: function () { return result_1.deploymentLine; } });
// Lỗi phân loại.
var errors_1 = require("./core/errors");
Object.defineProperty(exports, "UserError", { enumerable: true, get: function () { return errors_1.UserError; } });
Object.defineProperty(exports, "ConfigError", { enumerable: true, get: function () { return errors_1.ConfigError; } });
// Scanner: sinh danh mục từ mã nguồn máy chủ.
var scan_source_1 = require("./scanner/scan-source");
Object.defineProperty(exports, "scanRepo", { enumerable: true, get: function () { return scan_source_1.scanRepo; } });
Object.defineProperty(exports, "scanFile", { enumerable: true, get: function () { return scan_source_1.scanFile; } });
Object.defineProperty(exports, "findControllerFiles", { enumerable: true, get: function () { return scan_source_1.findControllerFiles; } });
Object.defineProperty(exports, "classifyCrud", { enumerable: true, get: function () { return scan_source_1.classifyCrud; } });
Object.defineProperty(exports, "readModuleManifests", { enumerable: true, get: function () { return scan_source_1.readModuleManifests; } });
//# sourceMappingURL=index.js.map