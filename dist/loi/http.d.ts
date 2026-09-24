import type { Ban } from './ban';
import { type Phien } from './phien';
/**
 * Lớp gọi HTTP tới một bản CLAZZI, kèm việc dịch lỗi sang tiếng người.
 *
 * Phần dịch lỗi quan trọng hơn phần gọi: `clazzi-api` trả về vài hình dạng lỗi khác nhau và
 * không hình dạng nào tự giải thích. Để nguyên thì mô hình đọc "500 invalid token" rồi kết luận
 * hệ thống hỏng và đi thử lung tung — trong khi thật ra chỉ là khoá sai.
 *
 * MỘT ĐƯỜNG DUY NHẤT, KỂ CẢ KHI CHẠY TRONG CHÍNH MÁY CHỦ. Khi lõi này phục vụ tuyến `/mcp` của
 * `clazzi-api`, nó vẫn gọi HTTP thật — về `127.0.0.1` của chính tiến trình đó. Nghe thừa, nhưng
 * đó chính là điểm mấu chốt: lượt gọi đi lại từ đầu qua `apiKeyAuth` → `demoReadOnly` →
 * `moduleGate` → `authorizationChecker`/`currentUserChecker` → phép kiểm phạm vi lớp và trung
 * tâm. Không có một dòng nào đi tắt, nên không có cách nào để MCP nới thêm quyền hay lọt qua
 * công tắc module — nó KHÔNG phải một đường song song, nó là đúng lượt gọi mà khách tự gọi.
 */
export interface KetQuaGoi {
    status: number;
    duLieu: unknown;
}
/**
 * Dịch một phản hồi lỗi thành thông điệp hành động được.
 *
 * Ba ca đo được thật trên `api-demo.clazzi.vn`, không phải suy đoán:
 *  - không gửi thẻ  → **403** code 999 "Access is denied for request on ..."
 *  - thẻ/khoá hỏng  → **500** code 999 "invalid token"  (đúng vậy, 500 chứ không phải 401)
 *  - đường dẫn lạ   → **404** và thân là HTML của Express, không phải JSON
 * Nên KHÔNG được chỉ nhìn mã HTTP: phải nhìn cả `message`.
 */
export declare function dichLoi(ban: Ban, status: number, than: unknown, method: string, duongDan: string): string;
export interface ThamSoGoi {
    phien: Phien;
    method: string;
    duongDan: string;
    thamSo?: Record<string, unknown>;
    than?: unknown;
}
export declare function goiApi({ phien, method, duongDan, thamSo, than }: ThamSoGoi): Promise<KetQuaGoi>;
//# sourceMappingURL=http.d.ts.map