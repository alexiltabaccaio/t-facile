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
    files: ['**/*.{ts,tsx}'],
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
  },
  {
    files: ['src/**/*.{ts,tsx}'],
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
  {
    files: ['server/utils/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../services/**', '../routes/**', '../repositories/**', '../middleware/**'],
          message: 'Violazione Architettura: Il layer utils è il più basso e non può importare dagli altri layer del backend.'
        }]
      }],
    },
  },
  {
    files: ['server/repositories/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../services/**', '../routes/**', '../middleware/**'],
          message: 'Violazione Architettura: I repositories non possono importare services, routes o middleware.'
        }]
      }],
    },
  },
  {
    files: ['server/services/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../routes/**', '../middleware/**'],
          message: 'Violazione Architettura: I services non possono importare routes o middleware.'
        }]
      }],
    },
  },
  {
    files: ['server/middleware/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../routes/**'],
          message: 'Violazione Architettura: I middleware non possono importare le routes.'
        }]
      }],
    },
  },
  {
    files: ['server/routes/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../repositories/**', '../utils/**'],
          message: 'Violazione Architettura: Le routes devono passare dai services. Non possono importare direttamente repositories o utils.'
        }]
      }],
    },
  },
];
