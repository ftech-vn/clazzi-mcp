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

// Vá crypto cho Node 18 — host gọi trước khi dựng transport của SDK. Xem `platform.ts`.
export { patchCrypto } from './platform';

// Lõi công cụ: khai + chạy.
export { defineTools, runTool } from './core/tools';
export type { ToolDefinition, ToolListFilter } from './core/tools';

// Danh mục + tra cứu tuyến.
export {
  loadCatalog,
  normalizeGroup,
  findGroup,
  availableActions,
  routeForAction,
  allRoutes,
  routesOfGroup,
  ACTION_NAMES,
  ACTION_FROM_NAME,
} from './core/catalog';

// Mảng nghiệp vụ.
export { allDomains, domainOfGroup, findDomain } from './core/domains';

// Phiên + khoá.
export { sessionFromEnv, callBaseUrlOf, keyPrefixOf, requireApiKey } from './core/session';
export type { Session } from './core/session';

// Bản triển khai.
export { identifyDeployment, currentDeployment } from './core/deployment';
export type { Deployment } from './core/deployment';

// Gọi HTTP + dịch lỗi.
export { callApi, translateError } from './core/http';
export type { CallResult, CallParams } from './core/http';

// Đóng gói kết quả (gắn tên bản, ẩn khoá).
export { formatResult, formatError, redactKey, deploymentLine } from './core/result';

// Lỗi phân loại.
export { UserError, ConfigError } from './core/errors';

// Scanner: sinh danh mục từ mã nguồn máy chủ.
export { scanRepo, scanFile, findControllerFiles, classifyCrud, readModuleManifests } from './scanner/scan-source';

// Kiểu dữ liệu.
export type { Catalog, Group, Route, Crud, CrudAction, Domain } from './core/types';
