#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { chayCongCu, dinhNghiaCongCu } from '../../clazzi-api/src/mcp/loi/cong-cu';
import { napDanhMuc } from '../../clazzi-api/src/mcp/loi/danh-muc';
import { phienTuMoiTruong } from '../../clazzi-api/src/mcp/loi/phien';

/**
 * Máy chủ MCP qua STDIO — đường dành cho NGƯỜI TRONG ĐỘI.
 *
 * Khách hàng không dùng tệp này: họ cắm thẳng vào `https://api-<mã>.clazzi.vn/mcp` bằng một URL
 * và một khoá, không cài gì cả (xem `clazzi-api/src/mcp/tuyen.ts`). Đường stdio vẫn ở lại vì hai
 * việc nó làm tốt hơn: gỡ lỗi (đổi mã, chạy lại ngay, không phải dựng ảnh) và trỏ vào một bản
 * KHÁC HỆ — ví dụ gecko, bằng `CLAZZI_DANH_MUC=danh-muc.gecko.json`.
 *
 * ── Vì sao tệp này không còn định nghĩa công cụ nào ──────────────────────────────────────────
 * Lõi 27 công cụ nằm ở `clazzi-api/src/mcp/loi/`, và tệp này NHẬP THẲNG từ đó. Chỉ có một bản
 * định nghĩa trên đời, nên đường HTTP và đường stdio không thể trôi khỏi nhau. Cái giá là kho
 * này cần kho anh em `../clazzi-api` nằm cạnh — vốn đã là điều kiện từ trước, vì danh mục xưa
 * nay vẫn sinh ra bằng cách quét mã nguồn kho đó.
 *
 * NHẮC LẠI CHO NGƯỜI SỬA SAU: tuyệt đối không `console.log` ở bất cứ đâu trong cây này. stdout
 * chính là kênh JSON-RPC của MCP; một dòng lạc vào đó là client không phân tích được gói tin và
 * phiên chết ngay. Mọi thứ cần in đi `console.error`. ESLint đã chặn, đừng tắt luật đó.
 */

async function main(): Promise<void> {
  /**
   * Phiên đọc từ biến môi trường, và đọc MỘT LẦN cho cả tiến trình — đúng bản chất stdio: một
   * tiến trình phục vụ đúng một người. Đường HTTP thì ngược lại, dựng phiên riêng cho mỗi lượt
   * gọi; cùng một lõi, khác cách nạp phiên, và đó là toàn bộ khác biệt giữa hai đường.
   */
  const phien = phienTuMoiTruong();

  const server = new Server({ name: 'clazzi-mcp', version: '0.2.0' }, { capabilities: { tools: {} } });

  /**
   * Không lọc theo cờ module ở đây: tiến trình này không nối cơ sở dữ liệu nên không đọc được
   * cờ. Công cụ của module đang tắt vẫn hiện ra, nhưng gọi vào sẽ nhận đúng lỗi 404 mà
   * `module-gate` của máy chủ trả về — chặn vẫn nguyên vẹn, chỉ là bảng công cụ không gọn bằng
   * đường HTTP.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: dinhNghiaCongCu() }));

  server.setRequestHandler(CallToolRequestSchema, async req => {
    const { text, loi } = await chayCongCu(phien, req.params.name, (req.params.arguments ?? {}) as Record<string, unknown>);
    return { content: [{ type: 'text' as const, text }], isError: loi };
  });

  await server.connect(new StdioServerTransport());

  // stderr: an toàn với giao thức, và là chỗ duy nhất người dùng thấy được mình đang trỏ đâu
  // trước khi gọi công cụ đầu tiên.
  const dm = napDanhMuc();
  console.error(
    `clazzi-mcp (stdio) · bản: ${phien.ban.ten} · ${phien.ban.diaChi}${phien.ban.laHeThat ? ' ⚠ DỮ LIỆU THẬT' : ''} · danh mục ${dm.soTuyen} tuyến`,
  );
  if (!phien.khoa) console.error('CẢNH BÁO: chưa đặt CLAZZI_API_KEY — mọi công cụ sẽ trả về hướng dẫn lấy khoá.');
}

main().catch(e => {
  console.error(`clazzi-mcp không khởi động được: ${e instanceof Error ? e.stack : String(e)}`);
  process.exit(1);
});
