/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    collectCoverageFrom: ['src/get-allowed-query.ts', 'src/index.ts', 'src/merge.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testEnvironment: 'node',
    preset: 'ts-jest',
};