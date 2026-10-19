import type { Domain } from '../../../core/types';

export const DOMAINS: Domain[] = [
  {
    name: 'gecko_hoc_vien',
    description: 'Học viên và phụ huynh: hồ sơ học viên, phụ huynh, thông tin chuẩn bị đầu vào, buổi học của từng học viên.',
    groups: ['/users', '/parents', '/user-preparations', '/user-sessions'],
  },
  {
    name: 'gecko_nhan_su',
    description: 'Nhân sự trung tâm: hồ sơ giáo viên và nhân viên, phân công giáo viên vào lớp.',
    groups: ['/staffs', '/class-teachers'],
  },
  {
    name: 'gecko_phan_quyen',
    description: 'Phân quyền: chức danh, quyền, quyền theo module, danh sách chức năng và module, tài khoản đăng nhập.',
    groups: ['/roles', '/permissions', '/role-modules', '/functions', '/modules', '/accounts'],
  },
  {
    name: 'gecko_lop_hoc',
    description: 'Lớp học: lớp, học viên trong lớp, ca học, phòng học.',
    groups: ['/classes', '/class-users', '/class-shifts', '/classrooms'],
  },
  {
    name: 'gecko_buoi_hoc',
    description: 'Buổi học: buổi học của lớp, bài giảng gắn vào buổi, nhận xét buổi học và tiêu chí nhận xét.',
    groups: ['/class-sessions', '/class-lessons', '/session-review', '/session-review-criteria'],
  },
  {
    name: 'gecko_diem_danh',
    description: 'Điểm danh và nghỉ phép: bảng điểm danh, đơn xin nghỉ, bình luận trên đơn nghỉ.',
    groups: ['/attendance-sheet', '/absence-requests', '/absence-request-comments'],
  },
  {
    name: 'gecko_khoa_hoc',
    description: 'Chương trình đào tạo: khoá học và bài học trong khoá.',
    groups: ['/courses', '/lessons'],
  },
  {
    name: 'gecko_bai_tap',
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
    name: 'gecko_hoc_phi',
    description: 'Học phí: hợp đồng học, biên lai thu tiền, hẹn thanh toán, gói buổi học.',
    groups: ['/contracts', '/receipts', '/payment-appointment', '/session-packages'],
  },
  {
    name: 'gecko_thoi_khoa_bieu',
    description: 'Thời khoá biểu: lịch dạy và lịch học, khung giờ học, ngày nghỉ lễ.',
    groups: ['/schedule', '/session-times', '/holidays'],
  },
  {
    name: 'gecko_co_so',
    description: 'Cơ sở / trung tâm: danh sách các chi nhánh của hệ thống.',
    groups: ['/centers'],
  },
  {
    name: 'gecko_crm',
    description: 'CRM bán hàng: khách hàng tiềm năng, cơ hội bán, việc cần làm, lịch hẹn tư vấn, nguồn khách, chính sách SLA, luật tự động.',
    groups: ['/crm'],
  },
  {
    name: 'gecko_ho_tro',
    description: 'Phiếu hỗ trợ nội bộ: phiếu yêu cầu và bình luận trao đổi trên phiếu.',
    groups: ['/support', '/support-comments'],
  },
  {
    name: 'gecko_bang_tin',
    description: 'Bảng tin: bài viết, bình luận, cảm xúc, tệp đính kèm bài viết.',
    groups: ['/posts', '/post-comments', '/post-reaction', '/post-attachments'],
  },
  {
    name: 'gecko_thong_bao',
    description: 'Thông báo đẩy và kênh Zalo: thông báo trong ứng dụng, kết nối và gửi tin qua Zalo.',
    groups: ['/notifications', '/zalo'],
  },
  {
    name: 'gecko_bao_luu_day_bu',
    description: 'Bảo lưu và dạy bù: đơn bảo lưu khoá học, buổi dạy bù hoặc bổ trợ.',
    groups: ['/reservations', '/makeup'],
  },
  {
    name: 'gecko_tep',
    description: 'Tệp: tải lên, tải về và quản lý tệp dùng chung của hệ thống.',
    groups: ['/files'],
  },
  {
    name: 'gecko_cai_dat',
    description: 'Cài đặt hệ thống: cài đặt chung, cấu hình ứng dụng di động, cấu hình kỹ thuật.',
    groups: ['/settings', '/app-configs', '/config'],
  },
  {
    name: 'gecko_dia_gioi',
    description: 'Địa giới hành chính: tỉnh/thành, quận/huyện, phường/xã — dùng để điền địa chỉ.',
    groups: ['/provinces', '/districts', '/wards'],
  },
  {
    name: 'gecko_he_thong',
    description: 'Hạ tầng và xác thực: kiểm tra sống, phiên bản, các tuyến đăng nhập, khoá API của chính mình.',
    groups: ['/health', '/version', '/auth', '/api-keys'],
  },
];
