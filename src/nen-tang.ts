import { webcrypto } from 'crypto';

/**
 * Trả lại global `crypto` cho Node 18 — BẮT BUỘC, không phải phòng hờ.
 *
 * `StreamableHTTPServerTransport` của SDK gọi `crypto.randomUUID()` bằng tên trần, đúng chuẩn
 * web. Node 19 trở lên có sẵn; **Node 18 thì KHÔNG**, và ảnh sản xuất của kho này là
 * `node:18.19-alpine`.
 *
 * Bẫy làm chuyện này khó thấy, đã mất một vòng gỡ để nhận ra — đo thật trên pod 21/09/2026:
 *
 * ```
 * node -e 'console.log(typeof globalThis.crypto)'   →  object      ← NÓI DỐI
 * node mot-tep.js  (in cùng một dòng)               →  undefined   ← sự thật
 * ```
 *
 * Node 18 cài `crypto` lên `globalThis` bằng một getter lười; đường `-e`/`-p` làm nó hiện ra,
 * còn chạy một tệp thật thì không. Nghĩa là mọi phép dò bằng `node -e` đều báo "có" trong khi
 * máy chủ thật chạy bằng `node dist/server.js` thì "không có". Triệu chứng ở đầu người dùng là
 * `{"code":-32700,"message":"Parse error","data":"ReferenceError: crypto is not defined"}` —
 * một lỗi phân tích cú pháp, chẳng liên quan gì tới nguyên nhân.
 *
 * Chỉ đặt khi THIẾU: Node 19+ đã có bản thật, đừng thay bằng bản khác.
 *
 * Ghi chú cho người sửa sau: `tests/jest-environment.js` CỐ Ý không bơm `crypto` vào hộp cát,
 * đúng như Node 18 không có. Đừng thêm nó vào đó — thêm là bộ test lại nói dối y như `node -e`.
 */
/**
 * Vá `globalThis.crypto` nếu thiếu. Gọi được tường minh (host nên gọi TRƯỚC khi dựng transport),
 * và cũng tự chạy khi nạp module để những nơi chỉ `import './nen-tang'` vẫn có tác dụng.
 */
export function vaCrypto(): void {
  const g = globalThis as { crypto?: unknown };
  if (g.crypto === undefined) g.crypto = webcrypto;
}

vaCrypto();
