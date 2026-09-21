# clazzi-mcp

Cho trợ lý **liệt kê, xem, tạo, sửa, xoá** dữ liệu CLAZZI trên bất kỳ bản triển khai nào.

- **27 công cụ**: 24 mảng nghiệp vụ + `clazzi_trang_thai`, `clazzi_mo_ta`, `clazzi_goi`.
- **519 tuyến / 71 nhóm**, danh mục quét thẳng từ mã nguồn.
- Quyền do **tài khoản** quyết định, không phải do MCP. Khoá chỉ mang quyền sẵn có của tài khoản
  đi, không nới thêm gì.

---

## Hai đường cắm

| | **HTTP** — dành cho KHÁCH | **stdio** — dành cho NGƯỜI TRONG ĐỘI |
|---|---|---|
| Cài gì | không cài gì cả | clone kho này + kho `clazzi-api` |
| Cần gì | một URL + một khoá | Node 20, `npm install` |
| Máy chủ nằm ở | chính `clazzi-api` của khách (`/mcp`) | tiến trình trên máy bạn |
| Cờ module | công cụ của module đang tắt **tự biến mất** khỏi bảng | vẫn hiện, gọi vào thì máy chủ chặn |
| Trỏ được bản khác hệ (gecko) | không | có, qua `CLAZZI_DANH_MUC` |

Cả hai đường chạy **cùng một lõi** — `clazzi-api/src/mcp/loi/`. Không có bản định nghĩa công cụ
thứ hai nào tồn tại, nên hai đường không thể trôi khỏi nhau.

---

## Đường HTTP (khách dùng)

Mỗi bản triển khai phục vụ MCP ngay tại `https://api-<mã>.clazzi.vn/mcp`. Không phải triển khai
thêm gì: có máy chủ API là có MCP.

**Claude Code**

```bash
claude mcp add --transport http clazzi https://api-demo.clazzi.vn/mcp \
  --header "Authorization: Bearer clz_..."
```

**Codex CLI**

```bash
export CLAZZI_API_KEY=clz_...
codex mcp add clazzi --url https://api-demo.clazzi.vn/mcp \
  --bearer-token-env-var CLAZZI_API_KEY
```

Đổi `api-demo.clazzi.vn` thành tên miền của bản mình. Hai lệnh trên cũng được **chính máy chủ trả
về sẵn**, đã ghép đúng tên miền — xem `GET /api-keys/cach-cam` và phản hồi của `POST /api-keys`.
Giao diện Cài đặt chỉ việc hiện ra cho khách sao chép; đừng để phía giao diện tự ghép chuỗi, mỗi
khách một tên miền và ghép sai là cắm vào **nhầm bản**.

Kiểm tra: `claude mcp list` / `codex mcp list`, rồi gọi `clazzi_trang_thai` — nó nói ngay đang
trỏ bản nào và khoá thuộc tài khoản nào.

### Lấy khoá

Cài đặt → Khoá API trong ứng dụng. Hoặc `POST /api-keys` từ một **phiên đăng nhập thật**
(mật khẩu / OTP / Google).

- Chuỗi khoá đầy đủ hiện **đúng một lần**, ngay lúc cấp. Máy chủ chỉ lưu bản băm — mất thì cấp
  khoá mới, không có tuyến nào xem lại được.
- **Ai cũng tự cấp khoá cho mình được**, kể cả giáo viên: tuyến khai `@Authorized()` không kèm vai
  trò, nghĩa là "vé hợp lệ nào cũng được".
- Khoá API **không** cấp được khoá mới, kể cả đi vòng qua MCP. Thiếu luật này thì một khoá rò ra
  là kẻ lấy được nó tự cấp thêm khoá vĩnh viễn, thu hồi khoá gốc cũng vô ích.
- Thu hồi có hiệu lực **tức thì**.

### Quyền: khoá mang đúng quyền người tạo ra nó

Mỗi công cụ được thực thi bằng một lượt HTTP **thật** về `127.0.0.1` của chính máy chủ đó, mang
đúng chuỗi khoá của người gọi. Lượt ấy đi lại từ đầu qua `apiKeyAuth` → `demoReadOnly` →
`moduleGate` → `authorizationChecker`/`currentUserChecker` → `assertStaffAccessTo*` → lọc phạm vi
trung tâm.

MCP **không phải** một cửa thứ hai — nó là đúng cái cửa khách vẫn đi. Hệ quả:

- Giáo viên cấp khoá ⇒ trợ lý đọc được lớp họ dạy, **không** đọc được lớp người khác.
- Giáo viên bảo trợ lý sửa lương, cấp quyền, khoá tài khoản ⇒ **403**, y hệt khi họ tự gọi API.
- Giáo viên trung tâm A **không** thấy dữ liệu trung tâm B.
- Khách chưa mua CRM ⇒ công cụ CRM **không hiện ra**, và gọi thẳng tên nó thì hỏng đúng như
  `/crm/customers` trả 404.

Có bộ test chứng minh từng gạch đầu dòng trên bằng cách gọi **cả hai đường** rồi so kết quả:
`clazzi-api/tests/unit/mcp-http.spec.ts`.

---

## Đường stdio (người trong đội)

Vẫn ở lại vì hai việc nó làm tốt hơn: gỡ lỗi (đổi mã, chạy lại ngay, không phải dựng ảnh), và
trỏ vào một bản **khác hệ** như gecko/OTM.

```bash
cd ~/code/clazzi/clazzi-mcp
npm install
```

Không có bước `npm run build` nữa: kho này chạy thẳng từ mã nguồn bằng `tsx`, vì lõi nằm ở kho
anh em `../clazzi-api` và một bản dựng riêng chỉ để chép nó sang đây là mời hai bản trôi khỏi nhau.

```bash
claude mcp add clazzi-stdio \
  -e CLAZZI_API_URL=https://api-demo.clazzi.vn \
  -e CLAZZI_API_KEY=clz_... \
  -- /Users/anhlvv/code/clazzi/clazzi-mcp/node_modules/.bin/tsx \
     /Users/anhlvv/code/clazzi/clazzi-mcp/src/server.ts
```

```bash
codex mcp add clazzi-stdio \
  --env CLAZZI_API_URL=https://api-demo.clazzi.vn \
  --env CLAZZI_API_KEY=clz_... \
  -- /Users/anhlvv/code/clazzi/clazzi-mcp/node_modules/.bin/tsx \
     /Users/anhlvv/code/clazzi/clazzi-mcp/src/server.ts
```

Gõ đường dẫn tuyệt đối tới `node_modules/.bin/tsx` chứ không phải `npx tsx`: client MCP khởi chạy
tiến trình con từ thư mục làm việc của nó, không phải từ thư mục kho này.

**Kho này cần `../clazzi-api` nằm cạnh.** Vốn đã là điều kiện từ trước — danh mục xưa nay vẫn
sinh ra bằng cách quét mã nguồn kho đó. Có một test canh việc này (`tests/that.spec.ts`).

### Biến môi trường

| Biến | Bắt buộc | Mặc định | Việc |
|---|---|---|---|
| `CLAZZI_API_URL` | không | `https://api-demo.clazzi.vn` | Bản triển khai cần trỏ tới |
| `CLAZZI_API_KEY` | có | — | Khoá API, khuôn `clz_<12 ký tự>_<32 ký tự>` |
| `CLAZZI_DANH_MUC` | không | lõi của `clazzi-api` | **Đường dẫn** tới danh mục của một bản khác hệ |

---

## Đổi bản trỏ tới — đọc kỹ chỗ này

Nhiều bản thật đang chạy, cùng mã nguồn, trả lời **giống hệt nhau**:

| Địa chỉ | Là gì |
|---|---|
| `https://api.clazzi.vn` | **HỆ THẬT**, khách trả tiền |
| `https://api-demo.clazzi.vn` | Dùng thử — chỗ duy nhất nên thử nghiệm |
| `https://api.tiengtrungbackinh.com` | **HỆ THẬT**, khách Tiếng Trung Bắc Kinh |
| `https://api-sunshine.clazzi.vn` | **HỆ THẬT**, khách Sunshine |

Cách an toàn nhất là khai **nhiều mục** với tên khác nhau (`clazzi-demo`, `clazzi-that`) thay vì
sửa qua sửa lại một mục.

Hai hàng rào đã dựng sẵn:

- **Mọi kết quả công cụ đều mở đầu bằng dòng ghi rõ bản đang trỏ**, và bản hệ thật bị gắn thêm
  `⚠ DỮ LIỆU THẬT`. Không có dòng đó thì không cách nào biết vừa sửa vào đâu.
- Bản lạ được coi như **hệ thật** cho chắc.

Khoá cấp **theo từng bản**. Khoá của demo dùng ở hệ thật sẽ bị từ chối, và thông điệp nói rõ là
*khoá không thuộc bản đang trỏ* chứ không phải khoá hỏng.

---

## Cách dùng

24 công cụ nghiệp vụ nhận cùng một hình dạng tham số:

```
doiTuong: '/courses'                    // enum thật trong lược đồ — đọc là thấy mảng có gì
viec:     'liet_ke' | 'xem' | 'tao' | 'sua' | 'xoa'
id?, duLieu?, tim?, sapXep?, trang?, moiTrang?
```

Bảng công cụ **chính là** bảng chức năng: mô tả enum của `doiTuong` ghi sẵn mỗi đối tượng làm
được những việc gì, nên không phải gọi thêm lượt nào để dò.

```bash
npx tsx scripts/liet-ke-cong-cu.ts   # dựng máy chủ stdio thật, in đúng bảng công cụ nó khai
```

## Những gì bộ này KHÔNG làm được

**Không phải nhóm nào cũng có đủ năm việc CRUD. Chỉ 19/71.** API CLAZZI không đồng nhất, và bộ
này cố ý **không** che chuyện đó đi — hứa một tuyến không tồn tại thì mô hình gọi vào, nhận 404,
rồi tưởng hệ thống hỏng và đi thử lung tung.

- **52/71 nhóm thiếu ít nhất một việc.** Xin một việc không có ⇒ **bị từ chối**, kèm danh sách
  việc nhóm đó thật sự làm được. Bộ này **không bao giờ đoán sang tuyến khác**.
  Ví dụ: `/class-users` **chỉ có `liet_ke`**.
- **Nhiều nhóm không có việc CRUD nào**, phải dùng hết bằng `clazzi_goi` — đáng chú ý nhất:
  **`/crm` có 56 tuyến và không tuyến nào theo khuôn CRUD**.
- **Tuyến lẻ** (`/users/export`, `/crm/customers/import`, `/auth/staff/login`, …) không nằm trong
  `viec`. Dùng `clazzi_mo_ta` để xem một đối tượng có tuyến lẻ nào, rồi gọi bằng `clazzi_goi`.

Còn lại:

- **`clazzi_goi` không phải `curl`.** Nó chỉ gọi được tuyến **có trong danh mục**; đường dẫn lạ
  bị từ chối kèm gợi ý. Không có hàng rào này thì danh mục thành vô nghĩa.
- **Không tải tệp lên được.** `POST /files/upload` cần `multipart/form-data`; lớp HTTP ở đây chỉ
  gửi JSON.
- **Không nới quyền.** Muốn làm được việc bị chặn thì phải sửa chức danh của tài khoản.
- **Không cấp khoá mới.**
- **Không tự quét lại danh mục.**

---

## Lõi nằm ở đâu, và vì sao

Toàn bộ 27 công cụ, danh mục, bản đồ mảng→nhóm, bộ gọi HTTP và bộ quét mã nguồn nằm ở
**`clazzi-api/src/mcp/`**. Kho này chỉ còn đúng `src/server.ts` — bộ nối stdio, ~60 dòng.

| Tệp (ở `clazzi-api/src/mcp/`) | Việc |
|---|---|
| `loi/cong-cu.ts` | 27 công cụ. **Không** nhập gì từ SDK lẫn từ phần còn lại của `clazzi-api` |
| `loi/mang.ts` | **Tệp duy nhất** giữ bản đồ mảng → nhóm tuyến |
| `loi/danh-muc.ts` + `loi/danh-muc.json` | Ảnh chụp mã nguồn, hàng rào từ chối việc không tồn tại |
| `loi/http.ts` | Gọi HTTP và dịch gói lỗi sang tiếng người |
| `loi/ket-qua.ts` | Đóng gói kết quả: gắn tên bản, ẩn khoá |
| `loi/phien.ts` | Một phiên = bản nào + khoá nào. Chỗ duy nhất biết khoá từ đâu ra |
| `quet/quet-nguon.ts` | Bộ quét mã nguồn ra danh mục |
| `tuyen.ts` + `may-chu.ts` | Tuyến `/mcp` Streamable HTTP |
| `cach-cam.ts` | Ghép hai lệnh cắm với tên miền của chính bản đó |

**Vì sao lõi ở bên đó chứ không ở đây:** danh mục phải sống cùng kho với các controller nó mô tả.
Hôm chuyển về (21/09/2026) chuyện này lộ ra ngay: module báo cáo (`/reports`, 7 tuyến) đã lên
`main` của `clazzi-api` từ sáng, nhưng danh mục bên kho này không biết — trợ lý không có đường nào
gọi tới, mã chết mà không ai nhận ra. Giờ `clazzi-api/tests/unit/mcp-danh-muc.spec.ts` quét lại
mã nguồn mỗi lần chạy test và đỏ ngay nếu lệch.

**Cái giá:** kho này cần `../clazzi-api` nằm cạnh mới chạy được. Xuất bản lõi thành gói npm sẽ gỡ
được ràng buộc đó, nhưng `clazzi-mcp` **chưa có kho từ xa nào trên GitHub** nên hiện không làm
được. Chép đôi mã (rồi canh bằng test băm) thì rẻ hơn nhưng vẫn là hai bản — và hai bản sẽ lệch,
chỉ là lệch ồn ào thay vì lệch im lặng.

## Quét lại danh mục khi API đổi

Danh mục của `clazzi-api` sinh **ở chính kho đó**:

```bash
cd ~/code/clazzi/clazzi-api
npx ts-node -r tsconfig-paths/register scripts/quet-danh-muc.ts
npx jest tests/unit/mcp-danh-muc.spec.ts
```

Có nhóm mới thì **phải xếp nó vào một mảng** ở `src/mcp/loi/mang.ts` và đặt tên tiếng Việt ở
`src/mcp/quet/ten-nhom.ts`. Quên là test đỏ — cố ý như vậy.

## Trỏ vào bản khác hệ (gecko / OTM)

Các bản là **nhánh đã trôi xa nhau**, không phải cùng một bề mặt API. Đo 16/09/2026: clazzi
511/70, gecko 434/59 — gecko thiếu hẳn 11 nhóm (`/zoom`, `/student-documents`, `/site`,
`/api-keys`…). Vì công cụ **sinh từ danh mục**, đổi danh mục là bảng công cụ tự co lại.

```bash
npx tsx scripts/quet-ban-khac.ts ~/code/otm-system/server-api danh-muc.gecko.json
```

Rồi trỏ tới nó bằng **đường dẫn**:

```jsonc
"env": {
  "CLAZZI_API_URL":  "https://otm-api.f-tech.vn",
  "CLAZZI_API_KEY":  "clz_...",
  "CLAZZI_DANH_MUC": "/Users/anhlvv/code/clazzi/clazzi-mcp/danh-muc.gecko.json"
}
```

⚠ Danh mục và địa chỉ **phải khớp nhau**. Trỏ địa chỉ gecko mà dùng danh mục clazzi là hứa hàng
chục tuyến máy chủ đó không có, và mô hình sẽ đọc 404 thành "hệ thống hỏng".

Đường HTTP không có vấn đề này: mỗi máy chủ tự phục vụ danh mục của chính nó.

## Phát triển

```bash
# kho này
npx tsc --noEmit && npx jest && npx eslint .

# lõi (chạy cả bộ test luật của 27 công cụ)
cd ../clazzi-api && npx tsc --noEmit && npx jest && npx eslint --ignore-path .gitignore --ext .ts src/
```

Hai luật không được phá:

1. **Không `console.log` ở bất cứ đâu.** stdout là kênh JSON-RPC của MCP qua stdio; một dòng lạc
   vào đó là client không phân tích được gói tin và phiên chết ngay. Dùng `console.error`. ESLint
   chặn, và có cả test quét cây nguồn phòng trường hợp ai đó thêm `eslint-disable`.
2. **Thử nghiệm chỉ trỏ `api-demo.clazzi.vn`.** `tests/that.spec.ts` chốt cứng địa chỉ demo trong
   tệp, cố tình **không** đọc `CLAZZI_API_URL` — đọc env thì chỉ cần một lần ai đó để biến trỏ hệ
   thật rồi chạy `npx jest` là bộ test nã thẳng vào dữ liệu lớp học của khách.
