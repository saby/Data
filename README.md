# Types system

## Setup in development mode

1. Clone the repository (saby-Types for example):

        git clone git@github.com:saby/Types.git ./saby-Types

1. Change current dir to the saby-Types:

        cd ./saby-Types

1. Install development dependencies:

        npm install

1. Build the project:

        npm run build

## Available scripts

- Compile TypeScript:

        npm run build:compile

- Run unit tests in Node.js:

        npm test

- Start local HTTP server and check [unit tests in browser](http://localhost:1024/):

        npm start

- Run unit tests in Node.js and save report in XUnit format to /artifacts/ folder:

        npm test:node

- Run unit tests in Node.js and save coverage report to /artifacts/ folder:

        npm test:node-coverage

- Run unit tests in Chrome and save report in XUnit format to /artifacts/ folder:

        npm test:browser

- Run unit tests in Chrome and save coverage report to /artifacts/ folder:

        npm test:browser-coverage

# Integration with Jenkins

With checkbox

*✓ Inject environment variables to the build process*

you can use these environment variables:

- `test_server_port` - port for local HTTP server (`1025` by default);
- `test_url_host` - hostname which HTTP server running on (`localhost` by default). You should setup this variable if Selenium grid on another host is used;
- `test_url_port` - the same as `test_server_port`;
- `test_report` - XUnit report filename to save report to `artifacts/xunit-report.xml` by default).
