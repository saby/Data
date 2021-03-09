/* global define, beforeEach, afterEach, describe, context, it, assert */
import {assert} from 'chai';
import MapEnumerator from 'Types/_collection/enumerator/Mapwise';
import Map from 'Types/_shim/Map';

describe('Types/_collection/enumerator/Mapwise', () => {
    let keys;
    let values;
    let items;

    beforeEach(() => {
        keys = ['one', 'two'];
        values = [1, 2];
        items = new Map(keys.map((key, index) => {
            return  [key, values[index]];
        }));
    });

    afterEach(() => {
        items = undefined;
    });

    describe('.getCurrent()', () => {
        it('should return undefined by default', () => {
            const enumerator = new MapEnumerator(new Map());
            assert.isUndefined(enumerator.getCurrent());
        });

        it('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                assert.strictEqual(values[index], enumerator.getCurrent());
                index++;
            }
            assert.strictEqual(values[values.length - 1], enumerator.getCurrent());
        });
    });

    describe('.getCurrentIndex()', () => {
        it('should return undefined by default', () => {
            const enumerator = new MapEnumerator(new Map());
            assert.isUndefined(enumerator.getCurrentIndex());
        });

        it('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                assert.strictEqual(keys[index], enumerator.getCurrentIndex());
                index++;
            }
            assert.strictEqual(keys[keys.length - 1], enumerator.getCurrentIndex());
        });
    });

    describe('.moveNext()', () => {
        it('should return false for empty', () => {
            const enumerator = new MapEnumerator(new Map());

            assert.isFalse(enumerator.moveNext());
        });

        it('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                index++;
            }
            assert.strictEqual(index, items.size);
        });
    });

    describe('.reset()', () => {
        it('should set current to undefined', () => {
            const enumerator = new MapEnumerator(items);
            enumerator.moveNext();
            assert.isDefined(enumerator.getCurrent());
            enumerator.reset();
            assert.isUndefined(enumerator.getCurrent());
        });

        it('should start enumeration from beginning', () => {
            const enumerator = new MapEnumerator(items);

            enumerator.moveNext();
            assert.strictEqual(enumerator.getCurrent(), values[0]);

            enumerator.reset();
            enumerator.moveNext();
            assert.strictEqual(enumerator.getCurrent(), values[0]);
        });
    });
});
