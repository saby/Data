/* global define, describe, it, assert */
define([
   'Types/formatter',
   'Core/i18n',
   'json!Types/lang/en-US/en-US.json',
   'json!Types/lang/ru-RU/ru-RU.json'
], function(
   formatter,
   i18n,
   enUS,
   ruRU
) {
   'use strict';

   describe('Types/formatter:numberWords', function() {
      var locales = ['en-US', 'ru-RU'];

      before(function() {
         i18n.setDict(ruRU, 'formatter', 'ru-RU');
         i18n.setDict(enUS, 'formatter', 'en-US');
      });

      locales.forEach(function(locale) {
         describe('if locale "' + locale + '" is enabled', function() {
            var stub;

            beforeEach(function() {
               var opts = new Intl.NumberFormat(locale).resolvedOptions();
               if (opts.locale === locale) {
                  stub = sinon.stub(i18n, 'getLang');
                  stub.returns(locale);
               } else {
                  this.skip();
               }
            });

            afterEach(function() {
               stub.restore();
               stub = undefined;
            });

            it('should format 0 to words', function() {
               var expect = {
                  'en-US': 'zero',
                  'ru-RU': 'ноль'
               };
               assert.equal(expect[locale], formatter.numberWords(0));
            });

            it('should format 2 to words', function() {
               var expect = {
                  'en-US': 'two',
                  'ru-RU': 'два'
               };
               assert.equal(expect[locale], formatter.numberWords(2));
            });

            it('should format 13 to words', function() {
               var expect = {
                  'en-US': 'thirteen',
                  'ru-RU': 'тринадцать'
               };
               assert.equal(expect[locale], formatter.numberWords(13));
            });

            it('should format 23 to words', function() {
               var expect = {
                  'en-US': 'twenty-three',
                  'ru-RU': 'двадцать три'
               };
               assert.equal(expect[locale], formatter.numberWords(23));
            });

            it('should format 300 to words', function() {
               var expect = {
                  'en-US': 'three hundred',
                  'ru-RU': 'триста'
               };
               assert.equal(expect[locale], formatter.numberWords(300));
            });

            it('should format 123 to words', function() {
               var expect = {
                  'en-US': 'one hundred and twenty-three',
                  'ru-RU': 'сто двадцать три'
               };
               assert.equal(expect[locale], formatter.numberWords(123));
            });

            it('should format 2123 to words', function() {
               var expect = {
                  'en-US': 'two thousand, one hundred and twenty-three',
                  'ru-RU': 'две тысяча сто двадцать три'
               };
               assert.equal(expect[locale], formatter.numberWords(2123));
            });

            it('should format 23015000 to words', function() {
               var expect = {
                  'en-US': 'twenty-three million, fifteen thousand',
                  'ru-RU': 'двадцать три миллион пятнадцать тысяча'
               };
               assert.equal(expect[locale], formatter.numberWords(23015000));
            });

            it('should format -6 to words', function() {
               var expect = {
                  'en-US': 'minus six',
                  'ru-RU': 'минус шесть'
               };
               assert.equal(expect[locale], formatter.numberWords(-6));
            });
         });
      });
   });
});
