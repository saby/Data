import {assert} from 'chai';
import descriptor from 'Types/_entity/descriptor';
import extend = require('Core/core-extend');

describe('Types/_entity/descriptor', () => {
    it('should throw TypeError on call without arguments', () => {
        assert.throws(() => {
            descriptor();
        }, TypeError, 'You should specify one type descriptor at least');
    });

    it('should correctly validate null', () => {
        assert.isUndefined(descriptor(null)({ testProp: null }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not null value', () => {
        assert.instanceOf(descriptor(null)({ testProp: 0 }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate Boolean', () => {
        assert.isUndefined(descriptor(Boolean)({ testProp: false }, 'testProp', 'TestComponent'));
        assert.isUndefined(descriptor(Boolean)({ testProp: true }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not a Boolean value', () => {
        assert.instanceOf(descriptor(Boolean)({ testProp: null }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Boolean)({ testProp: 0 }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Boolean)({ testProp: '' }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Boolean)({ testProp: {} }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate Number', () => {
        assert.isUndefined(descriptor(Number)({ testProp: 1 }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not a Number value', () => {
        assert.instanceOf(descriptor(Number)({ testProp: null }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Number)({ testProp: true }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Number)({ testProp: '' }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Number)({ testProp: {} }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate String', () => {
        assert.isUndefined(descriptor(String)({ testProp: 'a' }, 'testProp', 'TestComponent'));
    });

    it('should correctly validate subclass of String', () => {
        class SubString extends String {
            constructor(str: string) {
                super(str);
            }
        }

        const inst = new SubString('a');
        assert.isUndefined(descriptor(String)({ testProp: inst }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not a String value', () => {
        assert.instanceOf(descriptor(String)({ testProp: null }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(String)({ testProp: false }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(String)({ testProp: 1 }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(String)({ testProp: {} }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate Object', () => {
        const inst = {};
        assert.isUndefined(descriptor(Object)({ testProp: inst }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not an Object value', () => {
        assert.instanceOf(descriptor(Object)({ testProp: null }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Object)({ testProp: false }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Object)({ testProp: 1 }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Object)({ testProp: '' }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate Array', () => {
        const inst = [];
        assert.isUndefined(descriptor(Array)({ testProp: inst }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for not an Array value', () => {
        assert.instanceOf(descriptor(Array)({ testProp: null }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Array)({ testProp: false }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Array)({ testProp: 1 }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Array)({ testProp: '' }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate class', () => {
        const IFace = {};
        const Module = extend.extend(Object, [IFace], {});
        const inst = new Module();

        assert.isUndefined(descriptor(IFace)({ testProp: inst }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError if value is not implements an interface', () => {
        const IFace = {};
        const Module = extend.extend(Object, {});
        const inst = new Module();

        assert.instanceOf(descriptor(IFace)({ testProp: inst }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should correctly validate composite value', () => {
        assert.isUndefined(descriptor(Boolean, Number, String)({ testProp: false }, 'testProp', 'TestComponent'));
        assert.isUndefined(descriptor(Boolean, Number, String)({ testProp: 0 }, 'testProp', 'TestComponent'));
        assert.isUndefined(descriptor(Boolean, Number, String)({ testProp: '' }, 'testProp', 'TestComponent'));

        assert.isUndefined(descriptor(Boolean, null)({ testProp: false }, 'testProp', 'TestComponent'));
        assert.isUndefined(descriptor(Boolean, null)({ testProp: null }, 'testProp', 'TestComponent'));
    });

    it('should return TypeError for invalid composite value', () => {
        assert.instanceOf(descriptor(Boolean, Number)({ testProp: '' }, 'testProp', 'TestComponent'), TypeError);
        assert.instanceOf(descriptor(Boolean, Number, String)({ testProp: {} }, 'testProp', 'TestComponent'), TypeError);
    });

    it('should not throw on undefined value with descriptor of any type', () => {
        // @ts-expect-error
        assert.isUndefined(descriptor(Boolean)({}, 'testProp', 'TestComponent'));
        // @ts-expect-error
        assert.isUndefined(descriptor(Number)({}, 'testProp', 'TestComponent'));
        // @ts-expect-error
        assert.isUndefined(descriptor(String)({}, 'testProp', 'TestComponent'));
        // @ts-expect-error
        assert.isUndefined(descriptor(Object)({}, 'testProp', 'TestComponent'));
        // @ts-expect-error
        assert.isUndefined(descriptor({})({}, 'testProp', 'TestComponent'));
    });

    describe('.required()', () => {
        it('should correctly validate required', () => {
            assert.isUndefined(descriptor(Boolean).required()({ testProp: false }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(Number).required()({ testProp: -1 }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(String).required()({ testProp: 'a' }, 'testProp', 'TestComponent'));
        });

        it('should return TypeError for undefined', () => {
            // @ts-expect-error
            assert.instanceOf(descriptor(Boolean).required()({}, 'testProp', 'TestComponent'), TypeError);
            // @ts-expect-error
            assert.instanceOf(descriptor(Number).required()({}, 'testProp', 'TestComponent'), TypeError);
            // @ts-expect-error
            assert.instanceOf(descriptor(String).required()({}, 'testProp', 'TestComponent'), TypeError);
        });
    });

    describe('.oneOf()', () => {
        it('should correctly validate oneOf', () => {
            assert.isUndefined(descriptor(Boolean).oneOf([true])({ testProp: true }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(Number).oneOf([1, 2, 3])({ testProp: 2 }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(String).oneOf(['a', 'b'])({ testProp: 'a' }, 'testProp', 'TestComponent'));
        });

        it('should not throw on undefined', () => {
            // @ts-expect-error
            assert.isUndefined(descriptor(Number).oneOf([0, 1])({}, 'testProp', 'TestComponent'));
        });

        it('should return TypeError for undefined but required', () => {
            // @ts-expect-error
            assert.instanceOf(descriptor(Number).oneOf([0, 1]).required()({}, 'testProp', 'TestComponent'), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Boolean).oneOf([true])({ testProp: false }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(Number).oneOf([1, 2])({ testProp: 0 }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(String).oneOf(['a'])({ testProp: 'b' }, 'testProp', 'TestComponent'), TypeError);
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
        it('should correctly validate not', () => {
            assert.isUndefined(descriptor(Boolean).not([true])({ testProp: false }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(Number).not([1, 2, 3])({ testProp: 0 }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(String).not(['a', 'b'])({ testProp: 'c' }, 'testProp', 'TestComponent'));
        });

        it('should not throw on undefined', () => {
            // @ts-expect-error
            assert.isUndefined(descriptor(Number).not([0, 1])({}, 'testProp', 'TestComponent'));
        });

        it('should return TypeError for undefined but required', () => {
            // @ts-expect-error
            assert.instanceOf(descriptor(Number).not([0, 1]).required()({}, 'testProp', 'TestComponent'), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Boolean).not([true])({ testProp: true }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(Number).not([1, 2])({ testProp: 1 }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(String).not(['a'])({ testProp: 'a' }, 'testProp', 'TestComponent'), TypeError);
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
        it('should correctly validate arrayOf', () => {
            assert.isUndefined(descriptor(Array).arrayOf(Boolean)({ testProp: [true] }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(Array).arrayOf(Number)({ testProp: [0, 1] }, 'testProp', 'TestComponent'));
            assert.isUndefined(descriptor(Array).arrayOf(String)({ testProp: ['a', 'b'] }, 'testProp', 'TestComponent'));
        });

        it('should not throw on undefined', () => {
            // @ts-expect-error
            assert.isUndefined(descriptor(Array).arrayOf(Number)({}, 'testProp', 'TestComponent'));
        });

        it('should return TypeError for undefined but required', () => {
            // @ts-expect-error
            assert.instanceOf(descriptor(Array).arrayOf(Number).required()({}, 'testProp', 'TestComponent'), TypeError);
        });

        it('should return TypeError for invalid value', () => {
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)({ testProp: true }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)({ testProp: 0 }, 'testProp', 'TestComponent'), TypeError);
            assert.instanceOf(descriptor(Array).arrayOf(Boolean)({ testProp: [0] }, 'testProp', 'TestComponent'), TypeError);
        });
    });
});
