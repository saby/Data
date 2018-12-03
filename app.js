/**
 * Запускает локальный HTTP сервер
 */

let connect = require('connect');
let http = require('http');
let serveStatic = require('serve-static');
let config = require('./package.json').config;

const logger = console;

//Run testing server
require('./test-server');

logger.info('WS.Data HTTP server');

let app = connect();
app.use(
   serveStatic(
      process.cwd()
   )
);

http
   .createServer(app)
   .listen(process.env.app_port || config.app_port);
