/**
 * Sinh `danh-muc.json` cho một thương hiệu, bằng cách QUÉT MÃ NGUỒN kho máy chủ tương ứng.
 *
 *   npx tsx scripts/sinh-danh-muc.ts <thuong-hieu> <duong-dan-kho-server-api>
 *   npx tsx scripts/sinh-danh-muc.ts clazzi ../clazzi-api
 *   npx tsx scripts/sinh-danh-muc.ts gecko   ../../gecko/server-api
 *
 * Đây là bước "prebuild": danh mục là ảnh chụp mã nguồn, sinh lại mỗi lần build để MỌI API mới
 * tự có mặt trong MCP mà không phải sửa tay. Mọi thứ in ra đi stderr — phòng khi có ai chạy nó
 * trong ngữ cảnh mà stdout là kênh giao thức.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { quetKho } from '../src/quet/quet-nguon';
import { TEN_NHOM as CLAZZI } from '../src/bo-noi/du-lieu/clazzi/ten-nhom';
import { TEN_NHOM as GECKO } from '../src/bo-noi/du-lieu/gecko/ten-nhom';

const GOC = resolve(__dirname, '..');
const BANG: Record<string, { tenNhom: Record<string, string>; dich: string }> = {
  clazzi: { tenNhom: CLAZZI, dich: 'src/bo-noi/du-lieu/clazzi/danh-muc.json' },
  gecko: { tenNhom: GECKO, dich: 'src/bo-noi/du-lieu/gecko/danh-muc.json' },
};

const thuongHieu = process.argv[2];
const gocKho = resolve(process.argv[3] ?? '');
const cau = BANG[thuongHieu];

if (!cau || !process.argv[3] || !existsSync(join(gocKho, 'src', 'controllers'))) {
  console.error('Cách dùng: npx tsx scripts/sinh-danh-muc.ts <clazzi|gecko> <duong-dan-kho-server-api>');
  process.exit(1);
}

const danhMuc = quetKho(gocKho, cau.tenNhom);
const dich = join(GOC, cau.dich);
writeFileSync(dich, `${JSON.stringify(danhMuc, null, 2)}\n`, 'utf8');
console.error(`[${thuongHieu}] quét ${gocKho}`);
console.error(`  ${danhMuc.soTuyen} tuyến / ${danhMuc.soNhom} nhóm → ${dich}`);
