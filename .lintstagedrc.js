module.exports = {
  '*.js': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
  '*.{json,md,yml}': ['prettier --write'],
};
