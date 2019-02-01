/* global define, describe, it, assert */
define([
   'Types/_entity/date/toSql'
], function(
   toSql
) {
   'use strict';
   describe('Types/_entity/date/toSql', function() {
      let dt;
      beforeEach(() => {
         dt = new Date(2010, 1, 20, 23, 59, 9);
         dt.getTimezoneOffset = () => -180;
      });
      it('should return date and time if mode is not defined', function() {
         assert.equal(toSql.default(dt), '2010-02-20 23:59:09+03');
      });

      it('should return date and time', function() {
         assert.equal(toSql.default(dt, toSql.MODE.DATETIME), '2010-02-20 23:59:09+03');
      });

      it('should return date and time whith milisenconds when time has it', function() {
         var dt =new Date(1443099268981);
         dt.getTimezoneOffset = () => -180;
         assert.equal(toSql.default(dt, toSql.MODE.DATETIME), '2015-09-24 15:54:28.981+03');
      });

      it('should return date', function() {
         assert.equal(toSql.default(dt, toSql.MODE.DATE), '2010-02-20');
      });

      it('should return time', function() {
         assert.equal(toSql.default(dt, toSql.MODE.TIME), '23:59:09+03');
      });

      it('should return time without offset for date before Unix epoch', function() {
         var dt = new Date(0, 0, 1, 18, 0, 0);
         assert.equal(toSql.default(dt, toSql.MODE.TIME), '18:00:00');
      });
      it('should return datetime with fractional time zone', function() {
         var dt = new Date(2019, 0, 31, 19, 11, 0);
         dt.getTimezoneOffset = () => -330;
         assert.equal(toSql.default(dt, toSql.MODE.DATETIME), '2019-01-31 19:11:00+06:30');
      });
   });
});
