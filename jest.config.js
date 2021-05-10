const {pathsToModuleNameMapper} = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const {compilerOptions} = require('./tsconfig');

module.exports = {
    "globals": {
        "ts-jest": {
            "tsconfig": "tsconfig.json"
        }
    },
    testEnvironment: "node",
    preset: "ts-jest",
    "moduleDirectories": [
        ".",
        "node_modules"
    ],
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
        'solid-auth-client': `<rootDir>/entry/node.ts`,
        'text-encoding$': `<rootDir>/polyfills/text-encoder.js`,
        '@sinonjs/text-encoding$': `<rootDir>/polyfills/text-encoder.js`,
        '^base64url$': `<rootDir>/node_modules/base64url/index.js`,
        'whatwg-url$': `<rootDir>/polyfills/whatwg-url.js`,
    }
};
