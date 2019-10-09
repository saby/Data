import {assert} from 'chai';
import AbstractAdapter from 'Types/_entity/adapter/Abstract';

class TestAdapter extends AbstractAdapter {
    constructor() {
        super();
    }
}

describe('Types/_entity/adapter/Abstract', () => {
    let adapter: TestAdapter;

    beforeEach(() => {
        adapter = new TestAdapter();
    });

    afterEach(() => {
        adapter = undefined;
    });

    describe('.getProperty()', () => {
        it('should return property value by path', () => {
            assert.strictEqual(adapter.getProperty({foo: {bar: 'baz'}}, 'foo.bar'), 'baz');
        });
    });

    describe('.setProperty()', () => {
        it('should set property value by path', () => {
            const data = {foo: {bar: 'baz'}};
            adapter.setProperty(data, 'foo.bar', 'new');
            assert.strictEqual(data.foo.bar, 'new');
        });
    });
});
