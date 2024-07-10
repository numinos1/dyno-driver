module.exports = {
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  }
};

