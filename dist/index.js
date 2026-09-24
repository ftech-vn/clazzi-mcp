"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.docBanKeModule = exports.xepCrud = exports.timTepController = exports.quetTep = exports.quetKho = exports.LoiCauHinh = exports.LoiNguoiDung = exports.dongBan = exports.xoaKhoa = exports.ketQuaLoi = exports.ketQua = exports.dichLoi = exports.goiApi = exports.banHienTai = exports.nhanDienBan = exports.khoaBatBuoc = exports.dauKhoa = exports.diaChiGoiCua = exports.phienTuMoiTruong = exports.timMang = exports.mangCuaNhom = exports.moiMang = exports.VIEC_TU_TEN = exports.TEN_VIEC = exports.moiTuyenCuaNhom = exports.moiTuyen = exports.tuyenCuaViec = exports.vieclamDuoc = exports.timNhom = exports.chuanHoaNhom = exports.napDanhMuc = exports.chayCongCu = exports.dinhNghiaCongCu = exports.vaCrypto = exports.quenCauHinh = exports.cauHinh = exports.datCauHinh = void 0;
var cau_hinh_1 = require("./cau-hinh");
Object.defineProperty(exports, "datCauHinh", { enumerable: true, get: function () { return cau_hinh_1.datCauHinh; } });
Object.defineProperty(exports, "cauHinh", { enumerable: true, get: function () { return cau_hinh_1.cauHinh; } });
Object.defineProperty(exports, "quenCauHinh", { enumerable: true, get: function () { return cau_hinh_1.quenCauHinh; } });
// Vá crypto cho Node 18 — host gọi trước khi dựng transport của SDK. Xem `nen-tang.ts`.
var nen_tang_1 = require("./nen-tang");
Object.defineProperty(exports, "vaCrypto", { enumerable: true, get: function () { return nen_tang_1.vaCrypto; } });
// Lõi công cụ: khai + chạy.
var cong_cu_1 = require("./loi/cong-cu");
Object.defineProperty(exports, "dinhNghiaCongCu", { enumerable: true, get: function () { return cong_cu_1.dinhNghiaCongCu; } });
Object.defineProperty(exports, "chayCongCu", { enumerable: true, get: function () { return cong_cu_1.chayCongCu; } });
// Danh mục + tra cứu tuyến.
var danh_muc_1 = require("./loi/danh-muc");
Object.defineProperty(exports, "napDanhMuc", { enumerable: true, get: function () { return danh_muc_1.napDanhMuc; } });
Object.defineProperty(exports, "chuanHoaNhom", { enumerable: true, get: function () { return danh_muc_1.chuanHoaNhom; } });
Object.defineProperty(exports, "timNhom", { enumerable: true, get: function () { return danh_muc_1.timNhom; } });
Object.defineProperty(exports, "vieclamDuoc", { enumerable: true, get: function () { return danh_muc_1.vieclamDuoc; } });
Object.defineProperty(exports, "tuyenCuaViec", { enumerable: true, get: function () { return danh_muc_1.tuyenCuaViec; } });
Object.defineProperty(exports, "moiTuyen", { enumerable: true, get: function () { return danh_muc_1.moiTuyen; } });
Object.defineProperty(exports, "moiTuyenCuaNhom", { enumerable: true, get: function () { return danh_muc_1.moiTuyenCuaNhom; } });
Object.defineProperty(exports, "TEN_VIEC", { enumerable: true, get: function () { return danh_muc_1.TEN_VIEC; } });
Object.defineProperty(exports, "VIEC_TU_TEN", { enumerable: true, get: function () { return danh_muc_1.VIEC_TU_TEN; } });
// Mảng nghiệp vụ.
var mang_1 = require("./loi/mang");
Object.defineProperty(exports, "moiMang", { enumerable: true, get: function () { return mang_1.moiMang; } });
Object.defineProperty(exports, "mangCuaNhom", { enumerable: true, get: function () { return mang_1.mangCuaNhom; } });
Object.defineProperty(exports, "timMang", { enumerable: true, get: function () { return mang_1.timMang; } });
// Phiên + khoá.
var phien_1 = require("./loi/phien");
Object.defineProperty(exports, "phienTuMoiTruong", { enumerable: true, get: function () { return phien_1.phienTuMoiTruong; } });
Object.defineProperty(exports, "diaChiGoiCua", { enumerable: true, get: function () { return phien_1.diaChiGoiCua; } });
Object.defineProperty(exports, "dauKhoa", { enumerable: true, get: function () { return phien_1.dauKhoa; } });
Object.defineProperty(exports, "khoaBatBuoc", { enumerable: true, get: function () { return phien_1.khoaBatBuoc; } });
// Bản triển khai.
var ban_1 = require("./loi/ban");
Object.defineProperty(exports, "nhanDienBan", { enumerable: true, get: function () { return ban_1.nhanDienBan; } });
Object.defineProperty(exports, "banHienTai", { enumerable: true, get: function () { return ban_1.banHienTai; } });
// Gọi HTTP + dịch lỗi.
var http_1 = require("./loi/http");
Object.defineProperty(exports, "goiApi", { enumerable: true, get: function () { return http_1.goiApi; } });
Object.defineProperty(exports, "dichLoi", { enumerable: true, get: function () { return http_1.dichLoi; } });
// Đóng gói kết quả (gắn tên bản, ẩn khoá).
var ket_qua_1 = require("./loi/ket-qua");
Object.defineProperty(exports, "ketQua", { enumerable: true, get: function () { return ket_qua_1.ketQua; } });
Object.defineProperty(exports, "ketQuaLoi", { enumerable: true, get: function () { return ket_qua_1.ketQuaLoi; } });
Object.defineProperty(exports, "xoaKhoa", { enumerable: true, get: function () { return ket_qua_1.xoaKhoa; } });
Object.defineProperty(exports, "dongBan", { enumerable: true, get: function () { return ket_qua_1.dongBan; } });
// Lỗi phân loại.
var loi_1 = require("./loi/loi");
Object.defineProperty(exports, "LoiNguoiDung", { enumerable: true, get: function () { return loi_1.LoiNguoiDung; } });
Object.defineProperty(exports, "LoiCauHinh", { enumerable: true, get: function () { return loi_1.LoiCauHinh; } });
// Scanner: sinh danh mục từ mã nguồn máy chủ.
var quet_nguon_1 = require("./quet/quet-nguon");
Object.defineProperty(exports, "quetKho", { enumerable: true, get: function () { return quet_nguon_1.quetKho; } });
Object.defineProperty(exports, "quetTep", { enumerable: true, get: function () { return quet_nguon_1.quetTep; } });
Object.defineProperty(exports, "timTepController", { enumerable: true, get: function () { return quet_nguon_1.timTepController; } });
Object.defineProperty(exports, "xepCrud", { enumerable: true, get: function () { return quet_nguon_1.xepCrud; } });
Object.defineProperty(exports, "docBanKeModule", { enumerable: true, get: function () { return quet_nguon_1.docBanKeModule; } });
//# sourceMappingURL=index.js.map