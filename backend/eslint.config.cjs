// backend/eslint.config.cjs
// ESLint flat config for the backend (Node.js CommonJS, Express 5).
// Uses .cjs extension because package.json has "type":"commonjs" which
// would otherwise prevent ESM import/export syntax in .js files.
// Run: npm run lint

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Base recommended rules
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // ── Code quality ─────────────────────────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'off',        // console.log used intentionally for server logs
      'no-undef': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',          // enforce const/let
      'prefer-const': 'warn',

      // ── Async safety ─────────────────────────────────────
      'no-return-await': 'warn',  // returning await in async is redundant

      // ── Style ─────────────────────────────────────────────
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
    },
  },

  // Ignore generated/vendor files
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
];
