module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'import', 'jsx-a11y', 'react-hooks', 'react-refresh'],
  rules: {
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'react-refresh/only-export-components': 'warn',
    'import/no-unresolved': [
      'error',
      { ignore: ['^[/]?assets/'] },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
      alias: {
        map: [
          ['assets', '/../public/assets'],
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.svg'],
      },
    },
  }
};
