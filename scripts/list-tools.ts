/**
 * Client stdio tí hon: dựng máy chủ THẬT rồi in ra đúng những gì nó khai qua giao thức.
 *
 *   npx tsx scripts/list-tools.ts            # thương hiệu clazzi (mặc định)
 *   MCP_THUONG_HIEU=gecko npx tsx scripts/list-tools.ts
 *
 * Có cái này vì test đơn vị chỉ kiểm hàm `defineTools()`; nó không chứng minh được máy chủ
 * bắt tay xong và trả về đúng bảng đó qua giao thức. Đây là chỗ duy nhất kiểm được điều ấy — và
 * cũng là chỗ lộ ra ngay nếu có ai lỡ in một dòng ra stdout.
 */
import { join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main(): Promise<void> {
  const repoRoot = resolve(__dirname, '..');
  const brand = process.env.MCP_THUONG_HIEU ?? 'clazzi';
  const urlEnvVar = brand === 'gecko' ? 'GECKO_API_URL' : 'CLAZZI_API_URL';
  const url = process.env[urlEnvVar] ?? (brand === 'gecko' ? 'https://otm-api.f-tech.vn' : 'https://api-demo.clazzi.vn');

  const client = new Client({ name: 'kiem-tra', version: '0.0.0' }, { capabilities: {} });
  await client.connect(
    new StdioClientTransport({
      command: join(repoRoot, 'node_modules', '.bin', 'tsx'),
      args: [join(repoRoot, 'src', 'stdio', 'server.ts')],
      env: { PATH: process.env.PATH ?? '', MCP_THUONG_HIEU: brand, [urlEnvVar]: url },
      stderr: 'pipe',
    }),
  );

  const { tools } = await client.listTools();
  console.error(`[${brand}] Máy chủ khai ${tools.length} công cụ:\n`);
  for (const t of tools) {
    const schema = t.inputSchema as { properties?: Record<string, { enum?: string[] }> };
    console.error(`  ${t.name}`);
    console.error(`      ${t.description?.split('\n')[0] ?? ''}`);
    const groupEnum = schema.properties?.doiTuong?.enum;
    if (groupEnum) console.error(`      doiTuong (enum): ${groupEnum.join(' ')}`);
  }

  // Tìm công cụ trạng thái theo hậu tố — tên đủ có tiền tố thương hiệu (clazzi_/gecko_).
  const statusToolName = tools.map(t => t.name).find(n => n.endsWith('_trang_thai'));
  if (statusToolName) {
    const res = await client.callTool({ name: statusToolName, arguments: {} });
    console.error(`\n--- ${statusToolName} ---`);
    console.error((res.content as { text: string }[])[0]?.text);
  }

  await client.close();
}

main().catch(e => {
  console.error(e instanceof Error ? e.stack : String(e));
  process.exit(1);
});
