const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/__mocks__/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: path.resolve(__dirname, 'babel.config.js'),
      },
    ],
  },
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/stores/**/*.{ts,tsx}',
    'src/constants/**/*.{ts,tsx}',
    '!src/**/*.web.{ts,tsx}',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Native/Expo modules mocks
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.js',
    '^expo-constants$': '<rootDir>/src/__mocks__/expo-constants.js',
    '^react-native-reanimated$': '<rootDir>/src/__mocks__/react-native-reanimated.js',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
    '^expo/virtual/env$': '<rootDir>/src/__mocks__/expo-virtual-env.js',
    '^expo/(.*)$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-font$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-asset$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-modules-core$': '<rootDir>/src/__mocks__/empty.js',
    '^@expo/vector-icons(.*)$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-symbols$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-router(.*)$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-linking(.*)$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-splash-screen$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-status-bar$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-system-ui$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-image$': '<rootDir>/src/__mocks__/empty.js',
    '^expo-camera$': '<rootDir>/src/__mocks__/empty.js',
    '^react-native-svg$': '<rootDir>/src/__mocks__/empty.js',
    '^react-native-safe-area-context$': '<rootDir>/src/__mocks__/empty.js',
    '^react-native-screens$': '<rootDir>/src/__mocks__/empty.js',
    '^react-native-gesture-handler$': '<rootDir>/src/__mocks__/empty.js',
    '^@react-native-community/datetimepicker$': '<rootDir>/src/__mocks__/empty.js',
  },
  transformIgnorePatterns: [
    'node_modules',
  ],
};
