/**
 * GÓI LÕI MCP CỦA CLAZZI — điểm vào công khai.
 *
 * ── Bất biến quan trọng nhất của gói này: KHÔNG nhập `@modelcontextprotocol/sdk` ở bất cứ đâu ──
 * Toàn bộ luật nghiệp vụ (khai công cụ, chạy công cụ, dịch lỗi, ẩn khoá, gắn tên bản, quét mã
 * nguồn) là thuần TypeScript, không phụ thuộc SDK. Nhờ vậy:
 *   1. Bề mặt `.d.ts` của gói KHÔNG tham chiếu kiểu nào của SDK → biên dịch được trên TypeScript
 *      4.6 (knb / peptalk), dù `.d.ts` của SDK đòi TS ≥4.9.
 *   2. Kiểm được bằng test gọi hàm thẳng, không cần dựng transport.
 * SDK chỉ xuất hiện ở TẦNG NỐI (adapter) của mỗi host — tuyến `/mcp` trong máy chủ, hoặc bộ nối
 * stdio ở `src/bo-noi` — nơi SDK nằm ở `peerDependencies`. Đừng kéo SDK vào cây `src/loi`,`src/quet`.
 *
 * Cách dùng: host gọi `datCauHinh(cfg)` MỘT LẦN lúc khởi động, sau đó `dinhNghiaCongCu()` /
 * `chayCongCu()` phục vụ giao thức. Xem `src/bo-noi/server.ts` làm mẫu.
 */

export { datCauHinh, cauHinh, quenCauHinh } from './cau-hinh';
export type { CauHinhThuongHieu } from './cau-hinh';

// Vá crypto cho Node 18 — host gọi trước khi dựng transport của SDK. Xem `nen-tang.ts`.
export { vaCrypto } from './nen-tang';

// Lõi công cụ: khai + chạy.
export { dinhNghiaCongCu, chayCongCu } from './loi/cong-cu';
export type { DinhNghiaCongCu, LocKhaiCongCu } from './loi/cong-cu';

// Danh mục + tra cứu tuyến.
export {
  napDanhMuc,
  chuanHoaNhom,
  timNhom,
  vieclamDuoc,
  tuyenCuaViec,
  moiTuyen,
  moiTuyenCuaNhom,
  TEN_VIEC,
  VIEC_TU_TEN,
} from './loi/danh-muc';

// Mảng nghiệp vụ.
export { moiMang, mangCuaNhom, timMang } from './loi/mang';

// Phiên + khoá.
export { phienTuMoiTruong, diaChiGoiCua, dauKhoa, khoaBatBuoc } from './loi/phien';
export type { Phien } from './loi/phien';

// Bản triển khai.
export { nhanDienBan, banHienTai } from './loi/ban';
export type { Ban } from './loi/ban';

// Gọi HTTP + dịch lỗi.
export { goiApi, dichLoi } from './loi/http';
export type { KetQuaGoi, ThamSoGoi } from './loi/http';

// Đóng gói kết quả (gắn tên bản, ẩn khoá).
export { ketQua, ketQuaLoi, xoaKhoa, dongBan } from './loi/ket-qua';

// Lỗi phân loại.
export { LoiNguoiDung, LoiCauHinh } from './loi/loi';

// Scanner: sinh danh mục từ mã nguồn máy chủ.
export { quetKho, quetTep, timTepController, xepCrud, docBanKeModule } from './quet/quet-nguon';

// Kiểu dữ liệu.
export type { DanhMuc, Nhom, Tuyen, Crud, TenViec, Mang } from './loi/kieu';
