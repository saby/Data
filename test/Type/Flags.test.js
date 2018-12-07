/* global beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/Flags'
], function(
   Flags
) {
   'use strict';

   Flags = Flags.default;

   describe('Types/Types/Flags', function() {
      var getDict = function() {
            return ['one', 'two', 'three'];
         },
         getLocaleDict = function() {
            return ['uno', 'dos', 'tres'];
         },
         getValues = function() {
            return [true, false, null];
         },
         dict,
         localeDict,
         values,
         testFlags,
         flagsInterval;

      beforeEach(function() {
         dict = getDict();
         localeDict = getLocaleDict();
         values = getValues();
         testFlags = new Flags({
            dictionary: dict,
            values: values
         });
         flagsInterval = new Flags({
            dictionary: {1: 'one', 10: 'two', 16: 'three'},
            values: [true, false, null]
         });
      });

      afterEach(function() {
         dict = undefined;
         values = undefined;
         testFlags = undefined;
      });

      describe('.constructor()', function() {
         it('should create Flags', function() {
            assert.instanceOf(testFlags, Flags);
         });
      });

      describe('.get()', function() {
         it('should return value for the each flag', function() {
            assert.isTrue(testFlags.get('one'));
            assert.isFalse(testFlags.get('two'));
            assert.isNull(testFlags.get('three'));
         });

         it('should return value for the each localized flag', function() {
            testFlags = new Flags({
               dictionary: dict,
               localeDictionary: localeDict,
               values: values
            });

            assert.isTrue(testFlags.get('uno', true));
            assert.isFalse(testFlags.get('dos', true));
            assert.isNull(testFlags.get('tres', true));
         });

         it('should return value for the each flag with intervals', function() {
            assert.isTrue(flagsInterval.get('one'));
            assert.isFalse(flagsInterval.get('two'));
            assert.isNull(flagsInterval.get('three'));
         });

      });

      describe('.set()', function() {
         it('should set the flag value', function() {
            testFlags.set('two', true);
            assert.isTrue(testFlags.get('two'));
            assert.isTrue(testFlags.getByIndex(1));

            testFlags.set('two', null);
            assert.isNull(testFlags.get('two'));
            assert.isNull(testFlags.getByIndex(1));
         });

         it('should set localized flag value', function() {
            testFlags = new Flags({
               dictionary: dict,
               localeDictionary: localeDict,
               values: values
            });

            testFlags.set('dos', true, true);
            assert.isTrue(testFlags.get('two'));
            assert.isTrue(testFlags.getByIndex(1));

            testFlags.set('dos', null, true);
            assert.isNull(testFlags.get('two'));
            assert.isNull(testFlags.getByIndex(1));
         });

         it('should change the flags value with intervals', function() {
            flagsInterval.set('two', true);
            assert.isTrue(flagsInterval.get('two'));
            assert.isTrue(flagsInterval.getByIndex(10));

            flagsInterval.set('two', null);
            assert.isNull(flagsInterval.get('two'));
            assert.isNull(flagsInterval.getByIndex(10));
         });

         it('should throw an error for undefined value', function() {
            assert.throws(function() {
               testFlags.set('dev', true);
            });
         });

         it('should trigger "onChange" if flag changed', function() {
            var fired = {},
               handler = function(e, name, index, value) {
                  fired.name = name;
                  fired.index = index;
                  fired.value = value;
               };

            testFlags.subscribe('onChange', handler);
            testFlags.set('one', false);
            testFlags.unsubscribe('onChange', handler);

            assert.strictEqual(fired.name, 'one');
            assert.strictEqual(fired.index, 0);
            assert.isFalse(fired.value);
         });

         it('should trigger "onChange" if with valid index', function() {
            var fired = {};
            var handler = function(e, name, index) {
               fired.name = name;
               fired.index = index;
            };

            flagsInterval.subscribe('onChange', handler);
            flagsInterval.set('two', true);
            flagsInterval.unsubscribe('onChange', handler);

            assert.strictEqual(fired.name, 'two');
            assert.strictEqual(fired.index, '10');
         });

         it('should not trigger "onChange" if flag not changed', function() {
            var fired = {},
               handler = function(e, name, index, value) {
                  fired.name = name;
                  fired.index = index;
                  fired.value = value;
               };

            testFlags.subscribe('onChange', handler);
            testFlags.set('one', true);
            testFlags.unsubscribe('onChange', handler);

            assert.isUndefined(fired.name);
            assert.isUndefined(fired.index);
            assert.isUndefined(fired.value);
         });
      });

      describe('.getByIndex()', function() {
         it('should return flags value by index', function() {
            assert.isTrue(testFlags.getByIndex(0));
            assert.isFalse(testFlags.getByIndex(1));
            assert.isNull(testFlags.getByIndex(2));
         });
      });

      describe('.setByIndex()', function() {
         it('should change the flags value by index', function() {
            testFlags.setByIndex(1, null);
            assert.isNull(testFlags.get('two'));
            assert.isNull(testFlags.getByIndex(1));

            testFlags.setByIndex(2, true);
            assert.isTrue(testFlags.get('three'));
            assert.isTrue(testFlags.getByIndex(2));
         });

         it('should throw an error for undefined index', function() {
            assert.throws(function() {
               testFlags.setByIndex(400, true);
            });
         });

         it('should trigger "onChange" if flag changed', function() {
            var fired = {},
               handler = function(e, name, index, value) {
                  fired.name = name;
                  fired.index = index;
                  fired.value = value;
               };

            testFlags.subscribe('onChange', handler);
            testFlags.setByIndex(0, false);
            testFlags.unsubscribe('onChange', handler);

            assert.strictEqual(fired.name, 'one');
            assert.strictEqual(fired.index, 0);
            assert.isFalse(fired.value);
         });

         it('should not trigger "onChange" if flag not changed', function() {
            var fired = {},
               handler = function(e, name, index, value) {
                  fired.name = name;
                  fired.index = index;
                  fired.value = value;
               };

            testFlags.subscribe('onChange', handler);
            testFlags.setByIndex(0, true);
            testFlags.unsubscribe('onChange', handler);

            assert.isUndefined(fired.name);
            assert.isUndefined(fired.index);
            assert.isUndefined(fired.value);
         });
      });

      describe('.setAll()', function() {
         it('should set false to all flags', function() {
            testFlags.setFalseAll();
            testFlags.each(function(name) {
               assert.isFalse(testFlags.get(name));
            });
         });

         it('should set true to all flags', function() {
            testFlags.setTrueAll();
            testFlags.each(function(name) {
               assert.isTrue(testFlags.get(name));
            });
         });

         it('should set null to all flags', function() {
            testFlags.setNullAll();
            testFlags.each(function(name) {
               assert.isNull(testFlags.get(name));
            });
         });

         it('should trigger "onChange"', function() {
            var fired = [],
               handler = function(e, name, index, value) {
                  fired.push({
                     name: name,
                     index: index,
                     value: value
                  });
               };

            testFlags.subscribe('onChange', handler);
            testFlags.setFalseAll();
            testFlags.unsubscribe('onChange', handler);

            assert.strictEqual(fired.length, 2);

            assert.strictEqual(fired[0].name, 'one');
            assert.strictEqual(fired[0].index, 0);
            assert.isFalse(fired[0].value);

            assert.strictEqual(fired[1].name, 'three');
            assert.strictEqual(fired[1].index, 2);
            assert.isFalse(fired[1].value);
         });

         it('should set false to all flags with intervals', function() {
            flagsInterval.setFalseAll();
            flagsInterval.each(function(name) {
               assert.isFalse(flagsInterval.get(name));
            });
         });
      });

      describe('.produceInstance()', function() {
         it('should return instance of Flags', function() {
            assert.instanceOf(
               Flags.produceInstance(),
               Flags
            );
         });

         it('should return instance of Flags with dictionary returned by getDictionary()', function() {
            var options = {
                  format: {
                     getDictionary: function() {
                        return ['foo'];
                     }
                  }
               },
               testFlags = Flags.produceInstance([true], options);

            assert.strictEqual(testFlags.get('foo'), true);
         });

         it('should return instance of Flags with dictionary returned by meta.dictionary', function() {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo']
                     }
                  }
               },
               testFlags = Flags.produceInstance([true], options);

            assert.strictEqual(testFlags.get('foo'), true);
         });

         it('should return instance of Flags with localized dictionary returned by meta.localeDictionary', function() {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo'],
                        localeDictionary: ['bar']
                     }
                  }
               },
               testFlags = Flags.produceInstance([true], options);

            assert.strictEqual(testFlags.get('foo'), true);
            assert.strictEqual(testFlags.get('bar', true), true);
         });
      });

      describe('.isEqual()', function() {
         it('should return true for the same dictionary and values', function() {
            var e = new Flags({
               dictionary: dict,
               values: values
            });
            assert.isTrue(testFlags.isEqual(e));
         });

         it('should return true for the equal dictionary and values', function() {
            var e = new Flags({
               dictionary: getDict(),
               values: getValues()
            });
            assert.isTrue(testFlags.isEqual(e));
         });

         it('should return false for the different values', function() {
            var values = getValues();
            values[1] = null;
            var e = new Flags({
               dictionary: dict,
               values: values
            });
            assert.isFalse(testFlags.isEqual(e));
         });

         it('should return false for not an Flags', function() {
            assert.isFalse(testFlags.isEqual());
            assert.isFalse(testFlags.isEqual(null));
            assert.isFalse(testFlags.isEqual(false));
            assert.isFalse(testFlags.isEqual(true));
            assert.isFalse(testFlags.isEqual(0));
            assert.isFalse(testFlags.isEqual(1));
            assert.isFalse(testFlags.isEqual({}));
            assert.isFalse(testFlags.isEqual([]));
         });
      });

      describe('.toString()', function() {
         it('should return the default signature', function() {
            assert.equal(testFlags.toString(), '[true,false,null]');
         });
         it('should return the default signature if Flags used as string', function() {
            assert.equal(testFlags + '', '[true,false,null]');
         });
      });

      describe('.toJson()', function() {
         it('should serialize to json', function() {
            var testFlags = new Flags({
               dictionary: getDict(),
               values: getValues()
            });
            assert.doesNotThrow(function() {
               JSON.stringify(testFlags);
            });
         });
      });

      describe('.clone()', function() {
         it('should clone value', function() {
            var clone = testFlags.clone();
            assert.notEqual(clone, testFlags);
            assert.isTrue(clone.isEqual(testFlags));
         });
      });
   });
});
