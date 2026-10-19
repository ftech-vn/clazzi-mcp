import { getConfig } from '../config';
import type { Deployment } from './deployment';
import { identifyDeployment } from './deployment';
import { ConfigError } from './errors';

/**
 * Một PHIÊN gọi công cụ: đang nói chuyện với bản nào, và mang khoá nào.
 *
 * Trước đây khoá đọc thẳng từ `process.env.CLAZZI_API_KEY` ở tầng sâu nhất. Điều đó đúng với
 * máy chủ stdio — mỗi tiến trình phục vụ đúng một người — nhưng SAI hoàn toàn với đường HTTP:
 * một tiến trình `clazzi-api` phục vụ mọi khách cùng lúc, mỗi lượt gọi mang khoá riêng. Đọc từ
 * biến môi trường ở đó thì hoặc là không có khoá nào, hoặc tệ hơn nhiều: khoá của người này
 * dùng cho lượt gọi của người kia.
 *
 * Nên khoá đi theo THAM SỐ, xuyên suốt từ điểm vào tới lúc gọi HTTP. Không có trạng thái toàn
 * cục nào giữ khoá, nên không có đường nào để hai phiên lẫn vào nhau.
 */
export interface Session {
  /** Bản triển khai đang nói chuyện — dùng để HIỂN THỊ, đi kèm mọi kết quả. */
  deployment: Deployment;
  /** Chuỗi khoá thô. `null` nghĩa là chưa dán khoá — chỉ gọi được tuyến công khai. */
  apiKey: string | null;
  /**
   * Địa chỉ gốc THẬT SỰ dùng để gọi. Bỏ trống thì dùng `ban.diaChi`.
   *
   * Tách khỏi `ban.diaChi` vì đường HTTP trong máy chủ gọi vòng về `http://127.0.0.1:4000` —
   * địa chỉ đó đúng để gọi nhưng vô nghĩa với người đọc, và nếu đem nó đi hiển thị thì mọi kết
   * quả đều mang tên "KHÔNG RÕ — 127.0.0.1", đúng lúc người dùng cần biết mình đang sửa vào bản
   * nào nhất.
   */
  callBaseUrl?: string;
  /**
   * Tiêu đề HTTP chuyển tiếp thêm cho mỗi lượt gọi, ví dụ `centerId`.
   *
   * CHỈ dùng cho tiêu đề chọn phạm vi, TUYỆT ĐỐI không nhét `Authorization` vào đây: khoá đi
   * theo `khoa`, và `callApi` đặt `Authorization` sau cùng để không ai ghi đè được nó.
   */
  extraHeaders?: Record<string, string>;
}

/** Địa chỉ dùng để gọi thật. */
export function callBaseUrlOf(session: Session): string {
  return (session.callBaseUrl ?? session.deployment.url).replace(/\/+$/, '');
}

/** Phiên của máy chủ stdio: một tiến trình, một người, đọc từ biến môi trường của thương hiệu. */
export function sessionFromEnv(): Session {
  const c = getConfig();
  return { deployment: identifyDeployment(process.env[c.urlEnvVar]), apiKey: process.env[c.keyEnvVar]?.trim() || null };
}

/**
 * Phần nhận diện khoá: 12 ký tự prefix, cố ý công khai (hợp đồng §3.1) — đủ để người dùng đối
 * chiếu "khoá tôi dán vào demo có đúng là khoá của demo không", không đủ để dùng.
 *
 * Trả về KHÔNG kèm chữ `clz_`. Bộ ẩn khoá ở `result.ts` quét mọi chuỗi `clz_…` và xoá sạch —
 * đúng như thế là tốt, đừng nới nó ra để lọt cái prefix này; nới một lần là mở đường cho khoá
 * thật lọt theo. Bỏ tiền tố đi thì hai luật cùng đúng, không phải đánh đổi.
 */
export function keyPrefixOf(session: Session): string | null {
  if (!session.apiKey) return null;
  const tt = getConfig().keyPrefix;
  const re = new RegExp(`^${tt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([A-Za-z0-9]{1,12})_`);
  const m = session.apiKey.match(re);
  return m ? m[1] : `(khoá không theo khuôn ${tt}<prefix>_<bí mật>)`;
}

/**
 * Lấy khoá để gắn vào lượt gọi, hoặc ném lỗi có hướng dẫn dán khoá vào đâu.
 *
 * Đây là CHỖ DUY NHẤT trong lõi biết khoá đến từ đâu. Tám công cụ chỉ biết "phiên có khoá",
 * không biết nguồn — giữ ranh giới đó nên thêm được đường HTTP mà không sờ vào công cụ nào.
 */
export function requireApiKey(session: Session): string {
  if (!session.apiKey) throw new ConfigError(missingKeyMessage(session));
  return session.apiKey;
}

function missingKeyMessage(session: Session): string {
  const { deployment } = session;
  const c = getConfig();
  const example = `${c.keyPrefix}...`;
  return [
    `Chưa có khoá API nên không gọi được ${deployment.url} (${deployment.name}).`,
    '',
    'Cách nhanh nhất — cắm qua HTTP, không cài gì cả:',
    '',
    `  claude mcp add --transport http ${c.prefix} ${deployment.url}/mcp --header "Authorization: Bearer ${example}"`,
    `  codex  mcp add ${c.prefix} --url ${deployment.url}/mcp --bearer-token-env-var ${c.keyEnvVar}`,
    '',
    'Nếu đang chạy bản stdio (người trong đội), khoá dán vào khối "env" của cấu hình MCP:',
    `  "env": {"${c.urlEnvVar}": "${deployment.url}", "${c.keyEnvVar}": "${example}"}`,
    '',
    'Khoá cấp theo TỪNG BẢN: khoá của demo không dùng được ở hệ thật và ngược lại.',
    'Lấy khoá ở màn Cài đặt → Khoá API, hoặc POST /api-keys từ một phiên đăng nhập thật;',
    'khoá chỉ hiện đầy đủ đúng một lần.',
  ].join('\n');
}
