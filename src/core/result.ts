import { getConfig } from '../config';
import type { Deployment } from './deployment';
import type { Session } from './session';

/**
 * Đóng gói mọi kết quả công cụ.
 *
 * Hai việc, cả hai đều là hàng rào an toàn chứ không phải trang trí:
 *
 * 1. **Luôn ghi tên bản.** Nhiều bản thật đang chạy cùng một mã nguồn và trả lời giống hệt nhau;
 *    không có gì trong phản hồi cho biết đang nói chuyện với bản nào. Nếu kết quả không tự khai,
 *    mô hình sẽ tường thuật lại cho người dùng mà không ai biết vừa sửa vào đâu.
 * 2. **Xoá khoá khỏi chuỗi trả về.** Khoá không có lý do gì để xuất hiện trong kết quả, nhưng nó
 *    có thể lọt ra qua đường vòng — máy chủ dội lại tiêu đề trong thông điệp lỗi chẳng hạn.
 *    Chặn ở đúng một chỗ cuối cùng thì không phụ thuộc vào việc nhớ cẩn thận ở 27 chỗ khác.
 */

export function redactKey(text: string, apiKey: string | null): string {
  // Khuôn khoá: `<keyPrefix><prefix>_<bí mật>`, ví dụ `clz_...`. Dựng regex từ tiền tố của
  // thương hiệu đang cấu hình — bản khoá khuôn khác cũng ẩn đúng, không phải ghim cứng `clz_`.
  const tt = getConfig().keyPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${tt}[A-Za-z0-9_]{4,}`, 'g');
  let ra = text.replace(re, '<khoá đã ẩn>');
  // Khoá không theo khuôn (bản triển khai cũ, hoặc người dùng dán nhầm thẻ JWT) vẫn phải ẩn.
  if (apiKey && apiKey.length >= 8) ra = ra.split(apiKey).join('<khoá đã ẩn>');
  return ra;
}

export function deploymentLine(ban: Deployment): string {
  const warning = ban.isProduction ? ' ⚠ DỮ LIỆU THẬT' : '';
  return `[bản: ${ban.name} · ${ban.url}${warning}]`;
}

/** Kết quả thành công: một dòng nhận diện bản, rồi thân JSON. */
export function formatResult(session: Session, payload: unknown): string {
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  return redactKey(`${deploymentLine(session.deployment)}\n${json}`, session.apiKey);
}

/** Kết quả lỗi. Vẫn phải mang tên bản: lỗi "không tìm thấy" ở bản nào là hai chuyện khác nhau. */
export function formatError(session: Session, message: string): string {
  return redactKey(`${deploymentLine(session.deployment)}\nLỖI: ${message}`, session.apiKey);
}
