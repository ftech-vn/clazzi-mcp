# @ftech-vn/clazzi-mcp

Gói **lõi MCP dùng chung** cho các máy chủ CLAZZI (clazzi, gecko, và sau này knb, peptalk) + một
**bộ nối stdio** cho người trong đội.

Trước đây mỗi kho máy chủ giữ một BẢN CHÉP của lõi 27 công cụ MCP (`src/mcp/loi`, `src/mcp/quet`)
và chúng đã trôi khỏi nhau (`cong-cu.ts` lệch 102 dòng, `quet-nguon.ts` 92, `http.ts` 61…). Kho
này gom lõi ấy về MỘT chỗ; mỗi host chỉ còn mang theo bảng cấu hình thương hiệu của mình.

## Ba tầng

| Tầng | Là gì | Ở đâu |
|---|---|---|
| **A — Lõi thuần** | Khai/chạy công cụ, dịch lỗi, ẩn khoá, gắn tên bản, scanner mã nguồn, vá crypto Node 18. KHÔNG nhập `@modelcontextprotocol/sdk`. | `src/loi/`, `src/quet/`, `src/cau-hinh.ts`, `src/nen-tang.ts` → xuất qua `src/index.ts` |
| **B — Dữ liệu theo thương hiệu** | `MANG` (tên công cụ + nhóm), `TEN_NHOM`, `daBiet`, tên biến môi trường, tiền tố khoá, và `danh-muc.json` sinh tự động. | `src/bo-noi/du-lieu/<thương-hiệu>/` |
| **C — Adapter host** | Tuyến `/mcp`, `may-chu`, `ban-nay`, `huong-dan-cam` — nơi SDK xuất hiện. | Nằm trong TỪNG kho máy chủ (`clazzi-api`, gecko, …), không trong gói |

Bất biến quan trọng nhất: **Tầng A không nhập SDK**, nên bề mặt `.d.ts` của gói không tham chiếu
kiểu nào của SDK và biên dịch được trên **TypeScript 4.6** (knb / peptalk), dù `.d.ts` của SDK
đòi TS ≥4.9. SDK chỉ nằm ở `peerDependencies`.

## Dùng trong một host (Tầng C)

```ts
import { datCauHinh, dinhNghiaCongCu, chayCongCu, vaCrypto } from '@ftech-vn/clazzi-mcp';
import { CLAZZI } from './du-lieu-cua-toi'; // CauHinhThuongHieu của host

vaCrypto();          // vá globalThis.crypto cho Node 18 — TRƯỚC khi dựng transport SDK
datCauHinh(CLAZZI);  // MỘT LẦN lúc khởi động: thương hiệu là hằng của cả tiến trình
// … rồi setRequestHandler(ListTools → dinhNghiaCongCu(), CallTool → chayCongCu(phien, ten, args))
```

Vì sao là singleton đặt-một-lần chứ không luồn tham số: **danh tính người gọi (khoá) đổi theo
từng lượt gọi** (đi trong `Phien`), còn **thương hiệu đổi theo từng tiến trình** (một tiến trình
`clazzi-api` chỉ phục vụ `clazzi`). Xem `src/cau-hinh.ts`.

## Bộ nối stdio (người trong đội)

Khách hàng KHÔNG dùng bộ nối này — họ cắm thẳng vào `https://api-<mã>.clazzi.vn/mcp` bằng một URL
và một khoá. Bộ nối stdio ở lại để gỡ lỗi và trỏ vào bản khác hệ.

```bash
# clazzi (mặc định)
CLAZZI_API_URL=https://api-demo.clazzi.vn CLAZZI_API_KEY=clz_... pnpm start

# gecko
MCP_THUONG_HIEU=gecko GECKO_API_URL=https://otm-api.f-tech.vn GECKO_API_KEY=clz_... pnpm start
```

`CLAZZI_DANH_MUC=<đường-dẫn.json>` ghi đè danh mục để trỏ vào một bản có danh mục riêng.

## Sinh lại danh mục (prebuild)

Danh mục là ẢNH CHỤP mã nguồn máy chủ. Sinh lại mỗi khi controller đổi, để mọi API mới tự có mặt
trong MCP:

```bash
pnpm sinh:clazzi   # quét ../clazzi-api          → src/bo-noi/du-lieu/clazzi/danh-muc.json
pnpm sinh:gecko    # quét ../../gecko/server-api  → src/bo-noi/du-lieu/gecko/danh-muc.json
```

## Kiểm

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # jest — luật lõi + smoke hai thương hiệu + gọi mạng thật tới api-demo
pnpm lint        # eslint (chặn console.log: stdout là kênh JSON-RPC)
pnpm build       # tsc -p tsconfig.build.json → dist/ (JS + .d.ts, SDK-free)
pnpm liet-ke     # client MCP stdio THẬT: bắt tay → listTools → gọi <th>_trang_thai
```

## Tiêu thụ trong Docker CI — điểm cần quyết

Cả `clazzi-api` và gecko dựng ảnh bằng `pnpm install --frozen-lockfile` trong ngữ cảnh CHỈ repo
đó. Để một host nhập gói private này lúc build ảnh, cần chọn MỘT cách:

1. **Kho gói công khai** → `git+https://github.com/ftech-vn/clazzi-mcp.git#<tag>` cài được không
   cần chìa. Đơn giản nhất, nhưng gói thành công khai.
2. **Kho private + PAT trong CI** → thêm secret có quyền đọc `ftech-vn/clazzi-mcp` vào workflow
   dựng ảnh của từng host.
3. **Registry** (GitHub Packages / npm private) → cần quyền `write:packages` để phát hành.

Chưa chọn cách này thì host chưa nhập gói được lúc build — đó là lý do bước de-dup ở clazzi-api /
gecko phải chờ quyết định, không đẩy `main` bừa (đẩy = dựng ảnh = lên hệ khách trả tiền).
