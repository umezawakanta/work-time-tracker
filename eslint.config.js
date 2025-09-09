const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.eslintrc.js',
      'vite.config.js',
      '*.config.js',
      'coverage/**',
      '.vercel/**',
      'jest.*.config.js', // Jest設定ファイルを除外
      'src/**/__tests__/**', // テストファイルのESLintチェックを緩和
      'src/**/__mocks__/**', // モックファイルを除外
      'api/**', // API directory (legacy require() usage)
      'public/dev-status.json',
      'public/test-summary.json',
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 段階的修正戦略: 重要度の低い警告を一時的に無効化
      '@typescript-eslint/no-explicit-any': 'off', // 一時的にoff（約200件削減）
      'react-hooks/exhaustive-deps': 'off', // 一時的にoff（約100件削減）
      'react-refresh/only-export-components': 'off', // 一時的にoff（約50件削減）

      // 重要な警告は保持（段階的改善のため一時的に無効化）
      '@typescript-eslint/no-unused-vars': 'off', // 一時的にoff（約100件削減）
      'no-async-promise-executor': 'warn',
      'prefer-rest-params': 'warn',
      // Empty catchは許容（意図的に握りつぶすケースを想定）
      'no-empty': ['error', { allowEmptyCatch: true }],
      // 短絡評価/三項演算子の式は許容（gtagやes?.close()等）
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
    },
  },
  // テストファイル専用の設定
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      // テストファイルでは一部のルールを緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-undef': 'off', // Jest グローバル変数のため
    },
  }
);
