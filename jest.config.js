/**
 * Kho này CommonJS, y như `clazzi-api` — cố ý.
 *
 * Lõi MCP giờ là GÓI trong chính kho này (`src/`, xuất qua `src/index.ts`); các host (clazzi-api,
 * gecko, …) và bộ nối stdio đều nhập cùng một lõi ấy. Giữ CommonJS cho khớp `clazzi-api` để lõi
 * chép ngược qua lại không vấp hệ module. Test là hộp cát module theo TỪNG TỆP, nên mỗi tệp gọi
 * `datCauHinh(...)` riêng mà singleton cấu hình không lẫn sang tệp khác.
 */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest', {}] },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  // Gọi mạng thật tới api-demo cần rộng hơn 5 giây mặc định.
  testTimeout: 30000,
};
