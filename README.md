# Type system

This TypeScript package provides Wasaby type system for efficient work with types, data structures, collections and types transformation.

## Installation in production mode

All you need is just saby-types package on npm.

1. Create a new npm package in separated folder:

        npm init

1. Install *typescript* and *saby-types* packages:

        npm install typescript
        npm install git+https://github.com/saby/Types.git

1. Create a new hello-world.ts file:

    ```typescript
        import {entity} from 'saby-types';
        
        const record = new entity.Record({
            rawData: {hello: 'Hello world!'}
        });
        
        console.log(record.get('hello'));
    ```

## Installation in development mode

1. Clone the repository in separated folder:

        git clone git@github.com:saby/Types.git ./saby-Types

1. Install development dependencies:

        npm install

1. Build the project:

        npm run build

### Available scripts

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

## Integration with Jenkins

With checkbox

*✓ Inject environment variables to the build process*

you can use these environment variables:

- `test_server_port` - port for local HTTP server (`1025` by default);
- `test_url_host` - hostname which HTTP server running on (`localhost` by default). You should setup this variable if Selenium grid on another host is used;
- `test_url_port` - the same as `test_server_port`;
- `test_report` - XUnit report filename to save report to `artifacts/xunit-report.xml` by default).
