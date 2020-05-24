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
    preset: "ts-jest",
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
        'solid-auth-client': '<rootDir>/solid/impl/fetch.impl.ts'
    }
};
