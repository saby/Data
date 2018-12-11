#!/usr/bin/env node

/**
 * Runs testing in browser via webdriver
 * Usage (local HTTP-server (test-server.js) should being ran first):
 * node test-browser[ --coverage]
 */

let app = require('saby-units/browser');
let config = require('./package.json').config;
function buildUrl(scheme, host, port, path, query) {
   return scheme + '://' + host + ':' + port + '/' + path + '?' + query;
}

let report = config.test_report;
let query = config.test_url.query;

if (process.argv.indexOf('--coverage') > -1) {
   report = config.json_coverage_report;
   query = 'reporter=JSCoverage';
}

app.run(
   buildUrl(
      process.env.test_url_scheme || config.test_url.scheme,
      process.env.test_url_host || config.test_url.host,
      process.env.test_url_port || config.test_url.port,
      process.env.test_url_path || config.test_url.path,
      process.env.test_url_query || query
   ),
   process.env.test_report || report
);
