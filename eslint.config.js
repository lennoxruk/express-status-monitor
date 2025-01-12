const globals = require('globals');
const js = require('@eslint/js');
const pluginJest = require('eslint-plugin-jest');
const pluginJsdoc = require('eslint-plugin-jsdoc');
const prettierConfig = require('eslint-config-prettier');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['node_modules/*', 'test/*', 'coverage/*']
  },
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node
      }
    }
  },
  {
    files: ['{src,test}/**/*.{test,spec}.js'],
    plugins: {
      jest: pluginJest
    },
    languageOptions: {
      globals: pluginJest.environments.globals.globals
    },
    rules: {
      'jest/expect-expect': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['**/*.js'],
    plugins: {
      js,
      jsdoc: pluginJsdoc
    },
    rules: {
      ...js.configs.recommended.rules,
      'newline-after-var': 'warn',
      ...pluginJsdoc.configs['flat/recommended'].rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,

          require: {
            FunctionExpression: true,
            ArrowFunctionExpression: true,
            FunctionDeclaration: true,
            MethodDefinition: true
          }
        }
      ],
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['openapi', 'swagger']
        }
      ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-hyphen-before-param-description': 'warn',
      'jsdoc/check-line-alignment': 'warn',
      'jsdoc/tag-lines': [
        'warn',
        'any',
        {
          startLines: 1
        }
      ]
    }
  },
  prettierConfig, // Turns off all ESLint rules that have the potential to interfere with Prettier rules.
  prettierRecommended,
  {
    rules: {
      //'no-console': 'warn',
      'prettier/prettier': 'error',
      'n/hashbang': 'off'
    }
  }
];
