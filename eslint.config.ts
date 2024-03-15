import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
  ],
  rules: {
    'no-console': 'off',
    'ts/no-require-imports': 'off',
    'ts/no-var-requires': 'off',
    'node/prefer-global/process': 'off',
  },
})
