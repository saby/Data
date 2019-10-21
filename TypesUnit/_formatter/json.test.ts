import {assert} from 'chai';
import jsonReplacer from 'Types/_formatter/jsonReplacer';
import jsonReviver from 'Types/_formatter/jsonReviver';
import 'Env/Env';

const getSerializedObj = () => {
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
            hc: -Infinity,
        },
        j: NaN,
    };
};

const getSerializedSample = () => {
    return '{"a":{"$serialized$":"undef"},"b":null,"c":false,"d":0,"e":1,"f":[],"g":[{"$serialized$":"undef"},1,2],"h":{"ha":{"$serialized$":"undef"},"hb":{"$serialized$":"+inf"},"hc":{"$serialized$":"-inf"}},"j":{"$serialized$":"NaN"}}';
};

describe('Types/_formatter/jsonReplacer', () => {
    it('should serialize Infinity', () => {
       const result = jsonReplacer('i', Infinity);
       assert.strictEqual(result.$serialized$, '+inf');
    });

    it('should serialize -Infinity', () => {
       const result = jsonReplacer('i', -Infinity);
       assert.strictEqual(result.$serialized$, '-inf');
    });

    it('should serialize undefined', () => {
       const result = jsonReplacer('u', undefined);
       assert.strictEqual(result.$serialized$, 'undef');
    });

    it('should serialize NaN', () => {
       const result = jsonReplacer('n', NaN);
       assert.strictEqual(result.$serialized$, 'NaN');
    });

    it('should serialize undefined if it\'s an array element', () => {
       const result = jsonReplacer(1, undefined);
       assert.strictEqual(result.$serialized$, 'undef');
    });

    it('should return unchanged', () => {
       assert.strictEqual(jsonReplacer('a', null), null);
       assert.strictEqual(jsonReplacer('a', 1), 1);
       assert.strictEqual(jsonReplacer('a', 'b'), 'b');
       const arr = [];
       assert.strictEqual(jsonReplacer('a', arr), arr);
       const obj = {};
       assert.strictEqual(jsonReplacer('a', obj), obj);
    });

    context('when used with JSON.stringify() as jsonReplacer', () => {
       it('should work properly with deep structures', () => {
          const str = JSON.stringify(getSerializedObj(), jsonReplacer);
          assert.strictEqual(str, getSerializedSample());
       });

       it('should serialize string if it contents function', () => {
          const plainObj = JSON.parse(JSON.stringify({
              a: 'functionsdf',
          }, jsonReplacer), jsonReviver);
          assert.strictEqual(plainObj.a, 'functionsdf');
       });
    });
 });

describe('Types/_formatter/jsonReviver', () => {
    it('should deserialize a date', () => {
       const date = new Date('1995-12-17T01:02:03');
       const dateStr = date.toJSON();
       const result = jsonReviver('', dateStr);
       assert.instanceOf(result, Date);
       assert.strictEqual(result.getTime(), date.getTime());
    });

    it('should deserialize Infinity', () => {
       const result = jsonReviver(
          'i',
          jsonReviver('i', Infinity),
       );
       assert.strictEqual(result, Infinity);
    });

    it('should deserialize -Infinity', () => {
       const result = jsonReviver(
          'i',
          jsonReviver('i', -Infinity),
       );
       assert.strictEqual(result, -Infinity);
    });

    it('should deserialize NaN', () => {
       const result = jsonReviver(
          'n',
          jsonReviver('n', NaN),
       );
       assert.isNaN(result);
    });

    it('should deserialize NaN using JSON.parse', () => {
       const serialized = JSON.stringify(NaN, jsonReplacer);
       const deserialized = JSON.parse(serialized, jsonReviver);
       assert.isNaN(deserialized);
    });

    it('should deserialize undefined if it\'s an array element', () => {
       const result = jsonReviver(
          1,
          jsonReviver(1, undefined),
       );
       assert.strictEqual(result, undefined);
    });

    it('should return unchanged', () => {
       assert.strictEqual(
          jsonReviver(
             'a',
             undefined,
          ),
          undefined,
       );

       assert.strictEqual(
          jsonReviver(
             'a',
             null,
          ),
          null,
       );

       assert.strictEqual(
          jsonReviver(
             'a',
             1,
          ),
          1,
       );

       assert.strictEqual(
          jsonReviver(
             'a',
             'b',
          ),
          'b',
       );

       const arr = [];
       assert.strictEqual(
          jsonReviver(
             'a',
             arr,
          ),
          arr,
       );

       const obj = {};
       assert.strictEqual(
          jsonReviver(
             'a',
             obj,
          ),
          obj,
       );
    });

    context('when used with JSON.parse() as jsonReviver', () => {
       it('should work properly with deep structures', () => {
          const obj = JSON.parse(getSerializedSample(), jsonReviver);
          const expectObj = getSerializedObj();

          // undefined is not serializable
          delete expectObj.a;
          delete expectObj.h.ha;

          // Chrome не создает undfined элемент, хотя индекс под него зарезерирован
          obj.g[0] = undefined;

          assert.notEqual(expectObj, obj);
          assert.deepEqual(expectObj, obj);
       });

    });
});
