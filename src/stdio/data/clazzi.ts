import type { BrandConfig } from '../../config';
import type { Catalog } from '../../core/types';
import catalog from './clazzi/catalog.json';
import { DOMAINS } from './clazzi/domains';
import { GROUP_NAMES } from './clazzi/group-names';

/**
 * Cấu hình thương hiệu CLAZZI (bản gốc + demo + các khách clazzi).
 *
 * `catalog.json` sinh lúc build từ mã nguồn `clazzi-api` (xem `scripts/generate-catalog.ts`), nên
 * mọi API mới của clazzi tự có mặt trong MCP. Bảng `daBiet` là chỗ phía MCP GẮN TÊN cho từng bản:
 * nhiều bản chạy chung mã nguồn, không có tên thì một lệnh xoá gõ nhầm bản là xoá vào khách khác.
 */
export const CLAZZI: BrandConfig = {
  prefix: 'clazzi',
  urlEnvVar: 'CLAZZI_API_URL',
  keyEnvVar: 'CLAZZI_API_KEY',
  keyPrefix: 'clz_',
  // Cố ý là DEMO: gõ thiếu biến môi trường thì trỏ vào chỗ hỏng được, không phải hệ thật.
  defaultBaseUrl: 'https://api-demo.clazzi.vn',
  knownHosts: {
    'api.clazzi.vn': { name: 'HỆ THẬT — CLAZZI (khách trả tiền)', isProduction: true },
    'api-demo.clazzi.vn': { name: 'DÙNG THỬ — demo', isProduction: false },
    'api.tiengtrungbackinh.com': { name: 'HỆ THẬT — Tiếng Trung Bắc Kinh (khách trả tiền)', isProduction: true },
    'api-sunshine.clazzi.vn': { name: 'HỆ THẬT — Sunshine (khách trả tiền)', isProduction: true },
    // Bản của gecko: nếu ai đó trỏ stdio của clazzi vào đây thì ít ra tên bản vẫn đúng.
    'otm-api.f-tech.vn': { name: 'HỆ THẬT — gecko / OTM (khách trả tiền)', isProduction: true },
  },
  domains: DOMAINS,
  groupNames: GROUP_NAMES,
  catalog: catalog as unknown as Catalog,
};
