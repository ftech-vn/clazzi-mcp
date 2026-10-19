import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { setConfig } from '../src/config';
import { CLAZZI } from '../src/stdio/data/clazzi';
import { loadCatalog } from '../src/core/catalog';
import { domainOfGroup } from '../src/core/domains';
import { scanRepo } from '../src/scanner/scan-source';

setConfig(CLAZZI);
const DOMAINS = CLAZZI.domains;
const VN = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

/**
 * Danh mục đóng gói là ẢNH CHỤP mã nguồn `clazzi-api`. Sinh lại bằng scanner rồi đối chiếu: quét
 * thêm một tuyến ở clazzi-api mà quên chạy `pnpm sinh:clazzi` là đỏ ngay. Bỏ qua khi không có kho
 * anh em nằm cạnh (máy CI không mở cả hai kho) — không đỏ giả.
 */
const CLAZZI_API_ROOT = resolve(__dirname, '../../clazzi-api');
const hasSource = existsSync(resolve(CLAZZI_API_ROOT, 'src/controllers'));

describe('danh mục đóng gói khớp mã nguồn clazzi-api', () => {
  (hasSource ? it : it.skip)('số tuyến/nhóm và từng nhóm khớp bản quét tươi', () => {
    const fresh = scanRepo(CLAZZI_API_ROOT, CLAZZI.groupNames);
    const stored = loadCatalog();
    expect({ routeCount: fresh.routeCount, groupCount: fresh.groupCount }).toEqual({ routeCount: stored.routeCount, groupCount: stored.groupCount });
    expect(fresh.groups.map(n => n.prefix)).toEqual(stored.groups.map(n => n.prefix));
    for (const n of fresh.groups) {
      const saved = stored.groups.find(x => x.prefix === n.prefix);
      expect({ prefix: n.prefix, module: n.module, crud: n.crud }).toEqual({ prefix: saved?.prefix, module: saved?.module, crud: saved?.crud });
    }
  });
});

describe('danh mục có hình dạng đúng', () => {
  const catalog = loadCatalog();

  /**
   * Con số 19 là lý do tồn tại của cả thiết kế: nếu API đồng nhất thì đã phơi CRUD cho mọi nhóm,
   * và đã không cần công cụ cửa thoát lẫn danh mục. Nó trôi đi là phải đọc lại thiết kế.
   */
  it('đúng 19 nhóm có đủ năm việc CRUD', () => {
    expect(catalog.groups.filter(n => Object.values(n.crud).every(Boolean))).toHaveLength(19);
  });

  it('/class-users chỉ có liệt kê — ca thử thật của hợp đồng', () => {
    const n = catalog.groups.find(x => x.prefix === '/class-users');
    expect(n?.crud).toEqual({ list: 'GET /class-users/', get: null, create: null, update: null, remove: null });
  });

  it('ô CRUD nào có giá trị thì đúng khuôn "METHOD /duong/dan"', () => {
    for (const n of catalog.groups) {
      for (const [action, t] of Object.entries(n.crud)) {
        if (t === null) continue;
        expect(`${n.prefix} ${action} ${t}`).toMatch(/ (GET|POST|PUT|DELETE|PATCH) \//);
      }
    }
  });

  it('có mốc thời gian quét hợp lệ', () => {
    expect(Number.isNaN(Date.parse(catalog.scannedAt))).toBe(false);
  });
});

/**
 * Hàng rào chống mã chết: thêm nhóm tuyến mới mà quên xếp vào một mảng nghiệp vụ ⇒ không công cụ
 * nào gọi tới được. Đây chính là cái đã xảy ra với `/reports`.
 */
describe('bản đồ mảng nghiệp vụ ↔ danh mục', () => {
  const catalog = loadCatalog();

  it('mọi nhóm trong danh mục thuộc đúng một mảng', () => {
    expect(catalog.groups.filter(n => !domainOfGroup(n.prefix)).map(n => n.prefix)).toEqual([]);
  });

  it('mọi nhóm mà mảng nhắc tới đều có thật trong danh mục', () => {
    const existing = new Set(catalog.groups.map(n => n.prefix));
    expect(DOMAINS.flatMap(m => m.groups).filter(n => !existing.has(n))).toEqual([]);
  });

  it('không nhóm nào bị xếp vào hai mảng', () => {
    const all = DOMAINS.flatMap(m => m.groups);
    expect(all).toHaveLength(new Set(all).size);
  });

  it('đúng 24 mảng như hợp đồng §4, phủ trọn danh mục', () => {
    expect(DOMAINS).toHaveLength(24);
    expect(DOMAINS.flatMap(m => m.groups)).toHaveLength(catalog.groupCount);
    const routeCount = catalog.groups.reduce((s, n) => s + Object.values(n.crud).filter(Boolean).length + n.otherRoutes.length, 0);
    expect(routeCount).toBe(catalog.routeCount);
  });

  it('mảng nào cũng có tên bắt đầu bằng clazzi_ và mô tả tiếng Việt', () => {
    for (const m of DOMAINS) {
      expect(m.name).toMatch(/^clazzi_[a-z_]+$/);
      expect(m.description.length).toBeGreaterThan(20);
      expect(m.description).toMatch(VN);
    }
  });
});
