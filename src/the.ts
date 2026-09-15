import { LoiCauHinh } from './loi.js';
import type { Ban } from './ban.js';

/**
 * Lớp mỏng lấy thẻ xác thực — CHỖ DUY NHẤT trong cả bộ biết khoá từ đâu ra.
 *
 * Tám công cụ chỉ biết "có thẻ", không biết nguồn. Giữ ranh giới này để đổi cách xác thực về sau
 * chỉ phải thay ruột hàm này, không phải sờ vào công cụ nào.
 *
 * Hiện tại ruột nó đúng một việc: đọc `CLAZZI_API_KEY` rồi đưa lên. Không nhớ tạm, không làm
 * mới, không ghi ra đĩa — phía `clazzi-api` có middleware đổi khoá thành thẻ ngắn hạn ở rìa, nên
 * phía này không có gì để quản.
 */
export async function layTheXacThuc(ban: Ban): Promise<string> {
  const khoa = process.env.CLAZZI_API_KEY?.trim();
  if (!khoa) throw new LoiCauHinh(thieuKhoa(ban));
  return khoa;
}

export function coKhoa(): boolean {
  return Boolean(process.env.CLAZZI_API_KEY?.trim());
}

/**
 * Phần nhận diện khoá: 12 ký tự prefix, cố ý công khai (hợp đồng §3.1) — đủ để người dùng đối
 * chiếu "khoá tôi dán vào demo có đúng là khoá của demo không", không đủ để dùng.
 *
 * Trả về KHÔNG kèm chữ `clz_`. Bộ ẩn khoá ở `ket-qua.ts` quét mọi chuỗi `clz_…` và xoá sạch —
 * đúng như thế là tốt, đừng nới nó ra để lọt cái prefix này; nới một lần là mở đường cho khoá
 * thật lọt theo. Bỏ tiền tố đi thì hai luật cùng đúng, không phải đánh đổi.
 */
export function dauKhoa(): string | null {
  const khoa = process.env.CLAZZI_API_KEY?.trim();
  if (!khoa) return null;
  const m = khoa.match(/^clz_([A-Za-z0-9]{1,12})_/);
  return m ? m[1]! : '(khoá không theo khuôn clz_<prefix>_<bí mật>)';
}

function thieuKhoa(ban: Ban): string {
  return [
    `Chưa có khoá API nên không gọi được ${ban.diaChi} (${ban.ten}).`,
    '',
    'Khoá dán vào khối "env" của cấu hình MCP, không truyền qua tham số công cụ:',
    '',
    '  {"mcpServers": {"clazzi": {',
    '    "command": "node",',
    '    "args": ["/duong/dan/clazzi-mcp/dist/server.js"],',
    `    "env": {"CLAZZI_API_URL": "${ban.diaChi}", "CLAZZI_API_KEY": "clz_..."}`,
    '  }}}',
    '',
    'Hoặc bằng dòng lệnh:',
    `  claude mcp add clazzi -e CLAZZI_API_URL=${ban.diaChi} -e CLAZZI_API_KEY=clz_... -- node /duong/dan/clazzi-mcp/dist/server.js`,
    '',
    'Khoá cấp theo TỪNG BẢN: khoá của demo không dùng được ở hệ thật và ngược lại.',
    'Lấy khoá bằng POST /api-keys từ một phiên đăng nhập thật; khoá chỉ hiện đầy đủ đúng một lần.',
  ].join('\n');
}
