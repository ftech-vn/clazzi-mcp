import { getConfig } from '../config';

/**
 * "Bản" = một bản triển khai đang chạy.
 *
 * Đây là chỗ dễ gây hoạ nhất của cả bộ: nhiều bản thật đang chạy, dùng CHUNG một mã nguồn, chung
 * một hình dạng dữ liệu, và trả lời giống hệt nhau. Không có gì trong phản hồi API cho biết ta
 * đang nói chuyện với bản nào. Nên tên bản phải do PHÍA NÀY gắn vào, từ địa chỉ, và phải đi kèm
 * MỌI kết quả — nếu không, một lệnh xoá gõ nhầm bản là xoá vào lớp học của khách trả tiền.
 *
 * Bảng host→tên và địa chỉ mặc định KHÔNG còn ghim ở đây: chúng khác nhau theo thương hiệu nên
 * nằm trong cấu hình (`BrandConfig.daBiet`, `.defaultBaseUrl`).
 */

export interface Deployment {
  name: string;
  url: string;
  /** Có phải dữ liệu thật của khách trả tiền không. Dùng để cảnh báo, không để chặn. */
  isProduction: boolean;
}

export function identifyDeployment(rawUrl?: string): Deployment {
  const c = getConfig();
  const url = (rawUrl?.trim() || c.defaultBaseUrl).replace(/\/+$/, '');
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    // Địa chỉ hỏng vẫn phải trả về một Ban đọc được, để thông điệp lỗi còn nói được "đang trỏ đâu".
    return { name: `KHÔNG RÕ — địa chỉ không hợp lệ (${url})`, url, isProduction: true };
  }
  const known = c.knownHosts[host];
  // Bản lạ mặc định coi như HỆ THẬT: đoán sai theo hướng thận trọng thì chỉ thừa một lời cảnh
  // báo; đoán sai theo hướng kia thì mất dữ liệu.
  return known ? { name: known.name, url, isProduction: known.isProduction } : { name: `KHÔNG RÕ — ${host}`, url, isProduction: true };
}

export function currentDeployment(): Deployment {
  return identifyDeployment(process.env[getConfig().urlEnvVar]);
}
