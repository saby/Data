/* global define, describe, context, before, after, beforeEach, afterEach, it, assert */
define([
   '../../Types/_formatter/dateToSql'
], function(
   dateToSqlModule
) {
   'use strict';

   describe('Types/formatter/dateToSql', function() {
      var  dateToSql = dateToSqlModule.default;
      var  MODE = dateToSqlModule.MODE;

      function patchTzo(date, offset) {
         date.tzoStub = sinon.stub(date, 'getTimezoneOffset');
         date.tzoStub.returns(offset);
      }

      function revertTzo(date) {
         date.tzoStub.restore();
         delete date.tzoStub;
      }

      it('should format with date and time by default', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date), '2001-03-03 04:05:06-01');
         revertTzo(date);
      });

      it('should format with date and time', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06-01');
         revertTzo(date);
      });

      it('should format with date and time and milliseconds', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6, 7);
         patchTzo(date, 0);
         assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06.007+00');
         revertTzo(date);
      });

      it('should format with date', function() {
         var date = new Date(2001, 2, 3);
         assert.equal(dateToSql(date, MODE.DATE), '2001-03-03');
      });

      it('should format with time', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date, MODE.TIME), '04:05:06-01');
         revertTzo(date);
      });

      it('should format with time and milliseconds', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6, 70);
         patchTzo(date, 0);
         assert.equal(dateToSql(date, MODE.TIME), '04:05:06.070+00');
         revertTzo(date);
      });
   });
});
