/**
 * Kho này CommonJS, y như `clazzi-api` — cố ý.
 *
 * Trước đây nó là ESM (`"type": "module"`) và phải chạy Jest ở chế độ ESM thật. Từ lúc lõi 27
 * công cụ chuyển về `clazzi-api` (CommonJS) và kho này nhập thẳng từ đó, giữ hai hệ module khác
 * nhau chỉ đổi lấy một chồng cấu hình vá víu. Một hệ cho cả hai kho thì mọi thứ tự chạy.
 */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest', {}] },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  // Gọi mạng thật tới api-demo cần rộng hơn 5 giây mặc định.
  testTimeout: 30000,
};
