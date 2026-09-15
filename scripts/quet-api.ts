/**
 * Sinh lại `danh-muc.json` từ mã nguồn `clazzi-api`.
 *
 *   npx tsx scripts/quet-api.ts [duong-dan-toi-clazzi-api]
 *
 * Mặc định tìm kho anh em `../clazzi-api`. Chỉ ĐỌC, không bao giờ ghi vào kho đó.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { quetKho } from '../src/quet-nguon.js';

const thuMucNay = dirname(fileURLToPath(import.meta.url));
const gocKho = resolve(thuMucNay, '..');
const gocApi = resolve(process.argv[2] ?? join(gocKho, '..', 'clazzi-api'));

if (!existsSync(join(gocApi, 'src', 'controllers'))) {
  console.error(`Không thấy mã nguồn clazzi-api ở: ${gocApi}`);
  console.error('Chạy lại kèm đường dẫn: npx tsx scripts/quet-api.ts /duong/dan/clazzi-api');
  process.exit(1);
}

const danhMuc = quetKho(gocApi);
const dich = join(gocKho, 'danh-muc.json');
writeFileSync(dich, `${JSON.stringify(danhMuc, null, 2)}\n`, 'utf8');

// Mọi thứ in ra đều đi stderr: stdout là kênh JSON-RPC của MCP, bẩn stdout là hỏng giao thức.
console.error(`Đã quét ${gocApi}`);
console.error(`  ${danhMuc.soTuyen} tuyến / ${danhMuc.soNhom} nhóm → ${dich}`);
const duCrud = danhMuc.nhom.filter((n) => Object.values(n.crud).every(Boolean)).length;
console.error(`  ${duCrud}/${danhMuc.soNhom} nhóm có đủ 5 việc CRUD`);
