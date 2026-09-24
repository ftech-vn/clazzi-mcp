import type { Mang } from '../../../loi/kieu';

export const MANG: Mang[] = [
  {
    ten: 'gecko_hoc_vien',
    moTa: 'Học viên và phụ huynh: hồ sơ học viên, phụ huynh, thông tin chuẩn bị đầu vào, buổi học của từng học viên.',
    nhom: ['/users', '/parents', '/user-preparations', '/user-sessions'],
  },
  {
    ten: 'gecko_nhan_su',
    moTa: 'Nhân sự trung tâm: hồ sơ giáo viên và nhân viên, phân công giáo viên vào lớp.',
    nhom: ['/staffs', '/class-teachers'],
  },
  {
    ten: 'gecko_phan_quyen',
    moTa: 'Phân quyền: chức danh, quyền, quyền theo module, danh sách chức năng và module, tài khoản đăng nhập.',
    nhom: ['/roles', '/permissions', '/role-modules', '/functions', '/modules', '/accounts'],
  },
  {
    ten: 'gecko_lop_hoc',
    moTa: 'Lớp học: lớp, học viên trong lớp, ca học, phòng học.',
    nhom: ['/classes', '/class-users', '/class-shifts', '/classrooms'],
  },
  {
    ten: 'gecko_buoi_hoc',
    moTa: 'Buổi học: buổi học của lớp, bài giảng gắn vào buổi, nhận xét buổi học và tiêu chí nhận xét.',
    nhom: ['/class-sessions', '/class-lessons', '/session-review', '/session-review-criteria'],
  },
  {
    ten: 'gecko_diem_danh',
    moTa: 'Điểm danh và nghỉ phép: bảng điểm danh, đơn xin nghỉ, bình luận trên đơn nghỉ.',
    nhom: ['/attendance-sheet', '/absence-requests', '/absence-request-comments'],
  },
  {
    ten: 'gecko_khoa_hoc',
    moTa: 'Chương trình đào tạo: khoá học và bài học trong khoá.',
    nhom: ['/courses', '/lessons'],
  },
  {
    ten: 'gecko_bai_tap',
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
    ten: 'gecko_hoc_phi',
    moTa: 'Học phí: hợp đồng học, biên lai thu tiền, hẹn thanh toán, gói buổi học.',
    nhom: ['/contracts', '/receipts', '/payment-appointment', '/session-packages'],
  },
  {
    ten: 'gecko_thoi_khoa_bieu',
    moTa: 'Thời khoá biểu: lịch dạy và lịch học, khung giờ học, ngày nghỉ lễ.',
    nhom: ['/schedule', '/session-times', '/holidays'],
  },
  {
    ten: 'gecko_co_so',
    moTa: 'Cơ sở / trung tâm: danh sách các chi nhánh của hệ thống.',
    nhom: ['/centers'],
  },
  {
    ten: 'gecko_crm',
    moTa: 'CRM bán hàng: khách hàng tiềm năng, cơ hội bán, việc cần làm, lịch hẹn tư vấn, nguồn khách, chính sách SLA, luật tự động.',
    nhom: ['/crm'],
  },
  {
    ten: 'gecko_ho_tro',
    moTa: 'Phiếu hỗ trợ nội bộ: phiếu yêu cầu và bình luận trao đổi trên phiếu.',
    nhom: ['/support', '/support-comments'],
  },
  {
    ten: 'gecko_bang_tin',
    moTa: 'Bảng tin: bài viết, bình luận, cảm xúc, tệp đính kèm bài viết.',
    nhom: ['/posts', '/post-comments', '/post-reaction', '/post-attachments'],
  },
  {
    ten: 'gecko_thong_bao',
    moTa: 'Thông báo đẩy và kênh Zalo: thông báo trong ứng dụng, kết nối và gửi tin qua Zalo.',
    nhom: ['/notifications', '/zalo'],
  },
  {
    ten: 'gecko_bao_luu_day_bu',
    moTa: 'Bảo lưu và dạy bù: đơn bảo lưu khoá học, buổi dạy bù hoặc bổ trợ.',
    nhom: ['/reservations', '/makeup'],
  },
  {
    ten: 'gecko_tep',
    moTa: 'Tệp: tải lên, tải về và quản lý tệp dùng chung của hệ thống.',
    nhom: ['/files'],
  },
  {
    ten: 'gecko_cai_dat',
    moTa: 'Cài đặt hệ thống: cài đặt chung, cấu hình ứng dụng di động, cấu hình kỹ thuật.',
    nhom: ['/settings', '/app-configs', '/config'],
  },
  {
    ten: 'gecko_dia_gioi',
    moTa: 'Địa giới hành chính: tỉnh/thành, quận/huyện, phường/xã — dùng để điền địa chỉ.',
    nhom: ['/provinces', '/districts', '/wards'],
  },
  {
    ten: 'gecko_he_thong',
    moTa: 'Hạ tầng và xác thực: kiểm tra sống, phiên bản, các tuyến đăng nhập, khoá API của chính mình.',
    nhom: ['/health', '/version', '/auth', '/api-keys'],
  },
];
