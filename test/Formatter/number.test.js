/* global define, describe, it, assert */
define([
   'Types/formatter',
   'Core/i18n'
], function(
   formatter,
   i18n,
) {
   'use strict';

   describe('Types/formatter:number', function() {
      var locales = ['en-US', 'ru-RU'];

      locales.forEach(function(locale) {
         describe('if locale "' + locale + '" is enabled', function() {
            var stub;

            beforeEach(function() {
               stub = sinon.stub(i18n, 'getLang');
               stub.returns(locale);
            });

            afterEach(function() {
               stub.restore();
               stub = undefined;
            });

            it('should format Number', function() {
               var given = 1234.5;
               var expect = {
                  'en-US': '1,234.5',
                  'ru-RU': '1 234,5'
               };
               assert.equal(expect[locale], formatter.number(given));
            });
         });
      });
   });
});
