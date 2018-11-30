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

   describe('Types/formatter.numberWords', function() {
      before(function () {
         i18n.setLang('ru-RU');
         i18n.setEnable(true);
         i18n.setDict(ruRU, 'formatter', 'ru-RU');
         i18n.setDict(enUS, 'formatter', 'en-US');
      });
      after(function () {
         i18n.setLang('ru-RU');
      });
      describe('RU', function() {
         it('should format 0 to words', function() {
            assert.equal('ноль', formatter.numberWords(0));
         });
         it('should format 2 to words', function() {
            assert.equal('два', formatter.numberWords(2));
         });
         it('should format 13 to words', function() {
            assert.equal('тринадцать', formatter.numberWords(13));
         });
         it('should format 23 to words', function() {
            assert.equal('двадцать три', formatter.numberWords(23));
         });
         it('should format 300 to words', function() {
            assert.equal('триста', formatter.numberWords(300));
         });
         it('should format 123 to words', function() {
            assert.equal('сто двадцать три', formatter.numberWords(123));
         });
         it('should format 2123 to words', function() {
            assert.equal('две тысячи сто двадцать три', formatter.numberWords(2123));
         });
         it('should format 23015000 to words', function() {
            assert.equal('двадцать три миллиона пятнадцать тысяч', formatter.numberWords(23015000));
         });
         it('should format -6 to words', function() {
            assert.equal('минус шесть', formatter.numberWords(-6));
         });
      });
      describe('EN', function() {
         before(function () {
            i18n.setLang('en-US');
         });
         it('should format 0 to words', function() {
            assert.equal('zero', formatter.numberWords(0));
         });
         it('should format 2 to words', function() {
            assert.equal('two', formatter.numberWords(2));
         });
         it('should format 13 to words', function() {
            assert.equal('thirteen', formatter.numberWords(13));
         });
         it('should format 23 to words', function() {
            assert.equal('twenty-three', formatter.numberWords(23));
         });
         it('should format 300 to words', function() {
            assert.equal('three hundred', formatter.numberWords(300));
         });
         it('should format 123 to words', function() {
            assert.equal('one hundred and twenty-three', formatter.numberWords(123));
         });
         it('should format 2123 to words', function() {
            assert.equal('two thousands, one hundred and twenty-three', formatter.numberWords(2123));
         });
         it('should format 23015000 to words', function() {
            assert.equal('twenty-three millions, fifteen thousands', formatter.numberWords(23015000));
         });
         it('should format -6 to words', function() {
            assert.equal('minus six', formatter.numberWords(-6));
         });
      });
   });
});
