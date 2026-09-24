import type { Mang } from '../../../loi/kieu';

export const MANG: Mang[] = [
  {
    ten: 'clazzi_hoc_vien',
    moTa: 'Học viên và phụ huynh: hồ sơ học viên, phụ huynh, thông tin chuẩn bị đầu vào, buổi học của từng học viên.',
    nhom: ['/users', '/parents', '/user-preparations', '/user-sessions'],
  },
  {
    ten: 'clazzi_nhan_su',
    moTa: 'Nhân sự trung tâm: hồ sơ giáo viên và nhân viên, phân công giáo viên vào lớp.',
    nhom: ['/staffs', '/class-teachers'],
  },
  {
    ten: 'clazzi_phan_quyen',
    moTa: 'Phân quyền: chức danh, quyền, quyền theo module, danh sách chức năng và module, tài khoản đăng nhập.',
    nhom: ['/roles', '/permissions', '/role-modules', '/functions', '/modules', '/accounts'],
  },
  {
    ten: 'clazzi_lop_hoc',
    moTa: 'Lớp học: lớp, học viên trong lớp, ca học, phòng học.',
    nhom: ['/classes', '/class-users', '/class-shifts', '/classrooms'],
  },
  {
    ten: 'clazzi_buoi_hoc',
    moTa: 'Buổi học: buổi học của lớp, bài giảng gắn vào buổi, nhận xét buổi học và tiêu chí nhận xét.',
    nhom: ['/class-sessions', '/class-lessons', '/session-review', '/session-review-criteria'],
  },
  {
    ten: 'clazzi_diem_danh',
    moTa: 'Điểm danh và nghỉ phép: bảng điểm danh, đơn xin nghỉ, bình luận trên đơn nghỉ.',
    nhom: ['/attendance-sheet', '/absence-requests', '/absence-request-comments'],
  },
  {
    ten: 'clazzi_khoa_hoc',
    moTa: 'Chương trình đào tạo: khoá học và bài học trong khoá.',
    nhom: ['/courses', '/lessons'],
  },
  {
    ten: 'clazzi_bai_tap',
    moTa: 'Bài tập: bài tập giao theo buổi học, tệp đính kèm, báo cáo làm bài của học viên, tệp báo cáo, bình luận bài tập.',
    nhom: [
      '/session-exercises',
      '/session-exercise-attachments',
      '/session-exercise-report',
      '/session-exercise-report-attachments',
      '/exercise-comments',
    ],
  },
  {
    ten: 'clazzi_hoc_phi',
    moTa: 'Học phí: hợp đồng học, biên lai thu tiền, hẹn thanh toán, gói buổi học.',
    nhom: ['/contracts', '/receipts', '/payment-appointment', '/session-packages'],
  },
  {
    ten: 'clazzi_thoi_khoa_bieu',
    moTa: 'Thời khoá biểu: lịch dạy và lịch học, khung giờ học, ngày nghỉ lễ.',
    nhom: ['/schedule', '/session-times', '/holidays'],
  },
  {
    ten: 'clazzi_co_so',
    moTa: 'Cơ sở / trung tâm: danh sách các chi nhánh của hệ thống.',
    nhom: ['/centers'],
  },
  {
    ten: 'clazzi_crm',
    moTa: 'CRM bán hàng: khách hàng tiềm năng, cơ hội bán, việc cần làm, lịch hẹn tư vấn, nguồn khách, chính sách SLA, luật tự động.',
    nhom: ['/crm'],
  },
  {
    ten: 'clazzi_ho_tro',
    moTa: 'Phiếu hỗ trợ nội bộ: phiếu yêu cầu và bình luận trao đổi trên phiếu.',
    nhom: ['/support', '/support-comments'],
  },
  {
    ten: 'clazzi_bang_tin',
    moTa: 'Bảng tin: bài viết, bình luận, cảm xúc, tệp đính kèm bài viết.',
    nhom: ['/posts', '/post-comments', '/post-reaction', '/post-attachments'],
  },
  {
    ten: 'clazzi_thong_bao',
    moTa: 'Thông báo đẩy và kênh Zalo: thông báo trong ứng dụng, kết nối và gửi tin qua Zalo.',
    nhom: ['/notifications', '/zalo'],
  },
  {
    ten: 'clazzi_lop_online',
    moTa: 'Lớp học trực tuyến qua Zoom: tạo phòng, gắn vào buổi học, theo dõi tham dự.',
    nhom: ['/zoom'],
  },
  {
    ten: 'clazzi_ho_so_du_hoc',
    moTa: 'Hồ sơ du học: giấy tờ của học viên, loại giấy tờ, nhắc nộp hồ sơ còn thiếu.',
    nhom: ['/student-documents', '/document-types', '/document-reminders'],
  },
  {
    ten: 'clazzi_bao_luu_day_bu',
    moTa: 'Bảo lưu và dạy bù: đơn bảo lưu khoá học, buổi dạy bù hoặc bổ trợ.',
    nhom: ['/reservations', '/makeup'],
  },
  {
    ten: 'clazzi_tep',
    moTa: 'Tệp: tải lên, tải về và quản lý tệp dùng chung của hệ thống.',
    nhom: ['/files'],
  },
  {
    ten: 'clazzi_cai_dat',
    moTa: 'Cài đặt hệ thống: cài đặt chung, cấu hình ứng dụng di động, cấu hình kỹ thuật.',
    nhom: ['/settings', '/app-configs', '/config'],
  },
  {
    ten: 'clazzi_dia_gioi',
    moTa: 'Địa giới hành chính: tỉnh/thành, quận/huyện, phường/xã — dùng để điền địa chỉ.',
    nhom: ['/provinces', '/districts', '/wards'],
  },
  {
    ten: 'clazzi_bao_cao',
    moTa: 'Bảng điều khiển và báo cáo tổng hợp: số liệu toàn trung tâm, báo cáo theo lớp và theo học viên.',
    // `/reports` thuộc module REPRT (bán lẻ), `/dashboard` là lõi. Xếp chung một công cụ vì với
    // người dùng thì cả hai đều là "xem số liệu"; bộ lọc theo cờ module ở `cong-cu.ts` tự bỏ
    // `/reports` ra khi khách chưa mua, và cổng module vẫn chặn ở lượt gọi thật.
    nhom: ['/dashboard', '/reports'],
  },
  {
    ten: 'clazzi_admin_tong',
    moTa: 'Admin tổng — quản trị NHIỀU bản triển khai: sổ đăng ký khách, đơn hàng, danh mục bán. Không phải quản trị một trung tâm.',
    nhom: ['/site', '/orders', '/catalog'],
  },
  {
    ten: 'clazzi_he_thong',
    moTa: 'Hạ tầng và vòng đời bản triển khai: kiểm tra sống, phiên bản, thiết lập lần đầu, đăng ký dùng thử, các tuyến xác thực, khoá API của chính mình.',
    nhom: ['/health', '/version', '/setup', '/trial', '/auth', '/api-keys'],
  },
];
