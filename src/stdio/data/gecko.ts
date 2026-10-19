import type { BrandConfig } from '../../config';
import type { Catalog } from '../../core/types';
import catalog from './gecko/catalog.json';
import { DOMAINS } from './gecko/domains';
import { GROUP_NAMES } from './gecko/group-names';

/**
 * Cấu hình thương hiệu GECKO (OTM / F-Tech).
 *
 * Khác clazzi ở đúng những chỗ thương hiệu phải khác: tiền tố tên công cụ (`gecko_*`), biến môi
 * trường (`GECKO_API_*`), bảng bản đã biết, và danh mục riêng — gecko là NHÁNH ĐÃ TRÔI, thiếu
 * hơn chục nhóm so với clazzi (`/zoom`, `/student-documents`, `/site`, `/api-keys`…). Dùng danh
 * mục clazzi cho gecko là hứa hàng chục tuyến máy chủ này không có.
 *
 * Khoá gecko vẫn theo khuôn `clz_` (dùng chung hạ tầng khoá với clazzi), nên `keyPrefix` giữ nguyên.
 */
export const GECKO: BrandConfig = {
  prefix: 'gecko',
  urlEnvVar: 'GECKO_API_URL',
  keyEnvVar: 'GECKO_API_KEY',
  keyPrefix: 'clz_',
  defaultBaseUrl: 'https://otm-api.f-tech.vn',
  knownHosts: {
    'otm-api.f-tech.vn': { name: 'HỆ THẬT — OTM / F-Tech (khách trả tiền)', isProduction: true },
  },
  domains: DOMAINS,
  groupNames: GROUP_NAMES,
  catalog: catalog as unknown as Catalog,
};
