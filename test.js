#!/usr/bin/env node

/**
 * Runs testing in various modes
 * node test
 * --browser - run testing in browser via webdriver
 * --isolated - run testing in Node.js (V8)
 * --report - build testing report
 * --coverage - build code coverage report
 */

let spawn = require('child_process').spawn;
let config = require('./package.json').config;
const isAmd = config.moduleType === 'amd';
const logger = console;
const timeout = 10000;

let options = {
   server: false,
   browser: false,
   isolated: false,
   report: false,
   coverage: false
};

function runProcess(args) {
   let result,
      proc;

   result = new Promise((resolve, reject) => {
      try {
         proc = spawn(
            process.execPath,
            args,
            {stdio: 'inherit'}
         );

         proc.on('exit', (code, signal) => {
            resolve({code, signal});
         });
      } catch (err) {
         reject(err);
      }
   });

   Object.defineProperty(result, 'process', {
      get: () => {
         return proc;
      }
   });

   return result;
}

//Processing CLI arguments
process.argv.slice(2).forEach(arg => {
   const flag = arg.split('=')[0];

   switch (flag) {
      case '--browser':
         options.server = true;
         options.browser = true;
         break;

      case '--isolated':
         options.isolated = true;
         break;

      case '--report':
         options.report = true;
         break;

      case '--coverage':
         options.coverage = true;
         break;
   }
});

//Build new CLI arguments
let testingArgs = [];

if (options.browser) {
   if (options.server) {
      testingArgs.push('node_modules/ws-unit-testing/queue', 'test-server');
   }

   testingArgs.push('test-browser');

   if (options.coverage) {
      testingArgs.push('--coverage');
   }
}

if (options.isolated) {
   if (options.coverage) {
      testingArgs.push('node_modules/ws-unit-testing/cover');
   } else {
      testingArgs.push('node_modules/ws-unit-testing/mocha');
   }

   testingArgs.push('-t', timeout);

   if (options.report) {
      testingArgs.push('-R', 'xunit');
   }

   if (isAmd) {
      testingArgs.push('--amd', 'test-isolated');
   } else {
      testingArgs.push(config.tests_root + '/**/*.test.*');
   }
}

let processes = [];

//Run testing child process
if (testingArgs.length) {
   processes.push(runProcess(testingArgs));
}

//Translate exit codes
Promise.all(processes).then(results => {
   let code, signal;
   results.forEach(result => {
      code = code || result.code;
      signal = signal || result.signal;
   });

   process.on('exit', function() {
      if (signal) {
         process.kill(process.pid, signal);
      } else {
         process.exit(code);
      }
   });
}).catch(logger.error);

//Terminate children processes on exit
process.on('SIGINT', () => {
   processes.forEach(item => {
      if (item.process) {
         item.process.kill('SIGINT');
         item.process.kill('SIGTERM');
      }
   });
   process.kill(process.pid, 'SIGINT');
});
