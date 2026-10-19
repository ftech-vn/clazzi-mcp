import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { setConfig } from '../src/config';
import { GECKO } from '../src/stdio/data/gecko';
import { defineTools, runTool } from '../src/core/tools';
import { loadCatalog } from '../src/core/catalog';
import { domainOfGroup } from '../src/core/domains';
import { identifyDeployment } from '../src/core/deployment';
import { scanRepo } from '../src/scanner/scan-source';
import type { Session } from '../src/core/session';

/**
 * Thương hiệu GECKO trên CÙNG một lõi — chứng minh việc tiêm cấu hình thật sự đổi tiền tố, danh
 * mục, tên bản; không phải clazzi đội lốt. Đây là lý do cả bộ tồn tại: một lõi, nhiều thương hiệu.
 */
setConfig(GECKO);
const DOMAINS = GECKO.domains;
const session = (apiKey: string | null = null): Session => ({ deployment: identifyDeployment('https://otm-api.f-tech.vn'), apiKey: apiKey });

describe('công cụ gecko mang tiền tố gecko_, không phải clazzi_', () => {
  const cc = defineTools();

  it('có 3 công cụ meta tiền tố gecko_', () => {
    expect(cc.map(c => c.name)).toEqual(expect.arrayContaining(['gecko_trang_thai', 'gecko_mo_ta', 'gecko_goi']));
    expect(cc.map(c => c.name).filter(n => n.startsWith('clazzi_'))).toEqual([]);
  });

  it('mọi mảng gecko phủ trong danh mục gecko', () => {
    const catalog = loadCatalog();
    expect(catalog.groups.filter(n => !domainOfGroup(n.prefix)).map(n => n.prefix)).toEqual([]);
    const existing = new Set(catalog.groups.map(n => n.prefix));
    expect(DOMAINS.flatMap(m => m.groups).filter(n => !existing.has(n))).toEqual([]);
  });

  it('thiếu khoá thì hướng dẫn dùng đúng tên máy chủ gecko và biến GECKO_API_KEY', async () => {
    const catalog = loadCatalog();
    const domainWithCrud = DOMAINS.find(m => m.groups.some(t => catalog.groups.find(n => n.prefix === t)?.crud.list));
    const groupWithCrud = domainWithCrud?.groups.find(t => catalog.groups.find(n => n.prefix === t)?.crud.list);
    const { text, isError } = await runTool(session(), String(domainWithCrud?.name), { doiTuong: groupWithCrud, viec: 'liet_ke' });
    expect(isError).toBe(true);
    expect(text).toContain('claude mcp add --transport http gecko https://otm-api.f-tech.vn/mcp');
    expect(text).toContain('GECKO_API_KEY');
  });
});

const GECKO_ROOT = resolve(__dirname, '../../../gecko/server-api');
const hasSource = existsSync(resolve(GECKO_ROOT, 'src/controllers'));

describe('danh mục gecko đóng gói khớp mã nguồn otm-api', () => {
  (hasSource ? it : it.skip)('số tuyến/nhóm khớp bản quét tươi', () => {
    const fresh = scanRepo(GECKO_ROOT, GECKO.groupNames);
    const stored = loadCatalog();
    expect({ routeCount: fresh.routeCount, groupCount: fresh.groupCount }).toEqual({ routeCount: stored.routeCount, groupCount: stored.groupCount });
    expect(fresh.groups.map(n => n.prefix)).toEqual(stored.groups.map(n => n.prefix));
  });
});
