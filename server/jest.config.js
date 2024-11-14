module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: [
    '<rootDir>/server/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  setupFiles: ['dotenv/config'],
  clearMocks: true,
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/jest.config.js'
  ]
};
