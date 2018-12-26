/* global define, describe, it, assert */
define([
   'Types/_entity/date/toSql'
], function(
   toSql
) {
   'use strict';
   describe('Types/_entity/date/toSql', function() {
      var getTimeZone = function(date) {
         var tz = -date.getTimezoneOffset() / 60,
            isNegative = tz < 0;
         if (isNegative) {
            tz = -tz;
         }
         return (isNegative ? '-' : '+') + (tz < 10 ? '0' : '') + tz;
      };

      it('should return date and time if mode is not defined', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(toSql.default(dt), '2010-02-20 23:59:09' + getTimeZone(dt));
      });

      it('should return date and time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(toSql.default(dt, toSql.MODE.DATETIME), '2010-02-20 23:59:09' + getTimeZone(dt));
      });

      it('should return date and time whith milisenconds when time has it', function() {
         var dt =new Date(1443099268981);
         assert.equal(toSql.default(dt, toSql.MODE.DATETIME), '2015-09-24 15:54:28.981' + getTimeZone(dt));
      });

      it('should return date', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(toSql.default(dt, toSql.MODE.DATE), '2010-02-20');
      });

      it('should return time', function() {
         var dt = new Date(2010, 1, 20, 23, 59, 9);
         assert.equal(toSql.default(dt, toSql.MODE.TIME), '23:59:09' + getTimeZone(dt));
      });

      it('should return time without offset for date before Unix epoch', function() {
         var dt = new Date(0, 0, 1, 18, 0, 0);
         assert.equal(toSql.default(dt, toSql.MODE.TIME), '18:00:00');
      });
   });
});
