/* global define, describe, it, assert */
define([
   'Types/_entity/applied/TimeInterval'
], function (
   TimeInterval
) {
   TimeInterval = TimeInterval.default;

   describe('Types/_entity/applied/TimeInterval', function () {
      var ti;

      beforeEach(function() {
         ti = new TimeInterval({
            days: 1,
            hours: 2,
            minutes: 3,
            seconds: 4,
            milliseconds: 5
         });
      });

      afterEach(function() {
         ti = undefined;
      });

      describe('.constructor()', function () {
         it('should throw an Error for empty string', function () {
            assert.throws(function() {
               new TimeInterval('');
            });
         });
      });

      describe('.getDays()', function () {
         it('should return this day by default', function () {
            var ti = new TimeInterval();
            assert.equal(ti.getDays(), 0);
         });
      });

      describe('.addDays()', function () {
         it('should return previous day', function () {
            var ti = new TimeInterval();
            assert.equal(ti.addDays(-1).getDays(), -1);
         });
      });

      describe('.subDays()', function () {
         it('should return next day', function () {
            var ti = new TimeInterval();
            assert.equal(ti.subDays(-1).getDays(), 1);
         });
      });

      describe('.addHours()', function () {
         it('should return previous hour', function () {
            var ti = new TimeInterval();
            assert.equal(ti.addHours(-1).getHours(), -1);
         });
      });

      describe('.subHours()', function () {
         it('should return next hour', function () {
            var ti = new TimeInterval();
            assert.equal(ti.subHours(-1).getHours(), 1);
         });
      });

      describe('.getTotalHours()', function () {
         it('should return hours of all days', function () {
            assert.equal(ti.getTotalHours(), ti.getDays() * 24 + ti.getHours());
         });
      });

      describe('.addMinutes()', function () {
         it('should return previous minute', function () {
            var ti = new TimeInterval();
            assert.equal(ti.addMinutes(-1).getMinutes(), -1);
         });
      });

      describe('.subMinutes()', function () {
         it('should return next minute', function () {
            var ti = new TimeInterval();
            assert.equal(ti.subMinutes(-1).getMinutes(), 1);
         });
      });

      describe('.getTotalMinutes()', function () {
         it('should return minutes of all hours', function () {
            assert.equal(ti.getTotalMinutes(), ti.getTotalHours() * 60 + ti.getMinutes());
         });
      });

      describe('.addSeconds()', function () {
         it('should return previous second', function () {
            var ti = new TimeInterval();
            assert.equal(ti.addSeconds(-1).getSeconds(), -1);
         });
      });

      describe('.subSeconds()', function () {
         it('should return next second', function () {
            var ti = new TimeInterval();
            assert.equal(ti.subSeconds(-1).getSeconds(), 1);
         });
      });

      describe('.getTotalSeconds()', function () {
         it('should return seconds of all minutes', function () {
            assert.equal(ti.getTotalSeconds(), ti.getTotalMinutes() * 60 + ti.getSeconds());
         });
      });
      describe('.addMilliseconds()', function () {
         it('should return previous millisecond', function () {
            var ti = new TimeInterval();
            assert.equal(ti.addMilliseconds(-1).getMilliseconds(), -1);
         });
      });

      describe('.subMilliseconds()', function () {
         it('should return next millisecond', function () {
            var ti = new TimeInterval();
            assert.equal(ti.subMilliseconds(-1).getMilliseconds(), 1);
         });

         it('should revert initial value', function () {
            var ti = new TimeInterval('PT-0.01S'),
               sign = ti.toString();
            assert.equal(
               ti.addMilliseconds(1.5).subMilliseconds(1.5).toString(),
               sign
            );
         });
      });

      describe('.getTotalMilliseconds()', function () {
         it('should return millisecond of all seconds', function () {
            assert.equal(ti.getTotalMilliseconds(), ti.getTotalSeconds() * 1000 + ti.getMilliseconds());
         });
      });

      describe('.addToDate()', function () {
         it('should add value to Date', function () {
            var date = new Date(0),
               ti = new TimeInterval({days: 1});

            date = ti.addToDate(date);
            assert.equal(date.getTime(), ti.getTotalMilliseconds());
         });
      });

      describe('.subFromDate()', function () {
         it('should reduce value from Date', function () {
            var date = new Date(0),
               ti = new TimeInterval({days: 1});

            date = ti.subFromDate(date);
            assert.equal(date.getTime(), -ti.getTotalMilliseconds());
         });
      });

      describe('.calc()', function () {
         var ti1,
            ti2;

         beforeEach(function() {
            ti1 = new TimeInterval();
            ti2 = new TimeInterval(1);
         });

         afterEach(function() {
            ti1 = undefined;
            ti2 = undefined;
         });

         it('should return false for "=="', function () {
            assert.isFalse(ti1.calc('==', ti2));
         });

         it('should return true for "!="', function () {
            assert.isTrue(ti1.calc('!=', ti2));
         });

         it('should return false for "gt="', function () {
            assert.isFalse(ti1.calc('>=', ti2));
         });

         it('should return true for "lt="', function () {
            assert.isTrue(ti1.calc('<=', ti2));
         });

         it('should return false for "gt"', function () {
            assert.isFalse(ti1.calc('>', ti2));
         });

         it('should return true for "lt"', function () {
            assert.isTrue(ti1.calc('<', ti2));
         });

         it('should return valid value for "+"', function () {
            assert.equal(ti1.calc('+', ti2).toString(), 'P0DT0H0M0.001S');
         });

         it('should return valid value for "-"', function () {
            assert.equal(ti1.calc('-', ti2).toString(), 'P0DT0H0M-0.001S');
         });

         it('should return valid value for "+="', function () {
            assert.equal(ti1.calc('+=', ti2).toString(), 'P0DT0H0M0.001S');
         });

         it('should return valid value for "-="', function () {
            assert.equal(ti1.calc('-=', ti2).toString(), 'P0DT0H0M-0.001S');
         });

         it('throw an Error for invalid value in "=="', function () {
            var arr = [
                  {days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5},
                  [1, 2, 3, 4, 5],
                  'P1DT2H3M4.005S',
                  93784005,
                  true,
                  undefined,
                  null
               ];

            for (var i = 0; i < arr.length; i++) {
               assert.throws(function() {
                  ti.calc('==', arr[i]);
               });
            }
         });
      });

      describe('.clone()', function () {
         it('should return equal values', function () {
            var clone = ti.clone();
            assert.notEqual(ti, clone);
            assert.equal(ti.toString(), clone.toString());
         });
      });

      describe('.toObject()', function () {
         it('should return valid signature for given value', function () {
            assert.deepEqual(ti.toObject(), {days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5});
         });
      });

      describe('.toString()', function () {
         it('should return valid signature for given value', function () {
            assert.equal(ti.toString(), 'P1DT2H3M4.005S');
         });

         it('should return valid signature for null', function () {
            var ti = new TimeInterval();
            assert.equal(ti.set(null).toString(), 'P0DT0H0M0S');
         });

         it('should return valid signature for each value type', function () {
            var ti = new TimeInterval(),
               arr = [
                  [{days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5}, 'Object'],
                  [[1, 2, 3, 4, 5], 'Array'],
                  ['P1DT2H3M4.005S', 'String'],
                  [93784005, 'Number']
               ];

            for (var i = 0; i < arr.length; i++) {
               assert.equal(ti.set(arr[i][0]).toString(), 'P1DT2H3M4.005S', 'at ' + arr[i][1]);
            }
         });
      });


      describe('::toString()', function () {
         it('should return valid signature for each value type', function () {
            var ti = new TimeInterval(),
               arr = [
                  [{days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5}, 'Object'],
                  [[1, 2, 3, 4, 5], 'Array'],
                  ['P1DT2H3M4.005S', 'String'],
                  [93784005, 'Number']
               ];

            for (var i = 0; i < arr.length; i++) {
               assert.equal(TimeInterval.toString(arr[i][0]), 'P1DT2H3M4.005S', 'at ' + arr[i][1]);
            }
         });
      });

      describe('.valueOf()', function () {
         it('should be relation to toString', function () {
            assert.strictEqual(ti.valueOf(), ti.toString());
         });
      });
   });
});
