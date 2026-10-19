/**
 * Sinh `catalog.json` cho một thương hiệu, bằng cách QUÉT MÃ NGUỒN kho máy chủ tương ứng.
 *
 *   npx tsx scripts/generate-catalog.ts <thuong-hieu> <duong-dan-kho-server-api>
 *   npx tsx scripts/generate-catalog.ts clazzi ../clazzi-api
 *   npx tsx scripts/generate-catalog.ts gecko   ../../gecko/server-api
 *
 * Đây là bước "prebuild": danh mục là ảnh chụp mã nguồn, sinh lại mỗi lần build để MỌI API mới
 * tự có mặt trong MCP mà không phải sửa tay. Mọi thứ in ra đi stderr — phòng khi có ai chạy nó
 * trong ngữ cảnh mà stdout là kênh giao thức.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { scanRepo } from '../src/scanner/scan-source';
import { GROUP_NAMES as CLAZZI } from '../src/stdio/data/clazzi/group-names';
import { GROUP_NAMES as GECKO } from '../src/stdio/data/gecko/group-names';

const ROOT = resolve(__dirname, '..');
const BRANDS: Record<string, { groupNames: Record<string, string>; target: string }> = {
  clazzi: { groupNames: CLAZZI, target: 'src/stdio/data/clazzi/catalog.json' },
  gecko: { groupNames: GECKO, target: 'src/stdio/data/gecko/catalog.json' },
};

const brand = process.argv[2];
const repoRoot = resolve(process.argv[3] ?? '');
const entry = BRANDS[brand];

if (!entry || !process.argv[3] || !existsSync(join(repoRoot, 'src', 'controllers'))) {
  console.error('Cách dùng: npx tsx scripts/generate-catalog.ts <clazzi|gecko> <duong-dan-kho-server-api>');
  process.exit(1);
}

const catalog = scanRepo(repoRoot, entry.groupNames);
const target = join(ROOT, entry.target);
writeFileSync(target, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.error(`[${brand}] quét ${repoRoot}`);
console.error(`  ${catalog.routeCount} tuyến / ${catalog.groupCount} nhóm → ${target}`);
