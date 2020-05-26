import {assert} from 'chai';
import PrimaryKey from 'Types/_entity/applied/PrimaryKey';

describe('Types/_entity/applied/PrimaryKey', () => {
    describe('.valueOf()', () => {
        it('should return original value', () => {
            const value = 123;
            const pk = new PrimaryKey(value);
            assert.strictEqual(pk.valueOf(), value);
            assert.strictEqual((pk as unknown as number) + 0, value);
        });
    });

    describe('.toJSON()', () => {
        it('should return original value', () => {
            const value = 123;
            const pk = new PrimaryKey(value);
            assert.strictEqual(pk.toJSON(), value);
            assert.strictEqual(JSON.stringify(pk), String(value));
        });
    });
});
