/* global beforeEach, afterEach, describe, it, assert */
define([
   'Types/_collection/Enum'
], function(
   Enum
) {
   'use strict';

   Enum = Enum.default;

   describe('Types/_collection/Enum', function() {
      var getDict = function() {
            return ['one', 'two', 'three'];
         },
         getLocaleDict = function() {
            return ['uno', 'dos', 'tres'];
         },
         dict,
         localeDict,
         testEnum;

      beforeEach(function() {
         dict = getDict();
         localeDict = getLocaleDict();
         testEnum = new Enum({
            dictionary: dict,
            index: 1
         });
      });

      afterEach(function() {
         dict = undefined;
         testEnum = undefined;
      });

      describe('.constructor()', function() {
         it('should create Enum', function() {
            assert.instanceOf(testEnum, Enum);
         });

         it('should translate index to Number', function() {
            var testEnum = new Enum({
               dictionary: dict,
               index: '1'
            });
            assert.strictEqual(testEnum.get(), 1);
         });
      });

      describe('.get()', function() {
         it('should return the default index', function() {
            assert.equal(testEnum.get(), 1);
         });
      });

      describe('.set()', function() {
         it('should change current index', function() {
            testEnum.set(2);
            assert.equal(testEnum.get(), 2);
            assert.equal(testEnum.getAsValue(), 'three');
         });

         it('should change current index to null', function() {
            testEnum.set(null);
            assert.strictEqual(testEnum.get(), null);
            assert.isUndefined(testEnum.getAsValue());
         });

         it('should translate index to Number', function() {
            testEnum.set('2');
            assert.strictEqual(testEnum.get(), 2);
         });

         it('should translate index to Number even if dictonary has taken from object', function() {
             var inst = new Enum({
                 dictionary: {0: 'one', 1: 'two'}
             });
    
             inst.set('1');
             assert.strictEqual(inst.get(), 1);
         });

         it('should throw an exception if index is out of range', function() {
            assert.throws(function() {
               testEnum.set(569);
            });
         });

         it('should trigger "onChange" if value is changed', function() {
            var fired = {},
               handler = function(e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            assert.strictEqual(fired.index, 0);
            assert.strictEqual(fired.value, 'one');

            testEnum.unsubscribe('onChange', handler);
         });

         it('should trigger "onChange" if value is changed from null', function() {
            var fired = {},
               handler = function(e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.set(null);
            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            assert.strictEqual(fired.index, 0);
            assert.strictEqual(fired.value, 'one');

            testEnum.unsubscribe('onChange', handler);
         });

         it('should trigger "onChange" if value is changed to null', function() {
            var fired = {},
               handler = function(e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(null);
            assert.strictEqual(fired.index, null);
            assert.strictEqual(fired.value, undefined);

            testEnum.unsubscribe('onChange', handler);
         });

         it('should not trigger "onChange" if value is not changed', function() {
            var fired = {},
               handler = function(e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(1);
            assert.isUndefined(fired.index);
            assert.isUndefined(fired.value);

            testEnum.unsubscribe('onChange', handler);
         });
      });

      describe('.getAsValue()', function() {
         it('should return the default value', function() {
            assert.equal(testEnum.getAsValue(), 'two');
         });

         it('should return original value', function() {
            var testEnum = new Enum({
               dictionary: dict,
               localeDictionary: localeDict,
               index: 1
            });
            assert.equal(testEnum.getAsValue(), 'two');
         });

         it('should return localized value', function() {
            var testEnum = new Enum({
               dictionary: dict,
               localeDictionary: localeDict,
               index: 1
            });
            assert.equal(testEnum.getAsValue(true), 'dos');
         });
      });

      describe('.setByValue()', function() {
         it('should set original value', function() {
            testEnum.setByValue('one');
            assert.equal(testEnum.get(), 0);
            assert.equal(testEnum.getAsValue(), 'one');
         });

         it('should set localized value', function() {
            var testEnum = new Enum({
               dictionary: dict,
               localeDictionary: localeDict
            });

            testEnum.setByValue('uno', true);
            assert.equal(testEnum.getAsValue(), 'one');
         });

         it('should translate index to Number even if dictonary has taken from object', function() {
             var inst = new Enum({
                 dictionary: {0: 'one', 1: 'two'}
             });
    
             inst.setByValue('two');
             assert.strictEqual(inst.get(), 1);
         });

         it('should change current index to null', function() {
            testEnum.setByValue(null);
            assert.strictEqual(testEnum.get(), null);
            assert.isUndefined(testEnum.getAsValue());
         });

         it('should throw ReferenceError for not exists index', function() {
            assert.throws(function() {
               testEnum.setByValue('doesntExistingValue');
            }, ReferenceError);

            assert.throws(function() {
               testEnum.setByValue('doesntExistingValue', true);
            }, ReferenceError);
         });
      });

      describe('.produceInstance()', function() {
         it('should return instance of Enum', function() {
            assert.instanceOf(
               Enum.produceInstance(),
               Enum
            );
         });

         it('should return instance of Enum with dictionary returned by getDictionary()', function() {
            var options = {
                  format: {
                     getDictionary: function() {
                        return ['foo'];
                     }
                  }
               },
               testEnum = Enum.produceInstance(0, options);

            assert.strictEqual(testEnum.getAsValue(), 'foo');
         });

         it('should return instance of Enum with dictionary returned by meta.dictionary', function() {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo']
                     }
                  }
               },
               testEnum = Enum.produceInstance(0, options);

            assert.strictEqual(testEnum.getAsValue(), 'foo');
         });

         it('should return instance of Enum with localized dictionary returned by getLocaleDictionary()', function() {
            var options = {
                  format: {
                     getDictionary: function() {
                        return ['foo'];
                     },
                     getLocaleDictionary: function() {
                        return ['bar'];
                     }
                  }
               },
               testEnum = Enum.produceInstance(0, options);

            assert.strictEqual(testEnum.getAsValue(), 'foo');
            assert.strictEqual(testEnum.getAsValue(true), 'bar');
         });

         it('should return instance of Enum with localized dictionary returned by meta.localeDictionary', function() {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo'],
                        localeDictionary: ['bar']
                     }
                  }
               },
               testEnum = Enum.produceInstance(0, options);

            assert.strictEqual(testEnum.getAsValue(), 'foo');
            assert.strictEqual(testEnum.getAsValue(true), 'bar');
         });
      });

      describe('.isEqual()', function() {
         it('should return false for the different value', function() {
            var e = new Enum({
               dictionary: getDict(),
               index: 0
            });
            assert.isFalse(testEnum.isEqual(e));
         });

         it('should return false for not an Enum', function() {
            assert.isFalse(testEnum.isEqual());
            assert.isFalse(testEnum.isEqual(null));
            assert.isFalse(testEnum.isEqual(false));
            assert.isFalse(testEnum.isEqual(true));
            assert.isFalse(testEnum.isEqual(0));
            assert.isFalse(testEnum.isEqual(1));
            assert.isFalse(testEnum.isEqual({}));
            assert.isFalse(testEnum.isEqual([]));
         });
      });

      describe('.valueOf()', function() {
         it('should return the current index', function() {
            assert.equal(0 + testEnum, 1);
         });
      });

      describe('.toString()', function() {
         it('should return the current value', function() {
            assert.equal(testEnum.toString(), 'two');
         });

         it('should return the current value if Enum used as string', function() {
            assert.equal(''.concat(testEnum), 'two');
         });

         it('should return empty string for null', function() {
            var testEnum = new Enum({
               dictionary: {null: null, 0: 'one'}
            });
            assert.isNull(testEnum.getAsValue());
            assert.strictEqual(testEnum.toString(), '');
         });

         it('should return empty string for undefined', function() {
            var testEnum = new Enum({
               dictionary: {0: undefined, 1: 'foo'},
               index: 0
            });
            assert.isUndefined(testEnum.getAsValue());
            assert.strictEqual(testEnum.toString(), '');
         });
      });

      describe('.toJson()', function() {
         it('should serialize to json', function() {
            var testEnum = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });
            assert.doesNotThrow(function() {
               JSON.stringify(testEnum);
            });
         });
      });

      describe('.clone()', function() {
         it('should clone value', function() {
            var clone = testEnum.clone();
            assert.notEqual(clone, testEnum);
            assert.isTrue(clone.isEqual(testEnum));
         });
      });
   });
});
