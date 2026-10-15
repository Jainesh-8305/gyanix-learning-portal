import js from '@eslint/js';
import unused from 'eslint-plugin-unused-imports';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
// Direct flat config avoids the vulnerable fast-glob/braces tree in the Next preset.
// React compiler optimization rules are not enabled: this app is not compiler-enabled.
export default ts.config(
  { ignores: ['.next/**','out/**','build/**','next-env.d.ts'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['**/*.{ts,tsx}'], plugins: { 'unused-imports': unused, 'react-hooks': hooks, 'jsx-a11y': a11y }, rules: {
    'react-hooks/rules-of-hooks': 'error',
    'unused-imports/no-unused-imports': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn'
  } }
);
