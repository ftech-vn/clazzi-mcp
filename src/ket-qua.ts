import type { Ban } from './ban.js';

/**
 * Đóng gói mọi kết quả công cụ.
 *
 * Hai việc, cả hai đều là hàng rào an toàn chứ không phải trang trí:
 *
 * 1. **Luôn ghi tên bản.** Ba bản thật đang chạy cùng một mã nguồn và trả lời giống hệt nhau;
 *    không có gì trong phản hồi cho biết đang nói chuyện với bản nào. Nếu kết quả không tự khai,
 *    mô hình sẽ tường thuật lại cho người dùng mà không ai biết vừa sửa vào đâu.
 * 2. **Xoá khoá khỏi chuỗi trả về.** Khoá không có lý do gì để xuất hiện trong kết quả, nhưng nó
 *    có thể lọt ra qua đường vòng — máy chủ dội lại tiêu đề trong thông điệp lỗi chẳng hạn.
 *    Chặn ở đúng một chỗ cuối cùng thì không phụ thuộc vào việc nhớ cẩn thận ở 27 chỗ khác.
 */

/** Khuôn khoá: `clz_<12 ký tự prefix>_<32 ký tự bí mật>`. Bắt cả khuôn dài ngắn khác phòng hờ. */
const RE_KHOA = /clz_[A-Za-z0-9_]{4,}/g;

export function xoaKhoa(chuoi: string): string {
  let ra = chuoi.replace(RE_KHOA, '<khoá đã ẩn>');
  const that = process.env.CLAZZI_API_KEY?.trim();
  // Khoá không theo khuôn `clz_` (bản triển khai cũ, hoặc người dùng dán nhầm thẻ JWT) vẫn phải ẩn.
  if (that && that.length >= 8) ra = ra.split(that).join('<khoá đã ẩn>');
  return ra;
}

export function dongBan(ban: Ban): string {
  const canh = ban.laHeThat ? ' ⚠ DỮ LIỆU THẬT' : '';
  return `[bản: ${ban.ten} · ${ban.diaChi}${canh}]`;
}

/** Kết quả thành công: một dòng nhận diện bản, rồi thân JSON. */
export function ketQua(ban: Ban, than: unknown): string {
  const json = typeof than === 'string' ? than : JSON.stringify(than, null, 2);
  return xoaKhoa(`${dongBan(ban)}\n${json}`);
}

/** Kết quả lỗi. Vẫn phải mang tên bản: lỗi "không tìm thấy" ở bản nào là hai chuyện khác nhau. */
export function ketQuaLoi(ban: Ban, thongDiep: string): string {
  return xoaKhoa(`${dongBan(ban)}\nLỖI: ${thongDiep}`);
}
