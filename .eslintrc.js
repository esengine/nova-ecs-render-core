module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'off', // Turn off for interfaces and abstract classes
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error'
  },
  env: {
    node: true,
    es6: true
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.config.js',
    '.eslintrc.js',
    'examples/'
  ]
};
