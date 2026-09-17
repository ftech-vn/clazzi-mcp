/**
 * "Bản" = một bản triển khai CLAZZI đang chạy.
 *
 * Đây là chỗ dễ gây hoạ nhất của cả bộ: ba bản thật đang chạy, dùng CHUNG một mã nguồn, chung
 * một hình dạng dữ liệu, và trả lời giống hệt nhau. Không có gì trong phản hồi API cho biết ta
 * đang nói chuyện với bản nào. Nên tên bản phải do PHÍA NÀY gắn vào, từ địa chỉ, và phải đi kèm
 * MỌI kết quả — nếu không, một lệnh xoá gõ nhầm bản là xoá vào lớp học của khách trả tiền.
 */

export interface Ban {
  ten: string;
  diaChi: string;
  /** Có phải dữ liệu thật của khách trả tiền không. Dùng để cảnh báo, không để chặn. */
  laHeThat: boolean;
}

/** Địa chỉ mặc định là DEMO, cố ý: gõ thiếu biến môi trường thì trỏ vào chỗ hỏng được. */
export const DIA_CHI_MAC_DINH = 'https://api-demo.clazzi.vn';

const DA_BIET: Record<string, { ten: string; laHeThat: boolean }> = {
  'api.clazzi.vn': { ten: 'HỆ THẬT — CLAZZI (khách trả tiền)', laHeThat: true },
  'api-demo.clazzi.vn': { ten: 'DÙNG THỬ — demo', laHeThat: false },
  'api.tiengtrungbackinh.com': { ten: 'HỆ THẬT — Tiếng Trung Bắc Kinh (khách trả tiền)', laHeThat: true },
  'api-sunshine.clazzi.vn': { ten: 'HỆ THẬT — Sunshine (khách trả tiền)', laHeThat: true },
  // Bản của gecko. Danh mục riêng: đặt CLAZZI_DANH_MUC=danh-muc.gecko.json, không thì MCP sẽ hứa
  // hàng chục tuyến máy chủ này không có.
  'otm-api.f-tech.vn': { ten: 'HỆ THẬT — gecko / OTM (khách trả tiền)', laHeThat: true },
};

export function nhanDienBan(diaChiTho?: string): Ban {
  const diaChi = (diaChiTho?.trim() || DIA_CHI_MAC_DINH).replace(/\/+$/, '');
  let host: string;
  try {
    host = new URL(diaChi).host;
  } catch {
    // Địa chỉ hỏng vẫn phải trả về một Ban đọc được, để thông điệp lỗi còn nói được "đang trỏ đâu".
    return { ten: `KHÔNG RÕ — địa chỉ không hợp lệ (${diaChi})`, diaChi, laHeThat: true };
  }
  const biet = DA_BIET[host];
  // Bản lạ mặc định coi như HỆ THẬT: đoán sai theo hướng thận trọng thì chỉ thừa một lời cảnh
  // báo; đoán sai theo hướng kia thì mất dữ liệu.
  return biet ? { ten: biet.ten, diaChi, laHeThat: biet.laHeThat } : { ten: `KHÔNG RÕ — ${host}`, diaChi, laHeThat: true };
}

export function banHienTai(): Ban {
  return nhanDienBan(process.env.CLAZZI_API_URL);
}
