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
export { setConfig, getConfig, resetConfig } from './config';
export type { BrandConfig } from './config';
export { patchCrypto } from './platform';
export { defineTools, runTool } from './core/tools';
export type { ToolDefinition, ToolListFilter } from './core/tools';
export { loadCatalog, normalizeGroup, findGroup, availableActions, routeForAction, allRoutes, routesOfGroup, ACTION_NAMES, ACTION_FROM_NAME, } from './core/catalog';
export { allDomains, domainOfGroup, findDomain } from './core/domains';
export { sessionFromEnv, callBaseUrlOf, keyPrefixOf, requireApiKey } from './core/session';
export type { Session } from './core/session';
export { identifyDeployment, currentDeployment } from './core/deployment';
export type { Deployment } from './core/deployment';
export { callApi, translateError } from './core/http';
export type { CallResult, CallParams } from './core/http';
export { formatResult, formatError, redactKey, deploymentLine } from './core/result';
export { UserError, ConfigError } from './core/errors';
export { scanRepo, scanFile, findControllerFiles, classifyCrud, readModuleManifests } from './scanner/scan-source';
export type { Catalog, Group, Route, Crud, CrudAction, Domain } from './core/types';
//# sourceMappingURL=index.d.ts.map