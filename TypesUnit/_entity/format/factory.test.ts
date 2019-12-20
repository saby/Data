import {assert} from 'chai';
import formatsFactory from 'Types/_collection/format/factory';
import Format from 'Types/_collection/format/Format';

describe('Types/_entity/format/factory', () => {
    it('should throw an error if not simple array passed', () => {
        assert.throws(() => {
            formatsFactory(undefined);
        });
        assert.throws(() => {
            formatsFactory(null);
        });
        assert.throws(() => {
            formatsFactory(false as any);
        });
        assert.throws(() => {
            formatsFactory(true as any);
        });
        assert.throws(() => {
            formatsFactory(0 as any);
        });
        assert.throws(() => {
            formatsFactory(1 as any);
        });
        assert.throws(() => {
            formatsFactory('' as any);
        });
        assert.throws(() => {
            formatsFactory({} as any);
        });
    });

    it('should return an empty formats list', () => {
        const format = formatsFactory([]);
        assert.instanceOf(format, Format);
        assert.strictEqual(format.getCount(), 0);
    });

    it('should return formats list', () => {
        const declaration = [{
            name: 'f1',
            type: 'boolean'
        }, {
            name: 'f2',
            type: 'integer'
        }, {
            name: 'f3',
            type: 'real'
        }, {
            name: 'f4',
            type: 'string'
        }];
        const format = formatsFactory(declaration);

        assert.strictEqual(format.getCount(), 4);
        for (let i = 0; i < format.getCount(); i++) {
            assert.strictEqual(format.at(i).getName(), declaration[i].name);
        }
    });
});
