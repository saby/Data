#!/usr/bin/env node
let fs = require('fs');
const logger = console;
const map = {
   'node_modules/sbis3-ws/Core': 'Core',
   'node_modules/sbis3-ws/ws': 'WS.Core',
   'node_modules/sbis3-ws/View': 'View',
   'node_modules/ws-data/WS.Data': 'WS.Data',
   'node_modules/ws-data/Data': 'Data'
};

Object.keys(map).forEach((source) => {
   let target = map[source];
   logger.warn(`Create symlink from '${source}' to '${target}'`);

   try {
      fs.symlinkSync(source, target, 'dir');
   } catch (err) {
      logger.warn(err.message);
   }
});
