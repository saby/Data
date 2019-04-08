/* global define, describe, context, before, after, beforeEach, afterEach, it, assert */
define([
   'Types/formatter',
   // 'WS.Data/Entity/Model',
   // 'WS.Data/Collection/List',
   'Env/Env'
   //'Data/_type/adapter/Json'
], function (
   formatter,
   //Model,
   //List
) {
   'use strict';

   function getUnserializableMock() {
      var Mock = function (state) {
         this.state = state;
      };
      Mock.fromJSON = function (state) {
         return new Mock(state);
      };
      return Mock;
   }

   var f = function () {
   };
   f.toJSON = function () {
      return 'isJSON'
   };

   var serializer,
      getSerializedObj = function () {
         return {
            a: undefined,
            b: null,
            c: false,
            d: 0,
            e: 1,
            f: [],
            g: [undefined, 1, 2],
            h: {
               ha: undefined,
               hb: Infinity,
               hc: -Infinity
            },
            j: NaN
         };
      },
      getSerializedSample = function () {
         return '{"a":{"$serialized$":"undef"},"b":null,"c":false,"d":0,"e":1,"f":[],"g":[{"$serialized$":"undef"},1,2],"h":{"ha":{"$serialized$":"undef"},"hb":{"$serialized$":"+inf"},"hc":{"$serialized$":"-inf"}},"j":{"$serialized$":"NaN"}}';
      };

   describe('Types/_formatter/jsonReplacer', function () {

      it('should serialize Infinity', function () {
         var result = formatter.jsonReplacer('i', Infinity);
         assert.strictEqual(result.$serialized$, '+inf');
      });

      it('should serialize -Infinity', function () {
         var result = formatter.jsonReplacer('i', -Infinity);
         assert.strictEqual(result.$serialized$, '-inf');
      });

      it('should serialize undefined', function () {
         var result = formatter.jsonReplacer('u', undefined);
         assert.strictEqual(result.$serialized$, 'undef');
      });

      it('should serialize NaN', function () {
         var result = formatter.jsonReplacer('n', NaN);
         assert.strictEqual(result.$serialized$, 'NaN');
      });

      it('should serialize undefined if it\'s an array element', function () {
         var result = formatter.jsonReplacer(1, undefined);
         assert.strictEqual(result.$serialized$, 'undef');
      });

      it('should return unchanged', function () {
         assert.strictEqual(formatter.jsonReplacer('a', null), null);
         assert.strictEqual(formatter.jsonReplacer('a', 1), 1);
         assert.strictEqual(formatter.jsonReplacer('a', 'b'), 'b');
         var arr = [];
         assert.strictEqual(formatter.jsonReplacer('a', arr), arr);
         var obj = {};
         assert.strictEqual(formatter.jsonReplacer('a', obj), obj);
      });

      context('when used with JSON.stringify() as jsonReplacer', function () {
         it('should work properly with deep structures', function () {
            var string = JSON.stringify(getSerializedObj(), formatter.jsonReplacer);
            assert.strictEqual(string, getSerializedSample());
         });

         it.skip('should work with serializable instance', function () {
            var model = new Model(),
               plainObj = JSON.parse(JSON.stringify(model, formatter.jsonReplacer));
            assert.strictEqual(plainObj.$serialized$, 'inst');
            assert.strictEqual(plainObj.module, 'WS.Data/Entity/Model');
         });

         it.skip('should work with serializable instance in deep structures', function () {
            var model = new Model(),
               plainObj = JSON.parse(JSON.stringify({
                  a: {
                     b: [model]
                  }
               }, formatter.jsonReplacer));
            assert.strictEqual(plainObj.a.b[0].$serialized$, 'inst');
            assert.strictEqual(plainObj.a.b[0].module, 'WS.Data/Entity/Model');
         });

         it('should serialize string if it contents function', function () {
            var plainObj = JSON.parse(JSON.stringify({
                  a: 'functionsdf'
               }, formatter.jsonReplacer), formatter.jsonReviver);
            assert.strictEqual(plainObj.a, 'functionsdf');
         });

         it.skip('should create links for duplicates', function () {
            var modelA = new Model(),
               modelB = new Model(),
               json = JSON.stringify({
                  a: modelA,
                  b: modelB,
                  c: modelA,
                  d: {
                     e: [modelB]
                  }
               }, formatter.jsonReplacer),
               plainObj = JSON.parse(json);

            assert.equal(plainObj.c.$serialized$, 'inst');
            assert.equal(plainObj.c.id, plainObj.a.id);

            assert.equal(plainObj.d.e[0].$serialized$, 'inst');
            assert.equal(plainObj.d.e[0].id, plainObj.b.id);
         });
      });
   });

   describe('Types/_formatter/jsonReviver', function () {
      it('should deserialize a date', function () {
         var date = new Date('1995-12-17T01:02:03'),
            dateStr = date.toJSON(),
            result = formatter.jsonReviver('', dateStr);
         assert.instanceOf(result, Date);
         assert.strictEqual(result.getTime(), date.getTime());
      });

      it('should deserialize Infinity', function () {
         var result = formatter.jsonReviver(
            'i',
            formatter.jsonReviver('i', Infinity)
         );
         assert.strictEqual(result, Infinity);
      });

      it('should deserialize -Infinity', function () {
         var result = formatter.jsonReviver(
            'i',
            formatter.jsonReviver('i', -Infinity)
         );
         assert.strictEqual(result, -Infinity);
      });

      it('should deserialize NaN', function () {
         var result = formatter.jsonReviver(
            'n',
            formatter.jsonReviver('n', NaN)
         );
         assert.isNaN(result);
      });

      it('should deserialize NaN using JSON.parse', function () {
         var serialized = JSON.stringify(NaN, formatter.jsonReplacer);
         var deserialized = JSON.parse(serialized, formatter.jsonReviver);
         assert.isNaN(deserialized);
      });

      it('should deserialize undefined if it\'s an array element', function () {
         var result = formatter.jsonReviver(
            1,
            formatter.jsonReviver(1, undefined)
         );
         assert.strictEqual(result, undefined);
      });

      it('should return unchanged', function () {
         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               undefined
            ),
            undefined
         );

         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               null
            ),
            null
         );

         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               1
            ),
            1
         );

         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               'b'
            ),
            'b'
         );

         var arr = [];
         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               arr
            ),
            arr
         );

         var obj = {};
         assert.strictEqual(
            formatter.jsonReviver(
               'a',
               obj
            ),
            obj
         );
      });

      context('when used with JSON.parse() as jsonReviver', function () {
         it('should work properly with deep structures', function () {
            var obj = JSON.parse(getSerializedSample(), formatter.jsonReviver),
               expectObj = getSerializedObj();

            //undefined is not serializable
            delete expectObj.a;
            delete expectObj.h.ha;

            //Chrome не создает undfined элемент, хотя индекс под него зарезерирован
            obj.g[0] = undefined;

            assert.notEqual(expectObj, obj);
            assert.deepEqual(expectObj, obj);
         });

         it.skip('should create same instances for equal serialized instances of SerializableMixin', function () {
            var modelA = new Model(),
               modelB = new Model(),
               listA = new List({
                  items: [modelA, modelB]
               }),
               listB = new List(),
               json = JSON.stringify({
                     a: modelA,
                     b: modelB,
                     c: modelA,
                     d: listA,
                     e: {
                        a: [modelB],
                        b: listA,
                        c: listB,
                        d: [listB, listA]
                     }
                  },
                  formatter.jsonReplacer
               ),
               obj = JSON.parse(json, formatter.jsonReviver);

            assert.strictEqual(obj.a, obj.c);
            assert.strictEqual(obj.b, obj.e.a[0]);

            assert.strictEqual(obj.d, obj.e.b);
            assert.strictEqual(obj.d, obj.e.d[1]);
            assert.strictEqual(obj.e.b, obj.e.d[1]);
            assert.strictEqual(obj.e.c, obj.e.d[0]);

            assert.strictEqual(obj.a, obj.d.at(0));
            assert.strictEqual(obj.b, obj.d.at(1));
         });
      });

   });


});
