/* global define, require */
define([
], function(
) {
   'use strict';

   /**
    * Mock абстрактной цепочки для массива.
    */
   return function ArrayMock(items) {
      var obj = {};
      obj['[Types/_chain/Abstract]'] = true;
      obj._source = items;
      obj.reduce = Array.prototype.reduce.bind(items);
      obj.getEnumerator = function() {
         var en = {};
         en.index = -1;
         en.getCurrent = function() {
            return items[this.index];
         };
         en.getCurrentIndex = function() {
            return this.index;
         };
         en.moveNext = function() {
            if (this.index >= items.length - 1) {
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
