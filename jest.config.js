export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/scripts/**',
    '!src/config/**',
    '!src/**/index.js',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.integration.test.js',
  ],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: [],
  verbose: true,
};
