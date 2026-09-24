/**
 * Client stdio tí hon: dựng máy chủ THẬT rồi in ra đúng những gì nó khai qua giao thức.
 *
 *   npx tsx scripts/liet-ke-cong-cu.ts            # thương hiệu clazzi (mặc định)
 *   MCP_THUONG_HIEU=gecko npx tsx scripts/liet-ke-cong-cu.ts
 *
 * Có cái này vì test đơn vị chỉ kiểm hàm `dinhNghiaCongCu()`; nó không chứng minh được máy chủ
 * bắt tay xong và trả về đúng bảng đó qua giao thức. Đây là chỗ duy nhất kiểm được điều ấy — và
 * cũng là chỗ lộ ra ngay nếu có ai lỡ in một dòng ra stdout.
 */
import { join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main(): Promise<void> {
  const gocKho = resolve(__dirname, '..');
  const thuongHieu = process.env.MCP_THUONG_HIEU ?? 'clazzi';
  const bienUrl = thuongHieu === 'gecko' ? 'GECKO_API_URL' : 'CLAZZI_API_URL';
  const diaChi = process.env[bienUrl] ?? (thuongHieu === 'gecko' ? 'https://otm-api.f-tech.vn' : 'https://api-demo.clazzi.vn');

  const client = new Client({ name: 'kiem-tra', version: '0.0.0' }, { capabilities: {} });
  await client.connect(
    new StdioClientTransport({
      command: join(gocKho, 'node_modules', '.bin', 'tsx'),
      args: [join(gocKho, 'src', 'bo-noi', 'server.ts')],
      env: { PATH: process.env.PATH ?? '', MCP_THUONG_HIEU: thuongHieu, [bienUrl]: diaChi },
      stderr: 'pipe',
    }),
  );

  const { tools } = await client.listTools();
  console.error(`[${thuongHieu}] Máy chủ khai ${tools.length} công cụ:\n`);
  for (const t of tools) {
    const lc = t.inputSchema as { properties?: Record<string, { enum?: string[] }> };
    console.error(`  ${t.name}`);
    console.error(`      ${t.description?.split('\n')[0] ?? ''}`);
    const doiTuong = lc.properties?.doiTuong?.enum;
    if (doiTuong) console.error(`      doiTuong (enum): ${doiTuong.join(' ')}`);
  }

  // Tìm công cụ trạng thái theo hậu tố — tên đủ có tiền tố thương hiệu (clazzi_/gecko_).
  const tenTrangThai = tools.map(t => t.name).find(n => n.endsWith('_trang_thai'));
  if (tenTrangThai) {
    const kq = await client.callTool({ name: tenTrangThai, arguments: {} });
    console.error(`\n--- ${tenTrangThai} ---`);
    console.error((kq.content as { text: string }[])[0]?.text);
  }

  await client.close();
}

main().catch(e => {
  console.error(e instanceof Error ? e.stack : String(e));
  process.exit(1);
});
