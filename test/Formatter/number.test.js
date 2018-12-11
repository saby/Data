/* global define, describe, it, assert */
define([
   'Types/formatter',
   'Core/i18n'
], function(
   formatter,
   i18n,
) {
   'use strict';

   describe('Types/formatter.number', function() {
      before(function () {
         i18n.setLang('ru-RU');
         i18n.setEnable(true);
      });
      after(function () {
         i18n.setLang('ru-RU');
      });
      it('should format 1234.5 in ru locale', function() {
         assert.equal('1 234,5', formatter.number(1234.5));
      });
      it('should format 1234.5 in en locale', function() {
         i18n.setLang('en-US');
         assert.equal('1,234.5', formatter.number(1234.5));
      });
   });
});
