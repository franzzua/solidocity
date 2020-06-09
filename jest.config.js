const {pathsToModuleNameMapper} = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const {compilerOptions} = require('./tsconfig');

module.exports = {
    "globals": {
        "ts-jest": {
            "tsConfig": "tsconfig.json"
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
        'node-fetch$': `<rootDir>/dist/esm/impl/fetch.js`,
        'fetch': `<rootDir>/node_modules/node-fetch/lib/index.js`,
        'solid-auth-client': '<rootDir>/polyfills/solid-auth-client.js',
        'solid-auth-client-real': '<rootDir>/node_modules/solid-auth-client/lib/authn-fetch.js',
        'text-encoding$': `<rootDir>/polyfills/text-encoder.js`,
        '@sinonjs/text-encoding$': `<rootDir>/polyfills/text-encoder.js`,
        'whatwg-url$': `<rootDir>/polyfills/whatwg-url.js`,
        'websocket-polyfill$': `<rootDir>/polyfills/websocket.js`
        //'@trust/webcrypto': `<rootDir>/polyfills/crypto.js`,
    }
};
