import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', fetch: 'readonly', AbortController: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' },
    },
    rules: {
      /**
       * `console.log` ghi ra stdout, mà stdout CHÍNH LÀ kênh truyền JSON-RPC của MCP qua stdio.
       * Một dòng log lạc vào đó là client không phân tích được gói tin và phiên chết ngay.
       * Mọi thứ cần in phải đi `console.error` (stderr).
       */
      'no-console': ['error', { allow: ['error'] }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: { globals: { describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly', beforeAll: 'readonly', afterAll: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', jest: 'readonly' } },
  },
);
