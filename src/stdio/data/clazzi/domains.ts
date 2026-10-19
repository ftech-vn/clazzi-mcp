import type { Domain } from '../../../core/types';

export const DOMAINS: Domain[] = [
  {
    name: 'clazzi_hoc_vien',
    description: 'Học viên và phụ huynh: hồ sơ học viên, phụ huynh, thông tin chuẩn bị đầu vào, buổi học của từng học viên.',
    groups: ['/users', '/parents', '/user-preparations', '/user-sessions'],
  },
  {
    name: 'clazzi_nhan_su',
    description: 'Nhân sự trung tâm: hồ sơ giáo viên và nhân viên, phân công giáo viên vào lớp.',
    groups: ['/staffs', '/class-teachers'],
  },
  {
    name: 'clazzi_phan_quyen',
    description: 'Phân quyền: chức danh, quyền, quyền theo module, danh sách chức năng và module, tài khoản đăng nhập.',
    groups: ['/roles', '/permissions', '/role-modules', '/functions', '/modules', '/accounts'],
  },
  {
    name: 'clazzi_lop_hoc',
    description: 'Lớp học: lớp, học viên trong lớp, ca học, phòng học.',
    groups: ['/classes', '/class-users', '/class-shifts', '/classrooms'],
  },
  {
    name: 'clazzi_buoi_hoc',
    description: 'Buổi học: buổi học của lớp, bài giảng gắn vào buổi, nhận xét buổi học và tiêu chí nhận xét.',
    groups: ['/class-sessions', '/class-lessons', '/session-review', '/session-review-criteria'],
  },
  {
    name: 'clazzi_diem_danh',
    description: 'Điểm danh và nghỉ phép: bảng điểm danh, đơn xin nghỉ, bình luận trên đơn nghỉ.',
    groups: ['/attendance-sheet', '/absence-requests', '/absence-request-comments'],
  },
  {
    name: 'clazzi_khoa_hoc',
    description: 'Chương trình đào tạo: khoá học và bài học trong khoá.',
    groups: ['/courses', '/lessons'],
  },
  {
    name: 'clazzi_bai_tap',
    description: 'Bài tập: bài tập giao theo buổi học, tệp đính kèm, báo cáo làm bài của học viên, tệp báo cáo, bình luận bài tập.',
    groups: [
      '/session-exercises',
      '/session-exercise-attachments',
      '/session-exercise-report',
      '/session-exercise-report-attachments',
      '/exercise-comments',
    ],
  },
  {
    name: 'clazzi_hoc_phi',
    description: 'Học phí: hợp đồng học, biên lai thu tiền, hẹn thanh toán, gói buổi học.',
    groups: ['/contracts', '/receipts', '/payment-appointment', '/session-packages'],
  },
  {
    name: 'clazzi_thoi_khoa_bieu',
    description: 'Thời khoá biểu: lịch dạy và lịch học, khung giờ học, ngày nghỉ lễ.',
    groups: ['/schedule', '/session-times', '/holidays'],
  },
  {
    name: 'clazzi_co_so',
    description: 'Cơ sở / trung tâm: danh sách các chi nhánh của hệ thống.',
    groups: ['/centers'],
  },
  {
    name: 'clazzi_crm',
    description: 'CRM bán hàng: khách hàng tiềm năng, cơ hội bán, việc cần làm, lịch hẹn tư vấn, nguồn khách, chính sách SLA, luật tự động.',
    groups: ['/crm'],
  },
  {
    name: 'clazzi_ho_tro',
    description: 'Phiếu hỗ trợ nội bộ: phiếu yêu cầu và bình luận trao đổi trên phiếu.',
    groups: ['/support', '/support-comments'],
  },
  {
    name: 'clazzi_bang_tin',
    description: 'Bảng tin: bài viết, bình luận, cảm xúc, tệp đính kèm bài viết.',
    groups: ['/posts', '/post-comments', '/post-reaction', '/post-attachments'],
  },
  {
    name: 'clazzi_thong_bao',
    description: 'Thông báo đẩy và kênh Zalo: thông báo trong ứng dụng, kết nối và gửi tin qua Zalo.',
    groups: ['/notifications', '/zalo'],
  },
  {
    name: 'clazzi_lop_online',
    description: 'Lớp học trực tuyến qua Zoom: tạo phòng, gắn vào buổi học, theo dõi tham dự.',
    groups: ['/zoom'],
  },
  {
    name: 'clazzi_ho_so_du_hoc',
    description: 'Hồ sơ du học: giấy tờ của học viên, loại giấy tờ, nhắc nộp hồ sơ còn thiếu.',
    groups: ['/student-documents', '/document-types', '/document-reminders'],
  },
  {
    name: 'clazzi_bao_luu_day_bu',
    description: 'Bảo lưu và dạy bù: đơn bảo lưu khoá học, buổi dạy bù hoặc bổ trợ.',
    groups: ['/reservations', '/makeup'],
  },
  {
    name: 'clazzi_tep',
    description: 'Tệp: tải lên, tải về và quản lý tệp dùng chung của hệ thống.',
    groups: ['/files'],
  },
  {
    name: 'clazzi_cai_dat',
    description: 'Cài đặt hệ thống: cài đặt chung, cấu hình ứng dụng di động, cấu hình kỹ thuật.',
    groups: ['/settings', '/app-configs', '/config'],
  },
  {
    name: 'clazzi_dia_gioi',
    description: 'Địa giới hành chính: tỉnh/thành, quận/huyện, phường/xã — dùng để điền địa chỉ.',
    groups: ['/provinces', '/districts', '/wards'],
  },
  {
    name: 'clazzi_bao_cao',
    description: 'Bảng điều khiển và báo cáo tổng hợp: số liệu toàn trung tâm, báo cáo theo lớp và theo học viên.',
    // `/reports` thuộc module REPRT (bán lẻ), `/dashboard` là lõi. Xếp chung một công cụ vì với
    // người dùng thì cả hai đều là "xem số liệu"; bộ lọc theo cờ module ở `tools.ts` tự bỏ
    // `/reports` ra khi khách chưa mua, và cổng module vẫn chặn ở lượt gọi thật.
    groups: ['/dashboard', '/reports'],
  },
  {
    name: 'clazzi_admin_tong',
    description: 'Admin tổng — quản trị NHIỀU bản triển khai: sổ đăng ký khách, đơn hàng, danh mục bán. Không phải quản trị một trung tâm.',
    groups: ['/site', '/orders', '/catalog'],
  },
  {
    name: 'clazzi_he_thong',
    description: 'Hạ tầng và vòng đời bản triển khai: kiểm tra sống, phiên bản, thiết lập lần đầu, đăng ký dùng thử, các tuyến xác thực, khoá API của chính mình.',
    groups: ['/health', '/version', '/setup', '/trial', '/auth', '/api-keys'],
  },
];
