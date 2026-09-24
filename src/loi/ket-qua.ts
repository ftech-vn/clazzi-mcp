import { cauHinh } from '../cau-hinh';
import type { Ban } from './ban';
import type { Phien } from './phien';

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

export function xoaKhoa(chuoi: string, khoa: string | null): string {
  // Khuôn khoá: `<tienToKhoa><prefix>_<bí mật>`, ví dụ `clz_...`. Dựng regex từ tiền tố của
  // thương hiệu đang cấu hình — bản khoá khuôn khác cũng ẩn đúng, không phải ghim cứng `clz_`.
  const tt = cauHinh().tienToKhoa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${tt}[A-Za-z0-9_]{4,}`, 'g');
  let ra = chuoi.replace(re, '<khoá đã ẩn>');
  // Khoá không theo khuôn (bản triển khai cũ, hoặc người dùng dán nhầm thẻ JWT) vẫn phải ẩn.
  if (khoa && khoa.length >= 8) ra = ra.split(khoa).join('<khoá đã ẩn>');
  return ra;
}

export function dongBan(ban: Ban): string {
  const canh = ban.laHeThat ? ' ⚠ DỮ LIỆU THẬT' : '';
  return `[bản: ${ban.ten} · ${ban.diaChi}${canh}]`;
}

/** Kết quả thành công: một dòng nhận diện bản, rồi thân JSON. */
export function ketQua(phien: Phien, than: unknown): string {
  const json = typeof than === 'string' ? than : JSON.stringify(than, null, 2);
  return xoaKhoa(`${dongBan(phien.ban)}\n${json}`, phien.khoa);
}

/** Kết quả lỗi. Vẫn phải mang tên bản: lỗi "không tìm thấy" ở bản nào là hai chuyện khác nhau. */
export function ketQuaLoi(phien: Phien, thongDiep: string): string {
  return xoaKhoa(`${dongBan(phien.ban)}\nLỖI: ${thongDiep}`, phien.khoa);
}
