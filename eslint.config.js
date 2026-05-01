import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import featureSliced from '@conarti/eslint-plugin-feature-sliced';
import tsParser from '@typescript-eslint/parser';
import { fixupPluginRules } from '@eslint/compat';

export default [
  {
    files: ['**/*.rules'],
    languageOptions: {
      parser: firebaseRulesPlugin.parser,
    },
    plugins: {
      'firebase-rules': firebaseRulesPlugin,
    },
    rules: {
      ...firebaseRulesPlugin.configs['flat/recommended'].rules,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    plugins: {
      'feature-sliced': fixupPluginRules(featureSliced),
    },
    rules: {
      'feature-sliced/layers-slices': ['error', {
        alias: '@',
        ignoreImportPatterns: [
          '**/store/**',
        ],
      }],
      'feature-sliced/absolute-relative': ['error', {
        alias: '@',
      }],
      'feature-sliced/public-api': ['error', {
        alias: '@',
      }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['firebase', 'firebase/*'],
          message: 'Violazione FSD: I moduli Firebase non possono essere importati direttamente nei layer superiori. Usa @/shared/api/firebase'
        }]
      }],
    },
  },
  {
    files: ['src/shared/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
