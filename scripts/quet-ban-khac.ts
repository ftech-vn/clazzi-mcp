/**
 * Sinh danh mục cho một bản KHÁC HỆ (gecko / OTM), không phải cho `clazzi-api`.
 *
 *   npx tsx scripts/quet-ban-khac.ts <duong-dan-kho> [tep-dich]
 *   npx tsx scripts/quet-ban-khac.ts ~/code/otm-system/server-api danh-muc.gecko.json
 *
 * Danh mục của CHÍNH `clazzi-api` KHÔNG sinh ở đây: nó nằm cùng kho với các controller mà nó mô
 * tả (`clazzi-api/scripts/quet-danh-muc.ts`), và có test bên đó canh cho khỏi lệch. Sinh ở kho
 * này là đặt ảnh chụp xa mã nguồn — đúng cái đã khiến module báo cáo (`/reports`) lên `main` mà
 * trợ lý không có đường nào gọi tới.
 *
 * Mọi thứ in ra đi stderr: stdout là kênh JSON-RPC của MCP.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { quetKho } from '../../clazzi-api/src/mcp/quet/quet-nguon';

const gocKho = resolve(__dirname, '..');
const gocApi = resolve(process.argv[2] ?? '');
const tepDich = process.argv[3] ?? 'danh-muc.gecko.json';

if (!process.argv[2] || !existsSync(join(gocApi, 'src', 'controllers'))) {
  console.error('Cần đường dẫn tới kho máy chủ cần quét.');
  console.error('  npx tsx scripts/quet-ban-khac.ts ~/code/otm-system/server-api danh-muc.gecko.json');
  process.exit(1);
}

const danhMuc = quetKho(gocApi);
const dich = join(gocKho, tepDich);
writeFileSync(dich, `${JSON.stringify(danhMuc, null, 2)}\n`, 'utf8');

console.error(`Đã quét ${gocApi}`);
console.error(`  ${danhMuc.soTuyen} tuyến / ${danhMuc.soNhom} nhóm → ${dich}`);
console.error(`Dùng bằng: CLAZZI_DANH_MUC=${dich} npx tsx src/server.ts`);
