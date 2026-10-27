import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', 'playwright-report/**', 'test-results/**', '**/mockServiceWorker.js'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Data from the API is never trusted as markup (CA67, RF51).
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Texto de dados nunca como HTML (CA67).' },
        { selector: "AssignmentExpression[left.property.name='innerHTML']", message: 'Proibido innerHTML (CA67).' },
      ],
    },
  },
  { files: ['apps/**/*.tsx'], ...jsxA11y.flatConfigs.strict },
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: globals.node } },
  { files: ['apps/frontend/src/**'], languageOptions: { globals: globals.browser } },
);
