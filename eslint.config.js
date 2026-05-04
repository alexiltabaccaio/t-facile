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
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name=/^use(State|Effect|Reducer|Context|LayoutEffect|ImperativeHandle)/]',
          message: 'I componenti in shared/ui devono essere presentazionali (dumb). Evita logica di stato o effetti collaterali.',
        },
        {
          selector: 'CallExpression[callee.name=/^use[A-Z]/]',
          message: 'I componenti in shared/ui non devono usare custom hooks che potrebbero contenere logica di dominio.',
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
