/* global define, describe, context, before, after, beforeEach, afterEach, it, assert */
define([
   'Types/_formatter/dateToSql'
], function(
   dateToSqlModule
) {
   'use strict';

   var  dateToSql = dateToSqlModule.default;
   var  MODE = dateToSqlModule.MODE;

   describe('Types/_formatter/dateToSql', function() {
      function patchTzo(date, offset) {
         date.tzoStub = sinon.stub(date, 'getTimezoneOffset');
         date.tzoStub.returns(offset);
      }

      function revertTzo(date) {
         date.tzoStub.restore();
         delete date.tzoStub;
      }

      it('should return date and time if mode is not defined', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 0);
         assert.equal(dateToSql(dt), '2010-02-20 23:59:09+00:00');
         revertTzo(dt);
      });

      it('should return date and time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 0);
         assert.equal(dateToSql(dt, MODE.DATETIME), '2010-02-20 23:59:09+00:00');
         revertTzo(dt);
      });

      it('should return positive timezone for negative offset', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, -60);
         assert.equal(dateToSql(dt), '2010-02-20 23:59:09+01:00');
         revertTzo(dt);
      });

      it('should return negative timezone for positive offset', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 60);
         assert.equal(dateToSql(dt), '2010-02-20 23:59:09-01:00');
         revertTzo(dt);
      });

      it('should return timezone without minutes', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 10 * 60);
         assert.equal(dateToSql(dt), '2010-02-20 23:59:09-10:00');
         revertTzo(dt);
      });

      it('should return timezone with minutes', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 10 * 60 + 20);
         assert.equal(dateToSql(dt), '2010-02-20 23:59:09-10:20');
         revertTzo(dt);
      });

      it('should return date and time whith milisenconds if there are defined', function() {
         var dt = new Date(1443099268981);
         patchTzo(dt, 0);
         assert.equal(dateToSql(dt, MODE.DATETIME), '2015-09-24 15:54:28.981+00:00');
         revertTzo(dt);
      });

      it('should return date', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(dateToSql(dt, MODE.DATE), '2010-02-20');
      });

      it('should return time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 0);
         assert.equal(dateToSql(dt, MODE.TIME), '23:59:09+00:00');
         revertTzo(dt);
      });

      it('should format with date and time by default', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date), '2001-03-03 04:05:06-01:00');
         revertTzo(date);
      });

      it('should format with date and time', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06-01:00');
         revertTzo(date);
      });

      it('should format with date and time and milliseconds', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6, 7);
         patchTzo(date, 0);
         assert.equal(dateToSql(date, MODE.DATETIME), '2001-03-03 04:05:06.007+00:00');
         revertTzo(date);
      });

      it('should format with date', function() {
         var date = new Date(2001, 2, 3);
         assert.equal(dateToSql(date, MODE.DATE), '2001-03-03');
      });

      it('should format with time', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6);
         patchTzo(date, 60);
         assert.equal(dateToSql(date, MODE.TIME), '04:05:06-01:00');
         revertTzo(date);
      });

      it('should format with time and milliseconds', function() {
         var date = new Date(2001, 2, 3, 4, 5, 6, 70);
         patchTzo(date, 0);
         assert.equal(dateToSql(date, MODE.TIME), '04:05:06.070+00:00');
         revertTzo(date);
      });
   });
});
