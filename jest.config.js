/**
 * Mã nguồn là ESM (`"type": "module"`) nên ts-jest phải dịch sang ESM và Jest phải chạy ở chế độ
 * ESM thật; dịch xuống CommonJS thì `import.meta.url` — thứ ta dùng để định vị `danh-muc.json` —
 * trở thành lỗi cú pháp.
 */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // Nhập kiểu ESM phải ghi đuôi `.js`; ánh xạ ngược lại để Jest tìm đúng tệp `.ts` nguồn.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: { module: 'ESNext', moduleResolution: 'Bundler', verbatimModuleSyntax: false } }],
  },
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  // Gọi mạng thật tới api-demo cần rộng hơn 5 giây mặc định.
  testTimeout: 30000,
};
