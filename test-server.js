#!/usr/bin/env node

/**
 * Runs HTTP-server for testing in browser.
 * Usage:
 * node test-server
 */

let app = require('ws-unit-testing/server');
let pckg = require('./package.json');
let options = {
   moduleType: pckg.config.moduleType,
   root: pckg.config.root,
   tests: pckg.config.tests,
   coverageCommand: pckg.scripts.coverage,
   coverageReport: pckg.config['html_coverage_report'],
   initializer: 'testing-init.js'
};

app.run(process.env['test_server_port'] || pckg.config['test_server_port'], options);
