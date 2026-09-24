#!/usr/bin/env node
// PHẢI đứng trước khi transport của SDK được nạp: trả lại global `crypto` cho Node 18. Gói lõi
// tự chạy vá khi nạp `../index`, nhưng gọi tường minh ở đây cho chắc thứ tự, và để rõ ý.
import { vaCrypto } from '../index';
vaCrypto();

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { chayCongCu, dinhNghiaCongCu, napDanhMuc, phienTuMoiTruong, datCauHinh } from '../index';
import type { CauHinhThuongHieu, DanhMuc } from '../index';
import { CLAZZI } from './du-lieu/clazzi';
import { GECKO } from './du-lieu/gecko';

/**
 * Máy chủ MCP qua STDIO — đường dành cho NGƯỜI TRONG ĐỘI.
 *
 * Khách hàng không dùng tệp này: họ cắm thẳng vào `https://api-<mã>.clazzi.vn/mcp` bằng một URL
 * và một khoá, không cài gì cả (xem tầng nối `/mcp` trong chính máy chủ). Đường stdio ở lại vì
 * hai việc nó làm tốt hơn: gỡ lỗi (đổi mã, chạy lại ngay, không phải dựng ảnh) và trỏ vào một
 * bản KHÁC HỆ — ví dụ gecko, bằng `MCP_THUONG_HIEU=gecko`.
 *
 * ── Khác với trước: tệp này KHÔNG còn nhập lõi từ `../../clazzi-api` ────────────────────────
 * Lõi giờ là GÓI trong chính kho này (`../index`). Cả clazzi-api, gecko và bộ nối này cùng nhập
 * một lõi, nên không thể trôi khỏi nhau, và kho này không còn cần kho anh em nằm cạnh.
 *
 * NHẮC LẠI CHO NGƯỜI SỬA SAU: tuyệt đối không `console.log` ở bất cứ đâu trong cây này. stdout
 * chính là kênh JSON-RPC của MCP; một dòng lạc vào đó là client không phân tích được gói tin và
 * phiên chết ngay. Mọi thứ cần in đi `console.error`. ESLint đã chặn, đừng tắt luật đó.
 */

/** Chọn cấu hình thương hiệu theo `MCP_THUONG_HIEU` (mặc định clazzi). */
function chonThuongHieu(): CauHinhThuongHieu {
  const th = (process.env.MCP_THUONG_HIEU ?? 'clazzi').trim().toLowerCase();
  const cfg = th === 'gecko' ? GECKO : CLAZZI;

  /**
   * `CLAZZI_DANH_MUC` là lối thoát cũ vẫn giữ: khai ĐƯỜNG DẪN tới một tệp danh mục khác để trỏ
   * bộ nối vào một bản có danh mục riêng mà không cần sinh lại dữ liệu đóng gói. Ghi đè LÊN danh
   * mục mặc định của thương hiệu đã chọn.
   */
  const duongDanKhac = process.env.CLAZZI_DANH_MUC?.trim();
  if (duongDanKhac) {
    const dm = JSON.parse(readFileSync(resolve(duongDanKhac), 'utf8')) as DanhMuc;
    return { ...cfg, danhMuc: dm };
  }
  return cfg;
}

async function main(): Promise<void> {
  datCauHinh(chonThuongHieu());

  /**
   * Phiên đọc từ biến môi trường, và đọc MỘT LẦN cho cả tiến trình — đúng bản chất stdio: một
   * tiến trình phục vụ đúng một người. Đường HTTP thì ngược lại, dựng phiên riêng cho mỗi lượt
   * gọi; cùng một lõi, khác cách nạp phiên, và đó là toàn bộ khác biệt giữa hai đường.
   */
  const phien = phienTuMoiTruong();

  const server = new Server({ name: 'clazzi-mcp', version: '0.3.0' }, { capabilities: { tools: {} } });

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
  if (!phien.khoa) console.error(`CẢNH BÁO: chưa đặt khoá API — mọi công cụ sẽ trả về hướng dẫn lấy khoá.`);
}

main().catch(e => {
  console.error(`clazzi-mcp không khởi động được: ${e instanceof Error ? e.stack : String(e)}`);
  process.exit(1);
});
