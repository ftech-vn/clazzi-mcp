/**
 * Client stdio tí hon: dựng máy chủ thật rồi in ra đúng những gì nó khai.
 *
 *   npx tsx scripts/liet-ke-cong-cu.ts
 *
 * Có cái này vì test đơn vị chỉ kiểm hàm `dinhNghiaCongCu()`; nó không chứng minh được máy chủ
 * bắt tay xong và trả về đúng bảng đó qua giao thức. Đây là chỗ duy nhất kiểm được điều ấy — và
 * cũng là chỗ lộ ra ngay nếu có ai lỡ in một dòng ra stdout.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

const mayChu = fileURLToPath(new URL('../dist/server.js', import.meta.url));

const client = new Client({ name: 'kiem-tra', version: '0.0.0' }, { capabilities: {} });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [mayChu],
    env: { PATH: process.env.PATH ?? '', CLAZZI_API_URL: 'https://api-demo.clazzi.vn' },
    stderr: 'pipe',
  }),
);

const { tools } = await client.listTools();
console.error(`Máy chủ khai ${tools.length} công cụ:\n`);
for (const t of tools) {
  const lc = t.inputSchema as { properties?: Record<string, { enum?: string[] }> };
  const doiTuong = lc.properties?.doiTuong?.enum;
  console.error(`  ${t.name}`);
  console.error(`      ${t.description?.split('\n')[0] ?? ''}`);
  if (doiTuong) console.error(`      doiTuong (enum): ${doiTuong.join(' ')}`);
}

const kq = await client.callTool({ name: 'clazzi_trang_thai', arguments: {} });
console.error('\n--- clazzi_trang_thai ---');
console.error((kq.content as { text: string }[])[0]?.text);

await client.close();
