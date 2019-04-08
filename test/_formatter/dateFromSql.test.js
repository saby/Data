/* global define, describe, it, assert */
define([
   'Types/_formatter/dateFromSql'
], function(
   fromSql
) {
   'use strict';
   var fromSql = fromSql.default;

   describe('Types/_formatter/dateFromSql', function() {
      var localTZ = (new Date()).getTimezoneOffset(),
         localTZHours = Math.floor(localTZ / 60),
         localTZMinutes = localTZ - (60 * localTZHours);

      it('should return midnight of current date by default', function() {
         var date = fromSql(''),
            now = new Date();
         assert.equal(date.getDate(), now.getDate());
         assert.equal(date.getMonth(), now.getMonth());
         assert.equal(date.getFullYear(), now.getFullYear());
         assert.equal(date.getHours(), 0);
         assert.equal(date.getMinutes(), 0);
         assert.equal(date.getSeconds(), 0);
      });

      it('should parse date', function() {
         var date = fromSql('2010-11-12');
         assert.equal(date.getDate(), 12);
         assert.equal(date.getMonth(), 10);
         assert.equal(date.getFullYear(), 2010);
      });

      it('should parse time', function() {
         var date = fromSql('23:59:41');
         assert.equal(date.getHours(), 23);
         assert.equal(date.getMinutes(), 59);
         assert.equal(date.getSeconds(), 41);
      });

      it('should parse time with timezone', function() {
         var date = fromSql('12:00:00+00');
         assert.equal(date.getHours(), 12 - localTZHours);
         assert.equal(date.getMinutes(), 0 - localTZMinutes);
      });

      it('should parse time without timezone as is', function() {
         var date = fromSql('12:00:00');
         assert.equal(date.getHours(), 12);
         assert.equal(date.getMinutes(), 0);
      });

      it('should apply time to given timezone', function() {
         var tz = 1,
            date = fromSql('12:00:00', tz * 60);
         assert.equal(date.getHours(), 12 - tz - localTZHours);
         assert.equal(date.getMinutes(), 0);
      });

      it('should parse datetime', function() {
         var date = fromSql('2010-11-12 23:59:41');
         assert.equal(date.getDate(), 12);
         assert.equal(date.getMonth(), 10);
         assert.equal(date.getFullYear(), 2010);
         assert.equal(date.getHours(), 23);
         assert.equal(date.getMinutes(), 59);
         assert.equal(date.getSeconds(), 41);
      });

      it('should return corret time when it day on summer-winter time change', function () {
         var stub = sinon.stub(Date.prototype, 'getTimezoneOffset').callsFake(function () {
             return this > new Date('2019-03-12 1:00:00+3') ? 540 : 600;
         });
         assert.equal(fromSql('2019-03-10 03:00:00+03').getHours(), 14);
         stub.restore();
      });

   });
});
