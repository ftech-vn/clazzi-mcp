#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { banHienTai } from './ban.js';
import { chayCongCu, dinhNghiaCongCu } from './cong-cu.js';
import { coKhoa } from './the.js';

/**
 * Lớp nối MCP — cố tình mỏng. Mọi luật nghiệp vụ nằm ở `cong-cu.ts` để test gọi thẳng được.
 *
 * NHẮC LẠI CHO NGƯỜI SỬA SAU: tuyệt đối không `console.log` ở bất cứ đâu trong cây này. stdout
 * chính là kênh JSON-RPC của MCP; một dòng lạc vào đó là client không phân tích được gói tin và
 * phiên chết ngay. Mọi thứ cần in đi `console.error`. ESLint đã chặn, đừng tắt luật đó.
 */

async function main(): Promise<void> {
  const ban = banHienTai();

  const server = new Server({ name: 'clazzi-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: dinhNghiaCongCu() }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { text, loi } = await chayCongCu(req.params.name, (req.params.arguments ?? {}) as Record<string, unknown>);
    return { content: [{ type: 'text', text }], isError: loi };
  });

  await server.connect(new StdioServerTransport());

  // stderr: an toàn với giao thức, và là chỗ duy nhất người dùng thấy được mình đang trỏ đâu
  // trước khi gọi công cụ đầu tiên.
  console.error(`clazzi-mcp đang chạy · bản: ${ban.ten} · ${ban.diaChi}${ban.laHeThat ? ' ⚠ DỮ LIỆU THẬT' : ''}`);
  if (!coKhoa()) console.error('CẢNH BÁO: chưa đặt CLAZZI_API_KEY — chỉ gọi được các tuyến công khai.');
}

main().catch((e) => {
  console.error(`clazzi-mcp không khởi động được: ${e instanceof Error ? e.stack : String(e)}`);
  process.exit(1);
});
