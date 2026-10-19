# @ftech-vn/clazzi-mcp

Gói **lõi MCP dùng chung** cho các máy chủ CLAZZI (clazzi, gecko, và sau này knb, peptalk) + một
**bộ nối stdio** cho người trong đội.

Trước đây mỗi kho máy chủ giữ một BẢN CHÉP của lõi 27 công cụ MCP (`src/mcp/loi`, `src/mcp/quet`)
và chúng đã trôi khỏi nhau (`tools.ts` lệch 102 dòng, `scan-source.ts` 92, `http.ts` 61…). Kho
này gom lõi ấy về MỘT chỗ; mỗi host chỉ còn mang theo bảng cấu hình thương hiệu của mình.

## Ba tầng

| Tầng | Là gì | Ở đâu |
|---|---|---|
| **A — Lõi thuần** | Khai/chạy công cụ, dịch lỗi, ẩn khoá, gắn tên bản, scanner mã nguồn, vá crypto Node 18. KHÔNG nhập `@modelcontextprotocol/sdk`. | `src/core/`, `src/scanner/`, `src/config.ts`, `src/platform.ts` → xuất qua `src/index.ts` |
| **B — Dữ liệu theo thương hiệu** | `DOMAINS` (tên công cụ + nhóm), `GROUP_NAMES`, `daBiet`, tên biến môi trường, tiền tố khoá, và `catalog.json` sinh tự động. | `src/stdio/data/<thương-hiệu>/` |
| **C — Adapter host** | Tuyến `/mcp`, `may-chu`, `ban-nay`, `huong-dan-cam` — nơi SDK xuất hiện. | Nằm trong TỪNG kho máy chủ (`clazzi-api`, gecko, …), không trong gói |

Bất biến quan trọng nhất: **Tầng A không nhập SDK**, nên bề mặt `.d.ts` của gói không tham chiếu
kiểu nào của SDK và biên dịch được trên **TypeScript 4.6** (knb / peptalk), dù `.d.ts` của SDK
đòi TS ≥4.9. SDK chỉ nằm ở `peerDependencies`.

## Dùng trong một host (Tầng C)

```ts
import { setConfig, defineTools, runTool, patchCrypto } from '@ftech-vn/clazzi-mcp';
import { CLAZZI } from './du-lieu-cua-toi'; // BrandConfig của host

patchCrypto();          // vá globalThis.crypto cho Node 18 — TRƯỚC khi dựng transport SDK
setConfig(CLAZZI);  // MỘT LẦN lúc khởi động: thương hiệu là hằng của cả tiến trình
// … rồi setRequestHandler(ListTools → defineTools(), CallTool → runTool(phien, ten, args))
```

Vì sao là singleton đặt-một-lần chứ không luồn tham số: **danh tính người gọi (khoá) đổi theo
từng lượt gọi** (đi trong `Session`), còn **thương hiệu đổi theo từng tiến trình** (một tiến trình
`clazzi-api` chỉ phục vụ `clazzi`). Xem `src/config.ts`.

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
pnpm gen:clazzi   # quét ../clazzi-api          → src/stdio/data/clazzi/catalog.json
pnpm gen:gecko    # quét ../../gecko/server-api  → src/stdio/data/gecko/catalog.json
```

## Kiểm

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # jest — luật lõi + smoke hai thương hiệu + gọi mạng thật tới api-demo
pnpm lint        # eslint (chặn console.log: stdout là kênh JSON-RPC)
pnpm build       # tsc -p tsconfig.build.json → dist/ (JS + .d.ts, SDK-free)
pnpm list-tools     # client MCP stdio THẬT: bắt tay → listTools → gọi <th>_trang_thai
```

## Tiêu thụ qua git (host nhập gói)

Host khai dependency ghim theo TAG (đừng nhánh động — build phải tái lập):

```jsonc
"@ftech-vn/clazzi-mcp": "github:ftech-vn/clazzi-mcp#v0.4.0"
```

**v0.4.0 đổi toàn bộ tên xuất sang tiếng Anh** (`datCauHinh` → `setConfig`, `chayCongCu` → `runTool`,
`dinhNghiaCongCu` → `defineTools`, `Phien` → `Session` {`deployment`, `apiKey`, …}, `CauHinhThuongHieu`
→ `BrandConfig`, danh mục JSON đổi khoá: `nhom` → `groups`, `tienTo` → `prefix`, `crud.lietKe` → `crud.list`…).
Hợp đồng với client MCP KHÔNG đổi: tên công cụ (`clazzi_goi`…), tham số (`doiTuong`, `viec`, `duLieu`,
`duongDan`…), giá trị `viec` (`liet_ke`…) và khoá JSON trong kết quả công cụ giữ nguyên. Host còn ghim
`v0.3.x` (gecko, knb, peptalk) vẫn chạy như cũ; khi nâng lên `v0.4.0` phải đổi tên theo `src/index.ts`
và chuyển danh mục JSON sang khoá mới (sinh lại bằng `scanRepo`).

**`dist/` được COMMIT vào kho.** Lý do: pnpm v10+ CHẶN build script của git dep (báo
`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`), nên không thể để `prepare` tự dựng `dist` lúc cài. Commit
`dist` sẵn thì `pnpm install --frozen-lockfile` trong Docker chỉ việc chép — không script, không
chìa, tái lập được. **Đổi mã nguồn `src/` thì phải `pnpm build` rồi commit `dist` + gắn tag mới.**

## Tiêu thụ trong Docker CI — đã gỡ chặn (kho công khai)

Cả `clazzi-api` và gecko dựng ảnh bằng `pnpm install --frozen-lockfile` trong ngữ cảnh CHỈ repo
đó. Để một host nhập gói private này lúc build ảnh, cần chọn MỘT cách:

1. **Kho gói công khai** → `git+https://github.com/ftech-vn/clazzi-mcp.git#<tag>` cài được không
   cần chìa. Đơn giản nhất, nhưng gói thành công khai.
2. **Kho private + PAT trong CI** → thêm secret có quyền đọc `ftech-vn/clazzi-mcp` vào workflow
   dựng ảnh của từng host.
3. **Registry** (GitHub Packages / npm private) → cần quyền `write:packages` để phát hành.

Kho `clazzi-mcp` nay CÔNG KHAI nên đường (1) đã chọn: host kéo `git+https` không cần chìa. Vẫn
nhớ đẩy `main` host = dựng ảnh = lên hệ khách — nghiệm thu (tsc+jest+dựng ảnh cục bộ) xong mới đẩy.
