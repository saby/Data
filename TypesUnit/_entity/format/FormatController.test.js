/* global define, beforeEach, afterEach, describe, it, assert */
define(['Types/_entity/format/FormatController'], function(FormatController) {
   'use strict';

   FormatController = FormatController.default;

   const rawData = {
      f: 0,
      s: [
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
      ],
      d: [
         0,
         'Пётр',
         [
            {
               f: 1,
               s: [
                  {
                     "n": "@Ребёнок",
                     "t": "Число целое"
                  }, {
                     "n": "Имя",
                     "t": "Строка"
                  }
               ],
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

      var formatController = new FormatController(rawData);

      beforeEach(function() {
         formatController = new FormatController(rawData);
      });

      afterEach(function() {
         formatController = undefined;
      });

      describe('cache', function() {
         it('has id with value 0, but not 1', function() {
            formatController.getFormat(0);
            assert.isTrue(formatController._cache.has(0));
            assert.isFalse(formatController._cache.has(1));
         });

         it('has all id', function() {
            formatController.getFormat(1);
            assert.isTrue(formatController._cache.has(0));
            assert.isTrue(formatController._cache.has(1));
         });
      });
   });
});
