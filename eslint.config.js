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
          'firebase/**',
        ],
      }],
      'feature-sliced/absolute-relative': ['error', {
        alias: '@',
      }],
      'feature-sliced/public-api': ['error', {
        alias: '@',
      }],
    },
  },
];
