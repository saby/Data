/* global define, describe, it, assert */
define([
   'Types/_entity/date/toSql'
], function(
   toSqlLib
) {
   'use strict';

   var toSql = toSqlLib.default;
   var MODE = toSqlLib.MODE;

   describe('Types/_entity/date/toSql', function() {
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
         assert.equal(toSql(dt), '2010-02-20 23:59:09+00');
         revertTzo(dt);
      });

      it('should return date and time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 0);
         assert.equal(toSql(dt, MODE.DATETIME), '2010-02-20 23:59:09+00');
         revertTzo(dt);
      });

      it('should return positive timezone for negative offset', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, -60);
         assert.equal(toSql(dt), '2010-02-20 23:59:09+01');
         revertTzo(dt);
      });

      it('should return negative timezone for positive offset', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 60);
         assert.equal(toSql(dt), '2010-02-20 23:59:09-01');
         revertTzo(dt);
      });

      it('should return timezone without minutes', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 10 * 60);
         assert.equal(toSql(dt), '2010-02-20 23:59:09-10');
         revertTzo(dt);
      });

      it('should return timezone with minutes', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 10 * 60 + 20);
         assert.equal(toSql(dt), '2010-02-20 23:59:09-10:20');
         revertTzo(dt);
      });

      it('should return date and time whith milisenconds if there are defined', function() {
         var dt = new Date(1443099268981);
         patchTzo(dt, 0);
         assert.equal(toSql(dt, MODE.DATETIME), '2015-09-24 15:54:28.981+00');
         revertTzo(dt);
      });

      it('should return date', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(toSql(dt, MODE.DATE), '2010-02-20');
      });

      it('should return time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         patchTzo(dt, 0);
         assert.equal(toSql(dt, MODE.TIME), '23:59:09+00');
         revertTzo(dt);
      });

      it('should return time without offset for date before Unix epoch', function() {
         var dt = new Date(0, 0, 1, 18, 0, 0);
         assert.equal(toSql(dt, MODE.TIME), '18:00:00');
      });
   });
});
