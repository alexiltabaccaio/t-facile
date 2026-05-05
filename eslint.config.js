import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import featureSliced from '@conarti/eslint-plugin-feature-sliced';
import tsParser from '@typescript-eslint/parser';
import { fixupPluginRules } from '@eslint/compat';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.rules'],
  },
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
          message: 'FSD Violation: Firebase modules cannot be imported directly in higher layers. Use @/shared/api/firebase instead.'
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
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name=/^use(State|Effect|Reducer|Context|LayoutEffect|ImperativeHandle)/]',
          message: 'Components in shared/ui must be presentational (dumb). Avoid state logic or side effects.',
        },
        {
          selector: 'CallExpression[callee.name=/^use[A-Z]/]',
          message: 'Components in shared/ui must not use custom hooks that might contain domain logic.',
        }
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/features/**', '@/entities/**', '@/widgets/**', '@/pages/**'],
            message: 'Violazione FSD: Il layer shared non può importare dai layer superiori.'
          }
        ]
      }],
    },
  },
];
