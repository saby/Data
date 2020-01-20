import {assert} from 'chai';
import descriptor from 'Types/_entity/descriptor';
import extend = require('Core/core-extend');

describe('Types/_entity/descriptor', () => {
    it('should throw TypeError on call without arguments', () => {
        assert.throws(() => {
            descriptor();
        }, TypeError);
    });

    it('should return Function', () => {
        assert.instanceOf(descriptor(Number), Function);
    });

    it('should return Function on composite type', () => {
        assert.instanceOf(descriptor(Number, String), Function);
    });

    it('should return valid null value', () => {
        assert.strictEqual(descriptor(null)(null), null);
    });

    it('should return TypeError for not null value', () => {
        assert.instanceOf(descriptor(null)(0), TypeError);
    });

    it('should return valid Boolean value', () => {
        assert.strictEqual(descriptor(Boolean)(false), false);
    });

    it('should return TypeError for not a Boolean value', () => {
        assert.instanceOf(descriptor(Boolean)(null), TypeError);
        assert.instanceOf(descriptor(Boolean)(0), TypeError);
        assert.instanceOf(descriptor(Boolean)(''), TypeError);
        assert.instanceOf(descriptor(Boolean)({}), TypeError);
    });

    it('should return valid Number value', () => {
        assert.strictEqual(descriptor(Number)(1), 1);
    });

    it('should return TypeError for not a Number value', () => {
        assert.instanceOf(descriptor(Number)(null), TypeError);
        assert.instanceOf(descriptor(Number)(true), TypeError);
        assert.instanceOf(descriptor(Number)(''), TypeError);
        assert.instanceOf(descriptor(Number)({}), TypeError);
    });

    it('should return valid String value', () => {
        assert.strictEqual(descriptor(String)('a'), 'a');
    });

    it('should return valid subclass of String value', () => {
        class SubString extends String {
            constructor(str: string) {
                super(str);
            }
        }

        const inst = new SubString('a');
        assert.strictEqual(descriptor(String)(inst), inst);
    });

    it('should return TypeError for not a String value', () => {
        assert.instanceOf(descriptor(String)(null), TypeError);
        assert.instanceOf(descriptor(String)(false), TypeError);
        assert.instanceOf(descriptor(String)(1), TypeError);
        assert.instanceOf(descriptor(String)({}), TypeError);
    });

    it('should return valid Object value', () => {
        const inst = {};
        assert.equal(descriptor(Object)(inst), inst);
    });

    it('should return TypeError for not an Object value', () => {
        assert.instanceOf(descriptor(Object)(null), TypeError);
        assert.instanceOf(descriptor(Object)(false), TypeError);
        assert.instanceOf(descriptor(Object)(1), TypeError);
        assert.instanceOf(descriptor(Object)(''), TypeError);
    });

    it('should return valid Array value', () => {
        const inst = [];
        assert.equal(descriptor(Array)(inst), inst);
    });

    it('should return TypeError for not an Array value', () => {
        assert.instanceOf(descriptor(Array)(null), TypeError);
        assert.instanceOf(descriptor(Array)(false), TypeError);
        assert.instanceOf(descriptor(Array)(1), TypeError);
        assert.instanceOf(descriptor(Array)(''), TypeError);
    });

    it('should return value that implements an interface', () => {
        const IFace = {};
        const Module = extend.extend(Object, [IFace], {});
        const inst = new Module();

        assert.equal(descriptor(IFace)(inst), inst);
    });

    it('should return TypeError if value is not implements an interface', () => {
        const IFace = {};
        const Module = extend.extend(Object, {});
        const inst = new Module();

        assert.instanceOf(descriptor(IFace)(inst), TypeError);
    });

    it('should return valid composite value', () => {
        assert.strictEqual(descriptor(Boolean, Number, String)(false), false);
        assert.strictEqual(descriptor(Boolean, Number, String)(0), 0);
        assert.strictEqual(descriptor(Boolean, Number, String)(''), '');

        assert.strictEqual(descriptor(Boolean, null)(false), false);
        assert.strictEqual(descriptor(Boolean, null)(null), null);
    });

    it('should return TypeError for invalid composite value', () => {
        assert.instanceOf(descriptor(Boolean, Number)(''), TypeError);
        assert.instanceOf(descriptor(Boolean, Number, String)({}), TypeError);
    });

    it('should return undefined for undefined value with any type', () => {
        assert.isUndefined(descriptor(Boolean)(undefined));
        assert.isUndefined(descriptor(Number)(undefined));
        assert.isUndefined(descriptor(String)(undefined));
        assert.isUndefined(descriptor(Object)(undefined));
        assert.isUndefined(descriptor({})(undefined));
    });

    describe('.required()', () => {
        it('should return valid value', () => {
            assert.equal(descriptor(Boolean).required()(false), false);
            assert.equal(descriptor(Number).required()(-1), -1);
            assert.equal(descriptor(String).required()('a'), 'a');
        });

        it('should return TypeError for undefined', () => {
            assert.instanceOf(descriptor(Boolean).required()(undefined), TypeError);
            assert.instanceOf(descriptor(Number).required()(undefined), TypeError);
            assert.instanceOf(descriptor(String).required()(undefined), TypeError);
        });
    });

    describe('.oneOf()', () => {
        it('should return valid value', () => {
            assert.equal(descriptor(Boolean).oneOf([true])(true), true);
            assert.equal(descriptor(Number).oneOf([1, 2, 3])(2), 2);
            assert.equal(descriptor(String).oneOf(['a', 'b'])('a'), 'a');
        });

        it('should return undefined as valid value', () => {
            assert.isUndefined(descriptor(Number).oneOf([0, 1])(undefined));
        });

        it('should return TypeError for undefined but required', () => {
            assert.instanceOf(descriptor(Number).oneOf([0, 1]).required()(undefined), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Boolean).oneOf([true])(false), TypeError);
            assert.instanceOf(descriptor(Number).oneOf([1, 2])(0), TypeError);
            assert.instanceOf(descriptor(String).oneOf(['a'])('b'), TypeError);
        });

        it('should throw TypeError in invalid values argument', () => {
            assert.throws(() => {
                descriptor(Boolean).oneOf(undefined);
            }, TypeError);

            assert.throws(() => {
                descriptor(Boolean).oneOf(null);
            }, TypeError);

            assert.throws(() => {
                descriptor(Boolean).oneOf({} as undefined);
            }, TypeError);
        });
    });

    describe('.not()', () => {
        it('should return valid value', () => {
            assert.equal(descriptor(Boolean).not([true])(false), false);
            assert.equal(descriptor(Number).not([1, 2, 3])(0), 0);
            assert.equal(descriptor(String).not(['a', 'b'])('c'), 'c');
        });

        it('should return undefined as valid value', () => {
            assert.isUndefined(descriptor(Number).not([0, 1])(undefined));
        });

        it('should return TypeError for undefined but required', () => {
            assert.instanceOf(descriptor(Number).not([0, 1]).required()(undefined), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Boolean).not([true])(true), TypeError);
            assert.instanceOf(descriptor(Number).not([1, 2])(1), TypeError);
            assert.instanceOf(descriptor(String).not(['a'])('a'), TypeError);
        });

        it('should throw TypeError in invalid values argument', () => {
            assert.throws(() => {
                descriptor(Boolean).not(undefined);
            }, TypeError);

            assert.throws(() => {
                descriptor(Boolean).not(null);
            }, TypeError);

            assert.throws(() => {
                descriptor(Boolean).not({} as undefined);
            }, TypeError);
        });
    });

    describe('.arrayOf()', () => {
        it('should return valid value', () => {
            assert.deepEqual(descriptor(Array).arrayOf(Boolean)([true]), [true]);
            assert.deepEqual(descriptor(Array).arrayOf(Number)([0, 1]), [0, 1]);
            assert.deepEqual(descriptor(Array).arrayOf(String)(['a', 'b']), ['a', 'b']);
        });

        it('should return undefined as valid value', () => {
            assert.isUndefined(descriptor(Array).arrayOf(Number)(undefined));
        });

        it('should return TypeError for undefined but required', () => {
            assert.instanceOf(descriptor(Array).arrayOf(Number).required()(undefined), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)(true), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)(0), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)([0]), TypeError);
        });
    });
});
