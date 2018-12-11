#!/usr/bin/env node

/**
 * Runs testing in Node.js.
 * Usage:
 * node node_modules/saby-units/mocha --amd -t 10000 test-isolated
 */

let app = require('saby-units/isolated');
let config = require('./package.json').config;
let options = {
   moduleType: config.moduleType,
   root: config.root,
   tests: config.tests
};

if (process.argv.indexOf('-R') > -1) {
   options.reportFile = process.env.test_report || config.test_report;
}

app.run(options);
