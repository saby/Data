/* global define, beforeEach, afterEach, describe, it, assert */
define(['Types/_entity/adapter/SbisFormatFinder'], function(SbisFormatFinder) {
   'use strict';

   var SbisFormatFinder = SbisFormatFinder.default;

   const format0 = [
      {
         "n": "@Родитель",
         "t": "Число целое"
      }, {
         "n": "Имя",
         "t": "Строка"
      }, {
         "n": "Дети",
         "t": {
            "n": "Массив",
            "t": "Объект"
         }
      }
   ];

   const format1 = [
      {
         "n": "@Ребёнок",
         "t": "Число целое"
      }, {
         "n": "Имя",
         "t": "Строка"
      }
   ];

   const rawData = {
      f: 0,
      s: format0,
      d: [
         0,
         'Пётр',
         [
            {
               f: 1,
               s: format1,
               d: [
                  0,
                  'Вова'
               ]
            },
            {
               f: 1,
               d: [
                  0,
                  'Оля'
               ]
            }
         ]
      ]
   };

   describe('Types/_entity/format/FormatController', function() {

      var sbisFormatFinder;

      beforeEach(function() {
         sbisFormatFinder = new SbisFormatFinder(rawData);
      });

      afterEach(function() {
         sbisFormatFinder = undefined;
      });

      describe('cache', function() {
         it('has id with value 0, but not 1', function() {
            sbisFormatFinder.getFormat(0);
            assert.deepEqual(format0, sbisFormatFinder._cache.get(0));
            assert.isFalse(sbisFormatFinder._cache.has(1));
         });

         it('has all id', function() {
            sbisFormatFinder.getFormat();
            assert.deepEqual(format0, sbisFormatFinder._cache.get(0));
            assert.deepEqual(format1, sbisFormatFinder._cache.get(1));
         });
      });

      it('.getFormat()', function() {
         assert.deepEqual(format0, sbisFormatFinder.getFormat(0));
         assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
         assert.deepEqual(format1, sbisFormatFinder.getFormat(1));
         assert.deepEqual(undefined, sbisFormatFinder.getFormat(2));
      });
   });
});
