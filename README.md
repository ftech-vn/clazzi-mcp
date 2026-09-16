# clazzi-mcp

Máy chủ MCP cho CLAZZI. Cho trợ lý **liệt kê, xem, tạo, sửa, xoá** dữ liệu CLAZZI trên bất kỳ bản
triển khai nào, qua stdio.

- **27 công cụ**: 24 mảng nghiệp vụ + `clazzi_trang_thai`, `clazzi_mo_ta`, `clazzi_goi`.
- **511 tuyến / 70 nhóm**, quét thẳng từ mã nguồn `clazzi-api` ra `danh-muc.json`.
- Quyền do **tài khoản** quyết định, không phải do MCP. Khoá chỉ mang quyền sẵn có của tài khoản
  đi, không nới thêm gì.

## Cài

```bash
cd ~/code/clazzi/clazzi-mcp
npm install
npm run build          # sinh dist/server.js
```

### Cắm vào Claude Code

```bash
claude mcp add clazzi \
  -e CLAZZI_API_URL=https://api-demo.clazzi.vn \
  -e CLAZZI_API_KEY=clz_... \
  -- node /Users/anhlvv/code/clazzi/clazzi-mcp/dist/server.js
```

Hoặc viết thẳng vào cấu hình:

```jsonc
{ "mcpServers": { "clazzi": {
  "command": "node",
  "args": ["/Users/anhlvv/code/clazzi/clazzi-mcp/dist/server.js"],
  "env": { "CLAZZI_API_URL": "https://api-demo.clazzi.vn", "CLAZZI_API_KEY": "clz_..." }
}}}
```

Kiểm tra: `claude mcp list`, rồi gọi `clazzi_trang_thai` — nó nói ngay đang trỏ bản nào.

## Biến môi trường

| Biến | Bắt buộc | Mặc định | Việc |
|---|---|---|---|
| `CLAZZI_API_URL` | không | `https://api-demo.clazzi.vn` | Bản triển khai cần trỏ tới |
| `CLAZZI_API_KEY` | có | — | Khoá API, khuôn `clz_<12 ký tự>_<32 ký tự>` |
| `CLAZZI_CENTER_ID` | không | — | Ép lọc theo một cơ sở. Bỏ trống thì máy chủ tự suy phạm vi từ tài khoản — đó mới là mặc định an toàn |

### Xác thực — khoá API, không có bước đăng nhập

Không có công cụ `clazzi_dang_nhap`, không mở trình duyệt, không nhận mật khẩu ở bất kỳ đâu. Khoá
dán vào khối `env` như mọi máy chủ MCP khác (GitHub, Slack…).

Lấy khoá: `POST /api-keys` từ một **phiên đăng nhập thật** (mật khẩu / OTP / Google). Chuỗi khoá
đầy đủ chỉ hiện **đúng một lần**, không có tuyến nào xem lại được. Khoá API **không** cấp được
khoá mới — nếu không thì một khoá rò ra là kẻ lấy được nó tự cấp thêm khoá vĩnh viễn, thu hồi
khoá gốc cũng vô ích.

Khoá **không bao giờ** xuất hiện trong kết quả công cụ. `clazzi_trang_thai` chỉ hiện 12 ký tự
prefix — đủ để đối chiếu xem có dán nhầm khoá của bản khác không, không đủ để dùng.

## Đổi bản trỏ tới — đọc kỹ chỗ này

Có **ba bản thật** đang chạy, cùng mã nguồn, trả lời **giống hệt nhau**:

| Địa chỉ | Là gì |
|---|---|
| `https://api.clazzi.vn` | **HỆ THẬT**, khách trả tiền |
| `https://api-demo.clazzi.vn` | Dùng thử — chỗ duy nhất nên thử nghiệm |
| `https://api.tiengtrungbackinh.com` | **HỆ THẬT**, khách Tiếng Trung Bắc Kinh |

Đổi bản = đổi `CLAZZI_API_URL` trong `env` rồi khởi động lại máy chủ MCP. Cách an toàn nhất là
khai **nhiều mục** với tên khác nhau (`clazzi-demo`, `clazzi-that`) thay vì sửa qua sửa lại một mục.

Hai hàng rào đã dựng sẵn:

- **Mọi kết quả công cụ đều mở đầu bằng dòng ghi rõ bản đang trỏ**, và bản hệ thật bị gắn thêm
  `⚠ DỮ LIỆU THẬT`. Không có dòng đó thì không cách nào biết vừa sửa vào đâu.
- Bản lạ, không nằm trong ba bản trên, được coi như **hệ thật** cho chắc.

Khoá cấp **theo từng bản**. Khoá của demo dùng ở hệ thật sẽ bị từ chối, và thông điệp nói rõ là
*khoá không thuộc bản đang trỏ* chứ không phải khoá hỏng.

## Quét lại danh mục khi API đổi

`danh-muc.json` là ảnh chụp mã nguồn `clazzi-api`. API mọc thêm tuyến thì phải chụp lại:

```bash
npx tsx scripts/quet-api.ts                        # tìm ../clazzi-api
npx tsx scripts/quet-api.ts /duong/dan/clazzi-api  # hoặc chỉ đường
npx jest                                           # bắt buộc chạy lại
```

Script chỉ **ĐỌC** `clazzi-api`, không bao giờ ghi vào đó.

Có nhóm mới thì **phải xếp nó vào một mảng** ở `src/mang.ts` và đặt tên tiếng Việt ở
`src/ten-nhom.ts`. Quên là `npx jest` đỏ — cố ý như vậy: không có hàng rào đó thì tuyến mới lặng
lẽ không công cụ nào gọi tới được, và sẽ chẳng ai phát hiện ra.

```bash
npx tsx scripts/liet-ke-cong-cu.ts   # dựng máy chủ thật, in đúng bảng công cụ nó khai
```

## Cách dùng

24 công cụ nghiệp vụ nhận cùng một hình dạng tham số:

```
doiTuong: '/courses'                    // enum thật trong lược đồ — đọc là thấy mảng có gì
viec:     'liet_ke' | 'xem' | 'tao' | 'sua' | 'xoa'
id?, duLieu?, tim?, sapXep?, trang?, moiTrang?
```

Bảng công cụ **chính là** bảng chức năng: mô tả enum của `doiTuong` ghi sẵn mỗi đối tượng làm được
những việc gì, nên không phải gọi thêm lượt nào để dò.

## Những gì bộ này KHÔNG làm được

**Không phải nhóm nào cũng có đủ năm việc CRUD. Chỉ 19/70.** API CLAZZI không đồng nhất, và bộ này
cố ý **không** che chuyện đó đi — hứa một tuyến không tồn tại thì mô hình gọi vào, nhận 404, rồi
tưởng hệ thống hỏng và đi thử lung tung.

- **51/70 nhóm thiếu ít nhất một việc.** Xin một việc không có ⇒ **bị từ chối**, kèm danh sách
  việc nhóm đó thật sự làm được. Bộ này **không bao giờ đoán sang tuyến khác**.
  Ví dụ: `/class-users` **chỉ có `liet_ke`** — không xem, không tạo, không sửa, không xoá được
  một học viên trong lớp bằng năm việc CRUD.
- **19 nhóm không có việc CRUD nào**, phải dùng hết bằng `clazzi_goi`:
  `/accounts` `/auth` `/catalog` `/crm` `/dashboard` `/files` `/functions` `/makeup` `/modules`
  `/notifications` `/permissions` `/role-modules` `/schedule` `/setup` `/site` `/trial`
  `/user-sessions` `/zalo` `/zoom`.
  Đáng chú ý: **`/crm` có 56 tuyến và không tuyến nào theo khuôn CRUD.**
- **319 tuyến lẻ** (`/users/export`, `/crm/customers/import`, `/auth/staff/login`, …) không nằm
  trong `viec`. Dùng `clazzi_mo_ta` để xem một đối tượng có tuyến lẻ nào, rồi gọi bằng `clazzi_goi`.

Còn lại:

- **`clazzi_goi` không phải `curl`.** Nó chỉ gọi được tuyến **có trong danh mục**; đường dẫn lạ bị
  từ chối kèm gợi ý. Không có hàng rào này thì danh mục thành vô nghĩa.
- **Không tải tệp lên được.** `POST /files/upload` cần `multipart/form-data`; lớp HTTP ở đây chỉ
  gửi JSON.
- **Không nới quyền.** Tài khoản không có quyền thì khoá cũng không có. Muốn làm được việc bị chặn
  thì phải sửa chức danh của tài khoản, không phải đổi khoá.
- **Không cấp khoá mới.** `POST /api-keys` cố ý từ chối khoá API, chỉ nhận phiên đăng nhập thật.
- **Không tự quét lại danh mục.** API đổi mà không chạy `scripts/quet-api.ts` thì bộ này vẫn hứa
  theo ảnh chụp cũ.

## Phát triển

```bash
npx tsc --noEmit   # kiểu
npx jest           # test
npx eslint .       # lint
```

Hai luật không được phá:

1. **Không `console.log` ở bất cứ đâu.** stdout là kênh JSON-RPC của MCP qua stdio; một dòng lạc
   vào đó là client không phân tích được gói tin và phiên chết ngay. Dùng `console.error`. ESLint
   chặn, và có cả test quét cây nguồn phòng trường hợp ai đó thêm `eslint-disable`.
2. **Thử nghiệm chỉ trỏ `api-demo.clazzi.vn`.** `tests/that.spec.ts` chốt cứng địa chỉ demo trong
   tệp, cố tình **không** đọc `CLAZZI_API_URL` — đọc env thì chỉ cần một lần ai đó để biến trỏ hệ
   thật rồi chạy `npx jest` là bộ test nã thẳng vào dữ liệu lớp học của khách.

Cây tệp:

| Tệp | Việc |
|---|---|
| `src/server.ts` | Lớp nối MCP, cố tình mỏng |
| `src/cong-cu.ts` | 27 công cụ. **Không** nhập gì từ SDK, nên test gọi thẳng được |
| `src/mang.ts` | **Tệp duy nhất** giữ bản đồ mảng → nhóm tuyến |
| `src/danh-muc.ts` | Nạp và tra `danh-muc.json`, hàng rào từ chối việc không tồn tại |
| `src/quet-nguon.ts` | Bộ quét mã nguồn `clazzi-api` |
| `src/http.ts` | Gọi HTTP và dịch gói lỗi sang tiếng người |
| `src/ket-qua.ts` | Đóng gói kết quả: gắn tên bản, ẩn khoá |
| `src/ban.ts` | Nhận diện bản triển khai |
| `src/the.ts` | Lớp mỏng lấy khoá — chỗ duy nhất biết khoá từ đâu ra |
| `danh-muc.json` | Ảnh chụp 511 tuyến, commit vào kho |

## Trỏ vào bản khác (gecko, knb, peptalk…)

Các bản là **nhánh đã trôi xa nhau**, không phải cùng một bề mặt API. Đo 16/09/2026:

| Bản | Kho mã | Tuyến / Nhóm | Số công cụ MCP |
|---|---|---|---|
| clazzi | `clazzi-api` | 511 / 70 | 27 |
| gecko | `otm-api` (`otm/main`) | 434 / 59 | **23** |

Gecko là **tập con nghiêm ngặt** của clazzi — không có nhóm nào clazzi thiếu, nhưng thiếu 11 nhóm
(`/zoom`, `/student-documents`, `/document-types`, `/document-reminders`, `/site`, `/orders`,
`/catalog`, `/dashboard`, `/setup`, `/trial`, `/api-keys`).

Vì công cụ **sinh từ danh mục**, đổi danh mục là bảng công cụ tự co lại: bốn công cụ
`clazzi_lop_online`, `clazzi_ho_so_du_hoc`, `clazzi_bao_cao`, `clazzi_admin_tong` biến mất hẳn ở
gecko. Khai một công cụ không thao tác được gì là mời mô hình gọi vào rồi nhận lỗi — tệ hơn là
không khai.

Sinh danh mục cho một bản:

```bash
npx tsx scripts/quet-api.ts /duong/dan/toi/ma-nguon      # ghi ra danh-muc.json
mv danh-muc.json danh-muc.<ten-ban>.json
npx tsx scripts/quet-api.ts ../clazzi-api                # dung lai danh muc goc
```

Rồi trỏ tới nó bằng `CLAZZI_DANH_MUC`:

```jsonc
"env": {
  "CLAZZI_API_URL":  "https://<may-chu-cua-ban-do>",
  "CLAZZI_API_KEY":  "clz_...",
  "CLAZZI_DANH_MUC": "danh-muc.gecko.json"
}
```

⚠ Danh mục và địa chỉ **phải khớp nhau**. Trỏ địa chỉ gecko mà dùng danh mục clazzi là hứa hàng
chục tuyến máy chủ đó không có, và mô hình sẽ đọc 404 thành "hệ thống hỏng".
