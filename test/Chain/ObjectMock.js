/* global define, require */
define([
], function(
) {
   'use strict';

   /**
    * Mock абстрактной цепочки для массива.
    */
   return function ObjectMock(items) {
      var obj = {};
      var keys = Object.keys(items);
      obj['[Types/_chain/Abstract]'] = true;
      obj._source = items;
      obj.shouldSaveIndices = true;
      obj.reduce = Array.prototype.reduce.bind(keys.map(function(key) {
         return items[key];
      }));
      obj.getEnumerator = function() {
         var en = {};
         en.index = -1;
         en.getCurrent = function() {
            return items[keys[this.index]];
         };
         en.getCurrentIndex = function() {
            return keys[this.index];
         };
         en.moveNext = function() {
            if (this.index >= keys.length - 1) {
               return false;
            }
            this.index++;
            return true;
         };
         return en;
      };

      return obj;
   };
});
