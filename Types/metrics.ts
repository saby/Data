/**
 * Performance metrics wrapper.
 * @author Мальцев А.А.
 */

import {Record, Model} from './entity';
import {logger} from './util';

const patches = {};

function restoreFunction(patch) {
   patch.scope[patch.property] = patch.original;
}

function wrapFunction(original, metrics) {
   metrics.counter = 0;
   metrics.time = 0;
   return function() {
      metrics.counter++;

      const start = Date.now();
      const result = original.apply(this, arguments);

      metrics.time += Date.now() - start;

      return result;
   };
}

function patchFunction(scope, property, alias) {
   const metrics = {};
   const patch = {
      scope,
      property,
      metrics,
      original: scope[property],
      replacement: wrapFunction(scope[property], metrics)
   };

   scope[property] = patch.replacement;

   return (patches[alias] = patch);
}

function patch() {
   patchFunction(Record.prototype, 'get', 'WS.Data/Entity/Record::get()');
   patchFunction(Model.prototype, 'get', 'WS.Data/Entity/Model::get()');
   patchFunction(Model.prototype, '_processCalculatedValue', 'WS.Data/Entity/Model::_processCalculatedValue()');
}

function restore() {
   for (let alias in patches) {
      if (patches.hasOwnProperty(alias)) {
         restoreFunction(patches[alias]);
         delete patches[alias];
      }
   }
}

/**
 * Starts metrics for certain identifier
 */
export function start(id: string) {
   logger.log('[Metrics]', 'Strart ' + id);
   patch();
}

/**
 * Stops metrics for certain identifier
 */
export function stop(id: string) {
   logger.log('[Metrics]', 'Stop ' + id);

   for (let alias in patches) {
      if (patches.hasOwnProperty(alias)) {
         const patch = patches[alias];
         logger.log('[Metrics]', alias + ' ' + patch.metrics.counter + ' times, ' + patch.metrics.time + 'ms');
      }
   }

   restore();

   logger.log('[Metrics]', 'Complete ' + id);
}
